JPA và Hibernate giúp ánh xạ object Java sang bảng quan hệ, nhưng cũng là nguồn gốc phổ biến nhất của các sự cố hiệu năng trong ứng dụng Spring. Rất nhiều ca "API chậm" mà Dev Lead phải xử lý bắt nguồn từ N+1 query, transaction kéo dài, hoặc schema bị thay đổi thiếu kiểm soát. Bài này giúp bạn hiểu Hibernate thực sự làm gì phía sau – từ mapping, persistence context tới transaction và migration – để dùng nó một cách có chủ đích thay vì coi là hộp đen.

## Mục tiêu bài học

- Mapping entity và các quan hệ `@OneToMany`, `@ManyToOne`, `@ManyToMany` đúng cách, chọn fetch type hợp lý.
- Phát hiện và xử lý N+1 query bằng fetch join, `@EntityGraph`, batch fetching và projection.
- Giải thích persistence context, dirty checking, first-level và second-level cache.
- Cấu hình transaction với propagation, isolation và rollback rule phù hợp từng tình huống.
- Quản lý thay đổi schema bằng Flyway hoặc Liquibase.

## Mapping entity và quan hệ

### Entity cơ bản

Một entity là class được đánh dấu `@Entity`, có khoá chính `@Id` và constructor không tham số (có thể `protected`). Vài lựa chọn đáng chú ý:

- **Sinh khoá chính:** `GenerationType.IDENTITY` dùng cột tự tăng, đơn giản nhưng khiến Hibernate không thể gom nhiều câu INSERT thành JDBC batch (vì phải INSERT ngay để biết id). `GenerationType.SEQUENCE` với `allocationSize` (ví dụ 50) cho phép Hibernate cấp trước một dải id trong bộ nhớ, hiệu quả hơn với PostgreSQL. `allocationSize` phải khớp với `INCREMENT BY` của sequence trong database.
- **Enum:** luôn dùng `@Enumerated(EnumType.STRING)`. Kiểu `ORDINAL` mặc định lưu số thứ tự, chỉ cần chèn thêm một giá trị vào giữa enum là dữ liệu cũ sai nghĩa.
- **`@Version`:** bật *optimistic locking* – Hibernate thêm `WHERE version = ?` vào câu UPDATE; nếu bản ghi đã bị người khác sửa, nó ném exception (Spring chuyển thành `ObjectOptimisticLockingFailureException`) thay vì âm thầm ghi đè.

```java
@Entity
@Table(name = "orders")
public class Order {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "order_seq")
    @SequenceGenerator(name = "order_seq", sequenceName = "order_seq", allocationSize = 50)
    private Long id;

    @Column(nullable = false, length = 64)
    private String customerId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private OrderStatus status = OrderStatus.NEW;

    @Version
    private long version;

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<OrderLine> lines = new ArrayList<>();

    protected Order() {}                      // JPA cần constructor không tham số

    public Order(String customerId) { this.customerId = customerId; }

    public void addLine(OrderLine line) {     // giữ đồng bộ hai phía của quan hệ
        lines.add(line);
        line.setOrder(this);
    }

    public void markPaid() { this.status = OrderStatus.PAID; }
    // getter…
}
```

### Quan hệ và phía sở hữu

Trong quan hệ hai chiều `Order` – `OrderLine`, phía có khoá ngoại (`OrderLine.order` với `@ManyToOne` + `@JoinColumn`) là **phía sở hữu** (*owning side*). Phía có `mappedBy` chỉ là phía nghịch đảo: Hibernate **chỉ nhìn phía sở hữu** khi ghi khoá ngoại. Đó là lý do cần method tiện ích `addLine` để cập nhật cả hai phía cùng lúc.

```java
@Entity
public class OrderLine {

    @Id @GeneratedValue
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "order_id")
    private Order order;

    private String sku;
    private int quantity;
    // constructor, getter, setter…
}
```

Một số quy tắc thực tế:

- `@OneToMany` **một chiều** không có `@JoinColumn` sẽ sinh thêm một bảng trung gian – thường không phải điều bạn muốn. Ưu tiên quan hệ hai chiều, hoặc chỉ cần `@ManyToOne` ở phía con.
- `cascade = ALL` và `orphanRemoval = true` phù hợp với quan hệ cha – con trong cùng một *aggregate* (đơn hàng và dòng hàng), không dùng giữa các aggregate độc lập (đơn hàng và khách hàng).
- `@ManyToMany` dùng bảng nối; nên dùng `Set` thay vì `List` và **không** dùng `CascadeType.REMOVE` (xoá một sản phẩm có thể xoá luôn danh mục đang được sản phẩm khác dùng). Khi bảng nối cần thêm cột (ngày gán, người gán), hãy mô hình hoá nó thành entity riêng với hai `@ManyToOne`.

```java
@ManyToMany
@JoinTable(name = "product_category",
        joinColumns = @JoinColumn(name = "product_id"),
        inverseJoinColumns = @JoinColumn(name = "category_id"))
private Set<Category> categories = new HashSet<>();
```

### Fetch type

Mặc định của JPA: `@ManyToOne` và `@OneToOne` là **EAGER**, `@OneToMany` và `@ManyToMany` là **LAZY**. Khuyến nghị là đặt **tất cả về LAZY**, rồi quyết định tải gì *theo từng use case* ở tầng query. EAGER không thể "tắt" cho một query cụ thể, và với JPQL nó thường sinh thêm các câu SELECT phụ ngoài ý muốn.

Truy cập quan hệ LAZY sau khi persistence context đã đóng gây `LazyInitializationException`. Spring Boot mặc định bật *Open Session in View* (`spring.jpa.open-in-view=true`, kèm cảnh báo khi khởi động), giữ session mở tới khi render xong response. Nó che giấu lỗi nhưng khiến query chạy ngầm ở tầng web và giữ connection lâu hơn. Nên đặt `spring.jpa.open-in-view=false` và tải dữ liệu cần thiết một cách tường minh.

## N+1 query: phát hiện và xử lý

N+1 xảy ra khi bạn chạy **1** query lấy N bản ghi cha, rồi khi duyệt từng bản ghi, Hibernate chạy thêm **N** query để tải quan hệ LAZY:

```sql
select * from orders where customer_id = ?;          -- 1 query, trả về 100 đơn
select * from order_line where order_id = ?;         -- lặp lại 100 lần
```

Trên máy dev với 5 bản ghi thì không ai thấy; trên production với 500 bản ghi và độ trễ mạng tới database, endpoint chậm đi hàng giây.

### Phát hiện

- Bật log SQL: `logging.level.org.hibernate.SQL=debug` (thêm `logging.level.org.hibernate.orm.jdbc.bind=trace` để xem giá trị tham số trên Hibernate 6).
- Bật thống kê: `spring.jpa.properties.hibernate.generate_statistics=true` – Hibernate log số câu lệnh đã chạy trong mỗi session.
- Viết test khẳng định **số lượng query** cho các endpoint quan trọng (ví dụ dùng thư viện datasource-proxy hoặc `Statistics` của Hibernate).
- Trên production, công cụ APM/tracing cho thấy một request sinh hàng chục span SQL giống nhau.

### Xử lý

```java
public interface OrderRepository extends JpaRepository<Order, Long> {

    // Fetch join: một câu SQL lấy cả đơn hàng và dòng hàng
    @Query("select o from Order o join fetch o.lines where o.customerId = :customerId")
    List<Order> findWithLinesByCustomerId(@Param("customerId") String customerId);

    // EntityGraph: khai báo đồ thị cần tải, Hibernate tự sinh left join
    @EntityGraph(attributePaths = "lines")
    Optional<Order> findWithLinesById(Long id);

    // Projection DTO: chỉ lấy cột cần cho màn hình danh sách, không tải entity
    @Query(value = """
            select new com.example.shop.order.OrderSummary(o.id, o.status, count(l))
            from Order o left join o.lines l
            group by o.id, o.status
            """,
           countQuery = "select count(o) from Order o")
    Page<OrderSummary> findSummaries(Pageable pageable);
}
```

