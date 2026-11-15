Cache là cách rẻ nhất để giảm độ trễ và giảm tải cho database: một lần đọc Redis thường chỉ mất dưới một mili-giây trong cùng mạng nội bộ, trong khi một query phức tạp có thể mất hàng chục mili-giây. Nhưng cache cũng là nguồn gốc của nhiều sự cố khó chịu nhất: dữ liệu cũ hiển thị cho khách, database sập vì hàng nghìn request cùng lúc bị cache miss, một node Redis quá tải vì một sản phẩm "hot". Bài này giúp bạn chọn đúng chiến lược cache, dùng Spring Cache với Redis và Caffeine, và thiết kế để tránh các sự cố kinh điển.

## Mục tiêu bài học

- Phân biệt và chọn đúng giữa cache-aside, read-through, write-through và write-behind.
- Dùng Spring Cache abstraction với Caffeine (cache cục bộ) và Redis (cache phân tán).
- Nhận diện và xử lý cache stampede, cache penetration và hot key.
- Thiết kế TTL và chiến lược invalidation phù hợp với mức độ chấp nhận dữ liệu cũ.

## Khi nào nên cache

Cache phát huy tác dụng khi dữ liệu **được đọc nhiều hơn ghi rất nhiều**, **tính toán hoặc truy xuất tốn kém**, và **chấp nhận được việc cũ đi một chút**. Catalog sản phẩm, cấu hình, kết quả tính toán nặng là ứng viên tốt. Số dư tài khoản, tồn kho khi thanh toán là ứng viên tồi, vì đọc giá trị cũ dẫn đến quyết định sai.

Có nhiều tầng cache: trình duyệt, CDN, cache cục bộ trong JVM (Caffeine) và cache phân tán (Redis). Cache cục bộ nhanh nhất (không qua mạng) nhưng mỗi instance có bản riêng, khó invalidate đồng bộ. Cache phân tán dùng chung cho mọi instance nhưng tốn một lượt mạng và là thêm một hệ thống phải vận hành.

Chỉ số cần theo dõi đầu tiên là **hit ratio** (tỉ lệ request tìm thấy trong cache). Cache có hit ratio thấp chỉ làm tăng độ trễ và độ phức tạp.

## Các chiến lược cache

### Cache-aside (lazy loading)

Ứng dụng tự quản lý cache: đọc cache trước, nếu miss thì đọc database rồi ghi vào cache. Khi ghi dữ liệu, ứng dụng cập nhật database rồi **xoá** khoá tương ứng trong cache. Đây là chiến lược phổ biến nhất vì đơn giản và cache chỉ chứa dữ liệu thực sự được đọc.

```java
@Service
public class ProductQueryService {

    private static final Duration TTL = Duration.ofMinutes(10);
    private final StringRedisTemplate redis;
    private final ProductRepository repository;
    private final ProductJson json;   // bọc ObjectMapper, chuyển ProductView <-> JSON

    // constructor injection lược bỏ cho gọn

    public Optional<ProductView> findById(long id) {
        String key = "product:v1:" + id;
        String cached = redis.opsForValue().get(key);
        if (cached != null) {
            return Optional.of(json.read(cached));                  // cache hit
        }
        Optional<ProductView> fromDb = repository.findViewById(id);  // cache miss → đọc DB
        fromDb.ifPresent(p -> redis.opsForValue().set(key, json.write(p), withJitter(TTL)));
        return fromDb;
    }

    @Transactional
    public void updatePrice(long id, BigDecimal price) {
        repository.updatePrice(id, price);
        // Xoá cache SAU khi commit, để request khác không nạp lại dữ liệu chưa commit
        TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
            @Override
            public void afterCommit() {
                redis.delete("product:v1:" + id);
            }
        });
    }

    private static Duration withJitter(Duration base) {
        return base.plusSeconds(ThreadLocalRandom.current().nextLong(0, 60));
    }
}
```

