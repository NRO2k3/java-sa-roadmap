Rất nhiều hệ thống thất bại không phải vì chọn sai framework, mà vì giải rất tốt một bài toán sai. Trước khi vẽ bất kỳ sơ đồ nào, Solution Architect (SA) phải hiểu doanh nghiệp muốn đạt được điều gì, ai bị ảnh hưởng, giới hạn nằm ở đâu và chất lượng nào là bắt buộc. Bài này trang bị cho bạn các kỹ thuật thu thập yêu cầu, lập bản đồ stakeholder (các bên liên quan) và chuyển yêu cầu nghiệp vụ thành kiến trúc mục tiêu có căn cứ.

## Mục tiêu bài học

- Phân biệt yêu cầu chức năng và phi chức năng; biến các yêu cầu mơ hồ như "hệ thống phải nhanh" thành tiêu chí đo được.
- Lập bản đồ stakeholder theo lưới quyền lực – mức quan tâm, xây dựng kế hoạch giao tiếp và quản lý kỳ vọng.
- Nhận diện và ghi lại các ràng buộc về ngân sách, thời gian, kỹ năng đội ngũ và pháp lý trước khi thiết kế.
- Chuyển yêu cầu nghiệp vụ thành bản đồ năng lực (capability map) và phác thảo kiến trúc mục tiêu có thể truy vết ngược về yêu cầu.

## Tình huống xuyên suốt

Để bài học cụ thể, ta dùng một tình huống hư cấu: chuỗi bán lẻ **MiniMart** có vài trăm cửa hàng, muốn ra mắt ứng dụng đặt hàng online kèm chương trình tích điểm trong 6 tháng. Công ty đang có một ERP cũ quản lý tồn kho, hệ thống POS tại cửa hàng và một team Java gồm 8 người quen Spring Boot, PostgreSQL nhưng chưa từng vận hành Kafka. CEO nói: "Tôi muốn khách đặt trên app, 2 giờ sau nhận hàng." Đó là toàn bộ "yêu cầu" ban đầu bạn nhận được.

## Thu thập yêu cầu chức năng và phi chức năng

### Yêu cầu chức năng

Yêu cầu chức năng (functional requirement) mô tả hệ thống **làm gì**: hành vi, nghiệp vụ, dữ liệu vào ra. Ví dụ: "Khách hàng đặt hàng từ cửa hàng gần nhất còn hàng", "Hệ thống cộng điểm sau khi đơn hoàn tất". Cách ghi phổ biến là user story kèm tiêu chí chấp nhận (acceptance criteria), hoặc use case khi luồng phức tạp.

SA không cần tự viết mọi user story (đó là việc của BA hoặc PO), nhưng phải nắm được **các luồng nghiệp vụ chính** và những luồng có ảnh hưởng kiến trúc: luồng nào cần phản hồi tức thì, luồng nào chạm vào nhiều hệ thống, luồng nào liên quan đến tiền.

### Yêu cầu phi chức năng

Yêu cầu phi chức năng (non-functional requirement – NFR), còn gọi là thuộc tính chất lượng (quality attribute), mô tả hệ thống **làm tốt đến mức nào**: hiệu năng, độ sẵn sàng, bảo mật, khả năng mở rộng, khả năng bảo trì. Chuẩn ISO/IEC 25010 cung cấp một danh mục đặc tính chất lượng có thể dùng làm checklist. NFR thường quyết định kiến trúc nhiều hơn yêu cầu chức năng: cùng chức năng "đặt hàng", hệ thống cho 1.000 đơn mỗi ngày và 1.000 đơn mỗi giây là hai kiến trúc rất khác nhau.

Vấn đề là business hiếm khi tự nói ra NFR. Họ không nói "p95 latency dưới 300 ms", họ nói "app phải mượt". SA phải chủ động hỏi.

### Kỹ thuật thu thập

