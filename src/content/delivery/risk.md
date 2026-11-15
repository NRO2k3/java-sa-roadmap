Phần lớn các dự án trễ hạn không phải vì team code chậm. Chúng trễ vì những thứ "ai cũng biết là có thể xảy ra" nhưng không ai theo dõi: sandbox của đối tác không ổn định, team khác chưa kịp làm API, người duy nhất hiểu module đối soát xin nghỉ, hoặc phạm vi cứ phình dần qua từng cuộc họp. Dev Lead giỏi không phải là người chưa bao giờ gặp rủi ro, mà là người phát hiện rủi ro sớm, có kế hoạch ứng phó, và biết thương lượng phạm vi khi cần mà không hy sinh chất lượng.

## Mục tiêu bài học

- Phân biệt rủi ro (risk) và vấn đề (issue); viết, đánh giá và theo dõi rủi ro bằng risk register.
- Chọn chiến lược ứng phó phù hợp cho từng rủi ro và gán người phụ trách cụ thể.
- Quản lý phụ thuộc với các team khác và với bên thứ ba bằng hợp đồng giao tiếp, mock và lịch theo dõi.
- Thương lượng phạm vi bằng MVP và MoSCoW, đưa ra phương án cắt giảm hợp lý thay vì cắt chất lượng.

## Rủi ro và risk register

### Rủi ro khác vấn đề thế nào

- **Rủi ro (risk):** một sự kiện *chưa xảy ra* và *không chắc chắn*, nếu xảy ra sẽ ảnh hưởng đến mục tiêu (thời gian, phạm vi, chất lượng, chi phí). Ví dụ: "API của ngân hàng đối tác có thể thay đổi định dạng trước ngày go-live."
- **Vấn đề (issue):** điều *đã xảy ra*, cần xử lý ngay. Ví dụ: "Sandbox của ngân hàng đã sập 3 ngày nay."

Quản lý rủi ro tốt giúp nhiều rủi ro không bao giờ trở thành vấn đề.

### Viết rủi ro cho rõ

Một câu rủi ro tốt nêu được **nguyên nhân, sự kiện và tác động**:

> Do **[nguyên nhân]**, có thể **[sự kiện]**, dẫn đến **[tác động]**.

- Mơ hồ: "Rủi ro về tích hợp."
- Rõ ràng: "Do ví B chưa cung cấp môi trường sandbox, có thể team không test được luồng callback trước Sprint 4, dẫn đến trễ go-live 2–3 tuần."

### Đánh giá: xác suất × tác động

Chấm **xác suất (P)** và **tác động (I)** theo thang 1–5, rồi nhân lên để ra điểm rủi ro (1–25). Team tự quy ước ngưỡng, ví dụ: từ 15 trở lên là đỏ, phải có kế hoạch và báo cáo stakeholder; 8–14 là vàng, theo dõi hằng tuần; dưới 8 là xanh, xem lại mỗi sprint.

| Mức | Xác suất | Tác động |
|---|---|---|
| 1 | Rất khó xảy ra | Không đáng kể |
| 3 | Có thể xảy ra | Trễ vài ngày, hoặc phải bỏ một tính năng phụ |
| 5 | Gần như chắc chắn | Trễ go-live, vi phạm hợp đồng hoặc quy định, mất dữ liệu |

### Chiến lược ứng phó

| Chiến lược | Ý nghĩa | Ví dụ |
|---|---|---|
| **Tránh (avoid)** | Thay đổi kế hoạch để loại bỏ rủi ro | Bỏ yêu cầu dùng công nghệ mới chưa ai biết trong release này |
| **Giảm thiểu (mitigate)** | Giảm xác suất hoặc giảm tác động | Làm spike sớm; viết mock server; pair để chia sẻ kiến thức |
| **Chuyển giao (transfer)** | Chuyển trách nhiệm sang bên khác | Ghi rõ SLA và trách nhiệm của đối tác trong hợp đồng |
| **Chấp nhận (accept)** | Ghi nhận và chuẩn bị phương án dự phòng | Rủi ro nhỏ: chấp nhận, chuẩn bị sẵn kế hoạch B |
| **Escalate** | Rủi ro vượt thẩm quyền của team | Báo cho manager hoặc PM khi cần quyết định về ngân sách hay hợp đồng |

