Một kiến trúc tốt nhưng chỉ nằm trong đầu SA thì gần như vô dụng: team hiện thực sai, người mới không hiểu, và hai năm sau không ai nhớ vì sao hệ thống được thiết kế như vậy. Tài liệu kiến trúc là công cụ giao tiếp với nhiều đối tượng, từ ban lãnh đạo đến developer và đội vận hành. Bài này giới thiệu bộ công cụ được dùng phổ biến: mô hình C4 để vẽ sơ đồ, ADR để ghi lại quyết định, arc42 để tổ chức tài liệu, và cách quản lý sơ đồ dưới dạng code.

## Mục tiêu bài học

- Vẽ sơ đồ kiến trúc theo 4 mức của mô hình C4 và chọn đúng mức cho từng đối tượng người đọc.
- Viết Architecture Decision Record (ADR) đầy đủ và quản lý vòng đời ADR ngay trong repository.
- Tổ chức tài liệu kiến trúc theo template arc42, kết hợp với sơ đồ C4 và ADR.
- Áp dụng diagram as code với Structurizr DSL, PlantUML hoặc Mermaid để sơ đồ được version và review như code.

## Nguyên tắc chung: viết cho ai, sống bao lâu

Trước khi viết, trả lời hai câu hỏi: **ai đọc** và **tài liệu cần sống bao lâu**. Ban lãnh đạo cần một trang tổng quan và sơ đồ bối cảnh; developer cần sơ đồ container, component và lý do của các quyết định; đội vận hành cần sơ đồ triển khai và runbook. Tài liệu càng chi tiết thì càng nhanh lỗi thời, nên chỉ đi sâu ở chỗ thật sự cần, và đặt tài liệu gần code (docs-as-code: tài liệu nằm trong repo, review qua Pull Request) để nó được cập nhật cùng thay đổi.

## Mô hình C4

Mô hình C4 do Simon Brown đề xuất, mô tả kiến trúc bằng các sơ đồ ở nhiều mức phóng to dần, giống bản đồ: từ toàn cảnh một vùng đến từng con phố. C4 không bắt buộc ký hiệu cụ thể; điều quan trọng là một tập khái niệm (abstraction) nhất quán:

- **Person**: người dùng hoặc vai trò sử dụng hệ thống.
- **Software System**: hệ thống phần mềm mang lại giá trị cho người dùng, thường do một team sở hữu.
- **Container**: đơn vị chạy hoặc lưu trữ dữ liệu triển khai được riêng: ứng dụng Spring Boot, SPA, app mobile, database, message broker. Đây không phải Docker container.
- **Component**: nhóm chức năng bên trong một container, có interface rõ ràng, ví dụ nhóm controller, service, repository phục vụ một nghiệp vụ.
- **Code**: class, interface, bảng dữ liệu.

| Mức | Câu hỏi trả lời | Đối tượng đọc chính |
|---|---|---|
| 1. System Context | Hệ thống làm gì, ai dùng, tương tác với hệ thống nào? | Mọi người, kể cả người không làm kỹ thuật |
| 2. Container | Hệ thống gồm những khối chạy được nào, giao tiếp ra sao, dùng công nghệ gì? | Developer, kiến trúc sư, vận hành |
| 3. Component | Bên trong một container có những thành phần nào, trách nhiệm ra sao? | Developer của container đó |
| 4. Code | Thành phần được hiện thực bằng các class nào? | Developer, chỉ khi thật cần |

### Mức 1 – System Context

```text
[System Context] Hệ thống đặt hàng online – MiniMart

+---------------------+                          +---------------------------+
| Khách hàng          |  Đặt hàng, theo dõi đơn  | Hệ thống đặt hàng online  |
| [Person]            |------------------------->| [Software System]         |
+---------------------+                          | Cho phép khách đặt hàng,  |
                                                 | thanh toán và nhận hàng   |
+---------------------+  Nhận và soạn đơn hàng   |                           |
| Nhân viên cửa hàng  |------------------------->|                           |
| [Person]            |                          +---------------------------+
+---------------------+                              |                 |
                                  Đọc tồn kho (API)  |                 | Tạo giao dịch (HTTPS)
                                                     v                 v
                                       +------------------+  +------------------+
                                       | ERP              |  | Cổng thanh toán  |
                                       | [Hệ thống ngoài] |  | [Hệ thống ngoài] |
                                       +------------------+  +------------------+
```

