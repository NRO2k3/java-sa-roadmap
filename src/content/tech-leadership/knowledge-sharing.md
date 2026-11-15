Trong nhiều team, có những hệ thống mà "chỉ anh A mới biết": khi A nghỉ phép, sự cố kéo dài; khi A nghỉ việc, team mất hàng tháng để hiểu lại. Tri thức nằm trong đầu một người là rủi ro lớn và cũng là nút cổ chai cho tốc độ của cả team. Tech Lead có trách nhiệm biến tri thức cá nhân thành tri thức chung thông qua những thói quen đơn giản, đều đặn: chia sẻ, làm việc cặp, viết tài liệu và luân chuyển trách nhiệm.

## Mục tiêu bài học

- Tổ chức các hình thức chia sẻ như tech talk, brown-bag, lightning talk một cách đều đặn và ít áp lực.
- Áp dụng pair programming và mob programming đúng lúc, đúng cách.
- Xây dựng văn hoá viết tài liệu với README, runbook và onboarding guide luôn được cập nhật.
- Đo và tăng "bus factor" bằng knowledge matrix, luân chuyển công việc và quyền sở hữu chung.

## Vì sao tri thức bị "kẹt"

Phần lớn tri thức quan trọng của một team là **tri thức ngầm** (tacit knowledge): vì sao module này được thiết kế như vậy, chỗ nào hay lỗi, cách xử lý khi Kafka consumer bị lag. Nó không tự động được ghi lại. Thêm vào đó, nhiều team vô tình khuyến khích "văn hoá anh hùng": người luôn tự cứu mọi sự cố được khen ngợi, nên càng ít có động lực chia sẻ. Chia sẻ tri thức vì vậy phải được thiết kế thành thói quen của team, không thể chỉ trông vào thiện chí cá nhân.

## Tech talk, brown-bag và các hình thức chia sẻ

| Hình thức | Mô tả | Phù hợp với |
|---|---|---|
| Tech talk | Bài trình bày 30–45 phút về một chủ đề có chuẩn bị | Kiến trúc hệ thống, bài học sau sự cố, công nghệ mới |
| Brown-bag | Buổi chia sẻ thân mật, thường vào giờ trưa, người nghe mang đồ ăn theo | Chủ đề nhẹ, người mới tập trình bày |
| Lightning talk | Mỗi người 5–10 phút, nhiều người trong một buổi | Mẹo nhỏ, công cụ, chia sẻ nhanh |
| Demo | Trình diễn tính năng hoặc công cụ vừa làm | Cho team khác và PO thấy kết quả |
| Code walkthrough | Đi qua một phần code quan trọng cùng nhau | Module phức tạp, trước khi người khác tiếp quản |
| Nhóm đọc sách, guild | Nhóm cùng sở thích gặp định kỳ, có thể xuyên team | Chủ đề dài hơi như DDD, performance |

### Tổ chức sao cho bền

- **Lịch cố định**, ví dụ 45 phút chiều thứ Năm cách tuần. Lịch đều đặn quan trọng hơn chủ đề hoành tráng.
- **Rào cản thấp**: không cần slide đẹp; một màn hình IDE và một sơ đồ trên bảng là đủ.
- **Chủ đề từ công việc thật**: "Mình debug vụ memory leak tuần trước thế nào", "Vì sao ta chọn outbox" có giá trị hơn bài giới thiệu chung chung.
- **Lead làm mẫu trước**, rồi luân phiên. Người mới có thể bắt đầu bằng lightning talk 5 phút.
- **Lưu lại**: ghi hình (nếu mọi người đồng ý) hoặc ghi chú ngắn, link slide, đặt ở một nơi cố định để tra cứu và dùng cho onboarding.

```text
BROWN-BAG 30 PHÚT – Khung mẫu
00–02  Bối cảnh: vấn đề gì, vì sao đáng quan tâm
02–20  Nội dung chính: demo hoặc đi qua code thật
20–27  Hỏi đáp
27–30  Một điều mang về: mỗi người áp dụng được gì ngay tuần này
Sau buổi: ghi chú 5 dòng + link code/slide vào trang "Tech talks" của team
```

## Pair programming và mob programming

### Pair programming

Pair programming là hai người cùng làm trên một máy (hoặc một phiên chia sẻ màn hình). Mô hình phổ biến là **driver/navigator**: driver gõ code và tập trung vào chi tiết trước mắt; navigator quan sát, nghĩ trước các bước tiếp theo, phát hiện lỗi và đặt câu hỏi. Hai người đổi vai thường xuyên.

