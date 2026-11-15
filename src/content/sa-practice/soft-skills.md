Một thiết kế xuất sắc mà không được phê duyệt, không được team hiểu và không được các team khác chấp nhận thì không bao giờ trở thành hệ thống thật. SA làm việc ở giao điểm giữa business, kỹ thuật và nhiều team, nên phần lớn thời gian là giao tiếp: trình bày, thuyết phục, đàm phán, hướng dẫn và viết. Bài này biến các "kỹ năng mềm" đó thành những kỹ thuật cụ thể có thể luyện tập.

## Mục tiêu bài học

- Trình bày cùng một giải pháp theo cách phù hợp cho ban lãnh đạo và cho người làm kỹ thuật.
- Áp dụng đàm phán dựa trên lợi ích để xử lý bất đồng giữa các team và leo thang (escalation) đúng cách.
- Mentoring developer qua câu hỏi, review thiết kế và code tập trung vào các mối quan tâm kiến trúc.
- Viết tài liệu kỹ thuật ngắn gọn, có cấu trúc, đưa kết luận lên đầu.

## Trình bày giải pháp cho nhiều đối tượng

### Hiểu người nghe trước khi soạn nội dung

| Đối tượng | Họ quan tâm | Nên trình bày | Nên tránh |
|---|---|---|---|
| CEO, ban điều hành | Giá trị kinh doanh, thời gian, rủi ro | Kết luận trước, 2–3 lựa chọn kèm chi phí và rủi ro, đề xuất rõ ràng | Chi tiết công nghệ, thuật ngữ |
| CFO | Tổng chi phí, chi phí cố định và biến đổi | TCO, kịch bản tăng trưởng, giả định đằng sau con số | Con số không kèm giả định |
| PO, business | Tính năng, mốc thời gian, trải nghiệm | Phạm vi theo giai đoạn, ảnh hưởng đến người dùng | Cấu trúc nội bộ hệ thống |
| Developer | Hiện thực thế nào, vì sao, ranh giới ở đâu | Sơ đồ C4 mức Container và Component, ADR, API, demo | Quyết định áp đặt không có lý do |
| Vận hành, bảo mật | Ổn định, giám sát, kiểm soát | Sơ đồ triển khai, các tình huống lỗi, biện pháp bảo mật | Bỏ qua chủ đề vận hành |

### Đưa kết luận lên đầu

Người nghe cấp cao thường có ít thời gian và có thể bị gọi ra ngoài giữa chừng. Hãy dùng **BLUF** (Bottom Line Up Front: kết luận trước) hoặc **Pyramid Principle** của Barbara Minto: bắt đầu bằng câu trả lời chính, sau đó mới đến các luận điểm hỗ trợ, rồi đến dữ liệu chi tiết. Phần bối cảnh có thể theo khung **SCR**: Situation (tình hình hiện tại), Complication (vấn đề hoặc thay đổi khiến phải hành động), Resolution (đề xuất).

### Template trình bày cho ban lãnh đạo

```text
SLIDE 1 – Đề xuất (BLUF)
  "Đề nghị phê duyệt phương án B: ra mắt đặt hàng online theo 2 giai đoạn,
   chi phí năm đầu X, giai đoạn 1 go-live tháng 9 tại 2 thành phố."
SLIDE 2 – Bối cảnh và vấn đề (Situation – Complication)
  Mục tiêu kinh doanh, vì sao phải làm bây giờ, rủi ro nếu không làm.
SLIDE 3 – Các phương án
  Bảng 2–3 phương án: chi phí, thời gian, rủi ro, mức đáp ứng mục tiêu.
SLIDE 4 – Phương án đề xuất
  Vì sao chọn, một sơ đồ đơn giản (C4 mức System Context), các mốc chính.
SLIDE 5 – Rủi ro và quyết định cần đưa ra hôm nay
  3 rủi ro lớn nhất và cách giảm thiểu; ngân sách hoặc quyết định cần duyệt.
PHỤ LỤC – Chi tiết kỹ thuật, TCO đầy đủ, giả định (chỉ mở khi được hỏi)
```

### Trình bày cho người làm kỹ thuật

Developer cần thấy bạn đã nghĩ kỹ: các phương án đã loại và lý do, cách xử lý lỗi, ranh giới trách nhiệm giữa các service. Hãy đi từ sơ đồ Container xuống Component, dành thời gian cho các tình huống "điều gì xảy ra nếu..." (broker chết, cổng thanh toán chậm, deploy giữa chừng), và mời phản biện thật sự. Một buổi trình bày kỹ thuật tốt kết thúc bằng danh sách câu hỏi mở và người phụ trách từng câu.

