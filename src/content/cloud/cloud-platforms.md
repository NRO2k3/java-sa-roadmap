Solution Architect không cần thuộc lòng hàng trăm dịch vụ của AWS, Azure hay GCP, nhưng phải nắm vững các khối nền tảng (compute, storage, database, mạng, danh tính) và các nguyên tắc thiết kế đứng sau chúng. Phần lớn sự cố nghiêm trọng và hoá đơn cloud bất ngờ không đến từ code, mà từ quyết định kiến trúc: một database chỉ chạy ở một zone, một access key bị lộ, một NAT gateway xử lý hàng terabyte dữ liệu mỗi tháng. Bài này giúp bạn suy nghĩ như người thiết kế nền tảng, không chỉ như người dùng dịch vụ.

## Mục tiêu bài học

- Nắm các nhóm dịch vụ cốt lõi và cách ánh xạ giữa AWS, Azure, GCP; hiểu VPC, subnet, load balancer.
- Hiểu IAM theo nguyên tắc least privilege, danh tính tạm thời cho workload, và mô hình multi-account/landing zone.
- Áp dụng 6 trụ cột của Well-Architected Framework để đánh giá một kiến trúc.
- Thiết kế multi-AZ, multi-region và chọn chiến lược DR theo RPO/RTO.
- Áp dụng FinOps: mô hình giá reserved/savings plan/spot, right-sizing và phân bổ chi phí.

## Dịch vụ cốt lõi

| Nhóm | AWS | Azure | GCP |
|---|---|---|---|
| Máy ảo | EC2 | Virtual Machines | Compute Engine |
| Kubernetes managed | EKS | AKS | GKE |
| Container serverless | ECS Fargate, App Runner | Container Apps | Cloud Run |
| Function | Lambda | Azure Functions | Cloud Run functions |
| Object storage | S3 | Blob Storage | Cloud Storage |
| Block / file storage | EBS / EFS | Managed Disks / Azure Files | Persistent Disk / Filestore |
| CSDL quan hệ managed | RDS, Aurora | Azure SQL, Azure Database for PostgreSQL | Cloud SQL, AlloyDB |
| NoSQL | DynamoDB | Cosmos DB | Firestore, Bigtable |
| Messaging | SQS, SNS | Service Bus | Pub/Sub |
| Mạng riêng | VPC | Virtual Network (VNet) | VPC |

### Compute: chọn mức trừu tượng

Càng lên cao (VM, rồi Kubernetes, rồi container serverless, rồi function) bạn càng ít phải vận hành nhưng càng ít quyền kiểm soát. Câu hỏi để chọn:

- Team có đủ người và kỹ năng vận hành Kubernetes không? Nếu chỉ có vài service, container serverless như Cloud Run hay ECS Fargate thường đủ và rẻ hơn về công sức.
- Workload chạy liên tục hay theo đợt? Tải theo đợt, ít request hợp với function hoặc container scale về 0.
- Có ràng buộc đặc biệt không (GPU, phần mềm cần license theo máy, kernel module)? Khi đó VM vẫn là lựa chọn.

### Storage và database

- **Object storage** (S3, Blob, Cloud Storage): file, ảnh, backup, data lake; độ bền rất cao, truy cập qua API, không phải ổ đĩa. Dùng **lifecycle policy** để chuyển dữ liệu cũ sang lớp lưu trữ rẻ hơn.
- **Block storage**: ổ đĩa gắn vào một máy, thường nằm trong một zone.
- **Database managed**: nhà cung cấp lo vá lỗi, backup, failover; bạn vẫn chịu trách nhiệm schema, index, kích thước và cấu hình nhân bản. Đây là ví dụ của **mô hình trách nhiệm chia sẻ** (shared responsibility model): cloud bảo vệ hạ tầng, bạn bảo vệ thứ mình đặt lên hạ tầng.

### Networking: VPC, subnet, load balancer

**VPC** (Virtual Private Cloud) là mạng riêng ảo của bạn trên cloud, có dải địa chỉ CIDR riêng. Bên trong chia thành **subnet**:

- **Public subnet**: có route ra Internet Gateway, dành cho load balancer, bastion (nếu có).
- **Private subnet**: không nhận kết nối trực tiếp từ Internet; ứng dụng và database đặt ở đây. Muốn gọi ra ngoài (tải package, gọi API bên thứ ba) phải đi qua **NAT gateway**.

