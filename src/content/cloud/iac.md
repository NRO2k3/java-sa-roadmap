Hạ tầng được tạo bằng cách bấm chuột trên console sẽ sớm trở thành "hộp đen": không ai nhớ vì sao security group mở cổng đó, môi trường staging lệch production ở đâu, và khi cần dựng lại sau sự cố thì không ai làm lại được giống hệt. Infrastructure as Code (IaC) mô tả hạ tầng bằng code, đưa nó qua review, version và pipeline như code ứng dụng. Với Solution Architect, IaC là cách biến bản thiết kế hạ tầng thành thứ có thể tái lập, kiểm toán và cải tiến dần.

## Mục tiêu bài học

- Hiểu các nguyên tắc của IaC: khai báo (declarative), idempotent, phát hiện drift.
- Viết Terraform module có đầu vào, đầu ra rõ ràng và quản lý state từ xa an toàn (remote state, locking, mã hoá).
- Tổ chức code cho nhiều môi trường dev/staging/prod và quy trình plan/apply qua pipeline.
- So sánh Terraform với CloudFormation, Bicep và Pulumi để chọn công cụ phù hợp.

## Nguyên tắc của Infrastructure as Code

- **Declarative (khai báo)**: bạn mô tả trạng thái mong muốn ("cần một database PostgreSQL multi-AZ"), công cụ tự tính các bước để đạt được. Ngược lại, cách **imperative** (mệnh lệnh) là viết script từng bước "tạo cái này, rồi sửa cái kia".
- **Idempotent**: chạy lại cùng một đoạn code nhiều lần cho cùng một kết quả, không tạo thêm tài nguyên trùng lặp.
- **Drift**: sự lệch giữa trạng thái thật và trạng thái trong code, thường do ai đó sửa tay trên console. IaC giúp phát hiện và sửa drift.
- **Immutable infrastructure**: thay vì vá tại chỗ, tạo tài nguyên mới thay thế tài nguyên cũ. Ví dụ đổi launch template rồi thay dần máy ảo, thay vì SSH vào sửa từng máy.

## Terraform căn bản

**Terraform** (của HashiCorp) dùng ngôn ngữ HCL để mô tả tài nguyên trên nhiều nền tảng thông qua **provider** (plugin cho AWS, Azure, GCP, Kubernetes...). Từ năm 2023 Terraform chuyển sang giấy phép Business Source License; **OpenTofu** là bản fork mã nguồn mở dưới Linux Foundation, cú pháp gần như tương thích. Kiến thức trong bài áp dụng được cho cả hai.

Các khối chính:

| Khối | Ý nghĩa |
|---|---|
| `provider` | Kết nối tới nền tảng (region, credential) |
| `resource` | Tài nguyên Terraform tạo và quản lý |
| `data` | Đọc tài nguyên đã có, không quản lý vòng đời |
| `variable` / `output` | Đầu vào và đầu ra của một module |
| `locals` | Giá trị tính toán dùng lại trong module |
| `module` | Gọi một module khác |

Vòng đời làm việc:

```bash
terraform init                  # tải provider, module, cấu hình backend
terraform fmt -check && terraform validate
terraform plan -out=tfplan      # xem trước thay đổi, lưu plan
terraform apply tfplan          # áp dụng đúng plan đã review
```

`plan` là bước quan trọng nhất: nó cho biết tài nguyên nào sẽ được tạo (`+`), sửa tại chỗ (`~`) hay **xoá và tạo lại** (`-/+`). Một thay đổi tưởng nhỏ như đổi tên database có thể khiến Terraform xoá database cũ, vì vậy plan phải được đọc kỹ trước khi apply.

## Viết Terraform module

**Module** là một thư mục chứa các file `.tf`, đóng gói một khối hạ tầng có ý nghĩa nghiệp vụ (mạng VPC, cụm EKS, database cho một service). Module tốt giống một API tốt: ít đầu vào bắt buộc, giá trị mặc định an toàn, đầu ra đủ dùng.

```text
modules/rds-postgres/
  variables.tf   # đầu vào, có type, mô tả, validation
  main.tf        # resource
  outputs.tf     # đầu ra cho module khác dùng
  versions.tf    # ràng buộc phiên bản Terraform và provider
  README.md
```

Ví dụ rút gọn một module PostgreSQL trên AWS RDS:

```text
# variables.tf
variable "name"           { type = string }
variable "environment" {
  type = string
  validation {
    condition     = contains(["dev", "staging", "prod"], var.environment)
    error_message = "environment phải là dev, staging hoặc prod."
  }
}
variable "instance_class" { type = string }
variable "multi_az" {
  type    = bool
  default = false
}
variable "subnet_ids"     { type = list(string) }
variable "security_group_ids" { type = list(string) }

# main.tf
resource "aws_db_subnet_group" "this" {
  name       = "${var.name}-${var.environment}"
  subnet_ids = var.subnet_ids
}

resource "aws_db_instance" "this" {
  identifier                  = "${var.name}-${var.environment}"
  engine                      = "postgres"
  instance_class              = var.instance_class
  allocated_storage           = 50
  multi_az                    = var.multi_az
  db_subnet_group_name        = aws_db_subnet_group.this.name
  vpc_security_group_ids      = var.security_group_ids
  username                    = "app"
  manage_master_user_password = true   # mật khẩu do Secrets Manager quản lý
  storage_encrypted           = true
  backup_retention_period     = 7
  deletion_protection         = var.environment == "prod"
}

# outputs.tf
output "endpoint" { value = aws_db_instance.this.endpoint }
```

Điểm đáng học từ ví dụ:

- `validation` chặn giá trị sai ngay từ lúc `plan`.
- Mặc định an toàn: mã hoá storage, có backup, bật `deletion_protection` ở production.
- Mật khẩu không nằm trong code hay biến; `manage_master_user_password` để AWS sinh và lưu vào Secrets Manager.
- Module **không** chứa khối `provider` và `backend`; nơi gọi module quyết định chạy ở account và region nào.

### Thiết kế module: nên và không nên

- Module nên đóng gói một khái niệm có ý nghĩa ("database cho service", "mạng của một môi trường"). Tránh module chỉ bọc đúng một resource mà không thêm giá trị gì; khi đó cứ dùng resource trực tiếp.
- Tránh module "thần thánh" nhận hàng chục biến boolean để bật tắt mọi thứ: khó test, khó đọc plan.
- Phát hành module theo **version** (git tag hoặc private registry) và gọi bằng version cố định. Nâng version ở dev trước, rồi mới tới staging và prod.
- Khi đổi cấu trúc code (đổi tên resource, chuyển vào module), dùng khối `moved` để Terraform hiểu đó là cùng tài nguyên thay vì xoá và tạo mới. Tài nguyên đã tạo bằng tay có thể đưa vào quản lý bằng khối `import`.

## Quản lý state từ xa

**State** là file Terraform dùng để ánh xạ resource trong code với tài nguyên thật (ID, thuộc tính). Mặc định state nằm ở file `terraform.tfstate` trên máy local, điều này không chấp nhận được khi làm theo team:

- Hai người cùng `apply` sẽ ghi đè state của nhau.
- Mất laptop là mất state, Terraform không còn biết mình đang quản lý gì.
- State chứa cả giá trị nhạy cảm (ví dụ thuộc tính của database) ở dạng **không mã hoá**.

Giải pháp là **remote backend** có **locking** (khoá: chỉ một tiến trình được ghi state tại một thời điểm):

```text
terraform {
  required_version = ">= 1.10"
  required_providers {
    aws = { source = "hashicorp/aws", version = "~> 6.0" }
  }
  backend "s3" {
    bucket       = "acme-tfstate-prod"
    key          = "order-platform/terraform.tfstate"
    region       = "ap-southeast-1"
    encrypt      = true
    use_lockfile = true   # khoá state bằng file lock trên S3
  }
}
```

Terraform 1.10 trở lên hỗ trợ khoá state trực tiếp trên S3 qua `use_lockfile`; cấu hình cũ hơn dùng một bảng DynamoDB để khoá. Trên Azure dùng backend `azurerm` (Blob Storage, khoá bằng blob lease), trên GCP dùng backend `gcs`. HCP Terraform (Terraform Cloud) hoặc các nền tảng tương tự cung cấp sẵn state, locking, lịch sử và giao diện review plan.

Thực hành tốt cho state:

- Bucket state bật versioning (khôi phục khi state hỏng), mã hoá, chặn public, giới hạn quyền đọc chỉ cho pipeline và nhóm vận hành.
- **Chia nhỏ state** theo môi trường và theo lớp (mạng, cluster, database, ứng dụng). State quá lớn làm `plan` chậm và mở rộng phạm vi ảnh hưởng (blast radius) của một lỗi.
- Không sửa file state bằng tay; dùng `terraform state mv`, `terraform state rm` hoặc khối `moved`/`import`.
- Khi một stack cần đầu ra của stack khác (ví dụ ID subnet), ưu tiên đọc qua `data` source hoặc giá trị được publish rõ ràng, thay vì để mọi stack đọc state của nhau một cách tuỳ tiện.

