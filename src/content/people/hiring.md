Tuyển sai một người có thể khiến team mất nhiều tháng: thời gian phỏng vấn, thời gian kèm cặp, chất lượng code giảm, và cả những cuộc trò chuyện khó sau đó. Tuyển đúng người nhưng onboarding kém thì người giỏi cũng mất hàng tháng mới đóng góp được, thậm chí nghỉ ngay trong thời gian thử việc. Là Dev Lead, bạn thường là người viết yêu cầu tuyển dụng, phỏng vấn kỹ thuật và chịu trách nhiệm đưa người mới vào guồng. Bài này giúp bạn làm những việc đó có hệ thống thay vì dựa vào cảm tính.

## Mục tiêu bài học

- Viết JD (Job Description, mô tả công việc) xuất phát từ năng lực cần có, không phải từ danh sách công nghệ.
- Thiết kế quy trình phỏng vấn có cấu trúc gồm ba vòng: coding Java, system design và behavioral.
- Dùng scorecard và quy trình debrief để đánh giá khách quan và giảm thiên kiến.
- Xây dựng kế hoạch onboarding 30-60-90 ngày giúp người mới đóng góp nhanh.

## Bắt đầu từ năng lực, không từ JD cũ

Trước khi viết JD, hãy ngồi với manager (và PO nếu cần) để trả lời bốn câu hỏi trong một buổi **hiring kickoff**:

1. **Vì sao cần tuyển?** Để thay người nghỉ, để mở rộng sang sản phẩm mới, hay để bù một kỹ năng còn thiếu trong skill matrix?
2. **Sau 6–12 tháng, người này cần đạt được gì?** Ví dụ: "Tự phụ trách service thanh toán QR, vận hành on-call được."
3. **Năng lực bắt buộc (must-have)** là những gì không thể dạy nhanh trong 2–3 tháng đầu, còn **năng lực mong muốn (nice-to-have)** là những gì có thể học sau.
4. **Cấp độ (level)** là gì, và ngân sách cho cấp độ đó là bao nhiêu?

Từ đó, liệt kê 5–7 **năng lực (competency)** sẽ được đánh giá. Ví dụ với vị trí Senior Java Backend: thiết kế và viết code Java/Spring Boot chất lượng; thiết kế dữ liệu và tối ưu truy vấn; system design và xử lý trade-off; vận hành production; giao tiếp và làm việc nhóm; tinh thần làm chủ (ownership).

### Viết JD rõ ràng

```text
[Senior Java Backend Engineer] — Team Payment

Về team và sản phẩm
  Team 7 người xây dựng nền tảng thanh toán QR cho chuỗi bán lẻ, xử lý
  giao dịch thời gian thực với nhiều ngân hàng đối tác.

Bạn sẽ làm gì (kết quả, không chỉ nhiệm vụ)
  - Thiết kế và phát triển các service Spring Boot xử lý giao dịch
  - Phụ trách một service từ thiết kế đến vận hành production
  - Review code, kèm 1–2 bạn mid/junior

Năng lực bắt buộc
  - Đã xây dựng và vận hành service Java/Spring Boot trên production
  - Thiết kế schema và tối ưu truy vấn trên PostgreSQL/MySQL
  - Hiểu transaction, concurrency và xử lý lỗi khi gọi hệ thống bên ngoài
  - Trao đổi kỹ thuật rõ ràng bằng văn bản với BA, QA, SA

Năng lực mong muốn
  - Kafka hoặc một message broker khác; Docker/Kubernetes
  - Kinh nghiệm nghiệp vụ thanh toán, đối soát

Quy trình tuyển dụng
  Trao đổi 30' → Coding 75' → System design 60' → Behavioral 45'
  Phản hồi kết quả trong vòng 5 ngày làm việc sau vòng cuối

Quyền lợi: [mức lương theo khoảng nếu công ty cho phép công khai], [phúc lợi]
```

Những lỗi thường thấy trong JD:

- **Danh sách công nghệ dài hàng chục mục.** Ứng viên giỏi nhưng khiêm tốn sẽ tự loại mình, còn người liệt kê đủ từ khoá thì chưa chắc làm được việc.
- **Lấy số năm kinh nghiệm làm tiêu chí chính.** "5 năm Java" nói ít hơn "đã vận hành service Spring Boot trên production".
- **Từ ngữ sáo rỗng hoặc mang tính loại trừ**, như "rockstar", "ninja" hay "chịu được áp lực cao".

