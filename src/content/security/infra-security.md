Code an toàn mới là một nửa câu chuyện. Một hệ thống vẫn có thể bị xâm phạm vì mật khẩu database nằm trong Git, vì traffic giữa các service đi dạng rõ trong "mạng nội bộ tin cậy", hay vì một service bị chiếm quyền có thể đọc dữ liệu của mọi service khác. Bài này bàn về các quyết định kiến trúc ở tầng hạ tầng và dữ liệu: quản lý secret, mã hoá, Zero Trust, least privilege, và cách các yêu cầu tuân thủ như GDPR, PCI-DSS, ISO 27001 trở thành yêu cầu thiết kế cụ thể. Đây là phần mà Solution Architect thường phải trình bày và bảo vệ trước đội bảo mật, kiểm toán và khách hàng doanh nghiệp.

## Mục tiêu bài học

- Thiết kế quản lý secret với HashiCorp Vault hoặc dịch vụ KMS/secret manager của cloud, bao gồm secret động và xoay vòng.
- Áp dụng mã hoá in-transit (TLS, mTLS) và at-rest ở đúng tầng, hiểu envelope encryption.
- Hiện thực các nguyên tắc Zero Trust và least privilege cho hệ thống microservice Java.
- Diễn giải yêu cầu chính của GDPR, PCI-DSS và ISO 27001 thành quyết định kiến trúc.

## Quản lý secret

**Secret** là mọi thông tin cho phép truy cập tài nguyên: mật khẩu database, API key của đối tác, `client_secret` OAuth, private key TLS, khoá mã hoá. Các nơi **không** được chứa secret: mã nguồn và lịch sử Git (xoá commit không đủ – coi như đã lộ và phải đổi), file `application.yml` đóng gói trong image, Dockerfile, log, ticket hay tin nhắn chat.

Giải pháp quản lý secret phải lo trọn vòng đời: lưu có mã hoá, phân phối tới đúng workload, **xoay vòng** (*rotation*), thu hồi và **audit** ai đã đọc secret nào.

### HashiCorp Vault

Vault là hệ thống quản lý secret tập trung. Các khái niệm chính:

- **Secrets engine:** nơi lưu hoặc sinh secret: `kv` (key-value có version), `database` (tài khoản database động), `pki` (cấp certificate), `transit` (mã hoá như một dịch vụ – ứng dụng không bao giờ cầm khoá).
- **Auth method:** cách workload chứng minh danh tính để nhận Vault token: Kubernetes (service account token của pod), AppRole, IAM của cloud, OIDC/JWT.
- **Policy** quy định token được làm gì trên path nào (mặc định từ chối); **lease** là thời hạn (TTL) của secret động, có thể gia hạn hoặc thu hồi; **audit device** ghi log mọi request.

Điểm mạnh nhất của Vault là **secret động**: thay vì một mật khẩu database dùng chung sống hàng năm, mỗi instance service xin một tài khoản riêng, sống vài giờ, tự bị xoá khi hết hạn.

```bash
# Bật secrets engine database và cấu hình kết nối PostgreSQL
vault secrets enable database
vault write database/config/orders-db \
    plugin_name=postgresql-database-plugin \
    connection_url="postgresql://{{username}}:{{password}}@orders-db.internal:5432/orders" \
    allowed_roles="order-service-rw" \
    username="vault_admin" password="$VAULT_DB_ADMIN_PASSWORD"

# Mỗi lần đọc creds, Vault tạo một user PostgreSQL mới, sống 1 giờ (tối đa 24 giờ)
vault write database/roles/order-service-rw \
    db_name=orders-db \
    creation_statements="CREATE ROLE \"{{name}}\" WITH LOGIN PASSWORD '{{password}}' VALID UNTIL '{{expiration}}'; GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA orders TO \"{{name}}\";" \
    default_ttl=1h max_ttl=24h

# Pod trong namespace "shop" chạy bằng service account "order-service" được nhận policy tương ứng
vault auth enable kubernetes
vault write auth/kubernetes/role/order-service \
    bound_service_account_names=order-service \
    bound_service_account_namespaces=shop \
    policies=order-service ttl=1h
```

Policy viết bằng HCL, chỉ cấp đúng những path service cần:

```text
# order-service.hcl
path "secret/data/order-service" {
  capabilities = ["read"]
}
path "database/creds/order-service-rw" {
  capabilities = ["read"]
}
path "transit/encrypt/orders-pii" {
  capabilities = ["update"]
}
path "transit/decrypt/orders-pii" {
  capabilities = ["update"]
}
```

Với Spring Boot, **Spring Cloud Vault** nạp secret vào `Environment` lúc khởi động như mọi nguồn cấu hình khác:

```yaml
spring:
  application:
    name: order-service
  config:
    import: vault://
  cloud:
    vault:
      uri: https://vault.internal:8200
      authentication: KUBERNETES
      kubernetes:
        role: order-service
      kv:
        enabled: true
        backend: secret          # đọc secret/data/order-service
      database:
        enabled: true
        role: order-service-rw   # tự điền spring.datasource.username/password
        backend: database
```

Hai vấn đề thiết kế cần giải quyết:

- **"Secret zero":** để lấy secret từ Vault, ứng dụng cần một thứ để xác thực với Vault – và thứ đó lại là secret. Lời giải là dùng **danh tính do nền tảng cấp** (service account token của Kubernetes, IAM role của máy ảo/cloud) thay vì một token tĩnh.
- **Xoay vòng credential động:** Spring Cloud Vault gia hạn lease khi ứng dụng chạy, nhưng khi chạm `max_ttl` thì credential phải được thay. Hãy đặt `max_ttl` phù hợp với chu kỳ deploy/restart hoặc có cơ chế nạp lại connection pool, và kiểm thử điều này trước khi lên production.

### Cloud KMS và secret manager

Các nhà cung cấp cloud tách thành hai loại dịch vụ:

- **KMS** (Key Management Service: AWS KMS, Google Cloud KMS, Azure Key Vault keys) quản lý **khoá mã hoá**. Khoá chính có thể được bảo vệ bởi HSM (thiết bị phần cứng chuyên dụng) và không bao giờ rời khỏi dịch vụ; ứng dụng chỉ gọi API để mã hoá/giải mã. Mọi thao tác được ghi audit và kiểm soát bằng IAM.
- **Secret manager** (AWS Secrets Manager, Google Secret Manager, Azure Key Vault secrets) lưu **secret** như mật khẩu, API key, hỗ trợ version và xoay vòng tự động cho một số loại.

KMS thường được dùng theo mẫu **envelope encryption**, vì gọi KMS cho từng bản ghi thì chậm và có giới hạn dung lượng dữ liệu mỗi lần gọi:

```text
 [KMS / HSM]  giữ KEK – key encryption key, không bao giờ rời KMS
      │
      │ 1. Ứng dụng xin data key → nhận DEK dạng rõ + DEK đã mã hoá bằng KEK
      ▼
 Ứng dụng  2. Mã hoá dữ liệu bằng DEK (AES-GCM), xoá DEK dạng rõ khỏi bộ nhớ
           3. Lưu [dữ liệu đã mã hoá] + [DEK đã mã hoá] cạnh nhau
 Giải mã   4. Gửi DEK đã mã hoá cho KMS → nhận DEK dạng rõ → giải mã dữ liệu
```

Xoay vòng KEK chỉ cần mã hoá lại các DEK chứ không phải toàn bộ dữ liệu; huỷ KEK làm mọi dữ liệu liên quan không giải mã được nữa.

Trên Kubernetes, lưu ý `Secret` mặc định chỉ được **mã hoá Base64**, không phải mã hoá bảo mật. Hãy bật mã hoá etcd at-rest (thường tích hợp với KMS), giới hạn RBAC đọc `Secret`, hoặc đồng bộ secret từ Vault/secret manager bằng External Secrets Operator hay Secrets Store CSI Driver.

| Tiêu chí | HashiCorp Vault | Dịch vụ của cloud |
|---|---|---|
| Đa cloud, on-premise | Tốt, một giải pháp cho mọi nơi | Gắn với một nhà cung cấp |
| Secret động, PKI, transit | Rất mạnh | Có nhưng hạn chế hơn, tuỳ dịch vụ |
| Vận hành | Tự vận hành (HA, unseal, backup, nâng cấp) hoặc dùng bản managed | Nhà cung cấp lo |
| Tích hợp IAM | Qua auth method | Tự nhiên với IAM của cloud đó |

