Khi một hệ thống tăng từ một nghìn lên một triệu người dùng, câu hỏi không còn là "viết code thế nào" mà là "ghép các khối hạ tầng thế nào": request đi vào qua đâu, phân phối tới máy nào, dữ liệu chia ra sao, làm sao để nhiều máy thống nhất ai là người ra quyết định. Bài này đi qua các khối xây dựng (building block) xuất hiện trong gần như mọi bài thiết kế hệ thống lớn: load balancer, reverse proxy, CDN, scale ngang, rate limiting, consistent hashing, leader election và consensus, ID phân tán và distributed lock. Với mỗi khối, bạn sẽ học nó giải quyết vấn đề gì, hoạt động thế nào và cái giá phải trả.

## Mục tiêu bài học

- Phân biệt load balancing L4 và L7, vai trò của reverse proxy và CDN, cách đặt header cache từ Spring Boot.
- Thiết kế service stateless để scale ngang, biết giới hạn của scale dọc.
- Hiểu và cài đặt các thuật toán rate limiting: fixed window, sliding window, token bucket, leaky bucket.
- Giải thích consistent hashing với virtual node, leader election và thuật toán đồng thuận Raft.
- Chọn chiến lược sinh ID phân tán và dùng distributed lock một cách an toàn.

## Scale dọc và scale ngang

- **Scale dọc (vertical scaling, scale up):** dùng máy mạnh hơn (thêm CPU, RAM). Không cần sửa code, nhưng có trần phần cứng, chi phí tăng nhanh ở cấu hình cao, vẫn là một điểm lỗi duy nhất và thường phải dừng máy để nâng cấp.
- **Scale ngang (horizontal scaling, scale out):** thêm nhiều máy cùng loại sau load balancer. Gần như không có trần với tầng ứng dụng và tăng được availability, nhưng đòi hỏi ứng dụng **stateless** và tầng dữ liệu phải có chiến lược riêng (replica đọc, sharding).

Cách làm phổ biến: tầng ứng dụng scale ngang từ đầu; tầng database scale dọc trước, sau đó thêm read replica, cache, và chỉ sharding khi thật sự cần.

### Stateless service

Một service **stateless** không giữ trạng thái riêng của client trong bộ nhớ hoặc ổ đĩa cục bộ giữa các request, nên bất kỳ instance nào cũng phục vụ được bất kỳ request nào. Trạng thái vẫn tồn tại, chỉ là được đưa ra ngoài:

| Loại trạng thái | Đưa đi đâu |
|---|---|
| Phiên đăng nhập (session) | Redis qua Spring Session, hoặc token tự chứa thông tin như JWT |
| File người dùng upload | Object storage (S3, Azure Blob, MinIO) |
| Cache | Cache cục bộ chấp nhận được nếu dữ liệu tái tạo được và có TTL; cần chia sẻ thì dùng Redis |
| Job định kỳ | Cơ chế chọn một instance chạy (ShedLock, leader election) |
| Công việc đang xử lý dở | Hàng đợi message, để instance khác nhận tiếp khi một instance chết |

Kèm theo đó: bật graceful shutdown (`server.shutdown=graceful`, mặc định từ Spring Boot 3.4) để instance hoàn tất request đang xử lý trước khi tắt, và có readiness probe để load balancer chỉ gửi traffic khi instance đã sẵn sàng.

> **Lưu ý:** Scale ngang tầng ứng dụng có thể làm sập database. Mười instance, mỗi instance có HikariCP pool 20 kết nối, là 200 kết nối tới database. Hãy tính tổng số kết nối khi đặt giới hạn autoscale, và cân nhắc connection pooler như PgBouncer.

## Load balancing L4 và L7

**Load balancer** phân phối request tới nhiều server phía sau, loại bỏ server không khoẻ qua health check, và là nền tảng của scale ngang.

