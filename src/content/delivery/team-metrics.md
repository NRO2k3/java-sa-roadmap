Khi team lớn dần, câu hỏi "team mình làm việc có hiệu quả không?" không còn trả lời được bằng cảm giác. Nhưng số liệu cũng là con dao hai lưỡi: dùng đúng thì nó chỉ ra điểm nghẽn để cải tiến, còn dùng sai (xếp hạng cá nhân theo số commit, ép velocity tăng mỗi sprint) thì nó phá huỷ niềm tin và khiến mọi người tìm cách "làm đẹp số". Bài này giúp Dev Lead chọn đúng chỉ số, đọc đúng ý nghĩa của chúng, và dùng chúng để team tự cải tiến thay vì để kiểm soát.

## Mục tiêu bài học

- Hiểu và thu thập bốn chỉ số DORA cho pipeline của team Java.
- Dùng flow metrics (WIP, throughput, cycle time, work item age) để tìm điểm nghẽn.
- Hiểu năm khía cạnh của framework SPACE và cách kết hợp số liệu hệ thống với khảo sát.
- Nhận diện vanity metrics và các cạm bẫy khi dùng velocity.

## Nguyên tắc trước khi đo

- **Đo để học, không phải để phạt.** Khi một chỉ số trở thành mục tiêu gắn với thưởng phạt, mọi người sẽ tối ưu chính con số đó thay vì tối ưu kết quả thật. Hiện tượng này thường được gọi là định luật Goodhart.
- **Đo ở cấp team và hệ thống, không đo từng cá nhân.** Phần mềm là sản phẩm của cả nhóm. Một người dành cả ngày review và gỡ rối cho người khác có thể có ít commit nhất, nhưng lại đóng góp nhiều nhất.
- **Dùng các chỉ số theo cặp để cân bằng nhau:** tốc độ đi cùng độ ổn định, số lượng đi cùng chất lượng.
- **Cùng team chọn chỉ số,** và cùng xem số liệu trong retro. Số liệu nên là thứ team dùng để tự hỏi "vì sao?", không phải báo cáo nộp lên cấp trên.
- **Xem xu hướng, không xem một điểm dữ liệu đơn lẻ.**

## Chỉ số DORA

Chương trình nghiên cứu DORA (DevOps Research and Assessment) đưa ra bốn chỉ số then chốt để đo hiệu quả của quá trình delivery phần mềm, chia thành hai nhóm:

| Nhóm | Chỉ số | Định nghĩa | Cách thu thập trong team Java |
|---|---|---|---|
| Tốc độ (throughput) | **Deployment frequency** | Tần suất deploy lên production | Đếm các lần deploy thành công từ GitLab CI, Jenkins hoặc Argo CD |
| Tốc độ (throughput) | **Lead time for changes** | Thời gian từ khi commit đến khi chạy trên production | Thời điểm commit (hoặc merge) so với thời điểm deploy chứa commit đó |
| Ổn định (stability) | **Change failure rate** | Tỷ lệ lần deploy gây lỗi cần xử lý (rollback, hotfix, sự cố) | Số deploy gắn với sự cố hoặc rollback chia cho tổng số deploy |
| Ổn định (stability) | **Time to restore service** | Thời gian khôi phục dịch vụ khi có sự cố do thay đổi | Từ lúc phát hiện sự cố đến lúc khôi phục, lấy từ công cụ quản lý sự cố |

Trong các báo cáo DORA gần đây, chỉ số thứ tư được định nghĩa lại cụ thể hơn là thời gian khôi phục sau một lần deploy lỗi (failed deployment recovery time). Ý nghĩa thì vẫn vậy: khi thay đổi gây lỗi, team khôi phục nhanh đến đâu.

Một kết luận quan trọng từ nghiên cứu của DORA: **tốc độ và độ ổn định không nhất thiết đánh đổi cho nhau**. Các team làm tốt thường đạt cả hai, nhờ những thực hành như thay đổi nhỏ, tự động hoá test và deploy, trunk-based development, và feature flag.

Cách đọc chỉ số DORA trong thực tế:

- **Lead time dài** thường do PR lớn, chờ review lâu, test thủ công, hoặc phải chờ "release train" hằng tháng. Hãy tách lead time thành từng đoạn (code → review → merge → deploy) để biết thời gian mất ở đâu.
- **Change failure rate cao** có thể do thiếu integration test, cấu hình khác nhau giữa staging và production, hoặc release gộp quá nhiều thay đổi.
- **Thời gian khôi phục dài** thường do thiếu alert, thiếu runbook, hoặc rollback phức tạp (chẳng hạn migration DB không có đường lùi).

> **Lưu ý:** Hãy đo DORA cho từng service hoặc từng team, và xem xu hướng theo thời gian. Đừng biến DORA thành bảng xếp hạng giữa các team có bối cảnh khác nhau, chẳng hạn team core banking với team app nội bộ.

## Flow metrics

Flow metrics đo **dòng chảy công việc** trên board của team, bổ sung cho DORA, vốn chỉ đo phần từ commit đến production.

| Chỉ số | Định nghĩa | Dùng để |
|---|---|---|
| **WIP** | Số việc đang làm dở tại một thời điểm | Phát hiện việc làm quá nhiều thứ cùng lúc |
| **Throughput** | Số việc hoàn thành mỗi tuần | Dự báo (xem bài *Ước lượng & Lập kế hoạch*) |
| **Cycle time** | Thời gian từ lúc bắt đầu đến lúc hoàn thành một việc | Đo khả năng giao hàng đều đặn, đặt kỳ vọng |
| **Work item age** | Tuổi của việc *đang làm dở* | Phát hiện việc bị kẹt *trước khi* nó trễ |
| **Flow efficiency** | Thời gian làm thật chia cho tổng cycle time | Thấy được thời gian chờ (chờ review, chờ QA, chờ môi trường) |

Một số điều cần làm đúng:

- **Thống nhất điểm bắt đầu và kết thúc.** Ví dụ: bắt đầu khi chuyển sang In Progress, kết thúc khi Done trên production. Nếu mỗi người hiểu một kiểu, số liệu vô nghĩa.
- **Dùng phân vị thay cho trung bình:** "85% story xong trong 6 ngày hoặc ít hơn". Cycle time thường có phân bố lệch, với vài item rất dài, nên giá trị trung bình dễ gây hiểu lầm.
- **Biểu đồ phân tán cycle time (scatterplot):** mỗi chấm là một item; các chấm nằm vượt đường 85% chính là những trường hợp nên mang ra phân tích trong retro.
- **Biểu đồ dòng tích luỹ (cumulative flow diagram, CFD):** mỗi dải màu là một cột trên board. Một dải phình rộng dần (ví dụ dải "Code Review") cho thấy việc đang ùn lại ở bước đó.

Ví dụ phân tích: cycle time ở mức 85% của team tăng từ 6 lên 11 ngày trong một tháng. Tách theo từng cột thì thấy thời gian nằm ở "Testing" tăng gấp đôi, vì môi trường staging bị dùng chung với team khác và hay hỏng. Hành động lúc này là cải thiện môi trường, không phải hối thúc developer.

## Framework SPACE

**SPACE** (Nicole Forsgren, Margaret-Anne Storey và các cộng sự, 2021) cho rằng năng suất của developer không thể gói gọn trong một con số, và đề xuất nhìn theo năm khía cạnh:

| Khía cạnh | Ý nghĩa | Ví dụ chỉ số cho team Java |
|---|---|---|
| **S – Satisfaction & well-being** | Mức độ hài lòng, sức khoẻ, cảm giác bền vững | Khảo sát hài lòng; mức độ hài lòng với công cụ và CI |
| **P – Performance** | Kết quả của công việc | Change failure rate, số lỗi khách hàng gặp, mức độ đạt mục tiêu sản phẩm |
| **A – Activity** | Số lượng hoạt động | Số deploy, số PR, số review (chỉ có ý nghĩa khi đặt cạnh khía cạnh khác) |
| **C – Communication & collaboration** | Chất lượng phối hợp | Thời gian chờ review, mức độ dễ tìm tài liệu, thời gian onboarding |
| **E – Efficiency & flow** | Làm việc trôi chảy, ít bị gián đoạn | Flow efficiency, số giờ tập trung không bị họp chen ngang, thời gian build |