## Mã hoá dữ liệu in-transit và at-rest

### In-transit: TLS ở mọi chặng

Mọi kết nối mang dữ liệu nghiệp vụ dùng **TLS 1.2 trở lên** (ưu tiên 1.3); trang web thêm HSTS. Kết thúc TLS (*TLS termination*) ở load balancer rồi đi HTTP thường vào trong thì đơn giản, nhưng ngầm định mạng nội bộ là an toàn – điều Zero Trust không chấp nhận. Hệ thống xử lý dữ liệu nhạy cảm nên mã hoá cả các chặng nội bộ: LB → service, service → service, service → database, service → Kafka.

### mTLS: xác thực hai chiều giữa các service

Với TLS thông thường, chỉ **client kiểm tra server**. Với **mTLS** (mutual TLS), server cũng yêu cầu client trình certificate và kiểm tra nó được ký bởi CA tin cậy. Mỗi service khi đó có một **danh tính mật mã**: Payment Service biết chắc request đến từ Order Service chứ không phải một pod lạ.

Từ Spring Boot 3.1, cấu hình TLS được gom thành **SSL bundle** dùng chung cho server và client:

```yaml
server:
  port: 8443
  ssl:
    bundle: service
    client-auth: need                      # bắt buộc client trình certificate → mTLS
spring:
  ssl:
    bundle:
      pem:
        service:
          reload-on-rotation: true         # nạp lại khi file certificate được thay
          keystore:
            certificate: file:/etc/tls/tls.crt
            private-key: file:/etc/tls/tls.key
          truststore:
            certificate: file:/etc/tls/ca.crt   # chỉ tin certificate do CA nội bộ cấp
```

```java
@Bean
RestClient inventoryClient(RestClient.Builder builder, RestClientSsl ssl) {
    return builder
            .baseUrl("https://inventory.shop.svc.cluster.local:8443")
            .apply(ssl.fromBundle("service"))      // trình certificate của order-service
            .build();
}
```

Phần khó của mTLS không nằm ở cấu hình mà ở **vòng đời certificate**: cấp cho mỗi service, xoay vòng trước khi hết hạn, thu hồi. Ứng dụng có thể tự làm với certificate từ cert-manager hoặc Vault PKI (kiểm soát tốt nhưng mỗi service phải cấu hình đúng), hoặc giao cho **service mesh** (Istio, Linkerd) – proxy của mesh tự thực hiện mTLS và tự xoay certificate mà ứng dụng không cần thay đổi, với danh tính theo định dạng SPIFFE như `spiffe://cluster.local/ns/shop/sa/order-service`, đổi lại là thêm một lớp hạ tầng phức tạp. Dù chọn cách nào, ứng dụng vẫn kiểm tra JWT để biết *người dùng* là ai.

Lưu ý mTLS là **xác thực**, chưa phải **phân quyền**: biết request đến từ Order Service không có nghĩa Order Service được gọi mọi endpoint. Cần thêm chính sách "service nào được gọi API nào".

### At-rest: mã hoá ở đúng tầng

| Tầng | Ví dụ | Chống được | Không chống được |
|---|---|---|---|
| Đĩa/volume | Mã hoá EBS, persistent disk | Mất ổ đĩa, snapshot bị lộ | Ai truy cập được database |
| Database (TDE) | Transparent Data Encryption | File dữ liệu, backup bị đánh cắp | DBA, câu SQL độc hại từ ứng dụng |
| Ứng dụng (field-level) | Mã hoá cột CMND, số tài khoản | DBA, backup, SQL injection đọc bảng | Kẻ chiếm được ứng dụng và khoá |
| Tokenization | Thay số thẻ bằng token của nhà cung cấp | Dữ liệu thật không nằm trong hệ thống | Phụ thuộc nhà cung cấp |

Mã hoá đĩa và TDE gần như "miễn phí" trên cloud và nên bật mặc định. Mã hoá **ở tầng ứng dụng** dành cho dữ liệu đặc biệt nhạy cảm, đổi lại không tìm kiếm hay sắp xếp được theo cột đã mã hoá (cần tra cứu chính xác thì lưu thêm *blind index* – giá trị HMAC của dữ liệu). Mật khẩu người dùng **không mã hoá mà băm** bằng thuật toán chậm (bcrypt, Argon2), vì không bao giờ cần giải mã ngược.

