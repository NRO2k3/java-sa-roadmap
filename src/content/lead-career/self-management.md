Nhiều Dev Lead mới vẫn giữ thói quen của một senior giỏi: nhận task khó nhất, tự review mọi PR, trả lời mọi câu hỏi trên Slack. Vài tháng sau, lịch ban ngày kín họp, tối về mới có thời gian code, còn team thì ngồi chờ lead duyệt. Lúc đó, chính lead đã trở thành nút cổ chai (bottleneck) của team. Quản lý bản thân là quản lý thời gian, năng lượng và thứ tự ưu tiên của chính bạn, để team không phải phụ thuộc vào việc bạn rảnh hay bận.

## Mục tiêu bài học

- Hiểu những gì thay đổi khi chuyển từ IC sang lead, và thống nhất tỉ lệ code với dẫn dắt phù hợp với quy mô team.
- Chọn đúng loại việc code để vẫn giữ tay nghề mà không chặn tiến độ của team.
- Bảo vệ thời gian tập trung cho bạn và cho team theo mô hình maker schedule và manager schedule.
- Ưu tiên công việc bằng ma trận Eisenhower, lập kế hoạch tuần và uỷ quyền đúng việc.
- Xây dựng mạng lưới hỗ trợ gồm mentor, sponsor, đồng nghiệp ngang cấp và cộng đồng lead.

## Từ IC sang lead: thước đo thành công thay đổi

**IC** (*individual contributor*, người đóng góp cá nhân) là người tạo giá trị chủ yếu bằng công việc chuyên môn của chính mình, như viết code, thiết kế hay test, chứ không qua việc dẫn dắt người khác. Khi lên lead, bạn vẫn có thể code, nhưng thước đo đã khác:

| Khía cạnh | Khi là IC | Khi là lead |
|---|---|---|
| Thành công là | Task của mình xong, chất lượng tốt | Cả team giao hàng đều đặn, từng người tiến bộ |
| Phản hồi | Nhanh: test xanh, PR được merge trong ngày | Chậm: vài tuần, vài tháng mới thấy kết quả |
| Ngày làm việc | Khối thời gian dài để code | Nhiều cuộc họp và trao đổi ngắn, bị gián đoạn liên tục |
| Giá trị lớn nhất | Giải quyết vấn đề khó | Giúp người khác giải quyết được vấn đề khó |
| Rủi ro | Làm sai một module | Làm cả team đi sai hướng hoặc phải chờ mình |

Vì phản hồi chậm, nhiều lead mới hay có cảm giác "hôm nay chẳng làm được gì" sau một ngày toàn họp và 1:1. Hãy ghi lại những kết quả của vai trò lead: một quyết định đã được chốt, một junior tự xử lý được sự cố, một rủi ro được phát hiện sớm. Đó cũng là nguyên liệu cho portfolio lãnh đạo sau này (xem bài *Hướng phát triển tiếp theo*).

## Cân bằng thời gian code và thời gian dẫn dắt

### Tỉ lệ phụ thuộc vào bối cảnh

Không có con số chuẩn chung cho mọi công ty. Kỳ vọng phụ thuộc vào mô tả công việc, quy mô team và việc có Engineering Manager hay PM riêng hay không. Bảng dưới đây chỉ là điểm khởi đầu để bạn thảo luận với cấp trên:

| Bối cảnh | Gợi ý thời gian code | Trọng tâm còn lại |
|---|---|---|
| Team 3–4 người, lead kiêm senior chính | Phần lớn thời gian | Review, thiết kế, hỗ trợ junior |
| Team 5–8 người | Khoảng một phần ba đến một nửa | 1:1, kế hoạch sprint, stakeholder, review thiết kế |
| Team trên 8 người hoặc nhiều team | Ít, chủ yếu spike và review | Con người, tuyển dụng, phối hợp liên team |

