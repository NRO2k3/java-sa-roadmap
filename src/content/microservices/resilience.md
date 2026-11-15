Trong hệ phân tán, lỗi không phải là "nếu" mà là "khi nào": mạng chập chờn, một instance bị restart, database chậm vì backup, đối tác bên ngoài trả lỗi 503. Điều nguy hiểm nhất không phải là một service chết hẳn, mà là một service **chậm** kéo theo cả chuỗi service phía trước bị nghẽn, gọi là cascading failure (lỗi lan truyền dây chuyền). Bài này trình bày các mẫu thiết kế giúp hệ thống chịu lỗi, cách cài đặt chúng bằng Resilience4j trên Spring Boot 3, cách thiết kế trải nghiệm suy giảm có kiểm soát và cách chủ động kiểm chứng khả năng chịu lỗi bằng chaos engineering.

## Mục tiêu bài học

- Giải thích cơ chế lỗi lan truyền và vai trò của timeout, retry, circuit breaker trong việc chặn nó.
- Cấu hình được retry với exponential backoff và jitter, biết khi nào **không** được retry.
- Dùng bulkhead và rate limiter của Resilience4j để cô lập tài nguyên và tôn trọng giới hạn của phụ thuộc.
- Thiết kế graceful degradation và fallback phù hợp với từng loại nghiệp vụ.
- Lên kế hoạch thí nghiệm chaos engineering và viết test tự động kiểm chứng khả năng chịu lỗi.

## Lỗi lan truyền xảy ra như thế nào

```text
   Client ---> [ Gateway ] ---> [ order-service ] ---> [ inventory-service ] ---> DB đang chậm
                                 200 thread                 phản hồi 30 giây

  1. inventory-service chậm, mỗi request giữ một thread của order-service suốt 30 giây.
  2. 200 thread của order-service lần lượt bị chiếm hết, request mới phải xếp hàng.
  3. Gateway chờ order-service, connection pool của gateway cũng cạn.
  4. Toàn bộ hệ thống "chết" dù chỉ một database bị chậm.
```

Tin rằng "mạng luôn ổn định" và "độ trễ bằng 0" là hai trong tám "ngộ nhận về điện toán phân tán" (fallacies of distributed computing) kinh điển. Các mẫu bên dưới đều nhằm một mục tiêu: **giới hạn tài nguyên mà một phụ thuộc lỗi có thể chiếm** và **trả lời nhanh** thay vì treo.

## Timeout: tuyến phòng thủ đầu tiên

Mọi lời gọi qua mạng phải có giới hạn thời gian. Cần phân biệt:

- **Connect timeout:** thời gian tối đa để thiết lập kết nối TCP/TLS. Thường ngắn (vài trăm mili-giây trong cùng data center).
- **Read (response) timeout:** thời gian tối đa chờ dữ liệu phản hồi.
- **Deadline tổng:** tổng thời gian mà người gọi sẵn sàng chờ cho cả thao tác, kể cả các lần retry.

Chọn timeout dựa trên số liệu thật: lấy độ trễ p99 của phụ thuộc rồi cộng thêm biên an toàn, thay vì đặt một con số "cho chắc" như 30 giây. Timeout của tầng trong phải nhỏ hơn tầng ngoài: nếu gateway chỉ chờ 3 giây mà order-service lại chờ inventory 5 giây, order-service vẫn làm việc vô ích sau khi client đã bỏ đi.

```java
@Bean
InventoryClient inventoryClient(RestClient.Builder builder,
                                @Value("${clients.inventory.base-url}") String baseUrl) {
    HttpClient httpClient = HttpClient.newBuilder()
            .connectTimeout(Duration.ofMillis(500))
            .build();
    JdkClientHttpRequestFactory factory = new JdkClientHttpRequestFactory(httpClient);
    factory.setReadTimeout(Duration.ofMillis(800));   // dựa trên p99 ~ 300ms của inventory

    RestClient restClient = builder.clone()
            .baseUrl(baseUrl)
            .requestFactory(factory)
            .build();
    return HttpServiceProxyFactory.builderFor(RestClientAdapter.create(restClient))
            .build()
            .createClient(InventoryClient.class);
}
```

Với các lời gọi bất đồng bộ trả về `CompletableFuture`, Resilience4j có thêm `TimeLimiter` để cắt thao tác vượt thời gian.

## Retry với exponential backoff và jitter

Retry giúp vượt qua **lỗi tạm thời** (transient): kết nối bị reset, instance vừa restart, 503 trong lúc deploy. Nhưng retry sai cách có thể biến sự cố nhỏ thành thảm hoạ.

