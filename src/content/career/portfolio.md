Kỹ năng kiến trúc rất khó nhìn thấy từ bên ngoài: CV chỉ ghi "thiết kế hệ thống microservices", còn nhà tuyển dụng muốn biết bạn đã suy nghĩ thế nào, cân nhắc những gì và kết quả ra sao. Portfolio kiến trúc, bài viết kỹ thuật và các buổi chia sẻ biến năng lực vô hình đó thành bằng chứng cụ thể. Phỏng vấn vị trí Solution Architect lại có những vòng riêng: system design, đào sâu dự án cũ, behavioral; mỗi vòng cần chuẩn bị theo cách khác nhau. Bài này cho bạn khung làm portfolio, viết và nói về kiến trúc, cùng phương pháp luyện phỏng vấn có cấu trúc.

## Mục tiêu bài học

- Xây dựng portfolio kiến trúc trên GitHub gồm bài thiết kế, ADR và sơ đồ C4.
- Lên kế hoạch viết blog và chuẩn bị một bài nói tại meetup về kiến trúc.
- Áp dụng khung trả lời phỏng vấn system design có phân bổ thời gian và ước lượng quy mô.
- Trả lời câu hỏi behavioral bằng phương pháp STAR với kho câu chuyện chuẩn bị sẵn.
- Kể lại các quyết định kiến trúc đã làm một cách thuyết phục, kể cả quyết định sai.

## Portfolio kiến trúc trên GitHub

### Nhà tuyển dụng muốn thấy gì?

Portfolio của SA không phải là kho code demo. Người đọc (hiring manager, architect phỏng vấn) tìm kiếm ba tín hiệu:

1. **Tư duy có cấu trúc**: bắt đầu từ yêu cầu và ràng buộc, không bắt đầu từ công nghệ.
2. **Trade-off rõ ràng**: bạn đã cân nhắc những phương án nào và vì sao chọn phương án này trong bối cảnh này.
3. **Giao tiếp**: sơ đồ dễ hiểu, tài liệu ngắn gọn, người không cùng dự án vẫn đọc được.

Milestone của giai đoạn là **3 bài thiết kế kiến trúc** công khai. Cấu trúc repo gợi ý:

```text
architecture-portfolio/
├── README.md                       // giới thiệu bản thân, mục lục, mỗi bài 2–3 câu tóm tắt
├── 01-ticketing-flash-sale/
│   ├── README.md                   // bài thiết kế chính
│   ├── diagrams/workspace.dsl      // C4 dạng code (Structurizr DSL)
│   ├── diagrams/*.png              // ảnh xuất từ code để xem nhanh trên GitHub
│   └── adr/
│       ├── 0001-chon-redis-giu-cho.md
│       └── 0002-xu-ly-thanh-toan-bat-dong-bo.md
├── 02-monolith-to-modular/
└── 03-event-driven-orders/
```

### Cấu trúc một bài thiết kế

Mỗi bài thiết kế nên trả lời được các câu hỏi sau, theo thứ tự:

| Phần | Nội dung | Ví dụ |
|---|---|---|
| Bối cảnh và bài toán | Ai dùng, vấn đề kinh doanh là gì | Bán vé sự kiện, mở bán vài phút là hết vé |
| Yêu cầu chức năng | 3–6 chức năng cốt lõi | Giữ chỗ, thanh toán, phát vé điện tử |
| Yêu cầu phi chức năng | Có con số | Chịu tải đột biến gấp nhiều lần bình thường, không bán trùng ghế, p99 giữ chỗ dưới 500 ms |
| Ràng buộc | Đội ngũ, ngân sách, công nghệ có sẵn, quy định | Team 6 người quen Java/Spring, chạy trên AWS |
| Ước lượng quy mô | Phép tính đơn giản | Số request mỗi giây lúc cao điểm, dung lượng lưu trữ |
| Kiến trúc | Sơ đồ C4 mức Context và Container, mô tả luồng chính | Luồng giữ chỗ, luồng thanh toán |
| Quyết định chính | Liên kết tới ADR | Redis giữ chỗ có TTL, thanh toán bất đồng bộ |
| Rủi ro và trade-off | Điều gì có thể sai, đã chấp nhận đánh đổi gì | Nhất quán cuối cùng (eventual consistency) ở trạng thái vé |
| Tiến hoá | Nếu tải gấp 10 lần, nếu thêm tính năng X | Tách inventory thành service riêng |

