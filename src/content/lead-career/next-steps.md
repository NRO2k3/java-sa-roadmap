Sau một thời gian làm Dev Lead, câu hỏi "bước tiếp theo là gì?" sớm muộn cũng sẽ đến. Có ba hướng phổ biến: quản lý con người ở quy mô lớn hơn (Engineering Manager), đi sâu kỹ thuật với phạm vi ảnh hưởng rộng hơn (Staff hoặc Principal Engineer), hoặc chuyển sang thiết kế giải pháp (Solution Architect). Không hướng nào "cao hơn" hướng nào, nhưng chọn một hướng không hợp với mình có thể khiến bạn mất vài năm. Bài này giúp bạn phân biệt các hướng, thử trước khi chọn, chuẩn bị bằng chứng năng lực và lập kế hoạch phát triển 12 tháng.

## Mục tiêu bài học

- Phân biệt IC track (Staff/Principal Engineer) với management track (Engineering Manager), và biết vị trí của Solution Architect.
- Tự đánh giá thiên hướng, thử nghiệm trước khi quyết định và trao đổi về sự nghiệp với cấp trên.
- Chọn chứng chỉ phù hợp với hướng đi: PSM I, Spring Professional, AWS Developer Associate.
- Xây dựng portfolio lãnh đạo dựa trên dự án đã dẫn dắt và kết quả của team.
- Lập kế hoạch phát triển cá nhân 12 tháng, kể cả khi muốn chuyển sang lộ trình Solution Architect.

## Bản đồ các hướng đi

Nhiều công ty công nghệ dùng **career ladder kép** (dual career ladder): một nhánh dành cho IC (*individual contributor*, người tạo giá trị chủ yếu bằng chuyên môn của mình) và một nhánh dành cho quản lý, với các cấp tương đương nhau. Nhờ vậy, một kỹ sư giỏi có thể tiếp tục thăng tiến mà không bắt buộc phải đi quản lý. Tên gọi và định nghĩa từng cấp khác nhau giữa các công ty, có nơi còn chưa có nhánh IC phía trên Senior, nên hãy đọc career ladder của chính công ty bạn trước tiên.

### IC track: Staff và Principal Engineer

**Staff Engineer** là cấp IC phía trên Senior. Thay vì chịu trách nhiệm cho một phần việc trong một team, họ chịu trách nhiệm cho những vấn đề kỹ thuật **xuyên nhiều team**: định hướng kỹ thuật, giải quyết vấn đề khó mà không team nào tự làm được, nâng chuẩn chất lượng, mentoring các senior. **Principal Engineer** thường là cấp cao hơn nữa, với phạm vi ở mức cả khối kỹ thuật hoặc cả công ty.

Trong cuốn *Staff Engineer: Leadership beyond the management track*, Will Larson mô tả bốn kiểu Staff Engineer thường gặp:

| Kiểu | Họ làm gì | Ví dụ trong bối cảnh Java |
|---|---|---|
| **Tech Lead** | Dẫn dắt hướng đi kỹ thuật và cách thực thi của một hoặc vài team | Dẫn ba team cùng chuyển từ monolith sang các service theo domain |
| **Architect** | Chịu trách nhiệm hướng đi, chất lượng kỹ thuật của một mảng quan trọng | Sở hữu kiến trúc toàn bộ mảng thanh toán |
| **Solver** | Đi sâu vào những vấn đề khó, giải xong thì chuyển sang vấn đề khác | Xử lý vấn đề GC pause gây timeout trên nhiều service |
| **Right Hand** | Mở rộng sức ảnh hưởng của một lãnh đạo cấp cao, xử lý các vấn đề cấp tổ chức | Hỗ trợ CTO chuẩn hoá quy trình vận hành cho cả khối |

Staff Engineer không phải là "senior được code nhiều hơn": họ dành rất nhiều thời gian để viết, thuyết phục và gây ảnh hưởng không cần quyền lực (xem bài *Giao tiếp & Tầm ảnh hưởng*).

### Management track: Engineering Manager