Mỗi rủi ro cần có **một người phụ trách (owner)**, tức là người theo dõi và hành động, không nhất thiết là lead. Rủi ro cũng nên có **tín hiệu cảnh báo (trigger)**, cho biết khi nào rủi ro sắp xảy ra.

```text
RISK REGISTER — Dự án Thanh toán ví điện tử — cập nhật 12/7

| ID | Rủi ro (nguyên nhân → sự kiện → tác động)                         | P | I | Điểm | Chiến lược | Hành động                                        | Owner | Trigger                       | Trạng thái |
|----|-------------------------------------------------------------------|---|---|------|------------|--------------------------------------------------|-------|-------------------------------|------------|
| R1 | Ví B chưa có sandbox → không test được callback trước S4 → trễ go-live | 4 | 5 | 20   | Giảm thiểu | WireMock giả lập callback; PM gửi yêu cầu chính thức | Minh  | Chưa có sandbox ngày 20/7      | Mở         |
| R2 | Chỉ Long hiểu đối soát → Long nghỉ phép 8/8 → không ai sửa lỗi đối soát | 3 | 4 | 12   | Giảm thiểu | Long pair với Hà; viết runbook đối soát          | Long  | Runbook chưa xong ngày 1/8     | Mở         |
| R3 | Chưa test tải → p95 vượt 3s khi khuyến mãi → mất giao dịch          | 3 | 4 | 12   | Giảm thiểu | Test tải bằng Gatling ở Sprint 3                 | Hà    | p95 staging > 2s              | Mở         |
| R4 | Team Core chậm API tra cứu tài khoản → phải chờ ở S3               | 2 | 3 | 6    | Chấp nhận  | Dùng contract đã thống nhất, mock trước         | Lead  | API chưa lên staging ngày 25/7 | Theo dõi   |
```

### Vòng đời quản lý rủi ro

1. **Nhận diện:** ngay từ khi bắt đầu dự án, và mỗi sprint. Một kỹ thuật hiệu quả là **pre-mortem** (do Gary Klein đề xuất): cả team tưởng tượng rằng sáu tháng nữa dự án đã thất bại, rồi mỗi người viết ra lý do. Cách này giúp mọi người dễ nói ra những lo ngại mà bình thường họ ngại nói.
2. **Đánh giá:** chấm P và I, sắp thứ tự theo điểm.
3. **Lập kế hoạch ứng phó:** chọn chiến lược, hành động, owner, trigger.
4. **Theo dõi:** xem lại 10–15 phút mỗi tuần hoặc ở sprint planning; đưa 3 rủi ro hàng đầu vào báo cáo tiến độ.
5. **Đóng hoặc chuyển thành issue:** khi rủi ro không còn, hoặc khi nó đã xảy ra.

> **Lưu ý:** Risk register chỉ có giá trị khi được cập nhật. Một bảng 50 dòng không ai mở ra xem còn tệ hơn một danh sách 5 rủi ro hàng đầu được theo dõi hằng tuần.

## Quản lý phụ thuộc

### Các loại phụ thuộc

- **Team nội bộ khác:** team Core Banking làm API, team Mobile làm giao diện, team DevOps cấp hạ tầng, DBA duyệt migration.
- **Bên thứ ba:** ngân hàng, ví điện tử, nhà cung cấp SMS, OTP, eKYC. Họ thường có lịch làm việc, quy trình phê duyệt và thời gian phản hồi mà bạn không kiểm soát được.
- **Phê duyệt và tuân thủ:** security review, pháp chế, kiểm toán. Những phê duyệt này hay bị quên cho đến tuần cuối.

### Kỹ thuật quản lý