### ADR: ghi lại "vì sao"

**ADR** (Architecture Decision Record) là một tài liệu ngắn ghi lại một quyết định kiến trúc quan trọng. Định dạng phổ biến do Michael Nygard đề xuất gồm: tiêu đề, trạng thái, bối cảnh, quyết định, hệ quả. Nhiều team bổ sung phần "các phương án đã cân nhắc". ADR lưu cùng repo, đánh số tăng dần, và **không sửa nội dung** khi quyết định thay đổi; thay vào đó tạo ADR mới với trạng thái "Superseded by" ADR cũ.

```text
ADR-0002: Xử lý thanh toán bất đồng bộ qua hàng đợi

Trạng thái: Accepted
Ngày: 2025-03-12

Bối cảnh
  Cổng thanh toán bên thứ ba có độ trễ biến động, đôi khi vài giây, và giới hạn
  số request mỗi giây. Lúc mở bán, số yêu cầu thanh toán vượt xa giới hạn này.

Các phương án đã cân nhắc
  1. Gọi cổng thanh toán đồng bộ trong request đặt vé.
  2. Đưa yêu cầu vào hàng đợi, worker xử lý theo tốc độ cổng cho phép,
     client nhận trạng thái qua polling hoặc push.
  3. Tăng số instance và retry khi cổng từ chối.

Quyết định
  Chọn phương án 2. Ghế được giữ có thời hạn trong lúc chờ thanh toán.

Hệ quả
  + Hệ thống không sập khi cổng thanh toán chậm; tốc độ gọi được kiểm soát.
  + Worker có thể retry an toàn nhờ idempotency key.
  - Trải nghiệm người dùng phức tạp hơn: cần màn hình "đang xử lý".
  - Thêm thành phần cần vận hành và giám sát (hàng đợi, dead-letter queue).
```

### Sơ đồ C4

**Mô hình C4** của Simon Brown mô tả kiến trúc ở bốn mức phóng to dần: **Context** (hệ thống trong mối quan hệ với người dùng và hệ thống bên ngoài), **Container** (các ứng dụng, kho dữ liệu triển khai độc lập), **Component** (các thành phần lớn bên trong một container) và **Code** (class, thường không cần vẽ). Với portfolio, hai mức Context và Container là đủ cho hầu hết bài viết; thêm Component cho phần bạn muốn đào sâu.

Vẽ sơ đồ bằng code (diagrams as code) giúp quản lý phiên bản cùng tài liệu và dễ cập nhật. Ví dụ Structurizr DSL:

```text
workspace "Library Platform" {
    model {
        member = person "Thành viên" "Tra cứu, mượn và đặt trước sách"
        email = softwareSystem "Email Provider" "Dịch vụ gửi email bên ngoài" "External"

        library = softwareSystem "Library Platform" {
            web = container "Web App" "Giao diện cho thành viên" "React"
            api = container "Library API" "Nghiệp vụ mượn, trả, đặt trước" "Java 21, Spring Boot 3"
            db = container "Database" "Sách, thành viên, lượt mượn" "PostgreSQL"
            broker = container "Message Broker" "Sự kiện mượn/trả" "Kafka"
            notifier = container "Notification Service" "Nhắc hạn trả sách" "Java 21, Spring Boot 3"
        }

        member -> web "Dùng" "HTTPS"
        web -> api "Gọi API" "JSON/HTTPS"
        api -> db "Đọc/ghi" "JDBC"
        api -> broker "Phát sự kiện LoanCreated" "Kafka"
        notifier -> broker "Tiêu thụ sự kiện" "Kafka"
        notifier -> email "Gửi email nhắc hạn" "HTTPS"
    }

    views {
        systemContext library {
            include *
            autolayout lr
        }
        container library {
            include *
            autolayout lr
        }
    }
}
```

Quy tắc cho sơ đồ dễ đọc: mỗi sơ đồ có tiêu đề và chú thích (legend), mỗi hộp ghi tên, vai trò và công nghệ, mỗi mũi tên ghi **mục đích** và giao thức, không nhồi mọi thứ vào một sơ đồ.

### Chọn đề tài và xử lý thông tin bảo mật

