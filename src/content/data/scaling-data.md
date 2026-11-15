Khi một database duy nhất không còn gánh nổi lưu lượng đọc, dung lượng dữ liệu hoặc yêu cầu tìm kiếm, kiến trúc sư phải chọn giữa nhiều kỹ thuật mở rộng: thêm replica để chia tải đọc, chia dữ liệu ra nhiều shard để chia tải ghi, đưa tìm kiếm sang Elasticsearch, và đồng bộ các kho này với nhau. Mỗi kỹ thuật giải quyết một vấn đề nhưng đem theo vấn đề mới: replica bị trễ, truy vấn xuyên shard đắt đỏ, index tìm kiếm lệch với dữ liệu gốc. Bài này giúp bạn hiểu cơ chế bên dưới để chọn đúng và lường trước hệ quả, đây là phần cốt lõi của milestone "PostgreSQL cho đơn hàng, Elasticsearch cho tìm kiếm".

## Mục tiêu bài học

- Giải thích replication leader-follower, multi-leader và tác động của độ trễ replication lên người dùng.
- Thiết kế chiến lược sharding theo range, theo hash và consistent hashing; chọn shard key hợp lý.
- Xây dựng tìm kiếm full-text với Elasticsearch/OpenSearch: mapping, analyzer, truy vấn bool.
- Đồng bộ dữ liệu từ PostgreSQL sang kho khác bằng Change Data Capture với Debezium.

## Replication

Replication là giữ **bản sao của cùng dữ liệu** trên nhiều máy, để tăng khả năng chịu lỗi và chia tải đọc.

### Leader-follower

Mô hình phổ biến nhất (còn gọi là primary-replica). Mọi lần ghi đi vào **leader**; leader ghi thay đổi vào log (với PostgreSQL là WAL, write-ahead log) và gửi log cho các **follower**, follower phát lại (replay) để có cùng dữ liệu. Đọc có thể phân tán cho các follower.

```text
              ghi                         streaming WAL
  App ───────────────►  [ Leader ]  ──────────┬──────────►  [ Follower 1 ]
   │                                          └──────────►  [ Follower 2 ]
   └────────────── đọc (readOnly) ────────────────────────►  follower
```

- **Replication bất đồng bộ** (mặc định của PostgreSQL streaming replication): leader xác nhận commit mà không chờ follower. Ghi nhanh, nhưng nếu leader chết trước khi gửi log, các transaction cuối có thể mất khi failover.
- **Replication đồng bộ** (`synchronous_commit` kết hợp `synchronous_standby_names`): leader chờ ít nhất một follower xác nhận. Không mất dữ liệu đã commit, nhưng mỗi lần ghi chậm thêm một vòng mạng, và nếu follower đồng bộ chết thì ghi bị treo.

**Failover** là chuyển một follower thành leader khi leader chết. Nguy cơ lớn nhất là **split brain**: leader cũ chưa thật sự chết, hai node cùng nhận ghi. Các công cụ như Patroni dùng một hệ consensus (etcd, Consul) để đảm bảo chỉ có một leader tại một thời điểm.

### Độ trễ replication

Với replication bất đồng bộ, follower luôn đi sau leader một khoảng, bình thường là vài mili-giây, nhưng có thể lên tới nhiều giây khi tải cao hoặc khi follower đang chạy query dài. Người dùng gặp các bất thường:

- **Không thấy dữ liệu vừa ghi**: tạo đơn xong, trang "đơn của tôi" đọc từ follower và không thấy đơn mới.
- **Dữ liệu nhảy lùi**: hai lần tải trang rơi vào hai follower có độ trễ khác nhau.

Cách giảm thiểu: đọc dữ liệu **của chính người dùng vừa ghi** từ leader trong một khoảng thời gian ngắn sau khi ghi; ghi nhận vị trí WAL của leader (`pg_current_wal_lsn()`) sau khi ghi và chỉ đọc từ follower đã replay tới vị trí đó (`pg_last_wal_replay_lsn()`); hoặc đơn giản là gắn mỗi phiên người dùng với một follower cố định.