Sơ đồ này không có công nghệ, không có database: chỉ có người dùng, hệ thống của bạn và các hệ thống xung quanh. Đây là sơ đồ nên mở đầu mọi buổi trình bày.

### Mức 2 – Container

```text
[Container] Hệ thống đặt hàng online – MiniMart

 Khách hàng [Person]
        |
        | Dùng app
        v
+----------------------+  JSON/HTTPS  +--------------------------+  JDBC  +-------------------+
| Mobile App           |------------->| Order API                |------->| Order DB          |
| [Container: Flutter] |              | [Container: Spring Boot] |        | [Container:       |
+----------------------+              | Nhận và xử lý đơn hàng   |        |  PostgreSQL]      |
                                      +--------------------------+        +-------------------+
                                          |                  |
                      Gửi OrderPlaced     |                  | Tạo giao dịch (HTTPS)
                                          v                  v
                      +--------------------------+  +--------------------------+
                      | Message Broker           |  | Cổng thanh toán          |
                      | [Container: Kafka]       |  | [Hệ thống ngoài]         |
                      +--------------------------+  +--------------------------+
                                          |
                          Nhận sự kiện    |
                                          v
                      +--------------------------+
                      | Notification Worker      |
                      | [Container: Spring Boot] |
                      | Gửi SMS, email, push     |
                      +--------------------------+
```

Mỗi container ghi rõ công nghệ, mỗi mũi tên ghi rõ mục đích và giao thức. Đây thường là sơ đồ hữu ích nhất cho developer và đội vận hành.

### Mức 3 – Component

```text
[Component] Container: Order API (Spring Boot)

  Mobile App
      | JSON/HTTPS
      v
+------------------------+        +---------------------------+
| OrderController        |        | PaymentClient             |
| REST endpoint /orders  |        | Gọi cổng thanh toán, có   |----> Cổng thanh toán
+------------------------+        | timeout, circuit breaker  |
      |                           +---------------------------+
      v                                        ^
+------------------------+                     |
| OrderService           |---------------------+
| Nghiệp vụ đặt hàng     |
+------------------------+
      |
      v
+------------------------+        +---------------------------+
| OrderRepository        |        | OutboxRelay               |
| Spring Data JPA, ghi   |        | Định kỳ đọc bảng outbox,  |----> Message Broker
| đơn hàng và outbox     |        | gửi sự kiện               |
+------------------------+        +---------------------------+
      |                                        |
      v                                        v
+-------------------------------------------------------------+
|                    Order DB (PostgreSQL)                    |
+-------------------------------------------------------------+
```

Chỉ vẽ mức Component cho container phức tạp hoặc quan trọng. Với một service CRUD đơn giản, sơ đồ này ít mang lại giá trị.

### Mức 4 – Code và các sơ đồ bổ trợ

Mức Code (sơ đồ class, ERD) hiếm khi đáng vẽ tay vì thay đổi theo từng commit; nếu cần, hãy sinh tự động từ IDE hoặc công cụ. Ngoài 4 mức chính, C4 có các sơ đồ bổ trợ:

- **System Landscape**: toàn bộ hệ thống trong doanh nghiệp và quan hệ giữa chúng.
- **Dynamic**: một kịch bản cụ thể chạy qua các phần tử theo thứ tự (tương tự sequence diagram).
- **Deployment**: container được triển khai lên hạ tầng nào (Kubernetes cluster, node, vùng cloud).

### Quy tắc để sơ đồ dễ hiểu

- Mỗi sơ đồ có **tiêu đề** nêu loại sơ đồ và phạm vi, cùng **chú giải** (legend) nếu dùng màu hay hình dạng.
- Mỗi phần tử có tên, loại, công nghệ (nếu là container hoặc component) và một câu mô tả trách nhiệm.
- Mũi tên một chiều, có nhãn dạng động từ ("Gửi sự kiện", "Đọc tồn kho") và giao thức khi cần.
- Một sơ đồ chỉ thể hiện một mức trừu tượng; không trộn class với hệ thống ngoài trên cùng một hình.

## Architecture Decision Record (ADR)

ADR là tài liệu ngắn ghi lại **một** quyết định kiến trúc quan trọng: bối cảnh, quyết định, các phương án đã cân nhắc và hệ quả. Định dạng phổ biến bắt nguồn từ bài viết của Michael Nygard năm 2011 với các phần Title, Status, Context, Decision, Consequences; sau đó xuất hiện nhiều biến thể như MADR, một template ADR viết bằng Markdown, bổ sung phần phương án và yếu tố quyết định.

