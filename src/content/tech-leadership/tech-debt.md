Mọi codebase sống lâu đều có nợ kỹ thuật (technical debt); vấn đề không phải là có nợ hay không, mà là nợ có được nhìn thấy, đo lường và trả có kế hoạch hay không. Khi nợ vô hình, nó chỉ lộ ra dưới dạng "team ngày càng chậm" và sự cố bất ngờ, và PO không có lý do gì để dành thời gian cho nó. Bài này giúp Tech Lead biến nợ kỹ thuật thành thứ đo được, ưu tiên được và trả được, kể cả những khoản nợ lớn như nâng cấp Java và Spring Boot.

## Mục tiêu bài học

- Nhận diện và phân loại nợ kỹ thuật, dùng Technical Debt Quadrant để hiểu nguồn gốc và cách xử lý.
- Lập tech debt register, ước lượng "lãi", rủi ro và chi phí trả nợ để ưu tiên hoá.
- Thương lượng với PO bằng ngôn ngữ kinh doanh để có thời gian trả nợ đều đặn.
- Lập lộ trình nâng cấp Java 8 lên 21 và Spring Boot 2 lên 3, dùng OpenRewrite để tự động hoá phần lớn thay đổi.

## Nợ kỹ thuật là gì

Ẩn dụ "nợ kỹ thuật" do Ward Cunningham đưa ra: đi tắt trong thiết kế giống như vay tiền, giúp bạn đi nhanh hơn bây giờ, nhưng phải trả **lãi** về sau dưới dạng công sức thêm mỗi lần chạm vào phần code đó. **Gốc** (principal) là công sức để sửa cho đúng. Nợ chỉ trở thành vấn đề khi lãi tích luỹ lớn hơn lợi ích ban đầu.

Hệ quả quan trọng của ẩn dụ này: **code xấu mà không ai chạm vào thì gần như không có lãi**. Một module cũ ổn định, ít thay đổi có thể để nguyên; một class phức tạp mà mọi tính năng mới đều phải sửa thì đang "đốt" thời gian của team mỗi sprint.

## Nhận diện và phân loại nợ

### Các loại nợ thường gặp

| Loại | Ví dụ trong team Java | Dấu hiệu |
|---|---|---|
| Code | God class OrderService vài nghìn dòng, code trùng lặp | Sửa một chỗ hỏng chỗ khác, review khó |
| Thiết kế, kiến trúc | Module phụ thuộc vòng, nhiều service đọc chung database | Thay đổi nhỏ phải sửa nhiều nơi, deploy phải đi cùng nhau |
| Test | Ít test tự động, test tích hợp dùng H2 thay vì database thật | Lỗi SQL chỉ lộ ở staging, sợ refactor |
| Dependency, nền tảng | Java 8, Spring Boot 2.x đã hết hỗ trợ OSS, thư viện có lỗ hổng | Không nhận bản vá, không dùng được thư viện mới |
| Build, hạ tầng | CI chạy 30 phút, deploy thủ công | Phản hồi chậm, hotfix mất nhiều thời gian |
| Tri thức, tài liệu | Chỉ một người hiểu module thanh toán, không có runbook | Sự cố kéo dài khi người đó vắng mặt |

### Nguồn tín hiệu

- **Công cụ**: SonarQube (độ phức tạp, trùng lặp, code smell), OWASP Dependency-Check hoặc tính năng quét dependency của nền tảng Git, `mvn versions:display-dependency-updates` để xem thư viện lỗi thời.
- **Hotspot**: kết hợp độ phức tạp với tần suất thay đổi. File phức tạp và thay đổi thường xuyên là nơi lãi cao nhất.

```bash
# 20 file Java thay đổi nhiều nhất trong 6 tháng gần đây
git log --since="6 months ago" --name-only --format='' -- '*.java' \
  | sort | uniq -c | sort -rn | head -20
```

- **Con người**: hỏi team trong retro "phần nào của code bạn sợ chạm vào nhất?", đọc lại các postmortem để tìm nguyên nhân gốc lặp lại.
- **Số liệu luồng công việc**: lead time tăng dần, tỉ lệ lỗi sau deploy tăng là triệu chứng của nợ tích luỹ.

### Technical Debt Quadrant

Martin Fowler phân loại nợ theo hai trục: **cố ý hay vô tình**, và **thận trọng hay liều lĩnh**. Mục đích không phải để dán nhãn, mà để hiểu nguồn gốc và chọn cách xử lý phù hợp.

