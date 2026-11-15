Ở doanh nghiệp, hệ thống mới hiếm khi được xây trên nền trống: nó phải nói chuyện với ERP chạy hai mươi năm, hệ thống core banking chỉ xuất file CSV qua SFTP, dịch vụ SaaS của đối tác và vài chục service nội bộ. Enterprise Integration Patterns (EIP), bộ mẫu do Gregor Hohpe và Bobby Woolf hệ thống hoá trong cuốn sách cùng tên năm 2003, cung cấp một ngôn ngữ chung cho các bài toán tích hợp đó: định tuyến, chuyển đổi, tách, gộp message. Apache Camel và Spring Integration hiện thực gần như trọn bộ các mẫu này trong Java. Với vai trò Solution Architect, bạn còn phải biết đặt logic tích hợp ở đâu: trong service, trên API Gateway, trong ESB hay trên một nền tảng iPaaS.

## Mục tiêu bài học

- Nắm các khối nền tảng của EIP: message, channel, endpoint, pipes and filters.
- Hiểu và áp dụng các mẫu Message Router, Message Translator, Splitter, Aggregator cùng các mẫu liên quan.
- Xây dựng luồng tích hợp hệ thống cũ bằng Apache Camel và Spring Integration.
- Phân biệt vai trò của API Gateway, ESB và iPaaS, và chọn đúng công cụ cho từng bối cảnh.

## Bốn cách tích hợp hệ thống

Cuốn sách EIP bắt đầu bằng bốn phong cách tích hợp, mỗi cách có đánh đổi riêng:

- **File transfer**: hệ A xuất file, hệ B đọc file. Đơn giản, hệ cũ nào cũng làm được, nhưng độ trễ cao (theo lô) và khó xử lý lỗi từng bản ghi.
- **Shared database**: nhiều hệ cùng đọc ghi một database. Nhất quán tức thì nhưng coupling rất chặt: đổi một cột là ảnh hưởng mọi hệ.
- **Remote procedure invocation**: gọi hàm từ xa (SOAP, REST, gRPC). Trực quan nhưng coupling về thời gian: bên được gọi chết thì bên gọi cũng lỗi.
- **Messaging**: trao đổi message bất đồng bộ qua kênh. Tách rời tốt nhất, nhưng phức tạp hơn trong thiết kế và vận hành.

Phần lớn các mẫu EIP xoay quanh messaging, nhưng trong thực tế bạn thường phải **kết nối** các phong cách: đọc file từ hệ cũ rồi chuyển thành message cho hệ mới.

## Khối nền tảng

- **Message**: đơn vị dữ liệu được trao đổi, gồm **header** (metadata như id, correlation id, loại message) và **body** (payload).
- **Message Channel**: đường ống nối các thành phần. **Point-to-Point Channel** giao mỗi message cho đúng một consumer; **Publish-Subscribe Channel** giao bản sao cho mọi subscriber.
- **Message Endpoint**: điểm ứng dụng kết nối vào channel. **Channel Adapter** là endpoint nối một hệ thống không biết gì về messaging (file, FTP, database) vào channel.
- **Pipes and Filters**: chia xử lý thành chuỗi bước nhỏ độc lập (filter) nối với nhau bằng channel (pipe). Mỗi bước làm một việc, dễ thay thế và kiểm thử riêng.

```text
 [Hệ cũ: file CSV] ─► Splitter ─► Filter ─► Translator ─► Content-Based Router ─┬─► Kafka orders.b2b
                     (1 file →   (bỏ dòng  (CSV → event)                        └─► Kafka orders.retail
                      N dòng)     rỗng)
                lỗi sau 3 lần thử ─────────────────────────────────────────────────► Dead Letter Channel
```

## Các mẫu định tuyến

### Message Router và Content-Based Router

**Message Router** đọc message và chuyển nó tới một trong nhiều channel đầu ra **mà không thay đổi nội dung**. Dạng phổ biến nhất là **Content-Based Router**: quyết định dựa trên nội dung, ví dụ đơn B2B đi một luồng, đơn bán lẻ đi luồng khác. Router giúp bên gửi không cần biết có bao nhiêu đích đến. Nhược điểm: router phải biết mọi đích, thêm đích là sửa router; nếu các đích tự quyết định có nhận hay không, dùng Publish-Subscribe kết hợp **Message Filter** sẽ linh hoạt hơn.