| Kỹ thuật | Phù hợp khi | Lưu ý |
|---|---|---|
| Phỏng vấn 1-1 | Cần hiểu sâu mối quan tâm của từng người, nhất là lãnh đạo | Chuẩn bị câu hỏi mở, gửi lại tóm tắt để xác nhận |
| Workshop nhóm | Nhiều phòng ban cùng tham gia một quy trình | Cần người điều phối, chốt kết quả ngay tại buổi |
| Event Storming | Quy trình nghiệp vụ phức tạp, nhiều sự kiện | Rất hợp để tìm ranh giới domain cho các service |
| Quan sát thực tế (shadowing) | Người dùng khó diễn đạt cách họ làm việc | Ra cửa hàng xem nhân viên soạn đơn thực tế |
| Phân tích hệ thống hiện có | Có hệ legacy, log, báo cáo | Số liệu thật (đơn mỗi ngày, giờ cao điểm) đáng tin hơn ước đoán |

Nguyên tắc quan trọng: hỏi **vì sao** trước khi hỏi **cái gì**. Khi CEO muốn "giao trong 2 giờ", hãy hỏi tiếp: mục tiêu kinh doanh là gì (cạnh tranh với đối thủ hay tăng giá trị giỏ hàng), thành công được đo bằng chỉ số nào, nếu chỉ đạt 4 giờ thì sao. Câu trả lời giúp bạn tách yêu cầu cứng khỏi mong muốn.

### Biến NFR mơ hồ thành đo được

Dùng **quality attribute scenario** (kịch bản thuộc tính chất lượng) gồm 6 phần: nguồn (source), kích thích (stimulus), đối tượng bị tác động (artifact), môi trường (environment), phản hồi (response) và thước đo phản hồi (response measure).

```text
NFR mơ hồ : "Hệ thống phải chịu được tải lớn dịp khuyến mãi"

Kịch bản  :
- Nguồn        : Khách hàng trên app mobile
- Kích thích   : 3.000 lượt đặt hàng/phút trong đợt flash sale
- Đối tượng    : Order API và luồng thanh toán
- Môi trường   : Vận hành bình thường, giờ cao điểm
- Phản hồi     : Đơn được ghi nhận, không bán vượt tồn kho
- Thước đo     : p95 thời gian đặt hàng < 800 ms, tỉ lệ lỗi < 0,5%
```

Con số trong kịch bản phải do business xác nhận, không phải SA tự đặt. Nếu chưa có số liệu, hãy ghi rõ đó là giả định và lên lịch kiểm chứng.

### Checklist câu hỏi khai thác NFR

```text
HIỆU NĂNG & TẢI
[ ] Bao nhiêu người dùng đồng thời lúc cao điểm? Cao điểm rơi vào khi nào?
[ ] Số giao dịch/giây trung bình và cao điểm? Tăng trưởng dự kiến 2–3 năm tới?
[ ] Thời gian phản hồi chấp nhận được cho từng luồng chính (p95, p99)?

ĐỘ SẴN SÀNG & PHỤC HỒI
[ ] Hệ thống ngừng 1 giờ thì doanh nghiệp mất gì? Có khung giờ bảo trì không?
[ ] Mục tiêu SLA/SLO? RPO (mất tối đa bao nhiêu dữ liệu)? RTO (phục hồi trong bao lâu)?

BẢO MẬT & TUÂN THỦ
[ ] Có dữ liệu cá nhân, dữ liệu thẻ hay dữ liệu nhạy cảm không? Lưu ở đâu, bao lâu?
[ ] Ai được xem/sửa dữ liệu nào? Có cần audit log không?
[ ] Có quy định pháp lý hoặc chuẩn ngành nào bắt buộc tuân theo?

TÍCH HỢP & DỮ LIỆU
[ ] Phải tích hợp với hệ thống nào? Giao thức, tần suất, ai sở hữu hệ thống đó?
[ ] Dữ liệu nào cần nhất quán tức thời, dữ liệu nào chấp nhận trễ vài giây hay vài phút?

VẬN HÀNH & BẢO TRÌ
[ ] Ai vận hành hệ thống sau khi ra mắt? Có đội on-call 24/7 không?
[ ] Cần giám sát, cảnh báo, báo cáo những gì?
[ ] Tần suất phát hành mong muốn?
```

