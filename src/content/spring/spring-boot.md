Spring Boot không phải một framework mới mà là lớp "có chính kiến" (*opinionated*) đặt trên Spring Framework: nó tự cấu hình bean dựa trên những gì có trong classpath, gom dependency thành các *starter* và chuẩn hoá cách đọc cấu hình. Nhờ vậy bạn có một REST API chạy được chỉ sau vài phút – nhưng nếu không hiểu bên dưới, bạn sẽ lúng túng ngay khi cần ghi đè hành vi mặc định. Bài này đi từ cơ chế auto-configuration tới những thực hành biến một API "chạy được" thành API **production-ready**: cấu hình theo môi trường, thiết kế REST đúng chuẩn, validate input, xử lý lỗi thống nhất, tài liệu OpenAPI và giám sát bằng Actuator.

## Mục tiêu bài học

- Giải thích cơ chế auto-configuration và tự viết được một starter nội bộ.
- Quản lý cấu hình bằng `application.yml`, profile và `@ConfigurationProperties` có kiểm tra kiểu.
- Thiết kế REST API đúng ngữ nghĩa HTTP method, status code và có chiến lược versioning.
- Validate input bằng Bean Validation và trả lỗi thống nhất theo chuẩn ProblemDetail.
- Sinh tài liệu OpenAPI với springdoc và giám sát ứng dụng bằng Actuator.

## Auto-configuration hoạt động thế nào

`@SpringBootApplication` thực chất gộp ba annotation: `@SpringBootConfiguration` (một `@Configuration`), `@ComponentScan` (quét package hiện tại trở xuống) và `@EnableAutoConfiguration`.

`@EnableAutoConfiguration` đọc danh sách class trong file `META-INF/spring/org.springframework.boot.autoconfigure.AutoConfiguration.imports` của mọi jar trên classpath (Spring Boot 2.x dùng `spring.factories`; từ 3.0 cách này không còn được hỗ trợ cho auto-configuration). Mỗi class là một `@AutoConfiguration` có gắn điều kiện, ví dụ:

- `@ConditionalOnClass(DataSource.class)`: chỉ chạy khi có class đó trong classpath.
- `@ConditionalOnProperty("spring.cache.type")`: chỉ chạy khi có property tương ứng.
- `@ConditionalOnMissingBean`: chỉ tạo bean nếu **bạn chưa định nghĩa** bean cùng kiểu.

Điều kiện cuối là nguyên tắc quan trọng nhất: auto-configuration luôn **lùi lại** (*back off*) khi bạn tự khai báo bean. Muốn thay `ObjectMapper` hay `DataSource` mặc định, bạn chỉ cần khai báo `@Bean` của riêng mình.

Khi cần biết vì sao một cấu hình được hay không được áp dụng, chạy ứng dụng với `--debug` để in *condition evaluation report* (danh sách điều kiện khớp và không khớp), hoặc xem endpoint `/actuator/conditions`. Có thể loại bỏ một auto-configuration bằng `@SpringBootApplication(exclude = ...)` hoặc property `spring.autoconfigure.exclude`.

### Viết starter riêng

Starter nội bộ hữu ích khi nhiều service trong công ty cần cùng một cấu hình cắt ngang: audit log, client gọi hệ thống lõi, header truy vết. Quy ước gồm hai module: `acme-audit-spring-boot-autoconfigure` chứa code và điều kiện, `acme-audit-spring-boot-starter` chỉ là POM gom dependency (dự án nhỏ có thể gộp làm một). Không đặt tên bắt đầu bằng `spring-boot-` vì tiền tố đó dành cho starter chính thức.

```java
@AutoConfiguration
@ConditionalOnClass(AuditClient.class)
@ConditionalOnProperty(prefix = "acme.audit", name = "enabled", havingValue = "true", matchIfMissing = true)
@EnableConfigurationProperties(AuditProperties.class)
public class AuditAutoConfiguration {

    @Bean
    @ConditionalOnMissingBean                 // service nào tự khai báo AuditClient thì bean này lùi lại
    AuditClient auditClient(AuditProperties props) {
        return new HttpAuditClient(props.endpoint(), props.timeout());
    }
}

@ConfigurationProperties(prefix = "acme.audit")
public record AuditProperties(
        @DefaultValue("true") boolean enabled,
        URI endpoint,
        @DefaultValue("2s") Duration timeout) {}
```

```text
# src/main/resources/META-INF/spring/org.springframework.boot.autoconfigure.AutoConfiguration.imports
com.acme.audit.autoconfigure.AuditAutoConfiguration
```