> **Lưu ý:** Hãy hỏi thẳng cấp trên trong buổi 1:1 đầu tiên sau khi nhận vai trò: "Anh kỳ vọng em dành bao nhiêu thời gian cho code và bao nhiêu cho việc dẫn dắt team?". Rất nhiều căng thẳng của lead mới đến từ việc hai bên kỳ vọng khác nhau mà không ai nói ra.

### Chọn đúng loại việc code

Lead bị gián đoạn liên tục: một cuộc gọi từ khách hàng, một sự cố production, một buổi phỏng vấn đột xuất. Vì vậy, task nằm trên đường găng (*critical path*, chuỗi công việc quyết định ngày hoàn thành) mà để lead làm thì rất dễ trễ.

| Nên nhận | Nên tránh |
|---|---|
| Spike (tìm hiểu kỹ thuật có giới hạn thời gian), PoC (bản thử khả thi) trước khi team áp dụng công nghệ mới | Story lớn trên đường găng có deadline sát |
| Cải thiện công cụ: pipeline CI, script, template service | Tính năng mà chỉ mình bạn hiểu và không ai review được |
| Sửa bug không gấp, refactor nhỏ, viết thêm test | Task cần nhiều ngày tập trung liên tục |
| Pair programming với thành viên đang vướng | Tự sửa lại code của người khác mà không nói với họ |
| Review PR và thiết kế, có cam kết thời gian phản hồi | Ôm hết các phần "khó và thú vị" |

Code vẫn quan trọng: nó giúp bạn hiểu codebase, ước lượng sát hơn và giữ uy tín kỹ thuật. Nhưng mục đích của code lúc này là **giữ bối cảnh**, không phải để tăng tốc độ của team bằng sức một người.

### Dấu hiệu bạn đang là nút cổ chai

```text
Checklist tự kiểm tra (đánh dấu nếu đúng)
[ ] PR thường chờ bạn review quá 1 ngày làm việc
[ ] Chỉ bạn biết cách deploy hoặc xử lý một loại sự cố
[ ] Thành viên hỏi bạn trước khi quyết định cả những việc nhỏ
[ ] Bạn thường xuyên code vào buổi tối hoặc cuối tuần để kịp task của mình
[ ] Bạn không dám nghỉ phép một tuần mà không mở laptop
[ ] Cuộc họp bị hoãn vì bạn không tham dự được
Từ 2 dấu trở lên: đã đến lúc uỷ quyền và chuyển giao kiến thức.
```

Cách gỡ: viết runbook (tài liệu hướng dẫn xử lý từng bước) cho các việc chỉ bạn biết, luân phiên người trực sự cố và người deploy, cho phép một senior khác cùng duyệt PR, và làm rõ những loại quyết định nào team được tự quyết (bảng uỷ quyền trong bài *Mentoring & Uỷ quyền*).

> **Tuấn (lead):** Anh Phong, sprint này em định nhận story tích hợp ví B, vì phần này phức tạp nhất.
>
> **Phong (manager):** Tuần sau em có ba buổi phỏng vấn và họp kiểm tra bảo mật với khách hàng mà. Nếu em bị kéo đi giữa chừng thì ai làm tiếp?
>
> **Tuấn:** Dạ đúng, như vậy dễ trễ thật. Em sẽ giao story đó cho Minh, em pair với Minh hai buổi đầu để thống nhất thiết kế, còn em nhận phần viết test tích hợp bằng WireMock, phần đó không nằm trên đường găng.

## Bảo vệ thời gian tập trung: maker và manager schedule

Trong bài *Maker's Schedule, Manager's Schedule*, Paul Graham phân biệt hai kiểu lịch:

- **Manager schedule** (lịch của người quản lý): ngày được chia thành từng khung một giờ. Thêm một cuộc họp chỉ là tìm một ô trống.
- **Maker schedule** (lịch của người làm ra sản phẩm, như lập trình viên, người viết): cần khối thời gian dài, ít nhất nửa ngày, để vào được trạng thái tập trung. Một cuộc họp đặt giữa buổi chiều có thể cắt buổi đó thành hai mảnh, mảnh nào cũng quá ngắn để làm việc khó.

