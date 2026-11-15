import type { LessonQuiz } from '../types';

const quiz: LessonQuiz = {
  containers: [
    {
      question:
        'Deployment cấu hình livenessProbe gọi /actuator/health, endpoint này có kiểm tra cả kết nối database. Khi database gặp sự cố 5 phút, điều gì nhiều khả năng xảy ra?',
      options: [
        'Các Pod bị gỡ khỏi Service nhưng vẫn giữ nguyên, chờ database hồi phục',
        'HPA tự tăng số replica để bù cho các Pod đang lỗi',
        'Kubernetes restart liên tục mọi Pod, gây restart storm mà không giải quyết được gì',
        'Không có gì xảy ra vì liveness probe chỉ chạy một lần lúc khởi động',
      ],
      answer: 2,
      explanation:
        'Liveness thất bại thì Kubernetes restart container; vì mọi Pod cùng phụ thuộc DB nên tất cả bị restart liên tục. Liveness chỉ nên phản ánh trạng thái nội tại của process, ví dụ /actuator/health/liveness.',
    },
    {
      question: 'Khi readinessProbe của một Pod thất bại liên tiếp, Kubernetes sẽ làm gì?',
      options: [
        'Gỡ Pod khỏi danh sách endpoint của Service để Pod không nhận traffic, không restart',
        'Restart container ngay lập tức để đưa Pod về trạng thái sạch',
        'Xoá Pod và tạo Pod mới trên một node khác',
        'Đánh dấu Deployment thất bại và tự rollback về ReplicaSet trước',
      ],
      answer: 0,
      explanation:
        'Readiness quyết định Pod có nhận traffic hay không; restart là hành vi của liveness probe. Nhờ vậy Pod tạm quá tải hoặc đang khởi động không nhận request nhưng cũng không bị giết.',
    },
    {
      question: 'Lợi ích chính của việc dùng layered jar khi build image cho ứng dụng Spring Boot là gì?',
      options: [
        'Giảm thời gian khởi động JVM nhờ biên dịch trước sang mã máy',
        'Mã hoá thư viện trong image để tránh bị dịch ngược',
        'Cho phép chạy ứng dụng mà không cần cài JRE trong image',
        'Tách thư viện ít thay đổi khỏi code ứng dụng để Docker cache layer, build và pull nhanh hơn',
      ],
      answer: 3,
      explanation:
        'Layered jar chia nội dung thành dependencies, spring-boot-loader, snapshot-dependencies và application. Khi chỉ code đổi, chỉ layer application nhỏ phải build lại và tải về; biên dịch sang mã máy là việc của GraalVM native image.',
    },
    {
      question:
        'Pod của service Java liên tục có trạng thái OOMKilled với exit code 137, nhưng log ứng dụng không hề có java.lang.OutOfMemoryError. Nguyên nhân hợp lý nhất là gì?',
      options: [
        'Heap đầy nhưng JVM nuốt mất lỗi OutOfMemoryError',
        'Tổng bộ nhớ của process (heap cộng metaspace, thread stack, direct buffer...) vượt memory limit nên kernel giết process',
        'Readiness probe thất bại quá nhiều lần nên Kubernetes giết container',
        'Node hết dung lượng đĩa nên Kubernetes buộc phải dừng container',
      ],
      answer: 1,
      explanation:
        'Exit code 137 là SIGKILL từ kernel khi container vượt memory limit, khác với OutOfMemoryError do JVM ném khi heap đầy. Cách sửa là giảm MaxRAMPercentage để chừa phần ngoài heap hoặc tăng limit dựa trên số liệu đo.',
    },
    {
      question:
        'Container có resources.requests.cpu: 500m và HPA cấu hình target type: Utilization, averageUtilization: 70. HPA sẽ có xu hướng thêm replica khi nào?',
      options: [
        'Khi CPU trung bình mỗi Pod vượt khoảng 70% của CPU limit',
        'Khi CPU trung bình mỗi Pod vượt khoảng 350m',
        'Khi tổng CPU của cả Deployment vượt 70% CPU của node',
        'Khi bất kỳ một Pod nào dùng quá 500m CPU',
      ],
      answer: 1,
      explanation:
        'Utilization trong HPA tính theo phần trăm của CPU request, không phải limit: 70% của 500m là 350m trung bình mỗi Pod. Vì vậy thiếu requests thì HPA không tính được utilization.',
    },
  ],
  cicd: [
    {
      question:
        'Pipeline của team chạy mvn package và docker build riêng cho staging, rồi chạy lại đúng các bước đó khi release production. Vấn đề chính của cách làm này là gì?',
      options: [
        'Thứ được test ở staging không chắc chắn là thứ được chạy ở production',
        'Image production sẽ luôn lớn hơn image staging',
        'GitHub Actions không cho phép build cùng một image hai lần',
        'Production bắt buộc phải dùng base image khác với staging',
      ],
      answer: 0,
      explanation:
        'Nguyên tắc build một lần, deploy nhiều nơi: image được build và gắn tag commit SHA đúng một lần, các môi trường chỉ khác cấu hình. Build lại có thể kéo dependency hoặc base image khác mà không ai hay biết.',
    },
    {
      question:
        'Team bạn bật SonarQube cho một codebase legacy lớn, quality gate áp lên toàn bộ code nên pipeline đỏ liên tục và mọi người bắt đầu tìm cách bỏ qua. Bạn nên điều chỉnh thế nào?',
      options: [
        'Tắt quality gate, chỉ giữ báo cáo để tham khảo',
        'Hạ ngưỡng coverage toàn dự án xuống 0% để pipeline xanh',
        'Bắt cả team dừng làm tính năng cho tới khi sửa hết mọi vấn đề cũ',
        'Áp quality gate lên new code, để code thay đổi phải đạt chuẩn và legacy được cải thiện dần',
      ],
      answer: 3,
      explanation:
        'Gate trên new code giữ được tác dụng chặn mà không bị kẹt bởi nợ kỹ thuật cũ. Tắt gate biến nó thành báo cáo không ai đọc, còn dừng toàn bộ tính năng thường không khả thi.',
    },
    {
      question:
        'Deployment có replicas: 4 và strategy RollingUpdate với maxSurge: 1, maxUnavailable: 0. Trong lúc rollout, điều nào đúng?',
      options: [
        'Kubernetes xoá cả 4 Pod cũ rồi mới tạo 4 Pod mới',
        'Có tối đa 5 Pod cùng lúc và số Pod sẵn sàng không bao giờ thấp hơn 4',
        'Có thể chỉ còn 3 Pod sẵn sàng trong lúc thay thế',
        'Chỉ 1 Pod mới được tạo, 3 Pod còn lại giữ phiên bản cũ',
      ],
      answer: 1,
      explanation:
        'maxSurge: 1 cho phép tạo thêm tối đa 1 Pod vượt số replica, maxUnavailable: 0 cấm giảm dưới 4 Pod sẵn sàng. Pod cũ chỉ bị gỡ khi Pod mới đã qua readiness.',
    },
    {
      question:
        'Bản phát hành mới cần đổi tên cột customer_name thành full_name và team dùng blue-green để rollback nhanh. Cách triển khai an toàn là gì?',
      options: [
        'Chạy migration đổi tên cột ngay khi deploy green, nếu lỗi thì chuyển về blue',
        'Tạo database riêng cho green rồi đồng bộ dữ liệu bằng tay sau khi chuyển traffic',
        'Theo expand/contract: thêm cột mới và ghi cả hai, khi không còn bản cũ chạy mới xoá cột cũ',
        'Bỏ blue-green, dừng hệ thống trong giờ thấp điểm để đổi tên cột',
      ],
      answer: 2,
      explanation:
        'Blue và green dùng chung database nên schema phải tương thích với cả hai phiên bản. Đổi tên cột trực tiếp làm blue hỏng, khiến rollback mất ý nghĩa.',
    },
    {
      question:
        'Argo CD Application có syncPolicy.automated với prune: true và selfHeal: true. Một kỹ sư chạy kubectl scale để tăng replica bằng tay trên cluster. Điều gì sẽ xảy ra?',
      options: [
        'Argo CD ghi thay đổi ngược lại vào Git để lưu số replica mới',
        'Argo CD xoá Deployment vì nó không còn khớp với Git',
        'Không có gì xảy ra vì Argo CD chỉ đồng bộ khi có commit mới',
        'Argo CD phát hiện drift và đưa số replica về đúng giá trị khai báo trong Git',
      ],
      answer: 3,
      explanation:
        'selfHeal khiến Argo CD liên tục đối chiếu và sửa lại mọi thay đổi lệch khỏi Git, vì Git là nguồn sự thật. prune chỉ xoá tài nguyên đã bị bỏ khỏi Git, không xoá tài nguyên đang được khai báo.',
    },
  ],
  iac: [
    {
      question:
        'Hai kỹ sư cùng chạy terraform apply cho cùng môi trường, state lưu ở file local trên máy mỗi người. Giải pháp đúng là gì?',
      options: [
        'Commit file terraform.tfstate vào Git để mọi người dùng chung',
        'Quy định chỉ một người được chạy Terraform trong team',
        'Dùng remote backend có locking, mã hoá và versioning cho state',
        'Chạy terraform refresh trước mỗi lần apply để đồng bộ state',
      ],
      answer: 2,
      explanation:
        'Remote backend có locking bảo đảm chỉ một tiến trình ghi state tại một thời điểm và không phụ thuộc máy cá nhân. Commit state vào Git vừa không có khoá vừa làm lộ giá trị nhạy cảm vì state không được mã hoá.',
    },
    {
      question:
        'Kết quả terraform plan có dòng: -/+ resource "aws_db_instance" "this" (forces replacement). Bạn nên hiểu thế nào?',
      options: [
        'Terraform sẽ xoá database hiện tại và tạo database mới, cần dừng lại kiểm tra trước khi apply',
        'Terraform chỉ cập nhật một thuộc tính của database tại chỗ, không ảnh hưởng dữ liệu',
        'Terraform sẽ tạo thêm một bản sao database và giữ nguyên bản cũ',
        'Database đã bị xoá bên ngoài Terraform và sẽ được tạo lại',
      ],
      answer: 0,
      explanation:
        'Ký hiệu -/+ nghĩa là xoá rồi tạo lại, với database đồng nghĩa nguy cơ mất dữ liệu. Sửa tại chỗ được ký hiệu bằng ~; nên bật deletion_protection và prevent_destroy cho tài nguyên quan trọng.',
    },
    {
      question:
        'Dev, staging và prod có yêu cầu phân quyền và cách ly khác nhau. Cách tổ chức Terraform nào an toàn nhất?',
      options: [
        'Một thư mục duy nhất, dùng CLI workspace dev/staging/prod trên cùng backend',
        'Một thư mục duy nhất, đổi file tfvars bằng tay trước mỗi lần apply',
        'Mỗi môi trường có thư mục gốc, backend và credential riêng, cùng gọi module dùng chung theo version',
        'Mỗi môi trường copy toàn bộ code module vào thư mục riêng để sửa độc lập',
      ],
      answer: 2,
      explanation:
        'Thư mục và backend riêng, tốt nhất là account riêng, giúp không thể apply nhầm sang prod và giữ cấu trúc giống nhau qua module chung. Workspace dùng chung backend và credential nên dễ nhầm; copy module làm các môi trường trôi dần khỏi nhau.',
    },
    {
      question:
        'Bạn muốn chuyển resource aws_s3_bucket.logs vào bên trong module storage mà không để Terraform xoá và tạo lại bucket. Nên dùng gì?',
      options: [
        'Khối lifecycle với ignore_changes = all',
        'Khối moved khai báo địa chỉ cũ và địa chỉ mới của resource',
        'Xoá bucket khỏi code rồi chạy apply hai lần',
        'Sửa trực tiếp file state bằng trình soạn thảo',
      ],
      answer: 1,
      explanation:
        'Khối moved cho Terraform biết resource chỉ đổi địa chỉ trong code nên state được cập nhật mà không đụng tài nguyên thật. Sửa state bằng tay dễ làm hỏng state; ignore_changes không liên quan đến việc đổi địa chỉ.',
    },
    {
      question:
        'Tổ chức chỉ dùng Azure, muốn cú pháp gọn, hỗ trợ sớm dịch vụ Azure mới và không muốn tự quản lý file state. Công cụ IaC phù hợp nhất là gì?',
      options: [
        'Terraform với backend azurerm',
        'Pulumi với backend tự quản trên Blob Storage',
        'AWS CloudFormation',
        'Bicep',
      ],
      answer: 3,
      explanation:
        'Bicep là DSL gốc của Azure, biên dịch sang ARM template và đối chiếu trực tiếp với Azure nên không có file state. Terraform và Pulumi vẫn cần quản lý state, còn CloudFormation chỉ dành cho AWS.',
    },
  ],
  'cloud-platforms': [
    {
      question:
        'Security group của database cho phép inbound cổng 5432 từ security group của ứng dụng, không có rule outbound đặc biệt. Vì sao ứng dụng vẫn nhận được phản hồi từ database?',
      options: [
        'Vì database luôn nằm trong public subnet',
        'Vì network ACL mặc định tự mở mọi cổng',
        'Vì security group có trạng thái (stateful): kết nối được phép đi vào thì chiều phản hồi tự được phép',
        'Vì cloud tự thêm rule outbound khi phát hiện kết nối database',
      ],
      answer: 2,
      explanation:
        'Security group là stateful nên lưu lượng phản hồi của kết nối đã được cho phép không cần rule riêng. Network ACL thì stateless, phải khai báo cả hai chiều.',
    },
    {
      question:
        'IAM policy chỉ có một statement: Effect Allow, Action s3:GetObject, Resource arn:aws:s3:::acme-invoices-prod/orders/*. Service dùng policy này làm được việc nào?',
      options: [
        'Liệt kê tất cả object trong bucket acme-invoices-prod',
        'Đọc object orders/2024/inv-001.pdf trong bucket acme-invoices-prod',
        'Ghi object mới vào prefix orders/',
        'Đọc object reports/summary.csv trong cùng bucket',
      ],
      answer: 1,
      explanation:
        'Policy chỉ cho phép GetObject trên các object có key bắt đầu bằng orders/. Liệt kê cần s3:ListBucket trên chính bucket, ghi cần s3:PutObject, còn prefix reports/ nằm ngoài phạm vi.',
    },
    {
      question:
        'Well-Architected Review cho thấy hệ thống chỉ chạy ở một region; thêm region dự phòng sẽ tăng đáng kể chi phí. Cách xử lý đúng tinh thần framework là gì?',
      options: [
        'Luôn chọn Reliability vì đây là trụ cột quan trọng nhất',
        'Luôn chọn Cost Optimization vì chi phí dễ đo nhất',
        'Bỏ qua phát hiện này vì multi-region không nằm trong 6 trụ cột',
        'Ghi rõ rủi ro và đánh đổi, đối chiếu với RPO/RTO nghiệp vụ để chủ sản phẩm quyết định có ý thức',
      ],
      answer: 3,
      explanation:
        'Các trụ cột thường đánh đổi lẫn nhau và không có trụ cột luôn thắng. Giá trị của review là làm rõ rủi ro để người chịu trách nhiệm nghiệp vụ chấp nhận hoặc đầu tư một cách có ý thức.',
    },
    {
      question:
        'Hệ thống đặt hàng yêu cầu RPO vài phút và RTO dưới 30 phút khi mất cả region, ngân sách vừa phải, không cần phục vụ đồng thời ở hai region. Chiến lược DR phù hợp nhất là gì?',
      options: [
        'Warm Standby: nhân bản dữ liệu liên tục, chạy sẵn bản thu nhỏ ở region dự phòng rồi scale lên khi failover',
        'Backup & Restore: sao lưu hằng ngày sang region khác, dựng lại hạ tầng khi có sự cố',
        'Multi-site active/active: cả hai region cùng nhận traffic ghi',
        'Chạy multi-AZ trong một region là đủ cho yêu cầu này',
      ],
      answer: 0,
      explanation:
        'Warm Standby cho RPO/RTO cỡ phút với chi phí trung bình. Backup hằng ngày không đạt RPO vài phút, active/active tốn kém và phức tạp hơn mức cần, còn multi-AZ không bảo vệ khi mất cả region.',
    },
    {
      question:
        'Công ty định mua savings plan 3 năm cho toàn bộ cụm máy hiện tại, trong khi CPU trung bình của cụm chỉ khoảng 15%. Bạn nên khuyên gì?',
      options: [
        'Mua ngay để khoá giá trước khi giá tăng',
        'Chuyển toàn bộ cụm, kể cả database, sang spot instance',
        'Right-size dựa trên số liệu sử dụng trước, sau đó mới cam kết cho phần tải nền ổn định',
        'Giữ nguyên on-demand vì cam kết dài hạn luôn rủi ro',
      ],
      answer: 2,
      explanation:
        'Cam kết dài hạn cho tài nguyên quá khổ là khoá chặt lãng phí. Right-size trước rồi cam kết cho phần nền; spot không phù hợp với database và workload có trạng thái.',
    },
  ],
  'cloud-native-java': [
    {
      question:
        'Ứng dụng Spring Boot build native image thành công nhưng lúc chạy lỗi ClassNotFoundException ở đoạn code tạo object bằng Class.forName. Nguyên nhân và cách sửa là gì?',
      options: [
        'GraalVM không hỗ trợ Java 21, cần hạ xuống Java 17',
        'Thiếu bộ nhớ khi build, cần tăng RAM cho máy build',
        'Theo giả định thế giới đóng, class dùng qua reflection phải được khai báo, ví dụ bằng RuntimeHintsRegistrar',
        'Native image không hỗ trợ class tự viết, phải chuyển sang thư viện chuẩn',
      ],
      answer: 2,
      explanation:
        'Native image chỉ giữ lại code được phân tích là có thể tiếp cận lúc build, nên reflection động cần reachability metadata. Spring cho phép đăng ký qua RuntimeHints, hoặc thu thập bằng tracing agent.',
    },
    {
      question:
        'Team build native image cho service Spring Boot rồi khi chạy đặt SPRING_PROFILES_ACTIVE=prod, mong một bean khai báo @Profile("prod") được tạo thay cho bean mặc định. Điều gì xảy ra?',
      options: [
        'Bean prod được tạo bình thường như khi chạy trên JVM',
        'Ứng dụng không khởi động được vì native image không đọc biến môi trường',
        'Spring tự build lại image với profile mới khi khởi động',
        'Cấu trúc bean đã cố định lúc build nên profile đặt lúc chạy không thay đổi được bean nào được tạo',
      ],
      answer: 3,
      explanation:
        'Spring AOT đánh giá @Profile và @ConditionalOnProperty khi build, nên tập bean không đổi lúc chạy. Các giá trị cấu hình thông thường như URL, timeout vẫn được đọc lúc chạy.',
    },
    {
      question:
        'Tổ chức có khoảng 40 service Spring Boot và thư viện nội bộ dựa trên Spring. Một service mới chạy liên tục với tải ổn định. Lựa chọn framework hợp lý nhất là gì?',
      options: [
        'Tiếp tục Spring Boot trên JVM, chỉ cân nhắc native hoặc framework khác khi có ràng buộc rõ về startup hay bộ nhớ',
        'Viết bằng Quarkus vì benchmark cho thấy khởi động nhanh hơn',
        'Viết bằng Micronaut rồi dần chuyển cả 40 service sang Micronaut',
        'Bắt buộc build native image vì native luôn có throughput cao hơn',
      ],
      answer: 0,
      explanation:
        'Với tải ổn định chạy lâu, JIT cho hiệu năng đỉnh tốt và lợi thế startup ít giá trị, trong khi chi phí chuyển đổi và đào tạo là thật. Native image không luôn có throughput cao hơn JIT.',
    },
    {
      question:
        'Template SAM của một Lambda Java có SnapStart: ApplyOn: PublishedVersions, nhưng client đang gọi function qua $LATEST. Hiệu quả của SnapStart thế nào?',
      options: [
        'SnapStart áp dụng cho mọi cách gọi, kể cả $LATEST',
        'SnapStart chỉ áp dụng sau khi bật thêm provisioned concurrency',
        'Không có tác dụng vì SnapStart chỉ áp dụng cho version đã publish, nên gọi qua version hoặc alias',
        'Lambda từ chối mọi lời gọi tới $LATEST khi bật SnapStart',
      ],
      answer: 2,
      explanation:
        'Snapshot được tạo khi publish version, nên chỉ lời gọi tới version đó hoặc alias trỏ tới nó mới được khôi phục từ snapshot. Thực tế thường dùng AutoPublishAlias và gọi qua alias.',
    },
    {
      question:
        'Service lưu thông tin đăng nhập trong HttpSession ở bộ nhớ. Sau khi scale lên 3 replica, người dùng bị đăng xuất ngẫu nhiên. Nguyên tắc 12-Factor nào bị vi phạm và cách sửa là gì?',
      options: [
        'Config: cần chuyển cấu hình session ra biến môi trường',
        'Processes: process phải không trạng thái, chuyển session ra store ngoài như Redis với Spring Session',
        'Port binding: mỗi replica cần lắng nghe một cổng khác nhau',
        'Logs: cần ghi log session ra stdout để các replica đọc chung',
      ],
      answer: 1,
      explanation:
        'Nguyên tắc Processes yêu cầu process không trạng thái, không chia sẻ gì; dữ liệu cần giữ phải ở backing service. Khi request rơi vào replica khác, session trong bộ nhớ của replica cũ không còn.',
    },
  ],
};

export default quiz;
