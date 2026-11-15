Chứng chỉ Java và Spring không biến bạn thành Solution Architect, nhưng chúng là bằng chứng khách quan cho nền tảng kỹ thuật, đặc biệt hữu ích khi bạn ứng tuyển vào công ty mới, làm việc với khách hàng nước ngoài trong mô hình outsourcing, hoặc cần lý do để học lại những phần ngôn ngữ mình vẫn "dùng theo thói quen". Quan trọng hơn tấm chứng chỉ là quá trình ôn: bạn buộc phải hiểu chính xác vì sao một đoạn code biên dịch được hay không, và Spring thực sự làm gì phía sau các annotation. Bài này giúp bạn quyết định có nên thi không, thi gì trước, và ôn tập theo kế hoạch cụ thể.

## Mục tiêu bài học

- Hiểu giá trị và giới hạn của chứng chỉ Java/Spring đối với lộ trình SA.
- Nắm cấu trúc nội dung của Oracle Certified Professional: Java SE 17/21 Developer và cách ôn hiệu quả.
- Nắm phạm vi kiến thức của Spring Certified Professional và cách chuẩn bị.
- Lập được kế hoạch ôn thi 8–10 tuần, có checklist sẵn sàng trước khi đăng ký.

> **Lưu ý:** Mã đề, số câu, thời lượng, điểm đạt, giá và hình thức thi của các chứng chỉ thay đổi theo thời gian. Bài học này tập trung vào cách học; hãy luôn kiểm tra trang chính thức của Oracle University và Spring/Broadcom trước khi đăng ký.

## Chứng chỉ có giá trị gì với SA và Dev Lead?

### Lợi ích thực tế

- **Lấp lỗ hổng kiến thức có hệ thống.** Nhiều developer làm Spring nhiều năm nhưng chưa từng đọc kỹ về generics, module system hay quy tắc của `switch` pattern matching. Đề cương thi buộc bạn đi qua toàn bộ.
- **Tín hiệu khi tuyển dụng.** Với hồ sơ chưa có nhiều dự án nổi bật, hoặc khi chuyển sang thị trường/công ty mới, chứng chỉ giúp vượt vòng lọc hồ sơ.
- **Yêu cầu từ đối tác.** Một số công ty dịch vụ cần số lượng kỹ sư có chứng chỉ để đạt cấp độ đối tác hoặc đáp ứng yêu cầu của khách hàng.
- **Nền cho chứng chỉ kiến trúc.** Với SA, chứng chỉ Java/Spring là "tầng móng"; chứng chỉ cloud architect (bài tiếp theo) mới là thứ thị trường gắn trực tiếp với vai trò SA.

### Giới hạn cần nhận thức

Chứng chỉ không chứng minh khả năng thiết kế hệ thống, ra quyết định trade-off hay dẫn dắt team. Nhà tuyển dụng vị trí SA sẽ hỏi bạn đã thiết kế gì, quyết định gì và kết quả ra sao. Hãy coi chứng chỉ là **phần bổ trợ** cho portfolio và kinh nghiệm, không phải thay thế.

### Ma trận quyết định nhanh

| Tình huống của bạn | Gợi ý |
|---|---|
| 1–3 năm kinh nghiệm, muốn củng cố nền tảng | Thi OCP Java trước, sau đó Spring |
| Đã vững Java, làm Spring Boot hằng ngày | Có thể thi Spring trước, hoặc bỏ qua để tập trung chứng chỉ cloud |
| Đang nhắm SA trong 1–2 năm | Ưu tiên chứng chỉ cloud architect; Java/Spring là tuỳ chọn |
| Công ty yêu cầu cho dự án/đối tác | Làm theo yêu cầu, tận dụng ngân sách đào tạo của công ty |

## Oracle Certified Professional: Java SE 17/21 Developer

### Tổng quan

Từ thời Java 11, Oracle gộp con đường cấp Associate/Professional cũ thành **một bài thi duy nhất** cho danh hiệu OCP. Tại thời điểm viết, bài thi cho Java SE 17 là **1Z0-829** và cho Java SE 21 là **1Z0-830**. Nếu bắt đầu ôn từ đầu, hãy chọn phiên bản LTS mới nhất có bài thi, vì nội dung gần với code bạn viết hằng ngày và chứng chỉ "sống" lâu hơn trên CV.

