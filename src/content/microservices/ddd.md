Phần lớn các dự án microservices gặp khó không phải vì chọn sai công nghệ mà vì cắt sai ranh giới: các service phải gọi nhau liên tục, sửa một tính năng phải deploy năm service cùng lúc, hai team tranh nhau sửa cùng một bảng dữ liệu. Domain-Driven Design (DDD) là bộ phương pháp giúp tìm ranh giới theo **nghiệp vụ** thay vì theo bảng dữ liệu hay theo tầng kỹ thuật. Bài này đi từ strategic design (tìm và kết nối các vùng nghiệp vụ) đến tactical design (cách viết model bên trong), và kết thúc bằng một câu hỏi rất thực tế: có nên tách microservices ngay hay bắt đầu bằng modular monolith.

## Mục tiêu bài học

- Giải thích được bounded context, ubiquitous language và vì sao cùng một từ "sản phẩm" lại mang nghĩa khác nhau ở các bộ phận.
- Vẽ được context map với các quan hệ shared kernel, customer–supplier, conformist, anti-corruption layer.
- Thiết kế aggregate bảo vệ bất biến nghiệp vụ, phân biệt entity với value object và phát hành domain event.
- Tổ chức được một buổi Event Storming và biến kết quả thành ranh giới module hoặc service.
- Quyết định có cơ sở khi nào chọn modular monolith (Spring Modulith) thay vì microservices.

## Strategic design: ngôn ngữ chung và ranh giới mô hình

### Ubiquitous language

**Ubiquitous language** (ngôn ngữ chung) là bộ thuật ngữ mà dev, BA, QA và chuyên gia nghiệp vụ (domain expert) cùng dùng, trong cuộc họp, trong tài liệu và trong chính mã nguồn. Nếu nghiệp vụ nói "đơn bị huỷ vì quá hạn thanh toán" thì code nên có `order.expire()` và sự kiện `OrderExpired`, chứ không phải `updateStatus(5)`.

Lợi ích lớn nhất là giảm "dịch thuật" giữa người nghiệp vụ và dev. Khi tên trong code trùng với tên trong cuộc họp, chỗ hiểu sai lộ ra sớm: dev hỏi "đơn *quá hạn* khác gì đơn *bị huỷ*?" và phát hiện ra đó là hai quy trình khác nhau. Hãy duy trì một bảng thuật ngữ (glossary) ngắn cho mỗi vùng nghiệp vụ và cập nhật nó khi hiểu biết thay đổi.

### Bounded context

Trong một doanh nghiệp lớn, cùng một từ có nhiều nghĩa. Lấy ví dụ "Sản phẩm" ở một sàn thương mại điện tử:

| Bộ phận | "Sản phẩm" nghĩa là gì |
|---|---|
| Catalog | Tên, mô tả, hình ảnh, thuộc tính, danh mục |
| Inventory | SKU, số lượng tồn ở từng kho, vị trí kệ |
| Pricing | Giá niêm yết, giá khuyến mãi theo vùng, theo thời gian |
| Shipping | Kích thước, cân nặng, hàng dễ vỡ hay không |

Nếu cố gom tất cả vào một class `Product` dùng chung, mọi team sẽ cùng sửa một model, thay đổi ở chỗ này làm vỡ chỗ khác. **Bounded context** là một ranh giới rõ ràng mà bên trong nó một mô hình và ngôn ngữ có nghĩa nhất quán. Mỗi context có model riêng chỉ chứa những gì nó cần, và các context liên kết với nhau qua định danh chung (ví dụ SKU).

Cách tìm bounded context:

- **Lắng nghe chỗ ngôn ngữ đổi nghĩa.** Khi hai nhóm dùng cùng một từ nhưng mô tả khác nhau, đó thường là một đường ranh giới.
- **Đi theo năng lực nghiệp vụ** (business capability): bán hàng, kho, thanh toán, vận chuyển.
- **Nhìn vào cơ cấu tổ chức.** Theo định luật Conway, kiến trúc hệ thống có xu hướng phản chiếu cấu trúc giao tiếp của tổ chức. Một context nên do một team sở hữu.
- **Phân loại subdomain:** *core* (tạo lợi thế cạnh tranh, đáng đầu tư người giỏi nhất), *supporting* (cần nhưng không khác biệt) và *generic* (giải pháp có sẵn như gửi email, kế toán, xác thực, nên mua hoặc dùng dịch vụ có sẵn).

