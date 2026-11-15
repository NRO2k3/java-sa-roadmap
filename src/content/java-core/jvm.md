Khi service chậm dần sau vài ngày, pod bị kill vì hết bộ nhớ hay latency p99 thỉnh thoảng vọt lên vài giây, câu trả lời gần như luôn nằm trong JVM. Hiểu cách JVM quản lý bộ nhớ, thu gom rác và biên dịch code giúp bạn chọn cấu hình đúng ngay từ khi thiết kế, và chẩn đoán sự cố bằng dữ liệu thay vì phỏng đoán. Đây là kỹ năng phân biệt rõ một kỹ sư senior, SA hay Dev Lead với người chỉ biết "tăng RAM rồi restart". Bài này đi qua cấu trúc bộ nhớ, class loading và JIT, các Garbage Collector hiện đại, cách đọc GC log, heap dump, thread dump và các công cụ profiling, benchmark.

## Mục tiêu bài học

- Mô tả các vùng bộ nhớ của JVM (Heap, Stack, Metaspace…) và lỗi tương ứng khi chúng cạn.
- So sánh G1, ZGC, Shenandoah, Parallel GC và chọn GC theo yêu cầu latency/throughput.
- Đọc GC log, phân tích heap dump và thread dump để tìm nguyên nhân sự cố.
- Dùng JFR, JDK Mission Control và VisualVM để profiling CPU, bộ nhớ, lock.
- Viết micro-benchmark đúng cách với JMH.

## Cấu trúc bộ nhớ JVM

```text
+----------------------------- Tiến trình JVM ------------------------------+
| HEAP (-Xms / -Xmx): mọi object và mảng, được GC quản lý                    |
|   +----------------- Young -----------------+  +-------- Old ----------+   |
|   |  Eden  |  Survivor S0  |  Survivor S1   |  |  object sống lâu      |   |
|   +-----------------------------------------+  +-----------------------+   |
|                                                                            |
| NGOÀI HEAP (native memory):                                                |
|   Metaspace         : metadata của class (thay PermGen từ Java 8)          |
|   Thread stacks     : mỗi thread một stack (-Xss), chứa các frame          |
|   Code cache        : mã máy do JIT sinh ra                                |
|   Direct buffers    : NIO ByteBuffer.allocateDirect, thư viện native       |
|   GC data, symbol…  : cấu trúc nội bộ của JVM                              |
+----------------------------------------------------------------------------+
```

### Heap

Heap chứa mọi object. Hầu hết GC hiện đại chia heap theo **thế hệ** (generational), dựa trên giả thuyết "phần lớn object chết trẻ":

- Object mới được cấp phát trong **Eden**, thường qua TLAB (Thread-Local Allocation Buffer, vùng đệm riêng của mỗi thread nên cấp phát rất nhanh).
- Khi Eden đầy, **minor GC** (young GC) chạy: object còn sống được copy sang Survivor; object sống qua đủ số lần GC được "thăng cấp" (promote) lên **Old**.
- Old đầy dần, sẽ cần thu gom vùng Old (tuỳ GC: mixed collection, concurrent cycle hoặc full GC).

Lỗi khi cạn: `OutOfMemoryError: Java heap space`. Với Parallel GC còn có `GC overhead limit exceeded` khi JVM dành gần hết thời gian để GC mà thu hồi được rất ít.

### Stack

Mỗi thread có một stack riêng gồm các **frame**; mỗi lần gọi method tạo một frame chứa biến cục bộ (giá trị primitive và **tham chiếu** tới object), toán hạng và địa chỉ trả về. Object luôn nằm trên heap, stack chỉ giữ tham chiếu (trừ khi JIT tối ưu bằng escape analysis, xem bên dưới). Đệ quy quá sâu gây `StackOverflowError`; tạo quá nhiều platform thread có thể gây `OutOfMemoryError: unable to create native thread`.

### Metaspace

Metaspace lưu metadata của class (cấu trúc class, method, bytecode…) trong native memory. Mặc định không giới hạn ngoài bộ nhớ máy, có thể đặt trần bằng `-XX:MaxMetaspaceSize`. Lỗi `OutOfMemoryError: Metaspace` thường do **rò rỉ classloader**: ứng dụng redeploy nhiều lần trong app server, hoặc thư viện sinh class động (proxy, script) mà không giải phóng.

> **Lưu ý:** Bộ nhớ tiến trình JVM luôn lớn hơn `-Xmx`. Khi chạy trong container, phải chừa phần cho Metaspace, thread stack, code cache, direct buffer. Có thể xem chi tiết bằng Native Memory Tracking: chạy với `-XX:NativeMemoryTracking=summary` rồi `jcmd <pid> VM.native_memory summary`.

