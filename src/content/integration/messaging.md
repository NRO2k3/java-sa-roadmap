Khi service Order gọi thẳng service Payment qua HTTP, hai service bị buộc chặt với nhau: Payment chậm thì Order chậm, Payment chết thì không ai đặt được hàng. Message broker chen vào giữa như một "hộp thư" bền vững: bên gửi đặt message vào rồi đi tiếp, bên nhận xử lý theo tốc độ của mình, kể cả khi vừa khởi động lại sau sự cố. Nhưng giao tiếp bất đồng bộ mang theo những câu hỏi mới: message có bị mất không, có bị xử lý hai lần không, thứ tự có được giữ không, message lỗi đi đâu. Bài này trả lời các câu hỏi đó với hai broker phổ biến nhất trong hệ Java: Apache Kafka và RabbitMQ.

## Mục tiêu bài học

- Giải thích kiến trúc Kafka: broker, topic, partition, offset, consumer group và replication.
- Giải thích mô hình RabbitMQ: exchange, queue, binding, routing key và các loại exchange.
- Phân biệt at-most-once, at-least-once, exactly-once và thiết kế consumer idempotent.
- Xử lý message lỗi bằng retry có backoff và dead-letter queue.
- Dùng Spring for Apache Kafka và Spring AMQP để gửi, nhận và xử lý lỗi message.

## Khi nào dùng message broker

Broker phù hợp khi bạn cần một hoặc nhiều điều sau:

- **Tách rời về thời gian**: bên nhận không cần sống cùng lúc với bên gửi.
- **San tải (load leveling)**: đợt cao điểm được đệm trong broker, bên nhận xử lý dần thay vì bị quá tải.
- **Fan-out**: một sự kiện "đơn đã tạo" cần đến Payment, Inventory, Notification mà bên gửi không cần biết có bao nhiêu bên nhận.

Không nên dùng broker khi người dùng cần kết quả **ngay lập tức** trong cùng request (ví dụ kiểm tra mã giảm giá), vì giao tiếp request-response qua broker phức tạp hơn nhiều so với một lời gọi HTTP hay gRPC.

Hai mô hình cần phân biệt: **queue** (message được giao cho một consumer và bị xoá sau khi xác nhận, như RabbitMQ) và **log** (message được ghi nối tiếp và giữ lại theo thời gian cấu hình, nhiều nhóm consumer đọc độc lập và có thể đọc lại, như Kafka).

## Kiến trúc Kafka

Một **cluster** Kafka gồm nhiều **broker**. Từ Kafka 4.0, cluster chỉ chạy ở chế độ **KRaft** (metadata được quản lý bằng giao thức consensus nội bộ), không còn cần ZooKeeper.

- **Topic**: một luồng message có tên, ví dụ `orders.created`.
- **Partition**: mỗi topic chia thành nhiều partition; mỗi partition là một **log chỉ ghi nối tiếp** (append-only), message trong một partition có thứ tự.
- **Offset**: vị trí tuần tự của message trong partition. Consumer ghi nhớ đã đọc tới offset nào.
- **Replication**: mỗi partition có một leader và các follower trên broker khác (replication factor). Tập replica đang theo kịp leader (tính cả leader) gọi là ISR (in-sync replicas).
- **Retention**: message được giữ theo thời gian hoặc dung lượng, bất kể đã được đọc hay chưa. Topic có thể cấu hình **log compaction** để chỉ giữ message mới nhất của mỗi key.

```text
Topic orders.created (3 partition)

  P0: [0][1][2][3][4][5]  ──►  consumer A ┐
  P1: [0][1][2][3]        ──►  consumer B ├─ consumer group "payment-service"
  P2: [0][1][2][3][4]     ──►  consumer C ┘

  Mỗi partition giao cho đúng MỘT consumer trong group.
  Group "notification-service" đọc cùng topic, có offset riêng, không ảnh hưởng group trên.
```

**Producer** chọn partition theo **key** của message: mặc định, key được băm (murmur2) rồi chia lấy dư cho số partition. Mọi message cùng key (ví dụ cùng `orderId`) vào cùng partition, nên giữ được thứ tự theo từng đơn hàng. Hệ quả quan trọng: **tăng số partition sẽ thay đổi ánh xạ key sang partition**, phá vỡ thứ tự của các key đang chạy; hãy chọn số partition đủ dư ngay từ đầu.

