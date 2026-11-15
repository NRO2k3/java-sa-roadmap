Gần như mọi đoạn code nghiệp vụ Java đều đi qua một `List`, một `Map` hay một stream. Chọn sai cấu trúc dữ liệu có thể biến một API chạy vài mili-giây thành vài giây khi dữ liệu lớn lên; hiểu sai `equals/hashCode` có thể gây lỗi "mất dữ liệu" rất khó tìm. Với vai trò SA hay Dev Lead, bạn còn phải review code của người khác và nhận ra những vấn đề này ngay từ cái nhìn đầu tiên. Bài này hệ thống hoá Collections Framework, generics, Stream API và `Optional` theo cách dùng trong dự án thực tế.

## Mục tiêu bài học

- Chọn đúng implementation của List/Set/Map/Queue dựa trên độ phức tạp thao tác.
- Giải thích hợp đồng `equals/hashCode` và cách `HashMap` lưu trữ, tìm kiếm, resize bên trong.
- Viết generic class/method và dùng đúng wildcard `? extends` / `? super` (quy tắc PECS).
- Dùng thành thạo Stream API: `map`, `filter`, `reduce`, `collect`, `groupingBy`.
- Dùng `Optional` đúng mục đích để tránh `NullPointerException`.

## Collections Framework: chọn đúng cấu trúc dữ liệu

Collections Framework gồm các interface chính: `List` (có thứ tự, cho phép trùng), `Set` (không trùng), `Queue`/`Deque` (hàng đợi, ngăn xếp) và `Map` (cặp key–value, không kế thừa `Collection`). Bạn nên khai báo biến theo interface (`List<Book> books = new ArrayList<>()`) để dễ đổi implementation.

### Bảng độ phức tạp

Ký hiệu Big-O mô tả chi phí thao tác khi số phần tử `n` tăng: O(1) là hằng số, O(log n) tăng chậm, O(n) tỷ lệ thuận với số phần tử.

| Implementation | Truy cập theo index / get | Thêm | Xoá | contains | Ghi chú |
|---|---|---|---|---|---|
| `ArrayList` | O(1) | O(1) khấu hao ở cuối, O(n) ở giữa | O(n) | O(n) | Lựa chọn mặc định cho List |
| `LinkedList` | O(n) | O(1) ở hai đầu | O(1) qua iterator | O(n) | Hiếm khi tốt hơn ArrayList/ArrayDeque |
| `ArrayDeque` | — | O(1) khấu hao ở hai đầu | O(1) ở hai đầu | O(n) | Dùng làm stack/queue thay `Stack` |
| `HashMap` / `HashSet` | O(1) trung bình | O(1) trung bình | O(1) trung bình | O(1) trung bình | Không đảm bảo thứ tự |
| `LinkedHashMap` / `LinkedHashSet` | O(1) | O(1) | O(1) | O(1) | Giữ thứ tự chèn; có chế độ access-order để làm LRU cache |
| `TreeMap` / `TreeSet` | O(log n) | O(log n) | O(log n) | O(log n) | Luôn sắp xếp; có `floorKey`, `headMap`… |
| `PriorityQueue` | peek O(1) | O(log n) | poll O(log n) | O(n) | Heap nhị phân, lấy phần tử nhỏ nhất/ưu tiên nhất |
| `EnumMap` / `EnumSet` | O(1) | O(1) | O(1) | O(1) | Rất nhanh, key là enum |

"Khấu hao" (amortized) nghĩa là thỉnh thoảng `ArrayList` phải cấp phát mảng mới lớn hơn và copy (O(n)), nhưng tính trung bình mỗi lần `add` vẫn là O(1).

Một vài lưu ý thực tế:

- `List.of()`, `Set.of()`, `Map.of()` (Java 9+) và `Stream.toList()` (Java 16+) trả về collection **bất biến**: gọi `add()` sẽ ném `UnsupportedOperationException`, và `List.of(null)` ném `NullPointerException`.
- `Arrays.asList()` trả về list kích thước cố định, được "đỡ" bởi mảng gốc: `set()` được, `add()` thì không.
- Java 21 thêm **Sequenced Collections** (JEP 431): `List`, `Deque`, `LinkedHashSet`… có chung `getFirst()`, `getLast()`, `reversed()`; `LinkedHashMap` có `firstEntry()`, `lastEntry()`, `reversed()`.
- Collection thông thường không thread-safe. Khi nhiều thread cùng ghi, dùng `ConcurrentHashMap`, `CopyOnWriteArrayList` (đọc nhiều, ghi rất ít) hoặc các `BlockingQueue`.

## equals, hashCode và bên trong HashMap

### Hợp đồng equals/hashCode

`equals()` phải có tính phản xạ, đối xứng, bắc cầu, nhất quán, và `x.equals(null)` trả về `false`. `hashCode()` phải thoả: hai object `equals` nhau **bắt buộc** có cùng hashCode; hai object khác nhau **được phép** trùng hashCode (gọi là va chạm, collision), nhưng càng ít va chạm càng tốt.

Cách an toàn nhất là dùng `record`, vì compiler sinh `equals/hashCode` dựa trên tất cả component. Với class thường, dùng `Objects.equals` và `Objects.hash`, hoặc để IDE sinh.

```java
public final class Isbn {
    private final String value;

    public Isbn(String value) {
        this.value = value.replace("-", "");   // chuẩn hoá trước khi so sánh
    }

    @Override
    public boolean equals(Object o) {
        return o instanceof Isbn other && value.equals(other.value);
    }

    @Override
    public int hashCode() {
        return value.hashCode();
    }
}
// Tương đương ngắn gọn hơn với record (Java 16+):
// public record Isbn(String value) { public Isbn { value = value.replace("-", ""); } }
```

### HashMap hoạt động thế nào

`HashMap` lưu dữ liệu trong một mảng các "bucket" (`table`). Khi `put(key, value)`:

1. Tính `h = key.hashCode()`, rồi trộn bit: `hash = h ^ (h >>> 16)` để các bit cao cũng ảnh hưởng tới vị trí.
2. Tìm vị trí bucket: `index = (n - 1) & hash`, với `n` là dung lượng mảng (luôn là luỹ thừa của 2, mặc định 16).
3. Nếu bucket trống, đặt node mới vào. Nếu đã có node, duyệt các node trong bucket, so sánh `hash` rồi `equals()`; trùng thì ghi đè value, không thì nối thêm node.
4. Khi số phần tử vượt `capacity × loadFactor` (mặc định 0,75), mảng được **resize** gấp đôi và các node được phân bổ lại.

```text
table[16]                    index = (16 - 1) & hash
[0]  -> null
[1]  -> ("978A", v1) -> ("123Z", v2)     va chạm: danh sách liên kết
[2]  -> null
[5]  -> TreeNode (cây đỏ-đen)            bucket có >= 8 node và table >= 64
...
[15] -> ("555B", v3)
```

Từ Java 8, nếu một bucket có quá nhiều node (ngưỡng 8) và mảng đủ lớn (ít nhất 64), bucket đó chuyển thành **cây đỏ-đen**, giúp trường hợp xấu nhất giảm từ O(n) xuống O(log n). Nếu mảng còn nhỏ hơn 64, HashMap ưu tiên resize thay vì chuyển thành cây.

Hệ quả thực tế:

- `hashCode()` kém (ví dụ luôn trả về hằng số) biến HashMap thành danh sách liên kết, mọi thao tác thành chậm.
- **Không được thay đổi field tham gia vào `hashCode` sau khi object đã làm key.** Object sẽ nằm ở bucket cũ, `get()` tìm ở bucket mới và trả về `null`, dù object vẫn ở trong map.
- Nếu biết trước số phần tử, dùng `HashMap.newHashMap(expectedSize)` (Java 19+) để tránh resize nhiều lần.