Kiểm thử starter bằng `ApplicationContextRunner`: khởi tạo context nhỏ với các property khác nhau rồi khẳng định bean có hay không có mặt, nhanh hơn nhiều so với `@SpringBootTest`.

## Quản lý cấu hình

### Nguồn cấu hình và thứ tự ưu tiên

Spring Boot gộp cấu hình từ nhiều nguồn vào `Environment`. Một số nguồn hay dùng, theo thứ tự ưu tiên **giảm dần** (nguồn trên ghi đè nguồn dưới):

1. Tham số dòng lệnh: `--server.port=9090`
2. Java system properties: `-Dserver.port=9090`
3. Biến môi trường của hệ điều hành: `SERVER_PORT=9090`
4. File theo profile: `application-prod.yml`
5. File chung: `application.yml`

Nhờ *relaxed binding*, `spring.datasource.url` có thể được ghi đè bằng biến môi trường `SPRING_DATASOURCE_URL` – rất thuận tiện khi chạy trên container và Kubernetes. Theo nguyên tắc 12-factor, image chỉ build **một lần**, môi trường khác nhau chỉ khác nhau ở cấu hình bên ngoài.

### Profile

Profile cho phép nhóm cấu hình theo môi trường. Có thể tách file `application-prod.yml`, hoặc dùng YAML nhiều document:

```yaml
spring:
  application:
    name: order-service
  datasource:
    url: jdbc:postgresql://localhost:5432/orders
    username: orders
    password: ${DB_PASSWORD}          # lấy từ biến môi trường, không commit secret
app:
  orders:
    max-items-per-order: 50
    payment-timeout: 3s
---
spring:
  config:
    activate:
      on-profile: prod
  datasource:
    url: jdbc:postgresql://orders-db.internal:5432/orders
app:
  orders:
    max-items-per-order: 100
```

Kích hoạt bằng `--spring.profiles.active=prod` hoặc `SPRING_PROFILES_ACTIVE=prod`.

### @ConfigurationProperties thay cho @Value

`@Value("${app.orders.max-items-per-order}")` rải rác khắp code thì khó tìm, không kiểm tra kiểu và không validate được. `@ConfigurationProperties` gom một nhóm cấu hình vào một object có kiểu rõ ràng, tự chuyển đổi `3s` thành `Duration`, hỗ trợ validate và – khi thêm `spring-boot-configuration-processor` – IDE gợi ý được tên property.

```java
@Validated
@ConfigurationProperties(prefix = "app.orders")
public record OrderProperties(
        @Min(1) @Max(500) int maxItemsPerOrder,
        @NotNull Duration paymentTimeout) {}

@SpringBootApplication
@ConfigurationPropertiesScan          // tự đăng ký mọi class @ConfigurationProperties trong package
public class OrderApplication {
    public static void main(String[] args) {
        SpringApplication.run(OrderApplication.class, args);
    }
}
```

Nếu cấu hình sai (ví dụ `max-items-per-order: 0`), ứng dụng **dừng ngay khi khởi động** với thông báo rõ ràng – tốt hơn nhiều so với lỗi xuất hiện giữa đêm trên production.

## Thiết kế REST API đúng chuẩn

### Tài nguyên và HTTP method

URL mô tả **tài nguyên** (danh từ, số nhiều), HTTP method mô tả **hành động**: `/orders`, `/orders/{id}`, `/orders/{id}/items`. Tránh kiểu `/getOrder` hay `/createOrder`.

| Method | Ý nghĩa | Safe | Idempotent |
|---|---|---|---|
| GET | Đọc tài nguyên | Có | Có |
| POST | Tạo mới hoặc thực hiện một xử lý | Không | Không |
| PUT | Thay thế toàn bộ tài nguyên | Không | Có |
| PATCH | Cập nhật một phần | Không | Không đảm bảo |
| DELETE | Xoá tài nguyên | Không | Có |

*Safe* nghĩa là không thay đổi trạng thái server; *idempotent* nghĩa là gọi một lần hay nhiều lần cho cùng kết quả trên server. Tính idempotent quyết định client có được tự động retry hay không. Với POST quan trọng như thanh toán, một thực hành phổ biến là yêu cầu client gửi header `Idempotency-Key` để server nhận diện và bỏ qua request trùng. Những hành động không vừa khuôn CRUD có thể mô hình hoá thành tài nguyên con, ví dụ `POST /orders/{id}/cancellation`.

### Status code

