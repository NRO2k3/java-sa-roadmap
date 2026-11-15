Trong kiến trúc hướng sự kiện (Event-Driven Architecture, EDA), các service giao tiếp với nhau bằng cách phát ra **sự kiện** về những gì đã xảy ra, thay vì gọi trực tiếp và chờ nhau. Cách làm này giúp hệ thống tách rời, dễ mở rộng và chịu lỗi tốt hơn, nhưng cũng đặt ra những bài toán khó: không còn transaction ACID xuyên service, dữ liệu nhất quán sau cùng, và hợp đồng event phải tiến hoá mà không làm vỡ consumer. Đây chính là nội dung của milestone giai đoạn này: tách Order và Payment, giao tiếp qua Kafka, dùng Transactional Outbox và Saga để giữ nhất quán.

## Mục tiêu bài học

- Phân biệt event notification, event-carried state transfer và event sourcing; chọn đúng kiểu cho từng tình huống.
- Áp dụng CQRS để tách mô hình ghi và mô hình đọc, hiểu cái giá của nó.
- Triển khai Saga theo choreography và orchestration, thiết kế compensating transaction.
- Triển khai Transactional Outbox để tránh dual-write khi vừa ghi database vừa phát event.
- Quản lý schema event bằng Avro và Schema Registry, nắm các quy tắc tương thích khi versioning.

## Event, command và query

- **Event** là một sự thật đã xảy ra, đặt tên ở thì quá khứ: `OrderPlaced`, `PaymentFailed`. Event bất biến; bên phát không biết và không quan tâm ai sẽ nghe.
- **Command** là yêu cầu làm một việc: `ChargePayment`, `ReserveStock`. Command có một người nhận xác định và có thể bị từ chối.
- **Query** là yêu cầu đọc dữ liệu, không thay đổi trạng thái.

Nhầm lẫn phổ biến là đặt tên event như command (`SendEmailEvent`), khiến bên phát thực chất đang ra lệnh cho bên nhận, tạo ra coupling ngầm.

## Ba cách dùng event

### Event notification

Event chỉ mang thông tin tối thiểu, như "đơn `ORD-1` vừa được đặt" kèm id. Bên nhận nếu cần chi tiết sẽ **gọi ngược** service nguồn. Ưu điểm: event nhỏ, hợp đồng đơn giản, bên phát ít phải lộ dữ liệu. Nhược điểm: các lời gọi ngược tạo lại coupling lúc runtime và tải cho service nguồn; luồng xử lý trải trên nhiều service nên khó theo dõi tổng thể.

### Event-carried state transfer

Event mang **đủ dữ liệu** mà bên nhận cần: đơn hàng kèm khách, dòng hàng, tổng tiền. Bên nhận lưu bản sao cục bộ và không cần gọi lại. Ưu điểm: bên nhận vẫn chạy khi bên phát chết, độ trễ thấp. Nhược điểm: dữ liệu bị nhân bản ở nhiều nơi, nhất quán sau cùng, event lớn hơn và hợp đồng event trở thành hợp đồng dữ liệu cần quản lý chặt.

### Event sourcing

Thay vì lưu **trạng thái hiện tại**, ta lưu **chuỗi event** đã xảy ra với một thực thể; trạng thái hiện tại được tính bằng cách áp lần lượt các event. Event store chỉ cho phép ghi nối tiếp.

