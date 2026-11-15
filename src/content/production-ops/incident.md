Sự cố production là điều chắc chắn sẽ xảy ra, câu hỏi chỉ là team phản ứng thế nào. Không có quy trình, sự cố biến thành hỗn loạn: năm người cùng sửa một chỗ, không ai cập nhật cho khách hàng, có người restart service làm mất bằng chứng, và tuần sau sự cố lặp lại y hệt. Dev Lead thường là người điều phối trong những giờ căng thẳng đó, và là người xây quy trình để lần sau team xử lý bình tĩnh hơn. Bài này trình bày khung quản lý sự cố từ lúc phát hiện đến khi rút kinh nghiệm.

## Mục tiêu bài học

- Định nghĩa mức độ nghiêm trọng SEV1–SEV4 và quy trình escalation cho team.
- Đóng vai trò Incident Commander: điều phối, truyền thông và ra quyết định khi có sự cố.
- Thiết lập lịch on-call công bằng và viết runbook cho các sự cố thường gặp.
- Viết postmortem blameless với action item cụ thể, có người chịu trách nhiệm.

## Vòng đời của một sự cố

**Incident** (sự cố) là sự kiện làm gián đoạn hoặc suy giảm dịch vụ, hoặc có nguy cơ làm vậy, cần phản ứng ngay ngoài quy trình làm việc bình thường. Một sự cố đi qua các giai đoạn:

```text
 Phát hiện ──> Phân loại ──> Huy động ──> Giảm thiểu ──> Khắc phục ──> Rút kinh nghiệm
 (alert,       (xác nhận,    (IC, kênh     (rollback,     (sửa gốc,      (postmortem,
  khách báo)    chọn SEV)     riêng, vai)   tắt flag,      xác nhận ổn    action item)
                                            scale)         định)
```

Nguyên tắc quan trọng nhất: **giảm thiểu trước, tìm nguyên nhân sau**. Mục tiêu đầu tiên là khôi phục dịch vụ cho người dùng: rollback bản deploy vừa rồi, tắt feature flag, chuyển traffic, scale thêm instance. Tìm nguyên nhân gốc có thể đợi đến khi hệ thống đã ổn định. Một ngoại lệ: thu thập bằng chứng nhanh (thread dump, log, ảnh chụp dashboard) trước khi restart, nếu việc đó chỉ mất vài chục giây.

## Mức độ nghiêm trọng và escalation

Phân mức độ nghiêm trọng giúp mọi người hiểu ngay sự cố "to" đến đâu, ai cần được gọi và cần cập nhật thường xuyên thế nào. Mỗi tổ chức định nghĩa khác nhau; dưới đây là một mẫu cho team sản phẩm:

| Mức | Định nghĩa (ví dụ) | Phản ứng | Truyền thông |
|---|---|---|---|
| SEV1 | Dịch vụ chính ngừng hoạt động cho phần lớn người dùng, mất hoặc hỏng dữ liệu, sự cố bảo mật đang diễn ra | Gọi on-call ngay 24/7, bắt buộc có IC, huy động mọi người cần thiết | Cập nhật nội bộ dày đặc (ví dụ mỗi 30 phút), status page, báo lãnh đạo |
| SEV2 | Tính năng quan trọng suy giảm nghiêm trọng hoặc ngừng cho một nhóm người dùng đáng kể, có workaround tạm | Gọi on-call ngay, có IC | Cập nhật định kỳ, status page nếu khách hàng thấy rõ |
| SEV3 | Lỗi ảnh hưởng nhỏ, một tính năng phụ, ít người dùng | Xử lý trong giờ làm việc | Ticket, thông báo trong kênh team |
| SEV4 | Không ảnh hưởng người dùng hoặc rất nhỏ (lỗi hiển thị, cảnh báo sớm) | Đưa vào backlog | Ticket |

Một vài quy tắc đi kèm:

- **Nghi ngờ thì chọn mức cao hơn**. Hạ mức sau khi hiểu rõ thì dễ; nâng mức muộn nghĩa là đã mất thời gian huy động.
- Định nghĩa dựa trên **ảnh hưởng tới người dùng và nghiệp vụ**, không dựa trên mức độ khó về kỹ thuật.
- Bất kỳ ai cũng được quyền **khai báo sự cố**. Khai báo nhầm không bị trách; im lặng khi thấy vấn đề mới là điều cần tránh.

**Escalation** (leo thang) là việc kéo thêm người hoặc cấp cao hơn vào. Có hai chiều:

- **Escalation theo chức năng**: gọi chuyên gia của hệ thống liên quan (DBA, team network, team của service phía trên).
- **Escalation theo cấp bậc**: báo quản lý, lãnh đạo khi sự cố nghiêm trọng hoặc kéo dài, cần quyết định nghiệp vụ (ví dụ tạm dừng chương trình khuyến mãi).

