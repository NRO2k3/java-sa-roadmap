Bài này gộp hai chủ đề tưởng như xa nhau nhưng cùng trả lời hai câu hỏi mà Dev Lead và SA luôn phải trả lời: hệ thống chịu được bao nhiêu tải, và ta có tự tin thay đổi nó mà không làm hỏng gì không. Phần đầu giải thích mô hình reactive với Spring WebFlux và Project Reactor, và quan trọng hơn là *khi nào nó thật sự đáng dùng* trong thời Java 21 đã có virtual threads. Phần sau xây dựng chiến lược kiểm thử: slice test nhanh cho từng tầng và test tích hợp với PostgreSQL, Kafka, Redis thật chạy trong container nhờ Testcontainers.

## Mục tiêu bài học

- Giải thích mô hình reactive, Reactive Streams, backpressure và cách dùng `Mono`/`Flux`.
- Quyết định có căn cứ giữa WebFlux và Spring MVC + Virtual Threads cho một service cụ thể.
- Viết slice test với `@WebMvcTest` và `@DataJpaTest`, biết chúng nạp gì và không nạp gì.
- Viết test tích hợp với Testcontainers và `@ServiceConnection` cho PostgreSQL, Kafka, Redis.

## Mô hình reactive

### Vấn đề của mô hình thread-per-request

Spring MVC truyền thống chạy theo mô hình **một request – một thread**. Khi code gọi database hay HTTP, thread đó *bị block*: nó không làm gì nhưng vẫn chiếm tài nguyên. Tomcat mặc định có tối đa 200 thread xử lý, nên nếu mỗi request chờ downstream 1 giây, server chỉ phục vụ được khoảng 200 request/giây dù CPU gần như rảnh. Tăng số platform thread lên hàng chục nghìn thì tốn bộ nhớ và chi phí chuyển ngữ cảnh.

Mô hình **reactive** giải quyết bằng I/O không chặn (*non-blocking I/O*): một số ít thread *event loop* (với Netty, thường xấp xỉ số core CPU) gửi yêu cầu I/O đi rồi xử lý việc khác; khi dữ liệu về, một callback được gọi để xử lý tiếp. Thay vì viết callback lồng nhau, ta mô tả luồng dữ liệu bằng các toán tử.

### Reactive Streams, Mono và Flux

**Reactive Streams** là đặc tả gồm bốn interface: `Publisher` (phát dữ liệu), `Subscriber` (nhận), `Subscription` (kết nối giữa hai bên, có method `request(n)` và `cancel()`) và `Processor` (vừa nhận vừa phát). Từ Java 9, các interface này cũng có trong JDK dưới tên `java.util.concurrent.Flow`. **Project Reactor** – nền tảng của WebFlux – cung cấp hai kiểu `Publisher`:

- **`Mono<T>`**: phát 0 hoặc 1 phần tử (giống một `Optional` bất đồng bộ).
- **`Flux<T>`**: phát 0 đến N phần tử, có thể vô hạn.

Nguyên tắc số một: **không có gì xảy ra cho tới khi có người subscribe**. Một `Mono` chỉ là *bản mô tả* công việc. Trong WebFlux, framework subscribe giúp bạn khi controller trả về `Mono`/`Flux`.

Các toán tử hay dùng: `map` (biến đổi đồng bộ), `flatMap` (biến đổi thành một publisher khác, chạy đồng thời, không giữ thứ tự), `concatMap` (như `flatMap` nhưng tuần tự, giữ thứ tự), `filter`, `zip` (chờ nhiều nguồn rồi ghép kết quả), `switchIfEmpty`, `onErrorResume`/`onErrorReturn`, `timeout`, `retryWhen(Retry.backoff(...))`.

