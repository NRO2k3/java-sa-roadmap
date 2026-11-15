NoSQL không phải là "SQL thế hệ mới" mà là một nhóm cơ sở dữ liệu được thiết kế cho những bài toán mà mô hình quan hệ xử lý kém: dữ liệu phân tán trên nhiều node, schema thay đổi liên tục, lượng ghi rất lớn, hoặc truy vấn đi theo quan hệ nhiều bước. Đổi lại, phần lớn hệ NoSQL hy sinh JOIN, transaction đa bảng linh hoạt hoặc tính nhất quán tức thời. Với vai trò Solution Architect, bạn sẽ thường xuyên phải trả lời câu hỏi "dữ liệu này nên nằm ở đâu" và bảo vệ lựa chọn đó bằng lập luận về access pattern và consistency, không phải bằng sở thích công nghệ.

## Mục tiêu bài học

- Phân biệt bốn họ NoSQL chính: document, key-value, wide-column, graph, cùng ví dụ tiêu biểu.
- Thiết kế mô hình dữ liệu xuất phát từ access pattern thay vì từ thực thể.
- Giải thích định lý CAP, PACELC và áp dụng để phân tích một hệ cụ thể.
- Hiểu eventual consistency, quorum read/write và cách chỉnh mức consistency trong code Java.

## Vì sao cần NoSQL

Cơ sở dữ liệu quan hệ truyền thống mở rộng chủ yếu theo chiều dọc (máy mạnh hơn). Khi dữ liệu và lưu lượng vượt quá một máy, ta phải chia dữ liệu ra nhiều node, và lúc đó JOIN hay transaction xuyên node trở nên đắt. Nhiều hệ NoSQL được thiết kế phân tán ngay từ đầu: dữ liệu được chia theo khoá, mỗi truy vấn nên chạm vào ít node nhất có thể.

Hệ quả quan trọng: với NoSQL, **bạn thiết kế dữ liệu cho câu truy vấn**, không phải cho thực thể. Nếu không biết trước sẽ truy vấn thế nào, cơ sở dữ liệu quan hệ thường vẫn là lựa chọn an toàn hơn.

## Bốn họ NoSQL chính

### Document store: MongoDB

Dữ liệu là các **document** (tài liệu) dạng JSON, lưu dưới định dạng nhị phân BSON, gom trong collection. Một document có thể chứa object lồng nhau và mảng, nên một "đơn hàng" có thể nằm trọn trong một document thay vì trải trên ba bảng.

```json
{
  "_id": "ORD-2024-0001",
  "customerId": "C-42",
  "status": "PAID",
  "createdAt": { "$date": "2024-05-01T08:30:00Z" },
  "shippingAddress": { "city": "Hà Nội", "street": "12 Láng Hạ" },
  "items": [
    { "sku": "IP15-128", "name": "iPhone 15", "qty": 1, "unitPrice": 21990000 },
    { "sku": "CASE-01", "name": "Ốp lưng", "qty": 2, "unitPrice": 150000 }
  ],
  "total": 22290000
}
```

MongoDB hỗ trợ secondary index, aggregation pipeline và transaction nhiều document, nhưng thiết kế tốt vẫn là để phần lớn thao tác chỉ chạm **một document**, vì ghi một document là nguyên tử. Mỗi document giới hạn 16 MB.

Quy tắc **nhúng (embed) hay tham chiếu (reference)**:

- Nhúng khi dữ liệu luôn được đọc cùng nhau, thuộc sở hữu của document cha, và số lượng có giới hạn (dòng hàng trong đơn, địa chỉ giao hàng).
- Tham chiếu khi quan hệ nhiều-nhiều, mảng có thể phình không giới hạn (bình luận của một bài viết nổi tiếng), hoặc dữ liệu con được cập nhật độc lập và thường xuyên.

```java
@Document("orders")
@CompoundIndex(name = "customer_created", def = "{'customerId': 1, 'createdAt': -1}")
public record OrderDocument(
        @Id String id,
        String customerId,
        String status,
        Instant createdAt,
        Address shippingAddress,
        List<OrderLine> items,
        long total) {

    public record Address(String city, String street) {}
    public record OrderLine(String sku, String name, int qty, long unitPrice) {}
}

public interface OrderDocumentRepository extends MongoRepository<OrderDocument, String> {
    // Access pattern: đơn mới nhất của một khách, dùng index customer_created
    List<OrderDocument> findByCustomerIdOrderByCreatedAtDesc(String customerId, Pageable page);
}
```