Đề thi dạng trắc nghiệm, rất nhiều câu cho một đoạn code và hỏi kết quả: in ra gì, có biên dịch được không, có ném exception lúc chạy không. Đây là điểm khác biệt lớn so với công việc thực tế, nơi IDE báo lỗi biên dịch giúp bạn.

### Nhóm chủ đề chính

Đề cương chính thức có thể thay đổi, nhưng thường xoay quanh các nhóm sau (đối chiếu với các bài trong giai đoạn Java Core):

| Nhóm chủ đề | Nội dung cần chắc | Bài liên quan |
|---|---|---|
| Kiểu dữ liệu, String, text block, date/time, số | Ép kiểu, `String` bất biến, `StringBuilder`, `LocalDate`/`Duration`/`Period` | OOP & Java hiện đại |
| Điều khiển luồng | `switch` expression, pattern matching, vòng lặp có nhãn | OOP & Java hiện đại |
| OOP | Kế thừa, interface, record, sealed, nested class, khởi tạo object | OOP & Java hiện đại |
| Exception | Checked/unchecked, try-with-resources, multi-catch, exception khi đóng tài nguyên (suppressed) | (tự ôn thêm) |
| Mảng và Collections, generics | Cách chọn collection, wildcard, `Comparator` | Collections, Generics & Stream |
| Lambda và Stream | Functional interface có sẵn, collector, `Optional` | Collections, Generics & Stream |
| Module system | `module-info.java`, `requires`, `exports`, `opens` | (tự ôn thêm) |
| Concurrency | Executor, `Future`, lock, concurrent collection; virtual thread với bản 21 | Lập trình đồng thời |
| I/O và NIO.2 | `Path`, `Files`, đọc/ghi file, serialization | (tự ôn thêm) |
| Localization | `Locale`, `ResourceBundle`, định dạng số và ngày | (tự ôn thêm) |

### Dạng câu hỏi "bẫy" thường gặp

Đề thi rất thích các chi tiết nhỏ mà IDE hay che giấu. Ví dụ mỗi đoạn dưới đây nên trả lời được trong vài giây:

```java
var items = List.of("a", "b");
items.add("c");                       // biên dịch được, nhưng ném UnsupportedOperationException lúc chạy

record Point(int x, int y) {
    Point {
        if (x < 0) throw new IllegalArgumentException();
        // this.x = x;                // lỗi biên dịch: compact constructor tự gán field ở cuối
    }
}

sealed interface Vehicle permits Car, Bike {}
final class Car implements Vehicle {}
class Bike implements Vehicle {}      // lỗi biên dịch: phải là final, sealed hoặc non-sealed

String label = switch (day) {         // day là enum DayOfWeek
    case SATURDAY, SUNDAY -> "cuối tuần";
    default -> "ngày thường";         // bỏ default (không liệt kê đủ enum) thì không biên dịch
};
```

Kỹ thuật làm bài: với mỗi câu có code, **hỏi "có biên dịch được không?" trước tiên**, sau đó mới tính kết quả chạy. Nhiều đáp án sai được dựng sẵn cho người bỏ qua bước này.

### Kế thừa kiến thức từ công việc, ôn phần còn thiếu

Phần lớn developer Spring yếu ở module system, I/O, localization và các chi tiết khởi tạo object (thứ tự static block, instance initializer, constructor). Hãy làm một bài thi thử chẩn đoán ngay tuần đầu để biết mình yếu ở đâu, thay vì đọc sách từ trang 1 đến trang cuối.

## Spring Certified Professional

### Tổng quan

Chứng chỉ Spring Professional ban đầu do Pivotal, sau đó là VMware cấp; sau khi Broadcom mua lại VMware, chương trình đào tạo và chứng chỉ Spring được tổ chức qua **Spring Academy**. Bài thi từng được biết đến với mã **2V0-72.22** (Spring Professional Develop). Tên gọi, mã đề, điều kiện tham gia (ví dụ có bắt buộc học khoá chính thức hay không) đã thay đổi vài lần, nên hãy kiểm tra Spring Academy trước khi lên kế hoạch.

