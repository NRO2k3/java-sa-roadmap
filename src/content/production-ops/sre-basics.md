"Hệ thống có ổn định không?" và "team có deliver nhanh không?" là hai câu hỏi mà Dev Lead bị hỏi thường xuyên, và câu trả lời "em thấy cũng ổn" không thuyết phục được ai. Site Reliability Engineering (SRE), cách tiếp cận vận hành do Google khởi xướng, cho ta công cụ để trả lời câu hỏi thứ nhất bằng số liệu: SLI, SLO và error budget. Nghiên cứu của DORA cho ta bốn chỉ số để trả lời câu hỏi thứ hai. Bài này giúp bạn định nghĩa và đo các chỉ số đó cho team, dùng chúng để ra quyết định, và giảm phần việc vận hành lặp lại (toil) bằng tự động hoá.

## Mục tiêu bài học

- Định nghĩa SLI, SLO cho một service và phân biệt chúng với SLA.
- Tính error budget, burn rate và dùng chúng để cân bằng giữa tốc độ và độ ổn định.
- Đo bốn chỉ số DORA từ dữ liệu của pipeline và hệ thống quản lý sự cố.
- Nhận diện toil và ưu tiên tự động hoá để giảm nó.

## SLI, SLO và SLA

### SLI: đo điều người dùng quan tâm

**SLI** (Service Level Indicator) là một chỉ số đo được phản ánh chất lượng dịch vụ **từ góc nhìn người dùng**. Dạng được khuyến nghị là một **tỉ lệ**:

```text
SLI = số sự kiện tốt / số sự kiện hợp lệ   (từ 0% đến 100%)
```

Các loại SLI phổ biến:

| Loại | Sự kiện tốt (ví dụ) | Phù hợp với |
|---|---|---|
| Availability | Request trả về không phải lỗi 5xx | API, web |
| Latency | Request hoàn thành dưới 300 ms | API tương tác với người dùng |
| Freshness | Dữ liệu được cập nhật trong vòng 10 phút | Pipeline dữ liệu, báo cáo |
| Correctness | Kết quả xử lý đúng | Batch job, tính toán |

CPU 80% không phải SLI tốt: người dùng không cảm nhận CPU, họ cảm nhận request chậm hay lỗi. Hãy đo càng gần người dùng càng tốt, ví dụ tại load balancer hoặc API gateway thay vì bên trong từng service. Cũng cần định nghĩa rõ **sự kiện hợp lệ**: health check thường bị loại khỏi phép tính; lỗi 4xx do client gửi sai thường không tính là "xấu" với availability, nhưng lỗi 429 do service tự giới hạn tốc độ có thể nên tính.

Với Spring Boot và Micrometer, metric `http.server.requests` cung cấp dữ liệu cho cả hai SLI availability và latency. Để tính SLI latency theo ngưỡng, bật histogram bucket cho ngưỡng đó, ví dụ `management.metrics.distribution.slo.http.server.requests=300ms`.

### SLO: mục tiêu cho SLI

**SLO** (Service Level Objective) là mục tiêu cho một SLI trong một **cửa sổ thời gian**, ví dụ "99,9% request của API checkout thành công, tính trong 28 ngày gần nhất". Cửa sổ trượt (rolling window) phản ánh trải nghiệm gần đây tốt hơn cửa sổ theo tháng dương lịch, vốn "reset" về 0 vào đầu tháng.

Chọn SLO thế nào:

- **Không bao giờ là 100%**. Người dùng không phân biệt được 99,99% với 100% vì mạng, thiết bị của họ còn kém tin cậy hơn; mỗi số 9 thêm vào tốn chi phí tăng rất nhanh, và 100% nghĩa là không bao giờ được thay đổi gì.
- **Bắt đầu từ dữ liệu hiện tại**: nếu 3 tháng qua availability khoảng 99,95%, SLO 99,9% là điểm khởi đầu hợp lý; điều chỉnh dần theo phản hồi của người dùng.
- **Ít mà chất**: vài SLO cho các hành trình quan trọng (đăng nhập, tìm kiếm, thanh toán) hơn là hàng chục SLO không ai theo dõi.

### SLA: cam kết có hậu quả

**SLA** (Service Level Agreement) là **hợp đồng** với khách hàng, kèm hậu quả khi vi phạm (hoàn tiền, phạt). SLA thường lỏng hơn SLO nội bộ: nếu SLA cam kết 99,5%, team đặt SLO 99,9% để có khoảng đệm, phát hiện và sửa vấn đề trước khi vi phạm hợp đồng.

## Error budget

**Error budget** (ngân sách lỗi) là phần "không tin cậy" được phép trong cửa sổ SLO, bằng 100% trừ SLO. Đây là ý tưởng trung tâm của SRE: biến tranh luận "ổn định hay tính năng" thành một con số chung mà cả team sản phẩm và team kỹ thuật cùng nhìn vào.

