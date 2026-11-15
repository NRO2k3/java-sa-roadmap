Code review là nơi chất lượng code, kiến thức nghiệp vụ và văn hoá team gặp nhau mỗi ngày. Làm tốt, review giúp bắt lỗi sớm, lan toả kiến thức và giúp người mới lớn nhanh; làm dở, nó trở thành nút thắt khiến PR nằm chờ nhiều ngày, hoặc thành nơi tranh cãi về dấu cách. Dev Lead là người đặt chuẩn cho quy trình này: review cái gì, nói thế nào, nhanh đến đâu và việc gì để máy làm. Bài này giúp bạn xây dựng một quy trình review mà team thấy có ích chứ không phải thủ tục.

## Mục tiêu bài học

- Xây dựng checklist review bao quát nghiệp vụ, thiết kế, test, bảo mật và hiệu năng.
- Viết nhận xét mang tính xây dựng, phân biệt rõ nhận xét bắt buộc và gợi ý (nit).
- Giữ PR nhỏ, có mô tả rõ ràng nhờ PR template.
- Đặt SLA review hợp lý để review không chặn team.
- Đẩy phần việc máy làm được (format, lint, test) sang CI.

## Mục đích thật sự của code review

Hướng dẫn code review của Google đặt tiêu chuẩn rất thực tế: reviewer nên approve khi thay đổi **chắc chắn làm sức khoẻ tổng thể của codebase tốt lên**, kể cả khi nó chưa hoàn hảo. Không có code hoàn hảo, chỉ có code tốt hơn. Tiêu chuẩn này giúp tránh hai thái cực: duyệt cho xong ("LGTM" mà không đọc), và đòi hỏi cầu toàn khiến PR không bao giờ merge được.

Code review phục vụ nhiều mục tiêu cùng lúc:

- **Đúng nghiệp vụ**: code làm đúng điều yêu cầu, kể cả các trường hợp biên.
- **Thiết kế bền vững**: thay đổi nằm đúng chỗ, không tạo coupling khó gỡ.
- **Chia sẻ kiến thức**: ít nhất hai người hiểu mỗi phần code, giảm rủi ro "chỉ một người biết".
- **Nhất quán**: codebase trông như do một team viết, không phải mười cá nhân.

Code review **không** phải công cụ để tìm mọi bug. Test và CI làm việc đó tốt hơn. Review tập trung vào những thứ máy không đánh giá được: ý đồ, thiết kế, khả năng đọc hiểu.

## Checklist review

Checklist giúp reviewer không bỏ sót và giúp người mới biết cần nhìn vào đâu. Đây là checklist mẫu cho service Spring Boot, đọc theo thứ tự từ quan trọng đến chi tiết:

**1. Ngữ cảnh và nghiệp vụ**
- Mô tả PR nói rõ vấn đề cần giải quyết và cách giải quyết chưa? Có link ticket không?
- Code xử lý đúng yêu cầu, kể cả trường hợp biên: danh sách rỗng, `null`, trùng lặp, đồng thời?
- Hành vi khi lỗi: retry, rollback, thông báo cho người dùng có hợp lý không?

**2. Thiết kế**
- Logic nằm đúng tầng: nghiệp vụ trong domain/service, không nằm trong controller hay repository?
- Có trùng lặp với code đã có, hoặc có thư viện/tiện ích sẵn trong codebase không?
- API công khai (REST, event, schema DB) có tương thích ngược không?

**3. Test**
- Có test cho hành vi mới và bug vừa sửa không? Test có thất bại nếu logic sai không?
- Tên test mô tả hành vi, không phải tên method?

**4. Bảo mật**
- Input từ người dùng được validate; truy vấn dùng tham số, không nối chuỗi SQL?
- Kiểm tra quyền trên từng resource (user A có xem được đơn của user B không)?
- Không có secret trong code, không log dữ liệu nhạy cảm (mật khẩu, token, số thẻ)?

