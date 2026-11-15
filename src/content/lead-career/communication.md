Khi còn là developer, phần lớn giá trị của bạn nằm trong code. Lên Dev Lead, phần lớn thời gian lại dành cho việc viết, nói, họp và thuyết phục: giải thích cho PO vì sao cần hai sprint để nâng cấp Spring Boot, viết design doc cho team review, gửi email báo sự cố cho khách hàng, nhờ team khác sửa API giúp mình. Một thông điệp mơ hồ của lead có thể khiến cả team làm sai hướng cả tuần, còn một cuộc họp không có kết luận sẽ làm quyết định treo lơ lửng. Bài này biến giao tiếp thành những kỹ năng có khung và template cụ thể để bạn luyện tập.

## Mục tiêu bài học

- Viết email, tin nhắn, báo cáo và design doc ngắn gọn, đưa kết luận lên đầu, để người đọc biết ngay cần làm gì.
- Giải thích vấn đề kỹ thuật cho người không chuyên bằng ngôn ngữ tác động: thời gian, tiền, rủi ro, khách hàng.
- Gây ảnh hưởng không cần quyền lực: hiểu lợi ích của đối phương, xây quan hệ trước khi cần, dùng dữ liệu thay vì tranh cãi.
- Điều phối cuộc họp có mục tiêu, có agenda, có người quyết định và kết thúc bằng biên bản rõ ràng.

## Ba câu hỏi trước mọi thông điệp

Trước khi viết một email hay bước vào một buổi trình bày, hãy tự trả lời ba câu:

1. **Ai là người nhận?** PO, khách hàng, CTO, QA hay developer trong team? Mỗi người có mối quan tâm và vốn từ khác nhau.
2. **Sau khi đọc hoặc nghe, họ cần làm gì?** Biết thông tin (FYI), cho ý kiến, ra quyết định, hay hành động cụ thể?
3. **Họ đã biết gì rồi?** Người mới vào dự án cần bối cảnh, còn người đã theo từ đầu thì chỉ cần phần thay đổi.

Nếu chưa trả lời được câu thứ hai, thường là bạn chưa sẵn sàng để gửi.

## Viết rõ ràng, súc tích

### Năm nguyên tắc

- **Kết luận trước (BLUF):** BLUF là viết tắt của *Bottom Line Up Front*, nghĩa là đặt điều quan trọng nhất ở câu đầu tiên. Người đọc bận có thể chỉ đọc hai dòng đầu.
- **Một thông điệp, một mục đích:** đừng gộp "báo cáo tiến độ", "xin duyệt nghỉ phép" và "hỏi ý kiến thiết kế" vào cùng một email.
- **Cụ thể thay cho mơ hồ:** "p95 của API thanh toán tăng từ 300 ms lên 2 s từ 19h đến 21h" thay vì "hệ thống hơi chậm vào buổi tối".
- **Viết cho người đọc lướt:** tiêu đề rõ, gạch đầu dòng, in đậm phần cần hành động, dùng bảng khi so sánh.
- **Cắt bỏ:** đọc lại một lần và xoá mọi câu không giúp người đọc hiểu hoặc quyết định.

### Email xin quyết định

```text
Tiêu đề: [Cần quyết định trước 15/8] Phương án nâng cấp Spring Boot 3 cho Payment Service

Chào anh Phong,

Em cần anh chọn một trong hai phương án dưới đây trước thứ Sáu 15/8
để team kịp lên kế hoạch Sprint 18.

Bối cảnh: Payment Service đang chạy Spring Boot 2.7, bản này đã hết hỗ trợ
miễn phí (OSS) nên không còn bản vá bảo mật công khai. Đợt kiểm tra bảo mật
của khách hàng vào tháng 10 nhiều khả năng sẽ đánh dấu đây là rủi ro.

Phương án A: Nâng cấp trong Sprint 18–19 (khoảng 2 sprint), tạm dừng tính năng
             báo cáo đối soát mới. Không ảnh hưởng go-live ví B.
Phương án B: Làm tính năng báo cáo trước, nâng cấp từ Sprint 20.
             Rủi ro: chưa kịp xong trước đợt kiểm tra tháng 10.

Đề xuất của em: Phương án A, vì báo cáo đối soát có thể lùi 2 tuần
mà khách hàng đã đồng ý, còn kết quả kiểm tra bảo mật thì không lùi được.

Nếu cần trao đổi thêm, em có thể gặp anh 15 phút vào chiều thứ Tư.

Cảm ơn anh,
Tuấn
```