Một vài biến thể:

- **Ping-pong pairing** (hợp với TDD): người A viết test đỏ, người B viết code cho test xanh rồi viết test tiếp theo, cứ thế luân phiên.
- **Strong-style pairing**: ý tưởng phải đi qua tay người kia mới vào được code, tức navigator nói, driver gõ. Rất hiệu quả khi người giỏi hơn làm navigator để truyền kiến thức cho người mới.

Khi làm từ xa, có thể dùng tính năng cộng tác thời gian thực của IDE, hoặc đơn giản là chia sẻ màn hình và đổi vai bằng cách push nhánh tạm.

**Nên pair khi**: onboarding người mới, chuyển giao một module, xử lý vấn đề khó hoặc rủi ro cao, sửa sự cố production. **Không cần pair khi**: việc đơn giản, lặp lại, hoặc cần thời gian suy nghĩ một mình. Pair liên tục cả ngày rất mệt; vài phiên 1–2 giờ có nghỉ giữa chừng thường hiệu quả hơn.

### Mob programming

Mob programming (còn gọi là ensemble programming) là cả nhóm cùng làm một việc, trên một màn hình: một người là driver, những người còn lại là navigator, và vai driver luân phiên theo bộ đếm giờ, thường vài phút một lần. Mob phù hợp khi:

- Thiết kế hoặc sửa một phần **phức tạp và quan trọng** mà nhiều người cần hiểu, ví dụ luồng xử lý thanh toán.
- Thống nhất cách làm mới cho cả team, ví dụ cách viết test tích hợp với Testcontainers lần đầu.
- Chuyển giao tri thức từ một chuyên gia sang cả nhóm cùng lúc.

Mob tốn nhiều người-giờ cho một việc, nên đổi lại phải là tri thức lan toả và quyết định được cả nhóm hiểu. Dùng mob cho việc đơn giản là lãng phí.

## Xây dựng văn hoá viết tài liệu

### Bốn loại tài liệu theo Diátaxis

Framework Diátaxis chia tài liệu kỹ thuật thành bốn loại phục vụ bốn nhu cầu khác nhau. Trộn lẫn chúng là lý do khiến nhiều tài liệu vừa dài vừa khó dùng.

| Loại | Phục vụ | Ví dụ trong team |
|---|---|---|
| Tutorial | Học bằng cách làm, cho người mới | "Ngày đầu tiên: chạy order-service ở local và gửi request đầu tiên" |
| How-to guide | Hoàn thành một việc cụ thể | "Cách rollback một bản deploy lỗi", runbook |
| Reference | Tra cứu thông tin chính xác | Đặc tả OpenAPI, danh sách biến cấu hình, topic Kafka |
| Explanation | Hiểu vì sao | Tài liệu kiến trúc, ADR, "vì sao dùng outbox" |

### README

README là cửa vào của mỗi repository. Một README tốt giúp người mới chạy được service mà không phải hỏi ai.

```text
# order-service

Nhận và xử lý đơn hàng online. Team sở hữu: Team Order (kênh chat của team).

## Chạy ở local
Yêu cầu: JDK 21, Docker
  docker compose up -d                # PostgreSQL, Kafka cho môi trường local
  ./mvnw spring-boot:run -Dspring-boot.run.profiles=local
Kiểm tra: GET http://localhost:8080/actuator/health

## Test
  ./mvnw verify                       # unit test + test tích hợp (Testcontainers)

## Cấu hình chính
  ORDER_DB_URL, KAFKA_BOOTSTRAP_SERVERS, PAYMENT_BASE_URL (xem application.yml)

## Kiến trúc và quyết định
  Sơ đồ: docs/architecture/   ADR: docs/adr/

## Vận hành
  Dashboard, cảnh báo, runbook: docs/runbook.md
```

### Runbook

Runbook là hướng dẫn xử lý cho từng cảnh báo hoặc tình huống vận hành, viết để một người **không phải chuyên gia** của service vẫn làm theo được lúc nửa đêm.

