Khi service Java trên production chậm, ăn hết CPU hay chết vì hết bộ nhớ, phản xạ "restart cho nhanh" có thể giúp vài giờ nhưng xoá mất bằng chứng, và sự cố sẽ quay lại. Dev Lead cần biết **thu thập bằng chứng đúng cách** từ một JVM đang chạy, đọc được thread dump, heap dump, GC log, profile, và quan trọng nhất là biết **bắt đầu từ đâu** giữa hàng trăm metric. Bài này đi từ phương pháp khoanh vùng đến từng kịch bản cụ thể: CPU cao, memory leak, deadlock, cạn connection pool, slow query và GC pause dài.

## Mục tiêu bài học

- Áp dụng quy trình khoanh vùng nguyên nhân từ metrics, log và trace trước khi đi sâu vào JVM.
- Chẩn đoán CPU cao, memory leak và deadlock bằng thread dump và heap dump.
- Dùng JFR, async-profiler và Arthas để phân tích hiệu năng an toàn trên production.
- Nhận diện cạn kiệt connection pool, slow query và GC pause dài qua dấu hiệu đặc trưng.

## Khoanh vùng trước, đào sâu sau

Đừng mở heap dump khi chưa biết vấn đề nằm ở service nào. Quy trình khoanh vùng:

1. **Xác nhận triệu chứng bằng số liệu**: latency tăng ở percentile nào (p50 hay chỉ p99)? Tỉ lệ lỗi bao nhiêu? Bắt đầu từ lúc nào?
2. **Thu hẹp phạm vi**: một instance hay mọi instance? Một endpoint hay tất cả? Một nhóm khách hàng? Một instance lỗi gợi ý vấn đề cục bộ (node xấu, memory leak); mọi instance cùng lỗi gợi ý thay đổi chung hoặc dependency phía sau.
3. **Hỏi "cái gì đã thay đổi"**: deploy mới, thay đổi config, traffic tăng đột biến, dependency (DB, service khác) vừa được nâng cấp. Đặt mốc deploy lên dashboard để so sánh trực quan.
4. **Theo trace**: distributed tracing (OpenTelemetry, Micrometer Tracing) cho biết trong 2 giây của một request chậm, bao nhiêu thời gian nằm ở DB, bao nhiêu ở service khác, bao nhiêu trong chính service.
5. **Đọc log theo trace id**: Micrometer Tracing đưa `traceId`/`spanId` vào MDC, nên log pattern có trace id cho phép lọc mọi dòng log của đúng request đó trên nhiều service.
6. **Cuối cùng mới vào JVM**: thread dump, heap dump, profile khi đã biết vấn đề nằm trong service này.

Hai khung tư duy giúp không bỏ sót: **RED** cho service (Rate: số request, Errors: số lỗi, Duration: thời gian xử lý) và **USE** cho tài nguyên (Utilization: mức sử dụng, Saturation: mức bão hoà như hàng đợi, Errors: lỗi). Áp USE lần lượt cho CPU, bộ nhớ, thread pool, connection pool, thường nhanh chóng chỉ ra tài nguyên nào đang nghẽn.

## Bộ công cụ chẩn đoán JVM

`jcmd` là công cụ "tất cả trong một" đi kèm JDK, nên dùng thay cho các công cụ cũ riêng lẻ (`jstack`, `jmap`). Cần chạy với **cùng user** với tiến trình Java, và image container phải có JDK (hoặc ít nhất có `jcmd`), không chỉ JRE tối giản.

```bash
jcmd                                    # liệt kê các tiến trình JVM và PID
jcmd <pid> VM.flags                     # cờ JVM đang dùng (heap, GC...)
jcmd <pid> Thread.print -l > td1.txt    # thread dump kèm thông tin lock (giống jstack -l)
jcmd <pid> Thread.dump_to_file -format=json threads.json   # JDK 21: gồm cả virtual thread
jcmd <pid> GC.class_histogram | head -30                   # đếm object theo class
jcmd <pid> GC.heap_dump /dumps/heap.hprof                  # heap dump (dừng JVM khi dump!)
jcmd <pid> JFR.start name=diag settings=profile duration=120s filename=/dumps/diag.jfr
jfr summary /dumps/diag.jfr             # tổng quan các event trong file
jfr view hot-methods /dumps/diag.jfr    # JDK 21+: method tốn CPU nhất ngay trên terminal

# Cờ nên bật sẵn khi khởi động service production
-XX:+HeapDumpOnOutOfMemoryError -XX:HeapDumpPath=/dumps
-Xlog:gc*:file=/logs/gc.log:time,uptime,level,tags:filecount=5,filesize=20m
```

