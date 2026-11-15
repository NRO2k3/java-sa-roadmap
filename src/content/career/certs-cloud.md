Với vai trò Solution Architect, chứng chỉ cloud architect là loại chứng chỉ được nhà tuyển dụng và khách hàng nhắc tới nhiều nhất, vì phần lớn hệ thống mới đều được thiết kế để chạy trên một nền tảng cloud. Quá trình ôn thi buộc bạn học cách chọn dịch vụ theo yêu cầu phi chức năng: tính sẵn sàng, bảo mật, hiệu năng, chi phí. Đây chính là kỹ năng cốt lõi của SA. Bài này giúp bạn chọn đúng chứng chỉ, hiểu mỗi bài thi đánh giá điều gì, và có phương pháp ôn cùng kỹ thuật giải câu hỏi tình huống. Milestone của giai đoạn là đạt ít nhất một chứng chỉ cloud architect.

## Mục tiêu bài học

- So sánh 5 chứng chỉ: AWS SA Associate, AWS SA Professional, Azure Solutions Architect Expert (AZ-305), Google Professional Cloud Architect, CKA/CKAD.
- Chọn lộ trình chứng chỉ phù hợp với bối cảnh công việc và mục tiêu nghề nghiệp.
- Nắm phạm vi kiến thức trọng tâm và cách ôn cho từng chứng chỉ.
- Áp dụng phương pháp phân tích yêu cầu để giải câu hỏi tình huống kiến trúc.
- Lập kế hoạch ôn có lab thực hành và kiểm soát chi phí cloud.

> **Lưu ý:** Mã phiên bản đề, số câu, thời lượng, điểm đạt, giá và thời hạn hiệu lực đều có thể thay đổi. Các thông tin trong bài là đúng ở thời điểm viết theo hiểu biết chung; hãy đọc exam guide chính thức của từng nhà cung cấp trước khi bắt đầu ôn và trước khi đăng ký.

## Bức tranh tổng quan

| Chứng chỉ | Cấp độ | Trọng tâm | Hình thức | Điều kiện / duy trì |
|---|---|---|---|---|
| AWS Certified Solutions Architect – Associate | Associate | Thiết kế kiến trúc trên AWS cho một workload | Trắc nghiệm một/nhiều đáp án, câu hỏi tình huống | Không bắt buộc chứng chỉ trước; hiệu lực 3 năm |
| AWS Certified Solutions Architect – Professional | Professional | Kiến trúc cấp tổ chức: nhiều account, hybrid, migration, tối ưu hệ thống hiện có | Trắc nghiệm, tình huống dài và phức tạp | Không bắt buộc SAA nhưng nên có; hiệu lực 3 năm |
| Microsoft Azure Solutions Architect Expert | Expert | Thiết kế giải pháp: identity, governance, dữ liệu, liên tục kinh doanh, hạ tầng | Bài thi AZ-305, nhiều dạng câu hỏi kể cả case study | Cần thêm chứng chỉ Azure Administrator Associate (AZ-104); gia hạn hằng năm bằng bài đánh giá online miễn phí |
| Google Professional Cloud Architect | Professional | Thiết kế, quản lý giải pháp trên Google Cloud gắn với yêu cầu kinh doanh | Trắc nghiệm, có câu hỏi dựa trên case study công bố trước | Không bắt buộc chứng chỉ trước; hiệu lực 2 năm |
| CKA / CKAD (CNCF, Linux Foundation) | Trung lập nhà cung cấp | CKA: vận hành cluster; CKAD: thiết kế, triển khai ứng dụng trên Kubernetes | **Thực hành trên terminal**, giải bài trên cluster thật | Thời hạn hiệu lực từng thay đổi, kiểm tra trang CNCF |

Điểm chung của các chứng chỉ architect: câu hỏi hiếm khi hỏi "dịch vụ X là gì", mà mô tả một tình huống với các ràng buộc, rồi hỏi giải pháp **phù hợp nhất**. Nhiều đáp án đều "chạy được"; chỉ một đáp án thoả mãn tốt nhất mọi ràng buộc.

## Chọn chứng chỉ nào trước?

```text
Công ty / khách hàng chính đang dùng cloud nào?
 ├─ AWS        → SA Associate → (CKAD hoặc CKA) → SA Professional
 ├─ Azure      → AZ-104 → AZ-305 (Solutions Architect Expert)
 ├─ Google     → (Associate Cloud Engineer, tuỳ chọn) → Professional Cloud Architect
 └─ Chưa rõ    → một chứng chỉ architect cấp associate của cloud bạn có thể thực hành nhiều nhất
                 + CKAD/CKA vì Kubernetes trung lập nhà cung cấp
```