```text
                      LIỀU LĨNH (reckless)              THẬN TRỌNG (prudent)
                 +--------------------------------+--------------------------------+
 CỐ Ý            | "Không có thời gian thiết kế,  | "Phải ra mắt trước Tết; chấp   |
 (deliberate)    |  cứ code cho chạy đã."         |  nhận đi tắt, ghi lại và lên   |
                 |                                |  kế hoạch trả."                |
                 +--------------------------------+--------------------------------+
 VÔ TÌNH         | "Layered architecture là gì?"  | "Giờ hiểu domain rồi mới thấy  |
 (inadvertent)   |                                |  đáng lẽ nên chia module khác."|
                 +--------------------------------+--------------------------------+
```

| Góc | Cách xử lý |
|---|---|
| Cố ý & thận trọng | Chấp nhận được. Ghi vào register **ngay khi tạo nợ**, có hạn trả và người chịu trách nhiệm. |
| Cố ý & liều lĩnh | Vấn đề văn hoá, quy trình: siết Definition of Done, quality gate, code review; lead phải bảo vệ team trước áp lực đi tắt vô tội vạ. |
| Vô tình & liều lĩnh | Vấn đề năng lực: đào tạo, pair programming, mentoring, review kỹ hơn. |
| Vô tình & thận trọng | Không tránh được, là dấu hiệu team đã học được điều mới. Refactor dần khi chạm vào vùng đó. |

## Tech debt register

Tech debt register là danh sách nợ được quản lý như backlog: mỗi khoản có mô tả, tác động, chi phí và người chịu trách nhiệm. Đặt nó ở nơi PO nhìn thấy được (cùng công cụ quản lý backlog), không phải trong một file riêng của developer.

### Cấu trúc và ví dụ

Chấm điểm 1–5 cho ba yếu tố: **Lãi** (công sức mất thêm hiện tại, tần suất chạm vào), **Rủi ro** (khả năng và mức độ gây sự cố, lỗ hổng), **Chi phí** trả nợ (5 là tốn nhất). Một công thức đơn giản: **Ưu tiên = (Lãi + Rủi ro) / Chi phí**.

| ID | Mô tả | Loại | Lãi | Rủi ro | Chi phí | Ưu tiên | Người phụ trách |
|---|---|---|---|---|---|---|---|
| TD-06 | Không có runbook cho service thanh toán, chỉ một người biết xử lý sự cố | Tri thức | 2 | 4 | 1 | 6,0 | Chi |
| TD-03 | Test tích hợp dùng H2, lỗi SQL chỉ lộ ở staging | Test | 3 | 3 | 2 | 3,0 | Bình |
| TD-02 | OrderService là god class, mọi tính năng đơn hàng đều phải sửa, hay gây lỗi hồi quy | Code | 5 | 3 | 3 | 2,67 | An |
| TD-04 | Build CI 25 phút do chạy tuần tự | Build | 4 | 1 | 2 | 2,5 | Dũng |
| TD-01 | Spring Boot 2.7 đã hết hỗ trợ OSS, không còn bản vá bảo mật miễn phí | Nền tảng | 2 | 5 | 4 | 1,75 | Tech Lead |
| TD-05 | Module báo cáo cũ viết bằng JDBC thuần, hai năm nay gần như không ai sửa | Code | 1 | 1 | 3 | 0,67 | — |

Hai bài học từ bảng này:

- Công thức chỉ là điểm khởi đầu. TD-01 có điểm thấp vì chi phí lớn, nhưng rủi ro bảo mật cao và không giảm theo thời gian, nên cần được xử lý như một epic có mốc riêng, không chờ đến lượt theo điểm.
- TD-05 có thể **chấp nhận để đó**. Ghi rõ quyết định này, và xem lại khi có tính năng mới phải chạm vào module.

### Ước lượng bằng con số

Điểm 1–5 giúp so sánh nhanh, nhưng khi thuyết phục PO, con số cụ thể có sức nặng hơn. Ví dụ ước lượng lãi của TD-02: mỗi tính năng chạm vào OrderService mất thêm khoảng 2 ngày để hiểu code và test lại; trung bình mỗi sprint có 2 tính năng như vậy, tức khoảng 4 ngày công mỗi sprint. Nếu tách OrderService tốn khoảng 15 ngày công, khoản đầu tư hoà vốn sau khoảng 4 sprint. Đây là ước lượng của team, nên ghi rõ cách tính để mọi người cùng kiểm chứng.