## Tổ chức môi trường dev/staging/prod

### Thư mục riêng cho từng môi trường

Cách phổ biến và rõ ràng nhất: mỗi môi trường là một thư mục gốc (root module) riêng, có backend riêng, gọi cùng các module dùng chung.

```text
infra/
  modules/
    network/
    eks-cluster/
    rds-postgres/
  envs/
    dev/        main.tf  backend.tf  terraform.tfvars
    staging/    main.tf  backend.tf  terraform.tfvars
    prod/       main.tf  backend.tf  terraform.tfvars
```

```text
# envs/prod/main.tf
module "orders_db" {
  source             = "git::https://github.com/example-org/tf-modules.git//rds-postgres?ref=v1.3.0"
  name               = "orders"
  environment        = "prod"
  instance_class     = "db.r6g.large"
  multi_az           = true
  subnet_ids         = module.network.private_subnet_ids
  security_group_ids = [module.network.db_security_group_id]
}
```

Môi trường dev có thể dùng `ref=v1.4.0` để thử version mới trong khi prod vẫn ở `v1.3.0`. Khác biệt giữa môi trường (kích thước máy, multi-AZ hay không) nằm trong biến, còn **cấu trúc** giữ giống nhau, để staging thực sự phản ánh production.

### Terraform workspace: dùng cẩn thận

**CLI workspace** cho phép một thư mục có nhiều state (`terraform workspace new staging`). Tiện cho môi trường tạm thời (ví dụ môi trường cho từng feature branch), nhưng mọi workspace dùng chung backend và cấu hình credential, rất dễ `apply` nhầm vào prod. Với dev/staging/prod có yêu cầu cách ly và phân quyền khác nhau, thư mục riêng (và tốt nhất là **account/subscription/project cloud riêng** cho mỗi môi trường) an toàn hơn. Công cụ như Terragrunt giúp giảm lặp lại cấu hình backend giữa các thư mục.

### Quy trình qua pipeline

```text
PR mở  -> fmt, validate, lint (tflint), quét bảo mật (Checkov/Trivy)
       -> terraform plan cho môi trường bị ảnh hưởng, đăng kết quả vào PR
review -> người duyệt đọc plan, không chỉ đọc code
merge  -> apply đúng plan đã duyệt (dev/staging tự động, prod cần approve)
hằng đêm -> plan định kỳ để phát hiện drift
```

Credential cho pipeline nên là danh tính ngắn hạn (ví dụ GitHub Actions dùng OIDC để assume role trên AWS) thay vì access key dài hạn lưu trong secret. Có thể bổ sung **policy as code** (OPA/Conftest, Sentinel) để chặn những cấu hình vi phạm chuẩn, ví dụ bucket public hoặc database không mã hoá.

## So sánh Terraform với CloudFormation, Bicep, Pulumi

| Công cụ | Ngôn ngữ | State | Phạm vi | Điểm mạnh | Điểm yếu |
|---|---|---|---|---|---|
| Terraform / OpenTofu | HCL | File state, cần backend | Đa cloud và SaaS (hàng nghìn provider) | Một công cụ cho mọi nền tảng, cộng đồng lớn | Phải tự quản lý state; HCL hạn chế khi logic phức tạp |
| AWS CloudFormation | YAML/JSON (CDK cho Java, TypeScript...) | AWS quản lý (stack) | Chỉ AWS | Không cần lo state, change set, rollback stack tự động | Chỉ AWS, template dài dòng, đôi khi chậm hỗ trợ dịch vụ mới |
| Azure Bicep | DSL riêng, biên dịch sang ARM template | Không có file state, đối chiếu trực tiếp với Azure | Chỉ Azure | Cú pháp gọn, hỗ trợ dịch vụ Azure mới sớm, có `what-if` | Chỉ Azure |
| Pulumi | Java, TypeScript, Python, Go, C# | Pulumi Cloud hoặc backend tự quản (S3, Blob...) | Đa cloud | Dùng ngôn ngữ lập trình thật: vòng lặp, test, IDE | Dễ viết code "quá thông minh", khó đọc hơn khai báo thuần |