> **Lưu ý:** Thread dump rất rẻ, lấy thoải mái. **Heap dump dừng toàn bộ JVM** trong lúc ghi (có thể vài giây tới vài phút với heap lớn), file có kích thước cỡ heap đang dùng và **chứa dữ liệu nhạy cảm** (token, thông tin khách hàng). Hãy rút instance khỏi load balancer trước khi dump, kiểm tra dung lượng đĩa, và xử lý file như dữ liệu mật.

## CPU cao

Khi CPU của service tăng vọt, cần trả lời: **thread nào** đang ăn CPU và nó **đang chạy code gì**.

```bash
top -H -p <pid>          # hiển thị theo thread; giả sử thread 12345 dùng 98% CPU
printf '%x\n' 12345      # đổi sang hex -> 3039
grep -A 20 'nid=0x3039' td1.txt   # tìm thread đó trong thread dump
```

Trong thread dump, `nid` là id của thread hệ điều hành dạng hex, nên ánh xạ được với cột thread id của `top -H`. Lấy **3 thread dump cách nhau 5–10 giây**: một thread `RUNNABLE` ở cùng đoạn code qua cả ba lần là thủ phạm gần như chắc chắn. Một dump duy nhất chỉ là ảnh chụp tức thời, dễ đánh lừa.

Nguyên nhân CPU cao thường gặp:

- **Vòng lặp vô hạn hoặc thuật toán độ phức tạp cao** với dữ liệu lớn bất thường.
- **Regex backtracking thảm hoạ**: biểu thức như `(a+)+` gặp chuỗi đầu vào xấu; thread dump sẽ đứng ở `java.util.regex.Pattern`.
- **GC hoạt động liên tục**: nếu các thread ăn CPU có tên kiểu `GC Thread#0` hay `G1 Conc#0`, vấn đề là bộ nhớ chứ không phải code nghiệp vụ; chuyển sang phần memory leak.
- **JIT compiler** (`C2 CompilerThread0`) bận ngay sau khi khởi động là bình thường, thường giảm dần sau khi warm-up.
- **Bị giới hạn CPU trong container**: khi pod chạm CPU limit, Linux CFS throttling làm mọi thứ chậm lại dù tổng CPU trông không cao. Metric `container_cpu_cfs_throttled_seconds_total` cho biết pod có bị throttle không.

## Memory leak và OutOfMemoryError

**Memory leak** trong Java là khi object không còn cần dùng nhưng vẫn được tham chiếu, nên GC không thu hồi được. Dấu hiệu: sau mỗi lần GC, lượng heap còn lại (live set) **tăng dần theo thời gian**, cuối cùng là GC chạy liên tục và `OutOfMemoryError`.

Đọc kỹ thông báo lỗi vì mỗi loại OOM chỉ về một hướng khác nhau:

| Thông báo | Ý nghĩa thường gặp |
|---|---|
| `Java heap space` | Heap đầy: leak, hoặc tải một lượng dữ liệu quá lớn vào bộ nhớ (query không phân trang) |
| `GC overhead limit exceeded` | JVM dành gần hết thời gian cho GC mà thu hồi được rất ít |
| `Metaspace` | Quá nhiều class được nạp: leak ClassLoader, sinh class động không giới hạn |
| `unable to create native thread` | Tạo quá nhiều thread, chạm giới hạn của OS hoặc container |
| Pod bị kill, exit code 137 (OOMKilled) | Kernel giết tiến trình vì vượt memory limit của container; heap có thể chưa đầy, kiểm tra bộ nhớ ngoài heap |