Ví dụ mã hoá một trường bằng AES-GCM – chế độ vừa mã hoá vừa xác thực toàn vẹn (dữ liệu bị sửa thì giải mã thất bại):

```java
public final class FieldCipher {

    private static final int IV_BYTES = 12;           // IV 96 bit, khuyến nghị cho GCM
    private static final int TAG_BITS = 128;
    private final SecretKey key;                      // DEK lấy qua KMS/Vault, không hard-code
    private final SecureRandom random = new SecureRandom();

    public FieldCipher(SecretKey key) { this.key = key; }

    public String encrypt(String plaintext) {
        try {
            byte[] iv = new byte[IV_BYTES];
            random.nextBytes(iv);                     // IV mới cho MỖI lần mã hoá
            Cipher cipher = Cipher.getInstance("AES/GCM/NoPadding");
            cipher.init(Cipher.ENCRYPT_MODE, key, new GCMParameterSpec(TAG_BITS, iv));
            byte[] ct = cipher.doFinal(plaintext.getBytes(StandardCharsets.UTF_8));
            return Base64.getEncoder().encodeToString(
                    ByteBuffer.allocate(IV_BYTES + ct.length).put(iv).put(ct).array());
        } catch (GeneralSecurityException e) {
            throw new IllegalStateException("Mã hoá thất bại", e);
        }
    }

    public String decrypt(String encoded) {
        try {
            byte[] all = Base64.getDecoder().decode(encoded);
            Cipher cipher = Cipher.getInstance("AES/GCM/NoPadding");
            cipher.init(Cipher.DECRYPT_MODE, key, new GCMParameterSpec(TAG_BITS, all, 0, IV_BYTES));
            return new String(cipher.doFinal(all, IV_BYTES, all.length - IV_BYTES), StandardCharsets.UTF_8);
        } catch (GeneralSecurityException e) {        // gồm AEADBadTagException khi dữ liệu bị sửa
            throw new IllegalStateException("Giải mã thất bại", e);
        }
    }
}
```

Có thể gắn lớp này vào JPA qua một `AttributeConverter<String, String>` và `@Convert` trên field. Trong thực tế nên lưu kèm **mã phiên bản khoá** trong chuỗi mã hoá để xoay vòng khoá mà vẫn đọc được dữ liệu cũ – hoặc giao toàn bộ việc này cho Vault Transit. Không bao giờ dùng lại IV với cùng khoá trong GCM, và không tự chế thuật toán.

## Zero Trust và least privilege

### Zero Trust

Mô hình truyền thống giống "lâu đài và hào nước": bảo vệ chặt vành đai, bên trong thì tin nhau, nên kẻ tấn công vượt được vành đai (qua máy nhân viên nhiễm mã độc, một service có lỗ hổng) sẽ di chuyển ngang tự do. **Zero Trust** (mô tả chi tiết trong NIST SP 800-207) bỏ giả định đó: **vị trí mạng không mang lại sự tin cậy**. Mọi truy cập đều được xác thực, phân quyền và mã hoá; quyền được cấp tối thiểu theo từng phiên/request dựa trên danh tính và ngữ cảnh; hệ thống được thiết kế theo giả định **đã bị xâm nhập** (*assume breach*) để giới hạn phạm vi thiệt hại (*blast radius*) và phát hiện sớm. Áp dụng vào hệ thống microservice Java:

| Nguyên tắc | Hiện thực |
|---|---|
| Danh tính cho mọi workload | mTLS với certificate/SPIFFE ID cho từng service |
| Danh tính người dùng đi theo request | Access token JWT được kiểm tra ở từng resource server |
| Phân quyền ở từng service | Spring Security + chính sách service-to-service của mesh |
| Phân đoạn vi mô | Kubernetes NetworkPolicy mặc định chặn, chỉ mở luồng cần thiết |
| Credential ngắn hạn | Secret động từ Vault, token ngắn hạn, workload identity thay cho key tĩnh |
| Truy cập của con người | Đăng nhập qua IdP + MFA cho từng ứng dụng nội bộ, thay vì VPN mở cả mạng |

```yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: default-deny
  namespace: shop
spec:
  podSelector: {}                      # áp dụng cho mọi pod trong namespace
  policyTypes: [Ingress, Egress]       # không khai báo rule nào → chặn tất cả
---
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: order-service-from-gateway
  namespace: shop
spec:
  podSelector:
    matchLabels:
      app: order-service
  policyTypes: [Ingress]
  ingress:
    - from:
        - podSelector:
            matchLabels:
              app: api-gateway
      ports:
        - protocol: TCP
          port: 8443
```

Khi chặn egress mặc định, nhớ mở chiều đi tới DNS của cluster và tới đúng các dependency (database, Kafka, Vault), nếu không mọi service sẽ "chết" ngay sau khi áp dụng.

### Least privilege

**Least privilege** (đặc quyền tối thiểu): mỗi người, mỗi service chỉ có đúng những quyền cần cho công việc, trong thời gian cần. Ví dụ ở tầng database – tách user chạy migration khỏi user ứng dụng:

```sql
-- User chạy migration (Flyway): có quyền DDL, chỉ dùng trong pipeline deploy
CREATE ROLE orders_migrator LOGIN PASSWORD '...';
GRANT USAGE, CREATE ON SCHEMA orders TO orders_migrator;

-- User của ứng dụng: chỉ DML trên schema của chính service, không DDL
CREATE ROLE orders_app LOGIN PASSWORD '...';
GRANT USAGE ON SCHEMA orders TO orders_app;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA orders TO orders_app;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA orders TO orders_app;

-- Bảng/sequence do migrator tạo sau này cũng tự cấp quyền cho orders_app
ALTER DEFAULT PRIVILEGES FOR ROLE orders_migrator IN SCHEMA orders
    GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO orders_app;
ALTER DEFAULT PRIVILEGES FOR ROLE orders_migrator IN SCHEMA orders
    GRANT USAGE, SELECT ON SEQUENCES TO orders_app;
```

Cùng nguyên tắc áp dụng cho mọi tầng: IAM role riêng cho từng service (không dùng chung một tài khoản cloud "admin"), Kubernetes service account riêng với RBAC tối thiểu, Vault policy theo path, topic Kafka có ACL đọc/ghi riêng. Với con người: không ai có quyền production thường trực; dùng truy cập **just-in-time** có phê duyệt và thời hạn, có quy trình *break-glass* cho sự cố khẩn cấp (được ghi log và review sau), và rà soát quyền định kỳ.

## Tuân thủ: GDPR, PCI-DSS, ISO 27001

Tuân thủ (*compliance*) thường đến với kiến trúc sư qua câu hỏi của khách hàng hoặc kiểm toán: "hệ thống đáp ứng X thế nào?". Cách làm đúng là biến các yêu cầu thành **yêu cầu phi chức năng** ngay từ thiết kế, kèm bằng chứng kiểm tra được.

### GDPR

**GDPR** (General Data Protection Regulation) là quy định của Liên minh châu Âu về bảo vệ dữ liệu cá nhân, áp dụng cả cho tổ chức ngoài EU nếu cung cấp hàng hoá/dịch vụ cho hoặc theo dõi hành vi của người ở EU. Các điểm có tác động kiến trúc:

- **Nguyên tắc:** hợp pháp và minh bạch, giới hạn mục đích, **tối thiểu hoá dữ liệu**, chính xác, **giới hạn thời gian lưu trữ**, toàn vẹn và bảo mật, trách nhiệm giải trình; *privacy by design and by default*.
- **Quyền của chủ thể dữ liệu:** truy cập, chỉnh sửa, **xoá** ("quyền được lãng quên"), hạn chế xử lý, di chuyển dữ liệu, phản đối.
- **Thông báo vi phạm** cho cơ quan giám sát trong vòng 72 giờ kể từ khi biết (khi khả thi); mức phạt tối đa tới 20 triệu euro hoặc 4% doanh thu toàn cầu hằng năm, tuỳ giá trị nào lớn hơn.

