import type { LessonQuiz } from '../types';

const quiz: LessonQuiz = {
  rdbms: [
    {
      question:
        'Bảng orders có index (customer_id, status, created_at). Truy vấn nào ít được index này hỗ trợ nhất?',
      options: [
        'WHERE customer_id = 42 AND status = \'PAID\' ORDER BY created_at DESC',
        'WHERE customer_id = 42 ORDER BY status',
        'WHERE created_at > now() - interval \'1 day\'',
        'WHERE customer_id = 42 AND status IN (\'PAID\', \'SHIPPED\')',
      ],
      answer: 2,
      explanation:
        'Composite index sắp xếp theo cột đầu tiên trước, nên theo quy tắc tiền tố trái nhất, điều kiện chỉ trên created_at (cột cuối) thường không dùng index hiệu quả. Các truy vấn còn lại đều bắt đầu bằng customer_id.',
    },
    {
      question:
        'Bảng order_items(order_id, product_id, quantity, product_name) có khoá chính (order_id, product_id). Bảng này vi phạm dạng chuẩn nào?',
      options: [
        '2NF, vì product_name chỉ phụ thuộc vào product_id, một phần của khoá',
        '1NF, vì bảng có khoá chính gồm hai cột',
        '3NF, vì quantity phụ thuộc vào product_name',
        'Không vi phạm, vì mọi cột đều có giá trị nguyên tử',
      ],
      answer: 0,
      explanation:
        '2NF yêu cầu mọi cột không khoá phụ thuộc vào toàn bộ khoá chính. product_name chỉ phụ thuộc product_id nên là phụ thuộc bộ phận; cần tách sang bảng products.',
    },
    {
      question:
        'EXPLAIN ANALYZE cho thấy: Seq Scan on orders, Filter: (customer_id = 42), rows=282, Rows Removed by Filter: 1999718. Hành động hợp lý đầu tiên là gì?',
      options: [
        'Tăng maximum-pool-size của HikariCP để chạy nhiều query song song hơn',
        'Tăng work_mem để Seq Scan chạy trong bộ nhớ',
        'Chuyển truy vấn sang mức isolation Serializable',
        'Tạo index bắt đầu bằng customer_id, phù hợp với ORDER BY của truy vấn',
      ],
      answer: 3,
      explanation:
        'Quét gần 2 triệu dòng để lấy 282 dòng nghĩa là điều kiện rất chọn lọc nhưng thiếu index. work_mem liên quan tới sort và hash, không giúp tránh quét toàn bảng.',
    },
    {
      question:
        'Hai request chạy đồng thời đoạn code: p = repo.findById(id); p.setStock(p.getStock() - 1); repo.save(p); ở Read Committed, không có @Version. Vấn đề nào có thể xảy ra?',
      options: [
        'Dirty read, vì request này đọc được dữ liệu chưa commit của request kia',
        'Lost update: cả hai đọc cùng giá trị cũ nên tồn kho chỉ giảm 1 thay vì 2',
        'Phantom read, vì số dòng của bảng thay đổi giữa hai lần đọc',
        'Deadlock chắc chắn xảy ra vì hai transaction cùng sửa một dòng',
      ],
      answer: 1,
      explanation:
        'Đọc-rồi-ghi ở tầng ứng dụng cho phép cả hai transaction đọc cùng một giá trị rồi ghi đè nhau. Sửa bằng câu UPDATE nguyên tử (SET stock = stock - 1), SELECT ... FOR UPDATE hoặc khoá lạc quan @Version. PostgreSQL không bao giờ có dirty read.',
    },
    {
      question:
        'Một service chạy 12 instance, mỗi instance có maximum-pool-size 10, trỏ tới PostgreSQL với max_connections mặc định là 100. Cách xử lý phù hợp nhất là gì?',
      options: [
        'Tăng maximum-pool-size lên 20 để mỗi instance có đủ connection khi tải cao',
        'Đặt minimum-idle bằng 0 để pool tự đóng connection, không cần thay đổi gì khác',
        'Giảm kích thước pool mỗi instance hoặc đặt PgBouncer phía trước database',
        'Tắt connection pool và mở connection mới cho mỗi request',
      ],
      answer: 2,
      explanation:
        'Tổng 120 connection vượt giới hạn 100, khi tải cao một số instance sẽ không kết nối được. Phải tính tổng connection của mọi instance; pool nhỏ hơn hoặc connection pooler như PgBouncer giải quyết đúng gốc vấn đề.',
    },
  ],
  nosql: [
    {
      question:
        'Bảng Cassandra có PRIMARY KEY ((customer_id, month), created_at, order_id). Truy vấn nào hợp lệ mà không cần ALLOW FILTERING?',
      options: [
        'WHERE customer_id = \'C-42\'',
        'WHERE customer_id = \'C-42\' AND month = \'2024-05\'',
        'WHERE month = \'2024-05\' AND created_at > \'2024-05-10\'',
        'WHERE order_id = \'ORD-1\'',
      ],
      answer: 1,
      explanation:
        'Partition key gồm cả customer_id và month, nên truy vấn phải chỉ định đầy đủ cả hai để Cassandra biết partition nào cần đọc. Thiếu một phần của partition key thì không xác định được node chứa dữ liệu.',
    },
    {
      question:
        'Dữ liệu có N = 3 replica. Cấu hình nào đảm bảo lần đọc thấy được lần ghi thành công gần nhất (không xét ghi đồng thời)?',
      options: [
        'W = 1, R = 1',
        'W = 1, R = 2',
        'W = 2, R = 1',
        'W = 2, R = 2',
      ],
      answer: 3,
      explanation:
        'Điều kiện là R + W > N. Với W = 2 và R = 2, tổng là 4 > 3 nên tập replica được đọc luôn giao với tập replica đã ghi. Các phương án còn lại có tổng bằng 2 hoặc 3, không vượt N.',
    },
    {
      question:
        'Theo PACELC, một hệ được xếp loại PA/EL như Cassandra ở cấu hình mặc định sẽ ưu tiên điều gì khi mạng hoạt động bình thường?',
      options: [
        'Độ trễ thấp, chấp nhận có thể đọc dữ liệu chưa mới nhất',
        'Tính nhất quán, chấp nhận độ trễ cao hơn ở mỗi lần đọc',
        'Từ chối ghi cho tới khi mọi replica xác nhận',
        'Chuyển sang chế độ chỉ đọc để bảo toàn dữ liệu',
      ],
      answer: 0,
      explanation:
        'Phần EL nghĩa là Else, Latency: khi không có partition, hệ chọn độ trễ thấp thay vì chờ nhiều replica để đảm bảo nhất quán. Phần PA nói về lúc có partition thì ưu tiên availability.',
    },
    {
      question:
        'Bạn cần tính năng "khách hàng mua sản phẩm này cũng mua những gì", truy vấn đi qua nhiều bước quan hệ khách hàng và sản phẩm. Loại kho nào phù hợp nhất?',
      options: [
        'Key-value store như DynamoDB, tra theo partition key',
        'Wide-column store như Cassandra, mỗi khách một partition',
        'Graph database như Neo4j, truy vấn bằng Cypher',
        'Redis với TTL ngắn cho mỗi sản phẩm',
      ],
      answer: 2,
      explanation:
        'Graph database lưu trực tiếp liên kết giữa các node nên duyệt quan hệ nhiều bước hiệu quả. Với SQL hay key-value, mỗi bước là một JOIN hoặc một lượt truy vấn thêm, chi phí tăng nhanh theo độ sâu.',
    },
    {
      question:
        'Một bảng DynamoDB dùng status (PENDING, PAID, SHIPPED) làm partition key cho bảng đơn hàng. Vấn đề lớn nhất là gì?',
      options: [
        'DynamoDB không cho phép partition key là chuỗi',
        'Ít giá trị khác nhau nên tải dồn vào vài partition, tạo hot partition',
        'Không thể thêm sort key khi partition key là chuỗi ký tự',
        'Mỗi item sẽ vượt giới hạn kích thước 400 KB',
      ],
      answer: 1,
      explanation:
        'Partition key cần cardinality cao và phân bố đều. Chỉ ba giá trị nghĩa là mọi đơn mới đều dồn vào partition PENDING, vượt giới hạn throughput của một partition dù bảng còn dư năng lực.',
    },
  ],
  caching: [
    {
      question: 'Chiến lược cache nào có rủi ro mất dữ liệu nếu cache sập trước khi kịp ghi xuống database?',
      options: ['Cache-aside', 'Read-through', 'Write-through', 'Write-behind'],
      answer: 3,
      explanation:
        'Write-behind trả về ngay sau khi ghi vào cache và ghi xuống database bất đồng bộ sau đó, nên dữ liệu chưa kịp ghi sẽ mất khi cache sập. Write-through ghi đồng bộ xuống database trước khi trả về.',
    },
    {
      question:
        'Service chạy 8 instance, dùng @Cacheable(cacheNames = "products", key = "#id", sync = true) với Redis. Khi một khoá nóng hết hạn, tối đa bao nhiêu lượt nạp lại từ database có thể xảy ra cùng lúc?',
      options: [
        'Đúng 1, vì sync = true dùng khoá phân tán trên Redis',
        'Khoảng 8, vì sync = true chỉ đồng bộ các thread trong cùng một JVM',
        'Không giới hạn, vì sync = true bị bỏ qua khi dùng Redis',
        '0, vì Spring tự làm mới khoá trước khi hết hạn',
      ],
      answer: 1,
      explanation:
        'sync = true chỉ đảm bảo một thread nạp khoá trong phạm vi một instance. Với nhiều instance, mỗi instance vẫn có thể gọi database một lần; muốn chặn hoàn toàn cần khoá phân tán.',
    },
    {
      question:
        'Kẻ tấn công gửi hàng nghìn request GET /products/{id} với id ngẫu nhiên không tồn tại, mọi request đều xuống database. Cách xử lý phù hợp là gì?',
      options: [
        'Cache kết quả rỗng với TTL ngắn và dùng Bloom filter chứa các id hợp lệ',
        'Tăng TTL của các sản phẩm đang có trong cache lên 24 giờ',
        'Chuyển cache từ Redis sang Caffeine để đọc nhanh hơn',
        'Thêm jitter ngẫu nhiên vào TTL của mọi khoá',
      ],
      answer: 0,
      explanation:
        'Đây là cache penetration: khoá không tồn tại nên cache không bao giờ hit. Negative caching chặn các lần hỏi lặp lại, Bloom filter loại id chắc chắn không có trước khi chạm database. Jitter giải quyết việc nhiều khoá cùng hết hạn, không phải vấn đề này.',
    },
    {
      question:
        'Trong flash sale, một khoá Redis duy nhất nhận lưu lượng cực lớn làm một node Redis Cluster quá tải. Vì sao thêm node vào cụm không giải quyết được?',
      options: [
        'Vì Redis Cluster không cho phép thêm node khi đang chạy',
        'Vì thêm node làm mọi khoá phải băm lại và cache bị xoá sạch',
        'Vì một khoá luôn thuộc một hash slot do một node master phụ trách',
        'Vì Redis chỉ dùng một CPU nên thêm node không tăng năng lực',
      ],
      answer: 2,
      explanation:
        'Mỗi khoá ánh xạ vào một trong 16384 hash slot và mỗi slot thuộc một master, nên mọi request cho khoá đó vẫn dồn vào một node. Cần cache L1 cục bộ, nhân bản khoá thành nhiều bản hoặc đọc từ replica.',
    },
    {
      question: 'Với cache-aside, vì sao khi cập nhật dữ liệu nên xoá khoá trong cache thay vì ghi đè giá trị mới vào cache?',
      options: [
        'Vì lệnh DEL của Redis luôn nhanh hơn nhiều so với lệnh SET',
        'Vì cập nhật đồng thời có thể ghi cache sai thứ tự, để lại giá trị cũ',
        'Vì ghi đè một khoá sẽ reset TTL của mọi khoá khác trong cache',
        'Vì Spring Cache không hỗ trợ ghi giá trị mới vào cache',
      ],
      answer: 1,
      explanation:
        'Nếu request A commit trước nhưng ghi cache sau request B, cache giữ giá trị của A dù database có giá trị của B, kéo dài tới hết TTL. Xoá khoá buộc lần đọc kế tiếp nạp giá trị mới nhất từ database.',
    },
  ],
  'scaling-data': [
    {
      question:
        'Người dùng vừa tạo đơn xong, trang "đơn của tôi" đọc qua method @Transactional(readOnly = true) định tuyến sang replica và không thấy đơn mới. Cách khắc phục hợp lý là gì?',
      options: [
        'Tăng maximum-pool-size của DataSource trỏ tới replica',
        'Chuyển mọi truy vấn đọc của toàn hệ thống về leader',
        'Đọc từ leader cho người dùng vừa ghi, trong vài giây sau khi ghi',
        'Tắt WAL trên leader để replica nhận dữ liệu nhanh hơn',
      ],
      answer: 2,
      explanation:
        'Đây là bất thường read-your-writes do độ trễ replication bất đồng bộ. Chỉ luồng cần đọc lại dữ liệu vừa ghi mới phải đọc từ leader (hoặc chờ replica replay tới đúng LSN); chuyển toàn bộ về leader làm mất lợi ích của replica.',
    },
    {
      question: 'Hệ log sự kiện sharding theo range với shard key là thời điểm tạo. Vấn đề nào dễ xảy ra nhất?',
      options: [
        'Mọi lần ghi mới dồn vào shard chứa khoảng thời gian hiện tại',
        'Không thể truy vấn dữ liệu theo khoảng thời gian',
        'Dữ liệu phân bố quá đều nên khó backup',
        'Phải băm lại toàn bộ dữ liệu mỗi ngày',
      ],
      answer: 0,
      explanation:
        'Với range theo thời gian, dữ liệu mới luôn rơi vào khoảng mới nhất nên một shard nhận toàn bộ tải ghi. Range sharding vẫn rất tốt cho truy vấn theo khoảng, đó là ưu điểm chứ không phải vấn đề.',
    },
    {
      question:
        'Trong truy vấn Elasticsearch, điều kiện { "term": { "brand": "Samsung" } } trên field kiểu keyword nên đặt ở đâu và vì sao?',
      options: [
        'Trong must, để tăng điểm liên quan cho sản phẩm Samsung',
        'Trong should, để kết quả không bắt buộc phải là Samsung',
        'Trong must_not, để loại các thương hiệu khác',
        'Trong filter, vì chỉ lọc có hoặc không, không tính điểm và được cache',
      ],
      answer: 3,
      explanation:
        'Điều kiện lọc chính xác không cần đóng góp vào điểm liên quan, nên đặt trong filter để Elasticsearch bỏ qua tính điểm và cache kết quả lọc. must dành cho phần tìm kiếm full-text cần xếp hạng.',
    },
    {
      question:
        'Connector Debezium cho PostgreSQL bị dừng suốt cuối tuần mà không ai phát hiện. Rủi ro lớn nhất đối với database chính là gì?',
      options: [
        'Các bảng bị khoá ghi cho tới khi connector chạy lại',
        'Replication slot giữ lại WAL, WAL tích tụ và có thể làm đầy đĩa',
        'Debezium tự xoá publication nên mất toàn bộ dữ liệu thay đổi',
        'PostgreSQL tự chuyển wal_level từ logical về replica',
      ],
      answer: 1,
      explanation:
        'Replication slot đảm bảo không mất thay đổi nên PostgreSQL giữ WAL cho tới khi slot đọc xong. Cần giám sát WAL bị giữ, trạng thái connector và cân nhắc max_slot_wal_keep_size.',
    },
    {
      question:
        'Consumer đọc topic shop.public.products từ Debezium nhận một record có key là id sản phẩm nhưng value là null, ngay sau một event có op = "d". Consumer nên làm gì?',
      options: [
        'Bỏ qua, vì đây là tombstone phục vụ log compaction',
        'Ném exception để đưa record vào dead-letter topic',
        'Xoá toàn bộ index vì bảng nguồn đã bị truncate',
        'Đọc lại database để lấy giá trị mới rồi ghi index',
      ],
      answer: 0,
      explanation:
        'Mặc định Debezium gửi một tombstone (value null) sau event xoá để Kafka log compaction có thể loại bỏ mọi bản ghi của khoá đó. Event op = "d" trước đó đã mang thông tin cần xoá.',
    },
  ],
};

export default quiz;
