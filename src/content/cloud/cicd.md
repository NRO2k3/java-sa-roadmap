Một kiến trúc tốt mà triển khai bằng tay, mỗi lần release mất nửa ngày và hồi hộp thì vẫn là một kiến trúc kém. CI/CD (Continuous Integration / Continuous Delivery) biến việc build, kiểm tra và triển khai thành một dây chuyền tự động, lặp lại được và có thể kiểm toán. Với Solution Architect, pipeline chính là nơi các chuẩn mực về chất lượng và bảo mật được thực thi thật sự, còn chiến lược deploy quyết định việc phát hành có ảnh hưởng tới người dùng hay không.

## Mục tiêu bài học

- Thiết kế pipeline CI/CD cho ứng dụng Java bằng GitHub Actions, hiểu cách tương đương trong Jenkins.
- Tích hợp các cổng chất lượng (quality gate): test, SonarQube, quét lỗ hổng dependency và image.
- So sánh và chọn chiến lược deploy: rolling, blue-green, canary, kèm điều kiện về database.
- Áp dụng GitOps với Argo CD: tách repo cấu hình, đồng bộ tự động, promote giữa các môi trường.

## CI, CD và pipeline

- **Continuous Integration (CI)**: mỗi thay đổi được merge thường xuyên vào nhánh chính và được build, test tự động. Mục tiêu là phát hiện lỗi sớm, khi thay đổi còn nhỏ.
- **Continuous Delivery**: mọi commit qua được pipeline đều ở trạng thái *có thể* release; việc đưa lên production có thể còn một bước bấm duyệt.
- **Continuous Deployment**: không còn bước duyệt thủ công, commit qua pipeline sẽ tự lên production. Đòi hỏi test tự động và khả năng quan sát (observability) rất tốt.

Một pipeline điển hình cho microservice Java:

```text
 commit/PR
    |
    v
[Build + Unit test] -> [Integration test] -> [SonarQube + Quality gate]
    |                                              |
    v                                              v
[Dependency scan]  ------------------------> [Build image + Image scan]
                                                   |
                                                   v
                               [Push registry (tag = commit SHA)]
                                                   |
                                                   v
                     [Cập nhật repo cấu hình] -> Argo CD sync -> staging
                                                   |
                                          (PR duyệt promote)
                                                   v
                                               production
```

Nguyên tắc quan trọng: **build một lần, deploy nhiều nơi**. Image được build và gắn tag bằng commit SHA đúng một lần; staging và production chạy cùng một image, chỉ khác cấu hình. Nếu build lại cho từng môi trường, thứ bạn test không còn chắc chắn là thứ bạn release.

## Xây dựng pipeline với GitHub Actions

GitHub Actions định nghĩa **workflow** bằng YAML trong `.github/workflows/`. Workflow được kích hoạt bởi **event** (push, pull_request, lịch chạy...), gồm nhiều **job** chạy trên **runner**, mỗi job có nhiều **step**; step có thể là lệnh shell hoặc một **action** tái sử dụng.

```yaml
name: ci
on:
  push:
    branches: [main]
  pull_request:

permissions:
  contents: read

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0   # SonarQube cần lịch sử git để xác định "new code"
      - uses: actions/setup-java@v4
        with:
          distribution: temurin
          java-version: '21'
          cache: maven
      - name: Build + unit/integration test
        run: ./mvnw -B verify
      - name: Quét lỗ hổng dependency
        run: ./mvnw -B org.owasp:dependency-check-maven:check -DfailBuildOnCVSS=7
      - name: SonarQube + chờ quality gate
        run: >
          ./mvnw -B sonar:sonar
          -Dsonar.host.url=${{ secrets.SONAR_HOST_URL }}
          -Dsonar.token=${{ secrets.SONAR_TOKEN }}
          -Dsonar.qualitygate.wait=true
```

Job thứ hai chỉ chạy trên `main`, build và đẩy image lên registry:

```yaml
  image:
    needs: build
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    permissions:
      contents: read
      packages: write
    steps:
      - uses: actions/checkout@v4
      - uses: docker/setup-buildx-action@v3
      - uses: docker/login-action@v3
        with:
          registry: ghcr.io
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}
      - uses: docker/build-push-action@v6
        with:
          context: .
          push: true
          tags: ghcr.io/example-org/order-service:${{ github.sha }}
```

Vài điểm thiết kế đáng chú ý:

- `permissions` tối thiểu ở mức workflow, chỉ cấp `packages: write` cho job cần push image (nguyên tắc least privilege).
- `needs: build` bảo đảm không có image nào được tạo khi test hoặc quality gate thất bại.
- Secret (token Sonar, mật khẩu registry) lưu trong GitHub Secrets, không bao giờ viết vào YAML.
- Với action của bên thứ ba, nhiều tổ chức yêu cầu pin theo commit SHA thay vì tag, vì tag có thể bị dịch chuyển nếu repo action bị chiếm quyền.
- Cache Maven (`cache: maven`) giảm đáng kể thời gian build lặp lại.

### Jenkins: khi nào vẫn hợp lý

Jenkins là CI server tự host, cấu hình pipeline bằng `Jenkinsfile` (Groovy). Các bước tương đương:

```text
pipeline {
  agent any
  stages {
    stage('Build & Test') { steps { sh './mvnw -B verify' } }
    stage('Sonar') {
      steps { withSonarQubeEnv('sonar') { sh './mvnw -B sonar:sonar' } }
    }
    stage('Quality Gate') {
      steps { timeout(time: 10, unit: 'MINUTES') { waitForQualityGate abortPipeline: true } }
    }
  }
}
```

| Tiêu chí | GitHub Actions | Jenkins |
|---|---|---|
| Vận hành | SaaS, runner có sẵn (có thể tự host runner) | Tự cài đặt, tự vá, tự scale agent |
| Hệ sinh thái | Marketplace action, tích hợp sâu với GitHub (PR, Packages) | Rất nhiều plugin, nhưng plugin cũ dễ gây lỗi khi nâng cấp |
| Phù hợp | Code đã ở GitHub, muốn ít vận hành | Môi trường on-premise, mạng cách ly, quy trình đặc thù, đã đầu tư lớn |

Quyết định không chỉ là kỹ thuật: hãy tính chi phí vận hành Jenkins (bảo mật, nâng cấp plugin, backup) so với chi phí phút chạy runner.

## Cổng chất lượng trong pipeline

### Test

Pipeline chạy unit test ở mọi commit, integration test (ví dụ với Testcontainers khởi động PostgreSQL, Kafka thật trong Docker) trước khi merge. Test chậm và chập chờn (flaky) là kẻ thù của CI: nếu developer quen bấm "re-run" mỗi khi đỏ, pipeline mất giá trị. Hãy theo dõi và sửa flaky test như sửa bug.

### SonarQube và quality gate

**SonarQube** phân tích tĩnh code: bug tiềm ẩn, code smell, lỗ hổng bảo mật, độ phủ test (lấy từ báo cáo JaCoCo), code trùng lặp. **Quality gate** là bộ điều kiện pass/fail, ví dụ: không có lỗi bảo mật mới, coverage của code mới ≥ 80%. Thực hành tốt là áp gate lên **new code** (phần thay đổi) thay vì toàn bộ codebase, để dự án legacy vẫn cải thiện dần mà không bị chặn vĩnh viễn. Tham số `sonar.qualitygate.wait=true` khiến bước phân tích chờ kết quả gate và làm pipeline thất bại nếu gate không đạt.

### Quét lỗ hổng

- **Dependency (SCA, Software Composition Analysis)**: OWASP Dependency-Check, Snyk, GitHub Dependabot đối chiếu thư viện với cơ sở dữ liệu CVE. Dependency-Check nên được cấu hình NVD API key và cache dữ liệu, nếu không mỗi lần chạy sẽ rất chậm.
- **Image**: Trivy, Grype quét cả gói hệ điều hành trong base image, thứ mà quét dependency Maven không thấy.
- **Ngưỡng**: chặn build theo mức độ nghiêm trọng (ví dụ CVSS ≥ 7), kèm cơ chế ngoại lệ có thời hạn (suppression file được review) để không bị kẹt bởi lỗ hổng chưa có bản vá.

Ngoài ra, có thể tạo **SBOM** (Software Bill of Materials, danh sách thành phần trong artifact) bằng CycloneDX để phục vụ kiểm toán và tra cứu nhanh khi có lỗ hổng mới.

## Chiến lược deploy

### Rolling update

Mặc định của Kubernetes Deployment: thay dần Pod cũ bằng Pod mới.

```yaml
spec:
  minReadySeconds: 10
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 1         # được tạo thêm tối đa 1 Pod vượt số replica
      maxUnavailable: 0   # không lúc nào giảm dưới số replica mong muốn
```

Ưu điểm: đơn giản, không tốn thêm nhiều tài nguyên. Nhược điểm: trong lúc rollout, phiên bản cũ và mới **cùng phục vụ traffic**, nên API và schema DB phải tương thích hai chiều; rollback cũng là một lần rollout ngược, không tức thì. Readiness probe chính xác là điều kiện bắt buộc, nếu không Pod mới nhận traffic trước khi sẵn sàng.

### Blue-green

