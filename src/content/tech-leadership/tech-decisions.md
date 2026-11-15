Khi trở thành Tech Lead, bạn không còn được đánh giá bằng lượng code mình viết, mà bằng chất lượng các quyết định kỹ thuật của team. Một quyết định tốt nhưng không ai hiểu vì sao sẽ bị đảo ngược sau vài tháng; một quyết định áp đặt dù đúng cũng làm team mất động lực. Bài này giúp bạn xây dựng một quy trình ra quyết định minh bạch: dùng design doc/RFC cho thay đổi lớn, ADR để ghi lại kết quả, phân tích trade-off có cấu trúc và xây dựng đồng thuận mà không sa vào họp mãi không xong.

## Mục tiêu bài học

- Phân loại quyết định theo mức độ khó đảo ngược và chọn quy trình tương xứng, xác định rõ ai có quyền quyết.
- Viết design doc/RFC cho thay đổi lớn và tổ chức review bất đồng bộ hiệu quả.
- Ghi lại quyết định bằng ADR ngắn gọn, liên kết với RFC và code.
- Phân tích trade-off và trình bày đề xuất cho team một cách thuyết phục.
- Xây dựng đồng thuận và áp dụng nguyên tắc "disagree and commit".

## Không phải quyết định nào cũng cần quy trình

### Cửa một chiều và cửa hai chiều

Trong thư gửi cổ đông năm 2015, Jeff Bezos phân biệt hai loại quyết định: loại khó hoặc không thể đảo ngược ("cửa một chiều", one-way door) cần cân nhắc kỹ; loại dễ đảo ngược ("cửa hai chiều", two-way door) nên được quyết nhanh bởi người hoặc nhóm nhỏ có đủ thông tin. Áp quy trình nặng cho mọi quyết định làm team chậm lại; áp quy trình nhẹ cho quyết định một chiều thì rủi ro.

| Loại | Ví dụ trong team Java | Cách quyết | Tài liệu |
|---|---|---|---|
| Hai chiều, phạm vi nhỏ | Đổi thư viện mapping trong một service, đặt tên package | Người phụ trách quyết, trao đổi ngắn trong PR | Mô tả PR là đủ |
| Hai chiều, ảnh hưởng cả team | Chuẩn logging, cách tổ chức test | Thảo luận ngắn, lead chốt | ADR ngắn |
| Một chiều hoặc ảnh hưởng nhiều team | Tách service, đổi database, thay đổi API công khai, chọn message broker | Design doc/RFC, review có thời hạn | RFC + ADR |

### Ai quyết định?

Nhiều cuộc tranh luận kéo dài không phải vì vấn đề khó, mà vì không ai biết ai có quyền chốt. Mô hình **DACI** làm rõ vai trò:

- **Driver**: người điều phối quá trình, thu thập thông tin, đảm bảo có quyết định đúng hạn.
- **Approver**: người ra quyết định cuối cùng. Chỉ nên có **một** người.
- **Contributors**: người đóng góp chuyên môn và ý kiến.
- **Informed**: người được thông báo kết quả.

Với quyết định kỹ thuật trong team, Tech Lead thường là Approver, còn Driver có thể là một developer, đó cũng là cơ hội để họ phát triển.

## Design doc và RFC

Design doc hay RFC (Request for Comments) là tài liệu đề xuất một thay đổi lớn **trước khi** hiện thực, để thu thập góp ý khi việc thay đổi hướng đi còn rẻ. Ngoài nội dung kỹ thuật, nó buộc tác giả suy nghĩ thấu đáo: nhiều vấn đề lộ ra ngay khi cố viết rõ ràng.

### Template RFC