### Ưu tiên hoá yêu cầu

Không thể đáp ứng mọi thứ cùng lúc. Kỹ thuật **MoSCoW** chia yêu cầu thành Must (bắt buộc cho lần ra mắt), Should (quan trọng nhưng có thể lùi), Could (có thì tốt) và Won't (không làm lần này). Với NFR, hãy đề nghị stakeholder xếp hạng các thuộc tính chất lượng: khi hiệu năng và chi phí xung đột, cái nào thắng? Thứ hạng này sẽ là "trọng tài" cho các quyết định kiến trúc về sau.

## Lập bản đồ stakeholder và quản lý kỳ vọng

### Xác định stakeholder

Stakeholder là bất kỳ ai bị ảnh hưởng bởi hệ thống hoặc có thể ảnh hưởng đến nó. Với MiniMart: CEO, giám đốc vận hành chuỗi, giám đốc tài chính (CFO), marketing (chương trình tích điểm), đội IT vận hành ERP, đội bảo mật, pháp chế, quản lý cửa hàng, đối tác giao hàng, team Java và tất nhiên là khách hàng. Đừng quên những người "im lặng" nhưng có quyền phủ quyết như bảo mật hay pháp chế: họ hay xuất hiện vào tuần cuối và chặn go-live.

### Lưới quyền lực – mức quan tâm

Lưới quyền lực – mức quan tâm (power/interest grid) xếp stakeholder vào bốn ô để quyết định cách tương tác:

```text
                MỨC QUAN TÂM THẤP              MỨC QUAN TÂM CAO
             +------------------------------+------------------------------+
  QUYỀN LỰC  | GIỮ HÀI LÒNG                 | QUẢN LÝ CHẶT                 |
  CAO        | - CFO                        | - CEO (nhà tài trợ dự án)    |
             | - Trưởng bộ phận bảo mật     | - Giám đốc vận hành chuỗi    |
             | - Pháp chế                   | - Giám đốc marketing         |
             +------------------------------+------------------------------+
  QUYỀN LỰC  | THEO DÕI                     | THÔNG TIN THƯỜNG XUYÊN       |
  THẤP       | - Đối tác giao hàng          | - Quản lý cửa hàng           |
             | - Bộ phận nhân sự            | - Đội IT vận hành ERP        |
             |                              | - Team Java                  |
             +------------------------------+------------------------------+
```

- **Quản lý chặt**: họp định kỳ, mời tham gia các quyết định quan trọng.
- **Giữ hài lòng**: gặp ở các mốc then chốt, chuẩn bị sẵn câu trả lời về chi phí, rủi ro, tuân thủ.
- **Thông tin thường xuyên**: demo, bản tin, kênh chat chung; đây thường là nguồn yêu cầu chi tiết nhất.
- **Theo dõi**: cập nhật khi có thay đổi ảnh hưởng đến họ.

Lưới không cố định. Khi dự án bước vào giai đoạn tích hợp, đội IT vận hành ERP có thể trở thành nhóm quyền lực cao, vì không có họ thì không tích hợp được.

### Stakeholder register

Stakeholder register là bảng ghi lại mỗi stakeholder, mối quan tâm và cách bạn tương tác với họ:

| Stakeholder | Mối quan tâm chính | Ô trên lưới | Chiến lược | Kênh & tần suất |
|---|---|---|---|---|
| CEO | Ra mắt đúng hạn, tăng doanh thu online | Quản lý chặt | Báo cáo theo mốc, đưa lựa chọn kèm trade-off | Họp 2 tuần/lần |
| CFO | Tổng chi phí, chi phí vận hành hằng tháng | Giữ hài lòng | Trình bày TCO và các phương án chi phí | Theo mốc ngân sách |
| Trưởng bảo mật | Dữ liệu khách hàng, thanh toán | Giữ hài lòng | Mời review thiết kế sớm, không đợi tuần cuối | Cuối mỗi giai đoạn thiết kế |
| Đội IT ERP | ERP không bị quá tải, ít thay đổi | Thông tin thường xuyên | Cùng thiết kế phương án tích hợp | Họp kỹ thuật hằng tuần |
| Quản lý cửa hàng | Quy trình soạn đơn đơn giản | Thông tin thường xuyên | Mời dùng thử bản demo, lấy feedback | Demo mỗi sprint |

