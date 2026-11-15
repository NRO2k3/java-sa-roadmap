Phong cách kiến trúc (architecture style) là tập hợp các quyết định nền tảng về cách chia thành phần, cách các thành phần giao tiếp và cách chúng được triển khai. Mỗi phong cách tối ưu cho một nhóm thuộc tính chất lượng và hy sinh nhóm khác: microservices đổi sự đơn giản lấy khả năng deploy độc lập, space-based đổi tính nhất quán tức thời lấy khả năng chịu tải đột biến. Một Solution Architect cần biết nhiều phong cách để chọn đúng cho từng bài toán, kết hợp chúng một cách có chủ đích, và có cơ chế tự động ngăn kiến trúc bị "xói mòn" theo thời gian.

## Mục tiêu bài học

- Phân biệt Layered, Hexagonal (Ports & Adapters) và Clean Architecture, biết cách tổ chức package tương ứng trong dự án Spring Boot.
- So sánh monolith, modular monolith, microservices và serverless theo thuộc tính chất lượng và bối cảnh tổ chức.
- Hiểu cấu trúc, điểm mạnh, điểm yếu của event-driven, space-based và pipeline architecture.
- Viết fitness function bằng ArchUnit để kiểm soát kiến trúc trong CI.

## Hai cấp độ của "phong cách"

Cần phân biệt hai câu hỏi khác nhau:

1. **Bên trong một ứng dụng, code được tổ chức thế nào?** Đây là phạm vi của Layered, Hexagonal, Clean Architecture.
2. **Hệ thống gồm bao nhiêu đơn vị triển khai và chúng giao tiếp ra sao?** Đây là phạm vi của monolith, microservices, serverless, event-driven, space-based, pipeline.

Hai cấp độ này kết hợp được với nhau: một hệ thống microservices giao tiếp bằng event, trong đó mỗi service tổ chức code theo Hexagonal, là một kiến trúc hoàn toàn bình thường. Cũng cần phân biệt **phong cách** (hình dạng tổng thể) với **pattern** (lời giải cho một vấn đề cục bộ như circuit breaker, outbox).

## Tổ chức code bên trong ứng dụng

### Layered architecture

Kiến trúc phân tầng chia code theo **vai trò kỹ thuật**: Presentation (controller) → Application/Service → Domain → Persistence → Database. Mỗi tầng chỉ gọi tầng ngay bên dưới (tầng đóng, closed layer); một số tầng có thể được đánh dấu "mở" để cho phép đi tắt.

- **Ưu điểm:** quen thuộc, dễ bắt đầu, phù hợp ứng dụng CRUD và đội nhỏ.
- **Nhược điểm:** domain thường phụ thuộc vào persistence (entity JPA chính là model nghiệp vụ); một thay đổi nghiệp vụ chạm vào mọi tầng; dễ gặp **sinkhole anti-pattern**, tức phần lớn request chỉ chạy xuyên qua các tầng mà không tầng nào làm gì có ý nghĩa.

### Hexagonal architecture (Ports & Adapters)

Do Alistair Cockburn đề xuất. Lõi ứng dụng (domain và use case) nằm ở trung tâm và **không biết gì về thế giới bên ngoài**. Lõi định nghĩa các **port**, là interface mô tả nó cần gì hoặc cung cấp gì. **Adapter** nằm ngoài, hiện thực port bằng một công nghệ cụ thể.

- **Driving port / adapter** (phía chủ động, primary): thứ gọi vào ứng dụng, ví dụ REST controller, Kafka listener, CLI, hoặc chính test case.
- **Driven port / adapter** (phía bị động, secondary): thứ ứng dụng gọi ra, ví dụ repository JPA, Kafka publisher, client gọi API đối tác.

Mọi phụ thuộc hướng **vào trong**. Nhờ vậy có thể test use case bằng adapter giả trong bộ nhớ, và thay PostgreSQL bằng MongoDB hay REST bằng gRPC mà không sửa lõi.

### Clean Architecture

Do Robert C. Martin tổng hợp, gồm các vòng tròn đồng tâm: Entities (quy tắc nghiệp vụ cốt lõi) → Use Cases (quy tắc của ứng dụng) → Interface Adapters (controller, presenter, gateway) → Frameworks & Drivers (web, DB, UI). Quy tắc trung tâm là **Dependency Rule**: phụ thuộc trong mã nguồn chỉ được hướng vào vòng trong. Về bản chất, Hexagonal, Onion (Jeffrey Palermo) và Clean Architecture cùng chung một ý tưởng: đảo ngược phụ thuộc để domain độc lập với hạ tầng; khác biệt chủ yếu ở tên gọi và số vòng.

