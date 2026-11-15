Một giải pháp có thể rất tốt khi nhìn riêng, nhưng vẫn gây hại cho doanh nghiệp nếu nó tạo thêm hệ thống trùng lặp, dùng công nghệ không ai khác vận hành được, hoặc đi ngược chiến lược chung. Enterprise Architecture (EA, kiến trúc doanh nghiệp) và governance (quản trị kiến trúc) là cơ chế giúp hàng chục dự án cùng đi về một hướng. Là SA, bạn vừa phải tuân thủ cơ chế này, vừa góp phần làm nó hiệu quả thay vì trở thành thủ tục hành chính.

## Mục tiêu bài học

- Hiểu chu trình TOGAF ADM và bốn tầng kiến trúc Business, Data, Application, Technology; biết SA tham gia ở đâu.
- Viết nguyên tắc kiến trúc theo cấu trúc chuẩn và biết cách tự động hoá việc tuân thủ.
- Chuẩn bị hồ sơ và tham gia Architecture Review Board (ARB) hiệu quả, tránh để ARB thành nút cổ chai.
- Quản lý technical debt ở cấp danh mục ứng dụng và xây dựng technology radar cho tổ chức.

## Enterprise Architecture và Solution Architecture

| | Enterprise Architect | Solution Architect | Software/Technical Architect |
|---|---|---|---|
| Phạm vi | Toàn doanh nghiệp, nhiều đơn vị | Một sáng kiến hoặc giải pháp, thường nhiều hệ thống | Một hệ thống hoặc vài service |
| Tầm nhìn thời gian | Nhiều năm | Vòng đời dự án và vài năm sau đó | Vài sprint đến vài quý |
| Câu hỏi chính | Doanh nghiệp cần năng lực gì, danh mục hệ thống nên ra sao? | Giải pháp nào đáp ứng yêu cầu này trong khuôn khổ chung? | Hiện thực thế nào cho tốt? |
| Đầu ra tiêu biểu | Nguyên tắc, kiến trúc đích, roadmap, chuẩn công nghệ | Solution Architecture Document, ADR, ước tính chi phí | Thiết kế chi tiết, code, ADR cấp team |

Ranh giới giữa các vai trò không cứng; ở công ty nhỏ, một người có thể kiêm cả ba. Điều quan trọng là SA hiểu "luật chơi" ở cấp doanh nghiệp để giải pháp được phê duyệt nhanh và không phải làm lại.

## TOGAF ADM và bốn tầng kiến trúc

TOGAF (The Open Group Architecture Framework) là framework EA phổ biến do The Open Group duy trì. Phần cốt lõi là ADM (Architecture Development Method): một chu trình lặp để phát triển và quản lý kiến trúc.

### Bốn tầng kiến trúc

| Tầng | Mô tả | Ví dụ trong hệ thống Java của MiniMart |
|---|---|---|
| Business | Chiến lược, tổ chức, quy trình, capability | Quy trình đặt hàng online, capability "Tích điểm & đổi quà" |
| Data | Mô hình dữ liệu, quyền sở hữu, luồng dữ liệu | Thực thể Khách hàng, Đơn hàng; ai là nguồn sự thật của tồn kho |
| Application | Các ứng dụng, trách nhiệm và tích hợp giữa chúng | Order Service, Loyalty Service, ERP; giao tiếp qua REST và sự kiện |
| Technology | Hạ tầng và nền tảng phần mềm | Kubernetes, PostgreSQL, Kafka, JDK 21, Spring Boot 3 |

TOGAF gộp Data và Application thành "Information Systems Architectures". Thứ tự tầng phản ánh nguyên tắc: nghiệp vụ dẫn dắt dữ liệu và ứng dụng, ứng dụng dẫn dắt công nghệ, chứ không phải ngược lại.

### Chu trình ADM

```text
   Preliminary (chuẩn bị, nguyên tắc, khung governance)
        |
        v
   A. Architecture Vision --> B. Business --> C. Data & Application --> D. Technology
        ^                                                                  |
        |                                                                  v
   H. Change Management <-- G. Implementation <-- F. Migration <-- E. Opportunities
                               Governance            Planning         & Solutions

   Requirements Management nằm ở trung tâm, kết nối với mọi pha
```

