Khi team có năm, bảy service, mỗi service do một người khởi tạo theo một kiểu, việc chuyển người giữa các service, review code và vận hành trở nên tốn kém. Khi team phải phối hợp với ba, bốn team khác, mỗi thay đổi API không báo trước có thể làm vỡ hệ thống của người khác. Tech Lead chịu trách nhiệm giữ cho kiến trúc của team nhất quán, có hướng đi rõ ràng và phối hợp trơn tru với bên ngoài. Bài này đi qua technical vision, tiêu chuẩn và template dự án, API contract, cùng hai khái niệm tổ chức quan trọng: Conway's Law và Team Topologies.

## Mục tiêu bài học

- Viết technical vision và roadmap kỹ thuật cho team, gắn với mục tiêu sản phẩm.
- Thiết lập coding standards, kiến trúc tham chiếu và project template, tự động hoá việc tuân thủ bằng công cụ như ArchUnit.
- Định nghĩa API contract, quản lý tương thích ngược và phối hợp thay đổi với các team khác.
- Hiểu Conway's Law và Team Topologies để thiết kế ranh giới sở hữu và cách tương tác giữa các team.

## Technical vision và roadmap kỹ thuật

### Vision, strategy, roadmap

- **Technical vision**: team muốn hệ thống của mình ở đâu sau 6–12 tháng, và vì sao. Nó trả lời "đích đến".
- **Strategy**: các nguyên tắc và lựa chọn lớn để đi đến đích.
- **Roadmap**: các bước cụ thể theo thời gian.

Vision không phải danh sách công nghệ muốn thử. Một vision tốt xuất phát từ mục tiêu sản phẩm và các vấn đề thật của team: tính năng ra chậm, sự cố lặp lại, chi phí cao, khó tuyển người.

### Template technical vision

```text
TECHNICAL VISION – Team Order – 6 tháng tới

1. Hiện trạng (có số liệu)
   - 6 service Spring Boot, 3 phiên bản Spring Boot khác nhau, 2 cách xử lý lỗi
   - Lead time trung bình 9 ngày; 40% sự cố quý trước liên quan đến timeout khi
     gọi Payment
   - Người mới cần khoảng 3 tuần để deploy được thay đổi đầu tiên

2. Tầm nhìn (1–2 câu)
   "Mọi service của team dựng từ một golden path chung, quan sát được đầy đủ,
    và một người mới có thể đưa thay đổi lên production trong tuần đầu tiên."

3. Nguyên tắc
   - Mặc định dùng template chuẩn; khác chuẩn phải có ADR
   - Mọi lời gọi ra ngoài có timeout, retry có giới hạn và circuit breaker
   - API thay đổi theo hướng tương thích ngược; breaking change cần lộ trình

4. Mục tiêu đo được
   - 100% service dùng Spring Boot 3.x và Java 21
   - Lead time dưới 5 ngày
   - Người mới deploy thay đổi đầu tiên trong 5 ngày làm việc

5. Không làm trong giai đoạn này (non-goals)
   - Không tách thêm service mới
   - Không đổi message broker

6. Roadmap (Now / Next / Later)
7. Rủi ro và phụ thuộc (team Platform, lịch nâng cấp Payment...)
```

### Roadmap Now / Next / Later

| Now (tháng 1–2) | Next (tháng 3–4) | Later (tháng 5–6) |
|---|---|---|
| Project template v1, chuẩn xử lý lỗi | Chuyển 3 service cũ sang template | Contract test với team Payment, Inventory |
| Thêm timeout, circuit breaker cho mọi client gọi Payment | Nâng cấp 2 service còn lại lên Spring Boot 3 | Dashboard SLO cho luồng đặt hàng |
| Onboarding guide | Rule ArchUnit trong mọi pipeline | Đánh giá lại kiến trúc module khuyến mãi |

Now/Next/Later tránh cam kết ngày cụ thể cho việc còn xa, nhưng vẫn cho PO và các team khác thấy thứ tự ưu tiên. Xem lại vision và roadmap theo quý, đặt cạnh roadmap sản phẩm để thương lượng capacity.

## Coding standards, kiến trúc tham chiếu và project template

### Tự động hoá những gì có thể