### Quản lý kỳ vọng

Phần lớn xung đột với stakeholder đến từ kỳ vọng không được nói ra. Một vài nguyên tắc thực tế:

- **Chốt bằng văn bản.** Sau mỗi buổi làm việc, gửi tóm tắt: đã thống nhất gì, còn mở gì, ai làm gì, hạn khi nào. Im lặng không có nghĩa là đồng ý.
- **Đừng chỉ nói "không", hãy nói giá.** Thay vì "không làm được", hãy đưa phương án: "Giao trong 2 giờ trên toàn quốc cần tích hợp tồn kho thời gian thực, thêm khoảng 2 tháng. Nếu ra mắt trước ở 2 thành phố lớn, ta kịp hạn."
- **Báo tin xấu sớm.** Một rủi ro báo trước 2 tháng là thông tin; báo trước 2 ngày là khủng hoảng.
- **Phân biệt cam kết và ước lượng.** Ước lượng ở giai đoạn đầu có biên độ lớn; nói rõ biên độ và điều kiện để thu hẹp nó.

## Xác định ràng buộc

Ràng buộc (constraint) là những điều kiện bạn **không được tự chọn**; chúng giới hạn không gian giải pháp. Cần phân biệt ba khái niệm:

- **Yêu cầu**: điều hệ thống phải đạt được, mức độ có thể thương lượng.
- **Ràng buộc**: điều bị áp đặt, thường không thương lượng được trong phạm vi dự án.
- **Giả định (assumption)**: điều ta tin là đúng nhưng chưa kiểm chứng. Mỗi giả định là một rủi ro tiềm ẩn và cần có người chịu trách nhiệm kiểm chứng.

| Loại ràng buộc | Ví dụ ở MiniMart | Câu hỏi cần hỏi | Ảnh hưởng kiến trúc |
|---|---|---|---|
| Ngân sách | Ngân sách cloud có trần mỗi tháng | Trần áp cho chi phí đầu tư hay vận hành? Ai duyệt khi vượt? | Ưu tiên dịch vụ trả theo mức dùng, tránh cụm lớn chạy 24/7 |
| Thời gian | Ra mắt trước mùa mua sắm cuối năm | Mốc nào là cứng? Có thể ra mắt từng phần không? | Chọn công nghệ team đã quen, cắt phạm vi bằng MoSCoW |
| Kỹ năng đội | Giỏi Spring Boot, chưa vận hành Kafka | Có thể tuyển hoặc đào tạo không? Ai trực on-call? | Cân nhắc broker dạng managed hoặc giải pháp đơn giản hơn |
| Pháp lý | Lưu dữ liệu cá nhân khách hàng | Dữ liệu lưu ở đâu? Thu thập sự đồng ý thế nào? | Mã hoá, phân quyền, vị trí lưu dữ liệu, chính sách lưu trữ |
| Tổ chức, kỹ thuật | Bắt buộc dùng ERP làm nguồn tồn kho | ERP có API không? Chịu được tải bao nhiêu? | Cần lớp tích hợp, cache hoặc đồng bộ dữ liệu |

> **Lưu ý:** Với ràng buộc pháp lý, hãy làm việc với bộ phận pháp chế thay vì tự diễn giải luật. Ở Việt Nam, các quy định về bảo vệ dữ liệu cá nhân (như Nghị định 13/2023/NĐ-CP và các văn bản ban hành sau đó) có thể ảnh hưởng trực tiếp đến cách lưu trữ và xử lý dữ liệu; nếu hệ thống xử lý dữ liệu thẻ thanh toán thì thường phải tuân theo PCI DSS.