| Pha | Câu hỏi chính | Đầu ra tiêu biểu |
|---|---|---|
| Preliminary | Tổ chức làm kiến trúc như thế nào? | Nguyên tắc kiến trúc, khung governance, cách điều chỉnh TOGAF cho phù hợp |
| A. Architecture Vision | Vì sao làm, phạm vi, giá trị mang lại? | Tầm nhìn kiến trúc, danh sách stakeholder, Statement of Architecture Work |
| B. Business Architecture | Nghiệp vụ hiện tại và mục tiêu khác nhau thế nào? | Capability, quy trình, tổ chức ở trạng thái hiện tại và mục tiêu |
| C. Information Systems | Dữ liệu và ứng dụng nào hỗ trợ nghiệp vụ? | Mô hình dữ liệu, danh mục ứng dụng, sơ đồ tích hợp |
| D. Technology Architecture | Cần nền tảng, hạ tầng gì? | Chuẩn công nghệ, kiến trúc nền tảng |
| E. Opportunities and Solutions | Gom thay đổi thành những dự án nào? | Work package, kiến trúc chuyển tiếp (transition architecture) |
| F. Migration Planning | Làm theo thứ tự nào, chi phí và rủi ro ra sao? | Kế hoạch triển khai và migration |
| G. Implementation Governance | Dự án có làm đúng kiến trúc không? | Architecture Contract, các đợt review tuân thủ |
| H. Architecture Change Management | Bối cảnh thay đổi thì kiến trúc xử lý thế nào? | Yêu cầu thay đổi, quyết định khởi động một vòng ADM mới |

Ba khái niệm xuyên suốt: **baseline architecture** (kiến trúc hiện tại), **target architecture** (kiến trúc mục tiêu) và **gap analysis** (phân tích khoảng cách giữa hai trạng thái). Khoảng cách lớn thường không thể vượt qua một lần, nên cần các **transition architecture** làm trạng thái trung gian ổn định.

### Dùng TOGAF một cách thực dụng

TOGAF rất rộng và chính nó khuyến khích điều chỉnh (tailoring) cho phù hợp với tổ chức. Đừng cố tạo mọi artifact. Trong thực tế, SA thường làm việc nhiều nhất ở các pha C, D (thiết kế giải pháp trong khuôn khổ chuẩn chung), E, F (đề xuất lộ trình) và G (giải pháp được review tuân thủ). Hiểu ADM giúp bạn nói cùng ngôn ngữ với EA: khi họ hỏi "transition architecture của giai đoạn 1 là gì", bạn biết họ cần trạng thái trung gian nào và vì sao.

## Nguyên tắc kiến trúc

Nguyên tắc kiến trúc (architecture principle) là các quy tắc nền tảng, ổn định, định hướng cho hàng loạt quyết định. TOGAF đề xuất mỗi nguyên tắc có 4 phần: **Name** (tên), **Statement** (phát biểu), **Rationale** (lý do) và **Implications** (hệ quả). Phần hệ quả là phần hay bị bỏ qua nhưng quan trọng nhất, vì nó nói rõ nguyên tắc buộc mọi người phải làm gì khác đi.

```text
NGUYÊN TẮC 1
Tên        : Mỗi tập dữ liệu nghiệp vụ có một nguồn sự thật
Phát biểu  : Mỗi tập dữ liệu (khách hàng, đơn hàng, tồn kho) do đúng một hệ
             thống sở hữu. Hệ thống khác truy cập qua API hoặc sự kiện,
             không đọc/ghi trực tiếp database của hệ thống sở hữu.
Lý do      : Tránh dữ liệu mâu thuẫn, cho phép hệ thống sở hữu thay đổi schema
             mà không làm vỡ hệ thống khác.
Hệ quả     : Cần nền tảng sự kiện dùng chung; báo cáo lấy dữ liệu qua pipeline
             vào kho dữ liệu; tích hợp qua chung database phải được ARB cấp
             ngoại lệ có thời hạn.

NGUYÊN TẮC 2
Tên        : Tái sử dụng trước, mua sau, xây cuối cùng
Phát biểu  : Trước khi xây mới một năng lực, đánh giá hệ thống sẵn có, sau đó
             đến giải pháp mua hoặc SaaS.
Lý do      : Giảm hệ thống trùng lặp và chi phí vận hành, tích hợp.
Hệ quả     : Mọi đề xuất xây mới trình ARB phải có phần build vs buy; danh mục
             ứng dụng phải được cập nhật để mọi người tra cứu.

NGUYÊN TẮC 3
Tên        : Chuẩn hoá trên nền tảng được hỗ trợ
Phát biểu  : Service mới dùng phiên bản Java LTS và Spring Boot đang được hỗ
             trợ, theo technology radar của công ty.
Lý do      : Nhận bản vá bảo mật kịp thời, dễ luân chuyển người giữa các team.
Hệ quả     : Mỗi team dành ngân sách nâng cấp hằng năm; pipeline build chặn
             phiên bản không được hỗ trợ.
```