Nguyên tắc vàng: **cái gì công cụ kiểm tra được thì để công cụ kiểm tra**. Tranh luận về dấu ngoặc hay thứ tự import trong code review là lãng phí. Formatter (như Spotless với google-java-format hoặc palantir-java-format), Checkstyle, Error Prone và quality gate của SonarQube nên chạy trong build. Tài liệu coding standards chỉ cần ghi những gì công cụ không kiểm tra được:

```text
CODING STANDARDS – Team Order (trích)

Xử lý lỗi
- Exception nghiệp vụ kế thừa BusinessException, map sang HTTP trong một
  @RestControllerAdvice chung; body lỗi theo chuẩn Problem Details (lớp ProblemDetail
  của Spring; RFC 9457, thay thế RFC 7807).
- Không catch Exception rồi bỏ qua; nếu cần nuốt lỗi, phải log và comment lý do.

Transaction
- @Transactional đặt ở tầng service, không đặt ở controller hay repository.
- Không gọi HTTP hay gửi message ra ngoài bên trong transaction DB; dùng outbox.

Logging
- Log dạng JSON, có traceId; không log dữ liệu cá nhân, token, mật khẩu.

Lời gọi ra ngoài
- Mọi client có timeout kết nối và timeout đọc; retry tối đa 3 lần với backoff,
  chỉ cho thao tác idempotent.
```

### Thực thi kiến trúc bằng ArchUnit

ArchUnit là thư viện Java cho phép viết quy tắc kiến trúc dưới dạng unit test. Quy tắc bị vi phạm thì build đỏ, không cần ai nhắc trong review.

```java
import static com.tngtech.archunit.lang.syntax.ArchRuleDefinition.noClasses;
import static com.tngtech.archunit.lang.syntax.ArchRuleDefinition.noFields;
import static com.tngtech.archunit.library.Architectures.layeredArchitecture;
import static com.tngtech.archunit.library.dependencies.SlicesRuleDefinition.slices;

import com.tngtech.archunit.core.importer.ImportOption;
import com.tngtech.archunit.junit.AnalyzeClasses;
import com.tngtech.archunit.junit.ArchTest;
import com.tngtech.archunit.lang.ArchRule;
import org.springframework.beans.factory.annotation.Autowired;

@AnalyzeClasses(packages = "com.acme.order", importOptions = ImportOption.DoNotIncludeTests.class)
class ArchitectureRulesTest {

    @ArchTest
    static final ArchRule layers = layeredArchitecture()
            .consideringAllDependencies()
            .layer("Web").definedBy("..web..")
            .layer("Application").definedBy("..application..")
            .layer("Domain").definedBy("..domain..")
            .layer("Infrastructure").definedBy("..infrastructure..")
            .whereLayer("Web").mayNotBeAccessedByAnyLayer()
            .whereLayer("Application").mayOnlyBeAccessedByLayers("Web", "Infrastructure")
            .whereLayer("Infrastructure").mayNotBeAccessedByAnyLayer();

    @ArchTest
    static final ArchRule domainIsFrameworkFree = noClasses()
            .that().resideInAPackage("..domain..")
            .should().dependOnClassesThat()
            .resideInAnyPackage("org.springframework..", "jakarta.persistence..")
            .because("domain phải độc lập với framework để dễ test và dễ thay đổi");

    @ArchTest
    static final ArchRule noFieldInjection = noFields()
            .should().beAnnotatedWith(Autowired.class)
            .because("team dùng constructor injection");

    @ArchTest
    static final ArchRule noCycles = slices()
            .matching("com.acme.order.(*)..")
            .should().beFreeOfCycles();
}
```

Lưu ý quy tắc `layers`: tầng Infrastructure (repository, client gọi ra ngoài) hiện thực các interface (port) do Application định nghĩa, nên nó được phép phụ thuộc vào Application, còn không tầng nào được phụ thuộc trực tiếp vào Infrastructure; Spring sẽ inject implementation lúc chạy. Với codebase cũ có nhiều vi phạm sẵn, dùng `FreezingArchRule.freeze(rule)` để ghi nhận các vi phạm hiện có và chỉ chặn vi phạm mới, rồi giảm dần.

### Kiến trúc tham chiếu

Kiến trúc tham chiếu (reference architecture) mô tả "một service chuẩn của team trông như thế nào": cấu trúc package, thư viện được chọn cho từng mối quan tâm, và các quy ước xuyên suốt.