### Phạm vi kiến thức

Nội dung tập trung vào việc hiểu Spring **hoạt động thế nào**, không chỉ dùng annotation:

| Mảng | Câu hỏi bạn phải trả lời được |
|---|---|
| Spring Core | `ApplicationContext` khởi tạo bean thế nào, vòng đời bean, scope, `@Configuration` vs `@Component`, `@Profile`, `@Value`, `BeanPostProcessor` |
| AOP | Proxy JDK vs CGLIB, pointcut expression, vì sao lời gọi nội bộ trong cùng class không qua advice |
| Data access | `JdbcTemplate`, quản lý transaction, propagation, rollback rule, Spring Data JPA repository |
| Spring MVC và REST | `@RestController`, xử lý request, `ResponseEntity`, xử lý lỗi, `RestTemplate`/`RestClient` |
| Security | Chuỗi filter, xác thực, phân quyền URL và method (`@PreAuthorize`) |
| Testing | `@SpringBootTest`, test slice (`@WebMvcTest`, `@DataJpaTest`), `@MockBean`/`@MockitoBean` tuỳ phiên bản |
| Spring Boot | Auto-configuration hoạt động ra sao, `@ConditionalOn...`, starter, cấu hình ngoài, Actuator |

### Cách học hiệu quả

- **Viết lại từ đầu, không copy.** Tự cấu hình một ứng dụng chỉ bằng `@Configuration` + `@Bean` (không Boot), sau đó chuyển sang Boot và so sánh: Boot đã tự tạo những bean nào? Dùng endpoint Actuator `conditions` hoặc chạy với `--debug` để xem báo cáo auto-configuration.
- **Thí nghiệm có chủ đích.** Ví dụ: tạo hai method `@Transactional` với propagation khác nhau, ném exception checked và unchecked, quan sát khi nào rollback. Kiến thức tự kiểm chứng nhớ lâu hơn nhiều so với đọc.
- **Đọc tài liệu tham chiếu của Spring Framework** ở các chương Core Technologies, Data Access, Web Servlet, Testing. Đề thi bám sát khái niệm trong tài liệu chính thức.

## Kế hoạch ôn thi 8–10 tuần

Kế hoạch mẫu cho người đi làm, khoảng 6–8 giờ mỗi tuần (ví dụ 1 giờ buổi tối các ngày trong tuần và 2–3 giờ cuối tuần):

| Tuần | OCP Java SE | Spring Professional |
|---|---|---|
| 1 | Thi thử chẩn đoán, lập danh sách chủ đề yếu | Thi thử chẩn đoán, đọc đề cương chính thức |
| 2–3 | Kiểu dữ liệu, OOP, record, sealed, pattern matching | Core container, bean lifecycle, cấu hình Java |
| 4 | Exception, generics, collections | AOP, proxy, transaction |
| 5 | Lambda, functional interface, Stream | Data access, Spring Data JPA |
| 6 | Concurrency, virtual thread | MVC, REST, Security |
| 7 | Module, I/O, NIO.2, localization | Testing, Spring Boot auto-configuration, Actuator |
| 8 | Thi thử toàn phần, ôn lại câu sai | Thi thử toàn phần, ôn lại câu sai |
| 9–10 | Đệm: ôn các chủ đề còn dưới mức mục tiêu, đăng ký thi | Đệm: như bên trái |

Nguyên tắc ôn:

1. **Ghi sổ lỗi sai.** Mỗi câu sai ghi lại: chủ đề, vì sao sai, quy tắc đúng, một đoạn code tự viết để chứng minh. Ôn sổ này mỗi tuần.
2. **Code mỗi ngày.** Với từng quy tắc vừa học, viết ví dụ nhỏ và chạy bằng `java File.java` (chạy trực tiếp file nguồn từ Java 11) hoặc JShell để kiểm chứng.
3. **Đề thi thử uy tín.** Chọn ngân hàng câu hỏi có giải thích chi tiết; mục tiêu là hiểu giải thích, không phải học thuộc đáp án.
4. **Mô phỏng điều kiện thi thật.** Ít nhất hai lần làm đề toàn phần, bấm giờ, không tra cứu.

## Checklist trước khi đăng ký và sau khi đạt