Ràng buộc về kỹ năng đội hay bị đánh giá thấp nhất. Một kiến trúc event-driven với Kafka có thể đẹp trên giấy, nhưng nếu chưa ai trong team từng xử lý consumer lag hay rebalance lúc 2 giờ sáng, đó là rủi ro vận hành thật sự, cần được ghi nhận và có phương án giảm thiểu.

## Từ yêu cầu nghiệp vụ đến capability và kiến trúc mục tiêu

### Business capability là gì

Business capability (năng lực nghiệp vụ) là những gì doanh nghiệp **có khả năng làm** để tạo ra giá trị, độc lập với cách làm hay hệ thống đang dùng. Ví dụ: "Quản lý tồn kho", "Xử lý đơn hàng", "Quản lý khách hàng thân thiết". Quy trình và công nghệ thay đổi thường xuyên, còn capability ổn định hơn nhiều, nên đây là điểm neo tốt để vạch ranh giới hệ thống.

### Capability map

```text
MINIMART – CAPABILITY MAP (phạm vi sáng kiến bán hàng online)

[Bán hàng đa kênh]          [Vận hành chuỗi]             [Khách hàng]
 - Quản lý danh mục          - Quản lý tồn kho *          - Hồ sơ khách hàng
 - Định giá & khuyến mãi     - Soạn hàng tại cửa hàng *   - Tích điểm & đổi quà *
 - Xử lý đơn hàng *          - Giao hàng chặng cuối *     - Chăm sóc khách hàng
 - Thanh toán online *

[Hỗ trợ]
 - Kế toán & đối soát *      - Báo cáo & phân tích        - Quản lý định danh

(*) capability mới hoặc cần nâng cấp mạnh cho sáng kiến này
```

Bước tiếp theo là **heat map**: đánh dấu mức đáp ứng hiện tại của từng capability (tốt, yếu, chưa có). Ở MiniMart, "Quản lý tồn kho" có trong ERP nhưng chỉ cập nhật theo lô cuối ngày, không đủ cho đặt hàng online. Đây là khoảng trống (gap) quan trọng nhất và cũng là rủi ro kỹ thuật lớn nhất.

### Từ capability đến kiến trúc mục tiêu

1. **Gán capability với hệ thống**: capability nào dùng hệ có sẵn, cái nào xây mới, cái nào mua (SaaS).
2. **Để NFR dẫn dắt lựa chọn kiến trúc**: "Xử lý đơn hàng" phải chịu tải flash sale nên tách thành service riêng, scale độc lập; "Báo cáo" chấp nhận trễ nên có thể lấy dữ liệu theo lô.
3. **Xác định điểm tích hợp**: tồn kho gần thời gian thực đòi hỏi ERP phát sự kiện thay đổi, hoặc một lớp đồng bộ dữ liệu.
4. **Phác thảo kiến trúc mục tiêu** ở mức cao và chỉ rõ phần nào là trạng thái chuyển tiếp.
5. **Lập ma trận truy vết** để mọi quyết định đều trả lời được câu hỏi "vì sao".

```text
KIẾN TRÚC MỤC TIÊU (phác thảo)

[App mobile] --HTTPS--> [API Gateway] --> [Order Service (Spring Boot)] --> [PostgreSQL]
                              |                  |
                              |                  +--sự kiện--> [Loyalty Service]
                              |                  +--REST-----> [Cổng thanh toán]
                              |
                              +--> [Catalog Service] <--đồng bộ tồn kho-- [ERP hiện có]
```