> **Lưu ý:** Subdomain thuộc *không gian vấn đề* (doanh nghiệp làm gì), còn bounded context thuộc *không gian giải pháp* (ta mô hình hoá thế nào). Lý tưởng là một subdomain ứng với một context, nhưng không bắt buộc. Bounded context là ứng viên tốt cho ranh giới microservice, nhưng một context cũng có thể chỉ là một module trong monolith.

## Context map: các context nói chuyện với nhau thế nào

**Context map** là bản đồ thể hiện các bounded context và *quan hệ* giữa chúng. Trong mỗi quan hệ có bên **upstream** (thượng nguồn, thay đổi của nó ảnh hưởng tới bên kia) và **downstream** (hạ nguồn, chịu ảnh hưởng). Các mẫu quan hệ phổ biến:

| Mẫu | Ý nghĩa | Khi nào dùng |
|---|---|---|
| Partnership | Hai team cùng thành bại, phối hợp kế hoạch thay đổi | Hai context gắn chặt trong một mục tiêu chung |
| Shared kernel | Hai context dùng chung một phần model nhỏ (vd. `Money`, `Sku`); thay đổi phần chung cần cả hai đồng ý | Team gần nhau, phần chung nhỏ và ổn định |
| Customer–supplier | Upstream (supplier) cung cấp, downstream (customer) sử dụng và có tiếng nói trong kế hoạch của upstream | Hai team trong cùng tổ chức, ưu tiên có thể thương lượng |
| Conformist | Downstream chấp nhận nguyên model của upstream, không có quyền yêu cầu | Upstream là hệ lớn hoặc bên ngoài, model của nó đủ dùng |
| Anti-corruption layer (ACL) | Downstream dựng một lớp dịch để model của upstream không "làm bẩn" model của mình | Tích hợp hệ legacy hoặc bên thứ ba có model kém, khó hiểu |
| Open host service / Published language | Upstream công bố API hoặc định dạng sự kiện công khai, có tài liệu, ổn định cho nhiều bên dùng | Có nhiều downstream |
| Separate ways | Không tích hợp, mỗi bên tự giải quyết | Chi phí tích hợp lớn hơn lợi ích |

Ví dụ context map của một hệ thống bán hàng:

```text
 +-------------+  Open Host Service (REST + OpenAPI)  +------------------+
 |  Catalog    |------------------------------------->|  Ordering        |
 |  [U]        |                                  [D] |  (core domain)   |
 +-------------+                                      +--+------------+--+
                                                         |            |
                          Customer-Supplier              |            | ACL
                          Ordering = customer [D]        |            |
                          Inventory = supplier [U]       v            v
                                              +-------------+   +--------------------+
                                              |  Inventory  |   |  ERP cũ (SOAP) [U] |
                                              +-------------+   +--------------------+

 Shared Kernel: thư viện nhỏ shop-kernel (Money, Sku) dùng chung giữa Ordering và Pricing
```

### Anti-corruption layer trong code

ACL thường là một adapter hiện thực một interface (port) do context của bạn định nghĩa, bên trong làm nhiệm vụ dịch mã, đổi tên, gộp hoặc tách trường dữ liệu:

```java
// Model của Ordering: tên rõ ràng, đúng ngôn ngữ chung
public record CustomerSnapshot(CustomerId id, String displayName, boolean vip) {}

// Port do Ordering sở hữu
public interface CustomerDirectory {
    CustomerSnapshot findById(CustomerId id);
}

// ACL: dịch model của ERP cũ sang model của Ordering
@Component
class ErpCustomerDirectory implements CustomerDirectory {

    private static final String ERP_VIP_CODE = "03";   // quy ước mã khách VIP của ERP
    private final ErpSoapClient erp;

    ErpCustomerDirectory(ErpSoapClient erp) {
        this.erp = erp;
    }

    @Override
    public CustomerSnapshot findById(CustomerId id) {
        ErpCustRecord raw = erp.getCustomer(id.value());    // các trường KH_MA, KH_TEN, LOAI_KH...
        return new CustomerSnapshot(
                id,
                raw.getKhTen().trim(),
                ERP_VIP_CODE.equals(raw.getLoaiKh()));
    }
}
```

