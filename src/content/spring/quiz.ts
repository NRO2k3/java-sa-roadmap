import type { LessonQuiz } from '../types';

const quiz: LessonQuiz = {
  'spring-core': [
    {
      question:
        'ReportService là singleton và inject trực tiếp một bean ReportBuilder có scope prototype qua constructor. Gọi reportService.dailyReport() ba lần thì có bao nhiêu instance ReportBuilder được dùng?',
      options: [
        'Ba instance, mỗi lần gọi method nhận một instance mới',
        'Một instance, được tạo đúng một lần khi ReportService được khởi tạo',
        'Không có instance nào vì prototype không inject được vào singleton',
        'Một instance riêng cho mỗi thread gọi method',
      ],
      answer: 1,
      explanation:
        'Việc inject chỉ xảy ra một lần khi singleton được tạo, nên singleton giữ mãi instance prototype đó. Muốn có instance mới mỗi lần dùng, inject ObjectProvider<ReportBuilder> và gọi getObject().',
    },
    {
      question:
        'Đoạn code: @Transactional public void importFile(Path p) throws IOException { batchRepo.save(batch); parser.parse(p); }. Nếu parser.parse ném IOException sau khi save, mặc định bản ghi batch sẽ ra sao?',
      options: [
        'Bị rollback vì mọi exception thoát khỏi method đều gây rollback',
        'Bị rollback nếu dùng JPA, được commit nếu dùng JDBC thuần',
        'Transaction treo lại cho tới khi hết transaction timeout',
        'Được commit vì IOException là checked exception',
      ],
      answer: 3,
      explanation:
        'Mặc định Spring chỉ rollback với RuntimeException và Error; checked exception như IOException vẫn dẫn tới commit. Muốn rollback, khai báo @Transactional(rollbackFor = IOException.class).',
    },
    {
      question:
        'Trong class @Configuration(proxyBeanMethods = false), method @Bean orderService() gọi trực tiếp clock() – cũng là một method @Bean trong cùng class. Kết quả là gì?',
      options: [
        'orderService nhận đúng singleton Clock đang có trong container',
        'Ứng dụng không khởi động được vì phát hiện vòng phụ thuộc',
        'orderService nhận một object Clock mới, khác với bean trong container',
        'Spring ném exception vì không được gọi method @Bean trực tiếp',
      ],
      answer: 2,
      explanation:
        'Ở lite mode, class cấu hình không được bọc bằng proxy CGLIB nên clock() chỉ là lời gọi method Java bình thường và tạo object mới. Cách đúng là nhận Clock qua tham số của method @Bean.',
    },
    {
      question:
        'Method placeOrder() có @Transactional gọi notificationService.sendAsync(order), một method @Async ở bean khác (đã bật @EnableAsync). Phát biểu nào đúng?',
      options: [
        'sendAsync chạy trên thread của TaskExecutor nên không thuộc transaction của placeOrder',
        'sendAsync chạy trong cùng transaction nên sẽ rollback cùng placeOrder',
        'sendAsync luôn chờ transaction của placeOrder commit xong rồi mới chạy',
        '@Async bị bỏ qua khi được gọi từ bên trong một method @Transactional',
      ],
      answer: 0,
      explanation:
        'Transaction được gắn vào thread hiện tại qua ThreadLocal, nên code chạy trên thread khác không thấy transaction đó. @Async không tự chờ commit; nếu cần hành động sau commit phải dùng cơ chế khác.',
    },
    {
      question: 'Trong vòng đời bean, proxy AOP (ví dụ proxy cho @Transactional) thường được tạo ở bước nào?',
      options: [
        'Trước khi container gọi constructor của bean',
        'Trong BeanPostProcessor#postProcessAfterInitialization, sau các callback khởi tạo',
        'Khi context đóng, ngay trước callback @PreDestroy',
        'Ở lần đầu tiên một method của bean được gọi từ bên ngoài',
      ],
      answer: 1,
      explanation:
        'BeanPostProcessor có thể thay bean gốc bằng object khác; Spring tạo proxy AOP ở bước sau khởi tạo. Vì vậy bean khác nhận được proxy, còn lời gọi trong constructor hay @PostConstruct không đi qua proxy.',
    },
  ],
  'spring-boot': [
    {
      question:
        'Starter nội bộ khai báo bean AuditClient với @ConditionalOnMissingBean. Một service dùng starter này tự khai báo @Bean AuditClient của riêng mình. Điều gì xảy ra?',
      options: [
        'Ứng dụng lỗi NoUniqueBeanDefinitionException khi khởi động',
        'Bean của starter được ưu tiên vì auto-configuration nạp trước',
        'Bean của starter lùi lại, chỉ bean do service khai báo được dùng',
        'Hai bean cùng tồn tại và Spring chọn theo thứ tự alphabet',
      ],
      answer: 2,
      explanation:
        'Auto-configuration được xử lý sau cấu hình của ứng dụng, và @ConditionalOnMissingBean khiến bean của starter chỉ được tạo khi chưa có bean cùng kiểu. Đây là cơ chế cho phép ghi đè hành vi mặc định.',
    },
    {
      question:
        'application.yml đặt server.port: 8080, biến môi trường SERVER_PORT=9090 và ứng dụng được chạy với tham số --server.port=7070. Ứng dụng lắng nghe ở cổng nào?',
      options: ['7070', '9090', '8080', 'Không khởi động vì cấu hình xung đột'],
      answer: 0,
      explanation:
        'Tham số dòng lệnh có độ ưu tiên cao hơn biến môi trường, và biến môi trường cao hơn file application.yml. Spring Boot không coi đây là xung đột mà áp dụng nguồn có ưu tiên cao nhất.',
    },
    {
      question:
        'Controller có @PostMapping public ResponseEntity<OrderResponse> create(@RequestBody CreateOrderRequest req), còn record CreateOrderRequest có @NotBlank String customerId. Client gửi customerId rỗng thì sao?',
      options: [
        'Trả 400 vì Bean Validation tự chạy với mọi @RequestBody',
        'Request đi thẳng vào service vì thiếu @Valid nên ràng buộc không được kiểm tra',
        'Trả 422 Unprocessable Content do Hibernate Validator',
        'Jackson từ chối parse JSON và trả 415 Unsupported Media Type',
      ],
      answer: 1,
      explanation:
        'Các annotation ràng buộc chỉ được kiểm tra khi có @Valid (hoặc @Validated) trước tham số. Thiếu nó, dữ liệu sai lọt vào tầng service mà không có lỗi nào.',
    },
    {
      question: 'POST /api/v1/orders tạo đơn hàng thành công. Response nào đúng chuẩn REST nhất?',
      options: [
        '200 OK kèm body chứa id của đơn hàng',
        '204 No Content và không có body',
        '202 Accepted kèm header Retry-After',
        '201 Created kèm header Location trỏ tới /api/v1/orders/{id}',
      ],
      answer: 3,
      explanation:
        '201 Created cho biết tài nguyên mới đã được tạo, header Location chỉ địa chỉ của nó. 202 chỉ dùng khi yêu cầu được nhận và sẽ xử lý bất đồng bộ.',
    },
    {
      question:
        'Đội vận hành đề xuất đưa kiểm tra kết nối database vào liveness probe của Kubernetes cho service đơn hàng. Vì sao đây thường là ý tưởng không tốt?',
      options: [
        'Liveness probe của Kubernetes không gọi được endpoint HTTP',
        'Khi database sập, Kubernetes khởi động lại hàng loạt pod mà không giải quyết được gì, còn làm tình hình tệ hơn',
        'Liveness probe chỉ được chạy một lần lúc pod khởi động',
        'Actuator không cho phép thêm health indicator vào bất kỳ nhóm health nào',
      ],
      answer: 1,
      explanation:
        'Liveness trả lời câu hỏi process có cần khởi động lại không; lỗi của dependency bên ngoài không được sửa bằng restart. Trạng thái database phù hợp hơn với readiness, để tạm ngừng nhận traffic.',
    },
  ],
  'spring-data': [
    {
      question: 'Nếu không khai báo thuộc tính fetch, quan hệ @ManyToOne trong JPA mặc định là gì?',
      options: [
        'LAZY',
        'EAGER',
        'Tuỳ theo dialect Hibernate của database',
        'LAZY nếu quan hệ được khai báo optional = true',
      ],
      answer: 1,
      explanation:
        'Theo đặc tả JPA, @ManyToOne và @OneToOne mặc định EAGER, còn @OneToMany và @ManyToMany mặc định LAZY. Khuyến nghị là đặt tường minh LAZY và tải theo use case.',
    },
    {
      question:
        'Trong một method @Transactional: Order o = orders.findById(id).orElseThrow(); o.markPaid(); và không gọi save(). Khi method kết thúc bình thường, điều gì xảy ra?',
      options: [
        'Thay đổi bị mất vì chưa gọi orders.save(o)',
        'Hibernate ném exception vì entity bị sửa ngoài repository',
        'Hibernate phát hiện thay đổi khi flush và sinh câu UPDATE trước khi commit',
        'Thay đổi chỉ được ghi xuống khi gọi entityManager.merge(o)',
      ],
      answer: 2,
      explanation:
        'Entity đang ở trạng thái managed nên dirty checking so sánh với snapshot lúc tải và tự sinh UPDATE khi flush. merge chỉ cần cho entity đã detached.',
    },
    {
      question:
        'Repository có method List<Order> findAllWithLines(Pageable pageable) với @Query("select o from Order o join fetch o.lines"). Gọi với PageRequest.of(0, 20) thì Hibernate làm gì?',
      options: [
        'Tải toàn bộ kết quả từ database rồi phân trang trong bộ nhớ, kèm cảnh báo trong log',
        'Thêm LIMIT 20 vào SQL và trả đúng 20 đơn hàng',
        'Tự tách thành hai câu: lấy 20 id trước rồi fetch dữ liệu theo id',
        'Từ chối query ngay lúc khởi động ứng dụng',
      ],
      answer: 0,
      explanation:
        'Khi fetch join một collection, mỗi đơn hàng nhân thành nhiều dòng nên SQL không giới hạn được theo số đơn; Hibernate phân trang trong bộ nhớ. Cách xử lý là query trang id trước rồi fetch theo id, hoặc dùng batch fetching.',
    },
    {
      question:
        'Bản ghi audit "PAYMENT_ATTEMPT" phải được lưu lại kể cả khi transaction thanh toán chính bị rollback. Method ghi audit nên dùng propagation nào?',
      options: ['REQUIRED', 'MANDATORY', 'SUPPORTS', 'REQUIRES_NEW'],
      answer: 3,
      explanation:
        'REQUIRES_NEW tạm dừng transaction hiện tại và mở transaction vật lý mới, commit độc lập. REQUIRED sẽ tham gia transaction chính nên bị rollback theo; đổi lại REQUIRES_NEW tốn thêm một connection.',
    },
    {
      question:
        'Một developer sửa nội dung file V3__add_index.sql vốn đã được Flyway áp dụng trên staging, rồi deploy lại. Điều gì xảy ra và nên làm gì?',
      options: [
        'Flyway tự áp dụng lại V3 với nội dung mới',
        'Flyway báo checksum không khớp và dừng; nên hoàn tác thay đổi và viết migration V4 mới',
        'Flyway bỏ qua thay đổi vì V3 đã có trong lịch sử',
        'Hibernate tự đồng bộ schema nhờ ddl-auto=validate',
      ],
      answer: 1,
      explanation:
        'Flyway lưu checksum của từng migration trong flyway_schema_history và từ chối khi file đã áp dụng bị sửa. Migration đã chạy là bất biến; mọi thay đổi phải nằm trong migration mới.',
    },
  ],
  'spring-security': [
    {
      question: 'Trong Spring Security, thành phần nào quyết định SecurityFilterChain nào sẽ xử lý một request?',
      options: [
        'DispatcherServlet, dựa trên mapping của controller',
        'DelegatingFilterProxy, dựa trên tên bean',
        'FilterChainProxy, chọn chain đầu tiên có securityMatcher khớp request',
        'AuthorizationFilter của chain mặc định',
      ],
      answer: 2,
      explanation:
        'DelegatingFilterProxy chỉ là cầu nối từ Servlet container sang bean FilterChainProxy. FilterChainProxy giữ danh sách SecurityFilterChain và dùng chain đầu tiên khớp theo thứ tự @Order.',
    },
    {
      question:
        'UserDetails được tạo bằng User.withUsername("an").authorities("ADMIN") và luật URL là requestMatchers("/admin/**").hasRole("ADMIN"). Người dùng an gọi /admin/users thì sao?',
      options: [
        'Bị từ chối 403 vì hasRole("ADMIN") yêu cầu authority ROLE_ADMIN',
        'Được phép vì tên authority trùng với tên role',
        'Bị 401 vì người dùng chưa được xác thực',
        'Ứng dụng không khởi động vì authority thiếu tiền tố',
      ],
      answer: 0,
      explanation:
        'hasRole tự thêm tiền tố ROLE_ khi so sánh, nên authority "ADMIN" không khớp. Dùng .roles("ADMIN") khi tạo user (tự thêm tiền tố) hoặc kiểm tra bằng hasAuthority("ADMIN").',
    },
    {
      question:
        'Resource server cấu hình issuer-uri và dùng converter mặc định. Access token có claim "scope": "orders:read orders:write". Authority nào được tạo?',
      options: [
        'ROLE_orders:read và ROLE_orders:write',
        'SCOPE_orders:read và SCOPE_orders:write',
        'orders:read và orders:write, không có tiền tố',
        'Không có authority nào cho tới khi viết converter riêng',
      ],
      answer: 1,
      explanation:
        'JwtGrantedAuthoritiesConverter mặc định đọc claim scope hoặc scp và thêm tiền tố SCOPE_. Role nằm trong claim tuỳ biến (như realm_access.roles của Keycloak) mới cần converter riêng.',
    },
    {
      question:
        'Cấu hình: authorizeHttpRequests(auth -> auth.requestMatchers("/api/**").authenticated().requestMatchers("/api/admin/**").hasRole("ADMIN").anyRequest().denyAll()). Hậu quả là gì?',
      options: [
        'Chỉ ADMIN vào được /api/admin/** vì luật cụ thể luôn được ưu tiên',
        'Spring gộp hai luật nên /api/admin/** cần vừa đăng nhập vừa là ADMIN',
        'Mọi request tới /api/** đều bị từ chối vì có denyAll()',
        'Mọi người dùng đã đăng nhập đều vào được /api/admin/** vì luật khớp đầu tiên quyết định',
      ],
      answer: 3,
      explanation:
        'Các luật được kiểm tra theo thứ tự khai báo và luật đầu tiên khớp sẽ quyết định, nên /api/admin/** đã khớp /api/** trước. Luật cụ thể phải đặt trước luật chung.',
    },
    {
      question:
        'Ứng dụng web Thymeleaf dùng form login và session cookie bị lỗi 403 khi submit một form POST tự viết. Một thành viên đề xuất thêm csrf.disable(). Bạn nên phản hồi thế nào?',
      options: [
        'Đồng ý, vì CSRF chỉ cần cho REST API',
        'Đồng ý, miễn là ứng dụng chạy qua HTTPS',
        'Không đồng ý; ứng dụng dựa trên cookie nên cần CSRF, hãy đảm bảo form gửi kèm CSRF token',
        'Không đồng ý; nên đổi form sang method GET để không cần CSRF token',
      ],
      answer: 2,
      explanation:
        'Trình duyệt tự gắn cookie session vào request do trang khác khởi tạo, nên ứng dụng dùng cookie phải có CSRF token. Đổi sang GET để thay đổi trạng thái còn tệ hơn vì GET không được bảo vệ.',
    },
  ],
  'reactive-testing': [
    {
      question: 'Trong Reactive Streams, backpressure được thực hiện như thế nào?',
      options: [
        'Publisher tự đo tốc độ CPU của subscriber để điều chỉnh',
        'Subscriber gọi Subscription.request(n) để báo số phần tử sẵn sàng nhận',
        'Reactor tự động bỏ mọi phần tử vượt quá khả năng xử lý',
        'Subscriber khoá thread của publisher bằng lock cho tới khi xử lý xong',
      ],
      answer: 1,
      explanation:
        'Publisher không được phát nhiều hơn số phần tử subscriber đã yêu cầu qua request(n). Việc bỏ phần tử chỉ xảy ra khi bạn chọn tường minh chiến lược như onBackpressureDrop.',
    },
    {
      question:
        'Trong một handler WebFlux chạy trên Netty: return Mono.just(id).map(i -> jpaOrderRepository.findById(i).orElseThrow()); Vấn đề chính là gì?',
      options: [
        'Toán tử map không được phép dùng với Mono',
        'Mono.just khiến request được thực thi hai lần',
        'Không có vấn đề vì Spring tự chuyển lời gọi JPA thành non-blocking',
        'Lời gọi JPA blocking chạy trên thread event loop, có thể làm cả server chậm theo',
      ],
      answer: 3,
      explanation:
        'JPA/JDBC là blocking; chạy trong pipeline reactive sẽ chiếm một trong số ít thread event loop. Dùng R2DBC, hoặc bọc bằng Mono.fromCallable(...).subscribeOn(Schedulers.boundedElastic()).',
    },
    {
      question:
        'Service mới là API nghiệp vụ CRUD dùng JPA và PostgreSQL, team quen code imperative, cần phục vụ nhiều request đồng thời chủ yếu chờ I/O, chạy Java 21. Lựa chọn hợp lý nhất?',
      options: [
        'Spring MVC với spring.threads.virtual.enabled=true',
        'Spring WebFlux nhưng giữ nguyên JPA cho tầng dữ liệu',
        'Spring MVC và tăng server.tomcat.threads.max lên 50.000',
        'Spring WebFlux và gọi .block() tại mọi chỗ truy cập database',
      ],
      answer: 0,
      explanation:
        'Virtual threads giữ được code imperative và JPA mà vẫn phục vụ nhiều request đang chờ I/O. WebFlux kèm JPA blocking gánh cả độ phức tạp của reactive lẫn giới hạn của blocking.',
    },
    {
      question:
        'Test @WebMvcTest(OrderController.class) thất bại với NoSuchBeanDefinitionException vì thiếu bean OrderService mà controller cần. Cách sửa đúng là gì?',
      options: [
        'Đổi sang @SpringBootTest để nạp toàn bộ context',
        'Thêm @ComponentScan("com.example") vào class test',
        'Khai báo @MockitoBean OrderService trong class test',
        'Đánh dấu OrderService bằng @Lazy',
      ],
      answer: 2,
      explanation:
        '@WebMvcTest cố ý chỉ nạp tầng web, không nạp @Service; dependency của controller cần được giả lập bằng @MockitoBean (hoặc @MockBean ở phiên bản cũ). Chuyển sang @SpringBootTest làm mất ý nghĩa của slice test.',
    },
    {
      question:
        'Bạn viết @DataJpaTest với PostgreSQLContainer gắn @ServiceConnection, trong khi H2 cũng có trên classpath test. Để chắc chắn test chạy trên PostgreSQL, nên thêm gì?',
      options: [
        '@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)',
        '@Transactional(propagation = Propagation.NEVER) trên class test',
        '@EnableJpaRepositories trên class test',
        'spring.jpa.hibernate.ddl-auto=create-drop trong cấu hình test',
      ],
      answer: 0,
      explanation:
        'Mặc định @DataJpaTest có thể thay DataSource bằng database nhúng; Replace.NONE giữ DataSource kết nối tới container. Các lựa chọn khác không ảnh hưởng tới việc chọn database.',
    },
  ],
};

export default quiz;