```text
RUNBOOK – order-service
Cảnh báo: OrderApiHighErrorRate (tỉ lệ 5xx > 2% trong 5 phút)

1. Ảnh hưởng
   Khách không đặt được hàng. Mức độ: nghiêm trọng, xử lý ngay.

2. Kiểm tra nhanh (5 phút đầu)
   - Dashboard Order API: lỗi tập trung ở endpoint nào, từ khi nào?
   - Có bản deploy nào trong 30 phút gần nhất không?
   - GET /actuator/health: database, Kafka có DOWN không?

3. Nguyên nhân thường gặp và cách xử lý
   a. Bản deploy mới lỗi -> rollback về phiên bản trước theo docs/deploy.md
   b. Cạn connection pool: log có "Connection is not available, request timed out"
      -> tìm truy vấn chậm trên dashboard DB; nếu cần, scale thêm instance và báo DBA
   c. Cổng thanh toán chậm: circuit breaker của PaymentClient chuyển OPEN
      -> kiểm tra trang trạng thái của đối tác; đơn sẽ ở trạng thái PENDING, không cần restart

4. Thu thập bằng chứng trước khi restart
   - jcmd <pid> Thread.print > threads.txt
   - Lưu log 15 phút quanh thời điểm lỗi

5. Leo thang
   Sau 15 phút chưa rõ nguyên nhân: gọi người trực cấp 2 theo lịch on-call.

6. Sau sự cố
   Tạo ticket postmortem, cập nhật runbook này nếu có bước mới.
```

### Onboarding guide

```text
ONBOARDING – Team Order

Ngày 1
[ ] Có quyền truy cập repo, CI, môi trường dev, kênh chat, dashboard
[ ] Chạy order-service ở local theo README (ghi lại mọi chỗ README sai hoặc thiếu)
[ ] Gặp buddy (người đồng hành) trong 30 phút: giới thiệu team và hệ thống

Tuần 1
[ ] Đọc sơ đồ C4 mức Context và Container, 5 ADR quan trọng nhất
[ ] Pair với buddy sửa một bug nhỏ, đi hết quy trình PR, review, deploy
[ ] Tham dự một buổi demo hoặc tech talk của team

Tháng 1
[ ] Tự làm một tính năng nhỏ từ đầu đến cuối
[ ] Shadow (đi kèm) một ca on-call
[ ] Cập nhật ít nhất một tài liệu mình thấy chưa đúng
[ ] 1:1 với lead: điều gì khó hiểu nhất, điều gì nên cải thiện trong onboarding
```

Mẹo hữu ích: giao cho người mới nhiệm vụ **sửa README và onboarding guide** khi gặp chỗ sai. Họ là người duy nhất nhìn tài liệu bằng con mắt hoàn toàn mới.

### Docs-as-code

- Tài liệu nằm **trong repo cạnh code**, viết bằng Markdown, thay đổi qua Pull Request như code.
- **Definition of Done** có dòng "đã cập nhật tài liệu liên quan (README, runbook, ADR) nếu cần".
- Reviewer kiểm tra cả tài liệu: PR thêm biến cấu hình mới mà README không đổi là PR chưa xong.
- Mỗi tài liệu quan trọng có người sở hữu và ngày xem lại gần nhất.

## Tăng bus factor

**Bus factor** (còn gọi là truck factor) là số người tối thiểu phải đột ngột vắng mặt thì dự án hoặc hệ thống bị đình trệ. Bus factor bằng 1 nghĩa là chỉ một người nắm giữ tri thức quan trọng: rủi ro cao nhất.

### Đo bằng knowledge matrix

Knowledge matrix đánh giá mức độ hiểu biết của từng người với từng hệ thống hoặc kỹ năng. Thang điểm ví dụ: 0 chưa biết, 1 làm được khi có hướng dẫn, 2 tự làm được, 3 xử lý được sự cố và dạy được người khác.

| Hệ thống / kỹ năng | An | Bình | Chi | Dũng | Số người đạt mức 2 trở lên |
|---|---|---|---|---|---|
| order-service | 3 | 2 | 1 | 0 | 2 |
| Tích hợp cổng thanh toán | 3 | 0 | 0 | 1 | 1 (rủi ro) |
| Kafka consumer, DLQ | 2 | 2 | 0 | 1 | 2 |
| Pipeline CI/CD | 0 | 3 | 1 | 0 | 1 (rủi ro) |
| Triển khai Kubernetes | 1 | 3 | 0 | 2 | 2 |

Mục tiêu đơn giản: mọi hệ thống quan trọng có ít nhất 2 người đạt mức 2 trở lên. Lịch sử Git cũng cho tín hiệu: thư mục nào chỉ có một người commit trong năm qua là ứng viên knowledge silo.

```bash
# Số tác giả khác nhau theo từng thư mục cấp một trong 12 tháng gần đây
for dir in */ ; do
  n=$(git log --since="12 months ago" --format='%ae' -- "$dir" | sort -u | wc -l)
  echo "$n $dir"
done | sort -n
```

### Các chiến thuật