Một cách tổ chức package cho service đặt hàng theo Hexagonal:

```text
com.example.order
├── domain
│   ├── model            Order, OrderLine, Money       (Java thuần, không annotation framework)
│   └── service          PricingPolicy
├── application
│   ├── port
│   │   ├── in           PlaceOrderUseCase             (driving port)
│   │   └── out          LoadProductPort, SaveOrderPort (driven ports)
│   └── service          PlaceOrderService implements PlaceOrderUseCase
└── adapter
    ├── in/web           OrderController  -> gọi PlaceOrderUseCase
    └── out
        ├── persistence  OrderJpaAdapter implements SaveOrderPort
        └── messaging    KafkaOrderEventPublisher
```

```java
// application/port/in: ứng dụng cung cấp gì
public interface PlaceOrderUseCase {
    OrderId placeOrder(PlaceOrderCommand command);
}

// application/port/out: ứng dụng cần gì
public interface SaveOrderPort {
    void save(Order order);
}

// application/service: không phụ thuộc web, JPA hay Kafka
public class PlaceOrderService implements PlaceOrderUseCase {

    private final LoadProductPort products;
    private final SaveOrderPort orders;

    public PlaceOrderService(LoadProductPort products, SaveOrderPort orders) {
        this.products = products;
        this.orders = orders;
    }

    @Override
    public OrderId placeOrder(PlaceOrderCommand command) {
        Order order = Order.create(command.customerId());
        command.lines().forEach(l -> order.addLine(products.load(l.sku()), l.quantity()));
        order.place();
        orders.save(order);
        return order.id();
    }
}

// adapter/out/persistence: hiện thực port bằng Spring Data JPA
@Component
class OrderJpaAdapter implements SaveOrderPort {

    private final OrderJpaRepository repository;
    private final OrderEntityMapper mapper;

    OrderJpaAdapter(OrderJpaRepository repository, OrderEntityMapper mapper) {
        this.repository = repository;
        this.mapper = mapper;
    }

    @Override
    public void save(Order order) {
        repository.save(mapper.toEntity(order));   // entity JPA tách khỏi model domain
    }
}
```

`PlaceOrderService` được đăng ký bằng một `@Bean` trong class cấu hình ở tầng adapter hoặc bootstrap. Nhiều đội chấp nhận một thoả hiệp thực dụng: cho phép `@Transactional` của Spring ở tầng application, nhưng giữ tầng domain hoàn toàn thuần Java.

| | Layered | Hexagonal / Clean |
|---|---|---|
| Chia code theo | Vai trò kỹ thuật | Lõi nghiệp vụ và các adapter |
| Domain phụ thuộc hạ tầng | Thường có | Không |
| Test nghiệp vụ không cần DB | Khó | Dễ |
| Chi phí ban đầu | Thấp | Cao hơn: thêm interface, thêm mapping |
| Phù hợp | CRUD, ứng dụng nội bộ nhỏ | Nghiệp vụ phức tạp, sống lâu, nhiều kênh tích hợp |

## Topology triển khai: từ monolith đến serverless

### Monolith

Toàn bộ ứng dụng là **một đơn vị triển khai**. Phát triển, test, debug và deploy đơn giản; transaction cục bộ dễ dàng; độ trễ gọi hàm gần như bằng 0. Nhược điểm xuất hiện khi hệ thống và đội lớn lên: build chậm, các phần coupling chặt, phải scale cả khối dù chỉ một phần chịu tải, một lỗi rò bộ nhớ có thể làm sập mọi chức năng.

### Modular monolith

Vẫn một đơn vị triển khai nhưng chia **theo domain** thành các module có ranh giới được kiểm soát (Spring Modulith, ArchUnit), mỗi module sở hữu dữ liệu của mình. Đây là điểm khởi đầu hợp lý cho đa số sản phẩm mới, và là bước đệm an toàn trước khi tách microservices.

### Microservices