```sql
-- Trên leader: trạng thái và độ trễ của từng follower
SELECT application_name, client_addr, state, sync_state,
       write_lag, flush_lag, replay_lag
FROM pg_stat_replication;

-- Trên follower: thời gian kể từ transaction cuối cùng được replay
-- (giá trị tăng dần cả khi leader không có ghi mới, cần lưu ý khi đặt cảnh báo)
SELECT now() - pg_last_xact_replay_timestamp() AS replay_delay;
```

Trong Spring Boot, cách phổ biến để chia đọc/ghi là định tuyến theo cờ `readOnly` của transaction:

```java
public class ReadWriteRoutingDataSource extends AbstractRoutingDataSource {
    @Override
    protected Object determineCurrentLookupKey() {
        return TransactionSynchronizationManager.isCurrentTransactionReadOnly() ? "replica" : "primary";
    }
}

@Configuration
public class DataSourceConfig {

    // primaryDataSource và replicaDataSource: hai HikariDataSource, khai báo ở nơi khác
    @Bean
    @Primary
    public DataSource dataSource(@Qualifier("primaryDataSource") DataSource primary,
                                 @Qualifier("replicaDataSource") DataSource replica) {
        var routing = new ReadWriteRoutingDataSource();
        routing.setTargetDataSources(Map.<Object, Object>of("primary", primary, "replica", replica));
        routing.setDefaultTargetDataSource(primary);
        routing.afterPropertiesSet();
        // Lazy proxy: chỉ lấy connection thật khi câu SQL đầu tiên chạy,
        // lúc đó cờ readOnly của transaction đã được thiết lập
        return new LazyConnectionDataSourceProxy(routing);
    }
}
```

Sau đó các method `@Transactional(readOnly = true)` sẽ đọc từ replica. Hãy nhớ: chỉ đưa sang replica những truy vấn chấp nhận được dữ liệu trễ.

### Multi-leader và leaderless

**Multi-leader** cho phép nhiều node cùng nhận ghi, thường là một leader cho mỗi datacenter, giúp người dùng ở mỗi vùng ghi với độ trễ thấp và hệ vẫn ghi được khi mất kết nối giữa các vùng. Cái giá là **xung đột ghi**: hai vùng cùng sửa một bản ghi. Các chiến lược giải quyết gồm last-write-wins (đơn giản nhưng mất dữ liệu), gộp theo logic nghiệp vụ, hoặc dùng CRDT (cấu trúc dữ liệu được thiết kế để gộp tự động). Cách thực tế nhất là **tránh xung đột**: mọi lần ghi cho một khách hàng luôn đi về một "vùng nhà" cố định.

**Leaderless** (kiểu Dynamo, như Cassandra) không có leader; client ghi và đọc từ nhiều replica theo quorum, đã được trình bày trong bài NoSQL.

## Partitioning và sharding

Replication không giúp được khi **lưu lượng ghi** hoặc **dung lượng** vượt quá một máy, vì mỗi replica vẫn chứa toàn bộ dữ liệu. Lúc đó cần chia dữ liệu: mỗi phần (partition, hay shard khi nằm trên các máy khác nhau) chỉ chứa một tập con. Cần phân biệt: declarative partitioning của PostgreSQL chia bảng lớn thành nhiều bảng con **trong cùng một server** (giúp xoá dữ liệu cũ nhanh, query lọc theo khoá partition nhanh hơn), còn sharding chia dữ liệu ra **nhiều server**.

### Sharding theo range

Mỗi shard giữ một khoảng giá trị liên tục của shard key, ví dụ khách hàng có id từ 1 đến 1 triệu ở shard A. Ưu điểm: truy vấn theo khoảng (range scan) chỉ chạm ít shard. Nhược điểm: dễ tạo **điểm nóng**: nếu shard key là thời gian tạo, mọi lần ghi mới đều dồn vào shard chứa khoảng thời gian hiện tại.

### Sharding theo hash

Tính hash của shard key rồi chọn shard theo kết quả. Dữ liệu và tải phân bố đều, nhưng mất khả năng range scan hiệu quả: truy vấn theo khoảng phải hỏi mọi shard. Cách đơn giản nhất `shard = hash(key) mod N` có nhược điểm nghiêm trọng: khi đổi N (thêm hoặc bớt shard), gần như mọi khoá đổi chỗ, phải di chuyển gần hết dữ liệu.

