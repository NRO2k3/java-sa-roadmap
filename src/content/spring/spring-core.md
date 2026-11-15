Mọi ứng dụng Spring Boot đều đứng trên hai cơ chế nền tảng: **IoC container** tạo và kết nối các object, còn **AOP** bọc các object đó bằng proxy để thêm transaction, bảo mật, cache… mà không sửa code nghiệp vụ. Hiểu hai cơ chế này, bạn sẽ giải thích được vì sao `@Transactional` đôi khi "không chạy", vì sao bean prototype lại hành xử như singleton, hay vì sao ứng dụng không khởi động được vì vòng phụ thuộc. Với Dev Lead và Solution Architect, đây là kiến thức để review code và chẩn đoán sự cố bằng lập luận thay vì đoán mò.

## Mục tiêu bài học

- Giải thích được Inversion of Control, Dependency Injection và lý do Spring khuyến nghị constructor injection.
- Mô tả vòng đời của một bean và chọn đúng scope (singleton, prototype, request) cho từng loại object.
- Cấu hình bean bằng `@Configuration`, `@Bean`, `@Profile` và `@Conditional`.
- Hiểu cơ chế proxy đứng sau `@Transactional`, `@Async` và tự viết được một aspect đơn giản.
- Nhận diện và sửa các lỗi phổ biến do proxy và scope gây ra.

## Inversion of Control và Dependency Injection

Trong code "tự quản", một class tự tạo dependency của nó: `this.repository = new JdbcOrderRepository(dataSource)`. Cách này gắn chặt class vào một implementation cụ thể, khó thay bằng bản giả khi test, và logic khởi tạo bị rải khắp nơi.

**Inversion of Control** (IoC – đảo ngược điều khiển) nghĩa là chuyển quyền tạo và kết nối object từ code của bạn sang một thành phần bên ngoài – ở đây là Spring container. **Dependency Injection** (DI – tiêm phụ thuộc) là cách hiện thực IoC: class chỉ *khai báo* nó cần gì, container sẽ *cung cấp* object phù hợp khi khởi tạo.

### Container: BeanFactory và ApplicationContext

Container đọc các **bean definition** (công thức tạo bean) từ hai nguồn chính: class được đánh dấu `@Component`, `@Service`, `@Repository`, `@Controller` (tìm thấy qua *component scan*) và các method `@Bean` trong class cấu hình. Sau đó nó tạo object, nối dependency và quản lý vòng đời của chúng. `BeanFactory` là interface cơ bản nhất; `ApplicationContext` mở rộng thêm event, `Environment`/profile, i18n và tích hợp AOP. Trong Spring Boot bạn luôn làm việc với `ApplicationContext`.

### Ba kiểu injection

| Kiểu | Cách viết | Ưu điểm | Nhược điểm |
|---|---|---|---|
| Constructor | Tham số của constructor | Field `final`, object luôn hợp lệ sau khi tạo, test không cần Spring | Constructor dài khi có nhiều dependency (đó cũng là tín hiệu class đang làm quá nhiều việc) |
| Setter | Method `setXxx` có `@Autowired` | Phù hợp dependency tuỳ chọn, có thể thay đổi | Object có thể ở trạng thái thiếu dependency |
| Field | `@Autowired` trên field | Viết ngắn | Không `final` được, phải dùng reflection để test, che giấu số lượng dependency |

Constructor injection là lựa chọn mặc định cho dependency bắt buộc. Nếu class chỉ có **một constructor**, Spring tự dùng nó mà không cần `@Autowired`.

```java
@Service
public class OrderService {

    private final OrderRepository orderRepository;
    private final PaymentGateway paymentGateway;
    private final Clock clock;

    public OrderService(OrderRepository orderRepository,
                        PaymentGateway paymentGateway,
                        Clock clock) {
        this.orderRepository = orderRepository;
        this.paymentGateway = paymentGateway;
        this.clock = clock;
    }

    public Order place(PlaceOrderCommand cmd) {
        Order order = Order.create(cmd, clock.instant());
        paymentGateway.authorize(order.total());
        return orderRepository.save(order);
    }
}
```

Khi test, bạn chỉ cần `new OrderService(fakeRepo, fakeGateway, Clock.fixed(...))` – không cần khởi động container, test chạy trong vài mili-giây.

### Khi có nhiều bean cùng kiểu

Nếu có hai bean cùng implement `PaymentGateway`, Spring báo `NoUniqueBeanDefinitionException`. Có ba cách xử lý:

- `@Primary` trên bean mặc định.
- `@Qualifier("tenBean")` trên tham số constructor để chọn chính xác.
- Inject cả tập hợp: `List<PaymentGateway>` hoặc `Map<String, PaymentGateway>` (key là tên bean) – rất hợp với Strategy pattern khi cần chọn implementation theo dữ liệu lúc chạy.

### Vòng phụ thuộc (circular dependency)

Khi A cần B và B cần A, constructor injection làm ứng dụng **thất bại ngay lúc khởi động**. Từ Spring Boot 2.6, vòng phụ thuộc bị cấm mặc định kể cả với field injection. Đây là điều tốt: vòng phụ thuộc là dấu hiệu thiết kế sai. Cách sửa đúng là tách phần dùng chung ra class thứ ba, hoặc đảo chiều phụ thuộc bằng event (`ApplicationEventPublisher`), chứ không phải bật lại `spring.main.allow-circular-references`.

## Vòng đời bean

Với mỗi bean, container đi qua chuỗi bước sau:

```text
1. Tạo instance (gọi constructor, inject dependency qua constructor)
2. Inject qua setter/field
3. Gọi các callback *Aware (BeanNameAware, ApplicationContextAware…)
4. BeanPostProcessor#postProcessBeforeInitialization
5. @PostConstruct → InitializingBean#afterPropertiesSet → init-method
6. BeanPostProcessor#postProcessAfterInitialization   ← proxy AOP thường được tạo ở đây
7. Bean sẵn sàng, được inject cho bean khác
   … ứng dụng chạy …
8. Khi context đóng: @PreDestroy → DisposableBean#destroy → destroy-method
```

Vài điểm thực tế cần nhớ:

- `@PostConstruct` và `@PreDestroy` (gói `jakarta.annotation`) là cách phổ biến nhất để chạy logic khởi tạo/dọn dẹp. Tại thời điểm `@PostConstruct`, mọi dependency đã được inject – điều mà constructor không đảm bảo nếu bạn dùng setter/field injection.
- **BeanPostProcessor** là điểm mở rộng mạnh nhất của container: nó có thể thay bean gốc bằng một object khác. Spring dùng chính cơ chế này để thay bean của bạn bằng proxy (bước 6). Vì vậy, object mà bean khác nhận được thường *không phải* instance bạn viết, mà là proxy bọc ngoài nó.
- Singleton được tạo **ngay khi khởi động** (eager) để lỗi cấu hình lộ ra sớm. `@Lazy` trì hoãn việc tạo tới lần dùng đầu tiên, nhưng đổi lại lỗi có thể xuất hiện giữa lúc đang phục vụ request.
- Đừng làm việc nặng (gọi API ngoài, nạp hàng triệu bản ghi) trong `@PostConstruct` vì nó chặn quá trình khởi động. Dùng `ApplicationRunner` hoặc lắng nghe `ApplicationReadyEvent`.

### Scope của bean

| Scope | Số instance | Dùng khi |
|---|---|---|
| `singleton` (mặc định) | Một instance cho mỗi `ApplicationContext` | Service, repository, client – object không giữ trạng thái theo request |
| `prototype` | Mỗi lần container được yêu cầu bean thì tạo mới | Object có trạng thái, dùng một lần (builder, phiên xử lý) |
| `request` | Một instance cho mỗi HTTP request | Dữ liệu ngữ cảnh của request: tenant, correlation id |
| `session` | Một instance cho mỗi HTTP session | Dữ liệu gắn với phiên đăng nhập web |
| `application` | Một instance cho mỗi `ServletContext` | Hiếm dùng |

**Singleton của Spring khác Singleton pattern của GoF**: nó là "một instance trong một container", không phải "một instance trong JVM". Vì singleton được nhiều thread dùng chung, nó phải **stateless** hoặc thread-safe. Một field kiểu `private User currentUser` trong service singleton là lỗi race condition kinh điển.

Với **prototype**, container tạo object rồi giao cho bạn và *không gọi* callback hủy (`@PreDestroy`). Bẫy phổ biến nhất: inject một bean prototype vào bean singleton. Việc inject chỉ xảy ra **một lần** khi singleton được tạo, nên singleton giữ mãi đúng một instance prototype. Muốn có instance mới mỗi lần dùng, hãy inject `ObjectProvider<T>` và gọi `getObject()`.

Với **request scope**, annotation `@RequestScope` mặc định tạo *scoped proxy*: singleton nhận một proxy, và mỗi lần gọi method, proxy chuyển tiếp tới instance của request hiện tại. Gọi bean này ngoài một HTTP request (ví dụ trong job `@Scheduled`) sẽ ném exception vì không có request nào đang hoạt động.

