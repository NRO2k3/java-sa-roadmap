Phần lớn sự cố bảo mật không đến từ thuật toán mã hoá bị bẻ khoá, mà từ những lỗi rất "đời thường" trong code ứng dụng: nối chuỗi SQL, quên kiểm tra quyền sở hữu dữ liệu, dùng thư viện có lỗ hổng đã công bố từ lâu. Với Solution Architect, bảo mật ứng dụng không phải việc để đội security kiểm tra ở cuối dự án, mà là yêu cầu phi chức năng phải được thiết kế từ đầu và biến thành quy tắc, công cụ, kiểm thử cho cả team. Bài này đi qua OWASP Top 10, cách phòng chống bốn lỗ hổng phổ biến trong ứng dụng Spring, cách đưa việc quét dependency vào pipeline và cách lập threat model theo STRIDE.

## Mục tiêu bài học

- Nắm các nhóm rủi ro trong OWASP Top 10 và biện pháp tương ứng trong hệ sinh thái Spring.
- Hiểu cơ chế và cách phòng chống SQL injection, XSS, CSRF và SSRF bằng code cụ thể.
- Tích hợp quét lỗ hổng dependency (OWASP Dependency-Check, Snyk) vào CI và biết cách xử lý kết quả.
- Lập threat model theo STRIDE cho một hệ thống và biến kết quả thành backlog bảo mật.

## OWASP Top 10 và cách phòng tránh trong Spring

**OWASP** (Open Worldwide Application Security Project) là cộng đồng phi lợi nhuận về bảo mật ứng dụng. **OWASP Top 10** là tài liệu nâng cao nhận thức, liệt kê mười nhóm rủi ro phổ biến và nghiêm trọng nhất với ứng dụng web, tổng hợp từ dữ liệu thực tế và khảo sát cộng đồng. Nó không phải một checklist đầy đủ, nhưng là "ngôn ngữ chung" để trao đổi với đội bảo mật, kiểm toán và khách hàng.

Bảng dưới dùng phiên bản 2021, phiên bản được dùng rộng rãi trong nhiều năm. OWASP đã công bố phiên bản 2025 với một số thay đổi về thứ tự và cách gộp hạng mục (ví dụ rủi ro chuỗi cung ứng phần mềm được nhấn mạnh hơn); khi làm việc thực tế, hãy đối chiếu với phiên bản mới nhất. Các nguyên tắc phòng tránh dưới đây vẫn giữ nguyên giá trị.

| Mã | Hạng mục | Ví dụ trong ứng dụng Spring | Phòng tránh |
|---|---|---|---|
| A01 | Broken Access Control | Đổi id trên URL là xem được đơn của người khác (IDOR); endpoint admin chỉ bị ẩn trên UI | Deny by default, kiểm tra quyền sở hữu ở service (`@PreAuthorize`), viết test phân quyền |
| A02 | Cryptographic Failures | Lưu mật khẩu bằng MD5, truyền dữ liệu qua HTTP, tự chế thuật toán | TLS, `PasswordEncoder` (bcrypt/Argon2), AES-GCM cho dữ liệu nhạy cảm, khoá trong KMS |
| A03 | Injection | Nối chuỗi SQL/JPQL, LDAP, lệnh OS; bản 2021 xếp cả XSS vào nhóm này | Tham số hoá truy vấn, whitelist, output encoding |
| A04 | Insecure Design | Không giới hạn số lần nhập OTP, luồng quên mật khẩu đoán được | Threat modeling, rate limit, phân tích kịch bản lạm dụng |
| A05 | Security Misconfiguration | Mở toàn bộ Actuator, CORS `*` cho phép credentials, lộ stack trace, tài khoản mặc định | Cấu hình tối thiểu, review cấu hình như review code |
| A06 | Vulnerable and Outdated Components | Dùng Log4j 2 phiên bản dính Log4Shell (CVE-2021-44228) | Quét dependency trong CI, cập nhật định kỳ |
| A07 | Identification and Authentication Failures | Không chống brute force, session không hết hạn, JWT không kiểm tra chữ ký | Spring Security, MFA, rate limit đăng nhập, IdP chuẩn |
| A08 | Software and Data Integrity Failures | Deserialize dữ liệu từ bên ngoài bằng Java serialization; CI tải artifact không kiểm chứng | Tránh Java serialization với input ngoài, ký và kiểm tra checksum artifact |
| A09 | Security Logging and Monitoring Failures | Không log đăng nhập thất bại; log cả mật khẩu, token | Log sự kiện bảo mật có cấu trúc, cảnh báo, không log secret |
| A10 | Server-Side Request Forgery | Tính năng "nhập URL ảnh đại diện" gọi được tới dịch vụ nội bộ | Allowlist đích, chặn dải IP nội bộ, kiểm soát egress |

