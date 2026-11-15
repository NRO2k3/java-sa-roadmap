export interface Question {
  id: string;
  phaseId: string;
  question: string;
  options: string[];
  answer: number;
  explanation: string;
}

export const questions: Question[] = [
  // Java Core
  {
    id: 'q1',
    phaseId: 'java-core',
    question: 'Nếu override equals() nhưng không override hashCode(), điều gì có thể xảy ra?',
    options: [
      'Không có vấn đề gì',
      'HashMap/HashSet có thể không tìm thấy object dù equals() trả về true',
      'Code không biên dịch được',
      'JVM tự sinh hashCode() phù hợp',
    ],
    answer: 1,
    explanation:
      'Hợp đồng của Object yêu cầu hai object bằng nhau phải có cùng hashCode. HashMap tìm bucket theo hashCode trước, nên object "bằng nhau" có thể nằm ở bucket khác.',
  },
  {
    id: 'q2',
    phaseId: 'java-core',
    question: 'Virtual Threads (Java 21) phù hợp nhất với loại workload nào?',
    options: [
      'Tính toán nặng CPU (CPU-bound)',
      'Xử lý I/O blocking số lượng lớn (I/O-bound)',
      'Thay thế hoàn toàn cho parallel stream',
      'Chỉ dùng cho ứng dụng desktop',
    ],
    answer: 1,
    explanation:
      'Virtual thread rẻ, có thể tạo hàng triệu và tự "unmount" khỏi carrier thread khi block I/O. Với tác vụ CPU-bound, số core vẫn là giới hạn nên không có lợi.',
  },
  {
    id: 'q3',
    phaseId: 'java-core',
    question: 'Garbage Collector nào được thiết kế cho độ trễ dừng (pause) cực thấp với heap rất lớn?',
    options: ['Serial GC', 'Parallel GC', 'ZGC', 'CMS'],
    answer: 2,
    explanation: 'ZGC (và Shenandoah) thực hiện phần lớn công việc đồng thời, giữ pause dưới mili-giây kể cả với heap hàng TB.',
  },
  // Spring
  {
    id: 'q4',
    phaseId: 'spring',
    question: 'Vì sao gọi một method @Transactional từ chính method khác trong cùng class thường không mở transaction?',
    options: [
      'Vì Spring chỉ hỗ trợ transaction ở tầng repository',
      'Vì lời gọi nội bộ không đi qua proxy của Spring',
      'Vì @Transactional chỉ áp dụng cho method static',
      'Vì cần thêm @EnableAsync',
    ],
    answer: 1,
    explanation:
      'Spring AOP dùng proxy bao quanh bean. Lời gọi this.method() đi thẳng vào object gốc, bỏ qua proxy nên advice transaction không chạy.',
  },
  {
    id: 'q5',
    phaseId: 'spring',
    question: 'Vấn đề N+1 query trong JPA thường được xử lý bằng cách nào?',
    options: [
      'Chuyển tất cả quan hệ sang FetchType.EAGER',
      'Dùng JOIN FETCH hoặc @EntityGraph',
      'Tăng kích thước connection pool',
      'Tắt Hibernate second-level cache',
    ],
    answer: 1,
    explanation:
      'JOIN FETCH / EntityGraph tải dữ liệu liên quan trong một câu truy vấn. EAGER không giải quyết triệt để và thường gây tải thừa dữ liệu.',
  },
  {
    id: 'q6',
    phaseId: 'spring',
    question: 'Kiểu injection nào được Spring khuyến nghị cho dependency bắt buộc?',
    options: ['Field injection (@Autowired trên field)', 'Setter injection', 'Constructor injection', 'Lookup method injection'],
    answer: 2,
    explanation: 'Constructor injection giúp dependency bất biến (final), dễ test, và phát hiện sớm vòng phụ thuộc.',
  },
  // Data
  {
    id: 'q7',
    phaseId: 'data',
    question: 'Theo định lý CAP, khi xảy ra phân vùng mạng (network partition), hệ thống phải chọn giữa:',
    options: [
      'Consistency và Availability',
      'Consistency và Performance',
      'Availability và Durability',
      'Latency và Throughput',
    ],
    answer: 0,
    explanation:
      'Partition tolerance là bắt buộc với hệ phân tán, nên khi có partition phải đánh đổi giữa C và A. PACELC mở rộng thêm đánh đổi Latency–Consistency khi không có partition.',
  },
  {
    id: 'q8',
    phaseId: 'data',
    question: 'Trong chiến lược cache-aside, ai chịu trách nhiệm nạp dữ liệu vào cache khi cache miss?',
    options: ['Database', 'Cache server tự nạp', 'Ứng dụng', 'Load balancer'],
    answer: 2,
    explanation: 'Với cache-aside (lazy loading), ứng dụng đọc cache, nếu miss thì đọc DB rồi tự ghi vào cache.',
  },
  {
    id: 'q9',
    phaseId: 'data',
    question: 'Consistent hashing giải quyết vấn đề gì khi sharding?',
    options: [
      'Mã hoá dữ liệu',
      'Giảm lượng dữ liệu phải di chuyển khi thêm/bớt node',
      'Tăng tốc truy vấn JOIN',
      'Đảm bảo transaction ACID giữa các shard',
    ],
    answer: 1,
    explanation: 'Với hash mod N, thêm node làm gần như toàn bộ key đổi vị trí. Consistent hashing chỉ di chuyển khoảng K/N key.',
  },
  // Integration
  {
    id: 'q10',
    phaseId: 'integration',
    question: 'Transactional Outbox pattern giải quyết vấn đề gì?',
    options: [
      'Giảm độ trễ của Kafka',
      'Dual-write: cập nhật DB và gửi message không nhất quán',
      'Mã hoá message',
      'Cân bằng tải giữa các consumer',
    ],
    answer: 1,
    explanation:
      'Ghi event vào bảng outbox trong cùng transaction với dữ liệu nghiệp vụ, sau đó một relay (hoặc CDC như Debezium) đẩy event lên broker, đảm bảo không mất hoặc lệch dữ liệu.',
  },
  {
    id: 'q11',
    phaseId: 'integration',
    question: 'Trong Kafka, thứ tự message được đảm bảo ở phạm vi nào?',
    options: ['Toàn bộ cluster', 'Toàn bộ topic', 'Trong một partition', 'Không đảm bảo thứ tự'],
    answer: 2,
    explanation: 'Kafka chỉ đảm bảo thứ tự trong một partition. Muốn các message của cùng thực thể có thứ tự, hãy dùng cùng message key.',
  },
  {
    id: 'q12',
    phaseId: 'integration',
    question: 'Điểm khác biệt chính giữa Saga choreography và orchestration là gì?',
    options: [
      'Choreography dùng 2PC, orchestration thì không',
      'Choreography: các service phản ứng với event của nhau; orchestration: có một điều phối viên trung tâm ra lệnh',
      'Orchestration chỉ dùng được với REST',
      'Không có khác biệt',
    ],
    answer: 1,
    explanation:
      'Choreography phi tập trung, đơn giản khi ít bước; orchestration dễ theo dõi, kiểm soát luồng phức tạp hơn nhưng có thêm thành phần điều phối.',
  },
  // Microservices
  {
    id: 'q13',
    phaseId: 'microservices',
    question: 'Trong DDD, "Bounded Context" là gì?',
    options: [
      'Một bảng trong cơ sở dữ liệu',
      'Ranh giới mà trong đó một mô hình miền và ngôn ngữ chung có ý nghĩa nhất quán',
      'Một package Java',
      'Một cụm Kubernetes',
    ],
    answer: 1,
    explanation: 'Bounded context là ranh giới ngữ nghĩa của mô hình. Đây thường là ứng viên tốt để xác định ranh giới microservice.',
  },
  {
    id: 'q14',
    phaseId: 'microservices',
    question: 'Circuit Breaker ở trạng thái OPEN sẽ làm gì?',
    options: [
      'Chuyển tiếp mọi request bình thường',
      'Từ chối nhanh (fail fast) request tới dependency đang lỗi',
      'Khởi động lại service',
      'Tăng số lần retry',
    ],
    answer: 1,
    explanation: 'Khi OPEN, request bị từ chối ngay (hoặc chạy fallback) để bảo vệ hệ thống; sau thời gian chờ sẽ chuyển HALF_OPEN để thử lại.',
  },
  {
    id: 'q15',
    phaseId: 'microservices',
    question: 'Ba trụ cột của observability gồm:',
    options: ['CPU, RAM, Disk', 'Logs, Metrics, Traces', 'Dev, Test, Prod', 'Alert, Dashboard, Report'],
    answer: 1,
    explanation: 'Logs (sự kiện chi tiết), Metrics (số liệu tổng hợp theo thời gian), Traces (hành trình request qua các service).',
  },
  // Cloud
  {
    id: 'q16',
    phaseId: 'cloud',
    question: 'Khi chạy JVM trong container có memory limit 1GB, cấu hình nào hợp lý?',
    options: [
      '-Xmx1g để dùng hết bộ nhớ',
      '-XX:MaxRAMPercentage=75 để chừa bộ nhớ cho metaspace, thread stack, native',
      'Không cần cấu hình gì vì JVM luôn dùng 25MB',
      'Tắt Garbage Collector',
    ],
    answer: 1,
    explanation: 'JVM cần bộ nhớ ngoài heap. Đặt heap bằng toàn bộ limit dễ bị OOMKilled. MaxRAMPercentage tự tính theo limit của container.',
  },
  {
    id: 'q17',
    phaseId: 'cloud',
    question: 'RPO (Recovery Point Objective) đo lường điều gì?',
    options: [
      'Thời gian tối đa để khôi phục hệ thống',
      'Lượng dữ liệu tối đa có thể mất tính theo thời gian',
      'Số lượng region',
      'Chi phí khôi phục',
    ],
    answer: 1,
    explanation: 'RPO = mất tối đa bao nhiêu dữ liệu (vd. 5 phút gần nhất). RTO = thời gian tối đa để hệ thống hoạt động lại.',
  },
  {
    id: 'q18',
    phaseId: 'cloud',
    question: 'Canary deployment là gì?',
    options: [
      'Triển khai đồng thời lên mọi server',
      'Đưa phiên bản mới cho một phần nhỏ người dùng trước, theo dõi rồi mở rộng dần',
      'Chạy hai môi trường song song và chuyển toàn bộ traffic một lần',
      'Triển khai thủ công vào cuối tuần',
    ],
    answer: 1,
    explanation: 'Canary giảm rủi ro bằng cách phơi bày bản mới cho một tỉ lệ nhỏ traffic. Chuyển toàn bộ một lần giữa hai môi trường là blue-green.',
  },
  // Security
  {
    id: 'q19',
    phaseId: 'security',
    question: 'Luồng OAuth 2.0 được khuyến nghị cho ứng dụng SPA/mobile là:',
    options: ['Implicit', 'Resource Owner Password', 'Authorization Code + PKCE', 'Client Credentials'],
    answer: 2,
    explanation: 'Implicit và Password flow đã bị khuyến cáo không dùng. Client Credentials dành cho giao tiếp máy–máy.',
  },
  {
    id: 'q20',
    phaseId: 'security',
    question: 'Nguyên tắc cốt lõi của Zero Trust là:',
    options: [
      'Tin tưởng mọi thứ trong mạng nội bộ',
      'Không bao giờ tin mặc định, luôn xác thực và phân quyền mọi request',
      'Chỉ dùng firewall là đủ',
      'Tắt toàn bộ logging để bảo mật',
    ],
    answer: 1,
    explanation: '"Never trust, always verify" — mỗi request đều được xác thực, phân quyền và mã hoá, bất kể đến từ đâu.',
  },
  // System design
  {
    id: 'q21',
    phaseId: 'system-design',
    question: 'Availability 99.99% tương đương thời gian downtime tối đa khoảng bao nhiêu mỗi năm?',
    options: ['~8,7 giờ', '~52,6 phút', '~5,3 phút', '~3,65 ngày'],
    answer: 1,
    explanation: '99.9% ≈ 8,76 giờ/năm; 99.99% ≈ 52,6 phút/năm; 99.999% ≈ 5,26 phút/năm.',
  },
  {
    id: 'q22',
    phaseId: 'system-design',
    question: 'Trong Hexagonal Architecture, "port" là gì?',
    options: [
      'Cổng mạng TCP',
      'Interface định nghĩa cách domain giao tiếp với bên ngoài',
      'Một container Docker',
      'Lớp controller REST',
    ],
    answer: 1,
    explanation: 'Port là interface do domain sở hữu; adapter (REST controller, JPA repository, Kafka listener…) hiện thực port đó.',
  },
  {
    id: 'q23',
    phaseId: 'system-design',
    question: 'Thuật toán nào thường dùng cho rate limiting cho phép burst ngắn?',
    options: ['Round robin', 'Token bucket', 'Binary search', 'Dijkstra'],
    answer: 1,
    explanation: 'Token bucket nạp token với tốc độ cố định và cho phép tiêu thụ dồn tới dung lượng bucket, nên chấp nhận burst.',
  },
  // SA practice
  {
    id: 'q24',
    phaseId: 'sa-practice',
    question: 'Một ADR (Architecture Decision Record) tốt nên có những phần nào?',
    options: [
      'Chỉ cần tên công nghệ được chọn',
      'Bối cảnh, quyết định, các phương án đã cân nhắc và hệ quả',
      'Mã nguồn hoàn chỉnh',
      'Danh sách thành viên dự án',
    ],
    answer: 1,
    explanation: 'ADR ghi lại "tại sao" của quyết định: context, decision, alternatives, consequences — để người sau hiểu và đánh giá lại.',
  },
  {
    id: 'q25',
    phaseId: 'sa-practice',
    question: 'Trong mô hình C4, sơ đồ "Container" thể hiện gì?',
    options: [
      'Các Docker container trên server',
      'Các ứng dụng/kho dữ liệu có thể triển khai độc lập và cách chúng giao tiếp',
      'Các class và interface',
      'Hệ thống trong bối cảnh người dùng và hệ thống ngoài',
    ],
    answer: 1,
    explanation: 'Container trong C4 là đơn vị chạy/triển khai được (web app, API, DB, queue…), không nhất thiết là Docker container.',
  },
  {
    id: 'q26',
    phaseId: 'sa-practice',
    question: 'Strangler Fig pattern được dùng khi nào?',
    options: [
      'Xây hệ thống mới từ đầu và tắt hệ cũ trong một đêm',
      'Thay thế dần hệ thống legacy bằng cách chuyển từng chức năng sang hệ mới',
      'Tối ưu truy vấn SQL',
      'Tăng số replica của service',
    ],
    answer: 1,
    explanation: 'Đặt một lớp chặn phía trước, chuyển dần từng phần chức năng sang hệ mới cho đến khi hệ cũ có thể gỡ bỏ — giảm rủi ro "big bang".',
  },
  // Career
  {
    id: 'q27',
    phaseId: 'career',
    question: 'Chứng chỉ nào sau đây tập trung vào thiết kế giải pháp trên Azure?',
    options: ['AZ-900', 'AZ-305', 'CKAD', 'OCP Java SE'],
    answer: 1,
    explanation: 'AZ-305 (Designing Microsoft Azure Infrastructure Solutions) là bài thi chính để đạt Azure Solutions Architect Expert.',
  },
  {
    id: 'q28',
    phaseId: 'career',
    question: 'Khi trả lời câu hỏi phỏng vấn system design, bước đầu tiên nên là gì?',
    options: [
      'Vẽ ngay sơ đồ microservices',
      'Làm rõ yêu cầu chức năng, phi chức năng và phạm vi',
      'Chọn ngay database',
      'Viết code',
    ],
    answer: 1,
    explanation: 'Làm rõ yêu cầu và ước lượng quy mô trước; sau đó mới đến high-level design, deep dive và trade-off.',
  },
];