Hãy để ý: tiêu đề cho biết loại email và hạn chót, câu đầu tiên nói rõ cần gì, mỗi phương án đều có tác động, và người viết dám đưa ra đề xuất của mình.

### Tin nhắn Slack/Teams

Tin nhắn chat cũng cần nguyên tắc như email, chỉ ngắn hơn. Lỗi phổ biến nhất là nhắn "Anh ơi" rồi chờ người kia trả lời mới nói tiếp, khiến người nhận bị gián đoạn hai lần.

```text
TRƯỚC:
  10:02  Anh Long ơi
  10:15  Anh rảnh không ạ
  10:31  Em hỏi chút về Kafka

SAU:
  Anh Long, em hỏi về consumer group của topic payment-events (không gấp,
  trong hôm nay là được ạ).
  - Hiện tượng: sau mỗi lần deploy, consumer rebalance khoảng 2 phút, lag tăng lên 50k.
  - Em đã thử: tăng max.poll.interval.ms lên 10 phút, vẫn bị.
  - Em cần: anh xem giúp cấu hình em gửi kèm có thiếu gì không,
    hoặc chỉ em người nên hỏi.
```

Một tin nhắn đầy đủ gồm: bối cảnh, những gì đã thử, điều cần và mức độ gấp. Người nhận có thể trả lời ngay mà không cần hỏi lại.

### Báo cáo tuần gửi cấp trên

Báo cáo cho stakeholder bên ngoài team (có trạng thái RAG, rủi ro, dự báo) đã được trình bày trong bài *Làm việc với Stakeholder*. Với cấp trên trực tiếp của bạn, một bản cập nhật ngắn hằng tuần giúp họ không bị bất ngờ và biết cách hỗ trợ bạn:

```text
Cập nhật tuần 32 — Team Payment

1. Kết quả nổi bật    : Ví A đã chạy trên production, 0 sự cố sau 3 ngày.
2. Rủi ro / lo ngại   : Long nghỉ phép 2 tuần từ 25/8, kiến thức đối soát
                        chưa được chuyển giao hết (đang viết runbook).
3. Cần anh hỗ trợ     : Duyệt thêm 1 slot QA cho đợt regression tháng 9.
4. Con người          : Hùng tiến bộ rõ ở Spring Batch sau 2 tuần pair.
5. Tuần tới           : Test tải bằng Gatling, chốt design báo cáo đối soát.
```

Phần "Cần anh hỗ trợ" là quan trọng nhất. Nếu tuần nào cũng để trống, có thể bạn đang ôm việc thay vì nhờ đúng người.

### Design doc ngắn cho một tính năng

Với thay đổi lớn, hãy dùng template RFC đầy đủ trong bài *Ra quyết định kỹ thuật*. Với tính năng cỡ vừa (một đến ba sprint), một design doc vài trang là đủ:

```text
Design doc: Hoàn tiền một phần cho đơn hàng
Tác giả: Minh | Reviewer: Tuấn (lead), chị Hương (QA), anh Khoa (SA) | Hạn góp ý: 22/8

1. Tóm tắt        : 3 câu — làm gì, cho ai, thay đổi chính ở đâu
2. Mục tiêu       : Hỗ trợ hoàn tiền nhiều lần cho một đơn, tổng không vượt số đã trả
3. Ngoài phạm vi  : Không hỗ trợ hoàn tiền cho đơn trả góp ở giai đoạn này
4. Thiết kế       : Sơ đồ luồng, thay đổi API, bảng refund mới, luồng lỗi
5. Phương án khác : Sửa trực tiếp bảng payment (bị loại vì khó audit)
6. Câu hỏi mở     : Có cần duyệt hai cấp với khoản hoàn trên 50 triệu không?
```