**5. Hiệu năng và vận hành**
- Có N+1 query, query không phân trang, gọi remote trong vòng lặp không?
- HTTP client có timeout không? Transaction có bao quanh lời gọi remote chậm không?
- Có log, metric đủ để debug khi lỗi trên production không?

### Ví dụ đọc một đoạn code khi review

```java
@GetMapping("/orders/{id}")
public OrderDto getOrder(@PathVariable Long id, @RequestParam String sort) {
    Order order = orderRepository.findById(id).orElseThrow();
    List<OrderItem> items = jdbcTemplate.query(
        "SELECT * FROM order_item WHERE order_id = " + id + " ORDER BY " + sort,
        itemRowMapper);
    for (OrderItem item : items) {
        item.setProduct(productClient.getProduct(item.getProductId()));
    }
    log.info("Order {} for user {}", order, order.getCustomer());
    return OrderDto.from(order, items);
}
```

Một reviewer theo checklist sẽ thấy ít nhất các vấn đề sau. **Bảo mật**: nối chuỗi vào SQL, đặc biệt `sort` lấy thẳng từ request là lỗ hổng SQL injection; không kiểm tra đơn hàng có thuộc user đang đăng nhập không (lỗi IDOR, tức là truy cập trực tiếp object của người khác chỉ bằng cách đổi id). **Hiệu năng**: gọi `productClient` trong vòng lặp, mỗi item một lời gọi HTTP. **Vận hành**: log nguyên object `Customer` có thể làm lộ dữ liệu cá nhân; `orElseThrow()` không tham số trả về `NoSuchElementException`, thường thành HTTP 500 thay vì 404.

## Viết nhận xét mang tính xây dựng

Cách bạn viết nhận xét quyết định team có thích review hay sợ review. Một số nguyên tắc:

- **Nhận xét về code, không về người**: "Hàm này có thể trả về `null` khi..." thay vì "Bạn lại quên check null".
- **Giải thích lý do**: "Nên dùng `Duration` thay vì `long` để tránh nhầm giây với mili giây" tốt hơn "Dùng `Duration`".
- **Đặt câu hỏi khi chưa chắc**: "Mình chưa hiểu vì sao cần retry ở đây, upstream có idempotent không?" Có thể tác giả đã cân nhắc điều bạn chưa biết.
- **Khen điều tốt**: một câu "Cách tách validator này rất gọn" giúp người nhận cởi mở hơn với các góp ý còn lại.
- **Chuyển sang nói chuyện trực tiếp** khi một thread qua lại quá vài lượt: gọi nhanh 10 phút rồi ghi lại kết luận trên PR.

### Phân biệt bắt buộc và gợi ý

Người nhận cần biết nhận xét nào **phải** sửa trước khi merge, nhận xét nào chỉ là ý kiến. Nhiều team dùng tiền tố theo phong cách Conventional Comments:

```text
issue (blocking): Câu SQL nối chuỗi tham số "sort" từ request -> SQL injection.
  Đề xuất: whitelist các cột cho phép sắp xếp, hoặc dùng Sort của Spring Data.

suggestion: Có thể gom 20 lời gọi productClient thành một lời gọi batch
  getProducts(ids) để giảm latency. Không chặn merge nếu ticket này gấp.

question: Đơn đã huỷ có cần trả về ở endpoint này không?

nit: Tên biến "tmp" nên đổi thành "pendingItems" cho dễ đọc.

praise: Test case cho trường hợp đơn rỗng rất rõ ràng, cảm ơn!
```

**Nit** (viết tắt của nitpick, "bới lông tìm vết") là góp ý nhỏ về tiểu tiết, tác giả có thể bỏ qua. Quy ước này giúp reviewer thoải mái góp ý mà không làm PR bị chặn, và giúp tác giả ưu tiên đúng việc. Nếu bạn thấy mình viết quá nhiều nit về format, đó là tín hiệu cần một formatter tự động.

