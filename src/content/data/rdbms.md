Phần lớn hệ thống doanh nghiệp, từ ngân hàng đến thương mại điện tử, vẫn đặt dữ liệu quan trọng nhất (đơn hàng, giao dịch, tài khoản) vào một cơ sở dữ liệu quan hệ như PostgreSQL hay MySQL. Khi hệ thống chậm, nguyên nhân thường không nằm ở Java mà ở một câu query thiếu index, một transaction giữ khoá quá lâu hay một connection pool cấu hình sai. Một Solution Architect hoặc Dev Lead phải thiết kế được schema đúng ngay từ đầu, đọc được execution plan và giải thích được vì sao hai request đồng thời lại làm sai số dư. Bài này dùng PostgreSQL làm ví dụ chính, phần lớn kiến thức áp dụng được cho MySQL.

## Mục tiêu bài học

- Thiết kế schema theo 1NF, 2NF, 3NF và biết khi nào phi chuẩn hoá có chủ đích.
- Hiểu cách B-Tree index hoạt động, thiết kế composite index và covering index cho truy vấn thực tế.
- Đọc kết quả `EXPLAIN ANALYZE` để tìm điểm nghẽn và tối ưu query.
- Giải thích ACID, các mức isolation và các hiện tượng dirty read, non-repeatable read, phantom read.
- Cấu hình HikariCP hợp lý cho một service Spring Boot.

## Thiết kế schema và chuẩn hoá

Chuẩn hoá (normalization) là quá trình tổ chức bảng sao cho mỗi sự thật (fact) chỉ được lưu ở **một chỗ**. Mục đích là tránh dị thường khi cập nhật (update anomaly): sửa email khách hàng ở một dòng nhưng quên các dòng khác.

### Ba dạng chuẩn cơ bản

- **1NF (First Normal Form)**: mỗi cột chứa giá trị nguyên tử, không có nhóm lặp. Cột `products = 'iPhone, Ốp lưng'` vi phạm 1NF, vì muốn tìm "ai mua ốp lưng" phải cắt chuỗi.
- **2NF**: đạt 1NF và mọi cột không thuộc khoá phải phụ thuộc vào **toàn bộ** khoá chính, không chỉ một phần. Bảng `order_items(order_id, product_id, quantity, product_name)` với khoá `(order_id, product_id)` vi phạm 2NF, vì `product_name` chỉ phụ thuộc `product_id`.
- **3NF**: đạt 2NF và không có phụ thuộc bắc cầu, tức cột không khoá không được phụ thuộc vào một cột không khoá khác. Bảng `orders(id, customer_id, customer_email)` vi phạm 3NF, vì `customer_email` phụ thuộc `customer_id` chứ không phụ thuộc `id` của đơn.

Schema chuẩn hoá cho một hệ thống bán hàng đơn giản:

```sql
CREATE TABLE customers (
    id         BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    email      VARCHAR(255) NOT NULL UNIQUE,
    full_name  VARCHAR(200) NOT NULL,
    created_at TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE TABLE products (
    id    BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    sku   VARCHAR(64)   NOT NULL UNIQUE,
    name  VARCHAR(255)  NOT NULL,
    price NUMERIC(12,2) NOT NULL CHECK (price >= 0)
);

CREATE TABLE orders (
    id           BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    customer_id  BIGINT        NOT NULL REFERENCES customers(id),
    status       VARCHAR(20)   NOT NULL,
    total_amount NUMERIC(14,2) NOT NULL,   -- phi chuẩn hoá có chủ đích
    created_at   TIMESTAMPTZ   NOT NULL DEFAULT now()
);

CREATE TABLE order_items (
    order_id   BIGINT        NOT NULL REFERENCES orders(id),
    product_id BIGINT        NOT NULL REFERENCES products(id),
    quantity   INT           NOT NULL CHECK (quantity > 0),
    unit_price NUMERIC(12,2) NOT NULL,     -- giá tại thời điểm mua, không phải bản sao
    PRIMARY KEY (order_id, product_id)
);

-- PostgreSQL KHÔNG tự tạo index cho cột foreign key
CREATE INDEX idx_order_items_product ON order_items (product_id);
```