## Thương lượng với PO

### Nói bằng ngôn ngữ kinh doanh

PO không phản đối việc trả nợ; họ phản đối việc bỏ thời gian vào thứ họ không hiểu giá trị. Hãy dịch:

| Cách nói kỹ thuật | Cách nói PO hiểu |
|---|---|
| "OrderService là god class, vi phạm SRP" | "Mỗi tính năng liên quan đơn hàng đang chậm thêm khoảng 2 ngày, và phần lớn lỗi hồi quy quý trước nằm ở đây" |
| "Spring Boot 2.7 hết hỗ trợ OSS" | "Nếu thư viện này có lỗ hổng mới, ta không có bản vá miễn phí; đây là rủi ro cho dữ liệu khách hàng" |
| "CI chạy tuần tự, chậm" | "Mỗi lần hotfix sự cố production, ta mất thêm 25 phút chờ build trước khi deploy được" |

### Các mô hình phân bổ thời gian

| Mô hình | Mô tả | Ưu | Nhược |
|---|---|---|---|
| Ngân sách cố định mỗi sprint | Dành một phần capacity cho nợ; một điểm khởi đầu hay được dùng là khoảng 10–20% | Đều đặn, dễ dự đoán | Cần kỷ luật để không bị "mượn" cho tính năng |
| Gắn vào tính năng | Trả nợ ở vùng code mà tính năng sắp chạm vào | Lợi ích thấy ngay | Nợ ở vùng ít chạm có thể không bao giờ được trả |
| Quy tắc hướng đạo sinh (boy scout rule) | Để code sạch hơn một chút mỗi lần chạm vào | Không cần xin thời gian riêng | Chỉ hợp với nợ nhỏ |
| Epic riêng trong roadmap | Nợ lớn (nâng cấp framework) thành epic có mốc | Minh bạch, có cam kết | Phải cạnh tranh ưu tiên với tính năng |
| Sprint dọn nợ | Dồn toàn bộ capacity trong một khoảng thời gian | Giải quyết nhanh việc lớn | Dễ bị huỷ; tạo thói quen "để dành nợ" |

Trong thực tế, nhiều team kết hợp: ngân sách cố định cho nợ vừa, boy scout rule cho nợ nhỏ, epic riêng cho nợ lớn.

### Đề xuất một trang cho PO

```text
ĐỀ XUẤT: Dành 15% capacity mỗi sprint trong quý tới cho nợ kỹ thuật

Vấn đề    : Lead time trung bình của tính năng đơn hàng tăng từ 6 lên 10 ngày
            trong 2 quý; 3 trong 5 sự cố gần nhất liên quan OrderService.
Đề xuất   : Mỗi sprint dành 15% capacity cho các mục ưu tiên cao trong tech
            debt register (TD-06, TD-03, TD-02). Riêng nâng cấp Spring Boot 3
            là epic riêng, đề xuất làm trong quý tới.
Kết quả kỳ vọng sau 1 quý:
            - Lead time tính năng đơn hàng giảm về dưới 8 ngày
            - CI dưới 12 phút
            - Có runbook và ít nhất 2 người xử lý được sự cố thanh toán
Đo bằng   : Lead time, thời gian build, số lỗi hồi quy; báo cáo cuối mỗi sprint.
Xem lại   : Sau 1 quý, nếu không thấy cải thiện, điều chỉnh tỉ lệ hoặc cách làm.
```

Điều quan trọng nhất là **báo cáo kết quả**: khi PO thấy lead time giảm, lần sau bạn không cần thuyết phục nhiều nữa.

## Lộ trình nâng cấp Java và Spring Boot

### Vì sao phải nâng cấp

Phiên bản cũ ngừng nhận bản vá bảo mật miễn phí, thư viện mới không còn hỗ trợ, và mỗi năm trì hoãn làm khoảng cách xa thêm. Spring Boot 3 yêu cầu tối thiểu Java 17 và chuyển từ namespace `javax.*` sang `jakarta.*`, nên đây là một bước nhảy lớn cần lập kế hoạch.

### Lộ trình theo bước

