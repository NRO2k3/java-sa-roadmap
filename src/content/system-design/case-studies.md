Biết từng khối xây dựng (cache, queue, load balancer, sharding) mới là một nửa; nửa còn lại là ghép chúng thành một thiết kế hoàn chỉnh dưới ràng buộc thật và giải thích được vì sao chọn thế này mà không chọn thế khác. Cách học hiệu quả nhất là đi qua nhiều case study: đọc kiến trúc tham chiếu của nhà cung cấp cloud, đọc engineering blog của các công ty lớn, và tự tay thiết kế các bài toán kinh điển. Bài này cung cấp khung 4 bước dùng cho cả phỏng vấn lẫn công việc thật, cách đọc tài liệu kiến trúc có phương pháp, và ba case study chi tiết: URL shortener, news feed và checkout thương mại điện tử.

## Mục tiêu bài học

- Áp dụng khung 4 bước để trình bày một bài thiết kế hệ thống có cấu trúc trong khoảng 45 phút.
- Đọc kiến trúc tham chiếu từ AWS/Azure Architecture Center và chuyển chúng thành building block dùng được với Java/Spring.
- Rút ra bài học từ engineering blog mà không sao chép mù quáng giải pháp ở quy mô khác.
- Thiết kế đầu-cuối URL shortener, news feed và checkout: yêu cầu, ước lượng, thành phần, mô hình dữ liệu, điểm nghẽn và trade-off.

## Khung 4 bước cho bài thiết kế hệ thống

Khung này được phổ biến rộng rãi trong tài liệu luyện phỏng vấn system design, và cũng chính là cách một SA dẫn dắt buổi thảo luận kiến trúc thật.

1. **Làm rõ yêu cầu và phạm vi.** Hỏi về chức năng chính (và những gì *không* làm), người dùng là ai, quy mô (DAU, tỉ lệ đọc/ghi, tăng trưởng), yêu cầu phi chức năng (độ trễ, availability, nhất quán), ràng buộc (ngân sách, công nghệ sẵn có, quy định dữ liệu). Ghi lại các giả định lên bảng.
2. **Đề xuất thiết kế tổng thể và thống nhất.** Ước lượng nhanh tải và dung lượng, phác API chính, vẽ các thành phần và luồng dữ liệu. Hỏi người nghe có đồng ý với hướng đi trước khi đào sâu.
3. **Đi sâu (deep dive).** Chọn 2 đến 3 phần khó nhất hoặc rủi ro nhất: mô hình dữ liệu, cách scale điểm nóng, cách đảm bảo nhất quán, xử lý lỗi. Đưa ra các phương án và trade-off.
4. **Tổng kết.** Nhắc lại điểm nghẽn còn lại, các tình huống lỗi và cách hệ thống phản ứng, cần giám sát những chỉ số nào, thiết kế thay đổi ra sao khi quy mô tăng gấp 10.

Với buổi 45 phút, phân bổ gợi ý là khoảng 5 đến 10 phút cho bước 1, 10 đến 15 phút cho bước 2, phần lớn thời gian còn lại cho bước 3 và vài phút cuối cho bước 4. Hãy nói to suy nghĩ của mình: người đánh giá chấm cách bạn suy luận và cân nhắc đánh đổi, không chấm việc bạn nhớ tên bao nhiêu công nghệ.

## Đọc kiến trúc tham chiếu từ AWS và Azure

AWS Architecture Center và Azure Architecture Center chứa các kiến trúc tham chiếu (reference architecture), sơ đồ mẫu và hướng dẫn thực hành tốt nhất, gắn với khung Well-Architected của từng hãng. AWS Well-Architected có sáu trụ cột: operational excellence, security, reliability, performance efficiency, cost optimization và sustainability. Azure Well-Architected có năm trụ cột: reliability, security, cost optimization, operational excellence và performance efficiency.

Đừng đọc chúng như một danh sách dịch vụ cần mua. Hãy đọc theo checklist sau:

1. **Bối cảnh và giả định:** kiến trúc giải bài toán gì, quy mô nào, ràng buộc gì.
2. **Quy về building block chung:** mỗi dịch vụ managed tương ứng với khối nào (hàng đợi, kho key-value, object storage...), để có thể chuyển sang nền tảng khác.
3. **Luồng dữ liệu và nơi giữ state:** request đi qua đâu, dữ liệu được ghi ở đâu, đâu là nguồn sự thật.
4. **Tình huống lỗi:** mất một zone, một dịch vụ chậm, một message bị xử lý hai lần thì sao.
5. **Thuộc tính chất lượng được tối ưu** và thứ bị đánh đổi.
6. **Yếu tố chi phí chính** và cách nó tăng theo tải.
7. **Điều chỉnh cho bối cảnh của bạn:** kỹ năng của đội, yêu cầu lưu trữ dữ liệu trong nước, hạ tầng on-premise.

| Building block | AWS | Azure | Lựa chọn tự vận hành / Java |
|---|---|---|---|
| Hàng đợi message | SQS | Service Bus queue | RabbitMQ, Spring AMQP |
| Event streaming | Kinesis, MSK | Event Hubs | Kafka, Spring Kafka |
| Kho key-value | DynamoDB | Cosmos DB | Cassandra, Redis |
| Object storage | S3 | Blob Storage | MinIO |
| Chạy container | ECS, EKS | Container Apps, AKS | Kubernetes |
| Hàm serverless | Lambda | Functions | Spring Cloud Function |

## Đọc engineering blog có phương pháp

Blog kỹ thuật của các công ty như Netflix, Uber, Grab, Shopee là nguồn học rất tốt vì kể lại bài toán thật cùng ràng buộc thật. Vài ví dụ đã trở thành kiến thức chung: Netflix phổ biến chaos engineering với Chaos Monkey và từng tạo ra Hystrix (nay ở chế độ bảo trì, chính dự án khuyến nghị chuyển sang các thư viện như Resilience4j); Uber công bố mã nguồn mở H3, hệ thống chỉ mục không gian địa lý dạng lưới lục giác dùng cho các bài toán như ghép tài xế. Grab và Shopee chia sẻ nhiều bài toán ở quy mô Đông Nam Á như thanh toán, gọi xe, khuyến mãi lớn.

Khi đọc, hãy tự trả lời các câu hỏi sau và ghi chú lại:

```text
Bài viết: ...
1. Vấn đề: họ gặp vấn đề gì, dấu hiệu nào cho thấy vấn đề?
2. Ràng buộc và quy mô: tải, dữ liệu, đội ngũ, hệ thống cũ.
3. Các phương án đã cân nhắc và lý do loại bỏ.
4. Giải pháp: building block nào, ghép thế nào.
5. Kết quả họ công bố và cách họ đo.
6. Cái giá phải trả: độ phức tạp, chi phí, thứ bị hy sinh.
7. Áp dụng cho hệ thống của tôi: phần nào dùng được, phần nào không vì khác quy mô?
```

Câu hỏi số 7 quan trọng nhất. Giải pháp cho hàng trăm triệu người dùng thường là quá mức cần thiết cho hệ thống vài trăm nghìn người dùng; bài học đáng giá là *cách suy luận*, không phải sơ đồ.

## Case study 1: URL shortener

### Yêu cầu

- **Chức năng:** tạo mã ngắn từ một URL dài (tuỳ chọn alias tự đặt và thời hạn), truy cập mã ngắn thì chuyển hướng sang URL gốc, thống kê lượt nhấn.
- **Phi chức năng:** chuyển hướng rất nhanh (p99 dưới 50ms phía server), availability cao cho luồng chuyển hướng, mã ngắn khó đoán tuần tự, không cần nhất quán mạnh cho thống kê.

### Ước lượng

```text
Giả định: 100 triệu URL mới mỗi tháng, tỉ lệ đọc/ghi 100:1, lưu 5 năm, mỗi bản ghi ~500 byte
Ghi:  100.000.000 / 2,6 triệu giây ≈ 40 URL/giây (đỉnh ~100)
Đọc:  40 × 100 ≈ 4.000 lượt chuyển hướng/giây (đỉnh ~10.000)
Lưu:  100 triệu × 12 × 5 = 6 tỉ bản ghi × 500 B ≈ 3 TB
Độ dài mã base62: 62^6 ≈ 5,7 × 10^10; 62^7 ≈ 3,5 × 10^12 -> chọn 7 ký tự để dư địa và thưa
Cache: giả sử 20% URL tạo ra phần lớn lượt đọc -> 20 triệu × 500 B ≈ 10 GB, vừa một cụm Redis nhỏ
```

### Thiết kế tổng thể

