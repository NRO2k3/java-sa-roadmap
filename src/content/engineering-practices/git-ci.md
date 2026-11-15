Cách team dùng Git và CI quyết định tốc độ đưa code lên production nhiều hơn bạn nghĩ. Nhánh sống quá lâu thì merge đau đớn; nhánh chính không được bảo vệ thì một commit lỗi có thể chặn cả team; pipeline không có quality gate thì chất lượng chỉ dựa vào trí nhớ của reviewer. Dev Lead cần chọn chiến lược nhánh phù hợp, cấu hình repository để quy tắc được **thực thi tự động**, và xây pipeline CI cho phản hồi nhanh, đáng tin. Bài này đi qua từng phần, kèm cấu hình mẫu dùng được ngay.

## Mục tiêu bài học

- So sánh trunk-based development, GitHub Flow và GitFlow, chọn được chiến lược cho team.
- Cấu hình branch protection, required status check và CODEOWNERS.
- Viết commit theo Conventional Commits và đánh version theo Semantic Versioning.
- Xây pipeline CI với quality gate gồm test, coverage và SonarQube.

## Chiến lược nhánh

### GitFlow

**GitFlow** (Vincent Driessen đề xuất năm 2010) dùng nhiều nhánh sống lâu:

- `main`: chỉ chứa code đã release, mỗi release gắn tag.
- `develop`: nơi tích hợp các tính năng cho release tiếp theo.
- `feature/*`: tách từ `develop`, merge lại `develop` khi xong.
- `release/*`: tách từ `develop` để ổn định trước khi phát hành, merge vào cả `main` và `develop`.
- `hotfix/*`: tách từ `main` để sửa gấp, merge vào cả `main` và `develop`.

GitFlow phù hợp với phần mềm **có version phát hành rời rạc** và phải hỗ trợ nhiều version cùng lúc: thư viện, ứng dụng cài đặt tại chỗ (on-premise), app mobile qua cửa hàng ứng dụng. Nhược điểm: nhiều nhánh, merge hai chiều dễ sót, feature branch dễ sống hàng tuần và tích hợp muộn. Chính tác giả GitFlow sau này đã thêm ghi chú rằng với ứng dụng web được deliver liên tục, nên cân nhắc quy trình đơn giản hơn như GitHub Flow.

### GitHub Flow

Một nhánh chính `main` luôn deploy được, mỗi thay đổi đi qua một nhánh ngắn và một pull request. Sau khi review và CI xanh thì merge, rồi deploy. Đơn giản, phù hợp đa số team làm web service.

### Trunk-based development

**Trunk-based development** đẩy ý tưởng tích hợp sớm đến cùng: mọi người tích hợp vào nhánh chính (trunk) ít nhất mỗi ngày, qua nhánh rất ngắn (vài giờ đến một hai ngày) hoặc commit trực tiếp nếu team đủ trưởng thành. Tính năng chưa xong được ẩn bằng **feature flag** thay vì nằm trên nhánh riêng. Nếu cần ổn định một bản phát hành, có thể tạo nhánh release từ trunk; bug được sửa trên trunk trước rồi cherry-pick sang nhánh release, không làm ngược lại.

```text
GitFlow (rút gọn):

feature/x       ●──●──●──●            (sống vài ngày đến vài tuần)
               /          \
develop  ──●──●──●──●──────●──●──●─────●──
                              \       / (merge ngược về develop)
release/1.1                    ●──●──●
                                      \
main     ──●───────────────────────────●──  (tag v1.1)

Trunk-based:
main     ──●──●──●──●──●──●──●──●──●──   (deploy liên tục, flag ẩn tính năng dở)
            \/    \/       \/
          nhánh ngắn vài giờ, merge qua PR nhỏ
```

### Chọn chiến lược nào

