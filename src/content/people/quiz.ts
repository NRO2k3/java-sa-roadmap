import type { LessonQuiz } from '../types';

const quiz: LessonQuiz = {
  'one-on-one': [
    {
      question: 'Suốt một tháng, cứ đến 1:1 là Lan lại trả lời "Dạ, em ổn ạ" rồi im lặng. Cách xử lý nào phù hợp nhất?',
      options: [
        'Rút 1:1 xuống còn 10 phút vì Lan dường như không có gì cần nói',
        'Dùng thời gian 1:1 để cập nhật tiến độ task cho khỏi lãng phí',
        'Hỏi câu cụ thể hơn về công việc tuần qua và chủ động xin feedback cho mình',
        'Tạm dừng 1:1 cho đến khi Lan tự đề xuất chủ đề muốn trao đổi',
      ],
      answer: 2,
      explanation: 'Câu hỏi chung chung hay nhận về câu trả lời xã giao, nhất là khi có khoảng cách cấp bậc. Câu hỏi cụ thể kèm việc lead chủ động xin góp ý sẽ giúp thành viên thấy nói thật là an toàn. Cắt ngắn hay dừng 1:1 chỉ khiến kênh này yếu đi.',
    },
    {
      question: 'Câu nào mô tả đúng phần Behavior (hành vi) trong feedback SBI?',
      options: [
        '"Em có thái độ thiếu tôn trọng chị BA."',
        '"Em ngắt lời chị Hương ba lần khi chị đang giải thích luồng hoàn tiền."',
        '"Em có vẻ không quan tâm đến ý kiến của người khác."',
        '"Em cố tình làm chị Hương mất mặt trước khách hàng."',
      ],
      answer: 1,
      explanation: 'Behavior phải là điều quan sát được, như một chiếc camera ghi lại. Các phương án còn lại là nhận xét về thái độ hoặc suy đoán động cơ, nên người nghe dễ phòng thủ và khó biết phải thay đổi điều gì.',
    },
    {
      question: 'Đọc PR của một junior, lead thấy rất nhiều lỗi. Lead nói "Ổn rồi em" rồi tối đó tự sửa lại mà không cho junior biết. Theo Radical Candor, đây là ô nào?',
      options: [
        'Obnoxious Aggression',
        'Manipulative Insincerity',
        'Radical Candor',
        'Ruinous Empathy',
      ],
      answer: 3,
      explanation: 'Lead có quan tâm (không muốn junior buồn) nhưng không nói thẳng, nên rơi vào Ruinous Empathy: junior không học được gì và lỗi sẽ lặp lại. Manipulative Insincerity là khi vừa không quan tâm vừa không nói thẳng, chẳng hạn khen trước mặt rồi chê sau lưng.',
    },
    {
      question: 'Hai sprint liền Hùng bị trượt story, và bạn hẹn Hùng nói chuyện riêng. Nên mở đầu buổi nói chuyện thế nào?',
      options: [
        'Nói thẳng vấn đề kèm dữ kiện cụ thể, sau đó hỏi Hùng đang vướng ở đâu',
        'Khen vài điểm tốt cho Hùng thoải mái, gần cuối buổi mới nhắc chuyện trễ',
        'Báo trước rằng nếu sprint sau còn trễ thì sẽ chuyển sang HR',
        'Lặng lẽ chuyển story của Hùng cho người khác để khỏi căng thẳng',
      ],
      answer: 0,
      explanation: 'Với cuộc trò chuyện khó, nên vào thẳng vấn đề bằng dữ kiện rồi hỏi để tìm nguyên nhân gốc. Feedback sandwich làm thông điệp chính bị loãng, còn doạ dẫm hoặc né tránh đều không giải quyết được nguyên nhân.',
    },
    {
      question: 'Lan làm rất tốt phần demo, nhưng bạn biết Lan ngại bị chú ý trước đông người. Nên ghi nhận Lan thế nào?',
      options: [
        'Vẫn khen thật to trước toàn công ty, vì khen công khai lúc nào cũng tốt',
        'Hỏi Lan thích được ghi nhận theo cách nào, rồi khen cụ thể theo cách đó',
        'Không khen gì để Lan khỏi khó xử',
        'Nhắn "Good job" chung chung vào group chat của team',
      ],
      answer: 1,
      explanation: '"Khen công khai" là nguyên tắc chung, nhưng cần tôn trọng sở thích của từng người. Lời khen cụ thể (theo SBI), đưa theo cách người đó thấy thoải mái, sẽ giúp họ biết điều gì nên tiếp tục làm.',
    },
  ],
  mentoring: [
    {
      question: 'Skill matrix cho thấy chỉ Long đạt mức 4 về nghiệp vụ đối soát, những người còn lại đều ở mức 1 trở xuống. Việc nên làm là gì?',
      options: [
        'Lên kế hoạch cho Long pair và chuyển giao kiến thức cho ít nhất một người khác',
        'Giao hết việc đối soát cho Long vì Long làm nhanh nhất',
        'Lấy skill matrix để xếp hạng và hạ đánh giá những người ở mức thấp',
        'Đợi đến lúc Long xin nghỉ rồi mới viết tài liệu bàn giao',
      ],
      answer: 0,
      explanation: 'Kiến thức chỉ nằm ở một người là rủi ro lớn cho team. Mỗi kỹ năng quan trọng nên có ít nhất hai người làm được. Dùng skill matrix để xếp hạng sẽ khiến mọi người tự chấm cao và bảng mất giá trị.',
    },
    {
      question: 'Hà đã làm Kafka được một tháng, liên tục gặp lỗi consumer rebalance và bắt đầu chán nản. Theo Situational Leadership II, phong cách nào phù hợp?',
      options: [
        'Delegating: để Hà tự xử lý vì đã có một tháng kinh nghiệm',
        'Supporting: chỉ lắng nghe và động viên, không chỉ dẫn thêm',
        'Directing: giao từng bước cụ thể và không cần giải thích lý do',
        'Coaching: vẫn chỉ dẫn cụ thể, đồng thời giải thích và động viên nhiều',
      ],
      answer: 3,
      explanation: 'Hà đã có một chút năng lực nhưng cam kết đang giảm, tức là mức D2, nên cần S2 Coaching: vừa chỉ dẫn vừa hỗ trợ tinh thần. Supporting hợp với D3, khi người đó đã khá giỏi nhưng còn thiếu tự tin.',
    },
    {
      question: 'Với quyết định thêm thư viện vào pom.xml, team được tự quyết, còn lead chỉ góp ý trước khi team chốt. Theo bảy cấp độ uỷ quyền của Appelo, đây là cấp nào?',
      options: ['Consult', 'Advise', 'Agree', 'Inquire'],
      answer: 1,
      explanation: 'Advise nghĩa là team quyết định, lead góp ý. Consult thì ngược lại: lead hỏi ý kiến rồi tự quyết. Inquire là team quyết, lead chỉ hỏi lại kết quả sau đó.',
    },
    {
      question: 'Coaching theo GROW, bạn và Hà đã thống nhất mục tiêu là API phải đạt dưới 500ms. Theo GROW, câu hỏi tiếp theo nên là gì?',
      options: [
        '"Em sẽ làm gì trước tiên, và khi nào thì xong?"',
        '"Em cứ thêm Redis đi, anh thấy ổn đấy."',
        '"Hiện tại em đã đo xem thời gian đang tốn ở đâu chưa?"',
        '"Ngoài Redis ra, còn những phương án nào khác?"',
      ],
      answer: 2,
      explanation: 'Sau Goal là Reality: tìm hiểu thực trạng và dữ liệu trước khi bàn đến phương án (Options) và hành động (Will). Nhảy thẳng vào giải pháp dễ dẫn tới chữa triệu chứng, chẳng hạn dùng cache để che lỗi N+1.',
    },
    {
      question: 'Minh đang làm feature lead và chọn cách tổ chức package khác với cách bạn thích, nhưng vẫn hợp lý. Bạn nên làm gì?',
      options: [
        'Để Minh tự quyết vì đây là quyết định dễ đảo ngược, chỉ góp ý nếu Minh hỏi',
        'Yêu cầu Minh đổi theo cách của lead để giữ phong cách thống nhất',
        'Đợi Minh merge xong rồi tự sửa lại cấu trúc package',
        'Đẩy quyết định lên SA để khỏi tranh cãi trong team',
      ],
      answer: 0,
      explanation: 'Với quyết định dễ đảo ngược, việc trao quyền tự chủ giúp thành viên lớn lên, quan trọng hơn việc làm đúng ý lead. Âm thầm sửa lại sau là uỷ quyền nửa vời, sẽ làm mất niềm tin.',
    },
  ],
  hiring: [
    {
      question: 'Viết mục "năng lực bắt buộc" trong JD Senior Java Backend, câu nào tốt nhất?',
      options: [
        'Có từ 5 năm kinh nghiệm Java trở lên',
        'Đã xây dựng và vận hành service Spring Boot trên production',
        'Thành thạo Java, Spring, Kafka, Redis, K8s, AWS, React, Go và Python',
        'Là một rockstar, chịu được áp lực công việc cao',
      ],
      answer: 1,
      explanation: 'JD tốt mô tả năng lực và kết quả cụ thể. Số năm kinh nghiệm chỉ là chỉ báo gián tiếp; danh sách công nghệ quá dài khiến ứng viên giỏi nhưng khiêm tốn tự loại mình; còn những từ sáo rỗng thì không giúp đánh giá được gì.',
    },
    {
      question: 'Buổi debrief vừa bắt đầu, manager đã nói ngay "Anh thấy bạn này rất được", và sau đó mọi người đều đồng ý theo. Nên điều chỉnh quy trình thế nào?',
      options: [
        'Bỏ debrief, để manager quyết một mình cho nhanh',
        'Cho các thành viên bỏ phiếu kín sau khi nghe manager phát biểu',
        'Mọi người nộp scorecard độc lập trước khi họp, người ít thâm niên nói trước',
        'Chỉ mời những người phỏng vấn đồng ý với manager vào buổi debrief',
      ],
      answer: 2,
      explanation: 'Nộp scorecard trước khi họp và để người ít thâm niên nói trước giúp giảm ảnh hưởng của người có chức vụ. Bỏ phiếu kín sau khi manager đã nói vẫn bị ý kiến đầu tiên chi phối.',
    },
    {
      question: 'Câu nào là câu hỏi behavioral đúng nghĩa để đánh giá cách ứng viên xử lý bất đồng?',
      options: [
        '"Kể về một lần em không đồng ý với quyết định kỹ thuật của lead. Lúc đó em đã làm gì?"',
        '"Nếu không đồng ý với lead, em sẽ làm gì?"',
        '"Em có hay bất đồng với người khác không?"',
        '"Theo em, làm việc nhóm quan trọng như thế nào?"',
      ],
      answer: 0,
      explanation: 'Câu hỏi behavioral hỏi về hành động thật trong quá khứ và có thể đào sâu theo STAR. Câu hỏi giả định hoặc câu hỏi chung chung dễ nhận về câu trả lời "đúng sách" thay vì bằng chứng thật.',
    },
    {
      question: 'Một người phỏng vấn chấm ứng viên điểm cao ở mọi năng lực vì ứng viên từng làm ở một công ty công nghệ nổi tiếng, dù vòng system design khá yếu. Đây là thiên kiến gì?',
      options: [
        'Hiệu ứng tương phản',
        'Thiên kiến tương đồng',
        'Ấn tượng đầu tiên',
        'Hiệu ứng hào quang',
      ],
      answer: 3,
      explanation: 'Hiệu ứng hào quang là khi một điểm nổi bật làm lệch đánh giá ở mọi tiêu chí khác. Cách giảm là chấm riêng từng năng lực, mỗi điểm số phải kèm bằng chứng quan sát được.',
    },
    {
      question: 'Trong kế hoạch onboarding, mục tiêu nào hợp lý nhất cho tuần đầu tiên của một Java developer mới?',
      options: [
        'Đọc hết toàn bộ Confluence của công ty trước khi đụng vào code',
        'Chạy được service ở local và có PR nhỏ đầu tiên được merge',
        'Tự phụ trách một epic lớn để chứng minh năng lực',
        'Làm on-call chính ngay từ tuần đầu để quen hệ thống',
      ],
      answer: 1,
      explanation: 'Có một kết quả nhỏ, thật trong tuần đầu giúp người mới quen với toàn bộ quy trình (build, review, CI) và tự tin hơn. Việc lớn và on-call chính nên để đến giai đoạn 60–90 ngày.',
    },
  ],
  'team-health': [
    {
      question: 'Một dev nhắn: "Anh ơi, em lỡ xoá dữ liệu trên staging rồi." Phản ứng đầu tiên nào giúp xây dựng psychological safety?',
      options: [
        '"Sao em bất cẩn vậy? Lần sau phải cẩn thận hơn."',
        '"Ai cấp quyền xoá cho em thế?"',
        '"Để anh tự xử lý, em đừng đụng vào nữa."',
        '"Cảm ơn em đã báo sớm, mình cùng xem cách khôi phục nhé."',
      ],
      answer: 3,
      explanation: 'Cách lead phản ứng với tin xấu quyết định lần sau người ta có còn báo nữa không. Cảm ơn trước rồi tập trung vào cách sửa; câu chuyện cải thiện quyền truy cập hay quy trình để dành cho buổi postmortem không đổ lỗi.',
    },
    {
      question: 'Team chạy dự án với deadline rất căng và tiêu chuẩn cao, nhưng không ai dám báo vấn đề cho đến ngày release. Theo ma trận của Edmondson, team đang ở vùng nào?',
      options: ['Vùng lo âu', 'Vùng thoải mái', 'Vùng học hỏi', 'Vùng thờ ơ'],
      answer: 0,
      explanation: 'Tiêu chuẩn cao đi cùng an toàn tâm lý thấp tạo ra vùng lo âu: áp lực lớn nhưng vấn đề bị che giấu. Mục tiêu là vùng học hỏi, nơi giữ được tiêu chuẩn cao và mọi người đồng thời dám nói thật.',
    },
    {
      question: 'Long là senior, trước rất hay góp ý trong design review. Vài tuần nay Long im lặng, commit lúc 1 giờ sáng và hay nói "làm gì cũng bị đổi yêu cầu thôi". Lead nên làm gì trước tiên?',
      options: [
        'Nhắc nhở Long trước team về thái độ tiêu cực gần đây',
        'Khen Long trước team vì tinh thần làm việc đến khuya',
        'Nói chuyện riêng để hỏi han, rồi cùng tìm cách giảm tải',
        'Giao ngay một dự án mới thú vị để Long có lại động lực',
      ],
      answer: 2,
      explanation: 'Đây là các dấu hiệu burnout: kiệt sức, hoài nghi, rút lui. Lead cần quan tâm trước, sau đó xử lý nguyên nhân như khối lượng công việc hay việc yêu cầu thay đổi liên tục. Khen làm khuya chỉ củng cố hành vi có hại.',
    },
    {
      question: 'Đã ba tuần hai senior tranh luận chuyện dùng Kafka hay RabbitMQ, và không khí bắt đầu căng thẳng. Cách xử lý nào tốt nhất?',
      options: [
        'Để hai người tự giải quyết, vì tranh luận kỹ thuật kéo dài rồi cũng tự lắng xuống',
        'Thống nhất tiêu chí, so sánh phương án bằng ADR; chưa đồng thuận thì người có thẩm quyền quyết',
        'Chọn phương án của người có thâm niên cao hơn để giữ hoà khí và đỡ mất thời gian',
        'Cho cả team bỏ phiếu ngay trong daily stand-up hôm sau để chốt cho nhanh',
      ],
      answer: 1,
      explanation: 'Xung đột về công việc là lành mạnh khi được giải quyết bằng tiêu chí rõ ràng. Nếu để kéo dài, nó dễ biến thành xung đột quan hệ. Khi không đạt đồng thuận, người có thẩm quyền quyết và cả team disagree and commit.',
    },
    {
      question: 'Team vừa nhận thêm 3 thành viên mới. Mọi người tranh luận nhiều về coding convention, và vài người tỏ ra thất vọng. Theo Tuckman, team đang ở giai đoạn nào và lead nên làm gì?',
      options: [
        'Performing: uỷ quyền hoàn toàn, không cần can thiệp',
        'Norming: lead đứng ngoài, để team tự điều chỉnh',
        'Storming: đưa bất đồng ra thảo luận có cấu trúc rồi chốt vào working agreement',
        'Adjourning: tổng kết bài học và chuẩn bị tách team',
      ],
      answer: 2,
      explanation: 'Khi có thay đổi thành viên, team thường quay lại giai đoạn forming hoặc storming. Ở storming, lead không nên dập tắt tranh luận mà nên tổ chức cho tranh luận có cấu trúc và biến kết quả thành chuẩn mực chung.',
    },
  ],
  performance: [
    {
      question: 'Objective là "Thanh toán QR nhanh và đáng tin cậy". Câu nào là một Key Result đúng nghĩa?',
      options: [
        'Chuyển luồng thông báo sang Kafka',
        'Tăng tỷ lệ giao dịch thành công từ 97,5% lên 99,5%',
        'Viết thêm 50 unit test cho payment-service',
        'Tổ chức 3 buổi họp với ngân hàng đối tác',
      ],
      answer: 1,
      explanation: 'Key Result đo kết quả (outcome) cho biết objective đã đạt hay chưa. Các phương án còn lại là hoạt động hoặc giải pháp: làm xong chúng chưa chắc đã đạt được kết quả mong muốn.',
    },
    {
      question: 'Minh làm rất tốt suốt 10 tháng, chỉ có một sự cố vào tháng trước. Thế nhưng bản nháp review của lead lại chủ yếu viết về sự cố đó. Vấn đề ở đây là gì?',
      options: [
        'Hiệu ứng hào quang; cần chấm cao hơn ở mọi tiêu chí',
        'Thiên kiến giống mình; cần nhờ HR viết thay',
        'Đánh giá dễ dãi; cần hạ mức đánh giá cho cân bằng',
        'Thiên kiến gần đây; cần dùng ghi chú 1:1 và brag document của cả kỳ',
      ],
      answer: 3,
      explanation: 'Thiên kiến gần đây (recency) khiến sự kiện mới xảy ra lấn át cả kỳ. Dẫn chứng thu thập đều đặn từ ghi chú 1:1, brag document và dấu vết công việc giúp đánh giá cân bằng hơn.',
    },
    {
      question: 'Tới buổi review cuối năm, một thành viên mới lần đầu nghe nhận xét rằng mình "hay báo rủi ro muộn". Điều này cho thấy gì?',
      options: [
        'Lead đã không đưa feedback kịp thời trong 1:1 trong suốt kỳ',
        'Thành viên không chịu đọc kỹ tài liệu đánh giá',
        'Buổi review là lúc phù hợp nhất để nêu vấn đề lần đầu',
        'Cần thêm một vòng peer feedback nữa',
      ],
      answer: 0,
      explanation: 'Nguyên tắc là "không có bất ngờ": mọi vấn đề lớn phải được nói trong 1:1 từ khi nó xảy ra. Buổi review nên tổng kết những gì cả hai bên đều đã biết, rồi hướng về kỳ tiếp theo.',
    },
    {
      question: 'Story của Hùng thường bị QA trả lại. Trước khi tính đến PIP, lead nên làm gì?',
      options: [
        'Lập ngay PIP 30 ngày để có hồ sơ đầy đủ nếu sau này cần xử lý',
        'Chuyển Hùng sang một team khác để Hùng làm việc nhẹ nhàng hơn',
        'Tìm nguyên nhân gốc (kỳ vọng, kỹ năng, động lực, hoàn cảnh) và hỗ trợ không chính thức',
        'Âm thầm giao ít việc hơn cho Hùng để tránh căng thẳng trong team',
      ],
      answer: 2,
      explanation: 'Phần lớn trường hợp hiệu suất thấp có thể cải thiện từ giai đoạn không chính thức, khi lead làm rõ kỳ vọng, đưa feedback SBI và hỗ trợ đúng nguyên nhân. PIP chỉ dùng khi những bước đó không hiệu quả, và phải làm cùng HR.',
    },
    {
      question: 'Lý do nào thuyết phục nhất để đề xuất thăng tiến một người từ Mid lên Senior?',
      options: [
        'Người đó đã gắn bó với công ty 3 năm và chưa từng được thăng tiến',
        'Người đó vừa hoàn thành đúng hạn một dự án lớn được khách hàng khen',
        'Người đó đang có offer từ công ty khác và có thể nghỉ nếu không được thăng tiến',
        'Người đó đã làm ổn định ở mức Senior nhiều tháng, có dẫn chứng theo career ladder',
      ],
      answer: 3,
      explanation: 'Thăng tiến nên ghi nhận việc người đó đã làm ổn định ở cấp mới, chứ không phải phần thưởng cho thâm niên, cho một dự án, hay biện pháp giữ người. Dẫn chứng theo từng khía cạnh của career ladder giúp hồ sơ khách quan.',
    },
  ],
};

export default quiz;