Đề tài tốt nhất là **bài toán bạn đã thật sự giải** trong công việc, được ẩn danh hoá: đổi tên miền nghiệp vụ, bỏ số liệu nhạy cảm, không đưa tên khách hàng, mã nguồn hay cấu hình nội bộ. Nếu có điều khoản bảo mật (NDA), hãy hỏi công ty hoặc chỉ viết về pattern và bài học, không viết về hệ thống cụ thể. Khi chưa có dự án phù hợp, chọn đề tài cho thấy các năng lực khác nhau, ví dụ: một hệ thống chịu tải đột biến (bán vé), một kế hoạch migration từ monolith (Strangler Fig), một luồng event-driven có đảm bảo nhất quán (Outbox, Saga). Ba bài nên bổ trợ nhau thay vì cùng một kiểu.

## Viết blog và chia sẻ tại meetup

### Vì sao nên viết

Viết buộc bạn sắp xếp suy nghĩ: nếu không giải thích được một quyết định trong 1.000 chữ, có thể bạn chưa hiểu nó đủ rõ. Bài viết cũng là thứ được tìm thấy, được chia sẻ và thường được người phỏng vấn đọc trước buổi gặp.

Khung một bài blog kiến trúc:

1. **Mở bài bằng vấn đề**: triệu chứng, con số, hệ quả kinh doanh.
2. **Bối cảnh và ràng buộc**: đủ để người đọc hiểu vì sao giải pháp "hiển nhiên" không dùng được.
3. **Các phương án**: hai đến ba phương án, ưu nhược của từng cái.
4. **Quyết định và cách triển khai**: sơ đồ, đoạn code hoặc cấu hình then chốt.
5. **Kết quả**: đo được gì trước và sau.
6. **Bài học**: điều sẽ làm khác nếu làm lại, điều kiện mà giải pháp này **không** phù hợp.

Ý tưởng đề tài: tóm tắt một ADR quan trọng, phân tích một sự cố production (ẩn danh), so sánh hai công nghệ dựa trên thí nghiệm có số liệu tự đo, kinh nghiệm ôn một chứng chỉ, bài học khi migration. Nhịp độ thực tế: một bài mỗi tháng đều đặn tốt hơn năm bài trong một tuần rồi dừng.

### Từ bài viết thành bài nói

Một bài blog tốt có thể trở thành bài nói 20–30 phút tại meetup nội bộ hoặc cộng đồng. Bản mô tả gửi ban tổ chức (abstract) nên có: vấn đề, đối tượng người nghe, ba điều người nghe mang về, và vì sao bạn là người phù hợp để nói.

Cấu trúc bài nói 20 phút gợi ý:

| Thời lượng | Nội dung |
|---|---|
| 2 phút | Câu chuyện mở đầu: sự cố hoặc con số gây chú ý |
| 4 phút | Bối cảnh, ràng buộc |
| 8 phút | Các phương án, quyết định, sơ đồ kiến trúc |
| 4 phút | Kết quả, bài học, khi nào không nên áp dụng |
| 2 phút | Tóm tắt ba ý chính, mời đặt câu hỏi |

Tập nói thành tiếng ít nhất ba lần, bấm giờ; chuẩn bị trước câu trả lời cho các câu hỏi khó dễ đoán ("tại sao không dùng X?"). Bắt đầu từ meetup nội bộ công ty hoặc nhóm nhỏ trước khi đăng ký sự kiện lớn.

## Luyện phỏng vấn system design

### Khung trả lời có phân bổ thời gian

Phỏng vấn system design thường kéo dài 45–60 phút. Khung dưới đây giúp bạn không sa đà vào chi tiết quá sớm và không hết giờ khi chưa nói đến trade-off:

| Bước | Thời gian (buổi 45 phút) | Việc cần làm |
|---|---|---|
| 1. Làm rõ yêu cầu | 5–8 phút | Chức năng cốt lõi, người dùng, quy mô, yêu cầu phi chức năng, những gì nằm ngoài phạm vi |
| 2. Ước lượng | 3–5 phút | Request/giây trung bình và cao điểm, dung lượng lưu trữ, băng thông |
| 3. API và mô hình dữ liệu | 5 phút | Các endpoint chính, thực thể, khoá truy cập |
| 4. Thiết kế tổng thể | 10 phút | Sơ đồ các thành phần, luồng đọc, luồng ghi |
| 5. Đào sâu | 10–12 phút | Một đến hai điểm khó: nhất quán, cache, phân mảnh, hàng đợi, idempotency |
| 6. Trade-off, điểm nghẽn, tiến hoá | 5 phút | Điểm lỗi đơn lẻ, giám sát, khi tải gấp 10 lần |