## PR nhỏ và mô tả rõ ràng

PR càng lớn, reviewer càng khó tập trung và càng dễ duyệt hời hợt. Không có con số tuyệt đối, nhưng PR mà reviewer đọc hiểu được trong một lần ngồi (thường là vài trăm dòng thay đổi thực sự) là mục tiêu tốt. Cách chia nhỏ:

- **Tách refactor khỏi thay đổi hành vi**: PR 1 đổi tên, tách class; PR 2 thêm logic mới.
- **Chia theo lát dọc (vertical slice)**: mỗi PR là một phần tính năng chạy được từ API đến DB, ẩn sau feature flag nếu chưa xong.
- **Stacked PR**: chuỗi PR nối tiếp nhau, mỗi PR dựa trên PR trước, được review song song.
- **Tách thay đổi cơ học**: đổi format hàng loạt, nâng version thư viện làm PR riêng.

### PR template

Đặt file `.github/pull_request_template.md` (GitHub) hoặc template tương đương trên GitLab để mọi PR có cùng cấu trúc:

```text
## Vấn đề
<!-- PR này giải quyết vấn đề gì? Link ticket: JIRA-123 -->

## Giải pháp
<!-- Tóm tắt cách làm và các phương án đã cân nhắc nếu có -->

## Cách kiểm tra
- [ ] Unit/integration test đã thêm hoặc cập nhật
- [ ] Đã chạy thử local / staging (ghi bước tái hiện nếu cần)

## Rủi ro và triển khai
- [ ] Có migration DB? Tương thích ngược với version đang chạy?
- [ ] Có feature flag? Tên flag và giá trị mặc định
- [ ] Cách rollback nếu có sự cố

## Ghi chú cho reviewer
<!-- Nên đọc file nào trước, phần nào cần góp ý kỹ -->
```

Phần "Ghi chú cho reviewer" thường bị bỏ qua nhưng rất đáng giá: tác giả hiểu thay đổi nhất, chỉ đường cho reviewer giúp tiết kiệm thời gian của cả hai.

## SLA review: nhanh nhưng không gấp gáp

Một PR chờ review hai ngày nghĩa là tác giả phải chuyển ngữ cảnh, mở việc mới, rồi quay lại khi đã quên chi tiết; các PR phía sau cũng bị chặn. Hướng dẫn của Google nêu rõ một ngày làm việc là thời gian **tối đa** để phản hồi một yêu cầu review. Một SLA mẫu cho team:

- **Phản hồi đầu tiên** trong vòng một ngày làm việc (lý tưởng là trong buổi). Phản hồi có thể là review đầy đủ, hoặc "PR này lớn, chiều nay mình xem kỹ".
- **Không ngắt luồng tập trung**: review vào các điểm chuyển việc tự nhiên (sau standup, sau bữa trưa, trước khi về) thay vì bỏ dở việc đang làm.
- **Hotfix** được review ngay, có kênh riêng để gọi người.

Dev Lead nên theo dõi các chỉ số như thời gian đến phản hồi đầu tiên và thời gian từ mở PR đến merge, nhìn theo xu hướng của cả team chứ không dùng để đánh giá cá nhân. Đồng thời tránh để mình thành nút thắt: nếu mọi PR đều chờ Lead duyệt, hãy dùng CODEOWNERS để phân quyền review theo module và cho phép thành viên khác approve.

## Tự động hoá phần việc của máy

Nguyên tắc: **con người không nên review những gì máy kiểm tra được**. Mỗi nhận xét về dấu cách, thứ tự import hay test đang đỏ là thời gian của reviewer bị lãng phí và là nguồn tranh cãi vô ích.