```text
RFC-NNN: <Tiêu đề>
Tác giả     : <tên>               Trạng thái : Draft | In Review | Accepted | Rejected | Withdrawn
Reviewer    : <tên, team>         Hạn góp ý  : <ngày>
Approver    : <tên>               Quyết định : <link ADR>

1. Tóm tắt (TL;DR)
   3–5 câu: vấn đề, đề xuất, tác động chính.
2. Bối cảnh và vấn đề
   Hiện trạng, số liệu, vì sao cần giải quyết bây giờ.
3. Mục tiêu và ngoài phạm vi (goals / non-goals)
   Non-goals quan trọng không kém: nói rõ những gì RFC này KHÔNG giải quyết.
4. Thiết kế đề xuất
   Sơ đồ, API, mô hình dữ liệu, luồng chính, luồng lỗi.
5. Các phương án đã cân nhắc
   Mỗi phương án: mô tả, ưu, nhược, lý do không chọn. Luôn có "không làm gì".
6. Mối quan tâm xuyên suốt
   Bảo mật, hiệu năng, observability, migration, rollback, chi phí.
7. Kế hoạch triển khai
   Các bước, feature flag, cách đo thành công.
8. Rủi ro và câu hỏi mở
```

### Quy trình review

1. **Draft**: tác giả viết bản nháp, có thể nhờ một người review sớm để tránh đi sai hướng.
2. **In Review**: gửi cho reviewer với **hạn góp ý** rõ ràng (ví dụ 3–5 ngày làm việc). Góp ý dưới dạng comment trên tài liệu hoặc Pull Request.
3. **Phản hồi**: tác giả trả lời mọi comment: chấp nhận và sửa, hoặc giải thích vì sao không.
4. **Họp review** (30–45 phút), chỉ khi còn điểm bất đồng. Không đọc lại tài liệu trong buổi họp; mọi người đã đọc trước.
5. **Quyết định**: Approver chốt, cập nhật trạng thái RFC và viết ADR.

Giữ RFC ngắn nhất có thể. Một RFC mà không ai đọc hết thì không thu được góp ý thật.

## Ghi lại quyết định bằng ADR

RFC và ADR bổ trợ nhau nhưng có vai trò khác:

| | RFC / design doc | ADR |
|---|---|---|
| Thời điểm | Trước khi quyết, trong lúc thảo luận | Khi đã quyết |
| Mục đích | Đề xuất, thu thập góp ý | Ghi lại quyết định và lý do |
| Độ dài | Có thể vài trang | Thường một trang |
| Vòng đời | Kết thúc khi có quyết định | Tồn tại lâu dài, chỉ bị thay bằng ADR mới |

Ví dụ một ADR ngắn theo phong cách MADR, sau một RFC về độ trễ của Product API:

```text
# ADR-0012: Tối ưu truy vấn và dùng cache local Caffeine cho Product API

- Trạng thái: Accepted (2026-05-20)
- Người quyết định: Tech Lead team Catalog (Approver), An, Bình, Chi
- Liên quan: RFC-012

## Bối cảnh và vấn đề
Product API có p95 khoảng 650 ms giờ cao điểm, mục tiêu dưới 200 ms. Phần lớn
thời gian nằm ở truy vấn join nhiều bảng. Dữ liệu sản phẩm ít thay đổi;
business chấp nhận giá hiển thị lệch tối đa 5 phút. Service chạy 3 instance.

## Yếu tố quyết định
- Đạt p95 < 200 ms
- Không thêm hạ tầng mới nếu không cần
- Team chưa vận hành Redis

## Phương án đã xem xét
1. Chỉ tối ưu truy vấn và index
2. Tối ưu truy vấn + cache local Caffeine (TTL 5 phút)
3. Tối ưu truy vấn + cache phân tán Redis

## Quyết định
Chọn phương án 2. Đo lại sau khi tối ưu truy vấn; bật cache local cho
endpoint GET /products/{id} với TTL 5 phút.

## Hệ quả
- Tích cực: không thêm hạ tầng, hiện thực nhanh bằng @Cacheable.
- Đánh đổi: mỗi instance có bản cache riêng, dữ liệu có thể lệch giữa các
  instance trong tối đa 5 phút; tăng dùng heap mỗi instance.

## Ý kiến khác
An đề xuất dùng Redis ngay để tránh lệch dữ liệu giữa instance. Team ghi nhận;
sẽ xem xét lại khi số instance vượt 10 hoặc khi business cần cập nhật giá tức thì.
```

Cấu hình tương ứng trong Spring Boot (cần thêm dependency Caffeine và `@EnableCaching`):