```text
order-service/
  src/main/java/com/acme/order/
    web/              <- @RestController, DTO request/response, mapping
    application/      <- use case, @Transactional, port (interface) ra ngoài
    domain/           <- entity, value object, quy tắc nghiệp vụ, không phụ thuộc Spring
    infrastructure/   <- JPA repository, client HTTP, Kafka producer/consumer
  src/main/resources/
    application.yml
    db/migration/     <- script Flyway
  src/test/java/...   <- unit test, test tích hợp với Testcontainers, ArchitectureRulesTest
```

| Mối quan tâm | Lựa chọn chuẩn của team (ví dụ) |
|---|---|
| Migration database | Flyway |
| Resilience khi gọi ra ngoài | Resilience4j (timeout, retry, circuit breaker) |
| Metric, tracing | Micrometer, OpenTelemetry |
| Test tích hợp | Testcontainers với PostgreSQL và Kafka thật |
| API | OpenAPI viết trước, sinh interface |

### Project template và golden path

Golden path là con đường được team hỗ trợ đầy đủ để tạo và vận hành một service: đi theo nó thì mọi thứ "tự có". Hiện thực thường là một template repository hoặc Maven archetype, kèm:

- Cấu trúc package như trên, parent POM dùng chung (phiên bản dependency, plugin, Enforcer).
- Cấu hình formatter, Checkstyle, ArchUnit test, quality gate.
- Pipeline CI/CD mẫu, Dockerfile, cấu hình health check và metric của Actuator.
- Xử lý lỗi chuẩn, logging JSON, cấu hình tracing.
- README và runbook mẫu.

Template phải được **duy trì** như một sản phẩm: có người sở hữu, có changelog, và khi template cải tiến thì có hướng dẫn cập nhật cho các service đã tạo từ bản cũ. Parent POM dùng chung giúp nhiều thay đổi (phiên bản thư viện, plugin) lan toả chỉ bằng việc nâng version parent.

## API contract và phối hợp với các team khác

### API-first với OpenAPI

API-first nghĩa là viết và review đặc tả API (OpenAPI cho REST, AsyncAPI cho sự kiện) **trước** khi code. Team gọi API có thể bắt đầu làm việc song song dựa trên đặc tả, và tranh luận về thiết kế diễn ra khi thay đổi còn rẻ.

```yaml
openapi: 3.0.3
info:
  title: Order API
  version: 1.4.0
paths:
  /orders/{orderId}:
    get:
      operationId: getOrder
      parameters:
        - name: orderId
          in: path
          required: true
          schema:
            type: string
      responses:
        '200':
          description: Thông tin đơn hàng
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Order'
        '404':
          description: Không tìm thấy đơn hàng
components:
  schemas:
    Order:
      type: object
      required: [id, status, totalAmount]
      properties:
        id:
          type: string
        status:
          type: string
          enum: [PENDING, PAID, SHIPPED, CANCELLED]
        totalAmount:
          type: number
```

Sinh interface Spring từ đặc tả để code luôn khớp contract:

```xml
<plugin>
  <groupId>org.openapitools</groupId>
  <artifactId>openapi-generator-maven-plugin</artifactId>
  <version><!-- dùng phiên bản mới nhất --></version>
  <executions>
    <execution>
      <goals>
        <goal>generate</goal>
      </goals>
      <configuration>
        <inputSpec>${project.basedir}/src/main/resources/api/order-api.yaml</inputSpec>
        <generatorName>spring</generatorName>
        <apiPackage>com.acme.order.web.api</apiPackage>
        <modelPackage>com.acme.order.web.model</modelPackage>
        <configOptions>
          <interfaceOnly>true</interfaceOnly>
          <useSpringBoot3>true</useSpringBoot3>
        </configOptions>
      </configuration>
    </execution>
  </executions>
</plugin>
```

### Quy tắc tương thích

| Thay đổi | Mức độ | Ghi chú |
|---|---|---|
| Thêm endpoint mới | An toàn | |
| Thêm field tuỳ chọn vào response | Thường an toàn | Client cần là "tolerant reader", bỏ qua field lạ; ObjectMapper do Spring Boot cấu hình mặc định đã tắt FAIL_ON_UNKNOWN_PROPERTIES |
| Thêm field bắt buộc vào request | Breaking | Client cũ không gửi field đó |
| Xoá hoặc đổi tên field, đổi kiểu dữ liệu | Breaking | |
| Thêm giá trị enum mới trong response | Có thể breaking | Jackson mặc định ném lỗi khi gặp giá trị enum không biết; cần báo trước và xác nhận client xử lý được |
| Thắt chặt validation | Breaking | Request trước đây hợp lệ giờ bị từ chối |
| Đổi HTTP status hoặc mã lỗi | Breaking | Client có thể dựa vào status để xử lý |

