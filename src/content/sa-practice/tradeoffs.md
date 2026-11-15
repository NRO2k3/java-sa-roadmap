Trong kiến trúc không có giải pháp "tốt nhất", chỉ có giải pháp phù hợp nhất với bối cảnh, và mọi lựa chọn đều phải trả giá ở đâu đó: tăng độ sẵn sàng thì tăng chi phí, tăng tính linh hoạt thì tăng độ phức tạp. Giá trị của SA nằm ở chỗ làm cho các đánh đổi (trade-off) đó hiện rõ, đo được và được người có thẩm quyền chấp nhận một cách có ý thức. Bài này trang bị các công cụ để ra quyết định có hệ thống: ATAM, ma trận quyết định, build vs buy, PoC, ước tính TCO, FinOps và chiến lược migration hệ thống legacy.

## Mục tiêu bài học

- Phân tích trade-off theo tinh thần ATAM: utility tree, kịch bản chất lượng, sensitivity point, trade-off point và rủi ro.
- Xây dựng ma trận quyết định có trọng số và kiểm tra độ nhạy của kết luận.
- Đánh giá build vs buy, tổ chức lựa chọn vendor và thiết kế PoC có tiêu chí thành công rõ ràng.
- Ước tính tổng chi phí sở hữu (TCO) và áp dụng các thực hành FinOps cơ bản cho hệ thống Java trên cloud.
- Lập kế hoạch migration hệ thống legacy theo Strangler Fig với lộ trình có khả năng quay lui.

## ATAM: phân tích trade-off có hệ thống

ATAM (Architecture Tradeoff Analysis Method) là phương pháp đánh giá kiến trúc do Software Engineering Institute (SEI) thuộc Carnegie Mellon University phát triển. Mục tiêu của ATAM không phải là chấm điểm kiến trúc, mà là tìm ra kiến trúc hiện tại đáp ứng các mục tiêu chất lượng tới đâu, và các quyết định kiến trúc đang đánh đổi những gì.

### Các khái niệm đầu ra

- **Risk (rủi ro)**: quyết định kiến trúc có thể dẫn đến không đạt một thuộc tính chất lượng. Ví dụ: PaymentClient không có timeout.
- **Non-risk**: quyết định đã được phân tích và được xem là an toàn. Ví dụ: read replica PostgreSQL đủ cho tải tra cứu đơn dự kiến.
- **Sensitivity point (điểm nhạy cảm)**: một tham số hay đặc tính của kiến trúc mà một thuộc tính chất lượng phụ thuộc mạnh vào nó. Ví dụ: kích thước connection pool và timeout khi gọi cổng thanh toán quyết định độ sẵn sàng của Order API.
- **Trade-off point (điểm đánh đổi)**: một sensitivity point ảnh hưởng đến **nhiều** thuộc tính theo hướng ngược nhau. Ví dụ: tăng số lần retry làm tăng tỉ lệ thanh toán thành công nhưng làm tăng độ trễ và tải lên cổng thanh toán.
- **Risk theme**: nhóm các rủi ro có chung nguyên nhân gốc, ví dụ "thiếu cơ chế cô lập lỗi khi gọi hệ thống bên ngoài". Risk theme là thứ nên báo cáo lên ban lãnh đạo.

### Các bước chính

ATAM đầy đủ gồm 9 bước, chia làm hai giai đoạn đánh giá. Giai đoạn 1 làm với nhóm ra quyết định và kiến trúc sư; giai đoạn 2 mở rộng ra nhóm stakeholder lớn hơn:

1. Giới thiệu phương pháp ATAM.
2. Trình bày các động lực kinh doanh (business drivers).
3. Trình bày kiến trúc.
4. Xác định các cách tiếp cận kiến trúc đã dùng (architectural approaches).
5. Xây dựng utility tree cho các thuộc tính chất lượng.
6. Phân tích các cách tiếp cận kiến trúc dựa trên các kịch bản ưu tiên cao.
7. Brainstorm và ưu tiên hoá kịch bản với nhóm stakeholder rộng.
8. Phân tích lại các cách tiếp cận kiến trúc với kịch bản mới.
9. Trình bày kết quả: rủi ro, non-risk, sensitivity point, trade-off point, risk theme.

### Utility tree