```yaml
spring:
  cache:
    type: caffeine
    cache-names: products
    caffeine:
      spec: maximumSize=10000,expireAfterWrite=5m
```

Lưu ADR trong repo (ví dụ `docs/adr/`), review qua Pull Request, và tham chiếu số ADR trong comment ở đoạn code liên quan để người đọc code tìm được lý do.

## Phân tích trade-off và đề xuất phương án

### Quy trình

1. **Viết rõ vấn đề và tiêu chí** trước khi bàn giải pháp: mục tiêu đo được, ràng buộc, điều không được hy sinh.
2. **Đưa ra 2–3 phương án**, luôn có phương án "tối ưu cái đang có" hoặc "không làm gì".
3. **So sánh theo cùng tiêu chí**, nêu rõ cả nhược điểm của phương án bạn thích.
4. **Đề xuất** một phương án kèm lý do, và nói rõ **điều gì sẽ khiến bạn đổi ý**.

### Ví dụ bảng so sánh

| Tiêu chí | A. Tối ưu query + index | B. Cache local (Caffeine) | C. Cache phân tán (Redis) |
|---|---|---|---|
| Cải thiện độ trễ | Trung bình | Cao | Cao |
| Nhất quán giữa các instance | Luôn nhất quán | Mỗi instance một bản, lệch trong TTL | Một bản chung, lệch trong TTL |
| Hạ tầng thêm | Không | Không | Redis cần vận hành, giám sát |
| Ảnh hưởng heap | Không | Tăng heap mỗi instance | Không đáng kể |
| Độ phức tạp code | Thấp | Thấp | Trung bình (serialization, xử lý khi Redis lỗi) |

### Cách trình bày đề xuất

```text
"Đề xuất của tôi: làm A trước vì rẻ và không rủi ro, đo lại; nếu chưa đạt
p95 < 200 ms thì bật B. Lý do: dữ liệu ít thay đổi, business chấp nhận lệch
5 phút, và ta chưa vận hành Redis.
Rủi ro lớn nhất: lệch giá giữa các instance trong vài phút.
Tôi sẽ đổi ý nếu: business cần cập nhật giá tức thì, hoặc số instance tăng
mạnh làm tỉ lệ cache hit giảm."
```

Câu "tôi sẽ đổi ý nếu" cho team thấy bạn đề xuất dựa trên lý lẽ chứ không phải sở thích, và cho họ một cách cụ thể để phản biện.

## Xây dựng đồng thuận và "disagree and commit"

### Các cách ra quyết định nhóm

| Cách | Mô tả | Phù hợp khi |
|---|---|---|
| Lead quyết ngay | Không tham vấn | Sự cố production, quyết định nhỏ và dễ đảo ngược |
| Tham vấn rồi lead quyết | Thu thập ý kiến, Approver chốt | Phần lớn quyết định kỹ thuật của team |
| Consent | Thông qua nếu không ai có phản đối nghiêm trọng | Quyết định cả team cùng chịu ảnh hưởng, như quy ước làm việc |
| Đồng thuận hoàn toàn | Mọi người đều đồng ý | Hiếm; tốn thời gian, dễ dẫn đến phương án "an toàn nhất" |

Một kỹ thuật nhanh để đo mức đồng thuận là **fist to five**: mỗi người giơ từ 0 đến 5 ngón tay. Nắm tay (0) nghĩa là phản đối, 1–2 nghĩa là còn băn khoăn lớn cần thảo luận, 3 là chấp nhận được, 4–5 là ủng hộ. Nếu có người giơ 0–2, hãy hỏi họ cần thay đổi điều gì để chấp nhận được.

### Disagree and commit

"Disagree and commit" (bất đồng nhưng vẫn cam kết) nằm trong bộ nguyên tắc lãnh đạo của Amazon: một người có thể không đồng ý với quyết định, nhưng sau khi đã được lắng nghe và quyết định đã được đưa ra, họ cam kết thực hiện hết mình. Nguyên tắc này chỉ lành mạnh khi đủ điều kiện:

- Mọi người **thực sự được lắng nghe** trước khi quyết; ý kiến khác được ghi vào ADR.
- Quyết định và người quyết **rõ ràng**, không mập mờ.
- Có **điểm xem xét lại** với điều kiện cụ thể, để người bất đồng biết khi nào ý kiến của họ được đánh giá lại.