### Consistent hashing

Consistent hashing đặt cả node và khoá lên một **vòng hash** (ring). Mỗi khoá thuộc về node đầu tiên gặp được khi đi theo chiều kim đồng hồ từ vị trí của khoá. Khi thêm node, node mới chỉ "nhận" phần khoá nằm ngay trước nó trên vòng, các khoá khác giữ nguyên chủ. Để tải đều hơn, mỗi node vật lý được đặt ở nhiều vị trí trên vòng, gọi là **virtual node**.

```text
Vòng hash (đi theo chiều kim đồng hồ, hết vòng quay lại đầu):

  0 ── N1#0 ── k1 ── N2#0 ── N3#0 ── k2 ── N1#1 ── N2#1 ── N3#1 ── (về 0)

  k1 → N2#0 → thuộc node N2
  k2 → N1#1 → thuộc node N1

Thêm node N4, một virtual node N4#0 rơi vào giữa N1#0 và k1:

  0 ── N1#0 ── N4#0 ── k1 ── N2#0 ── ...

  k1 vẫn thuộc N2 (vị trí kế tiếp của nó vẫn là N2#0).
  Chỉ các khoá nằm giữa N1#0 và N4#0 chuyển từ N2 sang N4.
  Mọi khoá khác giữ nguyên chủ.
```

```java
public final class ConsistentHashRing<N> {

    private final NavigableMap<Long, N> ring = new TreeMap<>();
    private final int virtualNodes;

    public ConsistentHashRing(Collection<N> nodes, int virtualNodes) {
        this.virtualNodes = virtualNodes;
        nodes.forEach(this::addNode);
    }

    public void addNode(N node) {
        for (int i = 0; i < virtualNodes; i++) ring.put(hash(node + "#" + i), node);
    }

    public void removeNode(N node) {
        for (int i = 0; i < virtualNodes; i++) ring.remove(hash(node + "#" + i));
    }

    public N nodeFor(String key) {
        if (ring.isEmpty()) throw new IllegalStateException("Ring chưa có node nào");
        Map.Entry<Long, N> e = ring.ceilingEntry(hash(key));     // vị trí đầu tiên theo chiều kim đồng hồ
        return (e != null ? e : ring.firstEntry()).getValue();   // hết vòng thì quay về đầu
    }

    private static long hash(String s) {
        try {
            byte[] d = MessageDigest.getInstance("MD5").digest(s.getBytes(StandardCharsets.UTF_8));
            return ByteBuffer.wrap(d).getLong();                 // 8 byte đầu làm vị trí trên vòng
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException(e);
        }
    }
}
```

Một cách tiếp cận khác là chia sẵn **số lượng partition cố định**, lớn hơn nhiều số node (Redis Cluster dùng 16384 hash slot, Kafka dùng số partition của topic); khi thêm node chỉ cần chuyển nguyên partition, không băm lại từng khoá.

### Chọn shard key

Shard key là quyết định khó đảo ngược nhất. Tiêu chí:

- **Cardinality cao và phân bố đều**: `customer_id` tốt hơn `country`.
- **Khớp với access pattern chính**: phần lớn truy vấn nên chứa shard key để chỉ chạm một shard. Với hệ đơn hàng, shard theo `customer_id` giúp "đơn của tôi" chạy trên một shard, nhưng "tất cả đơn hôm nay" phải hỏi mọi shard (scatter-gather).
- **Hạn chế transaction xuyên shard**: dữ liệu thường cập nhật cùng nhau nên nằm cùng shard.

Trước khi tự sharding ở tầng ứng dụng, hãy cân nhắc các giải pháp có sẵn như Citus cho PostgreSQL hay Vitess cho MySQL, hoặc đơn giản là nâng cấp máy và thêm replica; sharding làm tăng đáng kể độ phức tạp vận hành.

## Tìm kiếm full-text với Elasticsearch/OpenSearch

