Bẫy quen thuộc nhất của Dev Lead mới là "để anh làm cho nhanh". Làm thay thì đúng là nhanh trong tuần này, nhưng sau sáu tháng bạn sẽ thành nút cổ chai, còn team thì không ai lớn lên. Mentoring và uỷ quyền là cách nhân năng lực của bạn qua nhiều người: biết từng người đang ở đâu, giao việc vừa sức nhưng có thử thách, và hỏi để họ tự tìm ra đáp án thay vì đưa sẵn.

## Mục tiêu bài học

- Xây dựng skill matrix cho team và dùng nó để viết kế hoạch phát triển cá nhân (IDP).
- Chọn cách dẫn dắt và mức uỷ quyền phù hợp với mức độ sẵn sàng của từng người cho từng loại việc.
- Coaching bằng câu hỏi theo mô hình GROW.
- Tạo cơ hội để thành viên dẫn dắt tính năng và tự ra quyết định kỹ thuật, trong khi lead vẫn giữ được "lưới an toàn".

## Skill matrix: bản đồ năng lực của team

**Skill matrix** là bảng gồm các thành viên (theo hàng) và các kỹ năng team cần (theo cột), mỗi ô ghi mức độ thành thạo. Bảng này trả lời ba câu hỏi: team đang mạnh và yếu ở đâu, kiến thức nào chỉ nằm trong đầu một người, và ai có thể kèm ai.

### Cách xây dựng

1. **Liệt kê kỹ năng từ thực tế công việc**, dựa trên kiến trúc và roadmap chứ không chép một danh sách chung chung. Với một team Java backend, danh sách có thể là: Java core và concurrency, Spring Boot, JPA/Hibernate và tối ưu SQL, Kafka, Redis, Docker/Kubernetes, CI/CD, observability, nghiệp vụ (thanh toán, đối soát), cùng các kỹ năng mềm như code review và làm việc với BA.
2. **Chọn thang đo có mô tả rõ ràng**, chẳng hạn:

| Mức | Mô tả |
|---|---|
| 0 | Chưa biết |
| 1 | Hiểu cơ bản, cần hướng dẫn khi làm |
| 2 | Tự làm được việc thông thường |
| 3 | Thành thạo, xử lý được tình huống khó |
| 4 | Có thể dạy người khác, ra quyết định thiết kế |

3. **Để thành viên tự đánh giá trước**, sau đó lead trao đổi trong 1:1 để thống nhất. Cách này giúp hai bên có chung cách hiểu và tránh cảm giác bị "chấm điểm".
4. **Cập nhật mỗi quý** hoặc khi roadmap thay đổi.

Ví dụ:

| Thành viên | Spring Boot | JPA & SQL | Kafka | Kubernetes | Nghiệp vụ đối soát |
|---|---|---|---|---|---|
| Long (senior) | 4 | 4 | 3 | 2 | 4 |
| Hà (mid) | 3 | 2 | 1 | 1 | 2 |
| Minh (mid) | 3 | 3 | 2 | 3 | 1 |
| Lan (junior) | 2 | 1 | 0 | 0 | 1 |

Nhìn vào bảng có thể thấy ngay: nghiệp vụ đối soát chỉ có Long ở mức 4, nên nếu Long nghỉ phép dài thì team gặp rủi ro. Bạn có thể dùng quy tắc đơn giản: mỗi kỹ năng quan trọng cần **ít nhất hai người ở mức 2 trở lên**. Minh mạnh Kubernetes và có thể kèm Hà; Long nên chia sẻ nghiệp vụ đối soát cho Minh.

> **Lưu ý:** Đừng dùng skill matrix để xếp hạng hay làm căn cứ chính cho đánh giá hiệu suất. Khi bảng gắn với lương thưởng, mọi người sẽ tự chấm cao lên và bảng mất giá trị.

## Kế hoạch phát triển cá nhân (IDP)

**IDP (Individual Development Plan)** là kế hoạch phát triển cho một người trong 3–6 tháng. **Thành viên là người làm chủ IDP**; lead giúp làm rõ mục tiêu, tạo cơ hội và theo dõi.

Một gợi ý hay dùng khi chọn hoạt động là mô hình kinh nghiệm **70-20-10**: phần lớn việc học đến từ trải nghiệm thực tế (nhận task thử thách), một phần từ người khác (pair programming, mentoring, review), và phần nhỏ từ học chính thức (khoá học, sách). Đây là một quy tắc định hướng, không phải tỷ lệ chính xác.