Ba điểm giúp design doc thực sự được đọc: mục **Ngoài phạm vi** (non-goals) để tránh tranh luận lan man, mục **Câu hỏi mở** để reviewer biết chỗ cần góp ý, và **reviewer có tên kèm hạn góp ý** thay vì "mọi người xem giúp".

## Trình bày vấn đề kỹ thuật cho người không chuyên

PO, giám đốc kinh doanh hay khách hàng không cần hiểu `HikariCP` hay việc chuyển `javax` sang `jakarta`. Họ cần hiểu điều đó ảnh hưởng thế nào đến mục tiêu của họ, và họ phải quyết định gì.

### Nói bằng ngôn ngữ tác động

| Cách nói kỹ thuật | Cách nói theo tác động |
|---|---|
| "Connection pool bị cạn vào giờ cao điểm." | "Từ 19h đến 21h, khoảng một phần mười khách thanh toán phải chờ hơn 5 giây, một số bỏ giỏ hàng." |
| "Codebase có nhiều nợ kỹ thuật." | "Mỗi tính năng mới ở module đơn hàng hiện mất gần gấp đôi thời gian so với module khác, và hay phát sinh lỗi ở chỗ cũ." |
| "Bảng orders thiếu index cho cột customer_id." | "Mỗi lần bộ phận chăm sóc khách hàng tra cứu đơn mất khoảng 8 giây; một thay đổi nhỏ ở database có thể đưa xuống dưới 1 giây." |
| "Cần thêm idempotency key cho API callback." | "Hiện tại nếu đối tác gửi lại thông báo, khách có thể bị cộng tiền hai lần." |

Các con số trong ví dụ là minh hoạ; khi nói thật, hãy dùng số liệu từ hệ thống giám sát của bạn và nói rõ nguồn.

### Khung bốn bước

```text
1. Vấn đề     : Một câu, không thuật ngữ. "Hệ thống thanh toán có điểm yếu..."
2. Tác động   : Ảnh hưởng đến khách hàng, doanh thu, thời gian hoặc rủi ro.
3. Phương án  : 2–3 lựa chọn, mỗi lựa chọn kèm chi phí (thời gian, người) và rủi ro.
4. Đề xuất    : Bạn chọn gì, vì sao, và cần người nghe quyết định điều gì.
```

### Dùng phép so sánh vừa đủ

Phép so sánh giúp người nghe nắm ý nhanh: nợ kỹ thuật giống khoản vay, càng để lâu tiền lãi (thời gian sửa lỗi, làm tính năng chậm) càng lớn; connection pool giống số quầy giao dịch ở ngân hàng, khách đông mà ít quầy thì phải xếp hàng. Nhưng đừng kéo phép so sánh đi quá xa, vì đến một lúc nó sẽ không còn đúng với hệ thống thật.

### Kiểm tra mức hiểu

Đừng hỏi "Anh/chị hiểu không ạ?", vì câu trả lời gần như luôn là "Hiểu". Hãy hỏi: "Anh thấy phương án nào hợp với kế hoạch quý của bên kinh doanh hơn?". Câu trả lời sẽ cho bạn biết họ đã nắm vấn đề đến đâu.

> **PO (chị Mai):** Sao nâng cấp phiên bản mà mất tận hai sprint? Có thêm tính năng gì cho khách đâu em?
>
> **Lead:** Dạ đúng, khách sẽ không thấy tính năng mới. Nhưng bản Spring Boot mình đang dùng không còn được vá lỗi bảo mật miễn phí. Tháng 10 ngân hàng đối tác kiểm tra bảo mật, nếu họ đánh dấu rủi ro này thì có thể chậm ký gia hạn hợp đồng. Hai sprint là vì phải sửa khá nhiều chỗ trong code và test lại toàn bộ luồng thanh toán.
>
> **PO:** Không làm từng phần được à?
>
> **Lead:** Được chị. Em có thể chia ra: sprint đầu nâng cấp và chạy song song trên staging, sprint sau mới chuyển production. Như vậy chị vẫn còn một nửa năng lực team cho báo cáo đối soát. Chị thấy phương án đó có hợp với kế hoạch quý của chị không?