```text
 Tạo:   Client --POST /api/urls--> [Gateway: rate limit] --> [URL Service] --> [DB: short_url]
                                                                 ^
                                                    lấy dải ID từ [ID allocator]

 Chuyển hướng:
        Client --GET /aB3dE9x--> [CDN/LB] --> [Redirect Service]
                                                 | 1. cache cục bộ (Caffeine)
                                                 | 2. Redis
                                                 | 3. DB, rồi ghi ngược vào cache
                                                 +--> 302 Location: <URL gốc>
                                                 +--> event "UrlClicked" -> Kafka -> kho phân tích
```

### Mô hình dữ liệu

Truy cập chủ yếu theo một khoá (`code`), nên kho key-value hoặc PostgreSQL phân mảnh theo `code` đều phù hợp. 3 TB trong 5 năm vẫn quản lý được với vài shard.

```sql
CREATE TABLE short_url (
    code        VARCHAR(10)  PRIMARY KEY,
    long_url    TEXT         NOT NULL,
    owner_id    BIGINT,
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT now(),
    expires_at  TIMESTAMPTZ
);
CREATE INDEX idx_short_url_owner ON short_url (owner_id, created_at DESC);
```

### Sinh mã ngắn

| Cách | Ưu điểm | Nhược điểm |
|---|---|---|
| Băm URL (SHA-256) rồi lấy 7 ký tự base62 | Không cần bộ đếm | Va chạm, phải kiểm tra và băm lại; cùng URL luôn ra cùng mã |
| Bộ đếm duy nhất + base62 | Không va chạm | Cần bộ đếm phân tán; mã tuần tự dễ bị dò nếu không xáo trộn |
| Chuỗi ngẫu nhiên + ràng buộc unique | Đơn giản, khó đoán | Phải thử lại khi trùng; với 6 tỉ mã trên 3,5 × 10^12 khả năng, xác suất trùng mỗi lần khoảng 0,17% |

Một lựa chọn cân bằng: mỗi instance lấy một **dải ID** (ví dụ 10.000 số) từ database sequence hoặc Redis `INCRBY`, sinh mã trong bộ nhớ, xáo trộn số bằng một phép song ánh có thể đảo ngược (để mã không tuần tự), rồi mã hoá base62.

```java
final class Base62 {

    private static final char[] ALPHABET =
            "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz".toCharArray();

    static String encode(long value, int length) {
        char[] out = new char[length];
        for (int i = length - 1; i >= 0; i--) {
            out[i] = ALPHABET[(int) (value % 62)];
            value /= 62;
        }
        if (value != 0) throw new IllegalArgumentException("Giá trị vượt quá " + length + " ký tự");
        return new String(out);
    }
}

@RestController
class RedirectController {

    private final ShortUrlResolver resolver;      // Caffeine -> Redis -> DB

    RedirectController(ShortUrlResolver resolver) {
        this.resolver = resolver;
    }

    @GetMapping("/{code:[0-9A-Za-z]{7}}")
    ResponseEntity<Void> redirect(@PathVariable String code) {
        return resolver.resolve(code)
                .map(url -> ResponseEntity.status(HttpStatus.FOUND)    // 302
                        .location(URI.create(url))
                        .<Void>build())
                .orElseGet(() -> ResponseEntity.notFound().build());
    }
}
```

### Điểm nghẽn và trade-off

- **301 hay 302:** 301 (chuyển hướng vĩnh viễn) cho phép trình duyệt cache, giảm tải nhưng mất thống kê từ những lần nhấn sau; 302 khiến mọi lượt nhấn đi qua server nên thống kê đầy đủ.
- **Khoá nóng:** một link lan truyền mạnh có thể nhận hàng chục nghìn lượt mỗi giây; cache cục bộ trong từng instance trước Redis giúp hấp thụ.
- **Thống kê:** ghi bất đồng bộ qua Kafka, không bao giờ để luồng chuyển hướng chờ ghi thống kê.
- **Lạm dụng:** rate limit việc tạo URL theo user/IP, kiểm tra URL độc hại trước khi chấp nhận, cho phép báo cáo và vô hiệu hoá mã.
- **Hết hạn:** dùng TTL của kho key-value hoặc job dọn dẹp định kỳ; kiểm tra `expires_at` khi chuyển hướng.

## Case study 2: News feed

### Yêu cầu