```text
IDP — [Tên] — Quý [x]/[năm]

1. Định hướng nghề nghiệp (1–2 năm)
   Ví dụ: Trở thành senior backend, có thể thiết kế service độc lập.

2. Mục tiêu phát triển (tối đa 2)
   M1: Thành thạo Kafka ở mức 2 → 3 trong skill matrix
   M2: Tự viết được tech design cho một tính năng cỡ vừa

3. Hoạt động
   Trải nghiệm thực tế: Làm story chuyển luồng gửi thông báo sang Kafka
   Học từ người khác:   Pair với Long 1 buổi/tuần trong 4 tuần; review PR Kafka của team
   Học chính thức:      Đọc tài liệu Kafka về consumer group, offset, retry

4. Hỗ trợ cần từ lead
   Ưu tiên giao story liên quan Kafka; review tech design trước khi trình bày

5. Dấu hiệu thành công
   Xử lý được sự cố consumer lag mà không cần escalate; tech design được duyệt

6. Lịch xem lại: 1:1 cuối mỗi tháng
```

## Uỷ quyền theo mức độ sẵn sàng

### Situational Leadership II

Mô hình **Situational Leadership II** (Ken Blanchard và cộng sự) cho rằng không có một phong cách lãnh đạo nào tốt cho mọi trường hợp. Cách dẫn dắt nên phụ thuộc vào **mức độ phát triển** của một người *đối với một nhiệm vụ cụ thể*, gồm hai yếu tố: năng lực (competence) và cam kết (commitment).

| Mức phát triển | Đặc điểm | Phong cách phù hợp | Ví dụ trong team Java |
|---|---|---|---|
| D1 | Năng lực thấp, cam kết cao (mới, hào hứng) | S1 – Directing: chỉ dẫn cụ thể, theo sát | Junior lần đầu viết migration Flyway |
| D2 | Có chút năng lực, cam kết giảm (bắt đầu nản) | S2 – Coaching: vẫn chỉ dẫn, đồng thời giải thích và động viên nhiều | Dev đã làm Kafka 1 tháng, gặp lỗi rebalance liên tục và bắt đầu chán |
| D3 | Năng lực khá đến cao, cam kết dao động (giỏi nhưng thiếu tự tin) | S3 – Supporting: ít chỉ dẫn, lắng nghe và khích lệ nhiều | Mid dev làm tốt nhưng ngại trình bày tech design trước SA |
| D4 | Năng lực cao, cam kết cao | S4 – Delegating: giao kết quả, để họ tự quyết | Senior tự thiết kế và vận hành service đối soát |

Điểm quan trọng: mức độ sẵn sàng tính **theo nhiệm vụ chứ không theo người**. Minh có thể ở D4 với REST API bằng Spring Boot nhưng chỉ ở D1 với Kubernetes operator. Sai lầm thường gặp là uỷ quyền hoàn toàn cho một senior trong mảng họ chưa từng làm, hoặc ngược lại, kèm cặp từng dòng code ở mảng họ đã thành thạo.

### Bảy cấp độ uỷ quyền

Jurgen Appelo (Management 3.0) chia uỷ quyền ra thành bảy cấp. Cách này giúp làm rõ *ai quyết định* với từng loại quyết định:

| Cấp | Tên | Ý nghĩa |
|---|---|---|
| 1 | Tell | Lead quyết định và thông báo |
| 2 | Sell | Lead quyết định và thuyết phục team đồng thuận |
| 3 | Consult | Lead hỏi ý kiến team rồi tự quyết |
| 4 | Agree | Lead và team cùng quyết định |
| 5 | Advise | Team quyết định, lead góp ý |
| 6 | Inquire | Team quyết định, lead hỏi lại kết quả sau |
| 7 | Delegate | Team quyết định, lead không cần biết |

Bạn có thể làm một **delegation board** dán trên Confluence, ví dụ:

| Loại quyết định | Cấp hiện tại | Cấp mục tiêu |
|---|---|---|
| Cách đặt tên, cấu trúc package trong service | 7 | 7 |
| Thêm thư viện mới vào `pom.xml` | 5 | 6 |
| Thay đổi schema bảng trên production | 4 | 5 |
| Chọn message broker cho hệ thống mới | 3 | 4 |
| Tuyển người vào team | 3 | 3 |

