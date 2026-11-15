import type { LessonQuiz } from '../types';

const quiz: LessonQuiz = {
  ddd: [
    {
      question:
        'Catalog, Inventory và Shipping đều nói về "sản phẩm" nhưng mỗi bên cần các thuộc tính khác nhau. Cách mô hình hoá phù hợp với DDD là gì?',
      options: [
        'Tạo một class Product dùng chung trong thư viện common cho cả ba bộ phận',
        'Mỗi bounded context có model Product riêng, liên kết với nhau qua định danh chung như SKU',
        'Dùng chung một bảng products và để mỗi bộ phận tự thêm cột cần thiết',
        'Tách ba microservice nhưng cho cả ba cùng đọc ghi một schema để tránh trùng dữ liệu',
      ],
      answer: 1,
      explanation:
        'Mỗi bounded context có model và ngôn ngữ nhất quán riêng, chỉ chứa những gì nó cần. Model dùng chung khiến mọi team sửa cùng một chỗ và thay đổi của bên này làm vỡ bên kia.',
    },
    {
      question:
        'Context Ordering phải lấy thông tin khách hàng từ một ERP cũ có mã trường khó hiểu (KH_MA, LOAI_KH) và không thể sửa ERP. Mẫu context map nào phù hợp nhất?',
      options: [
        'Shared kernel giữa Ordering và ERP',
        'Conformist: dùng nguyên model của ERP trong Ordering',
        'Anti-corruption layer: lớp dịch từ model ERP sang model của Ordering',
        'Partnership: hai team cùng thay đổi model ERP theo kế hoạch chung',
      ],
      answer: 2,
      explanation:
        'ACL bảo vệ model của downstream khỏi model kém của upstream; khi thay ERP chỉ phải viết lại lớp dịch. Conformist chỉ hợp khi model upstream đủ tốt để dùng nguyên.',
    },
    {
      question:
        'Khi đặt đơn, hệ thống cần chuyển Order sang PLACED và cộng điểm thưởng cho Customer, hai thứ thuộc hai aggregate khác nhau. Cách làm đúng tinh thần DDD là gì?',
      options: [
        'Lưu Order trong một transaction, phát domain event OrderPlaced để phần điểm thưởng xử lý trong transaction riêng',
        'Đưa danh sách orders vào aggregate Customer để cập nhật cả hai trong một lần save',
        'Sửa cả Order và Customer trong cùng một transaction để đảm bảo nhất quán tức thời',
        'Cho Order giữ tham chiếu object tới Customer và gọi customer.addPoints() bên trong order.place()',
      ],
      answer: 0,
      explanation:
        'Quy tắc là một transaction chỉ sửa một aggregate, các aggregate tham chiếu nhau bằng ID và nhất quán dần qua domain event. Gộp orders vào Customer tạo aggregate quá lớn và tranh chấp khoá.',
    },
    {
      question: 'Trong một buổi Event Storming, tờ giấy màu cam với nội dung "Đơn hàng đã được đặt" biểu diễn gì?',
      options: [
        'Một command do người dùng gửi',
        'Một policy phản ứng tự động',
        'Một read model hiển thị cho người dùng',
        'Một domain event, sự việc nghiệp vụ đã xảy ra',
      ],
      answer: 3,
      explanation:
        'Màu cam là domain event, viết ở thì quá khứ. Command là màu xanh dương, policy màu tím, read model màu xanh lá.',
    },
    {
      question:
        'Một team 6 người xây sản phẩm mới, ranh giới nghiệp vụ còn thay đổi hằng tháng, chưa có nền tảng observability. Theo bài học, lựa chọn hợp lý nhất là gì?',
      options: [
        'Tách ngay mỗi entity thành một microservice để sau này khỏi phải tách',
        'Modular monolith với Spring Modulith, kiểm tra ranh giới module bằng ApplicationModules.verify()',
        'Microservices dùng chung một database để giảm độ phức tạp nhất quán dữ liệu',
        'Một monolith không chia module vì kiến trúc sẽ được làm lại khi có nhiều người dùng',
      ],
      answer: 1,
      explanation:
        'Khi ranh giới chưa ổn định và năng lực vận hành hạn chế, modular monolith cho ranh giới rõ ràng mà không phải trả giá của hệ phân tán. verify() bắt vòng phụ thuộc và truy cập phần internal của module khác.',
    },
  ],
  'spring-cloud': [
    {
      question: 'Trong cấu hình route của Spring Cloud Gateway, giá trị uri: lb://order-service có nghĩa là gì?',
      options: [
        'Gửi request tới hostname order-service qua DNS công cộng',
        'Tra cứu các instance của order-service qua discovery và chọn một instance bằng load balancer phía client',
        'Chuyển request tới một load balancer phần cứng tên order-service',
        'Bật chế độ long-polling giữa gateway và order-service',
      ],
      answer: 1,
      explanation:
        'Tiền tố lb:// yêu cầu gateway dùng Spring Cloud LoadBalancer để lấy danh sách instance từ discovery (Eureka, Consul, Kubernetes) và chọn một instance, mặc định theo round-robin.',
    },
    {
      question:
        'Route có predicate Path=/api/orders/** và filter StripPrefix=1. Request GET /api/orders/42 sẽ được chuyển tới service đích với path nào?',
      options: ['/api/orders/42', '/42', '/orders/42', '/api/42'],
      answer: 2,
      explanation: 'StripPrefix=1 bỏ đi một đoạn path đầu tiên là /api, nên path chuyển tiếp là /orders/42.',
    },
    {
      question:
        'Hệ thống chạy hoàn toàn trên Kubernetes, các service chỉ cần gọi nhau qua HTTP với cân bằng tải cơ bản. Lựa chọn service discovery hợp lý nhất là gì?',
      options: [
        'Dựng thêm cụm Eureka và bắt mọi service đăng ký vào đó',
        'Cấu hình cứng địa chỉ IP của pod trong application.yml',
        'Dùng Spring Cloud Config để phát danh sách IP cho mọi service',
        'Dùng tên DNS của Kubernetes Service, ví dụ http://inventory-service:8080',
      ],
      answer: 3,
      explanation:
        'Kubernetes Service đã cung cấp tên DNS ổn định và phân phối kết nối tới pod đang sẵn sàng. Thêm Eureka chỉ tạo hai cơ chế discovery chồng nhau.',
    },
    {
      question:
        'Bạn đổi một ngưỡng trong repo Git của Config Server. Cách nào để bean @ConfigurationProperties ở mọi instance nhận giá trị mới mà không restart?',
      options: [
        'Gọi POST /actuator/busrefresh khi có Spring Cloud Bus, hoặc POST /actuator/refresh trên từng instance',
        'Xoá cache trình duyệt của người dùng',
        'Gọi GET /actuator/health trên Config Server',
        'Đổi spring.application.name rồi chờ client tự phát hiện',
      ],
      answer: 0,
      explanation:
        'Refresh làm nạp lại bean @RefreshScope và rebind @ConfigurationProperties. Spring Cloud Bus phát tín hiệu refresh tới tất cả instance qua Kafka hoặc RabbitMQ.',
    },
    {
      question:
        'Service dùng RestClient.Builder có @LoadBalanced để gọi https://api.partner.vn/rates và luôn bị lỗi không tìm thấy instance. Nguyên nhân hợp lý nhất là gì?',
      options: [
        'Đối tác chặn mọi request có header traceparent',
        'Load balancer coi api.partner.vn là service ID và tìm nó trong discovery nhưng không có',
        'RestClient không hỗ trợ HTTPS',
        'Cần thêm @EnableFeignClients thì RestClient mới gọi được ra ngoài',
      ],
      answer: 1,
      explanation:
        'Client có @LoadBalanced phân giải hostname như tên service trong registry. Gọi API bên ngoài cần một builder riêng không gắn @LoadBalanced.',
    },
  ],
  resilience: [
    {
      question:
        'Retry cấu hình max-attempts: 3, wait-duration: 200ms, enable-exponential-backoff: true, exponential-backoff-multiplier: 2 (chưa tính jitter). Nếu mọi lần đều lỗi, chuyện gì xảy ra?',
      options: [
        'Gọi 4 lần, chờ 200ms, 400ms, 800ms',
        'Gọi 3 lần, chờ 200ms giữa mọi lần',
        'Gọi 3 lần, chờ 200ms trước lần thứ hai và 400ms trước lần thứ ba',
        'Gọi 2 lần, chờ 400ms',
      ],
      answer: 2,
      explanation:
        'max-attempts tính cả lần gọi đầu nên tổng cộng 3 lần. Thời gian chờ nhân 2 sau mỗi lần: 200ms rồi 400ms.',
    },
    {
      question: 'Vì sao nên thêm jitter vào exponential backoff khi retry?',
      options: [
        'Để thời gian chờ luôn ngắn hơn timeout của phụ thuộc',
        'Để tránh nhiều client retry đồng loạt cùng nhịp, tạo các đợt tải dồn dập vào phụ thuộc đang yếu',
        'Để Resilience4j bỏ qua các lỗi không idempotent',
        'Để circuit breaker chuyển sang HALF_OPEN nhanh hơn',
      ],
      answer: 1,
      explanation:
        'Không có jitter, hàng loạt client lỗi cùng lúc sẽ retry cùng thời điểm (thundering herd). Yếu tố ngẫu nhiên trải đều các lần thử theo thời gian.',
    },
    {
      question:
        'Method có @Retry(name = "inventory") và @CircuitBreaker(name = "inventory", fallbackMethod = "fallback"). Khi inventory lỗi, đội thấy Retry không bao giờ thử lại. Nguyên nhân là gì?',
      options: [
        'Retry chỉ hoạt động với method trả về CompletableFuture',
        'Hai annotation trùng tên instance nên Resilience4j chỉ kích hoạt một cái',
        'Fallback chỉ chạy khi mạch ở trạng thái HALF_OPEN',
        'Retry là lớp ngoài cùng; fallback ở CircuitBreaker đã biến lỗi thành kết quả thành công nên Retry không thấy exception',
      ],
      answer: 3,
      explanation:
        'Thứ tự mặc định là Retry ( CircuitBreaker ( ... ) ). Fallback ở lớp trong nuốt exception, nên cần đặt fallbackMethod ở annotation ngoài cùng là @Retry.',
    },
    {
      question:
        'Circuit breaker có failure-rate-threshold: 50 và minimum-number-of-calls: 10. Ban đêm chỉ có 4 lời gọi, 3 lời gọi lỗi. Trạng thái mạch là gì?',
      options: [
        'Vẫn CLOSED vì chưa đủ số lời gọi tối thiểu để tính tỉ lệ lỗi',
        'Chuyển sang OPEN vì tỉ lệ lỗi 75% vượt ngưỡng 50%',
        'Chuyển sang HALF_OPEN để thử lại',
        'Chuyển sang FORCED_OPEN cho tới khi có người can thiệp',
      ],
      answer: 0,
      explanation:
        'minimum-number-of-calls ngăn mạch mở chỉ vì vài lời gọi lúc ít traffic. Chưa đủ 10 lời gọi trong cửa sổ thì tỉ lệ lỗi chưa được đánh giá.',
    },
    {
      question: 'Khi bắt đầu một thí nghiệm chaos engineering, bước nào cần làm trước khi tiêm sự cố?',
      options: [
        'Tắt toàn bộ cảnh báo để tránh làm phiền người trực',
        'Chạy ngay trên toàn bộ traffic production để kết quả sát thực tế',
        'Xác định trạng thái ổn định bằng chỉ số đo được và đặt giả thuyết về hành vi của hệ thống',
        'Viết lại các fallback cho mọi phụ thuộc',
      ],
      answer: 2,
      explanation:
        'Chaos engineering là thí nghiệm kiểm chứng giả thuyết, nên phải có steady state đo được (số đơn mỗi phút, p99) để so sánh, và bắt đầu với blast radius nhỏ.',
    },
  ],
  observability: [
    {
      question: 'Thêm tag nào vào metric http.server.requests có nguy cơ gây bùng nổ cardinality trên Prometheus?',
      options: ['userId của người gọi', 'method (GET, POST...)', 'status (200, 404, 500...)', 'tên service (application)'],
      answer: 0,
      explanation:
        'Mỗi giá trị tag khác nhau tạo một time series mới; userId có thể có hàng triệu giá trị. Thông tin chi tiết như vậy nên nằm trong trace hoặc log.',
    },
    {
      question: 'Ba instance của order-service mỗi instance tự tính p99. Cách đúng để có p99 của cả service là gì?',
      options: [
        'Lấy trung bình cộng p99 của ba instance',
        'Lấy giá trị p99 lớn nhất trong ba instance',
        'Lấy p99 của instance nhận nhiều request nhất',
        'Xuất histogram bucket và dùng histogram_quantile(0.99, sum by (le) (rate(..._bucket[5m])))',
      ],
      answer: 3,
      explanation:
        'Percentile không cộng hay lấy trung bình được. Histogram bucket thì gộp được giữa các instance, rồi histogram_quantile tính percentile trên dữ liệu đã gộp.',
    },
    {
      question:
        'Trong Tempo, trace của order-service dừng lại và không thấy span của inventory-service, dù cả hai đã bật Micrometer Tracing. Code gọi đi dùng RestClient.create(). Nguyên nhân hợp lý nhất là gì?',
      options: [
        'Sampling probability của inventory-service đặt là 0.1',
        'Client tự tạo không có customizer observation của Boot nên không gửi header traceparent',
        'Inventory-service dùng log ECS thay vì Logstash',
        'Prometheus chưa scrape được /actuator/prometheus',
      ],
      answer: 1,
      explanation:
        'Instrumentation được gắn qua builder do Boot cấu hình. RestClient.create() bỏ qua bước này nên context không được truyền và trace bị đứt.',
    },
    {
      question:
        'SLO 99,9% trong 30 ngày. Nếu burn rate 14,4 kéo dài liên tục 1 giờ, bao nhiêu phần trăm error budget của tháng đã bị tiêu?',
      options: ['0,1%', '2%', '14,4%', '50%'],
      answer: 1,
      explanation:
        'Burn rate 1 tiêu hết ngân sách trong 720 giờ. Burn rate 14,4 trong 1 giờ tiêu 14,4 × 1/720 = 2% ngân sách.',
    },
    {
      question: 'Theo nguyên tắc cảnh báo trong bài, cảnh báo nào nên gọi người trực dậy (page) lúc nửa đêm?',
      options: [
        'CPU của một pod vượt 80% trong 5 phút',
        'Số dòng log mức WARN tăng gấp đôi so với hôm qua',
        'Tỉ lệ lỗi của checkout đang tiêu error budget nhanh gấp 14,4 lần trong cả cửa sổ 1 giờ và 5 phút',
        'Heap của JVM dùng 70% sau một lần deploy',
      ],
      answer: 2,
      explanation:
        'Page nên dựa trên triệu chứng người dùng cảm nhận (SLO bị đe doạ), khẩn cấp và cần hành động. CPU hay heap là nguyên nhân tiềm năng, thường chỉ nên hiển thị trên dashboard hoặc tạo ticket.',
    },
  ],
};

export default quiz;