- **Người không phải chuyên gia làm, chuyên gia ngồi navigator.** Đây là cách chuyển giao nhanh nhất: Dũng thực hiện thay đổi trên pipeline trong khi Bình hướng dẫn, sau đó Dũng cập nhật runbook theo những gì vừa làm.
- **Luân chuyển công việc có chủ đích.** Khi lập kế hoạch sprint, giao việc ở vùng "đỏ" của knowledge matrix cho người chưa biết, kèm người hỗ trợ.
- **Luân phiên on-call**, kèm shadow cho người mới trước khi trực một mình.
- **Review chéo**: code ở module của chuyên gia được review bởi người khác, và ngược lại. Có thể dùng file CODEOWNERS để mỗi thư mục quan trọng có ít nhất hai người sở hữu.
- **Ghi lại khi giải quyết sự cố**: sau mỗi sự cố, bước xử lý mới được đưa vào runbook.
- **Lead không được là điểm nghẽn.** Nếu mọi quyết định và mọi sự cố đều phải qua bạn, chính bạn là bus factor 1 của team. Hãy uỷ quyền, đưa tri thức của mình vào ADR và tài liệu.

## Lỗi thường gặp

- **Bắt buộc mọi người trình bày.** Tech talk thành gánh nặng, nội dung hời hợt. Cách sửa: rào cản thấp, lightning talk ngắn, lead làm mẫu, khen ngợi người chia sẻ.
- **Tài liệu viết một lần rồi bỏ.** README sai sau vài tháng, người mới mất niềm tin vào tài liệu. Cách sửa: docs-as-code, cập nhật trong cùng PR, đưa vào Definition of Done.
- **Một tài liệu khổng lồ cho mọi mục đích.** Người cần rollback phải đọc qua lịch sử kiến trúc. Cách sửa: tách theo Diátaxis: tutorial, how-to, reference, explanation.
- **Pair programming cho mọi việc.** Team kiệt sức, năng suất giảm. Cách sửa: pair có chủ đích cho onboarding, chuyển giao, việc khó; giới hạn thời lượng mỗi phiên.
- **Chuyển giao trong tuần cuối.** Người sắp nghỉ viết vội 50 trang không ai đọc. Cách sửa: luân chuyển liên tục, làm cặp sớm, chuyên gia làm navigator thay vì viết tài liệu một mình.
- **Lead ôm hết.** Mọi câu hỏi đều chờ lead trả lời. Cách sửa: chỉ người khác làm đầu mối cho từng hệ thống, chuyển quyết định thường ngày cho team.

## Bài tập thực hành

1. **Knowledge matrix.** Lập knowledge matrix cho team với ít nhất 6 hệ thống hoặc kỹ năng, kết hợp tự đánh giá và phân tích Git bằng script ở trên. Đánh dấu các ô có bus factor bằng 1 và lập kế hoạch 6 tuần để đưa mỗi ô đó lên ít nhất 2 người, ghi rõ ai pair với ai và vào việc gì.
2. **Bộ tài liệu tối thiểu.** Chọn một service của team, viết hoặc làm lại README, một runbook cho cảnh báo quan trọng nhất và onboarding guide theo các template trên. Nhờ một người chưa từng làm với service đó làm theo README và runbook, ghi lại mọi chỗ họ bị vướng rồi sửa.
3. **Lịch chia sẻ.** Lên lịch brown-bag hoặc lightning talk cách tuần trong 2 tháng: bạn trình bày buổi đầu, mỗi buổi sau một người khác, chủ đề lấy từ công việc thật. Sau 2 tháng, hỏi team giữ, bỏ hay điều chỉnh gì.

## Tóm tắt

- Tri thức ngầm không tự được ghi lại; chia sẻ tri thức phải được thiết kế thành thói quen của team.
- Tech talk, brown-bag, lightning talk hiệu quả khi có lịch cố định, rào cản thấp và chủ đề từ công việc thật.
- Pair programming (driver/navigator, ping-pong, strong-style) và mob programming dùng có chủ đích cho việc khó, onboarding và chuyển giao.
- Phân loại tài liệu theo Diátaxis; README, runbook, onboarding guide là bộ tối thiểu, sống trong repo và cập nhật qua PR.
- Bus factor đo được bằng knowledge matrix và lịch sử Git; mục tiêu là mọi hệ thống quan trọng có ít nhất 2 người nắm vững.
- Tăng bus factor bằng luân chuyển công việc, chuyên gia làm navigator, on-call luân phiên và lead không ôm hết mọi việc.