Utility tree phân rã "chất lượng" thành thuộc tính, rồi thành các kịch bản cụ thể. Mỗi kịch bản được gắn hai nhãn: mức quan trọng với business và độ khó hiện thực (H/M/L). Các kịch bản (H,H) là trọng tâm phân tích.

```text
Utility
 +-- Hiệu năng
 |    +-- Độ trễ đặt hàng
 |          (H,M) Flash sale 3.000 đơn/phút, p95 đặt hàng < 800 ms
 +-- Độ sẵn sàng
 |    +-- Lỗi từ hệ thống phụ thuộc
 |          (H,H) Cổng thanh toán phản hồi chậm 30 giây, Order API vẫn
 |                nhận đơn và không cạn connection pool
 +-- Khả năng thay đổi
 |    +-- Thêm kênh bán mới
 |          (M,M) Thêm kênh bán qua đối tác trong 1 sprint, không sửa lõi Order
 +-- Bảo mật
      +-- Dữ liệu cá nhân
            (H,M) Truy cập trái phép vào hồ sơ khách hàng bị chặn và ghi audit log

(mức quan trọng với business, độ khó hiện thực) – H: cao, M: trung bình, L: thấp
```

### Phiên bản gọn cho dự án thực tế

ATAM đầy đủ tốn nhiều ngày công của nhiều người. Với một dự án vừa, một buổi workshop "mini-ATAM" 3–4 giờ thường đủ mang lại phần lớn giá trị: 15 phút business drivers, 30 phút trình bày kiến trúc, 45 phút xây utility tree, 90 phút phân tích 4–6 kịch bản ưu tiên cao nhất, 30 phút tổng hợp rủi ro và trade-off. Đầu ra được ghi vào mục rủi ro của tài liệu kiến trúc và thành các ADR.

## Ma trận quyết định có trọng số

Khi phải chọn giữa nhiều phương án, ma trận quyết định có trọng số (weighted decision matrix) giúp cuộc thảo luận chuyển từ "tôi thích" sang "theo tiêu chí đã thống nhất".

### Cách làm

1. Thống nhất **tiêu chí** dựa trên NFR và ràng buộc, không dựa trên đặc điểm của phương án mình thích.
2. Gán **trọng số** cho từng tiêu chí (tổng 100%) cùng stakeholder, **trước khi** chấm điểm.
3. Chấm điểm từng phương án theo thang 1–5, ghi lý do cho mỗi điểm.
4. Tính tổng có trọng số.
5. **Phân tích độ nhạy**: thay đổi trọng số trong biên độ hợp lý xem kết luận có đổi không.

### Ví dụ: chọn message broker cho MiniMart

Bối cảnh: cần phát sự kiện đơn hàng, giữ lại sự kiện vài ngày để consumer xử lý lại khi lỗi, team giỏi Spring Boot, từng dùng RabbitMQ, chưa vận hành Kafka.

| Tiêu chí | Trọng số | Kafka tự vận hành | Kafka managed | RabbitMQ |
|---|---|---|---|---|
| Đáp ứng yêu cầu (thông lượng, lưu và đọc lại sự kiện) | 30% | 5 | 5 | 3 |
| Phù hợp kỹ năng hiện có của team | 20% | 2 | 3 | 4 |
| Công sức vận hành (5 = ít nhất) | 20% | 2 | 4 | 3 |
| Chi phí hạ tầng (5 = rẻ nhất) | 15% | 3 | 2 | 4 |
| Mức độ ít phụ thuộc vendor | 15% | 5 | 4 | 5 |
| **Tổng có trọng số** | | **3,50** | **3,80** | **3,65** |

Kafka managed dẫn đầu, nhưng khoảng cách nhỏ. Thử phân tích độ nhạy: nếu CFO cho rằng chi phí quan trọng hơn, giảm trọng số "Đáp ứng yêu cầu" xuống 20% và tăng "Chi phí hạ tầng" lên 25%, tổng sẽ thành 3,30 / 3,50 / 3,75, và RabbitMQ vượt lên. Kết luận phụ thuộc vào trọng số, nên đây chính là câu hỏi cần đưa ra cho stakeholder: "Khả năng lưu và đọc lại sự kiện quan trọng đến mức nào so với chi phí?"