Luôn **nói ra giả định** ("Tôi giả định 2 triệu người dùng hoạt động mỗi ngày, có đúng không?") và **hỏi người phỏng vấn muốn đào sâu phần nào**. Phỏng vấn system design là một buổi làm việc chung, không phải bài thuyết trình một chiều.

### Ước lượng nhanh (back-of-the-envelope)

Ví dụ hệ thống tra cứu và mượn sách: 2 triệu người dùng hoạt động mỗi ngày, mỗi người 10 lần đọc và 1 lần ghi, mỗi bản ghi khoảng 1 KB.

```text
Một ngày có 86.400 giây (làm tròn ~ 100.000 để tính nhẩm)

Đọc : 2.000.000 x 10 = 20.000.000 / ngày  ->  ~230 request/giây trung bình
Ghi : 2.000.000 x 1  =  2.000.000 / ngày  ->  ~23 request/giây trung bình
Cao điểm giả định gấp 5 lần trung bình   ->  ~1.200 đọc/giây, ~120 ghi/giây
Lưu trữ: 2.000.000 x 1 KB = ~2 GB / ngày  ->  ~730 GB / năm (chưa tính bản sao, index)

Kết luận: tỷ lệ đọc/ghi 10:1, nên ưu tiên cache và read replica;
          lượng ghi nhỏ, một database quan hệ có bản sao là đủ ở giai đoạn đầu.
```

Mục đích của ước lượng không phải là con số chính xác, mà là **dẫn tới quyết định thiết kế**. Hãy luôn kết thúc phép tính bằng một câu "vì vậy…".

### Điểm khác của phỏng vấn SA

So với phỏng vấn developer, vòng thiết kế của SA thường chú trọng hơn vào: yêu cầu kinh doanh và stakeholder, chi phí, bảo mật và tuân thủ, tích hợp với hệ thống cũ, kế hoạch chuyển đổi theo giai đoạn, và cách bạn trình bày cho người không chuyên kỹ thuật. Một số nơi có vòng **đào sâu kiến trúc dự án cũ**: bạn vẽ lại hệ thống mình từng thiết kế và trả lời liên tục các câu "tại sao". Đây là lúc portfolio và kho câu chuyện quyết định phát huy tác dụng.

## Phỏng vấn behavioral với STAR

### Phương pháp STAR

**STAR** là khung kể chuyện cho câu hỏi dạng "Hãy kể về một lần bạn…":

| Phần | Nội dung | Tỷ trọng gợi ý |
|---|---|---|
| **S**ituation | Bối cảnh ngắn gọn: dự án, quy mô, vấn đề | ~15% |
| **T**ask | Trách nhiệm cụ thể của **bạn** | ~10% |
| **A**ction | Bạn đã làm gì, vì sao, theo thứ tự | ~50% |
| **R**esult | Kết quả đo được, tác động kinh doanh | ~15% |
| (Reflection) | Bài học, điều sẽ làm khác | ~10% |

Hai nguyên tắc quan trọng: nói "**tôi**" khi mô tả hành động của bạn (người phỏng vấn đánh giá bạn, không đánh giá team), và có **con số** ở phần kết quả nếu có thể. Một câu chuyện nên dài khoảng 2–3 phút.

### Kho câu chuyện

Chuẩn bị sẵn 6–8 câu chuyện, mỗi câu có thể dùng cho nhiều câu hỏi:

| Năng lực được hỏi | Câu hỏi ví dụ | Câu chuyện của bạn |
|---|---|---|
| Ra quyết định kỹ thuật | Kể về một quyết định kiến trúc khó | (điền) |
| Bất đồng | Khi bạn không đồng ý với stakeholder hoặc kiến trúc sư khác | (điền) |
| Ảnh hưởng không cần quyền hạn | Thuyết phục team khác thay đổi cách làm | (điền) |
| Thất bại | Một quyết định sai và cách bạn xử lý | (điền) |
| Sự cố | Xử lý sự cố production nghiêm trọng | (điền) |
| Cân bằng kỹ thuật và kinh doanh | Khi phải đánh đổi chất lượng lấy tiến độ | (điền) |
| Phát triển người khác | Giúp một thành viên tiến bộ | (điền) |

