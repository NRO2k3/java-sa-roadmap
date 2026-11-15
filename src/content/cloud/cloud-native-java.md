Java từng bị xem là "nặng" cho cloud: khởi động mất hàng chục giây, tốn vài trăm MB bộ nhớ ngay cả khi rảnh, không hợp với serverless hay autoscaling nhanh. Hệ sinh thái Java đã thay đổi đáng kể với GraalVM native image, các framework xử lý lúc build như Quarkus và Micronaut, và AWS Lambda SnapStart. Solution Architect cần biết những công nghệ này giải quyết vấn đề gì, phải trả giá gì, và khi nào một ứng dụng Spring Boot JVM truyền thống vẫn là lựa chọn tốt nhất. Nền tảng chung của tất cả là bộ nguyên tắc 12-Factor App.

## Mục tiêu bài học

- Hiểu cơ chế, lợi ích và giới hạn của GraalVM native image; build được ứng dụng Spring Boot 3 dạng native.
- So sánh Spring Boot, Quarkus và Micronaut để chọn framework phù hợp với bối cảnh team.
- Triển khai Java trên AWS Lambda, hiểu cold start và cách SnapStart giảm cold start, cùng các lưu ý về snapshot.
- Áp dụng 12 nguyên tắc 12-Factor App vào ứng dụng Spring Boot chạy trên Kubernetes.

## Vấn đề của JVM trong môi trường cloud

Một ứng dụng Spring Boot trên JVM khi khởi động phải nạp hàng nghìn class, quét annotation, tạo proxy bằng reflection, dựng application context; sau đó JIT (Just-In-Time compiler) mới dần biên dịch code nóng (hot code) thành mã máy. Kết quả:

- **Khởi động chậm** và cần thời gian "làm nóng" (warm-up) mới đạt hiệu năng đỉnh.
- **Bộ nhớ nền cao** vì metadata class, JIT và cấu trúc runtime.

Trên máy chủ chạy liên tục nhiều tháng, những điều này không đáng kể, và JIT còn cho hiệu năng đỉnh (peak throughput) rất tốt. Nhưng trên serverless (mỗi cold start là người dùng phải chờ), khi autoscaling cần Pod mới sẵn sàng nhanh, hoặc khi chạy hàng trăm instance nhỏ, chúng trở thành chi phí thật.

## GraalVM native image

### Cơ chế hoạt động

**GraalVM native image** biên dịch AOT (Ahead-Of-Time, biên dịch trước lúc chạy) toàn bộ ứng dụng cùng thư viện và một phần runtime thành **một file thực thi native** cho một hệ điều hành và kiến trúc CPU cụ thể. Quá trình build thực hiện **phân tích khả năng tiếp cận** (reachability analysis) từ hàm `main`, chỉ giữ lại code thực sự dùng tới, và có thể khởi tạo trước một phần dữ liệu rồi lưu vào image.

Nền tảng của cơ chế này là **giả định thế giới đóng** (closed-world assumption): mọi class có thể chạy phải được biết lúc build. Những thứ mang tính động như reflection, dynamic proxy, nạp resource từ classpath, serialization phải được khai báo qua **reachability metadata**; nếu không, chúng sẽ lỗi lúc chạy dù build thành công.

### Spring Boot Native

Spring Boot 3 có **Spring AOT**: lúc build, Spring chạy phân tích cấu hình, sinh sẵn code định nghĩa bean và metadata cho GraalVM, thay cho việc quét và reflection lúc runtime. Với project dùng `spring-boot-starter-parent` và plugin `org.graalvm.buildtools:native-maven-plugin`:

```bash
# Build file thực thi native (cần GraalVM JDK cài trên máy build)
./mvnw -Pnative native:compile
./target/order-service

# Hoặc build thẳng container image bằng Buildpacks, không cần cài GraalVM
./mvnw -Pnative spring-boot:build-image

# Chạy test trong chế độ native để bắt lỗi metadata sớm
./mvnw -PnativeTest test
```

Khi thư viện hoặc code của bạn dùng reflection mà Spring không tự suy ra được, đăng ký thêm **runtime hints**:

```java
import org.springframework.aot.hint.MemberCategory;
import org.springframework.aot.hint.RuntimeHints;
import org.springframework.aot.hint.RuntimeHintsRegistrar;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.ImportRuntimeHints;

@Configuration
@ImportRuntimeHints(NativeConfig.Hints.class)
public class NativeConfig {

    static class Hints implements RuntimeHintsRegistrar {
        @Override
        public void registerHints(RuntimeHints hints, ClassLoader classLoader) {
            // Class được tạo bằng reflection trong thư viện cũ
            hints.reflection().registerType(LegacyPayload.class, MemberCategory.values());
            // File template đọc từ classpath lúc chạy
            hints.resources().registerPattern("templates/*.txt");
        }
    }
}
```

Với class chỉ dùng để Jackson đọc/ghi JSON, có thể dùng gọn hơn `@RegisterReflectionForBinding(LegacyPayload.class)`. Với thư viện bên thứ ba chưa có metadata, chạy ứng dụng trên JVM kèm **tracing agent** (`-agentlib:native-image-agent=config-output-dir=...`) để thu thập metadata khi chạy các luồng chính; nhiều thư viện phổ biến đã có sẵn metadata trong GraalVM Reachability Metadata Repository.

### Đánh đổi

| Tiêu chí | JVM (JIT) | Native image |
|---|---|---|
| Thời gian khởi động | Chậm hơn (giây đến hàng chục giây) | Rất nhanh (thường dưới một giây với service nhỏ) |
| Bộ nhớ khi chạy | Cao hơn | Thấp hơn đáng kể |
| Hiệu năng đỉnh khi chạy lâu | Tốt nhờ JIT tối ưu theo dữ liệu thực tế | Thường thấp hơn JIT; PGO (profile-guided optimization) của Oracle GraalVM thu hẹp khoảng cách |
| Thời gian và tài nguyên build | Nhanh | Chậm, tốn nhiều CPU và RAM, làm chậm pipeline |
| Tính động | Đầy đủ | Hạn chế: reflection cần metadata, không nạp class mới lúc chạy |
| Công cụ chẩn đoán | Đầy đủ (JFR, heap dump, agent) | Hạn chế hơn, một số tính năng được hỗ trợ ở mức khác |

Một giới hạn quan trọng của Spring Boot Native: cấu trúc bean được **cố định lúc build**. `@Profile` và `@ConditionalOnProperty` được đánh giá khi build, nên không thể bật tắt bean bằng profile hay property lúc chạy như trên JVM. Giá trị cấu hình (URL, timeout) vẫn đọc lúc chạy bình thường.

**Nên dùng native image khi**: serverless/function, CLI tool, service scale-to-zero, sidecar nhỏ, hoặc chạy rất nhiều instance mà bộ nhớ là chi phí chính. **Không nên** khi: service chạy liên tục với tải cao ổn định (JIT có lợi thế), phụ thuộc nhiều thư viện dùng reflection động, hoặc team chưa sẵn sàng chịu pipeline build chậm và kiểu lỗi mới.

Nếu chỉ cần khởi động nhanh hơn mà vẫn giữ JVM, có các lựa chọn nhẹ nhàng hơn: CDS (Class Data Sharing) được Spring Boot hỗ trợ, AOT cache của JDK mới (Project Leyden, bắt đầu từ JDK 24), hoặc **CRaC** (Coordinated Restore at Checkpoint: chụp trạng thái JVM đã khởi động rồi khôi phục, cần bản JDK có hỗ trợ CRaC; Spring Boot hỗ trợ từ 3.2).

## Quarkus và Micronaut so với Spring Boot

Cả Quarkus và Micronaut ra đời với mục tiêu chuyển phần lớn công việc từ lúc chạy sang lúc build, nên khởi động nhanh và hợp với native image ngay từ thiết kế.

- **Quarkus** (Red Hat): xử lý cấu hình và metadata ở bước build ("build-time augmentation"); dùng CDI (Jakarta Contexts and Dependency Injection) và Jakarta REST, hỗ trợ MicroProfile; lõi dựa trên Vert.x cho cả lập trình imperative và reactive. Trải nghiệm developer mạnh: `quarkus dev` với live reload, **Dev Services** tự khởi động container database/Kafka khi chạy dev và test. Có extension tương thích một phần API Spring (DI, Web, Data) giúp chuyển đổi dễ hơn, nhưng không phải toàn bộ.
- **Micronaut**: dependency injection và AOP được sinh lúc **biên dịch** bằng annotation processor, gần như không dùng reflection lúc chạy; Micronaut Data kiểm tra và sinh truy vấn lúc compile. Mô hình lập trình khá giống Spring nên dễ làm quen.
- **Spring Boot**: hệ sinh thái lớn nhất (Spring Security, Spring Data, Spring Cloud, Spring Batch...), cộng đồng và nguồn tuyển dụng rộng nhất. Mặc định dựa nhiều vào xử lý lúc chạy, nhưng Spring AOT đã đưa native image thành lựa chọn chính thức.

