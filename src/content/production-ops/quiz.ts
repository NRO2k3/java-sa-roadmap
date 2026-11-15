import type { LessonQuiz } from '../types';

const quiz: LessonQuiz = {
  incident: [
    {
      question:
        'Lúc 2 giờ sáng, alert báo 40% request thanh toán lỗi, bắt đầu ngay sau bản deploy lúc 1 giờ 45. Bạn đang on-call. Sau khi xác nhận alert, việc nên làm đầu tiên là gì?',
      options: [
        'Mở code của bản deploy để tìm chính xác dòng gây lỗi trước khi làm gì khác',
        'Khai báo sự cố mức cao và giảm thiểu bằng rollback bản deploy, điều tra sau',
        'Ghi lại hiện tượng rồi đợi đến sáng để cả team cùng xem xét kỹ hơn',
        'Bắt đầu viết postmortem ngay khi các chi tiết vẫn còn nhớ rõ',
      ],
      answer: 1,
      explanation:
        'Nguyên tắc là giảm thiểu trước, tìm nguyên nhân sau. Lỗi xuất hiện ngay sau deploy nên rollback là cách nhanh nhất để khôi phục dịch vụ cho người dùng.',
    },
    {
      question: 'Trong một sự cố SEV1, Incident Commander nên làm gì?',
      options: [
        'Tự đọc log và sửa lỗi, vì IC thường là người giỏi kỹ thuật nhất',
        'Chỉ cập nhật status page, không tham gia các quyết định kỹ thuật',
        'Điều phối, phân công, ra quyết định và giữ nhịp truyền thông',
        'Chờ quản lý cấp cao có mặt để đưa ra mọi quyết định quan trọng',
      ],
      answer: 2,
      explanation:
        'IC điều phối chứ không tự tay sửa. Khi IC lao vào debug, không còn ai nắm bức tranh tổng thể, phân công và cập nhật cho stakeholder.',
    },
    {
      question: 'Bạn chưa chắc sự cố đang xảy ra là SEV2 hay SEV3. Theo nguyên tắc phân loại, nên làm gì?',
      options: [
        'Chọn SEV3 để tránh làm phiền nhiều người vào lúc này',
        'Chờ thêm 30 phút xem tình hình có tệ hơn hay không',
        'Chưa khai báo gì cho đến khi tìm ra nguyên nhân gốc',
        'Chọn SEV2, rồi hạ mức sau khi đã hiểu rõ ảnh hưởng',
      ],
      answer: 3,
      explanation:
        'Nghi ngờ thì chọn mức cao hơn: hạ mức sau thì dễ, còn nâng mức muộn nghĩa là đã mất thời gian huy động người.',
    },
    {
      question: 'Action item nào trong postmortem được viết tốt nhất?',
      options: [
        'Thêm alert khi pool pending > 0 trong 5 phút, có owner, hạn và ticket',
        'Cải thiện monitoring và alerting cho order-service trong thời gian tới',
        'Nhắc mọi người cẩn thận hơn mỗi khi deploy lên môi trường production',
        'Tìm hiểu thêm về connection pool khi team có thời gian rảnh rỗi',
      ],
      answer: 0,
      explanation:
        'Action item tốt phải cụ thể, kiểm chứng được, có người phụ trách, hạn và ticket. "Cẩn thận hơn" đổ trách nhiệm lên con người thay vì cải thiện hệ thống.',
    },
    {
      question:
        'Một alert gọi on-call dậy lúc 3 giờ sáng vài lần mỗi tuần, nhưng lần nào người trực cũng chỉ xác nhận rồi ngủ tiếp vì không cần làm gì. Nên xử lý alert này thế nào?',
      options: [
        'Giữ nguyên, vì có nhiều alert thì hệ thống càng an toàn hơn',
        'Sửa hoặc xoá alert, vì alert gọi người dậy phải cần hành động ngay',
        'Chuyển alert sang cho người trực phụ để người trực chính được nghỉ',
        'Tăng tần suất gửi alert để người trực chú ý đến nó nhiều hơn',
      ],
      answer: 1,
      explanation:
        'Alert không cần hành động gây mệt mỏi và khiến người trực quen phớt lờ, kể cả với alert quan trọng. Chỉ nên gọi người cho vấn đề ảnh hưởng người dùng và cần xử lý ngay.',
    },
  ],
  troubleshooting: [
    {
      question:
        'top -H -p <pid> cho thấy thread có id 12345 dùng 98% CPU. Trong thread dump, bạn nên tìm chuỗi nào để xác định thread đó?',
      options: ['tid=12345', '#12345', 'nid=12345', 'nid=0x3039'],
      answer: 3,
      explanation:
        'nid trong thread dump là id thread của hệ điều hành ở dạng hex; 12345 thập phân là 0x3039. Dùng printf \'%x\\n\' 12345 để đổi.',
    },
    {
      question:
        'GC log lặp lại nhiều dòng: Pause Full (G1 Compaction Pause) 4012M->3951M(4096M) 2873.456ms. Kết luận hợp lý nhất là gì?',
      options: [
        'GC đang hoạt động tốt vì nó đã dọn dẹp được một phần heap',
        'Nên giảm kích thước heap để mỗi lần GC chạy nhanh hơn',
        'Heap gần như toàn object sống: nghi leak hoặc heap quá nhỏ',
        'Đây là young GC bình thường, không cần xử lý gì thêm',
      ],
      answer: 2,
      explanation:
        'Full GC dừng ứng dụng gần 3 giây mà chỉ thu hồi khoảng 60 MB, nghĩa là phần lớn heap vẫn đang được tham chiếu. Cần tìm ai đang giữ bộ nhớ trước khi chỉnh GC.',
    },
    {
      question:
        'Thread dump: nhiều thread chờ ở HikariPool.getConnection, các thread còn lại RUNNABLE trong RestTemplate.doExecute bên trong OrderService.placeOrder có @Transactional. Nguyên nhân khả dĩ nhất?',
      options: [
        'Gọi HTTP chậm trong transaction giữ connection lâu, làm cạn pool',
        'Database đang quá tải CPU nên mọi câu query đều chậm bất thường',
        'maximumPoolSize quá nhỏ, chỉ cần tăng lên 100 là giải quyết xong',
        'Có deadlock giữa các thread HTTP đang chờ lock của nhau',
      ],
      answer: 0,
      explanation:
        'Thread đang giữ connection thực ra đang chờ socket HTTP, nên thủ phạm là lời gọi remote trong transaction, không phải DB. Tăng pool chỉ chuyển áp lực sang DB mà không sửa gốc.',
    },
    {
      question: 'Bạn cần lấy heap dump của một instance đang nhận traffic trên production. Bước chuẩn bị quan trọng nhất là gì?',
      options: [
        'Tăng log level lên DEBUG để có thêm thông tin trong lúc dump',
        'Rút instance khỏi load balancer, kiểm tra đĩa, bảo mật file',
        'Bật Arthas watch trên mọi method để ghi lại trạng thái trước khi dump',
        'Restart instance trước cho heap sạch sẽ rồi mới bắt đầu dump',
      ],
      answer: 1,
      explanation:
        'Heap dump dừng JVM trong lúc ghi, tạo file cỡ heap và chứa dữ liệu nhạy cảm. Restart trước khi dump sẽ xoá mất chính bằng chứng cần tìm.',
    },
    {
      question:
        'Pod bị Kubernetes kill với lý do OOMKilled (exit code 137), log không có OutOfMemoryError và heap chỉ dùng khoảng 60%. Hướng điều tra hợp lý?',
      options: [
        'Tăng -Xmx lên bằng đúng memory limit của container',
        'Bật HeapDumpOnOutOfMemoryError để có heap dump lần sau',
        'Xem bộ nhớ ngoài heap bằng Native Memory Tracking',
        'Chuyển từ G1 sang Serial GC để tiết kiệm bộ nhớ hơn',
      ],
      answer: 2,
      explanation:
        'Kernel kill tiến trình vì tổng bộ nhớ vượt limit, trong khi heap chưa đầy, nên vấn đề nằm ngoài heap. HeapDumpOnOutOfMemoryError không giúp được vì JVM không hề ném OOM; tăng Xmx bằng limit còn làm tình hình tệ hơn.',
    },
  ],
  release: [
    {
      question: 'Cần đổi tên cột customer_name thành full_name trên service chạy rolling deployment. Bước đầu tiên đúng là gì?',
      options: [
        'Chạy ALTER TABLE RENAME COLUMN cùng lúc với bản deploy code mới',
        'Thêm cột full_name cho phép NULL; code ghi cả hai cột, vẫn đọc cột cũ',
        'Xoá cột cũ rồi tạo cột mới ngay trong cùng một file migration',
        'Dừng toàn bộ service, đổi tên cột rồi deploy lại toàn bộ instance',
      ],
      answer: 1,
      explanation:
        'Theo expand/contract, bước expand thêm cấu trúc mới bên cạnh cái cũ để version cũ và mới cùng chạy được. Đổi tên trực tiếp làm các instance version cũ lỗi ngay trong lúc rolling deploy.',
    },
    {
      question: 'Flag dùng để tắt nhanh tính năng gợi ý sản phẩm tốn tài nguyên khi hệ thống quá tải thuộc loại nào?',
      options: ['Release toggle', 'Experiment toggle', 'Ops toggle', 'Permission toggle'],
      answer: 2,
      explanation:
        'Ops toggle giúp đội vận hành giảm tải bằng cách tắt tính năng tốn tài nguyên, và có thể tồn tại lâu dài. Release toggle chỉ dùng để ẩn tính năng chưa xong và nên xoá sớm.',
    },
    {
      question: 'Khi cấu hình gradual rollout 10% cho một flag trong Unleash, stickiness theo userId nhằm mục đích gì?',
      options: [
        'Mỗi request được chọn ngẫu nhiên để phân tải đều cho hai phiên bản',
        'Chỉ 10% số instance của service bật flag, phần còn lại tắt',
        'Flag tự động bật 100% sau khi đủ 10% người dùng đã dùng thử',
        'Cùng một người dùng luôn nhận cùng kết quả bật hoặc tắt',
      ],
      answer: 3,
      explanation:
        'Stickiness đảm bảo một người dùng không bị nhảy qua lại giữa hành vi cũ và mới giữa các request. Tỉ lệ 10% tính theo người dùng chứ không theo instance.',
    },
    {
      question:
        'Release mới có migration chỉ thêm một cột nullable. Sau deploy, tỉ lệ lỗi 5xx vượt tiêu chí rollback đã thống nhất. Cách quay lại phù hợp nhất?',
      options: [
        'Deploy lại artifact version trước, bản cũ chạy được với cột mới',
        'Chạy script xoá cột mới trước, sau đó mới deploy lại bản cũ',
        'Restore toàn bộ database từ bản backup đêm qua rồi deploy bản cũ',
        'Chờ fix forward, vì không thể rollback khi đã chạy migration',
      ],
      answer: 0,
      explanation:
        'Migration tương thích ngược nên version cũ bỏ qua cột mới và chạy bình thường. Restore backup hay xoá cột vừa chậm vừa có nguy cơ mất dữ liệu ghi sau thời điểm migrate.',
    },
    {
      question: 'Điểm khác biệt chính giữa release note và changelog là gì?',
      options: [
        'Release note sinh tự động từ git log, còn changelog phải viết tay',
        'Changelog chỉ dùng cho app mobile, release note dùng cho web service',
        'Release note chỉ cần viết khi có thay đổi phá vỡ tương thích ngược',
        'Release note cho người dùng; changelog cho developer theo version',
      ],
      answer: 3,
      explanation:
        'Release note dùng ngôn ngữ nghiệp vụ để nói thay đổi gì với người dùng. Changelog liệt kê các thay đổi đáng chú ý theo từng version cho người phát triển và tích hợp.',
    },
  ],
  'sre-basics': [
    {
      question: 'SLO availability 99,9% tính theo request. Trong 30 ngày service nhận 50 triệu request. Error budget là bao nhiêu request lỗi?',
      options: ['43.200', '5.000', '500.000', '50.000'],
      answer: 3,
      explanation:
        'Error budget bằng 0,1% của 50.000.000, tức 50.000 request. Con số 43.200 là số phút trong 30 ngày, dùng cho cách tính theo thời gian.',
    },
    {
      question: 'Với SLO tính trên cửa sổ 30 ngày, burn rate hiện tại là 10. Nếu giữ nguyên tốc độ này, error budget sẽ hết sau khoảng bao lâu?',
      options: ['10 ngày', '30 ngày', '3 ngày', '1 ngày'],
      answer: 2,
      explanation:
        'Burn rate 1 tiêu hết budget đúng trong 30 ngày, nên burn rate 10 tiêu hết trong khoảng 30 / 10 = 3 ngày.',
    },
    {
      question: 'SLI nào phù hợp nhất cho API thanh toán của một sản phẩm thương mại điện tử?',
      options: [
        'Tỉ lệ request không lỗi 5xx và dưới 500 ms, đo tại gateway',
        'Mức CPU trung bình của các pod luôn được giữ dưới 70%',
        'Số pod đang chạy so với số pod mong muốn trong deployment',
        'Phần trăm heap JVM còn trống sau mỗi lần GC chạy xong',
      ],
      answer: 0,
      explanation:
        'SLI nên phản ánh trải nghiệm người dùng dưới dạng tỉ lệ sự kiện tốt trên sự kiện hợp lệ và đo gần người dùng. CPU hay heap là chỉ số tài nguyên, người dùng không trực tiếp cảm nhận.',
    },
    {
      question: 'Lãnh đạo muốn xếp hạng các team theo deployment frequency và thưởng cho team đứng đầu. Rủi ro chính là gì?',
      options: [
        'Deployment frequency không thể đo tự động từ dữ liệu của pipeline CI/CD',
        'Chỉ số DORA chỉ áp dụng được cho các team đang dùng Kubernetes',
        'Team sẽ tối ưu con số thay vì kết quả, ví dụ chia nhỏ deploy vô nghĩa',
        'Deployment frequency cao luôn làm change failure rate tăng theo',
      ],
      answer: 2,
      explanation:
        'Khi chỉ số thành mục tiêu, người ta tối ưu chỉ số thay vì kết quả (định luật Goodhart). Nghiên cứu DORA cũng cho thấy tốc độ và ổn định không nhất thiết đánh đổi nhau.',
    },
    {
      question: 'Việc nào sau đây là toil theo định nghĩa của Google SRE?',
      options: [
        'Họp lập kế hoạch sprint mỗi hai tuần cùng Product Owner',
        'Mỗi sáng chạy tay lại batch job bị lỗi theo cùng các bước',
        'Viết design doc cho hệ thống thanh toán mới của công ty',
        'Phỏng vấn ứng viên để tuyển thêm người cho team backend',
      ],
      answer: 1,
      explanation:
        'Toil là việc thủ công, lặp lại, tự động hoá được, không tạo giá trị lâu dài và tăng theo quy mô. Họp hay tuyển dụng là overhead; viết design doc là công việc kỹ thuật có giá trị lâu dài.',
    },
  ],
};

export default quiz;
