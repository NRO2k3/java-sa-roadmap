Kỳ đánh giá hiệu suất (performance review) là lúc niềm tin vào lead được thử thách nhiều nhất. Nếu mục tiêu không rõ từ đầu, đánh giá không có dẫn chứng, hoặc thành viên bị bất ngờ với kết quả, thì người giỏi sẽ mất động lực còn người yếu không biết mình cần sửa gì. Là Dev Lead, bạn thường phải góp ý hoặc trực tiếp viết đánh giá, đề xuất thăng tiến và hỗ trợ những người đang gặp khó. Bài này giúp bạn làm những việc đó một cách công bằng, minh bạch và có hệ thống.

## Mục tiêu bài học

- Đặt mục tiêu theo SMART và OKR, gắn mục tiêu cá nhân với mục tiêu của sản phẩm và của team.
- Chuẩn bị và thực hiện performance review dựa trên dẫn chứng, hạn chế thiên kiến.
- Hỗ trợ thành viên hiệu suất thấp bằng chẩn đoán nguyên nhân và kế hoạch cải thiện rõ ràng.
- Xây dựng career ladder và viết hồ sơ đề xuất thăng tiến thuyết phục.

## Đặt mục tiêu: SMART và OKR

### SMART

**SMART** là bộ tiêu chí để kiểm tra xem một mục tiêu đã đủ rõ hay chưa:

- **Specific (Cụ thể):** nói rõ cần làm hoặc cần đạt điều gì.
- **Measurable (Đo được):** có cách biết khi nào đã đạt.
- **Achievable (Khả thi):** thách thức nhưng trong tầm với.
- **Relevant (Liên quan):** gắn với mục tiêu của team và sản phẩm.
- **Time-bound (Có thời hạn):** có mốc thời gian.

| Mục tiêu mơ hồ | Mục tiêu SMART |
|---|---|
| "Cải thiện performance hệ thống" | "Giảm p95 latency của API `/payments/qr` từ 800ms xuống dưới 300ms trước 30/9, đo trên Grafana production" |
| "Học Kafka" | "Đến hết quý 3, tự thiết kế và triển khai consumer có retry và dead-letter topic cho luồng thông báo, được Long review và duyệt" |
| "Tích cực hơn trong team" | "Mỗi sprint review ít nhất 4 PR của người khác; trình bày một tech talk trong quý" |

### OKR

**OKR (Objectives and Key Results)** gồm:

- **Objective:** điều muốn đạt được, viết bằng lời, truyền cảm hứng và có định hướng. Ví dụ: "Thanh toán QR nhanh và đáng tin cậy để cửa hàng không phải chờ."
- **Key Results:** thường 2–5 kết quả đo được, cho biết objective đã đạt hay chưa. Key result đo **kết quả (outcome)** chứ không đo danh sách việc phải làm.

```text
Objective: Thanh toán QR nhanh và đáng tin cậy để cửa hàng không phải chờ
  KR1: Tỷ lệ giao dịch thành công tăng từ 97,5% lên 99,5%
  KR2: p95 thời gian xác nhận thanh toán dưới 3 giây
  KR3: Số ticket hỗ trợ liên quan "treo giao dịch" giảm một nửa so với quý trước

Không phải KR (đây là việc làm, không phải kết quả):
  - "Chuyển sang Kafka"  — đây là cách làm để đạt KR1, KR2
  - "Viết 50 unit test"   — đây là hoạt động, chưa chắc tạo ra kết quả
```

Một số nguyên tắc khi dùng OKR:

- **OKR cam kết (committed) và OKR tham vọng (aspirational) khác nhau.** OKR cam kết là thứ team phải đạt. Với OKR tham vọng, đạt được phần lớn đã là tốt, và không hoàn thành 100% không có nghĩa là thất bại. Hãy nói rõ OKR nào thuộc loại nào.
- **Không nên gắn trực tiếp điểm OKR với thưởng.** Khi đó, mọi người sẽ đặt mục tiêu thấp cho chắc ăn.
- **OKR thường đặt ở cấp team hoặc sản phẩm.** Mục tiêu cá nhân nên cho thấy người đó đóng góp vào OKR của team như thế nào, cộng thêm mục tiêu phát triển của họ.

### Liên kết mục tiêu: sản phẩm → team → cá nhân

| Cấp | Ví dụ |
|---|---|
| Sản phẩm | Mở rộng thanh toán QR cho 2.000 cửa hàng mới trong năm |
| Team (OKR) | KR: tỷ lệ giao dịch thành công đạt 99,5% |
| Cá nhân – Minh | Dẫn dắt việc thêm idempotency key và retry có backoff khi gọi ngân hàng đối tác, release trước 15/8 (đóng góp vào KR) |
| Cá nhân – Minh | Lên mức 3 về nghiệp vụ đối soát trong skill matrix (phát triển, lấy từ IDP) |