| | L4 (tầng transport) | L7 (tầng application) |
|---|---|---|
| Dựa trên | IP, cổng TCP/UDP | Nội dung HTTP: path, host, header, cookie |
| Đơn vị cân bằng | Kết nối | Từng request |
| Khả năng | Chuyển tiếp gói tin rất nhanh, không đọc nội dung | Định tuyến theo nội dung, kết thúc TLS, retry, nén, sửa header |
| Ví dụ | AWS NLB, HAProxy chế độ TCP, IPVS, kube-proxy | Nginx, HAProxy chế độ HTTP, Envoy, AWS ALB, Spring Cloud Gateway |
| Lưu ý | Với kết nối dài (HTTP/2, gRPC) tải có thể dồn vào ít server | Tốn CPU hơn, nằm trên đường đi của mọi request |

Thuật toán phân phối phổ biến:

- **Round robin / weighted round robin:** lần lượt, có thể gán trọng số theo năng lực server.
- **Least connections:** gửi tới server đang có ít kết nối nhất, tốt khi thời gian xử lý chênh lệch nhiều.
- **Least response time / EWMA:** ưu tiên server phản hồi nhanh gần đây.
- **Hash theo IP hoặc khoá:** cùng client hoặc cùng khoá luôn tới cùng server, hữu ích cho cache cục bộ; nên dùng consistent hashing để ít bị xáo trộn khi thêm bớt server.
- **Power of two choices:** chọn ngẫu nhiên hai server và lấy server ít tải hơn; đơn giản mà hiệu quả khi có nhiều load balancer cùng hoạt động.

Health check có hai dạng: chủ động (load balancer định kỳ gọi `/actuator/health/readiness`) và thụ động (đánh dấu server lỗi khi thấy nhiều phản hồi lỗi, gọi là outlier detection). Bản thân load balancer cũng phải có dự phòng: dịch vụ managed của cloud, hoặc cặp máy dùng IP ảo. Ở quy mô nhiều region, cân bằng tải toàn cầu thường làm ở tầng DNS (định tuyến theo vị trí hoặc độ trễ) hoặc anycast.

**Sticky session** (giữ một client ở một server) giúp ứng dụng có state chạy được sau load balancer, nhưng làm tải lệch và mất phiên khi server chết. Hãy coi nó là giải pháp tạm, không phải thiết kế đích.

## Reverse proxy và CDN

**Reverse proxy** đứng trước server và đại diện cho server (ngược với forward proxy đại diện cho client). Nó thường đảm nhận: kết thúc TLS, nén, cache phản hồi, đệm request từ client mạng chậm để server không bị giữ kết nối, giới hạn tần suất, phục vụ file tĩnh và che giấu cấu trúc bên trong. Load balancer L7 và API gateway thực chất là các reverse proxy chuyên biệt.

**CDN** (Content Delivery Network) là mạng lưới máy chủ biên (edge) đặt gần người dùng ở nhiều vị trí địa lý. CDN cache nội dung tĩnh (JS, CSS, ảnh, video) và có thể cả phản hồi API công khai, giúp giảm độ trễ, giảm tải cho origin và hấp thụ một phần tấn công DDoS.

- **Pull CDN:** edge tự lấy từ origin khi chưa có trong cache (cache miss). Dễ dùng, phổ biến nhất.
- **Push CDN:** bạn chủ động đẩy nội dung lên CDN. Hợp với file lớn, ít thay đổi.
- **Kiểm soát cache bằng header:** `Cache-Control: public, max-age=...` cho nội dung dùng chung; `s-maxage` riêng cho cache dùng chung như CDN; `private` hoặc `no-store` cho dữ liệu cá nhân.
- **Đặt tên file theo phiên bản** (`app.3f9a1c.js`) để cache rất lâu mà không cần xoá cache (invalidate) khi deploy.

```java
@GetMapping("/api/products/{id}")
ResponseEntity<ProductView> product(@PathVariable long id) {
    ProductView view = catalog.find(id);
    return ResponseEntity.ok()
            .cacheControl(CacheControl.maxAge(Duration.ofMinutes(5)).cachePublic()) // CDN cache 5 phút
            .eTag(Long.toString(view.version()))      // client/CDN kiểm tra lại bằng If-None-Match
            .body(view);
}

@GetMapping("/api/me/orders")
ResponseEntity<List<OrderView>> myOrders(Principal user) {
    return ResponseEntity.ok()
            .cacheControl(CacheControl.noStore())    // dữ liệu cá nhân: không cache ở CDN
            .body(orders.findByUser(user.getName()));
}
```