> **Lưu ý:** Ma trận hỗ trợ phán đoán chứ không thay thế phán đoán. Nếu kết quả ngược hẳn với trực giác của những người giàu kinh nghiệm, hãy kiểm tra lại tiêu chí: có thể còn một yếu tố quan trọng chưa được đưa vào.

## Build vs buy và lựa chọn vendor

### Khung quyết định

Câu hỏi gốc: năng lực này có phải **điểm khác biệt cạnh tranh** của doanh nghiệp không? Cách phân loại subdomain trong DDD rất hữu ích ở đây:

| Loại năng lực | Ví dụ ở MiniMart | Xu hướng |
|---|---|---|
| Core (lõi, tạo khác biệt) | Thuật toán phân bổ đơn cho cửa hàng để giao trong 2 giờ | Tự xây, đầu tư người giỏi nhất |
| Supporting (hỗ trợ, đặc thù doanh nghiệp) | Quy trình soạn hàng tại cửa hàng | Tự xây đơn giản, hoặc mua rồi tuỳ biến |
| Generic (phổ biến, mọi công ty giống nhau) | Gửi email/SMS, xác thực người dùng, kế toán | Mua hoặc dùng SaaS, dịch vụ có sẵn |

Ngoài ra cần cân nhắc: thời gian ra mắt, mức độ tuỳ biến cần có, năng lực đội ngũ, yêu cầu về vị trí lưu dữ liệu, chi phí trọn vòng đời và chi phí rời bỏ (exit cost) nếu vendor tăng giá hoặc ngừng sản phẩm.

### Quy trình lựa chọn vendor

```text
1. Long list     : 6–10 ứng viên từ khảo sát thị trường, giới thiệu
2. RFI           : Gửi bộ câu hỏi thông tin chung, loại bớt ứng viên không phù hợp
3. Short list    : 2–4 ứng viên
4. RFP & demo    : Kịch bản demo dựa trên use case thật của mình, không theo kịch bản vendor
5. PoC           : Tích hợp thử với hệ thống thật (vd. gọi API từ service Spring Boot)
6. Reference     : Nói chuyện với khách hàng hiện tại của vendor
7. Đàm phán      : SLA, giá theo quy mô, quyền sở hữu và xuất dữ liệu, điều khoản chấm dứt
```

Tiêu chí kỹ thuật SA nên kiểm tra kỹ: chất lượng API và tài liệu, cơ chế xác thực, giới hạn tần suất gọi (rate limit), webhook hoặc sự kiện, khả năng xuất dữ liệu, môi trường sandbox, chứng nhận bảo mật và nơi đặt dữ liệu.

## PoC để giảm rủi ro kỹ thuật

PoC (proof of concept) là thử nghiệm có giới hạn nhằm trả lời một câu hỏi rủi ro cụ thể **trước** khi cam kết lớn. Cần phân biệt với các hình thức gần giống:

| Hình thức | Mục đích | Số phận code |
|---|---|---|
| Spike | Trả lời nhanh một câu hỏi kỹ thuật hẹp | Thường bỏ |
| PoC | Chứng minh một hướng tiếp cận khả thi theo tiêu chí đo được | Thường bỏ |
| Prototype | Thử luồng người dùng, giao diện để lấy feedback | Thường bỏ |
| MVP | Sản phẩm tối thiểu cho người dùng thật | Giữ và phát triển tiếp |

### PoC charter

```text
POC CHARTER: Đồng bộ tồn kho từ ERP qua CDC

Giả thuyết          : Debezium (Oracle connector) đọc được thay đổi tồn kho từ DB
                      của ERP và đẩy vào Kafka với độ trễ chấp nhận được, không
                      làm DB ERP quá tải.
Vì sao quan trọng   : Toàn bộ cam kết "không bán vượt tồn kho" phụ thuộc vào đây.
Tiêu chí thành công : - p95 độ trễ từ lúc commit trong ERP đến lúc có message < 5 giây
                        ở 200 thay đổi/giây
                      - CPU của DB ERP tăng không quá 10% so với nền
                      - Restart connector không làm mất thay đổi
Phạm vi             : 1 bảng tồn kho, 1 connector, 1 consumer Spring Boot ghi log
Ngoài phạm vi       : HA cho Kafka Connect, bảo mật đầy đủ, giao diện
Time-box            : 2 tuần, 1 developer + 1 DBA hỗ trợ (bật supplemental logging)
Môi trường          : Bản sao DB ERP trên môi trường test, dữ liệu gần thật
Kết quả             : Đạt / Không đạt / Đạt có điều kiện + số liệu + khuyến nghị
```