### Một vài kỹ thuật hữu ích

- **Pre-wire (gặp trước)**: trước buổi họp quan trọng, gặp riêng những người có ảnh hưởng hoặc có khả năng phản đối. Không ai thích bị bất ngờ trước đám đông.
- **Chuẩn bị câu hỏi khó**: liệt kê 10 câu hỏi khó nhất có thể bị hỏi và chuẩn bị câu trả lời ngắn.
- **Dám nói "tôi chưa biết"**: "Tôi chưa có số liệu đó, tôi sẽ gửi lại trước thứ Sáu" đáng tin hơn một câu trả lời đoán mò.
- **Thay đổi độ zoom theo phản ứng**: nếu người nghe bắt đầu nhìn điện thoại, bạn đang ở quá sâu; nếu họ hỏi chi tiết, hãy mở phụ lục.

## Đàm phán và xử lý bất đồng giữa các team

### Đàm phán dựa trên nguyên tắc

Cuốn *Getting to Yes* (Roger Fisher và William Ury) mô tả cách đàm phán dựa trên nguyên tắc (principled negotiation) với bốn ý chính:

1. **Tách con người khỏi vấn đề**: tranh luận về giải pháp, không công kích người đề xuất.
2. **Tập trung vào lợi ích, không vào lập trường**: lập trường là "cái tôi muốn", lợi ích là "vì sao tôi muốn".
3. **Tạo ra nhiều lựa chọn cùng có lợi** trước khi chọn.
4. **Dùng tiêu chí khách quan**: NFR, số liệu, chuẩn chung, thay vì ý kiến của người nói to nhất.

Khái niệm đi kèm là **BATNA** (Best Alternative To a Negotiated Agreement): phương án tốt nhất của bạn nếu không đạt được thoả thuận. Biết BATNA của mình và của bên kia giúp bạn biết khi nào nên nhượng bộ, khi nào nên leo thang.

### Ví dụ: team Order và team Payment

Team Order muốn team Payment cung cấp API thanh toán đồng bộ trả kết quả ngay. Team Payment chỉ muốn xử lý bất đồng bộ. Hai bên tranh luận nhiều tuần.

| | Team Order | Team Payment |
|---|---|---|
| Lập trường | "Phải có API đồng bộ" | "Chỉ hỗ trợ bất đồng bộ" |
| Lợi ích thật | Khách cần biết kết quả thanh toán trước khi rời màn hình; code luồng đặt hàng đơn giản | Cổng thanh toán đối tác đôi khi phản hồi rất chậm; không muốn giữ kết nối lâu gây cạn tài nguyên |
| Tiêu chí khách quan | NFR: khách biết kết quả trong bao lâu? | Số liệu: phân bố thời gian phản hồi thực tế của cổng thanh toán |

Khi nhìn vào lợi ích, các lựa chọn mới xuất hiện: API đồng bộ có timeout ngắn, nếu quá hạn thì trả trạng thái "đang xử lý" và thông báo kết quả sau qua webhook hoặc push. Phần lớn giao dịch có kết quả ngay, phần ít giao dịch chậm không giữ tài nguyên. Cả hai bên đạt được lợi ích chính, và quyết định được ghi vào ADR.

### Quy trình xử lý bất đồng

1. **Làm rõ vấn đề** bằng một câu mà cả hai bên đồng ý.
2. **Thống nhất tiêu chí** đánh giá (dựa trên NFR và ràng buộc) trước khi bàn phương án.
3. **Liệt kê phương án**, kể cả phương án lai.
4. **Dùng dữ liệu**: số liệu production, benchmark nhỏ, hoặc PoC nếu khác biệt lớn.
5. **Quyết định theo cơ chế đã thống nhất** (ai có quyền quyết định cuối) và ghi lại bằng ADR, kể cả ý kiến không được chọn.

### Leo thang đúng cách

Nếu không thống nhất được, đừng "vượt mặt" bên kia. Hãy **leo thang chung (joint escalation)**: hai bên cùng viết một trang gồm vấn đề, các phương án, quan điểm của từng bên một cách công bằng, rồi cùng mang lên người có thẩm quyền. Cách này giữ được quan hệ và giúp người quyết định có đủ thông tin.

## Mentoring, review thiết kế và code

### Mentoring bằng câu hỏi

Mục tiêu của mentoring là giúp developer **tư duy như kiến trúc sư**, không phải làm thay họ. Thay vì đưa đáp án, hãy hỏi:

- "Điều gì xảy ra nếu service này không phản hồi trong 30 giây?"
- "Dữ liệu này có thể lệch trong bao lâu mà business vẫn chấp nhận?"
- "Nếu tải tăng gấp mười, chỗ nào hỏng trước?"
- "Ai sẽ phải vận hành phần này lúc 2 giờ sáng?"

Giao cho họ viết ADR cho một quyết định thật, rồi bạn review. Mời họ ngồi cùng trong buổi review thiết kế hoặc buổi trình ARB. Giao dần quyền quyết định khi họ đã chứng minh được năng lực.

### Checklist review thiết kế

```text
[ ] Bài toán và NFR đã rõ, có con số chưa?
[ ] Đã cân nhắc ít nhất 2 phương án, có lý do loại phương án còn lại?
[ ] Ranh giới trách nhiệm giữa các service, ai sở hữu dữ liệu nào?
[ ] Giao tiếp đồng bộ hay bất đồng bộ? Timeout, retry, idempotency?
[ ] Tính nhất quán dữ liệu: transaction ở đâu, chấp nhận eventual consistency ở đâu?
[ ] Tình huống lỗi: phụ thuộc chết, chậm, trả dữ liệu sai thì sao?
[ ] Bảo mật: xác thực, phân quyền, dữ liệu nhạy cảm, audit?
[ ] Vận hành: metric, log, tracing, cảnh báo, cách rollback?
[ ] Chi phí và khả năng mở rộng có phù hợp tăng trưởng dự kiến?
[ ] Migration và tương thích ngược với client hiện tại?
```

### Review code từ góc nhìn kiến trúc

Khi SA review code, hãy để công cụ (formatter, linter, SonarQube) lo phần định dạng và tập trung vào những điều công cụ không bắt được: ranh giới module, xử lý lỗi khi gọi bên ngoài, transaction, bảo mật. Một quy ước hữu ích là **Conventional Comments**: mỗi comment bắt đầu bằng nhãn như `praise`, `nitpick`, `suggestion`, `issue`, `question`, có thể kèm `(blocking)` hoặc `(non-blocking)`, giúp tác giả biết comment nào bắt buộc phải xử lý.

Ví dụ đoạn code cần góp ý:

```java
@Transactional
public Order placeOrder(PlaceOrderCommand cmd) {
    Order order = orderRepository.save(Order.from(cmd));
    // Gọi HTTP sang cổng thanh toán trong khi transaction DB vẫn đang mở
    PaymentResult result = paymentClient.charge(order.getId(), cmd.amount());
    order.markPaid(result.transactionId());
    return order;
}
```

```text
issue (blocking): Lời gọi paymentClient.charge() nằm trong @Transactional nên
connection DB bị giữ suốt thời gian chờ cổng thanh toán. Khi cổng chậm, pool
có thể cạn và toàn bộ Order API bị ảnh hưởng. Nếu charge thành công mà
commit thất bại, ta còn trừ tiền cho một đơn không tồn tại.

suggestion: Có thể tách thành hai bước: lưu đơn ở trạng thái PENDING trong
một transaction ngắn, gọi thanh toán bên ngoài transaction (kèm timeout và
idempotency key), rồi cập nhật trạng thái. Bạn thấy cách này có vướng gì
với luồng hiện tại không?

praise: Tách PlaceOrderCommand ra record riêng làm API của service rất rõ.
```

Comment tốt nêu vấn đề, giải thích hậu quả, gợi ý hướng đi và mở cửa cho tác giả phản hồi. Hãy khen điều làm tốt một cách cụ thể; đó cũng là cách dạy.

## Viết tài liệu kỹ thuật ngắn gọn, có cấu trúc

### Nguyên tắc

- **Biết người đọc** và điều họ cần làm sau khi đọc: phê duyệt, hiện thực, hay vận hành.
- **Kết luận trước**: đoạn đầu trả lời "đề xuất gì, cần ai làm gì".
- **Cụ thể**: số liệu, tên hệ thống, ngày tháng thay cho "một số", "nhiều", "sớm".
- **Một đoạn một ý**, câu ngắn, dùng bảng và danh sách cho so sánh và các bước.
- **Cắt bỏ**: mỗi câu phải giúp người đọc hiểu hoặc quyết định; nếu không, xoá đi.

### Trước và sau