> **Lưu ý:** Từ Spring Data MongoDB 3.0, việc tự tạo index từ annotation bị tắt mặc định. Bật `spring.data.mongodb.auto-index-creation=true` cho môi trường dev, còn production nên tạo index bằng script migration có kiểm soát.

### Key-value store: DynamoDB

Mô hình đơn giản nhất: một khoá ánh xạ tới một giá trị. DynamoDB (dịch vụ managed của AWS) mở rộng ý tưởng này với **partition key** (quyết định dữ liệu nằm ở partition vật lý nào) và **sort key** tuỳ chọn (sắp xếp các item trong cùng partition). Bạn có thể `GetItem` theo khoá đầy đủ, hoặc `Query` theo partition key kèm điều kiện trên sort key. `Scan` toàn bảng thì chậm và tốn chi phí, chỉ nên dùng cho tác vụ quản trị.

Kỹ thuật phổ biến là **single-table design**: nhiều loại thực thể nằm chung một bảng, khoá được đặt sao cho một `Query` trả về đúng thứ màn hình cần.

| PK | SK | Thuộc tính |
|---|---|---|
| `CUSTOMER#42` | `PROFILE` | name, email |
| `CUSTOMER#42` | `ORDER#2024-05-01#0001` | status, total |
| `CUSTOMER#42` | `ORDER#2024-05-03#0007` | status, total |

Một `Query` với `PK = CUSTOMER#42` và `SK begins_with ORDER#`, sắp xếp giảm dần, trả về các đơn mới nhất của khách mà không cần JOIN. Muốn truy vấn theo trục khác (ví dụ theo trạng thái), bạn thêm **Global Secondary Index (GSI)**; lưu ý GSI chỉ hỗ trợ eventually consistent read. Redis cũng thường được xếp vào họ key-value, nhưng chủ yếu dùng làm cache.

### Wide-column store: Cassandra

Cassandra lưu dữ liệu theo **partition**: phần đầu của primary key là **partition key**, được hash để chọn node; các cột còn lại của khoá là **clustering column**, quyết định thứ tự sắp xếp các dòng bên trong partition. Ghi rất rẻ nhờ kiến trúc log-structured (commit log, memtable, SSTable), nên Cassandra hợp với lượng ghi lớn: IoT, log sự kiện, lịch sử hoạt động.

Nguyên tắc vàng: **một bảng cho mỗi access pattern** và mỗi truy vấn chỉ đọc một partition.

```sql
-- CQL (Cassandra Query Language)
CREATE TABLE shop.orders_by_customer (
    customer_id text,
    month       text,           -- bucket 'yyyy-MM' để partition không phình vô hạn
    created_at  timestamp,
    order_id    text,
    status      text,
    total       bigint,
    PRIMARY KEY ((customer_id, month), created_at, order_id)
) WITH CLUSTERING ORDER BY (created_at DESC, order_id ASC);

-- Access pattern khác cần bảng khác: tra cứu đơn theo mã
CREATE TABLE shop.orders_by_id (
    order_id    text PRIMARY KEY,
    customer_id text,
    status      text,
    total       bigint
);

-- Hợp lệ: chỉ định đầy đủ partition key
SELECT order_id, status, total FROM shop.orders_by_customer
WHERE customer_id = 'C-42' AND month = '2024-05' LIMIT 20;
```

Ứng dụng ghi vào cả hai bảng khi tạo đơn (dữ liệu trùng lặp là chủ ý). Truy vấn không có partition key sẽ bị từ chối, trừ khi thêm `ALLOW FILTERING`, và đó gần như luôn là dấu hiệu mô hình sai.

### Graph database: Neo4j

Dữ liệu là **node** (đỉnh) và **relationship** (cạnh), cả hai đều có thuộc tính. Thế mạnh là truy vấn đi qua nhiều bước quan hệ: gợi ý sản phẩm, phát hiện vòng gian lận, phân tích mạng lưới. Trong SQL, mỗi bước là một JOIN và chi phí tăng nhanh theo độ sâu; trong graph database, mỗi node giữ trực tiếp liên kết tới hàng xóm.