Các khuyến nghị chính của SPACE:

- **Chọn chỉ số từ nhiều khía cạnh khác nhau** (các tác giả gợi ý ít nhất ba), để chúng cân bằng lẫn nhau.
- **Kết hợp số liệu hệ thống với dữ liệu cảm nhận** từ khảo sát. Ví dụ, thời gian build trung bình là 8 phút nghe có vẻ ổn, nhưng nếu khảo sát cho thấy developer thấy "CI là cản trở lớn nhất", thì vẫn cần điều tra.
- **Chú ý cấp độ đo:** cá nhân, team hay hệ thống. Chỉ số hoạt động ở cấp cá nhân đặc biệt dễ bị lạm dụng.

```text
KHẢO SÁT DEVELOPER EXPERIENCE (hằng quý, ẩn danh, thang 1–5)
1. Tôi có đủ thời gian tập trung để làm việc sâu trong tuần.
2. Build và pipeline CI không làm tôi chậm lại đáng kể.
3. Tôi nhận được review cho PR của mình đủ nhanh.
4. Tôi dễ dàng tìm được tài liệu hoặc người cần hỏi khi bị vướng.
5. Khối lượng công việc hiện tại là bền vững.
6. Điều làm bạn mất thời gian nhất trong tháng qua: ______
```

## Vanity metrics và cạm bẫy của velocity

### Vanity metrics

**Vanity metrics** (chỉ số phù phiếm) là những con số trông ấn tượng nhưng không giúp ra quyết định, hoặc dễ bị làm đẹp:

| Chỉ số | Vì sao có hại |
|---|---|
| Số dòng code | Code dài hơn không có nghĩa là tốt hơn; xoá code thừa lại là việc có giá trị |
| Số commit hoặc số PR mỗi người | Khuyến khích chia nhỏ commit vô nghĩa; bỏ qua công sức review, mentoring, thiết kế |
| Số giờ làm việc hoặc số giờ online | Đo sự hiện diện, không đo kết quả; khuyến khích làm thêm giờ dẫn đến burnout |
| % code coverage dùng làm mục tiêu | Mọi người viết test không có assert để đạt con số; coverage chỉ hữu ích như một tín hiệu |
| Số ticket đóng được | Khuyến khích đóng vội, mở lại ticket mới, hoặc tách một việc thành nhiều ticket |

Cách nhận biết: hãy hỏi "Nếu con số này tăng gấp đôi, khách hàng hoặc team có thật sự tốt hơn không?" và "Có cách nào làm tăng con số này mà không tạo ra giá trị không?". Nếu câu trả lời lần lượt là "chưa chắc" và "có", thì đó rất có thể là vanity metric.

### Cạm bẫy khi dùng velocity

**Velocity** là tổng story point team hoàn thành trong một sprint. Nó chỉ có một công dụng chính đáng: giúp *chính team đó* lập kế hoạch cho sprint tiếp theo. Các cạm bẫy thường gặp:

- **Đặt mục tiêu "tăng velocity 10% mỗi quý":** cách nhanh nhất để đạt mục tiêu này là ước lượng cao lên. Velocity sẽ tăng nhưng số tính năng giao được thì không đổi.
- **Velocity theo từng cá nhân:** người dành thời gian giúp đỡ đồng đội bị phạt, và việc khó bị né.
- **Tính điểm cho story làm dở:** làm velocity trông ổn định hơn, nhưng che giấu vấn đề story quá lớn.
- **Velocity cao nhưng bug tăng:** nếu chỉ nhìn velocity, bạn sẽ không thấy chất lượng đang giảm. Hãy luôn đặt nó cạnh change failure rate hoặc số bug lọt ra production.
- **Dùng velocity để dự báo dài hạn mà không xét đến dao động:** hãy dùng khoảng giá trị hoặc Monte Carlo trên throughput.