Chạy song song hai môi trường: **blue** (đang phục vụ) và **green** (phiên bản mới). Kiểm tra green xong thì chuyển toàn bộ traffic sang một lần, ví dụ đổi selector của Service:

```yaml
apiVersion: v1
kind: Service
metadata:
  name: order-service
spec:
  selector:
    app: order-service
    version: green   # đổi từ blue sang green để chuyển traffic
  ports:
    - port: 80
      targetPort: 8080
```

Ưu điểm: rollback gần như tức thì (đổi selector về blue), có thể smoke test green bằng traffic nội bộ trước. Nhược điểm: cần gấp đôi tài nguyên trong lúc chuyển; vấn đề lớn nhất là **database dùng chung**: nếu green chạy migration phá vỡ schema, blue không còn chạy được và rollback mất ý nghĩa.

### Canary

Đưa phiên bản mới cho một phần nhỏ traffic, theo dõi metric (error rate, latency), rồi tăng dần. Kubernetes thuần không chia traffic theo phần trăm; cần ingress controller, service mesh, hoặc công cụ như **Argo Rollouts** / Flagger:

```yaml
apiVersion: argoproj.io/v1alpha1
kind: Rollout
metadata:
  name: order-service
spec:
  replicas: 10
  strategy:
    canary:
      steps:
        - setWeight: 10
        - pause: { duration: 10m }
        - setWeight: 50
        - pause: { duration: 10m }
  # selector và template giống Deployment, lược bớt cho gọn
```

Nếu không cấu hình traffic routing, Argo Rollouts xấp xỉ tỉ lệ bằng số Pod (10% của 10 replica là 1 Pod). Có thể gắn **AnalysisTemplate** để tự động truy vấn Prometheus và tự rollback khi error rate vượt ngưỡng; đây là điểm khiến canary thực sự an toàn chứ không chỉ là "deploy chậm".

### So sánh và điều kiện về database

| Chiến lược | Tài nguyên thêm | Tốc độ rollback | Rủi ro ảnh hưởng người dùng | Độ phức tạp |
|---|---|---|---|---|
| Rolling | Thấp | Trung bình (rollout ngược) | Lỗi lan dần tới mọi người | Thấp |
| Blue-green | Gấp đôi trong lúc chuyển | Rất nhanh | Toàn bộ người dùng cùng lúc sau khi chuyển | Trung bình |
| Canary | Thấp đến trung bình | Nhanh | Chỉ nhóm nhỏ bị ảnh hưởng | Cao (cần chia traffic, metric) |

Cả ba chiến lược đều có giai đoạn hai phiên bản cùng tồn tại với một database. Vì vậy thay đổi schema phải theo **expand/contract** (mở rộng rồi thu hẹp): bản phát hành 1 chỉ *thêm* cột/bảng mới và ghi cả hai nơi; khi không còn bản cũ chạy, bản phát hành 2 mới *xoá* cột cũ. Công cụ migration như Flyway hay Liquibase giúp quản lý phiên bản schema nhưng không tự đảm bảo tính tương thích này.

## GitOps với Argo CD

### Nguyên tắc GitOps

**GitOps** là cách vận hành trong đó Git là nguồn sự thật duy nhất cho trạng thái mong muốn của hệ thống. Bốn nguyên tắc (theo OpenGitOps): trạng thái được khai báo (declarative); được lưu có phiên bản và bất biến (Git); được **kéo (pull)** tự động bởi agent; và được **đối chiếu liên tục** (continuously reconciled) với trạng thái thật.

Khác biệt với mô hình **push** truyền thống (CI chạy `kubectl apply` hay `helm upgrade` vào cluster):

| | Push (CI deploy) | Pull (GitOps) |
|---|---|---|
| Ai giữ quyền vào cluster | CI server (rủi ro nếu CI bị lộ) | Agent chạy bên trong cluster |
| Phát hiện drift (ai đó sửa tay) | Không | Có, có thể tự sửa lại |
| Audit và rollback | Dựa vào log CI | `git log`, `git revert` |

### Cấu trúc repo và luồng promote

Thông thường tách **app repo** (source code, CI build image) và **config repo** (Helm values/Kustomize cho từng môi trường). CI không deploy trực tiếp mà chỉ cập nhật tag image trong config repo:

```bash
# Bước cuối của CI, chạy trong bản clone của config repo
TAG="$GITHUB_SHA" yq -i '.image.tag = strenv(TAG)' apps/order-service/values-staging.yaml
git commit -am "order-service: staging -> $GITHUB_SHA"
git push
```

Promote lên production là một **Pull Request** đổi tag trong `values-prod.yaml`, được review và duyệt như code. Một lựa chọn khác là Argo CD Image Updater tự theo dõi registry và cập nhật tag.