| Kỹ thuật | Khi nào dùng | Lưu ý |
|---|---|---|
| `join fetch` | Use case cố định cần cả cha và con | Viết JPQL thủ công |
| `@EntityGraph` | Muốn tái sử dụng method dẫn xuất của Spring Data | Tương đương fetch join |
| Batch fetching (`hibernate.default_batch_fetch_size` hoặc `@BatchSize`) | Không biết trước quan hệ nào được truy cập; phân trang | Biến N+1 thành 1 + N/kích thước batch |
| Projection DTO | Màn hình chỉ đọc, danh sách, báo cáo | Không quản lý được entity để cập nhật |

Hai cạm bẫy cần biết:

- **Fetch join collection kết hợp phân trang:** SQL không thể giới hạn theo "số đơn hàng" khi mỗi đơn nhân thành nhiều dòng, nên Hibernate tải **toàn bộ** kết quả rồi phân trang trong bộ nhớ (và ghi cảnh báo vào log). Cách xử lý: query một trang id trước, rồi fetch join theo danh sách id đó; hoặc dùng batch fetching.
- **Fetch join hai collection kiểu `List` cùng lúc** gây `MultipleBagFetchException`, và kể cả khi dùng `Set` cũng tạo tích Descartes rất lớn. Hãy tải từng collection bằng query riêng.

Từ Hibernate 6, kết quả fetch join tự loại bỏ entity cha trùng lặp, không còn cần `select distinct` như trước.

## Persistence context, dirty checking và cache

### Persistence context

Mỗi `EntityManager` giữ một **persistence context**: một bản đồ "kiểu entity + id → instance". Trong Spring, mặc định mỗi transaction có một persistence context riêng. Trong phạm vi đó, cùng một id luôn trả về **cùng một object**, và gọi `findById` hai lần chỉ sinh một câu SELECT. Đây chính là **first-level cache**: luôn bật, chỉ sống trong một transaction, không chia sẻ giữa các request.

Một entity có bốn trạng thái: *transient* (mới tạo bằng `new`, chưa được quản lý), *managed* (đang nằm trong persistence context), *detached* (context đã đóng hoặc bị `clear`) và *removed* (đã đánh dấu xoá).

### Dirty checking

Khi tải một entity, Hibernate lưu một bản chụp (*snapshot*) giá trị ban đầu. Lúc **flush** – trước khi commit, và trước các query có thể bị ảnh hưởng bởi thay đổi chưa ghi – nó so sánh entity với snapshot và tự sinh câu UPDATE cho những gì đã đổi. Vì vậy, với entity đang được quản lý, bạn **không cần gọi `save()`**.

```java
@Service
public class OrderCommandService {

    private final OrderRepository orders;

    public OrderCommandService(OrderRepository orders) {
        this.orders = orders;
    }

    @Transactional
    public void markPaid(Long orderId) {
        Order order = orders.findById(orderId)
                .orElseThrow(() -> new OrderNotFoundException(orderId));
        order.markPaid();        // chỉ đổi trạng thái trong bộ nhớ
        // không cần orders.save(order): khi commit, Hibernate flush và sinh UPDATE
    }

    @Transactional(readOnly = true)
    public OrderView view(Long orderId) {
        // readOnly: Spring chuyển flush mode của Hibernate sang MANUAL, bỏ qua dirty checking
        return orders.findWithLinesById(orderId)
                .map(OrderView::from)
                .orElseThrow(() -> new OrderNotFoundException(orderId));
    }
}
```

Đánh đổi: persistence context giữ mọi entity đã tải. Một job xử lý 1 triệu bản ghi trong một transaction sẽ tốn bộ nhớ và flush rất chậm. Với xử lý hàng loạt, hãy chia theo trang và gọi `entityManager.flush()` rồi `clear()` sau mỗi lô, hoặc dùng câu lệnh bulk `@Modifying @Query("update …")`. Lưu ý bulk update đi thẳng xuống database, **bỏ qua** persistence context – entity đang nằm trong bộ nhớ sẽ cũ đi, vì vậy hãy dùng `@Modifying(clearAutomatically = true)` khi cần.

### Second-level cache