Board này giúp team biết khi nào được tự quyết, đồng thời cho thấy lead đang có kế hoạch tăng dần quyền tự chủ.

### Uỷ quyền kết quả, không uỷ quyền từng bước

Khi giao việc cho người ở D3–D4, hãy mô tả **kết quả mong muốn và các ràng buộc**, đừng mô tả từng bước làm:

```text
Brief uỷ quyền
- Kết quả cần đạt: API tra cứu lịch sử giao dịch, p95 < 300ms với 50 req/s
- Vì sao quan trọng: App mobile ra mắt tính năng này vào 15/8
- Ràng buộc: Không đổi schema bảng transactions; theo chuẩn REST của team
- Quyền quyết định: Em tự chọn cách cache và phân trang (cấp 6)
- Mốc kiểm tra: Tech design ngày 20/7; demo bản chạy được ngày 1/8
- Khi nào cần báo ngay: Nếu thấy không đạt p95 hoặc cần đổi schema
```

## Coaching bằng câu hỏi: mô hình GROW

**GROW** là cấu trúc coaching được John Whitmore và các cộng sự phát triển và phổ biến. Mô hình gồm bốn bước:

- **Goal (Mục tiêu):** "Em muốn đạt được điều gì khi kết thúc việc này?"
- **Reality (Thực trạng):** "Hiện tại đang thế nào? Em đã thử những gì? Dữ liệu nói gì?"
- **Options (Phương án):** "Có những cách nào? Còn cách nào khác nữa không? Ưu nhược điểm của từng cách?"
- **Will / Way forward (Hành động):** "Em sẽ làm gì trước tiên? Khi nào? Cần hỗ trợ gì?"

Ví dụ hội thoại:

> **Hà:** Anh ơi, API lấy danh sách đơn hàng chậm quá, em có nên thêm Redis không ạ?
>
> **Lead:** Em muốn đạt mức nào? *(Goal)*
>
> **Hà:** Dạ, PO muốn dưới 500ms, giờ đang khoảng 2 giây.
>
> **Lead:** Em đã đo xem 2 giây đó tốn ở đâu chưa? *(Reality)*
>
> **Hà:** Em bật log SQL thì thấy mỗi đơn hàng lại có thêm một query lấy item...
>
> **Lead:** Vậy có những cách nào để xử lý? *(Options)*
>
> **Hà:** Dùng `JOIN FETCH` hoặc `@EntityGraph`... hoặc cache. Nhưng nếu là N+1 thì cache chỉ che vấn đề đi thôi.
>
> **Lead:** Em sẽ thử cách nào trước, và khi nào mình xem kết quả? *(Will)*
>
> **Hà:** Em thử `@EntityGraph` rồi đo lại, chiều mai em gửi số liệu cho anh.

Lead không đưa ra đáp án, nhưng Hà tự tìm được nguyên nhân gốc và sẽ nhớ lâu hơn nhiều.

**Khi nào không nên coaching:** khi đang có sự cố production (lúc đó cần chỉ đạo rõ ràng), khi người đó ở D1 và chưa có kiến thức nền (cần dạy trước), hoặc khi câu hỏi chỉ là thông tin tra cứu ("Repo cấu hình nằm ở đâu?"). Coaching tốn thời gian hơn trả lời thẳng, nên hãy dành nó cho những vấn đề giúp người học lớn lên.

Phân biệt nhanh: **teaching** là truyền kiến thức, **coaching** là giúp người khác tự tìm lời giải bằng câu hỏi, còn **mentoring** là quan hệ dài hạn, trong đó mentor chia sẻ kinh nghiệm, định hướng và mở cửa cơ hội. Một mentor giỏi dùng cả ba tuỳ lúc.

## Tạo cơ hội dẫn dắt tính năng và quyết định kỹ thuật