- **Chức năng:** đăng bài (chữ, ảnh), theo dõi người khác, xem home feed gồm bài của những người mình theo dõi, mới nhất trước, phân trang cuộn vô hạn.
- **Phi chức năng:** tải feed p99 dưới 500ms; bài mới xuất hiện với follower trong vài giây (eventual consistency chấp nhận được); đọc nhiều hơn ghi rất nhiều.

### Ước lượng

```text
Giả định: 50 triệu DAU, mỗi người mở feed 10 lần/ngày, trung bình 0,2 bài/người/ngày, 200 follower/người
Đọc feed: 500 triệu/ngày ≈ 5.800/giây, đỉnh (×3) ≈ 17.000/giây
Đăng bài: 10 triệu/ngày ≈ 116/giây
Fan-out:  10 triệu bài × 200 follower = 2 tỉ lượt ghi vào feed/ngày ≈ 23.000/giây
Cache feed: 50 triệu user × 500 mục × ~16 byte ≈ 400 GB dữ liệu thô (bộ nhớ thực tế của Redis cao hơn)
  -> chỉ cache cho user hoạt động, cắt mỗi feed còn vài trăm mục, dựng lại khi cần
```

### Fan-out khi ghi hay khi đọc

- **Fan-out on write (push):** khi một người đăng bài, ghi ID bài vào feed đã tính sẵn của từng follower. Đọc rất nhanh, nhưng khuếch đại ghi; tài khoản có hàng triệu follower tạo ra hàng triệu lượt ghi cho mỗi bài, và lãng phí cho follower không còn hoạt động.
- **Fan-out on read (pull):** khi đọc feed mới đi lấy bài gần đây của tất cả người mình theo dõi rồi gộp lại. Ghi rẻ, nhưng đọc đắt và chậm khi theo dõi nhiều người.
- **Hybrid:** push cho tài khoản thường, pull cho tài khoản có số follower vượt một ngưỡng (celebrity); feed service gộp hai nguồn khi đọc. Bỏ qua fan-out cho user lâu không hoạt động và dựng lại feed khi họ quay lại.

```text
 Đăng bài:
   Client -> Gateway -> Post Service -> Post DB
                              | outbox -> Kafka "post-created" (key = authorId)
                              v
                        Fan-out Workers --(lấy follower theo lô)--> Follow DB
                              | ZADD feed:{followerId}  (bỏ qua nếu tác giả là celebrity)
                              v
                        Redis feed cache

 Đọc feed:
   Client -> Feed Service: (1) ZREVRANGEBYSCORE feed:{userId} theo cursor
                           (2) gộp bài mới của các celebrity đang theo dõi (pull)
                           (3) hydrate: lấy nội dung bài, tác giả theo lô từ cache/DB
                           (4) lọc bài đã xoá, bị chặn -> trả trang + cursor tiếp theo
   Ảnh: client upload thẳng lên object storage bằng presigned URL, phục vụ qua CDN
```

### Mô hình dữ liệu

```sql
CREATE TABLE post (
    post_id     BIGINT       PRIMARY KEY,      -- Snowflake: tăng dần theo thời gian
    author_id   BIGINT       NOT NULL,
    content     TEXT,
    media_keys  TEXT[],
    created_at  TIMESTAMPTZ  NOT NULL
);
CREATE INDEX idx_post_author ON post (author_id, post_id DESC);

CREATE TABLE follow (
    follower_id BIGINT NOT NULL,
    followee_id BIGINT NOT NULL,
    created_at  TIMESTAMPTZ NOT NULL,
    PRIMARY KEY (follower_id, followee_id)
);
CREATE INDEX idx_follow_followee ON follow (followee_id, follower_id);
```

Feed cache là một Redis sorted set `feed:{userId}`: member là `post_id`, score là thời điểm đăng tính bằng mili-giây. Không dùng Snowflake ID làm score vì score của Redis là số thực double, chỉ biểu diễn chính xác số nguyên tới 2^53. Phân trang bằng **cursor** (score của mục cuối trang trước) thay vì offset, để không bị trùng hoặc sót khi có bài mới chen vào.

### Góc nhìn Java/Spring: fan-out worker

