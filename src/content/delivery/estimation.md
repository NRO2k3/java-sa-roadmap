"Bao giờ xong?" là câu hỏi Dev Lead nghe nhiều nhất từ PO, PM và khách hàng. Trả lời theo cảm tính thì dễ hứa quá tay rồi đến cuối phải bắt team chạy OT. Còn từ chối trả lời thì bạn mất lòng tin của stakeholder. Bài này giúp bạn chia công việc đủ nhỏ để dễ kiểm soát, hiểu đúng giá trị và giới hạn của story point, và dùng dữ liệu thực tế để đưa ra dự báo dạng xác suất, có buffer cho rủi ro.

## Mục tiêu bài học

- Chia epic thành các user story nhỏ, mỗi story là một lát cắt dọc có giá trị, kèm acceptance criteria rõ ràng.
- Ước lượng bằng story point và planning poker, và hiểu giới hạn của chúng.
- Dự báo bằng dữ liệu thực tế (throughput, cycle time) và mô phỏng Monte Carlo.
- Lập kế hoạch release và roadmap có buffer, truyền đạt dự báo dưới dạng khoảng và xác suất.

## Từ epic đến user story

**Epic** là một khối công việc lớn, thường kéo dài nhiều sprint, ví dụ "Thanh toán bằng ví điện tử". **User story** là một phần nhỏ mang lại giá trị cho người dùng và có thể hoàn thành trong vài ngày. Story thường được viết theo mẫu:

> Là **[vai trò]**, tôi muốn **[mục tiêu]** để **[lợi ích]**.

Ví dụ: "Là chủ cửa hàng, tôi muốn xem danh sách giao dịch ví điện tử trong ngày để đối chiếu với tiền thực nhận."

### Tiêu chí INVEST

Một story tốt nên đáp ứng **INVEST**: **I**ndependent (ít phụ thuộc story khác), **N**egotiable (chi tiết còn trao đổi được), **V**aluable (có giá trị với người dùng hoặc doanh nghiệp), **E**stimable (đủ rõ để ước lượng), **S**mall (đủ nhỏ để xong trong một sprint, càng nhỏ càng tốt), **T**estable (kiểm thử được).

### Chia theo lát cắt dọc, không chia theo tầng

Sai lầm phổ biến của team backend là chia theo tầng kỹ thuật: "Tạo bảng DB", "Viết repository", "Viết API", "Làm UI". Không phần nào trong số đó có giá trị nếu đứng riêng, và rủi ro tích hợp bị đẩy dồn về cuối. Thay vào đó, hãy chia theo **lát cắt dọc (vertical slice)**: mỗi story đi xuyên qua mọi tầng nhưng chỉ làm một phần nhỏ của nghiệp vụ.

Các kỹ thuật chia story hay dùng (một phần trong số đó được Mike Cohn gói lại thành **SPIDR**):

| Kỹ thuật | Ví dụ với epic "Thanh toán bằng ví điện tử" |
|---|---|
| **Spike** – tách phần nghiên cứu ra trước | Spike 2 ngày: thử sandbox API của ví A, xác định cơ chế callback |
| **Path** – theo luồng: happy path trước, luồng lỗi sau | Story 1: thanh toán thành công; Story 2: xử lý timeout và thanh toán thất bại |
| **Interface** – theo kênh hoặc thiết bị | Story 3: chỉ hỗ trợ app mobile; web để sau |
| **Data** – theo biến thể dữ liệu | Story 4: chỉ ví A; Story 5: thêm ví B |
| **Rules** – theo quy tắc nghiệp vụ | Story 6: thêm giới hạn số tiền mỗi giao dịch; Story 7: thêm phí theo loại cửa hàng |

### Acceptance criteria

**Acceptance criteria (tiêu chí chấp nhận)** là những điều kiện cụ thể mà story phải thoả mãn để PO chấp nhận. Một cách viết phổ biến là theo dạng **Given – When – Then**, rất dễ chuyển thành test tự động:

