import type { LessonQuiz } from '../types';

const quiz: LessonQuiz = {
  styles: [
    {
      question: 'Dependency Rule của Clean Architecture phát biểu điều gì?',
      options: [
        'Mỗi tầng chỉ được gọi tầng ngay bên dưới nó',
        'Phụ thuộc trong mã nguồn chỉ được hướng vào các vòng bên trong, nơi chứa quy tắc nghiệp vụ',
        'Domain được phép phụ thuộc framework nếu framework đó ổn định',
        'Mọi module phải giao tiếp với nhau qua message broker',
      ],
      answer: 1,
      explanation:
        'Vòng trong (entities, use cases) không biết gì về vòng ngoài (web, DB, framework). Phát biểu "chỉ gọi tầng ngay bên dưới" là đặc điểm của layered với tầng đóng.',
    },
    {
      question:
        'Hệ thống bán vé concert có hàng trăm nghìn người truy cập đồng thời trong vài phút mở bán, tải rất khó dự đoán, database trung tâm là điểm nghẽn. Phong cách nào được thiết kế cho đúng tình huống này?',
      options: ['Pipeline architecture', 'Layered architecture', 'Space-based architecture', 'Microkernel architecture'],
      answer: 2,
      explanation:
        'Space-based đưa dữ liệu vào in-memory data grid replicate giữa các processing unit và ghi xuống database bất đồng bộ qua data pump, loại database khỏi đường xử lý đồng bộ.',
    },
    {
      question:
        'Mỗi đêm hệ thống đọc file hoá đơn của đối tác, chuẩn hoá, loại bản ghi lỗi rồi ghi vào kho dữ liệu. Phong cách nào mô tả tự nhiên nhất luồng này?',
      options: [
        'Pipeline (pipes and filters)',
        'Event-driven với mediator topology',
        'Microservices với saga',
        'Hexagonal architecture',
      ],
      answer: 0,
      explanation:
        'Dữ liệu chảy một chiều qua các filter producer, transformer, tester và consumer. Đây là bài toán điển hình của pipeline, ví dụ Spring Batch hay ETL.',
    },
    {
      question:
        'Bạn muốn áp dụng quy tắc ArchUnit cho một codebase cũ đang có hàng trăm vi phạm, nhưng không muốn chặn build của cả đội ngay. Cách phù hợp là gì?',
      options: [
        'Đánh dấu @Disabled cho test kiến trúc cho đến khi sửa hết vi phạm',
        'Chỉ chạy test kiến trúc thủ công trước mỗi đợt release',
        'Viết rule lỏng hơn để không còn vi phạm nào',
        'Bọc rule bằng FreezingArchRule.freeze(rule) để chỉ báo lỗi với vi phạm mới',
      ],
      answer: 3,
      explanation:
        'FreezingArchRule ghi lại các vi phạm hiện có và chỉ làm test thất bại khi xuất hiện vi phạm mới, giúp áp dụng fitness function dần dần.',
    },
    {
      question: 'Trường hợp nào ít phù hợp nhất với kiến trúc serverless (FaaS)?',
      options: [
        'Tạo ảnh thumbnail mỗi khi người dùng upload ảnh',
        'Webhook nhận vài trăm sự kiện mỗi ngày từ đối tác',
        'Service xử lý tải cao đều đặn suốt ngày, yêu cầu độ trễ thấp ổn định và có tác vụ chạy hàng giờ',
        'Job dọn dẹp dữ liệu tạm chạy mỗi giờ một lần',
      ],
      answer: 2,
      explanation:
        'Serverless hợp với tải thất thường và xử lý theo sự kiện. Tải cao đều đặn thường rẻ hơn khi chạy container, còn tác vụ dài có thể vượt giới hạn thời gian và cold start ảnh hưởng độ trễ.',
    },
  ],
  'quality-attributes': [
    {
      question:
        'Trong kịch bản "Người dùng gửi yêu cầu thanh toán lúc cao điểm 2.000 request/giây, checkout API xử lý với p99 dưới 800ms", phần "p99 dưới 800ms" thuộc thành phần nào?',
      options: ['Stimulus', 'Environment', 'Artifact', 'Response measure'],
      answer: 3,
      explanation:
        'Response measure là thước đo kiểm chứng được của phản hồi. Mức tải 2.000 request/giây là environment, còn yêu cầu thanh toán là stimulus.',
    },
    {
      question:
        'Một request phải đi qua lần lượt ba thành phần, mỗi thành phần có availability 99,9% và hỏng độc lập. Availability của cả luồng xấp xỉ bao nhiêu?',
      options: ['99,9%', '99,7%', '99,97%', '99,99%'],
      answer: 1,
      explanation: 'Thành phần nối tiếp nhân với nhau: 0,999³ ≈ 0,997, tức khoảng 99,7%, thấp hơn từng thành phần.',
    },
    {
      question:
        'Chạy hai instance song song, mỗi instance có availability 99% và hỏng hoàn toàn độc lập, chỉ cần một instance sống. Availability lý thuyết là bao nhiêu?',
      options: ['98%', '99,5%', '99,99%', '99,9999%'],
      answer: 2,
      explanation:
        'A = 1 - (1 - 0,99)² = 1 - 0,0001 = 99,99%. Thực tế thấp hơn vì các bản sao thường hỏng cùng lúc do chung zone, chung bản deploy.',
    },
    {
      question: 'Ứng dụng có 20 triệu DAU, mỗi người tạo 5 bản ghi mỗi ngày. QPS ghi trung bình xấp xỉ bao nhiêu?',
      options: ['Khoảng 120', 'Khoảng 1.200', 'Khoảng 12.000', 'Khoảng 115.000'],
      answer: 1,
      explanation: '20 triệu × 5 = 100 triệu bản ghi mỗi ngày; chia 86.400 giây ≈ 1.160, làm tròn khoảng 1.200 QPS.',
    },
    {
      question:
        'Bạn kiểm thử tải một API công khai và muốn request đến theo tốc độ cố định bất kể hệ thống phản hồi nhanh hay chậm. Executor nào của k6 phù hợp?',
      options: ['constant-vus', 'ramping-vus', 'per-vu-iterations', 'constant-arrival-rate'],
      answer: 3,
      explanation:
        'constant-arrival-rate (và ramping-arrival-rate) là mô hình mở. Các executor dựa trên số VU là mô hình đóng: khi hệ thống chậm, tải tự giảm và che giấu vấn đề.',
    },
  ],
  scalability: [
    {
      question:
        'Bạn cần định tuyến /api/** tới backend và /static/** tới server file tĩnh, đồng thời kết thúc TLS tại load balancer. Loại load balancer nào cần dùng?',
      options: [
        'Load balancer L7 vì cần đọc nội dung HTTP như path',
        'Load balancer L4 vì nhanh hơn',
        'DNS round robin',
        'Load balancer L4 kết hợp sticky session',
      ],
      answer: 0,
      explanation:
        'Định tuyến theo path và kết thúc TLS đòi hỏi hiểu giao thức HTTP, tức tầng 7. L4 chỉ thấy IP và cổng.',
    },
    {
      question:
        'Order-service autoscale từ 10 lên 30 instance, mỗi instance có HikariCP pool 20 kết nối, PostgreSQL cho tối đa 500 kết nối. Rủi ro chính khi tải đỉnh là gì?',
      options: [
        'Load balancer không phân phối được cho hơn 20 instance',
        'Tổng 600 kết nối vượt giới hạn của database, các instance mới không lấy được kết nối',
        'JVM của mỗi instance sẽ dùng ít bộ nhớ hơn nên GC chạy chậm',
        'Session của người dùng sẽ được chia đều nên không có rủi ro',
      ],
      answer: 1,
      explanation:
        'Scale ngang tầng ứng dụng nhân số kết nối tới database: 30 × 20 = 600 > 500. Cần tính trước, giới hạn autoscale hoặc dùng connection pooler như PgBouncer.',
    },
    {
      question:
        'Giới hạn 100 request/phút bằng fixed window. Một client gửi 100 request lúc 10:00:59 và 100 request lúc 10:01:00. Điều gì xảy ra và cách khắc phục?',
      options: [
        'Chỉ 100 request đầu được nhận; fixed window đã xử lý đúng',
        'Toàn bộ 200 request bị từ chối; cần tăng giới hạn',
        'Cả 200 request lọt qua trong khoảng 1 giây; dùng sliding window để tránh lỗ hổng ở ranh giới',
        'Request thứ 101 bị đưa vào hàng đợi; đây là hành vi của leaky bucket',
      ],
      answer: 2,
      explanation:
        'Hai khung cố định liền nhau đều còn đủ hạn mức nên gần gấp đôi giới hạn lọt qua tại ranh giới. Sliding window log hoặc sliding window counter khắc phục điều này.',
    },
    {
      question: 'Cụm etcd dùng Raft có 5 node. Cụm vẫn bầu được leader và commit được dữ liệu khi tối đa bao nhiêu node bị lỗi?',
      options: ['1 node', '2 node', '3 node', '4 node'],
      answer: 1,
      explanation: 'Raft cần quorum đa số: 5 node cần 3 node sống, nên chịu được 2 node lỗi. Tổng quát, 2f+1 node chịu được f lỗi.',
    },
    {
      question:
        'Tiến trình A giữ lock Redis có TTL 30 giây thì bị GC pause 40 giây; tiến trình B lấy được lock và ghi dữ liệu; A tỉnh lại và cũng ghi. Cơ chế nào ngăn được A ghi đè?',
      options: [
        'Tăng TTL của lock lên 5 phút',
        'Dùng Redis cluster thay vì Redis đơn',
        'Gọi lock.unlock() trong khối finally',
        'Fencing token tăng dần, tầng lưu trữ từ chối thao tác mang token cũ hơn token đã thấy',
      ],
      answer: 3,
      explanation:
        'Tăng TTL chỉ thu hẹp chứ không loại bỏ khả năng pause dài hơn TTL. Fencing token cho phép tầng dữ liệu nhận ra A đang dùng lock đã hết hạn.',
    },
  ],
  'case-studies': [
    {
      question:
        'URL shortener cần thống kê đầy đủ mọi lượt nhấn vào mã ngắn. Nên trả mã chuyển hướng HTTP nào và vì sao?',
      options: [
        '302, vì trình duyệt không cache vĩnh viễn nên mọi lượt nhấn đều đi qua server',
        '301, vì nhanh hơn và vẫn ghi nhận được mọi lượt nhấn',
        '200 kèm thẻ meta refresh để trình duyệt tự chuyển',
        '404 rồi để client tự tra URL gốc qua API',
      ],
      answer: 0,
      explanation:
        '301 là chuyển hướng vĩnh viễn nên trình duyệt có thể cache, những lần nhấn sau không tới server và mất thống kê. 302 giữ server trong vòng lặp với cái giá là tải cao hơn.',
    },
    {
      question:
        'Trong news feed dùng fan-out on write, một tài khoản có 20 triệu follower đăng bài. Cách xử lý phổ biến là gì?',
      options: [
        'Vẫn ghi bài vào feed của 20 triệu follower ngay lập tức trong request đăng bài',
        'Chặn tài khoản lớn đăng bài vào giờ cao điểm',
        'Hybrid: không fan-out cho tài khoản lớn, feed service kéo bài của họ khi người dùng đọc feed rồi gộp lại',
        'Chuyển toàn bộ hệ thống sang fan-out on read cho mọi người dùng',
      ],
      answer: 2,
      explanation:
        'Push cho tài khoản thường giữ đọc nhanh, pull cho celebrity tránh khuếch đại ghi hàng triệu lần. Chuyển toàn bộ sang pull làm mọi lượt đọc feed trở nên đắt.',
    },
    {
      question:
        'Checkout gọi PSP để tạo giao dịch nhưng bị timeout, không nhận được phản hồi. Hệ thống nên xử lý thế nào?',
      options: [
        'Đánh dấu thanh toán thất bại và cho khách bấm thanh toán lại ngay',
        'Đánh dấu thanh toán thành công để không làm phiền khách',
        'Huỷ đơn và nhả hàng ngay lập tức',
        'Coi trạng thái là chưa biết, truy vấn lại PSP bằng idempotency key hoặc chờ webhook và đối soát',
      ],
      answer: 3,
      explanation:
        'Timeout không có nghĩa là thất bại: PSP có thể đã trừ tiền. Cho khách trả lại có thể gây trừ tiền hai lần; phải xác minh trạng thái thật từ PSP.',
    },
    {
      question:
        'Trong khung 4 bước, sau khi đã làm rõ yêu cầu và thống nhất thiết kế tổng thể với người phỏng vấn, bạn nên làm gì tiếp theo?',
      options: [
        'Vẽ lại sơ đồ tổng thể với nhiều dịch vụ cloud hơn',
        'Đi sâu vào 2 đến 3 phần khó hoặc rủi ro nhất, nêu phương án và trade-off',
        'Liệt kê toàn bộ API của hệ thống kèm mã lỗi',
        'Chuyển sang viết code cho thành phần đầu tiên',
      ],
      answer: 1,
      explanation:
        'Bước 3 là deep dive: mô hình dữ liệu, điểm nóng, nhất quán, xử lý lỗi. Đây là phần cho thấy rõ nhất khả năng cân nhắc đánh đổi.',
    },
    {
      question:
        'Bạn đọc một bài engineering blog mô tả giải pháp cho hàng trăm triệu người dùng. Câu hỏi quan trọng nhất cần tự trả lời trước khi áp dụng là gì?',
      options: [
        'Công ty đó dùng ngôn ngữ lập trình gì',
        'Bài viết có bao nhiêu sơ đồ',
        'Vấn đề và ràng buộc của họ có giống hệ thống của mình về quy mô và bối cảnh không',
        'Giải pháp đó có dùng công nghệ mới nhất không',
      ],
      answer: 2,
      explanation:
        'Giải pháp cho quy mô cực lớn thường là quá mức cần thiết cho hệ thống nhỏ hơn hàng trăm lần. Giá trị nằm ở cách suy luận, và phải kiểm tra tính phù hợp với bối cảnh của mình.',
    },
  ],
};

export default quiz;
