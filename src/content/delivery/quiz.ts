import type { LessonQuiz } from '../types';

const quiz: LessonQuiz = {
  agile: [
    {
      question: 'Story hoàn tiền đã code xong nhưng chưa được QA xác nhận trên staging như Definition of Done yêu cầu. Có nên demo story này trong Sprint Review không?',
      options: [
        'Có, vì stakeholder cần nhìn thấy tiến độ dù story chưa xong',
        'Có, nếu Dev Lead cam kết sẽ test xong vào tuần sau',
        'Không, chỉ những mục đạt Definition of Done mới thuộc Increment',
        'Không, vì Sprint Review chỉ dành cho PO và Scrum Master',
      ],
      answer: 2,
      explanation: 'Theo Scrum Guide, một mục chỉ trở thành Increment khi đạt Definition of Done; chưa đạt thì không được release hay trình bày ở Sprint Review. Team nên nêu minh bạch phần chưa xong thay vì demo nó như đã hoàn thành.',
    },
    {
      question: 'Daily của team thường kéo dài 40 phút, và từng developer lần lượt báo cáo task cho Dev Lead. Theo Scrum Guide, nên điều chỉnh thế nào?',
      options: [
        'Giữ nguyên, vì Dev Lead cần nắm chi tiết từng task',
        'Đổi daily thành hai buổi mỗi tuần cho đỡ tốn thời gian',
        'Yêu cầu mọi người trả lời đúng ba câu hỏi chuẩn',
        'Giữ trong 15 phút, tập trung vào Sprint Goal, để Developers tự điều phối',
      ],
      answer: 3,
      explanation: 'Daily Scrum là sự kiện 15 phút của Developers, dùng để kiểm tra tiến độ hướng tới Sprint Goal và điều chỉnh kế hoạch. Bản 2020 không còn quy định ba câu hỏi; team được tự chọn cấu trúc, chẳng hạn đi bảng từ phải sang trái.',
    },
    {
      question: 'Cột Code Review đã chạm giới hạn WIP là 2. Một developer vừa code xong story của mình. Bước tiếp theo hợp lý nhất là gì?',
      options: [
        'Kéo một story mới từ Ready vào In Progress cho khỏi rảnh',
        'Giúp review các PR đang chờ để giải phóng cột trước khi bắt đầu việc mới',
        'Nâng giới hạn WIP của cột Code Review lên 4 cho vừa',
        'Chuyển thẳng story sang Testing, bỏ qua bước review',
      ],
      answer: 1,
      explanation: 'Giới hạn WIP có tác dụng làm lộ điểm nghẽn và thúc đẩy nguyên tắc "ngừng bắt đầu, hãy hoàn thành". Kéo thêm việc mới chỉ làm ùn tắc nặng hơn. Nâng giới hạn mỗi khi chạm trần thì giới hạn đó mất ý nghĩa.',
    },
    {
      question: 'Trong retro, chỉ hai senior và lead lên tiếng, còn các bạn junior im lặng. Cách điều phối nào giúp mọi người cùng đóng góp?',
      options: [
        'Cho viết im lặng lên sticky note trước, dot-voting, lead nói sau cùng',
        'Lead nêu nhận định trước để các bạn junior có hướng mà nói theo',
        'Gọi tên từng bạn junior và yêu cầu kể lỗi của mình trong sprint',
        'Rút retro xuống 15 phút vì các bạn junior không có ý kiến',
      ],
      answer: 0,
      explanation: 'Khi có khoảng cách cấp bậc, viết im lặng và bỏ phiếu giúp ai cũng có ý kiến trước khi thảo luận. Nếu lead nói trước, cả nhóm dễ bị neo vào ý kiến của lead. Bắt người khác kể lỗi trước đám đông thì làm giảm an toàn tâm lý.',
    },
    {
      question: 'Team platform nhận rất nhiều yêu cầu phát sinh mỗi ngày, nên Sprint Goal liên tục bị phá vỡ. Điều chỉnh quy trình nào hợp lý nhất?',
      options: [
        'Kéo dài sprint lên 6 tuần để có thêm thời gian xử lý',
        'Cấm mọi yêu cầu phát sinh cho đến khi hết sprint',
        'Thử Kanban với giới hạn WIP và chính sách ưu tiên, đo cycle time',
        'Bỏ retrospective để có thêm thời gian xử lý yêu cầu',
      ],
      answer: 2,
      explanation: 'Điều chỉnh nên bắt đầu từ vấn đề thật và được đo lường. Kanban phù hợp với dòng việc đến liên tục. Sprint 6 tuần vượt giới hạn một tháng của Scrum, còn bỏ retro thì mất luôn cơ hội cải tiến.',
    },
  ],
  estimation: [
    {
      question: 'Epic "Thanh toán ví điện tử" được chia thành bốn story: Tạo bảng DB, Viết repository, Viết API, Làm UI. Nhận xét nào đúng?',
      options: [
        'Hợp lý, vì mỗi story giao đúng chuyên môn của từng người',
        'Chưa tốt, vì chia theo tầng; nên chia theo lát cắt dọc của nghiệp vụ',
        'Hợp lý, miễn là mỗi story đều dưới 8 story point',
        'Chưa tốt, vì nên gộp lại thành một story lớn cho dễ quản lý',
      ],
      answer: 1,
      explanation: 'Story chia theo tầng kỹ thuật không mang lại giá trị khi đứng riêng, và đẩy rủi ro tích hợp về cuối. Lát cắt dọc đi qua mọi tầng nhưng chỉ làm một phần nhỏ nghiệp vụ, nên demo và kiểm thử được ngay.',
    },
    {
      question: 'Trong planning poker, lead luôn nói con số của mình trước, sau đó mọi người chọn những con số gần bằng. Vấn đề là gì và nên sửa thế nào?',
      options: [
        'Không có vấn đề gì, vì lead có nhiều kinh nghiệm nhất',
        'Lead nên vắng mặt hoàn toàn ở mọi buổi ước lượng',
        'Nên quy đổi điểm ra giờ để khỏi phải tranh luận',
        'Đây là hiệu ứng mỏ neo; mọi người nên chọn bí mật rồi lật bài cùng lúc',
      ],
      answer: 3,
      explanation: 'Con số nói ra đầu tiên, nhất là của người có vị trí cao, dễ neo ước lượng của cả nhóm. Lật bài cùng lúc giúp bộc lộ các khác biệt, và chính cuộc thảo luận về khác biệt đó mới là giá trị chính của planning poker.',
    },
    {
      question: 'Ước lượng một story tích hợp ví B mà chưa ai từng làm, các phiếu planning poker dao động từ 3 đến 20. Nên làm gì?',
      options: [
        'Nghe người cho điểm cao nhất và thấp nhất giải thích, rồi cân nhắc làm spike hoặc chia nhỏ',
        'Lấy trung bình các phiếu, khoảng 10 điểm, cho nhanh',
        'Chọn điểm của người senior nhất để kết thúc tranh luận',
        'Ghi 20 điểm cho an toàn rồi đưa ngay vào sprint',
      ],
      answer: 0,
      explanation: 'Phiếu chênh lệch lớn cho thấy cách hiểu hoặc mức độ bất định khác nhau. Thảo luận giúp làm rõ, còn khi bất định quá cao thì nên làm spike hoặc chia story nhỏ hơn thay vì gán một con số không đáng tin.',
    },
    {
      question: 'Mô phỏng Monte Carlo cho mốc 50% là 2/9 và mốc 85% là 9/9. PM cần một mốc để báo khách hàng. Cách truyền đạt nào tốt nhất?',
      options: [
        'Báo 2/9, vì đó là ngày có khả năng xảy ra cao nhất',
        'Báo sớm hơn 2/9 một tuần để tạo động lực cho team',
        'Đưa mốc 9/9 kèm mức tin cậy khoảng 85%, và cập nhật dự báo sau mỗi sprint',
        'Không đưa ngày nào, vì dự báo phần mềm không thể chính xác',
      ],
      answer: 2,
      explanation: 'Cam kết ra bên ngoài nên dựa trên mức tin cậy cao, kèm giải thích rằng đây là xác suất. Mốc 50% nghĩa là khả năng trễ ngang với khả năng kịp, nên dùng để báo khách hàng là quá rủi ro.',
    },
    {
      question: 'Trung bình mỗi sprint, team dành khoảng 20% thời gian cho bug production và hỗ trợ. Khi lập kế hoạch release, nên tính capacity thế nào?',
      options: [
        'Dồn 100% capacity cho story, bug thì xử lý bằng làm thêm giờ',
        'Chỉ dành khoảng 80% capacity cho story, trừ thêm ngày lễ và nghỉ phép',
        'Ngừng nhận bug production cho đến khi release xong',
        'Cộng thêm 20% story point vào mọi story để bù lại',
      ],
      answer: 1,
      explanation: 'Buffer capacity dựa trên số liệu thật giúp kế hoạch sát thực tế mà không phải dùng OT để bù. Thổi phồng story point chỉ làm sai lệch dữ liệu ước lượng, mà không giải quyết được việc phát sinh.',
    },
  ],
  risk: [
    {
      question: 'Sandbox của ngân hàng đối tác đã sập 3 ngày, team không test được. Nên ghi nhận và xử lý mục này thế nào?',
      options: [
        'Ghi vào risk register với xác suất 3/5 để theo dõi thêm',
        'Đóng rủi ro tương ứng lại, vì không còn gì để làm nữa',
        'Đợi đến buổi xem lại rủi ro tháng sau rồi đánh giá lại',
        'Xem đây là issue đã xảy ra, xử lý ngay và escalate nếu cần',
      ],
      answer: 3,
      explanation: 'Rủi ro là sự kiện chưa xảy ra và không chắc chắn; điều đã xảy ra là issue và cần hành động ngay. Rủi ro tương ứng trong register nên được chuyển thành issue chứ không phải đóng lại.',
    },
    {
      question: 'Câu nào là cách viết rủi ro tốt nhất trong risk register?',
      options: [
        'Do ví B chưa có sandbox, có thể không test được callback trước Sprint 4, làm trễ go-live',
        'Rủi ro tích hợp với ví B, cần theo dõi sát trong các sprint tới',
        'Ví B làm việc chậm, có thể ảnh hưởng đến tiến độ chung của dự án',
        'Cần yêu cầu ví B cấp sandbox gấp trước khi quá muộn',
      ],
      answer: 0,
      explanation: 'Câu rủi ro tốt nêu đủ nguyên nhân, sự kiện và tác động, nhờ đó chấm được xác suất và tác động, và chọn được hành động phù hợp. Các câu còn lại hoặc quá mơ hồ, hoặc là một hành động chứ không phải mô tả rủi ro.',
    },
    {
      question: 'Chỉ Long hiểu module đối soát, mà Long sẽ nghỉ phép 3 tuần ngay sau go-live. Team cho Long pair với Hà và viết runbook. Đây là chiến lược ứng phó nào?',
      options: [
        'Tránh (avoid)',
        'Chuyển giao (transfer)',
        'Giảm thiểu (mitigate)',
        'Chấp nhận (accept)',
      ],
      answer: 2,
      explanation: 'Pair và viết runbook làm giảm tác động nếu rủi ro xảy ra, nên đây là giảm thiểu. Tránh là thay đổi kế hoạch để loại bỏ hẳn rủi ro, còn chuyển giao là đẩy trách nhiệm sang bên khác, chẳng hạn qua hợp đồng.',
    },
    {
      question: 'Hai tuần nữa team Core Banking mới có API tra cứu tài khoản, trong khi team bạn cần API này cho một story trong sprint hiện tại. Nên làm gì?',
      options: [
        'Dời story sang sprint sau, cho team làm việc khác trong lúc chờ',
        'Thống nhất contract OpenAPI ngay, dùng mock để làm song song',
        'Tự viết API đó trong service của mình cho khỏi phụ thuộc',
        'Escalate ngay lên CTO để team Core Banking ưu tiên việc này',
      ],
      answer: 1,
      explanation: 'Thống nhất contract sớm và dùng mock giúp hai team làm song song; contract test sẽ phát hiện khi một bên thay đổi giao tiếp. Tự viết lại API sẽ tạo ra trùng lặp, còn escalate ngay khi chưa thử phối hợp là quá sớm.',
    },
    {
      question: 'Dự báo cho thấy chỉ khoảng 50% khả năng kịp go-live 15/9 với đủ phạm vi. PM gợi ý bỏ test tải và giảm review cho kịp. Dev Lead nên phản hồi thế nào?',
      options: [
        'Đồng ý bỏ test tải, vì PM là người chịu trách nhiệm ngày go-live',
        'Đề xuất đưa ngay 3 developer từ team khác vào trong tuần này',
        'Lặng lẽ làm theo, nhưng ghi lại để sau này không bị trách',
        'Đưa phương án cắt phạm vi hoặc lùi ngày, kèm đánh đổi rõ ràng',
      ],
      answer: 3,
      explanation: 'Cắt chất lượng chỉ dời chi phí sang bug và sự cố production, nhất là với hệ thống thanh toán. Thêm người vào dự án đang trễ thường không giúp được ngay. Lead nên làm rõ các đánh đổi để người có quyền quyết định.',
    },
  ],
  stakeholders: [
    {
      question: 'CTO có quyền lực cao nhưng ít quan tâm chi tiết dự án của team. Theo ma trận quyền lực – quan tâm, nên làm việc với CTO thế nào?',
      options: [
        'Mời vào mọi buổi daily và sprint review để luôn nắm chi tiết',
        'Không cần cung cấp thông tin gì cho đến khi dự án kết thúc',
        'Giữ hài lòng: cập nhật ngắn gọn, đúng lúc, nhất là khi có rủi ro lớn',
        'Gửi báo cáo chi tiết từng task mỗi ngày qua email',
      ],
      answer: 2,
      explanation: 'Nhóm quyền lực cao, quan tâm thấp cần được giữ hài lòng bằng thông tin cô đọng vào đúng thời điểm quan trọng. Quá nhiều chi tiết làm họ mất thời gian, còn im lặng hoàn toàn có thể khiến họ bị bất ngờ.',
    },
    {
      question: 'Trong bảng RACI, hoạt động "Quyết định release lên production" có cả PO và Dev Lead cùng là A. Vấn đề ở đây là gì?',
      options: [
        'Mỗi hoạt động chỉ nên có một A, để rõ ai chịu trách nhiệm cuối cùng',
        'Không sao cả, có càng nhiều A thì quyết định càng an toàn',
        'Nên chuyển cả hai người sang C để không ai phải chịu trách nhiệm',
        'Cần thêm SA làm A thứ ba cho cân bằng',
      ],
      answer: 0,
      explanation: 'A (Accountable) là người chịu trách nhiệm cuối cùng và duyệt; có hai A thì không rõ ai là người chốt khi hai bên bất đồng. Dev Lead có thể là R (người thực hiện release), còn PO là A.',
    },
    {
      question: 'Báo cáo dự án đã Green bốn tuần liền, nhưng từ hai tuần trước team đã biết tích hợp ví B có thể bị trễ. Nên làm gì?',
      options: [
        'Giữ Green cho đến khi chắc chắn trễ, để tránh báo động giả',
        'Chuyển sang Amber ngay, nêu rủi ro, phương án và quyết định cần có',
        'Chuyển thẳng sang Red để stakeholder chú ý hơn',
        'Tạm ngừng gửi báo cáo cho đến khi tình hình rõ ràng',
      ],
      answer: 1,
      explanation: 'Giữ Green khi bên trong đã có vấn đề là báo cáo kiểu "dưa hấu", và sẽ làm mất lòng tin khi sự thật lộ ra. Báo sớm kèm phương án cho stakeholder thời gian để quyết định. Red chỉ dùng theo đúng định nghĩa đã thống nhất.',
    },
    {
      question: 'Giám đốc kinh doanh yêu cầu thêm tính năng trả góp cho buổi demo khách hàng tuần sau. Bước đầu tiên tốt nhất của Dev Lead là gì?',
      options: [
        'Nhận ngay rồi cho team làm thêm cuối tuần',
        'Từ chối thẳng, vì sprint đã chốt phạm vi',
        'Chuyển yêu cầu cho PO và không tham gia gì thêm',
        'Hỏi nhu cầu thật: khách cần tính năng chạy thật hay chỉ cần minh hoạ',
      ],
      answer: 3,
      explanation: 'Hiểu nhu cầu thật thường mở ra giải pháp nhỏ hơn nhiều, chẳng hạn một prototype thay cho tính năng thật. Sau đó lead mới đưa ra phương án kèm đánh đổi. Nhận ngay hay từ chối thẳng đều bỏ qua bước quan trọng này.',
    },
    {
      question: 'Đối tác ví B chưa phản hồi yêu cầu sandbox sau hai lần nhắc, và go-live có nguy cơ trễ. Cách escalate nào tốt nhất?',
      options: [
        'Báo trước cho người liên hệ, rồi gửi PM email nêu tác động và phương án',
        'Gửi email thẳng cho CEO hai công ty để giải quyết cho nhanh',
        'Đợi thêm hai tuần, vì escalate sớm sẽ làm mất lòng đối tác',
        'Đăng lên group chung rằng đối tác làm việc thiếu chuyên nghiệp',
      ],
      answer: 0,
      explanation: 'Nên escalate ở cấp thấp nhất có đủ thẩm quyền, báo trước để không ai bị bất ngờ, và tập trung vào vấn đề cùng quyết định cần có. Nhảy cấp hay công khai chỉ trích sẽ làm hỏng quan hệ, còn chờ quá lâu thì mất hết lựa chọn.',
    },
  ],
  'team-metrics': [
    {
      question: 'Lead time for changes của team là 12 ngày. Tách ra từng đoạn thì thấy PR trung bình chờ review mất 6 ngày. Hành động hợp lý nhất là gì?',
      options: [
        'Yêu cầu developer commit nhiều lần hơn mỗi ngày',
        'Giảm kích thước PR và thống nhất thời gian review trong working agreement',
        'Bỏ bước code review để rút ngắn lead time',
        'Deploy ít lần hơn để mỗi lần gộp được nhiều thay đổi',
      ],
      answer: 1,
      explanation: 'Tách lead time thành từng đoạn cho thấy chỗ cần cải thiện. PR nhỏ hơn thì review nhanh hơn, còn thoả thuận thời gian review giúp giảm thời gian chờ. Bỏ review sẽ làm tăng change failure rate, còn gộp nhiều thay đổi thì làm mỗi lần deploy rủi ro hơn.',
    },
    {
      question: 'Sau khi team tăng tần suất deploy, ban giám đốc lo hệ thống sẽ kém ổn định hơn. Theo nghiên cứu DORA, nhận định nào đúng?',
      options: [
        'Tốc độ và ổn định luôn tỉ lệ nghịch, deploy càng nhiều càng lỗi nhiều',
        'Chỉ cần đo deployment frequency, độ ổn định không quan trọng',
        'Không nhất thiết đánh đổi; thay đổi nhỏ và tự động hoá cải thiện cả hai',
        'Nên giảm deploy xuống mỗi quý một lần cho an toàn',
      ],
      answer: 2,
      explanation: 'Nghiên cứu DORA cho thấy các team làm tốt thường đạt cả tốc độ lẫn độ ổn định, nhờ thay đổi nhỏ, test và deploy tự động. Vì vậy nên theo dõi cả hai nhóm chỉ số cùng lúc thay vì chỉ một nhóm.',
    },
    {
      question: 'Trên cumulative flow diagram, dải "Testing" ngày càng phình rộng trong khi các dải khác vẫn ổn định. Điều này cho thấy gì?',
      options: [
        'Team đang code quá chậm, cần tuyển thêm developer ngay',
        'Throughput đang tăng mạnh nên team không cần làm gì thêm',
        'Backlog đang phình ra do PO liên tục thêm story mới',
        'Việc đang ùn ở bước test; cần tìm nguyên nhân ngay tại bước này',
      ],
      answer: 3,
      explanation: 'Trên CFD, một dải phình rộng dần nghĩa là công việc vào bước đó nhanh hơn ra khỏi nó, tức là có điểm nghẽn. Lead nên điều tra nguyên nhân và cân nhắc giới hạn WIP, thay vì hối thúc developer code nhanh hơn.',
    },
    {
      question: 'Một manager đề xuất đo năng suất team chỉ bằng một chỉ số: số PR mỗi người mỗi tuần. Theo framework SPACE, vấn đề là gì?',
      options: [
        'Chỉ đo một khía cạnh (Activity) ở cấp cá nhân, thiếu dữ liệu khảo sát',
        'Số PR là chỉ số tốt, nhưng nên đo theo giờ thay vì theo tuần',
        'SPACE khuyên chỉ dùng khảo sát, không dùng số liệu hệ thống',
        'Nên thay số PR bằng số dòng code cho chính xác hơn',
      ],
      answer: 0,
      explanation: 'SPACE gợi ý chọn chỉ số từ nhiều khía cạnh (ít nhất ba) và kết hợp số liệu hệ thống với cảm nhận của developer. Chỉ số hoạt động ở cấp cá nhân rất dễ bị làm đẹp, và bỏ qua công sức review hay mentoring.',
    },
    {
      question: 'Ban quản lý đặt mục tiêu "tăng velocity 10% mỗi quý". Điều gì nhiều khả năng sẽ xảy ra?',
      options: [
        'Team sẽ giao nhiều tính năng hơn, tương ứng với mức 10%',
        'Chất lượng code chắc chắn sẽ được cải thiện theo',
        'Điểm ước lượng bị thổi phồng, còn giá trị giao được gần như không đổi',
        'Velocity sẽ giảm vì team phản đối mục tiêu này',
      ],
      answer: 2,
      explanation: 'Story point là ước lượng tương đối do chính team đặt ra, nên cách dễ nhất để đạt mục tiêu là chấm điểm cao hơn. Đây là ví dụ điển hình của định luật Goodhart: velocity chỉ nên dùng để team tự lập kế hoạch.',
    },
  ],
};

export default quiz;