## Gây ảnh hưởng không cần quyền lực

**Influence without authority** (gây ảnh hưởng không cần quyền lực) là khả năng khiến người khác đồng ý và hành động khi bạn không phải là sếp của họ. Lead làm việc này hằng ngày: nhờ team Platform nâng cấp Kafka, thuyết phục SA chấp nhận một thay đổi thiết kế, đề nghị QA đổi lịch test, hay thậm chí thuyết phục một senior trong team áp dụng chuẩn code mới.

### Nguồn ảnh hưởng của một lead

- **Uy tín chuyên môn:** những đề xuất trước đây của bạn có đúng không, bạn có hiểu sâu vấn đề không.
- **Giữ lời:** hứa gửi tài liệu thứ Sáu thì gửi thứ Sáu. Uy tín được xây từ nhiều lời hứa nhỏ.
- **Quan hệ:** người ta dễ giúp người mình quen và tin hơn người chỉ xuất hiện khi cần nhờ.
- **Dữ liệu:** số liệu đo được thuyết phục hơn ý kiến cá nhân.

### Mô hình trao đổi của Cohen và Bradford

Trong cuốn *Influence Without Authority*, Allan Cohen và David Bradford mô tả ảnh hưởng như một cuộc trao đổi: người khác giúp bạn khi họ nhận lại điều họ coi trọng. Những thứ được trao đổi, các tác giả gọi là **currency** (đồng tiền), không nhất thiết là vật chất. Có thể tóm tắt thành các bước:

```text
1. Coi đối phương là đồng minh tiềm năng, không phải đối thủ
2. Làm rõ mục tiêu của mình: cần gì, tối thiểu là gì
3. Hiểu thế giới của họ: KPI, áp lực, ai đánh giá họ, họ đang lo điều gì
4. Xác định "đồng tiền" họ coi trọng và bạn có thể đưa, ví dụ:
   - Công việc: thêm người hỗ trợ, giảm việc, thông tin sớm, gỡ rủi ro họ lo
   - Vị thế: được ghi nhận, được lãnh đạo biết đến
   - Quan hệ: được lắng nghe, được hỏi ý kiến sớm
   - Cảm hứng: được góp phần vào một mục tiêu lớn hơn, làm điều đúng
5. Xem quan hệ hiện tại: đã có niềm tin chưa, hay cần xây trước?
6. Đề xuất trao đổi: điều bạn đưa và điều bạn nhận
```

### Ví dụ: nhờ team khác làm API mới

Team Order của Tuấn cần team Customer cung cấp API lấy thông tin nhiều khách hàng một lần, thay vì gọi từng người. Team Customer đang kín việc đến hết quý.

> **Tuấn:** Anh Quân, em thấy tuần trước team anh bị cảnh báo CPU cao hai lần, phần lớn là do Order Service gọi `GET /customers/{id}` từng người một khi xuất báo cáo. Em muốn sửa dứt điểm chuyện này.
>
> **Quân:** Đúng rồi, bên anh cũng bực vụ đó. Nhưng quý này anh không còn người làm API mới đâu.
>
> **Tuấn:** Em hiểu. Vậy để Minh bên em viết API batch luôn, theo đúng chuẩn code của team anh, bên anh chỉ cần review PR thôi. Em gửi anh bản thiết kế API trước, anh duyệt rồi Minh mới làm. Xong việc, em sẽ ghi rõ trong release note là hai team cùng làm.
>
> **Quân:** Vậy thì được. Gửi anh bản thiết kế trước thứ Tư nhé.

Tuấn không ra lệnh, cũng không leo thang ngay. Tuấn bắt đầu từ nỗi đau của team Customer (cảnh báo CPU), đưa ra "đồng tiền" họ cần (giảm việc, giảm sự cố, được ghi nhận), và để họ giữ quyền kiểm soát (duyệt thiết kế, review PR).

