Release là thời điểm thay đổi của team chạm tới người dùng thật, và cũng là thời điểm rủi ro nhất. Team sợ release thường gom nhiều thay đổi vào một bản lớn, release thưa đi, và chính điều đó làm mỗi lần release càng rủi ro hơn. Dev Lead cần phá vòng luẩn quẩn này bằng các kỹ thuật làm release **nhỏ, thường xuyên và đảo ngược được**: tách deploy khỏi release bằng feature flag, migration DB tương thích ngược, và kế hoạch rollback rõ ràng cho từng lần. Bài này trình bày cách lập kế hoạch release và từng kỹ thuật đó.

## Mục tiêu bài học

- Lập kế hoạch release, viết release note và duy trì changelog.
- Dùng feature flag (Togglz, Unleash) để tách deploy khỏi release.
- Thực hiện migration DB tương thích ngược theo mô hình expand/contract.
- Chuẩn bị kế hoạch rollback cụ thể, có tiêu chí quyết định cho mỗi release.

## Deploy và release là hai việc khác nhau

- **Deploy** (triển khai) là đưa một phiên bản code lên môi trường production. Đây là việc kỹ thuật.
- **Release** (phát hành) là làm cho tính năng **có hiệu lực với người dùng**. Đây là quyết định nghiệp vụ.

Khi hai việc gắn chặt với nhau, mỗi lần deploy là một lần đánh cược: code mới chạy ngay cho mọi người dùng. Khi tách ra, team có thể deploy code của tính năng chưa hoàn thiện lên production hằng ngày (ẩn sau flag), rồi bật cho 1% người dùng, theo dõi, mở dần, và tắt trong vài giây nếu có vấn đề, mà không cần deploy lại.

Kích thước release ảnh hưởng trực tiếp tới rủi ro. Một release chứa 3 thay đổi, nếu lỗi, dễ tìm ra thay đổi nào gây lỗi. Một release chứa 80 thay đổi tích luỹ sau một tháng thì việc khoanh vùng mất nhiều giờ, và rollback sẽ kéo theo cả 79 thay đổi không có lỗi.

## Lập kế hoạch release

### Nhịp release

Có hai mô hình chính:

- **Continuous delivery**: mỗi thay đổi đã merge vào nhánh chính đều có thể lên production bất cứ lúc nào, thường qua pipeline tự động. Phù hợp với web service.
- **Release train**: release theo lịch cố định (ví dụ mỗi hai tuần), thay đổi nào sẵn sàng thì "lên tàu", chưa xong thì chờ chuyến sau. Phù hợp khi cần phối hợp nhiều team, app mobile qua cửa hàng ứng dụng, hoặc khách hàng doanh nghiệp cần biết trước lịch.

Dù theo mô hình nào, kế hoạch release cần trả lời: thay đổi gì, ảnh hưởng ai, phụ thuộc gì (service khác, migration, cấu hình), ai cần biết (CSKH, sales, đối tác), deploy lúc nào và ai trực theo dõi. Tránh release vào thời điểm thiếu người theo dõi, như chiều thứ Sáu trước kỳ nghỉ hoặc đúng giờ cao điểm traffic; nhiều tổ chức có giai đoạn **freeze** (đóng băng release) trước các sự kiện lớn như ngày khuyến mãi.

### Release checklist

```text
RELEASE CHECKLIST: order-service v2.14.0     Ngày: ...     Người phụ trách: ...

Trước release
[ ] Mọi PR trong release đã merge, CI xanh, artifact đã build (image tag: ...)
[ ] Đã chạy trên staging: smoke test + kịch bản nghiệp vụ chính
[ ] Migration DB tương thích ngược với version đang chạy (expand/contract)
[ ] Feature flag mới có mặc định TẮT; đã ghi tên flag vào release note
[ ] Kế hoạch rollback đã viết, tiêu chí rollback đã thống nhất
[ ] Đã báo CSKH/stakeholder nếu có thay đổi người dùng nhìn thấy
[ ] Người trực theo dõi sau release: ... (ít nhất 1 giờ)

Trong release
[ ] Deploy canary / một phần instance, theo dõi dashboard 15 phút
[ ] Tỉ lệ lỗi, latency p99, metric nghiệp vụ (số đơn/phút) trong ngưỡng
[ ] Mở rộng 100%

Sau release
[ ] Bật flag theo kế hoạch (1% -> 10% -> 50% -> 100%)
[ ] Cập nhật release note, changelog; đóng ticket
[ ] Ghi lại vấn đề gặp phải để cải thiện checklist
```

### Release note và changelog

Hai tài liệu này phục vụ hai đối tượng khác nhau:

- **Release note** viết cho **người dùng, CSKH, stakeholder**: có gì mới, thay đổi gì với họ, có cần làm gì không. Ngôn ngữ nghiệp vụ, không liệt kê từng commit.
- **Changelog** viết cho **developer và người tích hợp**: danh sách đầy đủ các thay đổi đáng chú ý theo từng version, đặc biệt là thay đổi phá vỡ tương thích.

Định dạng phổ biến cho changelog theo "Keep a Changelog": file `CHANGELOG.md`, version mới nhất ở trên, mục `Unreleased` cho các thay đổi chưa phát hành, và các nhóm `Added`, `Changed`, `Deprecated`, `Removed`, `Fixed`, `Security`. Nếu team dùng Conventional Commits, các công cụ như release-please hay semantic-release có thể sinh nháp changelog tự động; con người chỉ cần biên tập lại cho dễ đọc. Changelog không nên là bản sao `git log`: "fix typo" và "refactor test" không có giá trị với người đọc.

## Feature flag: tách deploy khỏi release

**Feature flag** (feature toggle) là cơ chế bật/tắt một đoạn code lúc runtime mà không cần deploy lại. Bài viết về feature toggle của Pete Hodgson trên trang của Martin Fowler phân loại flag theo mục đích, và mỗi loại có vòng đời khác nhau:

| Loại | Mục đích | Thời gian sống |
|---|---|---|
| Release toggle | Ẩn tính năng chưa hoàn thiện, mở dần cho người dùng | Ngắn: xoá sau khi mở 100% |
| Experiment toggle | A/B test, so sánh hai phiên bản | Đến khi có kết quả thí nghiệm |
| Ops toggle | Kill switch: tắt tính năng tốn tài nguyên khi hệ thống quá tải | Có thể lâu dài |
| Permission toggle | Tính năng cho nhóm người dùng cụ thể (beta, gói cao cấp) | Lâu dài |

### Ví dụ với Unleash

**Unleash** là nền tảng feature flag mã nguồn mở có server và giao diện quản lý; SDK Java tải cấu hình flag về, lưu bản sao cục bộ và đánh giá flag ngay trong ứng dụng, nên mỗi lần kiểm tra flag không phát sinh lời gọi mạng.

```java
@Configuration
class UnleashConfiguration {
    @Bean
    Unleash unleash(@Value("${unleash.url}") String url, @Value("${unleash.token}") String token) {
        UnleashConfig config = UnleashConfig.builder()
                .appName("order-service")
                .instanceId(System.getenv().getOrDefault("HOSTNAME", "local"))
                .unleashAPI(url)
                .apiKey(token)
                .build();
        return new DefaultUnleash(config);
    }
}

@Service
class CheckoutService {
    private final Unleash unleash;
    private final PricingEngine legacyPricing;
    private final PricingEngine newPricing;
    // constructor injection bỏ qua cho gọn

    Quote quote(Cart cart, String userId) {
        UnleashContext ctx = UnleashContext.builder().userId(userId).build();
        // tham số cuối là giá trị dự phòng nếu không lấy được cấu hình flag
        if (unleash.isEnabled("checkout.new-pricing-engine", ctx, false)) {
            return newPricing.quote(cart);
        }
        return legacyPricing.quote(cart);
    }
}
```

Trên giao diện Unleash, flag này có thể gắn chiến lược **gradual rollout** (mở dần) theo phần trăm, với **stickiness** theo `userId`: cùng một người dùng luôn nhận cùng kết quả, không bị nhảy qua lại giữa hai engine giữa các request.

**Togglz** là lựa chọn nhẹ hơn, chạy hoàn toàn trong ứng dụng: khai báo các flag trong một `enum` implement interface `Feature`, kiểm tra bằng `FeatureManager.isActive(...)`, trạng thái lưu trong file cấu hình, DB hoặc nguồn khác, kèm một console web để bật tắt. Togglz phù hợp khi team không muốn vận hành thêm một server riêng; Unleash phù hợp khi cần quản lý flag tập trung cho nhiều service, phân quyền và lịch sử thay đổi.

### Kỷ luật với feature flag

- **Mặc định an toàn**: khi không lấy được cấu hình, flag phải rơi về hành vi cũ đã được kiểm chứng.
- **Xoá release toggle sau khi xong**: mỗi flag là một nhánh `if` trong code, và hai flag tạo ra bốn tổ hợp cần test. Tạo ticket "xoá flag" ngay khi tạo flag.
- **Đặt tên rõ ràng** theo quy ước, có người sở hữu và ngày dự kiến xoá.
- **Test cả hai nhánh**: bật và tắt.
- **Không dùng flag thay cho cấu hình** thông thường hoặc phân quyền nghiệp vụ lâu dài.