Trên AWS, mỗi subnet nằm trong đúng một Availability Zone, nên để chạy multi-AZ bạn tạo subnet ở ít nhất hai zone. Trên Azure, subnet trải trên cả region; trên GCP, VPC là tài nguyên toàn cầu còn subnet thuộc từng region. Những khác biệt này ảnh hưởng tới cách bạn viết IaC.

```text
Region ap-southeast-1, VPC 10.0.0.0/16
+-----------------------------+-----------------------------+
| AZ a                        | AZ b                        |
| public  10.0.0.0/24  [ALB]  | public  10.0.1.0/24  [ALB]  |
|         [NAT GW]            |         [NAT GW]            |
| private 10.0.10.0/24 [EKS]  | private 10.0.11.0/24 [EKS]  |
| data    10.0.20.0/24 [RDS]  | data    10.0.21.0/24 [RDS*] |
+-----------------------------+-----------------------------+
  [RDS*] = bản standby, nhân bản đồng bộ, tự failover
```

Kiểm soát truy cập mạng: **security group** là firewall gắn với tài nguyên, có trạng thái (stateful: cho phép chiều đi thì chiều về tự được phép); **network ACL** gắn với subnet và không có trạng thái. Nguyên tắc: database chỉ nhận kết nối từ security group của ứng dụng, không mở theo dải IP rộng. Để gọi dịch vụ managed (S3, Secrets Manager) mà không đi qua Internet, dùng **private endpoint** (VPC endpoint/PrivateLink, Azure Private Endpoint, Private Service Connect).

**Load balancer** có hai loại chính: **Layer 7** (HTTP/HTTPS, định tuyến theo path/host, kết thúc TLS, ví dụ AWS ALB, Azure Application Gateway) và **Layer 4** (TCP/UDP, hiệu năng cao, giữ IP nguồn, ví dụ AWS NLB). Với microservice Java qua HTTP, L7 phổ biến hơn; L4 hợp với gRPC thuần TCP, giao thức riêng hoặc khi cần IP tĩnh.

## IAM và landing zone

### IAM theo least privilege

