Code chỉ có giá trị khi build được một cách lặp lại và được chứng minh là đúng bằng test. Build tool quyết định dependency nào vào sản phẩm, phiên bản Java nào được dùng, và pipeline CI chạy những bước gì; test tự động quyết định team có dám refactor và release thường xuyên hay không. Với Dev Lead, đây là nền móng của chất lượng team; với SA, đây là điều kiện để kiến trúc tiến hoá được mà không vỡ. Bài này đi qua Maven, Gradle (Kotlin DSL), JUnit 5, Mockito, JaCoCo và quy trình TDD.

## Mục tiêu bài học

- Giải thích vòng đời build của Maven và đọc/viết được `pom.xml` có BOM, scope, plugin.
- Viết build Gradle bằng Kotlin DSL cho project nhiều module.
- Viết unit test với JUnit 5, dùng `@Nested` và `@ParameterizedTest`.
- Mock dependency với Mockito và đo, đặt ngưỡng coverage bằng JaCoCo.
- Áp dụng chu trình TDD Red–Green–Refactor cho một tính năng nhỏ.

## Maven: vòng đời build và pom.xml

### Ba lifecycle và các phase

Maven dựa trên quy ước (convention over configuration): source ở `src/main/java`, test ở `src/test/java`, output ở `target/`. Maven có ba lifecycle có sẵn:

- **clean**: xoá thư mục `target/`.
- **default**: build chính, gồm các phase theo thứ tự (rút gọn): `validate` → `compile` → `test-compile` → `test` → `package` → `integration-test` → `verify` → `install` → `deploy`.
- **site**: sinh tài liệu dự án.

Chạy một phase sẽ chạy **mọi phase trước nó** trong cùng lifecycle: `mvn verify` sẽ compile, test, đóng gói rồi verify. `install` copy artifact vào kho local `~/.m2/repository`, còn `deploy` đẩy lên kho chung (Nexus, Artifactory…). Bản thân phase không làm gì; công việc do **plugin goal** gắn vào phase thực hiện (ví dụ `maven-compiler-plugin:compile` gắn vào `compile`, `maven-surefire-plugin:test` gắn vào `test`).

### Cấu trúc pom.xml

```xml
<project xmlns="http://maven.apache.org/POM/4.0.0">
  <modelVersion>4.0.0</modelVersion>
  <groupId>com.example</groupId>
  <artifactId>library-cli</artifactId>
  <version>1.0.0-SNAPSHOT</version>

  <properties>
    <maven.compiler.release>21</maven.compiler.release>
    <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
  </properties>

  <dependencyManagement>                 <!-- chỉ quản lý phiên bản, chưa thêm dependency -->
    <dependencies>
      <dependency>
        <groupId>org.junit</groupId>
        <artifactId>junit-bom</artifactId>
        <version>5.11.4</version>
        <type>pom</type>
        <scope>import</scope>            <!-- import BOM: đồng bộ phiên bản các module JUnit -->
      </dependency>
    </dependencies>
  </dependencyManagement>

  <dependencies>
    <dependency>
      <groupId>org.junit.jupiter</groupId>
      <artifactId>junit-jupiter</artifactId>   <!-- không cần version, lấy từ BOM -->
      <scope>test</scope>
    </dependency>
    <dependency>
      <groupId>org.mockito</groupId>
      <artifactId>mockito-junit-jupiter</artifactId>
      <version>5.14.2</version>
      <scope>test</scope>
    </dependency>
  </dependencies>
</project>
```

Các phiên bản trong ví dụ chỉ để minh hoạ; hãy kiểm tra bản mới nhất khi dùng. Nếu dự án là Spring Boot, parent `spring-boot-starter-parent` hoặc BOM `spring-boot-dependencies` đã quản lý phiên bản JUnit, Mockito, AssertJ cho bạn.

**Dependency scope** quyết định dependency có mặt ở classpath nào:

| Scope | Compile | Test | Runtime / đóng gói | Ví dụ |
|---|---|---|---|---|
| `compile` (mặc định) | Có | Có | Có | Thư viện nghiệp vụ |
| `provided` | Có | Có | Không (môi trường cung cấp) | Servlet API khi deploy lên app server |
| `runtime` | Không | Có | Có | JDBC driver |
| `test` | Không | Có | Không | JUnit, Mockito |
| `import` | Chỉ dùng trong `dependencyManagement` với `type=pom` để nhập BOM | | | `junit-bom` |