Nhược điểm: lần đọc đầu tiên sau khi miss luôn chậm, và có khoảng thời gian ngắn cache chứa dữ liệu cũ.

### Read-through

Ứng dụng chỉ nói chuyện với cache; khi miss, **chính cache** (hoặc thư viện cache) gọi loader để nạp từ database. Ví dụ: `LoadingCache` của Caffeine với một `CacheLoader`, hoặc `@Cacheable` của Spring nhìn từ góc độ code nghiệp vụ. Ưu điểm là logic nạp nằm một chỗ; nhược điểm là phụ thuộc vào khả năng của thư viện cache.

### Write-through

Mỗi lần ghi đi qua cache và cache ghi **đồng bộ** xuống database trước khi trả về. Cache luôn có dữ liệu mới, đổi lại mỗi lần ghi chậm hơn và cache có thể chứa nhiều dữ liệu không ai đọc. Thường kết hợp với read-through.

### Write-behind (write-back)

Ghi vào cache rồi trả về ngay; cache **gom và ghi bất đồng bộ** xuống database sau. Ghi rất nhanh và giảm tải database (gộp nhiều lần cập nhật một khoá thành một), nhưng **có thể mất dữ liệu** nếu cache sập trước khi kịp ghi xuống. Chỉ dùng cho dữ liệu chấp nhận mất mát nhỏ như bộ đếm lượt xem, thống kê.

| Chiến lược | Ai nạp/ghi database | Độ mới của cache | Rủi ro chính |
|---|---|---|---|
| Cache-aside | Ứng dụng | Có thể cũ trong khoảng TTL | Logic cache rải rác trong code |
| Read-through | Thư viện cache (loader) | Có thể cũ trong khoảng TTL | Phụ thuộc thư viện |
| Write-through | Cache ghi đồng bộ | Luôn mới với dữ liệu ghi qua cache | Ghi chậm, cache đầy dữ liệu ít đọc |
| Write-behind | Cache ghi bất đồng bộ | Mới nhất nằm ở cache | Mất dữ liệu khi cache sập |

## Spring Cache abstraction

Spring Cache cho phép khai báo cache bằng annotation, tách logic cache khỏi logic nghiệp vụ. Bên dưới, `CacheManager` có thể là Caffeine, Redis hoặc loại khác mà không phải sửa code nghiệp vụ.

- `@Cacheable`: nếu khoá có trong cache thì trả về ngay, không chạy method; nếu chưa có thì chạy method và lưu kết quả.
- `@CachePut`: luôn chạy method và ghi kết quả vào cache.
- `@CacheEvict`: xoá một khoá (hoặc toàn bộ cache với `allEntries = true`).

```java
@Service
public class ProductService {

    private final ProductRepository repository;

    public ProductService(ProductRepository repository) {
        this.repository = repository;
    }

    // sync = true: trong MỘT instance, chỉ một thread nạp khoá này khi miss
    @Cacheable(cacheNames = "products", key = "#id", sync = true)
    public ProductView getProduct(long id) {
        return repository.findViewById(id)
                .orElseThrow(() -> new ProductNotFoundException(id));   // exception không bị cache
    }

    @Transactional
    @CacheEvict(cacheNames = "products", key = "#id")
    public void rename(long id, String newName) {
        repository.rename(id, newName);
    }
}
```

Spring Cache hoạt động qua proxy, nên gọi `this.getProduct(...)` từ method khác **trong cùng class** sẽ không đi qua cache. Lưu ý thêm: với `sync = true`, không dùng được thuộc tính `unless`.

Với **Caffeine** (cache cục bộ), chỉ cần thêm dependency `com.github.ben-manes.caffeine:caffeine` và cấu hình:

```yaml
spring:
  cache:
    type: caffeine
    cache-names: products,categories
    caffeine:
      spec: maximumSize=10000,expireAfterWrite=10m
```

