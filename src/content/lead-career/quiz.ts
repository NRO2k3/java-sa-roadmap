import type { LessonQuiz } from '../types';

const quiz: LessonQuiz = {
  communication: [
    {
      question: 'Bạn cần PO chọn giữa hai phương án nâng cấp Spring Boot trước thứ Sáu để kịp lên kế hoạch sprint. Câu mở đầu email nào phù hợp nhất?',
      options: [
        '"Dạo gần đây team gặp khá nhiều vấn đề với phiên bản cũ, em muốn chia sẻ vài suy nghĩ."',
        '"Em gửi anh tài liệu phân tích 12 trang về Spring Boot 3, anh đọc khi nào rảnh nhé."',
        '"Em cần anh chọn phương án A hoặc B cho việc nâng cấp trước thứ Sáu 15/8."',
        '"Như anh đã biết, Spring Boot là framework phổ biến nhất trong hệ sinh thái Java."',
      ],
      answer: 2,
      explanation: 'Theo BLUF, câu đầu tiên phải nói rõ người đọc cần làm gì và trước khi nào. Các phương án còn lại đẩy yêu cầu xuống dưới hoặc không có yêu cầu, nên người đọc bận dễ bỏ lỡ.',
    },
    {
      question: 'Giám đốc kinh doanh hỏi vì sao team phải dành hai sprint vá bảo mật thay vì làm tính năng khách đang chờ. Cách trả lời nào hiệu quả nhất?',
      options: [
        'Nêu tác động như rủi ro bị đánh dấu khi ngân hàng kiểm tra bảo mật, kèm hai phương án và đề xuất',
        'Giải thích chi tiết mã CVE và cơ chế khai thác lỗ hổng để anh ấy thấy được mức độ nghiêm trọng',
        'Nói rằng đây là quyết định kỹ thuật mà team đã thống nhất, phía kinh doanh không cần bàn thêm',
        'Đồng ý làm tính năng trước, còn phần vá bảo mật thì team sẽ tranh thủ làm vào buổi tối',
      ],
      answer: 0,
      explanation: 'Người không chuyên cần hiểu tác động đến mục tiêu của họ và quyết định họ phải đưa ra. Đi sâu thuật ngữ, gạt họ ra khỏi quyết định hay âm thầm làm thêm giờ đều không giải quyết đúng vấn đề.',
    },
    {
      question: 'Team bạn cần team Platform nâng cấp cụm Kafka, nhưng họ đang kín việc và bạn không phải cấp trên của họ. Bước đầu tiên nên làm là gì?',
      options: [
        'Gửi email cho CTO đề nghị yêu cầu team Platform ưu tiên việc này ngay trong tuần',
        'Nhắc lại yêu cầu mỗi ngày trên channel chung cho đến khi team Platform nhận việc',
        'Dùng quyền admin team mình đang có để tự nâng cấp cụm mà không cần báo trước',
        'Tìm hiểu áp lực, mục tiêu của team Platform rồi đề xuất cách hỗ trợ để đổi lại',
      ],
      answer: 3,
      explanation: 'Theo mô hình của Cohen và Bradford, ảnh hưởng là một cuộc trao đổi: cần hiểu thế giới của đối phương và điều họ coi trọng trước khi đề xuất. Leo thang ngay hay gây áp lực có thể được việc một lần nhưng làm hỏng quan hệ lâu dài.',
    },
    {
      question: 'Cuộc họp 45 phút chốt phương án lưu trữ đã hết giờ nhưng chưa quyết được vì thiếu số liệu hiệu năng. Người điều phối nên làm gì?',
      options: [
        'Kéo dài thêm 30 phút để mọi người tiếp tục tranh luận cho đến khi có kết luận',
        'Ghi rõ còn thiếu số liệu gì, ai đi lấy, hạn nào và khi nào sẽ ra quyết định',
        'Đề nghị người có chức vụ cao nhất trong phòng chọn ngay một phương án cho xong',
        'Kết thúc cuộc họp và chờ ai đó trong nhóm chủ động đặt lịch họp lại sau',
      ],
      answer: 1,
      explanation: 'Khi chưa đủ thông tin, kéo dài hay ép quyết định đều không giúp ích. Ghi rõ việc còn thiếu, người phụ trách và thời điểm quyết định giúp cuộc họp vẫn có kết quả cụ thể.',
    },
    {
      question: 'Minh gửi design doc cho "cả team xem giúp" đã một tuần mà không ai góp ý. Lời khuyên nào hữu ích nhất?',
      options: [
        'Gửi lại tài liệu cho toàn bộ khối kỹ thuật để có nhiều người đọc hơn',
        'Bổ sung thêm nhiều chi tiết để tài liệu dài hơn và trông kỹ lưỡng hơn',
        'Chỉ định reviewer có tên, đặt hạn góp ý và nêu rõ các câu hỏi mở cần trả lời',
        'Coi như mọi người đã đồng ý với thiết kế và bắt đầu hiện thực ngay',
      ],
      answer: 2,
      explanation: 'Lời mời chung chung khiến ai cũng nghĩ người khác sẽ góp ý. Reviewer có tên, hạn cụ thể và câu hỏi mở rõ ràng cho người đọc biết họ cần làm gì và khi nào.',
    },
  ],
  'self-management': [
    {
      question: 'Sprint này bạn có ba buổi phỏng vấn và một buổi làm việc với khách hàng. Với vai trò lead của team 6 người, bạn nên nhận việc code nào?',
      options: [
        'Story tích hợp phức tạp nhất trên đường găng, vì bạn là người có kinh nghiệm nhất',
        'Viết test tích hợp và cải thiện pipeline CI, là những việc không nằm trên đường găng',
        'Không nhận bất kỳ việc code nào để dành toàn bộ thời gian cho các cuộc họp',
        'Nhận tất cả story khó và code thêm vào cuối tuần để bảo đảm kịp tiến độ',
      ],
      answer: 1,
      explanation: 'Lead bị gián đoạn nhiều nên task trên đường găng dễ bị trễ. Việc không gấp như test, công cụ CI giúp lead giữ bối cảnh codebase mà không chặn tiến độ của team.',
    },
    {
      question: 'Developer trong team than rằng họp định kỳ đặt lúc 10h và 15h khiến cả ngày không có lúc nào tập trung được. Cách điều chỉnh nào tốt nhất?',
      options: [
        'Đề nghị developer ở lại làm thêm buổi tối để bù lại thời gian tập trung bị mất',
        'Huỷ toàn bộ các cuộc họp định kỳ của team và chỉ trao đổi qua chat',
        'Chuyển tất cả cuộc họp vào giờ nghỉ trưa để không ảnh hưởng giờ làm việc',
        'Gom các cuộc họp vào một khung buổi chiều và giữ buổi sáng làm khối tập trung',
      ],
      answer: 3,
      explanation: 'Theo maker schedule, developer cần khối thời gian dài; một cuộc họp giữa buổi có thể cắt cả buổi thành mảnh vụn. Gom họp giữ được các khối liền mạch mà không bỏ hẳn những trao đổi cần thiết.',
    },
    {
      question: 'Hai tháng nữa Long nghỉ phép dài, và chỉ Long nắm luồng đối soát. Việc viết runbook đối soát thuộc ô nào của ma trận Eisenhower?',
      options: [
        'Quan trọng nhưng chưa khẩn cấp, nên xếp lịch cụ thể để làm ngay từ bây giờ',
        'Quan trọng và khẩn cấp, cần bỏ hết mọi việc khác để làm xong trong hôm nay',
        'Khẩn cấp nhưng không quan trọng, có thể giao cho bất kỳ ai đang rảnh việc',
        'Không quan trọng và không khẩn cấp, có thể loại khỏi danh sách công việc',
      ],
      answer: 0,
      explanation: 'Runbook giảm rủi ro phụ thuộc vào một người nên rất quan trọng, nhưng hạn còn xa nên chưa khẩn cấp. Việc ở ô này dễ bị trì hoãn đến khi thành khẩn cấp nếu không được xếp lịch.',
    },
    {
      question: 'Bạn đang ôm quá nhiều việc và muốn uỷ quyền. Việc nào nên giữ lại để chính lead làm?',
      options: [
        'Tổng hợp báo cáo số liệu sprint hằng tuần để gửi cho PO',
        'Dẫn buổi refinement cho story mà một mid dev đang phụ trách',
        'Góp ý về hiệu suất cho thành viên trượt deadline nhiều sprint liền',
        'Trả lời các câu hỏi lặp lại về cài đặt môi trường dev cho người mới',
      ],
      answer: 2,
      explanation: 'Feedback và đánh giá hiệu suất là trách nhiệm không thể giao của lead. Các việc còn lại người khác làm được ở mức đủ tốt và còn là cơ hội để họ phát triển.',
    },
    {
      question: 'Bạn muốn được đề cử khi công ty mở vị trí Staff Engineer vào năm sau. Ai trong mạng lưới có thể giúp trực tiếp nhất cho việc được đề cử?',
      options: [
        'Một mentor ở công ty khác, mỗi tháng chia sẻ kinh nghiệm với bạn một lần',
        'Một lãnh đạo cấp cao biết rõ kết quả của bạn và có tiếng nói khi đề cử',
        'Một coach chuyên đặt câu hỏi để bạn tự tìm ra giải pháp cho chính mình',
        'Một nhóm lead ngang cấp gặp nhau hằng tháng để thảo luận tình huống khó',
      ],
      answer: 1,
      explanation: 'Sponsor là người nói về bạn và đề cử bạn ở những nơi bạn không có mặt. Mentor, coach và đồng nghiệp ngang cấp giúp bạn phát triển, nhưng thường không có tiếng nói trong quyết định đề cử.',
    },
  ],
  'next-steps': [
    {
      question: 'Tuấn thấy hứng thú nhất khi giải các vấn đề kỹ thuật khó liên quan nhiều team, thấy mệt sau một ngày toàn 1:1 và muốn tiếp tục code. Hướng nào hợp với Tuấn nhất?',
      options: [
        'Engineering Manager, vì đó là bước thăng tiến tự nhiên duy nhất của Dev Lead',
        'Solution Architect, vì vai trò này dành phần lớn thời gian để viết code',
        'Project Manager, vì có nhiều cơ hội làm việc trực tiếp với khách hàng',
        'Staff Engineer ở nhánh IC, phụ trách vấn đề kỹ thuật xuyên nhiều team',
      ],
      answer: 3,
      explanation: 'Thiên hướng của Tuấn khớp với Staff Engineer: phạm vi kỹ thuật rộng, vẫn có thời gian code. EM không phải con đường duy nhất, và SA thường code ít, chủ yếu PoC và review.',
    },
    {
      question: 'Một Staff Engineer chuyên đi sâu vào những vấn đề khó nhất của tổ chức, như GC pause gây timeout trên nhiều service, giải xong thì chuyển sang vấn đề khác. Theo Will Larson, đây là kiểu nào?',
      options: [
        'Tech Lead',
        'Solver',
        'Architect',
        'Right Hand',
      ],
      answer: 1,
      explanation: 'Solver đi sâu vào các vấn đề phức tạp và tìm hướng giải quyết, rồi chuyển sang vấn đề tiếp theo. Architect sở hữu lâu dài một mảng, Tech Lead dẫn dắt một hoặc vài team, còn Right Hand mở rộng tầm ảnh hưởng của một lãnh đạo cấp cao.',
    },
    {
      question: 'Một Dev Lead thiên về delivery muốn có chứng chỉ Scrum, không muốn bắt buộc học khoá và không muốn phải gia hạn. Lựa chọn nào phù hợp nhất?',
      options: [
        'AWS Certified Developer – Associate của Amazon Web Services',
        'Spring Certified Professional qua Spring Academy',
        'Professional Scrum Master I (PSM I) của Scrum.org',
        'Certified ScrumMaster (CSM) của Scrum Alliance',
      ],
      answer: 2,
      explanation: 'PSM I không bắt buộc học khoá và không hết hạn. CSM cũng về Scrum nhưng yêu cầu khoá học với giảng viên được chứng nhận và phải gia hạn định kỳ, còn hai chứng chỉ kia không liên quan đến Scrum.',
    },
    {
      question: 'Mục nào thể hiện tốt nhất năng lực lãnh đạo trong portfolio của một Dev Lead?',
      options: [
        'Dẫn team 6 người go-live ví B đúng hạn; tôi escalate rủi ro sandbox sớm và chia giai đoạn',
        'Tham gia dự án tích hợp ví B, sử dụng Java 17, Spring Boot, Kafka và PostgreSQL',
        'Một mình tôi hoàn thành toàn bộ dự án ví B mà không cần đến sự hỗ trợ của ai',
        'Tổ chức 12 cuộc họp và viết hơn 40 trang tài liệu cho dự án tích hợp ví B',
      ],
      answer: 0,
      explanation: 'Portfolio lãnh đạo cần kết quả của team và đóng góp cụ thể của bạn, tách rõ "tôi" và "team". Danh sách công nghệ, hoạt động hay nhận hết công về mình đều không cho thấy năng lực dẫn dắt.',
    },
    {
      question: 'Sau ba tháng thử làm thiết kế liên hệ thống, Dev Lead Hà quyết định theo lộ trình Solution Architect. Hà nên ưu tiên điều gì?',
      options: [
        'Thi càng nhiều chứng chỉ càng tốt trước khi xin tham gia bất kỳ việc kiến trúc nào',
        'Bỏ hẳn phần delivery để dồn toàn bộ thời gian vào việc học lý thuyết kiến trúc',
        'Học lại Java Core từ đầu vì lộ trình SA hoàn toàn khác với lộ trình Dev Lead',
        'Bổ sung system design, cloud, bảo mật và xin tham gia thiết kế liên hệ thống thật',
      ],
      answer: 3,
      explanation: 'Hai lộ trình dùng chung nền tảng Java, Spring, dữ liệu và microservices, nên Hà cần bổ sung phần còn thiếu và tích luỹ kinh nghiệm thật. Kinh nghiệm delivery là lợi thế cần giữ, không phải thứ phải bỏ.',
    },
  ],
};

export default quiz;