| Tiêu chí | Spring Boot | Quarkus | Micronaut |
|---|---|---|---|
| Mô hình DI | Runtime (AOT khi native) | Build-time, CDI | Compile-time |
| Hệ sinh thái tích hợp | Rộng nhất | Rộng, theo extension | Hẹp hơn |
| Native image | Hỗ trợ qua Spring AOT | Thiết kế ưu tiên | Thiết kế ưu tiên |
| Đường cong học tập cho team Spring | Không có | Trung bình (CDI, Jakarta REST) | Thấp đến trung bình |
| Trải nghiệm dev | DevTools, Docker Compose/Testcontainers support | Dev mode, Dev Services | Tốt |

Góc nhìn SA: lợi thế kỹ thuật về startup thường **không đủ** để bù chi phí chuyển đổi khi tổ chức đã có hàng chục service Spring, thư viện nội bộ và đội ngũ quen Spring. Quarkus hoặc Micronaut hợp lý khi bắt đầu hệ thống mới thiên về serverless/edge, khi bộ nhớ và cold start là ràng buộc chính, hoặc khi tổ chức đã gắn với hệ Red Hat/Jakarta EE. Nếu chọn, hãy làm proof of concept với một service thật, đo trên chính workload của bạn thay vì dựa vào benchmark công bố.

## Java trên serverless: AWS Lambda và SnapStart

### Cold start

Khi Lambda cần môi trường thực thi mới (lần gọi đầu, sau khi scale, sau thời gian không dùng), nó phải chạy **init phase**: khởi động JVM, nạp class, chạy constructor và static initializer của handler (ví dụ tạo SDK client, dựng Spring context). Đó là **cold start**. Các lần gọi sau trên cùng môi trường (warm) nhanh hơn nhiều. Với Java, cold start thường là mối lo lớn nhất khi dùng Lambda.

Các cách giảm cold start:

| Cách | Ý tưởng | Đánh đổi |
|---|---|---|
| Tối ưu code init | Ít dependency, tránh framework nặng, khởi tạo lười (lazy) | Công sức, hạn chế dùng framework |
| **SnapStart** | Khôi phục từ snapshot của môi trường đã init | Cần xử lý tính duy nhất và kết nối sau restore |
| Provisioned concurrency | Giữ sẵn một số môi trường đã init | Trả tiền cho môi trường giữ sẵn kể cả khi không có request |
| Native image (custom runtime) | File native khởi động rất nhanh | Build phức tạp, giới hạn của native image |

### SnapStart hoạt động thế nào

Với SnapStart, khi bạn **publish một version** của function, Lambda chạy init phase một lần, chụp **snapshot** bộ nhớ và đĩa của microVM (Firecracker) đã khởi tạo, mã hoá và lưu cache. Khi cần môi trường mới, Lambda khôi phục từ snapshot thay vì init lại từ đầu. SnapStart áp dụng cho các runtime Java được quản lý (Java 11 trở lên) và **chỉ cho version đã publish**, không cho `$LATEST`; vì vậy thường gọi qua alias.

```yaml
AWSTemplateFormatVersion: '2010-09-09'
Transform: AWS::Serverless-2016-10-31
Resources:
  OrderFunction:
    Type: AWS::Serverless::Function
    Properties:
      Runtime: java21
      Handler: com.example.order.OrderHandler::handleRequest
      CodeUri: target/order-function.jar
      MemorySize: 1024
      Timeout: 15
      AutoPublishAlias: live
      SnapStart:
        ApplyOn: PublishedVersions
```

### Lưu ý khi dùng snapshot

Mọi thứ tạo ra trong init phase được **dùng chung cho mọi môi trường khôi phục từ cùng snapshot**. Từ đó phát sinh các vấn đề:

- **Tính duy nhất**: giá trị random, UUID, seed tạo lúc init sẽ giống hệt nhau trên nhiều môi trường. Hãy tạo chúng trong handler, không lưu vào biến static lúc init.
- **Kết nối mạng và credential**: kết nối mở lúc init có thể đã hỏng khi khôi phục; dữ liệu cache theo thời gian (token, cấu hình) có thể đã cũ.
- **Runtime hooks**: Lambda hỗ trợ API của CRaC (thư viện `org.crac`) để chạy code trước khi chụp và sau khi khôi phục.