### Argo CD Application

**Argo CD** là controller chạy trong cluster, theo dõi config repo và đồng bộ (sync) tài nguyên. Mỗi ứng dụng được khai báo bằng một `Application`:

```yaml
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: order-service-staging
  namespace: argocd
spec:
  project: default
  source:
    repoURL: https://github.com/example-org/gitops-config.git
    targetRevision: main
    path: apps/order-service
    helm:
      valueFiles:
        - values-staging.yaml
  destination:
    server: https://kubernetes.default.svc
    namespace: staging
  syncPolicy:
    automated:
      prune: true      # xoá tài nguyên đã bị bỏ khỏi Git
      selfHeal: true   # tự sửa lại khi có người chỉnh tay trên cluster
    syncOptions:
      - CreateNamespace=true
```

Khi có nhiều service và nhiều cluster, dùng mẫu **App of Apps** hoặc **ApplicationSet** để sinh `Application` tự động từ cấu trúc thư mục hoặc danh sách cluster. Với production, nhiều team tắt `automated` và sync thủ công sau khi PR được merge, hoặc giới hạn sync window, để có thêm một lớp kiểm soát.

Lưu ý: GitOps không giải quyết chuyện secret. Đừng commit Secret thô vào config repo; dùng Sealed Secrets, External Secrets Operator hoặc secret manager của cloud.

## Lỗi thường gặp

- **Build lại image cho từng môi trường**: staging và production chạy artifact khác nhau. Build một lần, promote cùng một image theo tag SHA hoặc digest.
- **Quality gate chỉ để "tham khảo"**: báo cáo đỏ nhưng pipeline vẫn xanh, sau vài tuần không ai đọc. Gate phải chặn được merge, kèm quy trình ngoại lệ rõ ràng.
- **Áp quality gate lên toàn bộ code legacy**: pipeline đỏ vĩnh viễn, team tìm cách bỏ qua. Áp lên new code.
- **CI giữ kubeconfig quyền admin của production**: một lỗ hổng ở CI đồng nghĩa mất cluster. Chuyển sang mô hình pull (GitOps) hoặc giới hạn quyền thật hẹp.
- **Blue-green/canary nhưng migration DB phá vỡ tương thích**: rollback không dùng được. Áp dụng expand/contract.
- **Canary không có metric và tiêu chí dừng**: chỉ là deploy chậm hơn. Định nghĩa trước ngưỡng error rate, latency và tự động hoá rollback.
- **Sửa tay trên cluster rồi quên**: Argo CD báo OutOfSync hoặc selfHeal ghi đè thay đổi. Mọi thay đổi đi qua Git.

## Bài tập thực hành

1. **Pipeline đầy đủ**: cho một ứng dụng Spring Boot trên GitHub, viết workflow gồm build, test với Testcontainers, JaCoCo, SonarQube (có thể dùng SonarQube Community chạy bằng Docker), OWASP Dependency-Check và build/push image lên GHCR. Cố tình thêm một thư viện có CVE đã biết và một đoạn code không có test để thấy pipeline bị chặn.
2. **GitOps local**: cài Argo CD vào cluster kind/minikube, tạo config repo với Helm chart và hai file `values-staging.yaml`, `values-prod.yaml`. Tạo hai `Application`, thử đổi tag qua commit, thử sửa tay replica trên cluster và quan sát selfHeal.
3. **So sánh chiến lược deploy**: triển khai cùng một service bằng rolling update (`maxUnavailable: 0`) và bằng Argo Rollouts canary. Trong lúc rollout, chạy công cụ tạo tải và ghi lại số request lỗi. Viết một ADR ngắn chọn chiến lược cho service thanh toán của công ty, nêu rõ ràng buộc về database.

## Tóm tắt

- CI phát hiện lỗi sớm; Continuous Delivery giữ mọi commit ở trạng thái release được; Continuous Deployment bỏ cả bước duyệt thủ công.
- Build image một lần, gắn tag bằng commit SHA, promote cùng một artifact qua các môi trường.
- Pipeline là nơi thực thi chuẩn: test, quality gate SonarQube trên new code, quét dependency và image với ngưỡng chặn rõ ràng.
- Rolling đơn giản và tiết kiệm; blue-green rollback nhanh nhưng tốn tài nguyên; canary giảm phạm vi ảnh hưởng nhưng cần chia traffic và metric.
- Mọi chiến lược đều cần schema DB tương thích ngược, theo mô hình expand/contract.
- GitOps với Argo CD: Git là nguồn sự thật, agent trong cluster kéo và đối chiếu liên tục, promote bằng Pull Request, rollback bằng `git revert`.