Các biến thể liên quan:

- **Message Filter**: chỉ cho message thoả điều kiện đi qua, bỏ phần còn lại.
- **Recipient List**: gửi bản sao tới một danh sách đích được tính toán cho từng message.
- **Dynamic Router**: danh sách quy tắc định tuyến có thể thay đổi lúc chạy.

### Splitter

**Splitter** tách một message chứa nhiều phần tử thành nhiều message, mỗi message một phần tử: một file 10.000 dòng thành 10.000 message, một đơn hàng thành từng dòng hàng để gửi tới các kho khác nhau. Mỗi message con nên mang **correlation id** (id của message gốc) và thứ tự của nó, để có thể gộp lại sau này. Với file lớn, hãy tách theo **streaming** thay vì nạp cả file vào bộ nhớ.

### Aggregator

**Aggregator** làm việc ngược lại: gom nhiều message liên quan thành một. Một aggregator cần trả lời ba câu hỏi:

- **Correlation**: message nào thuộc cùng một nhóm? Thường dựa vào correlation id hoặc một khoá nghiệp vụ.
- **Completion condition**: khi nào nhóm hoàn tất? Đủ số lượng, hết thời gian chờ, hoặc thoả một điều kiện (đã nhận message cuối).
- **Aggregation strategy**: gộp thế nào? Ghép thành danh sách, cộng tổng, chọn giá tốt nhất.

Aggregator là thành phần **có trạng thái**: các nhóm chưa hoàn tất phải được lưu ở đâu đó. Lưu trong bộ nhớ thì mất khi restart; với dữ liệu quan trọng, dùng kho bền vững. Kết hợp Splitter, xử lý song song và Aggregator tạo thành mẫu **Scatter-Gather**: gửi yêu cầu báo giá tới nhiều nhà cung cấp rồi gộp các phản hồi trong thời hạn.

## Các mẫu chuyển đổi

### Message Translator

**Message Translator** chuyển message từ định dạng của hệ này sang định dạng của hệ kia: CSV sang JSON, XML SOAP sang event Avro, mã trạng thái `"01"` của hệ cũ sang `PAID`. Đây là mẫu xuất hiện nhiều nhất trong thực tế, vì hai hệ thống hiếm khi dùng chung mô hình dữ liệu.

Các mẫu liên quan:

- **Content Enricher**: bổ sung dữ liệu còn thiếu bằng cách tra cứu hệ khác (thêm tên khách từ mã khách).
- **Content Filter**: loại bớt field không cần thiết hoặc nhạy cảm trước khi gửi đi.
- **Canonical Data Model**: định nghĩa một mô hình chung cho tích hợp; mỗi hệ chỉ cần translator sang mô hình chung thay vì translator cho từng cặp hệ. Với N hệ, số translator giảm từ cỡ N bình phương xuống cỡ 2N. Đổi lại, mô hình chung dễ phình to và trở thành điểm tranh chấp giữa các team; trong microservices, nhiều team chọn hợp đồng riêng cho từng bounded context.

Ngoài ra, một số mẫu bạn sẽ dùng thường xuyên: **Dead Letter Channel** (nơi chứa message không xử lý được), **Wire Tap** (sao chép message sang kênh phụ để giám sát hoặc kiểm toán), **Idempotent Receiver** (bỏ qua message trùng) và **Claim Check** (lưu payload lớn vào kho ngoài, message chỉ mang tham chiếu).

## Apache Camel

Apache Camel là framework tích hợp mã nguồn mở với hàng trăm **component** kết nối tới file, FTP, JMS, Kafka, HTTP, database, SaaS và nhiều hệ khác. Các khái niệm chính:

- **Route**: một luồng xử lý, bắt đầu bằng `from(endpoint)` và gồm các bước xử lý.
- **Endpoint URI**: mô tả nguồn hoặc đích dạng `scheme:path?options`, ví dụ `file:/data/inbox?include=.*\.csv`.
- **Exchange**: vật chứa message trong suốt route, gồm message, header và thuộc tính.
- **Processor**: đoạn code Java tuỳ ý thao tác trên exchange.
- **DSL EIP**: các mẫu EIP là phương thức có sẵn: `split()`, `filter()`, `choice()`, `aggregate()`, `enrich()`.

Với Camel Spring Boot starter, mỗi route là một bean kế thừa `RouteBuilder`. Ví dụ đọc file CSV từ hệ cũ và đẩy lên Kafka:

```java
@Component
public class LegacyOrderRoute extends RouteBuilder {

    @Override
    public void configure() {
        // Dead Letter Channel: thử lại 3 lần, vẫn lỗi thì đẩy message sang topic lỗi
        errorHandler(deadLetterChannel("kafka:legacy.orders.dlq")
                .maximumRedeliveries(3)
                .redeliveryDelay(2_000));

        from("file:/data/legacy/inbox?include=.*\\.csv&move=.done&moveFailed=.error")
            .routeId("legacy-orders-import")
            .split(body().tokenize("\n")).streaming()      // Splitter: mỗi dòng một message
                .filter(body().isNotEqualTo(""))           // Message Filter: bỏ dòng rỗng
                    .process(new LegacyCsvTranslator())    // Message Translator: CSV → event
                    .marshal().json()
                    .choice()                              // Content-Based Router
                        .when(header("orderType").isEqualTo("B2B")).to("kafka:orders.b2b")
                        .otherwise().to("kafka:orders.retail")
                    .end()                                 // đóng choice
                .end()                                     // đóng filter
            .end();                                        // đóng split
    }
}
```

```java
public class LegacyCsvTranslator implements Processor {

    private static final DateTimeFormatter LEGACY_DATE = DateTimeFormatter.ofPattern("dd/MM/yyyy");

    @Override
    public void process(Exchange exchange) {
        // Định dạng hệ cũ: MA_DH;MA_KH;LOAI;TONG_TIEN;NGAY_DAT(dd/MM/yyyy)
        String[] cols = exchange.getIn().getBody(String.class).trim().split(";");
        var event = new OrderImported(
                cols[0].trim(),
                cols[1].trim(),
                new BigDecimal(cols[3].trim()),
                LocalDate.parse(cols[4].trim(), LEGACY_DATE).toString());   // chuẩn hoá sang ISO-8601
        exchange.getIn().setHeader("orderType", cols[2].trim());
        exchange.getIn().setBody(event);
    }
}
```

Option `move=.done` chuyển file đã xử lý vào thư mục con `.done`, `moveFailed=.error` chuyển file lỗi vào `.error`, giúp vận hành biết file nào cần xem lại. Logic chuyển đổi nằm trong một class thuần Java nên dễ viết unit test.

Aggregator trong Camel, gom cập nhật tồn kho theo kho hàng rồi gửi một lô sang ERP:

```java
from("kafka:inventory.stock-updates")
    .routeId("stock-batch-to-erp")
    .aggregate(header(KafkaConstants.KEY), new GroupedBodyAggregationStrategy())  // correlation: key = mã kho
        .completionSize(100)          // đủ 100 message thì gửi
        .completionTimeout(5_000)     // hoặc nhóm không có message mới trong 5 giây
    .marshal().json()
    .to("http://erp.internal/api/stock/batch");
```

Mặc định trạng thái aggregator nằm trong bộ nhớ; với dữ liệu không được phép mất, cấu hình một aggregation repository bền vững (ví dụ dựa trên JDBC).

## Spring Integration

Spring Integration hiện thực EIP theo phong cách Spring: mọi thứ là bean, message là `Message<?>` gồm payload và header, các thành phần nối với nhau qua `MessageChannel`. Các loại endpoint tương ứng trực tiếp với mẫu EIP: `Transformer`, `Filter`, `Router`, `Splitter`, `Aggregator`, `ServiceActivator` (gọi một method nghiệp vụ), cùng các **channel adapter** cho file, FTP/SFTP, JDBC, JMS, Kafka, HTTP.

Luồng tương đương ví dụ Camel ở trên, viết bằng Java DSL:

```java
@Configuration
public class LegacyFileIntegrationConfig {

    @Bean
    public IntegrationFlow legacyOrdersFlow(KafkaTemplate<String, String> kafkaTemplate,
                                            LegacyOrderMapper mapper) {
        return IntegrationFlow
                .from(Files.inboundAdapter(new File("/data/legacy/inbox")).patternFilter("*.csv"),
                      e -> e.poller(Pollers.fixedDelay(Duration.ofSeconds(10))))
                .split(Files.splitter())                         // Splitter: file → từng dòng
                .filter(String.class, line -> !line.isBlank())   // Message Filter
                .transform(String.class, mapper::toJson)         // Message Translator
                .handle(Kafka.outboundChannelAdapter(kafkaTemplate).topic("orders.legacy"))
                .get();
    }
}
```