Disagree and commit **không** có nghĩa là im lặng cho xong, cũng không phải đồng ý ngoài mặt rồi làm khác hoặc chờ quyết định thất bại để nói "tôi đã bảo rồi". Nó cũng áp dụng cho chính Tech Lead: khi team chọn phương án khác ý bạn sau một quá trình công bằng, hãy làm gương bằng cách cam kết hết mình.

Câu nói gợi ý khi chốt:

```text
"Cảm ơn mọi người. Mình đã nghe hết các ý kiến, đặc biệt là lo ngại của An về
lệch dữ liệu giữa các instance, mình đã ghi vào ADR. Quyết định là phương án B.
Ta sẽ xem lại khi số instance vượt 10. Ai còn điều gì khiến mình không thể
cam kết với quyết định này không?"
```

## Lỗi thường gặp

- **Quy trình nặng cho mọi việc.** Đòi RFC cho cả việc đổi tên package khiến team né quy trình. Cách sửa: phân loại cửa một chiều, hai chiều; chỉ dùng RFC cho thay đổi lớn hoặc khó đảo ngược.
- **RFC không có hạn góp ý.** Tài liệu nằm "In Review" hàng tháng. Cách sửa: luôn đặt hạn, Driver nhắc reviewer, quá hạn thì Approver quyết với thông tin đang có.
- **Không rõ ai quyết.** Tranh luận vòng tròn vì nhiều người nghĩ mình có quyền phủ quyết. Cách sửa: xác định DACI ngay từ đầu, chỉ một Approver.
- **Chỉ trình bày phương án mình thích.** Team cảm thấy bị dắt mũi. Cách sửa: luôn có ít nhất 2 phương án thật, nêu nhược điểm của cả phương án đề xuất.
- **Quyết định không được ghi lại.** Sáu tháng sau tranh luận lại từ đầu. Cách sửa: mỗi quyết định quan trọng có một ADR, kể cả ý kiến không được chọn.
- **"Disagree and commit" thành công cụ bịt miệng.** Lead dùng nó để bỏ qua phản biện. Cách sửa: chỉ áp dụng sau khi mọi người đã thật sự được lắng nghe, và có điểm xem xét lại.

## Bài tập thực hành

1. **Phân loại quyết định.** Liệt kê 10 quyết định kỹ thuật team bạn đưa ra trong 3 tháng qua. Phân loại từng cái theo cửa một chiều hay hai chiều và phạm vi ảnh hưởng, rồi đánh giá quy trình đã dùng có tương xứng không.
2. **Viết RFC và tổ chức review.** Chọn một thay đổi lớn sắp tới của team, viết RFC theo template ở trên với ít nhất 3 phương án (có phương án "không làm gì"), xác định DACI, gửi review với hạn 4 ngày làm việc và ghi lại số comment nhận được, số comment dẫn đến thay đổi thiết kế.
3. **ADR và chốt quyết định.** Sau khi RFC ở bài 2 được quyết, viết ADR một trang có phần "Ý kiến khác" và "Điều kiện xem xét lại". Trong buổi chốt, thử dùng fist to five và ghi lại cách bạn xử lý những người giơ dưới 3.

## Tóm tắt

- Chọn quy trình tương xứng: cửa hai chiều quyết nhanh, cửa một chiều cần RFC và review.
- Dùng DACI để làm rõ ai điều phối, ai đóng góp, và chỉ một người phê duyệt cuối.
- RFC dùng để đề xuất và thu thập góp ý trước khi làm; luôn có non-goals, phương án thay thế và hạn góp ý.
- ADR ghi lại quyết định, đánh đổi, ý kiến khác và điều kiện xem xét lại; lưu trong repo cạnh code.
- Đề xuất tốt nêu tiêu chí trước, so sánh trung thực và nói rõ điều gì sẽ khiến bạn đổi ý.
- "Disagree and commit" chỉ lành mạnh khi mọi người đã được lắng nghe, quyết định rõ ràng và có điểm xem xét lại.