Ba nguyên tắc: đặt tiêu chí thành công **trước** khi làm để tránh "diễn giải theo ý mình"; giới hạn thời gian chặt; và cắt bỏ mọi thứ không phục vụ câu hỏi chính. Kết quả "không đạt" cũng là kết quả tốt, vì nó giúp tránh một cam kết sai.

## Ước tính chi phí giải pháp: TCO và FinOps

### TCO

TCO (Total Cost of Ownership, tổng chi phí sở hữu) là toàn bộ chi phí trong vòng đời giải pháp, không chỉ chi phí ban đầu:

| Nhóm chi phí | Ví dụ |
|---|---|
| Ban đầu | Phát triển, license, triển khai, migration dữ liệu, đào tạo |
| Hạ tầng định kỳ | Compute, storage, băng thông, backup, môi trường dev/staging |
| Vận hành | Nhân sự on-call, giám sát, vá lỗi bảo mật, nâng cấp phiên bản |
| License & thuê bao | SaaS tính theo người dùng hoặc giao dịch, gói hỗ trợ của vendor |
| Dễ bị quên | Chi phí rời bỏ, kiểm thử bảo mật, tuân thủ, chi phí cơ hội của đội ngũ |

Ví dụ so sánh 3 năm cho hệ thống tích điểm của MiniMart (đơn vị: tỷ đồng, **số liệu giả định để minh hoạ cách tính**):

| Hạng mục (3 năm) | Tự xây trên Spring Boot | Thuê SaaS loyalty |
|---|---|---|
| Ban đầu | 1,8 (4 dev trong 6 tháng) | 0,6 (tích hợp, cấu hình, phí triển khai) |
| Hạ tầng cloud | 0,72 (0,24/năm) | 0 (đã gồm trong phí thuê) |
| Phí thuê bao | 0 | 2,1 (0,7/năm) |
| Bảo trì, vận hành | 1,8 (0,6/năm) | 0,6 (0,2/năm) |
| Dự phòng chi phí rời bỏ | 0 | 0,3 |
| **Tổng** | **4,32** | **3,6** |

SaaS rẻ hơn trong kịch bản này, nhưng SA phải trình bày cả các giả định: phí thuê bao tăng theo số thành viên, nên nếu số thành viên tăng gấp đôi thì kết luận có thể đảo ngược; và nếu chương trình tích điểm trở thành điểm khác biệt cạnh tranh, giá trị chiến lược của việc tự xây cần được tính đến. TCO là một đầu vào quan trọng chứ không phải câu trả lời duy nhất.

### FinOps

FinOps là khung thực hành quản lý tài chính cho cloud, giúp kỹ thuật, tài chính và business cùng chịu trách nhiệm về chi phí và ra quyết định dựa trên giá trị kinh doanh. FinOps Foundation mô tả vòng đời gồm ba giai đoạn lặp lại: **Inform** (thấy rõ và phân bổ chi phí), **Optimize** (tối ưu mức dùng và giá) và **Operate** (vận hành liên tục, gắn với quy trình và mục tiêu).

Các thực hành cụ thể cho hệ thống Java trên cloud:

- **Gắn tag/label** mọi tài nguyên theo team, service, môi trường để biết ai tiêu bao nhiêu (showback hoặc chargeback).
- **Rightsizing**: đặt CPU/memory request và limit dựa trên số liệu thực tế. Với JVM trong container, cấu hình heap theo tỉ lệ bộ nhớ container (ví dụ `-XX:MaxRAMPercentage`) thay vì để mặc định hoặc đặt cứng quá lớn.
- **Tắt môi trường dev/staging ngoài giờ** làm việc nếu không cần chạy liên tục.
- **Cam kết sử dụng** (như Reserved Instances hoặc Savings Plans trên AWS) cho tải ổn định; dùng spot instance cho job batch hoặc CI có thể chạy lại.
- **Autoscaling** theo tải thực, lưu ý thời gian khởi động và warm-up của JVM ảnh hưởng đến tốc độ scale-out.
- **Unit economics**: theo dõi chi phí trên một đơn vị kinh doanh, ví dụ chi phí cloud trên mỗi đơn hàng. Tổng chi phí tăng chưa chắc xấu nếu chi phí mỗi đơn giảm.

