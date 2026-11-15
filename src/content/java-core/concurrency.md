Mọi ứng dụng server Java đều là chương trình đa luồng: mỗi request HTTP, mỗi consumer Kafka, mỗi job định kỳ chạy trên một thread nào đó. Lỗi concurrency thường không xuất hiện khi test trên máy cá nhân mà chỉ lộ ra dưới tải production, dưới dạng số liệu sai, request treo hay hệ thống "đứng hình". Một SA cần hiểu concurrency để chọn mô hình xử lý và kích thước thread pool; một Dev Lead cần nó để review code và xử lý sự cố. Bài này đi từ thread cơ bản, Java Memory Model, thread pool, `CompletableFuture` đến Virtual Threads của Java 21.

## Mục tiêu bài học

- Tạo và quản lý thread bằng `Thread`, `Runnable`, `Callable`; mô tả vòng đời thread.
- Dùng đúng `synchronized`, `volatile`, `Lock`, `Atomic*` dựa trên hiểu biết về Java Memory Model.
- Cấu hình `ExecutorService`/thread pool và ước lượng kích thước pool hợp lý.
- Viết luồng bất đồng bộ với `CompletableFuture` và Virtual Threads, biết khi nào dùng cái nào.
- Nhận diện và phòng tránh race condition, deadlock, starvation.

## Thread, Runnable, Callable và vòng đời thread

**Thread** là đơn vị thực thi nhỏ nhất mà hệ điều hành lập lịch. Trong Java truyền thống, mỗi `java.lang.Thread` (gọi là platform thread) ánh xạ 1:1 với một OS thread, nên tốn bộ nhớ stack (thường cỡ MB) và chi phí chuyển ngữ cảnh.

- `Runnable`: tác vụ không trả về kết quả, không ném checked exception (`void run()`).
- `Callable<V>`: tác vụ trả về kết quả và có thể ném exception (`V call() throws Exception`).
- `Future<V>`: "biên nhận" cho kết quả sẽ có trong tương lai; `get()` sẽ block cho đến khi có kết quả.

```java
import java.util.concurrent.*;

public class ThreadBasics {
    public static void main(String[] args) throws Exception {
        Runnable hello = () -> System.out.println("Chạy trên " + Thread.currentThread().getName());
        Thread t = new Thread(hello, "worker-1");
        t.start();          // start() tạo thread mới; gọi run() trực tiếp chỉ chạy trên thread hiện tại
        t.join();           // chờ thread kết thúc

        Callable<Integer> compute = () -> 6 * 7;
        try (ExecutorService pool = Executors.newFixedThreadPool(2)) {   // Java 19+: AutoCloseable
            Future<Integer> future = pool.submit(compute);
            System.out.println("Kết quả: " + future.get(1, TimeUnit.SECONDS));
        }   // close() chờ các task đã gửi chạy xong rồi mới đóng pool
    }
}
```

Vòng đời của thread (enum `Thread.State`):

```text
NEW ──start()──► RUNNABLE ──run() kết thúc──► TERMINATED

RUNNABLE ──chờ vào khối synchronized───────► BLOCKED        ──lấy được monitor────────► RUNNABLE
RUNNABLE ──wait() / join() / park()────────► WAITING        ──notify() / unpark()─────► RUNNABLE
RUNNABLE ──sleep(ms) / wait(ms) / join(ms)─► TIMED_WAITING  ──hết giờ / được đánh thức─► RUNNABLE
```

`RUNNABLE` gồm cả "đang chạy" và "sẵn sàng chờ CPU"; thread đang block trong I/O native cũng thường hiện là `RUNNABLE` trong thread dump. `BLOCKED` chỉ dùng cho việc chờ vào `synchronized`; chờ `ReentrantLock` sẽ hiện là `WAITING` vì nó dùng `park()`.

## Đồng bộ hoá và Java Memory Model

### Race condition và vấn đề visibility

**Race condition** xảy ra khi kết quả phụ thuộc vào thứ tự chạy xen kẽ của các thread. Ví dụ `count++` thực chất là ba bước: đọc, cộng, ghi. Hai thread cùng đọc giá trị 5 rồi cùng ghi 6, mất một lần tăng.