```text
// Cypher: sản phẩm được mua bởi những khách có cùng lịch sử mua với C-42
MATCH (me:Customer {id: 'C-42'})-[:BOUGHT]->(:Product)<-[:BOUGHT]-(other:Customer),
      (other)-[:BOUGHT]->(rec:Product)
WHERE NOT EXISTS { (me)-[:BOUGHT]->(rec) }
RETURN rec.name AS product, count(DISTINCT other) AS score
ORDER BY score DESC
LIMIT 5;
```

### So sánh nhanh

| Họ | Ví dụ | Mạnh ở | Yếu ở |
|---|---|---|---|
| Document | MongoDB | Schema linh hoạt, aggregate lồng nhau đọc một lần | Quan hệ nhiều-nhiều, dữ liệu dùng chung nhiều nơi |
| Key-value | DynamoDB, Redis | Độ trễ thấp, mở rộng gần như tuyến tính theo khoá | Truy vấn ngoài khoá, phân tích ad-hoc |
| Wide-column | Cassandra | Ghi lớn, dữ liệu chuỗi thời gian, multi-datacenter | Truy vấn linh hoạt, aggregate, cập nhật nhiều bảng nguyên tử |
| Graph | Neo4j | Truy vấn quan hệ nhiều bước | Quét và tổng hợp khối lượng lớn |

## Thiết kế dữ liệu theo access pattern

Quy trình thực tế khi thiết kế cho NoSQL:

1. **Liệt kê access pattern** trước khi vẽ bảng: "lấy 20 đơn mới nhất của khách", "tra đơn theo mã", "đếm đơn theo trạng thái mỗi giờ". Ghi kèm tần suất và yêu cầu độ trễ.
2. **Chọn khoá cho từng pattern**: partition key phải có nhiều giá trị khác nhau (high cardinality) và phân bố tải đều. `status` là partition key tồi vì chỉ vài giá trị và giá trị `PENDING` sẽ thành điểm nóng (hot partition).
3. **Chấp nhận trùng lặp**: lưu cùng dữ liệu ở nhiều dạng cho nhiều truy vấn, và xác định rõ ai chịu trách nhiệm cập nhật các bản sao.
4. **Giới hạn kích thước partition và document**: dùng bucket theo thời gian (`month` ở ví dụ Cassandra), tránh mảng tăng vô hạn trong document.
5. **Kiểm tra lại**: mỗi pattern phải được phục vụ bởi một truy vấn theo khoá, không quét toàn bảng.

Nếu danh sách access pattern quá dài, thay đổi liên tục hoặc cần truy vấn ad-hoc cho báo cáo, đó là tín hiệu nên dùng cơ sở dữ liệu quan hệ, hoặc đẩy dữ liệu sang kho phân tích riêng.

## Định lý CAP và PACELC

### CAP

Định lý CAP nói rằng một hệ dữ liệu phân tán không thể đồng thời đảm bảo cả ba tính chất:

- **Consistency (C)**: mọi lần đọc thấy kết quả của lần ghi mới nhất, như thể chỉ có một bản dữ liệu (linearizability). Đây **không** phải chữ C trong ACID.
- **Availability (A)**: mọi request tới một node còn sống đều nhận được phản hồi không phải lỗi.
- **Partition tolerance (P)**: hệ vẫn hoạt động khi mạng giữa các node bị đứt hoặc mất message.

Vì phân vùng mạng chắc chắn sẽ xảy ra trong hệ phân tán, lựa chọn thực tế là: **khi có partition**, hệ ưu tiên C (từ chối một số request để không trả dữ liệu cũ) hay ưu tiên A (vẫn trả lời, chấp nhận dữ liệu có thể cũ). Hệ dựa trên consensus như etcd, ZooKeeper chọn C; Cassandra, DynamoDB ở cấu hình mặc định nghiêng về A.

### PACELC