Second-level cache sống ở cấp `SessionFactory`, chia sẻ giữa mọi transaction. Nó không bật sẵn: cần một provider (thường qua JCache với Ehcache hoặc Infinispan), cấu hình `hibernate.cache.use_second_level_cache=true` và đánh dấu entity bằng `@Cacheable` (của `jakarta.persistence`) cùng `@org.hibernate.annotations.Cache(usage = CacheConcurrencyStrategy.READ_WRITE)`.

- **Phù hợp:** dữ liệu tham chiếu, đọc nhiều ghi ít (danh mục, tỉnh/thành, cấu hình sản phẩm).
- **Không phù hợp:** dữ liệu thay đổi liên tục; dữ liệu bị hệ thống khác cập nhật thẳng vào database; ứng dụng nhiều instance dùng cache cục bộ (mỗi node một bản, dễ đọc dữ liệu cũ).

Nhiều team chọn cache ở tầng ứng dụng (Spring Cache + Redis) vì kiểm soát được key, TTL và việc xoá cache một cách tường minh.

## Quản lý transaction

### Propagation

Propagation quyết định method `@Transactional` làm gì khi được gọi trong lúc **đã có** transaction.

| Propagation | Hành vi | Dùng khi |
|---|---|---|
| `REQUIRED` (mặc định) | Tham gia transaction hiện có, chưa có thì tạo mới | Hầu hết service |
| `REQUIRES_NEW` | Tạm dừng transaction hiện có, mở transaction vật lý mới | Ghi audit/log phải tồn tại dù nghiệp vụ chính rollback |
| `NESTED` | Tạo savepoint trong transaction hiện có | Rollback một phần; chỉ một số transaction manager hỗ trợ |
| `SUPPORTS` | Có thì tham gia, không có thì chạy không transaction | Hiếm dùng |
| `MANDATORY` | Bắt buộc đã có transaction, không thì ném exception | Bảo vệ method chỉ được gọi bên trong transaction |
| `NOT_SUPPORTED` / `NEVER` | Chạy ngoài transaction / cấm có transaction | Tác vụ dài không cần transaction |

`REQUIRES_NEW` cần **connection thứ hai** trong khi connection đầu vẫn bị giữ. Dưới tải cao, nếu mọi thread đều giữ một connection và chờ connection thứ hai, pool có thể cạn và hệ thống treo. Dùng nó có chủ đích, không làm mặc định.

### Isolation

| Mức isolation | Dirty read | Non-repeatable read | Phantom read |
|---|---|---|---|
| `READ_UNCOMMITTED` | Có thể | Có thể | Có thể |
| `READ_COMMITTED` | Không | Có thể | Có thể |
| `REPEATABLE_READ` | Không | Không | Có thể (theo chuẩn SQL) |
| `SERIALIZABLE` | Không | Không | Không |

Bảng trên theo chuẩn SQL; mỗi database hiện thực khác nhau. PostgreSQL mặc định `READ_COMMITTED`, MySQL InnoDB mặc định `REPEATABLE_READ`. Isolation càng cao thì càng ít bất thường nhưng càng nhiều lock hoặc lỗi serialization phải retry. Thực tế, đa số hệ thống giữ mặc định của database và giải quyết xung đột cụ thể bằng optimistic locking (`@Version`) hoặc khoá bi quan (`@Lock(LockModeType.PESSIMISTIC_WRITE)`, sinh `SELECT … FOR UPDATE`).

### Rollback rule

Mặc định Spring rollback khi gặp `RuntimeException` hoặc `Error`, và **commit** khi gặp checked exception. Tuỳ chỉnh bằng `rollbackFor` và `noRollbackFor`.

```java
@Service
public class PaymentService {

    private final PaymentRepository payments;
    private final PaymentGateway gateway;
    private final AuditService audit;
    // constructor…

    @Transactional(rollbackFor = PaymentDeclinedException.class)   // checked nhưng vẫn rollback
    public void pay(Long orderId, Money amount) throws PaymentDeclinedException {
        audit.record("PAYMENT_ATTEMPT", orderId);       // REQUIRES_NEW: commit riêng
        payments.save(Payment.pending(orderId, amount));
        gateway.charge(orderId, amount);                // có thể ném PaymentDeclinedException
    }
}

@Service
public class AuditService {

    private final AuditRepository repo;
    // constructor…

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void record(String action, Long orderId) {
        repo.save(new AuditEntry(action, orderId, Instant.now()));
    }
}
```

