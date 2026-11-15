import type { LessonFlashcards } from '../types';

const flashcards: LessonFlashcards = {
  'spring-core': [
    {
      front: 'Inversion of Control (IoC) là gì?',
      back: 'Chuyển quyền tạo và kết nối object từ code của bạn sang container. Class chỉ khai báo nó cần gì, Spring cung cấp object phù hợp khi khởi tạo; Dependency Injection là cách hiện thực IoC.',
    },
    {
      front: 'Vì sao constructor injection là lựa chọn mặc định?',
      back: 'Field có thể final, object luôn hợp lệ sau khi tạo, test chỉ cần new mà không cần Spring, và số dependency lộ rõ. Class chỉ có một constructor thì không cần @Autowired.',
    },
    {
      front: 'Xử lý thế nào khi có nhiều bean cùng kiểu?',
      back: 'Dùng @Primary cho bean mặc định, @Qualifier để chọn chính xác, hoặc inject List<T> hay Map<String, T> (key là tên bean) khi cần chọn implementation lúc chạy theo Strategy pattern.',
    },
    {
      front: 'Thứ tự các bước trong vòng đời bean?',
      back: 'Constructor, inject setter/field, callback Aware, BeanPostProcessor before, @PostConstruct, afterPropertiesSet, init-method, BeanPostProcessor after (thường tạo proxy). Khi context đóng: @PreDestroy, destroy, destroy-method.',
    },
    {
      front: 'Singleton của Spring khác Singleton pattern của GoF thế nào?',
      back: 'Spring tạo một instance cho mỗi ApplicationContext, không phải một instance cho cả JVM. Vì được nhiều thread dùng chung, bean singleton phải stateless hoặc thread-safe.',
    },
    {
      front: 'Container có gọi @PreDestroy cho bean prototype không?',
      back: 'Không. Container tạo bean prototype rồi giao cho bạn và không quản lý việc huỷ nó, nên bạn tự chịu trách nhiệm giải phóng tài nguyên.',
    },
    {
      front: 'Bean @RequestScope inject vào singleton hoạt động thế nào?',
      back: 'Qua scoped proxy: singleton giữ một proxy, mỗi lần gọi method proxy chuyển tới instance của HTTP request hiện tại. Gọi ngoài request, ví dụ trong job @Scheduled, sẽ ném exception.',
    },
    {
      front: '@Profile nên dùng cho việc gì?',
      back: 'Thay đổi hạ tầng theo môi trường như datasource, gateway giả lập, mức log. Không dùng để rẽ nhánh logic nghiệp vụ, vì code chạy trên production sẽ khác code đã test.',
    },
    {
      front: 'JDK dynamic proxy khác CGLIB proxy thế nào?',
      back: 'JDK proxy implement cùng interface với bean; CGLIB sinh class con kế thừa bean. Spring Boot mặc định dùng CGLIB, nên class và method final không thể bị proxy.',
    },
    {
      front: 'Các loại advice trong Spring AOP?',
      back: '@Before, @AfterReturning, @AfterThrowing, @After và @Around. @Around mạnh nhất vì bao quanh method và tự quyết định có gọi pjp.proceed() hay không.',
    },
    {
      front: 'Những giới hạn cần nhớ của @Async?',
      back: 'Cần @EnableAsync, chỉ có tác dụng khi gọi qua proxy, exception của method void đi tới AsyncUncaughtExceptionHandler. Executor mặc định có hàng đợi không giới hạn, nên cấu hình spring.task.execution.pool.',
    },
  ],
  'spring-boot': [
    {
      front: '@SpringBootApplication gồm những annotation nào?',
      back: '@SpringBootConfiguration (một @Configuration), @EnableAutoConfiguration và @ComponentScan quét package hiện tại trở xuống.',
    },
    {
      front: 'Spring Boot 3 nạp danh sách auto-configuration từ đâu?',
      back: 'Từ file META-INF/spring/org.springframework.boot.autoconfigure.AutoConfiguration.imports trong mỗi jar, mỗi dòng một class @AutoConfiguration. Từ Boot 3.0, spring.factories không còn dùng cho auto-configuration.',
    },
    {
      front: 'Làm sao biết vì sao một auto-configuration được hoặc không được áp dụng?',
      back: 'Chạy ứng dụng với --debug để in condition evaluation report, hoặc xem endpoint /actuator/conditions.',
    },
    {
      front: 'Cấu trúc chuẩn của một starter tự viết?',
      back: 'Module autoconfigure chứa code và điều kiện, module starter chỉ là POM gom dependency. Không đặt tên bắt đầu bằng spring-boot- và kiểm thử bằng ApplicationContextRunner.',
    },
    {
      front: 'Relaxed binding là gì?',
      back: 'Một property có thể được viết ở nhiều dạng. Ví dụ spring.datasource.url có thể được ghi đè bằng biến môi trường SPRING_DATASOURCE_URL, rất tiện khi chạy trên container.',
    },
    {
      front: '@ConfigurationProperties hơn @Value ở điểm nào?',
      back: 'Gom cấu hình vào một object có kiểu, tự chuyển đổi như 3s thành Duration, validate bằng @Validated và dừng ngay khi khởi động nếu sai, IDE gợi ý được tên property.',
    },
    {
      front: 'Safe và idempotent khác nhau thế nào?',
      back: 'Safe là không đổi trạng thái server, như GET. Idempotent là gọi một hay nhiều lần cho cùng kết quả trên server, như GET, PUT, DELETE. POST không safe cũng không idempotent.',
    },
    {
      front: 'Khi nào cần tăng version của API?',
      back: 'Chỉ khi có thay đổi phá vỡ tương thích: xoá field, đổi kiểu, đổi ý nghĩa. Thêm field hay endpoint mới không cần version mới nếu client bỏ qua field lạ.',
    },
    {
      front: 'ProblemDetail trong Spring 6 là gì?',
      back: 'Class hiện thực RFC 9457 (application/problem+json) với type, title, status, detail, instance và field mở rộng. Bật spring.mvc.problemdetails.enabled để exception có sẵn của Spring MVC trả theo định dạng này.',
    },
    {
      front: 'springdoc-openapi cung cấp những endpoint nào?',
      back: 'Đặc tả JSON ở /v3/api-docs và giao diện Swagger UI ở /swagger-ui.html. Trên production nên tắt Swagger UI hoặc đặt sau xác thực.',
    },
    {
      front: 'Liveness và readiness probe khác nhau thế nào?',
      back: 'Liveness trả lời process có cần khởi động lại không; readiness trả lời có nên nhận traffic không. Bật bằng management.endpoint.health.probes.enabled, có ở /actuator/health/liveness và /readiness.',
    },
  ],
  'spring-data': [
    {
      front: 'Phía sở hữu (owning side) của quan hệ JPA là gì?',
      back: 'Phía giữ khoá ngoại, thường là @ManyToOne với @JoinColumn. Hibernate chỉ nhìn phía sở hữu khi ghi khoá ngoại, nên cần method tiện ích cập nhật cả hai phía.',
    },
    {
      front: 'GenerationType.IDENTITY và SEQUENCE khác nhau ra sao?',
      back: 'IDENTITY buộc Hibernate INSERT ngay để biết id nên không gom JDBC batch được. SEQUENCE với allocationSize cấp trước một dải id trong bộ nhớ; allocationSize phải khớp INCREMENT BY của sequence.',
    },
    {
      front: 'Vì sao luôn dùng EnumType.STRING?',
      back: 'ORDINAL lưu số thứ tự, chỉ cần chèn một giá trị vào giữa enum là dữ liệu cũ sai nghĩa. STRING lưu tên nên an toàn khi enum thay đổi.',
    },
    {
      front: '@Version dùng để làm gì?',
      back: 'Bật optimistic locking: câu UPDATE kèm điều kiện version, nếu bản ghi đã bị người khác sửa thì Spring ném ObjectOptimisticLockingFailureException thay vì âm thầm ghi đè.',
    },
    {
      front: 'Vì sao nên đặt spring.jpa.open-in-view=false?',
      back: 'Open Session in View giữ session tới khi render xong response, che giấu LazyInitializationException, khiến query chạy ngầm ở tầng web và giữ connection lâu hơn.',
    },
    {
      front: 'Bốn cách xử lý N+1 query?',
      back: 'join fetch trong JPQL, @EntityGraph, batch fetching (hibernate.default_batch_fetch_size hoặc @BatchSize) và projection DTO cho màn hình chỉ đọc.',
    },
    {
      front: 'MultipleBagFetchException xảy ra khi nào?',
      back: 'Khi fetch join hai collection kiểu List cùng lúc. Đổi sang Set vẫn tạo tích Descartes rất lớn, nên tải từng collection bằng query riêng.',
    },
    {
      front: 'First-level cache trong Hibernate là gì?',
      back: 'Chính là persistence context: luôn bật, sống trong một transaction, cùng id luôn trả về cùng object và findById hai lần chỉ sinh một câu SELECT. Không chia sẻ giữa các request.',
    },
    {
      front: '@Transactional(readOnly = true) ảnh hưởng gì tới Hibernate?',
      back: 'Spring chuyển flush mode của Hibernate sang MANUAL, nên Hibernate không flush và bỏ qua dirty checking. Phù hợp với method chỉ đọc.',
    },
    {
      front: 'UnexpectedRollbackException xuất hiện khi nào?',
      back: 'Method REQUIRED bên trong ném RuntimeException và đánh dấu transaction chung là rollback-only, method bên ngoài bắt exception rồi tiếp tục; khi cố commit, Spring ném UnexpectedRollbackException.',
    },
    {
      front: 'Second-level cache phù hợp với loại dữ liệu nào?',
      back: 'Dữ liệu tham chiếu đọc nhiều ghi ít như danh mục, tỉnh thành. Không phù hợp với dữ liệu đổi liên tục, dữ liệu bị hệ thống khác sửa thẳng vào database, hoặc nhiều instance dùng cache cục bộ.',
    },
    {
      front: 'Mẫu expand/contract khi đổi schema là gì?',
      back: 'Đổi schema không downtime qua các bước tương thích: thêm cột mới, deploy code ghi cả hai cột, backfill, chuyển đọc sang cột mới, bản phát hành sau mới xoá cột cũ.',
    },
  ],
  'spring-security': [
    {
      front: 'DelegatingFilterProxy làm nhiệm vụ gì?',
      back: 'Là Servlet filter làm cầu nối: lấy bean FilterChainProxy từ ApplicationContext và giao request cho nó, vì Servlet container không biết gì về bean Spring.',
    },
    {
      front: 'SecurityContextHolder lưu gì và lưu ở đâu?',
      back: 'Lưu SecurityContext chứa Authentication của request hiện tại, mặc định gắn vào thread qua ThreadLocal. Trong controller có thể lấy người dùng bằng @AuthenticationPrincipal.',
    },
    {
      front: 'AuthenticationManager liên quan AuthenticationProvider thế nào?',
      back: 'AuthenticationManager, thường là ProviderManager, uỷ quyền cho danh sách AuthenticationProvider. Ví dụ DaoAuthenticationProvider dùng UserDetailsService và PasswordEncoder, JwtAuthenticationProvider dùng JwtDecoder.',
    },
    {
      front: 'Thành phần nào quyết định trả 401 hay 403?',
      back: 'ExceptionTranslationFilter. Chưa xác thực thì gọi AuthenticationEntryPoint (401 hoặc chuyển tới trang login); đã xác thực nhưng thiếu quyền thì gọi AccessDeniedHandler (403).',
    },
    {
      front: 'Vì sao dùng DelegatingPasswordEncoder?',
      back: 'Hash được lưu kèm tiền tố thuật toán như {bcrypt}, cho phép nâng cấp thuật toán dần mà mật khẩu cũ vẫn kiểm tra được. Mặc định dùng bcrypt.',
    },
    {
      front: 'Khi nào HTTP Basic là chấp nhận được?',
      back: 'Chỉ khi chạy qua HTTPS và cho công cụ nội bộ hoặc script. Base64 không phải mã hoá bảo mật và username, password đi kèm mọi request.',
    },
    {
      front: 'Spring Security xử lý JWT bằng những thành phần nào?',
      back: 'BearerTokenAuthenticationFilter đọc header Authorization, JwtDecoder kiểm tra chữ ký và thời hạn, JwtAuthenticationConverter biến claim thành authority. Không cần tự viết filter.',
    },
    {
      front: 'Resource server làm gì với issuer-uri?',
      back: 'Dùng OIDC discovery để tìm JWK Set, rồi kiểm tra chữ ký, exp, nbf, iss và aud nếu cấu hình audiences. Khoá được cache và tải lại khi gặp kid lạ.',
    },
    {
      front: 'Opaque token khác JWT ở resource server thế nào?',
      back: 'Opaque token phải gọi endpoint introspection của IdP (thường kèm cache), đổi lại thu hồi được tức thì. JWT được kiểm tra cục bộ nhưng khó thu hồi trước khi hết hạn.',
    },
    {
      front: 'Hai nhu cầu chính mà OAuth2 Client phục vụ?',
      back: 'Đăng nhập người dùng qua IdP bằng oauth2Login theo luồng Authorization Code, và lấy token để gọi service khác, ví dụ Client Credentials qua OAuth2AuthorizedClientManager.',
    },
    {
      front: '@EnableMethodSecurity bật những gì?',
      back: 'Bật @PreAuthorize và @PostAuthorize, thay cho @EnableGlobalMethodSecurity đã deprecate. Thiếu nó, các annotation này bị bỏ qua mà không có lỗi nào.',
    },
    {
      front: 'Biểu thức #orderId trong @PreAuthorize cần điều kiện gì?',
      back: 'Tên tham số phải có lúc chạy: biên dịch với cờ -parameters (spring-boot-starter-parent đã bật sẵn) hoặc đánh dấu tham số bằng @P("orderId").',
    },
  ],
  'reactive-testing': [
    {
      front: 'Mono và Flux khác nhau thế nào?',
      back: 'Mono phát 0 hoặc 1 phần tử, Flux phát 0 đến N phần tử và có thể vô hạn. Cả hai đều là Publisher theo đặc tả Reactive Streams.',
    },
    {
      front: 'Câu "không có gì xảy ra cho tới khi subscribe" nghĩa là gì?',
      back: 'Mono và Flux chỉ là bản mô tả công việc; luồng chỉ chạy khi có subscriber. Trong WebFlux, framework tự subscribe khi controller trả về Mono hoặc Flux.',
    },
    {
      front: 'map, flatMap và concatMap khác nhau ra sao?',
      back: 'map biến đổi đồng bộ từng phần tử. flatMap biến mỗi phần tử thành một publisher và chạy đồng thời, không giữ thứ tự. concatMap giống flatMap nhưng chạy tuần tự và giữ thứ tự.',
    },
    {
      front: 'Chiến lược backpressure khi nguồn không thể chậm lại?',
      back: 'onBackpressureBuffer đệm có giới hạn, onBackpressureDrop bỏ phần tử thừa, onBackpressureLatest chỉ giữ phần tử mới nhất; limitRate điều chỉnh số phần tử được yêu cầu mỗi đợt.',
    },
    {
      front: 'Buộc phải gọi thư viện blocking trong WebFlux thì làm sao?',
      back: 'Bọc bằng Mono.fromCallable(...) và chuyển sang subscribeOn(Schedulers.boundedElastic()). Tốt nhất là dùng driver reactive end-to-end; BlockHound giúp phát hiện lời gọi blocking trong test.',
    },
    {
      front: 'Pinning của virtual thread là gì?',
      back: 'Trên Java 21, virtual thread bị ghim vào carrier khi block trong synchronized hoặc native call, mất lợi ích. JDK 24 (JEP 491) loại bỏ phần lớn trường hợp do synchronized; trên Java 21 ưu tiên ReentrantLock ở code nóng.',
    },
    {
      front: 'Khi nào nên chọn WebFlux thay vì MVC + virtual threads?',
      back: 'Khi bài toán là streaming (SSE, WebSocket), gateway hoặc proxy, nhiều kết nối dài, cần backpressure, hoặc toàn bộ stack đã reactive. Các trường hợp còn lại, MVC + virtual threads là mặc định hợp lý.',
    },
    {
      front: '@WebMvcTest nạp và không nạp những gì?',
      back: 'Nạp controller, @ControllerAdvice, Jackson, converter, filter, WebMvcConfigurer và auto-configuration Spring Security. Không nạp @Service, @Repository; class cấu hình bảo mật riêng cần @Import.',
    },
    {
      front: 'Đặc điểm mặc định của @DataJpaTest?',
      back: 'Nạp entity, repository, EntityManager, Flyway hoặc Liquibase; mỗi test chạy trong transaction và rollback khi xong; có thể thay DataSource bằng database nhúng nếu có trên classpath.',
    },
    {
      front: 'Vì sao gọi em.clear() trong test repository?',
      back: 'Để xoá persistence context và buộc query đọc lại từ database. Thiếu nó, kết quả có thể đến từ first-level cache và test không thật sự kiểm tra câu query.',
    },
    {
      front: '@ServiceConnection làm gì?',
      back: 'Từ Spring Boot 3.1, đọc thông tin kết nối từ container Testcontainers và tạo bean ConnectionDetails, không cần khai báo URL, user hay cổng. Container không được hỗ trợ thì dùng @DynamicPropertySource.',
    },
    {
      front: 'Cách giữ bộ test tích hợp chạy nhanh?',
      back: 'Tái sử dụng Spring context bằng cách hạn chế tổ hợp @MockitoBean và property khác nhau, dùng singleton container, ghim phiên bản image, và dùng Awaitility thay cho Thread.sleep.',
    },
  ],
};

export default flashcards;
