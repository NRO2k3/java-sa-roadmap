Khi còn là developer, bạn chủ yếu làm việc với code và đồng đội. Khi lên Dev Lead, một nửa thời gian của bạn sẽ dành cho những người ngoài team: PO hỏi tiến độ, BA cần làm rõ nghiệp vụ, QA cần môi trường test, SA cần review thiết kế, giám đốc khối kinh doanh muốn thêm tính năng cho buổi demo khách hàng. Stakeholder tin bạn hay không phụ thuộc vào việc bạn có minh bạch, có cảnh báo sớm, và có đưa ra phương án khi phải nói "không" hay không. Bài này giúp bạn trở thành cầu nối đáng tin cậy giữa team và phần còn lại của tổ chức.

## Mục tiêu bài học

- Lập bản đồ stakeholder và chọn cách làm việc phù hợp với từng nhóm.
- Phối hợp rõ ràng với PO/PM/BA, QA và Solution Architect, dùng RACI để tránh chồng chéo trách nhiệm.
- Viết báo cáo tiến độ minh bạch, cảnh báo rủi ro từ sớm.
- Nói "không" một cách xây dựng bằng cách đưa ra phương án thay thế; escalate đúng lúc, đúng người, đúng cách.

## Bản đồ stakeholder

**Stakeholder** (các bên liên quan) là bất kỳ ai bị ảnh hưởng bởi công việc của team, hoặc có thể ảnh hưởng đến nó. Một công cụ phổ biến để phân loại họ là ma trận **quyền lực – mức độ quan tâm (power/interest grid)**:

| | Quan tâm thấp | Quan tâm cao |
|---|---|---|
| **Quyền lực cao** | **Giữ hài lòng (keep satisfied):** báo cáo ngắn gọn, đúng lúc; ví dụ CTO, giám đốc khối | **Quản lý chặt (manage closely):** trao đổi thường xuyên, mời vào sprint review; ví dụ PO, PM, giám đốc sản phẩm |
| **Quyền lực thấp** | **Theo dõi (monitor):** thông tin chung khi cần; ví dụ các team không liên quan trực tiếp | **Giữ thông tin (keep informed):** cập nhật định kỳ, lắng nghe phản hồi; ví dụ CSKH, team vận hành, QA team khác |

Với mỗi stakeholder quan trọng, hãy trả lời ba câu hỏi: *Họ quan tâm điều gì nhất?* (ngày release, chi phí, ổn định, trải nghiệm khách hàng). *Họ muốn nhận thông tin qua kênh nào, với tần suất ra sao?* *Ai là người họ tin?*

## Phối hợp với PO/PM/BA, QA và Solution Architect

| Vai trò | Họ cần gì từ Dev Lead | Dev Lead cần gì từ họ | Cách phối hợp |
|---|---|---|---|
| **PO / PM** | Dự báo đáng tin cậy, cảnh báo sớm, phương án khi có đánh đổi | Thứ tự ưu tiên rõ ràng, Sprint Goal, quyết định kịp thời | Sprint planning, review; 1:1 hằng tuần với PO |
| **BA** | Câu hỏi làm rõ từ sớm, phản hồi về độ khả thi | Yêu cầu và acceptance criteria rõ ràng, các trường hợp biên của nghiệp vụ | Three amigos, refinement |
| **QA** | Môi trường ổn định, build có thể test được, thông tin thay đổi | Test case sớm, phản hồi nhanh về chất lượng | Cùng viết AC, QA tham gia từ lúc refinement (shift-left) |
| **Solution Architect** | Hiện trạng kỹ thuật, ràng buộc thực tế, phản hồi về thiết kế | Định hướng kiến trúc, yêu cầu phi chức năng (NFR), các quyết định liên team | Design review, ADR, đồng bộ hai tuần một lần |

