Lập trình hướng đối tượng (OOP) là "ngôn ngữ chung" mà mọi codebase Java dùng để mô hình hoá nghiệp vụ. Một Solution Architect hay Dev Lead không chỉ cần viết được class, mà còn phải nhìn ra ranh giới trách nhiệm, chỗ nào nên mở rộng, chỗ nào nên khoá chặt. Java hiện đại (17/21) bổ sung record, sealed class và pattern matching, giúp ta mô hình hoá dữ liệu gọn và an toàn hơn rất nhiều so với Java 8. Bài này đi từ nền tảng OOP đến SOLID và các design pattern bạn sẽ gặp hằng ngày.

## Mục tiêu bài học

- Giải thích và áp dụng đúng 4 tính chất OOP: đóng gói, kế thừa, đa hình, trừu tượng.
- Chọn đúng giữa interface, abstract class và default method cho từng tình huống.
- Dùng record, sealed class, pattern matching cho `instanceof` và `switch` (Java 21) để mô hình hoá dữ liệu.
- Nhận diện vi phạm SOLID trong code và refactor về thiết kế tốt hơn.
- Áp dụng 5 pattern GoF phổ biến: Factory, Builder, Strategy, Observer, Singleton, và biết khi nào không nên dùng.

## Bốn tính chất của OOP

### Đóng gói (encapsulation)

Đóng gói nghĩa là **giấu trạng thái bên trong và chỉ cho phép thay đổi qua các hành vi có kiểm soát**. Mục tiêu thật sự không phải là "field private + getter/setter", mà là bảo vệ **bất biến** (invariant) của đối tượng: những điều kiện luôn phải đúng, ví dụ số dư tài khoản không bao giờ âm.

```java
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

public final class BankAccount {
    private final String id;
    private BigDecimal balance = BigDecimal.ZERO;
    private final List<String> history = new ArrayList<>();

    public BankAccount(String id) {
        this.id = id;
    }

    public void deposit(BigDecimal amount) {
        requirePositive(amount);
        balance = balance.add(amount);
        history.add("+" + amount);
    }

    public void withdraw(BigDecimal amount) {
        requirePositive(amount);
        if (balance.compareTo(amount) < 0) {
            throw new IllegalStateException("Số dư không đủ trong tài khoản " + id);
        }
        balance = balance.subtract(amount);
        history.add("-" + amount);
    }

    public BigDecimal balance() { return balance; }          // BigDecimal bất biến nên trả về an toàn
    public List<String> history() { return List.copyOf(history); } // trả bản sao, không lộ list nội bộ

    private static void requirePositive(BigDecimal amount) {
        if (amount.signum() <= 0) throw new IllegalArgumentException("Số tiền phải > 0");
    }
}
```

Để ý: không có `setBalance()`. Nếu có setter, bất kỳ ai cũng có thể phá bất biến. Getter của collection trả về bản sao chỉ đọc để bên ngoài không sửa được dữ liệu bên trong.

### Kế thừa (inheritance)

Kế thừa cho phép lớp con dùng lại và mở rộng lớp cha (`extends`). Nó mạnh nhưng tạo **liên kết chặt** (tight coupling): lớp con phụ thuộc vào chi tiết cài đặt của lớp cha, đổi lớp cha có thể làm vỡ lớp con. Lời khuyên kinh điển từ Effective Java là **ưu tiên composition hơn inheritance**: thay vì "là một" (is-a), hãy cân nhắc "có một" (has-a) và uỷ quyền (delegation).

Chỉ dùng kế thừa khi quan hệ is-a thật sự đúng về hành vi, và lớp cha được thiết kế để kế thừa. Nếu không, hãy khai báo class là `final`.

### Đa hình (polymorphism)

Đa hình là khả năng cùng một lời gọi cho ra hành vi khác nhau tuỳ đối tượng thực tế. Java có hai dạng:

- **Overriding** (đa hình lúc chạy): lớp con ghi đè method của lớp cha/interface, JVM chọn method theo kiểu thực tế của object (dynamic dispatch).
- **Overloading** (đa hình lúc biên dịch): nhiều method cùng tên khác tham số, compiler chọn dựa trên kiểu khai báo.

Đa hình là nền tảng của gần như mọi pattern: code phụ thuộc vào kiểu trừu tượng, còn cài đặt cụ thể được "cắm" vào lúc chạy.

### Trừu tượng (abstraction)

Trừu tượng là chỉ lộ ra **cái gì** (what) mà giấu **làm thế nào** (how). Interface `PaymentGateway` với method `charge()` là một trừu tượng; việc gọi API của VNPay hay Stripe là chi tiết. Trừu tượng tốt giúp hệ thống thay đổi được mà không lan rộng, nhưng trừu tượng quá sớm (tạo interface cho mọi thứ dù chỉ có một cài đặt) lại làm code khó đọc.

## Interface, abstract class và default method

| Tiêu chí | Interface | Abstract class |
|---|---|---|
| Trạng thái (instance field) | Không, chỉ có hằng số | Có |
| Constructor | Không | Có |
| Đa kế thừa | Một class implement nhiều interface | Chỉ extends một class |
| Method có thân | `default`, `static` (Java 8), `private` (Java 9) | Bất kỳ |
| Dùng khi | Định nghĩa "hợp đồng"/năng lực | Chia sẻ trạng thái và khung xử lý chung |

**Default method** (Java 8) cho phép thêm method mới vào interface mà không làm vỡ các class đã implement, ví dụ `List.sort()` hay `Map.getOrDefault()`. Nếu một class implement hai interface có cùng default method, compiler buộc bạn phải override và chọn rõ ràng:

```java
interface Flyer   { default String move() { return "bay"; } }
interface Swimmer { default String move() { return "bơi"; } }

class Duck implements Flyer, Swimmer {
    @Override
    public String move() {
        return Flyer.super.move() + " và " + Swimmer.super.move();
    }
}
```

> **Lưu ý:** Default method dùng để tiến hoá API, không phải để nhồi logic nghiệp vụ vào interface. Nếu cần trạng thái dùng chung, đó là dấu hiệu nên dùng abstract class hoặc composition.

Abstract class hợp với **Template Method**: lớp cha định nghĩa khung thuật toán (`final` method), lớp con điền các bước trừu tượng. Ví dụ một `AbstractReportExporter` định nghĩa `export()` gồm `loadData()`, `format()`, `write()`.

## Java hiện đại: record, sealed class, pattern matching

### Record (Java 16+)

`record` là class dữ liệu bất biến: compiler tự sinh constructor, accessor (`x()` thay vì `getX()`), `equals`, `hashCode`, `toString`. Record ngầm định là `final`, các field là `private final`. Dùng record cho DTO, value object, kết quả trả về, key của Map. Có thể kiểm tra dữ liệu trong **compact constructor**.

Không nên dùng record cho JPA entity, vì entity cần constructor không tham số, có thể bị thay đổi trạng thái và thường được Hibernate tạo proxy.

### Sealed class (Java 17+)

`sealed` giới hạn những class nào được phép kế thừa/implement. Mỗi lớp con được phép phải là `final`, `sealed` hoặc `non-sealed`. Giá trị lớn nhất: compiler biết **toàn bộ** các trường hợp, nên `switch` có thể kiểm tra tính đầy đủ (exhaustiveness).

### Pattern matching cho `instanceof` (Java 16+) và `switch` (Java 21)

```java
// instanceof pattern: kiểm tra và ép kiểu trong một bước
if (obj instanceof String s && !s.isBlank()) {
    System.out.println(s.toUpperCase());
}
```

Kết hợp ba tính năng ta được mô hình dữ liệu kiểu "algebraic data type":

