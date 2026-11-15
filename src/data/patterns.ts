export type PatternCategory = 'Ứng dụng' | 'Dữ liệu' | 'Tích hợp' | 'Resilience' | 'Triển khai' | 'Migration';

export interface Pattern {
  name: string;
  category: PatternCategory;
  problem: string;
  solution: string;
  javaTools: string[];
  pros: string[];
  cons: string[];
}

export const patternCategories: PatternCategory[] = ['Ứng dụng', 'Dữ liệu', 'Tích hợp', 'Resilience', 'Triển khai', 'Migration'];

export const patterns: Pattern[] = [
  {
    name: 'Hexagonal Architecture',
    category: 'Ứng dụng',
    problem: 'Logic nghiệp vụ bị trộn lẫn với framework, DB, giao thức nên khó test và khó thay thế công nghệ.',
    solution: 'Đặt domain ở trung tâm, giao tiếp ra ngoài qua port (interface); adapter hiện thực port cho REST, JPA, Kafka…',
    javaTools: ['Spring Boot', 'ArchUnit', 'jMolecules'],
    pros: ['Domain độc lập framework', 'Dễ unit test', 'Thay adapter không ảnh hưởng domain'],
    cons: ['Nhiều lớp mapping hơn', 'Thừa với ứng dụng CRUD đơn giản'],
  },
  {
    name: 'Modular Monolith',
    category: 'Ứng dụng',
    problem: 'Microservices quá phức tạp cho đội nhỏ, nhưng monolith truyền thống dễ thành "big ball of mud".',
    solution: 'Một đơn vị triển khai nhưng chia module rõ ràng theo bounded context, giao tiếp qua API/event nội bộ.',
    javaTools: ['Spring Modulith', 'Java Modules (JPMS)', 'ArchUnit'],
    pros: ['Vận hành đơn giản', 'Ranh giới rõ, dễ tách service sau này', 'Transaction cục bộ'],
    cons: ['Scale cả khối', 'Cần kỷ luật giữ ranh giới module'],
  },
  {
    name: 'CQRS',
    category: 'Dữ liệu',
    problem: 'Mô hình đọc và ghi có yêu cầu khác nhau; một mô hình chung khiến truy vấn phức tạp, chậm.',
    solution: 'Tách command (ghi) và query (đọc) thành mô hình riêng, có thể dùng kho dữ liệu riêng được đồng bộ qua event.',
    javaTools: ['Axon Framework', 'Spring Data', 'Kafka', 'Elasticsearch'],
    pros: ['Tối ưu riêng cho đọc/ghi', 'Scale độc lập'],
    cons: ['Eventual consistency', 'Tăng độ phức tạp'],
  },
  {
    name: 'Event Sourcing',
    category: 'Dữ liệu',
    problem: 'Chỉ lưu trạng thái hiện tại làm mất lịch sử thay đổi, khó audit và tái hiện.',
    solution: 'Lưu chuỗi event bất biến; trạng thái được dựng lại bằng cách replay event (kèm snapshot).',
    javaTools: ['Axon Framework', 'EventStoreDB', 'Kafka'],
    pros: ['Audit đầy đủ', 'Tái hiện trạng thái bất kỳ thời điểm', 'Hợp với CQRS'],
    cons: ['Khó thay đổi schema event', 'Truy vấn phải qua projection'],
  },
  {
    name: 'Database per Service',
    category: 'Dữ liệu',
    problem: 'Dùng chung DB khiến các service phụ thuộc chặt vào schema của nhau.',
    solution: 'Mỗi service sở hữu dữ liệu riêng, chỉ truy cập qua API/event của service đó.',
    javaTools: ['Spring Data', 'Flyway', 'Debezium'],
    pros: ['Loose coupling', 'Tự chọn công nghệ lưu trữ phù hợp'],
    cons: ['Không JOIN chéo service', 'Cần Saga cho giao dịch phân tán'],
  },
  {
    name: 'Transactional Outbox',
    category: 'Tích hợp',
    problem: 'Ghi DB và publish message là hai thao tác riêng, có thể một thành công một thất bại (dual-write).',
    solution: 'Ghi event vào bảng outbox trong cùng transaction; relay hoặc CDC đọc outbox và publish lên broker.',
    javaTools: ['Debezium', 'Spring Modulith Events', 'Kafka Connect'],
    pros: ['Đảm bảo nhất quán DB–message', 'Không cần 2PC'],
    cons: ['At-least-once nên consumer phải idempotent', 'Thêm thành phần relay'],
  },
  {
    name: 'Saga',
    category: 'Tích hợp',
    problem: 'Nghiệp vụ trải qua nhiều service, không thể dùng một transaction ACID.',
    solution: 'Chuỗi transaction cục bộ; nếu một bước lỗi thì chạy compensating transaction để hoàn tác các bước trước.',
    javaTools: ['Axon Saga', 'Temporal Java SDK', 'Camunda', 'Kafka'],
    pros: ['Nhất quán cuối cùng mà không khoá tài nguyên lâu', 'Phù hợp microservices'],
    cons: ['Khó thiết kế compensation', 'Khó debug luồng dài'],
  },
  {
    name: 'API Gateway / BFF',
    category: 'Tích hợp',
    problem: 'Client phải gọi nhiều service, xử lý auth, rate limit, CORS lặp lại ở mỗi nơi.',
    solution: 'Một điểm vào duy nhất định tuyến, xác thực, tổng hợp; BFF tạo gateway riêng cho từng loại client.',
    javaTools: ['Spring Cloud Gateway', 'Kong', 'AWS API Gateway'],
    pros: ['Tập trung cross-cutting concern', 'Ẩn cấu trúc nội bộ'],
    cons: ['Có thể thành nút cổ chai/điểm lỗi đơn', 'Nguy cơ chứa logic nghiệp vụ'],
  },
  {
    name: 'Circuit Breaker',
    category: 'Resilience',
    problem: 'Dependency chậm hoặc lỗi khiến thread bị chiếm dụng, lỗi lan truyền dây chuyền.',
    solution: 'Theo dõi tỉ lệ lỗi; vượt ngưỡng thì "mở mạch" để fail fast, sau đó thử lại dần (half-open).',
    javaTools: ['Resilience4j', 'Spring Cloud Circuit Breaker'],
    pros: ['Ngăn cascading failure', 'Cho dependency thời gian hồi phục'],
    cons: ['Cần tinh chỉnh ngưỡng', 'Cần thiết kế fallback hợp lý'],
  },
  {
    name: 'Bulkhead',
    category: 'Resilience',
    problem: 'Một dependency chậm chiếm hết thread pool chung, làm sập mọi chức năng khác.',
    solution: 'Cô lập tài nguyên (thread pool, connection pool, semaphore) theo từng dependency.',
    javaTools: ['Resilience4j Bulkhead', 'Kubernetes resource limits'],
    pros: ['Giới hạn phạm vi ảnh hưởng của lỗi'],
    cons: ['Sử dụng tài nguyên kém tối ưu hơn'],
  },
  {
    name: 'Retry with Backoff',
    category: 'Resilience',
    problem: 'Lỗi tạm thời (mạng, timeout) khiến request thất bại dù thử lại có thể thành công.',
    solution: 'Thử lại với khoảng chờ tăng dần theo cấp số nhân kèm jitter; chỉ retry thao tác idempotent.',
    javaTools: ['Resilience4j Retry', 'Spring Retry'],
    pros: ['Tự phục hồi lỗi tạm thời'],
    cons: ['Retry storm nếu cấu hình sai', 'Tăng độ trễ'],
  },
  {
    name: 'Sidecar / Service Mesh',
    category: 'Triển khai',
    problem: 'Mỗi service phải tự cài mTLS, retry, tracing… bằng thư viện riêng theo ngôn ngữ.',
    solution: 'Đưa các chức năng mạng vào proxy sidecar chạy cạnh service, quản lý tập trung qua control plane.',
    javaTools: ['Istio', 'Linkerd', 'Envoy'],
    pros: ['Không phụ thuộc ngôn ngữ', 'mTLS và traffic policy tập trung'],
    cons: ['Thêm độ trễ và tài nguyên', 'Vận hành phức tạp'],
  },
  {
    name: 'Blue-Green / Canary',
    category: 'Triển khai',
    problem: 'Triển khai phiên bản mới có rủi ro gây downtime hoặc lỗi trên toàn bộ người dùng.',
    solution: 'Blue-green: chạy song song hai môi trường và chuyển traffic; Canary: tăng dần tỉ lệ traffic cho bản mới.',
    javaTools: ['Argo Rollouts', 'Kubernetes', 'Spinnaker'],
    pros: ['Rollback nhanh', 'Giảm phạm vi ảnh hưởng'],
    cons: ['Tốn tài nguyên', 'Khó với thay đổi schema DB không tương thích'],
  },
  {
    name: 'Strangler Fig',
    category: 'Migration',
    problem: 'Viết lại toàn bộ hệ thống legacy một lần (big bang) rất rủi ro.',
    solution: 'Đặt lớp chặn phía trước, chuyển dần từng chức năng sang hệ mới cho đến khi gỡ được hệ cũ.',
    javaTools: ['Spring Cloud Gateway', 'Feature flags', 'Debezium (đồng bộ dữ liệu)'],
    pros: ['Giảm rủi ro', 'Mang lại giá trị sớm'],
    cons: ['Hai hệ thống cùng tồn tại lâu', 'Đồng bộ dữ liệu phức tạp'],
  },
  {
    name: 'Anti-Corruption Layer',
    category: 'Migration',
    problem: 'Mô hình của hệ thống cũ/bên thứ ba "rò rỉ" vào domain mới.',
    solution: 'Tạo lớp dịch giữa hai mô hình, bảo vệ domain mới khỏi khái niệm của hệ cũ.',
    javaTools: ['MapStruct', 'Apache Camel', 'Spring Integration'],
    pros: ['Giữ domain mới sạch', 'Cô lập thay đổi từ hệ ngoài'],
    cons: ['Thêm một lớp cần bảo trì'],
  },
];