Một bộ nguyên tắc tốt thường chỉ khoảng 10–20 mục, đủ ngắn để mọi người nhớ. Nguyên tắc chỉ có giá trị khi được thực thi, và cách thực thi tốt nhất là tự động hoá thành "fitness function" trong pipeline. Ví dụ dùng Maven Enforcer để thực thi nguyên tắc 3 và chặn thư viện đã bị đưa vào vòng Hold:

```xml
<plugin>
  <groupId>org.apache.maven.plugins</groupId>
  <artifactId>maven-enforcer-plugin</artifactId>
  <executions>
    <execution>
      <id>enforce-architecture-principles</id>
      <goals>
        <goal>enforce</goal>
      </goals>
      <configuration>
        <rules>
          <requireJavaVersion>
            <version>[21,)</version>
          </requireJavaVersion>
          <bannedDependencies>
            <excludes>
              <!-- Log4j 1.x đã ngừng phát triển, nằm ở vòng Hold -->
              <exclude>log4j:log4j</exclude>
            </excludes>
          </bannedDependencies>
        </rules>
      </configuration>
    </execution>
  </executions>
</plugin>
```

Đặt cấu hình này trong parent POM dùng chung của công ty, mọi service kế thừa sẽ tự động bị kiểm tra.

## Architecture Review Board

Architecture Review Board (ARB, TOGAF gọi là Architecture Board) là nhóm chịu trách nhiệm đảm bảo các giải pháp phù hợp với nguyên tắc, chuẩn và kiến trúc mục tiêu của doanh nghiệp.

### Thành phần và phạm vi

Thường gồm chief architect hoặc EA (chủ trì), SA của các domain, đại diện bảo mật, hạ tầng/platform, dữ liệu, và khi cần có đại diện business. Không phải mọi thay đổi đều cần lên ARB. Nên trình ARB khi:

- Đưa vào công nghệ chưa có trên technology radar hoặc đang ở vòng Hold.
- Thay đổi tích hợp giữa các domain hoặc tạo hệ thống mới.
- Xử lý dữ liệu nhạy cảm, dữ liệu cá nhân, dữ liệu thanh toán.
- Chi phí vượt ngưỡng do tổ chức quy định, hoặc vi phạm một nguyên tắc kiến trúc.

### Hồ sơ trình ARB

```text
HỒ SƠ TRÌNH ARB – <Tên giải pháp>
1. Tóm tắt (1 trang): vấn đề kinh doanh, đề xuất, quyết định cần ARB đưa ra
2. Sơ đồ C4 mức System Context và Container
3. NFR chính dưới dạng kịch bản chất lượng
4. Các ADR quan trọng (phương án đã cân nhắc, đánh đổi)
5. Công nghệ sử dụng, đối chiếu với technology radar
6. Sai khác so với nguyên tắc kiến trúc (nếu có) + lý do + kế hoạch khắc phục
7. Bảo mật & dữ liệu: loại dữ liệu, nơi lưu, phân quyền
8. TCO ước tính và giả định
9. Rủi ro chính và cách giảm thiểu
```

Gửi hồ sơ trước buổi họp vài ngày để thành viên đọc và góp ý bất đồng bộ; buổi họp chỉ dành cho các điểm còn bất đồng. Trước khi trình, hãy gặp riêng những thành viên có thể phản đối mạnh nhất để hiểu mối quan tâm của họ.

### Các kết quả có thể có

- **Chấp thuận.**
- **Chấp thuận có điều kiện**: ví dụ phải bổ sung giám sát hoặc review bảo mật trước khi go-live.
- **Yêu cầu chỉnh sửa và trình lại.**
- **Từ chối**, kèm lý do và hướng đi gợi ý.
- **Ngoại lệ (dispensation)**: cho phép sai khác với nguyên tắc trong một thời hạn, kèm kế hoạch khắc phục và người chịu trách nhiệm. Ngoại lệ không có hạn sẽ trở thành tiêu chuẩn ngầm.

### Tránh để ARB thành nút cổ chai