Độ bền khi ghi được điều khiển bằng `acks`: `acks=0` không chờ xác nhận, `acks=1` chờ leader ghi, `acks=all` chờ mọi replica trong ISR. Kết hợp `acks=all` với `min.insync.replicas=2` (cấu hình ở topic hoặc broker) và replication factor 3, một lần ghi được xác nhận chắc chắn nằm trên ít nhất hai broker. **Idempotent producer** (`enable.idempotence=true`, mặc định từ Kafka 3.0) giúp retry của producer không tạo message trùng trong partition.

**Consumer group** là cách Kafka chia tải: các partition được chia cho các consumer trong group, mỗi partition cho đúng một consumer. Vì vậy **số consumer hữu ích tối đa bằng số partition**; consumer thứ tư trong group đọc topic 3 partition sẽ ngồi chơi. Khi consumer tham gia hoặc rời group, Kafka **rebalance** (phân chia lại partition). Consumer **commit offset** (lưu vào topic nội bộ `__consumer_offsets`) để khi khởi động lại biết đọc tiếp từ đâu. **Consumer lag** (khoảng cách giữa offset mới nhất và offset đã commit) là chỉ số quan trọng nhất cần giám sát.

## Mô hình RabbitMQ

RabbitMQ hiện thực giao thức AMQP 0-9-1. Producer **không** gửi thẳng vào queue mà gửi vào một **exchange** kèm **routing key**; exchange dựa vào các **binding** để quyết định message đi tới queue nào; consumer đọc từ **queue**.

```text
 Producer ── routing key "order.created.vn" ──► [Exchange orders.events (topic)]
                                                   │ binding "order.created.#"  ──► [Queue payment.order-created]
                                                   │ binding "order.*.vn"       ──► [Queue notification.vn]
                                                   └ binding "order.cancelled"  ──► (không khớp)
```

Các loại exchange:

- **Direct**: chuyển tới queue có binding key **bằng đúng** routing key.
- **Topic**: so khớp theo mẫu với các từ ngăn cách bằng dấu chấm; `*` khớp đúng một từ, `#` khớp không hoặc nhiều từ.
- **Fanout**: bỏ qua routing key, gửi bản sao tới **mọi** queue được bind.
- **Headers**: định tuyến theo header của message thay vì routing key.

Consumer xác nhận bằng **ack**; message chỉ bị xoá khỏi queue sau khi được ack. Nếu consumer chết khi chưa ack, message được giao lại cho consumer khác. **Prefetch** giới hạn số message chưa ack mà một consumer giữ cùng lúc, giúp chia tải công bằng. Với dữ liệu quan trọng, dùng **quorum queue** (được replicate bằng thuật toán Raft) thay cho classic queue.

| Tiêu chí | Kafka | RabbitMQ |
|---|---|---|
| Mô hình | Log phân tán, giữ message theo retention | Queue, xoá message sau khi ack |
| Đọc lại dữ liệu cũ | Có, tua offset về trước | Không (trừ RabbitMQ Streams) |
| Thứ tự | Trong một partition | Trong một queue với một consumer |
| Định tuyến | Theo topic và key | Rất linh hoạt qua exchange và binding |
| Scale consumer | Theo số partition | Thêm consumer vào cùng queue |
| Phù hợp | Event streaming, nhiều nhóm đọc, lưu lượng lớn | Task queue, định tuyến phức tạp, request/reply |

## Ngữ nghĩa giao nhận

- **At-most-once**: message được giao **tối đa một lần**, có thể mất. Xảy ra khi consumer commit offset (hoặc ack) **trước** khi xử lý, rồi chết giữa chừng; hoặc producer gửi với `acks=0`. Chỉ chấp nhận được cho dữ liệu như metric, log không quan trọng.
- **At-least-once**: message **không mất** nhưng có thể được giao **nhiều lần**. Consumer xử lý xong mới commit; nếu chết sau khi xử lý mà chưa kịp commit, message sẽ được đọc lại. Đây là lựa chọn mặc định hợp lý cho hầu hết hệ thống.
- **Exactly-once**: mỗi message tác động **đúng một lần**. Kafka hỗ trợ exactly-once cho luồng **đọc từ Kafka, xử lý, ghi lại vào Kafka** nhờ transaction (`transactional.id`, consumer đặt `isolation.level=read_committed`), Kafka Streams bật bằng `processing.guarantee=exactly_once_v2`. Nhưng khi tác dụng phụ nằm **ngoài** Kafka (ghi database, gọi API thanh toán, gửi email), Kafka không thể tự đảm bảo exactly-once.

Vì vậy cách làm thực tế là **at-least-once cộng consumer idempotent**, thường gọi là "effectively once". Consumer idempotent là consumer xử lý cùng một message nhiều lần vẫn cho kết quả như một lần:

```sql
CREATE TABLE processed_messages (
    consumer_name VARCHAR(100) NOT NULL,
    message_id    VARCHAR(100) NOT NULL,
    processed_at  TIMESTAMPTZ  NOT NULL DEFAULT now(),
    PRIMARY KEY (consumer_name, message_id)
);
```

```java
@Service
public class PaymentHandler {

    private final JdbcTemplate jdbc;
    private final PaymentRepository payments;

    public PaymentHandler(JdbcTemplate jdbc, PaymentRepository payments) {
        this.jdbc = jdbc;
        this.payments = payments;
    }

    // Ghi đánh dấu và thao tác nghiệp vụ trong CÙNG một transaction
    @Transactional
    public void handle(OrderCreated event) {
        int inserted = jdbc.update("""
                INSERT INTO processed_messages (consumer_name, message_id)
                VALUES ('payment-service', ?)
                ON CONFLICT DO NOTHING""", event.eventId());
        if (inserted == 0) {
            return;   // đã xử lý rồi: bỏ qua bản trùng
        }
        payments.createCharge(event.orderId(), event.amount());
    }
}
```

Các cách khác để idempotent: dùng thao tác tự nhiên idempotent (upsert theo khoá, `UPDATE ... SET status = 'PAID' WHERE status = 'PENDING'`), hoặc truyền idempotency key xuống API thanh toán bên ngoài.

## Xử lý message lỗi: retry và dead-letter

Trước hết, phân loại lỗi:

- **Lỗi tạm thời** (transient): timeout, database tạm quá tải, service phụ thuộc đang restart. Retry sau một khoảng chờ thường thành công.
- **Lỗi vĩnh viễn** (permanent): dữ liệu sai định dạng, vi phạm quy tắc nghiệp vụ, message không deserialize được (gọi là **poison pill**). Retry bao nhiêu lần cũng thất bại, và nếu cứ retry mãi sẽ chặn toàn bộ partition phía sau.

Chiến lược chung: retry lỗi tạm thời với **exponential backoff** (chờ tăng dần), giới hạn số lần; khi hết lượt hoặc gặp lỗi vĩnh viễn, chuyển message sang **dead-letter queue (DLQ)** hay **dead-letter topic (DLT)** để xử lý sau, giám sát và có công cụ đẩy lại (redrive) khi đã sửa lỗi.

Với Kafka có hai kiểu retry:

- **Blocking retry**: consumer thử lại ngay trên partition hiện tại. Giữ nguyên thứ tự, nhưng trong lúc chờ, các message phía sau của partition đó bị chặn.
- **Non-blocking retry**: chuyển message lỗi sang các **retry topic** có độ trễ, partition chính tiếp tục chạy. Không chặn, nhưng **mất thứ tự** giữa message lỗi và các message sau nó.

Với RabbitMQ, cơ chế tương ứng là **dead-letter exchange (DLX)**: khai báo queue với tham số `x-dead-letter-exchange`; message bị reject với `requeue=false`, hết TTL, hoặc vượt giới hạn độ dài queue sẽ được chuyển tới exchange đó. Quorum queue còn hỗ trợ `delivery-limit` để chặn vòng lặp giao lại vô hạn.

## Spring for Apache Kafka

Cấu hình Spring Boot cho producer và consumer:

```yaml
spring:
  kafka:
    bootstrap-servers: kafka-1:9092,kafka-2:9092,kafka-3:9092
    producer:
      acks: all
      key-serializer: org.apache.kafka.common.serialization.StringSerializer
      value-serializer: org.springframework.kafka.support.serializer.JsonSerializer
    consumer:
      group-id: payment-service
      auto-offset-reset: earliest
      key-deserializer: org.apache.kafka.common.serialization.StringDeserializer
      # ErrorHandlingDeserializer bọc deserializer thật: poison pill không làm treo consumer
      value-deserializer: org.springframework.kafka.support.serializer.ErrorHandlingDeserializer
      properties:
        spring.deserializer.value.delegate.class: org.springframework.kafka.support.serializer.JsonDeserializer
        spring.json.trusted.packages: com.example.shop.events
```

Spring Kafka mặc định tắt auto commit của Kafka client và tự commit offset sau khi listener xử lý xong, tức là ngữ nghĩa at-least-once.