## Migration DB tương thích ngược: expand/contract

Với rolling deployment (thay dần từng instance), canary hay blue-green, sẽ có lúc **version cũ và version mới cùng chạy** trên cùng một database. Thêm vào đó, nếu phải rollback, version cũ cần chạy được với schema đã bị version mới thay đổi. Vì vậy mỗi migration phải tương thích với **cả version N và N-1** của ứng dụng.

Mô hình **expand/contract** (còn gọi là parallel change) chia một thay đổi phá vỡ thành nhiều bước, mỗi bước đều tương thích ngược:

1. **Expand (mở rộng)**: thêm cấu trúc mới bên cạnh cấu trúc cũ. Code ghi vào cả hai, vẫn đọc từ cái cũ.
2. **Migrate (chuyển dữ liệu)**: backfill dữ liệu cũ sang cấu trúc mới, chuyển code sang đọc từ cấu trúc mới, vẫn ghi cả hai.
3. **Contract (thu hẹp)**: khi không còn version nào dùng cấu trúc cũ, ngừng ghi vào đó rồi xoá nó.

Ví dụ đổi tên cột `customer.customer_name` thành `full_name`. Một lệnh `ALTER TABLE ... RENAME COLUMN` duy nhất sẽ làm version đang chạy lỗi ngay lập tức. Theo expand/contract với Flyway:

```sql
-- Release 1 (expand): V12__add_customer_full_name.sql
-- Thêm cột cho phép NULL, không default: thao tác nhanh trên PostgreSQL
ALTER TABLE customer ADD COLUMN full_name VARCHAR(200);
-- Code release 1: ghi cả customer_name và full_name, vẫn đọc customer_name

-- Job riêng, sau khi release 1 đã chạy trên mọi instance: backfill theo lô
UPDATE customer SET full_name = customer_name
WHERE id IN (SELECT id FROM customer
             WHERE full_name IS NULL AND customer_name IS NOT NULL LIMIT 5000);
-- (lặp lại cho đến khi không còn dòng nào)

-- Release 2: code đọc full_name, vẫn ghi cả hai cột
-- -> nếu phải rollback về release 1, dữ liệu vẫn đầy đủ ở cả hai cột

-- Release 3: code ngừng ghi customer_name

-- Release 4 (contract): V15__drop_customer_name.sql
ALTER TABLE customer DROP COLUMN customer_name;
```

Bốn release cho một lần đổi tên cột nghe có vẻ nhiều, nhưng mỗi bước đều nhỏ, an toàn và rollback được; với team deploy hằng ngày, cả quá trình chỉ mất vài ngày. Một số nguyên tắc khác:

- **Thêm cột NOT NULL**: thêm cột cho phép NULL (hoặc có default), backfill, rồi mới thêm ràng buộc.
- **Tạo index trên bảng lớn**: với PostgreSQL dùng `CREATE INDEX CONCURRENTLY` để không khoá ghi; lệnh này không chạy được trong transaction block, nên cần cấu hình migration đó chạy ngoài transaction.
- **Xoá cột hoặc bảng luôn là bước cuối**, sau khi đã chắc chắn không còn code nào đọc nó (kể cả job báo cáo, service khác đọc chung DB).
- **Áp dụng cho cả message và API**: đổi schema event Kafka hay response REST cũng theo cùng tư duy: thêm field mới trước, consumer chuyển dần, xoá field cũ sau cùng.

## Kế hoạch rollback

Mỗi release cần trả lời trước câu hỏi: **nếu có vấn đề, ta quay lại bằng cách nào, mất bao lâu, ai quyết định?** Câu trả lời phải có trước khi deploy, không phải nghĩ ra lúc sự cố.

### Các cách quay lại

| Cách | Tốc độ | Khi nào dùng |
|---|---|---|
| Tắt feature flag | Vài giây | Lỗi nằm trong tính năng được bọc flag |
| Chuyển traffic về bản cũ (blue-green, huỷ canary) | Vài giây đến vài phút | Môi trường cũ vẫn còn chạy |
| Deploy lại artifact của version trước | Vài phút | Artifact bất biến, schema DB tương thích ngược |
| Fix forward (sửa và deploy bản mới) | Tuỳ | Rollback không khả thi, lỗi nhỏ và hiểu rõ nguyên nhân |

Rollback ứng dụng chỉ an toàn khi **migration DB tương thích ngược**, đây là lý do expand/contract quan trọng. Phần lớn team chọn migration chỉ đi tiến (forward-only) và không rollback schema: rollback DB rủi ro mất dữ liệu được ghi sau khi migrate. Flyway có tính năng undo nhưng chỉ trong bản trả phí; dù có công cụ, thiết kế để không cần rollback DB vẫn an toàn hơn.