```java
@RestController
@RequestMapping("/api/v1/products")
public class ProductController {

    private final WebClient inventory;
    private final ProductRepository products;      // ReactiveCrudRepository (R2DBC)

    public ProductController(WebClient.Builder builder, ProductRepository products) {
        this.inventory = builder.baseUrl("http://inventory-service").build();
        this.products = products;
    }

    @GetMapping("/{id}")
    public Mono<ProductView> get(@PathVariable Long id) {
        Mono<Product> product = products.findById(id)
                .switchIfEmpty(Mono.error(new ProductNotFoundException(id)));
        Mono<Integer> stock = inventory.get().uri("/stock/{id}", id)
                .retrieve()
                .bodyToMono(Integer.class)
                .timeout(Duration.ofMillis(500))
                .onErrorReturn(0);                  // inventory lỗi/chậm → coi như hết hàng
        return Mono.zip(product, stock, ProductView::of);   // hai lời gọi chạy song song
    }

    @GetMapping(value = "/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public Flux<Product> stream() {                 // Server-Sent Events
        return products.findAll().delayElements(Duration.ofMillis(100));
    }
}
```

### Backpressure

**Backpressure** (áp lực ngược) là cơ chế để bên nhận kiểm soát tốc độ của bên phát: subscriber gọi `subscription.request(n)` để báo "tôi sẵn sàng nhận thêm n phần tử", và publisher không được phát quá số đã được yêu cầu. Nhờ vậy consumer chậm không bị nhấn chìm, thay vì phải đệm vô hạn trong bộ nhớ.

Khi nguồn không thể chậm lại (sự kiện từ người dùng, dữ liệu cảm biến), bạn phải chọn chiến lược tường minh: `onBackpressureBuffer(maxSize)` (đệm có giới hạn), `onBackpressureDrop()` (bỏ phần tử thừa), `onBackpressureLatest()` (chỉ giữ phần tử mới nhất). `limitRate(n)` điều chỉnh số phần tử được yêu cầu mỗi đợt. Lưu ý: qua HTTP, backpressure giữa hai service chỉ được truyền gián tiếp qua cơ chế điều khiển luồng của TCP.

Reactor có `StepVerifier` (trong `reactor-test`) để kiểm thử publisher, kể cả hành vi backpressure:

```java
@Test
void emitsOnlyRequestedItems() {
    Flux<Integer> numbers = Flux.range(1, 100);

    StepVerifier.create(numbers, 2)        // ban đầu chỉ request 2 phần tử
            .expectNext(1, 2)
            .thenRequest(3)                // yêu cầu thêm 3
            .expectNext(3, 4, 5)
            .thenCancel()
            .verify();
}
```

### Quy tắc vàng: không block event loop

Event loop chỉ có vài thread phục vụ *mọi* request. Gọi JDBC/JPA, `Thread.sleep`, `RestTemplate` hay `.block()` bên trong pipeline reactive sẽ chặn một thread event loop, và cả server chậm theo. Cách xử lý:

- Dùng driver reactive end-to-end: R2DBC cho SQL, `WebClient` cho HTTP, driver reactive cho MongoDB, Redis, Kafka.
- Nếu buộc phải gọi thư viện blocking, bọc nó và chuyển sang scheduler dành cho tác vụ blocking: `Mono.fromCallable(() -> legacyClient.fetch(id)).subscribeOn(Schedulers.boundedElastic())`.
- Dùng BlockHound trong test để phát hiện lời gọi blocking trên thread non-blocking.

Hai chi phí khác của reactive: `ThreadLocal` không còn đáng tin vì một request có thể chạy trên nhiều thread (dùng Reactor `Context`; MDC cho log cần thư viện context-propagation), và stack trace khó đọc vì chủ yếu là frame của Reactor (dùng `checkpoint()` để đánh dấu vị trí).

## WebFlux hay Spring MVC + Virtual Threads?

Java 21 mang tới **virtual threads**: thread nhẹ do JVM quản lý, khi gặp I/O blocking thì được "tháo" khỏi platform thread mang nó (*carrier thread*) để carrier chạy việc khác. Từ Spring Boot 3.2, chỉ cần `spring.threads.virtual.enabled=true` để Tomcat xử lý mỗi request trên một virtual thread. Bạn giữ nguyên code imperative, JPA, `RestClient`, debug và stack trace quen thuộc, mà vẫn phục vụ được rất nhiều request đồng thời đang chờ I/O.

Virtual thread cũng có giới hạn:

- **Tài nguyên phía sau vẫn hữu hạn.** Hàng nghìn virtual thread vẫn chỉ chia nhau connection pool database. Nút cổ chai dịch chuyển xuống database; hãy giới hạn đồng thời bằng pool size hoặc semaphore/bulkhead.
- **Pinning:** trên Java 21, virtual thread bị "ghim" vào carrier khi block bên trong khối `synchronized` hoặc native call, làm mất lợi ích. JDK 24 (JEP 491) đã loại bỏ phần lớn trường hợp pinning do `synchronized`; trên Java 21, ưu tiên `ReentrantLock` ở đoạn code nóng.
- **Không giúp gì cho tác vụ CPU-bound**, và không nên dùng `ThreadLocal` làm cache đắt tiền vì mỗi request giờ là một thread mới.

| Tiêu chí | Spring MVC + Virtual Threads | Spring WebFlux |
|---|---|---|
| Mô hình lập trình | Imperative, tuần tự, dễ đọc | Khai báo bằng toán tử, cần học tư duy mới |
| Thư viện | JDBC, JPA, mọi thư viện blocking | Cần driver reactive end-to-end (R2DBC…) |
| Debug, stack trace | Quen thuộc | Khó hơn |
| Streaming, backpressure | Hạn chế | Hỗ trợ tự nhiên (SSE, WebSocket, Flux vô hạn) |
| Tác vụ I/O đồng thời cao | Tốt | Tốt |
| Phù hợp | Phần lớn API nghiệp vụ, CRUD, hệ thống dùng JPA | Gateway/proxy, streaming, nhiều kết nối dài, stack đã reactive |

Quy tắc ra quyết định thực tế: chọn **MVC + virtual threads** làm mặc định cho service nghiệp vụ mới; chọn **WebFlux** khi bài toán thật sự là streaming hoặc cần backpressure, hoặc khi cả stack đã là reactive. Tránh "nửa vời": WebFlux mà vẫn dùng JPA blocking là gánh cả độ phức tạp của reactive lẫn giới hạn của blocking.

## Chiến lược kiểm thử trong Spring

```text
            ▲ ít, chậm, đắt
   E2E      │  vài kịch bản xuyên hệ thống
 Tích hợp   │  @SpringBootTest + Testcontainers: DB, broker, cache thật
 Slice      │  @WebMvcTest, @DataJpaTest: một tầng, nạp một phần context
 Unit       │  không Spring, chạy trong mili-giây
            ▼ nhiều, nhanh, rẻ
```

### Slice test với @WebMvcTest

`@WebMvcTest` chỉ nạp tầng web: controller, `@ControllerAdvice`, Jackson, converter, filter, `WebMvcConfigurer` và auto-configuration của Spring Security; **không** nạp `@Service`, `@Repository`, còn class cấu hình bảo mật của bạn cần được `@Import` vào. Dependency của controller phải được giả lập bằng `@MockitoBean` (Spring Framework 6.2 / Spring Boot 3.4 trở lên; phiên bản cũ hơn dùng `@MockBean`, nay đã deprecate). Slice này dùng để kiểm tra mapping URL, validate input, status code, định dạng JSON, xử lý lỗi và luật bảo mật.

```java
@WebMvcTest(OrderController.class)
@Import(SecurityConfig.class)                 // nạp cấu hình bảo mật thật của ứng dụng
class OrderControllerTest {

    @Autowired MockMvc mvc;
    @MockitoBean OrderService orderService;

    @Test
    void returns404AsProblemDetail() throws Exception {
        when(orderService.findById(42L)).thenThrow(new OrderNotFoundException(42L));

        mvc.perform(get("/api/v1/orders/42").with(jwt()))
           .andExpect(status().isNotFound())
           .andExpect(content().contentType(MediaType.APPLICATION_PROBLEM_JSON))
           .andExpect(jsonPath("$.title").value("Order not found"));
    }

    @Test
    void rejectsInvalidRequest() throws Exception {
        var writer = jwt().authorities(new SimpleGrantedAuthority("SCOPE_orders:write"));

        mvc.perform(post("/api/v1/orders").with(writer)
                   .contentType(MediaType.APPLICATION_JSON)
                   .content("""
                           {"customerId": "", "items": []}
                           """))
           .andExpect(status().isBadRequest())
           .andExpect(jsonPath("$.errors.customerId").exists());
    }
}
```

Với WebFlux, slice tương ứng là `@WebFluxTest` cùng `WebTestClient`.

### Slice test với @DataJpaTest