**Engineering Manager (EM)** chịu trách nhiệm về **con người và tổ chức**: tuyển dụng, đánh giá và phát triển từng người, sức khoẻ của team, khả năng giao hàng, phối hợp với các bộ phận khác. EM thường code rất ít hoặc không code; thành công của họ được đo qua kết quả và sự phát triển của team. Các cấp tiếp theo có thể là Senior EM, Director of Engineering, VP of Engineering. Cuốn *The Manager's Path* của Camille Fournier mô tả khá rõ con đường từ tech lead lên các cấp quản lý.

Ở một số nơi còn có vai trò lai **Tech Lead Manager (TLM)**: vừa dẫn dắt kỹ thuật vừa quản lý con người cho một team nhỏ. Vai trò này gần với Dev Lead hiện tại của bạn, nhưng thường khó duy trì khi team lớn dần.

### Solution Architect

**Solution Architect (SA)** thiết kế giải pháp end-to-end cho một bài toán kinh doanh: hiểu yêu cầu, chọn công nghệ, đảm bảo các yêu cầu phi chức năng (hiệu năng, bảo mật, chi phí), tài liệu hoá và đồng hành cùng các team phát triển. Ở một số công ty, SA thuộc nhánh IC; ở công ty khác, SA là một nhánh riêng, gắn với bộ phận presales hoặc khối kiến trúc.

### So sánh nhanh

| Tiêu chí | Staff/Principal Engineer | Engineering Manager | Solution Architect |
|---|---|---|---|
| Trọng tâm | Hướng đi và chất lượng kỹ thuật | Con người, team, tổ chức | Giải pháp đáp ứng bài toán kinh doanh |
| Phạm vi | Nhiều team, một mảng hệ thống | Một hoặc nhiều team | Một giải pháp, thường liên quan nhiều hệ thống |
| Thành công đo bằng | Hệ thống tốt hơn, vấn đề khó được giải | Team giao hàng tốt, con người phát triển | Giải pháp được duyệt, triển khai đúng, đạt yêu cầu |
| Thời gian code | Có, nhưng không phải phần lớn | Rất ít hoặc không | Ít, chủ yếu PoC và review |
| Ngày làm việc | Design doc, review, prototype, thuyết phục | 1:1, tuyển dụng, kế hoạch, cuộc nói chuyện khó | Làm việc với business, thiết kế, tài liệu, review |
| Kỹ năng then chốt | Chiều sâu kỹ thuật, viết, influence | Thấu hiểu con người, tổ chức, ra quyết định | Bề rộng công nghệ, phân tích đánh đổi, trình bày |
| Hợp với người | Thích vấn đề kỹ thuật khó, phạm vi rộng | Thấy vui khi người khác thành công | Thích kết nối kinh doanh với kỹ thuật |

### Con lắc giữa hai nhánh

Charity Majors có bài viết nổi tiếng về **"con lắc kỹ sư – quản lý"** (*The Engineer/Manager Pendulum*). Quan điểm của bà là bạn có thể chuyển qua lại giữa hai vai trò, và kinh nghiệm ở mỗi bên giúp bạn làm tốt hơn ở bên còn lại. Ở các công ty có career ladder kép, chuyển sang quản lý thường được xem là **đổi nghề** chứ không phải thăng chức. Hiểu điều này giúp bạn chọn bằng sở thích và thế mạnh, thay vì bằng danh xưng.

## Tự đánh giá và thử trước khi chọn

### Câu hỏi tự đánh giá

```text
Trả lời thật lòng, ghi ví dụ cụ thể cho từng câu

1. Sau một ngày toàn 1:1 và họp, mình thấy có năng lượng hay kiệt sức?
2. Sau một ngày debug một vấn đề khó, mình thấy thế nào?
3. Khi một thành viên được khen vì việc mình đã hướng dẫn, mình thấy vui
   hay thấy thiếu?
4. Mình có thích nói chuyện với khách hàng, business về bài toán của họ không?
5. Việc nào mình làm mà quên cả thời gian trong 6 tháng qua?
6. Mình có sẵn sàng code rất ít trong vài năm tới không?
7. Mình muốn được biết đến vì điều gì sau 5 năm nữa?

Gợi ý đọc kết quả:
- Câu 1, 3 tích cực, câu 6 "có"         -> nghiêng về Engineering Manager
- Câu 2, 5 xoay quanh vấn đề kỹ thuật   -> nghiêng về Staff/Principal
- Câu 4 tích cực, thích thiết kế đa hệ thống -> nghiêng về Solution Architect
```