```java
public sealed interface AccountEvent permits AccountOpened, MoneyDeposited, MoneyWithdrawn {}
public record AccountOpened(String accountId, String owner) implements AccountEvent {}
public record MoneyDeposited(String accountId, long amount) implements AccountEvent {}
public record MoneyWithdrawn(String accountId, long amount) implements AccountEvent {}

public final class Account {

    private String id;
    private long balance;
    private final List<AccountEvent> pending = new ArrayList<>();

    public static Account rehydrate(List<AccountEvent> history) {
        Account account = new Account();
        history.forEach(account::apply);     // trạng thái = gộp (fold) toàn bộ event
        return account;
    }

    public void withdraw(long amount) {
        if (amount > balance) throw new IllegalStateException("Số dư không đủ");
        raise(new MoneyWithdrawn(id, amount)); // kiểm tra bất biến trước, rồi mới sinh event
    }

    private void raise(AccountEvent event) {
        apply(event);
        pending.add(event);                    // sẽ được append vào event store
    }

    private void apply(AccountEvent event) {
        switch (event) {                       // switch đầy đủ nhờ sealed interface (Java 21)
            case AccountOpened e -> { id = e.accountId(); balance = 0; }
            case MoneyDeposited e -> balance += e.amount();
            case MoneyWithdrawn e -> balance -= e.amount();
        }
    }

    public List<AccountEvent> pendingEvents() { return List.copyOf(pending); }
}
```

```sql
CREATE TABLE event_store (
    stream_id   VARCHAR(100) NOT NULL,   -- ví dụ 'account-123'
    version     INT          NOT NULL,   -- thứ tự event trong stream
    event_type  VARCHAR(100) NOT NULL,
    payload     JSONB        NOT NULL,
    occurred_at TIMESTAMPTZ  NOT NULL DEFAULT now(),
    PRIMARY KEY (stream_id, version)     -- hai lần ghi cùng version → một bên lỗi: optimistic concurrency
);
```

Event sourcing cho **lịch sử kiểm toán đầy đủ**, khả năng dựng lại trạng thái ở bất kỳ thời điểm nào và tạo mô hình đọc mới từ dữ liệu cũ. Đổi lại: truy vấn "tất cả tài khoản có số dư trên 10 triệu" không làm được trực tiếp trên event store mà cần projection; stream dài phải dùng **snapshot** để không phải phát lại hàng nghìn event; và event cũ tồn tại mãi nên schema phải tiến hoá rất cẩn thận. Chỉ dùng event sourcing cho những bounded context mà lịch sử thay đổi là giá trị nghiệp vụ thật (tài chính, kế toán, quy trình phê duyệt), không áp cho toàn hệ thống.

| Kiểu | Event chứa gì | Lợi ích chính | Cái giá |
|---|---|---|---|
| Event notification | Id và loại sự kiện | Hợp đồng nhỏ, coupling thấp | Gọi ngược, khó theo dõi luồng |
| Event-carried state transfer | Đủ dữ liệu cho bên nhận | Bên nhận tự chủ, độ trễ thấp | Dữ liệu nhân bản, event lớn |
| Event sourcing | Mọi thay đổi trạng thái | Lịch sử đầy đủ, dựng lại được | Phức tạp, cần projection và snapshot |

## CQRS

**CQRS (Command Query Responsibility Segregation)** tách **mô hình ghi** (nhận command, kiểm tra bất biến, thường chuẩn hoá) khỏi **mô hình đọc** (dữ liệu đã phi chuẩn hoá, tối ưu cho từng màn hình). Mô hình đọc được cập nhật từ event do phía ghi phát ra. Hai mô hình có thể cùng một database (bảng khác nhau) hoặc ở kho khác nhau, ví dụ ghi vào PostgreSQL, đọc từ Elasticsearch.

```java
@Component
public class OrderSummaryProjection {

    private final JdbcTemplate jdbc;

    public OrderSummaryProjection(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    @KafkaListener(topics = "orders.events", groupId = "order-summary-projection")
    public void on(OrderEvent event) {
        switch (event) {
            case OrderPlaced e -> jdbc.update("""
                    INSERT INTO order_summary (order_id, customer_name, status, total, version)
                    VALUES (?, ?, 'PLACED', ?, ?)
                    ON CONFLICT (order_id) DO NOTHING""",
                    e.orderId(), e.customerName(), e.total(), e.version());
            case OrderPaid e -> jdbc.update("""
                    UPDATE order_summary SET status = 'PAID', version = ?
                    WHERE order_id = ? AND version < ?""",   // bỏ qua event cũ hoặc trùng
                    e.version(), e.orderId(), e.version());
            case OrderCancelled e -> jdbc.update("""
                    UPDATE order_summary SET status = 'CANCELLED', version = ?
                    WHERE order_id = ? AND version < ?""",
                    e.version(), e.orderId(), e.version());
        }
    }
}
```