| Code | Khi nào dùng |
|---|---|
| 200 OK | Đọc hoặc cập nhật thành công, có body |
| 201 Created | Tạo mới thành công, kèm header `Location` trỏ tới tài nguyên mới |
| 202 Accepted | Đã nhận, sẽ xử lý bất đồng bộ |
| 204 No Content | Thành công, không có body (thường cho DELETE) |
| 400 Bad Request | Input sai định dạng, validate thất bại |
| 401 Unauthorized | Chưa xác thực hoặc token không hợp lệ |
| 403 Forbidden | Đã xác thực nhưng không đủ quyền |
| 404 Not Found | Tài nguyên không tồn tại |
| 409 Conflict | Xung đột trạng thái: trùng dữ liệu, sai version khi cập nhật |
| 422 Unprocessable Content | Đúng cú pháp nhưng vi phạm quy tắc nghiệp vụ (nếu team chọn phân biệt với 400) |
| 429 Too Many Requests | Vượt rate limit |
| 500 / 503 | Lỗi phía server / tạm thời không phục vụ được |

### Versioning

| Cách | Ví dụ | Nhận xét |
|---|---|---|
| URI path | `/api/v1/orders` | Đơn giản, dễ thấy, dễ route ở gateway; phổ biến nhất |
| Header tuỳ chỉnh | `X-API-Version: 2` | URL gọn nhưng khó thử bằng trình duyệt, dễ quên ở cache |
| Media type | `Accept: application/vnd.acme.order.v2+json` | Đúng tinh thần HTTP nhất, nhưng phức tạp với client |

Dù chọn cách nào, quy tắc quan trọng hơn là: chỉ tăng version khi có **thay đổi phá vỡ tương thích** (xoá field, đổi kiểu, đổi ý nghĩa). Thêm field mới hay thêm endpoint không cần version mới, với điều kiện client được thiết kế để bỏ qua field lạ. Hãy công bố chính sách ngừng hỗ trợ (*deprecation policy*) cho version cũ.

### Controller mẫu

```java
@RestController
@RequestMapping("/api/v1/orders")
public class OrderController {

    private final OrderService orderService;

    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    @GetMapping("/{id}")
    public OrderResponse get(@PathVariable Long id) {
        return orderService.findById(id);           // không thấy → ném OrderNotFoundException
    }

    @PostMapping
    public ResponseEntity<OrderResponse> create(@Valid @RequestBody CreateOrderRequest request) {
        OrderResponse created = orderService.create(request);
        URI location = ServletUriComponentsBuilder.fromCurrentRequest()
                .path("/{id}").buildAndExpand(created.id()).toUri();
        return ResponseEntity.created(location).body(created);   // 201 + Location
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        orderService.delete(id);
    }
}
```

Controller nhận và trả **DTO** (ở đây là record), không trả thẳng entity JPA: tránh lộ field nội bộ, tránh lỗi lazy loading khi serialize và cho phép schema database thay đổi độc lập với hợp đồng API.

## Validate input và xử lý lỗi tập trung

### Bean Validation

Thêm `spring-boot-starter-validation` (dùng Hibernate Validator). Gắn ràng buộc từ gói `jakarta.validation.constraints` lên DTO, và đặt `@Valid` trước `@RequestBody` để kích hoạt. Object lồng nhau và phần tử của collection cũng cần `@Valid`.

```java
public record CreateOrderRequest(
        @NotBlank String customerId,
        @NotEmpty @Size(max = 50) List<@Valid OrderItemRequest> items,
        @Size(max = 500) String note) {}

public record OrderItemRequest(
        @NotBlank String sku,
        @Positive int quantity) {}
```

Khi validate thất bại, Spring ném `MethodArgumentNotValidException` và mặc định trả 400. Bean Validation phù hợp với ràng buộc về **hình thức** (bắt buộc, độ dài, định dạng). Quy tắc **nghiệp vụ** cần dữ liệu khác (còn hàng không, vượt hạn mức tín dụng không) thuộc về service/domain.

### ProblemDetail: định dạng lỗi chuẩn

RFC 9457 (thay thế RFC 7807) định nghĩa kiểu nội dung `application/problem+json` với các field `type`, `title`, `status`, `detail`, `instance` và cho phép thêm field mở rộng. Spring Framework 6 có sẵn class `ProblemDetail`; đặt `spring.mvc.problemdetails.enabled=true` để các exception có sẵn của Spring MVC cũng trả theo định dạng này. Một `@RestControllerAdvice` gom toàn bộ việc chuyển exception thành response:

```java
@RestControllerAdvice
public class GlobalExceptionHandler extends ResponseEntityExceptionHandler {

    @ExceptionHandler(OrderNotFoundException.class)
    ProblemDetail handleNotFound(OrderNotFoundException ex) {
        ProblemDetail pd = ProblemDetail.forStatusAndDetail(HttpStatus.NOT_FOUND, ex.getMessage());
        pd.setTitle("Order not found");
        pd.setType(URI.create("https://api.example.com/problems/order-not-found"));
        pd.setProperty("orderId", ex.getOrderId());
        return pd;
    }

    @Override
    protected ResponseEntity<Object> handleMethodArgumentNotValid(
            MethodArgumentNotValidException ex, HttpHeaders headers,
            HttpStatusCode status, WebRequest request) {
        ProblemDetail pd = ex.getBody();
        Map<String, String> errors = new LinkedHashMap<>();
        ex.getBindingResult().getFieldErrors()
                .forEach(fe -> errors.put(fe.getField(), fe.getDefaultMessage()));
        pd.setProperty("errors", errors);
        return handleExceptionInternal(ex, pd, headers, status, request);
    }
}
```

Kế thừa `ResponseEntityExceptionHandler` giúp mọi exception chuẩn của Spring MVC (sai method, thiếu tham số, JSON hỏng…) đều trả ProblemDetail. Response lỗi validate sẽ có dạng:

```json
{
  "type": "about:blank",
  "title": "Bad Request",
  "status": 400,
  "detail": "Invalid request content.",
  "instance": "/api/v1/orders",
  "errors": { "customerId": "must not be blank" }
}
```

> **Lưu ý:** Không bao giờ đưa stack trace, câu SQL hay message nội bộ của exception không kiểm soát vào response. Với lỗi không lường trước, trả 500 với thông điệp chung và một mã tham chiếu (ví dụ trace id) để tra log.

## Tài liệu API với OpenAPI và springdoc

OpenAPI là đặc tả chuẩn mô tả REST API (endpoint, schema, mã lỗi, cơ chế xác thực). Thư viện springdoc-openapi đọc controller, DTO và annotation validation để sinh đặc tả tự động:

```xml
<dependency>
    <groupId>org.springdoc</groupId>
    <artifactId>springdoc-openapi-starter-webmvc-ui</artifactId>
    <version>${springdoc.version}</version>  <!-- dòng 2.x cho Spring Boot 3 -->
</dependency>
```

Sau khi thêm dependency, đặc tả JSON có ở `/v3/api-docs` và giao diện Swagger UI ở `/swagger-ui.html`. Ràng buộc như `@NotBlank`, `@Size` được phản ánh vào schema (required, maxLength). Bổ sung mô tả bằng annotation của Swagger:

```java
@Tag(name = "Orders")
@RestController
@RequestMapping("/api/v1/orders")
public class OrderQueryController {

    @Operation(summary = "Lấy chi tiết đơn hàng")
    @ApiResponse(responseCode = "200", description = "Tìm thấy đơn hàng")
    @ApiResponse(responseCode = "404", description = "Đơn hàng không tồn tại",
            content = @Content(schema = @Schema(implementation = ProblemDetail.class)))
    @GetMapping("/{id}")
    public OrderResponse get(@PathVariable Long id) { /* … */ }
}
```

Hai cách tiếp cận cần cân nhắc: **code-first** (viết code rồi sinh đặc tả – nhanh, luôn khớp code) và **design-first/contract-first** (viết đặc tả trước, sinh code bằng công cụ như openapi-generator – phù hợp khi nhiều team cần thống nhất hợp đồng trước khi code). Ở môi trường production, tắt Swagger UI (`springdoc.swagger-ui.enabled=false`) hoặc đặt sau xác thực; thay vào đó, xuất đặc tả trong pipeline CI để lưu phiên bản và phát hiện thay đổi phá vỡ tương thích.

## Giám sát với Spring Boot Actuator

`spring-boot-starter-actuator` thêm các endpoint vận hành: `health`, `info`, `metrics`, `prometheus` (cần thêm `micrometer-registry-prometheus`), `loggers` (đổi mức log lúc chạy), `env`, `configprops`, `threaddump`, `heapdump`, `mappings`, `conditions`. Mặc định chỉ `health` được mở qua HTTP.

```yaml
management:
  server:
    port: 8081                         # tách cổng quản trị khỏi cổng phục vụ người dùng
  endpoints:
    web:
      exposure:
        include: health,info,prometheus
  endpoint:
    health:
      show-details: when-authorized
      probes:
        enabled: true                  # /actuator/health/liveness và /readiness
```