| Tiêu chí | Trunk-based / GitHub Flow | GitFlow |
|---|---|---|
| Kiểu sản phẩm | Web service deploy liên tục | Phần mềm có version, hỗ trợ nhiều bản song song |
| Thời gian sống của nhánh | Giờ đến 1-2 ngày | Ngày đến tuần |
| Điều kiện cần | Test tự động tốt, feature flag, CI nhanh | Quy trình release rõ ràng, người quản lý merge |
| Rủi ro chính | Code dở lên trunk nếu thiếu flag và test | Merge conflict lớn, tích hợp muộn |

Với team làm microservice Spring Boot deploy lên Kubernetes, lựa chọn mặc định hợp lý là **GitHub Flow tiến dần tới trunk-based**: nhánh ngắn, PR nhỏ, merge nhiều lần mỗi ngày. Nghiên cứu của DORA cũng coi trunk-based development là một trong các năng lực kỹ thuật gắn với hiệu quả delivery cao. Nhưng đừng áp trunk-based khi team chưa có test tự động đáng tin: khi đó bạn chỉ chuyển rủi ro từ "merge đau" sang "trunk hỏng".

## Bảo vệ nhánh chính

Quy tắc chỉ có giá trị khi được thực thi tự động. Trên GitHub, **branch protection rule** (hoặc ruleset, cơ chế mới hơn và linh hoạt hơn) cho nhánh `main` nên bật:

- **Require a pull request before merging**, với số approval tối thiểu (thường là 1, module nhạy cảm là 2).
- **Dismiss stale approvals**: approval bị huỷ khi có commit mới đẩy lên, tránh "approve xong sửa thêm".
- **Require review from Code Owners**: thay đổi ở module nào phải có người phụ trách module đó duyệt.
- **Require status checks to pass**: chọn các job CI bắt buộc (build, test, quality gate). Thêm tuỳ chọn yêu cầu nhánh cập nhật với `main` trước khi merge nếu muốn chắc chắn CI chạy trên code mới nhất; với repo đông người, **merge queue** giải quyết việc này mà không bắt mọi người rebase liên tục.
- **Require conversation resolution**: mọi thread nhận xét phải được giải quyết.
- **Chặn force push và xoá nhánh**, hạn chế quyền bypass, kể cả với admin.

GitLab có các khái niệm tương đương: protected branch, merge request approval rule và code owners.

### CODEOWNERS

File `CODEOWNERS` (đặt ở `.github/`, thư mục gốc hoặc `docs/`) khai báo ai sở hữu phần nào của repo. Khi PR chạm vào file tương ứng, GitHub tự thêm owner làm reviewer; kết hợp với "Require review from Code Owners", owner phải approve mới merge được.

```text
# Mặc định: cả team backend sở hữu mọi file
*                                   @example-org/backend-team

# Module thanh toán cần người hiểu nghiệp vụ thanh toán
/payment/                           @example-org/payment-owners

# Migration DB cần người có kinh nghiệm DB xem
/src/main/resources/db/migration/   @example-org/db-reviewers

# Pipeline CI và cấu hình build
/.github/                           @example-org/platform-team
pom.xml                             @example-org/tech-leads
```

Cú pháp giống `.gitignore`, và **dòng khớp cuối cùng được ưu tiên**, nên đặt quy tắc chung ở trên, quy tắc cụ thể ở dưới. Owner phải có quyền write trên repo. Dùng team thay vì cá nhân để không phụ thuộc một người đang nghỉ phép, và tránh đặt Lead làm owner của mọi thứ.

## Conventional Commits và Semantic Versioning

### Conventional Commits

**Conventional Commits** là quy ước viết commit message có cấu trúc để cả người và máy đọc được:

```text
<type>[scope tuỳ chọn]: <mô tả ngắn>

[body tuỳ chọn]

[footer tuỳ chọn]
```

Hai type có ý nghĩa đặc biệt trong đặc tả là `feat` (tính năng mới) và `fix` (sửa lỗi). Các type khác phổ biến theo quy ước của Angular/commitlint: `refactor`, `perf`, `test`, `docs`, `build`, `ci`, `chore`. Thay đổi phá vỡ tương thích được đánh dấu bằng dấu `!` sau type/scope hoặc footer `BREAKING CHANGE:`.