Điều kiện `version < ?` làm projection idempotent: event trùng hoặc đến muộn không ghi đè trạng thái mới hơn.

Nên dùng CQRS khi tải đọc và tải ghi chênh lệch lớn, khi màn hình cần dữ liệu tổng hợp từ nhiều aggregate, hoặc khi đã dùng event sourcing. Không nên dùng cho ứng dụng CRUD đơn giản: bạn trả giá bằng nhất quán sau cùng (người dùng vừa sửa xong có thể chưa thấy thay đổi) và thêm một hệ thống phải vận hành. Cách xử lý độ trễ phía giao diện: trả về version sau khi ghi để client chờ mô hình đọc bắt kịp, hoặc cập nhật giao diện lạc quan.

## Saga

Trong microservices, mỗi service sở hữu database riêng nên không có transaction ACID xuyên service. Two-phase commit (2PC) về lý thuyết giải quyết được nhưng khoá tài nguyên trong lúc chờ điều phối viên, giảm availability, và phần lớn message broker hiện đại không tham gia 2PC. **Saga** thay thế bằng một chuỗi **transaction cục bộ**: mỗi bước commit trong service của mình rồi phát event hoặc message kích hoạt bước tiếp theo. Nếu một bước thất bại, saga chạy các **compensating transaction** (transaction bù trừ) để đảo ngược về mặt nghiệp vụ các bước đã hoàn thành.

Compensation là **đảo ngược ngữ nghĩa**, không phải rollback: không thể "huỷ" một email đã gửi hay một khoản tiền đã trừ, mà phải gửi email xin lỗi hoặc tạo giao dịch hoàn tiền. Vì vậy hãy sắp xếp các bước: bước dễ bù trừ (giữ hàng) làm trước, bước khó hoặc không bù trừ được (gửi hàng, gửi thông báo) làm sau cùng.

Saga **thiếu tính isolation**: các service khác có thể thấy trạng thái trung gian (đơn đã tạo nhưng chưa thanh toán). Biện pháp phổ biến là **semantic lock**: đặt trạng thái `PENDING` để các thao tác khác biết bản ghi đang trong một saga và xử lý phù hợp.

### Choreography

Không có điều phối viên: mỗi service nghe event và tự quyết định bước tiếp theo.

```text
Order ──OrderPlaced──► Inventory ──StockReserved──► Payment ──PaymentCompleted──► Order (APPROVED)
                                                       │
                                                       └──PaymentFailed──► Inventory (trả hàng)
                                                                       └─► Order (REJECTED)
```

Phù hợp khi saga có ít bước và ít service. Khi số bước tăng, luồng nghiệp vụ nằm rải rác trong nhiều service, khó trả lời "saga này đang ở bước nào", và dễ hình thành phụ thuộc vòng giữa các service.

### Orchestration

Một **orchestrator** giữ trạng thái saga, gửi command cho từng service và quyết định bước tiếp theo dựa trên phản hồi.

