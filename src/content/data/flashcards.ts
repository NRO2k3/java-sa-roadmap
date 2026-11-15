import type { LessonFlashcards } from '../types';

const flashcards: LessonFlashcards = {
  rdbms: [
    {
      front: 'Ba dạng chuẩn 1NF, 2NF, 3NF yêu cầu gì?',
      back: '1NF: giá trị nguyên tử, không có nhóm lặp. 2NF: mọi cột không khoá phụ thuộc vào toàn bộ khoá chính. 3NF: không có phụ thuộc bắc cầu giữa các cột không khoá.',
    },
    {
      front: 'Khi nào nên phi chuẩn hoá?',
      back: 'Khi truy vấn đọc chiếm áp đảo, JOIN hoặc aggregate đã được đo là điểm nghẽn, và có cơ chế rõ ràng giữ bản sao đồng bộ. Bắt đầu từ 3NF, chỉ phi chuẩn hoá chỗ có số liệu chứng minh.',
    },
    {
      front: 'PostgreSQL có tự tạo index cho cột foreign key không?',
      back: 'Không. Chỉ primary key và unique constraint có index tự động. Cần tự tạo index cho cột FK dùng để join, lọc, và để xoá dòng cha không phải quét toàn bảng con.',
    },
    {
      front: 'Quy tắc tiền tố trái nhất của composite index?',
      back: 'Index (a, b, c) phục vụ điều kiện trên a, a + b, a + b + c, nhưng thường không giúp truy vấn chỉ lọc b hoặc c. Đặt cột so sánh bằng trước, cột range hoặc sắp xếp sau.',
    },
    {
      front: 'Covering index và Index Only Scan là gì?',
      back: 'Khi mọi cột truy vấn cần đều nằm trong index (thêm bằng INCLUDE), PostgreSQL trả kết quả mà không đọc heap. Hiệu quả phụ thuộc visibility map được VACUUM cập nhật; Heap Fetches lớn là dấu hiệu chưa tốt.',
    },
    {
      front: 'Khác nhau giữa EXPLAIN và EXPLAIN ANALYZE?',
      back: 'EXPLAIN chỉ hiện kế hoạch dự kiến. EXPLAIN ANALYZE chạy thật câu lệnh và báo thời gian, số dòng thực tế; với UPDATE hoặc DELETE nên bọc trong BEGIN và ROLLBACK.',
    },
    {
      front: 'Dấu hiệu thiếu index trong execution plan?',
      back: 'Seq Scan trên bảng lớn kèm Rows Removed by Filter rất lớn so với số dòng trả về. Số dòng ước lượng lệch xa thực tế thì gợi ý thống kê cũ, cần chạy ANALYZE.',
    },
    {
      front: 'Dirty read, non-repeatable read, phantom read khác nhau thế nào?',
      back: 'Dirty read: đọc dữ liệu chưa commit. Non-repeatable read: đọc lại một dòng thấy giá trị khác. Phantom read: chạy lại cùng điều kiện thấy tập dòng khác do dòng mới được chèn hoặc xoá.',
    },
    {
      front: 'Isolation trong PostgreSQL có gì khác chuẩn SQL?',
      back: 'Mặc định Read Committed; Read Uncommitted chạy như Read Committed nên không có dirty read; Repeatable Read chặn cả phantom; Serializable có thể huỷ transaction với SQLSTATE 40001 và ứng dụng phải retry cả transaction.',
    },
    {
      front: 'Ba cách tránh lost update?',
      back: 'Câu UPDATE nguyên tử như SET stock = stock - 1 WHERE stock >= 1, khoá bi quan bằng SELECT ... FOR UPDATE, hoặc khoá lạc quan bằng cột version (@Version trong JPA).',
    },
    {
      front: 'Các thông số HikariCP cần chú ý?',
      back: 'maximum-pool-size (mặc định 10), connection-timeout (mặc định 30 giây, nên giảm để lỗi sớm), max-lifetime ngắn hơn timeout của database và hạ tầng, leak-detection-threshold để phát hiện connection bị giữ quá lâu.',
    },
    {
      front: 'Vì sao pool lớn hơn không có nghĩa là nhanh hơn?',
      back: 'Database có số core và I/O hữu hạn; quá nhiều connection đồng thời gây tranh chấp khoá và context switch. Luôn tính tổng connection của mọi instance so với max_connections, dùng PgBouncer khi cần.',
    },
  ],
  nosql: [
    {
      front: 'Bốn họ NoSQL chính và ví dụ tiêu biểu?',
      back: 'Document (MongoDB), key-value (DynamoDB, Redis), wide-column (Cassandra), graph (Neo4j). Mỗi họ mạnh ở một kiểu truy vấn khác nhau.',
    },
    {
      front: 'MongoDB: khi nào nhúng, khi nào tham chiếu?',
      back: 'Nhúng khi dữ liệu luôn đọc cùng nhau, thuộc sở hữu document cha và có giới hạn số lượng. Tham chiếu khi quan hệ nhiều-nhiều, mảng có thể phình vô hạn hoặc dữ liệu con cập nhật độc lập. Document tối đa 16 MB.',
    },
    {
      front: 'Partition key và sort key trong DynamoDB?',
      back: 'Partition key quyết định item nằm ở partition vật lý nào; sort key sắp xếp các item trong cùng partition. Query theo partition key kèm điều kiện trên sort key; Scan toàn bảng chậm và tốn chi phí.',
    },
    {
      front: 'Partition key và clustering column trong Cassandra?',
      back: 'Partition key được hash để chọn node và phải được chỉ định đầy đủ trong mọi truy vấn. Clustering column quyết định thứ tự các dòng bên trong partition.',
    },
    {
      front: 'Nguyên tắc thiết kế bảng Cassandra?',
      back: 'Một bảng cho mỗi access pattern, mỗi truy vấn chỉ đọc một partition, chấp nhận trùng lặp dữ liệu, giới hạn kích thước partition bằng bucket theo thời gian. Phải dùng ALLOW FILTERING là dấu hiệu mô hình sai.',
    },
    {
      front: 'Khi nào graph database phù hợp?',
      back: 'Khi truy vấn đi qua nhiều bước quan hệ: gợi ý sản phẩm, phát hiện vòng gian lận, phân tích mạng lưới. Mỗi node giữ trực tiếp liên kết tới hàng xóm nên không tốn chi phí JOIN tăng theo độ sâu.',
    },
    {
      front: 'Các bước thiết kế dữ liệu theo access pattern?',
      back: 'Liệt kê access pattern kèm tần suất và độ trễ, chọn khoá cho từng pattern, chấp nhận trùng lặp, giới hạn kích thước partition và document, rồi kiểm tra mỗi pattern được phục vụ bằng truy vấn theo khoá.',
    },
    {
      front: 'Partition key tốt cần đặc điểm gì?',
      back: 'Cardinality cao và phân bố tải đều. Khoá như status hay country tạo hot partition vì vài giá trị nhận phần lớn lưu lượng.',
    },
    {
      front: 'Chữ C trong CAP khác chữ C trong ACID thế nào?',
      back: 'C trong CAP là linearizability: mọi lần đọc thấy lần ghi mới nhất như thể chỉ có một bản dữ liệu. C trong ACID là transaction đưa database tới trạng thái thoả mọi ràng buộc.',
    },
    {
      front: 'PACELC bổ sung gì cho CAP?',
      back: 'Khi có partition chọn A hoặc C; khi bình thường (Else) chọn Latency hoặc Consistency. Abadi xếp Dynamo, Cassandra, Riak vào nhóm PA/EL; các hệ dựa trên consensus thuộc nhóm PC/EC.',
    },
    {
      front: 'Eventual consistency gây những bất thường nào?',
      back: 'Không đọc được dữ liệu vừa ghi (read-your-writes) và đọc ngược thời gian (monotonic reads) khi các lần đọc rơi vào replica khác nhau. Hệ hội tụ nhờ read repair, hinted handoff và anti-entropy repair.',
    },
    {
      front: 'Công thức quorum và ví dụ với Cassandra?',
      back: 'Nếu R + W > N thì lần đọc thấy lần ghi thành công gần nhất. Với RF = 3, ghi và đọc ở LOCAL_QUORUM (2 replica) cho 2 + 2 > 3. Ghi đồng thời cùng một cột vẫn theo last-write-wins.',
    },
  ],
  caching: [
    {
      front: 'Cache phù hợp với loại dữ liệu nào?',
      back: 'Dữ liệu đọc nhiều hơn ghi rất nhiều, tốn kém để tính hoặc truy xuất, và chấp nhận cũ đi một chút như catalog, cấu hình. Không hợp với số dư hay tồn kho lúc thanh toán.',
    },
    {
      front: 'Cache-aside hoạt động thế nào?',
      back: 'Đọc cache trước; miss thì đọc database rồi ghi vào cache. Khi cập nhật, ghi database rồi xoá khoá cache sau khi commit. Ứng dụng tự quản lý toàn bộ logic cache.',
    },
    {
      front: 'Khác nhau giữa read-through và write-through?',
      back: 'Read-through: khi miss, thư viện cache tự gọi loader để nạp từ database. Write-through: mỗi lần ghi đi qua cache và được ghi đồng bộ xuống database trước khi trả về.',
    },
    {
      front: 'Rủi ro của write-behind là gì?',
      back: 'Ghi vào cache rồi trả về ngay, database được ghi bất đồng bộ sau. Nhanh và gộp được nhiều lần ghi, nhưng mất dữ liệu nếu cache sập trước khi kịp ghi. Chỉ dùng cho dữ liệu như bộ đếm lượt xem.',
    },
    {
      front: '@Cacheable, @CachePut, @CacheEvict khác nhau thế nào?',
      back: '@Cacheable trả từ cache nếu có, nếu không thì chạy method và lưu kết quả. @CachePut luôn chạy method và ghi kết quả vào cache. @CacheEvict xoá một khoá hoặc toàn bộ cache.',
    },
    {
      front: 'Giới hạn của @Cacheable(sync = true)?',
      back: 'Chỉ đồng bộ các thread trong một JVM, không chặn được nhiều instance cùng nạp một khoá. Không dùng được cùng thuộc tính unless và chỉ áp cho một cache.',
    },
    {
      front: 'Vì sao bật transactionAware() cho RedisCacheManager?',
      back: 'Để put và evict chỉ thực hiện sau khi transaction commit. Nếu không, evict có thể chạy trước commit và request khác kịp nạp lại giá trị cũ vào cache.',
    },
    {
      front: 'Cache stampede là gì và xử lý thế nào?',
      back: 'Khoá nóng hết hạn, rất nhiều request cùng miss và dồn xuống database. Xử lý bằng một-request-nạp (khoá phân tán SET NX PX), làm mới trước khi hết hạn (refreshAfterWrite) và thêm jitter vào TTL.',
    },
    {
      front: 'Cache penetration là gì và xử lý thế nào?',
      back: 'Request hỏi khoá không tồn tại nên luôn xuyên xuống database. Xử lý bằng cache giá trị rỗng với TTL ngắn, Bloom filter chứa id hợp lệ, kiểm tra đầu vào và rate limiting.',
    },
    {
      front: 'Xử lý hot key trong Redis Cluster thế nào?',
      back: 'Một khoá thuộc một hash slot do một master phụ trách, nên thêm node không giúp. Dùng cache L1 cục bộ TTL ngắn, nhân bản khoá thành nhiều bản đọc ngẫu nhiên, hoặc đọc từ replica.',
    },
    {
      front: 'Khi ghi dữ liệu, vì sao nên xoá cache thay vì ghi đè?',
      back: 'Hai lần cập nhật đồng thời có thể ghi cache theo thứ tự ngược với thứ tự commit, để lại giá trị cũ tới hết TTL. Xoá khoá buộc lần đọc sau nạp giá trị mới nhất từ database.',
    },
    {
      front: 'Các chiến lược invalidation cache?',
      back: 'Chỉ dựa vào TTL; xoá khi ghi, sau commit; invalidation theo event hoặc CDC khi nhiều service cùng cache; version trong khoá (product:v2:42) khi đổi cấu trúc dữ liệu cache. Mọi khoá đều nên có TTL.',
    },
  ],
  'scaling-data': [
    {
      front: 'Leader-follower replication hoạt động thế nào?',
      back: 'Mọi lần ghi vào leader; leader gửi log (WAL với PostgreSQL) cho các follower để replay. Đọc có thể chia cho follower để giảm tải leader.',
    },
    {
      front: 'Replication đồng bộ khác bất đồng bộ thế nào?',
      back: 'Bất đồng bộ: leader commit không chờ follower, ghi nhanh nhưng có thể mất transaction cuối khi failover. Đồng bộ: chờ ít nhất một follower xác nhận, không mất dữ liệu đã commit nhưng ghi chậm hơn.',
    },
    {
      front: 'Split brain là gì?',
      back: 'Hai node cùng tin mình là leader và cùng nhận ghi sau failover, gây xung đột dữ liệu. Công cụ như Patroni dùng hệ consensus (etcd, Consul) để đảm bảo chỉ có một leader.',
    },
    {
      front: 'Xử lý read-your-writes khi replica bị trễ?',
      back: 'Đọc dữ liệu của người dùng vừa ghi từ leader trong khoảng ngắn sau khi ghi, chỉ đọc từ replica đã replay tới LSN của lần ghi, hoặc gắn phiên người dùng với một replica cố định.',
    },
    {
      front: 'Định tuyến đọc sang replica trong Spring thế nào?',
      back: 'AbstractRoutingDataSource chọn primary hoặc replica theo isCurrentTransactionReadOnly(), bọc bằng LazyConnectionDataSourceProxy để chỉ lấy connection sau khi cờ readOnly đã được đặt.',
    },
    {
      front: 'Multi-leader replication đánh đổi gì?',
      back: 'Cho phép ghi ở nhiều vùng với độ trễ thấp nhưng phải giải quyết xung đột ghi bằng last-write-wins, gộp nghiệp vụ hoặc CRDT. Cách tốt nhất là tránh xung đột bằng vùng nhà cố định cho mỗi thực thể.',
    },
    {
      front: 'Sharding theo range và theo hash khác nhau thế nào?',
      back: 'Range giữ khoảng giá trị liên tục, tốt cho range scan nhưng dễ tạo shard nóng với khoá thời gian. Hash phân bố đều nhưng truy vấn theo khoảng phải hỏi mọi shard.',
    },
    {
      front: 'Vì sao hash mod N tệ khi thêm shard?',
      back: 'Đổi N làm gần như mọi khoá đổi shard, phải di chuyển gần hết dữ liệu. Consistent hashing với virtual node, hoặc số partition cố định lớn như 16384 slot của Redis Cluster, tránh được vấn đề này.',
    },
    {
      front: 'Tiêu chí chọn shard key?',
      back: 'Cardinality cao, phân bố đều, khớp access pattern chính để truy vấn chỉ chạm một shard, và hạn chế transaction xuyên shard. Đây là quyết định rất khó đảo ngược.',
    },
    {
      front: 'Analyzer trong Elasticsearch gồm những gì?',
      back: 'Char filter làm sạch ký tự, tokenizer tách token, token filter chuẩn hoá như lowercase, asciifolding để bỏ dấu tiếng Việt. Cùng analyzer được áp cho cả dữ liệu lẫn câu truy vấn.',
    },
    {
      front: 'Field text và keyword khác nhau thế nào?',
      back: 'text được phân tích để tìm kiếm full-text và tính điểm BM25. keyword giữ nguyên giá trị, dùng cho lọc chính xác, sắp xếp, aggregation; điều kiện lọc nên đặt trong filter để không tính điểm và được cache.',
    },
    {
      front: 'Debezium CDC với PostgreSQL cần gì, rủi ro gì?',
      back: 'Cần wal_level = logical, user có quyền REPLICATION, publication và replication slot. Rủi ro: connector dừng lâu thì slot giữ WAL và có thể làm đầy đĩa; cần giám sát và cân nhắc max_slot_wal_keep_size.',
    },
  ],
};

export default flashcards;