### Khi nào cần viết ADR

Một quyết định đáng ghi ADR (architecturally significant) khi nó khó hoặc tốn kém để đảo ngược, ảnh hưởng đến nhiều team hoặc nhiều container, tác động lên một NFR quan trọng, hoặc là điều mà người mới chắc chắn sẽ hỏi "sao lại làm thế này?". Đặt tên biến không cần ADR; chọn cơ chế phát sự kiện giữa các service thì cần.

### Vòng đời của ADR

```text
Proposed ---> Accepted ---> Deprecated
                  |
                  +-------> Superseded by ADR-NNNN
```

ADR đã Accepted thì **không sửa nội dung quyết định**. Khi bối cảnh thay đổi, viết một ADR mới và đánh dấu ADR cũ là Superseded, nhờ vậy lịch sử tư duy được giữ lại. Chỉ nên sửa lỗi chính tả hoặc bổ sung liên kết.

### Template ADR

```text
# ADR-NNNN: <Tiêu đề ngắn, nêu rõ quyết định, vd. "Dùng X cho Y">

- Trạng thái: Proposed | Accepted | Deprecated | Superseded by ADR-NNNN
- Ngày: YYYY-MM-DD
- Người quyết định: <tên hoặc vai trò>
- Liên quan: <RFC, ticket, ADR khác>

## Bối cảnh
<Vấn đề cần giải quyết và các lực tác động: yêu cầu, NFR, ràng buộc,
hiện trạng. Viết sao cho người đọc sau 2 năm vẫn hiểu.>

## Yếu tố quyết định (decision drivers)
- <NFR, ràng buộc quan trọng nhất>

## Các phương án đã cân nhắc
1. <Phương án A> – ưu / nhược
2. <Phương án B> – ưu / nhược
3. <Phương án C> – ưu / nhược

## Quyết định
<Chọn phương án nào, phạm vi áp dụng.>

## Hệ quả
- Tích cực: ...
- Đánh đổi chấp nhận: ...
- Việc cần làm tiếp: ...

## Điều kiện xem xét lại
<Khi nào quyết định này nên được đánh giá lại.>
```

### Ví dụ ADR cho hệ thống Spring Boot

```text
# ADR-0007: Dùng Transactional Outbox với polling publisher để phát sự kiện đơn hàng

- Trạng thái: Accepted
- Ngày: 2026-03-12
- Người quyết định: SA, Tech Lead team Order, đại diện team Platform
- Liên quan: ADR-0004 (Chọn Kafka dạng managed làm message broker)

## Bối cảnh
Order API (Spring Boot 3, PostgreSQL) cần phát sự kiện OrderPlaced cho
Notification Worker và Loyalty Service. Hiện code lưu đơn trong một
method @Transactional rồi gọi KafkaTemplate.send(). Nếu DB commit thành
công nhưng gửi Kafka thất bại, sự kiện bị mất; nếu gửi Kafka trước rồi
transaction rollback, hệ thống phát sự kiện cho một đơn không tồn tại.
Đã có sự cố khách không được cộng điểm vì lỗi này.

## Yếu tố quyết định
- Không được mất sự kiện của đơn đã ghi nhận
- Độ trễ phát sự kiện chấp nhận được: dưới 5 giây
- Team chưa có kinh nghiệm vận hành Kafka Connect

## Các phương án đã cân nhắc
1. Giữ dual write, thêm retry khi gửi Kafka lỗi
   + Thay đổi nhỏ
   - Vẫn không nguyên tử: app crash giữa commit DB và gửi Kafka
     thì sự kiện vẫn mất
2. Outbox + CDC bằng Debezium (chạy trên Kafka Connect)
   + Độ trễ thấp, không phải viết code polling
   - Thêm hạ tầng Kafka Connect cần vận hành, team chưa có kinh nghiệm
3. Outbox + polling publisher ngay trong Order API
   + Chỉ dùng công nghệ team đã quen (JPA, @Scheduled)
   - Tăng tải truy vấn lên DB; độ trễ phụ thuộc chu kỳ polling

## Quyết định
Chọn phương án 3. Trong cùng transaction lưu đơn, ghi thêm một bản ghi
vào bảng outbox_event. Một job chạy mỗi giây đọc các bản ghi chưa gửi
(SELECT ... FOR UPDATE SKIP LOCKED để nhiều instance không xử lý trùng),
gửi lên Kafka, rồi đánh dấu đã gửi.

## Hệ quả
- Tích cực: sự kiện không bị mất khi đơn đã được commit.
- Đánh đổi: cơ chế là at-least-once, một sự kiện có thể được gửi nhiều
  lần -> mọi consumer phải xử lý idempotent theo eventId.
- Đánh đổi: thêm tải cho PostgreSQL; cần index cột trạng thái và job dọn
  bản ghi đã gửi sau 7 ngày.
- Việc cần làm: thêm metric số bản ghi outbox tồn đọng và cảnh báo.

## Điều kiện xem xét lại
Khi lượng sự kiện vượt khả năng xử lý của job polling, hoặc khi team
Platform cung cấp Kafka Connect dạng dịch vụ dùng chung -> cân nhắc
chuyển sang phương án 2 bằng một ADR mới.
```

