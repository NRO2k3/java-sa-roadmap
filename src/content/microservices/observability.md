Với một monolith, khi có lỗi bạn mở một file log và tìm. Với hai mươi service, mỗi service ba instance, một request của người dùng đi qua sáu service, và "trang thanh toán chậm" có thể đến từ bất kỳ đâu. **Observability** (khả năng quan sát) là mức độ mà bạn có thể hiểu trạng thái bên trong hệ thống chỉ bằng dữ liệu nó phát ra, kể cả với những câu hỏi chưa lường trước. Bài này hướng dẫn cách làm cho hệ thống Spring Boot 3 quan sát được: log có cấu trúc, metrics với Micrometer và Prometheus, distributed tracing với OpenTelemetry, và cách biến tất cả thành SLO cùng cảnh báo có ý nghĩa.

## Mục tiêu bài học

- Cấu hình log JSON có cấu trúc và dùng trace ID làm correlation ID xuyên suốt các service.
- Thu thập metrics bằng Micrometer, cho Prometheus scrape, viết PromQL và dựng dashboard Grafana theo phương pháp RED.
- Bật distributed tracing với Micrometer Tracing và OpenTelemetry, hiểu context propagation và sampling.
- Định nghĩa SLI, SLO, SLA, tính error budget và viết cảnh báo theo burn rate.

## Ba nguồn dữ liệu và cách chúng nối với nhau

- **Logs:** bản ghi chi tiết của từng sự kiện rời rạc. Trả lời câu hỏi "chuyện gì đã xảy ra với request này".
- **Metrics:** số liệu tổng hợp theo thời gian, rẻ để lưu trữ lâu dài. Trả lời "hệ thống đang khoẻ hay không, xu hướng thế nào".
- **Traces:** hành trình của một request qua nhiều service, gồm các span lồng nhau. Trả lời "thời gian bị tiêu ở đâu".

Giá trị thật sự nằm ở **sự liên kết**: từ cảnh báo metric (tỉ lệ lỗi tăng) mở dashboard, từ dashboard nhảy sang trace của một request chậm (qua exemplar), từ trace lọc ra log có cùng `traceId`. Để làm được điều đó, mọi tín hiệu phải mang chung các nhãn như tên service, môi trường và trace ID.

```text
 order-service                               inventory-service
 +----------------------------+   HTTP      +-----------------------------+
 | span: POST /orders         | ----------> | span: GET /api/inventory/{} |
 |   span: INSERT orders      | traceparent |   span: SELECT stock        |
 +-------------+--------------+             +--------------+--------------+
               | OTLP (traces)    Prometheus scrape        | log JSON ra stdout
               v                         |                 v
     +-------------------------+         |        +------------------+
     | OpenTelemetry Collector |         |        | Loki/Elasticsearch|
     +------------+------------+         |        +---------+--------+
                  v                      v                  |
           Tempo / Jaeger           Prometheus              |
                  \                      |                 /
                   +---------------- Grafana -------------+
```

## Log có cấu trúc và correlation ID

### Vì sao log phải là JSON

Log dạng văn bản tự do (`Order 123 created by user abc`) đọc thì dễ nhưng tìm kiếm và thống kê thì khó. **Structured logging** ghi mỗi sự kiện thành một dòng JSON với các trường rõ ràng, để hệ thống thu thập log (Loki, Elasticsearch, OpenSearch) truy vấn được theo trường: `service.name="order-service" AND log.level="ERROR" AND orderId="..."`.

Từ Spring Boot 3.4, structured logging có sẵn, không cần thư viện ngoài:

```yaml
spring:
  application:
    name: order-service     # được dùng làm service.name trong log ECS
logging:
  structured:
    format:
      console: ecs           # các định dạng có sẵn: ecs, logstash, gelf
  level:
    root: INFO
    com.example.order: DEBUG
```

Với phiên bản Boot cũ hơn, thư viện `logstash-logback-encoder` là lựa chọn phổ biến. Trong container, hãy ghi log ra stdout và để agent của nền tảng (Fluent Bit, Promtail, OpenTelemetry Collector...) thu gom, thay vì ghi file trong container.

### Correlation ID

