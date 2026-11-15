Khi hệ thống đã chia thành nhiều service, có một nhóm bài toán hạ tầng lặp lại ở mọi dự án: client gọi vào đâu, các service tìm thấy nhau thế nào khi địa chỉ IP thay đổi liên tục, cấu hình của hàng chục service cho nhiều môi trường được quản lý ra sao, và gọi sang service khác thế nào cho gọn, có cân bằng tải. Spring Cloud gom lời giải cho các bài toán này thành những starter quen thuộc với dev Spring. Bài này đi qua bốn thành phần cốt lõi, đồng thời chỉ ra khi nào nền tảng như Kubernetes đã làm thay phần việc đó.

## Mục tiêu bài học

- Dựng được API gateway với Spring Cloud Gateway: route, predicate, filter, rate limit.
- Hiểu client-side và server-side discovery; cấu hình Eureka và biết khi nào chỉ cần Kubernetes DNS.
- Quản lý cấu hình tập trung bằng Spring Cloud Config, bao gồm refresh và xử lý secret.
- Gọi service khác bằng RestClient (kèm HTTP interface) hoặc OpenFeign có load balancing và timeout.

## Bức tranh tổng thể

```text
                    +---------------------------+
 Web / Mobile ----> |   Spring Cloud Gateway    |  routing, xác thực JWT, rate limit, CORS
                    +-------------+-------------+
                                  | lb://order-service
                 +----------------+----------------+
                 v                                 v
         +---------------+   RestClient / Feign   +-------------------+
         | order-service | ---------------------> | inventory-service |
         +-------+-------+   http://inventory-... +---------+---------+
                 |                                          |
                 |  đăng ký + tra cứu instance              |
                 +----------> +-------------------+ <-------+
                              | Eureka / Consul   |
                              +-------------------+
                 +----------> +-------------------+ <-------+
                              |  Config Server    | ----> Git repo cấu hình
                              +-------------------+
```

Spring Cloud phát hành theo **release train** (2023.0, 2024.0, 2025.0...), mỗi train tương thích với một số phiên bản Spring Boot nhất định. Luôn quản lý phiên bản bằng BOM `spring-cloud-dependencies` và kiểm tra bảng tương thích trên trang Spring Cloud trước khi nâng Boot; lệch phiên bản là nguyên nhân phổ biến của lỗi khởi động khó hiểu.

```xml
<dependencyManagement>
  <dependencies>
    <dependency>
      <groupId>org.springframework.cloud</groupId>
      <artifactId>spring-cloud-dependencies</artifactId>
      <version>${spring-cloud.version}</version> <!-- phải khớp với phiên bản Spring Boot -->
      <type>pom</type>
      <scope>import</scope>
    </dependency>
  </dependencies>
</dependencyManagement>
```

## API Gateway với Spring Cloud Gateway

**API gateway** là điểm vào duy nhất cho client bên ngoài. Nó che giấu cấu trúc bên trong và xử lý các mối quan tâm cắt ngang (cross-cutting concern): định tuyến, xác thực token, giới hạn tần suất, CORS, ghi log, gắn trace. Gateway **không** nên chứa logic nghiệp vụ hay truy cập database; nếu cần ghép dữ liệu riêng cho từng loại client, hãy dùng mẫu **BFF** (Backend for Frontend): mỗi loại client một backend mỏng.

Spring Cloud Gateway bản truyền thống chạy trên Spring WebFlux và Netty (non-blocking). Từ train 2023.0 còn có biến thể chạy trên Servlet (Gateway Server MVC) cho đội quen mô hình blocking. Ba khái niệm chính:

- **Route:** gồm ID, URI đích, danh sách predicate và filter.
- **Predicate:** điều kiện để request khớp route, ví dụ `Path`, `Method`, `Header`, `Host`, `Weight`.
- **Filter:** biến đổi request/response, ví dụ `StripPrefix`, `RewritePath`, `AddRequestHeader`, `RequestRateLimiter`, `CircuitBreaker`, `Retry`. Global filter áp dụng cho mọi route.

```yaml
spring:
  cloud:
    gateway:
      routes:
        - id: order-service
          uri: lb://order-service          # lb:// = tra cứu qua discovery + load balancer
          predicates:
            - Path=/api/orders/**
          filters:
            - StripPrefix=1                # /api/orders/42 -> /orders/42
            - name: RequestRateLimiter
              args:
                redis-rate-limiter.replenishRate: 20    # token nạp mỗi giây
                redis-rate-limiter.burstCapacity: 40    # sức chứa tối đa của bucket
                key-resolver: "#{@userKeyResolver}"
            - name: CircuitBreaker
              args:
                name: orderService
                fallbackUri: forward:/fallback/orders
```