```java
import com.amazonaws.services.lambda.runtime.Context;
import com.amazonaws.services.lambda.runtime.RequestHandler;
import org.crac.Core;
import org.crac.Resource;

public class OrderHandler implements RequestHandler<OrderRequest, OrderResponse>, Resource {

    private final OrderService orderService = new OrderService();

    public OrderHandler() {
        Core.getGlobalContext().register(this);
    }

    @Override
    public void beforeCheckpoint(org.crac.Context<? extends Resource> ctx) {
        orderService.warmUp();          // "priming": chạy thử luồng chính để nạp class sẵn
    }

    @Override
    public void afterRestore(org.crac.Context<? extends Resource> ctx) {
        orderService.refreshConnections(); // mở lại kết nối, làm mới cache có hạn
    }

    @Override
    public OrderResponse handleRequest(OrderRequest request, Context context) {
        return orderService.place(request);
    }
}
```

**Priming** (chạy thử các đường code chính trong `beforeCheckpoint`) giúp nhiều class đã được nạp và khởi tạo sẵn trong snapshot, giảm thêm độ trễ lần gọi đầu.

### Khi nào Java trên Lambda hợp lý

Hợp lý cho xử lý sự kiện (S3, SQS, EventBridge), API có lưu lượng thấp hoặc thất thường, tác vụ định kỳ. Kém hợp lý khi: tải cao và đều cả ngày (container hoặc VM thường rẻ hơn), tác vụ chạy lâu (Lambda giới hạn tối đa 15 phút mỗi lần gọi), hoặc cần nhiều kết nối database lâu dài. Khi Lambda gọi database quan hệ, mỗi môi trường mở kết nối riêng, nên cần RDS Proxy hoặc cơ chế pooling tương tự để không làm cạn kết nối database lúc scale.

## 12-Factor App

**The Twelve-Factor App** là bộ nguyên tắc cho ứng dụng chạy tốt trên nền tảng cloud: dễ triển khai, dễ scale, dễ thay thế. Ánh xạ sang Spring Boot trên Kubernetes:

| # | Nguyên tắc | Ý nghĩa | Thực hành với Spring Boot / K8s |
|---|---|---|---|
| I | Codebase | Một codebase trong version control, nhiều lần deploy | Một repo/service, cùng artifact cho mọi môi trường |
| II | Dependencies | Khai báo và cô lập dependency tường minh | Maven/Gradle, Maven wrapper, không phụ thuộc thư viện cài sẵn trên máy |
| III | Config | Cấu hình nằm trong môi trường, không trong code | Biến môi trường, ConfigMap/Secret; Spring map `SPRING_DATASOURCE_URL` vào `spring.datasource.url` |
| IV | Backing services | Database, queue là tài nguyên gắn vào qua URL | Đổi DB bằng cấu hình, không sửa code |
| V | Build, release, run | Tách bạch build, release (build + config), run | Image bất biến, release = image + values của môi trường |
| VI | Processes | Process không trạng thái, không chia sẻ gì | Session lưu Redis (Spring Session), file lưu object storage |
| VII | Port binding | Ứng dụng tự phục vụ qua port | Tomcat/Netty nhúng, `server.port` |
| VIII | Concurrency | Scale ngang bằng cách thêm process | Thêm replica, HPA |
| IX | Disposability | Khởi động nhanh, tắt gọn gàng | Graceful shutdown, probe, xử lý SIGTERM |
| X | Dev/prod parity | Môi trường dev gần với prod | Testcontainers, Docker Compose, cùng loại DB với prod |
| XI | Logs | Log là luồng sự kiện ra stdout | Không ghi file log trong container; nền tảng thu thập và đẩy về hệ thống log |
| XII | Admin processes | Tác vụ quản trị chạy như process một lần | Migration Flyway chạy bằng Job hoặc lúc khởi động, cùng image và cấu hình |

Cấu hình Spring Boot thể hiện các nguyên tắc III, VII, IX, XI:

```yaml
spring:
  datasource:
    url: ${DB_URL}
    username: ${DB_USER}
    password: ${DB_PASSWORD}
  lifecycle:
    timeout-per-shutdown-phase: 20s
server:
  port: ${PORT:8080}
  shutdown: graceful
logging:
  structured:
    format:
      console: ecs   # log JSON ra stdout (Spring Boot 3.4+)
```

12-Factor không phải luật tuyệt đối. Ví dụ, nhiều hệ thống dùng config server hoặc secret manager thay vì biến môi trường thuần; tinh thần vẫn giữ nguyên: cấu hình tách khỏi artifact và thay đổi được theo môi trường mà không build lại.

## Lỗi thường gặp

- **Chuyển sang native image vì "nhanh hơn" mà không đo**: service chạy liên tục có thể chậm hơn ở tải đỉnh và pipeline build chậm đi nhiều. Đo startup, bộ nhớ, throughput trên workload thật trước khi quyết định.
- **Chỉ test trên JVM rồi deploy native**: lỗi thiếu reflection metadata chỉ lộ ra lúc chạy. Chạy test native (`-PnativeTest`) trong pipeline.
- **Kỳ vọng `@Profile` hoạt động lúc chạy với native image**: bean được cố định lúc build; tách cấu hình khác biệt thành property hoặc build riêng.
- **Viết lại toàn bộ hệ thống sang Quarkus/Micronaut vì benchmark**: chi phí chuyển đổi và đào tạo lớn hơn lợi ích. Thử trên service mới hoặc service có ràng buộc rõ ràng.
- **Tạo UUID, seed random hoặc mở kết nối trong init khi bật SnapStart**: các môi trường khôi phục dùng chung giá trị. Tạo trong handler hoặc làm mới trong `afterRestore`.
- **Lambda Java mở kết nối DB trực tiếp không giới hạn**: scale đột biến làm cạn kết nối DB. Dùng RDS Proxy, giới hạn concurrency.
- **Ghi log ra file, lưu session trong bộ nhớ, đóng gói cấu hình từng môi trường vào image**: vi phạm 12-Factor, gây khó scale và khó vận hành. Log ra stdout, session ra store ngoài, cấu hình qua môi trường.

## Bài tập thực hành

1. **JVM và native**: lấy một service Spring Boot 3 nhỏ (REST + Spring Data JPA), build bản JVM và bản native. Đo thời gian khởi động, RSS (bộ nhớ thực dùng) lúc rảnh, throughput sau 5 phút tải bằng k6 hoặc wrk, và thời gian build. Cố ý thêm một class tạo bằng reflection để thấy lỗi, rồi sửa bằng `RuntimeHintsRegistrar`.
2. **Lambda với SnapStart**: viết function Java 21 đọc ghi DynamoDB, deploy bằng SAM. So sánh độ trễ cold start (xem dòng `REPORT` trong CloudWatch Logs, có `Init Duration` hoặc `Restore Duration`) khi tắt và bật SnapStart, rồi thêm priming trong `beforeCheckpoint`.
3. **Rà soát 12-Factor**: chọn một service đang chạy ở công ty, chấm điểm theo 12 nguyên tắc, liệt kê vi phạm và đề xuất cách sửa theo thứ tự ưu tiên. Với framework, viết một ADR ngắn trả lời: service mới tiếp theo nên dùng Spring Boot JVM, Spring Boot Native hay Quarkus, và vì sao.

## Tóm tắt

- JVM truyền thống khởi động chậm và tốn bộ nhớ nền nhưng có hiệu năng đỉnh tốt nhờ JIT; vấn đề lộ rõ ở serverless và autoscaling nhanh.
- GraalVM native image biên dịch AOT theo giả định thế giới đóng: khởi động nhanh, ít bộ nhớ, đổi lại build chậm, cần reachability metadata và cố định cấu trúc bean lúc build.
- Spring Boot 3 hỗ trợ native qua Spring AOT (`native:compile`, `spring-boot:build-image`, runtime hints); test native trong pipeline.
- Quarkus và Micronaut dịch chuyển công việc sang lúc build/compile; chỉ chọn khi lợi ích vượt chi phí chuyển đổi của tổ chức.
- Lambda SnapStart khôi phục từ snapshot của version đã publish; cần xử lý tính duy nhất, kết nối sau restore bằng hook CRaC và có thể priming.
- 12-Factor App là nền tảng cho ứng dụng cloud-native: cấu hình theo môi trường, process không trạng thái, tắt gọn gàng, log ra stdout, dev/prod tương đồng.