Khi hai dependency kéo theo hai phiên bản khác nhau của cùng một thư viện (transitive dependency), Maven chọn bản **gần nhất** trong cây dependency ("nearest wins"), không phải bản mới nhất. Dùng `mvn dependency:tree` để xem, và khai báo phiên bản trong `dependencyManagement` để kiểm soát.

### Plugin JaCoCo và lệnh thường dùng

```xml
<build>
  <plugins>
    <plugin>
      <groupId>org.jacoco</groupId>
      <artifactId>jacoco-maven-plugin</artifactId>
      <version>0.8.12</version>
      <executions>
        <execution>
          <goals><goal>prepare-agent</goal></goals>   <!-- gắn agent đo coverage trước khi chạy test -->
        </execution>
        <execution>
          <id>report</id>
          <phase>verify</phase>
          <goals><goal>report</goal></goals>          <!-- sinh báo cáo HTML/XML ở target/site/jacoco -->
        </execution>
        <execution>
          <id>check</id>
          <phase>verify</phase>
          <goals><goal>check</goal></goals>           <!-- build thất bại nếu dưới ngưỡng -->
          <configuration>
            <rules>
              <rule>
                <element>BUNDLE</element>
                <limits>
                  <limit>
                    <counter>LINE</counter>
                    <value>COVEREDRATIO</value>
                    <minimum>0.80</minimum>
                  </limit>
                </limits>
              </rule>
            </rules>
          </configuration>
        </execution>
      </executions>
    </plugin>
  </plugins>
</build>
```

```bash
./mvnw clean verify                          # build đầy đủ, chạy test và kiểm tra coverage
./mvnw test -Dtest=LoanServiceTest           # chỉ chạy một test class
./mvnw dependency:tree -Dincludes=org.slf4j  # truy vết ai kéo thư viện slf4j vào
./mvnw -pl app -am package                   # project nhiều module: build module app và các module nó phụ thuộc
```

Dùng **Maven Wrapper** (`mvnw`) để mọi người và CI dùng cùng một phiên bản Maven. Unit test chạy bởi Surefire ở phase `test`; integration test (đặt tên `*IT`) thường chạy bởi plugin Failsafe ở phase `integration-test`/`verify`.

## Gradle với Kotlin DSL và multi-module

Gradle mô hình hoá build thành **đồ thị task** (task graph), hỗ trợ build tăng dần (incremental build) và build cache, nên thường nhanh hơn với dự án lớn. **Kotlin DSL** (`*.gradle.kts`) được khuyến nghị thay Groovy DSL vì có kiểm tra kiểu và gợi ý code trong IDE. Một project nhiều module điển hình:

```text
library/
├── settings.gradle.kts          // khai báo các module
├── gradle/libs.versions.toml    // version catalog: quản lý phiên bản tập trung
├── domain/build.gradle.kts      // logic nghiệp vụ, không phụ thuộc framework
└── app/build.gradle.kts         // CLI, phụ thuộc domain
```

```text
// settings.gradle.kts
rootProject.name = "library"
include("domain", "app")

// gradle/libs.versions.toml
[versions]
junit = "5.11.4"
mockito = "5.14.2"

[libraries]
junit-bom = { module = "org.junit:junit-bom", version.ref = "junit" }
mockito-junit = { module = "org.mockito:mockito-junit-jupiter", version.ref = "mockito" }
```

```text
// domain/build.gradle.kts
plugins {
    `java-library`
    jacoco
}

java {
    toolchain { languageVersion.set(JavaLanguageVersion.of(21)) }   // Gradle tự tìm/tải JDK 21
}

repositories { mavenCentral() }

dependencies {
    testImplementation(platform(libs.junit.bom))
    testImplementation("org.junit.jupiter:junit-jupiter")
    testRuntimeOnly("org.junit.platform:junit-platform-launcher")
    testImplementation(libs.mockito.junit)
}

tasks.test {
    useJUnitPlatform()
    finalizedBy(tasks.jacocoTestReport)
}

tasks.jacocoTestReport {
    dependsOn(tasks.test)
    reports { xml.required.set(true) }
}

// app/build.gradle.kts
plugins { application }
repositories { mavenCentral() }
dependencies { implementation(project(":domain")) }
application { mainClass.set("com.example.library.App") }
```