Hãy để ý: ADR tốt nói rõ **đánh đổi** mà team chấp nhận (ở đây là at-least-once và tải DB), không chỉ liệt kê ưu điểm.

### Lưu trữ và quy trình

- Lưu ADR dạng Markdown trong repo, ví dụ `docs/adr/0007-outbox-polling-publisher.md`, đánh số tăng dần và không tái sử dụng số.
- ADR mới đi qua Pull Request như code: người liên quan review, thảo luận trong PR; merge đồng nghĩa với Accepted.
- Duy trì một file index liệt kê ADR và trạng thái. Có các công cụ dòng lệnh như adr-tools hỗ trợ tạo file và đánh số.
- Quyết định ảnh hưởng nhiều hệ thống nên đặt ở một repo kiến trúc chung để các team cùng tra cứu.

## arc42

arc42 là template mã nguồn mở cho tài liệu kiến trúc, do Gernot Starke và Peter Hruschka xây dựng. Nó trả lời câu hỏi "tài liệu kiến trúc nên có những mục gì" bằng 12 mục:

| # | Mục | Nội dung chính |
|---|---|---|
| 1 | Introduction and Goals | Yêu cầu chính, mục tiêu chất lượng hàng đầu, stakeholder |
| 2 | Architecture Constraints | Ràng buộc kỹ thuật, tổ chức, pháp lý |
| 3 | Context and Scope | Ranh giới hệ thống và các hệ thống bên ngoài |
| 4 | Solution Strategy | Các quyết định nền tảng và hướng tiếp cận chính |
| 5 | Building Block View | Cấu trúc tĩnh, phân rã hệ thống thành các khối |
| 6 | Runtime View | Các kịch bản quan trọng chạy như thế nào |
| 7 | Deployment View | Hạ tầng, môi trường, ánh xạ phần mềm lên hạ tầng |
| 8 | Cross-cutting Concepts | Bảo mật, logging, xử lý lỗi, transaction, đa ngôn ngữ... |
| 9 | Architecture Decisions | Các quyết định quan trọng |
| 10 | Quality Requirements | Cây chất lượng và các kịch bản chất lượng |
| 11 | Risks and Technical Debt | Rủi ro và nợ kỹ thuật đã biết |
| 12 | Glossary | Thuật ngữ nghiệp vụ và kỹ thuật |

### Kết hợp arc42, C4 và ADR

arc42 cung cấp **khung**, C4 cung cấp **sơ đồ**, ADR cung cấp **lý do**. Cách ghép tự nhiên: sơ đồ System Context đặt ở mục 3, sơ đồ Container và Component ở mục 5, sơ đồ Dynamic ở mục 6, sơ đồ Deployment ở mục 7, còn mục 9 là index trỏ tới thư mục ADR. Mục 10 tái sử dụng các quality attribute scenario đã thu thập khi phân tích yêu cầu.

```text
docs/
  architecture/
    01-introduction-and-goals.md
    02-constraints.md
    03-context-and-scope.md        <- sơ đồ System Context
    04-solution-strategy.md
    05-building-block-view.md      <- sơ đồ Container, Component
    06-runtime-view.md             <- sơ đồ Dynamic cho luồng đặt hàng
    07-deployment-view.md          <- sơ đồ Deployment
    08-crosscutting-concepts.md
    09-architecture-decisions.md   <- index trỏ đến docs/adr/
    10-quality-requirements.md
    11-risks-and-technical-debt.md
    12-glossary.md
  adr/
    0001-record-architecture-decisions.md
    0007-outbox-polling-publisher.md
  diagrams/
    workspace.dsl
```

