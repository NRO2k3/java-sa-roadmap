import type { LessonQuiz } from '../types';

const quiz: LessonQuiz = {
  'api-styles': [
    {
      question:
        'Hai service nội bộ trao đổi hàng chục nghìn request mỗi giây, cần độ trễ thấp và một luồng streaming trạng thái đơn hàng. Phong cách API nào phù hợp nhất?',
      options: [
        'REST với JSON, vì dễ cache bằng CDN',
        'gRPC với Protobuf trên HTTP/2',
        'GraphQL, vì client tự chọn field cần lấy',
        'SOAP với WS-Security',
      ],
      answer: 1,
      explanation:
        'gRPC dùng payload nhị phân nhỏ, multiplex trên HTTP/2 và hỗ trợ streaming sẵn, rất hợp cho giao tiếp nội bộ hiệu năng cao. Cache CDN không có ý nghĩa với lưu lượng service-to-service kiểu này.',
    },
    {
      question:
        'Message Order trong file .proto từng có field string coupon_code = 5, nay không dùng nữa. Cách xoá field đúng là gì?',
      options: [
        'Xoá dòng đó và dùng số 5 cho field mới tiếp theo để tiết kiệm',
        'Đổi kiểu field 5 sang int64 để dùng cho mục đích khác',
        'Giữ nguyên field nhưng đổi tên thành deprecated_5',
        'Xoá field và khai báo reserved 5; cùng reserved "coupon_code";',
      ],
      answer: 3,
      explanation:
        'Field number mới là thứ được truyền trên dây; dùng lại số 5 khiến client cũ đọc sai dữ liệu một cách âm thầm. Khai báo reserved giúp trình biên dịch chặn việc vô tình dùng lại số hoặc tên cũ.',
    },
    {
      question:
        'Query GraphQL trả về 100 đơn hàng kèm field customer, được resolve bằng @SchemaMapping gọi CustomerClient cho từng đơn. Vấn đề và cách sửa là gì?',
      options: [
        'Vấn đề N+1 với 100 lời gọi; dùng @BatchMapping để gom thành một lần gọi',
        'Vượt giới hạn kiểu Int 32-bit; đổi id sang custom scalar Long',
        'Query quá sâu; bật MaxQueryDepthInstrumentation là đủ',
        'Thiếu cache HTTP; thêm header Cache-Control cho POST /graphql',
      ],
      answer: 0,
      explanation:
        'Mỗi Order kích hoạt một lời gọi riêng cho customer, tổng cộng 100 lời gọi cộng một query ban đầu. @BatchMapping dùng cơ chế DataLoader để resolve field cho cả danh sách trong một lần.',
    },
    {
      question:
        'Client gửi POST /orders với Idempotency-Key đã dùng trước đó cho một đơn hoàn tất, nhưng body lần này khác hẳn. Server nên phản hồi thế nào?',
      options: [
        'Tạo đơn mới vì body khác nghĩa là thao tác khác',
        'Trả lại response đã lưu của lần đầu như một lần retry bình thường',
        'Từ chối với 422 vì key đang bị dùng cho một request khác',
        'Trả 429 Too Many Requests và header Retry-After',
      ],
      answer: 2,
      explanation:
        'Server so sánh hash của body với hash đã lưu; khác nhau nghĩa là client dùng sai key, cần báo lỗi thay vì âm thầm trả kết quả của request khác. Chỉ khi body trùng khớp mới trả lại response đã lưu.',
    },
    {
      question:
        'API liệt kê đơn hàng dùng LIMIT 20 OFFSET 200000 và ngày càng chậm, người dùng còn thấy đơn bị lặp giữa hai trang. Cách thay thế phù hợp nhất là gì?',
      options: [
        'Tăng kích thước trang lên 500 để giảm số lần gọi API',
        'Keyset pagination theo cặp (created_at, id) của dòng cuối trang trước',
        'Thêm index trên cột status rồi giữ nguyên cách dùng OFFSET',
        'Chạy COUNT(*) trước mỗi lần lấy trang để tính đúng offset',
      ],
      answer: 1,
      explanation:
        'Với OFFSET, database vẫn phải đọc rồi bỏ qua 200000 dòng, và dòng mới chèn vào làm lệch các trang. Keyset pagination tiếp tục từ vị trí của dòng cuối nhờ index (created_at, id), nhanh và ổn định.',
    },
  ],
  messaging: [
    {
      question: 'Topic có 6 partition, consumer group payment-service chạy 8 instance. Điều gì xảy ra?',
      options: [
        'Mỗi partition được chia cho hai consumer để xử lý song song',
        'Kafka tự tạo thêm 2 partition để khớp số consumer',
        '6 instance nhận partition, 2 instance không nhận message nào',
        'Mọi instance nhận đủ mọi message của topic',
      ],
      answer: 2,
      explanation:
        'Trong một consumer group, mỗi partition chỉ giao cho đúng một consumer, nên số consumer hữu ích tối đa bằng số partition. Muốn mọi bản sao nhận đủ message thì phải dùng các group khác nhau.',
    },
    {
      question: 'Queue được bind vào topic exchange với binding key order.created.#. Routing key nào sau đây khớp?',
      options: [
        'order.created',
        'order.cancelled.vn',
        'orders.created.vn',
        'created.order.vn',
      ],
      answer: 0,
      explanation:
        'Ký tự # khớp không hoặc nhiều từ, nên order.created (thêm không từ nào) vẫn khớp. orders.created.vn sai từ đầu tiên, các phương án còn lại sai thứ tự hoặc sai từ thứ hai.',
    },
    {
      question:
        'Consumer commit offset ngay khi nhận được message, sau đó mới xử lý. Nếu consumer chết giữa lúc xử lý, hệ thống đang có ngữ nghĩa giao nhận nào?',
      options: [
        'At-least-once, vì message sẽ được đọc lại sau khi restart',
        'Exactly-once, vì offset chỉ được commit một lần',
        'Effectively-once, vì Kafka tự loại bản trùng',
        'At-most-once, vì message đó bị bỏ qua và mất',
      ],
      answer: 3,
      explanation:
        'Offset đã được commit trước khi xử lý xong, nên sau khi restart consumer đọc tiếp từ sau message đó: message bị mất. Muốn at-least-once thì phải xử lý xong rồi mới commit.',
    },
    {
      question:
        'Service Payment đọc Kafka rồi gọi API của cổng thanh toán bên ngoài. Cách nào giúp không trừ tiền khách hai lần khi message bị giao lại?',
      options: [
        'Bật transaction của Kafka producer để có exactly-once đầu cuối',
        'Giữ at-least-once, consumer idempotent, gửi idempotency key cho cổng thanh toán',
        'Commit offset trước khi gọi API để không bao giờ xử lý lại',
        'Tăng max.poll.interval.ms để tránh hoàn toàn việc rebalance',
      ],
      answer: 1,
      explanation:
        'Exactly-once của Kafka chỉ bao trùm luồng đọc và ghi trong Kafka, không bao được lời gọi API bên ngoài. Cách thực tế là at-least-once cộng idempotency ở consumer và ở phía API thanh toán. At-most-once thì có thể bỏ sót thanh toán.',
    },
    {
      question:
        'Listener @RabbitListener ném exception với một message sai định dạng, cấu hình mặc định, và message cứ được giao lại liên tục. Cách xử lý đúng là gì?',
      options: [
        'Tăng prefetch để consumer xử lý kịp các message lỗi',
        'Chuyển queue sang kiểu classic để tắt việc giao lại',
        'Tắt requeue khi reject và khai báo dead-letter exchange cho queue',
        'Bọc listener trong try-catch và bỏ qua mọi exception',
      ],
      answer: 2,
      explanation:
        'Mặc định Spring AMQP requeue message khi listener lỗi, tạo vòng lặp vô hạn với poison pill. Reject không requeue cùng DLX đưa message vào DLQ để xem xét; nuốt exception thì mất message âm thầm.',
    },
  ],
  eda: [
    {
      question:
        'Service Shipping nhận event OrderPlaced chỉ chứa orderId, rồi gọi ngược Order service để lấy địa chỉ cho mọi đơn, làm Order service quá tải. Nên đổi sang kiểu event nào?',
      options: [
        'Event-carried state transfer: event mang luôn địa chỉ và dữ liệu Shipping cần',
        'Event notification với payload càng nhỏ càng tốt',
        'Event sourcing cho toàn bộ service Shipping',
        'Chuyển sang gọi REST đồng bộ thay cho event',
      ],
      answer: 0,
      explanation:
        'Khi consumer thường xuyên cần dữ liệu chi tiết, đưa dữ liệu đó vào event giúp consumer tự chủ và loại bỏ lời gọi ngược. Đổi lại phải chấp nhận dữ liệu nhân bản và quản lý chặt hợp đồng event.',
    },
    {
      question:
        'Trong saga đặt hàng, bước trừ tiền đã thành công nhưng bước giao hàng thất bại. Compensating transaction đúng cho bước trừ tiền là gì?',
      options: [
        'Xoá bản ghi giao dịch thanh toán khỏi database của Payment',
        'Gọi ROLLBACK trên transaction đã commit của Payment',
        'Tạo một giao dịch hoàn tiền mới và giữ nguyên lịch sử giao dịch cũ',
        'Bỏ qua vì saga sẽ tự đạt nhất quán sau cùng',
      ],
      answer: 2,
      explanation:
        'Compensation là đảo ngược về mặt nghiệp vụ, không phải rollback kỹ thuật: transaction cục bộ đã commit thì không rollback được. Tạo giao dịch hoàn tiền giữ được dấu vết kiểm toán.',
    },
    {
      question:
        'Relay của Transactional Outbox gửi event lên Kafka thành công nhưng chết trước khi kịp cập nhật published_at. Điều gì đúng?',
      options: [
        'Event bị mất vì dòng outbox đã bị khoá bởi FOR UPDATE',
        'Event sẽ được gửi lại khi relay chạy lại, nên consumer phải idempotent',
        'Kafka tự phát hiện và loại bỏ bản trùng nhờ cùng aggregate_id',
        'Transaction nghiệp vụ ban đầu bị rollback theo',
      ],
      answer: 1,
      explanation:
        'Việc đánh dấu chưa commit nên dòng vẫn ở trạng thái chưa gửi; lần chạy sau gửi lại event. Outbox đảm bảo at-least-once, không phải exactly-once, vì vậy consumer cần khử trùng theo eventId.',
    },
    {
      question:
        'Subject OrderPlaced trong Schema Registry ở mức BACKWARD. Thay đổi schema Avro nào sẽ được chấp nhận?',
      options: [
        'Đổi kiểu totalAmount từ long sang string',
        'Thêm field bắt buộc { "name": "channel", "type": "string" } không có default',
        'Đổi tên field orderId thành id mà không khai báo alias',
        'Thêm field { "name": "channel", "type": ["null", "string"], "default": null }',
      ],
      answer: 3,
      explanation:
        'BACKWARD yêu cầu consumer dùng schema mới đọc được dữ liệu ghi bằng schema cũ. Field mới có default cho phép điền giá trị khi đọc bản ghi cũ; field không có default thì không đọc được dữ liệu cũ nên bị từ chối.',
    },
    {
      question:
        'Projection CQRS cập nhật bằng UPDATE order_summary SET status = \'PAID\', version = ? WHERE order_id = ? AND version < ?. Điều kiện version < ? nhằm mục đích gì?',
      options: [
        'Bỏ qua event trùng hoặc đến muộn để không ghi đè trạng thái mới hơn',
        'Khoá dòng để các consumer khác không đọc được',
        'Tăng tốc truy vấn nhờ index trên cột version',
        'Đảm bảo Kafka giao event theo đúng thứ tự toàn cục',
      ],
      answer: 0,
      explanation:
        'Event có thể đến nhiều lần hoặc lệch thứ tự; chỉ áp dụng event có version mới hơn khiến projection idempotent. Điều kiện này không ảnh hưởng gì đến thứ tự giao của Kafka.',
    },
  ],
  eip: [
    {
      question:
        'Một bước trong luồng tích hợp đọc trường loại khách của mỗi đơn và gửi đơn B2B tới topic orders.b2b, đơn bán lẻ tới orders.retail, không sửa nội dung đơn. Đây là mẫu EIP nào?',
      options: ['Message Translator', 'Splitter', 'Aggregator', 'Content-Based Router'],
      answer: 3,
      explanation:
        'Content-Based Router chọn kênh đầu ra dựa trên nội dung message và giữ nguyên nội dung. Translator thì đổi định dạng, Splitter tách một message thành nhiều message.',
    },
    {
      question:
        'Hệ ERP cũ xuất mã trạng thái "01", "02" và ngày dạng dd/MM/yyyy; năm service mới cần dữ liệu này. Cách tổ chức tốt nhất là gì?',
      options: [
        'Để mỗi service tự parse định dạng của ERP theo cách riêng',
        'Một Anti-Corruption Layer dùng Message Translator chuyển sang event chuẩn',
        'Sửa database của ERP để lưu trạng thái dạng chữ cho dễ đọc',
        'Cho các service mới đọc thẳng database của ERP khi cần',
      ],
      answer: 1,
      explanation:
        'Gom việc chuyển đổi vào một lớp có test đầy đủ giúp mô hình dữ liệu cũ không lây vào các service mới và chỉ phải sửa một chỗ khi ERP thay đổi. Đọc thẳng database ERP tạo coupling kiểu shared database.',
    },
    {
      question:
        'Route Camel: aggregate(header(KafkaConstants.KEY), new GroupedBodyAggregationStrategy()).completionSize(100).completionTimeout(5_000). Khi nào một nhóm được gửi đi?',
      options: [
        'Khi nhóm cùng key đủ 100 message, hoặc nhóm không nhận message mới trong 5 giây',
        'Đúng mỗi 5 giây một lần, bất kể nhóm có bao nhiêu message',
        'Chỉ khi đủ 100 message; timeout chỉ dùng để ghi log cảnh báo',
        'Khi tổng số message của mọi key cộng lại đạt 100',
      ],
      answer: 0,
      explanation:
        'Correlation theo Kafka key nên mỗi key là một nhóm riêng; completionSize và completionTimeout là hai điều kiện hoàn tất, điều kiện nào đến trước thì nhóm được gửi. completionTimeout tính theo thời gian không hoạt động của nhóm, khác với completionInterval chạy định kỳ.',
    },
    {
      question:
        'Team muốn đặt quy tắc tính giá khuyến mãi vào route của ESB để "mọi hệ thống dùng chung". Theo nguyên tắc smart endpoints, dumb pipes, nên làm gì?',
      options: [
        'Đặt quy tắc vào API Gateway vì mọi request đều đi qua đó',
        'Đặt quy tắc vào ESB và viết tài liệu hướng dẫn cho các team',
        'Đặt quy tắc trong service sở hữu nghiệp vụ giá; ESB chỉ định tuyến',
        'Sao chép quy tắc vào từng hệ thống cần tính giá khuyến mãi',
      ],
      answer: 2,
      explanation:
        'Logic nghiệp vụ trong ESB hay gateway khiến team tích hợp thành nút cổ chai và team sản phẩm không kiểm soát được. Service sở hữu nghiệp vụ nên cung cấp quy tắc qua API hoặc event; sao chép quy tắc thì dễ lệch nhau.',
    },
    {
      question:
        'Một team nhỏ cần kết nối nhanh 6 ứng dụng SaaS (CRM, kế toán, nhân sự) với lưu lượng vừa phải, không muốn vận hành hạ tầng. Lựa chọn phù hợp nhất là gì?',
      options: [
        'Tự xây ESB on-premise với nhiều node',
        'iPaaS có sẵn connector cho các SaaS đó',
        'API Gateway với các route tới từng SaaS',
        'Viết một service Camel riêng cho mỗi SaaS và tự vận hành',
      ],
      answer: 1,
      explanation:
        'iPaaS mạnh nhất ở tích hợp SaaS có connector dựng sẵn và không cần vận hành hạ tầng. Cần cân nhắc lock-in và chi phí theo giao dịch, nhưng với lưu lượng vừa phải và team nhỏ thì đây là đánh đổi hợp lý.',
    },
  ],
};

export default quiz;