**Correlation ID** là một định danh đi theo request qua mọi service, để gom tất cả log liên quan. Khi đã bật Micrometer Tracing, bạn có sẵn correlation ID tốt nhất: **trace ID**. Spring Boot tự đưa `traceId` và `spanId` vào MDC (Mapped Diagnostic Context, một map ngữ cảnh gắn với thread mà logger tự in ra), và tự truyền trace ID sang service khác qua header W3C `traceparent`:

```text
traceparent: 00-4bf92f3577b34da6a3ce929d0e0e4736-00f067aa0ba902b7-01
             ^  ^ trace-id (32 hex)                ^ parent span-id  ^ cờ: 01 = được lấy mẫu
             phiên bản
```

Để thêm khoá nghiệp vụ vào log, dùng MDC trong phạm vi có kiểm soát:

```java
public OrderId placeOrder(PlaceOrderCommand command) {
    try (var ignored = MDC.putCloseable("orderId", command.orderId().toString())) {
        log.info("Bắt đầu đặt đơn, số dòng hàng={}", command.lines().size());
        // ... mọi dòng log trong khối này đều có trường orderId
        return command.orderId();
    }   // tự xoá khỏi MDC, tránh rò sang request khác dùng lại thread
}
```

Nếu muốn một giá trị như `tenantId` tự động đi qua mọi service, dùng **baggage** của Micrometer Tracing: khai báo `management.tracing.baggage.remote-fields: tenant-id` để truyền qua header, và `management.tracing.baggage.correlation.fields: tenant-id` để đưa vào MDC.

> **Lưu ý:** MDC dựa trên `ThreadLocal`. Khi chuyển việc sang thread khác (`@Async`, executor tự tạo), ngữ cảnh không tự đi theo. Dùng `ContextPropagatingTaskDecorator` của Spring cho executor để truyền cả MDC lẫn trace context.

## Metrics với Micrometer, Prometheus và Grafana

### Micrometer và các loại meter

**Micrometer** là lớp trừu tượng cho metrics, tương tự SLF4J cho logging: bạn viết code một lần, xuất ra Prometheus, Datadog, CloudWatch... tuỳ registry. Các loại meter chính:

| Loại | Dùng cho | Ví dụ |
|---|---|---|
| Counter | Giá trị chỉ tăng | Số đơn đã đặt, số lỗi |
| Gauge | Giá trị tức thời, lên xuống | Kích thước hàng đợi, số kết nối đang dùng |
| Timer | Thời gian và số lần của một thao tác | Thời gian gọi cổng thanh toán |
| DistributionSummary | Phân phối của giá trị không phải thời gian | Kích thước payload, giá trị đơn hàng |
| LongTaskTimer | Tác vụ đang chạy kéo dài | Job đồng bộ dữ liệu ban đêm |

Với `spring-boot-starter-actuator` và `micrometer-registry-prometheus`, Boot tự có các metric như `http.server.requests`, `jvm.memory.used`, `jvm.gc.pause`, `hikaricp.connections.active`. Prometheus dùng mô hình **pull**: định kỳ gọi `/actuator/prometheus` để lấy số liệu.

```yaml
management:
  endpoints:
    web:
      exposure:
        include: health,info,prometheus
  metrics:
    tags:
      application: ${spring.application.name}   # nhãn chung cho mọi metric
    distribution:
      percentiles-histogram:
        http.server.requests: true              # xuất bucket để Prometheus tính p95/p99
```

Metric nghiệp vụ tự định nghĩa:

```java
@Component
class CheckoutMetrics {

    private final MeterRegistry registry;
    private final Timer paymentTimer;

    CheckoutMetrics(MeterRegistry registry) {
        this.registry = registry;
        this.paymentTimer = Timer.builder("shop.payment.duration")
                .description("Thời gian gọi cổng thanh toán")
                .publishPercentileHistogram()
                .register(registry);
    }

    void orderPlaced(SalesChannel channel) {       // enum: WEB, APP, POS -> số giá trị nhỏ, cố định
        Counter.builder("shop.orders.placed")
                .tag("channel", channel.name())
                .register(registry)                // Micrometer trả lại meter đã có nếu trùng tên và tag
                .increment();
    }

    <T> T timePayment(Supplier<T> paymentCall) {
        return paymentTimer.record(paymentCall);
    }
}
```

Trên Prometheus, các metric này xuất hiện với tên `shop_orders_placed_total` và `shop_payment_duration_seconds_bucket/_count/_sum`.

### PromQL và dashboard

Ba phương pháp chọn chỉ số giúp dashboard có trọng tâm:

- **RED** cho service: **R**ate (số request/giây), **E**rrors (tỉ lệ lỗi), **D**uration (phân phối độ trễ).
- **USE** cho tài nguyên: **U**tilization, **S**aturation (mức bão hoà, ví dụ hàng đợi), **E**rrors.
- **Four golden signals** của Google SRE: latency, traffic, errors, saturation.

```text
# Rate: request/giây theo endpoint (uri là template như /orders/{id}, không phải URL thật)
sum by (uri) (rate(http_server_requests_seconds_count{application="order-service"}[5m]))

# Errors: tỉ lệ request 5xx
  sum(rate(http_server_requests_seconds_count{application="order-service", status=~"5.."}[5m]))
/ sum(rate(http_server_requests_seconds_count{application="order-service"}[5m]))

# Duration: p99 gộp qua mọi instance
histogram_quantile(0.99,
  sum by (le) (rate(http_server_requests_seconds_bucket{application="order-service"}[5m])))
```

Một dashboard Grafana tốt cho mỗi service thường có: hàng trên cùng là RED và trạng thái SLO, tiếp theo là phụ thuộc (độ trễ gọi ra ngoài, trạng thái circuit breaker), cuối cùng là tài nguyên (heap, GC pause, connection pool, thread). Dùng biến (variable) như `application`, `instance` để một dashboard dùng cho nhiều service, và lưu dashboard dạng JSON trong Git (provisioning) để review và tái tạo được.

> **Lưu ý:** Percentile tính sẵn ở phía ứng dụng (`percentiles: 0.99`) **không gộp được** giữa các instance; lấy trung bình p99 của ba instance không ra p99 của cả hệ thống. Hãy xuất histogram và dùng `histogram_quantile` trên Prometheus.

## Distributed tracing với OpenTelemetry

### Khái niệm

- **Trace:** toàn bộ hành trình của một request, định danh bằng trace ID.
- **Span:** một đơn vị công việc trong trace (một lời gọi HTTP, một câu SQL), có thời điểm bắt đầu, kết thúc, thuộc tính (attribute), trạng thái và span cha.
- **Context propagation:** truyền trace ID và span ID qua ranh giới process, qua header HTTP (`traceparent`) hoặc header của message Kafka.
- **Sampling:** quyết định trace nào được ghi lại, vì ghi 100% ở hệ thống lớn rất tốn kém.

**OpenTelemetry** (OTel) là chuẩn mở, trung lập nhà cung cấp, gồm API, SDK, giao thức OTLP và Collector. Trong Spring Boot 3, Spring Cloud Sleuth đã được thay bằng **Micrometer Tracing**: code của Spring được đo bằng Micrometer Observation API, Micrometer Tracing chuyển thành span, và bridge `micrometer-tracing-bridge-otel` cùng exporter `opentelemetry-exporter-otlp` gửi span qua OTLP tới Collector hoặc backend (Jaeger, Grafana Tempo, Zipkin...).

```yaml
management:
  tracing:
    sampling:
      probability: 0.1      # mặc định của Boot là 0.1 (10%); môi trường dev có thể đặt 1.0
  otlp:
    tracing:
      endpoint: http://otel-collector:4318/v1/traces   # OTLP qua HTTP
spring:
  kafka:
    template:
      observation-enabled: true    # truyền trace context vào header message Kafka
    listener:
      observation-enabled: true
```

Để tạo span cho logic nghiệp vụ, dùng Observation API. Một observation sinh ra đồng thời một span và một timer:

```java
@Service
class PricingService {

    private final ObservationRegistry observations;

    PricingService(ObservationRegistry observations) {
        this.observations = observations;
    }

    Money quote(Cart cart) {
        return Observation.createNotStarted("pricing.quote", observations)
                .lowCardinalityKeyValue("customer.tier", cart.customerTier().name()) // tag metric + span
                .highCardinalityKeyValue("cart.id", cart.id().toString())           // chỉ vào span
                .observe(() -> calculate(cart));
    }
}
```

Cách khác là dùng annotation `@Observed`, cần bật `management.observations.annotations.enabled=true` và có AOP trên classpath.

### Agent hay thư viện?

