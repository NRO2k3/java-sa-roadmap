import type { LessonFlashcards } from '../types';

const flashcards: LessonFlashcards = {
  'tech-decisions': [
    {
      front: 'Quyết định "cửa một chiều" và "cửa hai chiều" là gì?',
      back: 'Phân loại của Jeff Bezos: quyết định khó hoặc không thể đảo ngược (một chiều) cần cân nhắc kỹ; quyết định dễ đảo ngược (hai chiều) nên được quyết nhanh bởi người hoặc nhóm nhỏ có đủ thông tin.',
    },
    {
      front: 'Bốn vai trò trong mô hình DACI?',
      back: 'Driver điều phối quá trình, Approver ra quyết định cuối (chỉ một người), Contributors đóng góp chuyên môn, Informed được thông báo kết quả.',
    },
    {
      front: 'Mục đích chính của design doc hoặc RFC?',
      back: 'Đề xuất một thay đổi lớn trước khi hiện thực để thu thập góp ý khi đổi hướng còn rẻ, đồng thời buộc tác giả suy nghĩ thấu đáo khi viết rõ ràng.',
    },
    {
      front: 'Các phần chính của template RFC?',
      back: 'Tóm tắt, bối cảnh và vấn đề, goals và non-goals, thiết kế đề xuất, các phương án đã cân nhắc (luôn có "không làm gì"), mối quan tâm xuyên suốt, kế hoạch triển khai, rủi ro và câu hỏi mở.',
    },
    {
      front: 'Vì sao RFC cần mục non-goals?',
      back: 'Non-goals nói rõ những gì RFC không giải quyết, giúp giới hạn phạm vi và tránh tranh luận lan man về các vấn đề nằm ngoài đề xuất.',
    },
    {
      front: 'Quy trình review RFC hiệu quả?',
      back: 'Viết draft, gửi review kèm hạn góp ý rõ ràng, tác giả trả lời mọi comment, chỉ họp ngắn cho các điểm còn bất đồng, Approver chốt và ghi lại bằng ADR.',
    },
    {
      front: 'RFC khác ADR thế nào?',
      back: 'RFC viết trước khi quyết để đề xuất và thu góp ý, có thể dài vài trang. ADR viết khi đã quyết, thường một trang, ghi quyết định cùng lý do và tồn tại lâu dài.',
    },
    {
      front: 'Vì sao ADR nên có mục "Ý kiến khác"?',
      back: 'Ghi nhận người bất đồng đã được lắng nghe cùng lý do của họ và điều kiện xem xét lại, giúp disagree and commit lành mạnh và giúp người sau hiểu các phương án bị loại.',
    },
    {
      front: 'Câu "tôi sẽ đổi ý nếu..." có tác dụng gì khi đề xuất?',
      back: 'Cho team thấy đề xuất dựa trên lý lẽ chứ không phải sở thích, và cho họ một cách cụ thể để phản biện hoặc theo dõi khi điều kiện thay đổi.',
    },
    {
      front: 'Fist to five dùng thế nào?',
      back: 'Mỗi người giơ 0 đến 5 ngón tay: 0 là phản đối, 1–2 còn băn khoăn lớn, 3 chấp nhận được, 4–5 ủng hộ. Ai giơ 0–2 được hỏi cần thay đổi gì để có thể chấp nhận.',
    },
    {
      front: 'Consent khác consensus thế nào?',
      back: 'Consent thông qua khi không ai có phản đối nghiêm trọng. Consensus đòi mọi người đều đồng ý, tốn thời gian và dễ dẫn đến phương án "an toàn nhất".',
    },
    {
      front: 'Điều kiện để "disagree and commit" lành mạnh?',
      back: 'Mọi người thực sự được lắng nghe, quyết định và người quyết rõ ràng, ý kiến khác được ghi lại, có điểm xem xét lại. Nó không phải im lặng cho xong hay đồng ý ngoài mặt rồi làm khác.',
    },
  ],
  'tech-debt': [
    {
      front: 'Gốc và lãi của nợ kỹ thuật là gì?',
      back: 'Theo ẩn dụ của Ward Cunningham, gốc là công sức để sửa cho đúng; lãi là công sức mất thêm mỗi lần chạm vào phần code có nợ. Code xấu mà không ai chạm vào gần như không có lãi.',
    },
    {
      front: 'Sáu loại nợ kỹ thuật thường gặp?',
      back: 'Code; thiết kế và kiến trúc; test; dependency và nền tảng; build và hạ tầng; tri thức và tài liệu.',
    },
    {
      front: 'Hotspot trong phân tích nợ kỹ thuật là gì?',
      back: 'File vừa phức tạp vừa thay đổi thường xuyên, nơi lãi cao nhất. Tìm bằng cách kết hợp tần suất thay đổi từ git log với độ phức tạp từ công cụ như SonarQube.',
    },
    {
      front: 'Hai trục của Technical Debt Quadrant?',
      back: 'Cố ý hay vô tình, và thận trọng hay liều lĩnh. Bốn góc giúp hiểu nguồn gốc nợ để chọn cách xử lý, không phải để dán nhãn.',
    },
    {
      front: 'Xử lý nợ liều lĩnh cố ý và vô tình khác nhau thế nào?',
      back: 'Cố ý và liều lĩnh là vấn đề văn hoá, quy trình: siết Definition of Done, quality gate, code review. Vô tình và liều lĩnh là vấn đề năng lực: đào tạo, pair programming, mentoring.',
    },
    {
      front: 'Các cột chính của tech debt register?',
      back: 'ID, mô tả, loại, lãi, rủi ro, chi phí trả nợ, điểm ưu tiên, người phụ trách và trạng thái. Register nên đặt cạnh backlog để PO nhìn thấy.',
    },
    {
      front: 'Công thức ưu tiên đơn giản cho nợ kỹ thuật?',
      back: 'Ưu tiên = (Lãi + Rủi ro) / Chi phí, mỗi yếu tố chấm 1–5. Đây chỉ là điểm khởi đầu; nợ có rủi ro bảo mật cao như framework hết hỗ trợ cần được xử lý riêng.',
    },
    {
      front: 'Các mô hình phân bổ thời gian trả nợ?',
      back: 'Ngân sách cố định mỗi sprint, gắn vào tính năng, quy tắc hướng đạo sinh, epic riêng trong roadmap, và sprint dọn nợ (dễ bị huỷ, nên hạn chế dùng).',
    },
    {
      front: 'Spring Boot 3 yêu cầu gì so với Spring Boot 2?',
      back: 'Tối thiểu Java 17 và chuyển namespace từ javax.* sang jakarta.*, kèm các thay đổi lớn của Spring Security 6 và Hibernate 6.',
    },
    {
      front: 'Lộ trình nâng Java 8 và Boot 2 lên Java 21 và Boot 3?',
      back: 'Chuẩn bị test và kiểm kê bằng jdeps, lên Java 11 rồi 17, nâng Boot lên 2.7 mới nhất và sửa deprecation, chuyển sang Boot 3.x, cuối cùng lên Java 21. Mỗi bước chạy ổn định rồi mới đi tiếp.',
    },
    {
      front: 'Các goal chính của OpenRewrite Maven plugin?',
      back: 'rewrite:dryRun sinh file target/rewrite/rewrite.patch để xem trước; rewrite:run áp dụng thay đổi vào source; rewrite:discover liệt kê các recipe có sẵn.',
    },
    {
      front: 'Làm sao phát hiện property Spring Boot bị đổi tên khi nâng cấp?',
      back: 'Thêm tạm dependency spring-boot-properties-migrator; khi ứng dụng khởi động, nó báo các property đã đổi tên hoặc bị bỏ. Gỡ ra sau khi đã sửa xong.',
    },
  ],
  'team-architecture': [
    {
      front: 'Vision, strategy và roadmap khác nhau thế nào?',
      back: 'Vision là đích đến sau 6–12 tháng và lý do; strategy là các nguyên tắc, lựa chọn lớn để đi đến đích; roadmap là các bước cụ thể theo thời gian.',
    },
    {
      front: 'Technical vision tốt gồm những phần nào?',
      back: 'Hiện trạng có số liệu, tầm nhìn 1–2 câu, nguyên tắc, mục tiêu đo được, non-goals, roadmap Now/Next/Later, rủi ro và phụ thuộc.',
    },
    {
      front: 'Nguyên tắc vàng khi đặt coding standards?',
      back: 'Cái gì công cụ kiểm tra được thì để công cụ kiểm tra (formatter, Checkstyle, Error Prone, quality gate, ArchUnit); tài liệu chỉ ghi những quy ước công cụ không kiểm tra được.',
    },
    {
      front: 'ArchUnit là gì?',
      back: 'Thư viện Java cho phép viết quy tắc kiến trúc dưới dạng unit test, như phân tầng, cấm domain phụ thuộc framework, cấm vòng phụ thuộc; vi phạm thì build đỏ.',
    },
    {
      front: 'Áp ArchUnit cho codebase cũ có nhiều vi phạm thế nào?',
      back: 'Dùng FreezingArchRule.freeze(rule) để ghi nhận các vi phạm hiện có, chỉ chặn vi phạm mới, rồi giảm dần số vi phạm đã bị đóng băng.',
    },
    {
      front: 'Golden path là gì?',
      back: 'Con đường được team hỗ trợ đầy đủ để tạo và vận hành service: template repository hoặc archetype, parent POM chung, CI/CD mẫu, logging, tracing, xử lý lỗi chuẩn, README và runbook mẫu.',
    },
    {
      front: 'API-first nghĩa là gì?',
      back: 'Viết và review đặc tả API (OpenAPI cho REST, AsyncAPI cho sự kiện) trước khi code, để các team làm song song và tranh luận thiết kế khi thay đổi còn rẻ.',
    },
    {
      front: 'Những thay đổi API nào là breaking?',
      back: 'Thêm field bắt buộc vào request, xoá hoặc đổi tên field, đổi kiểu dữ liệu, thắt chặt validation, đổi HTTP status; thêm giá trị enum trong response cũng có thể breaking.',
    },
    {
      front: 'Consumer-driven contract testing là gì?',
      back: 'Team gọi API mô tả kỳ vọng thành contract (Spring Cloud Contract, Pact); pipeline của team cung cấp API chạy các contract đó, nên breaking change bị phát hiện trước khi deploy.',
    },
    {
      front: 'Conway\'s Law nói gì?',
      back: 'Tổ chức thiết kế hệ thống sẽ tạo ra thiết kế phản chiếu cấu trúc giao tiếp của chính nó. Inverse Conway Maneuver là thiết kế ranh giới team trước để kiến trúc mong muốn hình thành tự nhiên.',
    },
    {
      front: 'Ba chế độ tương tác trong Team Topologies?',
      back: 'Collaboration (làm sát nhau trong thời gian giới hạn để khám phá), X-as-a-Service (cung cấp và dùng với ít trao đổi), Facilitating (giúp team khác học hoặc gỡ vướng).',
    },
    {
      front: 'Cognitive load liên quan gì đến ranh giới team?',
      back: 'Lượng thông tin một team nắm được có giới hạn, nên phần hệ thống team sở hữu phải vừa sức; quá tải thì chất lượng và tốc độ xử lý sự cố đều giảm.',
    },
  ],
  'knowledge-sharing': [
    {
      front: 'Tri thức ngầm (tacit knowledge) là gì?',
      back: 'Hiểu biết không được ghi lại, như vì sao module được thiết kế vậy, chỗ nào hay lỗi, cách xử lý sự cố. Nó không tự lan toả nên chia sẻ phải thành thói quen của team.',
    },
    {
      front: 'Brown-bag khác lightning talk thế nào?',
      back: 'Brown-bag là buổi chia sẻ thân mật, thường vào giờ trưa, khoảng 30 phút cho một chủ đề. Lightning talk là nhiều bài 5–10 phút trong một buổi, hợp cho mẹo nhỏ và người mới tập trình bày.',
    },
    {
      front: 'Bí quyết duy trì tech talk lâu dài?',
      back: 'Lịch cố định, rào cản thấp (không cần slide đẹp), chủ đề từ công việc thật, lead làm mẫu trước rồi luân phiên, lưu ghi chú và link ở một nơi cố định.',
    },
    {
      front: 'Driver và navigator trong pair programming?',
      back: 'Driver gõ code và tập trung vào chi tiết trước mắt; navigator quan sát, nghĩ bước tiếp theo, phát hiện lỗi và đặt câu hỏi. Hai người đổi vai thường xuyên.',
    },
    {
      front: 'Ping-pong pairing và strong-style pairing?',
      back: 'Ping-pong: một người viết test đỏ, người kia viết code cho xanh rồi viết test tiếp, hợp với TDD. Strong-style: navigator nói, driver gõ, ý tưởng phải qua tay người kia, hợp để truyền kiến thức.',
    },
    {
      front: 'Khi nào nên dùng mob programming?',
      back: 'Khi làm phần phức tạp, quan trọng mà nhiều người cần hiểu, khi thống nhất cách làm mới cho cả team, hoặc chuyển giao tri thức từ chuyên gia cho cả nhóm. Không dùng cho việc đơn giản.',
    },
    {
      front: 'Bốn loại tài liệu theo Diátaxis?',
      back: 'Tutorial (học bằng cách làm), How-to guide (hoàn thành một việc cụ thể), Reference (tra cứu thông tin chính xác), Explanation (hiểu vì sao).',
    },
    {
      front: 'Runbook tốt cần những phần nào?',
      back: 'Ảnh hưởng và mức độ, bước kiểm tra nhanh, nguyên nhân thường gặp và cách xử lý, cách thu thập bằng chứng trước khi restart, khi nào leo thang và cho ai, việc cần làm sau sự cố.',
    },
    {
      front: 'Docs-as-code là gì?',
      back: 'Tài liệu nằm trong repo cạnh code, viết bằng Markdown, thay đổi qua Pull Request và được review như code; Definition of Done có mục cập nhật tài liệu liên quan.',
    },
    {
      front: 'Bus factor là gì?',
      back: 'Số người tối thiểu phải đột ngột vắng mặt thì hệ thống hoặc dự án bị đình trệ. Bus factor bằng 1 là mức rủi ro cao nhất.',
    },
    {
      front: 'Knowledge matrix dùng thế nào?',
      back: 'Bảng người và hệ thống chấm 0–3: chưa biết, làm được khi có hướng dẫn, tự làm được, xử lý sự cố và dạy được. Mục tiêu là mỗi hệ thống quan trọng có ít nhất 2 người đạt mức 2 trở lên.',
    },
    {
      front: 'Dấu hiệu Tech Lead đang là bus factor 1 của team?',
      back: 'Mọi quyết định và mọi sự cố đều phải qua lead. Cách sửa: uỷ quyền, chỉ định đầu mối cho từng hệ thống, đưa tri thức của mình vào ADR và tài liệu.',
    },
  ],
};

export default flashcards;