```java
@Component
public class OrderSagaOrchestrator {

    private final SagaRepository sagas;
    private final CommandPublisher commands;   // nên ghi qua outbox, xem phần sau

    public OrderSagaOrchestrator(SagaRepository sagas, CommandPublisher commands) {
        this.sagas = sagas;
        this.commands = commands;
    }

    @Transactional
    public void onReply(SagaReply reply) {
        SagaState saga = sagas.get(reply.orderId());
        switch (reply) {
            case StockReserved r -> {
                saga.moveTo(SagaStep.CHARGING_PAYMENT);
                commands.send("payment.commands", new ChargePayment(r.orderId(), saga.amount()));
            }
            case StockRejected r -> {
                saga.moveTo(SagaStep.FAILED);
                commands.send("order.commands", new RejectOrder(r.orderId(), "Hết hàng"));
            }
            case PaymentCharged r -> {
                saga.moveTo(SagaStep.COMPLETED);
                commands.send("order.commands", new ApproveOrder(r.orderId()));
            }
            case PaymentFailed r -> {                         // bù trừ bước đã hoàn thành
                saga.moveTo(SagaStep.COMPENSATING);
                commands.send("inventory.commands", new ReleaseStock(r.orderId()));
                commands.send("order.commands", new RejectOrder(r.orderId(), "Thanh toán thất bại"));
            }
        }
        sagas.save(saga);
    }
}
```

Orchestration giúp luồng nghiệp vụ nằm một chỗ, dễ theo dõi, dễ thêm bước và xử lý timeout. Cái giá là thêm một thành phần phải thiết kế cẩn thận để không biến thành "god service" chứa logic của các service khác. Với quy trình dài hoặc phức tạp, các workflow engine như Temporal hay Camunda cung cấp sẵn lưu trạng thái, retry và timeout.

Dù chọn kiểu nào, mọi bước của saga phải **idempotent**, vì message có thể đến nhiều lần.

## Transactional Outbox

**Dual-write** là ghi vào hai hệ thống không cùng transaction: lưu đơn vào PostgreSQL rồi gửi event lên Kafka. Nếu commit thành công mà gửi Kafka lỗi, các service khác không bao giờ biết có đơn mới; nếu gửi Kafka trước rồi commit lỗi, các service khác xử lý một đơn không tồn tại. Gửi event trong `@TransactionalEventListener(phase = AFTER_COMMIT)` cũng không giải quyết được: ứng dụng có thể chết ngay sau commit, trước khi gửi.

**Transactional Outbox** giải quyết bằng cách ghi event vào một **bảng outbox** trong **cùng transaction** với dữ liệu nghiệp vụ. Một tiến trình khác (relay) đọc bảng outbox và đẩy lên broker.

```sql
CREATE TABLE outbox (
    id             UUID         PRIMARY KEY,
    aggregate_type VARCHAR(50)  NOT NULL,
    aggregate_id   VARCHAR(100) NOT NULL,   -- dùng làm message key để giữ thứ tự
    event_type     VARCHAR(100) NOT NULL,
    payload        JSONB        NOT NULL,
    created_at     TIMESTAMPTZ  NOT NULL DEFAULT now(),
    published_at   TIMESTAMPTZ
);
CREATE INDEX idx_outbox_unpublished ON outbox (created_at) WHERE published_at IS NULL;
```

```java
@Transactional
public Order placeOrder(PlaceOrderCommand cmd) {
    Order order = orderRepository.save(Order.from(cmd));
    outboxRepository.save(new OutboxEvent(UUID.randomUUID(), "Order", order.getId(), "OrderPlaced",
            toJson(new OrderPlaced(order.getId(), order.getCustomerId(), order.getTotal()))));
    return order;   // đơn và event cùng commit hoặc cùng rollback
}

// Relay dạng polling: chạy định kỳ, gửi lên Kafka rồi đánh dấu đã gửi
@Scheduled(fixedDelay = 500)
@Transactional
public void relay() throws Exception {
    List<OutboxRow> rows = jdbc.query("""
            SELECT id, aggregate_id, event_type, payload FROM outbox
            WHERE published_at IS NULL
            ORDER BY created_at
            LIMIT 100
            FOR UPDATE SKIP LOCKED""", OUTBOX_ROW_MAPPER);
    for (OutboxRow row : rows) {
        var record = new ProducerRecord<>("orders.events", row.aggregateId(), row.payload());
        record.headers().add("eventId", row.id().toString().getBytes(StandardCharsets.UTF_8));
        record.headers().add("eventType", row.eventType().getBytes(StandardCharsets.UTF_8));
        kafka.send(record).get(5, TimeUnit.SECONDS);   // chờ broker xác nhận trước khi đánh dấu
        jdbc.update("UPDATE outbox SET published_at = now() WHERE id = ?", row.id());
    }
}
```

