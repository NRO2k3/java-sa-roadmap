import type { LessonQuiz } from '../types';

const quiz: LessonQuiz = {
  'tech-decisions': [
    {
      question: 'Team cân nhắc đổi thư viện mapping trong một service nhỏ; việc này dễ đảo ngược và chỉ ảnh hưởng nội bộ team. Cách quyết định hợp lý nhất là gì?',
      options: [
        'Viết RFC đầy đủ, đặt hạn góp ý và tổ chức review với các team liên quan',
        'Trình Architecture Review Board của công ty phê duyệt trước khi làm',
        'Coi là "cửa hai chiều": trao đổi ngắn trong PR, người phụ trách quyết',
        'Họp cả team biểu quyết, chờ đồng thuận tuyệt đối rồi mới làm',
      ],
      answer: 2,
      explanation: 'Quyết định dễ đảo ngược và phạm vi nhỏ nên được quyết nhanh với quy trình nhẹ. RFC và review rộng dành cho thay đổi lớn hoặc khó đảo ngược.',
    },
    {
      question: 'Sau buổi review RFC, team chọn cache local Caffeine. An vẫn cho rằng nên dùng Redis ngay. Theo tinh thần "disagree and commit", điều nào đúng?',
      options: [
        'An nên tiếp tục phản đối trong mọi PR liên quan cho đến khi team đổi ý',
        'An được lắng nghe, ý kiến ghi vào ADR kèm điểm xem lại, và An hỗ trợ hết mình',
        'Lead nên loại An khỏi các quyết định sau này để tránh xung đột',
        'Team nên hiện thực song song cả hai phương án để An hài lòng',
      ],
      answer: 1,
      explanation: 'Disagree and commit lành mạnh khi người bất đồng đã được lắng nghe, quyết định rõ ràng và có điểm xem xét lại. Nó không có nghĩa là im lặng hay phá ngầm quyết định.',
    },
    {
      question: 'Team vừa kết thúc thảo luận một RFC dài về chiến lược cache và đã chốt phương án. Bước tiếp theo nên là gì?',
      options: [
        'Viết ADR ngắn ghi quyết định, đánh đổi, ý kiến khác và liên kết RFC',
        'Xoá RFC khỏi repo vì quyết định cuối cùng đã được đưa ra',
        'Sửa nội dung RFC thành tài liệu hướng dẫn sử dụng cache cho team',
        'Không cần ghi thêm gì vì mọi người liên quan đều đã dự họp',
      ],
      answer: 0,
      explanation: 'RFC phục vụ đề xuất và thảo luận trước khi quyết; ADR là bản ghi ngắn, lâu dài của quyết định. Không ghi lại thì vài tháng sau team dễ tranh luận lại từ đầu.',
    },
    {
      question: 'Bạn cần đề xuất cho team cách giảm độ trễ của Product API. Cách trình bày trade-off thuyết phục nhất là gì?',
      options: [
        'Chỉ trình bày phương án bạn thích cho gọn, để team không bị phân tâm',
        'Liệt kê thật nhiều công nghệ mới đang phổ biến để team tự chọn lấy',
        'Không đưa đề xuất nào để tránh áp đặt, để team tự nghiên cứu',
        'Nêu tiêu chí, so sánh 2–3 phương án kể cả giữ nguyên, nói rõ khi nào bạn đổi ý',
      ],
      answer: 3,
      explanation: 'So sánh trung thực theo tiêu chí chung, có cả phương án tối ưu cái đang có, và nói rõ điều kiện khiến bạn đổi ý cho thấy đề xuất dựa trên lý lẽ, đồng thời cho team cách cụ thể để phản biện.',
    },
    {
      question: 'Quyết định chọn chuẩn logging chung cho 3 team bị kéo dài vì không ai biết ai có quyền chốt. Áp dụng DACI, điều quan trọng nhất cần làm rõ là gì?',
      options: [
        'Cho mọi người cùng làm Approver để đảm bảo công bằng cho ba team',
        'Có đúng một Approver quyết định cuối, các vai trò khác được làm rõ',
        'Driver và Approver phải là cùng một người để đỡ mất thời gian',
        'Chỉ cần xác định nhóm Informed, các vai trò khác tự hình thành',
      ],
      answer: 1,
      explanation: 'DACI hiệu quả nhờ chỉ có một Approver chịu trách nhiệm quyết định cuối, còn Driver điều phối, Contributors góp ý, Informed được thông báo. Nhiều Approver dẫn tới phủ quyết lẫn nhau.',
    },
  ],
  'tech-debt': [
    {
      question: 'Sau một năm, team hiểu domain rõ hơn và nhận ra cách chia module ban đầu khiến tính năng mới khó thêm. Không ai làm ẩu lúc đầu. Theo Technical Debt Quadrant, đây là loại nợ nào?',
      options: [
        'Cố ý và liều lĩnh',
        'Cố ý và thận trọng',
        'Vô tình và liều lĩnh',
        'Vô tình và thận trọng',
      ],
      answer: 3,
      explanation: 'Nợ vô tình và thận trọng xuất hiện khi team học được điều mới sau khi đã làm cẩn thận. Nó gần như không tránh được và nên được trả dần khi chạm vào vùng code đó.',
    },
    {
      question: 'Register có hai mục: module báo cáo rất xấu nhưng hai năm nay gần như không ai sửa, và OrderService phức tạp mà hầu hết tính năng mới đều chạm vào, hay gây lỗi hồi quy. Ưu tiên thế nào?',
      options: [
        'Ưu tiên module báo cáo vì code của nó xấu hơn và khó đọc hơn',
        'Ưu tiên OrderService vì "lãi" cao: thay đổi thường xuyên, hay gây lỗi',
        'Trả cả hai cùng lúc trong một sprint dành riêng cho dọn nợ',
        'Không trả mục nào vì cả hai vẫn đang chạy được trên production',
      ],
      answer: 1,
      explanation: 'Code xấu mà không ai chạm vào gần như không có lãi. Nên ưu tiên hotspot vừa phức tạp vừa thay đổi thường xuyên, nơi team đang mất thời gian mỗi sprint.',
    },
    {
      question: 'PO từ chối dành thời gian cho việc "refactor OrderService". Cách thương lượng hiệu quả nhất là gì?',
      options: [
        'Nói bằng số liệu business như lead time, lỗi; đề xuất phần capacity cố định kèm cách đo',
        'Lặng lẽ refactor trong lúc làm tính năng mà không báo cho PO biết',
        'Giải thích chi tiết các code smell và nguyên lý SOLID đang bị vi phạm',
        'Đề nghị dừng phát triển tính năng 2 tháng để viết lại toàn bộ service',
      ],
      answer: 0,
      explanation: 'PO cần thấy giá trị kinh doanh: tính năng chậm thêm bao lâu, bao nhiêu lỗi đến từ đây. Đề xuất cụ thể kèm kết quả đo được và báo cáo sau đó giúp xây dựng niềm tin cho các lần sau.',
    },
    {
      question: 'Team chuẩn bị nâng một service từ Spring Boot 2.5 trên Java 11 lên Spring Boot 3.x. Lộ trình nào hợp lý nhất?',
      options: [
        'Nâng thẳng lên Spring Boot 3.x vẫn trên Java 11 rồi sửa lỗi biên dịch',
        'Có test tin cậy, lên Java 17, lên Boot 2.7 mới nhất, sửa deprecation rồi sang 3.x',
        'Viết lại toàn bộ service từ đầu trên Spring Boot 3 và Java 21 cho sạch',
        'Chạy OpenRewrite một lần cho toàn bộ và merge ngay, không cần chạy test',
      ],
      answer: 1,
      explanation: 'Spring Boot 3 yêu cầu tối thiểu Java 17. Đi qua 2.7 mới nhất và sửa cảnh báo deprecation trước giúp mỗi bước nhỏ, dễ kiểm chứng và dễ quay lui.',
    },
    {
      question: 'Khi dùng OpenRewrite với recipe UpgradeSpringBoot_3_0 cho một service, cách làm an toàn nhất là gì?',
      options: [
        'Chạy rewrite:run thẳng trên nhánh main rồi deploy ngay lên production',
        'Chỉ chạy recipe cho file pom.xml, còn toàn bộ code Java giữ nguyên',
        'dryRun xem patch, áp dụng trên nhánh riêng, tách PR tự động khỏi PR sửa tay',
        'Chạy recipe cho mọi service của team cùng lúc trong một PR lớn duy nhất',
      ],
      answer: 2,
      explanation: 'dryRun cho phép xem trước thay đổi; tách PR giúp review theo mẫu. OpenRewrite xử lý thay đổi cơ học, còn thay đổi hành vi như của Hibernate 6 hay Spring Security 6 chỉ test mới bắt được.',
    },
  ],
  'team-architecture': [
    {
      question: 'Code review của team tốn nhiều thời gian tranh cãi về format code và việc dùng field injection. Cách thiết lập tiêu chuẩn hiệu quả nhất là gì?',
      options: [
        'Viết tài liệu coding standards 40 trang và yêu cầu mọi người đọc kỹ',
        'Lead tự review mọi PR để đảm bảo mọi người tuân thủ đúng chuẩn',
        'Tự động hoá bằng formatter và ArchUnit trong build; tài liệu ghi phần còn lại',
        'Để mỗi người theo phong cách riêng, miễn là code chạy đúng và có test',
      ],
      answer: 2,
      explanation: 'Cái gì công cụ kiểm tra được thì để công cụ kiểm tra, build đỏ khi vi phạm. Tài liệu chỉ ghi những quy ước công cụ không kiểm tra được, còn review tập trung vào thiết kế và logic.',
    },
    {
      question: 'Team Order muốn thêm giá trị REFUNDED vào enum status trong response của Order API đang được 3 team khác gọi. Rủi ro chính và cách xử lý là gì?',
      options: [
        'Không có rủi ro vì chỉ thêm giá trị mới chứ không xoá giá trị nào',
        'Jackson mặc định lỗi với enum lạ; cần báo trước, xác nhận client, chạy contract test',
        'Rủi ro duy nhất là tài liệu OpenAPI chưa được cập nhật kịp thời',
        'Phải tạo API v2 cho mọi thay đổi, dù nhỏ đến đâu, để an toàn tuyệt đối',
      ],
      answer: 1,
      explanation: 'Thêm giá trị enum trong response có thể là breaking change vì Jackson mặc định ném lỗi khi gặp giá trị enum không biết. Thông báo trước và contract test giúp phát hiện trước khi deploy.',
    },
    {
      question: 'Ba team cùng sửa một service Customer dùng chung, thường giẫm chân nhau và chặn release của nhau. Theo Conway\'s Law và Team Topologies, hướng cải thiện phù hợp là gì?',
      options: [
        'Thêm quy trình phê duyệt release chung và lịch release cố định cho ba team',
        'Gộp ba team thành một team lớn khoảng 25 người cùng sở hữu service',
        'Yêu cầu mọi thay đổi phải được lead của cả ba team duyệt trước khi merge',
        'Vạch lại ranh giới để mỗi phần có một team sở hữu, giao tiếp qua API rõ ràng',
      ],
      answer: 3,
      explanation: 'Kiến trúc phản chiếu cấu trúc giao tiếp của tổ chức. Sở hữu chung một service khiến ranh giới rối; thiết kế lại ranh giới sở hữu cùng interface rõ ràng giảm phụ thuộc và cognitive load.',
    },
    {
      question: 'Team Platform làm việc sát với team Order trong 2 tháng để khám phá nhu cầu CI/CD; sau đó team Order dùng nền tảng mà hầu như không cần trao đổi. Đây là chuỗi chế độ tương tác nào?',
      options: [
        'Collaboration, sau đó chuyển sang X-as-a-Service',
        'Facilitating, sau đó chuyển sang Collaboration',
        'X-as-a-Service, sau đó chuyển sang Facilitating',
        'Collaboration trong suốt toàn bộ thời gian',
      ],
      answer: 0,
      explanation: 'Collaboration phù hợp giai đoạn khám phá khi ranh giới chưa rõ; khi interface đã ổn định, chuyển sang X-as-a-Service để giảm chi phí phối hợp.',
    },
    {
      question: 'Bạn viết technical vision 6 tháng cho team. Nội dung nào nên có?',
      options: [
        'Danh sách mọi công nghệ mới mà các thành viên trong team muốn thử',
        'Hiện trạng có số liệu, đích đến, mục tiêu đo được, non-goals và roadmap',
        'Kế hoạch chi tiết đến từng task và người làm cho toàn bộ 6 tháng',
        'Chỉ cần một câu khẩu hiệu truyền cảm hứng, không cần thêm chi tiết',
      ],
      answer: 1,
      explanation: 'Vision tốt xuất phát từ vấn đề thật và mục tiêu sản phẩm, có mục tiêu đo được và nói rõ những gì không làm. Roadmap Now/Next/Later cho thấy thứ tự ưu tiên mà không hứa ngày cụ thể cho việc còn xa.',
    },
  ],
  'knowledge-sharing': [
    {
      question: 'Chỉ có Bình hiểu pipeline CI/CD, và Bình sắp nghỉ phép 3 tuần. Hành động nào tăng bus factor hiệu quả nhất trong ngắn hạn?',
      options: [
        'Yêu cầu Bình viết tài liệu 50 trang trong tuần cuối trước khi nghỉ',
        'Hoãn mọi thay đổi pipeline cho đến khi Bình quay lại làm việc',
        'Người khác làm thay đổi pipeline, Bình làm navigator, rồi người đó viết runbook',
        'Thuê một consultant bên ngoài quản lý pipeline trong thời gian Bình nghỉ',
      ],
      answer: 2,
      explanation: 'Người không phải chuyên gia trực tiếp làm, chuyên gia hướng dẫn là cách chuyển giao nhanh và thực chất nhất; viết runbook từ chính trải nghiệm đó giúp tài liệu dùng được.',
    },
    {
      question: 'Team muốn bắt đầu chia sẻ kiến thức nhưng nhiều người ngại trình bày. Cách khởi động hợp lý nhất là gì?',
      options: [
        'Bắt buộc mỗi người trình bày một tech talk 1 giờ mỗi tháng theo danh sách',
        'Chỉ mời diễn giả bên ngoài đến chia sẻ để nội dung chất lượng hơn',
        'Chờ đến khi có người tự nguyện đứng ra tổ chức và trình bày',
        'Lightning talk hoặc brown-bag ngắn theo lịch cố định, lead làm mẫu trước',
      ],
      answer: 3,
      explanation: 'Rào cản thấp, lịch đều đặn, chủ đề từ công việc thật và lead làm mẫu giúp hình thành thói quen. Bắt buộc trình bày dài thường dẫn đến nội dung hời hợt và tâm lý ngại.',
    },
    {
      question: 'Team sắp thiết kế lại luồng xử lý thanh toán phức tạp, và nhiều người cần hiểu sâu phần này. Hình thức làm việc nào phù hợp nhất?',
      options: [
        'Mob programming: một người gõ, cả nhóm điều hướng, luân phiên driver',
        'Một senior giỏi nhất làm một mình rồi viết tài liệu chi tiết sau',
        'Mỗi người làm một phần riêng rồi gộp lại vào cuối sprint',
        'Pair programming cố định theo cặp cho mọi task, kể cả việc nhỏ',
      ],
      answer: 0,
      explanation: 'Mob programming phù hợp cho phần phức tạp, quan trọng mà nhiều người cần hiểu; cái giá người-giờ được bù bằng tri thức lan toả. Pair mọi task kể cả việc vặt là lãng phí.',
    },
    {
      question: 'Người mới cần tài liệu "cách rollback một bản deploy lỗi của order-service". Theo Diátaxis, tài liệu này thuộc loại nào?',
      options: ['Tutorial', 'How-to guide', 'Reference', 'Explanation'],
      answer: 1,
      explanation: 'How-to guide hướng tới hoàn thành một việc cụ thể, như runbook. Tutorial dành cho học bằng cách làm, Reference để tra cứu, Explanation để hiểu vì sao.',
    },
    {
      question: 'README và runbook của team thường lỗi thời vài tháng sau khi viết. Cách khắc phục bền vững nhất là gì?',
      options: [
        'Mỗi năm dành một tuần cho cả team cập nhật lại toàn bộ tài liệu',
        'Giao cho một người chuyên trách viết và cập nhật tài liệu cho cả team',
        'Để tài liệu trong repo, cập nhật cùng PR với code, đưa vào Definition of Done',
        'Chuyển toàn bộ tài liệu sang một wiki riêng, tách khỏi repo để dễ sửa',
      ],
      answer: 2,
      explanation: 'Docs-as-code gắn việc cập nhật tài liệu với chính thay đổi code và quy trình review, nên tài liệu không bị bỏ lại phía sau. Cập nhật định kỳ theo đợt luôn chậm hơn thực tế.',
    },
  ],
};

export default quiz;