Một bẫy kinh điển: service A (`REQUIRED`) gọi service B (`REQUIRED`), B ném `RuntimeException` và **đánh dấu transaction chung là rollback-only**. A bắt exception rồi tiếp tục như không có gì. Khi A kết thúc, Spring cố commit nhưng transaction đã bị đánh dấu, nên ném `UnexpectedRollbackException`. Nếu muốn lỗi của B không ảnh hưởng A, B phải chạy trong transaction riêng (`REQUIRES_NEW`) hoặc không ném exception ra khỏi ranh giới transaction.

Nguyên tắc chung: đặt `@Transactional` ở tầng service, giữ transaction **ngắn**, không gọi HTTP hay chờ message bên trong transaction (giữ connection và lock trong lúc chờ mạng), và dùng `readOnly = true` cho method chỉ đọc.

## Migration schema với Flyway hoặc Liquibase

`spring.jpa.hibernate.ddl-auto=update` tiện khi học nhưng nguy hiểm trên production: không có review, không có lịch sử, không đổi tên hay xoá cột an toàn. Trên môi trường thật, schema phải được quản lý bằng **migration có version**, commit cùng code và chạy tự động khi deploy. Hibernate chỉ nên ở chế độ `validate` (kiểm tra mapping khớp schema) hoặc `none`.

```yaml
spring:
  jpa:
    open-in-view: false
    hibernate:
      ddl-auto: validate
    properties:
      hibernate:
        default_batch_fetch_size: 50
        jdbc:
          batch_size: 50
  flyway:
    locations: classpath:db/migration
```

**Flyway** dùng file SQL đặt tên theo quy ước `V<version>__<mô_tả>.sql` trong `src/main/resources/db/migration`. Spring Boot chạy Flyway lúc khởi động, trước khi JPA khởi tạo. Flyway ghi lịch sử vào bảng `flyway_schema_history` kèm checksum của từng file. Từ Flyway 10, hỗ trợ PostgreSQL nằm trong module riêng `flyway-database-postgresql`.

```sql
-- V1__create_orders.sql
CREATE SEQUENCE order_seq START WITH 1 INCREMENT BY 50;
CREATE SEQUENCE order_line_seq START WITH 1 INCREMENT BY 50;  -- sequence mặc định Hibernate 6 dùng cho OrderLine

CREATE TABLE orders (
    id           BIGINT PRIMARY KEY,
    customer_id  VARCHAR(64) NOT NULL,
    status       VARCHAR(20) NOT NULL,
    version      BIGINT      NOT NULL DEFAULT 0
);

CREATE TABLE order_line (
    id        BIGINT PRIMARY KEY,
    order_id  BIGINT      NOT NULL REFERENCES orders (id),
    sku       VARCHAR(64) NOT NULL,
    quantity  INT         NOT NULL CHECK (quantity > 0)
);

CREATE INDEX idx_order_line_order_id ON order_line (order_id);
```

**Liquibase** mô tả thay đổi bằng *changelog* (YAML, XML, JSON hoặc SQL) gồm các *changeSet* định danh bằng `id` + `author`. Lịch sử nằm ở bảng `DATABASECHANGELOG`.

| Tiêu chí | Flyway | Liquibase |
|---|---|---|
| Cách viết | SQL thuần (chủ yếu) | Changelog trừu tượng hoặc SQL |
| Đa database | Viết SQL riêng nếu cần | Changeset trừu tượng sinh SQL theo từng database |
| Rollback | Viết migration mới để sửa | Hỗ trợ khai báo rollback cho changeSet |
| Độ phức tạp | Thấp, dễ học | Cao hơn, nhiều tính năng (context, label, precondition) |