Nguyên tắc chung: **PO quyết định làm gì và vì sao, team quyết định làm thế nào**. SA định hướng kiến trúc ở cấp hệ thống, còn team chịu trách nhiệm thiết kế chi tiết bên trong phạm vi đó. Khi ranh giới này không rõ, xung đột rất dễ xảy ra.

### RACI

**RACI** là ma trận gán trách nhiệm cho từng hoạt động:

- **R – Responsible:** người trực tiếp làm.
- **A – Accountable:** người chịu trách nhiệm cuối cùng và duyệt. **Mỗi hoạt động chỉ có đúng một A.**
- **C – Consulted:** người được hỏi ý kiến trước khi quyết định (giao tiếp hai chiều).
- **I – Informed:** người được thông báo sau (giao tiếp một chiều).

| Hoạt động | PO | BA | Dev Lead | Developers | QA | SA |
|---|---|---|---|---|---|---|
| Thứ tự ưu tiên backlog | A/R | C | C | I | I | I |
| Viết acceptance criteria | A | R | C | C | C | I |
| Thiết kế kiến trúc liên service | I | I | C | C | I | A/R |
| Tech design trong service | I | I | A | R | C | C |
| Quyết định release lên production | A | I | R | C | C | I |

Lập RACI 30 phút ngay đầu dự án sẽ tránh được rất nhiều câu "Tưởng anh/chị làm việc đó?".

## Báo cáo tiến độ minh bạch

### Nguyên tắc

- **Báo cáo theo kết quả, không theo hoạt động:** "Luồng thanh toán ví A đã chạy trên staging" có ích hơn "Đã họp 5 buổi, merge 23 PR".
- **Dùng trạng thái RAG (Red/Amber/Green) với định nghĩa rõ ràng.** Ví dụ: Green là dự báo mức 85% vẫn kịp hạn; Amber là có rủi ro trễ nhưng đã có phương án; Red là sẽ trễ hạn nếu không có quyết định từ stakeholder.
- **Tránh kiểu báo cáo "dưa hấu" (watermelon):** bên ngoài xanh, bên trong đỏ. Báo xanh liên tục cho đến tuần cuối rồi bất ngờ chuyển đỏ là cách nhanh nhất để mất lòng tin.
- **Báo tin xấu sớm, kèm phương án.** Đừng đợi đến khi chắc chắn sẽ trễ mới báo. Hãy báo khi xác suất trễ bắt đầu tăng.
- **Đều đặn:** cùng một định dạng, cùng một thời điểm mỗi tuần, để stakeholder không cần phải đi hỏi.

```text
Tiêu đề: [Thanh toán ví v1] Báo cáo tiến độ tuần 29 — Trạng thái: AMBER

Tóm tắt (đọc 30 giây)
  - Ví A: xong trên staging, QA đang test regression.
  - Ví B: chậm 1 tuần do đối tác chưa cấp sandbox. Dự báo go-live 15/9
    vẫn đạt nếu có sandbox trước 20/7.
  - Cần quyết định: anh Phong (PM) hỗ trợ escalate với ví B trước 17/7.

Tiến độ so với kế hoạch
  - Must-have: 18/28 story xong (dự báo 85%: 27/8, kế hoạch 25/8)
  - Should-have: chưa bắt đầu (đúng kế hoạch)

Top 3 rủi ro
  1. R1 Sandbox ví B (đỏ) — đang dùng WireMock; cần escalate
  2. R2 Kiến thức đối soát tập trung ở Long (vàng) — runbook xong 60%
  3. R3 Chưa test tải (vàng) — lên lịch Sprint 3

Đã xong tuần này
  - Callback ví A có kiểm tra chữ ký, idempotent
  - Dashboard giao dịch trên Grafana

Tuần tới
  - Test tải bằng Gatling; hoàn thiện runbook đối soát

Liên hệ: [Tên Dev Lead] — Demo tiếp theo: Sprint Review 26/7, 14h
```

## Biết nói "không" và đưa phương án thay thế