Dev Lead sống giữa hai kiểu lịch này. Bạn vừa cần thời gian tập trung để review thiết kế, viết design doc hay code, vừa phải có mặt ở nhiều cuộc họp. Quan trọng hơn, bạn có trách nhiệm **bảo vệ maker schedule cho team**.

### Thiết kế lịch tuần

```text
Lịch mẫu của một Dev Lead (team 6 người)

          Sáng (9h–12h)                Chiều (13h30–17h30)
Thứ 2    Focus: kế hoạch tuần, review   Sprint planning / refinement, 1:1
Thứ 3    Focus: design doc, code        1:1, họp với PO, phỏng vấn
Thứ 4    Focus: code, review PR         Họp liên team, office hours 16h–17h
Thứ 5    Focus: code, spike             1:1, họp stakeholder
Thứ 6    Focus: review, tài liệu        Demo / retro, nhìn lại tuần

Quy tắc:
- Stand-up 9h00, 15 phút, sau đó là khối tập trung đến 12h
- Họp gom vào buổi chiều; không nhận họp buổi sáng trừ khi có sự cố
- Khối focus được đặt trên calendar như một cuộc họp thật
- Kênh khẩn cấp: sự cố production thì gọi điện, còn lại nhắn Slack
```

Một vài kỹ thuật bổ sung:

- **Office hours:** một khung cố định để team mang câu hỏi đến, thay vì hỏi rải rác cả ngày. Việc khẩn vẫn được hỏi ngay.
- **Gom cuộc họp:** đặt các cuộc họp sát nhau thay vì rải rác, để còn lại những khối trống dài.
- **Tắt thông báo trong khối tập trung** và đặt trạng thái rõ ràng trên Slack/Teams, ví dụ "Đang tập trung đến 11h30, việc gấp xin gọi điện".
- **Một buổi ít họp cho team:** thống nhất với PO và các team khác không đặt họp với developer vào một buổi cố định trong tuần.
- **Ưu tiên giao tiếp bất đồng bộ:** cập nhật tiến độ qua board và tin nhắn thay vì gọi họp.

### Từ chối cuộc họp một cách lịch sự

Trước khi nhận lời mời, hãy hỏi: cuộc họp có mục tiêu rõ không? Có cần chính bạn không, hay một thành viên khác đi sẽ tốt hơn (và cũng là cơ hội phát triển cho họ)? Có thể đọc biên bản thay vì tham dự không?

```text
"Chị Mai ơi, buổi này em thấy chủ yếu là chốt chi tiết UI. Em đề xuất
để Lan đi thay, vì Lan đang làm phần màn hình đó. Nếu có quyết định
liên quan đến API, chị gửi em biên bản là được ạ."
```

## Ưu tiên công việc với ma trận Eisenhower

**Ma trận Eisenhower** xếp công việc theo hai trục: **khẩn cấp** (phải xử lý ngay, có hạn sát) và **quan trọng** (đóng góp vào mục tiêu dài hạn của team). Công cụ này thường được gắn với tên Tổng thống Mỹ Dwight Eisenhower và được Stephen Covey phổ biến rộng rãi trong cuốn *The 7 Habits of Highly Effective People*.