Ngoài cách tích hợp qua Micrometer, có thể chạy **OpenTelemetry Java agent** (`-javaagent:opentelemetry-javaagent.jar`). Agent tự đo rất nhiều thư viện mà không sửa code, phù hợp khi cần phủ nhanh nhiều service hoặc ứng dụng cũ. Đổi lại, nó thêm thời gian khởi động và nằm ngoài vòng đời dependency của dự án. Cách tích hợp qua Micrometer gọn, kiểm soát tốt và đi cùng hệ sinh thái Spring. Chọn một cách cho mỗi service, tránh để cả hai cùng đo một thứ.

### Sampling

- **Head-based sampling:** quyết định ngay khi bắt đầu trace (ví dụ giữ 10%), quyết định được truyền theo cờ trong `traceparent` nên mọi service thống nhất. Đơn giản, rẻ, nhưng có thể bỏ sót đúng những trace lỗi hiếm.
- **Tail-based sampling:** Collector giữ tạm span, đợi trace hoàn tất rồi mới quyết định, ví dụ giữ mọi trace có lỗi hoặc chậm hơn 2 giây, cộng thêm một tỉ lệ nhỏ trace bình thường. Hiệu quả hơn nhưng Collector cần nhiều bộ nhớ và mọi span của một trace phải về cùng một Collector.

## SLI, SLO, SLA và cảnh báo

### Định nghĩa

- **SLI** (Service Level Indicator): chỉ số đo mức độ phục vụ, nên biểu diễn dạng tỉ lệ *sự kiện tốt / sự kiện hợp lệ*. Ví dụ: tỉ lệ request checkout không trả 5xx; tỉ lệ request checkout hoàn tất dưới 800ms.
- **SLO** (Service Level Objective): mục tiêu cho SLI trong một cửa sổ thời gian. Ví dụ: 99,9% request checkout thành công trong 30 ngày gần nhất.
- **SLA** (Service Level Agreement): cam kết với khách hàng, kèm hậu quả khi vi phạm (hoàn tiền, phạt). SLA nên lỏng hơn SLO nội bộ để có vùng đệm.
- **Error budget** = 1 − SLO. Với SLO 99,9% trong 30 ngày, ngân sách lỗi là 0,1% số request, tương đương khoảng 43 phút nếu tính theo thời gian ngừng hoàn toàn. Còn ngân sách thì đẩy nhanh phát hành; cạn ngân sách thì ưu tiên ổn định.

Chọn SLI theo góc nhìn người dùng (các hành trình quan trọng như tìm kiếm, thêm vào giỏ, thanh toán), đo càng gần người dùng càng tốt (ở gateway hoặc load balancer), và đừng đặt SLO 100%: nó không đạt được và khiến mọi thay đổi bị đóng băng.

### Cảnh báo theo triệu chứng và burn rate

Nguyên tắc: **cảnh báo theo triệu chứng người dùng cảm nhận** (SLO đang bị đe doạ), không theo nguyên nhân (CPU 80%). Mọi cảnh báo gọi người dậy lúc nửa đêm phải khẩn cấp, cần hành động và có runbook đi kèm. Những thứ còn lại nên là ticket hoặc chỉ hiển thị trên dashboard.

**Burn rate** là tốc độ tiêu ngân sách lỗi so với mức "vừa hết đúng cuối cửa sổ". Burn rate 1 nghĩa là tiêu hết ngân sách sau đúng 30 ngày; burn rate 14,4 duy trì trong 1 giờ sẽ tiêu 14,4 × 1/720 = 2% ngân sách tháng. Cách làm phổ biến (theo SRE Workbook của Google) là kết hợp nhiều cửa sổ: báo động khẩn khi burn rate 14,4 trong 1 giờ hoặc 6 trong 6 giờ; tạo ticket khi burn rate 1 trong 3 ngày. Mỗi điều kiện đi kèm một cửa sổ ngắn (ví dụ 5 phút) để cảnh báo tự tắt nhanh khi sự cố đã qua.

```yaml
groups:
  - name: checkout-slo
    rules:
      - alert: CheckoutErrorBudgetFastBurn
        expr: |
          (
            sum(rate(http_server_requests_seconds_count{application="checkout", status=~"5.."}[1h]))
            / sum(rate(http_server_requests_seconds_count{application="checkout"}[1h]))
          ) > (14.4 * 0.001)
          and
          (
            sum(rate(http_server_requests_seconds_count{application="checkout", status=~"5.."}[5m]))
            / sum(rate(http_server_requests_seconds_count{application="checkout"}[5m]))
          ) > (14.4 * 0.001)
        labels:
          severity: page
        annotations:
          summary: "Checkout đang tiêu error budget nhanh gấp 14,4 lần (SLO 99,9%)"
          runbook: "Xem runbook checkout trên wiki nội bộ"
```