Broken Access Control đứng đầu danh sách và cũng là lỗi mà framework *không thể* tự sửa cho bạn: Spring Security biết người dùng là ai, nhưng chỉ code nghiệp vụ mới biết đơn hàng 1234 thuộc về ai. Cách làm đã trình bày trong bài Spring Security – kiểm tra quyền sở hữu ở tầng service – nên trở thành quy tắc review bắt buộc.

## Phòng chống SQL injection, XSS, CSRF và SSRF

### SQL injection

SQL injection xảy ra khi dữ liệu người dùng được **nối vào câu lệnh** và trở thành một phần của cú pháp SQL. Input `x' OR '1'='1` biến điều kiện lọc thành luôn đúng; input khéo hơn có thể đọc bảng khác hoặc xoá dữ liệu. Cách phòng chống gốc rễ là **tham số hoá**: câu lệnh và giá trị được gửi riêng cho database, nên giá trị không bao giờ được hiểu là cú pháp.

```java
// SAI: nối chuỗi – input "x' OR '1'='1" trả về đơn hàng của mọi khách
String bad = "SELECT * FROM orders WHERE customer_id = '" + customerId + "'";

// ĐÚNG: JDBC/JdbcTemplate với placeholder
List<Order> orders = jdbcTemplate.query(
        "SELECT * FROM orders WHERE customer_id = ? AND status = ?",
        orderRowMapper, customerId, status);

// ĐÚNG: JPQL cũng phải dùng tham số, không nối chuỗi
List<Order> list = em.createQuery(
                "select o from Order o where o.customerId = :cid", Order.class)
        .setParameter("cid", customerId)
        .getResultList();

// Tên cột và chiều sắp xếp KHÔNG tham số hoá được → ánh xạ qua whitelist
private static final Map<String, String> SORTABLE = Map.of(
        "created", "created_at",
        "total", "total_amount");

String column = Optional.ofNullable(SORTABLE.get(sortParam))
        .orElseThrow(() -> new IllegalArgumentException("Cột sắp xếp không hợp lệ"));
String direction = "desc".equalsIgnoreCase(dirParam) ? "DESC" : "ASC";
String sql = "SELECT * FROM orders WHERE customer_id = ? ORDER BY " + column + " " + direction;
```

Phương thức dẫn xuất của Spring Data (`findByCustomerId`) và `@Query` với `:param` đều đã tham số hoá. Rủi ro nằm ở những chỗ dựng câu lệnh động: native query nối chuỗi, Criteria/Specification nhận tên field từ client, stored procedure tự ghép SQL bên trong. Lớp phòng thủ thứ hai là **least privilege**: user database của ứng dụng không có quyền DDL hay quyền đọc bảng của service khác, để nếu bị injection thì thiệt hại vẫn bị giới hạn.

### Cross-Site Scripting (XSS)

XSS xảy ra khi dữ liệu không tin cậy được trình duyệt hiểu là **mã thực thi** (JavaScript) trong trang của bạn. Kẻ tấn công khi đó chạy script dưới danh nghĩa người dùng: đọc dữ liệu trên trang, gửi request thay người dùng, đánh cắp token nằm trong JavaScript. Có ba dạng:

- **Stored:** payload được lưu (bình luận, tên sản phẩm) rồi hiển thị cho người khác – nguy hiểm nhất.
- **Reflected:** payload nằm trong URL/tham số và được phản chiếu ngay vào response.
- **DOM-based:** JavaScript phía client tự lấy dữ liệu (ví dụ `location.hash`) và chèn vào DOM bằng `innerHTML`.

Biện pháp chính là **output encoding theo ngữ cảnh** – mã hoá khi *xuất* dữ liệu, đúng với nơi nó xuất hiện (nội dung HTML, thuộc tính, JavaScript, URL). Template engine và framework hiện đại làm điều này mặc định: Thymeleaf `th:text` tự escape (còn `th:utext` thì không), React tự escape nội dung JSX (trừ `dangerouslySetInnerHTML`). Khi thật sự phải nhận HTML từ người dùng (trình soạn thảo rich text), hãy lọc bằng thư viện sanitize theo allowlist như OWASP Java HTML Sanitizer, đừng tự viết regex.