`WHERE name LIKE '%dien thoai%'` không dùng được B-Tree index, không xếp hạng mức độ liên quan, không hiểu chữ có dấu và không có dấu. PostgreSQL có full-text search (`tsvector`, `tsquery`) đủ dùng cho nhu cầu đơn giản; khi cần tìm kiếm mạnh hơn (gợi ý, xếp hạng, lọc theo nhiều thuộc tính, faceting), Elasticsearch hoặc OpenSearch (bản fork mã nguồn mở từ Elasticsearch 7.10.2) là lựa chọn phổ biến.

### Inverted index và analyzer

Elasticsearch dựa trên Lucene với cấu trúc **inverted index**: thay vì "document chứa những từ nào", nó lưu "mỗi từ (term) xuất hiện trong những document nào". Trước khi đưa vào index, văn bản đi qua **analyzer** gồm ba bước: char filter (làm sạch ký tự), tokenizer (tách thành token) và token filter (chuẩn hoá token, ví dụ chuyển chữ thường, bỏ dấu). Cùng analyzer được áp dụng cho câu truy vấn, nên "Điện Thoại" và "dien thoai" có thể khớp nhau nếu cả hai đều được bỏ dấu.

Hai kiểu field quan trọng: `text` được phân tích để tìm kiếm full-text; `keyword` giữ nguyên giá trị, dùng cho lọc chính xác, sắp xếp và aggregation. Điểm liên quan mặc định được tính bằng thuật toán BM25.

Ví dụ body của request `PUT /products` tạo index với một analyzer bỏ dấu tiếng Việt:

```json
{
  "settings": {
    "number_of_shards": 3,
    "number_of_replicas": 1,
    "analysis": {
      "analyzer": {
        "vi_folding": {
          "type": "custom",
          "tokenizer": "standard",
          "filter": ["lowercase", "asciifolding"]
        }
      }
    }
  },
  "mappings": {
    "properties": {
      "name": {
        "type": "text",
        "analyzer": "standard",
        "fields": { "folded": { "type": "text", "analyzer": "vi_folding" } }
      },
      "brand":     { "type": "keyword" },
      "price":     { "type": "long" },
      "updatedAt": { "type": "date" }
    }
  }
}
```

Field `name` giữ dấu, sub-field `name.folded` đã bỏ dấu. Truy vấn tìm trên cả hai, ưu tiên khớp có dấu:

```json
{
  "query": {
    "bool": {
      "must": [
        { "multi_match": { "query": "dien thoai samsung", "fields": ["name^2", "name.folded"] } }
      ],
      "filter": [
        { "term":  { "brand": "Samsung" } },
        { "range": { "price": { "gte": 5000000, "lte": 15000000 } } }
      ]
    }
  },
  "size": 20
}
```

Mệnh đề `must` đóng góp vào điểm liên quan; `filter` chỉ lọc có/không, không tính điểm và được cache, nên mọi điều kiện lọc chính xác nên đặt ở `filter`. Tokenizer `standard` tách theo âm tiết, nên với tiếng Việt cần thêm `match_phrase` hoặc plugin phân tích tiếng Việt nếu muốn khớp theo từ ghép chính xác hơn.

### Vận hành và đồng bộ

- Một index chia thành nhiều **shard** (số primary shard không đổi được sau khi tạo, trừ khi reindex hoặc dùng split), mỗi shard có **replica** trên node khác.
- Elasticsearch là **near real-time**: document mới chỉ tìm thấy được sau lần refresh kế tiếp (mặc định khoảng một giây).
- Elasticsearch **không phải nguồn sự thật**. Dữ liệu gốc vẫn ở PostgreSQL; index tìm kiếm phải dựng lại được từ đó bất cứ lúc nào.

Câu hỏi còn lại là đồng bộ thế nào. Ghi vào PostgreSQL rồi gọi Elasticsearch trong cùng request là **dual-write**: nếu lần ghi thứ hai lỗi, hai kho lệch nhau mà không ai biết. Đó là lý do cần CDC.

## Change Data Capture với Debezium

