import type { LessonFlashcards } from '../types';

const flashcards: LessonFlashcards = {
  incident: [
    {
      front: 'Sáu giai đoạn trong vòng đời một sự cố?',
      back: 'Phát hiện, phân loại, huy động, giảm thiểu, khắc phục, rút kinh nghiệm.',
    },
    {
      front: 'Nguyên tắc quan trọng nhất khi xử lý sự cố?',
      back: 'Giảm thiểu trước, tìm nguyên nhân sau: rollback, tắt flag, chuyển traffic, scale để khôi phục dịch vụ. Chỉ dừng lại thu thập bằng chứng nhanh như thread dump trước khi restart.',
    },
    {
      front: 'Mức SEV nên dựa trên tiêu chí gì?',
      back: 'Ảnh hưởng tới người dùng và nghiệp vụ, không dựa trên độ khó kỹ thuật. Nghi ngờ thì chọn mức cao hơn và hạ sau khi hiểu rõ.',
    },
    {
      front: 'Escalation theo chức năng khác theo cấp bậc thế nào?',
      back: 'Theo chức năng: gọi chuyên gia của hệ thống liên quan như DBA hay team service phía sau. Theo cấp bậc: báo quản lý, lãnh đạo khi sự cố nghiêm trọng, kéo dài hoặc cần quyết định nghiệp vụ.',
    },
    {
      front: 'Incident Commander làm gì?',
      back: 'Nắm trạng thái, phân công việc có thời hạn, ra quyết định khi thông tin chưa đủ, giữ nhịp truyền thông và bảo vệ người đang sửa. IC điều phối, không tự tay sửa.',
    },
    {
      front: 'Các vai trò hỗ trợ trong sự cố lớn?',
      back: 'Ops hoặc Tech lead dẫn dắt chẩn đoán kỹ thuật, Communications lead cập nhật stakeholder và status page, Scribe ghi timeline, SME cung cấp kiến thức sâu về hệ thống.',
    },
    {
      front: 'Bản cập nhật gửi stakeholder nên có gì?',
      back: 'Ảnh hưởng tới ai, hiện trạng và việc đang làm, thời điểm cập nhật tiếp theo, tên IC. Viết cho người không phải kỹ sư và gửi theo nhịp cố định kể cả khi chưa có tin mới.',
    },
    {
      front: 'Yếu tố của một lịch on-call công bằng?',
      back: 'Luân phiên đều có primary và secondary, đủ người, bàn giao cuối ca, nghỉ bù và phụ cấp, người mới shadow trước, và chỉ gọi người cho alert cần hành động ngay.',
    },
    {
      front: 'Runbook là gì và cần những phần nào?',
      back: 'Hướng dẫn từng bước xử lý một loại sự cố, được link từ alert: ảnh hưởng, dashboard, bước xác nhận, thu thập bằng chứng, giảm thiểu, khi nào escalate, liên hệ. Cần kiểm chứng trong game day.',
    },
    {
      front: 'Postmortem blameless nghĩa là gì?',
      back: 'Tập trung vào hệ thống và quy trình đã cho phép lỗi xảy ra, không quy lỗi cho cá nhân. Hỏi vì sao hệ thống cho phép một lệnh sai gây sập, thay vì ai đã chạy lệnh sai.',
    },
    {
      front: 'Khi nào nên bắt buộc viết postmortem?',
      back: 'Ví dụ: sự cố SEV1 hoặc SEV2, mất dữ liệu, phải can thiệp thủ công như rollback, thời gian khắc phục vượt ngưỡng, hoặc khách hàng phát hiện trước monitoring.',
    },
    {
      front: 'Action item tốt trong postmortem cần gì?',
      back: 'Cụ thể và kiểm chứng được, có người phụ trách, hạn và ticket, được ưu tiên như việc thật. Nên có đủ ba loại: ngăn chặn, phát hiện và giảm thiểu.',
    },
  ],
  troubleshooting: [
    {
      front: 'Phương pháp RED và USE là gì?',
      back: 'RED cho service: Rate (số request), Errors (số lỗi), Duration (thời gian xử lý). USE cho tài nguyên: Utilization (mức sử dụng), Saturation (mức bão hoà, hàng đợi), Errors (lỗi).',
    },
    {
      front: 'Dùng JFR làm hộp đen trên production thế nào?',
      back: 'Chạy ghi liên tục với -XX:StartFlightRecording=maxage=1h,disk=true để giữ dữ liệu một giờ gần nhất, khi có sự cố thì dump bằng jcmd <pid> JFR.dump. Phân tích bằng JDK Mission Control hoặc lệnh jfr.',
    },
    {
      front: 'Lệnh jcmd lấy thread dump và heap dump?',
      back: 'jcmd <pid> Thread.print -l cho thread dump kèm thông tin lock; jcmd <pid> GC.heap_dump <file> cho heap dump. Java 21 có Thread.dump_to_file -format=json để thấy cả virtual thread.',
    },
    {
      front: 'Arthas mạnh ở đâu và rủi ro gì?',
      back: 'Gắn vào JVM đang chạy để xem thread bận (thread -n), thời gian từng lời gọi con (trace), tham số và kết quả (watch). Nó sửa bytecode lúc runtime, nên giới hạn số lần bắt và chạy stop để gỡ khi xong.',
    },
    {
      front: 'Tìm thread trong top -H ở thread dump thế nào?',
      back: 'Đổi thread id thập phân sang hex, ví dụ printf \'%x\\n\' 12345 cho ra 3039, rồi tìm nid=0x3039 trong thread dump. Lấy nhiều dump cách nhau vài giây để chắc chắn.',
    },
    {
      front: 'Rủi ro khi lấy heap dump trên production?',
      back: 'JVM dừng trong lúc ghi, file có kích thước cỡ heap và chứa dữ liệu nhạy cảm. Rút instance khỏi load balancer, kiểm tra dung lượng đĩa và xử lý file như dữ liệu mật.',
    },
    {
      front: 'Retained heap khác shallow heap thế nào?',
      back: 'Shallow heap là kích thước của bản thân object. Retained heap là lượng bộ nhớ được giải phóng nếu object đó bị thu hồi. Dominator Tree của Eclipse MAT sắp xếp theo retained heap.',
    },
    {
      front: 'Pod bị OOMKilled với exit code 137 nghĩa là gì?',
      back: 'Kernel giết tiến trình vì tổng bộ nhớ vượt memory limit của container; heap có thể chưa đầy. Kiểm tra bộ nhớ ngoài heap bằng -XX:NativeMemoryTracking=summary và jcmd <pid> VM.native_memory summary.',
    },
    {
      front: 'Dấu hiệu cạn connection pool HikariCP?',
      back: 'hikaricp_connections_active bằng max, pending lớn hơn 0 kéo dài, timeout tăng; lỗi Connection is not available, request timed out after 30000ms; nhiều thread chờ ở HikariPool.getConnection.',
    },
    {
      front: 'leak-detection-threshold của Hikari dùng để làm gì?',
      back: 'Ngưỡng tính bằng mili giây: connection bị mượn lâu hơn ngưỡng sẽ được Hikari log kèm stack trace nơi mượn, giúp tìm chỗ quên đóng connection.',
    },
    {
      front: 'Đọc phần 4012M->3951M(4096M) trong GC log thế nào?',
      back: 'Heap đã dùng trước GC, sau GC và tổng heap. Full GC mà thu hồi rất ít nghĩa là phần lớn object vẫn còn sống: nghi memory leak hoặc heap quá nhỏ cho dữ liệu thật.',
    },
    {
      front: 'Khi nào dùng chế độ wall của async-profiler?',
      back: 'Khi request chậm nhưng CPU thấp. Chế độ wall-clock lấy mẫu cả các thread đang chờ IO hay lock, nên cho thấy thread đang chờ ở đâu, điều mà chế độ cpu không thấy.',
    },
  ],
  release: [
    {
      front: 'Deploy khác release thế nào?',
      back: 'Deploy là đưa một phiên bản code lên production, việc kỹ thuật. Release là làm cho tính năng có hiệu lực với người dùng, quyết định nghiệp vụ. Feature flag cho phép tách hai việc này.',
    },
    {
      front: 'Continuous delivery khác release train thế nào?',
      back: 'Continuous delivery: mọi thay đổi đã merge đều có thể lên production bất cứ lúc nào. Release train: phát hành theo lịch cố định, thay đổi nào sẵn sàng thì lên chuyến, chưa xong thì chờ chuyến sau.',
    },
    {
      front: 'Các nhóm thay đổi theo Keep a Changelog?',
      back: 'Added, Changed, Deprecated, Removed, Fixed, Security. Version mới nhất đặt ở trên, mục Unreleased chứa các thay đổi chưa phát hành.',
    },
    {
      front: 'Bốn loại feature toggle?',
      back: 'Release toggle ẩn tính năng chưa xong, sống ngắn; Experiment toggle cho A/B test; Ops toggle là kill switch khi quá tải; Permission toggle mở tính năng cho nhóm người dùng, sống lâu.',
    },
    {
      front: 'SDK Unleash đánh giá flag ở đâu?',
      back: 'SDK tải cấu hình flag về, lưu bản sao cục bộ và đánh giá ngay trong ứng dụng, nên mỗi lần kiểm tra flag không phát sinh lời gọi mạng.',
    },
    {
      front: 'Togglz khác Unleash thế nào?',
      back: 'Togglz nhẹ, chạy trong ứng dụng, khai báo flag bằng enum implement Feature và kiểm tra qua FeatureManager. Unleash có server riêng, quản lý flag tập trung cho nhiều service, có phân quyền và lịch sử.',
    },
    {
      front: 'Kỷ luật cần có khi dùng feature flag?',
      back: 'Mặc định an toàn khi không lấy được cấu hình, xoá release toggle sau khi mở 100%, đặt tên rõ có owner và ngày xoá, test cả nhánh bật và tắt.',
    },
    {
      front: 'Vì sao migration phải tương thích cả version N và N-1?',
      back: 'Rolling, canary hay blue-green khiến hai version cùng chạy trên một database, và khi rollback thì version cũ phải chạy được với schema mới.',
    },
    {
      front: 'Ba bước của expand/contract?',
      back: 'Expand: thêm cấu trúc mới, ghi cả hai, đọc cái cũ. Migrate: backfill dữ liệu, chuyển sang đọc cái mới, vẫn ghi cả hai. Contract: ngừng ghi cái cũ rồi xoá nó.',
    },
    {
      front: 'Tạo index trên bảng PostgreSQL lớn an toàn thế nào?',
      back: 'Dùng CREATE INDEX CONCURRENTLY để không khoá ghi. Lệnh này không chạy được trong transaction block, nên cấu hình migration đó chạy ngoài transaction.',
    },
    {
      front: 'Các cách rollback, xếp theo tốc độ?',
      back: 'Tắt feature flag mất vài giây; chuyển traffic blue-green hoặc huỷ canary mất vài giây đến vài phút; deploy lại artifact cũ mất vài phút; fix forward khi rollback không khả thi.',
    },
    {
      front: 'Kế hoạch rollback cần những gì?',
      back: 'Tiêu chí rollback đo được thống nhất trước, người quyết định, các bước thực hiện, xác nhận migration tương thích ngược, và điểm không thể quay lại nếu có.',
    },
  ],
  'sre-basics': [
    {
      front: 'SLI là gì và nên ở dạng nào?',
      back: 'Chỉ số đo được phản ánh chất lượng dịch vụ từ góc nhìn người dùng, nên ở dạng tỉ lệ: số sự kiện tốt chia số sự kiện hợp lệ.',
    },
    {
      front: 'SLO khác SLA thế nào?',
      back: 'SLO là mục tiêu nội bộ cho một SLI trong một cửa sổ thời gian. SLA là hợp đồng với khách hàng, có hậu quả khi vi phạm, và thường lỏng hơn SLO để có khoảng đệm.',
    },
    {
      front: 'Vì sao không đặt SLO 100%?',
      back: 'Người dùng không phân biệt được với mức rất cao vì mạng và thiết bị của họ kém tin cậy hơn; mỗi số 9 thêm vào tốn chi phí rất lớn; 100% nghĩa là không được thay đổi gì.',
    },
    {
      front: 'Error budget của SLO 99,9% trong 30 ngày, tính theo thời gian?',
      back: '0,1% của 43.200 phút, tức khoảng 43,2 phút không khả dụng được phép trong 30 ngày.',
    },
    {
      front: 'Vì sao tính error budget theo request thường chính xác hơn?',
      back: 'Cùng thời lượng sự cố nhưng giờ cao điểm ảnh hưởng nhiều người hơn giờ thấp điểm. Đếm request lỗi phản ánh đúng tác động lên người dùng.',
    },
    {
      front: 'Error budget policy là gì?',
      back: 'Thoả thuận trước với Product Owner về việc làm khi budget còn nhiều, tiêu nhanh hay đã hết. Ví dụ hết budget thì tạm dừng release tính năng, chỉ sửa lỗi và vá bảo mật.',
    },
    {
      front: 'Burn rate là gì?',
      back: 'Tốc độ tiêu error budget so với tốc độ vừa đủ hết đúng cuối cửa sổ SLO. Burn rate 1 hết đúng hạn; burn rate 10 hết sau một phần mười cửa sổ.',
    },
    {
      front: 'Ngưỡng burn rate gợi ý cho SLO 30 ngày?',
      back: 'Page khi tiêu 2% budget trong 1 giờ (burn rate 14,4) hoặc 5% trong 6 giờ (burn rate 6); tạo ticket khi tiêu 10% trong 3 ngày (burn rate 1). Mỗi alert kết hợp một cửa sổ dài và một cửa sổ ngắn.',
    },
    {
      front: 'Bốn chỉ số DORA chia thành hai nhóm nào?',
      back: 'Tốc độ: deployment frequency và lead time for changes. Ổn định: change failure rate và time to restore service, nay DORA gọi là failed deployment recovery time.',
    },
    {
      front: 'Vì sao dùng trung vị cho lead time và thời gian khôi phục?',
      back: 'Vài giá trị cực lớn, như một PR bị bỏ quên hai tháng, kéo trung bình lệch xa. Trung vị phản ánh trường hợp điển hình tốt hơn.',
    },
    {
      front: 'Sáu đặc điểm của toil theo Google SRE?',
      back: 'Thủ công, lặp đi lặp lại, tự động hoá được, mang tính đối phó tức thời, không tạo giá trị lâu dài, và tăng tuyến tính theo quy mô service.',
    },
    {
      front: 'Thứ tự ưu tiên khi giảm toil?',
      back: 'Loại bỏ nguyên nhân trước (sửa memory leak thay vì tự động restart), rồi tạo công cụ tự phục vụ, sau đó mới tự động hoá; đo lại thời gian toil sau khi làm.',
    },
  ],
};

export default flashcards;