```text
Story: Thanh toán ví A thành công

AC1 — Given đơn hàng 150.000đ ở trạng thái PENDING
      When ví A gửi callback SUCCESS với chữ ký hợp lệ
      Then đơn hàng chuyển sang PAID và gửi thông báo cho cửa hàng trong 5 giây

AC2 — Given đơn hàng đã PAID
      When ví A gửi lại callback SUCCESS lần thứ hai (trùng)
      Then hệ thống không tạo giao dịch mới và trả HTTP 200 (idempotent)

AC3 — Given callback có chữ ký không hợp lệ
      When hệ thống nhận callback
      Then từ chối với HTTP 401 và ghi log cảnh báo bảo mật
```

Cần phân biệt: **acceptance criteria** riêng cho từng story, còn **Definition of Done** áp dụng cho mọi story (code review, test, deploy staging...).

Nên tổ chức buổi **"three amigos"** (BA hoặc PO, Developer và QA cùng ngồi lại) trước khi story vào sprint, để cùng viết acceptance criteria và phát hiện các tình huống biên từ sớm.

## Story point và planning poker

### Story point là gì

**Story point** là đơn vị **tương đối** dùng để ước lượng kích thước của story, kết hợp khối lượng công việc, độ phức tạp và mức độ chưa chắc chắn. Story point không phải là giờ hay ngày công. Team thường dùng dãy gần với Fibonacci: 1, 2, 3, 5, 8, 13, 20... Khoảng cách giữa các số lớn dần để phản ánh việc story càng lớn thì càng khó ước lượng chính xác.

Cách bắt đầu: chọn 2–3 **story tham chiếu (reference story)** mà cả team đều nhớ, ví dụ "Thêm một field vào API và DB, có migration = 2 điểm", và so sánh các story mới với chúng.

### Planning poker

1. PO hoặc BA đọc story và acceptance criteria; team đặt câu hỏi để làm rõ.
2. Mỗi người chọn một lá bài một cách **bí mật**.
3. Tất cả **lật bài cùng lúc**, để tránh hiệu ứng mỏ neo (anchoring), tức là bị ảnh hưởng bởi con số của người nói trước, nhất là của lead.
4. Người cho điểm cao nhất và thấp nhất giải thích lý do. Thường đây là lúc lộ ra những hiểu lầm: "Em tưởng phải hỗ trợ cả hoàn tiền", "Anh quên mất là ví A không có sandbox".
5. Bỏ phiếu lại, thường tối đa 2–3 vòng, cho đến khi các con số đủ gần nhau.

Giá trị lớn nhất của planning poker **nằm ở cuộc thảo luận**, chứ không nằm ở con số cuối cùng.

### Giới hạn của story point

- **Không so sánh được giữa các team**, và không nên quy đổi sang giờ ("1 điểm = 4 giờ"). Khi quy đổi, bạn mất đi lợi thế của ước lượng tương đối.
- **Dễ bị lạm phát** khi velocity bị dùng làm KPI: cùng một khối lượng việc nhưng điểm cứ tăng dần.
- **Story từ 13 điểm trở lên** thường là tín hiệu cần chia nhỏ hoặc cần làm spike, không phải một con số đáng tin.
- **Tốn thời gian:** nếu buổi ước lượng kéo dài hàng giờ chỉ để tranh luận 3 hay 5 điểm, đó là lãng phí.

### Khi nào có thể không cần story point

Cách tiếp cận **#NoEstimates** đề xuất: nếu team có thể chia story về kích thước tương đối đồng đều, thì chỉ cần **đếm số story** hoàn thành mỗi tuần (throughput) để dự báo, không cần gán điểm. Cách này hợp với team đã có kỷ luật chia story nhỏ. Ngược lại, nó không phù hợp khi kích thước các story chênh lệch rất lớn. Với epic ở mức roadmap, có thể dùng **T-shirt size** (S, M, L, XL) để có ước lượng thô.

## Dự báo bằng dữ liệu thực tế

### Throughput và cycle time

- **Throughput:** số việc hoàn thành trong một đơn vị thời gian, ví dụ 6 story mỗi tuần.
- **Cycle time:** thời gian từ khi bắt đầu làm một việc đến khi nó hoàn thành. Team phải thống nhất rõ điểm bắt đầu (ví dụ: chuyển sang In Progress) và điểm kết thúc (ví dụ: Done trên production).