Hai chi tiết đáng chú ý. Thứ nhất, `unit_price` trong `order_items` **không phải** là dữ liệu trùng lặp: giá sản phẩm có thể đổi ngày mai, còn giá trong đơn là một sự thật lịch sử riêng. Thứ hai, PostgreSQL tạo index cho primary key và unique constraint, nhưng **không** tự tạo index cho cột foreign key. Thiếu index này, câu `DELETE FROM products WHERE id = ...` phải quét toàn bộ `order_items` để kiểm tra ràng buộc.

### Khi nào nên phi chuẩn hoá

Phi chuẩn hoá (denormalization) là cố ý lưu dữ liệu dư thừa để đọc nhanh hơn, chấp nhận chi phí giữ chúng đồng bộ. Cột `total_amount` ở trên là ví dụ: có thể tính lại từ `order_items`, nhưng màn hình danh sách đơn cần nó ở mọi dòng.

Nên phi chuẩn hoá khi:

- Truy vấn đọc chiếm áp đảo và phép JOIN/aggregate đã được đo là điểm nghẽn.
- Dữ liệu dẫn xuất ít thay đổi, hoặc chấp nhận được độ trễ (bảng báo cáo, materialized view làm mới định kỳ).
- Bạn có một cơ chế rõ ràng để cập nhật bản sao: cùng transaction, trigger, hoặc event.

Không nên phi chuẩn hoá chỉ vì "JOIN chậm" khi chưa đo, hay khi dữ liệu thay đổi liên tục. Quy tắc thực tế: **bắt đầu từ 3NF, phi chuẩn hoá từng chỗ có số liệu chứng minh**.

## Index trong PostgreSQL

### B-Tree index hoạt động thế nào

Index mặc định của PostgreSQL là **B-Tree**, một cây cân bằng mà các nút lá chứa giá trị khoá đã sắp xếp kèm con trỏ tới dòng dữ liệu trong bảng (heap). Vì cây cân bằng, tìm một giá trị chỉ cần đi qua vài tầng, kể cả với hàng chục triệu dòng. Vì lá đã sắp xếp, B-Tree hỗ trợ tốt `=`, `<`, `>`, `BETWEEN`, `IN`, `ORDER BY` và `IS NULL`.

B-Tree **không** giúp được khi:

- Bọc cột trong hàm: `WHERE lower(email) = 'a@b.vn'` không dùng index trên `email`. Giải pháp là expression index `CREATE INDEX ON customers (lower(email))`.
- Tìm chuỗi con `LIKE '%abc%'`. Cần full-text search hoặc index trigram (extension `pg_trgm`).
- Điều kiện có độ chọn lọc thấp, ví dụ cột `status` chỉ có 3 giá trị. Planner thường chọn quét toàn bảng vì rẻ hơn.

Mỗi index cũng có giá: tốn dung lượng và làm chậm mọi `INSERT`, `UPDATE`, `DELETE` vì phải cập nhật cây. Đừng tạo index "cho chắc".

### Composite index

Composite index (index nhiều cột) sắp xếp theo cột thứ nhất, rồi đến cột thứ hai trong cùng giá trị cột thứ nhất, và cứ thế. Hệ quả là **quy tắc tiền tố trái nhất (leftmost prefix)**: index `(customer_id, status, created_at)` phục vụ hiệu quả điều kiện trên `customer_id`, hoặc `customer_id + status`, nhưng thường không giúp truy vấn chỉ lọc theo `created_at`.

Thứ tự cột nên theo nguyên tắc: **cột so sánh bằng trước, cột range hoặc sắp xếp sau**.