Nhờ ACL, khi ERP được thay thế, chỉ lớp này phải viết lại; domain của Ordering không biết `LOAI_KH` là gì.

## Tactical design: viết model bên trong một context

### Entity và value object

- **Entity** có định danh (identity) tồn tại suốt vòng đời. Hai đơn hàng có cùng nội dung nhưng khác ID vẫn là hai đơn khác nhau. Ví dụ: `Order`, `Customer`, `Shipment`.
- **Value object** được định nghĩa hoàn toàn bởi giá trị, bất biến (immutable), không có định danh, so sánh bằng giá trị. Ví dụ: `Money`, `Address`, `Quantity`, `DateRange`.

Hãy ưu tiên value object. Chúng gom validation và hành vi vào một chỗ, tránh "primitive obsession" (dùng `BigDecimal`, `String` trần khắp nơi). Với Java 21, `record` rất hợp để viết value object:

```java
public record Money(BigDecimal amount, Currency currency) {

    public static final Money ZERO_VND = new Money(BigDecimal.ZERO, Currency.getInstance("VND"));

    public Money {
        Objects.requireNonNull(amount, "amount");
        Objects.requireNonNull(currency, "currency");
        if (amount.signum() < 0) {
            throw new IllegalArgumentException("Số tiền không được âm");
        }
    }

    public Money add(Money other) {
        if (!currency.equals(other.currency)) {
            throw new IllegalArgumentException("Không thể cộng hai loại tiền tệ khác nhau");
        }
        return new Money(amount.add(other.amount), currency);
    }

    public Money times(int quantity) {
        return new Money(amount.multiply(BigDecimal.valueOf(quantity)), currency);
    }
}
```

> **Lưu ý:** `BigDecimal.equals` so sánh cả scale (`1.0` khác `1.00`), nên `equals` của record cũng vậy. Nếu cần so sánh theo giá trị, hãy chuẩn hoá scale trong constructor theo số chữ số thập phân của loại tiền tệ.

### Aggregate

**Aggregate** là một cụm entity và value object được xem như *một đơn vị nhất quán* khi thay đổi dữ liệu. Mỗi aggregate có một **aggregate root**, là cửa ngõ duy nhất: bên ngoài chỉ gọi method của root và chỉ giữ tham chiếu tới root bằng ID. Các nguyên tắc thiết kế:

1. **Bảo vệ bất biến (invariant) bên trong ranh giới.** Ví dụ: không được thêm dòng hàng khi đơn đã đặt; tổng tiền luôn bằng tổng các dòng.
2. **Giữ aggregate nhỏ.** Aggregate lớn gây tranh chấp khoá và phải tải nhiều dữ liệu.
3. **Tham chiếu aggregate khác bằng ID**, không bằng object (`customerId` thay vì `Customer customer`).
4. **Một transaction chỉ sửa một aggregate.** Nhất quán giữa các aggregate được đảm bảo dần (eventual consistency) thông qua domain event.

Repository được tạo theo aggregate root (`OrderRepository`), không tạo repository cho entity con như `OrderLine`.

### Domain event

**Domain event** là một sự việc có ý nghĩa nghiệp vụ *đã xảy ra*, đặt tên ở thì quá khứ: `OrderPlaced`, `PaymentFailed`. Event bất biến và mang đủ dữ liệu để bên nhận không phải hỏi lại. Cần phân biệt domain event (dùng bên trong context hoặc giữa các module) với integration event (công bố ra ngoài, trở thành published language, phải quản lý phiên bản cẩn thận).

Ví dụ aggregate `Order` dùng `AbstractAggregateRoot` của Spring Data để đăng ký event (phần mapping JPA của `OrderLine` được lược bớt):