```text
                 KHẨN CẤP                          KHÔNG KHẨN CẤP
            +----------------------------------+----------------------------------+
QUAN TRỌNG  | 1. LÀM NGAY                      | 2. LÊN LỊCH                      |
            | - Sự cố production đang diễn ra  | - 1:1, mentoring cho team        |
            | - Rủi ro chặn go-live tuần này   | - Trả nợ kỹ thuật có kế hoạch    |
            | - Thành viên muốn nghỉ việc      | - Tuyển dụng và onboarding       |
            |                                  | - Design doc cho quý tới         |
            +----------------------------------+----------------------------------+
KHÔNG       | 3. UỶ QUYỀN                      | 4. LOẠI BỎ                       |
QUAN TRỌNG  | - Báo cáo số liệu định kỳ        | - Họp không có agenda, không cần |
(với bạn)   | - Trả lời câu hỏi lặp lại về     |   bạn                            |
            |   môi trường dev                 | - Chỉnh format code bằng tay     |
            | - Một số cuộc họp thông tin      |   (đã có formatter)              |
            +----------------------------------+----------------------------------+
```

Ba điểm cần nhớ:

- **Ô số 2 là nơi phần lớn giá trị của lead nằm.** 1:1, mentoring, trả nợ kỹ thuật hay viết runbook không bao giờ có hạn chót gấp, nên luôn bị việc khẩn đẩy ra ngoài nếu bạn không chủ động xếp lịch cho chúng.
- **Ô số 3 là "không quan trọng để chính bạn làm",** không phải "không quan trọng với team". Một việc lặp lại có thể là cơ hội tốt để một thành viên học thêm.
- **Nếu ô số 1 luôn đầy,** hãy coi đó là tín hiệu có vấn đề hệ thống: thiếu giám sát, thiếu test, thiếu kế hoạch. Đầu tư vào ô số 2 là cách để ô số 1 nhỏ lại.

### Kế hoạch tuần

Dành 30 phút vào sáng thứ Hai (hoặc chiều thứ Sáu) cho việc này:

```text
Kế hoạch tuần 34 — Tuấn

Nhìn lại tuần trước:
  - Đã xong: chốt phương án lưu lịch sử giao dịch, 1:1 đủ 6 người
  - Chưa xong: runbook đối soát (lý do: 2 ngày xử lý sự cố)

3 ưu tiên tuần này (kết quả, không phải hoạt động):
  1. Rủi ro sandbox ví B được escalate và có ngày cụ thể
  2. Minh tự trình bày được design hoàn tiền với SA
  3. Runbook đối soát hoàn thành, Long review

Lịch đã chặn:
  - Focus: sáng T2–T6; 1:1: chiều T3, T5; office hours: T4 16h

Uỷ quyền:
  - Báo cáo số liệu sprint -> Lan (lần đầu, mình review trước khi gửi)
  - Trả lời câu hỏi môi trường dev -> Hùng (đã có tài liệu onboarding)

Không làm tuần này:
  - Không nhận story mới trên đường găng
  - Không tham gia họp UI (Lan đi thay)
```

Danh sách "Không làm" quan trọng không kém danh sách ưu tiên: nó giúp bạn nói "không" với chính mình trước khi phải nói với người khác.

### Uỷ quyền đúng việc

Với mỗi việc đang ôm, hãy hỏi ba câu:

1. **Chỉ mình mới làm được việc này không?** Feedback và đánh giá hiệu suất, quyết định tuyển dụng, ưu tiên với stakeholder, các cuộc nói chuyện nhạy cảm là việc của lead. Phần lớn việc còn lại thì không.
2. **Ai sẽ phát triển nhờ làm việc này?** Một mid dev muốn lên senior có thể dẫn buổi refinement hoặc làm tech design.
3. **Người khác làm được ở mức đủ tốt chưa?** Nếu người khác làm được khoảng tám phần so với bạn, thường đáng để giao. Phần còn lại sẽ được bù bằng việc họ tiến bộ qua mỗi lần làm.

Khi giao, hãy giao **kết quả và ràng buộc**, không giao từng bước; thống nhất mốc kiểm tra; và đừng lấy lại việc ngay khi thấy họ làm khác cách của bạn. Cách chọn mức độ uỷ quyền theo năng lực từng người được trình bày chi tiết trong bài *Mentoring & Uỷ quyền*.