## Class loading và JIT

### Class loading

Class được nạp **lười** (lazy), khi được dùng lần đầu, qua ba bước: **loading** (đọc bytecode), **linking** (verify bytecode hợp lệ, prepare cấp phát field static với giá trị mặc định, resolve các tham chiếu), và **initialization** (chạy khối `static` và gán giá trị cho field static).

Có ba classloader chính theo cơ chế **parent delegation** (hỏi cha trước, cha không tìm thấy mới tự nạp): Bootstrap (class lõi như `java.lang.*`), Platform (các module khác của JDK) và Application (classpath/module path của bạn). Phân biệt hai lỗi hay nhầm: `ClassNotFoundException` là khi nạp class theo tên lúc chạy (reflection) mà không tìm thấy; `NoClassDefFoundError` là khi class có lúc biên dịch nhưng lúc chạy thiếu, hoặc khởi tạo static của nó từng thất bại.

### JIT compiler

JVM bắt đầu bằng cách **thông dịch** (interpret) bytecode. Method chạy nhiều ("hot") được **JIT** (Just-In-Time compiler) biên dịch sang mã máy. HotSpot dùng **tiered compilation**: C1 biên dịch nhanh với tối ưu nhẹ, sau đó C2 biên dịch lại với tối ưu mạnh dựa trên dữ liệu profiling thu thập lúc chạy. Các tối ưu quan trọng gồm **inlining** (chèn thân method nhỏ vào nơi gọi) và **escape analysis** (nếu object không "thoát" khỏi method, JIT có thể bỏ hẳn việc cấp phát trên heap).

Hệ quả thực tế: ứng dụng Java cần thời gian **warm-up**; vài nghìn request đầu chậm hơn. Đây cũng là lý do benchmark "tự chế" bằng `System.nanoTime()` thường cho kết quả sai.

## Các Garbage Collector

GC tìm object không còn được tham chiếu từ các **GC root** (biến trên stack, field static, JNI…) và thu hồi bộ nhớ của chúng. Khoảng thời gian GC dừng toàn bộ thread ứng dụng gọi là **stop-the-world pause**. Có ba mục tiêu luôn đánh đổi nhau: **latency** (pause ngắn), **throughput** (tỷ lệ thời gian chạy code ứng dụng) và **footprint** (bộ nhớ tiêu tốn).

| GC | Bật bằng | Đặc điểm | Phù hợp |
|---|---|---|---|
| **G1** | `-XX:+UseG1GC` (mặc định trên máy đủ tài nguyên từ JDK 9) | Chia heap thành nhiều region, generational, cố gắng giữ pause dưới mục tiêu `-XX:MaxGCPauseMillis` (mặc định 200 ms), có "mixed collection" thu gom dần vùng Old | Lựa chọn cân bằng cho hầu hết service |
| **ZGC** | `-XX:+UseZGC` (trên JDK 21 thêm `-XX:+ZGenerational` để dùng bản generational) | Gần như mọi việc chạy đồng thời với ứng dụng, pause thường dưới mili-giây và gần như không phụ thuộc kích thước heap | Latency nhạy cảm, heap lớn; đổi lại tốn thêm CPU và bộ nhớ |
| **Shenandoah** | `-XX:+UseShenandoahGC` | Do Red Hat phát triển, nén (compact) heap đồng thời, pause thấp tương tự ZGC; có trong nhiều bản OpenJDK nhưng **không** có trong Oracle JDK | Latency thấp khi dùng bản OpenJDK có hỗ trợ |
| **Parallel** | `-XX:+UseParallelGC` | Nhiều thread GC, stop-the-world hoàn toàn, tối đa throughput | Batch job, xử lý dữ liệu, không quan tâm pause |
| **Serial** | `-XX:+UseSerialGC` | Một thread GC | Heap nhỏ, container rất ít CPU |

Một số lưu ý:

- Khi JVM thấy máy có ít tài nguyên (ví dụ chỉ 1 CPU hoặc bộ nhớ nhỏ), ergonomics có thể chọn Serial GC thay vì G1. Trong container nhỏ, hãy chỉ định GC tường minh.
- CMS đã bị loại bỏ từ JDK 14; nếu tài liệu cũ khuyên dùng CMS, hãy chuyển sang G1 hoặc ZGC.
- Từ JDK 23, ZGC mặc định chạy chế độ generational, nên cờ `-XX:+ZGenerational` chỉ cần trên JDK 21–22.
- Đừng tinh chỉnh hàng chục cờ GC. Bắt đầu với GC mặc định, đặt `-Xmx` hợp lý, đo, rồi mới thay đổi **một** thông số mỗi lần.

