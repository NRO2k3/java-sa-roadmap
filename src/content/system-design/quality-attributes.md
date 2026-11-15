Hiếm có hệ thống nào thất bại vì thiếu một nút bấm. Chúng thất bại vì chậm đúng ngày khuyến mãi, sập khi database failover, hoặc mất ba tháng để thêm một phương thức thanh toán. Đó là các **yêu cầu phi chức năng** (non-functional requirement, NFR), hay còn gọi là **thuộc tính chất lượng** (quality attribute), và chúng quyết định hình dạng kiến trúc nhiều hơn danh sách tính năng. Việc của Solution Architect là biến những câu mơ hồ như "hệ thống phải nhanh và ổn định" thành con số đo được, tính được chi phí, và kiểm chứng được bằng kiểm thử tải.

## Mục tiêu bài học

- Liệt kê các thuộc tính chất lượng chính và nhận ra chỗ chúng xung đột với nhau.
- Viết yêu cầu phi chức năng dưới dạng quality attribute scenario sáu phần, đo lường được.
- Tính availability của hệ thống gồm nhiều thành phần nối tiếp và song song, hiểu chi phí của mỗi "số 9".
- Ước lượng nhanh QPS, dung lượng lưu trữ, băng thông và mức đồng thời (back-of-the-envelope).
- Thiết kế và chạy kiểm thử tải bằng Gatling hoặc k6 theo mô hình tải phù hợp.

## Thuộc tính chất lượng là gì

Các thuộc tính thường gặp:

| Thuộc tính | Câu hỏi cốt lõi |
|---|---|
| Performance | Phản hồi nhanh đến đâu (độ trễ theo percentile), xử lý được bao nhiêu (throughput)? |
| Scalability | Khi tải tăng gấp 10, thêm tài nguyên có giữ được hiệu năng không? |
| Availability | Hệ thống dùng được bao nhiêu phần trăm thời gian hoặc bao nhiêu phần trăm request? |
| Reliability / Durability | Có xử lý đúng và không mất dữ liệu khi có sự cố không? |
| Modifiability / Maintainability | Thêm hoặc sửa một tính năng tốn bao nhiêu công sức và rủi ro? |
| Security | Ngăn chặn, phát hiện và phục hồi trước tấn công thế nào? |
| Observability | Có chẩn đoán được sự cố chỉ từ dữ liệu hệ thống phát ra không? |
| Deployability / Testability | Đưa thay đổi lên production nhanh và an toàn đến đâu? |
| Cost | Chi phí hạ tầng và vận hành có tương xứng với giá trị không? |

ISO/IEC 25010 là một bộ phân loại chuẩn hay được dùng để rà soát cho đủ. Điều quan trọng là các thuộc tính **xung đột** nhau: mã hoá và kiểm tra quyền làm tăng độ trễ; nhất quán mạnh làm giảm availability khi có phân vùng mạng; thêm một "số 9" làm tăng chi phí. Vì vậy không thể tối đa mọi thứ, phải **ưu tiên**.

## Lượng hoá bằng quality attribute scenario

"Hệ thống phải nhanh" không kiểm chứng được. Phương pháp của SEI (trong cuốn *Software Architecture in Practice*) mô tả mỗi yêu cầu bằng một **kịch bản sáu phần**:

| Phần | Ý nghĩa | Ví dụ (performance) |
|---|---|---|
| Source | Ai hoặc cái gì tạo ra kích thích | Người dùng trên app di động |
| Stimulus | Sự kiện xảy ra | Gửi yêu cầu thanh toán đơn hàng |
| Artifact | Phần hệ thống bị tác động | Checkout API |
| Environment | Điều kiện lúc đó | Giờ cao điểm, 2.000 request/giây |
| Response | Hệ thống phản ứng thế nào | Xử lý và trả kết quả |
| Response measure | Thước đo kiểm chứng được | p99 dưới 800ms, tỉ lệ lỗi dưới 0,1% |

Thêm hai ví dụ:

- **Availability:** khi một node database primary bị hỏng phần cứng (stimulus) trong giờ làm việc bình thường (environment), hệ thống tự chuyển sang standby (response), checkout gián đoạn không quá 60 giây và không mất giao dịch đã xác nhận (measure).
- **Modifiability:** khi doanh nghiệp yêu cầu thêm một ví điện tử mới (stimulus) vào module thanh toán (artifact), một dev hoàn thành và đưa lên production trong vòng 5 ngày làm việc mà không sửa code của module đơn hàng (measure).

Khi có nhiều kịch bản, sắp xếp chúng vào **utility tree** (cây tiện ích, dùng trong phương pháp đánh giá ATAM): mỗi kịch bản được chấm mức quan trọng với nghiệp vụ và độ khó kỹ thuật (Cao/Trung bình/Thấp). Các kịch bản (Cao, Cao) là nơi kiến trúc phải tập trung. Hãy dùng **percentile** (p95, p99) thay vì trung bình, vì trung bình che giấu phần đuôi chậm mà nhiều người dùng thực sự gặp phải.

## Availability và cái giá của các "số 9"

### Cách tính

Availability có thể đo theo thời gian (thời gian hoạt động / tổng thời gian) hoặc theo request (request thành công / tổng request hợp lệ). Một công thức hữu ích:

```text
Availability = MTBF / (MTBF + MTTR)
MTBF: thời gian trung bình giữa hai lần hỏng; MTTR: thời gian trung bình để khôi phục
```

Công thức cho thấy **giảm MTTR** (phát hiện nhanh, rollback tự động, failover tự động) thường rẻ hơn cố tăng MTBF.

| Availability | Downtime tối đa mỗi năm | Mỗi tháng (30 ngày) |
|---|---|---|
| 99% | ~3,65 ngày | ~7,2 giờ |
| 99,9% | ~8,76 giờ | ~43,2 phút |
| 99,95% | ~4,38 giờ | ~21,6 phút |
| 99,99% | ~52,6 phút | ~4,3 phút |
| 99,999% | ~5,3 phút | ~26 giây |

### Thành phần nối tiếp và song song

Khi một request phải đi qua **tất cả** thành phần (nối tiếp), availability nhân với nhau, nên luôn thấp hơn thành phần yếu nhất:

```text
Nối tiếp:  A = A1 × A2 × ... × An
  Load balancer 99,99% × App 99,95% × Database 99,95%
  = 0,9999 × 0,9995 × 0,9995 ≈ 0,9989  -> khoảng 99,89%

Song song (chỉ cần 1 trong n hoạt động):  A = 1 - (1 - A1)^n
  Hai instance app, mỗi instance 99,5%:  1 - 0,005² = 0,999975 -> khoảng 99,9975%
```

> **Lưu ý:** Công thức song song giả định các bản sao **hỏng độc lập**. Thực tế chúng thường hỏng cùng lúc: cùng một availability zone, cùng một bản deploy lỗi, cùng một thay đổi cấu hình. Vì vậy cần phân tán qua nhiều zone, deploy kiểu canary và không đẩy cấu hình đồng loạt.

Hệ quả quan trọng: bạn không thể cam kết availability cao hơn một phụ thuộc bắt buộc nằm nối tiếp (ví dụ cổng thanh toán 99,9%), trừ khi có đường thay thế (cổng dự phòng, xử lý sau qua hàng đợi).

### Mỗi số 9 tốn thêm những gì

- **99%:** một instance, khôi phục thủ công là chấp nhận được.
- **99,9%:** nhiều instance sau load balancer, database có failover tự động trong một region (multi-AZ), health check, rolling deploy, có người trực khi có sự cố.
- **99,99%:** chỉ khoảng 4 phút mỗi tháng, nghĩa là con người không kịp tham gia khôi phục; mọi thứ phải tự động: failover, rollback, deploy không downtime kể cả migration schema, canary, trực 24/7 với runbook đã diễn tập, mọi phụ thuộc cũng phải đạt mức tương ứng.
- **99,999%:** thường đòi hỏi multi-region active-active, chấp nhận đánh đổi về nhất quán dữ liệu, chi phí và độ phức tạp tăng vọt.

