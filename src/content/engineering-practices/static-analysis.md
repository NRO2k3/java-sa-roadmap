Có những lỗi con người rất dễ bỏ sót nhưng máy bắt được trong vài giây: quên `throw` một exception, so sánh chuỗi bằng `==`, gọi `trim()` mà bỏ kết quả. Có những cuộc tranh luận lẽ ra không nên tồn tại: tab hay dấu cách, thứ tự import. **Phân tích tĩnh** (static analysis), tức là phân tích mã nguồn hoặc bytecode mà không cần chạy chương trình, cùng với format tự động giải quyết cả hai nhóm việc này. Với Dev Lead, cấu hình đúng bộ công cụ một lần là cách rẻ nhất để nâng chuẩn chất lượng cho cả team và giải phóng code review cho những câu hỏi về thiết kế.

## Mục tiêu bài học

- Thống nhất code style và tự động format bằng Spotless với google-java-format.
- Phân biệt và kết hợp Checkstyle, Error Prone, SpotBugs để bắt lỗi sớm.
- Dùng SonarQube để theo dõi code smell, duplication, coverage và đặt quality gate.
- Tự động cập nhật dependency với Dependabot hoặc Renovate mà không làm team quá tải.

## Thống nhất code style và format tự động

Style guide chỉ có giá trị khi **không ai phải nhớ nó**. Nếu mỗi người tự format theo IDE của mình, diff sẽ đầy thay đổi khoảng trắng và reviewer mất thời gian vào chuyện vặt. Giải pháp là một formatter **quyết định thay cho con người** và được kiểm tra trong CI.

**google-java-format** là formatter theo Google Java Style, gần như không có tuỳ chọn cấu hình: điều này là có chủ đích, để team không mất thời gian tranh luận. Có biến thể AOSP dùng thụt lề 4 dấu cách. **Palantir Java Format** là một lựa chọn khác, dựa trên google-java-format nhưng cho dòng dài 120 ký tự. **Spotless** là plugin Maven/Gradle đóng vai trò "khung": nó chạy formatter bạn chọn, kiểm tra trong build và tự sửa khi được yêu cầu.

```xml
<plugin>
  <groupId>com.diffplug.spotless</groupId>
  <artifactId>spotless-maven-plugin</artifactId>
  <version>${spotless.version}</version>
  <configuration>
    <!-- Chỉ áp dụng cho file thay đổi so với main: hữu ích khi đưa vào codebase cũ -->
    <ratchetFrom>origin/main</ratchetFrom>
    <java>
      <googleJavaFormat>
        <style>GOOGLE</style> <!-- hoặc AOSP: thụt lề 4 dấu cách -->
      </googleJavaFormat>
      <removeUnusedImports/>
    </java>
  </configuration>
  <executions>
    <execution>
      <goals>
        <goal>check</goal> <!-- mặc định gắn vào phase verify: build fail nếu chưa format -->
      </goals>
    </execution>
  </executions>
</plugin>
```

Quy trình hằng ngày: dev chạy `./mvnw spotless:apply` trước khi commit (hoặc cấu hình IDE dùng cùng formatter), CI chạy `./mvnw verify` và fail nếu còn file chưa format.

**Đưa vào codebase cũ** có hai cách. Cách một là `ratchetFrom` như trên: chỉ file bị sửa mới phải format, codebase "sạch dần". Cách hai là format toàn bộ trong **một commit riêng**, rồi thêm commit đó vào file `.git-blame-ignore-revs` để `git blame` bỏ qua nó (chạy `git config blame.ignoreRevsFile .git-blame-ignore-revs`; GitHub cũng tự nhận file này). Cách hai gọn hơn nhưng nên báo trước để các nhánh đang mở kịp merge, tránh conflict hàng loạt.

Ngoài ra, file `.editorconfig` giúp mọi editor thống nhất encoding, ký tự xuống dòng và thụt lề cho cả các file không phải Java (YAML, SQL, properties).

## Bắt lỗi sớm: Checkstyle, Error Prone, SpotBugs

Ba công cụ này thường bị gộp chung là "linter", nhưng chúng làm việc ở các tầng khác nhau và bổ sung cho nhau:

| Công cụ | Phân tích gì | Chạy khi nào | Mạnh ở |
|---|---|---|---|
| Checkstyle | Mã nguồn, theo quy ước | Phase validate/verify | Quy ước đặt tên, Javadoc, import, độ phức tạp, độ dài method |
| Error Prone | Mã nguồn, trong lúc javac biên dịch | Compile | Lỗi lập trình phổ biến, ít báo nhầm, có gợi ý sửa |
| SpotBugs | Bytecode sau biên dịch | Sau compile (verify) | Null dereference, lỗi đồng thời, tài nguyên không đóng, bảo mật (plugin FindSecBugs) |

### Error Prone

**Error Prone** của Google là plugin cho trình biên dịch javac: nó phân tích code ngay trong lúc compile, nên lỗi hiện ra như lỗi biên dịch, trước cả khi chạy test. Các check mức ERROR được thiết kế để rất ít báo nhầm, nên có thể bật làm lỗi build mà team không thấy phiền.

Đoạn code dưới đây compile bình thường với javac, nhưng có bốn lỗi thật:

```java
public class OrderValidator {
    private final Set<Long> blockedCustomerIds = Set.of(1001L, 1002L);

    void validate(Order order, int customerId) {
        if (order.total().signum() < 0) {
            // Error Prone DeadException: tạo exception nhưng quên throw
            new IllegalArgumentException("Tổng tiền âm");
        }
        // Error Prone CollectionIncompatibleType: Set<Long> nhưng truyền int (box thành Integer)
        // -> contains luôn trả về false, khách bị chặn vẫn đặt hàng được
        if (blockedCustomerIds.contains(customerId)) {
            throw new IllegalStateException("Khách hàng bị chặn");
        }
        String code = order.couponCode();
        // Error Prone ReturnValueIgnored: String bất biến, kết quả trim() bị bỏ
        code.trim();
        // SpotBugs ES_COMPARING_STRINGS_WITH_EQ: so sánh tham chiếu thay vì nội dung
        if (code == "VIP") {
            order.markPriority();
        }
    }
}
```

Lỗi `CollectionIncompatibleType` đặc biệt nguy hiểm: không có exception, không có cảnh báo của compiler, chỉ đơn giản là logic chặn khách hàng không bao giờ chạy. Đây đúng là loại bug khó phát hiện bằng review và test thông thường.

Cài Error Prone vào Maven qua `maven-compiler-plugin`:

```xml
<plugin>
  <groupId>org.apache.maven.plugins</groupId>
  <artifactId>maven-compiler-plugin</artifactId>
  <configuration>
    <release>21</release>
    <compilerArgs>
      <arg>-XDcompilePolicy=simple</arg>
      <arg>--should-stop=ifError=FLOW</arg>
      <!-- Các cờ -Xep nằm cùng chuỗi với -Xplugin để chỉnh mức độ từng check -->
      <arg>-Xplugin:ErrorProne -Xep:MissingOverride:ERROR</arg>
    </compilerArgs>
    <annotationProcessorPaths>
      <path>
        <groupId>com.google.errorprone</groupId>
        <artifactId>error_prone_core</artifactId>
        <version>${errorprone.version}</version>
      </path>
    </annotationProcessorPaths>
  </configuration>
</plugin>
```

Với JDK 16 trở lên, Error Prone cần truy cập API nội bộ của `jdk.compiler`, nên theo hướng dẫn cài đặt chính thức bạn phải thêm file `.mvn/jvm.config` chứa các cờ `--add-exports` và `--add-opens` tương ứng. Hãy chép danh sách cờ từ tài liệu đúng với version đang dùng. Error Prone cũng là nền cho các plugin như **NullAway** (của Uber) để kiểm tra null ở compile time.

### SpotBugs

**SpotBugs** là hậu duệ của FindBugs, phân tích **bytecode** nên phát hiện được các mẫu lỗi xuyên method như dereference giá trị có thể null, stream không đóng, đồng bộ hoá không nhất quán giữa các field. Chạy bằng `spotbugs-maven-plugin` với goal `check`; tham số `effort` (mức độ phân tích) và `threshold` (ngưỡng mức độ nghiêm trọng được báo) giúp cân bằng giữa độ kỹ và nhiễu. Thêm plugin **FindSecBugs** để bắt các lỗi bảo mật như SQL injection, dùng thuật toán mã hoá yếu.

SpotBugs có thể báo nhầm nhiều hơn Error Prone. Dùng **exclude filter** (file XML) để loại các mẫu không phù hợp, hoặc annotation `@SuppressFBWarnings` kèm lý do (`justification`) cho từng trường hợp cụ thể, đừng tắt cả công cụ.

### Checkstyle