Các lớp phòng thủ bổ sung: **Content Security Policy** (CSP) giới hạn nguồn script được phép chạy; cookie session có `HttpOnly` để JavaScript không đọc được; API JSON trả đúng `Content-Type: application/json`. Spring Security mặc định đã thêm một số header an toàn như `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Cache-Control` và HSTS (khi chạy HTTPS); CSP thì bạn phải tự khai báo vì nó phụ thuộc ứng dụng:

```java
@Bean
SecurityFilterChain webChain(HttpSecurity http) throws Exception {
    http
        .headers(headers -> headers
            .contentSecurityPolicy(csp -> csp.policyDirectives(
                "default-src 'self'; script-src 'self'; object-src 'none'; frame-ancestors 'none'"))
            .referrerPolicy(ref -> ref.policy(
                ReferrerPolicyHeaderWriter.ReferrerPolicy.STRICT_ORIGIN_WHEN_CROSS_ORIGIN)))
        .authorizeHttpRequests(auth -> auth.anyRequest().authenticated())
        .formLogin(Customizer.withDefaults());
    return http.build();
}
```

### Cross-Site Request Forgery (CSRF)

CSRF lợi dụng việc **trình duyệt tự đính kèm cookie** vào mọi request tới một domain. Người dùng đang đăng nhập ngân hàng mở một trang độc hại; trang đó tự gửi form `POST /transfer` tới ngân hàng, và trình duyệt gắn kèm cookie session hợp lệ. Server không phân biệt được request do người dùng chủ động hay do trang khác khởi tạo.

Phòng chống:

- **CSRF token:** server sinh token ngẫu nhiên gắn với session, form/JavaScript hợp lệ gửi kèm token; trang độc hại không đọc được token do chính sách same-origin. Spring Security bật sẵn cơ chế này cho các method thay đổi trạng thái (POST, PUT, PATCH, DELETE).
- **Thuộc tính `SameSite` của cookie:** `Lax` hoặc `Strict` ngăn trình duyệt gửi cookie trong phần lớn request cross-site. Một số trình duyệt mặc định coi cookie không khai báo là `Lax`, nhưng đừng dựa vào mặc định – hãy khai báo rõ.
- **GET phải an toàn:** không bao giờ thay đổi trạng thái bằng GET, vì GET không được bảo vệ bởi CSRF token.

```yaml
server:
  servlet:
    session:
      cookie:
        http-only: true
        secure: true
        same-site: lax
```

API stateless nhận token qua header `Authorization` không bị CSRF theo cơ chế trên, vì trình duyệt không tự gắn header đó. Nhưng nếu SPA dùng session cookie (mô hình BFF), CSRF phải bật; Spring Security 6 có hướng dẫn riêng cho SPA, dùng `CookieCsrfTokenRepository` để JavaScript đọc token và gửi lại trong header.

### Server-Side Request Forgery (SSRF)

SSRF xảy ra khi ứng dụng gọi tới một URL do người dùng cung cấp: webhook, "tải ảnh từ URL", xem trước liên kết, import file từ xa. Kẻ tấn công đưa vào địa chỉ mà chỉ *server* với tới được: dịch vụ nội bộ không xác thực, cổng quản trị, hoặc endpoint metadata của cloud tại `169.254.169.254` – nơi có thể chứa credential tạm thời của máy chủ. Lúc này server của bạn trở thành "proxy" giúp kẻ tấn công vượt qua firewall.

```java
@Component
public class OutboundUrlValidator {

    private static final Set<String> ALLOWED_HOSTS =
            Set.of("hooks.partner.example.com", "files.partner.example.com");

    public URI validate(String raw) {
        URI uri = URI.create(raw);
        if (!"https".equalsIgnoreCase(uri.getScheme()) || uri.getHost() == null) {
            throw new IllegalArgumentException("Chỉ chấp nhận URL https hợp lệ");
        }
        String host = uri.getHost().toLowerCase(Locale.ROOT);
        if (!ALLOWED_HOSTS.contains(host)) {
            throw new IllegalArgumentException("Host không nằm trong danh sách cho phép");
        }
        try {
            for (InetAddress addr : InetAddress.getAllByName(host)) {
                if (addr.isLoopbackAddress() || addr.isSiteLocalAddress()
                        || addr.isLinkLocalAddress() || addr.isAnyLocalAddress()) {
                    throw new IllegalArgumentException("Host trỏ tới địa chỉ nội bộ");
                }
            }
        } catch (UnknownHostException e) {
            throw new IllegalArgumentException("Không phân giải được host", e);
        }
        return uri;
    }
}
```