## Generics và wildcard

Generics cho phép viết code an toàn kiểu cho nhiều loại dữ liệu. Java triển khai generics bằng **type erasure** (xoá kiểu): thông tin kiểu chỉ tồn tại lúc biên dịch, lúc chạy `List<String>` và `List<Integer>` là cùng một class. Vì vậy bạn không thể `new T()`, tạo mảng `new T[10]` hay viết `obj instanceof List<String>`.

### Quy tắc PECS

**PECS** = "Producer Extends, Consumer Super":

- Khi collection **cung cấp** dữ liệu cho bạn đọc (producer), dùng `? extends T`. Bạn đọc được ra `T`, nhưng không thêm được phần tử (trừ `null`).
- Khi collection **nhận** dữ liệu bạn ghi vào (consumer), dùng `? super T`. Bạn thêm được `T`, nhưng đọc ra chỉ biết là `Object`.

```java
import java.util.*;
import java.util.function.Function;

public record Page<T>(List<T> items, long total) {

    // Generic method: chuyển Page<T> sang Page<R>
    public <R> Page<R> map(Function<? super T, ? extends R> mapper) {
        return new Page<>(items.stream().<R>map(mapper).toList(), total);
    }
}

final class CollectionUtils {
    private CollectionUtils() {}

    // Producer: chỉ đọc số từ list, chấp nhận List<Integer>, List<Double>...
    static double sum(Collection<? extends Number> numbers) {
        double total = 0;
        for (Number n : numbers) total += n.doubleValue();
        return total;
    }

    // Consumer: chỉ ghi Integer vào, chấp nhận List<Integer>, List<Number>, List<Object>
    static void addRange(List<? super Integer> target, int from, int to) {
        for (int i = from; i < to; i++) target.add(i);
    }

    // Bounded type: T phải so sánh được với chính nó (hoặc lớp cha của nó)
    static <T extends Comparable<? super T>> T max(Collection<? extends T> items) {
        Iterator<? extends T> it = items.iterator();
        T best = it.next();
        while (it.hasNext()) {
            T current = it.next();
            if (current.compareTo(best) > 0) best = current;
        }
        return best;
    }
}
```

Chữ ký `Collections.copy(List<? super T> dest, List<? extends T> src)` của JDK là ví dụ kinh điển của PECS. Lưu ý `List<Integer>` **không** phải là `List<Number>` (generics bất biến, invariant), dù `Integer` là `Number`; wildcard là cách để nới lỏng điều này một cách an toàn.

## Stream API

Stream là một **pipeline xử lý dữ liệu**: một nguồn (collection, mảng, file…), không hoặc nhiều thao tác trung gian (intermediate) như `filter`, `map`, `sorted`, và đúng một thao tác kết thúc (terminal) như `collect`, `reduce`, `count`, `forEach`.

Ba đặc điểm quan trọng:

- **Lazy**: thao tác trung gian chỉ chạy khi có thao tác terminal, và phần tử được xử lý lần lượt qua cả pipeline (nhờ đó `limit` có thể dừng sớm).
- **Dùng một lần**: một stream đã chạy terminal không dùng lại được, gọi tiếp sẽ ném `IllegalStateException`.
- **Không nên có side effect**: lambda trong `map`/`filter` không nên sửa trạng thái bên ngoài.