### Dùng ở mức vừa đủ

arc42 được thiết kế để dùng linh hoạt: mục nào không mang lại giá trị thì để ngắn hoặc bỏ qua. Với một service nhỏ, các mục 1, 3, 4, 5 và 9 thường là đủ. Với Solution Architecture Document cho một dự án lớn, mục 2, 10 và 11 trở nên rất quan trọng vì đó là nơi ban lãnh đạo và ARB tìm thông tin về ràng buộc, chất lượng và rủi ro.

## Diagram as code

Vẽ bằng công cụ kéo thả thì nhanh lúc đầu nhưng khó bảo trì: file khó diff, mỗi sơ đồ vẽ lại phần tử riêng nên dễ lệch nhau, và không ai biết bản nào mới nhất. Diagram as code mô tả sơ đồ bằng văn bản, lưu cùng repo, review qua PR và có thể render tự động trong pipeline CI.

### Structurizr DSL

Structurizr DSL (cũng do Simon Brown phát triển) tách **model** (phần tử và quan hệ, định nghĩa một lần) khỏi **view** (các sơ đồ sinh ra từ model). Đổi tên một container trong model là mọi sơ đồ cùng cập nhật.

```text
workspace "MiniMart" "Hệ thống đặt hàng online" {

    model {
        customer = person "Khách hàng" "Người mua hàng qua app"
        erp = softwareSystem "ERP" "Quản lý tồn kho" "External"
        payment = softwareSystem "Cổng thanh toán" "Xử lý thanh toán online" "External"

        shop = softwareSystem "Hệ thống đặt hàng online" {
            app = container "Mobile App" "Ứng dụng cho khách hàng" "Flutter"
            api = container "Order API" "Nhận và xử lý đơn hàng" "Spring Boot"
            db = container "Order DB" "Lưu đơn hàng và outbox" "PostgreSQL" "Database"
            broker = container "Message Broker" "Phân phối sự kiện" "Kafka"
        }

        customer -> app "Đặt hàng"
        app -> api "Gọi API" "JSON/HTTPS"
        api -> db "Đọc/ghi" "JDBC"
        api -> broker "Gửi OrderPlaced"
        api -> erp "Đọc tồn kho" "REST"
        api -> payment "Tạo giao dịch" "HTTPS"
    }

    views {
        systemContext shop "Context" {
            include *
            autoLayout lr
        }
        container shop "Containers" {
            include *
            autoLayout lr
        }
        styles {
            element "Database" {
                shape cylinder
            }
            element "External" {
                background #999999
            }
        }
    }
}
```

Từ một file, ta có cả sơ đồ System Context và Container. Các quan hệ khai báo ở mức container (ví dụ `api -> erp`) được Structurizr tự suy ra ở mức System Context. Bộ công cụ Structurizr có thể render DSL (kể cả chạy cục bộ bằng Docker) và xuất sang các định dạng khác như PlantUML hay Mermaid.

### PlantUML với C4-PlantUML

PlantUML rất phổ biến trong cộng đồng Java và hỗ trợ nhiều loại sơ đồ UML. Thư viện C4-PlantUML (có sẵn trong thư viện chuẩn của PlantUML) cung cấp macro cho các phần tử C4:

```text
@startuml
!include <C4/C4_Container>

title Container – Hệ thống đặt hàng online

Person(customer, "Khách hàng", "Người mua hàng qua app")
System_Ext(payment, "Cổng thanh toán", "Xử lý thanh toán online")

System_Boundary(shop, "Hệ thống đặt hàng online") {
    Container(app, "Mobile App", "Flutter", "Ứng dụng cho khách hàng")
    Container(api, "Order API", "Spring Boot", "Nhận và xử lý đơn hàng")
    ContainerDb(db, "Order DB", "PostgreSQL", "Lưu đơn hàng và outbox")
}

Rel(customer, app, "Đặt hàng")
Rel(app, api, "Gọi API", "JSON/HTTPS")
Rel(api, db, "Đọc/ghi", "JDBC")
Rel(api, payment, "Tạo giao dịch", "HTTPS")

SHOW_LEGEND()
@enduml
```

Điểm yếu so với Structurizr: mỗi sơ đồ là một file độc lập, nên cùng một phần tử có thể được mô tả khác nhau ở các file. Điểm mạnh: linh hoạt, dùng được cho sequence diagram, class diagram, và có plugin cho IntelliJ IDEA.