Quyết định kiến trúc tương ứng: lập **bản đồ dữ liệu cá nhân** (service nào lưu PII gì, ở đâu, bao lâu); chỉ thu thập trường thật sự cần; job xoá dữ liệu hết hạn lưu trữ; API xuất và xoá dữ liệu của một người xuyên suốt các service. Xoá dữ liệu trong backup và event log bất biến (Kafka) là bài toán khó – kỹ thuật **crypto-shredding** giải quyết bằng cách mã hoá dữ liệu mỗi người bằng một khoá riêng, khi cần xoá chỉ việc huỷ khoá. Dữ liệu phân tích nên được giả danh hoá. Với người dùng Việt Nam, khung pháp lý về bảo vệ dữ liệu cá nhân gồm Nghị định 13/2023/NĐ-CP và Luật Bảo vệ dữ liệu cá nhân; hãy làm việc với bộ phận pháp chế để xác định nghĩa vụ cụ thể.

### PCI-DSS

**PCI-DSS** (Payment Card Industry Data Security Standard) là tiêu chuẩn do Hội đồng tiêu chuẩn bảo mật ngành thẻ (PCI SSC, do các tổ chức thẻ lớn thành lập) ban hành, bắt buộc theo hợp đồng với mọi đơn vị lưu trữ, xử lý hoặc truyền dữ liệu chủ thẻ. Phiên bản hiện hành thuộc dòng 4.x, gồm 12 nhóm yêu cầu. Những điểm kiến trúc sư phải nắm:

- **Dữ liệu xác thực nhạy cảm** (mã CVV/CVC, dữ liệu dải từ đầy đủ, PIN) **không được lưu sau khi giao dịch được cấp phép**, kể cả khi đã mã hoá.
- **Số thẻ (PAN)** nếu lưu phải ở dạng không đọc được: mã hoá mạnh, tokenization, cắt bớt hoặc băm; khi hiển thị phải che bớt.
- **Phạm vi** (*scope*) là toàn bộ môi trường dữ liệu chủ thẻ (CDE) và mọi thứ kết nối tới nó; phạm vi càng lớn, chi phí tuân thủ càng cao. Trong phạm vi đó có yêu cầu về phân đoạn mạng, MFA, log, quét lỗ hổng và kiểm thử xâm nhập.

Quyết định kiến trúc quan trọng nhất là **thu hẹp phạm vi**: dùng trang thanh toán hoặc form nhúng (hosted fields) của cổng thanh toán để số thẻ đi thẳng từ trình duyệt tới nhà cung cấp; hệ thống của bạn chỉ nhận và lưu **token** để thanh toán lại. Nhờ vậy phần lớn microservice nằm ngoài phạm vi PCI.

### ISO/IEC 27001

**ISO/IEC 27001** là tiêu chuẩn quốc tế về **hệ thống quản lý an toàn thông tin** (ISMS – Information Security Management System). Khác với PCI-DSS, nó không quy định kỹ thuật cụ thể mà yêu cầu tổ chức có quy trình **dựa trên rủi ro**: xác định tài sản và rủi ro, chọn biện pháp kiểm soát, ghi nhận trong *Statement of Applicability*, đánh giá nội bộ, xem xét của lãnh đạo và cải tiến liên tục. Tổ chức có thể được một đơn vị độc lập đánh giá và cấp chứng nhận. Phiên bản 2022 có Phụ lục A gồm 93 biện pháp kiểm soát chia thành bốn nhóm: tổ chức, con người, vật lý và công nghệ.

Với đội phát triển, ISO 27001 thể hiện qua những thứ phải **chứng minh được**: rà soát quyền truy cập, log và giám sát, phát triển an toàn, quản lý thay đổi qua pipeline có review, sao lưu và khôi phục đã kiểm thử.

| | GDPR | PCI-DSS | ISO/IEC 27001 |
|---|---|---|---|
| Bản chất | Luật (quy định của EU) | Tiêu chuẩn ngành, bắt buộc theo hợp đồng | Tiêu chuẩn quản lý, tự nguyện, có chứng nhận |
| Bảo vệ cái gì | Dữ liệu cá nhân và quyền của chủ thể | Dữ liệu chủ thẻ thanh toán | Toàn bộ thông tin của tổ chức |
| Tính chất yêu cầu | Nguyên tắc và nghĩa vụ | Yêu cầu kỹ thuật và quy trình cụ thể | Khung quản lý rủi ro và biện pháp kiểm soát |
| Tác động kiến trúc chính | Bản đồ dữ liệu, tối thiểu hoá, xoá, lưu trữ theo thời hạn | Thu hẹp phạm vi, tokenization, phân đoạn mạng | Kiểm soát truy cập, log, quản lý thay đổi, bằng chứng |