`@DataJpaTest` nạp entity, repository, `EntityManager`, `DataSource` và Flyway/Liquibase. Mỗi test chạy trong một transaction và **rollback** khi kết thúc, nên dữ liệu không rò sang test khác. Mặc định, nó thay `DataSource` bằng database nhúng trong bộ nhớ (như H2) nếu có trên classpath. Nhưng H2 khác PostgreSQL ở cú pháp, kiểu dữ liệu (JSONB, array), hàm và hành vi lock, nên test pass trên H2 không đảm bảo chạy đúng trên production. Hãy dùng PostgreSQL thật qua Testcontainers và tắt việc thay thế bằng `@AutoConfigureTestDatabase(replace = Replace.NONE)`.

```java
@DataJpaTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
@Testcontainers
class OrderRepositoryTest {

    @Container
    @ServiceConnection
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:16-alpine");

    @Autowired OrderRepository orders;
    @Autowired TestEntityManager em;

    @Test
    void loadsOrderWithLines() {
        Order order = new Order("c-1");
        order.addLine(new OrderLine("SKU-1", 2));
        em.persistAndFlush(order);
        em.clear();                       // xoá persistence context để buộc đọc lại từ DB

        Order loaded = orders.findWithLinesById(order.getId()).orElseThrow();

        assertThat(loaded.getLines()).hasSize(1);
    }
}
```

Lệnh `em.clear()` rất quan trọng: thiếu nó, `findWithLinesById` có thể trả về đúng object vẫn nằm trong first-level cache, và test không hề kiểm tra câu query.

### Test tích hợp với Testcontainers

**Testcontainers** khởi động container Docker thật (PostgreSQL, Kafka, Redis…) cho test và dọn dẹp sau khi xong. Bạn test với **đúng phiên bản** database và broker như production, không cần môi trường dùng chung dễ "bẩn". Extension JUnit 5 `@Testcontainers` quản lý vòng đời các field `@Container`; field `static` được dùng chung cho mọi test trong class.

Từ Spring Boot 3.1, `@ServiceConnection` đọc thông tin kết nối từ container và tự tạo bean `ConnectionDetails` – không cần khai báo URL, username, cổng. Với container không được hỗ trợ sẵn, dùng `@DynamicPropertySource` để đăng ký property thủ công. Ví dụ dưới đây dùng Testcontainers 1.x đi kèm Spring Boot 3:

```java
@SpringBootTest
@Testcontainers
class OrderFlowIT {

    @Container @ServiceConnection
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:16-alpine");

    @Container @ServiceConnection
    static KafkaContainer kafka = new KafkaContainer(DockerImageName.parse("confluentinc/cp-kafka:7.6.1"));

    @Container @ServiceConnection(name = "redis")
    static GenericContainer<?> redis = new GenericContainer<>("redis:7-alpine").withExposedPorts(6379);

    @Autowired OrderService orderService;
    @Autowired OrderRepository orders;
    @Autowired OrderEventCollector events;     // consumer dùng trong test, gom các event nhận được

    @Test
    void placingOrderPersistsAndPublishesEvent() {
        var request = new CreateOrderRequest("c-1", List.of(new OrderItemRequest("SKU-1", 2)), null);

        OrderResponse created = orderService.create(request);

        assertThat(orders.findById(created.id())).isPresent();
        await().atMost(Duration.ofSeconds(10))            // Awaitility: chờ xử lý bất đồng bộ
               .untilAsserted(() -> assertThat(events.received())
                       .anyMatch(e -> e.orderId().equals(created.id())));
    }
}
```

Để bộ test tích hợp vẫn nhanh:

- **Tái sử dụng Spring context:** Spring cache context giữa các test class có cùng cấu hình. Mỗi tổ hợp `@MockitoBean` hay property khác nhau tạo ra một context mới – hãy gom chúng về một vài lớp cơ sở chung.
- **Singleton container:** khai báo container `static` trong một lớp cơ sở (hoặc một `@TestConfiguration` dùng chung) để khởi động một lần cho cả JVM thay vì một lần mỗi class.
- **Ghim phiên bản image** (`postgres:16-alpine`, không dùng `latest`) để test có thể tái lập.
- Với xử lý bất đồng bộ (Kafka consumer), dùng Awaitility thay cho `Thread.sleep`.
- Trong lúc phát triển, có thể chạy ứng dụng với chính các container này bằng `SpringApplication.from(OrderApplication::main).with(TestcontainersConfig.class).run(args)`.