Với tài nguyên tĩnh do Spring Boot phục vụ, `spring.web.resources.chain.strategy.content.enabled=true` thêm hash nội dung vào URL và `spring.web.resources.cache.cachecontrol.max-age=365d` đặt thời gian cache dài.

## Rate limiting

Rate limiting giới hạn số request trong một khoảng thời gian để bảo vệ hệ thống khỏi quá tải và lạm dụng, chia công bằng giữa các khách hàng (tenant), kiểm soát chi phí và tôn trọng hạn mức của đối tác. Có thể đặt ở nhiều tầng: biên (CDN, WAF), gateway (theo API key, theo user), trong service (theo tài nguyên đắt), và phía client (khi gọi đối tác).

| Thuật toán | Cách hoạt động | Ưu điểm | Nhược điểm |
|---|---|---|---|
| Fixed window | Đếm request trong từng khung cố định (ví dụ mỗi phút) | Đơn giản, ít bộ nhớ | Tại ranh giới hai khung có thể lọt gần gấp đôi giới hạn |
| Sliding window log | Lưu thời điểm từng request, đếm trong cửa sổ trượt | Chính xác | Tốn bộ nhớ theo số request |
| Sliding window counter | Ước lượng: đếm khung hiện tại + đếm khung trước × phần còn chồng lấn | Gần chính xác, ít bộ nhớ | Là xấp xỉ |
| Token bucket | Bucket chứa tối đa B token, nạp r token/giây, mỗi request tiêu 1 token | Cho phép burst tới B, tốc độ dài hạn là r | Phải chọn hai tham số |
| Leaky bucket | Request vào hàng đợi, được xử lý ra với tốc độ cố định | Đầu ra đều đặn | Thêm độ trễ, request bị bỏ khi hàng đợi đầy |

Ví dụ sliding window counter: giới hạn 100 request/phút, khung trước có 80 request, khung hiện tại đã có 30 request và đang ở giây thứ 15 (25% khung). Ước lượng = 30 + 80 × 75% = 90, vẫn dưới 100 nên cho qua.

Cài đặt token bucket trong bộ nhớ cho một instance:

```java
public final class TokenBucket {

    private final long capacity;            // số token tối đa, cũng là kích thước burst
    private final double refillPerNano;     // tốc độ nạp token
    private double tokens;
    private long lastRefill;

    public TokenBucket(long capacity, long refillPerSecond) {
        this.capacity = capacity;
        this.refillPerNano = refillPerSecond / 1_000_000_000.0;
        this.tokens = capacity;
        this.lastRefill = System.nanoTime();
    }

    public synchronized boolean tryConsume() {
        long now = System.nanoTime();
        tokens = Math.min(capacity, tokens + (now - lastRefill) * refillPerNano);
        lastRefill = now;
        if (tokens >= 1) {
            tokens -= 1;
            return true;
        }
        return false;                       // phía gọi trả HTTP 429 kèm Retry-After
    }
}
```

Khi chạy nhiều instance, bộ đếm phải dùng chung, thường đặt trong Redis và cập nhật nguyên tử bằng Lua script. Không cần tự viết: `RequestRateLimiter` của Spring Cloud Gateway dùng token bucket trên Redis, thư viện Bucket4j hỗ trợ nhiều backend phân tán. Khi từ chối, trả về **HTTP 429 Too Many Requests** kèm header `Retry-After` để client biết khi nào thử lại.

## Consistent hashing

Chia dữ liệu hoặc cache cho N node bằng `hash(key) mod N` có một vấn đề lớn: khi N đổi từ 4 thành 5, phần lớn khoá đổi node. Với cache, điều đó gây cache miss hàng loạt dồn xuống database; với storage, phải di chuyển gần như toàn bộ dữ liệu.