### Kỹ thuật thực tế

- **Xây quan hệ trước khi cần:** hỏi thăm, giúp review, chia sẻ thông tin hữu ích cho các team lân cận. Đừng để lần đầu nói chuyện là lần đi nhờ.
- **Gặp riêng trước cuộc họp lớn:** trao đổi trước với người có ảnh hưởng hoặc có khả năng phản đối để không ai bị bất ngờ trước đám đông.
- **Thử nhỏ thay vì tranh luận lớn:** "Mình thử Testcontainers cho một service trong hai sprint, rồi so sánh số lỗi lọt ra staging" dễ được chấp nhận hơn "cả công ty phải đổi cách test".
- **Cho người khác đồng sở hữu ý tưởng:** xin góp ý sớm và thật sự sửa theo góp ý. Người đã đóng góp vào ý tưởng thường sẽ bảo vệ nó.
- **Biết lúc dừng:** nếu đã thử thuyết phục mà không được, hãy chấp nhận quyết định chung (*disagree and commit*, xem bài *Ra quyết định kỹ thuật*) hoặc escalate đúng kênh (xem bài *Làm việc với Stakeholder*).

## Điều phối cuộc họp hiệu quả

### Trước họp: có cần họp không?

Nếu chỉ để thông báo, hãy viết. Chỉ họp khi cần **thảo luận, giải quyết bất đồng hoặc ra quyết định**. Khi đã quyết định họp, lời mời cần có:

```text
Tiêu đề : Chốt phương án lưu lịch sử giao dịch (45 phút)
Mục tiêu: Cuối buổi chọn được 1 trong 2 phương án: bảng partition theo tháng
          hay tách sang kho lưu trữ riêng
Cần đọc trước: Design doc (link), mục 4 và 5, khoảng 10 phút
Người quyết định: anh Khoa (SA), sau khi nghe ý kiến team
Agenda:
  5'  Nhắc lại mục tiêu, ràng buộc (Tuấn)
  15' Câu hỏi về hai phương án (cả nhóm)
  15' Thảo luận đánh đổi: chi phí, thời gian truy vấn, độ phức tạp vận hành
  10' Chốt quyết định, giao việc tiếp theo
Thành phần: Khoa (quyết định), Tuấn (điều phối), Minh (tác giả), Hương (QA)
```

Hãy mời ít người nhất có thể. Những ai chỉ cần biết kết quả thì sẽ nhận biên bản.

### Trong họp

- **Bắt đầu đúng giờ, nhắc lại mục tiêu** trong câu đầu tiên: "Hôm nay mình cần chốt phương án lưu lịch sử giao dịch."
- **Phân vai:** người điều phối (giữ agenda và thời gian), người ghi chép, người quyết định. Người điều phối không nên là người nói nhiều nhất.
- **Bãi đỗ (parking lot):** khi có ý lạc đề, ghi lại và hẹn xử lý sau: "Ý về chiến lược backup quan trọng, mình ghi vào parking lot và hẹn riêng 15 phút nhé."
- **Mời người ít nói:** trong nhiều team, junior thường ngại phát biểu trước senior hoặc SA. Hãy hỏi từng người theo vòng, hoặc để junior nói trước senior.
- **Tóm tắt trước khi kết thúc:** đọc to quyết định và action item, hỏi "Có ai hiểu khác không?".

Nếu hết giờ mà chưa chốt được, đừng kéo dài. Hãy xác định rõ còn thiếu thông tin gì, ai đi tìm, và khi nào quyết định.

### Sau họp: biên bản trong 24 giờ

```text
Biên bản: Chốt phương án lưu lịch sử giao dịch — 20/8

Quyết định:
  - Dùng bảng partition theo tháng trên PostgreSQL. Người quyết: anh Khoa.
  - Lý do: đủ đáp ứng truy vấn 24 tháng, không thêm hệ thống mới cần vận hành.
  - Xem xét lại khi dữ liệu vượt 2 năm hoặc có yêu cầu phân tích phức tạp.

Action item:
  - [ ] Minh — viết ADR-014 — 22/8
  - [ ] Minh — PoC migration với dữ liệu 6 tháng — 29/8
  - [ ] Hương — bổ sung test case truy vấn theo khoảng ngày — 29/8

Câu hỏi mở / parking lot:
  - Chiến lược backup cho partition cũ — Tuấn hẹn anh Long tuần sau
```