### Mermaid

Mermaid có cú pháp gọn và được GitHub, GitLab render trực tiếp trong file Markdown, rất tiện cho sequence diagram hay flowchart nhỏ trong README. Mermaid có hỗ trợ sơ đồ C4 nhưng tính năng này vẫn được đánh dấu là thử nghiệm, nên với bộ tài liệu kiến trúc chính thức, Structurizr hoặc PlantUML thường là lựa chọn an toàn hơn.

| Công cụ | Điểm mạnh | Hạn chế | Phù hợp |
|---|---|---|---|
| Structurizr DSL | Một model, nhiều view; bám sát C4 | Phải học DSL, cần công cụ render | Bộ sơ đồ kiến trúc chính của hệ thống |
| PlantUML + C4-PlantUML | Nhiều loại sơ đồ, phổ biến với dân Java | Mỗi sơ đồ một file, dễ lệch nhau; bố cục tự động đôi khi rối | Sequence, class, sơ đồ C4 đơn lẻ |
| Mermaid | Gọn, render sẵn trên GitHub/GitLab | C4 còn thử nghiệm, ít tuỳ biến bố cục | README, sơ đồ nhỏ, sequence |

## Lỗi thường gặp

- **Sơ đồ "hộp và mũi tên" không chú giải.** Không ai biết hộp màu xanh là service hay database, mũi tên là gọi đồng bộ hay gửi sự kiện. Cách sửa: tiêu đề, legend, nhãn trên mọi mũi tên, ghi công nghệ cho container.
- **Trộn nhiều mức trong một sơ đồ.** Class nằm cạnh hệ thống ngoài khiến sơ đồ rối và không phục vụ được ai. Cách sửa: một sơ đồ một mức, dùng mức phóng to khi cần chi tiết.
- **Viết ADR khi đã quên lý do.** ADR viết sau vài tháng thường chỉ còn kết luận. Cách sửa: viết ADR ở trạng thái Proposed ngay khi bắt đầu thảo luận, chốt thành Accepted khi quyết định.
- **Sửa ADR cũ cho khớp hiện trạng.** Làm vậy xoá mất lịch sử. Cách sửa: viết ADR mới và đánh dấu ADR cũ là Superseded.
- **Tài liệu nằm tách khỏi code.** Wiki không ai cập nhật sau sprint thứ ba. Cách sửa: docs-as-code, đưa việc cập nhật sơ đồ và ADR vào Definition of Done của thay đổi kiến trúc.
- **Điền đủ 12 mục arc42 cho có.** Tài liệu dày nhưng không ai đọc. Cách sửa: viết mục nào có người đọc cần, giữ ngắn gọn.

## Bài tập thực hành

1. **Vẽ C4 bằng code.** Dùng Structurizr DSL mô tả hệ thống bạn đang làm ở mức System Context và Container. Nhờ một người ngoài team (PO hoặc tester) đọc sơ đồ mức 1 và giải thích lại; chỗ nào họ hiểu sai là chỗ sơ đồ cần sửa.
2. **Viết lại lịch sử bằng ADR.** Chọn 3 quyết định đã có trong dự án (ví dụ chọn database, cơ chế xác thực, cách giao tiếp giữa service) và viết ADR theo template, có ít nhất 2 phương án và phần đánh đổi. Mở Pull Request để team review.
3. **Khung arc42 tối giản.** Tạo thư mục `docs/architecture` cho một service theo cấu trúc ở trên, viết các mục 1, 3, 4, 5, 9 và 10, nhúng sơ đồ từ bài tập 1 và liên kết tới ADR ở bài tập 2.

## Tóm tắt

- Xác định người đọc trước khi viết; tài liệu càng chi tiết càng nhanh lỗi thời.
- C4 có 4 mức (Context, Container, Component, Code); Context dành cho mọi người, Container hữu ích nhất cho developer và vận hành, Code hiếm khi cần vẽ tay.
- ADR ghi lại một quyết định cùng bối cảnh, phương án, đánh đổi; ADR đã chấp nhận thì không sửa mà được thay bằng ADR mới.
- arc42 cung cấp khung 12 mục; kết hợp với C4 cho sơ đồ và ADR cho lý do, dùng ở mức vừa đủ.
- Diagram as code giúp sơ đồ được version, review và luôn nhất quán; Structurizr mạnh về model, PlantUML linh hoạt, Mermaid tiện cho README.