- **Phân tầng governance**: quyết định nằm gọn trong một team được ghi bằng ADR cấp team, không cần lên ARB; chỉ quyết định ảnh hưởng nhiều team, công nghệ mới hoặc rủi ro cao mới cần ARB.
- **Guardrail thay vì gate**: tự động hoá kiểm tra (như Maven Enforcer, ArchUnit, policy trên hạ tầng) để phần lớn tuân thủ diễn ra trong pipeline, không cần con người phê duyệt.
- **Cam kết thời gian phản hồi** và công khai mọi quyết định, lý do để các team học từ đó.
- **ARB tư vấn sớm**: khuyến khích các team đến trao đổi từ giai đoạn ý tưởng, không đợi thiết kế xong mới trình.

## Technical debt ở cấp doanh nghiệp

Ở cấp team, nợ kỹ thuật thường là code khó sửa hay thiếu test. Ở cấp doanh nghiệp, nợ nằm ở **danh mục hệ thống**: ba hệ thống quản lý khách hàng do ba đơn vị tự mua, nền tảng sắp hết hỗ trợ, tích hợp điểm-điểm chằng chịt, dữ liệu không nhất quán giữa các hệ thống.

### Đánh giá danh mục ứng dụng theo mô hình TIME

Mô hình TIME (do Gartner phổ biến) xếp mỗi ứng dụng theo hai trục: giá trị nghiệp vụ và mức độ phù hợp kỹ thuật.

| | Phù hợp kỹ thuật thấp | Phù hợp kỹ thuật cao |
|---|---|---|
| **Giá trị nghiệp vụ cao** | **Migrate**: chuyển sang nền tảng mới | **Invest**: đầu tư phát triển tiếp |
| **Giá trị nghiệp vụ thấp** | **Eliminate**: loại bỏ, gom về hệ khác | **Tolerate**: giữ nguyên, hạn chế đầu tư |

### Sổ theo dõi vòng đời công nghệ

| Công nghệ | Trạng thái hỗ trợ | Hệ thống đang dùng | Kế hoạch | Người chịu trách nhiệm |
|---|---|---|---|---|
| Java 8 | Đã ngoài chuẩn của công ty | ERP adapter, Báo cáo cũ | Nâng lên Java 21 trong 2 quý tới | Tech Lead team Integration |
| Spring Boot 2.x | Đã hết hỗ trợ OSS | 4 service | Nâng lên 3.x theo thứ tự rủi ro | Các Tech Lead liên quan |
| Application server cũ | Sắp hết hợp đồng hỗ trợ | Cổng nội bộ | Chuyển sang Spring Boot chạy trên Kubernetes | SA domain Nội bộ |

SA có vai trò đưa các khoản nợ này vào kế hoạch: mỗi giải pháp mới nên xem có thể "trả bớt nợ" cùng lúc không (ví dụ thay một trong ba hệ thống khách hàng thay vì thêm hệ thứ tư), và các rủi ro do nợ cần được ghi vào sổ rủi ro mà ARB theo dõi.

## Technology radar

Technology radar là cách trực quan để công bố quan điểm của tổ chức về công nghệ. Mô hình được Thoughtworks phổ biến qua bản radar họ xuất bản định kỳ, gồm 4 góc phần tư (Techniques, Tools, Platforms, Languages & Frameworks) và 4 vòng:

| Vòng | Ý nghĩa khi áp dụng trong nội bộ |
|---|---|
| Adopt | Lựa chọn mặc định cho việc mới; có hỗ trợ, tài liệu, người có kinh nghiệm |
| Trial | Được dùng ở dự án chấp nhận được rủi ro, có người theo dõi và chia sẻ bài học |
| Assess | Đáng tìm hiểu, làm PoC; chưa dùng cho production |
| Hold | Không dùng cho việc mới; việc đang dùng cần có kế hoạch rời bỏ |

Ví dụ một radar nội bộ cho tổ chức dùng Java:

| Mục | Góc | Vòng | Lý do ngắn |
|---|---|---|---|
| Java 21 LTS, Spring Boot 3.x | Languages & Frameworks | Adopt | Chuẩn của công ty, có template và hỗ trợ |
| Testcontainers | Tools | Adopt | Test tích hợp với DB, broker thật |
| Virtual threads cho service I/O-bound | Techniques | Trial | Đang thử ở 2 service, cần thêm số liệu vận hành |
| Spring Modulith | Languages & Frameworks | Assess | Có thể giúp tổ chức monolith theo module |
| Log4j 1.x | Languages & Frameworks | Hold | Đã ngừng phát triển, có lỗ hổng không được vá |
| Tích hợp qua dùng chung database | Techniques | Hold | Vi phạm nguyên tắc một nguồn sự thật |