## Năng lượng và giới hạn

Thời gian chỉ là một nửa câu chuyện; nửa còn lại là năng lượng. Một lead kiệt sức sẽ ra quyết định kém, dễ nóng nảy và vô tình đặt chuẩn "làm việc đến khuya là bình thường" cho cả team.

- **Biết giờ làm việc tốt nhất của mình** và xếp việc khó nhất (thiết kế, cuộc nói chuyện khó) vào đó.
- **Đặt ranh giới rõ ràng:** có lịch trực sự cố luân phiên thay vì để lead "trực" 24/7; không trả lời tin nhắn không gấp vào buổi tối.
- **Làm gương:** nếu lead gửi tin nhắn lúc 23h, team sẽ nghĩ họ cũng phải trả lời lúc 23h. Có thể dùng chức năng hẹn giờ gửi.
- **Để ý dấu hiệu quá tải kéo dài** như mất ngủ, dễ cáu, mất hứng thú với công việc. Khi đó, hãy nói chuyện với cấp trên hoặc người bạn tin tưởng, và tìm hỗ trợ chuyên môn nếu cần.

## Xây dựng mạng lưới hỗ trợ

Lead thường khá cô đơn: không tiện than phiền với thành viên trong team, còn cấp trên thì bận. Một mạng lưới hỗ trợ giúp bạn có người để hỏi, để học và để nhìn ra điểm mù của mình.

| Vai trò | Họ giúp bạn thế nào | Tìm ở đâu |
|---|---|---|
| **Mentor** (người hướng dẫn) | Chia sẻ kinh nghiệm thực tế từ người đã đi trước | Lead hoặc manager có kinh nghiệm, trong hoặc ngoài công ty |
| **Coach** (người huấn luyện) | Đặt câu hỏi để bạn tự tìm ra câu trả lời, ít khi đưa lời khuyên trực tiếp | Chương trình coaching nội bộ, coach chuyên nghiệp |
| **Sponsor** (người bảo trợ) | Nhắc đến tên bạn và đề cử bạn vào cơ hội ở những nơi bạn không có mặt | Thường là cấp trên của bạn hoặc lãnh đạo cấp cao hơn |
| **Đồng nghiệp ngang cấp** | Chia sẻ tình huống thực tế, so sánh cách làm, động viên nhau | Các lead khác trong công ty, nhóm lead định kỳ |
| **Cộng đồng** | Mở rộng góc nhìn ra ngoài công ty, cập nhật cách làm mới | Meetup Java/Spring, hội thảo công nghệ, cộng đồng online về engineering leadership như LeadDev hay Rands Leadership Slack |

Sponsor khác mentor ở chỗ: mentor *nói chuyện với bạn*, còn sponsor *nói về bạn* với người khác. Bạn có được sponsor nhờ làm tốt việc và cho họ thấy kết quả, không phải nhờ xin.

### Cách nhờ một người làm mentor

Lời đề nghị cụ thể, có giới hạn thời gian, dễ được nhận lời hơn câu "Anh làm mentor cho em nhé":

```text
"Chào anh Khánh, em là Tuấn, lead team Payment. Em mới lên lead được
3 tháng và đang gặp khó ở việc cân bằng giữa code và quản lý team 6 người.
Em biết anh từng dẫn team Core Banking qua giai đoạn tương tự.
Anh có thể dành 30 phút mỗi tháng trong 3 tháng tới để em hỏi anh
vài tình huống cụ thể không ạ? Em sẽ gửi câu hỏi trước mỗi buổi."
```

Sau mỗi buổi, hãy làm thử ít nhất một điều mentor gợi ý và kể lại kết quả ở buổi sau. Không gì làm mentor vui hơn việc thấy lời khuyên của họ có tác dụng.

### Nhóm lead ngang cấp