| Yêu cầu / ràng buộc | Capability | Quyết định kiến trúc | Ghi chú |
|---|---|---|---|
| Chịu 3.000 đơn/phút khi flash sale | Xử lý đơn hàng | Order Service tách riêng, scale ngang, giữ chỗ tồn kho khi đặt | ADR-002 |
| Không bán vượt tồn kho | Quản lý tồn kho | Đồng bộ tồn kho từ ERP gần thời gian thực | ADR-003, cần PoC |
| Bảo vệ dữ liệu cá nhân | Hồ sơ khách hàng | Mã hoá dữ liệu nhạy cảm, phân quyền theo vai trò | Review cùng bảo mật |
| Team chưa vận hành Kafka | (ràng buộc) | Dùng message broker dạng managed service | ADR-004 |

Ma trận này là xương sống của tài liệu kiến trúc: khi ai đó hỏi "sao không dùng giải pháp X", bạn chỉ ra yêu cầu và ràng buộc cụ thể đã dẫn tới lựa chọn hiện tại.

## Lỗi thường gặp

- **Nhảy vào công nghệ quá sớm.** Bàn microservice hay Kafka khi chưa biết tải và mục tiêu kinh doanh. Cách sửa: chưa xong checklist NFR và danh sách ràng buộc thì chưa chọn công nghệ.
- **Chấp nhận NFR không đo được.** "Nhanh", "an toàn", "dễ mở rộng" không kiểm thử được. Cách sửa: viết lại thành quality attribute scenario với con số được business xác nhận.
- **Chỉ nói chuyện với người có chức vụ cao nhất.** Chỉ nghe CEO mà bỏ qua quản lý cửa hàng hay đội ERP thì thiết kế dễ không vận hành được. Cách sửa: lập stakeholder register ngay tuần đầu.
- **Coi giả định là sự thật.** "ERP chắc có API" chỉ là giả định cho đến khi có người kiểm tra. Cách sửa: duy trì danh sách giả định, mỗi mục có người chịu trách nhiệm và hạn kiểm chứng.
- **Thu thập xong rồi đóng băng.** Yêu cầu luôn thay đổi. Cách sửa: coi yêu cầu là tài liệu sống, có quy trình tiếp nhận thay đổi và đánh giá ảnh hưởng.
- **Gold-plating (làm thừa).** Thiết kế cho tải gấp trăm lần hiện tại "cho chắc". Cách sửa: thiết kế cho mức tăng trưởng có căn cứ và chỉ rõ điểm có thể mở rộng sau.

## Bài tập thực hành

1. **Phỏng vấn NFR.** Chọn một hệ thống bạn đang làm. Dùng checklist ở trên, phỏng vấn PO hoặc người dùng chính trong 30 phút. Viết ra ít nhất 5 quality attribute scenario đủ 6 phần, đánh dấu con số nào đã được xác nhận, con số nào còn là giả định.
2. **Bản đồ stakeholder.** Với dự án hiện tại, liệt kê ít nhất 10 stakeholder, xếp lên lưới quyền lực – mức quan tâm và hoàn thành stakeholder register kèm chiến lược giao tiếp. Đánh dấu những người có quyền phủ quyết mà bạn chưa từng trao đổi trực tiếp.
3. **Capability map và ma trận truy vết.** Với bài toán MiniMart hoặc một bài toán thật, vẽ capability map, tô heat map, phác thảo kiến trúc mục tiêu và lập ma trận truy vết ít nhất 6 dòng nối yêu cầu, ràng buộc với quyết định kiến trúc.

## Tóm tắt

- Hiểu mục tiêu kinh doanh trước, chọn công nghệ sau; hỏi "vì sao" trước "cái gì".
- NFR thường quyết định kiến trúc; biến chúng thành quality attribute scenario đo được và để business xác nhận con số.
- Lập stakeholder register và lưới quyền lực – mức quan tâm từ đầu; đừng bỏ sót người có quyền phủ quyết.
- Quản lý kỳ vọng bằng cách chốt bằng văn bản, đưa lựa chọn kèm "giá" và báo rủi ro sớm.
- Phân biệt rõ yêu cầu, ràng buộc và giả định; mỗi giả định là một rủi ro cần kiểm chứng.
- Capability map là điểm neo ổn định để vạch ranh giới hệ thống; ma trận truy vết giúp mọi quyết định đều có lý do.