**Trước khi đăng ký:**

- [ ] Đã đọc đề cương chính thức của đúng phiên bản bài thi.
- [ ] Đạt kết quả ổn định, cao hơn mức đạt một khoảng an toàn, ở ít nhất 2–3 đề thi thử gần nhất.
- [ ] Sổ lỗi sai không còn chủ đề nào sai lặp lại.
- [ ] Đã kiểm tra quy định thi (thi online có giám sát hay tại trung tâm, yêu cầu giấy tờ, phòng thi, webcam).
- [ ] Đã hỏi công ty về ngân sách đào tạo hoặc chính sách hoàn phí.

**Sau khi đạt:**

- [ ] Thêm chứng chỉ và badge số vào LinkedIn, CV; ghi rõ phiên bản (ví dụ Java SE 21).
- [ ] Viết một bài chia sẻ kinh nghiệm ôn thi: đây cũng là nội dung cho portfolio (xem bài Portfolio & Phỏng vấn).
- [ ] Áp dụng ngay vào công việc: đề xuất dùng record, sealed, virtual thread ở nơi phù hợp, hoặc chia sẻ trong team.

## Lỗi thường gặp

- **Học thuộc đề dump**: vi phạm điều khoản thi, có thể bị thu hồi chứng chỉ, và không để lại kiến thức. Cách sửa: dùng đề thi thử hợp pháp, tập trung vào giải thích.
- **Chỉ đọc, không code**: đọc thấy hiểu nhưng vào đề vẫn sai các chi tiết biên dịch. Cách sửa: mỗi quy tắc một đoạn code tự chạy.
- **Thi bản cũ vì tài liệu nhiều hơn**: chứng chỉ cũ kém giá trị dần theo thời gian. Cách sửa: chọn phiên bản LTS mới nhất có bài thi, trừ khi công ty yêu cầu khác.
- **Ôn quá dài, không có ngày thi**: kéo dài nhiều tháng rồi bỏ dở. Cách sửa: đặt ngày thi mục tiêu ngay khi thi thử chẩn đoán đạt mức khá, giữ tuần đệm.
- **Coi chứng chỉ là đích đến**: đạt xong không dùng kiến thức. Cách sửa: gắn mỗi chủ đề ôn với một cải tiến trong dự án thật.

## Bài tập thực hành

1. **Thi thử chẩn đoán và lập kế hoạch**: làm một đề thi thử OCP hoặc Spring, phân loại câu sai theo bảng nhóm chủ đề ở trên, rồi điều chỉnh kế hoạch 8–10 tuần cho đúng điểm yếu của bạn. Đặt ngày thi mục tiêu vào lịch.
2. **Bộ "bẫy biên dịch" của riêng bạn**: viết 20 đoạn code nhỏ, mỗi đoạn minh hoạ một quy tắc dễ nhầm (record, sealed, switch, generics, try-with-resources, khởi tạo object). Với mỗi đoạn, dự đoán kết quả trước rồi chạy bằng JShell để kiểm chứng.
3. **Thí nghiệm Spring**: xây ứng dụng nhỏ chứng minh ba điều: lời gọi nội bộ bỏ qua `@Transactional`, exception checked mặc định không rollback, và một auto-configuration bị tắt khi bạn tự khai báo bean cùng loại. Ghi lại kết quả thành một bài blog ngắn.

## Tóm tắt

- Chứng chỉ Java/Spring là bằng chứng nền tảng và là động lực học có hệ thống, không thay thế được kinh nghiệm thiết kế.
- OCP Java SE 17 (1Z0-829) và 21 (1Z0-830) là một bài thi duy nhất, nhiều câu đọc code; luôn kiểm tra "có biên dịch được không" trước.
- Spring Professional đòi hỏi hiểu cơ chế bên trong: container, proxy/AOP, transaction, auto-configuration, testing.
- Ôn theo kế hoạch 8–10 tuần: chẩn đoán, học theo chủ đề yếu, sổ lỗi sai, thi thử toàn phần.
- Thông tin thi (mã đề, giá, điểm đạt, hình thức) thay đổi; luôn xác minh ở trang chính thức.
- Biến quá trình ôn thành nội dung portfolio và cải tiến trong dự án thật.