- **Lập bảng phụ thuộc** ngay từ khi lập kế hoạch release: cần gì, từ ai, hạn khi nào, người liên hệ có tên cụ thể.
- **Thống nhất hợp đồng giao tiếp sớm:** viết đặc tả OpenAPI (hoặc schema của message trên Kafka) và hai bên cùng duyệt *trước khi* code. Từ đó, team bạn có thể tự làm việc mà không phải chờ.
- **Mock và stub:** dùng WireMock hoặc mock server dựng từ OpenAPI để phát triển và test trong lúc phía bên kia chưa sẵn sàng.
- **Contract testing:** dùng consumer-driven contract (Spring Cloud Contract hoặc Pact) để phát hiện ngay khi bên cung cấp API thay đổi làm hỏng bên sử dụng.
- **Sắp thứ tự công việc:** làm những phần không phụ thuộc trước; làm việc tích hợp với bên thứ ba sớm nhất có thể, vì đó là phần khó lường nhất.
- **Buffer cho bên thứ ba:** nếu đối tác thường mất một tuần để cấp tài khoản test, hãy gửi yêu cầu từ sớm và tính khoảng chờ đó vào kế hoạch.
- **Lịch đồng bộ:** họp ngắn hằng tuần với các team phụ thuộc trong giai đoạn tích hợp; ghi lại cam kết bằng văn bản (email, ticket) kèm ngày cụ thể.
- **Giảm phụ thuộc về lâu dài:** nếu team liên tục phải chờ cùng một team khác, hãy cùng SA và manager xem lại ranh giới trách nhiệm hoặc cơ chế tự phục vụ (self-service).

```text
BẢNG PHỤ THUỘC — Release Thanh toán ví v1
| Cần gì                        | Từ ai             | Liên hệ    | Cần trước | Trạng thái     | Phương án nếu trễ              |
|-------------------------------|-------------------|------------|-----------|----------------|--------------------------------|
| API tra cứu tài khoản (v2)     | Team Core Banking | Chị Thu    | 25/7      | Đã có contract | Mock theo OpenAPI              |
| Sandbox + key ví B             | Đối tác ví B      | Anh Phong  | 20/7      | Chưa phản hồi  | Escalate qua PM ngày 15/7      |
| Namespace K8s production       | Team DevOps       | Anh Đức    | 10/8      | Đang làm       | Dùng chung namespace staging để test |
| Security review luồng callback | Team Security     | Chị Mai    | 20/8      | Chưa đặt lịch  | Đặt lịch ngay tuần này         |
```

## Thương lượng phạm vi

### Tam giác ràng buộc và vì sao không cắt chất lượng

Khi thời gian không đủ, về lý thuyết có bốn "cần gạt": **phạm vi, thời gian, nguồn lực, chất lượng**.

- **Thêm người** vào dự án đang trễ thường không giúp được ngay. Người mới cần thời gian để onboarding, và chi phí phối hợp tăng lên. Fred Brooks đã chỉ ra hiện tượng này trong *The Mythical Man-Month*, thường được gọi là Brooks's law.
- **Cắt chất lượng** (bỏ test, bỏ review, bỏ monitoring) giúp đẹp số liệu trong ngắn hạn, nhưng chi phí sẽ quay lại dưới dạng bug production, sự cố và nợ kỹ thuật. Với hệ thống thanh toán, cái giá đó có thể là sai lệch tiền của khách hàng.
- Vì vậy, **phạm vi** và **thời gian** thường là hai cần gạt hợp lý nhất để thương lượng.

### MVP và MoSCoW

**MVP (Minimum Viable Product)** là phiên bản nhỏ nhất vẫn mang lại giá trị thực, hoặc đủ để học được điều cần học từ người dùng. MVP không phải là "bản cẩu thả". Nó nhỏ về phạm vi nhưng vẫn đạt Definition of Done.

**MoSCoW** phân loại yêu cầu thành:

- **Must have:** không có thì release không có ý nghĩa, hoặc vi phạm quy định.
- **Should have:** quan trọng nhưng có thể làm ngay sau đó, hoặc có cách thay thế tạm thời.
- **Could have:** có thì tốt.
- **Won't have (this time):** thống nhất rõ là *chưa* làm trong lần này.

Một cách làm hiệu quả là **story map** (bản đồ story): xếp các bước trong hành trình của người dùng theo chiều ngang, các story của từng bước theo chiều dọc, rồi kẻ một đường ngang để chọn ra lát cắt đầu tiên đi trọn từ đầu đến cuối (thường gọi là "walking skeleton"). **Feature flag** giúp tách việc deploy khỏi việc release, nhờ đó có thể bật dần tính năng cho một nhóm cửa hàng nhỏ.

### Cách thương lượng

1. **Đưa ra dữ kiện:** dự báo hiện tại, phần còn lại, các rủi ro.
2. **Đưa ra 2–3 phương án kèm đánh đổi**, thay vì chỉ nói "không kịp".
3. **Để người có quyền quyết định** (PO hoặc PM) chọn, rồi ghi lại quyết định.