### Thử nghiệm 3–6 tháng

Câu trả lời trên giấy chỉ là giả thuyết. Hãy thử một phần công việc của vai trò mới khi vẫn đang làm lead:

| Muốn thử | Thí nghiệm gợi ý |
|---|---|
| Engineering Manager | Nhận thêm phần tuyển dụng, chủ trì kế hoạch đánh giá hiệu suất cuối năm, hỗ trợ một lead mới |
| Staff Engineer | Dẫn một sáng kiến kỹ thuật liên team (chuẩn observability, nâng cấp Java 21 cho nhiều service), viết RFC và kéo các team đồng thuận |
| Solution Architect | Làm thiết kế cho một tính năng liên nhiều hệ thống, tham gia ước lượng cho hồ sơ dự thầu, đi cùng SA trong các buổi làm việc với khách hàng |

Sau thí nghiệm, hãy trả lời lại bộ câu hỏi trên: cảm nhận thật sau ba tháng thường đáng tin hơn hình dung ban đầu.

### Trò chuyện về sự nghiệp với cấp trên

Cấp trên không đoán được bạn muốn gì. Hãy chủ động đặt một buổi riêng, tách khỏi 1:1 thường lệ:

```text
Hướng dẫn cuộc trò chuyện sự nghiệp

Trước buổi:
  - Đọc career ladder của công ty, đánh dấu tiêu chí cấp tiếp theo
  - Chuẩn bị: hướng mình đang nghiêng về, lý do, 3 bằng chứng gần đây

Trong buổi, hỏi:
  - "Theo anh/chị, em đang ở đâu so với tiêu chí cấp tiếp theo?"
  - "Cần thấy điều gì từ em trong 6–12 tháng tới để đủ điều kiện?"
  - "Trong công ty, cơ hội nào sắp có phù hợp với hướng này?"
  - "Anh/chị có thể giới thiệu em với ai đã đi con đường này không?"

Sau buổi:
  - Gửi lại tóm tắt bằng văn bản: mục tiêu, khoảng cách, việc cần làm
  - Hẹn xem lại mỗi quý
```

> **Tuấn:** Anh Phong, em muốn trao đổi về hướng đi một hai năm tới. Em đã thử dẫn phần thiết kế tích hợp ví B với ba hệ thống khác, và thấy rất hứng thú với phần làm việc với SA và khách hàng. Em đang nghĩ đến hướng Solution Architect. Theo anh, em còn thiếu gì?
>
> **Phong:** Em mạnh về Java và delivery. Cái em thiếu là bề rộng: cloud, bảo mật, và việc trình bày phương án có chi phí cho khách hàng. Quý tới bên presales cần người làm ước lượng cho hồ sơ một ngân hàng, em có muốn tham gia không?
>
> **Tuấn:** Dạ có ạ. Em sẽ gửi anh tóm tắt hôm nay, và mình xem lại vào cuối quý nhé.

## Chứng chỉ hỗ trợ

Chứng chỉ không thay được kinh nghiệm, nhưng giúp hệ thống hoá kiến thức và là tín hiệu cho nhà tuyển dụng hoặc khách hàng (một số hồ sơ dự thầu yêu cầu nhân sự có chứng chỉ). Hãy chọn theo hướng đi, đừng chạy theo số lượng.

| Chứng chỉ | Tổ chức cấp | Chứng minh điều gì | Hợp nhất với hướng |
|---|---|---|---|
| Professional Scrum Master I (PSM I) | Scrum.org | Hiểu đúng Scrum theo Scrum Guide | Engineering Manager, Dev Lead phụ trách delivery |
| Spring Certified Professional | Spring Academy (Broadcom) | Hiểu sâu cách Spring và Spring Boot hoạt động | Staff Engineer, Dev Lead thiên kỹ thuật |
| AWS Certified Developer – Associate | Amazon Web Services | Phát triển, triển khai và debug ứng dụng trên AWS | Staff Engineer, bước đệm sang Solution Architect |

> **Lưu ý:** Số câu hỏi, thời gian, điểm đạt, mã đề và lệ phí thi có thể thay đổi. Các thông số dưới đây chỉ để tham khảo; hãy kiểm tra trang chính thức trước khi đăng ký.