Chính sách escalation trong công cụ paging (PagerDuty, Opsgenie...) nên tự động: nếu người trực chính không xác nhận trong khoảng thời gian định trước, hệ thống gọi người trực phụ, sau đó gọi Lead. Đừng ngại escalate sớm: gọi thêm người khi không cần chỉ tốn vài phút của họ, còn chậm gọi có thể kéo dài sự cố hàng giờ.

## Incident Commander

Với sự cố SEV1/SEV2, cần một người đóng vai **Incident Commander** (IC, người chỉ huy sự cố). Mô hình này bắt nguồn từ hệ thống chỉ huy sự cố (Incident Command System) của lực lượng cứu hoả và được các tổ chức như Google, PagerDuty áp dụng cho phần mềm.

### IC làm gì và không làm gì

IC **điều phối, không tự tay sửa**. Khi IC lao vào đọc log, không còn ai nhìn bức tranh tổng thể: ai đang làm gì, đã thử gì, bao giờ cập nhật tiếp. Trách nhiệm của IC:

- **Nắm trạng thái**: ảnh hưởng hiện tại là gì, giả thuyết nào đang được kiểm tra, ai đang làm.
- **Phân công**: giao việc rõ ràng cho từng người, có thời hạn ("Nam kiểm tra connection pool của order-service, báo lại sau 10 phút").
- **Ra quyết định**: chọn hành động khi có nhiều phương án (rollback hay fix forward), kể cả khi thông tin chưa đầy đủ.
- **Truyền thông**: đảm bảo stakeholder được cập nhật đều đặn.
- **Bảo vệ người đang sửa** khỏi bị hỏi han liên tục.

Các vai trò hỗ trợ thường gặp với sự cố lớn:

| Vai trò | Trách nhiệm |
|---|---|
| Incident Commander | Điều phối, quyết định, giữ nhịp |
| Ops/Tech lead | Dẫn dắt việc chẩn đoán và giảm thiểu kỹ thuật |
| Communications lead | Viết cập nhật cho stakeholder, khách hàng, status page |
| Scribe | Ghi timeline: thời điểm, quan sát, quyết định, hành động |
| Chuyên gia (SME) | Kiến thức sâu về một hệ thống cụ thể |

Với team nhỏ, một người có thể kiêm vài vai, nhưng IC và người trực tiếp sửa nên là hai người khác nhau khi có thể.

### Truyền thông khi có sự cố

Mở một **kênh riêng** cho mỗi sự cố (ví dụ `#inc-2024-05-10-checkout`), mọi trao đổi kỹ thuật diễn ra ở đó để scribe ghi được timeline. Cập nhật cho stakeholder theo **nhịp cố định**, kể cả khi chưa có tin mới; "chưa có tiến triển, đang thử X, cập nhật tiếp lúc 15:30" vẫn tốt hơn im lặng.

```text
[SEV2] Checkout lỗi một phần - Cập nhật #3 - 14:30

Ảnh hưởng: khoảng 20% yêu cầu thanh toán bằng thẻ thất bại từ 13:52.
           Thanh toán bằng ví điện tử bình thường.
Hiện trạng: đã xác định lỗi xuất hiện sau bản deploy payment-service 13:45.
            Đang rollback về bản trước, dự kiến xong lúc 14:40.
Khách hàng: status page đã cập nhật; CSKH đã có kịch bản trả lời.
Cập nhật tiếp theo: 15:00 hoặc sớm hơn nếu có thay đổi.
IC: Trần Minh
```

Viết cho người **không phải kỹ sư** hiểu được: ảnh hưởng tới ai, đang làm gì, khi nào có tin tiếp. Chi tiết kỹ thuật để trong kênh sự cố.

### Kết thúc sự cố

IC tuyên bố kết thúc khi các chỉ số đã trở về bình thường trong một khoảng thời gian đủ để tin tưởng. Sau đó: gửi thông báo đóng sự cố, chỉ định người viết postmortem và hạn hoàn thành.

## On-call công bằng và runbook

### Lịch on-call

**On-call** là việc luân phiên chịu trách nhiệm phản hồi alert ngoài giờ. On-call tệ là nguyên nhân phổ biến khiến kỹ sư giỏi kiệt sức và nghỉ việc. Một lịch công bằng cần:

- **Luân phiên đều**: thường theo tuần, có người trực chính (primary) và người trực phụ (secondary). Nếu team ở nhiều múi giờ, cân nhắc mô hình theo mặt trời (follow-the-sun) để không ai phải trực đêm.
- **Đủ người**: team quá ít người thì mỗi người trực quá thường xuyên; khi đó cần ghép lịch với team khác hoặc giảm phạm vi trực.
- **Bàn giao (handoff)**: cuối ca, người trực ghi lại các alert, sự cố đang theo dõi, việc còn dang dở cho người tiếp theo.
- **Bù đắp**: nghỉ bù sau đêm bị gọi dậy, phụ cấp on-call theo chính sách công ty.
- **Đào tạo**: người mới trực kèm (shadow) vài ca trước khi trực chính.
- **Alert có thể hành động**: chỉ gọi người dậy cho vấn đề ảnh hưởng người dùng và cần con người xử lý ngay. Alert gọi dậy mà không cần làm gì là alert cần sửa hoặc xoá.

Dev Lead nên theo dõi tải on-call: số lần bị gọi mỗi ca, bao nhiêu lần ngoài giờ, bao nhiêu alert không cần hành động. Đây là dữ liệu để ưu tiên việc giảm alert nhiễu và sửa nguyên nhân gốc.

### Runbook

**Runbook** là tài liệu hướng dẫn từng bước xử lý một loại sự cố cụ thể, viết sao cho người trực lúc 3 giờ sáng, đang buồn ngủ và có thể chưa từng đụng vào service đó, vẫn làm theo được. Mỗi alert nên có link tới runbook tương ứng.

```text
RUNBOOK: order-service - Cạn connection pool database

Alert:      OrderServiceDbPoolExhausted (hikaricp pending > 0 trong 5 phút)
Ảnh hưởng:  API đặt hàng chậm hoặc lỗi 500 "Connection is not available"
Dashboard:  Grafana > order-service > Database

1. Xác nhận: pool active = max và pending tăng? Một instance hay tất cả?
2. Kiểm tra DB: query chạy lâu trong pg_stat_activity, lock đang chờ.
3. Kiểm tra deploy gần nhất (< 2 giờ)? Nếu có -> cân nhắc rollback.
4. Thu thập bằng chứng: jcmd <pid> Thread.print > /tmp/td-$(date +%s).txt
   (lấy 3 lần, cách nhau 10 giây) trên một instance bị ảnh hưởng.
5. Giảm thiểu:
   - Do deploy mới: rollback theo hướng dẫn release.
   - Do query chậm cụ thể: báo DBA, cân nhắc terminate query đó.
   - Do service phía sau chậm: bật circuit breaker / tắt flag tính năng liên quan.
6. Escalate: sau 15 phút chưa giảm thiểu được -> gọi secondary và Dev Lead.
Liên hệ: #team-order, DBA on-call qua công cụ paging.
```

Runbook phải được **kiểm chứng**: chạy thử trong buổi game day (mô phỏng sự cố có kế hoạch), cập nhật sau mỗi lần dùng thật. Nếu một bước runbook chỉ là chạy lệnh cố định, đó là ứng viên tốt để tự động hoá.

## Postmortem blameless

**Postmortem** là tài liệu phân tích sau sự cố: chuyện gì đã xảy ra, vì sao, và làm gì để không lặp lại. **Blameless** nghĩa là tập trung vào **hệ thống và quy trình** đã cho phép lỗi xảy ra, không quy lỗi cho cá nhân. Lý do thực tế: nếu người trong cuộc sợ bị phạt, họ sẽ giấu thông tin, và bạn mất đúng dữ liệu cần thiết để sửa hệ thống. Câu hỏi đúng không phải "ai đã chạy lệnh sai", mà là "vì sao hệ thống cho phép một lệnh sai gây sập production".

### Khi nào cần viết

Nên có tiêu chí rõ ràng, ví dụ: mọi sự cố SEV1/SEV2; mất dữ liệu; phải can thiệp thủ công như rollback; thời gian khắc phục vượt ngưỡng; hoặc sự cố do khách hàng phát hiện trước monitoring.

### Mẫu postmortem

```text
POSTMORTEM: [Tiêu đề ngắn] - [Ngày] - SEV[x]
Trạng thái: Nháp / Đã review     Tác giả: ...     IC: ...

1. Tóm tắt (3-4 câu): chuyện gì, ảnh hưởng, khắc phục thế nào.
2. Ảnh hưởng: thời gian (bắt đầu - phát hiện - giảm thiểu - kết thúc),
   số người dùng/giao dịch bị ảnh hưởng, error budget đã tiêu.
3. Timeline: các mốc có giờ phút, gồm quan sát, quyết định, hành động.
4. Nguyên nhân và yếu tố góp phần: kỹ thuật và quy trình.
5. Điều gì làm tốt / điều gì chưa tốt / chỗ nào ta gặp may.
6. Action item:
   | Việc | Loại (ngăn chặn/phát hiện/giảm thiểu) | Người phụ trách | Hạn | Ticket |
7. Bài học rút ra.
```