```java
public sealed interface Shape permits Circle, Rectangle, Square {}

public record Circle(double radius) implements Shape {
    public Circle {                       // compact constructor
        if (radius <= 0) throw new IllegalArgumentException("radius phải > 0");
    }
}
public record Rectangle(double width, double height) implements Shape {}
public record Square(double side) implements Shape {}

public final class Geometry {
    private Geometry() {}

    public static double area(Shape shape) {
        return switch (shape) {                              // switch expression
            case Circle c -> Math.PI * c.radius() * c.radius();
            case Rectangle(double w, double h) -> w * h;     // record pattern (Java 21)
            case Square s when s.side() > 10_000 ->          // guard với "when" (Java 21)
                throw new IllegalArgumentException("Kích thước quá lớn");
            case Square s -> s.side() * s.side();
        };                                                   // không cần default: sealed đã đủ
    }
}
```

Nếu sau này thêm `Triangle` vào danh sách `permits`, mọi `switch` thiếu nhánh `Triangle` sẽ **không biên dịch được**. Đây là lợi thế lớn so với chuỗi `if-else instanceof` hoặc `default` nuốt lỗi. Lưu ý thứ tự: nhánh có guard (`when`) phải đứng trước nhánh cùng kiểu không có guard, nếu không compiler báo nhánh sau bị "dominated".

**Khi nào dùng sealed + switch, khi nào dùng đa hình?** Nếu tập kiểu cố định và các thao tác thay đổi thường xuyên (tính diện tích, vẽ, xuất JSON), sealed + switch giúp thêm thao tác mới dễ dàng. Nếu tập thao tác cố định mà kiểu mới thường xuyên được thêm (plugin), đa hình qua method trừu tượng sẽ hợp hơn.

## Nguyên lý SOLID

| Nguyên lý | Ý nghĩa ngắn | Dấu hiệu vi phạm |
|---|---|---|
| **S**ingle Responsibility | Mỗi class chỉ có một lý do để thay đổi | `OrderService` vừa tính giá, vừa gửi email, vừa xuất PDF |
| **O**pen/Closed | Mở để mở rộng, đóng để sửa đổi | Mỗi loại khuyến mãi mới lại phải sửa một `switch` khổng lồ |
| **L**iskov Substitution | Lớp con thay được lớp cha mà không làm sai hành vi | `Square extends Rectangle`, `setWidth()` làm đổi cả chiều cao |
| **I**nterface Segregation | Không ép client phụ thuộc method nó không dùng | Interface `Worker` có cả `work()` và `eat()`, robot phải implement `eat()` |
| **D**ependency Inversion | Module cấp cao phụ thuộc vào trừu tượng, không vào chi tiết | `ReportService` tự `new MySqlConnection()` bên trong |

SOLID là kim chỉ nam, không phải luật tuyệt đối. Áp dụng máy móc dễ sinh ra hàng chục interface một cài đặt và lớp trừu tượng vô nghĩa. Hãy áp dụng khi thấy **thay đổi thực tế** đang gây đau: một class bị sửa vì quá nhiều lý do khác nhau, hoặc mỗi tính năng mới lại phải sửa code cũ ở nhiều chỗ.

DIP chính là nền tảng của **dependency injection** (DI, tiêm phụ thuộc): thay vì class tự tạo phụ thuộc, phụ thuộc được truyền vào qua constructor. Spring làm việc này tự động, nhưng nguyên lý vẫn đúng khi không có framework.

## Design pattern GoF phổ biến

GoF (Gang of Four) là bốn tác giả cuốn "Design Patterns" (1994), mô tả 23 pattern. Dưới đây là 5 pattern bạn gặp nhiều nhất trong Java hiện đại.

### Strategy và Factory

**Strategy** đóng gói một họ thuật toán có thể hoán đổi. Trong Java hiện đại, strategy thường chỉ là một functional interface và lambda. **Factory** tập trung logic tạo object, giấu việc chọn cài đặt cụ thể khỏi client. Kết hợp hai pattern này giúp tuân thủ Open/Closed:

```java
import java.math.BigDecimal;
import java.util.Map;

public enum ShippingMethod { STANDARD, EXPRESS, PICKUP }

public record Order(String id, BigDecimal weightKg) {}

@FunctionalInterface
public interface ShippingFeeStrategy {
    BigDecimal fee(Order order);
}

public final class ShippingFees {
    private static final BigDecimal BASE = new BigDecimal("30000");
    private static final Map<ShippingMethod, ShippingFeeStrategy> STRATEGIES = Map.of(
            ShippingMethod.STANDARD, order -> BASE,
            ShippingMethod.EXPRESS,  order -> BASE.add(order.weightKg().multiply(new BigDecimal("5000"))),
            ShippingMethod.PICKUP,   order -> BigDecimal.ZERO);

    private ShippingFees() {}

    public static ShippingFeeStrategy forMethod(ShippingMethod method) {   // factory method
        return STRATEGIES.get(method);
    }
}
```

Trong Spring, bạn thường khai báo mỗi strategy là một bean và inject `List<ShippingFeeStrategy>` hoặc `Map<String, ShippingFeeStrategy>`; thêm strategy mới chỉ cần thêm một class. Static factory method như `List.of()`, `Optional.of()`, `Duration.ofSeconds()` cũng là dạng Factory: có tên rõ nghĩa và có thể trả về instance cache sẵn.

### Builder

Builder giải quyết bài toán constructor có nhiều tham số tuỳ chọn ("telescoping constructor"). Nó giúp code gọi dễ đọc và cho phép kiểm tra hợp lệ một lần ở `build()`.

```java
import java.time.Duration;
import java.util.HashMap;
import java.util.Map;
import java.util.Objects;

public final class HttpRequestSpec {
    private final String url;
    private final String method;
    private final Duration timeout;
    private final Map<String, String> headers;

    private HttpRequestSpec(Builder b) {
        this.url = Objects.requireNonNull(b.url, "url");
        this.method = b.method;
        this.timeout = b.timeout;
        this.headers = Map.copyOf(b.headers);
    }

    public static Builder builder(String url) { return new Builder(url); }

    public static final class Builder {
        private final String url;
        private String method = "GET";
        private Duration timeout = Duration.ofSeconds(5);
        private final Map<String, String> headers = new HashMap<>();

        private Builder(String url) { this.url = url; }
        public Builder method(String method) { this.method = method; return this; }
        public Builder timeout(Duration timeout) { this.timeout = timeout; return this; }
        public Builder header(String name, String value) { headers.put(name, value); return this; }
        public HttpRequestSpec build() { return new HttpRequestSpec(this); }
    }
}
// Dùng: HttpRequestSpec.builder("https://api.example.com").method("POST").timeout(Duration.ofSeconds(2)).build();
```

Không cần Builder khi object chỉ có 2–3 field bắt buộc: một record hoặc constructor thường là đủ.

### Observer

Observer cho phép một đối tượng (subject) thông báo cho nhiều đối tượng quan tâm (observer/listener) mà không cần biết chúng là ai. Lớp `java.util.Observer` cũ đã bị deprecated từ Java 9; ngày nay ta tự định nghĩa listener interface, hoặc dùng `ApplicationEventPublisher` của Spring, hay message broker ở mức hệ thống.

```java
public interface OrderPlacedListener {
    void onOrderPlaced(Order order);
}

public final class OrderService {
    private final List<OrderPlacedListener> listeners = new CopyOnWriteArrayList<>();

    public void subscribe(OrderPlacedListener listener) { listeners.add(listener); }

    public void place(Order order) {
        // ... lưu đơn hàng
        listeners.forEach(l -> l.onOrderPlaced(order));   // gửi email, cộng điểm, ghi audit...
    }
}
```

Trade-off: Observer giảm coupling nhưng luồng xử lý khó theo dõi hơn, và một listener chậm hoặc ném exception có thể ảnh hưởng subject nếu gọi đồng bộ.

### Singleton