### Professional Scrum Master I (PSM I)

- **Hình thức:** thi online, không bắt buộc học khoá trước. Theo Scrum.org, bài thi gồm 80 câu trong 60 phút, cần đạt 85% để qua, và chứng chỉ không có hạn sử dụng.
- **Cách ôn:** đọc kỹ *Scrum Guide* nhiều lần (tài liệu này ngắn, chưa đến 20 trang), sau đó làm bài đánh giá thử miễn phí *Scrum Open* trên Scrum.org cho đến khi đạt điểm tuyệt đối nhiều lần liên tiếp.
- **Bẫy thường gặp:** trả lời theo cách công ty bạn đang làm thay vì theo Scrum Guide. Ví dụ, Scrum Master không giao task cho developer, và Daily Scrum là sự kiện của Developers, không phải buổi báo cáo cho Scrum Master.
- **So sánh:** chứng chỉ CSM của Scrum Alliance yêu cầu học khoá với giảng viên được chứng nhận và phải gia hạn định kỳ; PSM I thì không.

### Spring Certified Professional

Chứng chỉ này kiểm tra hiểu biết về Spring Core, AOP, truy cập dữ liệu và transaction, Spring MVC, Security, testing và cơ chế auto-configuration của Spring Boot. Tên, mã đề và điều kiện dự thi đã thay đổi vài lần qua các giai đoạn Pivotal, VMware rồi Broadcom. Phạm vi kiến thức và kế hoạch ôn chi tiết có trong bài *Chứng chỉ Java & Spring* của lộ trình Solution Architect. Với Dev Lead, giá trị lớn nhất là bạn review code và xử lý sự cố tốt hơn: hiểu vì sao `@Transactional` không có tác dụng khi gọi nội bộ trong cùng class, hay vì sao một bean không được tạo.

### AWS Certified Developer – Associate

Chứng chỉ cấp Associate (mã đề DVA-C02 tại thời điểm biên soạn) tập trung vào việc xây dựng ứng dụng trên AWS: Lambda, API Gateway, DynamoDB, SQS/SNS, IAM, CI/CD và giám sát bằng CloudWatch, X-Ray. Theo hướng dẫn kỳ thi của AWS, bài thi có 65 câu trong 130 phút, thang điểm 100–1000 với điểm đạt 720, và chứng chỉ có hiệu lực 3 năm. Chứng chỉ này hợp với team đang chạy trên AWS, và là bước đệm tốt trước AWS Solutions Architect – Associate nếu đích đến là SA (xem bài *Chứng chỉ Cloud Architect*).

## Xây dựng portfolio lãnh đạo

Portfolio của SA thường là các bài thiết kế trên GitHub (xem bài *Portfolio & Phỏng vấn*). Portfolio của một lead thì khác: nó là **bằng chứng về kết quả bạn tạo ra thông qua người khác**: dự án đã dẫn dắt, kết quả team đạt được, những người đã tiến bộ nhờ bạn, những quy trình bạn đã cải thiện.

### Brag document: ghi lại khi còn nhớ

Khái niệm **brag document** (tài liệu ghi nhận thành tích) được Julia Evans phổ biến: một tài liệu bạn cập nhật đều đặn, ghi lại những việc mình đã làm và kết quả của chúng. Đến kỳ đánh giá hay khi phỏng vấn, bạn sẽ không phải cố nhớ lại mình đã làm gì cả năm.

```text
Mục portfolio lãnh đạo — mỗi dự án/sáng kiến một mục

Tên dự án      : Tích hợp ví điện tử B cho cổng thanh toán
Thời gian      : 3/2026 – 7/2026
Bối cảnh       : Team 6 người, go-live gắn với hợp đồng đối tác
Vai trò của tôi: Dev Lead; chịu trách nhiệm kế hoạch, thiết kế, stakeholder
Tôi đã làm     : - Chia giai đoạn, dùng WireMock khi đối tác chậm cấp sandbox
                 - Escalate rủi ro sandbox sớm 6 tuần, kèm 2 phương án
                 - Giao phần callback cho Minh, pair 2 buổi đầu
Kết quả team   : Go-live đúng hạn; không có sự cố mức nghiêm trọng trong tháng đầu
                 (số liệu từ hệ thống quản lý sự cố của team)
Con người      : Minh lần đầu tự trình bày thiết kế với SA, được đề cử lên senior
Bài học        : Lần sau sẽ test tải sớm hơn một sprint
Bằng chứng     : Link design doc, ADR, báo cáo tuần, lời ghi nhận từ PM
```