Với **Redis**, thêm `spring-boot-starter-data-redis`, đặt `spring.cache.type=redis`, và cấu hình serializer cùng TTL riêng cho từng cache:

```java
@Configuration
@EnableCaching
public class CacheConfig {

    @Bean
    RedisCacheManagerBuilderCustomizer redisCacheCustomizer() {
        RedisCacheConfiguration base = RedisCacheConfiguration.defaultCacheConfig()
                .entryTtl(Duration.ofMinutes(10))
                .disableCachingNullValues()
                .prefixCacheNameWith("shop:");
        RedisCacheConfiguration products = base
                .entryTtl(Duration.ofMinutes(30))
                .serializeValuesWith(RedisSerializationContext.SerializationPair
                        .fromSerializer(new Jackson2JsonRedisSerializer<>(ProductView.class)));
        return builder -> builder
                .transactionAware()            // put/evict chỉ thực hiện sau khi transaction commit
                .withCacheConfiguration("products", products);
    }
}
```

Mặc định `RedisCacheManager` dùng JDK serialization: object phải `Serializable`, dữ liệu trong Redis không đọc được bằng mắt và dễ vỡ khi đổi class. Dùng JSON với kiểu cụ thể như trên an toàn hơn. `transactionAware()` giải quyết vấn đề thứ tự: nếu không có nó, `@CacheEvict` có thể chạy **trước** khi transaction commit, và một request khác kịp nạp lại giá trị cũ vào cache.

Mô hình hai tầng (Caffeine làm L1 với TTL rất ngắn, Redis làm L2) giảm tải mạng cho dữ liệu cực nóng, nhưng cần cơ chế báo xoá L1 trên mọi instance, ví dụ qua Redis Pub/Sub.

## Các sự cố kinh điển

### Cache stampede

**Cache stampede** (còn gọi là thundering herd hay dogpile) xảy ra khi một khoá rất nóng hết hạn và hàng trăm request cùng miss, cùng lao vào database tính lại một giá trị. Database quá tải, request chậm hơn, càng nhiều request dồn lại.

Cách xử lý:

- **Chỉ cho một request nạp lại**: `sync = true` của Spring Cache chỉ có tác dụng trong một JVM. Với nhiều instance, dùng khoá phân tán ngắn hạn trên Redis.
- **Làm mới trước khi hết hạn**: Caffeine `refreshAfterWrite` nạp lại bất đồng bộ trong khi vẫn trả giá trị cũ; hoặc tự làm mới khi TTL còn lại dưới một ngưỡng.
- **Thêm jitter vào TTL**: nếu hàng nghìn khoá được nạp cùng lúc với cùng TTL, chúng sẽ cùng hết hạn. Cộng ngẫu nhiên vài chục giây giúp rải đều thời điểm hết hạn.

```java
private static final RedisScript<Long> RELEASE = RedisScript.of("""
        if redis.call('get', KEYS[1]) == ARGV[1] then
            return redis.call('del', KEYS[1])
        end
        return 0
        """, Long.class);

public ProductView getWithLock(long id) throws InterruptedException {
    String key = "product:v1:" + id;
    String lockKey = key + ":lock";
    for (int attempt = 0; attempt < 20; attempt++) {
        String cached = redis.opsForValue().get(key);
        if (cached != null) return json.read(cached);

        String token = UUID.randomUUID().toString();
        // SET lockKey token NX PX 5000: chỉ một request lấy được khoá, tự hết hạn nếu bị treo
        if (Boolean.TRUE.equals(redis.opsForValue().setIfAbsent(lockKey, token, Duration.ofSeconds(5)))) {
            try {
                ProductView fresh = repository.findViewById(id).orElseThrow();
                redis.opsForValue().set(key, json.write(fresh), withJitter(TTL));
                return fresh;
            } finally {
                redis.execute(RELEASE, List.of(lockKey), token);   // chỉ xoá khoá của chính mình
            }
        }
        Thread.sleep(50);   // request khác đang nạp: chờ ngắn rồi đọc lại cache
    }
    throw new CacheBusyException(id);   // hoặc đọc thẳng DB, tuỳ yêu cầu
}
```