```sql
-- Truy vấn: 20 đơn đã thanh toán gần nhất của một khách
SELECT id, total_amount, created_at
FROM orders
WHERE customer_id = 42 AND status = 'PAID'
ORDER BY created_at DESC
LIMIT 20;

-- Hai cột so sánh bằng đứng trước, cột sắp xếp đứng sau:
-- PostgreSQL đọc đúng 20 dòng theo thứ tự index, không cần Sort
CREATE INDEX CONCURRENTLY idx_orders_customer_status_created
    ON orders (customer_id, status, created_at DESC);

-- Covering index: thêm cột vào nút lá bằng INCLUDE để có Index Only Scan
CREATE INDEX CONCURRENTLY idx_orders_customer_created_cover
    ON orders (customer_id, created_at DESC)
    INCLUDE (total_amount);
```

`CREATE INDEX CONCURRENTLY` tạo index mà không khoá ghi trên bảng, nên dùng trên production (chậm hơn và không chạy được bên trong transaction block).

> **Lưu ý:** PostgreSQL 18 bổ sung skip scan cho B-Tree nhiều cột, giúp dùng được index trong một số trường hợp thiếu điều kiện trên cột đầu. Đừng thiết kế dựa vào tính năng này; quy tắc tiền tố trái nhất vẫn là nền tảng.

### Covering index và Index Only Scan

Khi tất cả cột mà query cần đều nằm trong index, PostgreSQL có thể trả kết quả chỉ từ index mà không đọc heap, gọi là **Index Only Scan**. Mệnh đề `INCLUDE` (từ PostgreSQL 11) cho phép đưa cột vào nút lá mà không tham gia sắp xếp. Với index `idx_orders_customer_created_cover`, truy vấn `SELECT created_at, total_amount FROM orders WHERE customer_id = 42 ORDER BY created_at DESC` không cần chạm vào bảng.

Index Only Scan chỉ thật sự nhanh khi **visibility map** được cập nhật, tức các trang dữ liệu đã được `VACUUM` đánh dấu "mọi dòng đều visible". Trên bảng ghi nhiều mà autovacuum chạy không kịp, plan sẽ hiện `Heap Fetches` lớn.

## Đọc execution plan với EXPLAIN ANALYZE

`EXPLAIN` cho biết planner **dự định** chạy query thế nào. `EXPLAIN ANALYZE` **chạy thật** câu lệnh rồi báo thời gian và số dòng thực tế. Vì chạy thật, khi phân tích `UPDATE` hay `DELETE`, hãy bọc trong `BEGIN; ... ROLLBACK;`. Thêm `BUFFERS` để thấy số trang đọc từ cache hay từ đĩa (từ PostgreSQL 18, `BUFFERS` được bật mặc định khi dùng `ANALYZE`).

```sql
EXPLAIN (ANALYZE, BUFFERS, COSTS OFF)
SELECT created_at, total_amount
FROM orders
WHERE customer_id = 42
ORDER BY created_at DESC
LIMIT 20;
```

Kết quả trước khi có index (số liệu minh hoạ, định dạng có thể khác nhau giữa các phiên bản):

```text
Limit (actual time=152.410..152.416 rows=20 loops=1)
  ->  Sort (actual time=152.408..152.411 rows=20 loops=1)
        Sort Key: created_at DESC
        Sort Method: top-N heapsort  Memory: 27kB
        ->  Seq Scan on orders (actual time=0.021..151.902 rows=282 loops=1)
              Filter: (customer_id = 42)
              Rows Removed by Filter: 1999718
              Buffers: shared hit=2112 read=14321
Execution Time: 152.480 ms
```

Sau khi tạo covering index:

```text
Limit (actual time=0.030..0.058 rows=20 loops=1)
  ->  Index Only Scan using idx_orders_customer_created_cover on orders
        (actual time=0.029..0.054 rows=20 loops=1)
        Index Cond: (customer_id = 42)
        Heap Fetches: 0
        Buffers: shared hit=5
Execution Time: 0.075 ms
```

Cách đọc plan:

- Đọc từ nút **trong cùng** ra ngoài; mỗi nút nhận dòng từ nút con.
- So sánh **số dòng ước lượng** (khi bật COSTS) với **số dòng thực tế**. Lệch hàng chục lần thường do thống kê cũ; chạy `ANALYZE orders` hoặc kiểm tra autovacuum.
- `Seq Scan` trên bảng lớn kèm `Rows Removed by Filter` khổng lồ là dấu hiệu thiếu index.
- `Sort Method: external merge Disk` nghĩa là sort tràn ra đĩa; cân nhắc index phù hợp với `ORDER BY` hoặc tăng `work_mem` cho phiên đó.
- `Nested Loop` với `loops` rất lớn ở nút con là dấu hiệu join kém, thường thiếu index trên cột join.

Các kỹ thuật tối ưu thường dùng: không bọc cột trong hàm (hoặc dùng expression index), viết điều kiện ngày dạng range `created_at >= '2024-05-01' AND created_at < '2024-05-02'` thay vì `created_at::date = ...`, chỉ `SELECT` cột cần dùng, thay `OFFSET` lớn bằng keyset pagination, và xử lý N+1 query ở tầng ORM.

## Transaction, ACID và isolation

### ACID

- **Atomicity**: mọi thao tác trong transaction cùng thành công hoặc cùng bị huỷ.
- **Consistency**: transaction đưa database từ trạng thái hợp lệ này sang trạng thái hợp lệ khác, tôn trọng mọi ràng buộc (khoá ngoại, `CHECK`, unique).
- **Isolation**: các transaction chạy đồng thời không thấy trạng thái dở dang của nhau, ở mức độ do isolation level quy định.
- **Durability**: đã commit thì không mất, kể cả khi server sập ngay sau đó (PostgreSQL ghi WAL xuống đĩa trước khi báo commit thành công).

### Các hiện tượng và mức isolation

- **Dirty read**: đọc được dữ liệu mà transaction khác chưa commit (và có thể sẽ rollback).
- **Non-repeatable read**: đọc cùng một dòng hai lần trong một transaction và nhận giá trị khác nhau, vì transaction khác đã commit thay đổi ở giữa.
- **Phantom read**: chạy lại cùng một điều kiện `WHERE` và thấy **tập dòng** khác, vì transaction khác đã chèn hoặc xoá dòng thoả điều kiện.

| Mức isolation (chuẩn SQL) | Dirty read | Non-repeatable read | Phantom read |
|---|---|---|---|
| Read Uncommitted | Có thể | Có thể | Có thể |
| Read Committed | Không | Có thể | Có thể |
| Repeatable Read | Không | Không | Có thể |
| Serializable | Không | Không | Không |

Cách PostgreSQL hiện thực khác bảng chuẩn ở vài điểm quan trọng:

- Mặc định là **Read Committed**; mỗi câu lệnh thấy một snapshot mới. MySQL InnoDB mặc định là Repeatable Read.
- Read Uncommitted được xử lý như Read Committed, nên PostgreSQL không bao giờ có dirty read.
- **Repeatable Read** dùng một snapshot cho cả transaction, nên không có cả phantom read. Nếu hai transaction cùng sửa một dòng, transaction sau bị lỗi `could not serialize access due to concurrent update`.
- **Serializable** dùng Serializable Snapshot Isolation, phát hiện cả bất thường kiểu write skew và huỷ một transaction với SQLSTATE `40001`. Ứng dụng **bắt buộc** phải retry.

Ngoài ba hiện tượng kinh điển, lỗi hay gặp nhất trong thực tế là **lost update**: hai request cùng đọc tồn kho = 10, cùng ghi 9, kết quả đúng phải là 8. Ở Read Committed, cách sửa đơn giản nhất là để database tự tính:

```java
@Service
public class InventoryService {

    private final JdbcTemplate jdbc;

    public InventoryService(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    // Đọc-sửa-ghi trong MỘT câu lệnh: không có khoảng trống cho lost update
    @Transactional
    public void reserve(long productId, int qty) {
        int updated = jdbc.update("""
                UPDATE inventory
                   SET available = available - ?
                 WHERE product_id = ? AND available >= ?
                """, qty, productId, qty);
        if (updated == 0) {
            throw new OutOfStockException(productId);
        }
    }
}
```

