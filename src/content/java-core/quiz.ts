import type { LessonQuiz } from '../types';

const quiz: LessonQuiz = {
  oop: [
    {
      question:
        'Class BankAccount có method public List<String> history() { return history; } trả về chính list nội bộ. Vấn đề chính của thiết kế này là gì?',
      options: [
        'Vi phạm đa hình vì List là interface chứ không phải class cụ thể',
        'Phá vỡ đóng gói vì code bên ngoài có thể sửa trực tiếp lịch sử giao dịch',
        'Gây rò rỉ bộ nhớ vì list không bao giờ được thu gom',
        'Không biên dịch được vì field private không thể được trả về',
      ],
      answer: 1,
      explanation:
        'Trả về tham chiếu tới list nội bộ cho phép bên ngoài gọi add() hay clear(), phá bất biến của object. Nên trả về List.copyOf(history) hoặc một view chỉ đọc.',
    },
    {
      question:
        'Cho interface Flyer { default String move() { return "bay"; } } và interface Swimmer { default String move() { return "bơi"; } }. Viết class Duck implements Flyer, Swimmer {} mà không override move(). Kết quả là gì?',
      options: [
        'Biên dịch được, Duck.move() trả về "bay" vì Flyer được khai báo trước',
        'Biên dịch được nhưng ném exception lúc gọi move()',
        'Lỗi biên dịch, Duck phải override move() và có thể chọn Flyer.super.move()',
        'Biên dịch được, Duck.move() trả về "bơi" vì Swimmer được khai báo sau',
      ],
      answer: 2,
      explanation:
        'Khi hai interface cung cấp default method trùng chữ ký, compiler buộc class phải override để giải quyết xung đột. Trong method override có thể gọi Flyer.super.move() hoặc Swimmer.super.move().',
    },
    {
      question:
        'Với sealed interface Shape permits Circle, Square, switch (shape) có thứ tự: case Circle c -> ...; case Square s -> ...; case Square s when s.side() > 10 -> ...; Điều gì xảy ra?',
      options: [
        'Lỗi biên dịch vì nhánh có guard when bị nhánh Square s phía trước che mất (dominated)',
        'Biên dịch được, nhánh có when chỉ chạy khi side lớn hơn 10',
        'Biên dịch được nhưng bắt buộc phải thêm nhánh default',
        'Biên dịch được, nhưng ném MatchException khi side lớn hơn 10',
      ],
      answer: 0,
      explanation:
        'Nhánh case Square s không có guard đã khớp mọi Square, nên nhánh có when phía sau không bao giờ đạt tới và compiler báo lỗi. Cần đặt nhánh có guard trước nhánh không guard.',
    },
    {
      question:
        'Class Square extends Rectangle, trong đó setWidth() của Square tự đổi cả chiều cao. Code đang dùng Rectangle bỗng tính sai diện tích khi nhận Square. Nguyên lý SOLID nào bị vi phạm?',
      options: [
        'Single Responsibility Principle',
        'Interface Segregation Principle',
        'Dependency Inversion Principle',
        'Liskov Substitution Principle',
      ],
      answer: 3,
      explanation:
        'LSP yêu cầu lớp con thay thế được lớp cha mà không làm sai hành vi mà code sử dụng đang kỳ vọng. Square thay đổi ngữ nghĩa của setWidth() nên không thay được Rectangle.',
    },
    {
      question:
        'Trong ứng dụng Spring Boot, bạn cần một RateLimiter duy nhất dùng chung cho toàn ứng dụng và dễ thay bằng mock khi test. Cách làm hợp lý nhất là gì?',
      options: [
        'Khai báo RateLimiter là bean Spring (scope mặc định singleton) và inject qua constructor',
        'Viết Singleton với static getInstance() và gọi trực tiếp ở mọi nơi cần dùng',
        'Dùng enum singleton và truy cập RateLimiter.INSTANCE trong từng service',
        'Tạo RateLimiter mới bằng new trong mỗi method cần giới hạn tốc độ',
      ],
      answer: 0,
      explanation:
        'Bean Spring mặc định đã là một instance trong container, và constructor injection cho phép thay bằng mock khi test. Singleton tự viết hay enum là trạng thái toàn cục, che giấu phụ thuộc và khó mock.',
    },
  ],

  'collections-streams': [
    {
      question:
        'Kết quả của Stream.of("an", "binh", "an").collect(Collectors.toMap(s -> s, String::length)) là gì?',
      options: [
        'Map {an=2, binh=4}, giá trị trùng được bỏ qua',
        'Map {an=4, binh=4}, giá trị sau ghi đè giá trị trước',
        'Ném IllegalStateException vì key "an" bị trùng',
        'Lỗi biên dịch vì thiếu tham số merge function',
      ],
      answer: 2,
      explanation:
        'toMap không có merge function sẽ ném IllegalStateException khi gặp key trùng. Muốn giữ một giá trị, hãy truyền thêm merge function, ví dụ (a, b) -> a.',
    },
    {
      question:
        'Một object được put vào HashMap làm key, sau đó code đổi giá trị một field tham gia vào hashCode() của nó. Gọi map.get(key) với chính object đó thường cho kết quả gì?',
      options: [
        'Trả về value đúng vì HashMap so sánh bằng tham chiếu',
        'Ném ConcurrentModificationException',
        'HashMap tự rehash key và trả về value đúng',
        'Trả về null dù entry vẫn nằm trong map',
      ],
      answer: 3,
      explanation:
        'Entry vẫn nằm ở bucket tính theo hashCode cũ, còn get() tìm ở bucket theo hashCode mới nên không thấy. Vì vậy key của HashMap nên là object bất biến.',
    },
    {
      question:
        'Bạn viết method addRange(target, from, to) để ghi thêm các số Integer vào một list. Kiểu tham số nào linh hoạt nhất mà vẫn an toàn kiểu?',
      options: [
        'List<? super Integer> target',
        'List<? extends Integer> target',
        'List<Integer> target',
        'List<? extends Number> target',
      ],
      answer: 0,
      explanation:
        'Theo PECS, list nhận dữ liệu ghi vào là consumer nên dùng ? super Integer, chấp nhận List<Integer>, List<Number>, List<Object>. Với ? extends, compiler không cho add phần tử.',
    },
    {
      question:
        'CLI thư viện cần tra cứu sách theo ISBN nhanh và liệt kê sách theo đúng thứ tự đã nhập. Cấu trúc nào phù hợp nhất?',
      options: [
        'TreeMap<String, Book> vì luôn giữ thứ tự',
        'LinkedHashMap<String, Book> vì tra cứu O(1) và giữ thứ tự chèn',
        'ArrayList<Book> và dùng stream().filter() mỗi lần tra cứu',
        'HashMap<String, Book> vì duyệt theo thứ tự chèn',
      ],
      answer: 1,
      explanation:
        'LinkedHashMap có tra cứu O(1) trung bình như HashMap và duy trì thứ tự chèn. TreeMap sắp theo key (ISBN) chứ không theo thứ tự nhập, còn HashMap không đảm bảo thứ tự.',
    },
    {
      question:
        'Optional<Integer> opt = Optional.of(5); int v = opt.orElse(loadFromDb()); Method loadFromDb() có được gọi không?',
      options: [
        'Không, vì opt đã có giá trị nên orElse bỏ qua tham số',
        'Chỉ được gọi khi chạy trong parallel stream',
        'Có, tham số của orElse luôn được tính trước khi gọi method',
        'Không, JIT tự loại bỏ lời gọi không cần thiết',
      ],
      answer: 2,
      explanation:
        'Java tính giá trị tham số trước khi gọi orElse, nên loadFromDb() luôn chạy. Dùng orElseGet(this::loadFromDb) để chỉ gọi khi Optional rỗng.',
    },
  ],

  concurrency: [
    {
      question:
        'Cho private volatile int count; void inc() { count++; }. 10 thread, mỗi thread gọi inc() 1.000 lần. Giá trị cuối của count là gì?',
      options: [
        'Luôn đúng 10.000 vì volatile đảm bảo an toàn luồng',
        'Luôn bằng 1.000 vì mỗi thread có bản sao riêng',
        'Có thể nhỏ hơn 10.000 vì count++ không phải thao tác atomic',
        'Không biên dịch được vì volatile không dùng với int',
      ],
      answer: 2,
      explanation:
        'volatile chỉ đảm bảo visibility và thứ tự, còn count++ gồm đọc, cộng, ghi nên vẫn có thể mất cập nhật. Dùng AtomicInteger, LongAdder hoặc khoá để sửa.',
    },
    {
      question:
        'new ThreadPoolExecutor(4, 16, 60, SECONDS, new LinkedBlockingQueue<>()) nhận rất nhiều task cùng lúc. Pool sẽ có tối đa bao nhiêu thread?',
      options: [
        '4 thread, vì hàng đợi không giới hạn nên không bao giờ đầy để tạo thêm thread',
        '16 thread, vì pool tự mở rộng khi có nhiều task',
        'Số thread bằng số task đang chờ',
        '16 thread, sau 60 giây giảm về 4',
      ],
      answer: 0,
      explanation:
        'ThreadPoolExecutor chỉ tạo thêm thread vượt core khi hàng đợi đã đầy. Với LinkedBlockingQueue không giới hạn, hàng đợi không bao giờ đầy nên maximumPoolSize không có tác dụng.',
    },
    {
      question:
        'Một service gọi CompletableFuture.supplyAsync(() -> httpClient.callSlowApi()) mà không truyền executor, dưới tải cao toàn ứng dụng chậm hẳn. Nguyên nhân khả dĩ nhất là gì?',
      options: [
        'supplyAsync luôn chạy đồng bộ trên thread gọi',
        'CompletableFuture không hỗ trợ tác vụ I/O',
        'Mỗi lần gọi supplyAsync tạo một platform thread mới',
        'Các lời gọi blocking chiếm hết ForkJoinPool.commonPool vốn được dùng chung',
      ],
      answer: 3,
      explanation:
        'Không có executor, supplyAsync dùng commonPool có số thread xấp xỉ số core và dùng chung với parallel stream. I/O blocking làm cạn pool này; nên truyền executor riêng cho I/O.',
    },
    {
      question:
        'Trên Java 21, code chạy trong virtual thread gọi HTTP blocking bên trong khối synchronized. Điều gì xảy ra và nên sửa thế nào?',
      options: [
        'Virtual thread tự chuyển thành platform thread mới nên không cần sửa gì',
        'Virtual thread bị ghim (pinned) vào carrier; nên chuyển sang ReentrantLock',
        'JVM ném IllegalStateException vì virtual thread cấm dùng synchronized',
        'Khối synchronized bị bỏ qua nên mất an toàn luồng; nên dùng volatile',
      ],
      answer: 1,
      explanation:
        'Trên Java 21, block bên trong synchronized làm virtual thread không unmount được khỏi carrier. ReentrantLock tránh được pinning; JDK 24 (JEP 491) đã khắc phục vấn đề này với synchronized.',
    },
    {
      question:
        'Thread A chuyển tiền X sang Y (khoá X rồi Y), đồng thời thread B chuyển Y sang X (khoá Y rồi X), đôi khi cả hai treo vĩnh viễn. Cách sửa tốt nhất là gì?',
      options: [
        'Đánh dấu hai field số dư là volatile',
        'Tăng số thread trong pool để có thread khác xử lý',
        'Luôn khoá hai tài khoản theo một thứ tự cố định, ví dụ theo id tăng dần',
        'Gọi Thread.sleep() ngắn trước khi lấy khoá thứ hai',
      ],
      answer: 2,
      explanation:
        'Deadlock xảy ra do vòng chờ khi hai thread lấy khoá theo thứ tự ngược nhau. Khoá theo thứ tự toàn cục loại bỏ vòng chờ; sleep chỉ làm lỗi khó tái hiện hơn.',
    },
  ],

  jvm: [
    {
      question:
        'GC log lặp lại nhiều dòng dạng: Pause Full (G1 Compaction Pause) 510M->498M(512M) 812.554ms. Kết luận hợp lý nhất là gì?',
      options: [
        'GC hoạt động tốt vì pause dưới 1 giây',
        'Heap gần như đầy dữ liệu còn sống: heap quá nhỏ hoặc có memory leak',
        'Ứng dụng tạo quá nhiều thread nên thiếu stack',
        'Metaspace đầy do nạp quá nhiều class',
      ],
      answer: 1,
      explanation:
        'Full GC lâu mà chỉ thu hồi khoảng 12 MB nghĩa là phần lớn heap vẫn được tham chiếu. Cần lấy heap dump để tìm object giữ bộ nhớ hoặc xem lại kích thước heap.',
    },
    {
      question:
        'Ứng dụng trên app server bị OutOfMemoryError: Metaspace sau nhiều lần redeploy mà không restart JVM. Nguyên nhân thường gặp nhất là gì?',
      options: [
        'Heap quá nhỏ so với lượng object nghiệp vụ',
        'Đệ quy quá sâu trong một request',
        'Rò rỉ classloader khiến class của các bản deploy cũ không được giải phóng',
        'Quá nhiều direct ByteBuffer được cấp phát',
      ],
      answer: 2,
      explanation:
        'Metaspace lưu metadata class. Nếu còn tham chiếu tới classloader cũ (thread, static field, driver đăng ký), class của các bản cũ không được thu hồi và Metaspace tăng mãi.',
    },
    {
      question:
        'Service production thỉnh thoảng chậm. Bạn cần dữ liệu CPU, cấp phát bộ nhớ và lock trong 60 giây, overhead thấp và không restart. Lựa chọn phù hợp nhất là gì?',
      options: [
        'jcmd <pid> JFR.start duration=60s filename=/tmp/rec.jfr rồi mở bằng JDK Mission Control',
        'jcmd <pid> GC.heap_dump /tmp/heap.hprof rồi phân tích bằng Eclipse MAT',
        'Khởi động lại với -Xlog:gc* và chờ sự cố lặp lại',
        'Chạy jmap -histo <pid> mỗi giây trong 60 giây',
      ],
      answer: 0,
      explanation:
        'JFR gắn được vào process đang chạy, ghi sự kiện CPU, cấp phát, lock với overhead thấp. Heap dump chỉ là ảnh chụp bộ nhớ và làm dừng ứng dụng, còn GC log không cho biết method nào tốn CPU.',
    },
    {
      question:
        'Benchmark JMH sau cho thời gian gần như bằng 0: @Benchmark public void log() { Math.log(x); } với x là field của @State. Nguyên nhân và cách sửa?',
      options: [
        'Thiếu @Warmup nên JMH bỏ qua phép đo; cần thêm @Warmup',
        'Math.log là native nên JMH không đo được; cần tự viết hàm log',
        'Field x phải là static; cần đổi sang static final',
        'JIT loại bỏ phép tính vì kết quả không được dùng; cần return kết quả hoặc đưa vào Blackhole',
      ],
      answer: 3,
      explanation:
        'Đây là dead code elimination: kết quả bị bỏ đi nên JIT xoá luôn phép tính. Trả về giá trị từ method benchmark hoặc gọi blackhole.consume() để JMH tiêu thụ kết quả.',
    },
    {
      question:
        'Một batch job chạy ban đêm xử lý dữ liệu lớn, chỉ quan tâm tổng thời gian hoàn thành, không quan tâm pause từng lần. GC nào phù hợp nhất?',
      options: [
        'ZGC, vì pause dưới mili-giây',
        'Shenandoah, vì nén heap đồng thời',
        'Parallel GC, vì tối ưu throughput',
        'Serial GC, vì chỉ dùng một thread GC',
      ],
      answer: 2,
      explanation:
        'Parallel GC dùng nhiều thread và stop-the-world để đạt throughput cao nhất, rất hợp batch job. ZGC và Shenandoah đổi một phần throughput và CPU lấy pause thấp, điều mà batch job không cần.',
    },
  ],

  'build-test': [
    {
      question: 'Chạy mvn package trên project Maven chuẩn có chạy unit test không?',
      options: [
        'Không, test chỉ chạy khi gọi mvn test',
        'Chỉ chạy nếu khai báo plugin Failsafe',
        'Không, package chỉ đóng gói class đã biên dịch sẵn',
        'Có, vì phase test nằm trước package trong default lifecycle',
      ],
      answer: 3,
      explanation:
        'Chạy một phase sẽ chạy mọi phase trước nó trong cùng lifecycle, gồm compile, test-compile và test. Muốn bỏ qua phải chủ động dùng cờ như -DskipTests.',
    },
    {
      question:
        'Module domain trong Gradle dùng Jackson bên trong, nhưng không có kiểu nào của Jackson xuất hiện trong API công khai. Nên khai báo dependency thế nào?',
      options: [
        'implementation, để Jackson không lộ ra classpath biên dịch của module phụ thuộc',
        'api, để mọi module phụ thuộc đều dùng được Jackson',
        'compileOnly, vì chỉ cần lúc biên dịch',
        'testImplementation, vì chỉ test mới cần JSON',
      ],
      answer: 0,
      explanation:
        'implementation giữ dependency là chi tiết nội bộ, giảm biên dịch lại dây chuyền. api chỉ dùng khi kiểu của thư viện xuất hiện trong API công khai; compileOnly sẽ thiếu Jackson lúc chạy.',
    },
    {
      question:
        'Test có @ParameterizedTest và @CsvSource({"1, 5000", "3, 15000", "45, 100000"}) trên method void fee(int days, long expected). Khi chạy điều gì xảy ra?',
      options: [
        'Chạy 1 lần với dòng CSV đầu tiên',
        'Chạy 3 lần, mỗi dòng CSV được chuyển thành int và long tương ứng',
        'Lỗi vì @CsvSource chỉ truyền được tham số kiểu String',
        'Chạy 6 lần, mỗi giá trị trong CSV là một lần',
      ],
      answer: 1,
      explanation:
        'Mỗi dòng của @CsvSource là một lần gọi, các cột được JUnit tự chuyển kiểu sang tham số tương ứng. Tên hiển thị có thể tuỳ biến bằng thuộc tính name.',
    },
    {
      question:
        'Đoạn verify(notifier).send(eq("member-42"), "Effective Java"); trong test Mockito cho kết quả gì?',
      options: [
        'Pass nếu send được gọi đúng hai tham số đó',
        'Pass mọi lúc vì eq() khớp mọi giá trị',
        'Lỗi biên dịch vì verify không nhận eq()',
        'Mockito báo lỗi dùng sai matcher vì trộn matcher với giá trị thường',
      ],
      answer: 3,
      explanation:
        'Khi một tham số dùng argument matcher thì mọi tham số của lời gọi đó phải là matcher. Sửa bằng eq("Effective Java") hoặc bỏ eq() ở cả hai tham số.',
    },
    {
      question: 'Trong chu trình TDD, ở bước Green bạn nên làm gì?',
      options: [
        'Viết thêm nhiều test cho mọi trường hợp biên',
        'Thiết kế lại toàn bộ class cho sạch trước khi chạy test',
        'Viết lượng code tối thiểu để test đang đỏ chuyển sang xanh',
        'Tăng ngưỡng coverage JaCoCo lên 100%',
      ],
      answer: 2,
      explanation:
        'Green chỉ nhằm làm test pass nhanh nhất có thể; việc dọn dẹp thiết kế để dành cho bước Refactor khi đã có test xanh bảo vệ.',
    },
  ],
};

export default quiz;
