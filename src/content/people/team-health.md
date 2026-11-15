Một team Java có kỹ năng giỏi vẫn có thể giao hàng kém nếu mọi người ngại báo lỗi, giấu khó khăn hoặc âm thầm kiệt sức. Sức khoẻ team không phải chuyện "phúc lợi cho vui"; nó quyết định việc bug được báo sớm hay muộn, thiết kế tồi có bị phản biện hay không, và người giỏi có ở lại hay không. Dev Lead là người ảnh hưởng trực tiếp nhất đến bầu không khí hằng ngày của team, nên cần nhận ra vấn đề sớm và biết cách xử lý.

## Mục tiêu bài học

- Hiểu đúng psychological safety và biết những hành động cụ thể để xây dựng nó trong bối cảnh văn hoá Việt Nam.
- Nhận biết dấu hiệu sớm của burnout và mất động lực, biết lead nên và không nên làm gì.
- Giải quyết xung đột giữa các thành viên theo một quy trình rõ ràng.
- Dùng mô hình Tuckman để hiểu team đang ở giai đoạn nào và cần gì.

## Psychological safety

### Hiểu cho đúng

Amy Edmondson định nghĩa **psychological safety** (an toàn tâm lý) là niềm tin chung của các thành viên rằng team là nơi an toàn để chấp nhận rủi ro trong quan hệ giữa người với người: dám hỏi, dám nói "em không biết", dám thừa nhận sai, dám phản biện ý kiến của lead. Trong nghiên cứu Project Aristotle của Google về các yếu tố làm nên team hiệu quả, psychological safety đứng đầu danh sách năm yếu tố, cùng với dependability (tin cậy được nhau), structure & clarity (vai trò và mục tiêu rõ ràng), meaning (ý nghĩa với cá nhân) và impact (tác động của công việc).

Psychological safety **không** có nghĩa là dễ dãi hay hạ tiêu chuẩn. Edmondson đặt nó cạnh trục *tiêu chuẩn và trách nhiệm*:

| | Tiêu chuẩn thấp | Tiêu chuẩn cao |
|---|---|---|
| **An toàn cao** | Vùng thoải mái: vui vẻ nhưng ít thử thách | Vùng học hỏi: dám nói, dám thử, cùng hướng tới kết quả cao |
| **An toàn thấp** | Vùng thờ ơ: làm cho có | Vùng lo âu: áp lực cao nhưng không ai dám báo vấn đề |

Nhiều team chạy dự án gấp đang ở vùng lo âu: deadline căng, ai cũng sợ bị trách, nên lỗi bị che đi cho đến tận ngày release.

### Bối cảnh Việt Nam

- **Khoảng cách cấp bậc:** junior thường đợi senior và lead nói trước, rồi đồng ý theo.
- **Giữ thể diện:** hỏi "câu ngớ ngẩn" trước team, hay chỉ ra lỗi của anh chị lớn hơn, đều bị coi là khó xử.
- **"Dạ, vâng" chưa chắc là đồng ý:** nhiều khi đó chỉ là lịch sự. Sự im lặng trong cuộc họp thường có nghĩa là "em chưa dám nói".

### Hành động cụ thể của lead

- **Thừa nhận giới hạn của mình trước:** "Phần Kubernetes này anh không chắc, Minh giải thích giúp anh được không?". "Anh có thể sai ở đây, ai thấy chỗ nào chưa ổn thì nói nhé."
- **Phản ứng tốt với tin xấu:** khi ai đó báo "Em làm hỏng dữ liệu staging rồi", câu đầu tiên nên là "Cảm ơn em đã báo sớm, mình cùng xem nhé", không phải "Sao lại thế?". Cách phản ứng của bạn trong những lần như thế quyết định lần sau người ta có còn báo nữa hay không.
- **Mời người ít nói lên tiếng trước:** trong buổi design review, hỏi ý kiến junior trước, lead nói sau cùng. Dùng cách cho mọi người viết ý kiến lên sticky note trên Miro trong 5 phút, rồi mới thảo luận.
- **Postmortem không đổ lỗi (blameless):** hỏi "Điều gì trong hệ thống và quy trình đã cho phép lỗi này xảy ra?" thay vì "Ai làm?".
- **Coi bất đồng về kỹ thuật là chuyện bình thường:** khen cả người phản biện đúng lẫn người dám đặt câu hỏi.
- **Có working agreement:** thống nhất chuẩn mực chung, ví dụ "comment review nhắm vào code, không nhắm vào người".