CAP chỉ nói về lúc có sự cố. PACELC, do Daniel Abadi đề xuất, bổ sung phần còn lại: **if Partition, choose A or C; Else, choose Latency or Consistency**. Ngay cả khi mạng bình thường, muốn đọc dữ liệu mới nhất thì phải chờ nhiều replica xác nhận, tức là tăng độ trễ. Abadi xếp các hệ kiểu Dynamo, Cassandra, Riak vào nhóm PA/EL: khi có partition ưu tiên availability, khi bình thường ưu tiên độ trễ thấp. Các hệ dựa trên consensus thuộc nhóm PC/EC.

Thực tế nhiều hệ cho phép **chỉnh** điểm cân bằng theo từng truy vấn, nên phân loại chỉ đúng với cấu hình mặc định. Câu hỏi đúng khi thiết kế là: "với dữ liệu này, người dùng chịu được dữ liệu cũ bao lâu, và chịu được độ trễ thêm bao nhiêu?".

## Eventual consistency và quorum

### Eventual consistency

**Eventual consistency** (nhất quán sau cùng) đảm bảo: nếu không có ghi mới, sau một khoảng thời gian mọi replica sẽ hội tụ về cùng giá trị. Nó không nói "bao lâu" và không đảm bảo bạn đọc được chính dữ liệu vừa ghi. Các bất thường thường gặp:

- **Không đọc được dữ liệu của chính mình (read-your-writes)**: người dùng đổi tên rồi tải lại trang, thấy tên cũ vì request đọc rơi vào replica chưa nhận bản ghi.
- **Đọc ngược thời gian (monotonic reads)**: lần đọc sau trả giá trị cũ hơn lần đọc trước vì rơi vào replica khác.

Các hệ hội tụ nhờ cơ chế như **read repair** (sửa replica cũ khi phát hiện lúc đọc), **hinted handoff** (node khác giữ hộ bản ghi khi replica đích đang tạm chết) và **anti-entropy repair** chạy định kỳ.

### Quorum read/write

Giả sử mỗi dữ liệu có **N** replica. Mỗi lần ghi chờ **W** replica xác nhận, mỗi lần đọc hỏi **R** replica và lấy bản mới nhất. Nếu **R + W > N**, tập replica được đọc luôn giao với tập replica đã ghi, nên lần đọc thấy được lần ghi gần nhất đã thành công.

```text
N = 3 replica: [A] [B] [C]

Ghi W = 2:   A ✔   B ✔   C (chưa nhận)
Đọc R = 2:   B     C          → B có bản mới → trả bản mới

R + W = 4 > 3  → luôn có ít nhất một replica chung
R = 1, W = 1   → nhanh nhất nhưng có thể đọc phải C (bản cũ)
```

Trong Cassandra, mức consistency đặt cho **từng câu lệnh**: `ONE`, `QUORUM` (đa số replica, bằng phần nguyên của `RF / 2` cộng 1; với replication factor RF = 3 là 2), `LOCAL_QUORUM` (đa số trong datacenter hiện tại, phổ biến cho hệ nhiều datacenter) và `ALL`.

```java
public class OrderCassandraDao {

    private final CqlSession session;
    private final PreparedStatement insert;
    private final PreparedStatement byCustomer;

    public OrderCassandraDao(CqlSession session) {
        this.session = session;
        this.insert = session.prepare("""
            INSERT INTO shop.orders_by_customer (customer_id, month, created_at, order_id, status, total)
            VALUES (?, ?, ?, ?, ?, ?)""");
        this.byCustomer = session.prepare("""
            SELECT order_id, status, total, created_at FROM shop.orders_by_customer
            WHERE customer_id = ? AND month = ? LIMIT 20""");
    }

    public void save(OrderRow o) {
        session.execute(insert
                .bind(o.customerId(), o.month(), o.createdAt(), o.orderId(), o.status(), o.total())
                .setConsistencyLevel(DefaultConsistencyLevel.LOCAL_QUORUM));   // W = 2 với RF = 3
    }

    public List<Row> recentOrders(String customerId, String month) {
        return session.execute(byCustomer
                .bind(customerId, month)
                .setConsistencyLevel(DefaultConsistencyLevel.LOCAL_QUORUM))     // R = 2 → R + W > N
                .all();
    }
}
```