### Quy trình xây radar

1. Mời các team đề cử mục (blip) kèm kinh nghiệm thực tế.
2. Nhóm kiến trúc cùng đại diện các team thảo luận, quyết định vòng, viết lý do ngắn.
3. Công bố định kỳ (ví dụ mỗi 6 tháng), kèm thay đổi so với kỳ trước.
4. Nối radar với governance: dùng công nghệ ở Adopt không cần xin phép; Trial cần ghi ADR; Assess chỉ dùng cho PoC; Hold bị chặn trong pipeline khi có thể.

Radar là công cụ giao tiếp, không phải danh sách cấm đoán cứng nhắc; lý do đi kèm mỗi mục quan trọng hơn bản thân vị trí của nó.

## Lỗi thường gặp

- **Áp dụng TOGAF "nguyên khối".** Cố tạo mọi artifact khiến kiến trúc thành công việc giấy tờ. Cách sửa: điều chỉnh, chỉ dùng các pha và artifact mang lại quyết định thực.
- **Nguyên tắc chung chung.** "Hệ thống phải an toàn và mở rộng được" không giúp ai quyết định gì. Cách sửa: viết đủ 4 phần, đặc biệt là phần hệ quả cụ thể.
- **ARB chỉ biết nói "không".** Các team bắt đầu né ARB, làm "chui". Cách sửa: ARB tư vấn sớm, đưa hướng thay thế khi từ chối, phân tầng governance và tự động hoá kiểm tra.
- **Ngoại lệ không có hạn.** Một ngoại lệ tạm thời tồn tại năm năm. Cách sửa: mọi dispensation có thời hạn, người chịu trách nhiệm và được xem lại định kỳ.
- **Radar không được cập nhật.** Radar hai năm tuổi khiến các team không còn tin. Cách sửa: lịch cập nhật cố định, có người chịu trách nhiệm, công bố thay đổi.

## Bài tập thực hành

1. **Viết nguyên tắc.** Viết 5 nguyên tắc kiến trúc cho tổ chức của bạn theo cấu trúc Tên, Phát biểu, Lý do, Hệ quả. Với mỗi nguyên tắc, chỉ ra một cách kiểm tra tự động trong pipeline (Maven Enforcer, ArchUnit, kiểm tra cấu hình hạ tầng) hoặc giải thích vì sao phải kiểm tra thủ công.
2. **Hồ sơ ARB.** Chuẩn bị hồ sơ trình ARB theo template ở trên cho giải pháp MiniMart hoặc một dự án thật. Nhờ một đồng nghiệp đóng vai thành viên ARB khó tính và ghi lại 5 câu hỏi khó nhất họ đặt ra.
3. **Radar và TIME.** Liệt kê 15–20 công nghệ đang dùng trong team hoặc phòng ban, xếp vào radar với lý do ngắn. Sau đó chọn 5 ứng dụng trong danh mục, xếp chúng vào mô hình TIME và đề xuất hành động cho mỗi ứng dụng.

## Tóm tắt

- EA đảm bảo các giải pháp cùng đi theo chiến lược chung; SA thiết kế giải pháp trong khuôn khổ đó và góp phần cải thiện nó.
- TOGAF ADM là chu trình từ Preliminary, Vision đến Change Management, với Requirements Management ở trung tâm; bốn tầng Business, Data, Application, Technology đi từ nghiệp vụ xuống công nghệ.
- Baseline, target, gap analysis và transition architecture là bộ khái niệm cốt lõi để lập lộ trình.
- Nguyên tắc kiến trúc cần đủ Tên, Phát biểu, Lý do, Hệ quả và nên được tự động hoá thành guardrail.
- ARB hiệu quả khi phân tầng governance, tư vấn sớm, ngoại lệ có thời hạn và quyết định được công khai.
- Nợ kỹ thuật cấp doanh nghiệp nằm ở danh mục hệ thống; mô hình TIME và sổ vòng đời công nghệ giúp ưu tiên hoá.
- Technology radar với 4 vòng Adopt, Trial, Assess, Hold là công cụ giao tiếp quan điểm công nghệ, nên được nối với governance.