**Ví dụ minh hoạ (tình huống giả định):**

- **S**: Job đối soát cuối ngày của hệ thống thanh toán chạy khoảng 6 giờ, thường xuyên tràn sang giờ làm việc và chặn các job khác.
- **T**: Tôi được giao tìm nguyên nhân và đề xuất giải pháp trong một quý, không được thay đổi định dạng dữ liệu đầu ra cho các team phía sau.
- **A**: Tôi ghi JFR trong một lần chạy và thấy phần lớn thời gian là chờ database do truy vấn từng bản ghi (N+1). Tôi đề xuất hai phương án: tối ưu truy vấn theo lô, hoặc viết lại bằng nền tảng xử lý dữ liệu mới. Tôi viết ADR so sánh rủi ro và chi phí, chọn phương án theo lô kết hợp chia dữ liệu theo phân vùng để xử lý song song, và chạy song song bản cũ và bản mới hai tuần để đối chiếu kết quả trước khi chuyển hẳn.
- **R**: Thời gian chạy giảm còn khoảng 1,5 giờ, không có sai lệch dữ liệu sau giai đoạn chạy song song, và phương án không cần thêm hạ tầng mới.
- **Reflection**: Nếu làm lại, tôi sẽ thêm metric thời gian chạy từng bước ngay từ đầu, để phát hiện suy giảm sớm thay vì đợi tới khi job tràn giờ.

## Chuẩn bị câu chuyện về quyết định kiến trúc

Câu hỏi "Kể về một quyết định kiến trúc bạn đã làm" xuất hiện ở hầu hết phỏng vấn SA, và luôn kèm câu hỏi đào sâu. Dùng khung sau cho mỗi quyết định:

```text
1. Bối cảnh      : hệ thống gì, quy mô, vấn đề kinh doanh
2. Ràng buộc     : thời gian, đội ngũ, ngân sách, công nghệ sẵn có, quy định
3. Phương án     : ít nhất 2–3 phương án nghiêm túc (không dựng "phương án bù nhìn")
4. Tiêu chí      : các thuộc tính chất lượng được ưu tiên và vì sao
5. Quyết định    : chọn gì, ai tham gia, thuyết phục stakeholder thế nào
6. Kết quả       : đo được gì sau 3–12 tháng
7. Nhìn lại      : đúng ở đâu, sai ở đâu, điều kiện nào sẽ khiến bạn chọn khác
```

Ví dụ ngắn: một team 8 người xây nền tảng mới, sếp muốn "làm microservices cho hiện đại". Bạn đề xuất **modular monolith**: một ứng dụng Spring Boot chia module theo bounded context, ranh giới được kiểm tra tự động (ví dụ bằng ArchUnit hoặc Spring Modulith), giao tiếp giữa module qua event nội bộ. Lý do: team nhỏ, miền nghiệp vụ còn thay đổi nhiều, chưa có năng lực vận hành nhiều service. Bạn ghi rõ trong ADR **điều kiện để tách service** sau này (một module cần scale riêng, hoặc cần team riêng sở hữu). Câu chuyện mạnh vì cho thấy bạn chọn theo bối cảnh, không theo xu hướng, và có kế hoạch tiến hoá.

Chuẩn bị sẵn câu trả lời cho các câu đào sâu: "Tại sao không chọn phương án B?", "Nếu tải tăng 10 lần thì sao?", "Ai phản đối và bạn xử lý thế nào?", "Nếu làm lại bạn đổi gì?". Đừng ngại kể một **quyết định sai**: người phỏng vấn đánh giá cao khả năng nhận ra sai lầm, giảm thiểu thiệt hại và rút ra bài học.

## Kế hoạch chuẩn bị 6 tuần