Singleton đảm bảo một class chỉ có một instance. Cách an toàn và gọn nhất trong Java là dùng `enum`, vì JVM đảm bảo khởi tạo thread-safe và chống tạo thêm instance qua serialization/reflection:

```java
public enum IdGenerator {
    INSTANCE;
    private final AtomicLong counter = new AtomicLong();
    public long next() { return counter.incrementAndGet(); }
}
```

Tuy vậy, Singleton tự viết là **trạng thái toàn cục**: khó mock khi test và che giấu phụ thuộc. Trong ứng dụng Spring, bean mặc định đã có scope singleton (một instance trong mỗi container), nên hãy để DI quản lý thay vì tự viết `getInstance()`.

## Lỗi thường gặp

- **Getter/setter cho mọi field ("anemic model")**: object chỉ là túi dữ liệu, logic nằm rải rác ở service. Cách sửa: đưa hành vi về đúng object sở hữu dữ liệu (`account.withdraw()` thay vì `account.setBalance(...)`).
- **Kế thừa để tái sử dụng code**: tạo `BaseService` khổng lồ cho mọi service kế thừa. Cách sửa: tách thành các component nhỏ và inject vào (composition).
- **Lộ collection nội bộ**: getter trả về chính `List` bên trong, bên ngoài `add()` thoải mái. Cách sửa: trả `List.copyOf()` hoặc view chỉ đọc.
- **`switch` có `default` trên sealed type**: `default` làm mất kiểm tra tính đầy đủ, thêm kiểu mới không ai biết. Cách sửa: liệt kê đủ các nhánh và bỏ `default`.
- **Dùng record làm JPA entity**: Hibernate cần entity có thể thay đổi và có constructor không tham số. Cách sửa: dùng record cho DTO/projection, class thường cho entity.
- **Pattern cho có**: thêm Factory, Strategy khi chỉ có một cài đặt và không có kế hoạch mở rộng. Cách sửa: bắt đầu đơn giản, refactor sang pattern khi nhu cầu thật xuất hiện.

## Bài tập thực hành

1. **Mô hình thư viện bằng sealed + record**: định nghĩa `sealed interface LibraryItem permits Book, Magazine, Dvd` với các record tương ứng. Viết method `loanDays(LibraryItem item)` bằng switch pattern matching (sách 14 ngày, tạp chí 7 ngày, DVD 3 ngày, sách có hơn 1.000 trang được thêm 7 ngày dùng `when`). Thêm `AudioBook` vào `permits` và quan sát lỗi biên dịch.
2. **Refactor theo SOLID**: viết một `InvoiceService` "xấu" có method `process()` tính tiền, áp mã giảm giá bằng `switch` trên String, gửi email và ghi file. Refactor tách thành `PriceCalculator`, `DiscountPolicy` (Strategy), `InvoiceNotifier` (Observer) và truyền phụ thuộc qua constructor.
3. **Builder có kiểm tra hợp lệ**: viết `MemberRegistration` với Builder, `build()` ném exception nếu thiếu email hoặc ngày sinh ở tương lai. Viết vài unit test cho các trường hợp hợp lệ và không hợp lệ.

## Tóm tắt

- Đóng gói là bảo vệ bất biến, không phải chỉ đặt `private` rồi sinh getter/setter.
- Ưu tiên composition; chỉ kế thừa khi quan hệ is-a đúng về hành vi, còn lại khai báo `final`.
- Interface định nghĩa hợp đồng, abstract class chia sẻ trạng thái/khung xử lý; default method dùng để tiến hoá API.
- Record (16+), sealed (17+) và pattern matching cho switch (21) giúp mô hình dữ liệu gọn, bất biến và được compiler kiểm tra tính đầy đủ.
- SOLID là công cụ để kiểm soát thay đổi; áp dụng khi có nhu cầu thật, tránh trừu tượng hoá quá sớm.
- Strategy, Factory, Builder, Observer, Singleton đều có dạng hiện đại gọn hơn nhờ lambda, enum và DI của Spring.