Vấn đề thứ hai là **visibility** (khả năng nhìn thấy): do cache CPU và việc compiler/CPU sắp xếp lại lệnh (reordering), giá trị một thread ghi có thể không được thread khác thấy ngay, thậm chí không bao giờ thấy.

**Java Memory Model** (JMM) định nghĩa khi nào một lần ghi chắc chắn được nhìn thấy, thông qua quan hệ **happens-before**. Các quy tắc chính:

- Mở khoá (unlock) một monitor happens-before lần khoá (lock) tiếp theo trên cùng monitor đó.
- Ghi một biến `volatile` happens-before mọi lần đọc sau đó của biến ấy.
- `Thread.start()` happens-before mọi hành động trong thread được start; mọi hành động trong thread happens-before việc thread khác `join()` thành công.

Ngoài ra, JMM có đảm bảo riêng cho field `final`: giá trị gán trong constructor sẽ được mọi thread nhìn thấy đúng, với điều kiện `this` không bị lộ ra ngoài trong lúc khởi tạo. Đây là lý do object bất biến an toàn khi chia sẻ giữa các thread.

### Các công cụ đồng bộ

```java
import java.util.concurrent.atomic.AtomicInteger;
import java.util.concurrent.locks.ReentrantLock;

class Counters {
    private int unsafeCount;                              // race condition
    private int syncCount;
    private int lockCount;
    private final AtomicInteger atomicCount = new AtomicInteger();
    private final ReentrantLock lock = new ReentrantLock();

    void incUnsafe() { unsafeCount++; }                   // đọc-sửa-ghi không atomic

    synchronized void incSync() { syncCount++; }          // monitor của "this"

    void incWithLock() {
        lock.lock();
        try {
            lockCount++;
        } finally {
            lock.unlock();                                // luôn unlock trong finally
        }
    }

    void incAtomic() { atomicCount.incrementAndGet(); }   // CAS, không cần khoá
}

class Worker implements Runnable {
    private volatile boolean running = true;              // volatile: đảm bảo visibility
    void stop() { running = false; }
    @Override public void run() {
        while (running) { /* xử lý */ }
    }
}
```

| Công cụ | Đảm bảo | Dùng khi | Hạn chế |
|---|---|---|---|
| `synchronized` | Loại trừ lẫn nhau + visibility | Đoạn găng ngắn, đơn giản | Không timeout, không ngắt được khi chờ |
| `volatile` | Visibility + chống reorder, **không** atomic cho thao tác ghép | Cờ trạng thái, một thread ghi nhiều thread đọc | `count++` trên volatile vẫn sai |
| `ReentrantLock` | Như synchronized, thêm `tryLock(timeout)`, `lockInterruptibly()`, fairness, nhiều `Condition` | Cần timeout, tránh deadlock, điều kiện chờ phức tạp | Phải tự unlock trong `finally` |
| `ReadWriteLock` | Nhiều reader đồng thời, writer độc quyền | Đọc rất nhiều, ghi ít | Phức tạp hơn, có thể làm writer chờ lâu |
| `AtomicInteger`, `AtomicLong`, `AtomicReference` | Thao tác atomic bằng CAS (compare-and-swap) | Bộ đếm, cập nhật một biến đơn lẻ | Không bảo vệ được bất biến giữa nhiều biến |
| `LongAdder` | Bộ đếm phân tán theo cell | Đếm với tranh chấp cao (metrics) | Đọc tổng không phải snapshot chính xác tức thời |

Nguyên tắc chung: **ưu tiên không chia sẻ trạng thái** (dữ liệu bất biến, mỗi task tự giữ dữ liệu), sau đó mới đến các cấu trúc có sẵn như `ConcurrentHashMap`, `BlockingQueue`, cuối cùng mới tự viết khoá.

## ExecutorService và thread pool

Tạo thread mới cho mỗi task là tốn kém và không giới hạn được tài nguyên. `ExecutorService` tách việc **gửi task** khỏi việc **quản lý thread**: một nhóm thread cố định (thread pool) lấy task từ hàng đợi và thực thi.

### Hiểu ThreadPoolExecutor

Các factory method trong `Executors` tiện nhưng có bẫy: `newFixedThreadPool` dùng hàng đợi **không giới hạn** (có thể làm cạn bộ nhớ khi task đến nhanh hơn xử lý), còn `newCachedThreadPool` có thể tạo **không giới hạn thread**. Ở production nên cấu hình tường minh:

```java
import java.util.concurrent.*;

ThreadPoolExecutor reportPool = new ThreadPoolExecutor(
        8,                                   // corePoolSize: số thread giữ thường trực
        16,                                  // maximumPoolSize: chỉ đạt được khi hàng đợi đã đầy
        60, TimeUnit.SECONDS,                // thread ngoài core rảnh quá 60s sẽ bị thu hồi
        new ArrayBlockingQueue<>(500),       // hàng đợi có giới hạn => có backpressure
        Thread.ofPlatform().name("report-", 0).factory(),   // Java 21: đặt tên thread dễ đọc dump
        new ThreadPoolExecutor.CallerRunsPolicy());          // hàng đợi đầy: thread gửi tự chạy task
```

Thứ tự xử lý khi có task mới: nếu số thread < core thì tạo thread mới; nếu không thì đưa vào hàng đợi; nếu hàng đợi đầy và số thread < max thì tạo thêm; nếu vẫn không được thì áp dụng **RejectedExecutionHandler** (`AbortPolicy` ném exception, `CallerRunsPolicy` làm chậm bên gửi, `DiscardPolicy` bỏ task…). Hệ quả: với hàng đợi không giới hạn, `maximumPoolSize` không bao giờ có tác dụng.

### Chọn kích thước pool

- **CPU-bound** (tính toán, nén, mã hoá): khoảng số core, hoặc số core + 1. Thêm thread chỉ tăng chuyển ngữ cảnh.
- **I/O-bound** (gọi DB, HTTP): công thức tham khảo từ cuốn "Java Concurrency in Practice": `số thread ≈ số core × mức sử dụng CPU mục tiêu × (1 + W/C)`, với W là thời gian chờ, C là thời gian tính toán. Ví dụ 8 core, mỗi request chờ 90 ms và tính 10 ms: 8 × 1 × (1 + 9) = 80 thread.
- Pool không thể lớn hơn tài nguyên phía sau: 200 thread gọi DB qua connection pool 20 kết nối thì 180 thread vẫn phải xếp hàng.

Công thức chỉ là điểm xuất phát; hãy đo bằng load test và theo dõi độ dài hàng đợi, thời gian chờ, CPU.

## Lập trình bất đồng bộ với CompletableFuture

`CompletableFuture` (Java 8) cho phép xâu chuỗi các bước bất đồng bộ mà không block thread, kết hợp nhiều tác vụ song song và xử lý lỗi theo kiểu khai báo.

```java
import java.util.List;
import java.util.concurrent.*;

public class DashboardService {
    private final ExecutorService io = Executors.newVirtualThreadPerTaskExecutor(); // hoặc pool I/O riêng
    private final CustomerClient customers;
    private final OrderClient orders;

    public DashboardService(CustomerClient customers, OrderClient orders) {
        this.customers = customers;
        this.orders = orders;
    }

    public Dashboard load(String customerId) {
        CompletableFuture<Customer> customerF =
                CompletableFuture.supplyAsync(() -> customers.get(customerId), io);
        CompletableFuture<List<Order>> ordersF =
                CompletableFuture.supplyAsync(() -> orders.recent(customerId), io);

        return customerF
                .thenCombine(ordersF, Dashboard::new)       // chạy song song, gộp khi cả hai xong
                .orTimeout(2, TimeUnit.SECONDS)             // Java 9+
                .exceptionally(ex -> Dashboard.empty(customerId))
                .join();
    }
}
```

Các thao tác cần nhớ:

| Method | Ý nghĩa |
|---|---|
| `thenApply(f)` | Biến đổi kết quả đồng bộ (như `map`) |
| `thenCompose(f)` | Nối với một bước bất đồng bộ khác trả về `CompletableFuture` (như `flatMap`) |
| `thenCombine(other, f)` | Gộp kết quả hai future độc lập |
| `allOf(...)` / `anyOf(...)` | Chờ tất cả / bất kỳ future nào hoàn thành |
| `exceptionally`, `handle`, `whenComplete` | Xử lý lỗi hoặc dọn dẹp |
| `orTimeout`, `completeOnTimeout` | Đặt thời gian chờ tối đa |