Nguyên nhân leak phổ biến trong ứng dụng Spring: cache tự viết bằng `static Map` không giới hạn kích thước; `ThreadLocal` không được `remove()` trong thread pool (thread sống mãi nên giá trị cũng sống mãi); listener đăng ký mà không huỷ; hàng đợi trong bộ nhớ mà consumer chậm hơn producer.

### Phân tích heap dump

Mở file `.hprof` bằng **Eclipse MAT** (Memory Analyzer Tool):

- **Leak Suspects Report**: MAT tự gợi ý các object chiếm phần lớn heap.
- **Dominator Tree**: sắp xếp object theo **retained heap**, tức là lượng bộ nhớ sẽ được giải phóng nếu object đó bị thu hồi (khác với **shallow heap**, chỉ là kích thước bản thân object).
- **Path to GC Roots**: cho biết chuỗi tham chiếu nào đang giữ object sống, ví dụ `static` field của một class cache. Chọn tuỳ chọn loại trừ weak/soft reference để thấy tham chiếu mạnh thật sự.

Mẹo nhanh trước khi dump cả heap: chạy `GC.class_histogram` hai lần cách nhau vài phút. Class nào có số instance tăng đều mà không giảm là ứng viên leak hàng đầu.

Nếu RSS của tiến trình lớn hơn nhiều so với heap, hãy nghĩ tới bộ nhớ ngoài heap: direct buffer, metaspace, thread stack. Bật `-XX:NativeMemoryTracking=summary` rồi dùng `jcmd <pid> VM.native_memory summary` để xem phân bổ.

## Deadlock và thread bị chặn

**Deadlock** xảy ra khi hai (hoặc nhiều) thread chờ nhau giải phóng lock theo vòng tròn, không ai tiến được. Với lock `synchronized` và `ReentrantLock`, thread dump tự phát hiện và in ở cuối:

```text
Found one Java-level deadlock:
=============================
"order-worker-2":
  waiting to lock monitor 0x00007f1c3c004e08 (object 0x00000000d1b2c3a8, a com.example.Account),
  which is held by "order-worker-1"

"order-worker-1":
  waiting to lock monitor 0x00007f1c3c007a18 (object 0x00000000d1b2c3c0, a com.example.Account),
  which is held by "order-worker-2"
```

Đọc như sau: worker-1 giữ tài khoản A và chờ tài khoản B, worker-2 giữ B và chờ A. Kịch bản kinh điển là chuyển tiền: một thread chuyển A sang B, thread khác chuyển B sang A, mỗi thread lock tài khoản nguồn trước. Cách sửa: **lock theo thứ tự cố định** (ví dụ theo id tài khoản tăng dần), dùng `tryLock` với timeout, hoặc thu hẹp vùng giữ lock.

Ngoài deadlock thật, hay gặp hơn là **nhiều thread bị `BLOCKED`** chờ cùng một monitor do một thread giữ lock quá lâu (ví dụ gọi HTTP bên trong khối `synchronized`). Tìm dòng `- locked <0x...>` ở thread đang giữ và `- waiting to lock <0x...>` với cùng địa chỉ ở các thread đang chờ.

> **Lưu ý:** Với virtual thread (Java 21), `Thread.print` chủ yếu liệt kê platform thread và không cho thấy đầy đủ các virtual thread. Dùng `Thread.dump_to_file` để có danh sách đầy đủ. Ở Java 21, virtual thread chạy trong khối `synchronized` mà bị block sẽ giữ luôn carrier thread (pinning); cờ `-Djdk.tracePinnedThreads=full` giúp phát hiện.

## Cạn kiệt connection pool và slow query

Đây có lẽ là sự cố phổ biến nhất của service Spring Boot. HikariCP, pool mặc định của Spring Boot, có `maximumPoolSize` mặc định là 10 và `connectionTimeout` mặc định 30 giây. Khi mọi connection đều đang bận, request mới chờ tới hết timeout rồi ném lỗi:

```text
java.sql.SQLTransientConnectionException: HikariPool-1 - Connection is not available,
request timed out after 30000ms.
```

Dấu hiệu trên metrics: `hikaricp_connections_active` bằng `hikaricp_connections_max`, `hikaricp_connections_pending` lớn hơn 0 kéo dài, `hikaricp_connections_timeout_total` tăng. Trong thread dump, nhiều thread request đứng chờ ở pool:

```text
"http-nio-8080-exec-42" #87 daemon prio=5 ... waiting on condition
   java.lang.Thread.State: TIMED_WAITING (parking)
        at jdk.internal.misc.Unsafe.park(java.base@21/Native Method)
        ...
        at com.zaxxer.hikari.pool.HikariPool.getConnection(HikariPool.java)
        at com.zaxxer.hikari.HikariDataSource.getConnection(HikariDataSource.java)
        ...
        at com.example.order.OrderController.create(OrderController.java:41)

"http-nio-8080-exec-7" #52 daemon prio=5 ... runnable
   java.lang.Thread.State: RUNNABLE
        at sun.nio.ch.Net.poll(java.base@21/Native Method)
        at sun.nio.ch.NioSocketImpl.read(java.base@21/NioSocketImpl.java)
        ...
        at org.springframework.web.client.RestTemplate.doExecute(RestTemplate.java)
        at com.example.order.PaymentClient.charge(PaymentClient.java:58)
        at com.example.order.OrderService.placeOrder(OrderService.java:73)
```

Câu hỏi then chốt: **ai đang giữ connection và giữ để làm gì?** Thread `exec-7` đang trong `OrderService.placeOrder` (method `@Transactional`, nên đã giữ một connection từ đầu transaction) nhưng thực ra đang chờ đọc socket từ dịch vụ thanh toán. Khi dịch vụ thanh toán chậm, 10 connection bị giữ bởi 10 request đang chờ HTTP, và mọi request khác, kể cả những request chỉ đọc DB, đều phải chờ. Thủ phạm không phải DB.

Các nguyên nhân chính và cách sửa:

- **Gọi remote trong transaction**: đưa lời gọi HTTP ra ngoài transaction, đặt timeout cho HTTP client, dùng circuit breaker.
- **Connection leak**: mở connection thủ công mà không đóng. Bật `spring.datasource.hikari.leak-detection-threshold` (mili giây) để Hikari log stack trace của nơi mượn connection quá lâu.
- **Slow query**: một query chậm giữ connection lâu, và nếu nó được gọi nhiều thì pool cạn nhanh.
- **Tăng pool không phải lúc nào cũng đúng**: pool lớn hơn chuyển áp lực sang DB; nhiều instance nhân với pool lớn có thể vượt giới hạn kết nối của DB.

Với PostgreSQL, hai truy vấn giúp tìm query chậm:

```sql
-- Query đang chạy lâu hơn 5 giây và trạng thái chờ (lock, IO...)
SELECT pid, now() - query_start AS duration, state, wait_event_type, wait_event,
       left(query, 120) AS query
FROM pg_stat_activity
WHERE state <> 'idle' AND now() - query_start > interval '5 seconds'
ORDER BY duration DESC;

-- Query tốn tổng thời gian nhiều nhất (cần extension pg_stat_statements, PostgreSQL 13+)
SELECT calls, round(mean_exec_time::numeric, 1) AS mean_ms,
       round(total_exec_time::numeric) AS total_ms, left(query, 100) AS query
FROM pg_stat_statements
ORDER BY total_exec_time DESC
LIMIT 10;
```

Sau khi có query nghi ngờ, chạy `EXPLAIN (ANALYZE, BUFFERS)` để xem kế hoạch thực thi: sequential scan trên bảng lớn thường nghĩa là thiếu index. Cẩn thận: `EXPLAIN ANALYZE` **thực sự chạy** câu lệnh, đừng dùng với `UPDATE`/`DELETE` trên production nếu không bọc trong transaction rồi rollback.

## GC pause dài

GC log là nguồn sự thật về bộ nhớ. Với G1 (GC mặc định), một vài dòng log dạng unified logging:

```text
[2024-05-10T02:13:41.120+0700][info][gc] GC(1530) Pause Young (Normal) (G1 Evacuation Pause) 3010M->1205M(4096M) 38.412ms
[2024-05-10T02:13:44.902+0700][info][gc] GC(1531) Pause Young (Concurrent Start) (G1 Humongous Allocation) 3890M->3702M(4096M) 61.007ms
[2024-05-10T02:13:47.551+0700][info][gc] GC(1533) Pause Full (G1 Compaction Pause) 4012M->3951M(4096M) 2873.456ms
```