Relay có thể gửi event rồi chết trước khi commit việc đánh dấu, nên khi chạy lại sẽ gửi lại: outbox đảm bảo **at-least-once**, consumer vẫn phải idempotent (thường dùng `eventId` trong header). `FOR UPDATE SKIP LOCKED` cho phép nhiều instance relay chạy song song mà không lấy trùng dòng, nhưng khi đó thứ tự giữa các event của cùng aggregate có thể bị đảo; nếu thứ tự quan trọng, chỉ chạy một relay hoạt động hoặc chia relay theo aggregate. Nhớ dọn các dòng đã gửi định kỳ.

Thay cho polling, có thể dùng **CDC**: Debezium đọc WAL của bảng outbox và dùng Outbox Event Router (`io.debezium.transforms.outbox.EventRouter`) để định tuyến event tới topic theo loại aggregate. Cách này độ trễ thấp và không tạo tải truy vấn liên tục lên database, đổi lại cần vận hành Kafka Connect.

## Quản lý schema event và versioning

Event là **hợp đồng công khai** giữa producer và mọi consumer, kể cả những consumer bạn không biết. Gửi JSON tự do không có schema nghĩa là chỉ phát hiện lỗi khi consumer đã vỡ trên production.

**Apache Avro** là định dạng nhị phân có schema (viết bằng JSON), gọn và hỗ trợ tiến hoá schema: dữ liệu ghi bằng schema của producer (writer schema) có thể được đọc bằng schema của consumer (reader schema) theo các quy tắc phân giải rõ ràng.

```json
{
  "type": "record",
  "name": "OrderPlaced",
  "namespace": "com.example.shop.events",
  "fields": [
    { "name": "eventId",     "type": "string" },
    { "name": "orderId",     "type": "string" },
    { "name": "customerId",  "type": "string" },
    { "name": "totalAmount", "type": "long" },
    { "name": "occurredAt",  "type": { "type": "long", "logicalType": "timestamp-millis" } },
    { "name": "channel",     "type": ["null", "string"], "default": null }
  ]
}
```

Field `channel` được thêm ở version 2 với giá trị mặc định, nên consumer dùng schema mới vẫn đọc được event cũ.

**Schema Registry** (ví dụ Confluent Schema Registry hoặc Apicurio Registry) lưu các version schema theo **subject**, mặc định là `<tên topic>-value`. Serializer gửi kèm **id của schema** trong mỗi message thay vì cả schema, deserializer dùng id đó để lấy schema tương ứng. Registry kiểm tra **tương thích** mỗi khi đăng ký version mới:

- **BACKWARD** (mặc định của Confluent): consumer dùng schema mới đọc được dữ liệu ghi bằng schema trước. Được thêm field có default, được xoá field. Nâng cấp **consumer trước**.
- **FORWARD**: consumer dùng schema cũ đọc được dữ liệu ghi bằng schema mới. Được thêm field, được xoá field có default. Nâng cấp **producer trước**.
- **FULL**: cả hai chiều; chỉ thêm hoặc xoá field có default.
- Các biến thể `*_TRANSITIVE` kiểm tra với **mọi** version trước đó chứ không chỉ version liền trước; nên dùng cho event sourcing, nơi event cũ tồn tại mãi.

```yaml
spring:
  kafka:
    producer:
      key-serializer: org.apache.kafka.common.serialization.StringSerializer
      value-serializer: io.confluent.kafka.serializers.KafkaAvroSerializer
    consumer:
      value-deserializer: io.confluent.kafka.serializers.KafkaAvroDeserializer
    properties:
      schema.registry.url: http://schema-registry:8081
      auto.register.schemas: false   # schema được đăng ký qua CI, không tự đăng ký lúc chạy
      use.latest.version: true
      specific.avro.reader: true     # deserialize thành class sinh từ schema
```