Biên bản ngắn mà gửi ngay có giá trị hơn biên bản đầy đủ mà gửi sau ba ngày. Khi có tranh cãi "hôm đó mình chốt thế nào nhỉ?", biên bản chính là câu trả lời.

## Lỗi thường gặp

- **Kể chuyện theo thứ tự thời gian, kết luận để cuối.** Cách sửa: viết câu "Em cần anh..." hoặc "Kết luận là..." lên đầu, rồi mới đến bối cảnh.
- **Dùng thuật ngữ với người không chuyên.** Cách sửa: chuyển sang tác động (khách hàng, thời gian, tiền, rủi ro) và nhờ một người ngoài team đọc thử.
- **Chỉ đưa vấn đề, không đưa phương án.** Cách sửa: luôn kèm 2–3 phương án và đề xuất của bạn; người quyết định vẫn có quyền chọn khác.
- **Gây ảnh hưởng bằng cách gây áp lực.** "Sếp bảo làm" hay leo thang ngay lần đầu có thể được việc một lần, nhưng làm mất quan hệ lâu dài. Cách sửa: tìm hiểu lợi ích của đối phương trước.
- **Họp không có mục tiêu và người quyết định.** Cách sửa: không có mục tiêu rõ thì không gửi lời mời; ghi tên người quyết định ngay trong lời mời.
- **Họp xong không ai ghi lại.** Cách sửa: chỉ định người ghi chép từ đầu, gửi biên bản trong 24 giờ.
- **Gửi tin nhắn "Anh ơi" rồi chờ.** Cách sửa: viết đầy đủ câu hỏi, những gì đã thử và mức độ gấp trong một tin.

## Bài tập thực hành

1. **Viết lại ba email:** Chọn ba email hoặc tin nhắn bạn gửi trong tháng qua. Viết lại theo BLUF: tiêu đề có loại và hạn, câu đầu nói rõ điều cần, phần còn lại không quá 10 dòng. So sánh độ dài trước và sau.
2. **Giải thích cho người ngoài ngành:** Chọn một vấn đề kỹ thuật đang có trong dự án (nợ kỹ thuật, nâng cấp phiên bản, một sự cố gần đây). Trình bày theo khung bốn bước cho PO hoặc một người bạn không làm IT, trong không quá 3 phút. Sau đó nhờ họ nhắc lại vấn đề bằng lời của họ.
3. **Điều phối một cuộc họp quyết định:** Với cuộc họp tiếp theo do bạn tổ chức, gửi lời mời theo template (mục tiêu, tài liệu đọc trước, người quyết định, agenda có thời lượng), và gửi biên bản trong 24 giờ. Cuối tuần, tự đánh giá: cuộc họp có kết thúc với một quyết định không?

## Tóm tắt

- Trước mọi thông điệp, hãy trả lời: ai nhận, họ cần làm gì sau đó, họ đã biết gì rồi.
- Viết theo BLUF: kết luận và yêu cầu ở câu đầu, cụ thể bằng số liệu, viết cho người đọc lướt.
- Design doc được đọc khi có mục ngoài phạm vi, câu hỏi mở, reviewer có tên và hạn góp ý.
- Với người không chuyên, hãy nói bằng tác động và theo khung: vấn đề, tác động, phương án, đề xuất.
- Ảnh hưởng không cần quyền lực dựa trên uy tín, quan hệ và dữ liệu; hãy hiểu điều đối phương coi trọng rồi đề xuất một trao đổi có lợi cho cả hai.
- Chỉ họp khi cần thảo luận hoặc quyết định; luôn có mục tiêu, agenda, người quyết định và biên bản gửi trong 24 giờ.