```java
@Component
class FanOutWorker {

    private static final int FEED_SIZE = 500;
    private final FollowerQueries followers;
    private final StringRedisTemplate redis;

    FanOutWorker(FollowerQueries followers, StringRedisTemplate redis) {
        this.followers = followers;
        this.redis = redis;
    }

    @KafkaListener(topics = "post-created", groupId = "feed-fanout")
    void onPostCreated(PostCreated event) {
        if (event.authorIsCelebrity()) {
            return;                                    // follower sẽ tự kéo bài khi đọc feed
        }
        String postId = Long.toString(event.postId());
        double score = event.createdAt().toEpochMilli();
        followers.forEachActiveFollowerBatch(event.authorId(), 1_000, batch ->
                redis.executePipelined((RedisCallback<Object>) connection -> {
                    StringRedisConnection conn = (StringRedisConnection) connection;
                    for (long followerId : batch) {
                        String key = "feed:" + followerId;
                        conn.zAdd(key, score, postId);
                        conn.zRemRange(key, 0, -(FEED_SIZE + 1));   // chỉ giữ 500 mục mới nhất
                    }
                    return null;
                }));
    }
}
```

Pipeline gom nhiều lệnh Redis vào một lượt round trip mạng. Worker idempotent tự nhiên vì `ZADD` cùng member chỉ cập nhật score, nên xử lý lại một event không sinh bản trùng.

### Điểm nghẽn và trade-off

- **Celebrity:** giải bằng hybrid push/pull như trên; ngưỡng chọn theo đo đạc thực tế.
- **Độ trễ fan-out:** giám sát consumer lag của Kafka, scale số worker theo lag; dùng key là `authorId` để bài của cùng tác giả giữ thứ tự.
- **Bộ nhớ cache:** cắt độ dài feed, chỉ cache user hoạt động, dựng lại feed từ Post DB khi cache miss.
- **Nhất quán:** bài đã xoá vẫn còn ID trong feed của follower, nên bước hydrate phải lọc lại; không cố xoá khỏi hàng triệu feed.
- **Xếp hạng:** bản đầu dùng thứ tự thời gian; xếp hạng theo mức độ liên quan là bước sau, thường cần thêm dịch vụ tính điểm riêng.

## Case study 3: Checkout thương mại điện tử

### Yêu cầu

- **Chức năng:** từ giỏ hàng tạo đơn, giữ hàng trong kho, thanh toán qua cổng thanh toán bên ngoài (PSP), xác nhận đơn, cho phép xem trạng thái; chịu được các đợt flash sale.
- **Phi chức năng:** **đúng đắn đặt trên tốc độ**: không bán vượt tồn kho, không trừ tiền hai lần, không mất đơn đã thanh toán. Luồng đặt hàng có availability cao; độ trễ một đến hai giây là chấp nhận được.

### Ước lượng

```text
Giả định: 1 triệu đơn/ngày ≈ 12 đơn/giây trung bình
Flash sale: giả định đỉnh gấp 100 lần ≈ 1.200 đơn/giây, dồn vào một số ít SKU
Lưu trữ: ~2 KB/đơn (kèm dòng hàng) ≈ 2 GB/ngày ≈ 730 GB/năm
Điểm nóng: hàng nghìn lượt cập nhật mỗi giây vào cùng một dòng tồn kho -> tranh chấp khoá
```

### Thiết kế tổng thể: saga có điều phối

```text
 Client --POST /api/orders (header Idempotency-Key)--> Order Service
   1. Lưu order PENDING + bản ghi outbox "OrderCreated" trong cùng một transaction
   2. Orchestrator điều phối các bước:
        -> Inventory Service: giữ hàng (thời hạn 15 phút)    lỗi -> order REJECTED
        -> Payment Service: tạo giao dịch tại PSP           lỗi -> nhả hàng, order FAILED
   3. Trả 202 Accepted + orderId; client chuyển sang trang thanh toán của PSP và theo dõi trạng thái
   4. PSP gọi webhook "thanh toán thành công" -> Payment Service xác minh chữ ký, cập nhật payment
        -> order CONFIRMED -> chốt phần hàng đã giữ -> Notification gửi email
   5. Hết thời hạn giữ hàng mà chưa thanh toán -> nhả hàng, order EXPIRED
   Hằng ngày: job đối soát (reconciliation) so khớp giao dịch của PSP với bảng payment
```

### Mô hình dữ liệu