| Bước | Việc chính | Lưu ý |
|---|---|---|
| 0. Chuẩn bị | Có test đáng tin cậy cho luồng chính, CI ổn định; kiểm kê dependency; chạy `jdeps --jdk-internals` để tìm chỗ dùng API nội bộ của JDK | Không có test thì nâng cấp là đánh bạc |
| 1. Java 8 → 11 | Thêm lại các module Java EE bị gỡ khỏi JDK 11 (JAXB, JAX-WS...) dưới dạng dependency; cập nhật plugin Maven và các thư viện thao tác bytecode | Chỉ đổi nền tảng, chưa đổi framework |
| 2. Java 11 → 17 | Xử lý các chỗ truy cập nội bộ JDK bị chặn do strong encapsulation; cập nhật thư viện | Spring Boot 2.7 chạy được trên Java 17 |
| 3. Spring Boot lên 2.7 mới nhất | Sửa hết cảnh báo deprecation | Bước đệm theo hướng dẫn migration chính thức |
| 4. Spring Boot 2.7 → 3.x | `javax.*` sang `jakarta.*`, Spring Security 6, Hibernate 6, property đổi tên | Thêm tạm `spring-boot-properties-migrator` để phát hiện property đổi tên |
| 5. Java 17 → 21 | Cập nhật toolchain, base image | Bật tính năng mới (virtual threads...) trong PR riêng, sau khi đã ổn định |

Mỗi bước nên được deploy lên production và chạy ổn định trước khi sang bước tiếp theo. Nếu có nhiều service, bắt đầu bằng service ít rủi ro nhất để rút kinh nghiệm, rồi viết lại thành hướng dẫn cho các service khác.

### Tự động hoá với OpenRewrite

OpenRewrite là công cụ refactor tự động dựa trên **recipe**. Nó phân tích code thành cây cú pháp có đầy đủ thông tin kiểu dữ liệu, nên có thể thay đổi chính xác: đổi import, đổi API đã bị xoá, cập nhật version trong `pom.xml`, đổi tên property trong `application.yml`. Có recipe cho nâng cấp Java (ví dụ `org.openrewrite.java.migrate.UpgradeToJava17`, `org.openrewrite.java.migrate.UpgradeToJava21`) và cho Spring Boot (ví dụ `org.openrewrite.java.spring.boot3.UpgradeSpringBoot_3_0`, một recipe tổng hợp gồm nhiều recipe con như chuyển `javax` sang `jakarta`).

Chạy trực tiếp không cần sửa `pom.xml`:

```bash
# Xem trước: sinh file target/rewrite/rewrite.patch, chưa sửa code
mvn -U org.openrewrite.maven:rewrite-maven-plugin:dryRun \
  -Drewrite.recipeArtifactCoordinates=org.openrewrite.recipe:rewrite-spring:RELEASE \
  -Drewrite.activeRecipes=org.openrewrite.java.spring.boot3.UpgradeSpringBoot_3_0

# Áp dụng thay đổi vào source code
mvn -U org.openrewrite.maven:rewrite-maven-plugin:run \
  -Drewrite.recipeArtifactCoordinates=org.openrewrite.recipe:rewrite-spring:RELEASE \
  -Drewrite.activeRecipes=org.openrewrite.java.spring.boot3.UpgradeSpringBoot_3_0
```

Hoặc khai báo trong `pom.xml` để cả team dùng chung cấu hình:

```xml
<plugin>
  <groupId>org.openrewrite.maven</groupId>
  <artifactId>rewrite-maven-plugin</artifactId>
  <version><!-- dùng phiên bản mới nhất --></version>
  <configuration>
    <activeRecipes>
      <recipe>org.openrewrite.java.spring.boot3.UpgradeSpringBoot_3_0</recipe>
    </activeRecipes>
  </configuration>
  <dependencies>
    <dependency>
      <groupId>org.openrewrite.recipe</groupId>
      <artifactId>rewrite-spring</artifactId>
      <version><!-- dùng phiên bản mới nhất --></version>
    </dependency>
  </dependencies>
</plugin>
```

Sau đó chạy `mvn rewrite:dryRun` hoặc `mvn rewrite:run`; lệnh `mvn rewrite:discover` liệt kê các recipe có sẵn, bao gồm recipe cho các bản Spring Boot 3.x mới hơn.

### Những gì OpenRewrite không làm thay bạn

- Thay đổi **hành vi** khi chạy: Hibernate 6 thay đổi một số cách sinh và diễn giải truy vấn, Spring Security 6 thay đổi một số mặc định. Chỉ test mới bắt được.
- Thư viện bên thứ ba chưa hỗ trợ `jakarta.*` cần được thay hoặc nâng cấp thủ công.
- Code dùng reflection, cấu hình XML cũ hoặc API nội bộ có thể không được nhận diện.