### Viết kế hoạch rollback

```text
KẾ HOẠCH ROLLBACK: order-service v2.14.0

Tiêu chí rollback (bất kỳ điều kiện nào, kéo dài 5 phút sau deploy):
  - Tỉ lệ lỗi 5xx > 1% (bình thường < 0.1%)
  - Latency p99 của POST /orders > 1.5 giây (bình thường 400 ms)
  - Số đơn hàng tạo thành công/phút giảm > 20% so với cùng giờ tuần trước
Người quyết định: người trực release (Lan); vắng thì Dev Lead.
Cách rollback:
  1. Tắt flag checkout.new-pricing-engine (nếu lỗi liên quan đến tính giá)
  2. Nếu chưa hết: deploy lại image order-service:2.13.2 qua pipeline
Migration V12 chỉ thêm cột nullable -> version 2.13.2 chạy bình thường.
Điểm không quay lại: không có (event gửi đối tác giữ nguyên format).
Sau rollback: thông báo kênh #release, mở ticket điều tra.
```

**Tiêu chí rollback được đặt trước** giúp tránh tình huống phổ biến: mọi người nhìn dashboard đỏ và tranh luận "đợi thêm chút xem sao". Khi tiêu chí đã thống nhất, quyết định rollback là việc làm theo kế hoạch, không phải cuộc tranh luận. Ghi rõ **điểm không thể quay lại** nếu có: ví dụ release gửi dữ liệu theo format mới tới đối tác, hoặc migration xoá dữ liệu. Những release như vậy cần chuẩn bị kỹ hơn và có thể cần chia nhỏ để tránh điểm không quay lại. Cuối cùng, hãy **tập rollback**: một quy trình rollback chưa từng chạy thử thì không đáng tin.

## Lỗi thường gặp

- **Release lớn, thưa**: gom một tháng thay đổi, mỗi lần release là một sự kiện căng thẳng. Cách sửa: release nhỏ và thường xuyên, dùng flag cho tính năng chưa xong.
- **Migration phá vỡ tương thích**: đổi tên hoặc xoá cột cùng lúc với deploy code mới, rolling deploy làm version cũ lỗi. Cách sửa: expand/contract, review riêng mọi migration.
- **Flag tồn tại mãi**: hàng trăm flag không ai nhớ ý nghĩa, code đầy nhánh chết. Cách sửa: ticket xoá flag, người sở hữu, rà soát flag định kỳ.
- **Không có tiêu chí rollback**: tranh luận khi sự cố đang diễn ra. Cách sửa: tiêu chí đo được trong kế hoạch rollback, có người quyết định.
- **Build lại artifact cho từng môi trường**: bản chạy production khác bản đã test trên staging. Cách sửa: build một lần, đánh tag bất biến, dùng cùng artifact cho mọi môi trường.
- **Changelog là bản sao git log**: không ai đọc được. Cách sửa: sinh nháp tự động rồi biên tập, nhóm theo Added/Changed/Fixed.

## Bài tập thực hành

1. **Checklist và kế hoạch rollback**: viết release checklist và kế hoạch rollback cho release tiếp theo của team theo mẫu trên, với tiêu chí rollback dựa trên metric thật của service.
2. **Feature flag**: thêm Unleash (chạy bằng Docker) hoặc Togglz vào một service, bọc một thay đổi nhỏ sau flag, cấu hình gradual rollout 10% theo `userId`, và viết test cho cả hai nhánh bật/tắt.
3. **Expand/contract**: trên một bảng thử nghiệm, thực hiện đổi tên một cột theo đủ các bước expand, migrate, contract bằng Flyway. Ở mỗi bước, chạy đồng thời version cũ và version mới của ứng dụng để xác nhận cả hai đều hoạt động.

## Tóm tắt

- Deploy là đưa code lên production; release là bật tính năng cho người dùng. Tách hai việc này giúp release an toàn hơn nhiều.
- Release nhỏ và thường xuyên ít rủi ro hơn release lớn và thưa; dùng checklist để không bỏ sót bước.
- Release note cho người dùng và stakeholder; changelog cho developer, theo nhóm Added/Changed/Fixed.
- Feature flag có nhiều loại với vòng đời khác nhau; release toggle phải được xoá sau khi mở 100%.
- Migration phải tương thích với cả version N và N-1; dùng expand/contract cho mọi thay đổi phá vỡ.
- Mỗi release cần kế hoạch rollback với tiêu chí đo được, người quyết định và cách thực hiện cụ thể.