Thực hành tốt là tự động hoá bằng chứng (policy as code, pipeline lưu ai phê duyệt thay đổi nào, báo cáo rà soát quyền sinh tự động) để kiểm toán trở thành việc xuất báo cáo thay vì chạy nước rút thu thập ảnh chụp màn hình.

## Lỗi thường gặp

- **Secret trong Git, image hoặc biến môi trường hiển thị trong manifest.** Đưa vào Vault/secret manager, quét secret trong CI (ví dụ gitleaks) và **đổi ngay** mọi secret từng bị commit.
- **Một mật khẩu database dùng chung cho mọi service, không bao giờ đổi.** Dùng tài khoản riêng cho từng service, ưu tiên secret động có TTL.
- **Kết thúc TLS ở load balancer rồi để mạng nội bộ đi dạng rõ.** Mã hoá mọi chặng, cân nhắc mTLS hoặc service mesh.
- **Có mTLS là coi như đã phân quyền.** Bổ sung chính sách service nào được gọi endpoint nào.
- **Tự chế mã hoá, dùng ECB hoặc dùng lại IV, hard-code khoá trong code.** Dùng AES-GCM với IV ngẫu nhiên, khoá từ KMS/Vault, hoặc dùng Vault Transit.
- **Tài khoản production quyền admin thường trực cho cả team.** Chuyển sang just-in-time access và rà soát định kỳ.
- **Coi tuân thủ là việc của pháp chế, làm vào phút cuối.** Đưa yêu cầu vào thiết kế từ đầu – sửa kiến trúc để thu hẹp phạm vi PCI hay hỗ trợ xoá dữ liệu GDPR sau khi đã xây xong rất tốn kém.

## Bài tập thực hành

1. **Secret động với Vault:** Chạy Vault (chế độ dev) và PostgreSQL bằng Docker, cấu hình secrets engine `database` với TTL 5 phút và kết nối một ứng dụng Spring Boot qua Spring Cloud Vault. Quan sát user PostgreSQL được tạo và bị xoá; ghi lại điều xảy ra khi lease chạm `max_ttl` và đề xuất cách xử lý cho production.
2. **mTLS giữa hai service:** Tạo một CA nội bộ bằng `openssl` (hoặc Vault PKI), cấp certificate cho `order-service` và `inventory-service`. Cấu hình SSL bundle với `client-auth: need` cho inventory và `RestClientSsl` cho order. Chứng minh: gọi bằng `curl` không có certificate client bị từ chối; gọi với certificate do CA khác ký cũng bị từ chối.
3. **Đánh giá tuân thủ:** Với hệ thống trong milestone, viết tài liệu ngắn gồm bản đồ dữ liệu cá nhân (service, trường, mục đích, thời hạn lưu), luồng xoá dữ liệu của một khách hàng xuyên các service (kể cả event trên Kafka) và kiến trúc thanh toán giữ hệ thống ngoài phạm vi lưu số thẻ.

## Tóm tắt

- Secret không nằm trong code, image hay Git; dùng Vault hoặc secret manager, ưu tiên secret động ngắn hạn và xác thực bằng danh tính nền tảng để tránh "secret zero".
- KMS quản lý khoá và thường dùng theo envelope encryption: DEK mã hoá dữ liệu, KEK trong KMS mã hoá DEK.
- Mã hoá mọi chặng in-transit; mTLS cho mỗi service một danh tính mật mã, nhưng vẫn cần chính sách phân quyền và quản lý vòng đời certificate.
- Mã hoá at-rest ở nhiều tầng: đĩa và TDE làm mặc định, mã hoá field-level hoặc tokenization cho dữ liệu đặc biệt nhạy cảm; mật khẩu thì băm.
- Zero Trust: vị trí mạng không mang lại tin cậy, xác thực và phân quyền mọi request, phân đoạn vi mô, giả định đã bị xâm nhập.
- Least privilege áp dụng cho user database, IAM, Kubernetes, Vault và cả con người với truy cập just-in-time.
- GDPR, PCI-DSS, ISO 27001 cần được dịch thành quyết định kiến trúc từ đầu: bản đồ dữ liệu và xoá dữ liệu, thu hẹp phạm vi thẻ, bằng chứng kiểm soát được tự động hoá.