Khi gọi ra ngoài, tắt tự động theo redirect (`HttpClient.newBuilder().followRedirects(HttpClient.Redirect.NEVER)`) vì một URL hợp lệ có thể chuyển hướng tới địa chỉ nội bộ, và đặt timeout ngắn. Kiểm tra ở tầng ứng dụng như trên chưa đủ: danh sách địa chỉ cần chặn còn nhiều dải khác (ví dụ IPv6 unique local), và kẻ tấn công có thể dùng *DNS rebinding* để tên miền phân giải ra IP khác giữa lúc kiểm tra và lúc kết nối. Vì vậy phòng thủ quan trọng nhất là **allowlist đích** cộng với **kiểm soát egress ở tầng mạng**: service chỉ được đi ra những đích đã khai báo, và endpoint metadata của cloud được bảo vệ (ví dụ AWS IMDSv2 yêu cầu token phiên).

## Quét lỗ hổng dependency

Một ứng dụng Spring Boot điển hình kéo theo hàng trăm thư viện, phần lớn là **transitive** (phụ thuộc gián tiếp) mà bạn không trực tiếp khai báo. Khi một lỗ hổng được công bố, nó nhận mã **CVE** và điểm **CVSS** (0–10) thể hiện mức độ nghiêm trọng. **SCA** (Software Composition Analysis) là việc tự động đối chiếu danh sách dependency với cơ sở dữ liệu lỗ hổng.

- **OWASP Dependency-Check:** mã nguồn mở, có plugin Maven/Gradle, đối chiếu dependency với dữ liệu NVD (National Vulnerability Database) và sinh báo cáo HTML/JSON. Nên cấu hình NVD API key để tải dữ liệu nhanh và ổn định. Đôi khi báo nhầm (*false positive*) do cách khớp tên thư viện – xử lý bằng file suppression có ghi lý do.
- **Snyk:** dịch vụ thương mại (có gói miễn phí), dùng cơ sở dữ liệu lỗ hổng riêng, đề xuất phiên bản nâng cấp, tạo pull request sửa lỗi và theo dõi liên tục; cũng quét container image và Infrastructure as Code.
- Các lựa chọn khác: GitHub Dependabot, OSV-Scanner, Trivy (mạnh ở quét container image).

```xml
<plugin>
    <groupId>org.owasp</groupId>
    <artifactId>dependency-check-maven</artifactId>
    <version>${dependency-check.version}</version>
    <configuration>
        <failBuildOnCVSS>7</failBuildOnCVSS>   <!-- build thất bại nếu có lỗ hổng CVSS >= 7 -->
        <nvdApiKey>${env.NVD_API_KEY}</nvdApiKey>
        <suppressionFiles>
            <suppressionFile>dependency-check-suppressions.xml</suppressionFile>
        </suppressionFiles>
    </configuration>
    <executions>
        <execution>
            <goals><goal>check</goal></goals>
        </execution>
    </executions>
</plugin>
```

```bash
mvn verify                                          # chạy check, báo cáo ở target/dependency-check-report.html
mvn dependency:tree -Dincludes=org.yaml:snakeyaml   # tìm dependency nào kéo thư viện có lỗ hổng vào
snyk test --severity-threshold=high                 # thất bại nếu có lỗ hổng mức high trở lên
snyk monitor                                        # lưu snapshot để Snyk cảnh báo khi có CVE mới
```

Quy trình xử lý kết quả quan trọng không kém công cụ:

1. **Phân loại:** mức độ CVSS, thư viện có thật sự được dùng ở đường code bị ảnh hưởng không (*reachability*), service có tiếp xúc internet không.
2. **Sửa:** ưu tiên nâng cấp. Với dependency transitive, ghi đè phiên bản qua `dependencyManagement` (với Spring Boot, thường chỉ cần đổi property phiên bản tương ứng) rồi chạy lại test.
3. **Chấp nhận có thời hạn:** nếu chưa sửa được, ghi suppression kèm lý do, người phê duyệt và ngày hết hạn, kèm biện pháp giảm thiểu tạm thời.
4. **Chạy định kỳ:** ngoài việc quét mỗi pull request, chạy lại hằng đêm, vì CVE mới xuất hiện cho cả những dependency không hề thay đổi.