Alertmanager nhận cảnh báo từ Prometheus, gom nhóm, khử trùng lặp và định tuyến theo `severity` tới kênh phù hợp (PagerDuty, Slack, email).

## Lỗi thường gặp

- **Log văn bản tự do, không có trace ID.** Không thể ghép log của một request qua nhiều service. Cách sửa: bật structured logging, bật tracing để có `traceId` trong mọi dòng log.
- **Ghi dữ liệu nhạy cảm vào log**: token, mật khẩu, số thẻ, thông tin cá nhân. Cách sửa: không log nguyên request/response body, che (mask) trường nhạy cảm, review log trong code review.
- **Tag metric có cardinality cao** như `userId`, `orderId` hoặc URL đầy đủ chứa ID. Mỗi giá trị tạo một time series mới, Prometheus phình bộ nhớ và chậm. Cách sửa: tag chỉ nhận số giá trị nhỏ, cố định; định danh chi tiết đưa vào trace hoặc log.
- **Lấy trung bình percentile giữa các instance.** Kết quả sai về mặt toán học. Cách sửa: xuất histogram và tính bằng `histogram_quantile`.
- **Trace bị đứt giữa các service** vì tự tạo `RestClient.create()` hoặc `new RestTemplate()`, hoặc tắt observation của Kafka. Cách sửa: dùng builder do Boot cấu hình, bật `observation-enabled` cho Kafka, truyền context khi chuyển thread.
- **Cảnh báo theo nguyên nhân và quá nhiều cảnh báo**, dẫn tới "alert fatigue", người trực bỏ qua cả cảnh báo thật. Cách sửa: cảnh báo theo SLO và burn rate, xoá cảnh báo không ai hành động.
- **Đặt SLO 100% hoặc SLA bằng SLO.** Cách sửa: chọn SLO dựa trên nhu cầu người dùng và dữ liệu lịch sử, SLA lỏng hơn SLO.

## Bài tập thực hành

1. **Ghép ba tín hiệu:** bật structured logging ECS và tracing cho `order-service` và `inventory-service`. Chạy bằng Docker Compose cùng OpenTelemetry Collector, Grafana Tempo (hoặc Jaeger), Prometheus, Loki và Grafana. Gây một lỗi ở inventory, từ dòng log lỗi lấy `traceId` và mở trace tương ứng để xác định span gây lỗi.
2. **Dashboard RED:** dựng dashboard Grafana cho `order-service` gồm rate, error rate, p50/p99, trạng thái circuit breaker và metric nghiệp vụ `shop_orders_placed_total` theo kênh bán. Lưu dashboard dạng JSON vào Git.
3. **SLO và cảnh báo:** định nghĩa hai SLO cho checkout (tỉ lệ thành công 99,9% và 95% request dưới 800ms trong 30 ngày), tính error budget theo số request với tải giả định 2 triệu request mỗi ngày, viết hai rule cảnh báo burn rate và kiểm chứng bằng cách bơm lỗi 5% trong 10 phút.

## Tóm tắt

- Logs, metrics, traces chỉ thực sự hữu ích khi được liên kết với nhau qua nhãn chung và trace ID.
- Log phải là JSON có cấu trúc (Boot 3.4+ hỗ trợ sẵn ECS/Logstash/GELF); trace ID là correlation ID tự nhiên, khoá nghiệp vụ đưa vào MDC có phạm vi.
- Micrometer cung cấp counter, gauge, timer; Prometheus scrape `/actuator/prometheus`; xuất histogram để tính percentile đúng.
- Giữ cardinality của tag thấp; dashboard theo RED cho service và USE cho tài nguyên.
- Micrometer Tracing thay Sleuth trong Boot 3; xuất span qua OTLP tới Collector; dùng builder của Boot để không đứt trace.
- SLI là tỉ lệ sự kiện tốt, SLO là mục tiêu, SLA là hợp đồng; error budget cân bằng tốc độ và ổn định.
- Cảnh báo theo triệu chứng và burn rate nhiều cửa sổ, mỗi cảnh báo phải có hành động và runbook.