Các lựa chọn khác: khoá bi quan bằng `SELECT ... FOR UPDATE`, hoặc khoá lạc quan bằng cột version (`@Version` trong JPA). Khi logic phức tạp hơn, ví dụ ràng buộc trải trên nhiều dòng, hãy dùng Serializable kèm retry:

```java
@Service
public class TransferService {

    private final TransactionTemplate tx;
    private final AccountDao accounts;

    public TransferService(PlatformTransactionManager tm, AccountDao accounts) {
        this.tx = new TransactionTemplate(tm);
        this.tx.setIsolationLevel(TransactionDefinition.ISOLATION_SERIALIZABLE);
        this.accounts = accounts;
    }

    public void transfer(long from, long to, BigDecimal amount) {
        for (int attempt = 1; ; attempt++) {
            try {
                tx.executeWithoutResult(status -> {
                    accounts.debit(from, amount);
                    accounts.credit(to, amount);
                });
                return;
            } catch (ConcurrencyFailureException e) {   // lỗi serialization được Spring dịch sang đây
                if (attempt == 3) throw e;
            }
        }
    }
}
```

Retry phải bao **toàn bộ** transaction chứ không chỉ câu lệnh lỗi, vì cả transaction đã bị huỷ. Tuỳ driver và ORM, lớp exception cụ thể có thể khác nhau, nhưng đều là lớp con của `ConcurrencyFailureException`; hãy xác nhận bằng integration test.

## Connection pool với HikariCP

Mở một connection tới PostgreSQL tốn kém: bắt tay TCP, có thể cả TLS, xác thực, và PostgreSQL tạo hẳn một **process** riêng cho mỗi connection. Connection pool giữ sẵn một số connection để tái sử dụng. Spring Boot dùng **HikariCP** làm pool mặc định.

Các thông số quan trọng:

- `maximum-pool-size`: số connection tối đa (mặc định 10). Đây là **giới hạn đồng thời thật** tới database, không phải số request đồng thời của ứng dụng.
- `minimum-idle`: số connection rảnh tối thiểu. HikariCP khuyến nghị không đặt, để pool hoạt động với kích thước cố định.
- `connection-timeout`: thời gian chờ lấy connection trước khi ném lỗi (mặc định 30 giây, thường nên giảm để lỗi sớm).
- `max-lifetime`: tuổi thọ tối đa của một connection (mặc định 30 phút), nên ngắn hơn vài giây so với timeout mà database, proxy hay firewall áp đặt.
- `leak-detection-threshold`: cảnh báo khi một connection bị mượn quá lâu, rất hữu ích để tìm chỗ quên đóng connection hay transaction quá dài.

```yaml
spring:
  datasource:
    url: jdbc:postgresql://db:5432/shop
    username: shop_app
    password: ${DB_PASSWORD}
    hikari:
      pool-name: shop-pool
      maximum-pool-size: 10
      connection-timeout: 3000          # ms, lỗi sớm thay vì treo request 30 giây
      max-lifetime: 1500000             # 25 phút
      leak-detection-threshold: 20000   # cảnh báo nếu giữ connection quá 20 giây
  jpa:
    open-in-view: false                 # không giữ connection suốt quá trình render response
```

Pool **lớn hơn không có nghĩa là nhanh hơn**. Database chỉ có số core và băng thông I/O hữu hạn; quá nhiều connection đồng thời làm tăng tranh chấp khoá và context switch. Wiki của HikariCP gợi ý điểm khởi đầu `connections = (số core × 2) + số ổ đĩa hiệu dụng`, sau đó đo tải thực tế để điều chỉnh.