Sinh **SBOM** (Software Bill of Materials – danh sách thành phần phần mềm) theo chuẩn CycloneDX hoặc SPDX cho mỗi bản phát hành giúp trả lời ngay câu hỏi "hệ thống nào đang dùng thư viện X phiên bản Y" khi có lỗ hổng mới.

## Threat modeling theo STRIDE

**Threat modeling** là hoạt động có cấu trúc để tìm ra những gì có thể sai về mặt bảo mật *trước khi* hệ thống được xây dựng. Có thể tóm gọn trong bốn câu hỏi: Chúng ta đang xây dựng gì? Điều gì có thể sai? Chúng ta sẽ làm gì với nó? Chúng ta đã làm đủ tốt chưa?

### Bước 1: Mô hình hoá hệ thống

Vẽ **DFD** (Data Flow Diagram) gồm thực thể bên ngoài, tiến trình, kho dữ liệu, luồng dữ liệu và quan trọng nhất là **ranh giới tin cậy** (*trust boundary*) – nơi dữ liệu đi từ vùng ít tin cậy sang vùng tin cậy hơn. Mối đe doạ thường tập trung ở các luồng cắt qua ranh giới.

```text
Internet (không tin cậy)
   [Khách hàng]        [Nhân viên CSKH]
        │ HTTPS               │ HTTPS
════════╪═════════════════════╪══════════════  ranh giới tin cậy #1
        ▼                     ▼
      (API Gateway) ◄─────────┘
        │        └──────► (Keycloak)
        ▼
      (Order Service) ──────► [(PostgreSQL)]
        │        └──────► ((Kafka)) ──► (Notification Service)
        ▼
      (Payment Service)
        │ HTTPS
════════╪════════════════════════════════════  ranh giới tin cậy #2
        ▼
   [Cổng thanh toán bên thứ ba]
```

### Bước 2: Áp dụng STRIDE

STRIDE là sáu nhóm mối đe doạ, mỗi nhóm vi phạm một thuộc tính bảo mật:

| Nhóm | Vi phạm | Ví dụ trong hệ thống đặt hàng | Biện pháp |
|---|---|---|---|
| **S**poofing – giả mạo | Xác thực | Dùng token bị đánh cắp để giả làm khách hàng; một pod lạ gọi Payment Service | OIDC, MFA cho nhân viên, token ngắn hạn, mTLS giữa service |
| **T**ampering – sửa đổi | Toàn vẹn | Sửa giá trong request đặt hàng; sửa message trên Kafka | Server tự tính giá, TLS, ACL ghi topic, ký message nếu cần |
| **R**epudiation – chối bỏ | Không thể chối bỏ | Nhân viên CSKH hoàn tiền rồi phủ nhận, log có thể bị xoá | Audit log bất biến (ai, làm gì, lúc nào), đồng bộ thời gian |
| **I**nformation disclosure – lộ thông tin | Bảo mật | PII trong log, stack trace trong response, IDOR | Mask log, ProblemDetail chung, kiểm tra quyền sở hữu, mã hoá |
| **D**enial of service – từ chối dịch vụ | Sẵn sàng | Spam API tìm kiếm nặng, upload file khổng lồ | Rate limit, giới hạn kích thước, timeout, autoscaling |
| **E**levation of privilege – leo thang đặc quyền | Phân quyền | User thường gọi endpoint admin; gửi thêm field `role` khi cập nhật hồ sơ | Deny by default, method security, DTO không chứa field nhạy cảm |

Một cách hệ thống là **STRIDE-per-element**: thực thể bên ngoài thường gặp S và R; tiến trình có thể gặp cả sáu; kho dữ liệu và luồng dữ liệu chủ yếu gặp T, I, D.

### Bước 3–4: Ưu tiên, xử lý và kiểm chứng

Đánh giá mỗi mối đe doạ theo **khả năng xảy ra × mức tác động** (cao/trung bình/thấp là đủ cho hầu hết team). Với mỗi mối đe doạ, chọn một trong bốn hướng: giảm thiểu (*mitigate*), loại bỏ tính năng gây rủi ro, chuyển giao (ví dụ dùng cổng thanh toán để không phải lưu số thẻ) hoặc chấp nhận – có người chịu trách nhiệm ký nhận. Kết quả nên là một bảng gồm: mã, phần tử, nhóm STRIDE, mô tả, mức rủi ro, biện pháp, người phụ trách, trạng thái – và các biện pháp được đưa vào backlog như mọi yêu cầu khác, kèm tiêu chí kiểm thử.