Mặc định, inbound adapter chỉ nhớ các file đã đọc trong bộ nhớ; sau khi restart, file cũ có thể bị xử lý lại. Trên production, dùng filter dựa trên metadata store bền vững hoặc di chuyển file sau khi xử lý.

| Tiêu chí | Apache Camel | Spring Integration |
|---|---|---|
| Phong cách | DSL route gọn, endpoint dạng URI | Bean và channel kiểu Spring, Java DSL |
| Số lượng connector | Rất lớn, nhiều hệ thống doanh nghiệp và SaaS | Đủ cho các giao thức phổ biến |
| Độc lập framework | Chạy với Spring Boot, Quarkus hoặc độc lập | Gắn chặt với hệ sinh thái Spring |
| Phù hợp | Tích hợp nhiều hệ khác nhau, nhiều giao thức | Team đã quen Spring, luồng tích hợp vừa phải |

Cả hai đều phù hợp để xây **Anti-Corruption Layer** khi tích hợp hệ cũ: một lớp dịch giữ cho mô hình dữ liệu của hệ cũ không "lây" vào domain của hệ mới.

## API Gateway, ESB và iPaaS

### API Gateway

API Gateway là **điểm vào duy nhất** cho client bên ngoài gọi vào các service phía sau. Trách nhiệm điển hình: định tuyến request, xác thực và phân quyền ở biên, rate limiting, kết thúc TLS, ghi log và metric, đôi khi gộp dữ liệu từ nhiều service cho một màn hình (mẫu Backend for Frontend). Ví dụ: Spring Cloud Gateway, Kong, AWS API Gateway, Apigee. Gateway nên **mỏng**: chứa các mối quan tâm xuyên suốt, không chứa logic nghiệp vụ.

### ESB

**Enterprise Service Bus (ESB)** là nền tảng tích hợp tập trung, phổ biến trong thời kỳ SOA: mọi hệ thống kết nối vào bus, bus đảm nhận định tuyến, chuyển đổi định dạng, chuyển đổi giao thức (SOAP, JMS, file) và cả điều phối quy trình. Ví dụ: MuleSoft Mule, IBM App Connect, Oracle Service Bus, WSO2.

Vấn đề thường gặp là bus trở nên "thông minh" quá mức: logic nghiệp vụ dồn vào bus, một team tích hợp trung tâm trở thành nút cổ chai cho mọi thay đổi, và bus thành điểm lỗi chung. Kiến trúc microservices phản ứng lại bằng nguyên tắc **smart endpoints, dumb pipes**: logic nằm trong service, kênh truyền chỉ chuyển message (Kafka, RabbitMQ). Tuy vậy, trong doanh nghiệp có nhiều hệ cũ dùng giao thức khác nhau, một lớp tích hợp có chuyển đổi giao thức vẫn có giá trị; điều cần tránh là đặt logic nghiệp vụ vào đó.

### iPaaS

**iPaaS (Integration Platform as a Service)** là nền tảng tích hợp dạng dịch vụ đám mây, cung cấp sẵn connector tới các SaaS phổ biến (CRM, ERP, hệ thống nhân sự) và công cụ thiết kế luồng kéo thả. Ví dụ: MuleSoft Anypoint Platform, Boomi, Azure Logic Apps, Workato. Ưu điểm: tích hợp SaaS rất nhanh, không phải vận hành hạ tầng, người không chuyên lập trình cũng xây được luồng đơn giản. Nhược điểm: phụ thuộc nhà cung cấp, chi phí tăng theo số luồng hoặc số giao dịch, khó kiểm soát phiên bản và kiểm thử như code, không phù hợp cho luồng lưu lượng cực lớn hay độ trễ thấp.

| Tiêu chí | API Gateway | ESB | iPaaS |
|---|---|---|---|
| Vị trí | Biên hệ thống, client gọi vào | Trung tâm, giữa các hệ nội bộ | Đám mây, giữa SaaS và hệ nội bộ |
| Trách nhiệm chính | Định tuyến, bảo mật, rate limit | Định tuyến, chuyển đổi, điều phối | Connector SaaS, luồng tích hợp dựng sẵn |
| Kiểu giao tiếp | Chủ yếu đồng bộ (HTTP) | Đồng bộ và bất đồng bộ | Đồng bộ, bất đồng bộ, theo lịch |
| Rủi ro | Biến thành nơi chứa logic nghiệp vụ | Nút cổ chai tập trung | Lock-in, chi phí, khó kiểm thử |