```sql
CREATE TABLE orders (
    id               UUID         PRIMARY KEY,
    customer_id      BIGINT       NOT NULL,
    status           VARCHAR(20)  NOT NULL,   -- PENDING, CONFIRMED, FAILED, EXPIRED
    total_amount     BIGINT       NOT NULL,   -- đơn vị nhỏ nhất của tiền tệ, không dùng float
    currency         CHAR(3)      NOT NULL,
    idempotency_key  VARCHAR(64)  NOT NULL,
    version          BIGINT       NOT NULL,
    created_at       TIMESTAMPTZ  NOT NULL,
    UNIQUE (customer_id, idempotency_key)
);

CREATE TABLE inventory (
    sku        VARCHAR(40) PRIMARY KEY,
    available  INT NOT NULL CHECK (available >= 0),
    reserved   INT NOT NULL CHECK (reserved >= 0)
);

CREATE TABLE payment (
    id             UUID         PRIMARY KEY,
    order_id       UUID         NOT NULL REFERENCES orders (id),
    psp_reference  VARCHAR(64)  UNIQUE,      -- mã giao dịch phía PSP, chống xử lý webhook trùng
    status         VARCHAR(20)  NOT NULL,    -- INITIATED, SUCCEEDED, FAILED, REFUNDED
    amount         BIGINT       NOT NULL
);

-- Giữ hàng nguyên tử: 1 dòng bị ảnh hưởng = thành công, 0 dòng = không đủ hàng
UPDATE inventory
SET available = available - :qty, reserved = reserved + :qty
WHERE sku = :sku AND available >= :qty;
```

### Góc nhìn Java/Spring: đặt hàng idempotent

```java
@Service
class PlaceOrderService {

    private final OrderRepository orders;
    private final OutboxRepository outbox;

    PlaceOrderService(OrderRepository orders, OutboxRepository outbox) {
        this.orders = orders;
        this.outbox = outbox;
    }

    @Transactional
    public OrderResult placeOrder(long customerId, String idempotencyKey, Cart cart) {
        var existing = orders.findByCustomerIdAndIdempotencyKey(customerId, idempotencyKey);
        if (existing.isPresent()) {
            return OrderResult.from(existing.get());   // client gửi lại do timeout: trả kết quả cũ
        }
        Order order = Order.pending(customerId, idempotencyKey, cart);
        orders.save(order);
        outbox.save(OutboxEvent.of("OrderCreated", order.getId(), order.toEventPayload()));
        return OrderResult.from(order);                // controller trả 202 Accepted
    }
}
```

Hai request trùng khoá có thể đến cùng lúc và cùng không thấy bản ghi cũ; ràng buộc `UNIQUE (customer_id, idempotency_key)` sẽ chặn một trong hai, phía controller bắt `DataIntegrityViolationException` rồi đọc lại đơn đã tạo. Event trong outbox được đẩy lên Kafka bởi một relay hoặc CDC (Debezium). Orchestrator có thể là một state machine trong Order Service, hoặc một workflow engine như Temporal hay Camunda khi luồng dài và nhiều nhánh. Lời gọi sang PSP được bọc bằng timeout, circuit breaker của Resilience4j và gửi kèm idempotency key của chính PSP.

### Flash sale và thanh toán

- **Dòng tồn kho nóng:** câu `UPDATE` có điều kiện đúng nhưng mọi request xếp hàng chờ khoá của cùng một dòng. Các hướng giảm tải: chia tồn kho của SKU thành nhiều dòng con và chọn ngẫu nhiên một dòng; hoặc nạp tồn kho vào Redis, trừ nguyên tử bằng Lua script, ghi xuống database bất đồng bộ và đối soát sau. Kèm theo: hàng đợi chờ (waiting room) ở gateway, giới hạn số lượng mỗi khách, đánh dấu "hết hàng" ở tầng cache để chặn sớm.
- **Thanh toán:** không bao giờ tin vào việc client được chuyển về trang "thành công"; chỉ tin webhook đã xác minh chữ ký hoặc kết quả truy vấn trực tiếp PSP. Khi gọi PSP bị timeout, trạng thái là "chưa biết", phải hỏi lại PSP hoặc chờ đối soát, không tự coi là thất bại rồi cho khách thanh toán lại. Dữ liệu thẻ đi thẳng tới trang hoặc form do PSP cung cấp để hệ thống của bạn không lưu số thẻ, thu hẹp phạm vi tuân thủ PCI DSS. Hoàn tiền là một bản ghi mới, không sửa đè giao dịch cũ.

### Trade-off chính