## Thiết kế phỏng vấn có cấu trúc

**Phỏng vấn có cấu trúc (structured interview)** nghĩa là các ứng viên cùng cấp độ được hỏi cùng bộ câu hỏi hoặc bài tập, được chấm theo một thang điểm định sẵn bởi người phỏng vấn đã được hướng dẫn, và mỗi người chấm độc lập. Ngược lại, phỏng vấn "tự do" ("nói chuyện xem hợp không") dễ bị chi phối bởi cảm tính và thiên kiến.

Trước tiên, lập bảng ánh xạ để đảm bảo mỗi năng lực được đánh giá ít nhất một lần, còn năng lực quan trọng được đánh giá ở hai vòng:

| Năng lực | Coding | System design | Behavioral |
|---|---|---|---|
| Code Java chất lượng, có test | ✔ | | |
| Thiết kế dữ liệu, truy vấn | ✔ | ✔ | |
| System design và trade-off | | ✔ | |
| Vận hành production | | ✔ | ✔ |
| Giao tiếp, làm việc nhóm | ✔ | | ✔ |
| Ownership | | | ✔ |

### Vòng coding Java

- **Dùng bài toán gần với công việc thật**: viết một rate limiter in-memory an toàn đa luồng; refactor một class "god service" và bổ sung unit test; tìm và sửa bug trong một ứng dụng Spring Boot nhỏ; hoặc review một PR có sẵn lỗi.
- **Cho phép dùng IDE và tra tài liệu.** Bạn đang đánh giá khả năng làm việc, không đánh giá trí nhớ cú pháp.
- **Những gì cần quan sát:** cách làm rõ yêu cầu, cách chia nhỏ vấn đề, chất lượng code (đặt tên, xử lý lỗi, cấu trúc), có viết test hay không, hiểu biết về Java (collections, concurrency, `equals`/`hashCode`, stream), và cách giải thích suy nghĩ của mình.
- **Live coding hay take-home?** Live coding cho bạn thấy được quá trình suy nghĩ, nhưng gây áp lực. Take-home cho kết quả gần thực tế hơn, nhưng tốn thời gian của ứng viên và khó biết họ tự làm đến đâu. Nếu dùng take-home, hãy giới hạn trong khoảng 2–3 giờ và dành một buổi để ứng viên giải thích, mở rộng bài của chính mình.
- **Tránh câu đố mẹo** và câu hỏi thuật toán không liên quan đến công việc.

### Vòng system design

- Với senior: "Thiết kế hệ thống xử lý thanh toán QR cho 2.000 cửa hàng, có đối soát cuối ngày với ngân hàng." Với mid: "Thiết kế API và schema cho tính năng hoàn tiền một phần."
- **Những gì cần quan sát:** có hỏi lại yêu cầu chức năng và phi chức năng không; mô hình dữ liệu; cách xử lý lỗi khi gọi đối tác (timeout, retry, idempotency); khả năng mở rộng; và quan trọng nhất là có nêu được trade-off hay không.
- Người phỏng vấn nên chuẩn bị sẵn các "câu hỏi đẩy" (chẳng hạn: "Nếu ngân hàng phản hồi chậm 30 giây thì sao?") và hỏi giống nhau cho mọi ứng viên.

### Vòng behavioral

Câu hỏi behavioral hỏi về **những gì ứng viên đã làm trong quá khứ**, không hỏi họ "sẽ làm gì". Hãy hướng ứng viên trả lời theo cấu trúc **STAR**: Situation (bối cảnh), Task (nhiệm vụ), Action (hành động *của chính họ*), Result (kết quả).

- "Kể về một lần em phát hiện lỗi nghiêm trọng trên production. Em đã làm gì?"
- "Kể về một lần em không đồng ý với quyết định kỹ thuật của lead hoặc SA."
- "Kể về một tính năng em phải học công nghệ mới trong thời gian ngắn."

Câu hỏi đào sâu: "Cụ thể em làm gì, còn team làm gì?", "Nếu làm lại, em sẽ làm khác ở điểm nào?". Ứng viên Việt Nam thường hay nói "chúng em" thay cho "em", nên hãy hỏi lại một cách nhẹ nhàng để tách được đóng góp cá nhân.

## Scorecard và giảm thiên kiến

### Scorecard

Mỗi người phỏng vấn điền scorecard **ngay sau buổi phỏng vấn và trước khi trao đổi với người khác**. Thang 4 điểm không có mức "trung bình" để buộc người chấm phải nghiêng về một phía.