Quy tắc bắt buộc với cả hai: **không sửa migration đã chạy** trên môi trường chung. Flyway sẽ phát hiện checksum lệch và từ chối khởi động; muốn sửa, hãy viết migration mới. Với hệ thống cần **zero-downtime**, áp dụng mẫu *expand/contract*: thêm cột mới (nullable) → deploy code ghi cả hai cột → backfill dữ liệu → chuyển đọc sang cột mới → ở bản phát hành sau mới xoá cột cũ. Mỗi bước tương thích với cả phiên bản code cũ lẫn mới đang chạy song song khi rolling update.

## Lỗi thường gặp

- **Để `@ManyToOne` EAGER mặc định.** Mỗi lần tải dòng hàng lại kéo theo đơn hàng, khách hàng… Đặt `fetch = FetchType.LAZY` cho mọi quan hệ và tải theo use case.
- **Sửa `LazyInitializationException` bằng cách bật EAGER hoặc giữ Open Session in View.** Hãy dùng fetch join, `@EntityGraph` hoặc projection trong service.
- **Serialize entity ra JSON.** Gây lazy loading ngoài ý muốn và vòng lặp vô hạn ở quan hệ hai chiều. Trả DTO.
- **Dùng `ddl-auto=update` trên production.** Chuyển sang Flyway/Liquibase với `ddl-auto=validate`.
- **Sửa file migration đã áp dụng.** Viết migration mới.
- **Gọi API bên ngoài trong transaction.** Transaction giữ connection và lock trong lúc chờ mạng. Gọi API ngoài trước hoặc sau transaction, hoặc dùng outbox pattern.
- **Bắt exception trong transaction rồi mong commit bình thường** sau khi một method `REQUIRED` bên trong đã ném exception – dẫn tới `UnexpectedRollbackException`.
- **Dùng `@Data` của Lombok hoặc `equals/hashCode` theo mọi field cho entity.** `hashCode` thay đổi sau khi persist và `toString` có thể kích hoạt lazy loading. Dựa `equals` trên id (xử lý trường hợp id null) hoặc khoá tự nhiên.

## Bài tập thực hành

1. **Săn N+1:** Tạo 50 đơn hàng, mỗi đơn 3 dòng. Viết endpoint trả danh sách đơn kèm số dòng, bật `generate_statistics` và đếm số câu SQL. Lần lượt sửa bằng `join fetch`, `@EntityGraph`, `default_batch_fetch_size` và projection DTO; ghi lại số query và thời gian của từng cách. Thử thêm phân trang với fetch join và quan sát cảnh báo trong log.
2. **Thí nghiệm transaction:** Viết `PaymentService.pay` gọi `AuditService.record`. Cho `gateway.charge` ném exception và kiểm tra trong database: bản ghi audit còn không khi `record` dùng `REQUIRED` và khi dùng `REQUIRES_NEW`? Sau đó tái hiện `UnexpectedRollbackException` bằng cách bắt exception trong service ngoài.
3. **Migration an toàn:** Viết `V1`, `V2` bằng Flyway cho bảng `orders`. Sau đó đổi tên cột `customer_id` thành `buyer_id` theo mẫu expand/contract qua ba migration, đảm bảo ở mỗi bước phiên bản code trước đó vẫn chạy được.

## Tóm tắt

- Đặt mọi quan hệ về LAZY; cập nhật cả hai phía của quan hệ hai chiều; phía có khoá ngoại là phía sở hữu.
- N+1 phát hiện bằng log SQL và thống kê, xử lý bằng fetch join, `@EntityGraph`, batch fetching hoặc projection – cẩn thận khi kết hợp fetch join collection với phân trang.
- Persistence context là first-level cache theo transaction; dirty checking tự sinh UPDATE nên không cần `save()` với entity đang quản lý.
- Second-level cache chỉ đáng dùng cho dữ liệu đọc nhiều, ghi ít và cần chiến lược nhất quán khi chạy nhiều instance.
- `REQUIRED` là mặc định; `REQUIRES_NEW` cho tác vụ phải commit độc lập nhưng tốn thêm connection; rollback mặc định chỉ với unchecked exception.
- Schema được quản lý bằng migration có version (Flyway/Liquibase), không sửa migration cũ, và dùng expand/contract cho zero-downtime.
