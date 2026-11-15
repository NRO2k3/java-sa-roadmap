import type { LessonFlashcards } from '../types';

const flashcards: LessonFlashcards = {
  'api-styles': [
    {
      front: 'Method HTTP nào là idempotent?',
      back: 'GET, PUT, DELETE là idempotent: gọi nhiều lần cho cùng kết quả trên server. POST thì không, nên muốn retry POST an toàn cần idempotency key.',
    },
    {
      front: 'Điểm mạnh và hạn chế của gRPC?',
      back: 'Chạy trên HTTP/2, payload Protobuf nhỏ, sinh code từ .proto, hỗ trợ streaming. Hạn chế: trình duyệt cần gRPC-Web và proxy, khó debug, load balancer L4 không chia tải theo từng request.',
    },
    {
      front: 'GraphQL giải quyết gì và có cái giá nào?',
      back: 'Client lấy đúng field cần qua một endpoint có schema, tránh over-fetching và under-fetching. Cái giá: khó cache HTTP, cần giới hạn độ sâu và độ phức tạp truy vấn, dễ gặp N+1.',
    },
    {
      front: 'Khi nào dùng WebSocket, khi nào dùng SSE?',
      back: 'WebSocket cho giao tiếp hai chiều thời gian thực như chat. SSE đủ dùng khi server chỉ cần đẩy một chiều, và đơn giản hơn vì chạy trên HTTP thông thường.',
    },
    {
      front: 'API-first khác code-first thế nào?',
      back: 'API-first viết và review spec OpenAPI trước khi code, dùng làm nguồn sự thật để sinh server stub, client và mock. Code-first sinh spec từ annotation, nhanh lúc đầu nhưng dễ để chi tiết triển khai rò rỉ vào hợp đồng.',
    },
    {
      front: 'Thay đổi API nào phá vỡ tương thích?',
      back: 'Xoá field, đổi tên, đổi kiểu, biến field tuỳ chọn thành bắt buộc. Thêm field tuỳ chọn hoặc endpoint mới thì an toàn.',
    },
    {
      front: 'Quy tắc tiến hoá schema Protobuf?',
      back: 'Field number là thứ được truyền trên dây: được đổi tên và thêm field với số mới, không bao giờ đổi hay dùng lại số cũ, khai báo reserved cho số và tên đã xoá. Giá trị enum đầu tiên phải là 0.',
    },
    {
      front: 'Vì sao gRPC client luôn cần deadline?',
      back: 'Không có deadline, lời gọi treo giữ thread và connection vô thời hạn, lỗi lan dây chuyền. Dùng withDeadlineAfter, xử lý DEADLINE_EXCEEDED, và tạo ManagedChannel một lần để dùng chung.',
    },
    {
      front: 'Các annotation chính của Spring for GraphQL?',
      back: '@QueryMapping và @MutationMapping ánh xạ field của Query và Mutation, @Argument lấy tham số, @SchemaMapping resolve field con, @BatchMapping resolve field cho cả danh sách để tránh N+1.',
    },
    {
      front: 'Luồng xử lý Idempotency-Key phía server?',
      back: 'Insert key với trạng thái PROCESSING bằng ON CONFLICT DO NOTHING. Thắng thì xử lý và lưu response. Key đã có: hash body khác trả 422, đang xử lý trả 409, đã xong trả lại response đã lưu.',
    },
    {
      front: 'Offset và cursor pagination khác nhau thế nào?',
      back: 'Offset cho nhảy trang nhưng trang sâu chậm và dễ lặp hoặc sót dòng khi có dữ liệu mới. Cursor (keyset) tiếp tục từ dòng cuối theo cặp (created_at, id), nhanh và ổn định nhưng không nhảy trang tuỳ ý.',
    },
    {
      front: 'Nguyên tắc thiết kế rate limiting cho API?',
      back: 'Giới hạn theo danh tính (API key, user, tenant), đặt ở API Gateway, dùng bộ đếm chung như Redis khi chạy nhiều instance, trả 429 Too Many Requests kèm header Retry-After.',
    },
  ],
  messaging: [
    {
      front: 'Mô hình queue và mô hình log khác nhau thế nào?',
      back: 'Queue (RabbitMQ) giao message cho một consumer và xoá sau khi ack. Log (Kafka) ghi nối tiếp, giữ theo retention, nhiều consumer group đọc độc lập và có thể đọc lại.',
    },
    {
      front: 'Topic, partition, offset trong Kafka là gì?',
      back: 'Topic là luồng message có tên, chia thành partition; mỗi partition là log append-only có thứ tự; offset là vị trí tuần tự của message trong partition, consumer dùng nó để biết đã đọc tới đâu.',
    },
    {
      front: 'Kafka producer chọn partition thế nào?',
      back: 'Mặc định băm key bằng murmur2 rồi chia lấy dư cho số partition, nên cùng key luôn vào cùng partition. Tăng số partition làm đổi ánh xạ key, phá thứ tự theo key.',
    },
    {
      front: 'acks=all kết hợp min.insync.replicas để làm gì?',
      back: 'acks=all chờ mọi replica trong ISR ghi xong. Với min.insync.replicas=2 và replication factor 3, lần ghi được xác nhận chắc chắn nằm trên ít nhất hai broker.',
    },
    {
      front: 'Consumer group chia tải thế nào?',
      back: 'Mỗi partition giao cho đúng một consumer trong group, nên số consumer hữu ích tối đa bằng số partition. Group khác đọc cùng topic với offset riêng. Consumer lag là chỉ số cần giám sát.',
    },
    {
      front: 'Bốn loại exchange của RabbitMQ?',
      back: 'Direct: routing key khớp chính xác. Topic: khớp mẫu, dấu * là đúng một từ, dấu # là không hoặc nhiều từ. Fanout: gửi tới mọi queue được bind. Headers: định tuyến theo header.',
    },
    {
      front: 'At-most-once, at-least-once, exactly-once khác nhau thế nào?',
      back: 'At-most-once: commit trước khi xử lý, có thể mất. At-least-once: xử lý xong mới commit, có thể trùng. Exactly-once: Kafka chỉ đảm bảo trong luồng đọc và ghi Kafka nhờ transaction.',
    },
    {
      front: 'Effectively once là gì?',
      back: 'At-least-once cộng consumer idempotent: message có thể đến nhiều lần nhưng chỉ tác động một lần, nhờ bảng processed_messages, upsert hoặc idempotency key gửi sang hệ thống bên ngoài.',
    },
    {
      front: 'Blocking retry và non-blocking retry trong Spring Kafka?',
      back: 'Blocking (DefaultErrorHandler): thử lại trên partition hiện tại, giữ thứ tự nhưng chặn các message phía sau. Non-blocking (@RetryableTopic): chuyển sang retry topic có độ trễ, không chặn nhưng mất thứ tự.',
    },
    {
      front: 'DeadLetterPublishingRecoverer gửi message lỗi đi đâu?',
      back: 'Mặc định tới topic tên gốc cộng hậu tố .DLT, cùng số partition với message gốc, nên topic DLT cần có ít nhất bằng số partition của topic gốc.',
    },
    {
      front: 'Dead-letter exchange của RabbitMQ hoạt động thế nào?',
      back: 'Khai báo queue với tham số x-dead-letter-exchange; message bị reject không requeue, hết TTL hoặc vượt giới hạn độ dài queue sẽ được chuyển tới exchange đó rồi vào DLQ.',
    },
    {
      front: 'Poison pill là gì và xử lý thế nào?',
      back: 'Message không bao giờ xử lý được, ví dụ không deserialize được. Dùng ErrorHandlingDeserializer, đánh dấu lỗi vĩnh viễn là không retry, tắt requeue mặc định của Spring AMQP và đưa vào DLQ.',
    },
  ],
  eda: [
    {
      front: 'Event khác command thế nào?',
      back: 'Event là sự thật đã xảy ra, đặt tên thì quá khứ như OrderPlaced, bên phát không biết ai nghe. Command là yêu cầu làm một việc như ChargePayment, có người nhận xác định và có thể bị từ chối.',
    },
    {
      front: 'Event notification là gì?',
      back: 'Event chỉ mang id và loại sự kiện; bên nhận gọi ngược service nguồn nếu cần chi tiết. Hợp đồng nhỏ nhưng tạo tải và coupling lúc runtime, khó theo dõi toàn bộ luồng.',
    },
    {
      front: 'Event-carried state transfer là gì?',
      back: 'Event mang đủ dữ liệu bên nhận cần để lưu bản sao cục bộ, không phải gọi ngược. Bên nhận tự chủ, độ trễ thấp; đổi lại dữ liệu bị nhân bản và event lớn hơn.',
    },
    {
      front: 'Event sourcing là gì?',
      back: 'Lưu chuỗi event thay vì trạng thái hiện tại; trạng thái được tính bằng cách áp lần lượt các event. Có lịch sử kiểm toán đầy đủ, nhưng cần projection để truy vấn và snapshot cho stream dài.',
    },
    {
      front: 'Optimistic concurrency trong event store hoạt động thế nào?',
      back: 'Khoá chính (stream_id, version): hai lần ghi cùng version vào một stream thì một lần vi phạm ràng buộc, bên đó phải đọc lại stream và thử lại.',
    },
    {
      front: 'CQRS là gì và khi nào không nên dùng?',
      back: 'Tách mô hình ghi (command, bất biến) khỏi mô hình đọc (phi chuẩn hoá, cập nhật từ event). Không nên dùng cho CRUD đơn giản vì phải trả giá bằng nhất quán sau cùng và thêm hệ thống vận hành.',
    },
    {
      front: 'Saga là gì?',
      back: 'Chuỗi transaction cục bộ trong từng service, mỗi bước commit rồi kích hoạt bước tiếp theo. Khi một bước lỗi, chạy compensating transaction để đảo ngược về mặt nghiệp vụ các bước đã xong.',
    },
    {
      front: 'Vì sao không dùng 2PC giữa các microservice?',
      back: 'Two-phase commit khoá tài nguyên trong lúc chờ điều phối viên, làm giảm availability, và phần lớn message broker hiện đại không tham gia 2PC.',
    },
    {
      front: 'Semantic lock trong saga là gì?',
      back: 'Đặt trạng thái trung gian như PENDING lên bản ghi để báo nó đang nằm trong một saga chưa hoàn tất, bù cho việc saga thiếu isolation.',
    },
    {
      front: 'Nên sắp xếp các bước của saga thế nào?',
      back: 'Bước dễ bù trừ như giữ hàng làm trước; bước khó hoặc không bù trừ được như gửi hàng, gửi thông báo làm sau cùng. Mọi bước đều phải idempotent.',
    },
    {
      front: 'Hai cách hiện thực relay cho Transactional Outbox?',
      back: 'Polling publisher: định kỳ SELECT ... FOR UPDATE SKIP LOCKED, gửi broker rồi đánh dấu published_at. CDC: Debezium đọc WAL của bảng outbox với Outbox Event Router. Cả hai đều at-least-once.',
    },
    {
      front: 'Các mức tương thích của Schema Registry?',
      back: 'BACKWARD (mặc định của Confluent): schema mới đọc được dữ liệu cũ, nâng cấp consumer trước. FORWARD: schema cũ đọc được dữ liệu mới, nâng cấp producer trước. FULL: cả hai chiều. Biến thể TRANSITIVE so với mọi version trước.',
    },
  ],
  eip: [
    {
      front: 'Bốn phong cách tích hợp trong sách EIP?',
      back: 'File transfer, shared database, remote procedure invocation và messaging. Messaging tách rời tốt nhất nhưng phức tạp hơn khi thiết kế và vận hành.',
    },
    {
      front: 'Point-to-Point và Publish-Subscribe Channel khác nhau thế nào?',
      back: 'Point-to-Point giao mỗi message cho đúng một consumer. Publish-Subscribe giao bản sao của message cho mọi subscriber.',
    },
    {
      front: 'Channel Adapter là gì?',
      back: 'Endpoint nối một hệ thống không biết gì về messaging, như thư mục file, FTP hay database, vào một message channel.',
    },
    {
      front: 'Pipes and Filters là gì?',
      back: 'Chia xử lý thành chuỗi bước nhỏ độc lập (filter) nối với nhau bằng channel (pipe). Mỗi bước làm một việc, dễ thay thế và kiểm thử riêng.',
    },
    {
      front: 'Content-Based Router khác Message Filter thế nào?',
      back: 'Content-Based Router chọn một kênh đầu ra dựa trên nội dung message. Message Filter chỉ quyết định cho message đi qua hay bỏ đi. Cả hai đều không sửa nội dung.',
    },
    {
      front: 'Cần lưu ý gì khi dùng Splitter?',
      back: 'Mỗi message con nên mang correlation id và thứ tự để có thể gộp lại sau. Với file lớn phải tách theo streaming thay vì nạp cả file vào bộ nhớ.',
    },
    {
      front: 'Aggregator cần trả lời ba câu hỏi nào?',
      back: 'Correlation: message nào cùng nhóm. Completion condition: khi nào nhóm xong (đủ số lượng, timeout, điều kiện). Aggregation strategy: gộp thế nào. Aggregator có trạng thái nên cần kho bền vững cho dữ liệu quan trọng.',
    },
    {
      front: 'Scatter-Gather là gì?',
      back: 'Gửi yêu cầu tới nhiều bên song song rồi dùng Aggregator gộp các phản hồi trong một thời hạn, ví dụ lấy báo giá từ nhiều nhà cung cấp và chọn giá tốt nhất.',
    },
    {
      front: 'Canonical Data Model đánh đổi gì?',
      back: 'Mỗi hệ chỉ cần translator sang mô hình chung, số translator giảm từ cỡ N bình phương xuống cỡ 2N. Đổi lại mô hình chung dễ phình to và thành điểm tranh chấp giữa các team.',
    },
    {
      front: 'Các khái niệm chính của Apache Camel?',
      back: 'Route bắt đầu bằng from(endpoint); endpoint URI dạng scheme:path?options; Exchange chứa message suốt route; Processor là code Java tuỳ ý; các mẫu EIP là phương thức DSL như split, filter, choice, aggregate.',
    },
    {
      front: 'Smart endpoints, dumb pipes nghĩa là gì?',
      back: 'Logic nghiệp vụ nằm trong service, kênh truyền chỉ chuyển message. Đây là phản ứng với các ESB chứa quá nhiều logic, khiến team tích hợp trung tâm thành nút cổ chai.',
    },
    {
      front: 'Khi nào dùng API Gateway, ESB, iPaaS?',
      back: 'API Gateway ở biên cho client gọi vào: định tuyến, bảo mật, rate limit. ESB tích hợp tập trung nhiều hệ nội bộ và giao thức cũ. iPaaS kết nối nhanh nhiều SaaS với lưu lượng vừa phải, chấp nhận lock-in và chi phí.',
    },
  ],
};

export default flashcards;