## Đọc GC log, heap dump và thread dump

### Bật và đọc GC log

Từ JDK 9, GC log dùng **unified logging** qua cờ `-Xlog`:

```bash
java -Xms2g -Xmx2g \
     -XX:+UseG1GC \
     -Xlog:gc*:file=/var/log/app/gc.log:time,uptime,level,tags:filecount=5,filesize=20m \
     -XX:+HeapDumpOnOutOfMemoryError -XX:HeapDumpPath=/var/log/app/ \
     -jar app.jar
```

Ví dụ một đoạn log G1 (dạng `-Xlog:gc`), đọc theo mẫu `trước->sau(tổng heap) thời gian pause`:

```text
[3.481s][info][gc] GC(5) Pause Young (Normal) (G1 Evacuation Pause) 245M->38M(512M) 6.812ms
[9.902s][info][gc] GC(17) Pause Young (Concurrent Start) (G1 Humongous Allocation) 402M->351M(512M) 9.104ms
[9.903s][info][gc] GC(18) Concurrent Mark Cycle
[10.120s][info][gc] GC(18) Pause Remark 380M->376M(512M) 2.031ms
[10.244s][info][gc] GC(18) Concurrent Mark Cycle 341.207ms
[12.510s][info][gc] GC(21) Pause Young (Mixed) (G1 Evacuation Pause) 430M->290M(512M) 11.732ms
[25.001s][info][gc] GC(40) Pause Full (G1 Compaction Pause) 510M->498M(512M) 812.554ms
```

Cách đọc:

- `GC(5)`: young GC bình thường, heap giảm từ 245 MB xuống 38 MB, pause khoảng 7 ms. Lành mạnh.
- `G1 Humongous Allocation`: có object rất lớn (từ nửa kích thước region trở lên) được cấp phát, thường là mảng hay `byte[]` lớn. Nếu xuất hiện nhiều, hãy xem lại việc đọc cả file/response lớn vào bộ nhớ.
- `Pause Full ... 510M->498M(512M) 812ms`: **dấu hiệu đỏ**. Full GC lâu mà chỉ thu hồi được 12 MB nghĩa là phần lớn heap là dữ liệu còn sống: heap quá nhỏ so với nhu cầu, hoặc có **memory leak**.

Chỉ số cần theo dõi: tần suất và thời gian pause (p99, max), lượng heap còn lại **sau** mỗi GC (nếu đường "sau GC" tăng dần theo thời gian là có leak), và tỷ lệ thời gian dành cho GC.

### Heap dump

Heap dump là ảnh chụp toàn bộ object trên heap, dùng để tìm memory leak. Lấy bằng:

```bash
jcmd -l                                         # liệt kê các process Java và pid
jcmd <pid> GC.class_histogram | head -20        # xem nhanh class nào chiếm nhiều bộ nhớ
jcmd <pid> GC.heap_dump /tmp/heap.hprof         # mặc định chỉ lấy object còn sống, có kích hoạt GC
jcmd <pid> Thread.print > /tmp/threads.txt      # thread dump
jcmd <pid> Thread.dump_to_file -format=json /tmp/threads.json   # JDK 21: gồm cả virtual thread
```

Phân tích file `.hprof` bằng Eclipse MAT (Memory Analyzer Tool) hoặc VisualVM. Hai khái niệm cần nắm:

- **Shallow size**: bộ nhớ của riêng object đó.
- **Retained size**: bộ nhớ sẽ được giải phóng nếu object đó bị thu hồi (gồm mọi thứ chỉ nó giữ). **Dominator tree** sắp xếp theo retained size, giúp tìm "kẻ giữ" bộ nhớ, ví dụ một `static HashMap` dùng làm cache không bao giờ xoá.

> **Lưu ý:** Heap dump có kích thước xấp xỉ heap đang dùng, việc lấy dump làm ứng dụng dừng trong lúc ghi, và file chứa dữ liệu nhạy cảm (token, thông tin khách hàng). Hãy lấy trên instance đã tách khỏi load balancer nếu được, và bảo vệ file như dữ liệu production.

### Thread dump

Thread dump cho biết mỗi thread đang ở trạng thái nào và stack trace của nó. Nên lấy **3–5 dump cách nhau vài giây**: thread cứ nằm ở cùng một chỗ qua nhiều dump mới là vấn đề thật. Các mẫu thường gặp:

```text
"http-nio-8080-exec-17" #63 daemon prio=5 ... waiting on condition
   java.lang.Thread.State: TIMED_WAITING (parking)
        at jdk.internal.misc.Unsafe.park(Native Method)
        ...
        at com.zaxxer.hikari.pool.HikariPool.getConnection(HikariPool.java)

Found one Java-level deadlock:
=============================
"transfer-1":
  waiting to lock monitor 0x00007f3a2c003f08 (object 0x000000071a0b1c20, a com.example.Account),
  which is held by "transfer-2"
"transfer-2":
  waiting to lock monitor 0x00007f3a2c006a58 (object 0x000000071a0b1c38, a com.example.Account),
  which is held by "transfer-1"
```

Đoạn đầu: rất nhiều thread request đang chờ lấy connection từ HikariCP, tức connection pool cạn (query chậm, transaction giữ connection lâu, hoặc pool quá nhỏ). Đoạn sau: JVM đã phát hiện deadlock và chỉ rõ thread nào giữ khoá nào. Nếu CPU cao, kết hợp `top -H -p <pid>` để tìm thread ngốn CPU rồi đối chiếu trong dump.

## Profiling với JFR, JDK Mission Control, VisualVM

**JFR** (Java Flight Recorder) là bộ ghi sự kiện tích hợp sẵn trong JVM (mã nguồn mở từ JDK 11), overhead thấp nên có thể bật trên production. Nó ghi: mẫu CPU theo method, cấp phát bộ nhớ, GC, lock contention, I/O file/socket, sự kiện virtual thread…

```bash
# Ghi ngay từ khi khởi động
java -XX:StartFlightRecording=duration=120s,filename=/tmp/app.jfr,settings=profile -jar app.jar

# Gắn vào process đang chạy
jcmd <pid> JFR.start name=perf settings=profile duration=60s filename=/tmp/perf.jfr
jcmd <pid> JFR.dump name=perf filename=/tmp/perf-now.jfr   # xuất dữ liệu đã ghi tới lúc này
jfr summary /tmp/perf.jfr
jfr print --events jdk.GarbageCollection /tmp/perf.jfr | head -40
```

Cấu hình `default` có overhead rất thấp, phù hợp bật liên tục; `profile` thu thập chi tiết hơn với overhead cao hơn một chút.

**JDK Mission Control** (JMC) là ứng dụng desktop (tải riêng) để mở file `.jfr`: trang "Automated Analysis" gợi ý vấn đề, các tab Method Profiling, Memory, Lock Instances, Threads giúp đào sâu.

**VisualVM** là công cụ trực quan (tải riêng, không còn đi kèm JDK từ JDK 9) kết nối tới JVM local hoặc qua JMX: xem heap, thread, CPU theo thời gian thực, lấy heap/thread dump, chạy sampler. Hữu ích khi phát triển và tái hiện sự cố trên máy cá nhân.

Quy trình profiling hợp lý: (1) xác định triệu chứng bằng metric (latency, CPU, GC), (2) tái hiện với tải tương đương, (3) ghi JFR trong lúc có vấn đề, (4) tìm hot spot về CPU, cấp phát, lock, (5) sửa **một** chỗ, đo lại để xác nhận.

## Micro-benchmark với JMH

Đo hiệu năng một đoạn code nhỏ bằng vòng lặp và `System.nanoTime()` thường sai vì: JIT chưa warm-up, JIT loại bỏ code có kết quả không được dùng (**dead code elimination**), gộp hằng số (**constant folding**), và nhiễu từ GC. **JMH** (Java Microbenchmark Harness) của OpenJDK giải quyết các vấn đề này.

```java
import org.openjdk.jmh.annotations.*;
import org.openjdk.jmh.infra.Blackhole;
import java.util.*;
import java.util.concurrent.TimeUnit;

@BenchmarkMode(Mode.AverageTime)
@OutputTimeUnit(TimeUnit.NANOSECONDS)
@Warmup(iterations = 5, time = 1)
@Measurement(iterations = 5, time = 1)
@Fork(2)
@State(Scope.Benchmark)
public class LookupBenchmark {

    @Param({"100", "100000"})
    int size;

    List<Integer> list;
    Set<Integer> set;
    int target;

    @Setup
    public void setup() {
        list = new ArrayList<>();
        for (int i = 0; i < size; i++) list.add(i);
        set = new HashSet<>(list);
        target = size - 1;                     // trường hợp xấu nhất cho list
    }

    @Benchmark
    public boolean listContains() { return list.contains(target); }   // trả về để JMH "tiêu thụ"

    @Benchmark
    public boolean setContains() { return set.contains(target); }

    @Benchmark
    public void sumList(Blackhole bh) {
        long sum = 0;
        for (int v : list) sum += v;
        bh.consume(sum);                        // tránh dead code elimination
    }
}
```