**Checkstyle** kiểm tra quy ước: tên class/method/hằng, cấm import `*`, độ dài method, độ phức tạp cyclomatic, Javadoc cho API công khai. Checkstyle đi kèm hai cấu hình có sẵn là `google_checks.xml` và `sun_checks.xml`.

> **Lưu ý:** Nếu đã dùng formatter tự động, hãy **tắt các rule về format** trong Checkstyle (thụt lề, khoảng trắng, độ dài dòng). Hai công cụ cùng quản lý format sẽ mâu thuẫn nhau và gây nhiễu. Giữ Checkstyle cho những gì formatter không làm: quy ước đặt tên, độ phức tạp, các cấu trúc bị cấm.

### Đưa vào dự án mà không gây "bão cảnh báo"

Bật tất cả rule trên codebase 5 năm tuổi sẽ cho ra hàng nghìn cảnh báo, và team sẽ học cách phớt lờ chúng. Cách làm thực tế:

1. Bắt đầu với tập rule nhỏ, ít báo nhầm (các check ERROR mặc định của Error Prone).
2. Với lỗi cũ: tạo baseline hoặc chỉ áp cho code mới, sửa dần theo kế hoạch.
3. Mỗi rule hoặc là **fail build**, hoặc là **tắt hẳn**. Cảnh báo không ai bắt buộc sửa sẽ chỉ tích tụ.
4. Định kỳ xem lại: rule nào toàn báo nhầm thì tắt, loại bug nào vừa lọt ra production thì tìm rule tương ứng để bật.

## Theo dõi chất lượng với SonarQube

Các công cụ trên chạy trong build và trả lời "thay đổi này có lỗi không". **SonarQube** trả lời câu hỏi rộng hơn theo thời gian: chất lượng codebase đang tốt lên hay xấu đi, và thay đổi mới có đạt chuẩn của team không.

Các khái niệm chính:

- **Issue**: vấn đề do rule phát hiện. Sonar phân loại theo bug (ảnh hưởng độ tin cậy), vulnerability (bảo mật) và code smell (khả năng bảo trì); các phiên bản mới gom lại theo "software quality": reliability, security, maintainability.
- **Security hotspot**: đoạn code nhạy cảm về bảo mật cần **con người xem xét** (ví dụ cấu hình CORS, dùng random), chưa chắc là lỗi.
- **Duplication**: tỉ lệ dòng code trùng lặp, giúp tìm các khối copy-paste.
- **Coverage**: Sonar không tự chạy test; nó đọc báo cáo của JaCoCo do build tạo ra.
- **Technical debt**: ước lượng thời gian cần để sửa các code smell, dùng để so sánh xu hướng hơn là con số tuyệt đối.
- **Quality gate**: tập điều kiện pass/fail cho mỗi lần phân tích, có thể dùng làm required check trên PR.

Nguyên tắc quan trọng nhất là **tập trung vào new code** (Sonar gọi là "Clean as You Code"): quality gate áp điều kiện lên phần code mới hoặc vừa sửa, không bắt sửa toàn bộ nợ cũ. Nhờ vậy gate có thể bật ngay hôm nay với codebase cũ, và chất lượng tổng thể tự tăng dần theo mỗi lần chỉnh sửa.

Sonar có bản cho IDE (trước đây gọi là SonarLint, nay đổi tên thành SonarQube for IDE) hiển thị issue ngay khi gõ code. Kết hợp với cùng bộ rule trên server, dev thấy vấn đề trước cả khi mở PR.

> **Lưu ý:** Đừng biến số liệu Sonar thành KPI cá nhân. Khi "số code smell" thành chỉ tiêu, người ta sẽ tìm cách né rule thay vì viết code tốt hơn. Dùng dashboard để thảo luận xu hướng của team và chọn vùng cần cải thiện.

## Tự động cập nhật dependency

Dependency cũ là rủi ro bảo mật và là nợ kỹ thuật tích luỹ: nâng Spring Boot sau hai năm không cập nhật khó hơn nhiều so với nâng mỗi tháng một lần. **Dependabot** (tích hợp sẵn trong GitHub) và **Renovate** (chạy được trên GitHub, GitLab, Bitbucket) tự phát hiện version mới và mở PR cập nhật; CI của bạn sẽ cho biết bản mới có làm hỏng gì không.