```java
@Entity
@Table(name = "orders")
public class Order extends AbstractAggregateRoot<Order> {

    @Id private UUID id;
    private UUID customerId;                         // tham chiếu aggregate khác bằng ID
    @Enumerated(EnumType.STRING)
    private OrderStatus status = OrderStatus.DRAFT;
    @OneToMany(cascade = CascadeType.ALL, orphanRemoval = true)
    @JoinColumn(name = "order_id")
    private List<OrderLine> lines = new ArrayList<>();
    @Version private long version;                   // optimistic locking

    protected Order() {}                             // dành cho JPA

    public Order(UUID id, UUID customerId) {
        this.id = id;
        this.customerId = customerId;
    }

    public void addLine(Sku sku, int quantity, Money unitPrice) {
        if (status != OrderStatus.DRAFT) {
            throw new IllegalStateException("Chỉ được thêm hàng khi đơn còn ở trạng thái DRAFT");
        }
        lines.add(new OrderLine(sku, quantity, unitPrice));
    }

    public void place() {
        if (lines.isEmpty()) {
            throw new IllegalStateException("Không thể đặt đơn hàng trống");
        }
        status = OrderStatus.PLACED;
        registerEvent(new OrderPlaced(id, customerId, total(), Instant.now()));
    }

    public Money total() {
        return lines.stream().map(OrderLine::subtotal).reduce(Money.ZERO_VND, Money::add);
    }
}
```

Event đăng ký bằng `registerEvent` chỉ được phát khi bạn gọi `orderRepository.save(order)`. Bên nhận nên dùng `@TransactionalEventListener` (mặc định chạy sau khi commit) để không xử lý một sự kiện mà transaction gốc cuối cùng lại rollback.

## Event Storming: khám phá nghiệp vụ cùng nhau

**Event Storming** là kỹ thuật workshop do Alberto Brandolini đề xuất: mọi người cùng dán giấy nhớ lên một bức tường dài (hoặc bảng Miro) để dựng lại dòng chảy nghiệp vụ dưới dạng chuỗi sự kiện. Thành phần tham dự quan trọng nhất là **chuyên gia nghiệp vụ**, cùng với dev, QA, PO. Quy ước màu thường dùng:

| Màu giấy | Ý nghĩa |
|---|---|
| Cam | Domain event (thì quá khứ: "Đơn hàng đã được đặt") |
| Xanh dương | Command, hành động gây ra event ("Đặt hàng") |
| Vàng nhỏ | Actor, người thực hiện command |
| Vàng lớn | Aggregate nhận command và sinh event |
| Tím | Policy, quy tắc phản ứng: "Khi X xảy ra thì làm Y" |
| Hồng | Hệ thống bên ngoài |
| Xanh lá | Read model, thông tin người dùng cần để ra quyết định |
| Đỏ/hồng đậm | Hot spot: câu hỏi, mâu thuẫn, rủi ro |

Các bước của một buổi Big Picture Event Storming:

1. **Khám phá hỗn loạn:** mỗi người tự viết các domain event mình biết, dán lên tường, chưa cần sắp xếp.
2. **Sắp theo dòng thời gian:** xếp event từ trái sang phải, gộp trùng lặp, thống nhất cách gọi tên. Đây là lúc ngôn ngữ chung hình thành.
3. **Đánh dấu hot spot:** mọi chỗ còn tranh cãi hoặc chưa ai biết đều được ghi lại, không cố giải quyết ngay.
4. **Bổ sung command, actor, policy, hệ thống ngoài** để thấy ai làm gì và cái gì kích hoạt cái gì.
5. **Tìm aggregate và vẽ ranh giới:** gom command và event quanh aggregate; chỗ ngôn ngữ đổi nghĩa hoặc chỗ một policy chuyển việc sang nhóm khác thường là ranh giới bounded context.

Một đoạn kết quả có thể trông như sau:

```text
[Khách hàng] --(Đặt hàng)--> <Order> --> {Đơn hàng đã được đặt}
                                                |
                          Policy: "Khi đơn được đặt thì giữ hàng trong kho"
                                                v
              (Giữ tồn kho) --> <Inventory> --> {Đã giữ hàng} | {Giữ hàng thất bại}
                                                |
                          Policy: "Khi đã giữ hàng thì yêu cầu thanh toán"
                                                v
         (Thanh toán) --> [Cổng thanh toán] --> {Đã thanh toán} | {Thanh toán thất bại}

Chú thích: (command)  <aggregate>  {domain event}  [actor / hệ thống ngoài]
```