Tạo project từ archetype chính thức rồi chạy:

```bash
mvn archetype:generate -DarchetypeGroupId=org.openjdk.jmh \
    -DarchetypeArtifactId=jmh-java-benchmark-archetype \
    -DgroupId=com.example -DartifactId=bench -Dversion=1.0
cd bench && mvn clean verify
java -jar target/benchmarks.jar LookupBenchmark -prof gc   # -prof gc: đo thêm lượng cấp phát
```

Nguyên tắc: luôn trả về kết quả hoặc đưa vào `Blackhole`, không đặt dữ liệu đầu vào là hằng số trong method benchmark, chạy nhiều fork, đọc cả sai số (`Error`), và nhớ rằng micro-benchmark chỉ trả lời câu hỏi hẹp; hiệu năng hệ thống vẫn phải đo bằng load test.

## Lỗi thường gặp

- **Đặt `-Xmx` bằng memory limit của container**: JVM cần thêm bộ nhớ ngoài heap nên bị OOMKilled. Cách sửa: chừa khoảng trống cho native memory, theo dõi bằng NMT.
- **Gọi `System.gc()` hoặc tinh chỉnh GC theo cảm tính**: thường làm tình hình tệ hơn. Cách sửa: bật GC log, đo, thay đổi từng thông số.
- **Không bật `HeapDumpOnOutOfMemoryError`**: khi OOM xảy ra không còn bằng chứng. Cách sửa: luôn bật kèm `HeapDumpPath` trỏ tới volume đủ dung lượng.
- **Lấy một thread dump duy nhất rồi kết luận**: dễ nhầm trạng thái tức thời với vấn đề. Cách sửa: lấy nhiều dump cách nhau vài giây và so sánh.
- **Cache dùng `static Map` không giới hạn**: nguyên nhân leak phổ biến nhất. Cách sửa: dùng cache có giới hạn kích thước và thời gian sống (ví dụ Caffeine).
- **Benchmark bằng `System.nanoTime()` trong vòng lặp**: kết quả bị JIT và GC làm sai lệch. Cách sửa: dùng JMH.

## Bài tập thực hành

1. **Tìm memory leak**: viết ứng dụng nhỏ thêm object vào một `static List` mỗi request giả lập, chạy với `-Xmx256m -XX:+HeapDumpOnOutOfMemoryError` và bật GC log. Quan sát đường "heap sau GC" tăng dần, mở heap dump bằng Eclipse MAT và tìm đúng field gây leak qua dominator tree.
2. **So sánh GC**: chạy cùng một chương trình cấp phát nhiều object (ví dụ tạo và bỏ các `byte[]` ngẫu nhiên) với G1, Parallel và ZGC (generational) trên JDK 21. Ghi lại throughput và pause tối đa từ GC log, rút ra kết luận khi nào chọn GC nào.
3. **Profiling bằng JFR và benchmark bằng JMH**: với CLI thư viện, ghi JFR khi import 100.000 sách, mở bằng JMC để tìm method tốn CPU nhất. Viết JMH benchmark so sánh hai cách tìm sách theo tác giả (duyệt `List` với `stream().filter` so với `HashMap<String, List<Book>>` đã đánh chỉ mục).

## Tóm tắt

- Heap chứa object (Young/Old), stack theo thread chứa frame và tham chiếu, Metaspace chứa metadata class; tiến trình JVM luôn dùng nhiều hơn `-Xmx`.
- Class được nạp lười qua loading, linking, initialization; JIT (C1, C2) tối ưu code nóng nên ứng dụng cần warm-up.
- G1 là mặc định cân bằng; ZGC/Shenandoah cho pause cực thấp; Parallel cho throughput tối đa.
- GC log cho biết pause và heap sau GC; heap dump (retained size, dominator tree) tìm leak; nhiều thread dump liên tiếp tìm deadlock và tài nguyên cạn.
- JFR ghi sự kiện overhead thấp, mở bằng JMC; VisualVM tiện quan sát trực tiếp khi phát triển.
- Micro-benchmark phải dùng JMH với warm-up, fork và `Blackhole`.