Với breaking change không tránh được: tạo phiên bản mới (ví dụ `/v2/orders`), chạy song song hai phiên bản, công bố lịch ngừng phiên bản cũ (có thể dùng header `Sunset` theo RFC 8594), theo dõi ai còn gọi phiên bản cũ trước khi tắt.

### Kiểm chứng contract

- **Consumer-driven contract testing** với Spring Cloud Contract hoặc Pact: team gọi API mô tả kỳ vọng của mình thành contract; pipeline của team cung cấp API chạy các contract đó, nên breaking change bị phát hiện trước khi deploy.
- **Sự kiện**: mô tả bằng AsyncAPI hoặc schema Avro/Protobuf trong schema registry; đặt chế độ tương thích (ví dụ BACKWARD trong Confluent Schema Registry) để registry từ chối schema mới phá vỡ consumer.

### Nhịp phối hợp

- Buổi review API định kỳ, có đại diện các team gọi API.
- Kênh thông báo thay đổi, quy định thời gian báo trước tối thiểu cho thay đổi ảnh hưởng người khác.
- Changelog cho mỗi API, ghi rõ thay đổi nào là breaking.

## Conway's Law và Team Topologies

### Conway's Law

Melvin Conway nhận xét từ cuối thập niên 1960: tổ chức thiết kế hệ thống sẽ tạo ra những thiết kế phản chiếu cấu trúc giao tiếp của chính tổ chức đó. Ví dụ: ba team cùng sửa một service lớn thường tạo ra một service có ba "vùng" rối vào nhau, hoặc tự nhiên tách thành ba phần theo ranh giới team.

Hệ quả thực tế: muốn có kiến trúc nào, hãy tổ chức team theo hình dạng đó. Đây gọi là **Inverse Conway Maneuver**: thiết kế ranh giới team trước để kiến trúc mong muốn hình thành tự nhiên. Ngược lại, nếu vẽ kiến trúc microservice mà không thay đổi cách tổ chức team, ranh giới service sẽ dần bị phá vỡ.

### Team Topologies

Cuốn *Team Topologies* (Matthew Skelton và Manuel Pais) đề xuất bốn loại team và ba chế độ tương tác, xoay quanh khái niệm **cognitive load**: lượng thông tin một team phải nắm để làm việc hiệu quả có giới hạn, nên ranh giới hệ thống phải vừa sức một team.

| Loại team | Vai trò |
|---|---|
| Stream-aligned | Gắn với một luồng giá trị (sản phẩm, nhóm khách hàng), giao giá trị trực tiếp; đa số team thuộc loại này |
| Platform | Cung cấp dịch vụ nội bộ tự phục vụ để giảm tải cho stream-aligned team |
| Enabling | Chuyên gia giúp các team khác có năng lực mới, rồi rút ra |
| Complicated-subsystem | Sở hữu phần cần chuyên môn sâu (ví dụ engine tính giá, thuật toán) |

| Chế độ tương tác | Mô tả | Khi nào |
|---|---|---|
| Collaboration | Hai team làm việc sát nhau trong thời gian giới hạn | Khám phá, khi ranh giới chưa rõ |
| X-as-a-Service | Một team cung cấp, team kia dùng với ít trao đổi | Khi ranh giới và interface đã ổn định |
| Facilitating | Một team giúp team khác học hoặc gỡ vướng | Enabling team hỗ trợ áp dụng thực hành mới |

Chế độ tương tác nên thay đổi theo thời gian. Ví dụ: team Platform làm collaboration với team Order vài tháng để hiểu nhu cầu CI/CD, sau đó chuyển sang X-as-a-Service khi nền tảng đã ổn định. Collaboration kéo dài vô hạn là dấu hiệu ranh giới chưa được thiết kế đúng.

### Áp dụng ở cấp Tech Lead