```java
public record OrderCreated(String eventId, String orderId, String customerId, long amount, Instant occurredAt) {}

@Service
public class OrderEventPublisher {

    private static final Logger log = LoggerFactory.getLogger(OrderEventPublisher.class);
    private final KafkaTemplate<String, OrderCreated> kafka;

    public OrderEventPublisher(KafkaTemplate<String, OrderCreated> kafka) {
        this.kafka = kafka;
    }

    public CompletableFuture<SendResult<String, OrderCreated>> publish(OrderCreated event) {
        // key = orderId: mọi event của cùng đơn vào cùng partition, giữ thứ tự
        return kafka.send("orders.created", event.orderId(), event)
                .whenComplete((result, ex) -> {
                    if (ex != null) log.error("Gửi event thất bại cho đơn {}", event.orderId(), ex);
                });
    }
}
```

Xử lý lỗi kiểu blocking với `DefaultErrorHandler` và `DeadLetterPublishingRecoverer`. Khi có một bean `CommonErrorHandler`, Spring Boot tự gắn nó vào listener container:

```java
@Configuration
public class KafkaErrorConfig {

    @Bean
    DefaultErrorHandler kafkaErrorHandler(KafkaTemplate<Object, Object> template) {
        // Hết lượt retry: gửi sang topic <tên topic gốc>.DLT, cùng số partition
        var recoverer = new DeadLetterPublishingRecoverer(template);
        var backOff = new ExponentialBackOffWithMaxRetries(3);
        backOff.setInitialInterval(1_000);
        backOff.setMultiplier(2.0);
        var handler = new DefaultErrorHandler(recoverer, backOff);
        // Lỗi nghiệp vụ vĩnh viễn: không retry, đẩy thẳng sang DLT
        handler.addNotRetryableExceptions(InvalidOrderException.class);
        return handler;
    }
}
```

`DefaultErrorHandler` đã mặc định coi `DeserializationException` và một số lỗi chuyển đổi là không retry. Vì recoverer mặc định gửi vào **cùng số partition** của message gốc, topic DLT phải có ít nhất bằng số partition của topic gốc.

Muốn retry không chặn partition, dùng `@RetryableTopic`; Spring Kafka tự tạo các retry topic và DLT (hậu tố mặc định `-retry` và `-dlt`):

```java
@Component
public class PaymentListener {

    private static final Logger log = LoggerFactory.getLogger(PaymentListener.class);
    private final PaymentHandler handler;

    public PaymentListener(PaymentHandler handler) {
        this.handler = handler;
    }

    @RetryableTopic(attempts = "4",
                    backoff = @Backoff(delay = 2_000, multiplier = 3.0),
                    exclude = InvalidOrderException.class)
    @KafkaListener(topics = "orders.created", groupId = "payment-service")
    public void onOrderCreated(OrderCreated event) {
        handler.handle(event);   // ném exception → message chuyển sang retry topic kế tiếp
    }

    @DltHandler
    public void onDeadLetter(OrderCreated event, @Header(KafkaHeaders.RECEIVED_TOPIC) String topic) {
        log.error("Đơn {} không xử lý được, đã vào {}", event.orderId(), topic);
    }
}
```

## Spring AMQP với RabbitMQ

Khai báo exchange, queue có dead-letter và binding bằng bean; Spring AMQP tự tạo chúng trên broker khi khởi động:

```java
@Configuration
public class RabbitConfig {

    public static final String EXCHANGE = "orders.events";
    public static final String QUEUE = "payment.order-created";
    public static final String DLX = "orders.dlx";

    @Bean TopicExchange ordersExchange() { return new TopicExchange(EXCHANGE); }

    @Bean DirectExchange deadLetterExchange() { return new DirectExchange(DLX); }

    @Bean Queue paymentQueue() {
        return QueueBuilder.durable(QUEUE)
                .quorum()
                .deadLetterExchange(DLX)
                .deadLetterRoutingKey(QUEUE + ".dlq")
                .build();
    }

    @Bean Queue paymentDlq() { return QueueBuilder.durable(QUEUE + ".dlq").quorum().build(); }

    @Bean Binding paymentBinding() {
        return BindingBuilder.bind(paymentQueue()).to(ordersExchange()).with("order.created.#");
    }

    @Bean Binding dlqBinding() {
        return BindingBuilder.bind(paymentDlq()).to(deadLetterExchange()).with(QUEUE + ".dlq");
    }

    @Bean MessageConverter jsonConverter() { return new Jackson2JsonMessageConverter(); }
}
```

Gửi và nhận:

```java
// Producer: gửi vào exchange kèm routing key
rabbitTemplate.convertAndSend(RabbitConfig.EXCHANGE, "order.created.vn", event);

@Component
public class PaymentRabbitListener {

    private final PaymentHandler handler;

    public PaymentRabbitListener(PaymentHandler handler) {
        this.handler = handler;
    }

    @RabbitListener(queues = RabbitConfig.QUEUE)
    public void onOrderCreated(OrderCreated event) {
        if (event.amount() <= 0) {
            // Lỗi vĩnh viễn: không requeue, broker chuyển message sang DLX
            throw new AmqpRejectAndDontRequeueException("Số tiền không hợp lệ: " + event.orderId());
        }
        handler.handle(event);
    }
}
```

Mặc định, khi listener ném exception, Spring AMQP **requeue** message, dễ tạo vòng lặp vô hạn với poison pill. Bật retry phía consumer và tắt requeue:

```yaml
spring:
  rabbitmq:
    listener:
      simple:
        prefetch: 20
        default-requeue-rejected: false
        retry:
          enabled: true
          max-attempts: 3
          initial-interval: 1s
          multiplier: 2.0
```

Khi hết lượt retry, recoverer mặc định reject message mà không requeue, và nhờ khai báo DLX ở trên, message đi vào `payment.order-created.dlq`. Lưu ý retry này chạy trong bộ nhớ của consumer, giữ message trong lúc chờ.

## Lỗi thường gặp

- **Không đặt key cho message Kafka**: các event của cùng một đơn rơi vào nhiều partition, thứ tự bị đảo. Dùng id của thực thể làm key.
- **Tăng số partition của topic đang chạy mà không tính hệ quả**: key bị ánh xạ sang partition mới, thứ tự theo key tạm thời bị phá. Dự trù số partition ngay từ đầu.
- **Scale consumer vượt số partition**: consumer dư không nhận partition nào. Tăng partition (cẩn thận như trên) hoặc tăng hiệu năng xử lý mỗi consumer.
- **Consumer không idempotent**: at-least-once nghĩa là chắc chắn sẽ có bản trùng, ví dụ khi rebalance. Dùng bảng đánh dấu, upsert hoặc idempotency key.
- **Retry vô hạn với poison pill**: partition hoặc queue bị kẹt mãi. Dùng `ErrorHandlingDeserializer`, giới hạn số lần retry, phân loại lỗi vĩnh viễn và có DLQ.
- **Có DLQ nhưng không ai xem**: message lỗi tích tụ âm thầm. Đặt cảnh báo khi DLQ có message và có quy trình redrive.
- **Xử lý quá lâu trong listener Kafka**: vượt `max.poll.interval.ms`, consumer bị coi là chết và rebalance liên tục. Giảm `max.poll.records` hoặc tách việc nặng ra.

## Bài tập thực hành

1. **Quan sát consumer group**: chạy Kafka bằng Docker, tạo topic 3 partition, chạy lần lượt 1, 3 và 4 instance consumer cùng group. Dùng `kafka-consumer-groups.sh --describe --group payment-service` để xem phân chia partition và lag; giải thích vì sao instance thứ tư không nhận message.
2. **Retry và DLT**: viết listener ném exception ngẫu nhiên 30% lần (lỗi tạm thời) và luôn lỗi với amount âm (lỗi vĩnh viễn). Cấu hình `DefaultErrorHandler` như bài, sau đó thử `@RetryableTopic`, so sánh thứ tự xử lý và độ trễ của các message khác trong cùng partition.
3. **RabbitMQ topic exchange**: dựng exchange `orders.events` với ba queue và các binding khác nhau như sơ đồ, gửi message với nhiều routing key và kiểm tra trên giao diện quản trị queue nào nhận được. Thêm DLX và chứng minh message bị reject đi vào DLQ.

## Tóm tắt

- Kafka là log phân tán: topic chia partition, thứ tự giữ trong partition, consumer group chia partition cho consumer, offset cho biết đã đọc tới đâu.
- RabbitMQ định tuyến qua exchange: direct, topic, fanout, headers; message bị xoá sau khi ack; dùng quorum queue cho dữ liệu quan trọng.
- At-least-once cộng consumer idempotent là lựa chọn thực tế; exactly-once của Kafka chỉ trọn vẹn trong luồng Kafka sang Kafka.
- Phân loại lỗi tạm thời và vĩnh viễn; retry có backoff và giới hạn; đưa message hết lượt vào DLQ hoặc DLT và giám sát chúng.
- Spring Kafka: `KafkaTemplate`, `@KafkaListener`, `DefaultErrorHandler`, `@RetryableTopic`; Spring AMQP: `RabbitTemplate`, `@RabbitListener`, `QueueBuilder` với dead-letter exchange.
