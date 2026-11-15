import type { LessonFlashcards } from '../types';

const flashcards: LessonFlashcards = {
  styles: [
    {
      front: 'Phong cách kiến trúc khác pattern thế nào?',
      back: 'Phong cách là hình dạng tổng thể của ứng dụng hoặc hệ thống, như layered, microservices, event-driven. Pattern là lời giải cho một vấn đề cục bộ, như circuit breaker hay outbox.',
    },
    {
      front: 'Sinkhole anti-pattern là gì?',
      back: 'Trong layered architecture, phần lớn request chỉ chạy xuyên qua các tầng mà không tầng nào xử lý gì có ý nghĩa, chỉ chuyển tiếp dữ liệu xuống tầng dưới.',
    },
    {
      front: 'Driving adapter và driven adapter trong Hexagonal?',
      back: 'Driving (primary) gọi vào ứng dụng: REST controller, Kafka listener, test case. Driven (secondary) được ứng dụng gọi ra: repository JPA, Kafka publisher, client gọi API đối tác.',
    },
    {
      front: 'Điểm chung của Hexagonal, Onion và Clean Architecture?',
      back: 'Domain ở trung tâm, mọi phụ thuộc hướng vào trong, hạ tầng là adapter thay thế được. Khác biệt chủ yếu nằm ở tên gọi và số vòng.',
    },
    {
      front: 'Service-based architecture là gì?',
      back: 'Một số ít service lớn chia theo domain (thường 4 đến 12), có thể dùng chung database. Đây là điểm giữa thực dụng giữa monolith và microservices.',
    },
    {
      front: 'Cách giảm cold start của Java trên serverless?',
      back: 'AWS Lambda SnapStart, biên dịch native image bằng GraalVM (Spring Boot AOT), CRaC, và giữ hàm nhỏ, ít dependency.',
    },
    {
      front: 'Broker topology và mediator topology trong event-driven?',
      back: 'Broker: không có điều phối trung tâm, các thành phần phản ứng với event của nhau (choreography). Mediator: một mediator nhận event khởi đầu và điều phối các bước (orchestration), dễ kiểm soát lỗi hơn.',
    },
    {
      front: 'Các thành phần của space-based architecture?',
      back: 'Processing unit chứa logic và in-memory data grid replicate; virtualized middleware gồm messaging grid, data grid, processing grid, deployment manager; data pump, data writer, data reader đồng bộ với database bất đồng bộ.',
    },
    {
      front: 'Bốn loại filter trong pipeline architecture?',
      back: 'Producer (nguồn), transformer (biến đổi), tester (kiểm tra và loại bỏ), consumer (đích). Pipe nối các filter theo một chiều.',
    },
    {
      front: 'Fitness function là gì?',
      back: 'Phép kiểm tra khách quan, tự động, đo mức độ hệ thống còn tuân thủ một đặc tính kiến trúc. Ví dụ: rule ArchUnit, test hiệu năng trong CI, quét lỗ hổng dependency, contract test.',
    },
    {
      front: 'Rule onionArchitecture() của ArchUnit kiểm tra gì?',
      back: 'Domain model và domain service không phụ thuộc application hay adapter, application không phụ thuộc adapter, và các adapter không phụ thuộc lẫn nhau.',
    },
    {
      front: 'Áp dụng ArchUnit cho codebase cũ nhiều vi phạm thế nào?',
      back: 'Bọc rule bằng FreezingArchRule.freeze(rule): ArchUnit ghi lại các vi phạm hiện có và chỉ làm test thất bại khi xuất hiện vi phạm mới.',
    },
  ],
  'quality-attributes': [
    {
      front: 'Sáu phần của quality attribute scenario?',
      back: 'Source (nguồn kích thích), stimulus (sự kiện), artifact (phần bị tác động), environment (điều kiện), response (phản ứng) và response measure (thước đo kiểm chứng được).',
    },
    {
      front: 'Utility tree dùng để làm gì?',
      back: 'Sắp xếp các kịch bản chất lượng, chấm mức quan trọng với nghiệp vụ và độ khó kỹ thuật theo Cao, Trung bình, Thấp. Kịch bản (Cao, Cao) là nơi kiến trúc phải tập trung; dùng trong phương pháp ATAM.',
    },
    {
      front: 'Vì sao đặt NFR theo percentile thay vì trung bình?',
      back: 'Trung bình che giấu phần đuôi chậm mà nhiều người dùng thực sự gặp: trung bình 200ms vẫn có thể có p99 vài giây. Hãy dùng p95, p99 kèm tỉ lệ lỗi.',
    },
    {
      front: 'Công thức availability theo MTBF và MTTR?',
      back: 'Availability = MTBF / (MTBF + MTTR). Giảm MTTR bằng phát hiện nhanh, rollback và failover tự động thường rẻ hơn cố tăng MTBF.',
    },
    {
      front: 'Downtime mỗi tháng của 99,9% và 99,99%?',
      back: 'Với tháng 30 ngày: 99,9% khoảng 43 phút; 99,99% khoảng 4,3 phút, quá ngắn để con người kịp xử lý nên khôi phục phải tự động.',
    },
    {
      front: 'Tính availability nối tiếp và song song thế nào?',
      back: 'Nối tiếp: nhân availability các thành phần, A1 × A2 × ... × An. Song song: 1 - (1 - A)^n, chỉ đúng khi các bản sao hỏng độc lập.',
    },
    {
      front: 'Các con số thời gian nên thuộc khi ước lượng?',
      back: '1 ngày = 86.400 giây, xấp xỉ 10^5; 1 tháng khoảng 2,6 × 10^6 giây; 1 năm khoảng 3,15 × 10^7 giây.',
    },
    {
      front: 'Công thức ước lượng dung lượng lưu trữ?',
      back: 'Số bản ghi mới mỗi ngày × kích thước mỗi bản ghi × số ngày lưu × hệ số replicate.',
    },
    {
      front: 'Định luật Little áp dụng trong thiết kế thế nào?',
      back: 'Số request đồng thời = throughput × độ trễ. Ví dụ 3.600 request mỗi giây × 0,05 giây ≈ 180 request đang xử lý; dùng để định cỡ thread pool, connection pool, bulkhead.',
    },
    {
      front: 'Load, stress, spike và soak test khác nhau?',
      back: 'Load: chạy ở mức đỉnh dự kiến. Stress: vượt ngưỡng để tìm điểm gãy. Spike: tải tăng đột ngột. Soak: chạy nhiều giờ để phát hiện rò rỉ và suy giảm dần.',
    },
    {
      front: 'Mô hình tải đóng và mô hình tải mở?',
      back: 'Đóng: số người dùng ảo cố định, hệ thống chậm thì tải tự giảm, che giấu vấn đề. Mở: request đến theo tốc độ định trước như traffic thật; Gatling dùng injectOpen, k6 dùng executor arrival-rate.',
    },
    {
      front: 'Dấu hiệu hệ thống đã bão hoà khi load test?',
      back: 'Throughput ngừng tăng trong khi độ trễ tăng vọt. Khi đó tìm tài nguyên bão hoà đầu tiên như CPU, GC, connection pool, thread pool, độ trễ database.',
    },
  ],
  scalability: [
    {
      front: 'Scale dọc khác scale ngang thế nào?',
      back: 'Scale dọc dùng máy mạnh hơn: không sửa code nhưng có trần phần cứng, đắt và vẫn là điểm lỗi duy nhất. Scale ngang thêm máy sau load balancer: gần như không trần nhưng cần service stateless.',
    },
    {
      front: 'Service stateless nghĩa là gì?',
      back: 'Không giữ trạng thái riêng của client trong bộ nhớ hay đĩa cục bộ giữa các request, nên instance nào cũng phục vụ được. Session đưa ra Redis hoặc JWT, file đưa lên object storage, việc dở dang đưa vào hàng đợi.',
    },
    {
      front: 'Load balancer L4 khác L7?',
      back: 'L4 dựa trên IP và cổng, cân bằng theo kết nối, rất nhanh. L7 hiểu HTTP: định tuyến theo path, host, header, kết thúc TLS, retry và cân bằng theo từng request.',
    },
    {
      front: 'Reverse proxy thường đảm nhận những việc gì?',
      back: 'Kết thúc TLS, nén, cache phản hồi, đệm request từ client mạng chậm, giới hạn tần suất, phục vụ file tĩnh và che giấu cấu trúc bên trong. Load balancer L7 và API gateway là reverse proxy chuyên biệt.',
    },
    {
      front: 'Pull CDN khác push CDN?',
      back: 'Pull CDN: edge tự lấy nội dung từ origin khi cache miss, dễ dùng và phổ biến nhất. Push CDN: bạn chủ động đẩy nội dung lên, hợp với file lớn ít thay đổi.',
    },
    {
      front: 'Đặt Cache-Control cho API trả dữ liệu cá nhân?',
      back: 'Dùng no-store hoặc private, ví dụ CacheControl.noStore() trong Spring, để CDN không cache. public với max-age chỉ dành cho nội dung dùng chung.',
    },
    {
      front: 'Hai tham số của token bucket nghĩa là gì?',
      back: 'Capacity B là số token tối đa, quyết định burst cho phép; refill rate r là số token nạp mỗi giây, quyết định tốc độ dài hạn. Mỗi request tiêu một token, hết token thì trả 429.',
    },
    {
      front: 'Công thức sliding window counter?',
      back: 'Ước lượng = số request khung hiện tại + số request khung trước × tỉ lệ phần khung trước còn chồng lấn với cửa sổ. Gần chính xác mà tốn ít bộ nhớ.',
    },
    {
      front: 'Consistent hashing và virtual node giải quyết gì?',
      back: 'Thêm hoặc bớt node chỉ di chuyển khoảng K/N khoá thay vì gần hết như hash mod N. Virtual node cho mỗi node nhiều vị trí trên vòng để tải đều và chia phần của node rời đi cho nhiều node.',
    },
    {
      front: 'Raft bầu leader và commit dữ liệu thế nào?',
      back: 'Follower hết election timeout ngẫu nhiên thì thành candidate, tăng term, xin phiếu; đa số phiếu thì thành leader. Ghi đi qua leader, nhân bản sang follower và được commit khi đa số đã lưu.',
    },
    {
      front: 'Bố cục 64 bit của Snowflake ID?',
      back: '1 bit dấu, 41 bit timestamp mili-giây từ một mốc tự chọn (khoảng 69 năm), 10 bit worker ID (1.024 worker), 12 bit sequence (4.096 ID mỗi mili-giây mỗi worker).',
    },
    {
      front: 'Fencing token dùng để làm gì?',
      back: 'Dịch vụ lock cấp một số tăng dần mỗi lần cấp lock; tầng lưu trữ từ chối thao tác mang token cũ hơn token đã thấy. Nó ngăn tiến trình bị pause quá TTL ghi đè sau khi lock đã sang tay người khác.',
    },
  ],
  'case-studies': [
    {
      front: 'Bốn bước của khung thiết kế hệ thống?',
      back: 'Làm rõ yêu cầu và phạm vi; đề xuất thiết kế tổng thể và thống nhất; đi sâu vào 2 đến 3 phần khó nhất; tổng kết điểm nghẽn, tình huống lỗi, giám sát và hướng mở rộng.',
    },
    {
      front: 'Sáu trụ cột của AWS Well-Architected?',
      back: 'Operational excellence, security, reliability, performance efficiency, cost optimization và sustainability. Azure Well-Architected có năm trụ cột, không có sustainability như một trụ cột riêng.',
    },
    {
      front: 'Đọc kiến trúc tham chiếu cần chú ý những gì?',
      back: 'Bối cảnh và giả định; quy dịch vụ managed về building block chung; luồng dữ liệu và nơi giữ state; tình huống lỗi; thuộc tính được tối ưu; yếu tố chi phí; điều chỉnh cho bối cảnh của mình.',
    },
    {
      front: 'Câu hỏi quan trọng nhất khi đọc engineering blog?',
      back: 'Giải pháp này có áp dụng được cho hệ thống của tôi không, khi quy mô và ràng buộc khác nhau? Bài học đáng giá là cách suy luận, không phải sơ đồ.',
    },
    {
      front: 'URL shortener cần mã base62 dài bao nhiêu?',
      back: '62^6 khoảng 5,7 × 10^10 và 62^7 khoảng 3,5 × 10^12. Với khoảng 6 tỉ URL trong 5 năm, chọn 7 ký tự để có dư địa và để mã thưa, khó đoán.',
    },
    {
      front: 'Ba cách sinh mã ngắn cho URL shortener?',
      back: 'Băm URL rồi cắt (phải xử lý va chạm); bộ đếm duy nhất kết hợp base62 (cấp dải ID, nên xáo trộn để không tuần tự); chuỗi ngẫu nhiên kèm ràng buộc unique và thử lại khi trùng.',
    },
    {
      front: 'Redirect 301 khác 302 ở URL shortener?',
      back: '301 là chuyển hướng vĩnh viễn, trình duyệt có thể cache nên giảm tải nhưng mất thống kê lượt nhấn sau. 302 khiến mọi lượt nhấn đi qua server nên thống kê đầy đủ.',
    },
    {
      front: 'Fan-out on write khác fan-out on read?',
      back: 'On write: khi đăng bài thì ghi vào feed của từng follower, đọc nhanh nhưng khuếch đại ghi. On read: khi đọc mới gom bài của người đang theo dõi, ghi rẻ nhưng đọc đắt. Hybrid dùng pull cho celebrity.',
    },
    {
      front: 'Vì sao không dùng Snowflake ID làm score của Redis sorted set?',
      back: 'Score của Redis là số double, chỉ biểu diễn chính xác số nguyên tới 2^53, không đủ cho ID 64 bit. Dùng thời điểm đăng tính bằng mili-giây làm score, post_id làm member.',
    },
    {
      front: 'Vì sao phân trang feed bằng cursor thay vì offset?',
      back: 'Feed liên tục có bài mới chen vào đầu; offset làm trùng hoặc sót bài giữa các trang. Cursor dùng score của mục cuối trang trước làm mốc nên ổn định.',
    },
    {
      front: 'Giữ hàng nguyên tử trong checkout bằng SQL thế nào?',
      back: 'UPDATE inventory SET available = available - qty, reserved = reserved + qty WHERE sku = ? AND available >= qty. Một dòng bị ảnh hưởng là thành công, không dòng nào là hết hàng.',
    },
    {
      front: 'Gọi PSP bị timeout thì xử lý thế nào?',
      back: 'Coi trạng thái là chưa biết, không coi là thất bại. Truy vấn lại PSP bằng idempotency key hoặc chờ webhook đã xác minh chữ ký và job đối soát, tránh để khách thanh toán hai lần.',
    },
  ],
};

export default flashcards;