Threat model là **tài liệu sống**: làm ở giai đoạn thiết kế, cập nhật khi thêm luồng dữ liệu mới, tích hợp bên thứ ba hoặc thay đổi ranh giới tin cậy. Làm cùng developer, không chỉ đội bảo mật – người viết code mới biết dữ liệu thật sự đi đâu. Công cụ có thể đơn giản như bảng trắng và bảng tính, hoặc OWASP Threat Dragon, Microsoft Threat Modeling Tool.

## Lỗi thường gặp

- **Lọc ký tự "nguy hiểm" thay vì tham số hoá.** Danh sách đen luôn thiếu. Dùng placeholder và whitelist cho phần không tham số hoá được.
- **Escape dữ liệu khi lưu thay vì khi xuất.** Dữ liệu bị mã hoá hai lần hoặc sai ngữ cảnh. Lưu dữ liệu gốc, encode khi render theo đúng ngữ cảnh.
- **Tắt CSRF cho ứng dụng dùng session cookie, hoặc thay đổi trạng thái bằng GET.** Giữ CSRF, dùng đúng HTTP method.
- **Chặn SSRF bằng cách so chuỗi `"localhost"`.** Bị vượt qua bằng `127.0.0.1`, IP dạng số thập phân, tên miền trỏ về IP nội bộ hoặc redirect. Dùng allowlist, kiểm tra IP sau khi phân giải và kiểm soát egress.
- **Chỉ quét dependency một lần, hoặc suppress hàng loạt cho build xanh.** Quét mỗi pull request và hằng đêm; mỗi suppression có lý do và ngày hết hạn.
- **Threat model một lần rồi cất ngăn kéo.** Gắn việc cập nhật threat model vào quy trình review thiết kế.
- **Tin vào validate ở frontend.** Mọi kiểm tra phải lặp lại ở server, vì kẻ tấn công gọi API trực tiếp.
- **Log token, mật khẩu, số thẻ.** Che (mask) dữ liệu nhạy cảm trong log và thông báo lỗi.

## Bài tập thực hành

1. **Phòng thí nghiệm lỗ hổng:** Viết một ứng dụng Spring Boot nhỏ có ba lỗi cố ý: tìm kiếm đơn hàng nối chuỗi SQL, bình luận sản phẩm hiển thị bằng `th:utext`, và tính năng "tải ảnh đại diện từ URL". Khai thác từng lỗi trên máy local (ví dụ SSRF tới một service nội bộ giả lập), sau đó sửa và viết test tự động chứng minh payload tấn công không còn tác dụng.
2. **Quét dependency trong CI:** Thêm OWASP Dependency-Check (hoặc Snyk) vào pipeline với ngưỡng thất bại CVSS 7. Cố ý dùng một phiên bản cũ của một thư viện phổ biến, đọc báo cáo, dùng `mvn dependency:tree` tìm nguồn gốc, sửa bằng nâng cấp và sinh SBOM CycloneDX cho bản build.
3. **Threat model cho hệ thống đặt hàng:** Vẽ DFD có ranh giới tin cậy cho hệ thống trong milestone (gateway, order, payment, Kafka, Keycloak, PostgreSQL). Liệt kê ít nhất 12 mối đe doạ theo STRIDE, xếp hạng rủi ro và chuyển 5 mối đe doạ cao nhất thành user story bảo mật có tiêu chí nghiệm thu.

## Tóm tắt

- OWASP Top 10 là ngôn ngữ chung về rủi ro ứng dụng web; Broken Access Control đứng đầu và chỉ có thể sửa bằng kiểm tra quyền trong code nghiệp vụ.
- SQL injection được chặn tận gốc bằng tham số hoá; phần không tham số hoá được (tên cột, chiều sắp xếp) phải qua whitelist.
- XSS được phòng bằng output encoding theo ngữ cảnh, sanitize HTML theo allowlist, CSP và cookie `HttpOnly`.
- CSRF chỉ đe doạ khi xác thực dựa trên cookie: giữ CSRF token, khai báo `SameSite`, không đổi trạng thái bằng GET.
- SSRF cần allowlist đích, kiểm tra IP sau khi phân giải, tắt redirect và kiểm soát egress ở tầng mạng.
- Quét dependency trong CI và định kỳ, xử lý kết quả theo quy trình, sinh SBOM cho mỗi bản phát hành.
- Threat model theo STRIDE trên DFD có ranh giới tin cậy, ưu tiên theo rủi ro và biến biện pháp thành backlog.