```java
import java.util.*;
import java.util.function.Function;
import static java.util.stream.Collectors.*;

record Book(String isbn, String title, String author, String genre, int year, double rating) {}

class BookReports {
    static void demo(List<Book> books) {
        // filter + sort + limit + map
        List<String> topRecent = books.stream()
                .filter(b -> b.year() >= 2015)
                .sorted(Comparator.comparingDouble(Book::rating).reversed())
                .limit(5)
                .map(Book::title)
                .toList();                                     // Java 16+, list bất biến

        // groupingBy với downstream collector
        Map<String, Long> countByGenre = books.stream()
                .collect(groupingBy(Book::genre, TreeMap::new, counting()));

        Map<String, Double> avgRatingByAuthor = books.stream()
                .collect(groupingBy(Book::author, averagingDouble(Book::rating)));

        Map<String, List<String>> titlesByGenre = books.stream()
                .collect(groupingBy(Book::genre, mapping(Book::title, toList())));

        Map<Boolean, List<Book>> classicOrNot = books.stream()
                .collect(partitioningBy(b -> b.year() < 1990));

        // toMap: luôn khai báo merge function nếu key có thể trùng
        Map<String, Book> byIsbn = books.stream()
                .collect(toMap(Book::isbn, Function.identity(), (first, dup) -> first));

        // reduce: gộp các phần tử về một giá trị
        Optional<Book> oldest = books.stream()
                .reduce((a, b) -> a.year() <= b.year() ? a : b);
        int totalYears = books.stream().mapToInt(Book::year).sum();   // dùng primitive stream cho phép cộng
    }
}
```

Một số điểm cần nhớ:

- `toMap` **ném `IllegalStateException`** nếu gặp key trùng mà không có merge function.
- Với tổng, trung bình, min, max trên số, ưu tiên `mapToInt`/`mapToLong`/`mapToDouble` để tránh boxing (đóng gói `int` thành `Integer`).
- `reduce(identity, accumulator)` yêu cầu `identity` là phần tử trung hoà (0 với phép cộng, 1 với phép nhân) và phép toán có tính kết hợp; nếu không, kết quả sai khi chạy song song.
- `parallelStream()` không phải là "nút tăng tốc". Nó dùng chung `ForkJoinPool.commonPool()`, chỉ có lợi với dữ liệu lớn, tác vụ CPU-bound, nguồn dễ chia nhỏ (`ArrayList`, mảng) và không có I/O blocking. Hãy đo trước khi dùng.
- Vòng lặp `for` thường vẫn hợp lý khi logic có nhiều nhánh, cần `break`/`continue` phức tạp, hoặc cần xử lý checked exception.

## Optional: dùng đúng cách

`Optional<T>` (Java 8) là một hộp chứa có thể rỗng, được thiết kế chủ yếu làm **kiểu trả về** cho method có thể "không có kết quả", buộc người gọi phải xử lý trường hợp rỗng một cách tường minh.

```java
public interface MemberRepository {
    Optional<Member> findByEmail(String email);
}

class MemberService {
    private final MemberRepository repo;
    MemberService(MemberRepository repo) { this.repo = repo; }

    String displayName(String email) {
        return repo.findByEmail(email)
                .map(Member::fullName)
                .filter(name -> !name.isBlank())
                .orElse("Khách");
    }

    Member require(String email) {
        return repo.findByEmail(email)
                .orElseThrow(() -> new MemberNotFoundException(email));
    }

    int timeoutSeconds(Config config) {
        // orElse luôn tính tham số, kể cả khi Optional có giá trị
        // orElseGet chỉ gọi supplier khi Optional rỗng
        return config.find("timeout").map(Integer::parseInt).orElseGet(this::loadDefaultTimeout);
    }

    private int loadDefaultTimeout() { return 30; }
}
```

Nguyên tắc sử dụng:

| Nên | Không nên |
|---|---|
| Dùng làm kiểu trả về của method tìm kiếm | Dùng làm field của class hay entity |
| Chuỗi `map`, `flatMap`, `filter`, `orElse*`, `ifPresentOrElse` | `if (opt.isPresent()) { opt.get() }` (chỉ là kiểm tra null dài dòng hơn) |
| `orElseThrow()` khi chắc chắn phải có giá trị | Gọi `get()` không kiểm tra |
| Trả về collection rỗng khi không có phần tử | `Optional<List<T>>` |
| `Optional.ofNullable(x)` khi x có thể null | `Optional.of(x)` với x có thể null (ném NPE ngay) |