**Chỉ retry khi:**

- Lỗi có khả năng tự hết: lỗi kết nối, timeout, 503, 429 (tôn trọng header `Retry-After` nếu có).
- Thao tác **idempotent** (gọi nhiều lần cho cùng kết quả): GET, PUT, DELETE, hoặc POST có `Idempotency-Key` mà phía server xử lý trùng lặp đúng cách.

**Không retry khi:** lỗi 400, lỗi validation, lỗi nghiệp vụ ("hết hàng"), lỗi xác thực. Gọi lại bao nhiêu lần cũng cho cùng kết quả.

**Exponential backoff** tăng thời gian chờ theo cấp số nhân: 200ms, 400ms, 800ms..., để phụ thuộc có thời gian hồi phục. **Jitter** thêm yếu tố ngẫu nhiên vào thời gian chờ. Nếu không có jitter, hàng nghìn client cùng gặp lỗi tại một thời điểm sẽ retry *đồng loạt* theo cùng nhịp, tạo ra các đợt tải dồn dập (thundering herd) đúng lúc phụ thuộc đang yếu nhất. Một công thức hay dùng là "full jitter": chờ một khoảng ngẫu nhiên trong `[0, min(cap, base × 2^n)]`. Resilience4j dùng `randomized-wait-factor`: với hệ số 0,5, mỗi lần chờ dao động trong khoảng ±50% quanh giá trị backoff.

> **Lưu ý:** Retry ở nhiều tầng sẽ **khuếch đại** tải. Nếu gateway, order-service và inventory-service mỗi tầng retry 3 lần, một request của người dùng có thể thành 3 × 3 × 3 = 27 lời gọi tới database đang quá tải. Hãy chọn retry ở một tầng và giới hạn tổng số lần thử.

## Circuit breaker

**Circuit breaker** (cầu dao) theo dõi tỉ lệ lỗi của một phụ thuộc và "ngắt mạch" khi tỉ lệ đó vượt ngưỡng, để người gọi thất bại nhanh thay vì tiếp tục dồn request vào nơi đang hỏng.

```text
                 tỉ lệ lỗi hoặc tỉ lệ gọi chậm >= ngưỡng
      +--------+ ---------------------------------------> +--------+
      | CLOSED |                                          |  OPEN  |  từ chối ngay
      +--------+ <------------+                           +--------+  (CallNotPermittedException)
          ^                   | các lời gọi thử               |
          |                   | đều thành công                | hết wait-duration-in-open-state
          |              +-----------+                        |
          +------------- | HALF_OPEN | <----------------------+
                         +-----------+ ----> lời gọi thử lỗi -> quay lại OPEN
```

Các tham số quan trọng của Resilience4j:

- `sliding-window-type` và `sliding-window-size`: đánh giá theo N lời gọi gần nhất (COUNT_BASED) hoặc theo N giây gần nhất (TIME_BASED).
- `minimum-number-of-calls`: số lời gọi tối thiểu trước khi bắt đầu tính tỉ lệ lỗi, tránh mở mạch chỉ vì 1/1 lời gọi lỗi lúc ít traffic.
- `failure-rate-threshold`: ngưỡng tỉ lệ lỗi (%) để chuyển sang OPEN.
- `slow-call-duration-threshold` và `slow-call-rate-threshold`: coi lời gọi chậm như một dạng lỗi, rất quan trọng vì "chậm" thường đến trước "chết".
- `wait-duration-in-open-state`: thời gian giữ trạng thái OPEN trước khi thử lại.
- `permitted-number-of-calls-in-half-open-state`: số lời gọi thử ở trạng thái HALF_OPEN.
- `ignore-exceptions`: lỗi nghiệp vụ (ví dụ SKU không tồn tại) không phải dấu hiệu phụ thuộc hỏng, không nên tính vào tỉ lệ lỗi.

## Bulkhead và rate limiter

### Bulkhead

**Bulkhead** (vách ngăn, lấy ý tưởng từ các khoang kín của tàu thuỷ) giới hạn tài nguyên dành cho từng phụ thuộc, để một phụ thuộc chậm không chiếm hết tài nguyên dùng chung. Resilience4j có hai loại:

- **Semaphore bulkhead:** giới hạn số lời gọi đồng thời (`max-concurrent-calls`), chạy trên thread của người gọi. Đơn giản, dùng được cho code đồng bộ.
- **Thread pool bulkhead:** mỗi phụ thuộc có thread pool và hàng đợi riêng; chỉ áp dụng cho method trả về `CompletableFuture`.