- **Một service, một team sở hữu.** Sở hữu chung nghĩa là không ai sở hữu. Nếu nhiều team phải sửa cùng một service thường xuyên, hãy đề xuất tách ranh giới hoặc chuyển quyền sở hữu.
- **Theo dõi cognitive load.** Nếu team phải nắm quá nhiều hệ thống, sự cố và chất lượng sẽ đi xuống; đó là lý lẽ để đề xuất chuyển bớt hoặc dùng nền tảng của team Platform.
- **Công bố "Team API"**: mô tả team sở hữu gì, cung cấp gì, liên hệ thế nào.

```text
TEAM API – Team Order
Sứ mệnh            : Sở hữu luồng đặt hàng từ giỏ hàng đến khi đơn được xác nhận
Sở hữu             : order-service, order-db, topic order-events
Không sở hữu       : thanh toán (team Payment), tồn kho (team Inventory)
API và sự kiện     : Order API v1 (OpenAPI trong repo), OrderPlaced, OrderCancelled
Liên hệ            : kênh chat của team; sự cố production theo lịch on-call
Tiếp nhận yêu cầu  : tạo ticket theo template, phản hồi trong 2 ngày làm việc
Lịch phối hợp      : demo 2 tuần/lần, review API thứ Năm hằng tuần
Đang tập trung     : project template, nâng cấp Spring Boot 3 (xem technical vision)
```

## Lỗi thường gặp

- **Vision là danh sách công nghệ.** "Năm nay dùng Kotlin, GraphQL, Kubernetes" không giải quyết vấn đề nào của business. Cách sửa: bắt đầu từ hiện trạng có số liệu và mục tiêu sản phẩm.
- **Standards chỉ nằm trên wiki.** Không ai đọc, review vẫn tranh cãi. Cách sửa: tự động hoá bằng formatter, ArchUnit, quality gate; tài liệu chỉ giữ phần công cụ không kiểm tra được.
- **Template tạo xong rồi bỏ.** Các service lệch dần khỏi chuẩn. Cách sửa: template có người sở hữu, changelog, parent POM dùng chung để cập nhật lan toả.
- **Đổi API không báo trước.** Thêm field bắt buộc hoặc giá trị enum mới làm vỡ team khác. Cách sửa: quy tắc tương thích, contract test, thông báo và lịch ngừng phiên bản.
- **Bỏ qua Conway's Law.** Vẽ ranh giới service không khớp ranh giới team. Cách sửa: thiết kế ranh giới sở hữu cùng với kiến trúc, mỗi service một team chịu trách nhiệm.
- **Collaboration mãi mãi.** Hai team họp chung hằng ngày suốt nhiều quý. Cách sửa: đặt thời hạn cho collaboration, xác định interface để chuyển sang X-as-a-Service.

## Bài tập thực hành

1. **Technical vision.** Viết technical vision 6 tháng cho team theo template: hiện trạng có ít nhất 3 số liệu, mục tiêu đo được, non-goals và roadmap Now/Next/Later. Trình bày với team và PO, ghi lại các điểm được điều chỉnh.
2. **ArchUnit trong pipeline.** Thêm ArchitectureRulesTest vào một service: quy tắc phân tầng, domain không phụ thuộc framework, không field injection, không vòng phụ thuộc. Nếu codebase cũ có vi phạm, dùng FreezingArchRule và lập kế hoạch giảm dần số vi phạm.
3. **Contract và Team API.** Chọn một API mà team khác đang gọi: viết hoặc cập nhật đặc tả OpenAPI, liệt kê các thay đổi dự kiến và phân loại theo bảng tương thích, rồi thiết lập một contract test với team tiêu thụ. Viết Team API cho team và chia sẻ với các team liên quan.

## Tóm tắt

- Technical vision mô tả đích đến 6–12 tháng gắn với vấn đề thật và mục tiêu sản phẩm; roadmap Now/Next/Later cho thấy thứ tự mà không hứa ngày cụ thể.
- Tự động hoá standards bằng công cụ và ArchUnit; tài liệu chỉ giữ những quy ước công cụ không kiểm tra được.
- Kiến trúc tham chiếu và project template tạo golden path; template phải được duy trì như một sản phẩm.
- API-first với OpenAPI, quy tắc tương thích rõ ràng, contract test và lịch ngừng phiên bản giúp phối hợp với team khác an toàn.
- Conway's Law: kiến trúc phản chiếu cấu trúc giao tiếp; hãy thiết kế ranh giới team cùng với ranh giới hệ thống.
- Team Topologies gồm 4 loại team và 3 chế độ tương tác, xoay quanh việc giữ cognitive load vừa sức mỗi team.