Các cấu hình dependency quan trọng: `implementation` (dùng nội bộ, không lộ ra cho module phụ thuộc mình), `api` (từ plugin `java-library`, lộ ra cho consumer, chỉ dùng khi kiểu của thư viện xuất hiện trong API công khai), `compileOnly`, `runtimeOnly`, `testImplementation`. Ưu tiên `implementation` để giảm việc biên dịch lại dây chuyền.

Khi nhiều module lặp lại cùng cấu hình (toolchain, repositories, test), hãy gom vào **convention plugin** trong `buildSrc` hoặc một included build, ví dụ `buildSrc/src/main/kotlin/java-conventions.gradle.kts`, rồi mỗi module chỉ cần `plugins { id("java-conventions") }`. Lệnh thường dùng: `./gradlew build`, `./gradlew :domain:test`, `./gradlew dependencies --configuration runtimeClasspath`.

| | Maven | Gradle |
|---|---|---|
| Mô hình | Lifecycle cố định, XML khai báo | Đồ thị task, script có thể lập trình |
| Ưu điểm | Đơn giản, đồng nhất, dễ đọc | Nhanh (incremental, cache), linh hoạt |
| Rủi ro | Dài dòng, khó tuỳ biến logic | Script phức tạp khó bảo trì nếu thiếu kỷ luật |

## Unit test với JUnit 5

JUnit 5 gồm JUnit Platform (nền tảng chạy test), **Jupiter** (API viết test: `org.junit.jupiter.api.*`) và Vintage (chạy test JUnit 4 cũ). Ví dụ dưới kiểm thử tính phí trả sách trễ: 5.000 đồng mỗi ngày, tối đa 100.000 đồng.

```java
import org.junit.jupiter.api.*;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;
import java.time.LocalDate;
import static org.junit.jupiter.api.Assertions.*;

@DisplayName("LateFeeCalculator")
class LateFeeCalculatorTest {

    private final LateFeeCalculator calculator = new LateFeeCalculator();
    private final LocalDate due = LocalDate.of(2025, 3, 1);

    @Nested
    @DisplayName("Khi trả đúng hạn hoặc sớm")
    class OnTime {
        @Test
        void returnsZeroOnDueDate() {
            assertEquals(0, calculator.fee(due, due));
        }

        @Test
        void returnsZeroWhenReturnedEarly() {
            assertEquals(0, calculator.fee(due, due.minusDays(3)));
        }
    }

    @Nested
    @DisplayName("Khi trả trễ")
    class Late {
        @ParameterizedTest(name = "trễ {0} ngày thì phí {1} đồng")
        @CsvSource({"1, 5000", "3, 15000", "20, 100000", "45, 100000"})
        void chargesPerDayWithCap(int daysLate, long expectedFee) {
            assertEquals(expectedFee, calculator.fee(due, due.plusDays(daysLate)));
        }
    }
}
```

- `@Nested` nhóm các test theo ngữ cảnh, làm báo cáo đọc như đặc tả. Class nested phải là inner class (không `static`).
- `@ParameterizedTest` chạy một test với nhiều bộ dữ liệu: `@ValueSource`, `@CsvSource`, `@MethodSource`, `@EnumSource`, `@NullAndEmptySource`. Cần module `junit-jupiter-params`, đã có trong artifact tổng hợp `junit-jupiter`.
- Các assertion hữu ích khác: `assertThrows`, `assertAll` (gom nhiều kiểm tra, báo mọi lỗi một lần), `assertTimeout`. Nhiều team dùng thêm AssertJ cho assertion dễ đọc.
- Đặt tên test theo hành vi (`chargesPerDayWithCap`) và theo cấu trúc **Arrange–Act–Assert** (chuẩn bị, thực hiện, kiểm tra).

## Mockito và JaCoCo

### Mock dependency với Mockito

Unit test nên kiểm thử một đơn vị độc lập với DB, mạng, thời gian thực. **Mock** là object giả do Mockito tạo, cho phép định nghĩa hành vi trả về (stub) và kiểm tra tương tác (verify).

