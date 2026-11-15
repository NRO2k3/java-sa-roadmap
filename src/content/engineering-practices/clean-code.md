Code được đọc nhiều hơn được viết rất nhiều lần: mỗi dòng bạn viết hôm nay sẽ được đồng đội đọc lại khi sửa bug, review hay thêm tính năng. Với Dev Lead, clean code không phải sở thích cá nhân mà là **chuẩn chung giúp cả team đi nhanh lâu dài**: code dễ hiểu thì review nhanh, ít bug và người mới onboard sớm. Quan trọng không kém là kỹ năng **refactor an toàn**, tức là cải thiện code cũ mà không làm hỏng hành vi đang chạy trên production. Bài này giúp bạn nhận diện vấn đề, sửa nó từng bước nhỏ và xử lý cả những codebase legacy "không ai dám động vào".

## Mục tiêu bài học

- Nhận diện bốn code smell phổ biến: long method, god class, feature envy, duplicated code.
- Refactor từng bước nhỏ, an toàn với test và các thao tác refactor tự động của IDE.
- Áp dụng SOLID và design pattern trong ứng dụng Spring ở mức vừa đủ, tránh over-engineering.
- Viết characterization test để "khoá" hành vi hiện tại trước khi sửa code legacy.

## Code smell là gì

**Code smell** ("mùi code") là dấu hiệu bề mặt cho thấy thiết kế có thể đang có vấn đề. Smell không phải bug: code vẫn chạy đúng, nhưng sẽ khó sửa, khó test và dễ sinh bug về sau. Smell là gợi ý để xem xét, không phải luật tuyệt đối; luôn hỏi "chi phí của smell này với team là gì" trước khi refactor.

### Long method

Method dài hàng trăm dòng, làm nhiều việc ở nhiều mức trừu tượng khác nhau: vừa validate input, vừa tính toán nghiệp vụ, vừa gọi repository, vừa gửi email. Dấu hiệu dễ thấy: phải cuộn màn hình mới đọc hết, có comment kiểu `// bước 3: tính giảm giá` chia method thành các khúc, nhiều biến tạm dùng xuyên suốt.

Cách sửa chính là **Extract Method**: mỗi khúc có comment thường là ứng viên tốt cho một method riêng, và tên method thay thế luôn comment đó. Mục tiêu là method cấp cao đọc như một đoạn văn mô tả các bước nghiệp vụ.

### God class

Một class "biết mọi thứ, làm mọi thứ": `OrderService` 3.000 dòng, inject 15 dependency, xử lý cả đặt hàng, hoàn tiền, xuất báo cáo và đồng bộ kho. Mọi thay đổi đều chạm vào class này nên merge conflict liên tục và test phải mock cả chục thứ.

Cách sửa là **Extract Class**: gom các field và method hay đi cùng nhau thành class mới, ví dụ tách `RefundService`, `OrderReportService`. Một mẹo thực tế là nhìn danh sách dependency trong constructor: nhóm method nào chỉ dùng một nhóm dependency riêng thì đó là đường cắt tự nhiên.

### Feature envy

Một method "ghen tị" với class khác: nó dùng dữ liệu của object khác nhiều hơn dữ liệu của chính class chứa nó. Ví dụ service gọi `customer.getTier()`, `customer.getYearsActive()`, `customer.getJoinDate()` để tự tính mức giảm giá. Logic đó thuộc về `Customer`. Cách sửa: **Move Method**, đưa hành vi về gần dữ liệu. Đây cũng là cách chữa bệnh "anemic domain model", khi entity chỉ có getter/setter còn toàn bộ logic nằm rải rác ở service.

### Duplicated code

Cùng một đoạn logic xuất hiện ở nhiều nơi; khi nghiệp vụ đổi, bạn sửa chỗ này mà quên chỗ kia. Cách sửa: Extract Method rồi gọi lại, hoặc Pull Up Method nếu trùng giữa các class con.