### Chiến lược Pull Request

1. PR 1: chỉ thay đổi build (phiên bản Java, plugin), không đổi logic.
2. PR 2: toàn bộ thay đổi do OpenRewrite sinh ra, ghi rõ recipe đã chạy. Reviewer kiểm tra theo mẫu thay vì đọc từng dòng.
3. PR 3 trở đi: các sửa đổi thủ công, mỗi PR một chủ đề (Security, Hibernate, property).
4. Deploy theo kiểu canary hoặc trên một nhóm instance nhỏ trước, theo dõi lỗi và độ trễ, sẵn sàng rollback.

## Lỗi thường gặp

- **Gọi mọi thứ là nợ kỹ thuật.** "Code không theo sở thích của tôi" không phải nợ. Cách sửa: mỗi khoản nợ phải chỉ ra được lãi hoặc rủi ro cụ thể.
- **Register nằm trong ngăn kéo.** Danh sách nợ chỉ developer biết, PO không bao giờ thấy. Cách sửa: đưa vào cùng backlog, xem lại trong buổi planning.
- **Chỉ xin "sprint refactor".** Đề xuất mơ hồ, không có kết quả đo được, thường bị từ chối hoặc bị huỷ giữa chừng. Cách sửa: đề xuất cụ thể khoản nợ nào, kết quả kỳ vọng và cách đo.
- **Trả nợ ở chỗ không có lãi.** Viết lại module ổn định ít thay đổi trong khi hotspot vẫn đốt thời gian. Cách sửa: ưu tiên theo lãi và rủi ro, dùng phân tích hotspot.
- **Nâng cấp big bang.** Nhảy thẳng Java 8 và Spring Boot 2.x lên bản mới nhất trong một PR khổng lồ. Cách sửa: lộ trình từng bước, mỗi bước deploy ổn định rồi mới đi tiếp.
- **Tin hoàn toàn vào công cụ tự động.** Chạy OpenRewrite rồi merge luôn. Cách sửa: dryRun, review patch, chạy đầy đủ test, deploy từ từ.

## Bài tập thực hành

1. **Lập register.** Kết hợp phân tích hotspot (lệnh `git log` ở trên), báo cáo SonarQube và một buổi hỏi team "phần nào bạn sợ chạm vào nhất". Lập tech debt register ít nhất 8 mục, chấm Lãi, Rủi ro, Chi phí, phân loại theo Technical Debt Quadrant và đánh dấu mục nào chấp nhận để đó.
2. **Đề xuất cho PO.** Chọn 3 mục ưu tiên cao nhất, ước lượng lãi bằng con số cụ thể (ngày công, số lỗi, thời gian chờ) và viết đề xuất một trang theo template. Trình bày với PO và ghi lại phản hồi.
3. **Thử nâng cấp với OpenRewrite.** Trên một nhánh riêng của một service Spring Boot 2.7 (hoặc một dự án mẫu), chạy `rewrite:dryRun` với recipe UpgradeSpringBoot_3_0, đọc patch sinh ra, áp dụng, chạy test và ghi lại danh sách những gì còn phải sửa tay. Biến danh sách này thành hướng dẫn nâng cấp cho các service khác của team.

## Tóm tắt

- Nợ kỹ thuật có gốc và lãi; code xấu mà không ai chạm vào thì gần như không có lãi.
- Technical Debt Quadrant giúp hiểu nguồn gốc nợ và chọn cách xử lý: ghi lại, sửa quy trình, đào tạo hay refactor dần.
- Tech debt register đặt cạnh backlog, chấm Lãi, Rủi ro, Chi phí; công thức chỉ là điểm khởi đầu, rủi ro bảo mật cần được xử lý riêng.
- Thương lượng với PO bằng ngôn ngữ kinh doanh, đề xuất cụ thể có cách đo, và báo cáo kết quả để xây niềm tin.
- Nâng cấp Java và Spring Boot theo từng bước: chuẩn bị test, Java 17, Spring Boot 2.7 mới nhất, rồi Spring Boot 3, sau đó Java 21.
- OpenRewrite tự động hoá phần lớn thay đổi cơ học; luôn dryRun, tách PR và dựa vào test cho thay đổi hành vi.