**Consistent hashing** đặt cả node lẫn khoá lên một vòng tròn băm (hash ring). Mỗi khoá thuộc về node đầu tiên gặp được khi đi theo chiều kim đồng hồ. Thêm một node chỉ lấy khoá từ đoạn ngay trước nó, nên trung bình chỉ khoảng K/N khoá phải di chuyển (K là tổng số khoá).

Nếu mỗi node chỉ có một vị trí trên vòng, phân bố sẽ rất lệch. **Virtual node** gán cho mỗi node vật lý nhiều vị trí (vài chục đến vài trăm), giúp tải đều hơn, và khi một node rời đi thì phần của nó được chia cho nhiều node khác thay vì dồn hết cho một node láng giềng. Node mạnh hơn có thể nhận nhiều virtual node hơn.

```java
public final class ConsistentHashRing<N> {      // không thread-safe, đủ để minh hoạ

    private final NavigableMap<Long, N> ring = new TreeMap<>();
    private final int virtualNodes;

    public ConsistentHashRing(Collection<N> nodes, int virtualNodes) {
        this.virtualNodes = virtualNodes;
        nodes.forEach(this::add);
    }

    public void add(N node) {
        for (int i = 0; i < virtualNodes; i++) ring.put(hash(node + "#" + i), node);
    }

    public void remove(N node) {
        for (int i = 0; i < virtualNodes; i++) ring.remove(hash(node + "#" + i));
    }

    public N nodeFor(String key) {
        if (ring.isEmpty()) throw new IllegalStateException("Vòng băm đang rỗng");
        Map.Entry<Long, N> entry = ring.ceilingEntry(hash(key));
        return (entry != null ? entry : ring.firstEntry()).getValue();   // quay vòng về đầu
    }

    private static long hash(String value) {
        try {
            byte[] d = MessageDigest.getInstance("SHA-256").digest(value.getBytes(StandardCharsets.UTF_8));
            return ByteBuffer.wrap(d).getLong();    // 64 bit đầu, phân bố đều hơn String.hashCode()
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException(e);
        }
    }
}
```

Ý tưởng này xuất hiện trong các database phân tán theo phong cách Dynamo như Cassandra, trong client cache phân mảnh, và trong thuật toán ring hash của Envoy. Redis Cluster dùng biến thể "hash slot": 16.384 slot cố định được gán cho các node, khi thêm node chỉ cần chuyển một số slot.

## Leader election và consensus (Raft)

Nhiều tác vụ cần **đúng một** người làm: job đối soát hằng đêm, một writer duy nhất cho một tài nguyên, node primary của database. Nhiều node phải **đồng thuận** (consensus) về ai là leader và về thứ tự các thay đổi, kể cả khi có node chết hoặc mạng bị chia cắt.

Nguyên tắc nền tảng là **quorum đa số**: cụm 2f+1 node chịu được f node lỗi. Cụm 3 node chịu được 1 node lỗi, cụm 5 node chịu được 2. Cụm 4 node cũng chỉ chịu được 1, nên số node thường là số lẻ.

**Raft** là thuật toán đồng thuận được thiết kế để dễ hiểu, dùng trong etcd (nền của Kubernetes), Consul và chế độ KRaft của Kafka. Các ý chính:

- Mỗi node ở một trong ba vai trò: **follower**, **candidate**, **leader**. Thời gian được chia thành các **term** đánh số tăng dần.
- Leader gửi heartbeat định kỳ. Follower không nhận được heartbeat trong một khoảng **election timeout ngẫu nhiên** sẽ thành candidate, tăng term, tự bỏ phiếu cho mình và xin phiếu các node khác. Nhận được đa số phiếu thì thành leader. Mỗi node chỉ bỏ một phiếu trong một term; timeout ngẫu nhiên giúp tránh nhiều node cùng ứng cử mãi.
- **Log replication:** mọi thao tác ghi đi qua leader, được thêm vào log rồi nhân bản sang follower. Khi đa số đã lưu, entry được **commit** và áp dụng vào state machine.
- **An toàn:** node chỉ bỏ phiếu cho candidate có log ít nhất mới bằng log của mình, nên leader mới luôn có đủ các entry đã commit. Leader cũ bị cô lập ở phía thiểu số không thể commit gì, nhờ đó tránh được split brain.