Các loại kết quả nên ghi lại: chỉ số delivery (ví dụ chỉ số DORA trong bài *SRE & Chỉ số DORA*, hay cycle time), số sự cố và thời gian khôi phục, thời gian onboarding người mới, kết quả tuyển dụng, những người được thăng cấp hoặc nhận thêm trách nhiệm, quyết định kỹ thuật quan trọng (kèm ADR). Hãy chỉ dùng số liệu bạn thực sự có, và ghi rõ nguồn.

### Nguyên tắc khi trình bày

- **Phân biệt "tôi" và "team":** "Team giảm cycle time từ 6 xuống 3 ngày; tôi đề xuất giới hạn WIP và chia nhỏ story" vừa trung thực vừa cho thấy đóng góp của bạn.
- **Kết quả trước, hoạt động sau:** "Go-live đúng hạn với đối tác" quan trọng hơn "tổ chức 12 buổi họp".
- **Gắn với tiêu chí của cấp tiếp theo** khi chuẩn bị hồ sơ thăng cấp, và bỏ tên khách hàng, số liệu nhạy cảm khi dùng bên ngoài công ty.
- Khi phỏng vấn, chuyển mỗi mục thành một câu chuyện theo khung **STAR** (Situation, Task, Action, Result) như trong bài *Portfolio & Phỏng vấn*.

## Chuyển sang lộ trình Solution Architect

Nếu sau thử nghiệm bạn thấy mình thích thiết kế đa hệ thống, phân tích đánh đổi và làm việc với business hơn là quản lý con người, lộ trình Solution Architect trên site này là bước tiếp theo tự nhiên. Tin tốt là lộ trình Dev Lead và lộ trình SA dùng chung các giai đoạn Java Core, Spring, Dữ liệu và Microservices, nên bạn không bắt đầu từ con số không.

| Bạn đã có từ Dev Lead | Cần bổ sung | Giai đoạn trên lộ trình SA |
|---|---|---|
| Kiến trúc cấp team, ADR, design doc | Thiết kế hệ thống quy mô lớn, thuộc tính chất lượng | System Design & Kiến trúc |
| Vận hành production, CI/CD | Kiến trúc cloud, tối ưu chi phí, Well-Architected | Cloud & DevOps |
| Bảo mật ở mức code | Danh tính, bảo vệ dữ liệu, tuân thủ | Bảo mật kiến trúc |
| Tích hợp với vài hệ thống | Mẫu tích hợp doanh nghiệp, hướng sự kiện | Tích hợp & Messaging |
| Làm việc với PO, stakeholder | Phân tích yêu cầu, trình bày cho ban lãnh đạo, TCO | Năng lực Solution Architect |

Song song với việc học, hãy xin tham gia review kiến trúc và nhận thiết kế các tính năng liên nhiều hệ thống. Kinh nghiệm dẫn dắt team giao hàng là lợi thế thật sự của bạn: bạn biết một thiết kế "đẹp trên giấy" sẽ gặp khó ở đâu khi team hiện thực.

## Kế hoạch phát triển cá nhân 12 tháng

```text
Kế hoạch phát triển 12 tháng — [Tên] — bắt đầu [tháng/năm]

Hướng đi đã chọn: ............ Lý do (2–3 câu, kèm kết quả thử nghiệm): ............
Mục tiêu sau 12 tháng: vai trò/cấp độ hoặc trách nhiệm cụ thể muốn đạt

3 năng lực cần phát triển nhất:
  1. ............   2. ............   3. ............

Theo quý           Học                      Làm thật                    Bằng chứng
Quý 1   ......     (khoá học, sách)         (dự án, trách nhiệm mới)    (tài liệu, kết quả)
Quý 2   ......
Quý 3   ......
Quý 4   ......

Chứng chỉ (nếu có): tên — tháng dự kiến thi
Người hỗ trợ: mentor ......, sponsor ......, cấp trên ......
Điểm kiểm tra: cuối mỗi quý cùng cấp trên; điều chỉnh nếu hướng đi thay đổi
```