### Đo mức độ an toàn

Bạn có thể làm một khảo sát ẩn danh ngắn mỗi quý, với các câu tự xây dựng, chấm theo thang 1–5:

```text
Khảo sát nhanh sức khoẻ team (ẩn danh)
1. Tôi có thể nói "tôi không biết" hoặc hỏi lại mà không lo bị đánh giá thấp.
2. Khi tôi mắc lỗi, team tập trung vào cách sửa hơn là tìm người chịu trách nhiệm.
3. Tôi thoải mái phản biện ý kiến của lead trong cuộc họp.
4. Khối lượng công việc của tôi trong tháng qua là bền vững.
5. Tôi hiểu công việc của mình đóng góp gì cho sản phẩm.
6. Một điều team nên thay đổi: ______
```

Ngoài con số, hãy quan sát các tín hiệu: ai hay nói trong cuộc họp, có ai hỏi trên channel chung không, bug có được báo sớm không, retrospective có điểm nào thật sự gai góc không. Kết quả khảo sát nên được mang ra thảo luận cùng team, đừng chỉ để lead xem.

## Burnout và mất động lực

### Burnout là gì

Trong ICD-11, Tổ chức Y tế Thế giới (WHO) mô tả **burnout** là một *hiện tượng nghề nghiệp* (không xếp vào nhóm bệnh lý), sinh ra từ căng thẳng kéo dài ở nơi làm việc không được kiểm soát tốt, với ba biểu hiện:

- Kiệt sức, cạn năng lượng.
- Tách mình xa khỏi công việc, có thái độ tiêu cực hoặc hoài nghi về công việc.
- Giảm hiệu quả làm việc.

### Dấu hiệu sớm lead có thể quan sát

| Dấu hiệu | Ví dụ trong team |
|---|---|
| Thời gian làm việc bất thường | Commit lúc 1–2 giờ sáng, làm cả cuối tuần nhiều tuần liền |
| Rút lui | Trước đây hay góp ý trong design review, nay im lặng; tắt camera, không còn tham gia nói chuyện chung |
| Hoài nghi | "Làm gì thì cũng bị đổi yêu cầu thôi", "Kệ, release được là được" |
| Chất lượng giảm | PR nhiều lỗi vặt hơn bình thường, quên test những case quen thuộc |
| Dễ cáu | Comment review gay gắt, phản ứng mạnh với những thay đổi nhỏ |
| Nghỉ ốm, nghỉ đột xuất nhiều hơn | Xin nghỉ sát giờ nhiều lần trong tháng |

Một dấu hiệu riêng lẻ chưa nói lên gì; điều cần để ý là **sự thay đổi so với chính người đó trước đây**.

### Tìm nguyên nhân

Christina Maslach và Michael Leiter chỉ ra sáu vùng của công việc thường gắn với burnout. Bạn có thể dùng chúng làm danh sách để kiểm tra:

- **Khối lượng công việc:** dự án chồng dự án, on-call dồn vào một người.
- **Quyền kiểm soát:** bị giao giải pháp, không được tham gia quyết định.
- **Ghi nhận:** làm thêm giờ để cứu release nhưng không ai nhắc đến.
- **Cộng đồng:** quan hệ trong team căng thẳng, cảm thấy bị cô lập.
- **Công bằng:** người làm nhiều không được đánh giá cao hơn người làm ít.
- **Giá trị:** bị yêu cầu làm những điều trái nguyên tắc, chẳng hạn bỏ test để kịp demo.

Với **mất động lực**, khung *autonomy – mastery – purpose* (tự chủ – thành thạo – ý nghĩa) do Daniel Pink phổ biến thường hữu ích: người đó có được tự quyết cách làm không, có đang học được gì mới không, có hiểu việc mình làm để làm gì không?

### Lead nên làm gì