### Tính error budget

```text
SLO availability 99,9% trong 30 ngày
Error budget = 100% - 99,9% = 0,1%

Theo thời gian:  30 ngày x 24 giờ x 60 phút = 43.200 phút
                 0,1% x 43.200 = 43,2 phút "không khả dụng" được phép

Theo request:    service nhận 20 triệu request trong 30 ngày
                 0,1% x 20.000.000 = 20.000 request lỗi được phép

Ví dụ sự cố:     bản deploy lỗi làm 30% request thất bại trong 40 phút,
                 traffic lúc đó khoảng 500 request/phút
                 -> 0,3 x 500 x 40 = 6.000 request lỗi
                 -> đã tiêu 6.000 / 20.000 = 30% error budget của 30 ngày
```

Tính theo request thường chính xác hơn tính theo thời gian, vì 10 phút sự cố lúc 3 giờ sáng ảnh hưởng ít người hơn 10 phút lúc cao điểm.

### Dùng error budget để ra quyết định

Error budget chỉ có giá trị khi team đã thống nhất trước **chính sách** (error budget policy): làm gì khi budget còn nhiều, khi sắp hết, khi đã hết. Ví dụ:

- **Còn nhiều budget**: thoải mái release, thử nghiệm, chấp nhận rủi ro hợp lý. Budget không tiêu hết không phải là thành tích; nó có thể nghĩa là team đang quá thận trọng.
- **Tiêu nhanh bất thường**: xem xét lại các thay đổi gần đây, tăng mức cẩn trọng khi release.
- **Hết budget**: tạm dừng release tính năng (trừ bản sửa lỗi và bản vá bảo mật), dồn sức cho việc nâng độ tin cậy cho đến khi SLO phục hồi.
- **Một sự cố tiêu một phần lớn budget**: bắt buộc postmortem.

Chính sách cần được Product Owner và quản lý đồng ý từ trước. Nếu không, khi budget hết, áp lực tính năng sẽ thắng và SLO chỉ còn là con số trang trí.

### Alert theo burn rate

**Burn rate** là tốc độ tiêu error budget so với tốc độ "vừa đủ". Burn rate 1 nghĩa là với tốc độ này, budget hết đúng vào cuối cửa sổ SLO; burn rate 10 nghĩa là budget hết sau một phần mười cửa sổ (với cửa sổ 30 ngày là khoảng 3 ngày).

Alert theo burn rate tốt hơn alert theo ngưỡng lỗi tức thời, vì nó gắn trực tiếp với tác động lên SLO. SRE Workbook của Google gợi ý cách tiếp cận **nhiều cửa sổ, nhiều burn rate**: với SLO 30 ngày, gọi người (page) khi tiêu 2% budget trong 1 giờ (burn rate 14,4) hoặc 5% trong 6 giờ (burn rate 6); tạo ticket khi tiêu 10% trong 3 ngày (burn rate 1). Mỗi alert kết hợp một cửa sổ dài và một cửa sổ ngắn để vừa chắc chắn, vừa tự hết khi sự cố đã được xử lý.

```yaml
groups:
  - name: checkout-slo
    rules:
      - alert: CheckoutErrorBudgetFastBurn
        # SLO 99,9% -> tỉ lệ lỗi cho phép 0,001; burn rate 14,4 trên cửa sổ 1h và 5m
        expr: |
          (
            sum(rate(http_server_requests_seconds_count{job="checkout", status=~"5.."}[1h]))
            / sum(rate(http_server_requests_seconds_count{job="checkout"}[1h]))
          ) > (14.4 * 0.001)
          and
          (
            sum(rate(http_server_requests_seconds_count{job="checkout", status=~"5.."}[5m]))
            / sum(rate(http_server_requests_seconds_count{job="checkout"}[5m]))
          ) > (14.4 * 0.001)
        labels:
          severity: page
        annotations:
          summary: "Checkout đang tiêu error budget với burn rate trên 14,4"
```

## Bốn chỉ số DORA

**DORA** (DevOps Research and Assessment) là chương trình nghiên cứu nhiều năm về hiệu quả delivery phần mềm, nay thuộc Google Cloud. Nghiên cứu của DORA dùng bốn chỉ số chính, chia thành hai nhóm:

| Nhóm | Chỉ số | Định nghĩa |
|---|---|---|
| Tốc độ (throughput) | Deployment frequency | Tần suất deploy thành công lên production |
| Tốc độ (throughput) | Lead time for changes | Thời gian từ khi code được commit đến khi chạy trên production |
| Ổn định (stability) | Change failure rate | Tỉ lệ deploy gây ra lỗi trên production cần khắc phục (rollback, hotfix, fix forward) |
| Ổn định (stability) | Time to restore service | Thời gian khôi phục dịch vụ khi có sự cố trên production |