```text
TRƯỚC:
"Qua quá trình theo dõi, chúng tôi nhận thấy hệ thống có thể đang gặp một số
vấn đề liên quan đến hiệu năng trong một vài trường hợp nhất định, do đó có lẽ
cần xem xét việc tối ưu hoá trong thời gian tới khi có điều kiện."

SAU:
"Đề xuất: tăng connection pool của Order API từ 10 lên 30 và thêm index cho
bảng orders(customer_id) trong sprint 14.
Lý do: giờ cao điểm 19h–21h, p95 của API đặt hàng tăng từ 250 ms lên 1,8 s;
70% thời gian chờ nằm ở việc lấy connection.
Rủi ro: tăng tải lên PostgreSQL; đã kiểm tra DB còn dư tài nguyên."
```

### Template one-pager đề xuất

```text
TIÊU ĐỀ: <Đề xuất gì, cho hệ thống nào>
NGƯỜI VIẾT / NGÀY / NGƯỜI CẦN QUYẾT ĐỊNH

1. Đề xuất (2–3 câu)       : Làm gì, khi nào, cần phê duyệt điều gì
2. Vấn đề                   : Hiện trạng, số liệu, tác động kinh doanh
3. Phương án                : 2–3 phương án, bảng so sánh ngắn
4. Đề xuất chi tiết         : Phạm vi, chi phí, mốc thời gian
5. Rủi ro & giảm thiểu      : 3 rủi ro lớn nhất
6. Bước tiếp theo           : Ai làm gì, hạn nào
Phụ lục / link              : ADR, sơ đồ, số liệu chi tiết
```

## Lỗi thường gặp

- **Một bài trình bày cho mọi đối tượng.** Đưa sơ đồ Component cho CEO, hoặc chỉ đưa slide kinh doanh cho developer. Cách sửa: soạn theo người nghe, giữ phần chi tiết ở phụ lục.
- **Thắng tranh luận nhưng mất quan hệ.** Dùng chức danh hoặc giọng to để áp đặt khiến team khác né tránh hợp tác về sau. Cách sửa: tập trung vào lợi ích, tiêu chí khách quan, ghi nhận ý kiến không được chọn.
- **Leo thang một phía.** Báo cáo cấp trên mà bên kia không biết. Cách sửa: leo thang chung với tài liệu trình bày công bằng quan điểm hai bên.
- **Mentoring bằng cách làm thay.** Developer không lớn lên và SA thành nút cổ chai. Cách sửa: hỏi trước khi trả lời, giao quyết định vừa sức kèm review.
- **Review code soi định dạng.** Hàng chục comment về khoảng trắng che mất vấn đề transaction. Cách sửa: tự động hoá định dạng, dùng nhãn Conventional Comments để phân biệt mức độ.
- **Tài liệu dài nhưng không có kết luận.** Người đọc phải tự đoán đề xuất là gì. Cách sửa: BLUF, cụ thể hoá bằng số liệu, cắt mọi câu không phục vụ người đọc.

## Bài tập thực hành

1. **Hai phiên bản trình bày.** Lấy một đề xuất kiến trúc thật (hoặc giải pháp MiniMart) và soạn hai phiên bản: 5 slide cho ban lãnh đạo theo template ở trên, và 20 phút trình bày kỹ thuật cho developer. Nhờ một người không làm kỹ thuật nghe bản đầu tiên rồi nhắc lại đề xuất trong một câu.
2. **Phân tích bất đồng.** Chọn một bất đồng gần đây giữa các team. Lập bảng lập trường, lợi ích thật, tiêu chí khách quan cho mỗi bên; đề xuất ít nhất 2 phương án cùng có lợi; viết bản leo thang chung một trang nếu cần.
3. **Review và viết lại.** Review một Pull Request thật bằng Conventional Comments với ít nhất một `praise`, một `question` và một `issue` có giải thích hậu quả. Sau đó chọn một tài liệu kỹ thuật cũ của team, viết lại phần mở đầu theo BLUF và đo xem độ dài giảm được bao nhiêu.

## Tóm tắt

- Soạn nội dung theo người nghe: ban lãnh đạo cần kết luận, lựa chọn, chi phí, rủi ro; developer cần lý do, ranh giới và tình huống lỗi.
- Dùng BLUF hoặc Pyramid Principle và khung SCR; pre-wire với người có ảnh hưởng trước buổi họp quan trọng.
- Đàm phán dựa trên lợi ích, tiêu chí khách quan và nhiều lựa chọn; biết BATNA; leo thang chung khi bế tắc.
- Mentoring bằng câu hỏi, giao quyết định vừa sức và review; dùng checklist khi review thiết kế.
- Review code ở góc nhìn kiến trúc với Conventional Comments: nêu vấn đề, hậu quả, gợi ý, và khen cụ thể.
- Viết ngắn, cụ thể, kết luận trước; mỗi câu phải giúp người đọc hiểu hoặc quyết định.