Một bộ mục tiêu cá nhân tốt thường có **2–4 mục tiêu**, kết hợp đóng góp cho sản phẩm, phát triển bản thân, và đóng góp cho team (mentoring, cải tiến quy trình). Hãy xem lại mục tiêu mỗi tháng trong 1:1, và chỉnh sửa nếu ưu tiên của sản phẩm thay đổi.

## Performance review công bằng, có dẫn chứng

### Thu thập dẫn chứng quanh năm

Đừng đợi đến cuối kỳ mới ngồi nhớ lại. Hãy gom dẫn chứng thường xuyên:

- **Ghi chú 1:1** của lead: thành tích, khó khăn, feedback đã đưa.
- **Brag document:** khuyến khích thành viên tự ghi lại những việc đã làm và tác động của chúng mỗi tuần hoặc mỗi tháng. Cách này đặc biệt hữu ích cho những người khiêm tốn, ít khi kể về mình.
- **Dấu vết công việc:** PR, tech design, ADR, postmortem, bài trình bày, phản hồi của BA, QA, SA.
- **Peer feedback** (đánh giá từ đồng nghiệp): hỏi những câu cụ thể như "Một điều X làm tốt và nên tiếp tục?", "Một điều X có thể làm khác để hiệu quả hơn?".

### Thiên kiến khi đánh giá

| Thiên kiến | Biểu hiện | Cách giảm |
|---|---|---|
| Gần đây (recency) | Chỉ nhớ sự cố tháng trước, quên 10 tháng làm tốt | Dùng ghi chú và brag document của cả kỳ |
| Hào quang / vết đen (halo / horn) | Một điểm rất tốt hoặc rất tệ làm lệch mọi tiêu chí khác | Đánh giá riêng từng tiêu chí, mỗi tiêu chí kèm dẫn chứng |
| Dễ dãi / dồn về giữa | Ai cũng "đạt kỳ vọng" để tránh va chạm | So với mô tả cụ thể của career ladder |
| Thiên về người nổi bật | Người hay nói trong họp được đánh giá cao hơn người làm âm thầm | Xem kết quả thực tế: PR, sự cố đã xử lý, người đã kèm |
| Giống mình | Đánh giá cao người có cách làm giống lead | Calibration với các lead khác |

**Calibration** là buổi các lead và manager cùng xem lại đánh giá của nhiều người, để đảm bảo cùng một mức đánh giá ở các team khác nhau có cùng ý nghĩa.

### Quy trình gợi ý

1. Thành viên viết **tự đánh giá** (self-review) dựa trên mục tiêu đầu kỳ.
2. Lead thu thập **peer feedback** từ 2–4 người làm việc gần.
3. Lead viết bản nháp đánh giá, mỗi nhận định kèm dẫn chứng.
4. **Calibration** với các lead khác hoặc với manager.
5. **Buổi trao đổi** với thành viên.
6. Thống nhất **mục tiêu và IDP** cho kỳ tiếp theo.

```text
PERFORMANCE REVIEW — [Tên] — Kỳ [H1/2026] — Cấp hiện tại: Mid

1. Kết quả so với mục tiêu
   M1: Idempotency + retry gọi ngân hàng — Đạt. Release 10/8, tỷ lệ lỗi "giao
       dịch trùng" từ ~40 ca/tháng về 0 trong 2 tháng sau release.
   M2: Nghiệp vụ đối soát lên mức 3 — Đạt một phần. Tự xử lý 3/5 lỗi đối
       soát; còn cần hỗ trợ khi đối tác đổi định dạng file.

2. Điểm mạnh (kèm dẫn chứng)
   - Tech design rõ ràng: ADR-014 được SA duyệt ngay vòng đầu
   - Hỗ trợ junior: pair hằng tuần với Lan; Lan đã tự merge story đầu tiên

3. Điểm cần phát triển (kèm dẫn chứng)
   - Cảnh báo rủi ro muộn: story S-221 trễ 1 sprint, đến ngày cuối mới báo

4. Đánh giá tổng thể: [mức theo thang của công ty]

5. Định hướng kỳ tới
   - Mục tiêu: ...    - IDP: ...    - Hỗ trợ từ lead: ...
```

### Buổi trao đổi review

