import type { LessonFlashcards } from '../types';

const flashcards: LessonFlashcards = {
  requirements: [
    {
      front: 'Yêu cầu chức năng khác yêu cầu phi chức năng thế nào?',
      back: 'Yêu cầu chức năng mô tả hệ thống làm gì (hành vi, nghiệp vụ). Yêu cầu phi chức năng (NFR) mô tả hệ thống làm tốt đến mức nào: hiệu năng, độ sẵn sàng, bảo mật, khả năng bảo trì. NFR thường quyết định kiến trúc nhiều hơn.',
    },
    {
      front: 'Quality attribute scenario gồm những phần nào?',
      back: 'Sáu phần: nguồn (source), kích thích (stimulus), đối tượng bị tác động (artifact), môi trường (environment), phản hồi (response) và thước đo phản hồi (response measure).',
    },
    {
      front: 'Ai xác nhận các con số trong kịch bản NFR?',
      back: 'Business hoặc stakeholder có thẩm quyền, không phải SA tự đặt. Nếu chưa có số liệu, ghi rõ đó là giả định và lên lịch kiểm chứng.',
    },
    {
      front: 'Vì sao nên hỏi "vì sao" trước khi hỏi "cái gì"?',
      back: 'Để hiểu mục tiêu kinh doanh đằng sau yêu cầu và tách yêu cầu cứng khỏi mong muốn, ví dụ hỏi vì sao cần giao trong 2 giờ và nếu chỉ đạt 4 giờ thì sao.',
    },
    {
      front: 'MoSCoW là gì?',
      back: 'Kỹ thuật ưu tiên hoá chia yêu cầu thành Must (bắt buộc cho lần ra mắt), Should (quan trọng nhưng có thể lùi), Could (có thì tốt) và Won\'t (không làm lần này).',
    },
    {
      front: 'Bốn ô của lưới quyền lực – mức quan tâm?',
      back: 'Quản lý chặt (quyền lực cao, quan tâm cao), Giữ hài lòng (quyền lực cao, quan tâm thấp), Thông tin thường xuyên (quyền lực thấp, quan tâm cao), Theo dõi (cả hai thấp).',
    },
    {
      front: 'Stakeholder register ghi những gì?',
      back: 'Mỗi stakeholder cùng mối quan tâm chính, vị trí trên lưới quyền lực – mức quan tâm, chiến lược tương tác, kênh và tần suất giao tiếp.',
    },
    {
      front: 'Phân biệt yêu cầu, ràng buộc và giả định?',
      back: 'Yêu cầu là điều hệ thống phải đạt, mức độ thương lượng được. Ràng buộc là điều bị áp đặt, thường không thương lượng được. Giả định là điều tin là đúng nhưng chưa kiểm chứng, cần người chịu trách nhiệm kiểm chứng.',
    },
    {
      front: 'Những nhóm ràng buộc SA cần hỏi sớm?',
      back: 'Ngân sách, thời gian, kỹ năng đội ngũ và pháp lý như bảo vệ dữ liệu cá nhân hay PCI DSS; ngoài ra là ràng buộc tổ chức, kỹ thuật như bắt buộc dùng hệ thống sẵn có.',
    },
    {
      front: 'Business capability là gì?',
      back: 'Những gì doanh nghiệp có khả năng làm để tạo ra giá trị, độc lập với quy trình và hệ thống, ví dụ Quản lý tồn kho. Capability ổn định hơn quy trình nên là điểm neo tốt để vạch ranh giới hệ thống.',
    },
    {
      front: 'Capability heat map dùng để làm gì?',
      back: 'Đánh dấu mức đáp ứng hiện tại của từng capability (tốt, yếu, chưa có) để tìm ra khoảng trống (gap) quan trọng nhất cần đầu tư.',
    },
    {
      front: 'Ma trận truy vết yêu cầu có tác dụng gì?',
      back: 'Nối mỗi yêu cầu và ràng buộc với capability và quyết định kiến trúc (ADR), giúp trả lời vì sao chọn giải pháp này và đánh giá ảnh hưởng khi yêu cầu thay đổi.',
    },
  ],
  documentation: [
    {
      front: 'Bốn mức của mô hình C4?',
      back: 'System Context, Container, Component và Code, phóng to dần như bản đồ: từ hệ thống trong bối cảnh xung quanh đến chi tiết class.',
    },
    {
      front: 'Container trong C4 là gì?',
      back: 'Đơn vị chạy hoặc lưu trữ dữ liệu triển khai được riêng, như ứng dụng Spring Boot, SPA, app mobile, database, message broker. Không phải Docker container.',
    },
    {
      front: 'Sơ đồ System Context dành cho ai, chứa gì?',
      back: 'Dành cho mọi người, kể cả người không làm kỹ thuật. Chỉ gồm người dùng, hệ thống của bạn và các hệ thống xung quanh, không có công nghệ hay database.',
    },
    {
      front: 'Khi nào nên vẽ sơ đồ Component và Code?',
      back: 'Component chỉ vẽ cho container phức tạp hoặc quan trọng. Code hiếm khi vẽ tay vì thay đổi theo từng commit; nếu cần thì sinh tự động từ IDE.',
    },
    {
      front: 'Ba loại sơ đồ bổ trợ của C4?',
      back: 'System Landscape (toàn bộ hệ thống trong doanh nghiệp), Dynamic (một kịch bản chạy qua các phần tử theo thứ tự) và Deployment (container được triển khai lên hạ tầng nào).',
    },
    {
      front: 'Quy tắc để sơ đồ kiến trúc dễ hiểu?',
      back: 'Có tiêu đề và chú giải; mỗi phần tử có tên, loại, công nghệ, mô tả; mũi tên một chiều có nhãn động từ và giao thức; mỗi sơ đồ chỉ một mức trừu tượng.',
    },
    {
      front: 'Các phần của ADR theo định dạng Michael Nygard?',
      back: 'Title, Status, Context, Decision, Consequences. Các biến thể như MADR bổ sung yếu tố quyết định và các phương án đã cân nhắc.',
    },
    {
      front: 'Khi nào một quyết định đáng ghi ADR?',
      back: 'Khi nó khó hoặc tốn kém để đảo ngược, ảnh hưởng nhiều team hay container, tác động lên NFR quan trọng, hoặc là điều người mới chắc chắn sẽ hỏi vì sao.',
    },
    {
      front: 'Vòng đời trạng thái của ADR?',
      back: 'Proposed, Accepted, rồi Deprecated hoặc Superseded by ADR khác. ADR đã Accepted không sửa nội dung quyết định; khi bối cảnh đổi thì viết ADR mới.',
    },
    {
      front: 'arc42 gồm những mục nào?',
      back: '12 mục: Introduction and Goals, Constraints, Context and Scope, Solution Strategy, Building Block View, Runtime View, Deployment View, Cross-cutting Concepts, Architecture Decisions, Quality Requirements, Risks and Technical Debt, Glossary.',
    },
    {
      front: 'Điểm mạnh chính của Structurizr DSL?',
      back: 'Tách model khỏi view: phần tử và quan hệ khai báo một lần, nhiều sơ đồ sinh từ cùng model nên luôn nhất quán; đổi tên trong model thì mọi view cùng cập nhật.',
    },
    {
      front: 'Khi nào chọn PlantUML, khi nào chọn Mermaid?',
      back: 'PlantUML kèm C4-PlantUML linh hoạt, nhiều loại sơ đồ UML, phổ biến với dân Java. Mermaid gọn, được GitHub và GitLab render sẵn, hợp cho README và sơ đồ nhỏ; hỗ trợ C4 của Mermaid còn thử nghiệm.',
    },
  ],
  tradeoffs: [
    {
      front: 'ATAM là gì và nhằm mục tiêu gì?',
      back: 'Architecture Tradeoff Analysis Method do SEI (Carnegie Mellon) phát triển. Mục tiêu là tìm xem kiến trúc đáp ứng mục tiêu chất lượng tới đâu và các quyết định đang đánh đổi gì, không phải chấm điểm kiến trúc.',
    },
    {
      front: 'Sensitivity point khác trade-off point thế nào?',
      back: 'Sensitivity point là tham số mà một thuộc tính chất lượng phụ thuộc mạnh vào. Trade-off point là sensitivity point ảnh hưởng nhiều thuộc tính theo hướng ngược nhau, ví dụ số lần retry.',
    },
    {
      front: 'Utility tree là gì?',
      back: 'Cây phân rã chất lượng thành thuộc tính rồi thành kịch bản cụ thể; mỗi kịch bản gắn nhãn H/M/L cho mức quan trọng với business và độ khó hiện thực. Kịch bản (H,H) là trọng tâm phân tích.',
    },
    {
      front: 'Các bước lập ma trận quyết định có trọng số?',
      back: 'Chốt tiêu chí từ NFR và ràng buộc; gán trọng số cùng stakeholder trước khi chấm; chấm 1–5 kèm lý do; tính tổng có trọng số; phân tích độ nhạy bằng cách thay đổi trọng số.',
    },
    {
      front: 'Build vs buy theo loại subdomain?',
      back: 'Core (tạo khác biệt cạnh tranh) thì tự xây; Supporting (đặc thù nhưng không khác biệt) thì xây đơn giản hoặc mua rồi tuỳ biến; Generic (mọi công ty giống nhau) thì mua hoặc dùng SaaS.',
    },
    {
      front: 'Phân biệt spike, PoC, prototype và MVP?',
      back: 'Spike trả lời nhanh một câu hỏi kỹ thuật hẹp; PoC chứng minh hướng tiếp cận khả thi theo tiêu chí đo được; prototype thử luồng người dùng; MVP là sản phẩm tối thiểu cho người dùng thật và được giữ lại.',
    },
    {
      front: 'PoC charter cần có những gì?',
      back: 'Giả thuyết, lý do quan trọng, tiêu chí thành công đo được đặt trước, phạm vi và ngoài phạm vi, time-box, môi trường và dữ liệu, kết quả đạt, không đạt hoặc đạt có điều kiện.',
    },
    {
      front: 'TCO gồm những nhóm chi phí nào?',
      back: 'Chi phí ban đầu, hạ tầng định kỳ, vận hành (on-call, vá lỗi, nâng cấp), license và thuê bao, cùng các chi phí dễ quên như chi phí rời bỏ, tuân thủ, kiểm thử bảo mật.',
    },
    {
      front: 'Ba giai đoạn vòng đời FinOps?',
      back: 'Inform (thấy rõ và phân bổ chi phí), Optimize (tối ưu mức dùng và giá), Operate (vận hành liên tục, gắn với quy trình và mục tiêu kinh doanh).',
    },
    {
      front: 'Unit economics trong FinOps là gì?',
      back: 'Theo dõi chi phí trên một đơn vị kinh doanh, ví dụ chi phí cloud trên mỗi đơn hàng. Tổng chi phí tăng chưa chắc xấu nếu chi phí mỗi đơn giảm.',
    },
    {
      front: 'Các bước chính của Strangler Fig?',
      back: 'Chọn lát cắt chức năng, đặt facade như API gateway trước hệ legacy, xây chức năng ở service mới với anti-corruption layer, chuyển dần traffic có đường quay lui, đồng bộ dữ liệu, rồi gỡ code legacy đã thay thế.',
    },
    {
      front: 'Khi nào Strangler Fig không phù hợp?',
      back: 'Khi hệ legacy nhỏ, đơn giản đến mức viết lại rẻ hơn, hoặc khi không chặn được lời gọi, ví dụ các hệ tích hợp qua file batch hay đọc chung database; khi đó cần kỹ thuật khác trước.',
    },
  ],
  enterprise: [
    {
      front: 'Enterprise Architect khác Solution Architect thế nào?',
      back: 'EA lo toàn doanh nghiệp trong nhiều năm: nguyên tắc, kiến trúc đích, chuẩn công nghệ. SA lo một sáng kiến cụ thể, thiết kế giải pháp đáp ứng yêu cầu trong khuôn khổ chung đó.',
    },
    {
      front: 'Bốn tầng kiến trúc trong TOGAF?',
      back: 'Business, Data, Application, Technology. Data và Application được gộp thành Information Systems Architectures; nghiệp vụ dẫn dắt dữ liệu và ứng dụng, ứng dụng dẫn dắt công nghệ.',
    },
    {
      front: 'Các pha của TOGAF ADM theo thứ tự?',
      back: 'Preliminary, A Architecture Vision, B Business, C Information Systems, D Technology, E Opportunities and Solutions, F Migration Planning, G Implementation Governance, H Architecture Change Management; Requirements Management ở trung tâm.',
    },
    {
      front: 'Baseline, target, gap analysis, transition architecture?',
      back: 'Baseline là kiến trúc hiện tại, target là kiến trúc mục tiêu, gap analysis tìm khoảng cách giữa hai trạng thái, transition architecture là các trạng thái trung gian ổn định khi không thể đi một bước.',
    },
    {
      front: 'SA thường tham gia nhiều nhất ở pha nào của ADM?',
      back: 'Các pha C, D (thiết kế giải pháp theo chuẩn chung), E, F (đề xuất lộ trình) và G (giải pháp được review tuân thủ theo Architecture Contract).',
    },
    {
      front: 'Bốn phần của một nguyên tắc kiến trúc theo TOGAF?',
      back: 'Name, Statement, Rationale và Implications. Implications quan trọng nhất vì nói rõ nguyên tắc buộc mọi người phải làm gì khác đi.',
    },
    {
      front: 'Fitness function trong governance là gì?',
      back: 'Kiểm tra tự động trong pipeline để thực thi nguyên tắc kiến trúc, ví dụ Maven Enforcer với requireJavaVersion và bannedDependencies đặt trong parent POM dùng chung.',
    },
    {
      front: 'Khi nào nên trình Architecture Review Board?',
      back: 'Khi đưa vào công nghệ mới hoặc đang ở vòng Hold, thay đổi tích hợp liên domain, tạo hệ thống mới, xử lý dữ liệu nhạy cảm, chi phí vượt ngưỡng hoặc vi phạm nguyên tắc kiến trúc.',
    },
    {
      front: 'Dispensation trong governance là gì?',
      back: 'Ngoại lệ cho phép giải pháp sai khác với nguyên tắc trong một thời hạn, kèm kế hoạch khắc phục và người chịu trách nhiệm. Ngoại lệ không có hạn sẽ trở thành tiêu chuẩn ngầm.',
    },
    {
      front: 'Làm sao để ARB không thành nút cổ chai?',
      back: 'Phân tầng governance, dùng guardrail tự động thay cho gate thủ công, cam kết thời gian phản hồi, công khai quyết định và khuyến khích các team đến tư vấn sớm.',
    },
    {
      front: 'Bốn nhóm của mô hình TIME?',
      back: 'Tolerate (kỹ thuật tốt, giá trị nghiệp vụ thấp), Invest (cả hai cao), Migrate (giá trị cao, kỹ thuật kém), Eliminate (cả hai thấp).',
    },
    {
      front: 'Bốn vòng của technology radar?',
      back: 'Adopt (mặc định cho việc mới), Trial (dùng ở dự án chấp nhận được rủi ro), Assess (tìm hiểu, PoC, chưa dùng production), Hold (không dùng cho việc mới, có kế hoạch rời bỏ).',
    },
  ],
  'soft-skills': [
    {
      front: 'BLUF là gì?',
      back: 'Bottom Line Up Front: đưa kết luận và đề xuất lên đầu, sau đó mới đến lý do và chi tiết. Rất hợp với người nghe cấp cao ít thời gian.',
    },
    {
      front: 'Pyramid Principle của Barbara Minto?',
      back: 'Bắt đầu bằng câu trả lời chính, sau đó là các luận điểm hỗ trợ được nhóm lại, cuối cùng mới đến dữ liệu chi tiết.',
    },
    {
      front: 'Khung SCR gồm những gì?',
      back: 'Situation (tình hình hiện tại), Complication (vấn đề hoặc thay đổi buộc phải hành động) và Resolution (đề xuất giải quyết).',
    },
    {
      front: 'Ban lãnh đạo và developer cần gì khác nhau khi nghe trình bày?',
      back: 'Ban lãnh đạo cần kết luận, các lựa chọn kèm chi phí, rủi ro và quyết định cần đưa ra. Developer cần lý do, ranh giới, sơ đồ Container và Component, ADR và các tình huống lỗi.',
    },
    {
      front: 'Pre-wire là gì?',
      back: 'Gặp riêng những người có ảnh hưởng hoặc có khả năng phản đối trước buổi họp quan trọng để hiểu mối quan tâm của họ, tránh bất ngờ trước đám đông.',
    },
    {
      front: 'Bốn nguyên tắc đàm phán trong Getting to Yes?',
      back: 'Tách con người khỏi vấn đề; tập trung vào lợi ích, không vào lập trường; tạo nhiều lựa chọn cùng có lợi; dùng tiêu chí khách quan.',
    },
    {
      front: 'BATNA là gì?',
      back: 'Best Alternative To a Negotiated Agreement: phương án tốt nhất nếu không đạt được thoả thuận. Biết BATNA giúp quyết định khi nào nên nhượng bộ, khi nào nên leo thang.',
    },
    {
      front: 'Leo thang chung (joint escalation) làm thế nào?',
      back: 'Hai bên cùng viết một trang gồm vấn đề, các phương án và quan điểm của mỗi bên một cách công bằng, rồi cùng mang lên người có thẩm quyền quyết định.',
    },
    {
      front: 'Conventional Comments là gì?',
      back: 'Quy ước comment khi review, bắt đầu bằng nhãn như praise, nitpick, suggestion, issue, question, có thể kèm (blocking) hoặc (non-blocking) để tác giả biết comment nào bắt buộc xử lý.',
    },
    {
      front: 'SA nên tập trung vào gì khi review code?',
      back: 'Những điều công cụ không bắt được: ranh giới module, xử lý lỗi khi gọi bên ngoài, transaction, nhất quán dữ liệu, bảo mật. Phần định dạng để formatter và linter lo.',
    },
    {
      front: 'Vì sao không nên gọi HTTP bên trong @Transactional?',
      back: 'Connection DB bị giữ suốt thời gian chờ HTTP, dễ cạn pool khi bên ngoài chậm; nếu gọi thành công mà commit thất bại thì dữ liệu hai bên lệch nhau.',
    },
    {
      front: 'Nguyên tắc viết tài liệu kỹ thuật ngắn gọn?',
      back: 'Biết người đọc và việc họ cần làm; kết luận trước; cụ thể bằng số liệu, tên, ngày; một đoạn một ý, dùng bảng và danh sách; cắt mọi câu không giúp người đọc hiểu hoặc quyết định.',
    },
  ],
};

export default flashcards;