**IAM** (Identity and Access Management) trả lời câu hỏi: *ai* (principal: user, role, service account) được làm *gì* (action) trên *tài nguyên nào*, với *điều kiện gì*. Nguyên tắc **least privilege**: chỉ cấp đúng quyền cần thiết, phạm vi hẹp nhất.

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "OrderServiceInvoices",
      "Effect": "Allow",
      "Action": ["s3:GetObject", "s3:PutObject"],
      "Resource": "arn:aws:s3:::acme-invoices-prod/orders/*"
    },
    {
      "Sid": "ReadDbSecret",
      "Effect": "Allow",
      "Action": "secretsmanager:GetSecretValue",
      "Resource": "arn:aws:secretsmanager:ap-southeast-1:111122223333:secret:orders-db-*"
    }
  ]
}
```

Policy trên chỉ cho service đọc ghi một prefix của một bucket và đọc một secret, thay vì `s3:*` trên `*`. Các nguyên tắc đi kèm:

- **Danh tính tạm thời thay cho access key dài hạn.** Ứng dụng trên EKS dùng IRSA hoặc EKS Pod Identity, trên GKE/AKS dùng Workload Identity; CI/CD dùng OIDC federation để nhận credential ngắn hạn. AWS SDK for Java tự tìm credential qua default credential provider chain, nên code không cần chứa key.
- Con người đăng nhập qua SSO (IAM Identity Center, Microsoft Entra ID), bắt buộc MFA; tài khoản root chỉ dùng cho tác vụ khẩn cấp.
- Định kỳ rà soát quyền không dùng tới bằng công cụ phân tích truy cập của từng cloud.

### Multi-account và landing zone

Trên AWS, **account** là ranh giới cách ly mạnh nhất: quyền, giới hạn tài nguyên (quota), hoá đơn và phạm vi ảnh hưởng (blast radius) khi có sự cố hay bị tấn công. Tương đương là **subscription** trên Azure và **project** trên GCP. Thay vì dồn mọi thứ vào một account, tổ chức nên có nhiều account được quản lý tập trung.

**Landing zone** là môi trường nền được dựng sẵn theo chuẩn, để team mới có thể nhận account và bắt đầu làm việc an toàn ngay. Một cấu trúc thường gặp:

```text
Organization (root)
├── Security OU      : log-archive, security-audit
├── Infrastructure OU: shared-network (transit, DNS), shared-services (CI, registry)
├── Workloads OU
│   ├── Prod OU      : orders-prod, payments-prod
│   └── NonProd OU   : orders-dev, orders-staging
└── Sandbox OU       : account thử nghiệm, có ngân sách giới hạn
```

Các thành phần của landing zone: quản lý account tập trung (AWS Organizations và Control Tower, Azure management group, GCP folder), **guardrail** (rào chắn) như Service Control Policy để cấm tắt audit log hoặc cấm dùng region không được phép, log kiểm toán tập trung vào account riêng không ai sửa được, mạng dùng chung và SSO. SA thường không tự dựng landing zone một mình, nhưng phải thiết kế workload sao cho phù hợp với nó.

## Well-Architected Framework: 6 trụ cột

AWS Well-Architected Framework có 6 trụ cột; Azure Well-Architected Framework có 5 trụ cột (không tách Sustainability thành trụ cột riêng); Google Cloud cũng có khung tương tự. Ý tưởng chung giống nhau.

| Trụ cột | Câu hỏi cốt lõi | Ví dụ thực hành |
|---|---|---|
| **Operational Excellence** | Vận hành và cải tiến hệ thống thế nào? | IaC, CI/CD, runbook, observability, postmortem |
| **Security** | Bảo vệ dữ liệu, danh tính, hạ tầng ra sao? | Least privilege, mã hoá, audit log, quét lỗ hổng |
| **Reliability** | Hệ thống chịu lỗi và phục hồi thế nào? | Multi-AZ, retry có backoff, backup đã thử khôi phục, DR |
| **Performance Efficiency** | Dùng tài nguyên hiệu quả khi tải thay đổi? | Chọn đúng loại máy, cache, autoscaling, đo trước khi tối ưu |
| **Cost Optimization** | Có trả tiền cho thứ không tạo ra giá trị? | Right-sizing, savings plan, tắt môi trường không dùng, gắn tag chi phí |
| **Sustainability** | Giảm tác động môi trường thế nào? | Tăng hiệu suất sử dụng, chọn region và loại máy hiệu quả năng lượng, xoá dữ liệu thừa |

Các trụ cột thường **đánh đổi** với nhau: thêm region dự phòng tăng Reliability nhưng tăng chi phí; spot instance giảm chi phí nhưng ảnh hưởng độ tin cậy nếu dùng sai chỗ. Một buổi **Well-Architected Review** đi qua bộ câu hỏi của từng trụ cột, ghi lại rủi ro mức cao/trung bình và lập kế hoạch cải tiến có thứ tự ưu tiên. Giá trị nằm ở việc đưa các đánh đổi ra ánh sáng và được chủ sản phẩm chấp nhận một cách có ý thức, không phải ở việc đạt điểm tuyệt đối.

## Multi-AZ, multi-region và DR

### Multi-AZ: mức mặc định cho production

**Availability Zone** là một hoặc nhiều trung tâm dữ liệu tách biệt về điện, làm mát, mạng trong cùng một region, nối với nhau bằng mạng độ trễ thấp. Chạy trên nhiều AZ bảo vệ hệ thống trước sự cố một trung tâm dữ liệu, với chi phí và độ phức tạp vừa phải. Trong Kubernetes, rải Pod đều trên các zone:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: order-service
spec:
  replicas: 6
  selector:
    matchLabels: { app: order-service }
  template:
    metadata:
      labels: { app: order-service }
    spec:
      topologySpreadConstraints:
        - maxSkew: 1
          topologyKey: topology.kubernetes.io/zone
          whenUnsatisfiable: DoNotSchedule
          labelSelector:
            matchLabels: { app: order-service }
      containers:
        - name: app
          image: registry.example.com/order-service:1.4.2
```

Database dùng chế độ multi-AZ (bản standby được nhân bản đồng bộ ở zone khác, tự failover). Ứng dụng Java cần chịu được failover: connection pool như HikariCP phải loại bỏ kết nối hỏng, có retry với backoff cho thao tác idempotent, và JVM không cache DNS quá lâu (thuộc tính bảo mật `networkaddress.cache.ttl`), vì failover thường đổi bản ghi DNS sang máy mới.