Nguyên tắc chọn:

1. **Đi theo nơi bạn có thể thực hành thật.** Chứng chỉ gắn với công việc hằng ngày vừa dễ đạt vừa có giá trị kể chuyện khi phỏng vấn.
2. **Sâu một cloud trước, rộng sau.** Một SA hiểu sâu một nền tảng sẽ học nền tảng thứ hai nhanh, vì các khái niệm (vùng sẵn sàng, mạng ảo, IAM, managed database, hàng đợi) tương đương nhau.
3. **CKAD hợp với developer Java** muốn hiểu cách ứng dụng chạy trên Kubernetes; **CKA** hợp khi bạn chịu trách nhiệm nền tảng, vận hành cluster.
4. **Không sưu tầm chứng chỉ.** Ba chứng chỉ được dùng thật trong dự án có giá trị hơn mười chứng chỉ chỉ nằm trên LinkedIn.

## AWS Solutions Architect – Associate và Professional

### SA Associate: bốn domain

Exam guide của phiên bản hiện hành (SAA-C03 tại thời điểm viết) chia nội dung thành bốn domain, khớp với cách SA tư duy:

| Domain | Câu hỏi trọng tâm | Dịch vụ, khái niệm cần nắm |
|---|---|---|
| Design Secure Architectures | Ai được làm gì, dữ liệu được bảo vệ thế nào? | IAM (user, role, policy), Organizations/SCP, VPC, security group vs network ACL, KMS, Secrets Manager, WAF, Shield |
| Design Resilient Architectures | Hệ thống sống sót khi một thành phần hoặc một AZ hỏng? | Multi-AZ, Auto Scaling, ELB, SQS/SNS để tách rời, Route 53, chiến lược backup và DR |
| Design High-Performing Architectures | Đáp ứng tải và độ trễ thế nào? | Loại EC2, Lambda, ECS/EKS/Fargate, S3, EBS/EFS, RDS/Aurora, DynamoDB, ElastiCache, CloudFront |
| Design Cost-Optimized Architectures | Đạt yêu cầu với chi phí hợp lý nhất? | On-Demand, Savings Plans/Reserved, Spot, lớp lưu trữ S3 và lifecycle, chọn đúng kích thước, chi phí truyền dữ liệu |

Nền tảng tư duy là **AWS Well-Architected Framework** với sáu trụ cột: Operational Excellence, Security, Reliability, Performance Efficiency, Cost Optimization, Sustainability. Hãy đọc whitepaper này trước khi học dịch vụ; nó giải thích "vì sao" đằng sau đáp án đúng.

### SA Professional: khác biệt ở quy mô và độ phức tạp

SAP (SAP-C02 tại thời điểm viết) chia theo bốn domain: thiết kế cho độ phức tạp của tổ chức, thiết kế giải pháp mới, cải tiến liên tục giải pháp hiện có, và tăng tốc migration và hiện đại hoá. So với Associate, bạn cần thêm:

- **Nhiều account**: AWS Organizations, SCP, Control Tower, chia sẻ tài nguyên giữa các account, quản lý identity tập trung.
- **Mạng hybrid và quy mô lớn**: Transit Gateway, Direct Connect, Site-to-Site VPN, PrivateLink, DNS hybrid.
- **Migration**: chiến lược "7 Rs" (retire, retain, rehost, relocate, repurchase, replatform, refactor) và các công cụ migration.
- **DR theo RTO/RPO**: backup & restore, pilot light, warm standby, multi-site active/active, kèm chi phí tương ứng.
- **Kỹ năng đọc nhanh**: câu hỏi và đáp án dài, nhiều đáp án chỉ khác nhau một chi tiết. Quản lý thời gian là một phần của bài thi.

Nên có ít nhất một đến hai năm làm thực tế trên AWS sau Associate rồi mới thi Professional.

## Azure Solutions Architect Expert (AZ-305)

Danh hiệu Expert yêu cầu **hai** điều kiện: đạt AZ-305 và có chứng chỉ Azure Administrator Associate (AZ-104). AZ-104 kiểm tra kỹ năng triển khai, quản trị; AZ-305 kiểm tra khả năng **thiết kế**. Bốn mảng kỹ năng của AZ-305:

| Mảng | Nội dung chính |
|---|---|
| Identity, governance, monitoring | Microsoft Entra ID (tên mới của Azure AD), management group, subscription, Azure Policy, RBAC, Azure Monitor, Log Analytics |
| Data storage | Chọn giữa Azure SQL Database, SQL Managed Instance, Cosmos DB, Blob Storage, các tầng lưu trữ, bảo vệ dữ liệu |
| Business continuity | Azure Backup, Azure Site Recovery, availability zone, cặp region, thiết kế theo RTO/RPO |
| Infrastructure | App Service, AKS, Container Apps, Azure Functions, VNet, Application Gateway, Front Door, Service Bus, Event Grid, chiến lược migration |

Khung tư duy tương ứng là **Azure Well-Architected Framework** với năm trụ cột: Reliability, Security, Cost Optimization, Operational Excellence, Performance Efficiency, cùng **Cloud Adoption Framework** cho góc nhìn cấp tổ chức. Microsoft Learn có lộ trình học miễn phí bám theo đề cương và nhiều bài lab sandbox. Chứng chỉ role-based của Microsoft hết hạn sau một năm và được gia hạn bằng bài đánh giá online miễn phí trên Microsoft Learn trong khoảng thời gian trước hạn.

## Google Professional Cloud Architect

Bài thi đánh giá khả năng chuyển yêu cầu kinh doanh thành kiến trúc trên Google Cloud. Đặc trưng là các **case study về công ty giả định** được công bố trước trong exam guide; một phần câu hỏi dựa trên các case study này.

Cách chuẩn bị case study:

1. Với mỗi case study, tách ra bảng: yêu cầu kinh doanh, yêu cầu kỹ thuật, môi trường hiện tại, ràng buộc (ngân sách, quy định, đội ngũ).
2. Phác thảo kiến trúc mục tiêu cho từng công ty và lý do chọn dịch vụ.
3. Khi vào thi, bạn đã quen bối cảnh nên chỉ cần tập trung vào câu hỏi.

Dịch vụ trọng tâm: Compute Engine, GKE, Cloud Run, App Engine, Cloud Functions; Cloud SQL, Spanner, Firestore, Bigtable, BigQuery; Pub/Sub, Dataflow; IAM, resource hierarchy (organization, folder, project), VPC, Cloud Interconnect, Cloud Load Balancing; Cloud Operations (Monitoring, Logging). Một câu hỏi kinh điển là chọn đúng kho dữ liệu: quan hệ quy mô vừa (Cloud SQL), quan hệ phân tán toàn cầu với tính nhất quán mạnh (Spanner), NoSQL ghi rất nhiều theo khoá (Bigtable), phân tích dữ liệu lớn (BigQuery).

## CKA và CKAD (Kubernetes)

CKA và CKAD khác hẳn ba loại trên: **không có trắc nghiệm**. Bạn nhận một danh sách nhiệm vụ và phải giải trực tiếp trên các cluster Kubernetes qua terminal trong thời gian giới hạn, được phép tra tài liệu chính thức của Kubernetes theo quy định của kỳ thi.

| | CKAD | CKA |
|---|---|---|
| Đối tượng | Developer triển khai ứng dụng | Người vận hành, quản trị cluster |
| Domain (theo curriculum hiện hành) | Application Design and Build; Application Deployment; Application Observability and Maintenance; Application Environment, Configuration and Security; Services and Networking | Cluster Architecture, Installation and Configuration; Workloads and Scheduling; Services and Networking; Storage; Troubleshooting |
| Kỹ năng điển hình | Deployment, rolling update, probe, ConfigMap/Secret, resource limit, Job/CronJob, NetworkPolicy, Service/Ingress | Cài đặt và nâng cấp cluster bằng kubeadm, backup etcd, RBAC, scheduling, storage, xử lý node/pod lỗi |

Với bài thi thực hành, **tốc độ thao tác** quyết định kết quả. Hãy luyện đến mức các lệnh sau thành phản xạ:

```bash
alias k=kubectl
export do="--dry-run=client -o yaml"            # sinh YAML nhanh thay vì viết tay

k config use-context <context-ghi-trong-đề>      # luôn chuyển đúng cluster trước mỗi câu
k create deployment web --image=nginx --replicas=3 $do > web.yaml
k apply -f web.yaml
k expose deployment web --port=80 --target-port=80
k create configmap app-config --from-literal=LOG_LEVEL=INFO
k set image deployment/web nginx=nginx:1.27 && k rollout status deployment/web
k explain pod.spec.containers.readinessProbe     # tra cứu field ngay trong terminal
k get pods -A --field-selector=status.phase!=Running
k describe pod <pod> | tail -20                  # xem Events để biết vì sao pod lỗi
k logs <pod> -c <container> --previous           # log của lần chạy trước khi crash
```