## Migration hệ thống legacy với Strangler Fig

Strangler Fig là pattern được Martin Fowler đặt tên theo loài cây strangler fig mọc bao quanh cây chủ và dần thay thế nó. Thay vì viết lại toàn bộ rồi chuyển đổi một lần (big bang), ta đặt một lớp chặn phía trước hệ cũ và chuyển dần từng phần chức năng sang hệ mới.

### Các bước

1. **Xác định các lát cắt** có thể tách theo capability hoặc bounded context; ưu tiên phần có giá trị cao, rủi ro vừa phải và ít phụ thuộc.
2. **Đặt facade** (API gateway hoặc reverse proxy) trước hệ legacy, ban đầu chuyển 100% request về hệ cũ, kèm giám sát để có số liệu nền.
3. **Xây chức năng mới** ở service mới, dùng anti-corruption layer (lớp chuyển đổi mô hình) để mô hình dữ liệu cũ không "lây" sang hệ mới.
4. **Chuyển dần traffic** theo endpoint, theo nhóm người dùng hoặc theo cửa hàng thí điểm, luôn có cách quay lui.
5. **Đồng bộ dữ liệu** trong giai đoạn hai hệ cùng chạy.
6. **Gỡ bỏ** phần code legacy đã được thay thế, rồi lặp lại với lát cắt tiếp theo.

Ví dụ facade với Spring Cloud Gateway (Java DSL), route cụ thể khai báo trước route bắt tất cả:

```java
@Configuration
public class StranglerRoutes {

    @Bean
    public RouteLocator routes(RouteLocatorBuilder builder) {
        return builder.routes()
                // Chức năng đã chuyển sang service mới
                .route("order-query-new", r -> r
                        .path("/api/orders/**")
                        .and().method(HttpMethod.GET)
                        .uri("http://order-service:8080"))
                // Mọi request còn lại vẫn đi vào monolith cũ
                .route("legacy", r -> r
                        .path("/**")
                        .uri("http://legacy-monolith:8080"))
                .build();
    }
}
```

Quay lui chỉ là xoá hoặc tắt route mới. Spring Cloud Gateway còn có predicate theo trọng số (`Weight`) để chuyển một phần trăm traffic sang hệ mới theo kiểu canary.

### Bài toán dữ liệu

Dữ liệu thường là phần khó nhất của migration:

| Cách tiếp cận | Mô tả | Ưu | Nhược |
|---|---|---|---|
| Tạm dùng chung DB legacy | Service mới đọc/ghi trực tiếp DB cũ | Nhanh, ít hạ tầng | Ràng buộc chặt vào schema cũ, khó tách về sau |
| CDC từ DB legacy | Công cụ như Debezium đẩy thay đổi sang service mới | Không phải sửa code legacy | Thêm hạ tầng, dữ liệu nhất quán sau (eventual consistency) |
| Hệ mới làm nguồn sự thật, đồng bộ ngược | Hệ legacy nhận dữ liệu từ hệ mới | Hướng thẳng tới trạng thái đích | Phức tạp, phải xử lý xung đột và lỗi đồng bộ |

### Lộ trình mẫu

| Giai đoạn | Phạm vi | Tiêu chí hoàn thành | Quay lui |
|---|---|---|---|
| 0 | Gateway trước monolith, toàn bộ route về legacy, thêm giám sát | Hành vi không đổi, độ trễ tăng không đáng kể | Bỏ gateway, trỏ DNS lại |
| 1 | Tra cứu đơn hàng (chỉ đọc) qua service mới, dữ liệu qua CDC | Kết quả khớp legacy trên mẫu đối chiếu | Đổi route về legacy |
| 2 | Tạo đơn mới cho vài cửa hàng thí điểm | Tỉ lệ lỗi không cao hơn legacy trong 2 tuần | Tắt feature flag |
| 3 | Mở rộng cho toàn bộ cửa hàng | Số liệu ổn định qua một đợt cao điểm | Giảm trọng số route |
| 4 | Gỡ module đơn hàng khỏi monolith | Không còn traffic vào module cũ trong 30 ngày | Không còn cần |