```yaml
# .github/dependabot.yml
version: 2
updates:
  - package-ecosystem: "maven"
    directory: "/"
    schedule:
      interval: "weekly"
    open-pull-requests-limit: 5
    groups:
      spring:                 # gom các bản cập nhật Spring vào một PR
        patterns:
          - "org.springframework*"
    ignore:
      - dependency-name: "*"
        update-types: ["version-update:semver-major"] # major xử lý thủ công, có kế hoạch
  - package-ecosystem: "github-actions"
    directory: "/"
    schedule:
      interval: "weekly"
```

Renovate linh hoạt hơn: gom nhóm theo nhiều tiêu chí, lịch chạy chi tiết, tự merge các bản cập nhật rủi ro thấp khi CI xanh, và có "dependency dashboard" là một issue tổng hợp mọi bản cập nhật đang chờ. Cấu hình `renovate.json` tối thiểu:

```json
{
  "extends": ["config:recommended"],
  "schedule": ["before 6am on monday"],
  "packageRules": [
    { "matchUpdateTypes": ["patch"], "automerge": true },
    { "matchUpdateTypes": ["major"], "dependencyDashboardApproval": true }
  ]
}
```

Điều kiện để tự động hoá này an toàn: **bộ test đủ tin cậy**. Nếu test yếu, auto-merge bản patch có thể đưa lỗi lên production; khi đó hãy bắt đầu bằng việc chỉ mở PR và review thủ công. Ngoài ra, Spring Boot quản lý version của rất nhiều thư viện qua BOM (`spring-boot-dependencies`), nên nâng Spring Boot thường kéo theo cả loạt thư viện; ưu tiên nâng BOM thay vì ghi đè version từng thư viện lẻ.

## Lỗi thường gặp

- **Bật mọi rule cùng lúc**: hàng nghìn cảnh báo, team bỏ qua tất cả. Cách sửa: bắt đầu nhỏ, chỉ áp cho code mới, tăng dần.
- **Cảnh báo không bao giờ fail build**: cảnh báo tích tụ vô hạn. Cách sửa: mỗi rule hoặc fail build, hoặc tắt.
- **Formatter và Checkstyle cùng quản lý format**: hai công cụ mâu thuẫn. Cách sửa: formatter lo format, Checkstyle lo quy ước khác.
- **Suppress hàng loạt không lý do**: `@SuppressWarnings("all")` khắp nơi. Cách sửa: chỉ suppress từng trường hợp cụ thể, bắt buộc ghi lý do, review như code.
- **PR Dependabot chất đống không ai xử lý**: hàng chục PR mở hàng tháng. Cách sửa: gom nhóm, giới hạn số PR, phân công người trực xử lý mỗi tuần, tự merge bản patch khi test đủ tốt.
- **Chỉ chạy công cụ trên máy dev**: không có gì đảm bảo mọi người chạy. Cách sửa: mọi kiểm tra đều chạy trong CI như required check.

## Bài tập thực hành

1. **Format tự động**: thêm Spotless với google-java-format vào một service, format toàn bộ trong một commit riêng, cấu hình `.git-blame-ignore-revs` và kiểm tra `git blame` vẫn hiển thị đúng tác giả gốc.
2. **Săn bug bằng Error Prone**: bật Error Prone cho một module, thống kê các lỗi mức ERROR tìm được, phân loại thành bug thật, báo nhầm và code xấu nhưng vô hại. Trình bày kết quả cho team và đề xuất danh sách rule bật mặc định.
3. **Quality gate và dependency**: dựng SonarQube Community bằng Docker, phân tích service của team, xem các issue nghiêm trọng nhất trên new code; sau đó cấu hình Dependabot hoặc Renovate cho repo với gom nhóm Spring và quan sát PR được tạo trong tuần.

## Tóm tắt

- Để máy làm những gì máy làm tốt: format, quy ước, bug pattern; con người review thiết kế và nghiệp vụ.
- Spotless với google-java-format chấm dứt tranh luận về style; dùng `ratchetFrom` hoặc một commit format riêng để áp vào codebase cũ.
- Error Prone bắt lỗi ngay khi compile, ít báo nhầm; SpotBugs phân tích bytecode; Checkstyle kiểm tra quy ước. Chúng bổ sung cho nhau.
- Mỗi rule nên hoặc fail build, hoặc tắt; bắt đầu với tập nhỏ và chỉ áp cho code mới.
- SonarQube theo dõi xu hướng chất lượng; quality gate tập trung vào new code.
- Dependabot/Renovate giữ dependency luôn mới; gom nhóm, giới hạn số PR và chỉ auto-merge khi test đủ tin cậy.