Ví dụ Pulumi bằng Java, gần gũi với developer Java:

```java
import com.pulumi.Pulumi;
import com.pulumi.aws.s3.Bucket;
import com.pulumi.aws.s3.BucketArgs;

public class App {
    public static void main(String[] args) {
        Pulumi.run(ctx -> {
            var logs = new Bucket("app-logs", BucketArgs.builder().build());
            ctx.export("bucketName", logs.bucket());
        });
    }
}
```

Cách chọn công cụ trong thực tế:

- Tổ chức chỉ dùng một cloud và muốn ít vận hành: công cụ gốc (CloudFormation/CDK trên AWS, Bicep trên Azure) là lựa chọn hợp lý.
- Đa cloud hoặc cần quản lý cả SaaS (DNS, monitoring, GitHub): Terraform/OpenTofu.
- Team mạnh về lập trình, cần logic phức tạp hoặc muốn viết unit test cho hạ tầng: Pulumi hoặc CDK.
- Quan trọng hơn công cụ là **một chuẩn chung** cho tổ chức: cách đặt tên, cấu trúc module, quy trình review. Hai công cụ IaC song song cho cùng một loại tài nguyên thường gây rối.

## Lỗi thường gặp

- **State nằm trên máy cá nhân hoặc commit vào Git**: mất state hoặc lộ secret. Dùng remote backend có locking, mã hoá, versioning.
- **Một state khổng lồ cho mọi thứ**: plan chậm, một lỗi nhỏ có thể ảnh hưởng toàn hệ thống. Chia state theo môi trường và theo lớp.
- **Apply không đọc plan**: database bị xoá và tạo lại vì một thay đổi thuộc tính. Đọc kỹ các dòng `-/+`, bật `deletion_protection` và `lifecycle { prevent_destroy = true }` cho tài nguyên quan trọng.
- **Gọi module bằng nhánh `main` thay vì version**: thay đổi module ảnh hưởng ngay tới prod. Pin theo tag.
- **Dùng workspace để tách prod với dev trong cùng account**: dễ apply nhầm. Tách thư mục, backend và account.
- **Sửa tay trên console "cho nhanh"**: tạo drift, lần apply sau ghi đè hoặc lỗi. Mọi thay đổi đi qua code; chạy plan định kỳ để phát hiện drift.
- **Đưa mật khẩu vào biến `.tfvars`**: vẫn rơi vào state và lịch sử Git. Dùng secret manager và để dịch vụ tự sinh mật khẩu khi có thể.

## Bài tập thực hành

1. **Module đầu tiên**: viết module `network` tạo VPC với public/private subnet trên hai Availability Zone, đầu ra là danh sách subnet ID. Thêm `validation` cho biến CIDR và viết README mô tả đầu vào/đầu ra. Có thể dùng LocalStack nếu không muốn tạo tài nguyên thật.
2. **Remote state và nhiều môi trường**: tạo bucket state có versioning, cấu hình backend với locking. Dựng cấu trúc `envs/dev` và `envs/staging` gọi cùng module với tham số khác nhau. Mở hai terminal cùng chạy `terraform apply` để quan sát cơ chế khoá.
3. **So sánh công cụ**: viết cùng một bucket lưu trữ có mã hoá và versioning bằng Terraform và bằng Pulumi Java (hoặc CDK Java). So sánh số dòng, cách xem trước thay đổi, nơi lưu state, rồi viết một ADR ngắn đề xuất công cụ IaC cho công ty của bạn.

## Tóm tắt

- IaC biến hạ tầng thành code khai báo, idempotent, được review và version; giúp tái lập môi trường và phát hiện drift.
- Terraform module đóng gói một khối hạ tầng có ý nghĩa, đầu vào có validation, mặc định an toàn, không chứa provider/backend, được pin theo version.
- State phải nằm ở remote backend có locking, mã hoá, versioning, giới hạn quyền và được chia nhỏ để giảm blast radius.
- Mỗi môi trường có thư mục, backend và tốt nhất là account riêng; khác biệt nằm ở biến, cấu trúc giữ nguyên.
- Pipeline IaC: lint, quét bảo mật, plan trên PR, apply đúng plan đã duyệt, plan định kỳ để bắt drift.
- CloudFormation và Bicep phù hợp khi gắn với một cloud; Terraform/OpenTofu mạnh ở đa nền tảng; Pulumi/CDK hợp với team muốn dùng ngôn ngữ lập trình thật.