```text
feat(order): hỗ trợ thanh toán bằng ví điện tử

fix(payment): không gửi lại yêu cầu charge khi timeout

Thêm idempotency key để provider bỏ qua yêu cầu trùng.
Refs: PAY-412

feat(api)!: đổi trường amount từ số nguyên sang chuỗi thập phân

BREAKING CHANGE: client phải parse "amount" dạng string, ví dụ "125000.50".
```

Lợi ích: lịch sử dễ đọc, có thể sinh changelog và tính version tiếp theo tự động bằng công cụ như semantic-release hoặc release-please. Thực thi quy ước bằng commitlint trong CI, hoặc đơn giản hơn: dùng "squash merge" và kiểm tra **tiêu đề PR** theo quy ước, vì tiêu đề PR sẽ thành commit message trên `main`.

### Semantic Versioning

**Semantic Versioning** (SemVer) đánh version dạng `MAJOR.MINOR.PATCH`:

- **MAJOR** tăng khi có thay đổi không tương thích ngược với API công khai.
- **MINOR** tăng khi thêm tính năng mới nhưng vẫn tương thích ngược.
- **PATCH** tăng khi sửa lỗi tương thích ngược.

Ánh xạ với Conventional Commits rất tự nhiên: `fix` tăng PATCH, `feat` tăng MINOR, `!`/`BREAKING CHANGE` tăng MAJOR. Một số chi tiết đáng nhớ: version `0.y.z` dành cho giai đoạn phát triển ban đầu, khi API có thể thay đổi bất kỳ lúc nào; pre-release viết dạng `2.0.0-rc.1` và có thứ tự ưu tiên thấp hơn `2.0.0`.

SemVer quan trọng nhất với **thứ người khác phụ thuộc vào**: thư viện nội bộ, SDK client, schema event, API công khai. Với một service chỉ deploy nội bộ, version thường chỉ cần định danh được build (ví dụ số build kèm commit SHA); điều quan trọng hơn là giữ API của service tương thích ngược.

## Pipeline CI với quality gate

**Continuous Integration** là thực hành tích hợp code vào nhánh chính thường xuyên, mỗi lần tích hợp đều được build và test tự động. Một pipeline CI tốt cho PR cần **nhanh** (lý tưởng dưới khoảng 10 phút, để dev chờ được), **đáng tin** (đỏ là có lỗi thật) và **đầy đủ** (cùng các bước sẽ chạy khi release).

**Quality gate** là tập điều kiện mà thay đổi phải đạt mới được merge: build pass, test xanh, coverage trên code mới đạt ngưỡng, không có lỗi nghiêm trọng mới theo phân tích tĩnh. Ví dụ workflow GitHub Actions cho service Maven:

```yaml
name: ci
on:
  pull_request:
  push:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0 # SonarQube cần lịch sử git để xác định "new code"
      - uses: actions/setup-java@v4
        with:
          distribution: temurin
          java-version: '21'
          cache: maven
      - name: Build, unit + integration test, coverage
        run: ./mvnw -B verify # gồm Spotless check, test, báo cáo JaCoCo
      - name: SonarQube analysis và chờ quality gate
        env:
          SONAR_TOKEN: ${{ secrets.SONAR_TOKEN }}
          SONAR_HOST_URL: ${{ secrets.SONAR_HOST_URL }}
        run: >
          ./mvnw -B org.sonarsource.scanner.maven:sonar-maven-plugin:sonar
          -Dsonar.qualitygate.wait=true
      - name: Lưu báo cáo test khi thất bại
        if: failure()
        uses: actions/upload-artifact@v4
        with:
          name: test-reports
          path: '**/target/surefire-reports/'
```

Các điểm cần lưu ý:

- `-Dsonar.qualitygate.wait=true` khiến bước Sonar chờ kết quả quality gate và **thất bại nếu gate đỏ**, nhờ đó job có thể là required check.
- Coverage do **JaCoCo** đo (plugin `jacoco-maven-plugin` với goal `prepare-agent` và `report`); SonarQube đọc file báo cáo XML ở đường dẫn mặc định `target/site/jacoco/jacoco.xml`.
- Quality gate mặc định "Sonar way" áp điều kiện lên **new code**, như coverage trên code mới tối thiểu 80% và tỉ lệ trùng lặp trên code mới không quá 3%. Cách tiếp cận này phù hợp với codebase cũ: không bắt sửa hết nợ cũ, chỉ không cho phép thêm nợ mới.
- PR từ fork không đọc được secrets của repo, nên bước Sonar cần xử lý riêng nếu dự án nhận đóng góp từ bên ngoài.

### Giữ pipeline nhanh

- Cache dependency (`cache: maven`), chạy song song các module hoặc các job độc lập.
- Tách test chậm (E2E, mutation testing) sang pipeline chạy định kỳ hoặc sau merge, không chặn PR.
- Theo dõi thời gian pipeline như một chỉ số của team; pipeline chậm dần là nợ kỹ thuật thật sự.
- Build artifact (JAR, Docker image) **một lần**, dùng lại cùng artifact đó cho mọi môi trường thay vì build lại.

## Lỗi thường gặp

- **Feature branch sống hàng tuần**: merge cuối sprint thành "địa ngục merge". Cách sửa: chia nhỏ, merge hằng ngày, dùng feature flag cho phần chưa hoàn thiện.
- **Áp GitFlow cho web service deploy liên tục**: nhánh `develop` và `release` chỉ thêm bước mà không thêm giá trị. Cách sửa: chuyển sang GitHub Flow hoặc trunk-based.
- **Branch protection có nhưng admin bypass thường xuyên**: quy tắc mất ý nghĩa. Cách sửa: không cho bypass, có quy trình hotfix rõ ràng thay vì ngoại lệ.
- **Required check flaky**: team quen bấm chạy lại hoặc xin bỏ check. Cách sửa: xử lý flaky test như bug ưu tiên cao.
- **Commit message vô nghĩa** ("fix", "update", "wip"): không sinh được changelog, khó điều tra khi có sự cố. Cách sửa: squash merge và kiểm tra tiêu đề PR theo Conventional Commits.
- **Quality gate trên toàn bộ code cũ**: gate đỏ vĩnh viễn, team bỏ qua. Cách sửa: áp điều kiện lên new code.

## Bài tập thực hành

1. **Chọn chiến lược nhánh**: viết một ADR ngắn cho team so sánh chiến lược hiện tại với trunk-based/GitHub Flow theo các tiêu chí trong bảng trên, nêu những gì cần có trước khi chuyển (feature flag, thời gian CI, độ phủ test).
2. **Cấu hình repository**: trên một repo thử nghiệm, bật branch protection hoặc ruleset cho `main`, tạo file CODEOWNERS có ít nhất ba quy tắc, tạo PR chạm vào từng vùng và quan sát reviewer được gán tự động.
3. **Pipeline với quality gate**: dựng workflow GitHub Actions như ví dụ cho một service Spring Boot, thêm JaCoCo và SonarQube (có thể chạy SonarQube Community bằng Docker), cố ý tạo PR giảm coverage để thấy gate đỏ chặn merge.

## Tóm tắt

- GitFlow hợp với phần mềm có version phát hành rời rạc; web service deploy liên tục nên dùng GitHub Flow hoặc trunk-based với nhánh ngắn và feature flag.
- Branch protection, required status check và CODEOWNERS biến quy tắc của team thành ràng buộc tự động.
- Conventional Commits giúp lịch sử dễ đọc và tự động sinh changelog, version.
- SemVer: MAJOR cho thay đổi phá vỡ, MINOR cho tính năng tương thích, PATCH cho sửa lỗi; quan trọng nhất với thư viện và API công khai.
- Pipeline CI cần nhanh, đáng tin và có quality gate; dùng `sonar.qualitygate.wait` để gate thật sự chặn merge.
- Áp quality gate lên new code để cải thiện dần codebase cũ mà không làm team nản.
