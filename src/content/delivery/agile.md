Hầu hết các team Java ở Việt Nam đều nói rằng mình "làm Agile", nhưng thực tế rất khác nhau: có team chạy Scrum bài bản, có team chỉ giữ lại daily stand-up và sprint hai tuần, trong khi bản chất vẫn là giao việc theo kiểu waterfall. Là Dev Lead, bạn cần hiểu đúng Scrum và Kanban để biết phần nào là cốt lõi không nên bỏ, phần nào có thể điều chỉnh. Bạn cũng thường là người giúp team cải tiến qua retrospective, nên kỹ năng điều phối buổi này rất quan trọng.

## Mục tiêu bài học

- Nắm chính xác ba trách nhiệm, năm sự kiện và ba artifact của Scrum theo Scrum Guide 2020.
- Áp dụng Kanban: trực quan hoá công việc, đặt giới hạn WIP và quản lý flow.
- Điều phối một buổi retrospective có cấu trúc và kết thúc bằng action item thực hiện được.
- Điều chỉnh quy trình theo bối cảnh của team một cách có chủ đích, thay vì áp dụng máy móc.

## Scrum theo Scrum Guide

Scrum Guide (phiên bản hiện hành là bản 2020, do Ken Schwaber và Jeff Sutherland viết) mô tả Scrum là một framework nhẹ, dựa trên **chủ nghĩa thực nghiệm (empiricism)** và **tư duy lean**. Thực nghiệm dựa trên ba trụ cột: **minh bạch (transparency), kiểm tra (inspection), thích ứng (adaptation)**. Scrum Guide cũng nêu năm giá trị: cam kết (commitment), tập trung (focus), cởi mở (openness), tôn trọng (respect) và can đảm (courage).

### Ba trách nhiệm (accountabilities)

Một Scrum Team gồm một Product Owner, một Scrum Master và các Developers. Team không có team con hay cấp bậc bên trong, và thường có từ 10 người trở xuống.

| Trách nhiệm | Chịu trách nhiệm về |
|---|---|
| **Product Owner** | Tối đa hoá giá trị của sản phẩm; quản lý Product Backlog: xây dựng Product Goal, viết và sắp xếp thứ tự các mục trong backlog. PO là **một người**, không phải một hội đồng. |
| **Scrum Master** | Hiệu quả của Scrum Team: giúp team và tổ chức hiểu, áp dụng Scrum, và gỡ bỏ trở ngại. Scrum Guide gọi đây là người lãnh đạo thực thụ phục vụ team và tổ chức. |
| **Developers** | Tạo ra Increment có thể dùng được trong mỗi Sprint: lập Sprint Backlog, đảm bảo chất lượng theo Definition of Done, điều chỉnh kế hoạch hằng ngày. |

> **Lưu ý:** Scrum Guide không có vai trò "Dev Lead" hay "Tech Lead". Trong thực tế, Dev Lead thường là một trong các Developers. Hãy cẩn thận để mình không biến thành "người giao việc" trong Daily Scrum, vì Developers tự quản lý cách làm việc của họ.

### Năm sự kiện

| Sự kiện | Mục đích | Timebox (cho Sprint 1 tháng) |
|---|---|---|
| **Sprint** | "Vật chứa" của tất cả các sự kiện khác; độ dài cố định, tối đa một tháng | ≤ 1 tháng |
| **Sprint Planning** | Trả lời ba câu hỏi: Sprint này *vì sao* có giá trị (Sprint Goal)? Làm *được gì*? *Làm như thế nào*? | Tối đa 8 giờ |
| **Daily Scrum** | Developers kiểm tra tiến độ hướng tới Sprint Goal và điều chỉnh kế hoạch cho ngày tiếp theo | 15 phút |
| **Sprint Review** | Kiểm tra kết quả của Sprint cùng các stakeholder chính, cùng quyết định bước tiếp theo; đây là buổi làm việc, không chỉ là buổi trình chiếu | Tối đa 4 giờ |
| **Sprint Retrospective** | Lên kế hoạch cải thiện chất lượng và hiệu quả làm việc | Tối đa 3 giờ |

Với Sprint ngắn hơn (ví dụ 2 tuần), các sự kiện thường cũng ngắn hơn. Một số điểm hay bị hiểu sai:

- Bản 2020 không còn nêu "ba câu hỏi" quen thuộc (hôm qua làm gì, hôm nay làm gì, có trở ngại gì không) cho Daily Scrum. Developers được tự chọn cấu trúc và kỹ thuật, miễn là buổi họp tập trung vào tiến độ hướng tới Sprint Goal.
- **Product Backlog refinement** là một hoạt động diễn ra liên tục, không phải một sự kiện chính thức.
- Trong Sprint, không thực hiện thay đổi nào làm nguy hại tới Sprint Goal, và chất lượng không được giảm. Phạm vi có thể được làm rõ và thương lượng lại với PO khi team hiểu thêm vấn đề. Chỉ PO có quyền huỷ Sprint, và chỉ khi Sprint Goal trở nên lỗi thời.

### Ba artifact và cam kết đi kèm

| Artifact | Cam kết (commitment) | Ý nghĩa |
|---|---|---|
| **Product Backlog** | **Product Goal** | Danh sách có thứ tự những gì cần để cải thiện sản phẩm; Product Goal là mục tiêu dài hạn |
| **Sprint Backlog** | **Sprint Goal** | Sprint Goal + các mục được chọn + kế hoạch thực hiện; Sprint Goal là mục tiêu duy nhất của Sprint |
| **Increment** | **Definition of Done** | Bước tiến cụ thể hướng tới Product Goal; một mục công việc chỉ thành một phần của Increment khi đạt Definition of Done |

Ví dụ Definition of Done của một team Java: code đã được review; unit test và integration test pass trên CI; không có lỗi Sonar mức nghiêm trọng; tài liệu API (OpenAPI) đã cập nhật; đã deploy lên staging và QA xác nhận; dashboard và alert cho endpoint mới đã có.

```text
SPRINT REVIEW — Sprint 14 — 60 phút
Mời: PO, Developers, QA, BA, đại diện CSKH, SA (tuỳ chủ đề)

1. (5')  PO nhắc lại Sprint Goal: "Cửa hàng hoàn tiền được một phần cho giao dịch QR"
2. (25') Demo trên staging bằng dữ liệu thật đã ẩn danh — chỉ những gì đạt DoD
         - Luồng hoàn tiền một phần (Minh)
         - Báo cáo đối soát có thêm cột hoàn tiền (Hà)
3. (10') Những gì chưa xong và lý do (minh bạch, không giấu)
4. (15') Thảo luận: phản hồi của stakeholder, thay đổi thị trường/ưu tiên
         → PO cập nhật thứ tự Product Backlog ngay tại buổi
5. (5')  Tiến độ hướng tới Product Goal và dự báo release
```

## Kanban

Kanban tập trung vào **dòng chảy (flow)** của công việc thay vì chia thành các vòng lặp cố định. Các thực hành cốt lõi gồm: trực quan hoá quy trình, giới hạn công việc dở dang (WIP), chủ động quản lý flow, làm rõ các chính sách (policy) của quy trình, và cải tiến liên tục dựa trên dữ liệu.

### Trực quan hoá

Board cần phản ánh đúng các bước thực tế của team, chứ không chỉ có To Do, Doing, Done:

| Backlog | Ready | In Progress (WIP 3) | Code Review (WIP 2) | Testing (WIP 2) | Done |
|---|---|---|---|---|---|
| ... | Story đã có AC, đã ước lượng | Đang code | Chờ/đang review | QA test trên staging | Đạt DoD |

Mỗi cột nên có **policy rõ ràng**, ví dụ "Chỉ chuyển sang Ready khi story có acceptance criteria và không còn phụ thuộc chưa giải quyết". Hãy đánh dấu rõ những thẻ đang bị chặn (blocked), kèm lý do.

### Giới hạn WIP

**WIP (Work In Progress)** là số việc đang làm dở. **Giới hạn WIP** là số việc tối đa được phép nằm trong một cột hoặc một nhóm cột. Theo Little's Law, khi throughput không đổi, giảm WIP sẽ giúp từng việc hoàn thành nhanh hơn. Ngoài ra, ít chuyển đổi ngữ cảnh hơn, và việc tồn đọng (như PR chờ review) lộ ra ngay.

- **Cách đặt giới hạn:** bắt đầu với một con số gần bằng số người làm ở cột đó, theo dõi vài tuần rồi điều chỉnh.
- **Khi một cột chạm giới hạn:** "ngừng bắt đầu, hãy hoàn thành" (stop starting, start finishing). Developer rảnh tay sẽ giúp review hoặc test thay vì kéo thêm story mới.
- Nếu team thường xuyên vượt giới hạn mà không ai thảo luận, giới hạn đó chỉ còn là trang trí.