**Change Data Capture (CDC)** là đọc trực tiếp log giao dịch của database để phát ra mọi thay đổi dưới dạng event. **Debezium** là nền tảng CDC mã nguồn mở, thường chạy như một connector của **Kafka Connect**. Với PostgreSQL, Debezium dùng **logical decoding** (plugin `pgoutput` có sẵn) qua một **replication slot**, đọc WAL và đẩy event lên Kafka, mỗi bảng một topic tên dạng `<topic.prefix>.<schema>.<table>`.

```text
 [App] ──ghi──► [PostgreSQL] ──WAL──► [Debezium / Kafka Connect] ──► topic shop.public.products
                                                                        │
                                       ┌────────────────────────────────┼──────────────┐
                                       ▼                                ▼              ▼
                               [Indexer → Elasticsearch]       [Xoá cache Redis]   [Analytics]
```

Ưu điểm: ứng dụng chỉ ghi một chỗ, không có dual-write; mọi thay đổi, kể cả từ script hay ứng dụng khác, đều được bắt; event có thứ tự theo từng dòng vì Debezium dùng primary key làm message key.

Yêu cầu phía PostgreSQL: `wal_level = logical`, một user có quyền `REPLICATION`, và publication cho các bảng cần theo dõi. Cấu hình connector (gửi tới REST API của Kafka Connect):

```json
{
  "name": "shop-products-cdc",
  "config": {
    "connector.class": "io.debezium.connector.postgresql.PostgresConnector",
    "plugin.name": "pgoutput",
    "database.hostname": "postgres",
    "database.port": "5432",
    "database.user": "debezium",
    "database.password": "${file:/opt/kafka/secrets/cdc.properties:password}",
    "database.dbname": "shop",
    "topic.prefix": "shop",
    "table.include.list": "public.products",
    "slot.name": "shop_products",
    "publication.autocreate.mode": "filtered",
    "decimal.handling.mode": "string",
    "key.converter": "org.apache.kafka.connect.json.JsonConverter",
    "key.converter.schemas.enable": "false",
    "value.converter": "org.apache.kafka.connect.json.JsonConverter",
    "value.converter.schemas.enable": "false"
  }
}
```

Mật khẩu được đọc qua config provider của Kafka Connect (cần khai báo `FileConfigProvider` trong cấu hình worker) thay vì ghi thẳng. `decimal.handling.mode` đổi kiểu `NUMERIC` thành chuỗi; nếu để mặc định, giá trị thập phân được mã hoá thành bytes, rất khó đọc ở consumer.

Mỗi event có dạng `before`, `after`, `source`, `op` (`c` tạo, `u` sửa, `d` xoá, `r` đọc trong lần snapshot ban đầu) và `ts_ms`. Với replica identity mặc định, `before` của event update là `null`; muốn có giá trị cũ, đặt `ALTER TABLE products REPLICA IDENTITY FULL`. Consumer cập nhật Elasticsearch:

```java
@Component
public class ProductCdcListener {

    private final ProductSearchRepository search;   // Spring Data Elasticsearch
    private final ObjectMapper mapper;

    public ProductCdcListener(ProductSearchRepository search, ObjectMapper mapper) {
        this.search = search;
        this.mapper = mapper;
    }

    @KafkaListener(topics = "shop.public.products", groupId = "product-indexer")
    public void onChange(ConsumerRecord<String, String> record) throws JsonProcessingException {
        if (record.value() == null) {
            return;   // tombstone Debezium gửi sau event xoá, dùng cho log compaction
        }
        JsonNode event = mapper.readTree(record.value());
        switch (event.path("op").asText()) {
            case "c", "u", "r" -> {
                JsonNode after = event.get("after");
                search.save(new ProductDocument(               // save theo id = upsert, chạy lại vẫn đúng
                        after.get("id").asText(),
                        after.get("name").asText(),
                        after.get("brand").asText(),
                        new BigDecimal(after.get("price").asText()).longValue()));
            }
            case "d" -> search.deleteById(event.get("before").get("id").asText());
            default -> { /* ví dụ "t" (truncate): ghi log để xử lý thủ công */ }
        }
    }
}
```