| Việc | Công cụ | Chạy ở đâu |
|---|---|---|
| Format code | Spotless + google-java-format | Pre-commit (tuỳ chọn) và CI |
| Lint, bug pattern | Checkstyle, Error Prone, SpotBugs | Build Maven/Gradle trong CI |
| Test, coverage | JUnit, JaCoCo | CI, bắt buộc pass mới được merge |
| Chất lượng tổng thể | SonarQube quality gate | CI, kết quả comment lên PR |
| Dependency có lỗ hổng | Dependabot, Renovate | Tự mở PR cập nhật |

Khi CI chạy các bước này như **required check** trên PR, reviewer có thể bắt đầu với giả định "code đã format, build pass, test xanh" và dành toàn bộ sự chú ý cho thiết kế và nghiệp vụ. Một quy ước tốt: reviewer chỉ bắt đầu review khi CI đã xanh, trừ khi tác giả xin góp ý sớm cho bản nháp (draft PR).

## Lỗi thường gặp

- **Rubber-stamp review**: approve PR 1.500 dòng sau 2 phút. Cách sửa: yêu cầu PR nhỏ; reviewer được quyền đề nghị tách PR quá lớn.
- **Gatekeeping**: một người (thường là Lead) duyệt mọi thứ và chặn vì sở thích cá nhân. Cách sửa: viết hướng dẫn review chung, phân biệt rõ "chuẩn của team" với "sở thích của tôi", dùng tiền tố `nit:` cho sở thích.
- **Tranh cãi về style**: hàng chục comment về format. Cách sửa: formatter tự động và quy tắc lint trong CI; chủ đề style được quyết một lần trong tài liệu chuẩn.
- **Chỉ review diff, không nhìn ngữ cảnh**: thay đổi đúng cục bộ nhưng phá luồng khác. Cách sửa: mở file đầy đủ, đọc mô tả PR, kiểm tra nơi gọi đến code bị sửa.
- **Bỏ qua test khi review**: chỉ đọc code chính. Cách sửa: đọc test trước để hiểu hành vi mong đợi, rồi mới đọc implementation.
- **PR chờ nhiều ngày**: không ai thấy mình có trách nhiệm. Cách sửa: CODEOWNERS tự gán reviewer, SLA rõ ràng, nhắc PR cũ trong standup.

## Bài tập thực hành

1. **Viết hướng dẫn review cho team**: soạn tài liệu một trang gồm checklist (theo 5 nhóm ở trên, điều chỉnh cho stack của team), quy ước tiền tố nhận xét và SLA phản hồi. Đưa team góp ý và chốt trong buổi retro.
2. **Review đoạn code mẫu**: dùng đoạn `getOrder` ở trên, viết các nhận xét review hoàn chỉnh theo quy ước `issue (blocking)` / `suggestion` / `nit`, mỗi nhận xét có lý do và đề xuất cách sửa. So sánh với một đồng nghiệp để xem mỗi người bắt được gì.
3. **Đo và cải thiện**: thống kê 20 PR gần nhất của team: số dòng thay đổi, thời gian đến phản hồi đầu tiên, thời gian đến khi merge. Chọn một cải tiến (PR template, CODEOWNERS, giới hạn kích thước PR) và đo lại sau một tháng.

## Tóm tắt

- Mục tiêu của review là làm sức khoẻ codebase tốt lên và chia sẻ kiến thức, không phải tìm mọi bug hay đòi code hoàn hảo.
- Dùng checklist theo thứ tự: nghiệp vụ, thiết kế, test, bảo mật, hiệu năng và vận hành.
- Nhận xét về code chứ không về người, luôn giải thích lý do, và đánh dấu rõ `blocking` với `nit`.
- PR nhỏ, một mục đích, có mô tả theo template, giúp review nhanh và kỹ hơn.
- Đặt SLA phản hồi trong một ngày làm việc và theo dõi thời gian chờ review của team.
- Để máy lo format, lint, test và quality gate trong CI; con người tập trung vào thiết kế và nghiệp vụ.