`RequestRateLimiter` với Redis cần `spring-boot-starter-data-redis-reactive` và một bean `KeyResolver` để xác định "ai" bị giới hạn; filter `CircuitBreaker` cần starter `spring-cloud-starter-circuitbreaker-reactor-resilience4j`. Khi vượt giới hạn, gateway trả về HTTP 429.

```java
@Configuration
class GatewayConfig {

    // Giới hạn theo người dùng đã xác thực, chưa đăng nhập thì theo địa chỉ IP
    @Bean
    KeyResolver userKeyResolver() {
        return exchange -> exchange.getPrincipal()
                .map(Principal::getName)
                .switchIfEmpty(Mono.justOrEmpty(exchange.getRequest().getRemoteAddress())
                        .map(address -> address.getAddress().getHostAddress()))
                .defaultIfEmpty("anonymous");
    }

    // Route cũng có thể khai báo bằng Java DSL
    @Bean
    RouteLocator inventoryRoutes(RouteLocatorBuilder builder) {
        return builder.routes()
                .route("inventory-service", r -> r.path("/api/inventory/**")
                        .filters(f -> f.stripPrefix(1).retry(2))
                        .uri("lb://inventory-service"))
                .build();
    }
}
```

> **Lưu ý:** Từ train 2025.0, starter được đổi tên thành `spring-cloud-starter-gateway-server-webflux` (và `...-webmvc` cho bản Servlet), tiền tố cấu hình chuyển sang `spring.cloud.gateway.server.webflux.*`. Tên cũ vẫn chạy nhưng đã bị đánh dấu deprecated. Khi đứng sau load balancer, địa chỉ remote là IP của load balancer; hãy đọc `X-Forwarded-For` từ proxy tin cậy nếu muốn giới hạn theo IP thật.

Gateway là đường đi bắt buộc của mọi request, nên phải chạy nhiều instance phía sau một load balancer. Trên Kubernetes, bạn cũng có thể chọn Ingress/Gateway API với Envoy hoặc dịch vụ API gateway của cloud; Spring Cloud Gateway hợp lý khi đội muốn viết filter bằng Java và tích hợp chặt với hệ sinh thái Spring.

## Service discovery

Trong môi trường autoscale và deploy liên tục, instance sinh ra và mất đi thường xuyên, không thể cấu hình cứng địa chỉ IP. **Service discovery** giải quyết việc "service X hiện đang chạy ở đâu".

- **Client-side discovery:** client hỏi registry danh sách instance rồi tự chọn một instance (Spring Cloud LoadBalancer làm việc này). Linh hoạt nhưng mọi client đều phải có thư viện discovery.
- **Server-side discovery:** client gọi một địa chỉ ổn định (load balancer, Kubernetes Service), hạ tầng chuyển tiếp tới instance phù hợp. Client đơn giản, không phụ thuộc ngôn ngữ.

### Eureka và Consul

**Eureka** (Netflix) là registry ưu tiên tính sẵn sàng: instance gửi heartbeat định kỳ, client cache danh sách instance và làm mới theo chu kỳ. Hệ quả là danh sách có thể cũ trong vài chục giây sau khi một instance chết, nên client cần retry sang instance khác. Eureka còn có chế độ *self-preservation*: khi mất heartbeat hàng loạt (thường do sự cố mạng), nó tạm ngừng xoá instance thay vì xoá nhầm cả cụm. **Consul** (HashiCorp) dùng Raft để nhất quán, có health check phong phú và kho key-value dùng được cho cấu hình.

```java
@SpringBootApplication
@EnableEurekaServer
public class DiscoveryServerApplication {
    public static void main(String[] args) {
        SpringApplication.run(DiscoveryServerApplication.class, args);
    }
}
```

```yaml
# application.yml của order-service (chỉ cần starter spring-cloud-starter-netflix-eureka-client)
spring:
  application:
    name: order-service          # tên dùng để đăng ký và để service khác tra cứu
eureka:
  client:
    service-url:
      defaultZone: http://discovery:8761/eureka/   # khoá defaultZone phải giữ đúng chữ hoa
  instance:
    prefer-ip-address: true
```

### Kubernetes DNS

Trên Kubernetes, mỗi `Service` có một tên DNS ổn định như `inventory-service.shop.svc.cluster.local` (trong cùng namespace chỉ cần `inventory-service`). kube-proxy phân phối kết nối tới các pod đang sẵn sàng (theo readiness probe). Vì vậy trên Kubernetes thường **không cần Eureka**: chỉ cần gọi `http://inventory-service:8080`. Chạy song song hai cơ chế discovery chỉ thêm độ phức tạp.