```java
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.mockito.junit.jupiter.MockitoExtension;
import java.util.Optional;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class LoanServiceTest {

    @Mock BookRepository books;
    @Mock NotificationSender notifier;
    @InjectMocks LoanService loanService;          // tạo LoanService và tiêm hai mock qua constructor

    @Test
    void borrowAvailableBook_marksBorrowed_andNotifies() {
        var book = new Book("978-0134685991", "Effective Java", true);
        when(books.findByIsbn("978-0134685991")).thenReturn(Optional.of(book));

        loanService.borrow("978-0134685991", "member-42");

        ArgumentCaptor<Book> saved = ArgumentCaptor.forClass(Book.class);
        verify(books).save(saved.capture());
        assertFalse(saved.getValue().available());
        verify(notifier).send(eq("member-42"), contains("Effective Java"));
    }

    @Test
    void borrowUnknownBook_throws_andDoesNotNotify() {
        when(books.findByIsbn(anyString())).thenReturn(Optional.empty());

        assertThrows(BookNotFoundException.class, () -> loanService.borrow("x", "member-42"));
        verifyNoInteractions(notifier);
    }
}
```

Lưu ý khi dùng Mockito:

- Khi đã dùng argument matcher (`eq`, `any`…) cho một tham số thì **mọi** tham số của lời gọi đó phải là matcher.
- `MockitoExtension` mặc định dùng **strict stubs**: stub không được dùng tới sẽ làm test thất bại (`UnnecessaryStubbingException`), giúp test gọn gàng.
- Từ Mockito 5, mock maker mặc định là "inline", mock được cả class `final`. Trên JDK 21+, JVM cảnh báo khi agent được nạp động lúc chạy; tài liệu Mockito khuyên cấu hình Mockito như một `-javaagent` trong build để tránh cảnh báo này.
- **Không mock thứ bạn không sở hữu** một cách tràn lan (ví dụ mock từng method của `HttpClient` hay `EntityManager`); hãy bọc chúng sau interface của bạn, hoặc dùng integration test (Testcontainers, WireMock) cho tầng đó.
- Không mock value object hay record; tạo object thật.

### Đo coverage bằng JaCoCo

JaCoCo gắn một Java agent vào JVM chạy test để ghi lại dòng và nhánh nào đã được thực thi. Báo cáo HTML nằm ở `target/site/jacoco/index.html` (Maven) hoặc `build/reports/jacoco/test/html` (Gradle). Hai counter quan trọng: **LINE** (tỷ lệ dòng được chạy) và **BRANCH** (tỷ lệ nhánh `if`/`switch` được đi qua). Branch coverage phản ánh chất lượng test tốt hơn line coverage.

Coverage cho biết code nào **chưa** được test, nhưng coverage cao không chứng minh test tốt: một test gọi method mà không assert gì vẫn tăng coverage. Đặt ngưỡng (ví dụ 80% như milestone của giai đoạn này) để chặn tụt chất lượng, loại trừ code sinh tự động, và kết hợp code review để xem test có kiểm tra hành vi thật không.

## TDD: Red – Green – Refactor

**TDD** (Test-Driven Development) là viết test **trước** code, theo vòng lặp ngắn:

```text
   +-------+      viết test nhỏ thất bại       +-------+
   |  RED  | --------------------------------> | GREEN | viết code tối thiểu để pass
   +-------+                                   +-------+
       ^                                           |
       |            +-----------+                  |
       +----------- | REFACTOR  | <----------------+
     test tiếp theo +-----------+  dọn code, test vẫn xanh
```

Áp dụng cho `LateFeeCalculator`:

1. **Red**: viết `returnsZeroOnDueDate`. Class chưa tồn tại nên không biên dịch được, coi như đỏ.
2. **Green**: tạo class, `fee()` trả về `0`. Đơn giản tới mức "ngây ngô" là cố ý.
3. **Red**: thêm test trễ 1 ngày phí 5.000. Test đỏ.
4. **Green**: tính số ngày trễ bằng `ChronoUnit.DAYS.between` nhân 5.000.
5. **Red**: thêm test trễ 45 ngày phí tối đa 100.000. Đỏ.
6. **Green và Refactor**: thêm `Math.min`, tách hằng số, chuyển sang `@ParameterizedTest`.