### Multi-region và chiến lược DR

Multi-region bảo vệ trước sự cố cả region hoặc đáp ứng yêu cầu pháp lý, độ trễ cho người dùng ở xa, nhưng phức tạp hơn nhiều: dữ liệu nhân bản giữa region thường là **bất đồng bộ** (asynchronous), nên khi failover có thể mất phần dữ liệu chưa kịp nhân bản.

Hai chỉ số quyết định thiết kế DR (Disaster Recovery, khôi phục sau thảm hoạ):

- **RPO** (Recovery Point Objective): lượng dữ liệu tối đa chấp nhận mất, tính theo thời gian.
- **RTO** (Recovery Time Objective): thời gian tối đa để hệ thống hoạt động lại.

| Chiến lược | Mô tả | RPO/RTO | Chi phí |
|---|---|---|---|
| Backup & Restore | Sao lưu sang region khác, khi có sự cố mới dựng hạ tầng và khôi phục | Cao nhất (giờ) | Thấp nhất |
| Pilot Light | Dữ liệu được nhân bản liên tục, hạ tầng lõi có sẵn nhưng ứng dụng tắt hoặc tối thiểu | Thấp hơn | Thấp |
| Warm Standby | Bản thu nhỏ của toàn hệ thống chạy sẵn, khi có sự cố thì scale lên | Thấp (phút) | Trung bình |
| Multi-site active/active | Nhiều region cùng phục vụ traffic | Thấp nhất | Cao nhất, phức tạp nhất |

Cách chọn: bắt đầu từ **tác động nghiệp vụ**. Hỏi chủ sản phẩm "mất 1 giờ đơn hàng thì thiệt hại bao nhiêu, hệ thống dừng 4 giờ thì sao", rồi chọn chiến lược rẻ nhất đáp ứng được. Không phải service nào cũng cần cùng mức: hệ thống thanh toán và trang báo cáo nội bộ có RPO/RTO khác nhau. Active/active còn đòi hỏi giải bài toán ghi dữ liệu ở nhiều nơi (xung đột, nhất quán), nên chỉ chọn khi thật sự cần.

DR chưa được diễn tập là DR không tồn tại. Hãy định kỳ thử khôi phục backup, thử failover (game day) và đo RTO thực tế so với mục tiêu.

## Quản lý chi phí (FinOps)

**FinOps** là thực hành đưa trách nhiệm tài chính vào văn hoá cloud: kỹ sư, tài chính và quản lý cùng nhìn số liệu chi phí và đưa quyết định. FinOps Foundation mô tả vòng lặp ba giai đoạn: **Inform** (thấy được ai tiêu gì), **Optimize** (tối ưu), **Operate** (vận hành liên tục, gắn với quy trình).

### Thấy được chi phí

- Gắn **tag/label** bắt buộc cho mọi tài nguyên (team, service, environment) và kiểm tra bằng policy; không có tag thì không phân bổ được chi phí.
- Đặt **budget và cảnh báo** cho từng account/team; theo dõi chi phí trên đơn vị nghiệp vụ (ví dụ chi phí cho mỗi 1.000 đơn hàng), không chỉ tổng hoá đơn.

### Mô hình giá

| Mô hình | Đặc điểm | Phù hợp |
|---|---|---|
| On-demand | Trả theo giờ/giây dùng, không cam kết | Tải chưa ổn định, thử nghiệm |
| Reserved Instance / Savings Plan / Committed Use | Cam kết sử dụng 1 hoặc 3 năm, đổi lấy giá thấp hơn on-demand | Phần tải nền ổn định chạy 24/7 |
| Spot / Preemptible | Dùng dung lượng dư với giá rẻ nhiều, nhưng có thể bị thu hồi (trên AWS có cảnh báo trước 2 phút) | Batch job, CI runner, worker xử lý hàng đợi, node stateless có nhiều bản sao |

Chiến lược thường dùng: phần tải nền cam kết bằng savings plan, phần dao động dùng on-demand, phần chịu được gián đoạn dùng spot. Spot không hợp với database hay service có trạng thái; khi dùng spot cho node Kubernetes, ứng dụng phải shutdown gọn gàng khi nhận tín hiệu, có PodDisruptionBudget và đủ replica.

### Right-sizing và các nguồn lãng phí phổ biến