### Quản lý flow

- **Đi bảng từ phải sang trái** trong daily: "Việc nào gần Done nhất, cần gì để xong?" thay vì hỏi từng người.
- Theo dõi **work item age** (tuổi của việc đang làm dở) để phát hiện thẻ bị kẹt từ sớm.
- Các chỉ số như cycle time và throughput được trình bày chi tiết trong bài *Đo lường hiệu quả team*.

### Scrum hay Kanban?

| Tiêu chí | Scrum | Kanban |
|---|---|---|
| Nhịp làm việc | Sprint độ dài cố định | Liên tục |
| Vai trò | PO, Scrum Master, Developers | Không bắt buộc vai trò mới |
| Thay đổi giữa chừng | Hạn chế để bảo vệ Sprint Goal | Có thể kéo việc mới khi còn chỗ trống trong WIP |
| Phù hợp | Phát triển sản phẩm, cần mục tiêu ngắn hạn rõ ràng | Team vận hành, hỗ trợ, nhiều việc phát sinh |

Hai cách này có thể kết hợp: nhiều team Scrum vẫn dùng board có giới hạn WIP và đo flow metrics trong Sprint.

## Điều phối retrospective hiệu quả

Một cấu trúc phổ biến (Esther Derby và Diana Larsen, sách *Agile Retrospectives*) gồm năm bước:

1. **Set the stage (mở đầu):** nhắc mục đích, tạo không khí an toàn. Có thể nhắc lại tinh thần "Prime Directive" của Norm Kerth: mọi người đã làm hết khả năng trong điều kiện và hiểu biết lúc đó.
2. **Gather data (thu thập dữ liệu):** dòng thời gian của Sprint, số liệu (cycle time, bug, sự cố), cảm nhận của từng người.
3. **Generate insights (tìm hiểu nguyên nhân):** vì sao chuyện đó xảy ra? Dùng 5 Whys hoặc nhóm các ý theo chủ đề.
4. **Decide what to do (quyết định hành động):** chọn 1–3 action item.
5. **Close (kết thúc):** tóm tắt, hỏi nhanh xem buổi retro có ích không.

Các định dạng nên luân phiên để tránh nhàm chán: **Start – Stop – Continue**, **Mad – Sad – Glad**, **4Ls** (Liked, Learned, Lacked, Longed for), **Sailboat** (gió đẩy, mỏ neo kéo lại, đá ngầm là rủi ro, hòn đảo là mục tiêu).

Mẹo điều phối trong team Việt Nam:

- Cho **mọi người viết im lặng 5–7 phút** lên sticky note (Miro, FigJam) trước khi thảo luận, để ai cũng có ý kiến chứ không chỉ người nói nhiều.
- Dùng **dot-voting** (mỗi người 3 phiếu) để chọn chủ đề cần bàn sâu.
- **Lead nói sau cùng**, và có thể **luân phiên người điều phối** giữa các thành viên.
- Mở đầu buổi bằng việc xem lại action item của buổi trước.

```text
ACTION ITEM RETRO — Sprint 14
| # | Hành động (cụ thể, kiểm chứng được)                         | Người phụ trách | Hạn       | Kiểm tra      |
|---|-------------------------------------------------------------|-----------------|-----------|---------------|
| 1 | PR chờ review quá 1 ngày → nhắc trên channel lúc 14h hằng ngày | Hà              | Từ thứ Hai | Retro Sprint 15 |
| 2 | Tách job test tích hợp chậm ra pipeline riêng để CI dưới 15'   | Minh            | Sprint 15  | Retro Sprint 15 |

Không phải action item: "Cố gắng giao tiếp tốt hơn", "Code cẩn thận hơn"
```

## Điều chỉnh quy trình cho phù hợp với team

Scrum Guide nói rõ rằng có thể chỉ áp dụng một phần Scrum, nhưng khi đó kết quả không còn là Scrum. Điều này không có nghĩa là bạn bị cấm điều chỉnh; nó chỉ yêu cầu bạn **trung thực về những gì đang làm** và hiểu mình đánh đổi điều gì.

Nguyên tắc điều chỉnh:

- **Bắt đầu từ vấn đề, không bắt đầu từ công cụ:** "Story liên tục bị kẹt ở bước test" là một vấn đề; "chuyển sang Kanban" là một giải pháp cần được kiểm chứng.
- **Mỗi lần thay đổi một thứ**, đặt giả thuyết và cách đo: "Nếu giới hạn WIP cột Code Review là 2, thời gian chờ review sẽ giảm. Thử trong 2 sprint, đo bằng cycle time."
- **Giữ phần cốt lõi:** mục tiêu rõ ràng, minh bạch, có nhịp kiểm tra và thích ứng, có Definition of Done.
- **Cẩn thận với "cargo cult"** (làm theo hình thức mà không hiểu mục đích): daily kéo dài 45 phút để báo cáo cho lead, sprint review chỉ có slide, retro tháng nào cũng ra cùng một kết luận.

Ví dụ điều chỉnh:

| Tình huống | Điều chỉnh hợp lý |
|---|---|
| Team vừa phát triển vừa nhận nhiều ticket production | Dành sẵn capacity cho việc phát sinh, hoặc luân phiên một người "trực" để chắn việc cho cả team |
| Team outsource, hợp đồng phạm vi cố định | Vẫn chạy sprint và review với khách để phát hiện hiểu lầm sớm; thương lượng thay đổi phạm vi qua change request |
| Team platform/DevOps, việc đến liên tục | Dùng Kanban với giới hạn WIP và chính sách phân loại theo mức độ ưu tiên |

## Lỗi thường gặp

- **Daily thành buổi báo cáo cho lead.** Cách sửa: tập trung vào Sprint Goal và đi bảng từ phải sang trái; lead không đứng ra hỏi từng người.
- **Sprint Goal chỉ là danh sách ticket.** Cách sửa: viết Sprint Goal thành một câu thể hiện giá trị, để team có thể linh hoạt về phạm vi.
- **Sprint Review chỉ là buổi trình chiếu slide.** Cách sửa: demo phần mềm chạy thật, đạt DoD, và dành thời gian cho phản hồi.
- **Đặt giới hạn WIP rồi phớt lờ.** Cách sửa: khi chạm giới hạn, cả team dừng lại và cùng giải phóng cột đó.
- **Retro không có action item, hoặc có nhưng không ai theo dõi.** Cách sửa: tối đa 3 hành động, có người phụ trách, được xem lại ở đầu buổi retro sau.
- **Áp dụng quy trình mà không hiểu mục đích, hoặc bỏ đi phần cốt lõi.** Cách sửa: mỗi thay đổi xuất phát từ một vấn đề cụ thể, và được đo lường.

## Bài tập thực hành

1. **Kiểm tra Scrum của team:** Đối chiếu quy trình hiện tại với bảng sự kiện và artifact ở trên. Liệt kê những điểm khác biệt, và ghi rõ với mỗi điểm: đây là điều chỉnh có chủ đích hay là thiếu sót? Trình bày kết quả với PO và Scrum Master.
2. **Thiết kế board Kanban:** Vẽ lại các bước thực tế của một story từ Ready đến production, đặt giới hạn WIP ban đầu và viết policy cho từng cột. Chạy thử trong 2 sprint rồi so sánh cycle time trước và sau.
3. **Điều phối retro:** Tổ chức một buổi retro theo năm bước với định dạng Sailboat hoặc 4Ls, có phần viết im lặng và dot-voting. Kết thúc bằng tối đa 3 action item theo template, và kiểm tra chúng ở buổi retro sau.

## Tóm tắt

- Scrum có ba trách nhiệm (Product Owner, Scrum Master, Developers), năm sự kiện (Sprint, Sprint Planning, Daily Scrum, Sprint Review, Sprint Retrospective) và ba artifact, mỗi artifact có một cam kết: Product Goal, Sprint Goal, Definition of Done.
- Dev Lead thường là một Developer; hãy tránh biến Daily Scrum thành buổi giao việc.
- Kanban tập trung vào flow: trực quan hoá đúng quy trình, giới hạn WIP, policy rõ ràng, "ngừng bắt đầu, hãy hoàn thành".
- Retro hiệu quả có cấu trúc, tạo cơ hội cho mọi người lên tiếng, và kết thúc bằng 1–3 action item có người phụ trách.
- Điều chỉnh quy trình xuất phát từ vấn đề thật, mỗi lần một thay đổi, có đo lường, và giữ lại phần cốt lõi của thực nghiệm.