Kích thước bulkhead có thể ước lượng bằng định luật Little: số lời gọi đồng thời ≈ throughput × độ trễ. Ví dụ inventory nhận 200 request/giây với độ trễ trung bình 50ms thì cần khoảng 10 lời gọi đồng thời; đặt giới hạn 25 là có dư địa cho lúc tăng đột biến. Kể cả khi dùng virtual thread (thread gần như không còn khan hiếm), bulkhead vẫn cần thiết vì connection pool và năng lực của phụ thuộc thì vẫn có hạn.

### Rate limiter

`RateLimiter` của Resilience4j cho phép tối đa `limit-for-period` lời gọi trong mỗi `limit-refresh-period`. Nó thường dùng ở **phía gọi** để tôn trọng hạn mức (quota) của đối tác, ví dụ nhà cung cấp SMS chỉ cho 50 request/giây. Lưu ý giới hạn này tính **trên từng instance**: 4 instance × 50 = 200 request/giây. Để bảo vệ chính service của mình trước client, nên giới hạn tập trung ở gateway với bộ đếm phân tán (ví dụ Redis).

## Kết hợp các mẫu bằng Resilience4j

Thêm dependency `io.github.resilience4j:resilience4j-spring-boot3` và `spring-boot-starter-aop`, sau đó cấu hình theo tên instance:

```yaml
resilience4j:
  circuitbreaker:
    instances:
      inventory:
        sliding-window-type: COUNT_BASED
        sliding-window-size: 20
        minimum-number-of-calls: 10
        failure-rate-threshold: 50
        slow-call-duration-threshold: 1s
        slow-call-rate-threshold: 60
        wait-duration-in-open-state: 20s
        permitted-number-of-calls-in-half-open-state: 3
        automatic-transition-from-open-to-half-open-enabled: true
        ignore-exceptions:
          - com.example.order.inventory.SkuNotFoundException
  retry:
    instances:
      inventory:
        max-attempts: 3                     # tính cả lần gọi đầu tiên
        wait-duration: 200ms
        enable-exponential-backoff: true
        exponential-backoff-multiplier: 2   # 200ms rồi 400ms
        enable-randomized-wait: true
        randomized-wait-factor: 0.5         # jitter ±50%
        retry-exceptions:
          - org.springframework.web.client.ResourceAccessException
          - org.springframework.web.client.HttpServerErrorException$ServiceUnavailable
  bulkhead:
    instances:
      inventory:
        max-concurrent-calls: 25
        max-wait-duration: 0                # hết chỗ thì từ chối ngay, không xếp hàng
  ratelimiter:
    instances:
      sms-provider:
        limit-for-period: 50
        limit-refresh-period: 1s
        timeout-duration: 0
```

```java
@Service
class InventoryGateway {

    private static final Logger log = LoggerFactory.getLogger(InventoryGateway.class);
    private final InventoryClient client;
    private final StockCache cache;

    InventoryGateway(InventoryClient client, StockCache cache) {
        this.client = client;
        this.cache = cache;
    }

    // Thứ tự mặc định: Retry ( CircuitBreaker ( RateLimiter ( TimeLimiter ( Bulkhead ( method ) ) ) ) )
    @Retry(name = "inventory", fallbackMethod = "stockFallback")
    @CircuitBreaker(name = "inventory")
    @Bulkhead(name = "inventory")
    public StockView stockOf(String sku) {
        StockLevel level = client.getStock(sku);
        cache.put(sku, level);
        return StockView.live(level);
    }

    // Fallback: cùng tham số, thêm Throwable ở cuối, cùng kiểu trả về
    private StockView stockFallback(String sku, Throwable ex) {
        log.warn("Không lấy được tồn kho {} từ inventory: {}", sku, ex.toString());
        return cache.get(sku)
                .map(StockView::stale)                       // dữ liệu cũ nhưng vẫn hữu ích
                .orElseGet(() -> StockView.unknown(sku));    // UI hiển thị "đang cập nhật"
    }
}
```

Fallback được đặt ở `@Retry` vì đây là lớp ngoài cùng. Khi mạch đã mở, `CallNotPermittedException` không nằm trong `retry-exceptions` nên không bị retry vô ích mà đi thẳng vào fallback.

## Graceful degradation và fallback