Chi phí tăng phi tuyến theo số chữ số 9, vì vậy mức availability phải xuất phát từ thiệt hại nghiệp vụ khi ngừng hoạt động, và có thể khác nhau giữa các chức năng: checkout cần 99,95%, trang báo cáo nội bộ 99% là đủ. Cũng cần phân biệt với **RTO** (thời gian khôi phục tối đa) và **RPO** (lượng dữ liệu tối đa được phép mất) trong kế hoạch phục hồi thảm hoạ.

## Ước lượng tải nhanh (back-of-the-envelope)

Mục tiêu không phải con số chính xác mà là **bậc độ lớn** (order of magnitude), đủ để trả lời: một database có gánh nổi không, có cần cache không, có cần sharding không. Các con số nên thuộc:

```text
1 ngày   = 86.400 giây  ≈ 10^5 giây
1 tháng  ≈ 2,6 × 10^6 giây
1 năm    ≈ 3,15 × 10^7 giây
2^10 ≈ 10^3 (KB)   2^20 ≈ 10^6 (MB)   2^30 ≈ 10^9 (GB)   2^40 ≈ 10^12 (TB)

Bậc độ lớn của độ trễ (xấp xỉ):
  đọc RAM ................. khoảng trăm nano giây
  đọc ngẫu nhiên SSD ...... khoảng chục đến trăm micro giây
  round trip trong 1 DC ... dưới 1 mili giây
  seek ổ HDD .............. khoảng 10 mili giây
  round trip liên lục địa . khoảng trăm mili giây
```

Các công thức cơ bản:

- QPS trung bình = số người dùng hoạt động mỗi ngày (DAU) × số thao tác mỗi người mỗi ngày / 86.400.
- QPS đỉnh = QPS trung bình × hệ số đỉnh (giả định phổ biến là 2 đến 3 lần; sự kiện khuyến mãi có thể cao hơn nhiều, hãy hỏi số liệu thật).
- Lưu trữ = số bản ghi mới mỗi ngày × kích thước × thời gian lưu × hệ số replicate.
- Băng thông = QPS × kích thước payload.
- Số request đồng thời (định luật Little) = throughput × độ trễ.

Ví dụ: ứng dụng đọc tin tức có 5 triệu DAU, mỗi người đọc 20 bài và viết 1 bình luận mỗi ngày.

```text
Đọc:   5.000.000 × 20 = 100 triệu/ngày  / 86.400 ≈ 1.200 QPS; đỉnh (×3) ≈ 3.600 QPS
Ghi:   5.000.000 × 1  = 5 triệu/ngày    / 86.400 ≈ 60 QPS;    đỉnh ≈ 180 QPS
Lưu:   5 triệu × 1 KB = 5 GB/ngày ≈ 1,8 TB/năm; giữ 3 năm ≈ 5,5 TB; replicate ×3 ≈ 16 TB
Băng thông ra lúc đỉnh: 3.600 × 20 KB ≈ 72 MB/s ≈ 580 Mbps
Đồng thời: 3.600 request/s × 0,05 s ≈ 180 request đang xử lý cùng lúc

Kết luận: đọc gấp 20 lần ghi -> ưu tiên cache và CDN; lượng ghi nhỏ -> một primary DB đủ;
dữ liệu tăng đều -> phân vùng theo thời gian, lưu trữ dữ liệu cũ sang tầng rẻ hơn.
```

Luôn ghi rõ giả định và làm tròn mạnh tay. Nếu một giả định thay đổi kết luận (ví dụ tỉ lệ đọc/ghi), hãy hỏi lại người nắm số liệu thay vì đoán.

## Kiểm thử tải với Gatling và k6

### Các loại kiểm thử