Đừng dùng giá trị trung bình cho cycle time. Hãy dùng **phân vị (percentile)**: "85% story của team xong trong vòng 6 ngày hoặc ít hơn". Con số này có thể dùng làm kỳ vọng mức dịch vụ (service level expectation) để trả lời câu hỏi "một story mới thì bao giờ xong?".

### Mô phỏng Monte Carlo

**Monte Carlo** là kỹ thuật dự báo bằng cách mô phỏng nhiều lần dựa trên dữ liệu lịch sử, thay vì đưa ra một con số duy nhất. Ví dụ, để trả lời câu hỏi "Còn 40 story, bao giờ xong?":

1. Lấy throughput của 10 tuần gần nhất (số liệu minh hoạ): `4, 6, 5, 3, 7, 5, 4, 6, 2, 5`.
2. Một lần mô phỏng: chọn ngẫu nhiên một giá trị trong danh sách làm throughput của tuần 1, rồi chọn ngẫu nhiên tiếp cho tuần 2... cộng dồn cho đến khi đạt 40 story, rồi ghi lại số tuần đã dùng.
3. Lặp lại hàng nghìn lần, rồi thống kê phân bố của số tuần.

```text
Kết quả mô phỏng (ví dụ minh hoạ)
| Mức tin cậy | Số tuần | Ngày dự kiến (bắt đầu 1/7) |
|-------------|---------|----------------------------|
| 50%         | 9       | 2/9                        |
| 85%         | 10      | 9/9                        |
| 95%         | 11      | 16/9                       |

Cách nói với stakeholder:
"Với tốc độ thực tế 10 tuần qua, có khoảng 85% khả năng 40 story này
xong trước 9/9. Nếu cần chắc chắn hơn, hãy lấy mốc 16/9."
```

Một số lưu ý để mô phỏng đáng tin:

- Dữ liệu nên **gần đây** và phản ánh **quy trình hiện tại**. Nếu team vừa thay đổi lớn (người mới, công nghệ mới), dữ liệu cũ sẽ kém chính xác.
- Các item nên cùng loại và có kích thước tương đối đồng đều.
- **Backlog thường phình ra** khi làm, vì phát sinh story mới, bug, hoặc story bị chia nhỏ thêm. Hãy cộng thêm phần phát sinh dựa trên lịch sử, ví dụ nếu các epic trước tăng khoảng 20% số story thì mô phỏng với 48 story thay vì 40.
- Chạy lại mô phỏng mỗi sprint và cập nhật dự báo.

Bạn có thể làm Monte Carlo bằng một spreadsheet đơn giản, hoặc dùng các plugin và công cụ phân tích flow cho Jira.

## Lập kế hoạch release và roadmap có buffer

### Cố định ngày hay cố định phạm vi

- **Cố định ngày** (ví dụ phải go-live trước một đợt khuyến mãi lớn, hay phải đáp ứng hạn chót của quy định pháp lý): khi đó phạm vi là biến số. Sắp thứ tự story để đảm bảo những phần bắt buộc xong trước.
- **Cố định phạm vi** (ví dụ tích hợp đủ chức năng mà đối tác yêu cầu): khi đó ngày là biến số, được dự báo dưới dạng khoảng.
- Cố định cả ngày lẫn phạm vi, trong khi không cho phép thay đổi nguồn lực, thì thứ bị hy sinh thường là chất lượng. Bài *Rủi ro, Phạm vi & Phụ thuộc* bàn kỹ về cách thương lượng trong tình huống này.

### Các loại buffer

- **Buffer dự báo:** cam kết ra ngoài theo mức 85%, trong khi nội bộ team vẫn nhắm tới mức 50%.
- **Buffer capacity:** dành sẵn một phần năng lực cho bug, hỗ trợ production và việc phát sinh, dựa trên số liệu thực tế của team (ví dụ nếu trung bình 20% thời gian dành cho việc ngoài kế hoạch, thì đừng lên kế hoạch cho 100% capacity).
- **Buffer rủi ro:** những hạng mục rủi ro cao (tích hợp đối tác mới, migration dữ liệu) nên được làm sớm. Có kết quả sớm thì còn thời gian để xoay xở.
- Hãy nhớ trừ đi ngày lễ, Tết và lịch nghỉ phép của team khi tính capacity.

### Roadmap Now – Next – Later