**Graceful degradation** (suy giảm có kiểm soát) nghĩa là khi một phần hệ thống gặp sự cố, sản phẩm vẫn phục vụ được chức năng cốt lõi với chất lượng thấp hơn, thay vì sập toàn bộ. Bước đầu tiên là phân loại phụ thuộc theo mức độ quan trọng cùng với phía nghiệp vụ:

| Chiến lược | Ví dụ | Lưu ý |
|---|---|---|
| Dữ liệu cũ từ cache | Hiển thị tồn kho lần cập nhật gần nhất, ghi chú "đang cập nhật" | Không dùng cho dữ liệu mà sai lệch gây thiệt hại (số dư tài khoản) |
| Giá trị mặc định | Gợi ý sản phẩm trả về danh sách bán chạy chung thay vì cá nhân hoá | Phải rõ ràng với người dùng nếu ảnh hưởng quyết định của họ |
| Ẩn bớt tính năng | Ẩn khối đánh giá sản phẩm khi review-service lỗi | Giao diện phải được thiết kế để thiếu khối đó vẫn ổn |
| Nhận yêu cầu, xử lý sau | Nhận đơn và đưa vào hàng đợi, gửi email xác nhận khi xử lý xong | Cần trạng thái trung gian rõ ràng ("đang xử lý") |
| Thất bại nhanh, thông báo rõ | Thanh toán lỗi thì báo "vui lòng thử lại sau" | Tuyệt đối không giả lập thành công |
| Load shedding | Khi quá tải, từ chối request ưu tiên thấp bằng 429/503 kèm `Retry-After` | Giữ năng lực cho luồng quan trọng như thanh toán |

Nguyên tắc cho fallback: phải đơn giản, không gọi sang một phụ thuộc mong manh khác, được test như code chính và được giám sát. Tỉ lệ fallback tăng là tín hiệu cảnh báo, không phải điều bình thường. Kết hợp feature flag (kill switch) để tắt nhanh một tính năng không thiết yếu khi sự cố kéo dài.

## Chaos engineering

**Chaos engineering** là thực hành chủ động đưa sự cố có kiểm soát vào hệ thống để kiểm chứng giả thuyết về khả năng chịu lỗi, trước khi sự cố thật làm điều đó. Netflix phổ biến cách làm này với công cụ Chaos Monkey ngẫu nhiên tắt instance trên production. Quy trình một thí nghiệm:

1. **Xác định trạng thái ổn định (steady state)** bằng chỉ số đo được, ưu tiên chỉ số nghiệp vụ: số đơn mỗi phút, tỉ lệ lỗi, p99.
2. **Đặt giả thuyết:** "Khi inventory-service chậm thêm 2 giây, số đơn mỗi phút không giảm quá 5% và trang sản phẩm vẫn hiển thị."
3. **Chọn sự kiện thực tế để tiêm vào:** thêm độ trễ, tắt pod, ngắt mạng giữa hai service, phụ thuộc trả lỗi 503, đầy ổ đĩa.
4. **Giới hạn phạm vi ảnh hưởng (blast radius):** bắt đầu ở staging, một phần nhỏ traffic, có nút dừng khẩn cấp.
5. **Chạy, quan sát, rút kinh nghiệm,** sau đó tự động hoá thí nghiệm thành kiểm thử định kỳ.

Công cụ phổ biến: WireMock và Toxiproxy (có module Testcontainers) cho integration test; Chaos Monkey for Spring Boot để tiêm độ trễ hoặc exception vào bean; Chaos Mesh hay LitmusChaos trên Kubernetes; dịch vụ của cloud như AWS Fault Injection Service hay Azure Chaos Studio. Ngoài ra, các buổi **game day** (cả team cùng diễn tập sự cố theo kịch bản) giúp kiểm tra cả con người: cảnh báo có kêu không, runbook có đúng không.

Ví dụ test tự động kiểm chứng fallback và circuit breaker bằng WireMock:

```java
@SpringBootTest
class InventoryResilienceTest {

    static WireMockServer inventory = new WireMockServer(options().dynamicPort());

    @DynamicPropertySource
    static void inventoryUrl(DynamicPropertyRegistry registry) {
        inventory.start();
        registry.add("clients.inventory.base-url", inventory::baseUrl);
    }

    @AfterAll
    static void stopWireMock() {
        inventory.stop();
    }

    @Autowired InventoryGateway gateway;
    @Autowired CircuitBreakerRegistry circuitBreakers;

    @Test
    void fallsBackAndOpensCircuitWhenInventoryKeepsFailing() {
        inventory.stubFor(get(urlPathMatching("/api/inventory/.*"))
                .willReturn(aResponse().withFault(Fault.CONNECTION_RESET_BY_PEER)));

        for (int i = 0; i < 10; i++) {
            assertThat(gateway.stockOf("SKU-1").status()).isEqualTo(StockStatus.UNKNOWN);
        }

        assertThat(circuitBreakers.circuitBreaker("inventory").getState())
                .isEqualTo(CircuitBreaker.State.OPEN);
    }
}
```