```text
             hết election timeout: tăng term, tự bỏ phiếu, xin phiếu
 Follower ---------------------------------------------> Candidate ---- đa số phiếu ----> Leader
    ^                                                       |                              |
    +---- thấy leader hợp lệ hoặc term cao hơn -------------+                              |
    +------------------------------- phát hiện term cao hơn -------------------------------+

 Ghi: Client -> Leader thêm vào log -> nhân bản tới follower -> đa số xác nhận
      -> commit -> áp dụng vào state machine -> trả lời client
```

Trong ứng dụng Java, **đừng tự cài Raft**. Hãy dựa vào hệ thống đã có: Lease của Kubernetes (Spring Cloud Kubernetes hỗ trợ leader election), Curator `LeaderLatch` trên ZooKeeper, `LockRegistryLeaderInitiator` của Spring Integration trên JDBC hoặc Redis. Với job `@Scheduled` chạy trên nhiều instance, thư viện ShedLock dùng một bảng hoặc khoá Redis để đảm bảo mỗi lần chạy chỉ một instance thực thi.

## Sinh ID phân tán

Yêu cầu thường gặp với ID: duy nhất toàn cục, sinh nhanh mà không cần phối hợp mỗi lần, có thể sắp xếp theo thời gian (tốt cho index B-tree và phân trang), gọn (64 bit vừa kiểu BIGINT) và khó đoán nếu lộ ra ngoài.

| Phương án | Ưu điểm | Nhược điểm |
|---|---|---|
| Auto-increment của DB | Đơn giản, có thứ tự | Phụ thuộc một DB, lộ quy mô kinh doanh, khó khi nhiều primary |
| Cấp phát theo đoạn (hi/lo, sequence với allocationSize) | Ít gọi DB, có thứ tự gần đúng | Vẫn phụ thuộc DB, có khoảng trống khi restart |
| UUID v4 | Không cần phối hợp, khó đoán | 128 bit, ngẫu nhiên nên chèn vào index B-tree bị phân mảnh |
| UUID v7 (RFC 9562) | 48 bit đầu là timestamp mili-giây nên tăng dần theo thời gian, phần còn lại ngẫu nhiên | 128 bit; JDK 21 chưa có sẵn (`UUID.randomUUID()` là v4), cần thư viện |
| Snowflake | 64 bit, tăng dần theo thời gian, sinh cục bộ rất nhanh | Phải cấp worker ID duy nhất, nhạy cảm với đồng hồ chạy lùi |

Snowflake (do Twitter công bố) chia 64 bit thành: 1 bit dấu, 41 bit timestamp mili-giây tính từ một mốc tự chọn (đủ khoảng 69 năm), 10 bit worker ID (1.024 worker) và 12 bit sequence (4.096 ID mỗi mili-giây cho mỗi worker):

```java
public final class SnowflakeIdGenerator {

    private static final long EPOCH = 1704067200000L;          // 2024-01-01T00:00:00Z
    private static final int WORKER_BITS = 10, SEQUENCE_BITS = 12;
    private static final long MAX_SEQUENCE = (1L << SEQUENCE_BITS) - 1;   // 4095

    private final long workerId;
    private long lastTimestamp = -1L;
    private long sequence;

    public SnowflakeIdGenerator(long workerId) {
        if (workerId < 0 || workerId >= (1L << WORKER_BITS)) {
            throw new IllegalArgumentException("workerId phải nằm trong [0, 1023]");
        }
        this.workerId = workerId;
    }

    public synchronized long nextId() {
        long now = System.currentTimeMillis();
        if (now < lastTimestamp) {
            throw new IllegalStateException("Đồng hồ hệ thống chạy lùi, từ chối sinh ID");
        }
        if (now == lastTimestamp) {
            sequence = (sequence + 1) & MAX_SEQUENCE;
            if (sequence == 0) {                    // hết 4.096 ID trong mili-giây này
                while ((now = System.currentTimeMillis()) <= lastTimestamp) Thread.onSpinWait();
            }
        } else {
            sequence = 0;
        }
        lastTimestamp = now;
        return ((now - EPOCH) << (WORKER_BITS + SEQUENCE_BITS)) | (workerId << SEQUENCE_BITS) | sequence;
    }
}
```