Cách chọn thực tế: API Gateway gần như luôn cần cho API hướng ra ngoài. Tích hợp giữa các service mới dùng messaging và hợp đồng rõ ràng. Tích hợp hệ cũ với nhiều giao thức dùng Camel hoặc Spring Integration như một service tích hợp riêng (hoặc ESB nếu doanh nghiệp đã đầu tư). Tích hợp với nhiều SaaS, lưu lượng vừa phải, cần làm nhanh thì cân nhắc iPaaS.

## Lỗi thường gặp

- **Đặt logic nghiệp vụ vào lớp tích hợp**: quy tắc tính giá nằm trong route ESB hay trong API Gateway, không ai trong team sản phẩm sửa được. Giữ lớp tích hợp chỉ làm định tuyến và chuyển đổi.
- **Translator viết rải rác khắp nơi**: mỗi service tự parse định dạng hệ cũ theo cách riêng. Gom vào một Anti-Corruption Layer có test đầy đủ.
- **Splitter nạp cả file lớn vào bộ nhớ**: hết heap khi file đạt vài GB. Dùng chế độ streaming.
- **Aggregator không có timeout**: nhóm thiếu một message sẽ chờ mãi và chiếm bộ nhớ. Luôn có completion timeout và xử lý nhóm chưa đủ.
- **Aggregator lưu trạng thái trong bộ nhớ cho dữ liệu quan trọng**: restart là mất các nhóm đang gom. Dùng aggregation repository bền vững.
- **Không có Dead Letter Channel**: một dòng CSV lỗi làm hỏng cả file hoặc bị bỏ qua âm thầm. Đưa message lỗi vào kênh riêng kèm thông tin lỗi và giám sát.
- **Chọn iPaaS cho luồng lưu lượng lớn, độ trễ thấp**: chi phí và độ trễ tăng vọt. Dùng giải pháp tự vận hành cho các luồng lõi.

## Bài tập thực hành

1. **Route Camel cho hệ cũ**: viết route đọc file CSV đơn hàng từ một thư mục, bỏ dòng tiêu đề, chuyển thành JSON, định tuyến theo loại khách vào hai topic Kafka và đưa dòng lỗi vào topic dead letter. Viết test bằng `camel-test-spring-junit5` với `MockEndpoint` để kiểm tra số message vào từng đích.
2. **Aggregator báo giá (Scatter-Gather)**: dùng Camel hoặc Spring Integration gửi yêu cầu báo giá tới ba service giả lập có độ trễ ngẫu nhiên, gom phản hồi trong tối đa 2 giây và chọn giá thấp nhất. Kiểm tra hành vi khi một service không trả lời.
3. **Phân tích kiến trúc tích hợp**: một doanh nghiệp bán lẻ có ERP on-premise chỉ hỗ trợ SOAP và file, CRM là SaaS, và 15 microservice mới. Vẽ sơ đồ ASCII và viết ADR đề xuất chỗ dùng API Gateway, messaging, lớp tích hợp Camel và iPaaS (nếu có), kèm lý do và rủi ro.

## Tóm tắt

- EIP cung cấp ngôn ngữ chung cho tích hợp: message, channel, endpoint, pipes and filters cùng các mẫu định tuyến và chuyển đổi.
- Content-Based Router định tuyến theo nội dung, Message Translator chuyển định dạng, Splitter tách message, Aggregator gộp lại với correlation, completion condition và aggregation strategy.
- Aggregator có trạng thái: cần timeout và kho lưu bền vững cho dữ liệu quan trọng.
- Apache Camel mạnh về số lượng connector và DSL route gọn; Spring Integration hợp với team đã dùng hệ sinh thái Spring.
- API Gateway lo các vấn đề ở biên, ESB tập trung tích hợp nội bộ nhưng dễ thành nút cổ chai, iPaaS nhanh cho SaaS nhưng có rủi ro lock-in và chi phí.
- Nguyên tắc xuyên suốt: smart endpoints, dumb pipes; giữ logic nghiệp vụ trong service, lớp tích hợp chỉ định tuyến và chuyển đổi.