Nhiều service nhỏ, triển khai độc lập, mỗi service bao quanh một năng lực nghiệp vụ và sở hữu dữ liệu riêng. Mang lại tự chủ cho team, scale và cô lập lỗi theo từng phần, tự do chọn công nghệ. Cái giá là độ phức tạp của hệ phân tán: mạng, nhất quán dữ liệu, observability, chi phí vận hành. Giữa monolith và microservices còn có **service-based architecture**: một số ít service lớn (thường 4 đến 12), có thể dùng chung database, là lựa chọn thực dụng cho nhiều hệ thống doanh nghiệp.

### Serverless

Ứng dụng được ghép từ các hàm (FaaS, như AWS Lambda, Azure Functions) và dịch vụ được quản lý (hàng đợi, database, lưu trữ). Nhà cung cấp lo việc scale, kể cả scale về 0; bạn trả tiền theo lượt chạy. Phù hợp với tải thất thường, xử lý theo sự kiện (file được upload, message đến), các tác vụ "keo dán" giữa hệ thống. Không phù hợp với tác vụ chạy dài vượt giới hạn thời gian của nền tảng, tải cao đều đặn (thường đắt hơn container), hoặc yêu cầu độ trễ thấp ổn định.

Với Java, điểm yếu kinh điển là **cold start**: lần gọi đầu phải khởi động JVM và Spring context. Các cách giảm: AWS Lambda SnapStart, biên dịch native image với GraalVM (Spring Boot hỗ trợ AOT), CRaC, và giữ hàm nhỏ, ít dependency. Spring Cloud Function cho phép viết logic dạng `Function<I, O>` và chạy trên nhiều nền tảng.

| Tiêu chí | Monolith | Modular monolith | Microservices | Serverless |
|---|---|---|---|---|
| Đơn vị triển khai | Một | Một | Nhiều service | Nhiều hàm |
| Độ phức tạp vận hành | Thấp | Thấp | Cao | Trung bình (nền tảng gánh phần lớn) |
| Scale | Cả khối | Cả khối | Từng service | Từng hàm, tự động |
| Nhất quán dữ liệu | Transaction cục bộ | Transaction cục bộ | Eventual consistency, saga | Eventual consistency |
| Hợp với | Sản phẩm mới, đội nhỏ | Đa số sản phẩm đang lớn | Nhiều team, domain ổn định | Tải thất thường, xử lý sự kiện |

## Event-driven, space-based và pipeline

### Event-driven architecture

Các thành phần giao tiếp **bất đồng bộ** bằng cách phát và tiêu thụ sự kiện qua broker (Kafka, RabbitMQ). Có hai topology:

- **Broker topology:** không có điều phối trung tâm, mỗi thành phần phản ứng với event và phát event mới (choreography). Linh hoạt, dễ mở rộng, nhưng khó nhìn thấy toàn bộ luồng.
- **Mediator topology:** một mediator nhận event khởi đầu và điều phối các bước (orchestration). Dễ kiểm soát lỗi và trạng thái, nhưng mediator có thể trở thành điểm tập trung coupling.

Điểm mạnh: tách rời người gửi và người nhận, chịu tải đột biến nhờ hàng đợi, dễ thêm consumer mới. Điểm yếu: eventual consistency, xử lý lỗi và retry phức tạp, phải đảm bảo idempotency, khó debug nếu thiếu tracing, phải quản lý schema và phiên bản event.

### Space-based architecture

Nhắm tới **khả năng mở rộng cực cao và co giãn** khi tải đồng thời khó dự đoán, bằng cách đưa database trung tâm ra khỏi đường xử lý đồng bộ. Mỗi **processing unit** chứa logic ứng dụng cùng một **in-memory data grid** được replicate giữa các unit. Ghi vào database được thực hiện bất đồng bộ qua **data pump** (thường là messaging) tới **data writer**; **data reader** nạp dữ liệu từ database khi khởi động. Lớp **virtualized middleware** gồm messaging grid (định tuyến request), data grid (đồng bộ dữ liệu), processing grid (điều phối xử lý) và deployment manager (tăng giảm số unit).

```text
                 +--------------------- Virtualized middleware ---------------------+
 Request ---->   | messaging grid | data grid | processing grid | deployment manager |
                 +------+----------------+-----------------+-------------------------+
                        |                |                 |
               +--------v-------+ +------v---------+ +-----v----------+
               | Processing     | | Processing     | | Processing     |   (tăng giảm theo tải)
               | unit + cache   |<->unit + cache   |<->unit + cache   |   cache replicate
               +--------+-------+ +------+---------+ +-----+----------+
                        |  data pump (bất đồng bộ, qua messaging)
                        v
                 +-------------+       +----------+
                 | Data writer | ----> | Database |  <---- Data reader (nạp khi khởi động)
                 +-------------+       +----------+
```