Trong các báo cáo gần đây, DORA đổi tên chỉ số thứ tư thành **failed deployment recovery time**, tập trung vào thời gian khôi phục sau một deploy lỗi. Một phát hiện quan trọng xuyên suốt nghiên cứu của DORA là tốc độ và ổn định **không đánh đổi lẫn nhau**: các team hiệu quả nhất thường tốt ở cả hai nhóm. Deploy thường xuyên với thay đổi nhỏ giúp mỗi thay đổi ít rủi ro hơn và dễ khắc phục hơn.

### Đo DORA từ dữ liệu có sẵn

Dữ liệu cần có: sự kiện deploy từ pipeline CI/CD, commit nằm trong mỗi deploy từ Git, và sự cố được liên kết với deploy gây ra nó từ hệ thống quản lý sự cố. Với PostgreSQL, giả sử có ba bảng `deployments`, `deployment_commits` và `incidents`:

```sql
-- Deployment frequency: số lần deploy thành công mỗi tuần
SELECT date_trunc('week', deployed_at) AS week, count(*) AS deploys
FROM deployments
WHERE service = 'order-service' AND status = 'SUCCESS'
GROUP BY 1 ORDER BY 1;

-- Lead time for changes: trung vị thời gian từ commit đến production (90 ngày)
SELECT percentile_cont(0.5) WITHIN GROUP (ORDER BY d.deployed_at - c.committed_at)
       AS median_lead_time
FROM deployments d JOIN deployment_commits c ON c.deployment_id = d.id
WHERE d.status = 'SUCCESS' AND d.deployed_at >= now() - interval '90 days';

-- Change failure rate: % deploy gây ra ít nhất một sự cố
SELECT round(100.0 * count(DISTINCT i.caused_by_deployment_id) / count(DISTINCT d.id), 1)
       AS change_failure_rate_pct
FROM deployments d LEFT JOIN incidents i ON i.caused_by_deployment_id = d.id
WHERE d.status = 'SUCCESS' AND d.deployed_at >= now() - interval '90 days';

-- Time to restore: trung vị thời gian từ lúc sự cố bắt đầu đến khi khôi phục
SELECT percentile_cont(0.5) WITHIN GROUP (ORDER BY resolved_at - started_at)
       AS median_time_to_restore
FROM incidents WHERE started_at >= now() - interval '90 days';
```

Dùng **trung vị** (median) thay vì trung bình cho lead time và thời gian khôi phục, vì một vài giá trị cực lớn (PR bị bỏ quên hai tháng) sẽ kéo trung bình lệch xa. Phần khó nhất thường không phải SQL mà là **kỷ luật dữ liệu**: mọi deploy phải đi qua pipeline để được ghi lại, và mỗi postmortem phải ghi rõ sự cố có do deploy nào gây ra không.

### Dùng DORA đúng cách

- Dùng để **team tự cải thiện theo xu hướng** của chính mình, không để so sánh team này với team khác: mỗi team có bối cảnh, kiến trúc và rủi ro khác nhau.
- **Không biến thành chỉ tiêu cá nhân**. Khi một chỉ số trở thành mục tiêu, người ta sẽ tối ưu con số thay vì kết quả (định luật Goodhart): chia nhỏ deploy vô nghĩa để tăng tần suất, hay không ghi nhận sự cố để giảm change failure rate.
- **Xem bốn chỉ số cùng nhau**. Tăng tần suất deploy mà change failure rate tăng vọt là dấu hiệu đang đi quá nhanh so với khả năng test.
- Khi một chỉ số kém, tìm **điểm nghẽn** trong quy trình: lead time dài vì chờ review, vì pipeline chậm, hay vì chờ lịch release? Mỗi nguyên nhân có cách sửa khác nhau.

## Giảm toil bằng tự động hoá

**Toil** theo định nghĩa của Google SRE là công việc vận hành mang các đặc điểm: **thủ công**, **lặp đi lặp lại**, **có thể tự động hoá**, mang tính **đối phó tức thời** (tactical), **không tạo giá trị lâu dài**, và **tăng tuyến tính theo quy mô** service. Họp, lập kế hoạch hay viết tài liệu không phải toil; đó là chi phí quản lý (overhead). Google SRE đặt mục tiêu giữ toil dưới 50% thời gian của mỗi kỹ sư SRE, phần còn lại dành cho công việc kỹ thuật làm giảm toil trong tương lai.

Toil thường gặp trong team Java backend:

- Restart pod định kỳ vì "service hay bị đầy bộ nhớ sau vài ngày".
- Chạy tay câu SQL sửa dữ liệu mỗi khi CSKH yêu cầu.
- Chạy lại batch job thất bại bằng tay mỗi sáng.
- Gia hạn chứng chỉ, xoay vòng secret thủ công.
- Các bước release làm bằng tay theo tài liệu dài.

### Ưu tiên và tự động hoá

1. **Thống kê**: người trực on-call ghi lại các việc thủ công đã làm và thời gian tốn cho từng việc, trong vài tuần.
2. **Ưu tiên** theo tần suất nhân thời gian mỗi lần, cộng thêm rủi ro sai sót của thao tác tay.
3. **Chọn cách xử lý**, theo thứ tự ưu tiên:
   - **Loại bỏ nguyên nhân**: sửa memory leak thay vì tự động hoá việc restart.
   - **Tự phục vụ (self-service)**: công cụ admin nội bộ để CSKH tự xử lý yêu cầu phổ biến, có kiểm tra và audit log, thay vì nhờ dev chạy SQL.
   - **Tự động hoá**: job tự retry có giới hạn, cert-manager tự gia hạn chứng chỉ, pipeline thay cho checklist release thủ công.
4. **Đo lại**: thời gian toil có giảm không, số lần bị gọi ngoài giờ có giảm không.

Tự động hoá cũng có chi phí: script phải được bảo trì, test và có người hiểu. Một tác vụ làm mỗi năm một lần, mất 10 phút, có lẽ chỉ cần một runbook rõ ràng.

## Lỗi thường gặp

- **SLO 100% hoặc quá nhiều số 9**: không bao giờ đạt, team mất niềm tin vào SLO. Cách sửa: đặt SLO dựa trên dữ liệu hiện tại và kỳ vọng thật của người dùng.
- **SLI đo tài nguyên thay vì trải nghiệm**: CPU, RAM làm SLI. Cách sửa: dùng tỉ lệ request thành công và đủ nhanh, đo gần người dùng.
- **Error budget không có chính sách**: hết budget vẫn release như thường. Cách sửa: thống nhất chính sách bằng văn bản với Product Owner trước.
- **Alert theo mọi đợt tăng lỗi ngắn**: on-call bị gọi liên tục vì những đợt lỗi không ảnh hưởng SLO. Cách sửa: alert theo burn rate nhiều cửa sổ.
- **Dùng DORA để xếp hạng team hoặc cá nhân**: số liệu bị "làm đẹp". Cách sửa: chỉ dùng cho cải tiến của chính team, xem xu hướng.
- **Tự động hoá triệu chứng thay vì sửa gốc**: script restart service mỗi đêm che giấu memory leak. Cách sửa: ưu tiên loại bỏ nguyên nhân, tự động hoá là lựa chọn thứ hai.

## Bài tập thực hành

1. **SLO cho một service**: chọn một service của team, định nghĩa 2 SLI (availability và latency) kèm công thức PromQL hoặc truy vấn tương ứng, đặt SLO dựa trên dữ liệu 4 tuần gần nhất, tính error budget theo request, và viết error budget policy một trang để trao đổi với Product Owner.
2. **Dashboard DORA**: thu thập dữ liệu deploy và sự cố 90 ngày gần nhất (từ CI/CD và công cụ quản lý sự cố, hoặc nhập tay nếu cần), tính bốn chỉ số DORA, dựng dashboard đơn giản và chỉ ra một điểm nghẽn cần cải thiện.
3. **Kiểm kê toil**: trong hai tuần, mỗi người trực ghi lại các việc thủ công lặp lại và thời gian tốn. Tổng hợp, chọn việc tốn thời gian nhất và đề xuất cách loại bỏ hoặc tự động hoá, kèm ước lượng công sức.

## Tóm tắt

- SLI là tỉ lệ sự kiện tốt trên sự kiện hợp lệ, đo từ góc nhìn người dùng; SLO là mục tiêu cho SLI trong một cửa sổ thời gian; SLA là hợp đồng có hậu quả, thường lỏng hơn SLO.
- Error budget bằng 100% trừ SLO; nó chỉ có giá trị khi đi kèm chính sách đã thống nhất với Product Owner.
- Alert theo burn rate với nhiều cửa sổ giúp gọi người đúng lúc, ít nhiễu.
- Bốn chỉ số DORA đo tốc độ (deployment frequency, lead time) và ổn định (change failure rate, time to restore); các team tốt nhất giỏi ở cả hai.
- Dùng DORA cho cải tiến của chính team, xem xu hướng, không xếp hạng hay biến thành chỉ tiêu.
- Toil là việc thủ công, lặp lại, tự động hoá được và tăng theo quy mô; ưu tiên loại bỏ nguyên nhân trước khi tự động hoá.