> **Lưu ý:** DRY (Don't Repeat Yourself) nói về việc trùng lặp **kiến thức nghiệp vụ**, không phải trùng lặp **câu chữ**. Hai đoạn code trông giống nhau nhưng thay đổi vì hai lý do khác nhau (ví dụ validate đơn hàng B2B và B2C) thì gộp lại sẽ tạo coupling sai. Quy tắc "rule of three" hữu ích ở đây: lần thứ ba thấy cùng một logic mới trừu tượng hoá.

## Refactor an toàn

**Refactoring** là thay đổi cấu trúc bên trong của code **mà không thay đổi hành vi quan sát được từ bên ngoài**. Định nghĩa này có hệ quả quan trọng: nếu không có cách kiểm chứng hành vi (test), bạn không refactor mà đang "sửa code và cầu may".

### Quy trình từng bước nhỏ

1. Đảm bảo có test bao phủ đoạn code sắp sửa và test đang xanh.
2. Thực hiện **một** thay đổi nhỏ (đổi tên, extract một method).
3. Chạy test. Xanh thì commit; đỏ thì revert ngay thay vì debug lâu.
4. Lặp lại.

Kent Beck có một ẩn dụ được Martin Fowler nhắc lại: lập trình viên đội "hai chiếc mũ", hoặc đang thêm tính năng, hoặc đang refactor, không đội cả hai cùng lúc. Trong thực tế, hãy tách **commit refactor** và **commit thay đổi hành vi**, thậm chí tách PR. Reviewer đọc PR refactor thuần với tâm thế "chỉ cần kiểm tra hành vi không đổi", nhanh hơn nhiều so với PR trộn lẫn.

Một kỹ thuật hay là **preparatory refactoring**: trước khi thêm tính năng, refactor để việc thêm tính năng trở nên dễ, rồi mới thêm tính năng.

### Dùng công cụ refactor của IDE

IntelliJ IDEA (và Eclipse) có các refactoring tự động, an toàn hơn sửa tay vì IDE cập nhật mọi chỗ gọi:

| Thao tác | Khi nào dùng | Phím tắt IntelliJ (Windows/Linux) |
|---|---|---|
| Rename | Tên không nói lên ý nghĩa | `Shift+F6` |
| Extract Method | Long method, khúc code có comment | `Ctrl+Alt+M` |
| Extract Variable | Biểu thức phức tạp cần một cái tên | `Ctrl+Alt+V` |
| Inline | Method/biến trung gian không thêm giá trị | `Ctrl+Alt+N` |
| Extract Delegate | Tách một phần class thành class mới (Extract Class) | Menu Refactor |
| Introduce Parameter Object | Method nhận nhiều tham số luôn đi cùng nhau | Menu Refactor |

Phím `Ctrl+Alt+Shift+T` ("Refactor This") mở danh sách mọi refactoring khả dụng tại vị trí con trỏ. Dù IDE an toàn, vẫn chạy test sau mỗi bước: IDE không biết về reflection, chuỗi tên bean trong config hay query JPQL viết dạng string.

### Ví dụ: trước và sau refactor

Trước refactor, một method vừa dài, vừa có feature envy, vừa nhận danh sách tham số dài:

```java
public OrderResult placeOrder(String customerId, String street, String city,
                              String zip, List<OrderLine> lines, String couponCode) {
    Customer customer = customerRepository.findById(customerId)
            .orElseThrow(() -> new NotFoundException("Customer " + customerId));
    if (lines == null || lines.isEmpty()) {
        throw new IllegalArgumentException("Order must have lines");
    }
    // tính tổng tiền
    BigDecimal total = BigDecimal.ZERO;
    for (OrderLine line : lines) {
        total = total.add(line.unitPrice().multiply(BigDecimal.valueOf(line.quantity())));
    }
    // giảm giá theo hạng khách hàng
    if (customer.getTier() == Tier.GOLD && customer.getYearsActive() > 3) {
        total = total.multiply(new BigDecimal("0.90"));
    } else if (customer.getTier() == Tier.SILVER) {
        total = total.multiply(new BigDecimal("0.95"));
    }
    // ... áp coupon, lưu đơn, gửi email, ghi audit: thêm 60 dòng nữa
}
```

Sau refactor (Introduce Parameter Object, Extract Method, Move Method):

```java
public record ShippingAddress(String street, String city, String zip) {}

public record PlaceOrderCommand(String customerId, ShippingAddress address,
                                List<OrderLine> lines, String couponCode) {
    public PlaceOrderCommand {
        if (lines == null || lines.isEmpty()) {
            throw new IllegalArgumentException("Order must have lines");
        }
        lines = List.copyOf(lines); // bất biến, tránh bị sửa từ bên ngoài
    }
}

// Trong OrderService: method cấp cao đọc như mô tả nghiệp vụ
public OrderResult placeOrder(PlaceOrderCommand cmd) {
    Customer customer = findCustomer(cmd.customerId());
    BigDecimal subtotal = subtotalOf(cmd.lines());
    BigDecimal afterLoyalty = subtotal.multiply(customer.loyaltyMultiplier());
    BigDecimal total = couponService.apply(cmd.couponCode(), afterLoyalty);
    return saveAndNotify(customer, cmd, total);
}

// Trong Customer: logic về hạng khách hàng nằm cạnh dữ liệu của nó
public BigDecimal loyaltyMultiplier() {
    return switch (tier) {
        case GOLD -> yearsActive > 3 ? new BigDecimal("0.90") : BigDecimal.ONE;
        case SILVER -> new BigDecimal("0.95");
        case STANDARD -> BigDecimal.ONE;
    };
}
```

Lưu ý `switch` expression trên enum liệt kê đủ mọi hằng nên không cần `default`; khi ai đó thêm hạng `PLATINUM`, compiler báo lỗi ngay thay vì âm thầm rơi vào nhánh mặc định. Validation chuyển vào compact constructor của record nên mọi `PlaceOrderCommand` tồn tại đều hợp lệ. Đây là các bước thực hiện lần lượt, mỗi bước chạy test một lần, không phải viết lại một lượt.

## SOLID và design pattern trong Spring

SOLID là năm nguyên tắc giúp code dễ mở rộng và dễ test. Trong ứng dụng Spring, chúng thể hiện cụ thể như sau:

- **S – Single Responsibility**: mỗi class có một lý do để thay đổi. Chính là thuốc chữa god class.
- **O – Open/Closed**: thêm hành vi mới bằng cách thêm class mới thay vì sửa chuỗi `if/else` cũ.
- **L – Liskov Substitution**: class con thay được class cha mà không phá hợp đồng; ví dụ implementation không được ném `UnsupportedOperationException` cho method của interface.
- **I – Interface Segregation**: interface nhỏ, đúng nhu cầu người dùng nó, thay vì một interface "khổng lồ".
- **D – Dependency Inversion**: phụ thuộc vào abstraction; trong Spring thể hiện qua constructor injection, giúp unit test truyền mock dễ dàng.

Ví dụ Open/Closed với Strategy pattern, tận dụng việc Spring inject mọi bean cùng kiểu vào một `List`:

```java
public interface PaymentProcessor {
    PaymentMethod method();
    PaymentResult pay(PaymentRequest request);
}

@Component
class CardPaymentProcessor implements PaymentProcessor { /* ... */ }

@Component
class EWalletPaymentProcessor implements PaymentProcessor { /* ... */ }

@Service
public class PaymentService {
    private final Map<PaymentMethod, PaymentProcessor> processors;

    public PaymentService(List<PaymentProcessor> all) {
        // toUnmodifiableMap ném lỗi nếu hai processor trùng method: fail fast khi khởi động
        this.processors = all.stream()
                .collect(Collectors.toUnmodifiableMap(PaymentProcessor::method, Function.identity()));
    }

    public PaymentResult pay(PaymentRequest request) {
        PaymentProcessor processor = processors.get(request.method());
        if (processor == null) {
            throw new UnsupportedPaymentMethodException(request.method());
        }
        return processor.pay(request);
    }
}
```

Thêm phương thức thanh toán mới chỉ cần thêm một `@Component`, không sửa `PaymentService`. Các pattern khác hay gặp trong Spring: **Observer** qua `ApplicationEventPublisher` và `@EventListener` để tách tác vụ phụ (gửi email, ghi audit) khỏi luồng chính; **Decorator/Proxy** qua AOP (`@Transactional`, `@Cacheable` chính là proxy); **Template Method/Callback** như `JdbcTemplate`, `TransactionTemplate`.

### Khi nào không nên áp dụng

Pattern có chi phí: thêm class, thêm tầng gián tiếp, khó lần theo luồng code. Một số dấu hiệu over-engineering:

- Tạo interface `XxxService` + `XxxServiceImpl` cho mọi service dù chỉ có một implementation. Spring proxy được class thường; chỉ tạo interface khi thật sự có nhiều implementation hoặc cần ranh giới module rõ ràng.
- Dùng Strategy cho `switch` chỉ có hai nhánh và gần như không bao giờ thay đổi.
- Thiết kế "cho tương lai" theo kiểu YAGNI (You Aren't Gonna Need It): đoán trước yêu cầu chưa có.

Nguyên tắc: áp dụng pattern khi nó **giải quyết một vấn đề đang có** (smell đã xuất hiện, thay đổi đang lặp lại), không phải vì "code chuẩn thì phải có pattern".

## Làm việc với code legacy

Michael Feathers định nghĩa **legacy code** đơn giản là code không có test. Vòng luẩn quẩn: muốn refactor thì cần test, nhưng code khó test vì chưa được refactor. Lối ra là **characterization test**: test ghi lại hành vi **hiện tại** của code, kể cả hành vi trông có vẻ sai, để làm lưới an toàn khi sửa.

### Cách viết characterization test

1. Chọn đoạn code sắp sửa và tìm điểm có thể gọi được từ test (public method, hoặc tạo "seam", tức là điểm có thể thay đổi hành vi mà không sửa code tại chỗ, ví dụ tách dependency ra constructor).
2. Viết test với giá trị kỳ vọng tạm (ví dụ `0`), chạy cho nó fail.
3. Đọc giá trị thực tế trong thông báo lỗi, chép vào làm giá trị kỳ vọng.
4. Lặp lại với nhiều input, đặc biệt biên: số âm, rỗng, `null`, giá trị rất lớn.

```java
class LegacyInvoiceCalculatorCharacterizationTest {

    private final LegacyInvoiceCalculator calculator = new LegacyInvoiceCalculator();

    @ParameterizedTest(name = "qty={0}, price={1}, tier={2} -> {3}")
    @CsvSource({
        "1,  100000, STANDARD, 100000",
        "10, 100000, STANDARD, 950000",
        "10, 100000, GOLD,     900000",
        "0,  100000, GOLD,     0",
        "-1, 100000, STANDARD, -100000" // hành vi hiện tại, nghi là bug: ghi nhận, chưa sửa
    })
    void recordsCurrentBehavior(int qty, long unitPrice, String tier, long expected) {
        assertEquals(expected, calculator.calculate(qty, unitPrice, tier));
    }
}
```

Điểm mấu chốt: characterization test **không phán xét đúng sai**. Nếu phát hiện hành vi nghi là bug (số lượng âm cho ra tiền âm), hãy ghi nhận và tạo ticket, rồi sửa trong một thay đổi riêng sau khi refactor xong. Sửa bug lẫn trong refactor khiến bạn không biết test đỏ là do mình lỡ tay hay do cố ý.

Với output phức tạp (file báo cáo, JSON lớn), có thể dùng kỹ thuật **approval testing** hay **golden master**: lưu output hiện tại thành file mẫu, test so sánh output mới với file đó.

### Kỹ thuật thêm code mới vào code cũ

- **Sprout Method/Class**: viết logic mới trong method hoặc class mới, có test đầy đủ, rồi gọi từ code cũ. Code cũ chỉ thêm một dòng gọi.
- **Wrap Method**: đổi tên method cũ, tạo method mới cùng tên gốc gọi method cũ và thêm hành vi trước hoặc sau.
- **Strangler Fig** ở mức module: dần chuyển từng luồng sang code mới cho đến khi code cũ không còn được gọi.

## Lỗi thường gặp

- **Refactor "big bang"**: viết lại cả module trong một PR khổng lồ, kéo dài nhiều tuần. Cách sửa: chia thành nhiều bước nhỏ, mỗi bước merge được và hệ thống luôn chạy được.
- **Refactor không có test**: dựa vào "nhìn là thấy đúng". Cách sửa: viết characterization test trước, dù chỉ cho luồng chính.
- **Trộn refactor với thay đổi hành vi**: reviewer không phân biệt được dòng nào là đổi logic. Cách sửa: tách commit hoặc PR, ghi rõ trong mô tả.
- **Áp pattern máy móc**: interface cho mọi class, factory cho mọi object. Cách sửa: chỉ trừu tượng hoá khi có ít nhất hai biến thể thật hoặc thay đổi lặp lại.
- **DRY quá đà**: gộp hai đoạn code giống nhau về câu chữ nhưng khác nghiệp vụ, rồi phải thêm cờ `boolean isB2B` vào method chung. Cách sửa: tách lại, chấp nhận trùng lặp có chủ đích.
- **Refactor không có mục đích**: dành cả sprint "làm đẹp" code ít ai đụng tới. Cách sửa: ưu tiên refactor vùng code thay đổi thường xuyên hoặc chuẩn bị cho tính năng sắp làm.

## Bài tập thực hành

1. **Săn smell**: chọn class lớn nhất trong service của team (theo số dòng hoặc số dependency). Liệt kê các smell bạn thấy, mỗi smell kèm refactoring đề xuất và rủi ro. Trình bày 10 phút trong buổi sinh hoạt kỹ thuật.
2. **Refactor có kiểm soát**: lấy một method dài trên 50 dòng, viết characterization test cho ít nhất 5 trường hợp, sau đó refactor bằng Extract Method và Introduce Parameter Object. Mỗi bước là một commit riêng, test xanh sau mỗi commit.
3. **Strategy trong Spring**: tìm một chuỗi `if/else` hoặc `switch` theo loại (loại thanh toán, loại thông báo) có từ bốn nhánh trở lên, chuyển sang Strategy với `List<...>` injection như ví dụ trên và viết unit test cho từng strategy.

## Tóm tắt

- Code smell là dấu hiệu cần xem xét, không phải luật; bốn smell hay gặp là long method, god class, feature envy và duplicated code.
- Refactor nghĩa là đổi cấu trúc mà không đổi hành vi, vì vậy phải có test; làm từng bước nhỏ, chạy test và commit sau mỗi bước.
- Tận dụng refactoring tự động của IDE nhưng vẫn chạy test, vì IDE không thấy reflection hay chuỗi cấu hình.
- Tách commit/PR refactor khỏi thay đổi hành vi để review nhanh và an toàn.
- SOLID và pattern (Strategy, Observer, Proxy) rất tự nhiên trong Spring, nhưng chỉ dùng khi giải quyết vấn đề có thật.
- Với code legacy, viết characterization test ghi lại hành vi hiện tại trước, rồi mới refactor; bug phát hiện được thì sửa riêng.