| Quyết định | Phương án A | Phương án B |
|---|---|---|
| Phản hồi khi đặt hàng | Đồng bộ chờ thanh toán xong: đơn giản cho client, dễ timeout | 202 + theo dõi trạng thái: chịu tải tốt, client phức tạp hơn |
| Thời hạn giữ hàng | Ngắn: ít hàng bị "chiếm" bởi người bỏ dở | Dài: khách thanh toán chậm vẫn kịp |
| Nguồn sự thật tồn kho lúc flash sale | Database: nhất quán mạnh, giới hạn throughput | Redis: throughput cao, cần đối soát và chịu rủi ro lệch |
| Phối hợp các bước | Orchestration: dễ theo dõi, xử lý bù trừ rõ ràng | Choreography: ít coupling, khó thấy toàn cảnh |

## Lỗi thường gặp

- **Nhảy vào chọn công nghệ trước khi hỏi yêu cầu** ("dùng Kafka và Cassandra"). Cách sửa: luôn bắt đầu bằng bước 1, ghi giả định lên bảng.
- **Ước lượng xong không dùng.** Con số chỉ có ý nghĩa khi dẫn tới quyết định: cần cache không, cần sharding không. Cách sửa: sau mỗi phép tính, nói rõ kết luận thiết kế rút ra.
- **Sao chép kiến trúc của công ty lớn** cho bài toán nhỏ hơn hàng trăm lần. Cách sửa: dùng câu hỏi "áp dụng cho hệ thống của tôi" khi đọc blog; chọn thiết kế đơn giản nhất đáp ứng NFR.
- **Chỉ đưa một phương án**, không nói trade-off. Cách sửa: với mỗi quyết định lớn, nêu ít nhất hai lựa chọn và lý do chọn.
- **Bỏ qua tình huống lỗi**: PSP timeout, consumer lag, mất một zone. Cách sửa: dành thời gian ở bước 4 cho failure mode và giám sát.
- **Dùng `double` cho tiền và thiếu idempotency** trong luồng thanh toán. Cách sửa: dùng đơn vị nhỏ nhất kiểu `long` hoặc `BigDecimal`, idempotency key ở mọi bước có thể bị gọi lại.
- **Đọc kiến trúc tham chiếu như danh sách dịch vụ.** Cách sửa: quy về building block và hiểu vì sao mỗi khối có mặt.

## Bài tập thực hành

1. **Phân tích kiến trúc tham chiếu:** chọn một kiến trúc từ AWS hoặc Azure Architecture Center (ví dụ ứng dụng web nhiều zone hoặc xử lý sự kiện không đồng bộ). Điền checklist 7 điểm, lập bảng quy đổi building block, và đề xuất phiên bản tương đương chạy Spring Boot trên Kubernetes kèm một ADR ngắn.
2. **Câu lạc bộ đọc blog:** chọn hai bài từ engineering blog của Netflix, Uber, Grab hoặc Shopee, ghi chú theo mẫu 7 câu hỏi và trình bày 10 phút cho team, tập trung vào câu "áp dụng cho hệ thống của chúng ta thế nào".
3. **Phỏng vấn thử và cài đặt:** cặp đôi luân phiên đóng vai người phỏng vấn, mỗi buổi 45 phút theo khung 4 bước với đề "hệ thống chat 1–1 và nhóm" hoặc "đặt vé xem phim". Sau đó cài đặt bản tối giản của URL shortener bằng Spring Boot, PostgreSQL, Redis và đo p99 của luồng chuyển hướng bằng k6.

## Tóm tắt

- Khung 4 bước: làm rõ yêu cầu, thiết kế tổng thể và thống nhất, đi sâu vào phần khó, tổng kết điểm nghẽn và tình huống lỗi.
- Đọc kiến trúc tham chiếu bằng cách quy dịch vụ về building block, tìm luồng dữ liệu, tình huống lỗi và thuộc tính được tối ưu.
- Đọc engineering blog để học cách suy luận; luôn hỏi giải pháp có phù hợp quy mô của mình không.
- URL shortener: hệ thống đọc nhiều, then chốt là sinh mã không va chạm, cache nhiều tầng, 301/302 và thống kê bất đồng bộ.
- News feed: lựa chọn giữa fan-out khi ghi và khi đọc, hybrid cho celebrity, phân trang bằng cursor và lọc lại khi hydrate.
- Checkout: đúng đắn trước tiên với idempotency key, cập nhật tồn kho nguyên tử, saga, outbox, webhook có xác minh và đối soát.
- Mọi quyết định thiết kế đều phải đi kèm phương án thay thế và trade-off rõ ràng.