Mẹo tổ chức: người điều phối (facilitator) giữ nhịp và không để buổi họp sa vào tranh luận về database hay framework; giới hạn thời gian cho từng bước; chụp ảnh tường sau mỗi giai đoạn. Đầu ra nên được chuyển thành bảng thuật ngữ, context map và danh sách hot spot cần làm rõ.

## Modular monolith hay microservices?

Microservices mang lại deploy độc lập, scale riêng từng phần và cô lập lỗi, nhưng phải trả giá: độ trễ mạng, lỗi cục bộ (partial failure), giao dịch phân tán phải dùng saga, khó debug, tốn hạ tầng và đòi hỏi năng lực vận hành (CI/CD, observability, trực sự cố). Nếu ranh giới còn chưa ổn định, tách sớm sẽ tạo ra **distributed monolith**: một hệ thống phân tán nhưng vẫn phải deploy cùng nhau.

**Modular monolith** là một ứng dụng triển khai được như một khối, nhưng bên trong chia thành các module có ranh giới rõ ràng tương ứng bounded context. Module giao tiếp qua API công khai hoặc qua event trong process, và mỗi module sở hữu bảng dữ liệu của mình. Khi một module thực sự cần tách ra (tải khác biệt, team riêng), bạn tách nó với rủi ro thấp hơn nhiều.

| Tiêu chí | Modular monolith | Microservices |
|---|---|---|
| Số team | Một hoặc vài team | Nhiều team cần tự chủ phát hành |
| Ranh giới nghiệp vụ | Còn đang khám phá, thay đổi thường xuyên | Đã ổn định |
| Nhu cầu scale | Tương đối đồng đều | Các phần có tải rất khác nhau |
| Năng lực vận hành | Hạn chế | Đã có nền tảng CI/CD, observability, on-call |
| Nhất quán dữ liệu | Transaction cục bộ dễ dàng | Eventual consistency, saga |

### Spring Modulith

Spring Modulith hỗ trợ xây modular monolith trên Spring Boot với các quy ước sau:

- Mỗi package nằm *trực tiếp* dưới package chứa class `@SpringBootApplication` là một **application module**. Các sub-package mặc định là nội bộ (internal), module khác không được dùng.
- `ApplicationModules.verify()` kiểm tra không có vòng phụ thuộc giữa các module và không có module nào truy cập phần nội bộ của module khác.
- `@ApplicationModuleListener` là cách viết gọn cho một listener chạy bất đồng bộ, trong transaction mới, sau khi transaction phát event commit.
- Event Publication Registry (ví dụ starter `spring-modulith-starter-jpa`) lưu lại các event chưa được xử lý xong để có thể gửi lại, tương tự ý tưởng outbox.
- `@ApplicationModuleTest` cho phép chạy integration test chỉ khởi động một module.

```text
com.example.shop
├── ShopApplication.java
├── order            <- module "order": OrderService, OrderPlaced là API công khai
│   ├── OrderService.java
│   ├── OrderPlaced.java
│   └── internal     <- chỉ module order được dùng
├── inventory
│   ├── InventoryService.java
│   └── internal
└── payment
    └── PaymentService.java
```

```java
class ModularityTests {

    ApplicationModules modules = ApplicationModules.of(ShopApplication.class);

    @Test
    void verifiesModuleBoundaries() {
        modules.verify();   // fail nếu có vòng phụ thuộc hoặc truy cập internal của module khác
    }

    @Test
    void writesModuleDocumentation() {
        new Documenter(modules).writeDocumentation();   // sinh sơ đồ module dạng PlantUML
    }
}

// Trong module payment: phản ứng với event của module order thay vì gọi trực tiếp
@Component
class OrderPlacedListener {

    private final PaymentService payments;

    OrderPlacedListener(PaymentService payments) {
        this.payments = payments;
    }

    @ApplicationModuleListener
    void on(OrderPlaced event) {
        payments.requestPayment(event.orderId(), event.total());
    }
}
```