Đừng vẽ roadmap 12 tháng với ngày cụ thể cho từng tính năng. Ở giai đoạn sớm, độ bất định rất lớn, nên ước lượng cần là một khoảng rộng, và khoảng này sẽ hẹp dần khi team hiểu rõ hơn (đây là ý tưởng "cone of uncertainty"). Thay vào đó, hãy chia roadmap thành ba phần: **Now** (đang làm, đã có dự báo theo dữ liệu), **Next** (đã ước lượng thô theo T-shirt size), **Later** (ý tưởng, chưa cam kết).

```text
RELEASE PLAN — Thanh toán ví điện tử v1
Mục tiêu: Cửa hàng nhận thanh toán ví A, ví B trên app mobile
Ràng buộc: Go-live trước 15/9 (cố định ngày)

Must-have (dự báo 85%: 25/8)   — 28 story: ví A + ví B, happy path + lỗi, đối soát
Should-have (dự báo 85%: 8/9)  — 8 story: hoàn tiền, báo cáo theo ngày
Could-have (nếu còn thời gian) — 6 story: web, phí theo loại cửa hàng

Buffer: dự báo theo mức 85%; dành 20% capacity cho bug/hỗ trợ; nghỉ 2/9 đã trừ
Rủi ro hàng đầu: sandbox ví B chưa ổn định → làm spike ở Sprint 1
Cập nhật dự báo: cuối mỗi sprint, gửi kèm báo cáo tiến độ
```

## Lỗi thường gặp

- **Chia story theo tầng kỹ thuật.** Cách sửa: chia theo lát cắt dọc, mỗi story có thể demo được.
- **Story không có acceptance criteria.** Cách sửa: tổ chức three amigos, viết AC theo Given-When-Then trước khi đưa story vào sprint.
- **Quy đổi story point ra giờ, hoặc dùng velocity làm KPI.** Cách sửa: chỉ dùng điểm để team tự lập kế hoạch; dự báo bằng throughput.
- **Đưa ra một ngày duy nhất.** Cách sửa: đưa khoảng thời gian kèm mức tin cậy, và cập nhật mỗi sprint.
- **Lên kế hoạch cho 100% capacity.** Cách sửa: trừ đi việc phát sinh, ngày nghỉ và lễ Tết dựa trên số liệu thật.
- **Để việc rủi ro nhất đến cuối.** Cách sửa: làm spike và làm phần tích hợp khó từ sớm.

## Bài tập thực hành

1. **Chia epic:** Chọn một epic thật của team và chia thành 8–12 story theo lát cắt dọc, dùng ít nhất ba kỹ thuật trong SPIDR. Viết acceptance criteria theo Given-When-Then cho ba story đầu tiên, rồi review cùng BA và QA.
2. **Monte Carlo bằng spreadsheet:** Lấy throughput theo tuần của 10–12 tuần gần nhất từ Jira. Dùng các hàm như `RANDBETWEEN` và `INDEX` để mô phỏng ít nhất 1.000 lần cho số story còn lại của một epic. Tìm các mốc 50% và 85%, rồi so sánh với ước lượng cảm tính trước đó.
3. **Release plan:** Viết release plan theo template cho release tiếp theo, ghi rõ các buffer và rủi ro hàng đầu. Gửi cho PO để lấy góp ý, và cập nhật dự báo sau mỗi sprint trong 3 sprint liên tiếp.

## Tóm tắt

- Chia epic thành story nhỏ theo lát cắt dọc, đáp ứng INVEST, kèm acceptance criteria dạng Given-When-Then.
- Story point là ước lượng tương đối; giá trị chính của planning poker là cuộc thảo luận làm lộ ra các hiểu lầm.
- Không quy đổi điểm ra giờ, không so sánh điểm giữa các team; story quá lớn nên được chia nhỏ hoặc làm spike.
- Dự báo bằng throughput, cycle time theo phân vị và Monte Carlo cho kết quả dạng xác suất, đáng tin hơn cảm tính.
- Kế hoạch release cần buffer cho dự báo, capacity và rủi ro; làm phần rủi ro sớm và cập nhật dự báo mỗi sprint.
- Roadmap Now – Next – Later phản ánh đúng mức độ bất định, thay vì gắn ngày cụ thể cho mọi tính năng.