Cách đọc: `3010M->1205M(4096M)` là heap đã dùng trước GC, sau GC và tổng heap. Dòng đầu bình thường: young GC dọn được nhiều, pause 38 ms. Dòng cuối là báo động: **Full GC** dừng ứng dụng gần 3 giây nhưng chỉ thu hồi được khoảng 60 MB, nghĩa là heap gần như toàn object còn sống. Đó là dấu hiệu leak hoặc heap quá nhỏ cho lượng dữ liệu thật. "Humongous Allocation" cho biết ứng dụng cấp phát object rất lớn (từ nửa kích thước region trở lên), thường là mảng byte hoặc chuỗi khổng lồ, ví dụ đọc cả file hoặc cả kết quả query vào bộ nhớ.

Hướng xử lý: trước hết tìm và sửa nguyên nhân giữ bộ nhớ (leak, tải dữ liệu không phân trang). Chỉ sau đó mới cân nhắc tăng heap hoặc đổi GC; ví dụ ZGC (từ JDK 21 có chế độ generational qua `-XX:+ZGenerational`) cho pause rất ngắn với heap lớn, đổi lại tốn thêm CPU và bộ nhớ.

## Profile hiệu năng: JFR, async-profiler, Arthas

Khi không có lỗi rõ ràng mà service "chỉ chậm", cần **profile**: đo xem thời gian và bộ nhớ thực sự đi đâu.

**JDK Flight Recorder (JFR)** tích hợp sẵn trong JDK, được thiết kế để chạy trên production với overhead thấp. JFR ghi lại sampling CPU, cấp phát bộ nhớ, GC, lock contention, I/O, sự kiện thread. Có thể chạy liên tục dạng "hộp đen" (`-XX:StartFlightRecording=maxage=1h,disk=true` để giữ dữ liệu một giờ gần nhất), rồi dump khi có sự cố bằng `jcmd <pid> JFR.dump name=... filename=...`. Phân tích bằng **JDK Mission Control** (JMC) hoặc lệnh `jfr`.

**async-profiler** là profiler sampling mã nguồn mở, overhead thấp, không bị "safepoint bias" (lỗi của nhiều profiler cũ chỉ lấy mẫu được tại điểm an toàn của JVM), và xuất **flame graph** rất trực quan. Từ version 3, lệnh chính là `asprof`:

```bash
asprof -d 30 -e cpu   -f /tmp/cpu.html   <pid>   # flame graph CPU trong 30 giây
asprof -d 30 -e alloc -f /tmp/alloc.html <pid>   # nơi cấp phát bộ nhớ nhiều nhất
asprof -d 30 -e wall  -f /tmp/wall.html  <pid>   # wall-clock: cả thời gian chờ IO, lock
```

Đọc flame graph: trục ngang là tỉ lệ mẫu (không phải thời gian tuần tự), "ngọn lửa" càng rộng càng tốn tài nguyên. Chế độ `wall` đặc biệt hữu ích khi request chậm nhưng CPU thấp, vì nó cho thấy thread đang **chờ** ở đâu. Trong container, profiling CPU có thể cần quyền truy cập perf events của kernel; nếu không có, async-profiler có chế độ dự phòng `itimer`.

**Arthas** (của Alibaba) là công cụ chẩn đoán tương tác, gắn vào JVM đang chạy (`java -jar arthas-boot.jar`, chọn tiến trình). Các lệnh hay dùng: `dashboard` (tổng quan thread, bộ nhớ, GC), `thread -n 3` (3 thread bận nhất), `thread -b` (thread đang chặn thread khác), `trace com.example.OrderService placeOrder` (thời gian từng lời gọi con trong method), `watch` (xem tham số, giá trị trả về, exception của method khi được gọi). Arthas hoạt động bằng cách **sửa bytecode lúc runtime**, nên rất mạnh nhưng có rủi ro: dùng có kiểm soát, giới hạn số lần bắt (`-n`), và chạy `stop` để gỡ toàn bộ instrumentation khi xong. Nhiều tổ chức yêu cầu phê duyệt trước khi dùng trên production.