- **Không có bất ngờ.** Nếu thành viên lần đầu nghe về một vấn đề trong buổi review, thì lỗi nằm ở việc lead đã không đưa feedback trong 1:1 suốt cả kỳ.
- **Nói kết quả tổng thể sớm.** Người nghe khó tiếp thu điều gì khác khi họ vẫn đang hồi hộp chờ kết quả.
- **Đi qua dẫn chứng, rồi hướng về tương lai.** Dành ít nhất một phần ba thời gian để nói về kỳ tới.
- **Nếu có thể, tách chuyện phát triển khỏi chuyện lương thưởng**, hoặc ít nhất làm rõ mối liên hệ giữa hai chuyện theo chính sách của công ty.

## Hỗ trợ thành viên hiệu suất thấp

### Chẩn đoán trước khi hành động

| Nguyên nhân | Dấu hiệu | Hướng xử lý |
|---|---|---|
| Kỳ vọng chưa rõ | "Em tưởng chỉ cần code xong, QA sẽ test" | Viết rõ kỳ vọng, Definition of Done |
| Thiếu kỹ năng | Gặp khó ở một mảng cụ thể | Pairing, đào tạo, chia việc nhỏ hơn |
| Mất động lực | Từng làm tốt, nay giảm dần | Nói chuyện về burnout, mức độ phù hợp với công việc, mong muốn |
| Hoàn cảnh cá nhân | Gia đình có chuyện, sức khoẻ | Linh hoạt tạm thời, phối hợp với HR |
| Không phù hợp với vai trò | Giỏi việc khác, kém việc hiện tại | Cân nhắc đổi vai trò hoặc đổi team |
| Do hệ thống | Môi trường test hay hỏng, yêu cầu đổi liên tục | Sửa quy trình, không phải sửa người |

Bắt đầu bằng **giai đoạn không chính thức**: feedback SBI rõ ràng trong 1:1, thống nhất hỗ trợ, theo dõi trong vài tuần. Phần lớn trường hợp có thể cải thiện ngay ở bước này.

### Kế hoạch cải thiện hiệu suất (PIP)

Nếu tình hình không cải thiện, hãy phối hợp với HR để lập **PIP (Performance Improvement Plan)**. Một PIP tốt có kỳ vọng đo được, có hỗ trợ cụ thể, có thời hạn rõ ràng, và **được lập ra với ý định thật sự giúp người đó thành công**, không phải thủ tục để cho nghỉ việc.

```text
KẾ HOẠCH CẢI THIỆN HIỆU SUẤT — [Tên] — [Ngày bắt đầu] → [Ngày kết thúc]

Vấn đề (dẫn chứng):
  - 4/6 story trong 3 sprint gần nhất bị QA trả lại do thiếu xử lý edge case
  - Không cập nhật trạng thái block; 2 lần team chỉ biết vào ngày cuối sprint

Kỳ vọng cần đạt (đo được):
  1. Tối đa 1 story bị trả lại vì lỗi logic trong mỗi sprint
  2. Báo block trên channel trong ngày khi bị kẹt quá nửa ngày
  3. Mỗi story có danh sách edge case được review trước khi code

Hỗ trợ:
  - Pair với Long 2 buổi/tuần; checklist review edge case
  - Lead review danh sách edge case trước khi bắt đầu story

Theo dõi: 1:1 hằng tuần, ghi lại tiến độ từng kỳ vọng
Kết quả có thể: Đạt → kết thúc PIP | Tiến bộ nhưng chưa đủ → gia hạn
                | Không đạt → xử lý theo quy chế công ty
```

> **Lưu ý:** Mọi quyết định liên quan đến chấm dứt hợp đồng phải tuân theo quy chế đánh giá của công ty và pháp luật lao động. Luôn làm cùng HR, ghi chép đầy đủ, và đừng bao giờ hứa hẹn hay đe doạ điều nằm ngoài thẩm quyền của bạn.

## Career ladder và hồ sơ đề xuất thăng tiến

### Career ladder

**Career ladder** (khung năng lực theo cấp) mô tả kỳ vọng ở mỗi cấp theo nhiều khía cạnh. Như vậy, thăng tiến không phụ thuộc vào cảm tính hay số năm làm việc.

| Khía cạnh | Junior | Mid | Senior | Lead |
|---|---|---|---|---|
| Kỹ thuật | Làm task rõ ràng với hướng dẫn | Tự làm story từ đầu đến cuối | Thiết kế service, xử lý vấn đề khó | Định hướng kỹ thuật cho cả team |
| Phạm vi ảnh hưởng | Task | Tính năng | Service hoặc epic | Team và các team liên quan |
| Làm chủ | Báo khi bị block | Chủ động phát hiện rủi ro của mình | Chịu trách nhiệm chất lượng service trên production | Chịu trách nhiệm kết quả delivery của team |
| Hợp tác | Hỏi khi cần | Review PR, làm việc với QA, BA | Kèm junior, làm việc với SA | Phát triển người, làm việc với stakeholder |