Trên Kubernetes, **liveness** trả lời "process còn sống không, có cần khởi động lại không", còn **readiness** trả lời "có nên nhận traffic không". Đừng để liveness phụ thuộc database: khi database sập, khởi động lại hàng loạt pod không giúp gì mà còn làm tình hình tệ hơn. Có thể thêm health indicator riêng:

```java
@Component
public class PaymentGatewayHealthIndicator implements HealthIndicator {

    private final PaymentGatewayClient client;

    public PaymentGatewayHealthIndicator(PaymentGatewayClient client) {
        this.client = client;
    }

    @Override
    public Health health() {
        return client.ping()
                ? Health.up().withDetail("provider", "stripe").build()
                : Health.down().withDetail("provider", "stripe").build();
    }
}
```

Metric nghiệp vụ được ghi qua `MeterRegistry` của Micrometer, ví dụ `registry.counter("orders.created", "channel", "web").increment()`, rồi Prometheus thu thập qua `/actuator/prometheus`.

> **Lưu ý:** `env`, `configprops` và `heapdump` có thể chứa secret. Không bao giờ đặt `exposure.include=*` trên cổng public; hãy tách cổng quản trị và bảo vệ bằng Spring Security hoặc network policy.

## Lỗi thường gặp

- **Trả entity JPA trực tiếp ra API.** Lộ dữ liệu nội bộ, lỗi lazy loading, vòng lặp JSON. Dùng DTO/record và mapping rõ ràng.
- **Trả 200 cho mọi thứ, mã lỗi nằm trong body.** Client, gateway và công cụ giám sát không hiểu được. Dùng đúng status code và ProblemDetail.
- **Quên `@Valid`.** Các annotation ràng buộc trên DTO bị bỏ qua hoàn toàn. Luôn kiểm tra bằng test gửi input sai.
- **Commit secret trong `application.yml`.** Dùng biến môi trường hoặc secret manager (xem bài bảo mật hạ tầng).
- **`@Value` rải rác khắp nơi.** Gom vào `@ConfigurationProperties` có validate.
- **Mở toàn bộ endpoint Actuator ra internet.** Chỉ mở những gì cần, tách cổng, yêu cầu xác thực.
- **Thay đổi phá vỡ tương thích trên version đang chạy.** Thêm version mới, giữ version cũ theo chính sách deprecation.
- **Ghi đè auto-configuration bằng cách sửa file của thư viện hay copy cấu hình.** Chỉ cần khai báo bean của bạn; dùng condition report để kiểm tra.

## Bài tập thực hành

1. **API đơn hàng chuẩn chỉnh:** Xây dựng `/api/v1/orders` với GET, POST, DELETE. POST trả 201 kèm `Location`, DELETE trả 204, không tìm thấy trả 404 dạng ProblemDetail, input sai trả 400 kèm danh sách field lỗi. Kiểm tra bằng `curl -i` và tài liệu hoá bằng springdoc.
2. **Starter nội bộ:** Viết starter `acme-request-logging` tự đăng ký một filter log method, URI, status và thời gian xử lý, bật/tắt bằng `acme.request-logging.enabled`. Viết test bằng `ApplicationContextRunner` chứng minh: bean được tạo mặc định, không được tạo khi property là `false`, và lùi lại khi ứng dụng tự khai báo bean cùng kiểu.
3. **Sẵn sàng cho vận hành:** Thêm Actuator với cổng quản trị riêng, mở `health`, `info`, `prometheus`, bật probes, viết một `HealthIndicator` cho dịch vụ bên ngoài và một counter `orders.created`. Tạo profile `prod` lấy URL database từ biến môi trường và chứng minh ứng dụng không khởi động nếu `OrderProperties` sai.

## Tóm tắt

- Auto-configuration được nạp từ file `AutoConfiguration.imports`, kích hoạt theo điều kiện và luôn lùi lại khi bạn tự khai báo bean.
- Cấu hình được gộp từ nhiều nguồn theo thứ tự ưu tiên; build image một lần, khác biệt môi trường nằm ở biến môi trường và profile.
- `@ConfigurationProperties` (record + `@Validated`) an toàn và dễ bảo trì hơn `@Value`.
- REST tốt dùng URL danh từ, HTTP method đúng ngữ nghĩa, status code chính xác và chỉ tăng version khi phá vỡ tương thích.
- `@Valid` + Bean Validation cho ràng buộc hình thức; `@RestControllerAdvice` + `ProblemDetail` cho lỗi thống nhất.
- springdoc sinh đặc tả OpenAPI từ code; Actuator cung cấp health, probes và metrics, nhưng phải được bảo vệ.