> **PM:** Khách hàng muốn có đủ ví A, ví B và hoàn tiền trước 15/9, em lo được không?
>
> **Lead:** Theo dự báo từ throughput, nếu làm đủ cả ba thì khả năng xong trước 15/9 chỉ khoảng 50%. Em có ba phương án. Một, giữ ngày 15/9 với ví A và ví B, hoàn tiền xử lý thủ công qua CSKH trong 2 tuần đầu, sau đó release hoàn tiền vào 29/9. Hai, giữ đủ phạm vi, lùi go-live sang 29/9. Ba, giữ ngày và phạm vi, nhưng bỏ test tải và giảm review. Phương án ba thì em không khuyến nghị, vì đây là hệ thống thanh toán, mùa khuyến mãi mà có sự cố thì thiệt hại lớn hơn nhiều so với lùi một tính năng.
>
> **PM:** Vậy chọn phương án một. Em gửi email tóm tắt giúp anh để anh báo khách hàng.

Lưu ý rằng lead không tự quyết thay PM, cũng không âm thầm cắt chất lượng, mà làm cho đánh đổi trở nên rõ ràng.

## Lỗi thường gặp

- **Risk register lập một lần rồi để đó.** Cách sửa: xem lại hằng tuần, đưa 3 rủi ro hàng đầu vào báo cáo tiến độ.
- **Rủi ro không có owner,** hoặc owner là "cả team". Cách sửa: mỗi rủi ro có tên một người cụ thể, kèm hạn hành động.
- **Lẫn lộn rủi ro với vấn đề.** Cách sửa: khi rủi ro đã xảy ra, chuyển nó sang danh sách issue và xử lý ngay.
- **Đợi team khác làm xong rồi mới bắt đầu.** Cách sửa: thống nhất contract sớm, dùng mock để làm song song.
- **Gửi yêu cầu cho đối tác quá muộn.** Cách sửa: liệt kê mọi thứ cần từ bên thứ ba ngay từ tuần đầu, gửi yêu cầu sớm và có kênh escalate.
- **Âm thầm bỏ test để kịp hạn.** Cách sửa: đưa phương án cắt phạm vi kèm đánh đổi, để người có quyền quyết định.
- **MVP bị hiểu thành "bản làm ẩu".** Cách sửa: MVP nhỏ về phạm vi nhưng vẫn phải đạt Definition of Done.

## Bài tập thực hành

1. **Pre-mortem và risk register:** Tổ chức một buổi pre-mortem 45 phút cho dự án hoặc release hiện tại. Gom các ý kiến lại thành risk register theo template, mỗi rủi ro có P, I, chiến lược, owner và trigger. Xem lại bảng hằng tuần trong một tháng và ghi lại những rủi ro đã được đóng.
2. **Bảng phụ thuộc:** Liệt kê tất cả phụ thuộc của release tiếp theo (team nội bộ, bên thứ ba, phê duyệt). Với mỗi phụ thuộc quan trọng, viết phương án nếu bị trễ, và xác định những chỗ có thể dùng contract cùng mock để làm song song.
3. **Phương án phạm vi:** Giả sử dự báo cho thấy release tiếp theo chỉ có 50% khả năng kịp hạn. Dùng MoSCoW hoặc story map để soạn 2–3 phương án kèm đánh đổi, viết thành email ngắn gửi PO, rồi đóng vai thương lượng với một đồng nghiệp.

## Tóm tắt

- Rủi ro là sự kiện chưa xảy ra và không chắc chắn; vấn đề là điều đã xảy ra. Hãy viết rủi ro theo dạng nguyên nhân, sự kiện, tác động.
- Risk register gồm xác suất, tác động, chiến lược ứng phó, owner và trigger, và chỉ có giá trị khi được xem lại đều đặn.
- Pre-mortem giúp team nói ra những rủi ro mà bình thường mọi người ngại nêu.
- Quản lý phụ thuộc bằng bảng phụ thuộc, contract sớm, mock và contract testing, buffer cho bên thứ ba, và cam kết bằng văn bản.
- Khi thiếu thời gian, hãy thương lượng phạm vi và thời gian; thêm người hay cắt chất lượng hiếm khi là lựa chọn tốt.
- MVP, MoSCoW và story map giúp chọn lát cắt nhỏ nhất có giá trị; lead đưa ra phương án kèm đánh đổi để người có quyền quyết định.