```java
@Component
@Scope(ConfigurableBeanFactory.SCOPE_PROTOTYPE)
public class ReportBuilder {                 // có trạng thái → mỗi lần dùng cần object mới
    private final List<String> lines = new ArrayList<>();
    public ReportBuilder add(String line) { lines.add(line); return this; }
    public String build() { return String.join("\n", lines); }
}

@Component
@RequestScope                                // mỗi HTTP request một instance, inject qua proxy
public class RequestContext {
    private String tenantId;
    public String getTenantId() { return tenantId; }
    public void setTenantId(String tenantId) { this.tenantId = tenantId; }
}

@Service
public class ReportService {
    private final ObjectProvider<ReportBuilder> builders;
    private final RequestContext requestContext;

    public ReportService(ObjectProvider<ReportBuilder> builders, RequestContext requestContext) {
        this.builders = builders;
        this.requestContext = requestContext;
    }

    public String dailyReport() {
        ReportBuilder builder = builders.getObject();   // instance mới cho mỗi lần gọi
        return builder.add("Tenant: " + requestContext.getTenantId()).build();
    }
}
```

## Cấu hình bằng Java config

### @Configuration và @Bean

Dùng `@Bean` khi bạn không thể (hoặc không nên) gắn `@Component` lên class: thư viện bên thứ ba, hoặc khi việc khởi tạo cần logic. Tên bean mặc định là tên method.

Class `@Configuration` mặc định được Spring bọc bằng proxy CGLIB (`proxyBeanMethods = true`). Nhờ đó, khi một method `@Bean` gọi một method `@Bean` khác, bạn nhận lại **đúng singleton** đã có trong container chứ không phải object mới. Nếu đặt `proxyBeanMethods = false` ("lite mode" – cách các auto-configuration của Spring Boot dùng), ứng dụng khởi động nhanh hơn một chút, nhưng gọi trực tiếp method `@Bean` sẽ tạo object mới. Khi dùng lite mode, hãy nhận dependency qua **tham số** của method `@Bean`.

### @Profile

`@Profile` bật/tắt bean theo profile đang hoạt động (`spring.profiles.active=dev`). Hỗ trợ biểu thức như `"!prod"` hay `"dev | test"`. Profile nên dùng để thay **hạ tầng** (datasource, gateway giả lập, mức log), không nên dùng để rẽ nhánh logic nghiệp vụ – nếu không, code chạy trên production sẽ khác code bạn đã test.

### @Conditional

`@Conditional` nhận một class implement `Condition`; bean chỉ được đăng ký nếu `matches(...)` trả về `true`. Bản thân `@Profile` được xây trên cơ chế này. Spring Boot cung cấp sẵn các biến thể tiện dụng: `@ConditionalOnProperty`, `@ConditionalOnClass`, `@ConditionalOnMissingBean`… – nền móng của auto-configuration mà bạn sẽ gặp ở bài Spring Boot.

```java
@Configuration(proxyBeanMethods = false)
public class InfrastructureConfig {

    @Bean
    Clock clock() {
        return Clock.systemUTC();
    }

    @Bean
    @Profile("dev")
    PaymentGateway fakePaymentGateway() {
        return amount -> PaymentResult.approved("FAKE-" + UUID.randomUUID());
    }

    @Bean
    @Profile("!dev")
    PaymentGateway stripePaymentGateway(StripeProperties props) {   // nhận dependency qua tham số
        return new StripePaymentGateway(props.apiKey(), props.timeout());
    }

    @Bean
    @Conditional(OnLinuxCondition.class)
    DiskSpaceMonitor diskSpaceMonitor() {
        return new DiskSpaceMonitor(Path.of("/var/data"));
    }
}

class OnLinuxCondition implements Condition {
    @Override
    public boolean matches(ConditionContext context, AnnotatedTypeMetadata metadata) {
        String os = context.getEnvironment().getProperty("os.name", "");
        return os.toLowerCase().contains("linux");
    }
}
```

## Proxy và AOP

### Khái niệm AOP

Một số mối quan tâm cắt ngang (*cross-cutting concern*) xuất hiện ở hàng trăm method: transaction, phân quyền, đo thời gian, cache, retry. Lập trình hướng khía cạnh (**AOP** – Aspect-Oriented Programming) tách chúng ra một chỗ:

- **Aspect**: module chứa logic cắt ngang.
- **Join point**: điểm có thể chen logic vào; trong Spring AOP đó luôn là *việc thực thi một method*.
- **Pointcut**: biểu thức chọn join point, ví dụ "mọi method có `@Transactional`".
- **Advice**: đoạn code chạy tại join point: `@Before`, `@AfterReturning`, `@AfterThrowing`, `@After`, `@Around`.

Spring AOP hoạt động **lúc chạy bằng proxy**. AspectJ đầy đủ thì dệt (weave) code lúc biên dịch hoặc lúc nạp class, mạnh hơn (chặn được cả field, constructor, lời gọi nội bộ) nhưng phức tạp hơn và ít khi cần trong ứng dụng doanh nghiệp.

### Proxy hoạt động thế nào

Spring tạo proxy theo hai cách: **JDK dynamic proxy** (implement cùng interface với bean) hoặc **CGLIB** (sinh class con kế thừa bean). Spring Boot mặc định dùng CGLIB (`spring.aop.proxy-target-class=true`).

```text
Caller ──► Proxy (do Spring sinh ra) ──► Advice: mở transaction, kiểm tra quyền… ──► Bean gốc
                                                                                      │
                     this.otherMethod()  ◄─────────────────────────────────────────────┘
                     (lời gọi nội bộ đi thẳng vào bean gốc, KHÔNG qua proxy)
```

Từ hình trên suy ra các giới hạn quan trọng:

- Chỉ lời gọi **đi qua proxy** mới được chặn. Gọi `this.method()` từ trong cùng class sẽ bỏ qua mọi advice.
- Method `private` không bao giờ bị chặn. Method `final` và class `final` không thể bị CGLIB ghi đè. Hãy đặt các annotation AOP trên method `public`.
- Proxy được tạo sau khi bean khởi tạo xong, nên gọi method của chính bean trong constructor hay `@PostConstruct` cũng không qua proxy.

### @Transactional hoạt động thế nào

Khi bạn gọi một method `@Transactional` qua proxy:

1. `TransactionInterceptor` đọc thuộc tính transaction (propagation, isolation, readOnly, rollback rule).
2. Nó yêu cầu `PlatformTransactionManager` (với JPA là `JpaTransactionManager`) mở hoặc tham gia transaction. Connection/`EntityManager` được **gắn vào thread hiện tại** qua `TransactionSynchronizationManager` (dựa trên `ThreadLocal`).
3. Method gốc chạy; mọi repository trong cùng thread dùng chung connection đó.
4. Method kết thúc bình thường → commit. Ném `RuntimeException` hoặc `Error` → rollback. Ném **checked exception** → mặc định vẫn **commit**, trừ khi khai báo `rollbackFor`.

Hệ quả của bước 2: transaction **không đi theo sang thread khác**. Code chạy trong `CompletableFuture.supplyAsync`, parallel stream hay method `@Async` không thuộc transaction của thread gọi. Chi tiết về propagation và isolation sẽ có trong bài Spring Data JPA.

### @Async hoạt động thế nào

Sau khi bật `@EnableAsync`, method có `@Async` được proxy đẩy vào một `TaskExecutor` và trả về ngay cho caller. Kiểu trả về nên là `void` hoặc `CompletableFuture<T>`.

- Exception từ method `void` không về tới caller; nó được chuyển cho `AsyncUncaughtExceptionHandler` (mặc định chỉ ghi log). Với `CompletableFuture`, exception nằm trong future.
- Spring Boot tự cấu hình executor `applicationTaskExecutor`. Với `ThreadPoolTaskExecutor` mặc định, hàng đợi **không giới hạn**, nên khi tải tăng đột biến, task dồn trong bộ nhớ thay vì bị từ chối. Hãy cấu hình `spring.task.execution.pool.*` (kích thước pool, `queue-capacity`) cho phù hợp. Nếu bật `spring.threads.virtual.enabled=true` (Spring Boot 3.2+, Java 21), executor dùng virtual thread.
- Giới hạn proxy áp dụng y hệt: gọi nội bộ một method `@Async` sẽ chạy **đồng bộ** trên thread hiện tại.

### Tự viết một aspect

Với Spring Boot 3, thêm `spring-boot-starter-aop`. Ví dụ đo thời gian thực thi của các method được đánh dấu:

```java
@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
public @interface LogExecutionTime {}

@Aspect
@Component
public class ExecutionTimeAspect {

    private static final Logger log = LoggerFactory.getLogger(ExecutionTimeAspect.class);

    @Around("@annotation(com.example.shop.common.LogExecutionTime)")
    public Object measure(ProceedingJoinPoint pjp) throws Throwable {
        long start = System.nanoTime();
        try {
            return pjp.proceed();                    // gọi method gốc
        } finally {
            long ms = (System.nanoTime() - start) / 1_000_000;
            log.info("{} took {} ms", pjp.getSignature().toShortString(), ms);
        }
    }
}
```

