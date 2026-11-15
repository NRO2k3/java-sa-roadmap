import type { LessonFlashcards } from '../types';

const flashcards: LessonFlashcards = {
  'certs-java': [
    {
      front: 'Mã bài thi OCP cho Java SE 17 và Java SE 21?',
      back: 'Tại thời điểm viết: 1Z0-829 cho Java SE 17 và 1Z0-830 cho Java SE 21. Mã đề có thể thay đổi, hãy kiểm tra Oracle University trước khi đăng ký.',
    },
    {
      front: 'Đặc trưng dạng câu hỏi của đề OCP?',
      back: 'Nhiều câu cho một đoạn code và hỏi in ra gì, có biên dịch được không, có ném exception không. Không có IDE hỗ trợ nên phải nắm chắc quy tắc ngôn ngữ.',
    },
    {
      front: 'Những chủ đề OCP mà developer Spring thường yếu?',
      back: 'Module system (module-info.java), I/O và NIO.2, localization, và thứ tự khởi tạo object gồm static block, instance initializer, constructor.',
    },
    {
      front: 'Bước đầu tiên của kế hoạch ôn thi chứng chỉ?',
      back: 'Làm một đề thi thử chẩn đoán ngay tuần đầu để biết điểm yếu theo nhóm chủ đề, rồi dồn thời gian cho các chủ đề đó thay vì đọc sách từ đầu đến cuối.',
    },
    {
      front: 'Sổ lỗi sai khi ôn thi gồm những gì?',
      back: 'Với mỗi câu sai: chủ đề, vì sao sai, quy tắc đúng, và một đoạn code tự viết để chứng minh. Ôn lại sổ này mỗi tuần.',
    },
    {
      front: 'Cách kiểm chứng nhanh một quy tắc Java khi ôn thi?',
      back: 'Dùng JShell hoặc chạy trực tiếp file nguồn bằng java File.java (từ Java 11) để thử từng quy tắc mà không cần tạo project.',
    },
    {
      front: 'Spring Professional tập trung đánh giá điều gì?',
      back: 'Hiểu cơ chế bên trong Spring: container và vòng đời bean, proxy và AOP, transaction, data access, MVC/REST, security, testing và auto-configuration của Spring Boot.',
    },
    {
      front: 'Chứng chỉ Spring hiện được tổ chức qua đâu?',
      back: 'Ban đầu do Pivotal rồi VMware cấp; sau khi Broadcom mua VMware, đào tạo và chứng chỉ Spring được tổ chức qua Spring Academy. Mã đề từng dùng là 2V0-72.22, cần kiểm tra lại trước khi thi.',
    },
    {
      front: 'Dấu hiệu bạn đã sẵn sàng đăng ký thi?',
      back: 'Đã đọc đề cương đúng phiên bản, đạt ổn định trên mức đạt một khoảng an toàn ở 2–3 đề thi thử gần nhất, và sổ lỗi sai không còn chủ đề sai lặp lại.',
    },
    {
      front: 'Vì sao không nên học đề dump?',
      back: 'Vi phạm điều khoản thi, có thể bị thu hồi chứng chỉ, đáp án có thể sai, và không để lại kiến thức dùng được trong công việc.',
    },
    {
      front: 'Chứng chỉ Java/Spring có vai trò gì trên lộ trình SA?',
      back: 'Là bằng chứng nền tảng kỹ thuật và động lực học có hệ thống, nhưng không chứng minh năng lực thiết kế; chứng chỉ cloud architect và portfolio gắn trực tiếp hơn với vai trò SA.',
    },
  ],

  'certs-cloud': [
    {
      front: 'Bốn domain của AWS Solutions Architect Associate?',
      back: 'Design Secure Architectures, Design Resilient Architectures, Design High-Performing Architectures, Design Cost-Optimized Architectures.',
    },
    {
      front: 'Sáu trụ cột của AWS Well-Architected Framework?',
      back: 'Operational Excellence, Security, Reliability, Performance Efficiency, Cost Optimization, Sustainability.',
    },
    {
      front: 'AWS SA Professional thêm những mảng nào so với Associate?',
      back: 'Kiến trúc nhiều account (Organizations, SCP, Control Tower), mạng hybrid quy mô lớn (Transit Gateway, Direct Connect, VPN), migration và hiện đại hoá, cải tiến hệ thống hiện có, DR theo RTO/RPO.',
    },
    {
      front: 'Bốn chiến lược DR, từ rẻ đến đắt?',
      back: 'Backup and restore, pilot light, warm standby, multi-site active/active. Càng về sau RTO và RPO càng thấp nhưng chi phí càng cao.',
    },
    {
      front: 'Điều kiện đạt và cách duy trì Azure Solutions Architect Expert?',
      back: 'Đạt AZ-305 và có Azure Administrator Associate (AZ-104). Chứng chỉ role-based của Microsoft hết hạn sau một năm, gia hạn bằng bài đánh giá online miễn phí trên Microsoft Learn.',
    },
    {
      front: 'Bốn mảng kỹ năng của AZ-305?',
      back: 'Thiết kế identity, governance và monitoring; thiết kế lưu trữ dữ liệu; thiết kế liên tục kinh doanh (business continuity); thiết kế hạ tầng.',
    },
    {
      front: 'Cách chuẩn bị case study cho Google Professional Cloud Architect?',
      back: 'Với mỗi case study trong exam guide, tách yêu cầu kinh doanh, yêu cầu kỹ thuật, hiện trạng và ràng buộc, rồi phác kiến trúc mục tiêu cùng lý do chọn dịch vụ trước khi thi.',
    },
    {
      front: 'CKAD khác CKA thế nào?',
      back: 'CKAD dành cho developer: thiết kế, triển khai, cấu hình, quan sát ứng dụng trên Kubernetes. CKA dành cho người vận hành: cài đặt, nâng cấp cluster bằng kubeadm, backup etcd, RBAC, storage, troubleshooting.',
    },
    {
      front: 'Mẹo tăng tốc khi thi CKA/CKAD?',
      back: 'Dùng alias k=kubectl, sinh YAML bằng --dry-run=client -o yaml, tra field bằng kubectl explain, và luôn chạy kubectl config use-context đúng cluster trước mỗi câu.',
    },
    {
      front: 'Bốn bước giải câu hỏi tình huống kiến trúc?',
      back: 'Đọc câu hỏi cuối trước; gạch chân ràng buộc như chi phí, vận hành, sẵn sàng, độ trễ, bảo mật; loại đáp án vi phạm ràng buộc; so hai đáp án còn lại theo ràng buộc được nhấn mạnh nhất.',
    },
    {
      front: 'Cụm least operational overhead trong đề thường gợi ý gì?',
      back: 'Ưu tiên dịch vụ managed hoặc serverless thay vì tự cài đặt và vận hành phần mềm trên máy ảo.',
    },
    {
      front: 'Kiểm soát chi phí khi làm lab cloud thế nào?',
      back: 'Đặt cảnh báo ngân sách từ ngày đầu, gắn tag tài nguyên lab, dựng hạ tầng bằng IaC để xoá bằng một lệnh, chú ý tài nguyên tính tiền theo giờ như NAT Gateway, load balancer, database.',
    },
  ],

  portfolio: [
    {
      front: 'Ba tín hiệu nhà tuyển dụng tìm trong portfolio SA?',
      back: 'Tư duy có cấu trúc (bắt đầu từ yêu cầu và ràng buộc), trade-off rõ ràng (đã cân nhắc phương án nào, vì sao chọn), và khả năng giao tiếp qua sơ đồ, tài liệu dễ hiểu.',
    },
    {
      front: 'Một bài thiết kế trong portfolio nên có những phần nào?',
      back: 'Bối cảnh, yêu cầu chức năng, yêu cầu phi chức năng có số liệu, ràng buộc, ước lượng quy mô, sơ đồ C4, quyết định chính kèm ADR, rủi ro và trade-off, hướng tiến hoá.',
    },
    {
      front: 'ADR theo định dạng của Michael Nygard gồm những phần nào?',
      back: 'Tiêu đề, trạng thái, bối cảnh, quyết định, hệ quả. Nhiều team bổ sung phần các phương án đã cân nhắc.',
    },
    {
      front: 'Bốn mức của mô hình C4?',
      back: 'Context (hệ thống với người dùng và hệ thống ngoài), Container (ứng dụng, kho dữ liệu triển khai độc lập), Component (thành phần trong một container), Code (class, thường không cần vẽ).',
    },
    {
      front: 'Quy tắc vẽ sơ đồ kiến trúc dễ đọc?',
      back: 'Mỗi sơ đồ có tiêu đề và chú thích; mỗi hộp ghi tên, vai trò, công nghệ; mỗi mũi tên ghi mục đích và giao thức; tách theo mức C4 thay vì nhồi mọi thứ vào một sơ đồ.',
    },
    {
      front: 'Viết về dự án của công ty có NDA thế nào?',
      back: 'Ẩn danh hoá: đổi miền nghiệp vụ, bỏ số liệu nhạy cảm, tên khách hàng, mã nguồn và cấu hình nội bộ; hỏi phép công ty, hoặc chỉ viết về pattern và bài học.',
    },
    {
      front: 'Khung sáu phần của một bài blog kiến trúc?',
      back: 'Vấn đề có con số, bối cảnh và ràng buộc, các phương án, quyết định và cách triển khai, kết quả đo được, bài học kèm điều kiện mà giải pháp không phù hợp.',
    },
    {
      front: 'Sáu bước của khung phỏng vấn system design?',
      back: 'Làm rõ yêu cầu, ước lượng quy mô, API và mô hình dữ liệu, thiết kế tổng thể, đào sâu một hai điểm khó, rồi trade-off, điểm nghẽn và hướng tiến hoá.',
    },
    {
      front: 'STAR gồm những phần nào?',
      back: 'Situation (bối cảnh), Task (trách nhiệm của bạn), Action (bạn đã làm gì, vì sao), Result (kết quả đo được); thường thêm Reflection để nêu bài học.',
    },
    {
      front: 'Hai nguyên tắc quan trọng khi kể chuyện theo STAR?',
      back: 'Nói "tôi" khi mô tả hành động của bạn thay vì "chúng tôi", và có con số ở phần kết quả nếu có thể. Mỗi câu chuyện nên dài khoảng 2–3 phút.',
    },
    {
      front: 'Khung bảy bước để kể một quyết định kiến trúc?',
      back: 'Bối cảnh, ràng buộc, các phương án nghiêm túc, tiêu chí ưu tiên, quyết định và cách thuyết phục stakeholder, kết quả đo được, nhìn lại điều sẽ làm khác.',
    },
    {
      front: 'Vì sao nên chuẩn bị cả câu chuyện về quyết định sai?',
      back: 'Người phỏng vấn đánh giá cao khả năng nhận ra sai lầm, giảm thiểu thiệt hại và rút bài học; chỉ kể thành công nghe thiếu thực tế.',
    },
  ],
};

export default flashcards;