Khung này nên được cả team biết, dùng để viết IDP, và dùng để thảo luận trong 1:1 về khoảng cách giữa cấp hiện tại và cấp tiếp theo.

### Hồ sơ đề xuất thăng tiến

Nguyên tắc chung: đề xuất thăng tiến khi người đó **đã làm việc ổn định ở cấp tiếp theo trong một thời gian**, không phải phần thưởng cho thâm niên hay cho một dự án thành công.

```text
ĐỀ XUẤT THĂNG TIẾN — [Tên] — Mid → Senior

1. Tóm tắt (3–4 câu): vì sao người này đã làm việc ở cấp Senior
2. Dẫn chứng theo từng khía cạnh của career ladder
   Kỹ thuật:  Thiết kế service đối soát tự động (ADR-014, ADR-019); xử lý sự cố
              deadlock DB tháng 5 (postmortem PM-07)
   Phạm vi:   Feature lead epic "Đối soát tự động" — 3 sprint, 4 người
   Làm chủ:   On-call chính 2 quý, chủ động thêm alert consumer lag
   Hợp tác:   Kèm Lan từ junior lên tự làm story; được QA lead và SA ghi nhận
3. Phản hồi từ đồng nghiệp và stakeholder (2–3 trích dẫn ngắn)
4. Khoảng cách còn lại và kế hoạch tiếp tục phát triển
5. Thời gian đã làm việc ổn định ở cấp mới: [x tháng]
```

Hãy nói chuyện với thành viên về khoảng cách còn thiếu **vài tháng trước** chu kỳ xét thăng tiến, để họ có thời gian thể hiện, và để tránh bất ngờ ở cả hai phía.

## Lỗi thường gặp

- **Mục tiêu là danh sách task.** Cách sửa: viết mục tiêu theo kết quả, dùng SMART để kiểm tra.
- **Đánh giá theo trí nhớ.** Cách sửa: duy trì ghi chú 1:1 và brag document suốt kỳ.
- **Ai cũng "đạt kỳ vọng".** Cách sửa: so với mô tả cụ thể trong career ladder, và calibration giữa các lead.
- **Bất ngờ trong buổi review.** Cách sửa: mọi vấn đề lớn phải được nói trong 1:1 từ trước.
- **Dùng PIP như thủ tục cho nghỉ việc.** Cách sửa: chẩn đoán nguyên nhân, hỗ trợ thật, và có kỳ vọng mà người đó có thể đạt được.
- **Thăng tiến theo thâm niên hoặc để giữ người.** Cách sửa: dựa trên dẫn chứng đã làm ổn định ở cấp mới.

## Bài tập thực hành

1. **Mục tiêu từ OKR:** Lấy OKR của team trong quý (hoặc tự viết một bộ). Viết 2–4 mục tiêu SMART cho hai thành viên, mỗi bộ gồm ít nhất một mục tiêu đóng góp cho OKR và một mục tiêu phát triển lấy từ IDP.
2. **Bản nháp review có dẫn chứng:** Chọn một thành viên và viết bản nháp performance review theo template. Mỗi nhận định phải có ít nhất một dẫn chứng (PR, ADR, ticket, phản hồi). Gạch bỏ những câu không có dẫn chứng.
3. **Career ladder mini:** Viết career ladder cho ba cấp Junior, Mid, Senior của team bạn với bốn khía cạnh như trên, rồi nhờ một senior và một junior góp ý xem mô tả đã đủ cụ thể để tự đánh giá chưa.

## Tóm tắt

- Mục tiêu tốt là SMART và gắn với sản phẩm; OKR đo kết quả, không đo danh sách việc.
- Phân biệt OKR cam kết với OKR tham vọng, và không gắn trực tiếp điểm OKR vào thưởng.
- Performance review công bằng cần dẫn chứng thu thập cả kỳ, đánh giá riêng từng tiêu chí, và calibration để giảm thiên kiến.
- Buổi review không được có bất ngờ: mọi vấn đề lớn phải được nói trước trong 1:1.
- Với hiệu suất thấp, hãy chẩn đoán nguyên nhân trước; PIP cần kỳ vọng đo được, hỗ trợ thật và làm cùng HR.
- Career ladder làm rõ kỳ vọng theo cấp; đề xuất thăng tiến khi người đó đã làm ổn định ở cấp mới, kèm dẫn chứng theo từng khía cạnh.