## Lỗi thường gặp

- **Gọi code blocking trong WebFlux** (JPA, `RestTemplate`, `.block()`). Chuyển sang driver reactive hoặc `subscribeOn(Schedulers.boundedElastic())`, và bật BlockHound trong test.
- **Chọn WebFlux vì "nhanh hơn"** trong khi toàn bộ hệ thống dùng JPA và team chưa quen reactive. Với Java 21, MVC + virtual threads thường là lựa chọn đơn giản hơn với hiệu quả tương đương cho workload I/O.
- **Tự gọi `subscribe()` trong controller hoặc service** để "chạy nền". Lỗi bị nuốt mất và không ai kiểm soát vòng đời. Trả `Mono`/`Flux` về cho framework, hoặc dùng cơ chế bất đồng bộ có quản lý.
- **Dùng `@SpringBootTest` cho mọi test.** Bộ test chậm dần tới mức không ai muốn chạy. Đẩy logic xuống unit test, dùng slice cho từng tầng, chỉ giữ một số test tích hợp cho luồng chính.
- **Dùng H2 thay cho PostgreSQL trong test.** Lỗi cú pháp và khác biệt hành vi chỉ lộ ra trên production. Dùng Testcontainers.
- **Test `@SpringBootTest` phụ thuộc dữ liệu của nhau.** Khác `@DataJpaTest`, `@SpringBootTest` không tự rollback (nhất là khi luồng đi qua thread khác hoặc HTTP thật). Dọn dữ liệu trước mỗi test hoặc dùng dữ liệu riêng cho từng test.
- **Dùng `Thread.sleep` để chờ message.** Test vừa chậm vừa flaky. Dùng Awaitility với timeout.

## Bài tập thực hành

1. **API tổng hợp reactive:** Viết endpoint WebFlux gọi song song hai service (giá và tồn kho) bằng `WebClient`, ghép kết quả bằng `Mono.zip`, đặt timeout 500 ms và giá trị dự phòng khi lỗi. Viết test bằng `StepVerifier` cho các trường hợp thành công, timeout và lỗi. Sau đó cố tình gọi một method blocking trong pipeline và dùng BlockHound để phát hiện.
2. **So sánh mô hình thread:** Viết endpoint Spring MVC gọi một downstream giả lập trễ 200 ms. Đo throughput bằng một công cụ tải (k6, wrk hoặc JMeter) với 1.000 người dùng đồng thời, lần lượt với platform thread và với `spring.threads.virtual.enabled=true`. Sau đó cho endpoint truy vấn PostgreSQL với pool 10 connection và quan sát nút cổ chai mới.
3. **Bộ test cho API đơn hàng:** Viết `@WebMvcTest` kiểm tra 201/400/404 và luật bảo mật, `@DataJpaTest` với PostgreSQL thật kiểm tra query fetch join, và một test `@SpringBootTest` với PostgreSQL + Kafka chứng minh tạo đơn hàng thì event được phát. Chạy toàn bộ trong pipeline CI có Docker.

## Tóm tắt

- Reactive dùng I/O không chặn và một số ít thread event loop; `Mono` phát 0..1, `Flux` phát 0..N, và không có gì chạy cho tới khi được subscribe.
- Backpressure cho phép subscriber kiểm soát tốc độ qua `request(n)`; khi nguồn không chậm lại được, phải chọn chiến lược buffer, drop hoặc latest.
- Tuyệt đối không block event loop; reactive chỉ hiệu quả khi cả stack là non-blocking.
- Với Java 21, Spring MVC + virtual threads là mặc định hợp lý cho API nghiệp vụ; WebFlux dành cho streaming, gateway và hệ thống cần backpressure.
- `@WebMvcTest` kiểm tra tầng web với service được mock; `@DataJpaTest` kiểm tra repository trong transaction tự rollback.
- Testcontainers + `@ServiceConnection` cho phép test với PostgreSQL, Kafka, Redis thật; giữ test nhanh bằng cách tái sử dụng context và container.