Khi sau này tách `payment` thành service riêng, bạn chỉ cần thay cơ chế truyền event trong process bằng message broker; logic nghiệp vụ gần như giữ nguyên.

## Lỗi thường gặp

- **Chia service theo bảng hoặc entity** (`CustomerService`, `ProductService` chỉ có CRUD). Kết quả là mọi use case phải gọi qua nhiều service. Cách sửa: chia theo năng lực nghiệp vụ và bounded context, mỗi service sở hữu trọn một quy trình.
- **Anemic domain model:** entity chỉ có getter/setter, mọi quy tắc nằm rải rác trong các service class. Cách sửa: đưa bất biến vào aggregate, để `order.place()` tự kiểm tra điều kiện.
- **Aggregate quá lớn**, ví dụ `Customer` chứa toàn bộ lịch sử `orders`. Mỗi lần sửa phải tải và khoá cả khối dữ liệu. Cách sửa: tách thành aggregate nhỏ, tham chiếu bằng ID.
- **Sửa nhiều aggregate trong một transaction** cho "chắc ăn". Cách làm này tạo coupling và không thể giữ được khi tách service. Cách sửa: dùng domain event và chấp nhận eventual consistency giữa các aggregate.
- **Dùng chung database giữa các context.** Thay đổi schema của một bên làm vỡ bên kia. Cách sửa: mỗi context sở hữu dữ liệu của mình, chia sẻ qua API hoặc event.
- **Shared kernel phình thành "thư viện common"** chứa cả entity và logic. Cách sửa: chỉ để những value object nhỏ, ổn định; còn lại mỗi context tự định nghĩa.
- **Event Storming chỉ có dev.** Không có chuyên gia nghiệp vụ, buổi workshop chỉ vẽ lại hiểu biết sẵn có của dev. Cách sửa: mời đúng người nắm nghiệp vụ, kể cả người vận hành thực tế.
- **Tách microservices khi ranh giới chưa rõ.** Cách sửa: bắt đầu bằng modular monolith, kiểm chứng ranh giới bằng `verify()`, chỉ tách khi có lý do cụ thể.

## Bài tập thực hành

1. **Event Storming mini (60–90 phút):** cùng 2–3 đồng nghiệp mô hình hoá quy trình "đặt vé xem phim" từ lúc chọn suất chiếu đến lúc nhận vé. Đầu ra gồm dòng thời gian event, danh sách hot spot, 3–5 bounded context đề xuất và một context map có ghi rõ upstream/downstream.
2. **Aggregate có kiểm thử:** cài đặt `Order` và `Money` như trong bài, viết unit test cho các bất biến (không thêm hàng sau khi đặt, không cộng hai loại tiền, không đặt đơn trống) và kiểm tra `OrderPlaced` được phát khi `save()`.
3. **Spring Modulith:** dựng ứng dụng với ba module `order`, `inventory`, `payment`. Viết test `verify()`, sau đó cố tình gọi một class trong `inventory.internal` từ `order` để thấy test thất bại. Cuối cùng chuyển lời gọi trực tiếp sang `@ApplicationModuleListener`.

## Tóm tắt

- Bounded context là ranh giới mà trong đó model và ngôn ngữ chung có nghĩa nhất quán; nó là ứng viên tự nhiên cho ranh giới module hoặc service.
- Context map mô tả quan hệ upstream/downstream; dùng anti-corruption layer khi phải tích hợp với model kém chất lượng.
- Aggregate nhỏ, bảo vệ bất biến, tham chiếu nhau bằng ID và mỗi transaction chỉ sửa một aggregate.
- Value object bất biến (record trong Java 21) giúp gom validation và hành vi, tránh primitive obsession.
- Domain event đặt tên thì quá khứ, là cầu nối nhất quán dần giữa các aggregate và các context.
- Event Storming cần có chuyên gia nghiệp vụ; kết quả là ngôn ngữ chung, hot spot và ranh giới context.
- Khi ranh giới chưa ổn định, modular monolith với Spring Modulith là điểm khởi đầu an toàn hơn microservices.