```text
SCORECARD — Senior Java Backend — Vòng: Coding
Ứng viên: ............   Người phỏng vấn: ............   Ngày: ......

Thang điểm: 1 = Rõ ràng chưa đạt | 2 = Chưa đạt | 3 = Đạt | 4 = Vượt kỳ vọng

| Năng lực               | Điểm | Bằng chứng cụ thể (hành vi quan sát được)        |
|------------------------|------|--------------------------------------------------|
| Làm rõ yêu cầu         |      | VD: hỏi về giới hạn theo user hay theo IP         |
| Chất lượng code Java   |      | VD: tách class, đặt tên rõ, xử lý null            |
| Test                   |      | VD: viết test cho case đồng thời                  |
| Giao tiếp khi code     |      | VD: giải thích vì sao chọn ConcurrentHashMap      |

Mô tả mức 3 cho "Chất lượng code": code chạy đúng case chính, cấu trúc rõ,
có xử lý lỗi cơ bản, có ít nhất vài unit test có ý nghĩa.

Đề xuất chung: [ ] Strong No  [ ] No  [ ] Yes  [ ] Strong Yes
Điều còn băn khoăn / cần vòng sau kiểm tra thêm:
```

Phần quan trọng nhất của scorecard là **mô tả cho từng mức điểm** (anchor). Không có mô tả, "3 điểm" của mỗi người phỏng vấn sẽ mang một nghĩa khác nhau.

### Thiên kiến thường gặp

| Thiên kiến | Biểu hiện | Cách giảm |
|---|---|---|
| Hiệu ứng hào quang (halo effect) | Ứng viên từng làm ở công ty lớn nên được chấm cao mọi mặt | Chấm riêng từng năng lực dựa trên bằng chứng |
| Thiên kiến tương đồng (affinity bias) | Thích người cùng trường, cùng quê, cùng sở thích | Bám theo rubric; hội đồng phỏng vấn đa dạng |
| Ấn tượng đầu tiên | Quyết định trong 5 phút đầu rồi tìm lý do để biện minh | Ghi chép hành vi trong suốt buổi, chấm điểm sau cùng |
| Thiên kiến xác nhận | Đọc CV thấy ấn tượng nên chỉ hỏi những câu dễ | Mọi ứng viên cùng bộ câu hỏi |
| Hiệu ứng tương phản | Ứng viên trung bình trông "xuất sắc" khi đứng sau một ứng viên yếu | So với rubric, không so ứng viên với nhau |
| Ảnh hưởng của người có chức vụ | Mọi người đồng ý theo ý kiến của manager | Nộp scorecard trước; người ít thâm niên nói trước |

### Debrief

1. Mọi người nộp scorecard trước khi họp.
2. Người điều phối đi qua **từng năng lực**, từng người đọc bằng chứng của mình.
3. Ý kiến trái chiều phải dựa trên bằng chứng, không dựa trên "cảm giác".
4. Hiring manager quyết định và ghi lại lý do. Nếu thiếu bằng chứng ở một năng lực bắt buộc, hãy nói rõ là thiếu thay vì đoán.

## Onboarding 30-60-90 ngày

Onboarding tốt bắt đầu **trước ngày đầu tiên**. Ở nhiều công ty Việt Nam, ứng viên phải báo trước với công ty cũ khoảng 30–45 ngày, đây là khoảng thời gian tốt để chuẩn bị: laptop, tài khoản (Git, Jira, Confluence, VPN), chỉ định buddy (người đồng hành) và gửi tài liệu đọc trước.

**Buddy** là một thành viên (thường không phải lead) giúp người mới trả lời những câu hỏi "nhỏ mà ngại hỏi", cùng ăn trưa và pair trong những tuần đầu.