Hãy luôn tính **tổng** connection: 12 instance × 10 connection = 120, đã vượt `max_connections` mặc định của PostgreSQL là 100. Khi số instance lớn, đặt một connection pooler như PgBouncer phía trước database. Với Java 21 virtual thread, ứng dụng có thể phục vụ hàng nghìn request đồng thời, nhưng pool vẫn là "van" giới hạn số query chạy cùng lúc; đó là điều tốt, miễn `connection-timeout` được đặt hợp lý.

## Lỗi thường gặp

- **Quên index cho foreign key**: JOIN và xoá dòng cha chậm dần theo dữ liệu. Tạo index cho mọi cột FK được dùng để join hoặc lọc.
- **Tạo index từng cột riêng lẻ thay vì composite**: ba index đơn trên `customer_id`, `status`, `created_at` kém xa một composite index đúng thứ tự cho truy vấn chính.
- **Chỉ dùng `EXPLAIN` mà không `ANALYZE`**: ước lượng có thể sai rất xa thực tế. Luôn đo bằng `EXPLAIN (ANALYZE, BUFFERS)` trên dữ liệu có kích thước gần production.
- **Đọc-rồi-ghi ở tầng Java**: `find()` rồi `setStock(stock - 1)` rồi `save()` sinh lost update. Dùng câu `UPDATE` nguyên tử, khoá hoặc `@Version`.
- **Dùng Serializable nhưng không retry**: lỗi `40001` là hành vi bình thường của mức này, không phải bug. Phải có vòng retry bao cả transaction.
- **Gọi HTTP hoặc gửi message bên trong transaction**: connection bị giữ suốt thời gian chờ bên ngoài, pool cạn rất nhanh. Tách lời gọi ngoài ra khỏi transaction.
- **Tăng `maximum-pool-size` để "chữa" chậm**: nếu query chậm, pool lớn chỉ đẩy thêm tải vào database. Tìm và sửa query trước.

## Bài tập thực hành

1. **Thiết kế và chuẩn hoá**: cho bảng phẳng `sales(order_code, order_date, customer_name, customer_phone, product_sku, product_name, qty, price)`, hãy tách thành các bảng đạt 3NF, viết DDL PostgreSQL và chỉ ra một cột bạn chọn phi chuẩn hoá kèm lý do.
2. **Tối ưu bằng index**: dùng `generate_series` sinh 2 triệu dòng cho bảng `orders`. Chạy `EXPLAIN (ANALYZE, BUFFERS)` cho truy vấn "20 đơn mới nhất của khách X có trạng thái PAID", ghi lại thời gian; sau đó thử lần lượt index đơn, composite index và covering index, so sánh plan của từng phương án.
3. **Tái hiện lost update**: viết một integration test bằng Testcontainers PostgreSQL, chạy 50 virtual thread cùng trừ tồn kho theo kiểu đọc-rồi-ghi qua JPA và chứng minh kết quả sai. Sửa lần lượt bằng câu `UPDATE` nguyên tử và bằng `@Version`, so sánh số lần retry.

## Tóm tắt

- Bắt đầu thiết kế ở 3NF; chỉ phi chuẩn hoá ở chỗ có số liệu chứng minh và có cơ chế đồng bộ rõ ràng.
- B-Tree hỗ trợ so sánh bằng, range và sắp xếp; composite index tuân theo quy tắc tiền tố trái nhất, cột so sánh bằng đặt trước cột range.
- Covering index với `INCLUDE` cho phép Index Only Scan, nhưng cần visibility map được VACUUM cập nhật.
- `EXPLAIN (ANALYZE, BUFFERS)` là công cụ chính để tối ưu; chú ý lệch giữa số dòng ước lượng và thực tế.
- PostgreSQL mặc định Read Committed, không có dirty read; Repeatable Read chặn cả phantom; Serializable cần retry khi gặp lỗi `40001`.
- Lost update là lỗi đồng thời phổ biến nhất; xử lý bằng cập nhật nguyên tử, khoá bi quan hoặc khoá lạc quan.
- Connection pool nhỏ và ổn định thường tốt hơn pool lớn; luôn tính tổng connection của mọi instance so với giới hạn của database.