Vài giới hạn cần biết. Quorum không biến Cassandra thành hệ linearizable: khi hai lần ghi đồng thời cùng một cột, Cassandra giữ bản có timestamp lớn hơn (last-write-wins), nên lệch đồng hồ giữa các máy có thể làm mất một lần ghi. Khi cần thao tác kiểu compare-and-set (ví dụ "chỉ tạo nếu chưa tồn tại"), Cassandra có **lightweight transaction** (`IF NOT EXISTS`, `IF col = ...`) dựa trên Paxos, chậm hơn đáng kể. MongoDB có khái niệm tương tự với `writeConcern: majority` và `readConcern: majority`; đọc từ secondary thì chấp nhận dữ liệu có thể cũ.

## Lỗi thường gặp

- **Mô hình hoá NoSQL như bảng quan hệ**: tách mọi thứ thành collection nhỏ rồi "JOIN" bằng nhiều lần gọi ở tầng ứng dụng. Hãy gom dữ liệu theo cách nó được đọc.
- **Chọn partition key có ít giá trị hoặc lệch tải**: `status`, `country`, hoặc ngày hiện tại làm partition key tạo hot partition. Chọn khoá có cardinality cao, thêm bucket nếu cần.
- **Partition hoặc document phình vô hạn**: toàn bộ lịch sử của một thiết bị IoT trong một partition Cassandra, hay mảng comment trong một document. Chia bucket theo thời gian hoặc tách ra collection riêng.
- **Dùng `ALLOW FILTERING` hay `Scan` để "chữa cháy" truy vấn mới**: chạy được với dữ liệu nhỏ, sập khi lên production. Tạo bảng hoặc index phục vụ đúng access pattern đó.
- **Dùng mức consistency mặc định mà không suy nghĩ**: đọc `ONE` sau khi ghi `ONE` rồi ngạc nhiên vì dữ liệu cũ. Chọn mức consistency có chủ đích cho từng loại dữ liệu và ghi vào tài liệu thiết kế.
- **Chọn NoSQL vì xu hướng**: dữ liệu giao dịch cần ràng buộc, transaction nhiều bảng và truy vấn ad-hoc thường hợp với PostgreSQL hơn.

## Bài tập thực hành

1. **Mô hình hoá theo access pattern**: cho ứng dụng nhắn tin với các pattern "lấy 50 tin mới nhất của một cuộc trò chuyện", "danh sách cuộc trò chuyện của người dùng sắp xếp theo tin mới nhất", "tra một tin theo id". Thiết kế bảng Cassandra (CQL) cho từng pattern, chỉ rõ partition key, clustering column và cách giới hạn kích thước partition.
2. **Thí nghiệm quorum**: chạy cụm Cassandra 3 node bằng Docker Compose, keyspace RF = 3. Ghi với `ONE`, dừng ngay một node, đọc với `ONE` và `QUORUM` từ các node khác nhau; ghi lại khi nào đọc được dữ liệu cũ và giải thích bằng công thức R + W > N.
3. **Viết ADR chọn kho dữ liệu**: cho hệ thương mại điện tử gồm đơn hàng, catalog sản phẩm, giỏ hàng và gợi ý sản phẩm, viết một Architecture Decision Record chọn kho cho từng loại dữ liệu, phân tích theo access pattern và PACELC.

## Tóm tắt

- Bốn họ NoSQL chính: document (MongoDB), key-value (DynamoDB, Redis), wide-column (Cassandra), graph (Neo4j), mỗi họ mạnh ở một kiểu truy vấn khác nhau.
- Với NoSQL, thiết kế bắt đầu từ access pattern; trùng lặp dữ liệu là chủ ý, đổi lại mỗi truy vấn chỉ chạm một partition.
- Partition key cần cardinality cao, phân bố đều và có giới hạn kích thước.
- CAP: khi có phân vùng mạng phải chọn giữa consistency và availability; PACELC bổ sung đánh đổi latency và consistency khi hệ bình thường.
- Eventual consistency đảm bảo hội tụ nhưng không đảm bảo read-your-writes; R + W > N giúp đọc thấy lần ghi gần nhất.
- Mức consistency có thể chỉnh theo từng truy vấn; hãy chọn có chủ đích và ghi rõ trong tài liệu kiến trúc.