## Lỗi thường gặp

- **Retry mọi loại lỗi**, kể cả 400 và lỗi nghiệp vụ, hoặc retry POST tạo thanh toán không có idempotency key, dẫn tới trừ tiền hai lần. Cách sửa: khai báo rõ `retry-exceptions`, chỉ retry thao tác idempotent.
- **Retry ở mọi tầng** khiến tải bị nhân lên nhiều lần khi sự cố. Cách sửa: retry ở một tầng, giới hạn số lần, luôn có backoff và jitter.
- **Đặt `fallbackMethod` ở `@CircuitBreaker` trong khi có `@Retry` bên ngoài.** Fallback "nuốt" exception nên Retry thấy kết quả thành công và không bao giờ retry. Cách sửa: đặt fallback ở annotation ngoài cùng.
- **Fallback giả thành công**, ví dụ trả về "đã thanh toán" khi payment-service lỗi. Cách sửa: với nghiệp vụ liên quan tiền hoặc cam kết, thất bại rõ ràng hoặc chuyển sang trạng thái chờ xử lý.
- **Timeout tầng trong lớn hơn tầng ngoài**, hoặc không có timeout. Cách sửa: thiết kế ngân sách thời gian từ ngoài vào trong, đặt timeout dựa trên p99 thực tế.
- **Tính lỗi nghiệp vụ là lỗi phụ thuộc**, khiến mạch mở oan khi người dùng tra cứu nhiều SKU không tồn tại. Cách sửa: dùng `ignore-exceptions` cho các lỗi đó.
- **Không giám sát trạng thái circuit breaker.** Cách sửa: Resilience4j xuất metric qua Micrometer (ví dụ `resilience4j_circuitbreaker_state` trên Prometheus); dựng dashboard và cảnh báo khi mạch mở.
- **Làm chaos trên production khi chưa có steady state và nút dừng.** Cách sửa: bắt đầu từ test tự động và staging, mở rộng dần phạm vi.

## Bài tập thực hành

1. **Tái hiện lỗi lan truyền:** dựng `order-service` gọi `inventory-service` không có timeout, dùng WireMock `withFixedDelay(5000)` hoặc Toxiproxy để làm inventory chậm, bắn tải bằng k6 và quan sát thread pool của order-service cạn dần. Sau đó thêm timeout, circuit breaker, bulkhead và so sánh p99 cùng tỉ lệ lỗi trước và sau.
2. **Test tự động cho vòng đời mạch:** mở rộng test mẫu để kiểm tra mạch chuyển sang HALF_OPEN rồi CLOSED khi WireMock trả về 200 trở lại (dùng `wait-duration-in-open-state` ngắn trong profile test). Thêm test chứng minh lỗi `SkuNotFoundException` không làm mạch mở.
3. **Game day trên staging:** chọn một steady state (ví dụ số đơn mỗi phút), viết giả thuyết, tiêm sự cố (tắt một pod, thêm 2 giây độ trễ cho inventory), ghi lại cảnh báo nào kêu, dashboard thể hiện gì, và lập danh sách việc cần cải thiện.

## Tóm tắt

- Service chậm nguy hiểm hơn service chết vì nó chiếm tài nguyên của người gọi và gây lỗi lan truyền.
- Timeout là bắt buộc cho mọi lời gọi mạng; timeout tầng trong phải nhỏ hơn tầng ngoài.
- Chỉ retry lỗi tạm thời trên thao tác idempotent, luôn có exponential backoff và jitter, và chỉ retry ở một tầng.
- Circuit breaker thất bại nhanh khi phụ thuộc hỏng hoặc chậm; bulkhead cô lập tài nguyên; rate limiter tôn trọng hạn mức.
- Với annotation Resilience4j, Retry là lớp ngoài cùng nên fallback đặt ở đó.
- Graceful degradation cần quyết định cùng nghiệp vụ: dùng cache, giá trị mặc định, ẩn tính năng hoặc thất bại rõ ràng, nhưng không bao giờ giả thành công.
- Chaos engineering kiểm chứng giả thuyết chịu lỗi bằng thí nghiệm có kiểm soát, bắt đầu từ test tự động rồi mới đến production.