Cũng không nên nhận `Optional` làm tham số method: người gọi vẫn có thể truyền `null`, và overload hoặc tham số nullable có chú thích rõ ràng thường dễ đọc hơn.

## Lỗi thường gặp

- **Dùng `LinkedList` vì "chèn nhanh"**: truy cập theo index là O(n), muốn chèn vào giữa vẫn phải duyệt tới vị trí đó qua các node nằm rời rạc trong bộ nhớ, nên thực tế thường chậm hơn ArrayList. Cách sửa: dùng `ArrayList` mặc định, `ArrayDeque` cho hàng đợi.
- **`contains()` trên `List` trong vòng lặp**: thành O(n²) khi dữ liệu lớn. Cách sửa: chuyển sang `HashSet` trước khi tra cứu.
- **Key mutable trong HashMap/HashSet**: sửa field làm thay đổi hashCode khiến object "biến mất". Cách sửa: dùng key bất biến (record, String, giá trị đã chuẩn hoá).
- **Sửa collection khi đang duyệt bằng for-each**: ném `ConcurrentModificationException`. Cách sửa: dùng `removeIf()`, `Iterator.remove()` hoặc tạo collection mới.
- **Side effect trong stream**: `stream().forEach(b -> result.add(...))` với `parallelStream` gây lỗi dữ liệu. Cách sửa: dùng `collect`/`toList()`.
- **`toMap` không có merge function**: chạy tốt với dữ liệu test, nổ ở production khi xuất hiện key trùng. Cách sửa: luôn cân nhắc key trùng và khai báo merge function.
- **Lạm dụng Optional**: Optional làm field, tham số, hoặc gọi `get()` trực tiếp. Cách sửa: giữ Optional ở kiểu trả về và xử lý bằng các method của nó.

## Bài tập thực hành

1. **Chọn cấu trúc dữ liệu cho thư viện**: thiết kế lớp `LibraryCatalog` hỗ trợ: tìm sách theo ISBN (O(1)), liệt kê sách theo năm xuất bản có thứ tự, hàng đợi đặt trước sách theo thứ tự đăng ký, và 10 sách xem gần nhất (gợi ý: `LinkedHashMap` với access-order và `removeEldestEntry`). Ghi chú lý do chọn cho từng cấu trúc.
2. **Báo cáo bằng Stream**: từ một file CSV khoảng 1.000 dòng sách (tự sinh), viết các báo cáo: số sách theo thể loại (sắp xếp theo tên), tác giả có điểm trung bình cao nhất, danh sách tiêu đề theo thập kỷ (`groupingBy(b -> b.year() / 10 * 10)`). Viết unit test cho từng báo cáo.
3. **Thí nghiệm HashMap**: tạo class `BadKey` có `hashCode()` luôn trả về 42, chèn 100.000 phần tử vào HashMap và đo thời gian so với key có hashCode tốt. Sau đó thử thay đổi field của một key sau khi `put` và quan sát kết quả `get()`.

## Tóm tắt

- `ArrayList`, `HashMap`, `ArrayDeque` là lựa chọn mặc định; chọn `TreeMap`, `LinkedHashMap`, `PriorityQueue` khi cần thứ tự hoặc ưu tiên.
- Hai object `equals` nhau phải có cùng `hashCode`; key của HashMap nên bất biến.
- HashMap tìm bucket theo `(n - 1) & hash`, resize khi vượt load factor 0,75, và chuyển bucket dày đặc thành cây đỏ-đen từ Java 8.
- Generics dùng type erasure; PECS: đọc thì `? extends`, ghi thì `? super`.
- Stream là pipeline lazy, dùng một lần; `groupingBy` + downstream collector giải quyết hầu hết bài toán báo cáo.
- `Optional` dành cho kiểu trả về; xử lý bằng `map`, `orElse*`, `orElseThrow` thay vì `get()`.