Một sự cố hiếm khi có **một** nguyên nhân gốc duy nhất. Thường là nhiều yếu tố cùng lúc: bản deploy có bug, test không bao phủ trường hợp đó, alert đặt ngưỡng quá cao nên phát hiện muộn, runbook lỗi thời nên khắc phục chậm. Liệt kê đủ các yếu tố giúp action item đa dạng hơn: không chỉ "sửa bug" mà còn cải thiện phát hiện và giảm thiểu. Kỹ thuật "5 Whys" (hỏi "tại sao" liên tiếp) hữu ích để đào sâu, nhưng đừng dừng ở một chuỗi duy nhất.

### Action item cụ thể

Action item mơ hồ là lý do số một khiến sự cố lặp lại. So sánh:

| Mơ hồ | Cụ thể |
|---|---|
| Cải thiện monitoring | Thêm alert khi `hikaricp_connections_pending` > 0 liên tục 5 phút cho order-service, link runbook |
| Cẩn thận hơn khi deploy | Bật canary 10% traffic 15 phút cho payment-service, tự rollback khi tỉ lệ lỗi vượt ngưỡng |
| Viết thêm test | Thêm integration test cho luồng thanh toán thẻ khi provider trả timeout |

Mỗi action item cần **người phụ trách, hạn và ticket**, được ưu tiên trong backlog như việc thật. Tổ chức buổi review postmortem với team (và các team liên quan), chia sẻ rộng rãi để cả tổ chức cùng học, và định kỳ kiểm tra tỉ lệ action item đã hoàn thành.

## Lỗi thường gặp

- **Mọi người cùng nhảy vào sửa, không ai điều phối**: hành động chồng chéo, không ai cập nhật stakeholder. Cách sửa: luôn chỉ định IC ngay khi khai báo SEV1/SEV2.
- **Tìm nguyên nhân gốc trong khi người dùng đang chịu ảnh hưởng**: debug 2 giờ trong khi rollback chỉ mất 5 phút. Cách sửa: ưu tiên giảm thiểu, điều tra sau.
- **Im lặng trong lúc xử lý**: stakeholder hoảng, liên tục hỏi người đang sửa. Cách sửa: nhịp cập nhật cố định do communications lead hoặc IC phụ trách.
- **Postmortem đổ lỗi**: "Do bạn X chạy nhầm script". Cách sửa: viết lại theo hướng hệ thống ("script không có bước xác nhận môi trường"), Lead làm gương trong buổi review.
- **Action item không ai làm**: postmortem viết xong rồi để đó. Cách sửa: ticket có người phụ trách, hạn, theo dõi trong họp định kỳ.
- **Runbook lỗi thời**: lệnh không còn chạy, link dashboard hỏng. Cách sửa: cập nhật runbook là một bước bắt buộc trong postmortem, kiểm chứng trong game day.

## Bài tập thực hành

1. **Định nghĩa mức độ cho team**: viết bảng SEV1–SEV4 cụ thể cho sản phẩm của bạn (dùng ví dụ thật: "thanh toán lỗi trên 5% giao dịch" thay vì "lỗi nghiêm trọng"), kèm chính sách escalation và nhịp cập nhật. Đưa team góp ý.
2. **Game day**: tổ chức một buổi mô phỏng sự cố trên môi trường staging (ví dụ giới hạn connection pool xuống 2 rồi bắn tải). Phân vai IC, tech lead, scribe; dùng runbook có sẵn; ghi lại những chỗ runbook thiếu hoặc sai.
3. **Viết postmortem**: chọn một sự cố gần đây của team (hoặc từ buổi game day) và viết postmortem theo mẫu, với ít nhất ba action item thuộc ba loại ngăn chặn, phát hiện và giảm thiểu.

## Tóm tắt

- Quy trình sự cố: phát hiện, phân loại, huy động, giảm thiểu, khắc phục, rút kinh nghiệm; luôn giảm thiểu trước, tìm nguyên nhân sau.
- Mức SEV1–SEV4 dựa trên ảnh hưởng tới người dùng; nghi ngờ thì chọn mức cao hơn; escalate sớm.
- Incident Commander điều phối, ra quyết định và giữ nhịp truyền thông, không tự tay sửa.
- On-call công bằng cần luân phiên đều, bàn giao, bù đắp và alert có thể hành động; mỗi alert nên có runbook.
- Postmortem blameless tập trung vào hệ thống, liệt kê nhiều yếu tố góp phần, không đổ lỗi cá nhân.
- Action item phải cụ thể, có người phụ trách, hạn và ticket, được theo dõi đến khi xong.