| Công cụ | Dùng khi | Rủi ro trên production |
|---|---|---|
| Thread dump | Treo, chậm, CPU cao, deadlock | Rất thấp |
| JFR | Profile tổng quát, ghi liên tục làm hộp đen | Thấp |
| async-profiler | Flame graph CPU, allocation, wall-clock | Thấp |
| Arthas | Xem tham số/thời gian một method cụ thể khi đang chạy | Trung bình (sửa bytecode) |
| Heap dump | Memory leak, OOM | Cao (dừng JVM, file lớn, dữ liệu nhạy cảm) |

## Lỗi thường gặp

- **Restart ngay mà không thu thập gì**: sự cố quay lại, không có dữ liệu để phân tích. Cách sửa: runbook có bước lấy thread dump (và heap histogram) trong vòng một phút trước khi restart; bật sẵn `HeapDumpOnOutOfMemoryError` và GC log.
- **Kết luận từ một thread dump duy nhất**: ảnh chụp tức thời dễ gây hiểu nhầm. Cách sửa: lấy ít nhất 3 bản cách nhau vài giây và so sánh.
- **Tăng heap hoặc tăng pool như phản xạ**: che giấu leak hoặc chuyển áp lực sang DB. Cách sửa: tìm ai đang giữ bộ nhớ, ai đang giữ connection trước.
- **Heap dump trên instance đang nhận traffic**: JVM dừng, request lỗi hàng loạt. Cách sửa: rút instance khỏi load balancer trước.
- **Không có trace id trong log**: không nối được log giữa các service. Cách sửa: cấu hình tracing và log pattern có `traceId` từ đầu.
- **Image container không có công cụ**: không có `jcmd` khi cần. Cách sửa: dùng base image có JDK cho môi trường cần chẩn đoán, hoặc chuẩn bị sẵn cách gắn container debug (ví dụ `kubectl debug`).

## Bài tập thực hành

1. **Tái hiện cạn connection pool**: tạo service Spring Boot với `maximum-pool-size=3`, một endpoint `@Transactional` gọi HTTP tới một mock server có độ trễ 5 giây. Bắn tải song song, quan sát metric `hikaricp_connections_pending`, lấy thread dump và chỉ ra thread nào giữ connection. Sau đó sửa bằng cách đưa lời gọi HTTP ra ngoài transaction và đặt timeout.
2. **Săn memory leak**: viết endpoint thêm object vào một `static List` mỗi lần gọi, chạy với `-Xmx256m` và `HeapDumpOnOutOfMemoryError`. Mở heap dump bằng Eclipse MAT, dùng Dominator Tree và Path to GC Roots để tìm đúng field gây leak.
3. **Flame graph**: chạy async-profiler ở chế độ `cpu` và `wall` cho một endpoint chậm của team trong lúc bắn tải; mô tả ba "ngọn lửa" rộng nhất và đề xuất một tối ưu dựa trên đó.

## Tóm tắt

- Khoanh vùng trước bằng metrics, trace và log (RED cho service, USE cho tài nguyên), chỉ đào vào JVM khi đã biết vấn đề nằm ở service nào.
- `jcmd` là công cụ chính: thread dump rẻ và an toàn; heap dump dừng JVM và chứa dữ liệu nhạy cảm.
- CPU cao: `top -H` lấy thread id, đổi sang hex, tìm `nid` trong nhiều thread dump liên tiếp.
- Memory leak: theo dõi live set sau GC, dùng class histogram và Eclipse MAT (Dominator Tree, Path to GC Roots).
- Cạn connection pool: hỏi ai đang giữ connection và để làm gì; thủ phạm hay gặp là gọi remote trong transaction và slow query.
- GC log cho biết pause dài và heap có thực sự thu hồi được không; sửa nguyên nhân giữ bộ nhớ trước khi chỉnh GC.
- JFR và async-profiler an toàn để profile trên production; Arthas mạnh nhưng sửa bytecode, cần dùng có kiểm soát.