### Bảng chỉ số của team

```text
BẢNG CHỈ SỐ TEAM PAYMENT — xem trong retro cuối mỗi tháng
Tốc độ:    Deployment frequency (tuần) | Lead time for changes (P50, P85)
Ổn định:   Change failure rate | Thời gian khôi phục sau deploy lỗi
Flow:      Cycle time P85 | Throughput/tuần | WIP trung bình | Item có age > 10 ngày
Con người: Điểm khảo sát developer experience (hằng quý) | Số giờ tập trung/tuần

Mỗi tháng trả lời 3 câu:
  1. Xu hướng nào thay đổi đáng kể so với tháng trước?
  2. Vì sao? (cần dữ liệu cụ thể, không đoán)
  3. Mình thử một thay đổi gì, và đo bằng chỉ số nào?
```

## Lỗi thường gặp

- **Xếp hạng cá nhân theo số commit, số PR hay số story point.** Cách sửa: đo ở cấp team; đánh giá cá nhân dựa trên dẫn chứng về tác động.
- **Chỉ đo tốc độ.** Cách sửa: luôn đặt tốc độ cạnh độ ổn định và chất lượng, cùng với khảo sát về sức khoẻ của team.
- **Dùng giá trị trung bình cho cycle time.** Cách sửa: dùng phân vị (P50, P85) và biểu đồ phân tán.
- **Biến chỉ số thành KPI gắn với thưởng.** Cách sửa: dùng chỉ số làm đầu vào cho retro và cải tiến; nếu thấy con số bị làm đẹp, hãy đổi cách đo.
- **Đo quá nhiều thứ.** Cách sửa: bắt đầu với 4–6 chỉ số, ở ít nhất ba khía cạnh của SPACE, và bỏ những chỉ số không dẫn đến hành động nào.
- **Định nghĩa không thống nhất,** ví dụ mỗi người hiểu "Done" một kiểu. Cách sửa: ghi rõ định nghĩa và nguồn dữ liệu của từng chỉ số.

## Bài tập thực hành

1. **Đo DORA cho một service:** Chọn một service Spring Boot chính. Từ dữ liệu CI/CD và hệ thống quản lý sự cố của 3 tháng gần nhất, tính bốn chỉ số DORA. Tách lead time thành các đoạn (chờ review, chờ merge, chờ deploy) và chỉ ra đoạn chiếm nhiều thời gian nhất.
2. **Theo dõi cycle time trong 3 sprint:** Xuất dữ liệu từ Jira, thống nhất điểm bắt đầu và kết thúc, vẽ biểu đồ phân tán cycle time cùng đường P85. Mỗi sprint, mang 2–3 item vượt P85 ra retro để tìm nguyên nhân, và chọn một thay đổi để thử.
3. **Rà soát chỉ số hiện có:** Liệt kê mọi chỉ số team đang báo cáo. Xếp từng chỉ số vào các khía cạnh SPACE, đánh dấu chỉ số nào là vanity, rồi đề xuất bảng chỉ số mới gồm 4–6 chỉ số cân bằng và trình bày với team.

## Tóm tắt

- Đo để học và cải tiến, ở cấp team và hệ thống; khi chỉ số trở thành mục tiêu thưởng phạt, nó sẽ bị làm đẹp.
- DORA gồm hai chỉ số tốc độ (deployment frequency, lead time for changes) và hai chỉ số ổn định (change failure rate, thời gian khôi phục); các team tốt thường đạt cả hai nhóm.
- Flow metrics (WIP, throughput, cycle time, work item age) giúp tìm điểm nghẽn; hãy dùng phân vị và biểu đồ thay cho giá trị trung bình.
- SPACE nhắc rằng năng suất có nhiều khía cạnh: hãy chọn chỉ số từ ít nhất ba khía cạnh và kết hợp với khảo sát.
- Tránh vanity metrics như số dòng code, số commit, số giờ online; velocity chỉ dùng để chính team lập kế hoạch, không dùng làm KPI hay đánh giá cá nhân.