Nếu công ty có nhiều Dev Lead, hãy đề xuất một buổi gặp định kỳ (ví dụ mỗi tháng một lần, một tiếng): mỗi buổi một người mang đến một tình huống khó (một thành viên muốn nghỉ, một stakeholder liên tục đổi yêu cầu), cả nhóm cùng thảo luận. Hãy thống nhất giữ kín những chuyện được kể trong buổi đó.

## Lỗi thường gặp

- **Vẫn đo bản thân bằng số dòng code.** Cách sửa: ghi lại kết quả của vai trò lead mỗi tuần (quyết định đã chốt, người đã tiến bộ, rủi ro đã gỡ).
- **Nhận story trên đường găng.** Cách sửa: chọn spike, công cụ, test hoặc bug không gấp; giao story chính cho thành viên và hỗ trợ bằng pair programming.
- **Để lịch bị người khác lấp đầy.** Cách sửa: chặn khối tập trung trên calendar trước khi tuần bắt đầu, gom họp vào buổi chiều.
- **Chỉ làm việc khẩn cấp.** Cách sửa: mỗi tuần xếp lịch cố định cho ít nhất hai việc ở ô số 2 của ma trận Eisenhower.
- **Uỷ quyền rồi lấy lại.** Cách sửa: thống nhất kết quả và mốc kiểm tra từ đầu; góp ý ở mốc kiểm tra thay vì tự làm lại.
- **Chỉ giao việc nhàm chán.** Cách sửa: giao cả những việc có tính thử thách và có cơ hội thể hiện, kèm hỗ trợ phù hợp.
- **Một mình gánh mọi khó khăn.** Cách sửa: chủ động tìm mentor, tham gia nhóm lead ngang cấp, nói chuyện thẳng với cấp trên về khối lượng công việc.

## Bài tập thực hành

1. **Kiểm toán lịch hai tuần:** Xem lại calendar hai tuần vừa qua và phân loại từng khối thời gian: họp, 1:1, code, review, việc đột xuất. Tính tỉ lệ, so với kỳ vọng đã thống nhất với cấp trên, và chọn hai thay đổi cho tuần tới (ví dụ chặn ba buổi sáng tập trung, từ chối một cuộc họp định kỳ).
2. **Ma trận Eisenhower của bạn:** Liệt kê mọi việc đang ôm (thường từ 20 đến 30 việc), xếp vào bốn ô. Với mỗi việc ở ô số 3, ghi tên người sẽ nhận và ngày bàn giao. Với ô số 4, gửi lời từ chối hoặc huỷ trong tuần này.
3. **Tìm một mentor:** Xác định một kỹ năng lãnh đạo bạn muốn cải thiện nhất trong ba tháng tới, chọn một người phù hợp và gửi lời đề nghị theo mẫu trên. Chuẩn bị ba câu hỏi cụ thể cho buổi đầu tiên.

## Tóm tắt

- Khi lên lead, thước đo chuyển từ việc của bạn sang kết quả của cả team, và phản hồi đến chậm hơn nhiều.
- Thống nhất rõ với cấp trên tỉ lệ code và dẫn dắt; chọn việc code không nằm trên đường găng.
- Nếu PR chờ bạn, chỉ bạn biết deploy, hay bạn không dám nghỉ phép, bạn đang là nút cổ chai: hãy chuyển giao và uỷ quyền.
- Bảo vệ maker schedule cho bạn và cho team: chặn khối tập trung, gom họp, mở office hours, ưu tiên giao tiếp bất đồng bộ.
- Dùng ma trận Eisenhower để chủ động xếp lịch cho việc quan trọng mà không khẩn cấp, nơi phần lớn giá trị của lead nằm.
- Uỷ quyền những việc người khác làm được và sẽ giúp họ phát triển; giữ lại những việc chỉ lead mới làm được.
- Xây mạng lưới gồm mentor, coach, sponsor, đồng nghiệp ngang cấp và cộng đồng; đừng gánh mọi khó khăn một mình.
