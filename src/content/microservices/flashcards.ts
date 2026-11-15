import type { LessonFlashcards } from '../types';

const flashcards: LessonFlashcards = {
  ddd: [
    {
      front: 'Ubiquitous language là gì?',
      back: 'Bộ thuật ngữ chung mà dev, BA, QA và chuyên gia nghiệp vụ cùng dùng trong cuộc họp, tài liệu và chính mã nguồn. Ví dụ code có order.expire() và OrderExpired thay vì updateStatus(5).',
    },
    {
      front: 'Dấu hiệu nhận ra ranh giới của một bounded context?',
      back: 'Chỗ cùng một từ đổi nghĩa giữa các nhóm, ranh giới năng lực nghiệp vụ, và cấu trúc team theo định luật Conway. Mỗi context nên do một team sở hữu.',
    },
    {
      front: 'Core, supporting và generic subdomain khác nhau thế nào?',
      back: 'Core tạo lợi thế cạnh tranh, đáng đầu tư người giỏi nhất. Supporting cần thiết nhưng không tạo khác biệt. Generic là bài toán phổ biến như email, kế toán, xác thực, nên mua hoặc dùng giải pháp có sẵn.',
    },
    {
      front: 'Upstream và downstream trong context map nghĩa là gì?',
      back: 'Upstream là bên mà thay đổi của nó ảnh hưởng tới bên kia; downstream là bên chịu ảnh hưởng. Quan hệ này cho biết ai phải thích nghi với ai.',
    },
    {
      front: 'Customer–supplier khác conformist ở điểm nào?',
      back: 'Customer–supplier: downstream có tiếng nói trong kế hoạch của upstream. Conformist: downstream chấp nhận nguyên model của upstream và không có quyền yêu cầu thay đổi.',
    },
    {
      front: 'Khi nào nên dùng shared kernel?',
      back: 'Khi hai context do các team gần nhau sở hữu cần chung một phần model nhỏ, ổn định như Money hay Sku. Thay đổi phần chung cần cả hai đồng ý; không để nó phình thành thư viện common chứa entity.',
    },
    {
      front: 'Entity khác value object thế nào?',
      back: 'Entity có định danh tồn tại suốt vòng đời, khác ID là khác nhau dù cùng thuộc tính. Value object không có định danh, bất biến, so sánh bằng giá trị; trong Java 21 thường viết bằng record.',
    },
    {
      front: 'Bốn nguyên tắc thiết kế aggregate?',
      back: 'Bảo vệ bất biến bên trong ranh giới; giữ aggregate nhỏ; tham chiếu aggregate khác bằng ID; mỗi transaction chỉ sửa một aggregate, nhất quán giữa các aggregate qua domain event.',
    },
    {
      front: 'Event của AbstractAggregateRoot được phát khi nào?',
      back: 'Event đăng ký bằng registerEvent() chỉ được phát khi gọi repository.save() trên aggregate. Bên nhận nên dùng @TransactionalEventListener để chỉ xử lý sau khi transaction commit.',
    },
    {
      front: 'Các bước chính của Big Picture Event Storming?',
      back: 'Khám phá hỗn loạn các domain event; sắp theo dòng thời gian và thống nhất tên; đánh dấu hot spot; bổ sung command, actor, policy, hệ thống ngoài; gom quanh aggregate và vẽ ranh giới context.',
    },
    {
      front: 'Spring Modulith xác định application module thế nào?',
      back: 'Mỗi package nằm trực tiếp dưới package chứa class @SpringBootApplication là một module; sub-package mặc định là internal. ApplicationModules.verify() báo lỗi khi có vòng phụ thuộc hoặc truy cập internal của module khác.',
    },
    {
      front: '@ApplicationModuleListener tương đương với cấu hình nào?',
      back: 'Một listener chạy bất đồng bộ, trong transaction mới, sau khi transaction phát event đã commit. Kết hợp Event Publication Registry để lưu event chưa xử lý xong và gửi lại được.',
    },
  ],
  'spring-cloud': [
    {
      front: 'Một route của Spring Cloud Gateway gồm những gì?',
      back: 'ID, URI đích, danh sách predicate (điều kiện khớp như Path, Method, Header) và danh sách filter (biến đổi request hoặc response như StripPrefix, RequestRateLimiter, CircuitBreaker).',
    },
    {
      front: 'API gateway nên và không nên làm gì?',
      back: 'Nên xử lý cross-cutting concern: định tuyến, xác thực token, rate limit, CORS, tracing. Không chứa logic nghiệp vụ hay truy cập database; ghép dữ liệu riêng cho từng loại client đặt ở BFF.',
    },
    {
      front: 'RequestRateLimiter của Gateway cần những gì?',
      back: 'Redis reactive và một bean KeyResolver xác định đối tượng bị giới hạn. replenishRate là số token nạp mỗi giây, burstCapacity là sức chứa của bucket; vượt giới hạn thì trả HTTP 429.',
    },
    {
      front: 'Client-side discovery khác server-side discovery?',
      back: 'Client-side: client hỏi registry rồi tự chọn instance, như Spring Cloud LoadBalancer. Server-side: client gọi một địa chỉ ổn định như load balancer hay Kubernetes Service, hạ tầng tự chuyển tiếp.',
    },
    {
      front: 'Vì sao danh sách instance lấy từ Eureka có thể bị cũ?',
      back: 'Instance gửi heartbeat định kỳ còn client cache danh sách và làm mới theo chu kỳ. Instance vừa chết vẫn có thể được chọn trong vài chục giây, nên cần retry sang instance khác.',
    },
    {
      front: 'Hạn chế của Kubernetes Service với kết nối dài?',
      back: 'kube-proxy cân bằng ở mức kết nối (L4). Với HTTP keep-alive hoặc gRPC, tải có thể dồn vào vài pod; cân nhắc service mesh hoặc cân bằng tải phía client theo từng request.',
    },
    {
      front: 'Client nạp cấu hình từ Config Server bằng thuộc tính nào?',
      back: 'spring.config.import=configserver:http://config-server:8888. Thêm tiền tố optional: nếu không bắt buộc; đặt spring.cloud.config.fail-fast=true để không khởi động khi thiếu cấu hình.',
    },
    {
      front: 'Làm mới cấu hình khi ứng dụng đang chạy thế nào?',
      back: 'Bean @RefreshScope và @ConfigurationProperties được nạp lại khi gọi POST /actuator/refresh; Spring Cloud Bus phát tới mọi instance qua /actuator/busrefresh. Thay đổi mang tính cấu trúc như URL database nên rolling restart.',
    },
    {
      front: 'Tự khai báo builder @LoadBalanced mà vẫn giữ cấu hình của Boot?',
      back: 'Dùng RestClientBuilderConfigurer: configurer.configure(RestClient.builder()). Builder tạo trần bằng RestClient.builder() hay RestClient.create() thiếu customizer observation và timeout nên trace bị đứt.',
    },
    {
      front: 'Dự án mới nên chọn RestClient + HTTP interface hay OpenFeign?',
      back: 'RestClient kèm interface @HttpExchange có sẵn từ Spring Framework 6.1 là lựa chọn mặc định. Spring Cloud OpenFeign vẫn dùng tốt nhưng đã ở trạng thái feature-complete.',
    },
    {
      front: 'Đặt timeout HTTP client chung từ Spring Boot 3.4?',
      back: 'Dùng spring.http.client.connect-timeout và spring.http.client.read-timeout. Với Feign, cấu hình spring.cloud.openfeign.client.config.<tên client>.connect-timeout và read-timeout.',
    },
  ],
  resilience: [
    {
      front: 'Cascading failure là gì?',
      back: 'Lỗi lan truyền dây chuyền: phụ thuộc chậm giữ thread và kết nối của bên gọi, làm cạn tài nguyên bên gọi rồi lan tiếp lên các tầng trên. Service chậm thường nguy hiểm hơn service chết hẳn.',
    },
    {
      front: 'Connect timeout, read timeout và deadline tổng khác nhau?',
      back: 'Connect timeout giới hạn thời gian lập kết nối; read timeout giới hạn thời gian chờ phản hồi; deadline tổng là thời gian người gọi chấp nhận cho cả thao tác kể cả retry. Timeout tầng trong phải nhỏ hơn tầng ngoài.',
    },
    {
      front: 'Khi nào được phép retry?',
      back: 'Khi lỗi có tính tạm thời (lỗi kết nối, timeout, 503, 429) và thao tác idempotent hoặc có Idempotency-Key. Không retry lỗi 400, validation, lỗi nghiệp vụ hay lỗi xác thực.',
    },
    {
      front: 'Retry amplification là gì?',
      back: 'Mỗi tầng retry 3 lần thì 3 tầng thành 3 × 3 × 3 = 27 lời gọi xuống tầng dưới cùng khi có sự cố. Chỉ retry ở một tầng và giới hạn tổng số lần thử.',
    },
    {
      front: 'randomized-wait-factor: 0.5 trong Resilience4j nghĩa là gì?',
      back: 'Mỗi lần chờ dao động ngẫu nhiên trong khoảng ±50% quanh giá trị backoff. Đây là jitter giúp các client không retry đồng loạt cùng nhịp.',
    },
    {
      front: 'Ba trạng thái chính của circuit breaker?',
      back: 'CLOSED cho lời gọi đi qua và đo tỉ lệ lỗi; OPEN từ chối ngay bằng CallNotPermittedException; HALF_OPEN cho vài lời gọi thử, thành công thì về CLOSED, lỗi thì quay lại OPEN.',
    },
    {
      front: 'Vì sao cấu hình slow-call-rate-threshold?',
      back: 'Lời gọi chậm hơn slow-call-duration-threshold được tính như một dạng lỗi. Phụ thuộc thường chậm dần trước khi chết hẳn, nên mở mạch sớm giúp bảo vệ bên gọi.',
    },
    {
      front: 'Semaphore bulkhead khác thread pool bulkhead?',
      back: 'Semaphore giới hạn số lời gọi đồng thời, chạy trên thread của người gọi, dùng được cho code đồng bộ. Thread pool bulkhead có pool và hàng đợi riêng, chỉ áp dụng cho method trả về CompletableFuture.',
    },
    {
      front: 'Giới hạn của RateLimiter Resilience4j khi chạy nhiều instance?',
      back: 'Giới hạn tính trên từng instance: 4 instance × 50 = 200 request mỗi giây. Muốn giới hạn toàn hệ thống, đặt ở gateway với bộ đếm dùng chung như Redis.',
    },
    {
      front: 'Thứ tự aspect mặc định của Resilience4j?',
      back: 'Retry ( CircuitBreaker ( RateLimiter ( TimeLimiter ( Bulkhead ( method ) ) ) ) ). Retry ở ngoài cùng nên fallbackMethod đặt ở @Retry, nếu không Retry sẽ không bao giờ thử lại.',
    },
    {
      front: 'Một fallback tốt cần thoả mãn điều gì?',
      back: 'Đơn giản, không gọi sang phụ thuộc mong manh khác, được test và giám sát tỉ lệ sử dụng. Với nghiệp vụ tiền bạc không bao giờ giả thành công; thất bại rõ ràng hoặc chuyển sang trạng thái chờ xử lý.',
    },
    {
      front: 'Năm bước của một thí nghiệm chaos engineering?',
      back: 'Xác định steady state đo được; đặt giả thuyết; chọn sự kiện thực tế để tiêm; giới hạn blast radius và có nút dừng; chạy, rút kinh nghiệm rồi tự động hoá thành kiểm thử định kỳ.',
    },
  ],
  observability: [
    {
      front: 'Bật structured logging trong Spring Boot 3.4+ thế nào?',
      back: 'Đặt logging.structured.format.console (hoặc .file) là ecs, logstash hoặc gelf. Mỗi sự kiện log thành một dòng JSON, service.name lấy từ spring.application.name.',
    },
    {
      front: 'Correlation ID tốt nhất khi đã bật tracing?',
      back: 'Trace ID. Micrometer Tracing tự đưa traceId và spanId vào MDC và truyền sang service khác qua header W3C traceparent.',
    },
    {
      front: 'Cấu trúc của header traceparent?',
      back: 'Gồm version, trace-id 32 ký tự hex, parent span-id 16 ký tự hex và cờ, ví dụ 00-<trace-id>-<span-id>-01; cờ 01 nghĩa là trace được lấy mẫu.',
    },
    {
      front: 'Vì sao dùng MDC.putCloseable trong try-with-resources?',
      back: 'Để khoá MDC tự bị xoá khi ra khỏi khối, không rò sang request khác dùng lại thread. MDC dựa trên ThreadLocal nên khi chuyển thread cần ContextPropagatingTaskDecorator.',
    },
    {
      front: 'Counter, Gauge và Timer dùng khi nào?',
      back: 'Counter cho giá trị chỉ tăng như số đơn đã đặt; Gauge cho giá trị tức thời lên xuống như kích thước hàng đợi; Timer cho thời gian và số lần của thao tác như gọi cổng thanh toán.',
    },
    {
      front: 'Phương pháp RED và USE gồm những gì?',
      back: 'RED cho service: Rate, Errors, Duration. USE cho tài nguyên: Utilization, Saturation, Errors.',
    },
    {
      front: 'Làm sao để Prometheus tính p99 gộp qua mọi instance?',
      back: 'Bật management.metrics.distribution.percentiles-histogram.http.server.requests=true để xuất bucket, rồi dùng histogram_quantile(0.99, sum by (le) (rate(..._bucket[5m]))).',
    },
    {
      front: 'Head-based và tail-based sampling khác nhau?',
      back: 'Head-based quyết định ngay đầu trace theo tỉ lệ, rẻ nhưng có thể bỏ sót trace lỗi hiếm. Tail-based để Collector quyết định sau khi trace hoàn tất, giữ được trace lỗi hoặc chậm nhưng tốn bộ nhớ.',
    },
    {
      front: 'Thuộc tính sampling và endpoint OTLP trong Boot 3?',
      back: 'management.tracing.sampling.probability (mặc định 0.1) và management.otlp.tracing.endpoint, ví dụ http://otel-collector:4318/v1/traces.',
    },
    {
      front: 'lowCardinalityKeyValue khác highCardinalityKeyValue?',
      back: 'Low cardinality trở thành tag của metric và thuộc tính span. High cardinality chỉ gắn vào span, dành cho giá trị có rất nhiều khả năng như cart.id để không làm phình metric.',
    },
    {
      front: 'SLI, SLO và SLA khác nhau thế nào?',
      back: 'SLI là chỉ số đo, thường là tỉ lệ sự kiện tốt trên sự kiện hợp lệ. SLO là mục tiêu cho SLI trong một cửa sổ thời gian. SLA là cam kết với khách hàng kèm hậu quả, nên lỏng hơn SLO.',
    },
    {
      front: 'Burn rate là gì?',
      back: 'Tốc độ tiêu error budget so với mức vừa hết đúng cuối cửa sổ. Burn rate 1 tiêu hết sau 30 ngày; burn rate 14,4 kéo dài 1 giờ tiêu 2% ngân sách tháng.',
    },
  ],
};

export default flashcards;