- **Load test:** chạy ở mức tải đỉnh dự kiến để xác nhận đạt NFR.
- **Stress test:** tăng vượt ngưỡng để tìm điểm gãy và xem hệ thống hỏng thế nào (có hồi phục khi tải giảm không).
- **Spike test:** tải tăng đột ngột, ví dụ lúc mở bán, để kiểm tra autoscaling và hàng đợi.
- **Soak (endurance) test:** chạy nhiều giờ ở mức tải vừa để phát hiện rò rỉ bộ nhớ, connection, tăng dần độ trễ.

### Mô hình tải mở và đóng

- **Mô hình đóng (closed):** số người dùng ảo cố định, mỗi người gửi request tiếp theo khi nhận được phản hồi. Khi hệ thống chậm đi, tải tự giảm theo, che giấu vấn đề (hiện tượng coordinated omission).
- **Mô hình mở (open):** request đến theo tốc độ định trước, không phụ thuộc hệ thống phản hồi nhanh hay chậm, giống traffic Internet thật. Với API công khai, hãy dùng mô hình mở.

Trong Gatling, `injectOpen` là mô hình mở và `injectClosed` là mô hình đóng. Trong k6, executor `constant-arrival-rate`, `ramping-arrival-rate` là mô hình mở; `constant-vus`, `ramping-vus` là mô hình đóng.

```java
public class CheckoutSimulation extends Simulation {

    HttpProtocolBuilder httpProtocol = http
            .baseUrl("http://localhost:8080")
            .acceptHeader("application/json")
            .contentTypeHeader("application/json");

    ScenarioBuilder browseAndOrder = scenario("Xem sản phẩm rồi đặt hàng")
            .exec(http("danh sách sản phẩm").get("/api/products").check(status().is(200)))
            .pause(1, 3)                                    // người dùng dừng 1 đến 3 giây
            .exec(http("đặt hàng")
                    .post("/api/orders")
                    .body(StringBody("{\"sku\":\"SKU-1\",\"quantity\":1}"))
                    .check(status().is(201)));

    {
        setUp(browseAndOrder.injectOpen(
                        rampUsersPerSec(5).to(100).during(Duration.ofMinutes(5)),   // khởi động dần
                        constantUsersPerSec(100).during(Duration.ofMinutes(10))))   // giữ ở mức đỉnh
                .protocols(httpProtocol)
                .assertions(
                        global().responseTime().percentile(99.0).lt(800),
                        global().failedRequests().percent().lt(1.0));
    }
}
```

Với k6, kịch bản viết bằng JavaScript; ngưỡng (threshold) khiến lệnh `k6 run` trả mã lỗi khi không đạt, nên dễ đưa vào CI:

```text
// checkout-test.js
import http from 'k6/http';
import { check } from 'k6';

export const options = {
  scenarios: {
    checkout: {
      executor: 'ramping-arrival-rate',          // mô hình mở
      startRate: 10, timeUnit: '1s', preAllocatedVUs: 200,
      stages: [
        { target: 200, duration: '5m' },         // tăng dần tới 200 request/giây
        { target: 200, duration: '10m' },        // giữ ở đỉnh
      ],
    },
  },
  thresholds: {
    http_req_failed: ['rate<0.01'],              // dưới 1% lỗi
    http_req_duration: ['p(99)<800'],            // p99 dưới 800 ms
  },
};

export default function () {
  const res = http.post('http://localhost:8080/api/orders',
    JSON.stringify({ sku: 'SKU-1', quantity: 1 }),
    { headers: { 'Content-Type': 'application/json' } });
  check(res, { 'tạo đơn thành công': (r) => r.status === 201 });
}
```

### Quy trình và cách đọc kết quả

1. Lấy mục tiêu từ quality attribute scenario (tải, percentile, tỉ lệ lỗi).
2. Dùng môi trường và **khối lượng dữ liệu** gần với production; database 1.000 dòng cho kết quả vô nghĩa.
3. Khởi động (warm-up) trước khi đo để JIT của JVM tối ưu xong và cache được nạp.
4. Quan sát phía server trong lúc chạy: CPU, GC, connection pool, thread pool, độ trễ database, trace của request chậm.
5. Khi throughput ngừng tăng trong lúc độ trễ tăng vọt, hệ thống đã bão hoà; tìm tài nguyên bị bão hoà đầu tiên, sửa, rồi chạy lại.
6. Đưa một bài test tải nhỏ vào CI để phát hiện suy giảm hiệu năng (performance regression) sớm.