Nói "có" với mọi yêu cầu đồng nghĩa với việc ngầm nói "không" với chất lượng, với sức khoẻ của team, hoặc với các cam kết trước đó. Trong văn hoá làm việc tại Việt Nam, nói "không" thẳng với cấp trên hay với khách hàng thường rất khó. Cách làm hiệu quả là **không từ chối con người, mà làm rõ đánh đổi**.

Các kỹ thuật:

- **Hỏi nhu cầu thật đằng sau yêu cầu:** "Tính năng này để phục vụ việc gì, và cần trước khi nào?". Nhiều khi nhu cầu thật có thể đáp ứng bằng một giải pháp nhỏ hơn nhiều.
- **"Có, nếu...":** "Có thể làm kịp, nếu mình lùi story báo cáo sang sprint sau."
- **"Chưa phải bây giờ":** đưa yêu cầu vào backlog để PO sắp thứ tự, thay vì từ chối hẳn.
- **Thực đơn phương án:** đưa ra 2–3 lựa chọn kèm chi phí và rủi ro của từng lựa chọn, để người có quyền quyết định.
- **Trả lời bằng văn bản sau cuộc trao đổi,** để mọi người cùng hiểu đánh đổi đã được thống nhất.

> **Giám đốc kinh doanh:** Tuần sau anh demo cho chuỗi siêu thị, em thêm giúp anh tính năng thanh toán trả góp nhé.
>
> **Lead:** Dạ, em hiểu buổi demo này quan trọng. Anh cho em hỏi: khách cần thấy trả góp chạy thật, hay chỉ cần thấy luồng trải nghiệm để quyết định ký hợp đồng ạ?
>
> **Giám đốc:** Chủ yếu là để họ thấy mình có làm tính năng đó.
>
> **Lead:** Vậy em có hai phương án. Một là team UI làm prototype luồng trả góp trên Figma trong hai ngày, không ảnh hưởng release ví điện tử. Hai là làm tính năng thật, nhưng như thế mất khoảng ba sprint và phải lùi release ví B, mà việc này anh Phong bên PM cần quyết. Em nghĩ phương án một đủ cho buổi demo. Nếu khách ký hợp đồng, mình đưa trả góp vào roadmap quý sau.

Lead không nói chữ "không" nào, nhưng cũng không nhận một cam kết bất khả thi.

## Escalate đúng lúc, đúng người

**Escalate** (đưa vấn đề lên cấp cao hơn) không phải là "mách lẻo" hay thừa nhận thất bại. Đó là cách để người có đủ thẩm quyền ra quyết định kịp thời.

### Khi nào escalate

- Vấn đề vượt quá thẩm quyền của bạn: ngân sách, hợp đồng, ưu tiên giữa các team.
- Vấn đề đe doạ một cam kết quan trọng (ngày go-live, SLA) và thời gian để xử lý đang hết dần.
- Bạn đã thử giải quyết trực tiếp với người liên quan một cách hợp lý mà không có kết quả.
- Có rủi ro về bảo mật, dữ liệu khách hàng hoặc tuân thủ: escalate ngay, không chờ.

Escalate quá muộn khiến người ra quyết định không còn lựa chọn nào. Escalate quá sớm với chuyện nhỏ thì làm mất uy tín của bạn và của cả kênh escalate.

### Escalate với ai, và như thế nào

- **Chọn cấp thấp nhất có đủ thẩm quyền quyết định.** Đừng nhảy thẳng lên CTO khi PM có thể giải quyết.
- **Nói trước với người liên quan:** "Nếu đến thứ Tư vẫn chưa có sandbox, em sẽ nhờ anh Phong làm việc với lãnh đạo bên ví B nhé." Không ai thích bị bất ngờ khi thấy tên mình trong một email escalate.
- **Escalate vấn đề, không escalate con người.** Tập trung vào tác động và quyết định cần có, không đổ lỗi.