Ví dụ phù hợp: bán vé sự kiện, đấu giá trực tuyến, flash sale. Công cụ thường gặp: Hazelcast, Apache Ignite, Apache Geode. Đánh đổi: rất phức tạp, xung đột dữ liệu khi nhiều unit cùng cập nhật một bản ghi (data collision), khó test ở quy mô thật, tốn bộ nhớ, và dữ liệu trong database luôn trễ hơn trong cache.

### Pipeline architecture (pipes and filters)

Dữ liệu chảy một chiều qua chuỗi **filter**, mỗi filter làm đúng một việc và nối với nhau bằng **pipe**. Các loại filter: producer (nguồn), transformer (biến đổi), tester (kiểm tra và loại bỏ), consumer (đích).

```text
 [Producer: đọc file hoá đơn] -> [Transformer: chuẩn hoá] -> [Tester: loại bản ghi lỗi] -> [Consumer: ghi vào kho dữ liệu]
```

Ví dụ quen thuộc: pipe trong shell Unix, ETL, Spring Batch (reader → processor → writer), topology của Kafka Streams, chuỗi function trong Spring Cloud Stream, pipeline CI/CD. Điểm mạnh: đơn giản, dễ hiểu, filter tái sử dụng và test riêng được. Điểm yếu: không phù hợp cho tương tác hai chiều, độ trễ cộng dồn qua các bước, xử lý lỗi giữa chừng (bản ghi lỗi đi đâu, chạy lại từ đâu) phải thiết kế kỹ.

## Chọn phong cách thế nào

Không có phong cách tốt nhất, chỉ có phong cách **ít tệ nhất** cho bối cảnh cụ thể. Quy trình gợi ý:

1. Xác định vài thuộc tính chất lượng quan trọng nhất (thường 3 đến 5): ví dụ khả năng chịu tải đột biến, tốc độ ra tính năng, chi phí, tính nhất quán.
2. Xem xét ràng buộc tổ chức: số team, năng lực vận hành, thời hạn, ngân sách.
3. Chọn phong cách phù hợp nhất với các ưu tiên đó, chấp nhận rõ ràng những gì bị hy sinh, và ghi lại trong ADR (Architecture Decision Record).
4. Kết hợp có chủ đích: microservices bên ngoài, Hexagonal bên trong mỗi service, pipeline cho xử lý dữ liệu, serverless cho tác vụ thất thường.

## Kiểm soát kiến trúc bằng fitness function và ArchUnit

Theo thời gian, code dần lệch khỏi kiến trúc mong muốn (architecture erosion): một controller gọi thẳng repository "cho nhanh", domain bắt đầu import class của JPA. Sơ đồ trên slide không ngăn được điều đó. **Fitness function**, khái niệm phổ biến từ cuốn *Building Evolutionary Architectures*, là một phép kiểm tra khách quan, tự động, đo mức độ hệ thống còn tuân thủ một đặc tính kiến trúc. Ví dụ: test kiểm tra phụ thuộc giữa các package, test hiệu năng trong CI bảo đảm p99 dưới ngưỡng, quét lỗ hổng dependency, contract test giữa các service.

**ArchUnit** là thư viện viết các quy tắc kiến trúc dưới dạng test JUnit, chạy trên bytecode:

```java
// static import: ArchRuleDefinition.classes/noClasses, Architectures.onionArchitecture,
//                SlicesRuleDefinition.slices
@AnalyzeClasses(packages = "com.example", importOptions = ImportOption.DoNotIncludeTests.class)
class ArchitectureFitnessTest {

    @ArchTest
    static final ArchRule hexagonalLayers = onionArchitecture()
            .domainModels("..domain.model..")
            .domainServices("..domain.service..")
            .applicationServices("..application..")
            .adapter("web", "..adapter.in.web..")
            .adapter("persistence", "..adapter.out.persistence..")
            .adapter("messaging", "..adapter.out.messaging..");

    @ArchTest
    static final ArchRule domainIsFrameworkFree = noClasses()
            .that().resideInAPackage("..domain..")
            .should().dependOnClassesThat()
            .resideInAnyPackage("org.springframework..", "jakarta.persistence..", "org.apache.kafka..");

    @ArchTest
    static final ArchRule noCyclesBetweenContexts = slices()
            .matching("com.example.(*)..")          // mỗi bounded context là một slice
            .should().beFreeOfCycles();

    @ArchTest
    static final ArchRule controllersLiveInWebAdapter = classes()
            .that().areAnnotatedWith(RestController.class)
            .should().resideInAPackage("..adapter.in.web..");
}
```