Môi trường luyện tập: `kind` hoặc `minikube` cho CKAD; với CKA cần tự dựng cluster nhiều node bằng `kubeadm` trên máy ảo ít nhất một lần.

## Phương pháp giải câu hỏi tình huống kiến trúc

Áp dụng cho AWS, Azure và Google:

1. **Đọc câu hỏi cuối trước**: đề hỏi "giải pháp nào", "bước nào trước tiên" hay "chọn hai đáp án"?
2. **Gạch chân ràng buộc**: chi phí, mức độ vận hành, tính sẵn sàng, độ trễ, bảo mật, thay đổi code tối thiểu.
3. **Loại đáp án vi phạm ràng buộc**, không phải tìm đáp án "nghe hay nhất".
4. **So hai đáp án còn lại** theo ràng buộc được nhấn mạnh nhất.

Bảng "từ khoá → hướng suy luận" thường gặp:

| Cụm từ trong đề | Hướng suy luận |
|---|---|
| Ít công vận hành nhất (least operational overhead) | Dịch vụ managed hoặc serverless thay vì tự cài trên máy ảo |
| Tiết kiệm chi phí nhất (most cost-effective) | Đúng mô hình giá: Spot cho tải chịu được gián đoạn, cam kết dài hạn cho tải ổn định, lifecycle cho dữ liệu ít truy cập |
| Sẵn sàng cao (highly available) | Nhiều zone, auto scaling, load balancer, database có bản sao dự phòng |
| Tách rời các thành phần (decouple) | Hàng đợi, pub/sub, event bus |
| Người dùng toàn cầu, độ trễ thấp | CDN, triển khai nhiều region, định tuyến theo độ trễ hoặc địa lý |
| Không đi qua internet công cộng | Private endpoint, kết nối riêng (VPN, Direct Connect, ExpressRoute, Interconnect) |
| Thay đổi ứng dụng tối thiểu | Rehost/replatform thay vì refactor |

**Ví dụ tình huống (tự soạn để luyện tập):** Một ứng dụng Spring Boot chạy trên nhiều EC2 sau Application Load Balancer trong Auto Scaling group. Session người dùng lưu trong bộ nhớ của từng instance. Khi Auto Scaling thu hẹp (scale-in), người dùng bị đăng xuất. Yêu cầu: không mất session, thay đổi code ít nhất, chi phí hợp lý.

| Phương án | Đánh giá |
|---|---|
| Bật sticky session trên ALB | Người dùng vẫn mất session khi chính instance của họ bị terminate. Không đạt. |
| **Lưu session vào ElastiCache (Redis) bằng Spring Session** | Session tách khỏi instance, chỉ cần thêm dependency và cấu hình. **Phù hợp nhất.** |
| Dùng instance lớn hơn và tắt Auto Scaling | Mất khả năng co giãn và chịu lỗi, đi ngược yêu cầu sẵn sàng. |
| Ghi session thành file trên S3 | Độ trễ và chi phí mỗi request cao, phải tự viết nhiều code. |

Nguyên tắc rút ra: **ứng dụng nên stateless, trạng thái đặt ở kho dữ liệu dùng chung**. Đề thi kiểm tra đúng những nguyên lý mà bạn sẽ áp dụng khi thiết kế thật.

## Kế hoạch ôn mẫu: AWS SA Associate trong 10 tuần

Khoảng 8 giờ mỗi tuần, kết hợp khoá học, tài liệu chính thức và lab:

| Tuần | Nội dung | Lab gợi ý |
|---|---|---|
| 1 | Well-Architected, IAM, Organizations, thiết lập cảnh báo chi phí | Tạo account, bật MFA, tạo budget và cảnh báo |
| 2 | VPC: subnet, route table, NAT, security group vs NACL, endpoint | VPC hai AZ với subnet public/private |
| 3 | EC2, Auto Scaling, ELB; Lambda; ECS/Fargate | Chạy Spring Boot sau ALB với Auto Scaling |
| 4 | S3 (lớp lưu trữ, lifecycle, bảo mật), EBS, EFS | Static site trên S3 + CloudFront |
| 5 | RDS, Aurora, DynamoDB, ElastiCache | RDS Multi-AZ, session vào ElastiCache |
| 6 | SQS, SNS, EventBridge, Kinesis, API Gateway | Tách xử lý ảnh bằng SQS + Lambda |
| 7 | KMS, Secrets Manager, WAF, Shield, Cognito | Đưa mật khẩu DB vào Secrets Manager |
| 8 | CloudWatch, CloudTrail, Backup, Route 53, chiến lược DR, mô hình giá | Cảnh báo CloudWatch, chính sách định tuyến Route 53 |
| 9 | Đề thi thử toàn phần, sổ lỗi sai | — |
| 10 | Đệm, ôn lại điểm yếu, thi | Dọn sạch tài nguyên |