Với thay đổi không tương thích (đổi kiểu field, đổi ý nghĩa), đừng cố "lách": tạo event mới (`OrderPlacedV2`) hoặc topic mới, phát song song cả hai trong thời gian chuyển đổi rồi ngừng bản cũ. Với event sourcing, kỹ thuật **upcasting** chuyển event cũ sang dạng mới khi đọc lên.

## Lỗi thường gặp

- **Dual-write giữa database và broker**: dữ liệu lệch âm thầm khi một bên lỗi. Dùng Transactional Outbox hoặc CDC.
- **Consumer không idempotent**: outbox, broker và saga đều là at-least-once. Mọi handler phải chịu được message trùng.
- **Event quá "mỏng" khiến consumer gọi ngược liên tục**: service nguồn bị quá tải và coupling quay lại. Cân nhắc event-carried state transfer cho dữ liệu consumer thường cần.
- **Áp event sourcing cho toàn hệ thống**: độ phức tạp tăng vọt ở những chỗ CRUD là đủ. Chỉ dùng ở bounded context có giá trị lịch sử thật.
- **Compensation được thiết kế như rollback kỹ thuật**: xoá bản ghi thay vì tạo giao dịch hoàn tiền, mất dấu vết kiểm toán. Thiết kế compensation như một nghiệp vụ.
- **Saga choreography cho quy trình nhiều bước**: không ai trả lời được saga đang ở đâu. Chuyển sang orchestration khi luồng có nhiều nhánh.
- **Thay đổi schema event không kiểm tra tương thích**: consumer vỡ sau khi producer deploy. Đặt mức tương thích trong Schema Registry và kiểm tra trong CI.

## Bài tập thực hành

1. **Milestone Order và Payment**: tách hai service với database riêng. Order ghi đơn và `OrderPlaced` vào outbox trong cùng transaction, relay đẩy lên Kafka; Payment xử lý idempotent và phát `PaymentCompleted` hoặc `PaymentFailed`. Dùng Testcontainers để kiểm chứng: tắt Kafka giữa chừng, đơn vẫn được tạo và event được gửi sau khi Kafka chạy lại.
2. **Saga orchestration có bù trừ**: thêm Inventory vào luồng trên với orchestrator như ví dụ. Mô phỏng Payment thất bại và chứng minh hàng được trả lại, đơn chuyển `REJECTED`. Thêm timeout: nếu sau 30 giây chưa có phản hồi từ Payment, saga tự bù trừ.
3. **Tiến hoá schema**: đăng ký schema `OrderPlaced` vào Schema Registry ở mức BACKWARD. Thử thêm field có default, thêm field không có default, đổi kiểu `totalAmount` sang `string`; ghi lại thay đổi nào bị từ chối và giải thích bằng quy tắc tương thích.

## Tóm tắt

- Event là sự thật đã xảy ra, đặt tên thì quá khứ; command là yêu cầu có người nhận xác định.
- Event notification gọn nhưng gây gọi ngược; event-carried state transfer giúp consumer tự chủ; event sourcing lưu mọi thay đổi, mạnh nhưng phức tạp.
- CQRS tách mô hình ghi và đọc, cập nhật mô hình đọc bằng event với projection idempotent; chỉ dùng khi lợi ích vượt cái giá nhất quán sau cùng.
- Saga thay transaction phân tán bằng chuỗi transaction cục bộ và compensation ngữ nghĩa; choreography cho luồng ngắn, orchestration cho luồng phức tạp.
- Transactional Outbox ghi event cùng transaction với dữ liệu, relay hoặc CDC đẩy lên broker theo at-least-once.
- Avro cùng Schema Registry kiểm soát tiến hoá schema; hiểu BACKWARD, FORWARD, FULL để biết nâng cấp producer hay consumer trước.