`onionArchitecture()` kiểm tra domain không phụ thuộc application hay adapter, và các adapter không phụ thuộc lẫn nhau. Với codebase cũ có sẵn nhiều vi phạm, dùng `FreezingArchRule.freeze(rule)`: ArchUnit ghi lại các vi phạm hiện có và chỉ làm test thất bại với vi phạm **mới**, giúp áp dụng dần mà không chặn cả đội.

## Lỗi thường gặp

- **Chọn microservices vì xu hướng** khi chỉ có một team và domain chưa rõ. Cách sửa: bắt đầu bằng modular monolith, ghi rõ điều kiện để tách trong ADR.
- **Distributed monolith:** nhiều service nhưng phải deploy cùng nhau, gọi đồng bộ dây chuyền, dùng chung bảng. Cách sửa: vẽ lại ranh giới theo domain, chuyển sang giao tiếp bất đồng bộ, tách dữ liệu.
- **Layered nhưng domain phụ thuộc JPA và Spring**, nghiệp vụ không test được nếu thiếu database. Cách sửa: tách model domain khỏi entity persistence ở những phần nghiệp vụ phức tạp.
- **Hexagonal quá tay:** interface cho mọi class, bốn lớp mapping cho một màn hình CRUD. Cách sửa: áp dụng Hexagonal cho phần lõi phức tạp, để phần CRUD đơn giản theo layered.
- **Serverless cho tải cao đều đặn hoặc tác vụ chạy dài**, bỏ qua cold start của JVM. Cách sửa: tính chi phí so với container, dùng SnapStart hoặc native image khi cần độ trễ khởi động thấp.
- **Event-driven không có quản trị schema, idempotency và tracing.** Không ai biết event nào kích hoạt event nào. Cách sửa: schema registry, consumer idempotent, trace context trong header message.
- **Kiến trúc chỉ tồn tại trên slide.** Cách sửa: viết fitness function bằng ArchUnit và chạy trong CI ngay từ đầu dự án.

## Bài tập thực hành

1. **Refactor sang Hexagonal:** lấy một module đặt hàng viết theo layered (controller gọi service, service gọi repository JPA). Tách thành port và adapter như bài học, viết unit test cho `PlaceOrderService` bằng adapter giả trong bộ nhớ, không khởi động Spring.
2. **Bộ fitness function:** viết các rule ArchUnit như ví dụ, thêm rule "repository chỉ được dùng trong adapter persistence", chạy trong CI. Cố tình cho controller gọi repository để thấy build thất bại, sau đó áp dụng `FreezingArchRule` cho một codebase cũ.
3. **Architecture kata:** chọn phong cách cho ba bài toán và viết ADR ngắn (bối cảnh, phương án, quyết định, hệ quả) cho mỗi bài: (a) bán vé concert với hàng trăm nghìn người truy cập trong vài phút mở bán; (b) xử lý hàng đêm hàng triệu hoá đơn từ file của đối tác; (c) ứng dụng quản lý nghỉ phép cho 300 nhân viên.

## Tóm tắt

- Có hai cấp độ phong cách: tổ chức code bên trong ứng dụng và topology triển khai của cả hệ thống; chúng kết hợp được với nhau.
- Hexagonal, Onion và Clean Architecture cùng ý tưởng: domain ở trung tâm, phụ thuộc hướng vào trong, hạ tầng là adapter thay thế được.
- Modular monolith là điểm khởi đầu tốt; microservices chỉ đáng giá khi có nhiều team, ranh giới ổn định và năng lực vận hành.
- Serverless hợp với tải thất thường và xử lý sự kiện; với Java cần xử lý cold start.
- Event-driven tách rời thành phần nhưng đòi hỏi idempotency và quản trị schema; space-based dành cho tải đột biến cực lớn; pipeline dành cho xử lý dữ liệu một chiều.
- Chọn phong cách theo các thuộc tính chất lượng ưu tiên và ghi lại đánh đổi trong ADR.
- Fitness function với ArchUnit giữ cho kiến trúc thực tế khớp với kiến trúc thiết kế; dùng `FreezingArchRule` cho codebase cũ.