Worker ID có thể lấy từ số thứ tự pod của StatefulSet trên Kubernetes, hoặc đăng ký có thời hạn trong Redis hay database. Nếu ID hiển thị cho người dùng và không muốn lộ quy mô hay bị dò, hãy dùng thêm một mã công khai ngẫu nhiên tách khỏi khoá chính.

## Distributed lock

Distributed lock đảm bảo chỉ một tiến trình trong nhiều instance được làm một việc tại một thời điểm. Trước khi dùng, hãy hỏi liệu có cách đơn giản hơn không:

- Ràng buộc duy nhất (unique constraint) hoặc cập nhật có điều kiện: `UPDATE payout SET status = 'PROCESSING' WHERE id = ? AND status = 'PENDING'`, kiểm tra số dòng bị ảnh hưởng.
- Optimistic locking bằng `@Version`.
- **Single writer:** đưa mọi thao tác trên cùng một thực thể vào cùng một partition Kafka (cùng message key), để chỉ một consumer xử lý tuần tự.

Nếu vẫn cần lock, nó phải có: loại trừ lẫn nhau, **thời hạn (lease/TTL)** để không kẹt vĩnh viễn khi tiến trình giữ lock chết, và chỉ người giữ lock mới được mở. Với Redis, lệnh cơ bản là `SET lock:key <token-ngẫu-nhiên> NX PX 30000`, khi mở thì dùng Lua kiểm tra token rồi mới xoá. Thư viện Redisson đóng gói sẵn các bước này:

```java
RLock lock = redisson.getLock("lock:payout:" + merchantId);
if (lock.tryLock(2, 30, TimeUnit.SECONDS)) {   // chờ tối đa 2 giây, lock tự hết hạn sau 30 giây
    try {
        payoutService.process(merchantId);
    } finally {
        if (lock.isHeldByCurrentThread()) {
            lock.unlock();
        }
    }
} else {
    throw new PayoutInProgressException(merchantId);
}
```

Khi truyền `leaseTime` cố định như trên, nếu xử lý lâu hơn 30 giây thì lock hết hạn giữa chừng; nếu không truyền `leaseTime`, Redisson dùng cơ chế watchdog tự gia hạn trong lúc tiến trình còn sống.

**Vấn đề cốt lõi:** tiến trình giữ lock có thể bị dừng (GC pause dài, máy ảo bị treo, mạng chậm) quá thời hạn lease. Lock hết hạn, tiến trình khác lấy được lock, rồi tiến trình đầu tỉnh lại và vẫn tin mình đang giữ lock: hai bên cùng ghi. Giải pháp là **fencing token**: dịch vụ lock cấp một số tăng dần mỗi lần cấp lock, và tầng lưu trữ từ chối thao tác mang token cũ hơn token đã thấy. Hãy phân biệt hai mục đích:

- **Lock vì hiệu quả** (tránh làm trùng một việc tốn kém, thỉnh thoảng trùng cũng không sao): lock trên Redis là đủ.
- **Lock vì tính đúng đắn** (trùng là sai dữ liệu, mất tiền): dùng hệ thống dựa trên đồng thuận như etcd hoặc ZooKeeper kèm fencing token, hoặc lock ở chính database chứa dữ liệu (`SELECT ... FOR UPDATE`, advisory lock của PostgreSQL), và vẫn giữ ràng buộc ở tầng dữ liệu.

## Lỗi thường gặp