- **Luân phiên vai trò feature lead:** mỗi epic có một người phụ trách, lo viết tech design, chia task, làm việc với BA và QA, demo ở sprint review. Bắt đầu với epic nhỏ, rủi ro thấp.
- **Phân biệt quyết định dễ đảo ngược và khó đảo ngược:** với quyết định dễ đảo ngược (cách tổ chức code, thư viện test), hãy để thành viên tự quyết, kể cả khi bạn sẽ làm khác. Với quyết định khó đảo ngược (schema dữ liệu, giao thức với đối tác), hãy cùng review qua ADR.
- **Giữ lưới an toàn:** design review, các mốc kiểm tra định kỳ, pairing khi cần. Nếu kết quả không tốt, lead đứng ra chịu trách nhiệm trước stakeholder rồi cùng thành viên rút kinh nghiệm riêng.
- **Cho họ được nhìn thấy:** để người làm tự trình bày với SA hoặc khách hàng, và ghi công đúng người.

```text
Kế hoạch mentoring 3 tháng
Mentor: Long    Mentee: Minh    Mục tiêu: Minh làm feature lead epic "Đối soát tự động"

Tháng 1 — Quan sát & học
  - Minh dự các buổi Long làm việc với BA; đọc lại 3 ADR gần nhất
  - Pair 2 buổi/tuần về nghiệp vụ đối soát
Tháng 2 — Làm có hỗ trợ
  - Minh viết tech design, Long review trước khi trình SA
  - Minh chia story, ước lượng cùng team
Tháng 3 — Tự chủ
  - Minh dẫn sprint review phần đối soát; Long chỉ góp ý sau buổi
Gặp mentoring: 45 phút/tuần, Minh chuẩn bị câu hỏi trước
Đánh giá: Skill matrix nghiệp vụ đối soát của Minh từ 1 lên 3
```

## Lỗi thường gặp

- **"Để anh làm cho nhanh".** Cách sửa: chấp nhận chậm hơn một chút lúc đầu; giữ cho mình những việc chỉ lead mới làm được, còn lại thì giao đi.
- **Uỷ quyền rồi bỏ mặc.** Cách sửa: luôn có mốc kiểm tra và kênh báo khó khăn, nhất là với người ở D1–D2.
- **Uỷ quyền nửa vời:** giao việc nhưng âm thầm giữ quyền quyết định, đến cuối lại bác bỏ. Cách sửa: nói rõ cấp uỷ quyền ngay từ đầu và giữ lời.
- **Chỉ giao việc nhàm chán.** Cách sửa: mỗi người nên có ít nhất một việc gắn với mục tiêu trong IDP của họ.
- **Coaching trong lúc khẩn cấp.** Cách sửa: khi có sự cố thì chỉ đạo; coaching để dành cho lúc postmortem.
- **IDP viết xong rồi để đó.** Cách sửa: mở IDP ra xem trong 1:1 ít nhất mỗi tháng một lần.

## Bài tập thực hành

1. **Skill matrix:** Liệt kê 8–12 kỹ năng quan trọng của team, cho thành viên tự đánh giá, rồi thống nhất trong 1:1. Đánh dấu những kỹ năng chưa có đủ hai người ở mức 2 trở lên và đề xuất cặp kèm nhau.
2. **IDP cho 2 thành viên:** Dùng template ở trên để viết IDP cho hai người có định hướng khác nhau (ví dụ một người muốn đi sâu kỹ thuật, một người muốn làm lead). Mỗi IDP phải gắn với ít nhất một story thật trong quý.
3. **Delegation board:** Liệt kê 8 loại quyết định thường gặp của team, ghi cấp uỷ quyền hiện tại và cấp mục tiêu, rồi trình bày với team trong buổi retrospective để nhận góp ý.

## Tóm tắt

- Skill matrix cho thấy điểm mạnh, điểm yếu và kiến thức chỉ có một người nắm; mỗi kỹ năng quan trọng nên có ít nhất hai người làm được.
- IDP do thành viên làm chủ, có mục tiêu rõ ràng, có hoạt động gắn với công việc thật, và được xem lại hằng tháng.
- Situational Leadership: chọn phong cách directing, coaching, supporting hay delegating theo mức sẵn sàng với từng nhiệm vụ.
- Bảy cấp độ uỷ quyền và delegation board giúp làm rõ ai quyết định điều gì.
- GROW giúp thành viên tự tìm lời giải; không dùng khi đang có sự cố hoặc với người chưa có kiến thức nền.
- Giao vai trò feature lead và quyết định dễ đảo ngược cho thành viên, đồng thời giữ lưới an toàn bằng review và mốc kiểm tra.