| Tuần | Portfolio và chia sẻ | Phỏng vấn |
|---|---|---|
| 1 | Tạo repo, viết README giới thiệu, chọn 3 đề tài | Liệt kê 6–8 câu chuyện, ghép với bảng năng lực |
| 2 | Hoàn thành bài thiết kế 1 kèm C4 và 2 ADR | Viết STAR cho 3 câu chuyện, tập nói bấm giờ |
| 3 | Bài thiết kế 2 | Luyện 2 đề system design một mình, ghi âm lại |
| 4 | Bài thiết kế 3 | Viết STAR cho các câu chuyện còn lại; chuẩn bị 3 câu chuyện quyết định kiến trúc |
| 5 | Chuyển một bài thiết kế thành bài blog | Phỏng vấn thử với đồng nghiệp hoặc mentor (system design + behavioral) |
| 6 | Đăng bài, đề xuất một buổi chia sẻ nội bộ | Sửa theo góp ý, phỏng vấn thử lần hai |

## Lỗi thường gặp

- **Portfolio chỉ có code demo**: không thấy được tư duy kiến trúc. Cách sửa: mỗi bài có yêu cầu, ràng buộc, sơ đồ, ADR và trade-off.
- **Sơ đồ "mì spaghetti"**: một sơ đồ chứa mọi thứ, mũi tên không nhãn. Cách sửa: tách theo mức C4, ghi mục đích và giao thức trên mũi tên.
- **Tiết lộ thông tin bảo mật của công ty**: vi phạm NDA và mất uy tín. Cách sửa: ẩn danh hoá, hỏi phép, hoặc chỉ viết về pattern.
- **Nhảy ngay vào vẽ kiến trúc khi phỏng vấn**: thiết kế lệch yêu cầu thật. Cách sửa: theo khung, làm rõ yêu cầu và ước lượng trước.
- **Kể chuyện bằng "chúng tôi"**: người phỏng vấn không biết bạn đã làm gì. Cách sửa: tách rõ phần việc của bạn trong phần Action.
- **Chỉ kể thành công, không có trade-off**: nghe thiếu thực tế. Cách sửa: luôn nêu cái giá phải trả và điều sẽ làm khác.
- **Học thuộc lòng câu trả lời mẫu**: lúng túng khi bị hỏi đào sâu. Cách sửa: nắm khung và các con số then chốt, luyện nói tự nhiên với người thật.

## Bài tập thực hành

1. **Bài thiết kế đầu tiên**: chọn một hệ thống bạn hiểu rõ (đã ẩn danh hoá) hoặc đề tài "hệ thống bán vé chịu tải đột biến". Viết bài thiết kế theo bảng cấu trúc ở trên, kèm sơ đồ C4 mức Context và Container bằng Structurizr DSL và ít nhất hai ADR. Nhờ một đồng nghiệp không cùng dự án đọc và đặt 5 câu hỏi; bổ sung câu trả lời vào bài.
2. **Kho câu chuyện STAR**: hoàn thành bảng kho câu chuyện với ít nhất 6 câu chuyện thật. Viết một câu chuyện đầy đủ theo STAR, tập nói thành tiếng trong 3 phút, ghi âm và tự nghe lại: đã nói "tôi" đủ rõ chưa, phần kết quả có con số chưa.
3. **Phỏng vấn thử system design**: cùng một người bạn, luân phiên đóng vai người phỏng vấn với đề "thiết kế hệ thống thông báo nhắc hạn trả sách cho 2 triệu thành viên". Bấm giờ 45 phút theo khung sáu bước, sau đó góp ý cho nhau theo ba tiêu chí: cấu trúc, trade-off, giao tiếp.

## Tóm tắt

- Portfolio kiến trúc thể hiện tư duy: yêu cầu, ràng buộc, sơ đồ C4, ADR và trade-off; mục tiêu là 3 bài thiết kế công khai, bổ trợ nhau.
- ADR ghi lại "vì sao" của quyết định, không sửa mà thay thế bằng ADR mới khi quyết định thay đổi.
- Viết blog và nói tại meetup giúp sắp xếp suy nghĩ và tạo bằng chứng công khai; bắt đầu nhỏ và đều đặn.
- Phỏng vấn system design theo khung có phân bổ thời gian; ước lượng luôn kết thúc bằng một quyết định thiết kế.
- Behavioral dùng STAR, nói "tôi", có con số, và chuẩn bị sẵn 6–8 câu chuyện dùng lại được.
- Câu chuyện quyết định kiến trúc cần bối cảnh, phương án, tiêu chí, kết quả và phần nhìn lại, kể cả khi quyết định đó sai.