## Lỗi thường gặp

- **NFR mơ hồ** như "nhanh", "chịu tải cao", "luôn sẵn sàng". Cách sửa: viết kịch bản sáu phần với thước đo cụ thể và điều kiện môi trường.
- **Đặt mục tiêu theo độ trễ trung bình.** Trung bình 200ms vẫn có thể có p99 là 5 giây. Cách sửa: dùng p95/p99 và tỉ lệ lỗi.
- **Yêu cầu 99,99% cho mọi chức năng** mà không tính chi phí hay availability của phụ thuộc. Cách sửa: đặt mức theo thiệt hại nghiệp vụ, tính availability nối tiếp của cả chuỗi phụ thuộc.
- **Ước lượng chỉ dùng số trung bình**, quên đỉnh tải, tăng trưởng và hệ số replicate. Cách sửa: luôn tính đỉnh và dự phóng 1 đến 3 năm.
- **Kiểm thử tải bằng mô hình đóng có think time** cho API công khai, hoặc chạy từ một máy tạo tải bị nghẽn trước cả hệ thống. Cách sửa: dùng mô hình mở, theo dõi tài nguyên của máy tạo tải, phân tán máy tạo tải khi cần.
- **Load test xong chỉ nhìn báo cáo của công cụ.** Cách sửa: kết hợp metrics và traces phía server để tìm nguyên nhân, không chỉ triệu chứng.
- **Bắn tải vào API production của bên thứ ba.** Cách sửa: dùng stub hoặc sandbox của đối tác.

## Bài tập thực hành

1. **Kịch bản chất lượng:** viết năm quality attribute scenario đầy đủ sáu phần cho hệ thống đặt vé xem phim (performance khi mở bán, availability khi mất một zone, scalability, security khi bị dò mật khẩu hàng loạt, modifiability khi thêm rạp đối tác). Sắp xếp vào utility tree và chọn ra hai kịch bản ưu tiên nhất.
2. **Tính availability:** một luồng thanh toán đi qua CDN (99,99%), load balancer (99,99%), hai instance ứng dụng chạy song song (mỗi instance 99,5%), database managed (99,95%) và cổng thanh toán (99,9%). Tính availability tổng, chỉ ra mắt xích yếu nhất và đề xuất hai thay đổi để đạt 99,9%.
3. **Ước lượng và kiểm thử tải:** ước lượng QPS đỉnh, dung lượng lưu trữ một năm và băng thông cho dịch vụ chat 1–1 với 10 triệu DAU, mỗi người gửi 40 tin nhắn 200 byte mỗi ngày. Sau đó viết kịch bản Gatling hoặc k6 cho endpoint gửi tin nhắn, chạy cả mô hình đóng và mở, so sánh p99 và giải thích sự khác biệt.

## Tóm tắt

- Thuộc tính chất lượng quyết định kiến trúc; chúng xung đột nhau nên phải ưu tiên, không thể tối đa tất cả.
- Quality attribute scenario gồm source, stimulus, artifact, environment, response và response measure; utility tree giúp chọn kịch bản quan trọng nhất.
- Availability nối tiếp bằng tích các thành phần; song song tăng availability nhưng chỉ khi các bản sao hỏng độc lập.
- Mỗi số 9 thêm vào đòi hỏi tự động hoá, dự phòng và chi phí tăng phi tuyến; giảm MTTR thường là đòn bẩy rẻ nhất.
- Back-of-the-envelope dùng bậc độ lớn: 1 ngày ≈ 10^5 giây, tính QPS trung bình, đỉnh, lưu trữ, băng thông và mức đồng thời theo định luật Little.
- Kiểm thử tải nên dùng mô hình mở cho API công khai, đo bằng percentile, chạy trên dữ liệu giống production và quan sát phía server.