```text
KẾ HOẠCH ONBOARDING 30-60-90 — [Tên] — Buddy: [Tên]

Trước ngày 1
  [ ] Laptop, tài khoản Git/Jira/Confluence/VPN/Slack sẵn sàng
  [ ] Gửi email chào mừng: lịch tuần đầu, tài liệu đọc trước
  [ ] Chọn sẵn 2–3 "good first issue" (bug nhỏ, cải thiện log, thêm test)

Ngày 1–30: HỌC
  [ ] Tuần 1: Chạy được service chính ở local theo README (ghi lại chỗ vướng)
  [ ] Tuần 1: PR đầu tiên được merge
  [ ] Đọc sơ đồ kiến trúc C4 và các ADR quan trọng
  [ ] Gặp PO, BA, QA lead, SA (15–30 phút mỗi người)
  [ ] Hiểu luồng nghiệp vụ chính: thanh toán → đối soát → hoàn tiền
  [ ] 1:1 hằng tuần với lead; check-in cuối tháng 1

Ngày 31–60: ĐÓNG GÓP
  [ ] Tự làm story cỡ vừa từ đầu đến cuối, kể cả viết test
  [ ] Tham gia review PR của người khác
  [ ] Shadow on-call 1 tuần cùng buddy
  [ ] Check-in cuối tháng 2 (gắn với đánh giá thử việc)

Ngày 61–90: LÀM CHỦ
  [ ] Phụ trách một tính năng nhỏ: tech design → release
  [ ] Cập nhật tài liệu onboarding dựa trên trải nghiệm của mình
  [ ] Trình bày một tech talk ngắn về điều đã học
  [ ] Check-in 90 ngày: hai chiều — người mới góp ý cho team và quy trình
```

Ở nhiều công ty, thời gian thử việc của vị trí kỹ sư thường khoảng hai tháng, nên các mốc check-in ngày 30 và 60 nên trùng với lịch đánh giá thử việc. Như vậy người mới biết rõ mình đang ở đâu, không bị bất ngờ. Bạn có thể theo dõi những tín hiệu như thời gian đến PR đầu tiên hay đến lần deploy production đầu tiên để cải thiện quy trình onboarding, nhưng đừng biến chúng thành KPI để gây áp lực lên người mới.

## Lỗi thường gặp

- **Copy JD cũ, thêm vài từ khoá.** Cách sửa: luôn làm hiring kickoff và viết lại JD theo năng lực.
- **Mỗi người phỏng vấn hỏi một kiểu.** Cách sửa: thống nhất bộ câu hỏi, bài tập và rubric cho từng cấp độ; cho người phỏng vấn mới dự thính (shadow) trước khi tự phỏng vấn.
- **Thảo luận trước khi chấm điểm.** Cách sửa: bắt buộc nộp scorecard trước buổi debrief.
- **"Thiếu người quá, tuyển đại."** Cách sửa: tuyển sai tốn kém hơn để trống vị trí thêm vài tuần; giữ nguyên tiêu chuẩn của năng lực bắt buộc.
- **Ứng viên chờ phản hồi hàng tuần.** Cách sửa: cam kết thời gian phản hồi trong JD và giữ đúng cam kết.
- **Onboarding chỉ là "đọc Confluence đi em".** Cách sửa: kế hoạch 30-60-90 có việc làm thật, có buddy và có các mốc check-in.

## Bài tập thực hành

1. **Hiring kickoff và JD:** Chọn một vị trí team bạn đang hoặc sẽ cần. Trả lời bốn câu hỏi kickoff, liệt kê 5–7 năng lực, rồi viết JD theo template trên. Nhờ một đồng nghiệp đọc và chỉ ra chỗ nào còn mơ hồ.
2. **Quy trình phỏng vấn Java có scorecard:** Thiết kế ba vòng (coding, system design, behavioral) cho vị trí đó, bao gồm đề bài, câu hỏi đào sâu và scorecard có mô tả mức điểm cho từng năng lực. Chạy thử với một đồng nghiệp đóng vai ứng viên, sau đó chỉnh lại những câu hỏi khó chấm.
3. **Kế hoạch onboarding:** Viết kế hoạch 30-60-90 cho người mới tiếp theo, chọn sẵn ba "good first issue" và tự mình chạy lại README trên một máy sạch để tìm những bước còn thiếu.

## Tóm tắt

- Bắt đầu từ kết quả và năng lực cần có; JD nên mô tả kết quả, tách rõ must-have và nice-to-have.
- Phỏng vấn có cấu trúc: cùng câu hỏi, cùng rubric, mỗi năng lực được đánh giá ở ít nhất một vòng.
- Coding dùng bài toán gần thực tế; system design xoáy vào trade-off; behavioral hỏi về quá khứ theo STAR.
- Scorecard cần có mô tả cho từng mức điểm và được nộp trước debrief để giảm thiên kiến.
- Nhận diện và chủ động giảm các thiên kiến như hào quang, tương đồng, ấn tượng đầu tiên.
- Onboarding 30-60-90 ngày: học, đóng góp, làm chủ; có buddy, PR đầu tiên trong tuần đầu và check-in gắn với thử việc.
