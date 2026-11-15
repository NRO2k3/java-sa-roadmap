import type { LessonQuiz } from '../types';

const quiz: LessonQuiz = {
  'clean-code': [
    {
      question:
        'Method tinhGiamGia() trong OrderService gọi customer.getTier(), customer.getYearsActive() và customer.getJoinDate() để tự tính mức giảm giá. Đây là smell gì và nên refactor thế nào?',
      options: [
        'God class: Extract Class, tách sang một DiscountService mới',
        'Feature envy: Move Method, đưa logic tính giảm giá vào Customer',
        'Duplicated code: Extract Method ngay trong OrderService',
        'Long method: Inline Method để giảm số tầng gọi hàm',
      ],
      answer: 1,
      explanation:
        'Method dùng dữ liệu của Customer nhiều hơn dữ liệu của chính class chứa nó là dấu hiệu feature envy. Đưa hành vi về gần dữ liệu (Move Method) giúp logic nằm đúng chỗ và dễ test hơn.',
    },
    {
      question: 'Khi viết characterization test cho một method legacy, giá trị kỳ vọng trong assert nên lấy từ đâu?',
      options: [
        'Từ tài liệu đặc tả nghiệp vụ viết từ ban đầu',
        'Từ trí nhớ của người đã viết đoạn code gốc',
        'Từ kết quả thực tế mà code hiện tại trả về khi chạy',
        'Từ kết quả mong muốn sau khi đã refactor xong',
      ],
      answer: 2,
      explanation:
        'Characterization test ghi lại hành vi hiện tại, kể cả hành vi trông có vẻ sai, để làm lưới an toàn khi refactor. Tài liệu đặc tả thường đã lệch so với code đang chạy.',
    },
    {
      question:
        'Đang refactor, bạn phát hiện số lượng âm cho ra tổng tiền âm, có vẻ là bug. Characterization test hiện đang khẳng định hành vi đó. Nên làm gì?',
      options: [
        'Ghi nhận, tạo ticket và sửa trong một thay đổi riêng sau refactor',
        'Sửa bug luôn trong commit refactor hiện tại để đỡ tốn thêm một PR',
        'Xoá test tương ứng vì nó đang khẳng định một hành vi sai rõ ràng',
        'Dừng refactor lại và viết lại toàn bộ module từ đầu cho sạch',
      ],
      answer: 0,
      explanation:
        'Refactor không được đổi hành vi; trộn sửa bug vào refactor khiến bạn không biết test đỏ là do lỡ tay hay cố ý. Tách riêng giúp review và rollback dễ dàng.',
    },
    {
      question:
        'Constructor PaymentService(List<PaymentProcessor> all) gom bean bằng all.stream().collect(Collectors.toUnmodifiableMap(PaymentProcessor::method, Function.identity())). Nếu hai bean trả về cùng method() thì sao?',
      options: [
        'Bean được tạo sau ghi đè bean trước, ứng dụng chạy bình thường',
        'Spring tự động chọn bean có đánh dấu @Primary để đưa vào map',
        'Map giữ cả hai bean và get() trả về một trong hai ngẫu nhiên',
        'Collector ném IllegalStateException, ứng dụng không khởi động được',
      ],
      answer: 3,
      explanation:
        'Collectors.toUnmodifiableMap ném IllegalStateException khi gặp key trùng, nên việc tạo bean thất bại ngay lúc khởi động. Đây là fail fast có chủ đích, tốt hơn âm thầm ghi đè.',
    },
    {
      question:
        'Hai method validate đơn hàng B2B và B2C trông gần giống hệt nhau, nhưng mỗi cái thay đổi theo yêu cầu của một bộ phận khác nhau. Cách xử lý hợp lý?',
      options: [
        'Gộp ngay thành một method chung và thêm tham số boolean isB2B vào',
        'Tạo abstract class dùng Template Method cho cả hai loại đơn hàng',
        'Giữ riêng, vì chúng chỉ trùng câu chữ chứ không trùng kiến thức',
        'Chuyển cả hai sang một class tiện ích static để mọi nơi dùng chung',
      ],
      answer: 2,
      explanation:
        'DRY nói về trùng lặp kiến thức nghiệp vụ. Hai đoạn code thay đổi vì hai lý do khác nhau mà bị gộp sẽ tạo coupling sai và sinh ra các cờ boolean khó hiểu.',
    },
  ],
  'code-review': [
    {
      question: 'Theo quy ước phân loại nhận xét, nhận xét nào dưới đây nên được đánh dấu là blocking?',
      options: [
        'Tên biến tmp nên đổi thành pendingItems cho dễ đọc hơn',
        'Câu SQL nối chuỗi tham số sort lấy từ request, gây SQL injection',
        'Có thể gom các lời gọi thành một lời gọi batch để giảm latency',
        'Mình thích dùng stream hơn vòng for ở đoạn này, tuỳ bạn nhé',
      ],
      answer: 1,
      explanation:
        'Lỗ hổng bảo mật phải sửa trước khi merge nên là blocking. Các góp ý về tên biến hay sở thích cá nhân là nit hoặc suggestion, tác giả có thể cân nhắc.',
    },
    {
      question: 'Theo hướng dẫn code review của Google, reviewer nên approve một thay đổi khi nào?',
      options: [
        'Khi CI xanh và coverage của toàn bộ dự án đạt trên 80%',
        'Khi không còn bất kỳ góp ý nào, kể cả các góp ý nit',
        'Khi tác giả là senior nên có thể tin tưởng phần chi tiết',
        'Khi thay đổi chắc chắn làm codebase tốt lên, dù chưa hoàn hảo',
      ],
      answer: 3,
      explanation:
        'Không có code hoàn hảo, chỉ có code tốt hơn. Đòi hỏi cầu toàn làm PR không bao giờ merge được, còn duyệt dựa vào chức danh thì bỏ qua mục đích của review.',
    },
    {
      question:
        'PR có method @Transactional approve(id): đọc Loan từ DB, gọi creditBureauClient.check() qua HTTP, rồi cập nhật trạng thái. Reviewer nên nêu rủi ro gì?',
      options: [
        'Connection DB bị giữ trong lúc chờ HTTP, dễ cạn pool khi bên ngoài chậm',
        '@Transactional không có tác dụng trên method public nên cần đổi sang private',
        'findById luôn sinh ra hai câu query nên cần đổi sang getReferenceById',
        'Gọi HTTP trong service vi phạm SOLID nên cần chuyển hết vào controller',
      ],
      answer: 0,
      explanation:
        'Connection được giữ suốt transaction, kể cả lúc chờ HTTP. Khi dịch vụ bên ngoài chậm, mọi connection bị giữ và các request khác phải chờ; nên gọi HTTP ngoài transaction và đặt timeout.',
    },
    {
      question:
        'Đồng nghiệp gửi PR lúc 10 giờ sáng trong khi bạn đang tập trung debug một vấn đề khó. Team có SLA phản hồi trong một ngày làm việc. Nên làm gì?',
      options: [
        'Bỏ dở ngay việc đang làm để review PR đó trong vòng 5 phút',
        'Để dành đến cuối sprint rồi review gộp nhiều PR một lần',
        'Làm xong đoạn đang tập trung, review ở điểm chuyển việc trong ngày',
        'Approve luôn để không chặn đồng nghiệp, đọc kỹ sau khi rảnh',
      ],
      answer: 2,
      explanation:
        'SLA giúp review không chặn team mà vẫn không phá luồng tập trung. Review ở các điểm chuyển việc tự nhiên (sau bữa trưa, sau standup) đáp ứng được cả hai.',
    },
    {
      question: 'Mỗi PR của team đều nhận 10 đến 15 nhận xét về thụt lề và thứ tự import. Giải pháp tốt nhất là gì?',
      options: [
        'Nhắc cả team đọc kỹ style guide trước khi mở mỗi PR',
        'Thêm formatter tự động (Spotless) và kiểm tra nó trong CI',
        'Chỉ định riêng một người chuyên review phần style cho mọi PR',
        'Bỏ qua các nhận xét về style để thời gian review nhanh hơn',
      ],
      answer: 1,
      explanation:
        'Con người không nên review những gì máy kiểm tra được. Formatter tự động chấm dứt tranh luận và giải phóng reviewer cho thiết kế, nghiệp vụ.',
    },
  ],
  'testing-strategy': [
    {
      question:
        'Bộ test của một service Spring Boot chạy 40 phút, phần lớn là E2E qua UI, trong khi lỗi thường nằm ở query và mapping JSON. Hướng cải thiện hợp lý?',
      options: [
        'Viết thêm nhiều E2E nữa để bao phủ hết mọi trường hợp lỗi có thể',
        'Đưa kiểm tra query và JSON xuống slice test, chỉ giữ vài E2E chính',
        'Bỏ toàn bộ E2E, chỉ giữ unit test với repository đã được mock',
        'Giữ nguyên cấu trúc và chạy E2E song song trên nhiều máy hơn',
      ],
      answer: 1,
      explanation:
        'Slice test như @DataJpaTest với Testcontainers và @WebMvcTest bắt lỗi query và mapping nhanh, rõ ràng hơn E2E. Mock repository thì không kiểm tra được query thật.',
    },
    {
      question: 'Trong Pact consumer test, body được khai báo bằng new PactDslJsonBody().integerType("id", 42). Điều này có nghĩa gì?',
      options: [
        'Provider phải trả về đúng id bằng 42 thì verification mới pass',
        'Consumer sẽ gửi giá trị id bằng 42 trong phần body của request',
        'Pact tự sinh ra 42 test case với các giá trị id khác nhau',
        'Chỉ yêu cầu id là số nguyên; 42 là giá trị mẫu cho mock server',
      ],
      answer: 3,
      explanation:
        'integerType là matcher theo kiểu: provider chỉ cần trả về id kiểu số nguyên. Nhờ vậy hợp đồng không ràng buộc dữ liệu cụ thể một cách thừa thãi.',
    },
    {
      question:
        'Code: if (amount > FREE_SHIPPING_THRESHOLD) với ngưỡng 500.000. Test có amount 50.000 và 1.000.000. PIT báo mutant đổi > thành >= sống sót. Điều này cho biết gì?',
      options: [
        'Thiếu test tại đúng giá trị biên 500.000 nên thay đổi lọt qua',
        'Coverage của method này còn dưới 50% nên PIT không đánh giá được',
        'Đây chắc chắn là equivalent mutant nên có thể bỏ qua an toàn',
        'Test bị flaky nên PIT không ổn định khi chạy lại nhiều lần',
      ],
      answer: 0,
      explanation:
        'Với 50.000 và 1.000.000, cả > và >= cho cùng kết quả nên test không phân biệt được. Thêm test với amount đúng 500.000 sẽ giết mutant này.',
    },
    {
      question: 'Test chờ consumer Kafka xử lý xong bằng Thread.sleep(2000) và thỉnh thoảng đỏ trên CI. Cách sửa tốt nhất?',
      options: [
        'Tăng thời gian chờ lên Thread.sleep(10000) cho chắc chắn hơn',
        'Bật surefire.rerunFailingTestsCount=3 để test tự chạy lại khi đỏ',
        'Dùng Awaitility chờ đến khi điều kiện đúng, với một timeout tối đa',
        'Chuyển test này sang chạy thủ công trước mỗi lần release',
      ],
      answer: 2,
      explanation:
        'Awaitility kiểm tra lặp lại cho đến khi điều kiện đúng nên vừa nhanh khi hệ thống nhanh, vừa chịu được lúc CI chậm. Rerun chỉ che giấu vấn đề.',
    },
    {
      question:
        'Test @SpringBootTest(webEnvironment = RANDOM_PORT) có @Transactional, gọi API tạo đơn qua TestRestTemplate. Sau test, đơn vẫn còn trong DB. Vì sao?',
      options: [
        '@Transactional trong test chỉ rollback được khi dùng DB nhúng H2',
        'Request chạy trên thread của server, ngoài transaction của test',
        'TestRestTemplate luôn tự commit mọi transaction đang mở trong test',
        'Testcontainers tắt cơ chế rollback của Spring theo mặc định',
      ],
      answer: 1,
      explanation:
        'Với RANDOM_PORT, server thật xử lý request trên thread khác, nên transaction của test không bao được dữ liệu đó. Khi đó cần dọn dữ liệu chủ động hoặc dùng dữ liệu duy nhất cho mỗi test.',
    },
  ],
  'git-ci': [
    {
      question:
        'Version hiện tại là 2.4.1. Từ lần release trước có các commit: fix(order): sửa làm tròn tiền, feat(api): thêm endpoint lọc đơn, docs: cập nhật README. Version tiếp theo theo SemVer là gì?',
      options: ['2.4.2', '3.0.0', '2.5.0', '2.5.1'],
      answer: 2,
      explanation:
        'Có feat nên tăng MINOR và đưa PATCH về 0, thành 2.5.0. Không có dấu ! hay BREAKING CHANGE nên không tăng MAJOR.',
    },
    {
      question:
        'File CODEOWNERS có dòng "* @example-org/backend" ở đầu và "/payment/ @example-org/payment-owners" ở sau. PR chỉ sửa /payment/Refund.java sẽ cần owner nào?',
      options: [
        'Cả hai team backend và payment-owners cùng phải approve',
        'Chỉ payment-owners, vì dòng khớp cuối cùng được ưu tiên',
        'Chỉ backend, vì dòng khớp đầu tiên được ưu tiên',
        'Không team nào, vì hai dòng khớp mâu thuẫn nhau',
      ],
      answer: 1,
      explanation:
        'Trong CODEOWNERS, pattern khớp cuối cùng quyết định owner. Vì vậy nên đặt quy tắc chung ở trên và quy tắc cụ thể ở dưới.',
    },
    {
      question:
        'Tác giả nhận approval rồi đẩy thêm commit thay đổi logic, và vẫn merge được mà không ai xem lại. Nên bật tuỳ chọn branch protection nào?',
      options: [
        'Require linear history cho nhánh main',
        'Require signed commits cho mọi commit',
        'Allow force pushes cho người có quyền admin',
        'Dismiss stale approvals khi có commit mới',
      ],
      answer: 3,
      explanation:
        'Tuỳ chọn này huỷ approval cũ mỗi khi có commit mới được đẩy lên, buộc reviewer xem lại. Linear history hay signed commits giải quyết vấn đề khác.',
    },
    {
      question:
        'Pipeline có bước phân tích SonarQube, nhưng PR làm giảm coverage vẫn merge được dù quality gate hiện đỏ trên SonarQube. Nguyên nhân hợp lý nhất?',
      options: [
        'Bước Sonar không chờ kết quả gate hoặc không phải required check',
        'JaCoCo không tương thích với Java 21 nên không tạo được báo cáo',
        'SonarQube chỉ phân tích nhánh main, không bao giờ phân tích PR',
        'Cấu hình fetch-depth: 0 khiến Sonar bỏ qua dữ liệu coverage',
      ],
      answer: 0,
      explanation:
        'Mặc định scanner chỉ gửi kết quả lên server rồi kết thúc thành công. Với sonar.qualitygate.wait=true, bước này chờ và fail khi gate đỏ, và phải được đặt làm required check mới chặn được merge.',
    },
    {
      question: 'Trường hợp nào GitFlow phù hợp hơn trunk-based development?',
      options: [
        'Web service nội bộ deploy nhiều lần mỗi ngày lên Kubernetes',
        'Phần mềm on-premise cần duy trì nhiều version song song',
        'Team nhỏ muốn giảm merge conflict và tích hợp code sớm hơn',
        'Team muốn rút ngắn lead time từ lúc commit đến production',
      ],
      answer: 1,
      explanation:
        'GitFlow với nhánh release và hotfix hợp với phần mềm có version phát hành rời rạc. Với web service deploy liên tục, các nhánh sống lâu chỉ làm tích hợp muộn hơn.',
    },
  ],
  'static-analysis': [
    {
      question:
        'Cho Set<Long> blockedIds = Set.of(1001L) và int customerId = 1001. Biểu thức blockedIds.contains(customerId) cho kết quả gì?',
      options: [
        'Không biên dịch được vì kiểu tham số không khớp',
        'Luôn false vì int box thành Integer, khác kiểu Long',
        'Ném ClassCastException vì Integer không ép sang Long',
        'Trả về true vì Java tự chuyển int sang Long khi so sánh',
      ],
      answer: 1,
      explanation:
        'contains nhận Object nên code vẫn biên dịch; Integer không bao giờ equals Long nên kết quả luôn false. Error Prone bắt lỗi này ngay lúc compile.',
    },
    {
      question: 'Công cụ nào phân tích bytecode sau khi biên dịch thay vì phân tích mã nguồn?',
      options: ['Checkstyle', 'Error Prone', 'SpotBugs', 'google-java-format'],
      answer: 2,
      explanation:
        'SpotBugs, hậu duệ của FindBugs, phân tích file class. Error Prone chạy bên trong javac trên mã nguồn, Checkstyle kiểm tra quy ước trên mã nguồn.',
    },
    {
      question: 'Muốn đưa Spotless vào codebase 5 năm tuổi mà không phải format lại toàn bộ ngay, nên dùng cấu hình nào?',
      options: [
        'ratchetFrom origin/main để chỉ áp cho các file thay đổi so với main',
        'Bỏ goal check, chỉ chạy spotless:apply trên máy của từng dev',
        'Đặt skip bằng true trên CI để build không bị fail vì format',
        'Đổi style từ GOOGLE sang AOSP để giảm số dòng bị thay đổi',
      ],
      answer: 0,
      explanation:
        'ratchetFrom chỉ áp formatter cho file đã thay đổi so với ref git, nên codebase sạch dần theo mỗi lần sửa. Bỏ check trên CI thì không có gì đảm bảo mọi người tuân thủ.',
    },
    {
      question: 'Codebase cũ có hàng nghìn code smell trên SonarQube. Cách đặt quality gate hợp lý là gì?',
      options: [
        'Yêu cầu toàn bộ codebase đạt 0 code smell rồi mới bật gate',
        'Áp điều kiện lên new code để không cho phép thêm nợ mới',
        'Tắt quality gate, chỉ xem dashboard Sonar mỗi quý một lần',
        'Giao chỉ tiêu giảm số code smell hằng tháng cho từng dev',
      ],
      answer: 1,
      explanation:
        'Tập trung vào new code (Clean as You Code) cho phép bật gate ngay hôm nay mà chất lượng vẫn tăng dần. Biến số liệu Sonar thành KPI cá nhân dễ dẫn đến né rule thay vì viết code tốt hơn.',
    },
    {
      question: 'Repo có khoảng 40 PR Dependabot mở hàng tháng mà không ai xử lý. Cải thiện nào hợp lý nhất?',
      options: [
        'Tắt hẳn Dependabot vì nó chỉ gây thêm nhiễu cho team',
        'Merge tất cả PR cùng lúc mà không cần chờ CI chạy xong',
        'Chuyển sang tự nâng dependency bằng tay mỗi năm một lần',
        'Gom nhóm, giới hạn số PR, auto-merge bản patch khi test tốt',
      ],
      answer: 3,
      explanation:
        'Gom nhóm và giới hạn số PR làm khối lượng vừa sức, còn auto-merge bản patch khi CI xanh giảm việc thủ công. Nâng dependency hiếm khi chỉ làm mỗi lần nâng khó và rủi ro hơn.',
    },
  ],
};

export default quiz;