```text
Tiêu đề: [Cần quyết định trước 17/7] Sandbox ví B chậm — ảnh hưởng go-live 15/9

Bối cảnh: Release ví điện tử v1 cần sandbox ví B để test callback.
Vấn đề:   Đã yêu cầu ngày 1/7, nhắc 2 lần (5/7, 10/7), chưa có phản hồi.
Tác động: Nếu không có sandbox trước 20/7, go-live 15/9 có rủi ro trễ 2–3 tuần.
Đã làm:   Dùng WireMock để phát triển song song; chị Thu bên đối tác đã được báo.
Phương án:
  A. PM liên hệ cấp quản lý bên ví B (khuyến nghị)
  B. Go-live 15/9 chỉ với ví A, ví B release sau
Cần từ anh/chị: Chọn A hoặc B trước 17/7.
```

## Lỗi thường gặp

- **Chỉ báo tin tốt, giấu tin xấu đến phút cuối.** Cách sửa: định nghĩa RAG rõ ràng, báo Amber ngay khi rủi ro tăng, kèm phương án.
- **Báo cáo bằng hoạt động thay vì kết quả.** Cách sửa: mở đầu bằng 3 dòng tóm tắt, nêu tiến độ so với mục tiêu và quyết định cần có.
- **Nói "có" với mọi yêu cầu để giữ hoà khí.** Cách sửa: hỏi nhu cầu thật, đưa ra phương án kèm đánh đổi.
- **Từ chối thẳng mà không có phương án.** Cách sửa: dùng "có, nếu..." hoặc "chưa phải bây giờ", và đưa yêu cầu về PO để sắp thứ tự.
- **Escalate vượt cấp, không báo trước cho người liên quan.** Cách sửa: thử giải quyết trực tiếp trước, báo trước khi escalate, chọn đúng cấp.
- **Không rõ ai quyết định.** Cách sửa: lập RACI ngay đầu dự án, mỗi hoạt động chỉ có một A.

## Bài tập thực hành

1. **Bản đồ stakeholder và RACI:** Liệt kê tất cả stakeholder của dự án hiện tại và xếp họ vào ma trận quyền lực – quan tâm. Ghi chú mỗi người quan tâm điều gì nhất và muốn nhận thông tin qua kênh nào. Lập RACI cho 6–8 hoạt động chính, rồi xác nhận lại với PO và SA.
2. **Báo cáo tiến độ định kỳ:** Viết báo cáo tiến độ hằng tuần theo template trong 3 tuần liên tiếp, với định nghĩa RAG đã được thống nhất với PO. Sau 3 tuần, hỏi một stakeholder xem họ có còn phải hỏi thêm gì ngoài báo cáo không, rồi cải thiện template.
3. **Đóng vai nói "không":** Cùng một đồng nghiệp đóng vai tình huống "yêu cầu gấp từ cấp trên giữa sprint". Thực hành hỏi nhu cầu thật, đưa ra hai phương án kèm đánh đổi, và viết email tóm tắt quyết định sau buổi trao đổi.

## Tóm tắt

- Dùng ma trận quyền lực – quan tâm để chọn mức độ và kênh giao tiếp phù hợp với từng stakeholder.
- PO quyết định làm gì và vì sao, team quyết định làm thế nào; RACI làm rõ trách nhiệm, mỗi hoạt động chỉ có một người Accountable.
- Báo cáo tiến độ theo kết quả, đều đặn, có RAG được định nghĩa rõ; báo tin xấu sớm, kèm phương án; tránh báo cáo kiểu "dưa hấu".
- Nói "không" bằng cách hỏi nhu cầu thật và đưa ra phương án kèm đánh đổi, không từ chối con người.
- Escalate khi vấn đề vượt thẩm quyền và thời gian đang hết; chọn cấp thấp nhất đủ thẩm quyền, báo trước cho người liên quan, và nêu rõ quyết định cần có kèm hạn chót.