Khi một method có nhiều advice (ví dụ vừa `@Transactional` vừa aspect của bạn), thứ tự được quyết định bởi `@Order`/`Ordered`. Điều này quan trọng: một aspect retry phải nằm **ngoài** transaction, để mỗi lần thử lại là một transaction mới.

## Lỗi thường gặp

- **Field injection khắp nơi.** Class che giấu số lượng dependency và khó test. Chuyển sang constructor injection với field `final`; có thể dùng `@RequiredArgsConstructor` của Lombok nếu team đã chuẩn hoá Lombok.
- **Singleton giữ trạng thái theo request.** Field như `currentOrder` trong service bị nhiều thread ghi đè lẫn nhau. Giữ trạng thái trong biến cục bộ, tham số method, hoặc bean `@RequestScope`.
- **Inject prototype vào singleton và mong nhận object mới mỗi lần.** Dùng `ObjectProvider<T>` (hoặc `@Lookup`).
- **Đặt `@Transactional`, `@Async`, `@Cacheable` lên method `private` hoặc gọi nội bộ.** Advice bị bỏ qua mà không có cảnh báo. Tách method sang một bean khác và gọi qua bean đó.
- **Mong rollback khi ném checked exception.** Mặc định transaction vẫn commit. Khai báo `@Transactional(rollbackFor = ...)` hoặc dùng exception unchecked cho lỗi nghiệp vụ.
- **Sửa vòng phụ thuộc bằng `@Lazy` hoặc `allow-circular-references`.** Lỗi thiết kế vẫn còn đó. Tách trách nhiệm hoặc dùng event.
- **Dùng `@Profile` để rẽ nhánh nghiệp vụ.** Code production khác code đã test. Chỉ dùng profile cho hạ tầng.
- **Executor `@Async` không giới hạn hàng đợi.** Có thể gây `OutOfMemoryError` khi tải cao. Đặt `queue-capacity` và chính sách từ chối rõ ràng.

## Bài tập thực hành

1. **DI và test không cần Spring:** Tạo project Spring Boot 3, viết `OrderService` với ba dependency qua constructor (`OrderRepository`, `PaymentGateway`, `Clock`). Viết unit test JUnit 5 khởi tạo service bằng `new` với bản giả tự viết và `Clock.fixed(...)`. Sau đó thêm một implementation `PaymentGateway` thứ hai và xử lý `NoUniqueBeanDefinitionException` bằng cả `@Primary` lẫn `Map<String, PaymentGateway>`.
2. **Thí nghiệm scope:** Tạo bean prototype `ReportBuilder`. Inject nó trực tiếp vào một singleton và gọi 3 lần, in `System.identityHashCode(builder)`; sau đó đổi sang `ObjectProvider<ReportBuilder>` và so sánh kết quả. Thêm `@PostConstruct`/`@PreDestroy` có log vào cả singleton và prototype, tắt ứng dụng và quan sát bean nào được gọi `@PreDestroy`.
3. **Proxy và AOP:** Viết aspect `@LogExecutionTime` như trong bài. Tạo một service có method A gọi nội bộ method B (cả hai đều có annotation) và chứng minh B không được đo. Sửa bằng cách tách B sang bean khác. Cuối cùng, viết method `@Transactional` ném `IOException` sau khi lưu dữ liệu, kiểm tra trong database rằng dữ liệu vẫn được commit, rồi sửa bằng `rollbackFor`.

## Tóm tắt

- IoC chuyển quyền tạo và nối object sang container; DI là cách hiện thực. Constructor injection là mặc định cho dependency bắt buộc.
- Bean đi qua các bước: tạo instance → inject → `@PostConstruct` → BeanPostProcessor (tạo proxy) → sử dụng → `@PreDestroy`.
- Singleton là một instance trên mỗi container và phải stateless; prototype inject vào singleton chỉ được tạo một lần, hãy dùng `ObjectProvider`.
- `@Configuration` + `@Bean` cho cấu hình bằng Java; `@Profile` và `@Conditional` bật/tắt bean theo môi trường và điều kiện.
- `@Transactional`, `@Async`, `@Cacheable` hoạt động nhờ proxy: chỉ lời gọi đi qua proxy và method public mới được chặn.
- Transaction gắn với thread qua `ThreadLocal`, rollback mặc định chỉ với unchecked exception, và không lan sang thread khác.