Cần biết một hạn chế: Kubernetes Service cân bằng tải ở mức **kết nối** (L4). Với HTTP keep-alive hoặc gRPC dùng kết nối dài, tải có thể dồn về một vài pod. Khi đó cân nhắc service mesh hoặc Spring Cloud Kubernetes để cân bằng tải phía client theo từng request.

## Quản lý cấu hình tập trung

Mười service nhân bốn môi trường là bốn mươi bộ cấu hình. **Spring Cloud Config Server** phục vụ cấu hình từ một nguồn tập trung, phổ biến nhất là Git: mọi thay đổi có lịch sử, có review qua pull request và có thể quay lại. File được đặt tên theo `{application}-{profile}.yml`, server phục vụ qua endpoint `/{application}/{profile}/{label}`.

```yaml
# Config Server (starter spring-cloud-config-server, class chính có @EnableConfigServer)
server:
  port: 8888
spring:
  cloud:
    config:
      server:
        git:
          uri: https://git.example.com/platform/config-repo.git
          default-label: main
          search-paths: '{application}'   # mỗi service một thư mục
---
# Client: order-service
spring:
  application:
    name: order-service
  config:
    import: "configserver:http://config-server:8888"   # thêm tiền tố optional: nếu không bắt buộc
  cloud:
    config:
      fail-fast: true      # không khởi động được nếu không lấy được cấu hình
```

**Refresh cấu hình khi đang chạy:** bean đánh dấu `@RefreshScope` và các bean `@ConfigurationProperties` được nạp lại khi gọi `POST /actuator/refresh`. Với nhiều instance, Spring Cloud Bus (qua Kafka hoặc RabbitMQ) phát tín hiệu refresh cho tất cả qua `/actuator/busrefresh`. Chỉ nên refresh những giá trị như ngưỡng, feature toggle; thay đổi mang tính cấu trúc (URL database, cổng) nên đi qua rolling restart.

**Secret:** không lưu mật khẩu dạng rõ trong Git. Các lựa chọn: giá trị mã hoá dạng `{cipher}...` do Config Server giải mã, backend HashiCorp Vault, hoặc Kubernetes Secret kết hợp công cụ đồng bộ secret. Trên Kubernetes, ConfigMap và Secret mount vào pod (Spring Boot đọc được bằng `spring.config.import=configtree:/etc/config/`) là lựa chọn thay thế Config Server khá phổ biến.

## Gọi service khác có load balancing

**Spring Cloud LoadBalancer** là bộ cân bằng tải phía client (thay cho Netflix Ribbon trước đây), mặc định dùng thuật toán round-robin trên danh sách instance lấy từ discovery. Có ba cách gọi phổ biến:

| Cách | Đặc điểm | Khi nào chọn |
|---|---|---|
| `RestClient` + HTTP interface (`@HttpExchange`) | Có sẵn trong Spring Framework 6.1+, đồng bộ, khai báo bằng interface | Lựa chọn mặc định cho dự án mới |
| OpenFeign (`@FeignClient`) | Khai báo bằng interface, trưởng thành, nhiều tích hợp | Dự án đang dùng Feign; Spring Cloud OpenFeign đã ở trạng thái feature-complete |
| `WebClient` | Reactive, non-blocking | Ứng dụng WebFlux |

```java
@Configuration
class HttpClientsConfig {

    // Đánh dấu @LoadBalanced để "http://inventory-service" được phân giải qua discovery.
    // Dùng configurer để giữ cấu hình mặc định của Boot (timeout, observation/tracing).
    @Bean
    @LoadBalanced
    RestClient.Builder loadBalancedRestClientBuilder(RestClientBuilderConfigurer configurer) {
        return configurer.configure(RestClient.builder());
    }

    @Bean
    InventoryClient inventoryClient(@LoadBalanced RestClient.Builder builder) {
        RestClient restClient = builder.clone()            // builder là mutable, clone trước khi sửa
                .baseUrl("http://inventory-service")        // tên service, không phải hostname thật
                .build();
        return HttpServiceProxyFactory.builderFor(RestClientAdapter.create(restClient))
                .build()
                .createClient(InventoryClient.class);
    }
}

@HttpExchange("/api/inventory")
interface InventoryClient {

    @GetExchange("/{sku}")
    StockLevel getStock(@PathVariable String sku);

    @PostExchange("/reservations")
    ReservationResult reserve(@RequestBody ReservationRequest request);
}
```

Timeout mặc định của nhiều HTTP client là rất dài hoặc vô hạn. Từ Spring Boot 3.4 có thể đặt chung bằng `spring.http.client.connect-timeout` và `spring.http.client.read-timeout`. Với OpenFeign, cấu hình theo từng client:

```yaml
spring:
  cloud:
    openfeign:
      client:
        config:
          default:                  # áp dụng cho mọi Feign client
            connect-timeout: 1000
            read-timeout: 2000
          inventory-service:        # ghi đè cho client tên inventory-service
            read-timeout: 800
```

Với Feign, khai báo `@EnableFeignClients` trên class ứng dụng và `@FeignClient(name = "inventory-service")` trên interface; nếu có Spring Cloud LoadBalancer trên classpath, tên này tự động được phân giải qua discovery. Kết hợp với `spring.threads.virtual.enabled=true` (Boot 3.2+), các lời gọi blocking chạy trên virtual thread nên không giữ platform thread khi chờ mạng.

## Lỗi thường gặp

- **Đưa logic nghiệp vụ vào gateway** (gọi database, ghép dữ liệu nhiều service). Gateway trở thành nút cổ chai và điểm deploy chung của mọi team. Cách sửa: gateway chỉ xử lý cross-cutting concern; ghép dữ liệu đặt ở BFF hoặc service.
- **Không đặt timeout** cho lời gọi giữa các service. Một service chậm kéo theo toàn bộ thread pool phía gọi. Cách sửa: luôn đặt connect/read timeout, kết hợp với circuit breaker (xem bài Resilience).
- **Tự tạo builder bằng `RestClient.builder()` hoặc `RestClient.create()`** rồi thắc mắc vì sao mất trace và timeout. Builder tự tạo không có customizer của Boot. Cách sửa: inject builder do Boot cấu hình, hoặc dùng `RestClientBuilderConfigurer` như ví dụ.
- **Dùng client `@LoadBalanced` để gọi API bên ngoài** như `https://api.partner.vn`. Load balancer coi hostname là service ID và không tìm thấy. Cách sửa: dùng builder riêng không load-balanced cho đối tác bên ngoài.
- **Chạy Eureka trên Kubernetes khi không cần.** Hai cơ chế discovery chồng lên nhau, khó chẩn đoán. Cách sửa: dùng Kubernetes Service DNS trừ khi có nhu cầu cân bằng tải phía client.
- **Lưu secret dạng rõ trong repo cấu hình.** Cách sửa: `{cipher}`, Vault hoặc Kubernetes Secret, kèm phân quyền truy cập repo.
- **Lệch phiên bản Spring Cloud và Spring Boot.** Cách sửa: dùng BOM và kiểm tra bảng tương thích mỗi lần nâng cấp.

## Bài tập thực hành

1. **Dựng hệ thống mẫu:** discovery server (Eureka), config server đọc từ một Git repo cục bộ, gateway, `order-service` và `inventory-service`. Route `/api/orders/**` và `/api/inventory/**` qua gateway, `order-service` gọi `inventory-service` bằng HTTP interface có `@LoadBalanced`.
2. **Quan sát load balancing và độ trễ của registry:** chạy 3 instance `inventory-service`, in hostname/port trong response để thấy round-robin. Tắt đột ngột một instance và đo khoảng thời gian đến khi không còn request nào rơi vào nó. Giải thích kết quả dựa trên heartbeat và cache phía client, sau đó thêm retry để che khoảng trống đó.
3. **Rate limit và refresh cấu hình:** bật `RequestRateLimiter` với Redis, dùng `k6` hoặc `ab` bắn tải để thấy HTTP 429. Thêm một `@ConfigurationProperties` chứa ngưỡng giảm giá, đổi giá trị trong Git rồi gọi `/actuator/refresh` để thấy giá trị mới mà không cần restart.

## Tóm tắt

- Spring Cloud cung cấp gateway, discovery, cấu hình tập trung và load balancing phía client; luôn quản lý phiên bản bằng BOM tương thích với Spring Boot.
- Spring Cloud Gateway xử lý routing và cross-cutting concern (xác thực, rate limit, circuit breaker), không chứa logic nghiệp vụ, và phải chạy nhiều instance.
- Eureka/Consul phục vụ client-side discovery; trên Kubernetes, Service DNS thường đã đủ.
- Spring Cloud Config dùng Git làm nguồn sự thật, hỗ trợ refresh qua `@RefreshScope` hoặc Spring Cloud Bus; secret phải được mã hoá hoặc để trong Vault.
- RestClient kèm HTTP interface là lựa chọn mặc định cho dự án mới; OpenFeign vẫn dùng tốt nhưng đã feature-complete.
- Mọi lời gọi giữa các service đều phải có timeout và dùng builder do Boot cấu hình để giữ tracing.