Script Lua đảm bảo việc "kiểm tra token rồi xoá" là nguyên tử; nếu không, request A có thể xoá nhầm khoá mà request B vừa lấy sau khi khoá của A hết hạn.

### Cache penetration

**Cache penetration** là khi request hỏi những khoá **không tồn tại** trong database (id ngẫu nhiên, hoặc tấn công có chủ đích). Cache không bao giờ có giá trị, nên mọi request đều xuyên thẳng xuống database.

Cách xử lý:

- **Cache giá trị rỗng** (negative caching) với TTL ngắn, ví dụ 30 đến 60 giây, để các lần hỏi lặp lại được chặn ở cache.
- **Bloom filter**: cấu trúc dữ liệu xác suất trả lời "chắc chắn không có" hoặc "có thể có". Đặt Bloom filter chứa mọi id hợp lệ trước cache; id bị loại thì trả 404 ngay. Bloom filter có thể báo nhầm "có thể có" nhưng không bao giờ báo nhầm "không có".
- **Kiểm tra đầu vào** ở API: id sai định dạng bị từ chối trước khi chạm cache, kết hợp rate limiting theo client.

### Hot key

**Hot key** là một khoá nhận lưu lượng cực lớn, ví dụ trang sản phẩm đang flash sale. Trong Redis Cluster, mỗi khoá thuộc một trong 16384 hash slot và mỗi slot do một node master phụ trách, nên mọi request cho khoá đó dồn vào một node, bất kể cụm có bao nhiêu node.

Cách xử lý:

- **Cache cục bộ tầng L1** cho các khoá nóng, TTL vài giây: phần lớn request được trả từ bộ nhớ JVM.
- **Nhân bản khoá**: lưu cùng giá trị ở `product:42#0` đến `product:42#9`, mỗi request đọc ngẫu nhiên một bản, tải chia cho nhiều slot. Khi invalidate phải xoá cả 10 bản.
- **Đọc từ replica**: cấu hình client Lettuce đọc từ replica cho dữ liệu chấp nhận hơi cũ.

Để phát hiện, `redis-cli --hotkeys` hoạt động khi `maxmemory-policy` là một chính sách LFU; ngoài ra nên đo phía ứng dụng bằng metric theo khoá được truy cập nhiều nhất.

## TTL và chiến lược invalidation

TTL (time to live) là lưới an toàn cuối cùng: dù logic invalidation có lỗi, dữ liệu cũ cũng sẽ biến mất sau TTL. **Mọi khoá trong cache nên có TTL**. Chọn TTL dựa trên hai câu hỏi: dữ liệu thay đổi thường xuyên đến đâu, và nghiệp vụ chấp nhận dữ liệu cũ tối đa bao lâu. Ví dụ, mô tả sản phẩm có thể để vài chục phút, giá khuyến mãi chỉ nên vài chục giây hoặc được invalidate chủ động.

Các chiến lược invalidation:

- **Chỉ dựa vào TTL**: đơn giản nhất, phù hợp khi chấp nhận dữ liệu cũ trong khoảng TTL.
- **Xoá khi ghi**: sau khi commit thay đổi, xoá khoá liên quan. Nên **xoá** thay vì **ghi đè** giá trị mới: nếu hai request cập nhật đồng thời, thứ tự ghi vào cache có thể ngược với thứ tự commit, để lại giá trị cũ trong cache đến hết TTL.
- **Invalidation theo event**: service sở hữu dữ liệu phát event (hoặc dùng Change Data Capture đọc log của database), các service khác nghe event để xoá cache của mình. Phù hợp khi nhiều service cùng cache một loại dữ liệu.
- **Version trong khoá**: `product:v2:42`. Khi đổi cấu trúc dữ liệu cache, tăng version và để khoá cũ tự hết hạn, không cần xoá hàng loạt.