Debezium đảm bảo **at-least-once**: khi connector restart, một số event có thể được gửi lại. Consumer phải idempotent; upsert theo id như trên tự nhiên đã thoả điều kiện này.

> **Lưu ý:** Replication slot giữ lại WAL cho tới khi Debezium đọc xong. Nếu connector dừng lâu, WAL tích tụ và có thể làm đầy đĩa của database chính. Hãy giám sát kích thước WAL bị giữ và cân nhắc `max_slot_wal_keep_size` (PostgreSQL 13 trở lên) để đặt giới hạn.

## Lỗi thường gặp

- **Đẩy mọi truy vấn đọc sang replica**: luồng "ghi xong đọc lại ngay" hiển thị dữ liệu cũ. Chỉ đưa sang replica những truy vấn chịu được độ trễ; luồng read-your-writes đọc từ leader.
- **Shard quá sớm**: sharding khi một máy cộng vài replica vẫn đủ sức tạo ra độ phức tạp không cần thiết. Tối ưu query, index, cache và nâng cấp phần cứng trước.
- **Chọn shard key theo thời gian hoặc có ít giá trị**: tạo shard nóng nhận toàn bộ lượt ghi. Dùng khoá có cardinality cao, hoặc hash kết hợp với khoá thời gian.
- **Dùng `hash mod N`**: thêm một shard là phải di chuyển gần hết dữ liệu. Dùng consistent hashing hoặc số partition cố định lớn.
- **Coi Elasticsearch là database chính**: mất index là mất dữ liệu. Luôn có nguồn sự thật và quy trình reindex.
- **Dual-write sang Elasticsearch trong request**: lệch dữ liệu âm thầm khi một bên lỗi. Dùng CDC hoặc Transactional Outbox.
- **Không giám sát replication slot**: connector chết vào cuối tuần, thứ Hai database đầy đĩa. Đặt cảnh báo trên WAL bị giữ và trạng thái connector.

## Bài tập thực hành

1. **Đo độ trễ replication**: dựng PostgreSQL primary và một replica bằng Docker Compose, cấu hình `ReadWriteRoutingDataSource`. Viết test tạo đơn rồi đọc ngay qua method `readOnly`, ghi lại tần suất không thấy đơn mới khi chạy tải ghi nặng song song; sau đó cài đặt cơ chế đọc từ leader trong 5 giây sau khi ghi.
2. **Mô phỏng consistent hashing**: dùng `ConsistentHashRing` ở trên với 4 node và 1 triệu khoá ngẫu nhiên. Đo phần trăm khoá đổi node khi thêm node thứ 5, so sánh với `hash mod N`, và quan sát độ lệch tải khi đổi số virtual node từ 1 lên 100.
3. **Pipeline tìm kiếm bằng CDC**: chạy PostgreSQL, Kafka, Kafka Connect với Debezium và Elasticsearch. Đăng ký connector cho bảng `products`, viết consumer cập nhật index như ví dụ, kiểm tra tìm "dien thoai" khớp "Điện thoại". Dừng consumer, sửa 100 sản phẩm, bật lại và xác nhận index bắt kịp đầy đủ.

## Tóm tắt

- Leader-follower chia tải đọc và tăng khả năng chịu lỗi; replication bất đồng bộ gây độ trễ, cần xử lý read-your-writes có chủ đích.
- Multi-leader giúp ghi đa vùng nhưng phải giải quyết xung đột; cách tốt nhất là tránh xung đột bằng "vùng nhà" cho từng thực thể.
- Sharding theo range hỗ trợ range scan nhưng dễ tạo điểm nóng; theo hash phân bố đều; consistent hashing hoặc số partition cố định giúp thêm node mà ít di chuyển dữ liệu.
- Shard key cần cardinality cao, khớp access pattern chính và hạn chế transaction xuyên shard.
- Elasticsearch/OpenSearch dùng inverted index và analyzer; dùng `text` cho tìm kiếm, `keyword` cho lọc, đặt điều kiện chính xác trong `filter`.
- CDC với Debezium đọc WAL để đồng bộ sang kho khác mà không dual-write; consumer phải idempotent và replication slot phải được giám sát.
