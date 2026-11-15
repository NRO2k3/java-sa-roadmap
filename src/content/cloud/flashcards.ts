import type { LessonFlashcards } from '../types';

const flashcards: LessonFlashcards = {
  containers: [
    {
      front: 'Multi-stage build trong Dockerfile giải quyết vấn đề gì?',
      back: 'Tách stage build (image JDK, Maven) khỏi stage runtime (chỉ JRE và kết quả build). Image cuối nhỏ hơn, không chứa compiler, source hay Maven cache, nên pull nhanh hơn và bề mặt tấn công nhỏ hơn.',
    },
    {
      front: 'Bốn layer của Spring Boot layered jar là gì?',
      back: 'dependencies, spring-boot-loader, snapshot-dependencies và application. Layer application đổi thường xuyên nhất nên được copy sau cùng để Docker tận dụng cache các layer phía trước.',
    },
    {
      front: 'Lệnh giải nén layered jar từ Spring Boot 3.3?',
      back: 'java -Djarmode=tools -jar app.jar extract --layers --destination extracted. Các bản Spring Boot cũ hơn dùng -Djarmode=layertools.',
    },
    {
      front: 'Jib khác Buildpacks thế nào?',
      back: 'Jib là plugin Maven/Gradle build image trực tiếp, tự chia layer và không cần Docker daemon. Buildpacks (mvn spring-boot:build-image, Paketo) tự phát hiện ứng dụng và tạo image chuẩn hoá nhưng cần Docker daemon và khó tuỳ biến hơn.',
    },
    {
      front: 'OOMKilled (exit code 137) khác java.lang.OutOfMemoryError thế nào?',
      back: 'OOMKilled là kernel giết process vì tổng bộ nhớ (heap cộng metaspace, thread stack, direct buffer...) vượt memory limit của container. OutOfMemoryError là JVM tự ném khi heap đầy.',
    },
    {
      front: 'Vì sao dùng MaxRAMPercentage thay cho -Xmx cố định trong container?',
      back: 'MaxRAMPercentage tính heap theo memory limit của container, đổi limit không phải sửa cờ JVM. Đặt khoảng 60 đến 75% để chừa bộ nhớ ngoài heap; mặc định JVM chỉ dùng 25%.',
    },
    {
      front: 'JVM chọn GC nào khi container có dưới 2 CPU hoặc dưới khoảng 2GB RAM?',
      back: 'Serial GC, vì JVM không coi đó là server-class machine. Nếu cần G1 hãy chỉ định -XX:+UseG1GC, hoặc dùng -XX:ActiveProcessorCount để ghi đè số CPU JVM nhìn thấy.',
    },
    {
      front: 'Startup, liveness và readiness probe khác nhau thế nào?',
      back: 'Startup: chờ ứng dụng khởi động xong, trong lúc đó chưa chạy hai probe kia. Liveness thất bại thì restart container. Readiness thất bại thì gỡ Pod khỏi Service, không restart.',
    },
    {
      front: 'Vì sao liveness probe không nên kiểm tra database?',
      back: 'Khi database sự cố, mọi Pod cùng thất bại liveness và bị restart liên tục (restart storm) mà không giải quyết được gì. Liveness chỉ phản ánh trạng thái nội tại của process.',
    },
    {
      front: 'Secret trong Kubernetes có được mã hoá mặc định không?',
      back: 'Không, mặc định chỉ được mã hoá base64. Cần bật encryption at rest, giới hạn RBAC và thường dùng External Secrets Operator, Sealed Secrets hoặc Vault.',
    },
    {
      front: 'HPA averageUtilization tính theo giá trị nào?',
      back: 'Theo phần trăm CPU request của container, không phải limit. Không đặt requests thì HPA không tính được utilization; cần metrics-server trong cluster.',
    },
    {
      front: 'Vì sao Helm template nên bỏ replicas khi bật HPA?',
      back: 'Nếu template đặt cứng replicas, mỗi lần helm upgrade sẽ reset số replica mà HPA đã tính. Template do helm create sinh ra chỉ đặt replicas khi autoscaling tắt.',
    },
  ],
  cicd: [
    {
      front: 'Continuous Delivery khác Continuous Deployment thế nào?',
      back: 'Continuous Delivery giữ mọi commit qua pipeline ở trạng thái release được, lên production có thể còn bước duyệt. Continuous Deployment bỏ bước duyệt: commit qua pipeline tự lên production.',
    },
    {
      front: 'Nguyên tắc build một lần, deploy nhiều nơi là gì?',
      back: 'Image được build và gắn tag commit SHA đúng một lần, rồi promote cùng image đó qua staging và production; các môi trường chỉ khác cấu hình. Nhờ vậy thứ được test chính là thứ được release.',
    },
    {
      front: 'Trong GitHub Actions, workflow, job, step và action là gì?',
      back: 'Workflow là file YAML trong .github/workflows được kích hoạt bởi event. Workflow gồm các job chạy trên runner, job gồm các step; step là lệnh shell hoặc một action tái sử dụng.',
    },
    {
      front: 'Vì sao nên áp quality gate SonarQube lên new code?',
      back: 'Để code thay đổi phải đạt chuẩn mà dự án legacy không bị pipeline đỏ vĩnh viễn. Tham số sonar.qualitygate.wait=true khiến bước phân tích chờ và làm pipeline thất bại nếu gate không đạt.',
    },
    {
      front: 'SCA và quét image khác nhau thế nào?',
      back: 'SCA (OWASP Dependency-Check, Snyk, Dependabot) đối chiếu thư viện Maven với CVE. Quét image (Trivy, Grype) còn tìm lỗ hổng trong gói hệ điều hành của base image, thứ SCA không thấy.',
    },
    {
      front: 'maxSurge và maxUnavailable trong RollingUpdate nghĩa là gì?',
      back: 'maxSurge là số Pod được tạo thêm vượt số replica trong lúc rollout. maxUnavailable là số Pod được phép thiếu so với replica; đặt 0 để không bao giờ giảm dưới số replica mong muốn.',
    },
    {
      front: 'Ưu và nhược điểm của blue-green deployment?',
      back: 'Ưu: chuyển traffic một lần, rollback gần như tức thì bằng cách chuyển về blue. Nhược: tốn gấp đôi tài nguyên lúc chuyển và database dùng chung phải tương thích với cả hai phiên bản.',
    },
    {
      front: 'Điều gì làm canary thực sự an toàn chứ không chỉ là deploy chậm?',
      back: 'Có metric và tiêu chí dừng định nghĩa trước (error rate, latency), tốt nhất là phân tích tự động như AnalysisTemplate của Argo Rollouts để tự rollback khi vượt ngưỡng.',
    },
    {
      front: 'Expand/contract khi thay đổi schema database là gì?',
      back: 'Bản phát hành đầu chỉ thêm cột hoặc bảng mới và ghi cả hai nơi; khi không còn phiên bản cũ chạy, bản sau mới xoá cột cũ. Cách này cần thiết cho mọi chiến lược có hai phiên bản cùng chạy.',
    },
    {
      front: 'Bốn nguyên tắc GitOps theo OpenGitOps?',
      back: 'Trạng thái được khai báo; được lưu có phiên bản và bất biến; được agent kéo về tự động; và được đối chiếu liên tục với trạng thái thật của hệ thống.',
    },
    {
      front: 'Lợi ích của mô hình pull (GitOps) so với CI push vào cluster?',
      back: 'CI không cần giữ credential vào cluster vì agent chạy bên trong cluster kéo cấu hình về. Ngoài ra còn phát hiện được drift, và audit hay rollback chỉ cần git log, git revert.',
    },
    {
      front: 'prune và selfHeal trong Argo CD syncPolicy làm gì?',
      back: 'prune xoá tài nguyên trên cluster đã bị bỏ khỏi Git. selfHeal tự đưa tài nguyên về đúng trạng thái trong Git khi có người sửa tay trên cluster.',
    },
  ],
  iac: [
    {
      front: 'Declarative và imperative IaC khác nhau thế nào?',
      back: 'Declarative mô tả trạng thái mong muốn, công cụ tự tính các bước cần làm. Imperative là script ra lệnh từng bước, dễ tạo trùng lặp nếu chạy lại.',
    },
    {
      front: 'Drift trong IaC là gì?',
      back: 'Là sự lệch giữa trạng thái thật của hạ tầng và trạng thái khai báo trong code, thường do ai đó sửa tay trên console. Phát hiện bằng cách chạy plan định kỳ.',
    },
    {
      front: 'Ký hiệu +, ~ và -/+ trong terraform plan nghĩa là gì?',
      back: '+ là tạo mới, ~ là sửa tại chỗ, -/+ là xoá rồi tạo lại (forces replacement). Với database, -/+ đồng nghĩa nguy cơ mất dữ liệu nên phải dừng lại kiểm tra.',
    },
    {
      front: 'Một Terraform module tốt nên có đặc điểm gì?',
      back: 'Đóng gói một khái niệm có ý nghĩa, ít biến bắt buộc, có validation, mặc định an toàn (mã hoá, backup), đầu ra đủ dùng, không chứa provider và backend, được phát hành theo version.',
    },
    {
      front: 'Khối moved và khối import dùng khi nào?',
      back: 'moved dùng khi đổi tên resource hoặc chuyển vào module, để Terraform cập nhật state thay vì xoá và tạo lại. import đưa tài nguyên đã tạo bằng tay vào sự quản lý của Terraform.',
    },
    {
      front: 'Vì sao không để Terraform state trên máy local hoặc trong Git?',
      back: 'Không có khoá nên hai người apply sẽ ghi đè nhau, mất máy là mất state, và state chứa giá trị nhạy cảm không được mã hoá. Dùng remote backend có locking, mã hoá, versioning.',
    },
    {
      front: 'Khoá state trên S3 backend ở Terraform mới cấu hình thế nào?',
      back: 'Từ Terraform 1.10 dùng use_lockfile = true để khoá bằng file lock trên S3. Cấu hình cũ hơn dùng một bảng DynamoDB để khoá.',
    },
    {
      front: 'Vì sao nên chia nhỏ Terraform state?',
      back: 'Chia theo môi trường và theo lớp (mạng, cluster, database, ứng dụng) giúp plan nhanh hơn và thu hẹp blast radius khi có lỗi.',
    },
    {
      front: 'Vì sao CLI workspace không phù hợp để tách prod khỏi dev?',
      back: 'Mọi workspace dùng chung backend và credential nên rất dễ apply nhầm vào prod. Môi trường cần cách ly nên có thư mục, backend và tốt nhất là account riêng.',
    },
    {
      front: 'Các bước của pipeline IaC trên Pull Request?',
      back: 'fmt và validate, lint (tflint), quét bảo mật (Checkov, Trivy), plan đăng vào PR để người duyệt đọc. Sau merge, apply đúng plan đã duyệt, và chạy plan định kỳ để phát hiện drift.',
    },
    {
      front: 'Bicep và CloudFormation khác Terraform thế nào về state?',
      back: 'CloudFormation để AWS quản lý stack, Bicep đối chiếu trực tiếp với Azure, nên cả hai không có file state phải tự quản. Terraform cần file state và backend, đổi lại dùng được cho nhiều nền tảng.',
    },
    {
      front: 'Khi nào chọn Pulumi hoặc CDK thay cho HCL?',
      back: 'Khi team mạnh về lập trình, cần logic phức tạp, vòng lặp, unit test cho hạ tầng và muốn dùng ngôn ngữ quen thuộc như Java. Rủi ro là code quá thông minh, khó đọc hơn khai báo thuần.',
    },
  ],
  'cloud-platforms': [
    {
      front: 'Public subnet và private subnet khác nhau thế nào?',
      back: 'Public subnet có route ra Internet Gateway, dành cho load balancer. Private subnet không nhận kết nối trực tiếp từ Internet, chứa ứng dụng và database; gọi ra ngoài phải qua NAT gateway.',
    },
    {
      front: 'Security group và network ACL khác nhau thế nào?',
      back: 'Security group gắn với tài nguyên và stateful: chiều phản hồi tự được phép. Network ACL gắn với subnet và stateless: phải khai báo cả hai chiều.',
    },
    {
      front: 'Load balancer Layer 7 và Layer 4 dùng khi nào?',
      back: 'Layer 7 (ALB, Application Gateway) cho HTTP/HTTPS, định tuyến theo host và path, kết thúc TLS. Layer 4 (NLB) cho TCP/UDP hiệu năng cao, giữ IP nguồn, giao thức riêng hoặc cần IP tĩnh.',
    },
    {
      front: 'Mô hình trách nhiệm chia sẻ (shared responsibility) là gì?',
      back: 'Nhà cung cấp cloud bảo vệ hạ tầng bên dưới; khách hàng chịu trách nhiệm những gì đặt lên đó như dữ liệu, cấu hình, IAM, schema và mức nhân bản của dịch vụ managed.',
    },
    {
      front: 'Ứng dụng trên EKS nên lấy credential AWS thế nào?',
      back: 'Dùng danh tính tạm thời qua IRSA hoặc EKS Pod Identity, không dùng access key dài hạn. AWS SDK for Java tự tìm credential qua default credential provider chain.',
    },
    {
      front: 'Landing zone là gì và gồm những thành phần nào?',
      back: 'Là môi trường nền chuẩn để team nhận account và làm việc an toàn. Gồm quản lý account tập trung, guardrail như Service Control Policy, log kiểm toán tập trung, mạng dùng chung và SSO.',
    },
    {
      front: 'Sáu trụ cột của AWS Well-Architected Framework?',
      back: 'Operational Excellence, Security, Reliability, Performance Efficiency, Cost Optimization và Sustainability.',
    },
    {
      front: 'Availability Zone là gì?',
      back: 'Một hoặc nhiều trung tâm dữ liệu tách biệt về điện, làm mát và mạng trong cùng region, nối với nhau bằng mạng độ trễ thấp. Multi-AZ là mức mặc định cho production.',
    },
    {
      front: 'Bốn chiến lược DR theo thứ tự chi phí tăng dần?',
      back: 'Backup & Restore, Pilot Light, Warm Standby, Multi-site active/active. Chi phí và độ phức tạp càng cao thì RPO và RTO càng thấp.',
    },
    {
      front: 'Ứng dụng Java cần chuẩn bị gì để chịu được failover database?',
      back: 'Connection pool như HikariCP loại bỏ kết nối hỏng, retry có backoff cho thao tác idempotent, và JVM không cache DNS quá lâu (networkaddress.cache.ttl) vì failover thường đổi bản ghi DNS.',
    },
    {
      front: 'Ba giai đoạn FinOps theo FinOps Foundation?',
      back: 'Inform: thấy được ai tiêu gì nhờ tag và phân bổ chi phí. Optimize: right-sizing, chọn mô hình giá. Operate: vận hành liên tục, gắn với quy trình và ngân sách.',
    },
    {
      front: 'Khi nào dùng savings plan, on-demand và spot?',
      back: 'Savings plan hay reserved cho tải nền ổn định chạy liên tục, on-demand cho phần dao động, spot cho tác vụ chịu được gián đoạn như batch, CI runner, worker stateless. Right-size trước khi cam kết.',
    },
  ],
  'cloud-native-java': [
    {
      front: 'Giả định thế giới đóng (closed-world assumption) của native image là gì?',
      back: 'Mọi class có thể chạy phải được biết lúc build. Reflection, dynamic proxy, resource, serialization phải khai báo qua reachability metadata, nếu không sẽ lỗi lúc chạy dù build thành công.',
    },
    {
      front: 'Lệnh build Spring Boot native image bằng Maven?',
      back: 'mvn -Pnative native:compile để tạo file thực thi (cần GraalVM). mvn -Pnative spring-boot:build-image để tạo container image bằng Buildpacks. mvn -PnativeTest test để chạy test ở chế độ native.',
    },
    {
      front: 'Khai báo reflection cho native image trong Spring thế nào?',
      back: 'Viết class implement RuntimeHintsRegistrar và đăng ký bằng @ImportRuntimeHints, hoặc dùng @RegisterReflectionForBinding cho class chỉ dùng để binding JSON. Tracing agent giúp thu thập metadata cho thư viện bên thứ ba.',
    },
    {
      front: 'Giới hạn về bean của Spring Boot Native?',
      back: 'Cấu trúc bean cố định lúc build: @Profile và @ConditionalOnProperty được đánh giá khi build nên không bật tắt bean lúc chạy được. Giá trị cấu hình như URL, timeout vẫn đọc lúc chạy.',
    },
    {
      front: 'Native image so với JVM JIT: được và mất gì?',
      back: 'Được: khởi động rất nhanh, bộ nhớ thấp. Mất: build chậm và tốn tài nguyên, hiệu năng đỉnh khi chạy lâu thường thấp hơn JIT, tính động và công cụ chẩn đoán hạn chế hơn.',
    },
    {
      front: 'Khác biệt cốt lõi của Quarkus và Micronaut so với Spring Boot?',
      back: 'Quarkus xử lý cấu hình lúc build (build-time augmentation) với CDI; Micronaut sinh DI và AOP lúc compile bằng annotation processor. Spring Boot mặc định xử lý lúc chạy, dùng Spring AOT khi build native.',
    },
    {
      front: 'Khi nào nên chọn Quarkus hoặc Micronaut thay vì Spring Boot?',
      back: 'Khi xây hệ thống mới thiên về serverless hoặc edge, cold start và bộ nhớ là ràng buộc chính, hoặc tổ chức đã gắn với Jakarta EE. Cần proof of concept trên workload thật vì chi phí chuyển đổi lớn.',
    },
    {
      front: 'Cold start của Lambda Java là gì?',
      back: 'Là init phase khi Lambda tạo môi trường thực thi mới: khởi động JVM, nạp class, chạy constructor và static initializer của handler. Các lần gọi sau trên môi trường warm nhanh hơn nhiều.',
    },
    {
      front: 'SnapStart hoạt động thế nào?',
      back: 'Khi publish version, Lambda chạy init một lần, chụp snapshot bộ nhớ và đĩa của microVM rồi cache lại; môi trường mới được khôi phục từ snapshot. Chỉ áp dụng cho version đã publish, không cho $LATEST.',
    },
    {
      front: 'Cần lưu ý gì về tính duy nhất khi dùng SnapStart?',
      back: 'UUID, giá trị random, seed tạo lúc init sẽ giống nhau trên mọi môi trường khôi phục từ cùng snapshot; kết nối mở lúc init có thể đã hỏng. Tạo trong handler hoặc làm mới trong afterRestore.',
    },
    {
      front: 'Hook CRaC beforeCheckpoint và afterRestore dùng để làm gì trên Lambda?',
      back: 'beforeCheckpoint chạy trước khi chụp snapshot, thường để priming các luồng chính cho class nạp sẵn. afterRestore chạy sau khi khôi phục, để mở lại kết nối và làm mới cache. Dùng thư viện org.crac.',
    },
    {
      front: 'Các vi phạm 12-Factor thường gặp ở ứng dụng Spring Boot?',
      back: 'Config (đóng gói cấu hình vào image), Processes (session trong bộ nhớ), Disposability (không graceful shutdown), Logs (ghi file thay vì stdout), Dev/prod parity (dev dùng DB khác prod).',
    },
  ],
};

export default flashcards;