> **Lưu ý về chi phí lab:** Một số tài nguyên tính tiền theo giờ kể cả khi không dùng (ví dụ NAT Gateway, load balancer, database). Hãy đặt cảnh báo ngân sách từ ngày đầu, gắn tag cho tài nguyên lab, và tốt nhất tạo hạ tầng bằng IaC (Terraform, CloudFormation, Bicep) để xoá toàn bộ bằng một lệnh. Không dùng tài khoản root cho công việc hằng ngày.

Biến lab cuối kỳ thành **một bài thiết kế trong portfolio**: sơ đồ, ADR giải thích lựa chọn, ước tính chi phí. Như vậy một công sức phục vụ cả milestone "1 chứng chỉ" và "3 bài thiết kế kiến trúc".

## Lỗi thường gặp

- **Học thuộc dịch vụ, bỏ qua nguyên lý**: biết hàng trăm dịch vụ nhưng không biết chọn khi có ràng buộc. Cách sửa: học Well-Architected trước, luôn hỏi "dịch vụ này giải quyết ràng buộc nào".
- **Chỉ xem video, không làm lab**: câu hỏi tình huống đòi hỏi trực giác mà chỉ có khi đã cấu hình và gặp lỗi thật. Cách sửa: mỗi tuần ít nhất một lab nhỏ.
- **Dùng đề dump**: vi phạm điều khoản thi, có thể bị thu hồi chứng chỉ, và đề có thể sai. Cách sửa: đề thi thử uy tín có giải thích, cộng bộ câu hỏi mẫu chính thức.
- **Quên dọn tài nguyên**: hoá đơn bất ngờ cuối tháng. Cách sửa: cảnh báo ngân sách, IaC, checklist dọn dẹp sau mỗi lab.
- **Thi CKA/CKAD chỉ bằng cách đọc**: kiến thức đúng nhưng không kịp thời gian. Cách sửa: luyện trên terminal hằng ngày, bấm giờ từng dạng bài.
- **Để chứng chỉ hết hạn**: đặc biệt với Azure gia hạn hằng năm. Cách sửa: ghi lịch nhắc trước hạn và gia hạn sớm.

## Bài tập thực hành

1. **Lập lộ trình cá nhân**: dựa trên cloud công ty bạn đang dùng và mục tiêu 12 tháng, chọn một chứng chỉ architect đầu tiên và một chứng chỉ tiếp theo. Tải exam guide chính thức, tự đánh giá mức độ tự tin (1–5) cho từng domain, và lập kế hoạch 10 tuần ưu tiên domain yếu.
2. **Lab kiến trúc ba tầng có tính sẵn sàng cao**: triển khai một ứng dụng Spring Boot với load balancer, nhiều instance trên hai zone, database managed có bản dự phòng, session tập trung, và cảnh báo giám sát. Viết bằng IaC, đo thử bằng cách tắt một instance, ghi lại chi phí ước tính mỗi tháng, sau đó xoá toàn bộ.
3. **Tự soạn câu hỏi tình huống**: viết 5 câu hỏi theo kiểu đề thi (một tình huống, 4 phương án, một đáp án phù hợp nhất) dựa trên các sự cố bạn từng gặp trong dự án. Kèm giải thích vì sao từng phương án sai. Đây là cách ôn sâu nhất và cũng là nội dung tốt cho blog.

## Tóm tắt

- Chứng chỉ cloud architect là chứng chỉ gắn trực tiếp nhất với vai trò SA; chọn cloud mà bạn có thể thực hành thật.
- AWS SAA kiểm tra bốn hướng thiết kế: bảo mật, khả năng phục hồi, hiệu năng, chi phí; SAP thêm quy mô tổ chức, hybrid và migration.
- Azure Solutions Architect Expert cần AZ-104 và AZ-305, gia hạn hằng năm; Google PCA có case study công bố trước.
- CKA/CKAD là bài thi thực hành trên terminal; tốc độ thao tác `kubectl` quyết định kết quả.
- Giải câu hỏi tình huống bằng cách xác định ràng buộc rồi loại trừ, dựa trên các framework Well-Architected.
- Luôn xác minh thông tin bài thi ở trang chính thức, kiểm soát chi phí lab và biến lab thành bài trong portfolio.