1. **Nói chuyện riêng, quan tâm trước, công việc sau:** "Anh để ý mấy tuần nay em hay làm khuya, anh hơi lo. Dạo này em thấy thế nào?"
2. **Giảm tải thật:** gỡ bớt việc, dời deadline cùng PO, xoay vòng on-call và hotfix để không dồn vào một người.
3. **Khuyến khích nghỉ phép và tôn trọng thời gian nghỉ:** không nhắn việc ngoài giờ trừ khi có sự cố, lead không tự làm gương xấu bằng cách gửi tin nhắn lúc nửa đêm.
4. **Đừng ca ngợi làm thêm giờ** như thể đó là tiêu chuẩn của sự tận tâm.
5. **Biết giới hạn của mình:** lead không phải bác sĩ hay chuyên gia tâm lý. Nếu thấy dấu hiệu nghiêm trọng, hãy giới thiệu thành viên tới HR hoặc các kênh hỗ trợ chuyên môn mà công ty có.

## Giải quyết xung đột giữa các thành viên

### Xung đột công việc và xung đột quan hệ

- **Xung đột về công việc** (dùng Kafka hay RabbitMQ, đặt logic ở service nào) là lành mạnh nếu được tranh luận bằng dữ kiện.
- **Xung đột về quan hệ** (không ưa nhau, cảm thấy bị coi thường) thì gây hại và thường âm ỉ, đặc biệt trong một văn hoá ngại va chạm.

Xung đột công việc mà không được giải quyết thường biến thành xung đột quan hệ.

### Năm cách ứng xử (Thomas–Kilmann)

| Cách | Khi nào phù hợp |
|---|---|
| Cạnh tranh (competing) | Sự cố khẩn cấp, cần quyết định nhanh |
| Hợp tác (collaborating) | Vấn đề quan trọng, cần giải pháp thoả mãn cả hai bên |
| Thoả hiệp (compromising) | Hai bên ngang nhau, cần giải pháp tạm thời |
| Né tránh (avoiding) | Chuyện nhỏ, hoặc cần để cảm xúc lắng xuống |
| Nhường nhịn (accommodating) | Vấn đề quan trọng với bên kia hơn với mình |

Team Việt Nam thường nghiêng về né tránh và nhường nhịn. Hai cách này hữu ích trong ngắn hạn nhưng gây hại nếu kéo dài.

### Quy trình can thiệp

1. **Nói chuyện riêng với từng người.** Lắng nghe, đừng phán xét, tách dữ kiện ra khỏi cảm xúc.
2. **Tìm lợi ích đằng sau lập trường.** "Anh Long muốn dùng Kafka" là lập trường; "anh Long lo hệ thống mất message khi đối tác gửi dồn dập" là lợi ích.
3. **Gặp chung với quy tắc rõ ràng:** mỗi người trình bày, người kia nhắc lại cho đúng ý trước khi phản hồi.
4. **Thống nhất tiêu chí quyết định** (độ tin cậy, chi phí vận hành, kỹ năng hiện có), rồi mới so sánh các phương án. Với quyết định kỹ thuật lớn, ghi lại bằng ADR.
5. **Nếu vẫn không đồng thuận,** người có thẩm quyền quyết định và mọi người "disagree and commit" (không đồng ý nhưng vẫn cam kết thực hiện).
6. **Theo dõi sau vài tuần.**

Ví dụ hội thoại khi xử lý chuyện comment review gay gắt:

> **Lead (nói riêng với Long):** Anh Long, em thấy trong PR #615 của Hà, anh viết "Code này không chấp nhận được, viết lại đi". Sau đó Hà ít tạo PR hẳn và hay nhờ người khác review thay. Em biết anh muốn giữ chất lượng cho module thanh toán. Anh nghĩ mình có cách nào góp ý để Hà sửa được mà không bị nản không?
>
> **Long:** Anh chỉ muốn nói nhanh thôi, chứ không có ý gì. Chắc anh nên ghi rõ chỗ nào sai và gợi ý cách sửa.
>
> **Lead:** Hay quá. Mình đưa nguyên tắc đó vào working agreement của cả team luôn được không anh?

## Các giai đoạn phát triển team (Tuckman)

Bruce Tuckman đề xuất các giai đoạn phát triển của một nhóm. Sau này ông cùng Mary Ann Jensen bổ sung thêm giai đoạn cuối:

| Giai đoạn | Dấu hiệu | Vai trò của lead |
|---|---|---|
| Forming (hình thành) | Lịch sự, dè dặt, phụ thuộc vào lead | Làm rõ mục tiêu, vai trò; cùng viết working agreement |
| Storming (xung đột) | Tranh luận về cách làm, có phe phái, có người thất vọng | Đưa xung đột ra công khai, hỗ trợ tranh luận có cấu trúc, đừng dập tắt |
| Norming (ổn định) | Hình thành chuẩn mực chung, tin nhau hơn | Trao quyền dần, để team tự điều chỉnh quy trình |
| Performing (hiệu quả) | Tự tổ chức, xử lý vấn đề nhanh | Uỷ quyền, giao thử thách mới, bảo vệ team khỏi bị xáo trộn |
| Adjourning (kết thúc) | Dự án kết thúc hoặc team giải tán | Ghi nhận đóng góp, tổng kết bài học |

Team không chỉ đi theo một chiều. Khi có thành viên mới, đổi lead hay đổi mục tiêu lớn, team có thể quay lại giai đoạn forming hoặc storming. Đó là chuyện bình thường, không phải thất bại.

```text
WORKING AGREEMENT — Team Payment (xem lại mỗi quý)
- Giờ tập trung: 9h–11h30 không họp
- Daily 9h15, tối đa 15 phút
- PR được review trong 1 ngày làm việc; comment nhắm vào code, kèm gợi ý
- Có bug hoặc block: báo trên channel trong ngày, không đợi daily
- Không nhắn việc sau 20h trừ khi có sự cố production
- Bất đồng kỹ thuật: thảo luận tối đa 30', chưa xong thì viết ADR
- Ai cũng có thể dừng một release nếu thấy rủi ro chất lượng
```

## Lỗi thường gặp

- **Hiểu psychological safety là "không ai được phê bình".** Cách sửa: giữ tiêu chuẩn cao, đồng thời làm cho việc nói thật trở nên an toàn.
- **Lead nói trước rồi mới hỏi ý kiến.** Cách sửa: để người ít thâm niên nói trước, lead nói sau cùng.
- **Bắt lỗi người khi có sự cố.** Cách sửa: postmortem blameless, tập trung vào hệ thống và quy trình.
- **Coi làm thêm giờ là chuyện bình thường.** Cách sửa: theo dõi khối lượng công việc, xem thời gian làm khuya kéo dài là tín hiệu cảnh báo.
- **Né tránh xung đột với hy vọng "để tự hết".** Cách sửa: can thiệp sớm, nói riêng với từng người trước.
- **Khảo sát xong rồi không làm gì.** Cách sửa: chia sẻ kết quả với team và chọn 1–2 hành động cụ thể.

## Bài tập thực hành

1. **Khảo sát sức khoẻ team:** Chạy khảo sát ẩn danh ở trên (hoặc phiên bản của bạn). Trình bày kết quả trong retrospective tiếp theo, để team chọn một điểm muốn cải thiện và theo dõi trong một tháng.
2. **Working agreement:** Tổ chức một buổi 45 phút để team cùng viết working agreement. Lead chỉ điều phối, các thành viên đề xuất và bỏ phiếu. Dán kết quả lên Confluence và hẹn xem lại sau một quý.
3. **Xác định giai đoạn Tuckman:** Viết nửa trang về việc team bạn đang ở giai đoạn nào, dựa trên những hành vi cụ thể bạn quan sát được, và ba việc bạn sẽ làm trong tháng tới cho phù hợp với giai đoạn đó.

## Tóm tắt

- Psychological safety là niềm tin rằng team an toàn để nói thật và thừa nhận sai. Nó đi cùng tiêu chuẩn cao, không thay thế tiêu chuẩn.
- Lead xây dựng sự an toàn qua hành vi hằng ngày: thừa nhận sai, phản ứng tốt với tin xấu, mời người ít nói lên tiếng trước, postmortem không đổ lỗi.
- Burnout gồm kiệt sức, hoài nghi và giảm hiệu quả. Hãy để ý sự thay đổi hành vi và tìm nguyên nhân ở khối lượng việc, quyền kiểm soát, ghi nhận, cộng đồng, công bằng và giá trị.
- Xung đột công việc là lành mạnh nếu được giải quyết bằng tiêu chí rõ ràng; can thiệp sớm, nói riêng trước, tìm lợi ích đằng sau lập trường.
- Tuckman giúp lead điều chỉnh cách dẫn dắt theo giai đoạn; team có thể quay lại giai đoạn trước khi có thay đổi.
- Working agreement biến những chuẩn mực ngầm thành thoả thuận rõ ràng mà cả team cùng giữ.