- **Scale ngang nhưng còn state cục bộ** (session trong bộ nhớ, file trên đĩa), người dùng bị đăng xuất khi request rơi vào instance khác. Cách sửa: đưa state ra Redis hoặc object storage; sticky session chỉ là giải pháp tạm.
- **Autoscale tầng ứng dụng làm cạn kết nối database.** Cách sửa: tính tổng số kết nối theo số instance tối đa, dùng connection pooler, giới hạn autoscale.
- **Dùng load balancer L4 cho gRPC hoặc HTTP/2 kết nối dài**, tải dồn vào vài server. Cách sửa: dùng L7 hoặc service mesh để cân bằng theo request.
- **Cache dữ liệu cá nhân trên CDN** vì quên header, gây lộ dữ liệu người này cho người khác. Cách sửa: mặc định `no-store` hoặc `private` cho API có xác thực, chỉ bật `public` có chủ đích.
- **Rate limit cục bộ trên từng instance nhưng tưởng là giới hạn toàn hệ thống.** Cách sửa: bộ đếm dùng chung trên Redis, hoặc chia giới hạn cho số instance và chấp nhận sai số.
- **Chia cache bằng `hash mod N`.** Mỗi lần thêm bớt node là một đợt cache miss hàng loạt. Cách sửa: consistent hashing có virtual node.
- **Dùng lock Redis cho thao tác mà trùng lặp là mất tiền, không có fencing token và không có ràng buộc ở database.** Cách sửa: lock trên hệ thống đồng thuận hoặc lock của database, kèm ràng buộc dữ liệu.
- **Trùng worker ID của Snowflake** do sao chép cấu hình giữa các instance. Cách sửa: cấp worker ID tự động và có kiểm tra trùng khi khởi động.

## Bài tập thực hành

1. **Stateless và load balancing:** chạy 3 instance một ứng dụng Spring Boot có đăng nhập sau Nginx (round robin). Quan sát việc mất phiên khi session nằm trong bộ nhớ, sau đó chuyển sang Spring Session với Redis. Đổi Nginx sang `least_conn` và so sánh p99 khi một endpoint có thời gian xử lý ngẫu nhiên 10ms đến 500ms.
2. **Rate limiter phân tán:** viết rate limiter cho endpoint tạo đơn, giới hạn 10 request/giây cho mỗi user, chạy trên 3 instance với bộ đếm trong Redis (Lua script hoặc Bucket4j). Dùng k6 chứng minh giới hạn đúng trên toàn hệ thống và phản hồi 429 có `Retry-After`.
3. **Thí nghiệm consistent hashing:** với 1 triệu khoá ngẫu nhiên và 5 node, đo độ lệch phân bố khi dùng 1, 10 và 200 virtual node. Thêm node thứ 6 và đếm số khoá phải di chuyển, so sánh với cách `hash mod N`.

## Tóm tắt

- Scale ngang tầng ứng dụng đòi hỏi service stateless; tầng dữ liệu cần chiến lược riêng và tổng số kết nối phải được tính trước.
- Load balancer L4 cân bằng theo kết nối, nhanh; L7 hiểu HTTP, định tuyến theo nội dung và cân bằng theo request.
- Reverse proxy kết thúc TLS, nén, cache, che giấu bên trong; CDN đưa nội dung tĩnh và phản hồi công khai tới gần người dùng, điều khiển bằng `Cache-Control`.
- Token bucket cho phép burst trong giới hạn tốc độ dài hạn; sliding window tránh lỗ hổng ở ranh giới của fixed window; hệ nhiều instance cần bộ đếm dùng chung và trả 429.
- Consistent hashing với virtual node chỉ di chuyển khoảng K/N khoá khi thay đổi số node.
- Raft dùng quorum đa số, term và election timeout ngẫu nhiên để bầu leader và nhân bản log; trong Java hãy dựa vào etcd, ZooKeeper, Kubernetes Lease thay vì tự cài.
- Snowflake và UUID v7 cho ID tăng dần theo thời gian; distributed lock cần TTL và, khi liên quan đến tính đúng đắn, cần fencing token hoặc lock của database.