```java
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;

public final class LateFeeCalculator {
    private static final long FEE_PER_DAY = 5_000;
    private static final long MAX_FEE = 100_000;

    public long fee(LocalDate dueDate, LocalDate returnDate) {
        long daysLate = ChronoUnit.DAYS.between(dueDate, returnDate);
        if (daysLate <= 0) return 0;
        return Math.min(daysLate * FEE_PER_DAY, MAX_FEE);
    }
}
```

Lợi ích của TDD: thiết kế API từ góc nhìn người dùng, mỗi dòng code đều có lý do tồn tại, và luôn có lưới an toàn khi refactor. Nó phát huy tốt nhất với logic nghiệp vụ có quy tắc rõ ràng; với code khám phá (spike) hoặc UI, team thường viết test sau khi thiết kế đã ổn định.

## Lỗi thường gặp

- **Hard-code phiên bản rải rác ở nhiều module**: phiên bản lệch nhau, khó nâng cấp. Cách sửa: BOM + `dependencyManagement` (Maven) hoặc version catalog (Gradle).
- **Tự cấu hình `argLine` của Surefire làm JaCoCo báo 0%**: `prepare-agent` truyền agent qua property `argLine`, ghi đè nó là mất agent. Cách sửa: nối thêm bằng `@{argLine} -Xmx1g ...`.
- **Quên `useJUnitPlatform()` trong Gradle**: build xanh nhưng không test nào chạy. Cách sửa: luôn kiểm tra báo cáo test có đúng số lượng.
- **Test phụ thuộc thứ tự hoặc thời gian thực**: test lúc pass lúc fail (flaky). Cách sửa: mỗi test tự chuẩn bị dữ liệu, truyền `Clock` thay vì gọi `LocalDate.now()` trực tiếp.
- **Mock quá nhiều, verify mọi lời gọi**: test gắn chặt với cài đặt, refactor nhỏ cũng vỡ. Cách sửa: kiểm tra kết quả và hành vi quan trọng, chỉ verify các tương tác có ý nghĩa nghiệp vụ.
- **Chạy theo con số coverage**: viết test không assert để đạt ngưỡng. Cách sửa: review chất lượng test, bổ sung branch coverage hoặc mutation testing.

## Bài tập thực hành

1. **Khởi tạo build cho CLI thư viện**: tạo project Maven với Java 21, JUnit 5 qua BOM, Mockito, JaCoCo với ngưỡng 80% line coverage. Chạy `./mvnw verify`, cố ý xoá bớt test để thấy build thất bại vì coverage.
2. **Chuyển sang Gradle multi-module**: tách project thành `domain` và `app` bằng Gradle Kotlin DSL, dùng version catalog và một convention plugin trong `buildSrc` cho cấu hình chung. Đảm bảo `./gradlew build` chạy test và sinh báo cáo JaCoCo cho `domain`.
3. **TDD tính năng đặt trước sách**: theo đúng Red–Green–Refactor, xây `ReservationService` với quy tắc: mỗi thành viên giữ tối đa 3 đặt trước, sách đang có sẵn thì không cho đặt trước, hàng đợi đặt trước theo thứ tự thời gian. Dùng `@Nested` cho từng quy tắc, `@ParameterizedTest` cho giới hạn số lượng, Mockito cho repository và `Clock`.

## Tóm tắt

- Maven có ba lifecycle; chạy một phase sẽ chạy mọi phase trước nó; công việc thực tế do plugin goal gắn vào phase.
- Quản lý phiên bản tập trung bằng BOM/`dependencyManagement` hoặc version catalog; hiểu scope và cơ chế "nearest wins".
- Gradle Kotlin DSL mô hình hoá build thành đồ thị task; ưu tiên `implementation`, gom cấu hình chung vào convention plugin.
- JUnit 5: `@Nested` để tổ chức theo ngữ cảnh, `@ParameterizedTest` cho nhiều bộ dữ liệu, tên test mô tả hành vi.
- Mockito để cô lập dependency, không lạm dụng verify; JaCoCo đo line/branch coverage và có thể chặn build dưới ngưỡng.
- TDD là vòng lặp ngắn Red–Green–Refactor, mạnh nhất với logic nghiệp vụ có quy tắc rõ ràng.