Ví dụ một quý cho hướng Solution Architect: *Học* giai đoạn System Design & Kiến trúc; *Làm thật* thiết kế luồng hoàn tiền liên ba hệ thống và trình bày với khách hàng; *Bằng chứng* là design doc được duyệt, hai ADR và nhận xét của SA phụ trách. Kế hoạch không cần hoàn hảo, nhưng phải có điểm kiểm tra định kỳ để điều chỉnh.

## Lỗi thường gặp

- **Coi Engineering Manager là con đường thăng tiến duy nhất.** Cách sửa: tìm hiểu career ladder của công ty; nếu chưa có nhánh IC, hãy hỏi cấp trên hoặc cân nhắc môi trường khác phù hợp hơn.
- **Chọn theo danh xưng thay vì theo công việc hằng ngày.** Cách sửa: hỏi những người đang làm vai trò đó xem một tuần của họ trông thế nào, rồi tự thử trong 3–6 tháng.
- **Sưu tầm chứng chỉ.** Cách sửa: chọn một hoặc hai chứng chỉ gắn với hướng đi và áp dụng ngay kiến thức vào dự án.
- **Portfolio chỉ liệt kê công nghệ và nhiệm vụ.** Cách sửa: với mỗi mục, ghi vai trò của bạn, việc bạn làm và kết quả đo được của team.
- **Nhận hết công về mình.** Cách sửa: tách rõ phần "tôi" và phần "team", và nêu tên những người đã đóng góp.
- **Chờ cấp trên tự nhận ra.** Cách sửa: chủ động trò chuyện về sự nghiệp và xem lại mỗi quý.

## Bài tập thực hành

1. **Thí nghiệm một hướng đi:** Chọn hướng bạn đang nghiêng về nhất, thiết kế một thí nghiệm 3 tháng theo bảng gợi ý và trao đổi với cấp trên để được giao. Cuối mỗi tháng, ghi lại mức năng lượng và điều học được.
2. **Viết ba mục brag document:** Chọn ba dự án hoặc sáng kiến bạn đã dẫn dắt trong năm qua, viết theo template portfolio lãnh đạo, có ít nhất một kết quả đo được cho mỗi mục. Nhờ một đồng nghiệp đọc và hỏi: "Đọc xong, anh/chị có biết tôi đã đóng góp gì không?"
3. **Kế hoạch 12 tháng:** Điền template kế hoạch phát triển 12 tháng, chọn một chứng chỉ phù hợp (PSM I hoặc Spring Professional theo mốc của giai đoạn này) và đặt lịch cho buổi trò chuyện sự nghiệp với cấp trên trong tháng này.

## Tóm tắt

- Ba hướng phổ biến sau Dev Lead là Engineering Manager, Staff/Principal Engineer và Solution Architect; không hướng nào cao hơn, chỉ khác trọng tâm công việc.
- Staff Engineer chịu trách nhiệm cho vấn đề kỹ thuật xuyên nhiều team và cần nhiều kỹ năng viết, thuyết phục; EM chịu trách nhiệm cho con người và tổ chức.
- Hãy tự đánh giá, thử một phần công việc của vai trò mới trong 3–6 tháng, và chủ động trò chuyện về sự nghiệp với cấp trên.
- Chọn chứng chỉ theo hướng đi: PSM I cho delivery và quản lý, Spring Professional cho chiều sâu kỹ thuật, AWS Developer Associate làm bước đệm sang cloud và SA.
- Portfolio lãnh đạo là bằng chứng về kết quả tạo ra thông qua người khác; hãy cập nhật brag document đều đặn và tách rõ phần "tôi" với phần "team".
- Nếu thiên về kiến trúc, lộ trình Solution Architect tận dụng được nền tảng Dev Lead; tập trung bổ sung system design, cloud, bảo mật và kỹ năng làm việc với business.
- Kế hoạch 12 tháng cần hướng đi rõ, ba năng lực trọng tâm, bằng chứng theo quý và điểm kiểm tra định kỳ với cấp trên.