**Right-sizing** là chọn kích thước tài nguyên theo số liệu sử dụng thực tế thay vì ước đoán. Với Java: đo heap thực dùng và CPU qua Micrometer/Prometheus vài tuần, rồi giảm request/limit hoặc loại máy; cân nhắc máy dùng CPU ARM (ví dụ AWS Graviton) vì JVM chạy tốt trên ARM, chỉ cần image hỗ trợ đa kiến trúc (multi-arch). Lãng phí thường gặp:

- Môi trường dev/staging chạy 24/7: tắt ngoài giờ làm việc hoặc thu nhỏ.
- Ổ đĩa, snapshot, IP tĩnh, load balancer mồ côi sau khi xoá dự án.
- Chi phí truyền dữ liệu: traffic qua NAT gateway, giữa các AZ và ra Internet đều tính tiền; dùng private endpoint cho dịch vụ managed và tránh gọi chéo AZ không cần thiết.
- Log và metric lưu vô thời hạn: đặt thời gian lưu giữ (retention) theo nhu cầu thật.

## Lỗi thường gặp

- **Database và ứng dụng chỉ ở một AZ "cho rẻ"**: một sự cố zone làm dừng toàn hệ thống. Multi-AZ là mặc định cho production.
- **Đặt database ở public subnet hoặc mở security group cho `0.0.0.0/0`**: đặt ở private subnet, chỉ cho phép từ security group của ứng dụng.
- **Access key dài hạn trong file cấu hình hoặc biến môi trường CI**: dùng role, workload identity, OIDC.
- **Một account cho mọi môi trường**: dev có thể phá prod, không tách được chi phí. Áp dụng multi-account/landing zone.
- **Chọn multi-region active/active khi chưa xác định RPO/RTO**: tốn kém và phức tạp không cần thiết. Bắt đầu từ yêu cầu nghiệp vụ.
- **Có backup nhưng chưa từng thử khôi phục**: diễn tập định kỳ và đo RTO thật.
- **Mua reserved/savings plan trước khi right-sizing**: cam kết dài hạn cho tài nguyên quá khổ. Right-size trước, cam kết sau.
- **Chạy workload có trạng thái trên spot**: dùng spot cho tác vụ chịu được gián đoạn.

## Bài tập thực hành

1. **Thiết kế mạng và IAM**: vẽ (bằng ASCII hoặc công cụ bất kỳ) VPC cho hệ thống đặt hàng gồm 3 microservice Java trên EKS, PostgreSQL và Kafka managed, trên 3 AZ. Ghi rõ subnet, security group rule, private endpoint, và viết IAM policy least privilege cho từng service.
2. **Well-Architected Review**: chọn một hệ thống bạn đang làm, đi qua 6 trụ cột, liệt kê 2 rủi ro lớn nhất mỗi trụ cột và đề xuất cải tiến. Ghi lại ít nhất 2 đánh đổi giữa các trụ cột cần chủ sản phẩm quyết định.
3. **DR và chi phí**: với cùng hệ thống, phỏng vấn (hoặc giả định) yêu cầu RPO/RTO cho từng service, chọn chiến lược DR và ước lượng các hạng mục chi phí phát sinh (không cần con số chính xác). Sau đó đề xuất kế hoạch FinOps: chính sách tag, phần nào dùng savings plan, phần nào dùng spot, môi trường nào tắt ngoài giờ.

## Tóm tắt

- Nắm các khối nền tảng và cách ánh xạ giữa AWS, Azure, GCP; chọn mức trừu tượng compute theo năng lực vận hành của team.
- VPC chia public/private subnet trên nhiều AZ; security group theo nguyên tắc chặt; private endpoint cho dịch vụ managed; L7 hay L4 tuỳ giao thức.
- IAM theo least privilege, ưu tiên danh tính tạm thời; multi-account và landing zone tạo ranh giới cách ly, guardrail và log tập trung.
- Well-Architected có 6 trụ cột (AWS); giá trị của review là làm rõ rủi ro và đánh đổi.
- Multi-AZ là mặc định cho production; multi-region và chiến lược DR chọn theo RPO/RTO và tác động nghiệp vụ, phải diễn tập thường xuyên.
- FinOps: gắn tag để thấy chi phí, right-size trước rồi mới cam kết, dùng spot cho tải chịu được gián đoạn, cắt lãng phí truyền dữ liệu và môi trường nhàn rỗi.
