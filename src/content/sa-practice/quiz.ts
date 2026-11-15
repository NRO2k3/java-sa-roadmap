import type { LessonQuiz } from '../types';

const quiz: LessonQuiz = {
  requirements: [
    {
      question: 'CEO nói: "Ứng dụng phải chịu được tải lớn dịp khuyến mãi". Bước tiếp theo tốt nhất của SA là gì?',
      options: [
        'Đề xuất ngay kiến trúc microservice với Kafka để đảm bảo khả năng mở rộng',
        'Cùng business biến yêu cầu thành kịch bản có số liệu như đơn mỗi phút và p95',
        'Ghi nguyên văn yêu cầu vào tài liệu và để team tự diễn giải khi hiện thực',
        'Yêu cầu team chạy load test hệ thống hiện tại trước khi trao đổi thêm',
      ],
      answer: 1,
      explanation: 'NFR mơ hồ cần được chuyển thành quality attribute scenario đo được, với con số do business xác nhận. Chọn công nghệ trước khi có số liệu là nhảy vào giải pháp quá sớm.',
    },
    {
      question: 'Trưởng bộ phận bảo mật hiếm khi dự họp dự án nhưng có quyền chặn go-live. Theo lưới quyền lực – mức quan tâm, nên tương tác thế nào?',
      options: [
        'Chỉ theo dõi và thông báo khi dự án đã hoàn thành',
        'Mời tham gia mọi buổi daily để họ luôn nắm tiến độ',
        'Gửi bản tin hằng tuần giống như cho các thành viên team',
        'Giữ hài lòng: mời review thiết kế ở các mốc then chốt',
      ],
      answer: 3,
      explanation: 'Quyền lực cao, mức quan tâm thấp thuộc ô "giữ hài lòng". Đưa họ vào review sớm ở các mốc quan trọng giúp tránh bị chặn phút cuối mà không làm phiền bằng chi tiết hằng ngày.',
    },
    {
      question: 'CEO muốn giao hàng 2 giờ trên toàn quốc ngay lần ra mắt, nhưng việc tích hợp tồn kho thời gian thực cho mọi cửa hàng cần thêm khoảng 2 tháng. SA nên phản hồi thế nào?',
      options: [
        'Đồng ý để giữ quan hệ, sau đó tìm cách cho team làm thêm giờ',
        'Từ chối thẳng vì yêu cầu không khả thi trong thời gian đã định',
        'Đưa lựa chọn: lùi hạn cho toàn quốc, hoặc đúng hạn ở vài thành phố trước',
        'Chuyển quyết định cho PO vì phạm vi sản phẩm không phải việc của SA',
      ],
      answer: 2,
      explanation: 'Quản lý kỳ vọng tốt là trình bày các lựa chọn cùng "giá" của mỗi lựa chọn để người có thẩm quyền quyết định. Hứa suông hoặc từ chối thẳng đều làm mất niềm tin.',
    },
    {
      question: 'Team Java gồm 8 người giỏi Spring Boot, chưa ai vận hành Kafka, và hệ thống phải ra mắt sau 5 tháng. Cách xử lý thông tin này hợp lý nhất là gì?',
      options: [
        'Coi là ràng buộc: ưu tiên công nghệ quen thuộc hoặc managed service',
        'Bỏ qua, vì kỹ năng Kafka có thể học dần trong lúc làm dự án',
        'Bắt buộc dùng Kafka tự vận hành để team có dịp học công nghệ mới',
        'Hoãn dự án đến khi cả team được đào tạo đầy đủ về Kafka',
      ],
      answer: 0,
      explanation: 'Kỹ năng đội ngũ là ràng buộc thực sự ảnh hưởng tới rủi ro vận hành. Kiến trúc nên tính đến nó và ghi lý do vào ADR, thay vì bỏ qua hay hoãn cả dự án.',
    },
    {
      question: 'Vì sao nên neo kiến trúc mục tiêu vào business capability thay vì vào quy trình hay hệ thống hiện tại?',
      options: [
        'Vì mỗi capability luôn tương ứng đúng một microservice trong hệ thống',
        'Vì TOGAF bắt buộc mọi kiến trúc phải bắt đầu từ capability map',
        'Vì capability ổn định hơn quy trình và công nghệ vốn hay thay đổi',
        'Vì đã có capability map thì không cần thu thập NFR riêng nữa',
      ],
      answer: 2,
      explanation: 'Capability mô tả doanh nghiệp làm được gì chứ không phải làm thế nào, nên ít thay đổi hơn quy trình và công nghệ, là điểm neo tốt để vạch ranh giới hệ thống. Capability không nhất thiết ánh xạ một-một với service.',
    },
  ],
  documentation: [
    {
      question: 'Ban điều hành cần hiểu hệ thống đặt hàng mới tương tác với khách hàng, ERP và cổng thanh toán thế nào. Sơ đồ nào phù hợp nhất?',
      options: [
        'Sơ đồ Component của Order API',
        'Sơ đồ System Context',
        'Sơ đồ Code sinh từ IDE',
        'Sơ đồ Deployment trên Kubernetes',
      ],
      answer: 1,
      explanation: 'System Context chỉ thể hiện hệ thống, người dùng và các hệ thống xung quanh, không có chi tiết công nghệ, nên phù hợp với người không làm kỹ thuật.',
    },
    {
      question: 'Một ADR năm ngoái chọn polling publisher cho outbox. Nay team Platform đã có Kafka Connect dùng chung và team muốn chuyển sang Debezium. Cách xử lý đúng là gì?',
      options: [
        'Sửa nội dung ADR cũ thành Debezium để tài liệu khớp hiện trạng',
        'Xoá ADR cũ khỏi repo để tránh gây nhầm lẫn cho người mới',
        'Chỉ ghi chú thay đổi trong commit message, không cần ADR mới',
        'Viết ADR mới cho Debezium, đánh dấu ADR cũ là Superseded',
      ],
      answer: 3,
      explanation: 'ADR đã Accepted không nên bị sửa nội dung quyết định. Viết ADR mới và đánh dấu ADR cũ là Superseded giúp giữ lại lịch sử và lý do của từng giai đoạn.',
    },
    {
      question: 'Team muốn đưa sơ đồ C4 và ADR vào bộ tài liệu arc42. Cách sắp xếp nào hợp lý nhất?',
      options: [
        'Context ở Context and Scope, Container ở Building Block View, ADR ở Architecture Decisions',
        'Mọi sơ đồ ở Deployment View, ADR ở Glossary vì đó là nơi tra cứu thuật ngữ',
        'Container ở Solution Strategy, Component ở Runtime View, ADR ở Risks and Technical Debt',
        'Không ghép được, vì arc42 có ký hiệu riêng nên phải chọn một trong hai cách',
      ],
      answer: 0,
      explanation: 'arc42 cung cấp khung, C4 cung cấp sơ đồ, ADR cung cấp lý do. Mục 3 chứa bối cảnh, mục 5 chứa phân rã khối, mục 9 chứa các quyết định kiến trúc.',
    },
    {
      question: 'Team có 6 sơ đồ vẽ bằng công cụ kéo thả; mỗi lần đổi tên một service phải sửa từng sơ đồ và thường bị sót. Giải pháp phù hợp nhất là gì?',
      options: [
        'Chụp ảnh bảng trắng sau mỗi buổi họp thiết kế thay cho sơ đồ',
        'Gộp 6 sơ đồ thành một sơ đồ lớn chứa mọi chi tiết của hệ thống',
        'Dùng Structurizr DSL: định nghĩa model một lần, sinh các view từ đó',
        'Ngừng vẽ sơ đồ và chỉ giữ tài liệu kiến trúc dạng văn bản',
      ],
      answer: 2,
      explanation: 'Structurizr DSL tách model khỏi view: phần tử khai báo một lần, mọi sơ đồ sinh từ model nên luôn nhất quán. Gộp thành một sơ đồ lớn vi phạm nguyên tắc mỗi sơ đồ một mức trừu tượng.',
    },
    {
      question: 'Trong sprint này team có các thay đổi sau. Thay đổi nào đáng được ghi thành ADR nhất?',
      options: [
        'Đổi tên vài biến và method trong OrderService cho dễ đọc hơn',
        'Chuyển giao tiếp Order – Loyalty từ REST sang sự kiện qua broker',
        'Thêm unit test cho hàm tính điểm thưởng của Loyalty Service',
        'Cập nhật bản vá nhỏ (patch version) của thư viện logging',
      ],
      answer: 1,
      explanation: 'Đổi cơ chế giao tiếp giữa các service ảnh hưởng nhiều container, khó đảo ngược và tác động lên NFR, nên là quyết định quan trọng về kiến trúc. Các thay đổi còn lại không cần ADR.',
    },
  ],
  tradeoffs: [
    {
      question: 'Trong buổi đánh giá theo ATAM, team thấy tăng số lần retry khi gọi cổng thanh toán làm tăng tỉ lệ thành công nhưng tăng độ trễ và tải lên cổng. Đây là gì?',
      options: ['Non-risk', 'Risk theme', 'Trade-off point', 'Quality attribute scenario'],
      answer: 2,
      explanation: 'Trade-off point là tham số ảnh hưởng đến nhiều thuộc tính chất lượng theo hướng ngược nhau, ở đây là độ tin cậy và hiệu năng. Risk theme là nhóm rủi ro có chung nguyên nhân gốc.',
    },
    {
      question: 'Khi dùng ma trận quyết định có trọng số để chọn message broker, thực hành nào giúp kết quả khách quan nhất?',
      options: [
        'Chấm điểm các phương án trước, rồi chỉnh trọng số cho khớp phương án được ưa thích',
        'Chốt tiêu chí, trọng số trước khi chấm, rồi thử đổi trọng số xem kết luận có đổi',
        'Đặt trọng số bằng nhau cho mọi tiêu chí để tránh tranh cãi giữa các bên',
        'Chỉ dùng tiêu chí quan trọng nhất là hiệu năng để kết quả rõ ràng, dễ hiểu',
      ],
      answer: 1,
      explanation: 'Chốt tiêu chí và trọng số trước giúp tránh hợp thức hoá lựa chọn có sẵn, còn phân tích độ nhạy cho biết kết luận có vững hay phụ thuộc vào một trọng số gây tranh cãi.',
    },
    {
      question: 'Khi so sánh TCO giữa tự xây và thuê SaaS cho hệ thống tích điểm, team chỉ tính chi phí phát triển ban đầu và phí thuê bao năm đầu. Thiếu sót lớn nhất là gì?',
      options: [
        'Chưa so sánh hiệu năng hai phương án bằng load test trên dữ liệu thật',
        'Chưa tính chi phí đào tạo người dùng cuối khi chuyển sang dùng SaaS',
        'Chưa hỏi ý kiến team về framework và công nghệ mà họ muốn dùng',
        'Chỉ nhìn năm đầu: sót vận hành, bảo trì, chi phí rời bỏ, phí tăng theo quy mô',
      ],
      answer: 3,
      explanation: 'TCO phải tính trên toàn vòng đời với giả định rõ ràng. Phí SaaS thường tăng theo số người dùng, còn phương án tự xây có chi phí vận hành và bảo trì kéo dài nhiều năm.',
    },
    {
      question: 'Team muốn kiểm chứng Debezium có đọc được thay đổi từ Oracle của hệ legacy với độ trễ chấp nhận được không. Cách tổ chức PoC tốt nhất là gì?',
      options: [
        'Đặt giả thuyết, tiêu chí đo được và time-box trước; bỏ HA, giao diện khỏi phạm vi',
        'Làm đầy đủ như production, có HA và bảo mật, để sau này dùng luôn code PoC',
        'Bắt đầu code ngay, xác định tiêu chí thành công khi đã có kết quả đo',
        'Kéo dài PoC cho đến khi số liệu đủ đẹp để thuyết phục stakeholder',
      ],
      answer: 0,
      explanation: 'PoC hiệu quả trả lời một câu hỏi rủi ro cụ thể theo tiêu chí đặt trước, trong thời gian giới hạn. Đặt tiêu chí sau khi có kết quả dễ dẫn tới diễn giải theo ý muốn.',
    },
    {
      question: 'SA đề xuất thay hệ đơn hàng legacy theo Strangler Fig thay vì viết lại rồi chuyển đổi trong một đêm. Điều kiện quan trọng để áp dụng hiệu quả là gì?',
      options: [
        'Hệ mới phải dùng chung database với hệ legacy trong suốt vòng đời',
        'Định tuyến được request qua một facade để chuyển dần từng phần, có quay lui',
        'Đóng băng mọi thay đổi trên hệ legacy cho tới khi migration xong',
        'Chuyển hết dữ liệu sang hệ mới trước khi chuyển bất kỳ chức năng nào',
      ],
      answer: 1,
      explanation: 'Strangler Fig dựa vào một lớp facade như API gateway để chuyển từng lát chức năng và quay lui khi cần. Nếu không chặn được lời gọi, cần thêm kỹ thuật khác trước khi áp dụng.',
    },
  ],
  enterprise: [
    {
      question: 'Dự án đang gom các thay đổi kiến trúc thành work package và xác định các transition architecture. Theo TOGAF ADM, đây là pha nào?',
      options: [
        'Phase B – Business Architecture',
        'Phase E – Opportunities and Solutions',
        'Phase H – Architecture Change Management',
        'Preliminary Phase',
      ],
      answer: 1,
      explanation: 'Pha E xác định cơ hội và giải pháp, gom thay đổi thành work package và kiến trúc chuyển tiếp. Pha F sau đó lập kế hoạch migration chi tiết.',
    },
    {
      question: 'Một team muốn Reporting Service đọc thẳng database của Order Service. Nguyên tắc công ty là "mỗi tập dữ liệu có một nguồn sự thật, truy cập qua API hoặc sự kiện". Cách xử lý đúng tinh thần governance là gì?',
      options: [
        'Cho phép luôn vì Reporting chỉ đọc chứ không ghi dữ liệu của Order',
        'Từ chối ngay và không cần đưa ra hướng thay thế nào cho team',
        'Trình ARB; nếu cần, cấp ngoại lệ có thời hạn kèm kế hoạch khắc phục',
        'Để hai team tự thoả thuận miệng với nhau, không cần ghi lại',
      ],
      answer: 2,
      explanation: 'Sai khác với nguyên tắc cần được ARB xem xét. Dispensation có thời hạn và kế hoạch chuyển sang API hoặc sự kiện cho phép linh hoạt mà không biến ngoại lệ thành tiêu chuẩn ngầm.',
    },
    {
      question: 'ARB của công ty bị phàn nàn là nút cổ chai: mọi thay đổi nhỏ đều phải chờ họp hàng tháng. Cải tiến nào phù hợp nhất?',
      options: [
        'Phân tầng: việc trong team dùng ADR, chỉ việc liên team lên ARB, kèm guardrail tự động',
        'Giải tán ARB để các team tự quyết định mọi thứ, kể cả đưa công nghệ mới vào',
        'Họp ARB hằng ngày thay vì hằng tháng và vẫn review mọi thay đổi nhỏ',
        'Chỉ cho phép chief architect thiết kế tất cả giải pháp của công ty',
      ],
      answer: 0,
      explanation: 'Phân tầng governance và thay gate bằng guardrail tự động giúp ARB tập trung vào quyết định có ảnh hưởng lớn, trong khi phần lớn tuân thủ diễn ra ngay trong pipeline.',
    },
    {
      question: 'Trên technology radar nội bộ, Log4j 1.x nằm ở vòng Hold. Điều đó nghĩa là gì và thực thi thế nào là hiệu quả?',
      options: [
        'Vẫn dùng được cho dự án mới nếu team thích, chỉ cần ghi chú lại',
        'Đang được đánh giá, nên làm PoC trước khi đưa vào production',
        'Là lựa chọn mặc định cho các service mới, có template hỗ trợ sẵn',
        'Không dùng cho việc mới, có kế hoạch rời bỏ; chặn bằng bannedDependencies',
      ],
      answer: 3,
      explanation: 'Hold nghĩa là không dùng cho việc mới. Đưa luật bannedDependencies của Maven Enforcer vào parent POM dùng chung biến radar thành guardrail tự động thay vì chỉ là khuyến nghị.',
    },
    {
      question: 'Một hệ thống quản lý khách hàng có giá trị nghiệp vụ cao nhưng chạy trên nền tảng sắp hết hỗ trợ. Theo mô hình TIME, nó thường thuộc nhóm nào?',
      options: ['Eliminate', 'Migrate', 'Tolerate', 'Invest'],
      answer: 1,
      explanation: 'Giá trị nghiệp vụ cao nhưng phù hợp kỹ thuật thấp thuộc nhóm Migrate: giữ năng lực nhưng chuyển sang nền tảng mới. Invest dành cho hệ cao ở cả hai trục.',
    },
  ],
  'soft-skills': [
    {
      question: 'Bạn có 15 phút trình bày đề xuất kiến trúc cho CEO và CFO. Cách mở đầu tốt nhất là gì?',
      options: [
        'Giới thiệu các công nghệ sẽ dùng để thể hiện chuyên môn',
        'Nêu ngay đề xuất, quyết định cần đưa ra, chi phí và lợi ích chính',
        'Kể lại quá trình phân tích theo đúng thứ tự thời gian',
        'Trình bày sơ đồ Component của từng service trong hệ thống',
      ],
      answer: 1,
      explanation: 'Với ban lãnh đạo, BLUF đưa kết luận và quyết định cần đưa ra lên đầu. Chi tiết kỹ thuật để ở phụ lục và chỉ mở khi được hỏi.',
    },
    {
      question: 'Team Order đòi API thanh toán đồng bộ, team Payment chỉ muốn xử lý bất đồng bộ, hai bên tranh luận nhiều tuần. Theo đàm phán dựa trên nguyên tắc, SA nên làm gì đầu tiên?',
      options: [
        'Chọn phương án của team có nhiều thành viên hơn để đỡ mất thời gian',
        'Báo lên giám đốc kỹ thuật để quyết định thay cho hai bên',
        'Làm rõ lợi ích thật sau lập trường mỗi bên, chốt tiêu chí khách quan',
        'Đề xuất mỗi team cứ làm theo cách của mình rồi tích hợp sau',
      ],
      answer: 2,
      explanation: 'Tập trung vào lợi ích thay vì lập trường và dùng tiêu chí khách quan như NFR, số liệu thường mở ra phương án lai đáp ứng cả hai bên, như API đồng bộ có timeout kèm thông báo kết quả sau.',
    },
    {
      question: 'Khi review PR, bạn thấy một method @Transactional gọi HTTP sang cổng thanh toán ngay trong transaction. Comment nào phù hợp nhất?',
      options: [
        '"issue: Sai cách dùng transaction, cần viết lại toàn bộ method này."',
        '"nitpick: Nên đổi tên paymentClient thành paymentGatewayClient cho rõ."',
        'Không comment, tự commit bản sửa lên nhánh của tác giả cho nhanh.',
        '"issue (blocking): Gọi HTTP trong transaction giữ connection, dễ cạn pool; tách ra?"',
      ],
      answer: 3,
      explanation: 'Comment tốt gắn nhãn mức độ, nêu vấn đề và hậu quả, gợi ý hướng đi và mời tác giả phản hồi. Tự sửa thay tác giả bỏ lỡ cơ hội mentoring.',
    },
    {
      question: 'Một developer mid-level hỏi bạn nên dùng loại cache nào cho service của họ. Cách mentoring giúp họ phát triển nhất là gì?',
      options: [
        'Đặt câu hỏi để họ tự phân tích trade-off, rồi để họ viết ADR cho bạn review',
        'Đưa ngay đáp án đúng để tiết kiệm thời gian cho cả hai người',
        'Gửi họ vài bài viết so sánh các loại cache và để họ tự quyết',
        'Giao việc này cho một senior khác làm để đảm bảo chất lượng',
      ],
      answer: 0,
      explanation: 'Câu hỏi như dữ liệu thay đổi thế nào, chấp nhận lệch bao lâu, chạy mấy instance giúp developer học cách tư duy về trade-off; viết ADR và được review biến bài học thành kỹ năng.',
    },
    {
      question: 'Câu nào phù hợp nhất cho một tài liệu kỹ thuật ngắn gọn, rõ ràng?',
      options: [
        '"Hệ thống có thể sẽ gặp một số vấn đề hiệu năng trong vài trường hợp nhất định."',
        '"Hiệu năng hệ thống cần được xem xét cẩn thận và tối ưu khi có điều kiện."',
        '"Khi vượt 2.000 request/giây, p95 của Order API tăng từ 200 ms lên 900 ms do cạn pool."',
        '"Theo kinh nghiệm, hệ thống thường chậm khi nhiều người dùng truy cập cùng lúc."',
      ],
      answer: 2,
      explanation: 'Viết tốt là cụ thể: có điều kiện, số liệu và nguyên nhân. Các câu còn lại mơ hồ, người đọc không biết vấn đề nằm ở đâu và cần làm gì.',
    },
  ],
};

export default quiz;
