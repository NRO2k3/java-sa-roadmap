import type { LessonFlashcards } from '../types';

const flashcards: LessonFlashcards = {
  oop: [
    {
      front: 'Đóng gói (encapsulation) thực chất nhằm mục đích gì?',
      back: 'Bảo vệ bất biến của object: trạng thái được giấu kín và chỉ thay đổi qua hành vi có kiểm soát, ví dụ withdraw() kiểm tra số dư thay vì cho phép setBalance() tuỳ ý.',
    },
    {
      front: 'Overriding khác overloading thế nào?',
      back: 'Overriding: lớp con ghi đè method, JVM chọn theo kiểu thực tế lúc chạy (dynamic dispatch). Overloading: nhiều method cùng tên khác tham số, compiler chọn lúc biên dịch theo kiểu khai báo.',
    },
    {
      front: 'Khi nào chọn abstract class thay vì interface?',
      back: 'Khi cần chia sẻ trạng thái (field), constructor hoặc khung xử lý chung kiểu Template Method. Interface hợp để định nghĩa hợp đồng, năng lực và cho phép một class implement nhiều interface.',
    },
    {
      front: 'Hai interface có default method trùng chữ ký thì xử lý thế nào?',
      back: 'Class implement cả hai bắt buộc override method đó, nếu không sẽ lỗi biên dịch. Bên trong có thể gọi rõ Flyer.super.move() hoặc Swimmer.super.move().',
    },
    {
      front: 'Record (Java 16+) tự sinh những gì?',
      back: 'Constructor đầy đủ, accessor dạng x() (không phải getX()), equals, hashCode, toString. Record ngầm định final, field là private final; kiểm tra dữ liệu trong compact constructor.',
    },
    {
      front: 'Vì sao không nên dùng record làm JPA entity?',
      back: 'Entity cần constructor không tham số, trạng thái thay đổi được và thường bị Hibernate tạo proxy, trong khi record bất biến và final. Dùng record cho DTO, projection, value object.',
    },
    {
      front: 'Lợi ích lớn nhất của sealed kết hợp switch pattern matching (Java 21)?',
      back: 'Compiler kiểm tra tính đầy đủ: switch không cần default, và khi thêm kiểu mới vào permits, mọi switch thiếu nhánh sẽ không biên dịch được.',
    },
    {
      front: 'Năm nguyên lý SOLID là gì?',
      back: 'Single Responsibility, Open/Closed, Liskov Substitution, Interface Segregation, Dependency Inversion. Dùng để kiểm soát thay đổi, áp dụng khi có nhu cầu thật chứ không máy móc.',
    },
    {
      front: 'Dependency Inversion liên quan gì đến dependency injection?',
      back: 'DIP yêu cầu module cấp cao phụ thuộc vào trừu tượng. DI là kỹ thuật hiện thực: phụ thuộc được truyền vào, thường qua constructor, thay vì class tự new; Spring làm việc này tự động.',
    },
    {
      front: 'Strategy pattern trong Java hiện đại thường trông thế nào?',
      back: 'Một functional interface cho thuật toán, các cài đặt là lambda hoặc bean, chọn cài đặt qua Map hoặc factory. Thêm chiến lược mới không phải sửa code cũ, đúng tinh thần Open/Closed.',
    },
    {
      front: 'Khi nào nên dùng Builder?',
      back: 'Khi object có nhiều tham số tuỳ chọn, để tránh telescoping constructor và kiểm tra hợp lệ một lần ở build(). Với 2–3 field bắt buộc, record hoặc constructor thường là đủ.',
    },
    {
      front: 'Cách viết Singleton an toàn nhất trong Java thuần?',
      back: 'Dùng enum với một hằng INSTANCE: JVM đảm bảo khởi tạo thread-safe và chống tạo thêm instance qua serialization, reflection. Trong Spring, để container quản lý bean singleton.',
    },
  ],

  'collections-streams': [
    {
      front: 'Implementation mặc định nên chọn cho List, Map, Queue/Stack?',
      back: 'ArrayList cho List, HashMap cho Map, ArrayDeque cho cả queue và stack, thay cho Stack và LinkedList.',
    },
    {
      front: 'Khi nào dùng TreeMap thay vì HashMap?',
      back: 'Khi cần key luôn được sắp xếp hoặc truy vấn theo khoảng như floorKey, headMap. Đổi lại mọi thao tác là O(log n) thay vì O(1) trung bình.',
    },
    {
      front: 'Hợp đồng equals/hashCode bắt buộc điều gì?',
      back: 'Hai object equals nhau phải có cùng hashCode. Hai object khác nhau được phép trùng hashCode (va chạm), nhưng càng ít va chạm thì HashMap càng nhanh.',
    },
    {
      front: 'HashMap tính vị trí bucket thế nào?',
      back: 'Lấy h = key.hashCode(), trộn bit hash = h ^ (h >>> 16), rồi index = (n - 1) & hash, với n là dung lượng mảng, luôn là luỹ thừa của 2.',
    },
    {
      front: 'Khi nào HashMap resize?',
      back: 'Khi số phần tử vượt capacity × load factor (mặc định 16 × 0,75). Mảng gấp đôi và entry được phân bổ lại; biết trước kích thước thì dùng HashMap.newHashMap(n) từ Java 19.',
    },
    {
      front: 'Khi nào bucket của HashMap chuyển thành cây đỏ-đen?',
      back: 'Từ Java 8, khi một bucket có từ 8 node và mảng có ít nhất 64 phần tử; mảng nhỏ hơn thì HashMap resize thay vì chuyển thành cây. Trường hợp xấu nhất giảm từ O(n) xuống O(log n).',
    },
    {
      front: 'Quy tắc PECS là gì?',
      back: 'Producer Extends, Consumer Super: collection chỉ để đọc ra dùng ? extends T, collection để ghi vào dùng ? super T. Ví dụ Collections.copy(List<? super T> dest, List<? extends T> src).',
    },
    {
      front: 'Type erasure gây ra những giới hạn nào?',
      back: 'Thông tin kiểu generic bị xoá lúc chạy, nên không thể new T(), tạo mảng new T[10], hay kiểm tra obj instanceof List<String>.',
    },
    {
      front: 'Ba đặc điểm quan trọng của Stream?',
      back: 'Lazy (chỉ chạy khi có thao tác terminal), chỉ dùng một lần (chạy lại ném IllegalStateException), và lambda bên trong không nên có side effect.',
    },
    {
      front: 'groupingBy với downstream collector dùng để làm gì?',
      back: 'Nhóm phần tử theo key rồi gộp từng nhóm, ví dụ groupingBy(Book::genre, counting()), averagingDouble(Book::rating) hoặc mapping(Book::title, toList()).',
    },
    {
      front: 'Optional nên và không nên dùng ở đâu?',
      back: 'Nên dùng làm kiểu trả về của method có thể không có kết quả. Không nên dùng làm field, tham số method, bọc collection, hoặc gọi get() khi chưa kiểm tra.',
    },
    {
      front: 'List.of() khác Arrays.asList() thế nào?',
      back: 'List.of() bất biến hoàn toàn và không nhận null. Arrays.asList() có kích thước cố định, đỡ bởi mảng gốc: set() được nhưng add(), remove() ném UnsupportedOperationException.',
    },
  ],

  concurrency: [
    {
      front: 'Runnable khác Callable thế nào?',
      back: 'Runnable có void run(), không trả kết quả, không ném checked exception. Callable<V> có V call() throws Exception, trả kết quả qua Future khi gửi vào ExecutorService.',
    },
    {
      front: 'Sáu trạng thái trong Thread.State là gì?',
      back: 'NEW, RUNNABLE, BLOCKED, WAITING, TIMED_WAITING, TERMINATED. BLOCKED chỉ dùng khi chờ vào khối synchronized; chờ ReentrantLock hiện là WAITING vì dùng park().',
    },
    {
      front: 'Happens-before trong Java Memory Model là gì?',
      back: 'Quan hệ đảm bảo một lần ghi được thread khác nhìn thấy. Ví dụ: unlock trước lần lock tiếp theo trên cùng monitor, ghi volatile trước lần đọc sau, Thread.start() trước code trong thread.',
    },
    {
      front: 'volatile đảm bảo gì và không đảm bảo gì?',
      back: 'Đảm bảo visibility và chống sắp xếp lại lệnh. Không đảm bảo atomic cho thao tác ghép như count++; phù hợp cho cờ trạng thái một thread ghi, nhiều thread đọc.',
    },
    {
      front: 'ReentrantLock có gì hơn synchronized?',
      back: 'tryLock có timeout, lockInterruptibly, tuỳ chọn fairness và nhiều Condition. Đổi lại phải tự gọi unlock() trong khối finally.',
    },
    {
      front: 'ThreadPoolExecutor xử lý task mới theo thứ tự nào?',
      back: 'Dưới corePoolSize thì tạo thread; nếu không thì đưa vào hàng đợi; hàng đợi đầy và dưới maximumPoolSize thì tạo thêm thread; vẫn không được thì áp dụng RejectedExecutionHandler.',
    },
    {
      front: 'Bẫy của Executors.newFixedThreadPool và newCachedThreadPool?',
      back: 'newFixedThreadPool dùng hàng đợi không giới hạn, có thể cạn bộ nhớ. newCachedThreadPool có thể tạo không giới hạn thread. Production nên tự cấu hình ThreadPoolExecutor với hàng đợi có giới hạn.',
    },
    {
      front: 'Công thức tham khảo kích thước pool cho tác vụ I/O?',
      back: 'Số thread ≈ số core × mức sử dụng CPU mục tiêu × (1 + W/C), với W là thời gian chờ, C là thời gian tính. Tác vụ CPU-bound thì khoảng số core hoặc số core + 1.',
    },
    {
      front: 'thenApply khác thenCompose thế nào?',
      back: 'thenApply biến đổi kết quả bằng hàm thường, giống map. thenCompose nối với bước bất đồng bộ khác trả về CompletableFuture, giống flatMap, tránh lồng CompletableFuture<CompletableFuture<T>>.',
    },
    {
      front: 'Ba lưu ý khi dùng Virtual Threads trên Java 21?',
      back: 'Không pool chúng, tạo mới mỗi task bằng Executors.newVirtualThreadPerTaskExecutor(); giới hạn truy cập tài nguyên khan hiếm bằng Semaphore; tránh block trong synchronized vì gây pinning.',
    },
    {
      front: 'Bật virtual thread trong Spring Boot bằng cấu hình nào?',
      back: 'Từ Spring Boot 3.2, đặt spring.threads.virtual.enabled=true khi chạy Java 21 trở lên để web server và tác vụ @Async chạy trên virtual thread.',
    },
    {
      front: 'Thread pool starvation là gì?',
      back: 'Task trong một pool gửi task con vào chính pool đó rồi block chờ kết quả; khi mọi thread đều chờ, không còn thread chạy task con và hệ thống treo. Sửa bằng tách pool hoặc dùng thenCompose.',
    },
  ],

  jvm: [
    {
      front: 'Heap, Stack và Metaspace chứa gì?',
      back: 'Heap chứa mọi object và mảng, do GC quản lý. Stack riêng từng thread, chứa frame với biến cục bộ và tham chiếu. Metaspace nằm ở native memory (từ Java 8), chứa metadata của class.',
    },
    {
      front: 'Vòng đời object trong heap chia thế hệ (generational)?',
      back: 'Object mới được cấp phát ở Eden, thường qua TLAB. Minor GC copy object còn sống sang Survivor; sống qua đủ số lần GC thì được promote lên Old.',
    },
    {
      front: 'Vì sao tiến trình JVM dùng nhiều RAM hơn -Xmx?',
      back: 'Ngoài heap còn Metaspace, thread stack, code cache, direct buffer và cấu trúc nội bộ của GC. Kiểm tra bằng -XX:NativeMemoryTracking=summary rồi jcmd <pid> VM.native_memory summary.',
    },
    {
      front: 'Tiered compilation của HotSpot hoạt động ra sao?',
      back: 'Bytecode ban đầu được thông dịch; method nóng được C1 biên dịch nhanh, sau đó C2 biên dịch lại với tối ưu mạnh như inlining, escape analysis dựa trên profiling. Vì vậy ứng dụng cần warm-up.',
    },
    {
      front: 'Đặc điểm chính của G1 GC?',
      back: 'GC mặc định từ JDK 9 trên máy đủ tài nguyên; chia heap thành region, generational, cố giữ pause dưới -XX:MaxGCPauseMillis (mặc định 200 ms) và thu gom dần vùng Old bằng mixed collection.',
    },
    {
      front: 'Bật ZGC generational trên JDK 21 thế nào?',
      back: 'Dùng -XX:+UseZGC -XX:+ZGenerational. Từ JDK 23, chế độ generational là mặc định nên chỉ cần -XX:+UseZGC.',
    },
    {
      front: 'Bật GC log bằng unified logging (JDK 9+)?',
      back: 'Dùng -Xlog:gc*:file=gc.log:time,uptime,level,tags, có thể thêm filecount và filesize để xoay vòng file. Đọc theo mẫu trước->sau(tổng heap) kèm thời gian pause.',
    },
    {
      front: 'Shallow size khác retained size thế nào?',
      back: 'Shallow size là bộ nhớ của riêng object. Retained size là bộ nhớ được giải phóng nếu object bị thu hồi, gồm mọi thứ chỉ nó giữ. Dominator tree trong Eclipse MAT sắp theo retained size để tìm leak.',
    },
    {
      front: 'Lệnh jcmd để lấy heap dump và thread dump?',
      back: 'jcmd <pid> GC.heap_dump /tmp/heap.hprof cho heap dump, mặc định chỉ object còn sống. jcmd <pid> Thread.print cho thread dump; JDK 21 có Thread.dump_to_file -format=json gồm cả virtual thread.',
    },
    {
      front: 'Vì sao nên lấy nhiều thread dump liên tiếp?',
      back: 'Một dump chỉ là ảnh chụp tức thời. Lấy 3–5 dump cách nhau vài giây; thread nằm cùng một chỗ qua nhiều dump mới là dấu hiệu nghẽn hoặc treo thật.',
    },
    {
      front: 'JFR, JDK Mission Control và VisualVM khác nhau thế nào?',
      back: 'JFR là bộ ghi sự kiện tích hợp trong JVM, overhead thấp, dùng được trên production. JMC là ứng dụng desktop phân tích file .jfr. VisualVM quan sát JVM trực tiếp qua JMX, tiện khi phát triển.',
    },
    {
      front: 'JMH giúp tránh những bẫy nào khi micro-benchmark?',
      back: 'JIT chưa warm-up, dead code elimination khi kết quả không được dùng, và constant folding khi đầu vào là hằng số. Luôn trả về kết quả hoặc dùng Blackhole, chạy nhiều fork.',
    },
  ],

  'build-test': [
    {
      front: 'Ba lifecycle có sẵn của Maven?',
      back: 'clean (xoá thư mục target), default (build chính: validate, compile, test, package, verify, install, deploy) và site (sinh tài liệu dự án).',
    },
    {
      front: 'Phase và plugin goal trong Maven liên hệ thế nào?',
      back: 'Phase chỉ là một bước trong lifecycle, bản thân không làm gì. Công việc do plugin goal gắn vào phase thực hiện, ví dụ surefire:test gắn vào phase test.',
    },
    {
      front: 'Scope provided và runtime dùng khi nào?',
      back: 'provided: cần lúc biên dịch nhưng môi trường chạy đã cung cấp, như Servlet API trên app server. runtime: không cần lúc biên dịch nhưng cần khi chạy, như JDBC driver.',
    },
    {
      front: 'BOM là gì và import vào Maven thế nào?',
      back: 'BOM (Bill of Materials) là một pom chỉ quản lý phiên bản cho một họ thư viện. Import trong dependencyManagement với type pom và scope import, sau đó khai báo dependency không cần version.',
    },
    {
      front: 'Maven chọn phiên bản nào khi transitive dependency xung đột?',
      back: 'Chọn bản gần nhất trong cây dependency (nearest wins), không phải bản mới nhất. Dùng mvn dependency:tree để xem và khai báo trong dependencyManagement để kiểm soát.',
    },
    {
      front: 'implementation khác api trong Gradle thế nào?',
      back: 'implementation giữ dependency là chi tiết nội bộ, không lộ cho module phụ thuộc. api (plugin java-library) lộ dependency ra consumer, chỉ dùng khi kiểu của thư viện xuất hiện trong API công khai.',
    },
    {
      front: 'Convention plugin trong Gradle dùng để làm gì?',
      back: 'Gom cấu hình lặp lại giữa các module như toolchain, repositories, test vào một plugin trong buildSrc hoặc included build; mỗi module chỉ cần plugins { id("java-conventions") }.',
    },
    {
      front: 'Các nguồn dữ liệu thường dùng của @ParameterizedTest?',
      back: '@ValueSource, @CsvSource, @MethodSource, @EnumSource, @NullAndEmptySource. Cần module junit-jupiter-params, đã có sẵn trong artifact tổng hợp junit-jupiter.',
    },
    {
      front: 'Strict stubs của MockitoExtension là gì?',
      back: 'MockitoExtension mặc định báo UnnecessaryStubbingException nếu có stub không được dùng tới trong test, giúp test gọn và phát hiện stub thừa.',
    },
    {
      front: 'JaCoCo LINE coverage khác BRANCH coverage?',
      back: 'LINE đo tỷ lệ dòng được thực thi, BRANCH đo tỷ lệ nhánh if/switch được đi qua. Branch phản ánh chất lượng test tốt hơn, nhưng coverage cao vẫn không chứng minh test có assert đúng.',
    },
    {
      front: 'Vì sao JaCoCo báo 0% sau khi tự cấu hình argLine của Surefire?',
      back: 'Goal prepare-agent truyền Java agent qua property argLine; ghi đè argLine làm mất agent. Sửa bằng cách nối thêm, ví dụ @{argLine} -Xmx1g.',
    },
    {
      front: 'Ba bước của chu trình TDD?',
      back: 'Red: viết một test nhỏ thất bại. Green: viết code tối thiểu để test pass. Refactor: dọn code khi test vẫn xanh, rồi lặp lại với test tiếp theo.',
    },
  ],
};

export default flashcards;