Strangler Fig không phải lúc nào cũng phù hợp: nếu hệ legacy nhỏ và đơn giản, viết lại có thể rẻ hơn; nếu không thể chặn được lời gọi (ví dụ các hệ thống tích hợp với nhau qua file batch hoặc đọc chung database), cần kết hợp thêm kỹ thuật khác trước khi áp dụng.

## Lỗi thường gặp

- **Quyết định trước, phân tích sau.** Ma trận được lập để hợp thức hoá lựa chọn có sẵn, trọng số chỉnh cho khớp. Cách sửa: chốt tiêu chí và trọng số với stakeholder trước khi chấm điểm, công khai cách chấm.
- **Chỉ trình bày ưu điểm.** Đề xuất không nêu nhược điểm làm mất niềm tin khi rủi ro xảy ra. Cách sửa: mỗi phương án đều có phần "chúng ta chấp nhận đánh đổi gì".
- **PoC không có tiêu chí.** PoC kéo dài vô hạn và kết thúc bằng "có vẻ ổn". Cách sửa: dùng PoC charter, time-box và tiêu chí định lượng đặt từ trước.
- **PoC thành production.** Code PoC không có test, không có xử lý lỗi bị đưa thẳng lên chạy thật. Cách sửa: nói rõ từ đầu code PoC sẽ bị bỏ; nếu muốn giữ, đó là MVP và cần chuẩn chất lượng khác.
- **TCO chỉ có chi phí ban đầu.** Quên chi phí vận hành, nâng cấp, nhân sự on-call và chi phí rời bỏ. Cách sửa: tính trên toàn vòng đời và ghi rõ giả định.
- **Big bang rewrite.** Viết lại toàn bộ trong nhiều tháng trong khi hệ cũ vẫn thay đổi, đến ngày chuyển đổi thì hai bên đã lệch nhau. Cách sửa: Strangler Fig với từng lát cắt nhỏ, giao giá trị sớm và có đường quay lui.

## Bài tập thực hành

1. **Ma trận quyết định.** Chọn một quyết định thật (ví dụ chọn cơ sở dữ liệu cho service mới hoặc chọn giữa REST và messaging). Cùng ít nhất một stakeholder chốt 4–6 tiêu chí và trọng số, chấm điểm 3 phương án, rồi thử thay đổi trọng số ±10% để xem kết luận có đổi không. Ghi kết quả thành một ADR.
2. **PoC charter và TCO.** Với một rủi ro kỹ thuật lớn nhất của dự án hiện tại, viết PoC charter đầy đủ. Sau đó lập bảng TCO 3 năm cho hai phương án (ví dụ tự vận hành và dùng managed service), nêu rõ mọi giả định và chỉ ra giả định nào làm đảo ngược kết luận.
3. **Lộ trình Strangler Fig.** Với một monolith bạn biết, chọn 3 lát cắt đầu tiên, lý giải thứ tự, chọn chiến lược dữ liệu cho từng lát và viết bảng lộ trình có tiêu chí hoàn thành và phương án quay lui cho mỗi giai đoạn.

## Tóm tắt

- Mọi quyết định kiến trúc đều có đánh đổi; nhiệm vụ của SA là làm nó hiện rõ và được chấp nhận có ý thức.
- ATAM dùng utility tree và kịch bản chất lượng để tìm rủi ro, sensitivity point và trade-off point; bản gọn một buổi vẫn rất có giá trị.
- Ma trận quyết định chỉ khách quan khi tiêu chí và trọng số được chốt trước; luôn kiểm tra độ nhạy.
- Build vs buy bắt đầu từ câu hỏi "đây có phải điểm khác biệt cạnh tranh không"; chọn vendor bằng kịch bản và PoC của chính mình.
- PoC cần giả thuyết, tiêu chí đo được và time-box; kết quả "không đạt" cũng có giá trị.
- TCO tính trên toàn vòng đời với giả định rõ ràng; FinOps biến chi phí cloud thành trách nhiệm chung qua Inform, Optimize, Operate.
- Strangler Fig thay thế legacy từng phần qua một facade, với chiến lược dữ liệu và đường quay lui cho từng bước.