Ngay cả cache-aside với "xoá sau khi commit" vẫn còn một khe hở nhỏ: request đọc lấy giá trị cũ từ database, request ghi commit và xoá cache, rồi request đọc mới ghi giá trị cũ vào cache. Khe hở này hiếm nhưng có thật; TTL hợp lý, hoặc xoá thêm một lần sau một khoảng trễ ngắn, giúp giới hạn tác động.

## Lỗi thường gặp

- **Cache không có TTL**: dữ liệu cũ tồn tại vĩnh viễn khi invalidation bị lỗi, và bộ nhớ Redis tăng dần. Luôn đặt TTL mặc định cho mọi cache.
- **Cache entity JPA trực tiếp**: entity có lazy proxy, quan hệ vòng, và dễ vỡ khi serialize. Cache DTO hoặc record chỉ chứa dữ liệu cần.
- **Dùng JDK serialization mặc định**: đổi field là không đọc được dữ liệu cũ, gây lỗi hàng loạt sau khi deploy. Dùng JSON serializer và version trong khoá.
- **Gọi method `@Cacheable` từ cùng class**: lời gọi không qua proxy nên không có cache. Tách sang bean khác.
- **Dùng lệnh `KEYS *` trên production**: lệnh này quét toàn bộ keyspace và chặn Redis. Dùng `SCAN` hoặc thiết kế khoá để xoá theo tên cụ thể.
- **Cache cục bộ trên nhiều instance mà không đồng bộ**: mỗi instance trả một phiên bản dữ liệu khác nhau. Dùng TTL rất ngắn cho L1 hoặc phát tín hiệu invalidate qua Pub/Sub.
- **Coi cache là nguồn dữ liệu chính**: Redis bị evict khoá khi đầy bộ nhớ, hoặc mất dữ liệu khi restart tuỳ cấu hình persistence. Database vẫn phải là nguồn sự thật.

## Bài tập thực hành

1. **Đo hiệu quả cache**: viết API `GET /products/{id}` đọc PostgreSQL, thêm `@Cacheable` với Redis, chạy load test (k6 hoặc Gatling) trước và sau. Bật metric của Spring Boot Actuator để quan sát hit ratio của cache `products`.
2. **Tái hiện cache stampede**: đặt TTL 5 giây cho một khoá, dùng 500 virtual thread gọi đồng thời đúng lúc khoá hết hạn, đếm số query xuống database. Sau đó áp dụng khoá phân tán như ví dụ trên và đếm lại.
3. **Thiết kế invalidation theo event**: khi service Catalog cập nhật giá, phát event `ProductPriceChanged` lên Kafka; service Order nghe event và xoá cache giá của mình. Viết ADR ngắn mô tả TTL đã chọn cho từng cache và lý do.

## Tóm tắt

- Cache phù hợp cho dữ liệu đọc nhiều, tốn kém để tính và chấp nhận cũ một chút; theo dõi hit ratio để biết cache có hiệu quả không.
- Cache-aside phổ biến nhất; read-through và write-through đẩy logic vào thư viện cache; write-behind ghi nhanh nhưng có thể mất dữ liệu.
- Spring Cache với `@Cacheable`, `@CacheEvict` giúp tách logic cache; dùng JSON serializer, TTL theo từng cache và `transactionAware()` với Redis.
- Stampede xử lý bằng một-request-nạp (khoá phân tán), refresh sớm và jitter TTL; penetration bằng negative caching và Bloom filter; hot key bằng cache L1 và nhân bản khoá.
- Mọi khoá cần TTL; khi ghi thì xoá cache sau commit thay vì ghi đè, kết hợp invalidation theo event khi nhiều service cùng cache một dữ liệu.
