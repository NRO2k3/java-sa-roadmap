import type { LessonFlashcards } from '../types';

const flashcards: LessonFlashcards = {
  'clean-code': [
    {
      front: 'Code smell là gì?',
      back: 'Dấu hiệu bề mặt cho thấy thiết kế có thể có vấn đề: code vẫn chạy đúng nhưng khó sửa, khó test. Smell là gợi ý để xem xét, không phải luật tuyệt đối.',
    },
    {
      front: 'Feature envy là gì và refactor thế nào?',
      back: 'Method dùng dữ liệu của class khác nhiều hơn dữ liệu của chính class chứa nó. Sửa bằng Move Method: đưa hành vi về gần dữ liệu mà nó dùng.',
    },
    {
      front: 'Dấu hiệu nhận ra một god class?',
      back: 'Class hàng nghìn dòng, inject rất nhiều dependency, gánh nhiều nghiệp vụ không liên quan, mọi thay đổi đều chạm vào nó. Sửa bằng Extract Class theo nhóm field và dependency hay đi cùng nhau.',
    },
    {
      front: 'Định nghĩa refactoring?',
      back: 'Thay đổi cấu trúc bên trong của code mà không thay đổi hành vi quan sát được từ bên ngoài. Không có test để kiểm chứng hành vi thì chưa phải refactor an toàn.',
    },
    {
      front: 'Quy trình refactor từng bước nhỏ?',
      back: 'Bắt đầu khi test đang xanh; làm một thay đổi nhỏ; chạy test; xanh thì commit, đỏ thì revert ngay thay vì debug lâu; lặp lại.',
    },
    {
      front: 'Vì sao tách commit refactor khỏi commit thay đổi hành vi?',
      back: 'Reviewer đọc PR refactor thuần chỉ với một câu hỏi là hành vi có đổi không, nên nhanh và an toàn hơn. Khi có lỗi cũng dễ khoanh vùng và revert.',
    },
    {
      front: 'Introduce Parameter Object dùng khi nào?',
      back: 'Khi method nhận nhiều tham số luôn đi cùng nhau, ví dụ street, city, zip. Gom chúng thành một record như ShippingAddress, có thể đặt validation trong compact constructor.',
    },
    {
      front: 'DRY và rule of three nói gì?',
      back: 'DRY là không lặp lại kiến thức nghiệp vụ, không phải câu chữ: hai đoạn giống nhau nhưng đổi vì lý do khác nhau thì nên giữ riêng. Rule of three: lần thứ ba thấy cùng logic mới trừu tượng hoá.',
    },
    {
      front: 'Characterization test là gì?',
      back: 'Test ghi lại hành vi hiện tại của code legacy, kể cả hành vi nghi là sai, làm lưới an toàn khi refactor. Giá trị kỳ vọng lấy từ kết quả thực tế khi chạy code.',
    },
    {
      front: 'Sprout Method khác Wrap Method thế nào?',
      back: 'Sprout: viết logic mới trong method hoặc class mới có test đầy đủ rồi gọi từ code cũ. Wrap: đổi tên method cũ, tạo method mang tên gốc gọi method cũ và thêm hành vi trước hoặc sau.',
    },
    {
      front: 'Strategy pattern trong Spring triển khai gọn thế nào?',
      back: 'Mỗi strategy là một @Component implement cùng interface; service nhận List các bean đó qua constructor và gom thành Map theo khoá. Thêm strategy mới chỉ cần thêm một bean, không sửa service.',
    },
    {
      front: 'Dấu hiệu over-engineering trong ứng dụng Spring?',
      back: 'Cặp interface và Impl cho mọi service chỉ có một implementation, Strategy cho switch hai nhánh hiếm khi đổi, thiết kế cho yêu cầu chưa tồn tại (vi phạm YAGNI).',
    },
  ],
  'code-review': [
    {
      front: 'Tiêu chuẩn approve theo hướng dẫn review của Google?',
      back: 'Approve khi thay đổi chắc chắn làm sức khoẻ tổng thể của codebase tốt lên, kể cả khi nó chưa hoàn hảo.',
    },
    {
      front: 'Năm nhóm trong checklist review?',
      back: 'Ngữ cảnh và nghiệp vụ, thiết kế, test, bảo mật, hiệu năng và vận hành. Đọc theo thứ tự từ quan trọng đến chi tiết.',
    },
    {
      front: 'Nit trong code review là gì?',
      back: 'Viết tắt của nitpick: góp ý nhỏ về tiểu tiết, không chặn merge, tác giả có thể bỏ qua. Quá nhiều nit về format là tín hiệu cần formatter tự động.',
    },
    {
      front: 'Vì sao phải phân biệt nhận xét blocking và nit?',
      back: 'Để tác giả biết nhận xét nào bắt buộc sửa trước khi merge và nhận xét nào chỉ là ý kiến; reviewer góp ý thoải mái mà không chặn PR vô lý.',
    },
    {
      front: 'Lỗi IDOR là gì?',
      back: 'Insecure Direct Object Reference: người dùng truy cập được object của người khác chỉ bằng cách đổi id trên URL, do thiếu kiểm tra quyền trên từng resource.',
    },
    {
      front: 'Nguyên tắc viết nhận xét mang tính xây dựng?',
      back: 'Nói về code chứ không về người, luôn giải thích lý do, đặt câu hỏi khi chưa chắc, khen điều tốt, và chuyển sang nói chuyện trực tiếp khi một thread qua lại quá nhiều lượt.',
    },
    {
      front: 'Những cách chia nhỏ một PR lớn?',
      back: 'Tách refactor khỏi thay đổi hành vi, chia theo lát dọc có feature flag, dùng stacked PR, tách thay đổi cơ học như format hàng loạt hay nâng version thư viện ra PR riêng.',
    },
    {
      front: 'PR template nên có những phần nào?',
      back: 'Vấn đề và link ticket, giải pháp, cách kiểm tra, rủi ro và triển khai (migration, feature flag, rollback), ghi chú cho reviewer nên đọc file nào trước.',
    },
    {
      front: 'Một SLA review mẫu cho team?',
      back: 'Phản hồi đầu tiên trong vòng một ngày làm việc; review ở các điểm chuyển việc tự nhiên thay vì ngắt luồng tập trung; hotfix được review ngay qua kênh riêng.',
    },
    {
      front: 'Việc nào nên để máy làm thay reviewer?',
      back: 'Format, lint, bug pattern, chạy test, coverage, quality gate và kiểm tra dependency có lỗ hổng. Chạy chúng trong CI làm required check để reviewer tập trung vào thiết kế.',
    },
    {
      front: 'Thứ tự đọc một PR hiệu quả?',
      back: 'Đọc mô tả PR, kiểm tra CI đã xanh, đọc test để hiểu hành vi mong đợi, xem thiết kế tổng thể, rồi mới đến chi tiết implementation.',
    },
    {
      front: 'Làm sao để Dev Lead không thành nút thắt review?',
      back: 'Dùng CODEOWNERS phân quyền review theo module, cho phép thành viên khác approve, theo dõi thời gian chờ review của cả team thay vì tự duyệt mọi PR.',
    },
  ],
  'testing-strategy': [
    {
      front: 'Các tầng test cho một service Spring Boot?',
      back: 'Unit test cho domain không cần Spring context; slice test với @WebMvcTest, @DataJpaTest; integration với @SpringBootTest và Testcontainers; contract test giữa service; vài E2E cho luồng chính.',
    },
    {
      front: 'Testing honeycomb là gì?',
      back: 'Hình dạng bộ test do Spotify phổ biến, trong đó integration test chiếm phần lớn. Hợp với microservice mỏng, ít logic, nơi lỗi thật thường nằm ở phần tích hợp.',
    },
    {
      front: '@ServiceConnection làm gì?',
      back: 'Từ Spring Boot 3.1, annotation này tự cấu hình kết nối của ứng dụng tới container Testcontainers, ví dụ PostgreSQL, mà không cần khai báo URL và tài khoản thủ công.',
    },
    {
      front: 'Vì sao @DataJpaTest cần Replace.NONE khi dùng Testcontainers?',
      back: 'Mặc định @AutoConfigureTestDatabase thay DataSource bằng DB nhúng. Replace.NONE giữ DataSource trỏ tới container DB thật.',
    },
    {
      front: 'Contract testing giải quyết vấn đề gì?',
      back: 'Kiểm tra hợp đồng request và response giữa consumer và provider độc lập ở mỗi bên. Tránh được mock lệch khỏi API thật mà không cần dựng cả hệ thống chạy E2E.',
    },
    {
      front: 'Pact khác Spring Cloud Contract về quy trình?',
      back: 'Pact: consumer viết test sinh ra hợp đồng, provider replay để verify. Spring Cloud Contract: hợp đồng thường đặt ở provider, plugin sinh test cho provider và stub WireMock cho consumer.',
    },
    {
      front: 'Provider state trong Pact là gì?',
      back: 'Chuỗi trong given(...) mô tả trạng thái dữ liệu cần có, ví dụ customer 42 exists. Phía provider viết hàm chuẩn bị dữ liệu tương ứng trước khi replay request.',
    },
    {
      front: 'Lệnh can-i-deploy của Pact Broker dùng để làm gì?',
      back: 'Kiểm tra version sắp deploy của một service có tương thích với các version đang chạy trên môi trường đích hay không, trước khi deploy.',
    },
    {
      front: 'Mutant killed và survived nghĩa là gì?',
      back: 'Killed: test đỏ khi code bị sửa nhỏ có chủ đích, tức test bắt được thay đổi. Survived: test vẫn xanh, test chưa đủ chặt ở chỗ đó. Mutation score bằng số killed chia tổng số mutant.',
    },
    {
      front: 'Dùng PIT thế nào cho thực tế?',
      back: 'Giới hạn targetClasses ở package domain quan trọng, chạy định kỳ hoặc chỉ trên code thay đổi (goal scmMutationCoverage), thêm pitest-junit5-plugin cho JUnit 5. Không đặt mục tiêu 100% vì có equivalent mutant.',
    },
    {
      front: 'Quy trình xử lý flaky test cho team?',
      back: 'Phát hiện (ví dụ surefire.rerunFailingTestsCount báo test là flake), cách ly khỏi pipeline chính kèm ticket có người phụ trách và hạn, rồi sửa hoặc xoá và viết lại.',
    },
    {
      front: 'Test Data Builder giúp gì?',
      back: 'Tạo object test với giá trị mặc định hợp lệ, test chỉ ghi đè field nó quan tâm. Khi thêm field bắt buộc mới, chỉ cần sửa builder ở một chỗ.',
    },
  ],
  'git-ci': [
    {
      front: 'Các loại nhánh trong GitFlow?',
      back: 'main chứa code đã release và gắn tag; develop để tích hợp; feature/*; release/* để ổn định trước khi phát hành; hotfix/* sửa gấp từ main. Release và hotfix merge về cả main và develop.',
    },
    {
      front: 'GitHub Flow là gì?',
      back: 'Một nhánh main luôn deploy được; mỗi thay đổi đi qua nhánh ngắn và pull request; review xong và CI xanh thì merge rồi deploy.',
    },
    {
      front: 'Trunk-based: sửa bug của nhánh release thế nào?',
      back: 'Sửa trên trunk trước, rồi cherry-pick sang nhánh release; không sửa trên nhánh release rồi merge ngược về trunk.',
    },
    {
      front: 'Khi nào GitFlow là lựa chọn hợp lý?',
      back: 'Phần mềm có version phát hành rời rạc và phải hỗ trợ nhiều version song song: thư viện, phần mềm on-premise, app mobile phát hành qua cửa hàng ứng dụng.',
    },
    {
      front: 'Tuỳ chọn dismiss stale approvals để làm gì?',
      back: 'Huỷ approval cũ khi có commit mới được đẩy lên PR, tránh tình trạng được approve xong rồi sửa thêm logic mà không ai xem lại.',
    },
    {
      front: 'Merge queue giải quyết vấn đề gì?',
      back: 'Đảm bảo CI chạy trên code đã kết hợp với main mới nhất trước khi merge, mà không bắt mọi người rebase liên tục ở repo đông người.',
    },
    {
      front: 'Quy tắc ưu tiên trong file CODEOWNERS?',
      back: 'Pattern khớp cuối cùng được ưu tiên, nên đặt quy tắc chung ở trên và cụ thể ở dưới. Owner cần quyền write; nên dùng team thay cho cá nhân.',
    },
    {
      front: 'Cấu trúc một commit theo Conventional Commits?',
      back: 'type(scope tuỳ chọn): mô tả ngắn, tiếp theo là body và footer tuỳ chọn. feat là tính năng, fix là sửa lỗi; dấu ! hoặc footer BREAKING CHANGE đánh dấu thay đổi phá vỡ.',
    },
    {
      front: 'SemVer: khi nào tăng MAJOR, MINOR, PATCH?',
      back: 'MAJOR khi có thay đổi không tương thích ngược; MINOR khi thêm tính năng tương thích; PATCH khi sửa lỗi tương thích. Version 0.y.z là giai đoạn đầu, API có thể đổi bất kỳ lúc nào.',
    },
    {
      front: 'sonar.qualitygate.wait=true có tác dụng gì?',
      back: 'Bước phân tích SonarQube chờ kết quả quality gate và fail nếu gate đỏ, nhờ đó job CI có thể đặt làm required check để chặn merge.',
    },
    {
      front: 'Vì sao checkout cần fetch-depth: 0 khi chạy SonarQube?',
      back: 'Sonar cần lịch sử git để xác định new code và thông tin blame, trong khi actions/checkout mặc định chỉ lấy commit mới nhất.',
    },
    {
      front: 'Nguyên tắc build artifact trong pipeline CI/CD?',
      back: 'Build JAR hoặc Docker image một lần, rồi dùng lại đúng artifact đó cho mọi môi trường thay vì build lại ở từng nơi.',
    },
  ],
  'static-analysis': [
    {
      front: 'Spotless khác google-java-format thế nào?',
      back: 'google-java-format là formatter theo Google Java Style. Spotless là plugin Maven/Gradle chạy formatter đó: spotless:apply để tự format, spotless:check gắn vào build để CI fail nếu còn file chưa format.',
    },
    {
      front: 'ratchetFrom trong Spotless dùng để làm gì?',
      back: 'Chỉ áp formatter cho file đã thay đổi so với một ref git như origin/main. Giúp đưa formatter vào codebase cũ mà codebase sạch dần theo mỗi lần sửa.',
    },
    {
      front: 'File .git-blame-ignore-revs dùng khi nào?',
      back: 'Sau khi format toàn bộ codebase trong một commit riêng: ghi hash commit đó vào file và cấu hình blame.ignoreRevsFile, để git blame bỏ qua commit format và vẫn hiện tác giả gốc.',
    },
    {
      front: 'Error Prone chạy ở đâu và mạnh ở điểm nào?',
      back: 'Là plugin của javac, phân tích mã nguồn ngay lúc compile nên lỗi hiện như lỗi biên dịch. Các check mức ERROR rất ít báo nhầm, có thể bật làm lỗi build.',
    },
    {
      front: 'Ba lỗi tiêu biểu Error Prone bắt được?',
      back: 'DeadException: tạo exception mà quên throw. CollectionIncompatibleType: gọi contains với kiểu không khớp nên luôn false. ReturnValueIgnored: bỏ kết quả của method như String.trim().',
    },
    {
      front: 'SpotBugs phân tích gì, bắt loại lỗi nào?',
      back: 'Phân tích bytecode sau biên dịch; bắt null dereference, tài nguyên không đóng, lỗi đồng thời, so sánh chuỗi bằng ==. Thêm plugin FindSecBugs để bắt lỗi bảo mật.',
    },
    {
      front: 'Đã có formatter thì nên giữ rule Checkstyle nào?',
      back: 'Tắt các rule về format như thụt lề, khoảng trắng, độ dài dòng để tránh mâu thuẫn. Giữ quy ước đặt tên, độ phức tạp, cấm import dấu sao và các cấu trúc bị cấm.',
    },
    {
      front: 'Quy tắc fail build hoặc tắt hẳn là gì?',
      back: 'Mỗi rule phân tích tĩnh hoặc làm build fail, hoặc bị tắt. Cảnh báo không ai bắt buộc sửa sẽ chỉ tích tụ và bị phớt lờ.',
    },
    {
      front: 'Clean as You Code trong SonarQube?',
      back: 'Quality gate áp điều kiện lên new code thay vì toàn bộ codebase. Nhờ vậy bật gate được ngay với codebase cũ, và chất lượng tăng dần qua mỗi lần chỉnh sửa.',
    },
    {
      front: 'Security hotspot khác vulnerability thế nào?',
      back: 'Hotspot là đoạn code nhạy cảm về bảo mật cần con người xem xét, chưa chắc là lỗi, ví dụ cấu hình CORS. Vulnerability là lỗ hổng mà rule đã xác định.',
    },
    {
      front: 'Dependabot khác Renovate thế nào?',
      back: 'Dependabot tích hợp sẵn trong GitHub. Renovate chạy được trên GitHub, GitLab, Bitbucket, linh hoạt hơn về gom nhóm, lịch chạy, auto-merge và có dependency dashboard.',
    },
    {
      front: 'Khi nào auto-merge cập nhật dependency là an toàn?',
      back: 'Khi bộ test đủ tin cậy. Thường chỉ auto-merge bản patch khi CI xanh; bản major xử lý thủ công có kế hoạch. Với Spring Boot, ưu tiên nâng BOM thay vì ghi đè version lẻ.',
    },
  ],
};

export default flashcards;