> **Lưu ý:** Nếu không truyền executor, `supplyAsync` dùng `ForkJoinPool.commonPool()`, vốn có số thread bằng khoảng số core và được dùng chung với parallel stream. Đưa các lời gọi I/O blocking vào đó có thể làm nghẽn toàn ứng dụng. Hãy luôn truyền executor riêng cho tác vụ I/O.

## Virtual Threads (Java 21)

**Virtual thread** (JEP 444, chính thức từ Java 21) là thread do JVM quản lý, không gắn cố định với OS thread. JVM chạy nhiều virtual thread trên một nhóm nhỏ platform thread gọi là **carrier thread**. Khi virtual thread gặp thao tác blocking được hỗ trợ (I/O socket, `sleep`, chờ lock của `java.util.concurrent`), nó được "unmount" khỏi carrier, nhường carrier cho virtual thread khác. Nhờ đó bạn có thể viết code blocking tuần tự, dễ đọc, mà vẫn phục vụ được rất nhiều tác vụ đồng thời.

```java
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.*;

public class PriceAggregator {
    private final Semaphore dbPermits = new Semaphore(20);   // giới hạn truy cập tài nguyên khan hiếm

    public List<String> fetchAll(List<String> urls) throws Exception {
        try (ExecutorService executor = Executors.newVirtualThreadPerTaskExecutor()) {
            List<Future<String>> futures = urls.stream()
                    .map(url -> executor.submit(() -> httpGet(url)))   // mỗi task một virtual thread
                    .toList();
            List<String> results = new ArrayList<>();
            for (Future<String> f : futures) results.add(f.get());
            return results;
        }
    }

    String queryDb(String sql) throws InterruptedException {
        dbPermits.acquire();
        try { return runQuery(sql); } finally { dbPermits.release(); }
    }

    private String httpGet(String url) { /* HttpClient.send(...) */ return url; }
    private String runQuery(String sql) { return sql; }
}
```

Khi nào nên dùng:

- Ứng dụng **I/O-bound** với số tác vụ đồng thời lớn: REST API gọi DB và service khác, thread-per-request.
- Spring Boot 3.2+ bật cho web server và `@Async` bằng `spring.threads.virtual.enabled=true`.

Khi nào không mang lại lợi ích hoặc cần cẩn thận:

- Tác vụ **CPU-bound**: số core vẫn là giới hạn.
- **Không pool virtual thread**: chúng rẻ, hãy tạo mới cho mỗi task. Muốn giới hạn đồng thời (ví dụ vào DB), dùng `Semaphore` hoặc giới hạn của connection pool.
- **Pinning trên Java 21**: virtual thread bị "ghim" vào carrier khi block bên trong khối `synchronized` hoặc method native, làm mất lợi thế. Trên Java 21, với đoạn găng có I/O, nên dùng `ReentrantLock`. Có thể phát hiện qua sự kiện JFR `jdk.VirtualThreadPinned`. Vấn đề pinning với `synchronized` đã được khắc phục ở JDK 24 (JEP 491).
- `ThreadLocal` lưu object nặng: có hàng triệu virtual thread thì mỗi thread một bản sao sẽ tốn bộ nhớ.

## Deadlock, race condition, starvation

| Vấn đề | Biểu hiện | Phòng tránh |
|---|---|---|
| **Race condition** | Số liệu sai ngẫu nhiên, khó tái hiện | Bất biến, atomic, khoá đúng phạm vi, dùng cấu trúc concurrent |
| **Deadlock** | Hai hoặc nhiều thread chờ nhau mãi mãi, CPU thấp nhưng request treo | Khoá theo thứ tự cố định, `tryLock` có timeout, giữ khoá ngắn |
| **Starvation** | Một số thread/task không bao giờ được chạy | Lock fairness, tách pool theo loại tác vụ, tránh giữ khoá lâu |
| **Livelock** | Thread liên tục phản ứng với nhau nhưng không tiến triển | Thêm độ trễ ngẫu nhiên khi retry |

Ví dụ deadlock kinh điển: thread A chuyển tiền từ X sang Y (khoá X rồi Y), đồng thời thread B chuyển từ Y sang X (khoá Y rồi X). Cách sửa là luôn khoá theo một thứ tự toàn cục:

```java
void transfer(Account from, Account to, BigDecimal amount) {
    Account first  = from.id() < to.id() ? from : to;    // thứ tự khoá cố định theo id
    Account second = (first == from) ? to : from;
    synchronized (first) {
        synchronized (second) {
            from.debit(amount);
            to.credit(amount);
        }
    }
}
```

Một dạng starvation hay gặp là **thread pool starvation**: task trong pool A gửi task con vào chính pool A rồi `get()` chờ kết quả. Khi mọi thread đều đang chờ task con, không còn thread nào chạy task con, hệ thống treo. Cách sửa: tách pool, hoặc dùng `thenCompose` thay vì block chờ.

Khi nghi ngờ deadlock trên production, lấy thread dump bằng `jcmd <pid> Thread.print`; JVM sẽ tự in mục "Found one Java-level deadlock" nếu phát hiện vòng chờ giữa các monitor/lock.

## Lỗi thường gặp

- **Gọi `run()` thay vì `start()`**: code chạy trên thread hiện tại, không có đồng thời. Cách sửa: dùng `start()` hoặc gửi vào executor.
- **Nghĩ `volatile` làm `count++` an toàn**: volatile chỉ đảm bảo visibility. Cách sửa: `AtomicInteger`/`LongAdder` hoặc khoá.
- **Không shutdown executor**: thread không phải daemon giữ JVM sống, rò rỉ thread. Cách sửa: try-with-resources (Java 19+) hoặc `shutdown()` + `awaitTermination()`.
- **Nuốt `InterruptedException`**: bắt rồi bỏ qua làm mất tín hiệu huỷ. Cách sửa: khôi phục cờ bằng `Thread.currentThread().interrupt()` hoặc ném tiếp.
- **Blocking I/O trong `commonPool`**: `supplyAsync` không có executor rồi gọi HTTP. Cách sửa: truyền executor riêng.
- **Pool vô hạn hoặc hàng đợi vô hạn**: không có backpressure, sự cố phía sau làm cạn bộ nhớ. Cách sửa: giới hạn hàng đợi và chọn rejection policy phù hợp.
- **Pool virtual thread hoặc dùng `synchronized` quanh I/O trên Java 21**: mất lợi ích của Loom. Cách sửa: `newVirtualThreadPerTaskExecutor()`, `ReentrantLock`, `Semaphore`.

## Bài tập thực hành

1. **Tái hiện và sửa race condition**: viết chương trình 10 thread, mỗi thread tăng một bộ đếm 100.000 lần. Chạy với `int` thường, `volatile int`, `synchronized`, `AtomicInteger`, `LongAdder`; ghi lại kết quả và thời gian. Giải thích vì sao `volatile` vẫn sai.
2. **Import sách song song**: cho CLI thư viện, viết chức năng import 10.000 dòng sách từ nhiều file CSV bằng `ThreadPoolExecutor` có hàng đợi giới hạn. So sánh với phiên bản dùng `newVirtualThreadPerTaskExecutor()` khi mỗi dòng phải gọi một API giả lập có `Thread.sleep(50)`.
3. **Tạo và chẩn đoán deadlock**: viết hai thread khoá hai object theo thứ tự ngược nhau, chạy, lấy thread dump bằng `jcmd`, đọc mục deadlock. Sau đó sửa bằng thứ tự khoá cố định và bằng `tryLock(timeout)`.

## Tóm tắt

- `Runnable` không trả kết quả, `Callable` trả kết quả qua `Future`; nắm 6 trạng thái thread để đọc thread dump.
- JMM định nghĩa visibility qua happens-before; `synchronized`/`Lock` cho loại trừ lẫn nhau, `volatile` chỉ cho visibility, `Atomic*` cho cập nhật một biến bằng CAS.
- Cấu hình `ThreadPoolExecutor` tường minh với hàng đợi có giới hạn; kích thước pool phụ thuộc tỷ lệ chờ/tính toán và tài nguyên phía sau.
- `CompletableFuture` xâu chuỗi và gộp tác vụ bất đồng bộ; luôn dùng executor riêng cho I/O.
- Virtual Threads (Java 21) phù hợp I/O-bound đồng thời cao; không pool chúng, giới hạn bằng `Semaphore`, cẩn thận pinning với `synchronized` trên Java 21.
- Phòng deadlock bằng thứ tự khoá cố định và timeout; phòng starvation bằng tách pool và tránh block chờ trong cùng pool.
