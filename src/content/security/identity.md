Trong hệ thống doanh nghiệp, câu hỏi "ai đang gọi và họ được phép làm gì" xuất hiện ở mọi điểm: trình duyệt, ứng dụng mobile, API gateway, từng microservice, job chạy đêm. Nếu mỗi ứng dụng tự quản lý tài khoản và mật khẩu, bạn sẽ có hàng chục kho người dùng rời rạc, chính sách mật khẩu không đồng nhất và không thể thu hồi quyền của một nhân viên nghỉ việc ở mọi nơi cùng lúc. Identity & Access Management (IAM) giải quyết điều đó bằng một Identity Provider tập trung và các giao thức chuẩn OAuth 2.0, OpenID Connect. Với Solution Architect, chọn đúng luồng, đúng loại token và mô hình phân quyền là quyết định kiến trúc có ảnh hưởng lâu dài và rất tốn kém nếu phải làm lại.

## Mục tiêu bài học

- Giải thích các vai trò trong OAuth 2.0 và hai luồng chính: Authorization Code + PKCE, Client Credentials.
- Phân biệt OpenID Connect với OAuth 2.0, ID token với access token, JWT với opaque token.
- Thiết kế SSO cho nhiều ứng dụng và microservice với Keycloak.
- Lựa chọn và kết hợp mô hình phân quyền RBAC, ABAC phù hợp với nghiệp vụ.

## Nền tảng OAuth 2.0

**OAuth 2.0** là khung **uỷ quyền** (*delegated authorization*): nó cho phép một ứng dụng truy cập tài nguyên thay mặt người dùng (hoặc thay mặt chính nó) mà không cần biết mật khẩu của người dùng. Bản thân OAuth 2.0 **không phải** giao thức xác thực – nó không định nghĩa cách ứng dụng biết người dùng là ai; phần đó do OpenID Connect bổ sung.

| Vai trò | Ý nghĩa | Ví dụ |
|---|---|---|
| Resource Owner | Chủ sở hữu dữ liệu, thường là người dùng | Khách hàng của shop |
| Client | Ứng dụng muốn truy cập tài nguyên | Web app, mobile app, BFF, job batch |
| Authorization Server | Xác thực người dùng, cấp token | Keycloak, Okta, Entra ID, Spring Authorization Server |
| Resource Server | API giữ tài nguyên, kiểm tra token | Order API, Inventory API |

Các khái niệm đi kèm:

- **Access token:** "vé" để gọi API, thời hạn ngắn (vài phút). Resource server kiểm tra nó ở mỗi request.
- **Refresh token:** dùng để lấy access token mới mà không bắt người dùng đăng nhập lại. Có thời hạn dài hơn nên phải được bảo vệ kỹ; nên bật **refresh token rotation** (mỗi lần dùng thì nhận refresh token mới, token cũ vô hiệu) để phát hiện token bị đánh cắp.
- **Scope:** phạm vi quyền mà client xin, ví dụ `orders:read`. Người dùng (hoặc chính sách) đồng ý cấp.
- **Client công khai và client bí mật:** *confidential client* (chạy trên server, giữ được `client_secret`) và *public client* (SPA, mobile, ứng dụng desktop – mọi bí mật nhúng trong đó đều có thể bị trích xuất).

Hai luồng cũ là Implicit và Resource Owner Password Credentials đã bị khuyến cáo không dùng trong *OAuth 2.0 Security Best Current Practice* (RFC 9700) và bị loại khỏi bản thảo OAuth 2.1. Trong thực tế, bạn chủ yếu cần hai luồng dưới đây.

## Authorization Code + PKCE

Luồng **Authorization Code** dùng khi có **người dùng**: người dùng đăng nhập trực tiếp trên Authorization Server (ứng dụng không bao giờ thấy mật khẩu), rồi client nhận một mã tạm thời (*authorization code*) và đổi mã đó lấy token qua một kênh riêng.

```text
1. Client sinh code_verifier ngẫu nhiên, tính code_challenge = BASE64URL(SHA256(code_verifier)),
   sinh state (và nonce nếu dùng OIDC)
2. Trình duyệt được chuyển tới Authorization Server:
   GET /authorize?response_type=code&client_id=order-web&redirect_uri=https://shop.example.com/callback
       &scope=openid%20orders:read&state=...&code_challenge=...&code_challenge_method=S256
3. Người dùng đăng nhập (mật khẩu, MFA) và đồng ý cấp quyền ngay trên Authorization Server
4. Authorization Server chuyển hướng về redirect_uri?code=...&state=...
5. Client kiểm tra state khớp với giá trị đã sinh, rồi gọi trực tiếp (back-channel):
   POST /token  grant_type=authorization_code&code=...&redirect_uri=...&code_verifier=...
6. Authorization Server kiểm tra SHA256(code_verifier) khớp code_challenge đã nhận ở bước 2
   → trả access_token (+ id_token, refresh_token)
7. Client gọi API với header  Authorization: Bearer <access_token>
```

### PKCE hoạt động thế nào

Mã `code` ở bước 4 đi qua trình duyệt (URL redirect), nên có thể bị lộ: qua log, qua lịch sử, hoặc trên mobile bị một ứng dụng độc hại đăng ký cùng custom URL scheme chặn lấy. **PKCE** (Proof Key for Code Exchange, RFC 7636) đảm bảo chỉ client nào đã *bắt đầu* luồng mới đổi được code: client giữ `code_verifier` bí mật, chỉ gửi bản băm `code_challenge` lúc đầu. Kẻ chặn được code nhưng không có `code_verifier` thì không đổi được token.

```java
public record PkcePair(String verifier, String challenge) {

    private static final SecureRandom RANDOM = new SecureRandom();

    public static PkcePair generate() {
        byte[] bytes = new byte[32];                         // 32 byte → verifier dài 43 ký tự
        RANDOM.nextBytes(bytes);
        String verifier = Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
        try {
            byte[] digest = MessageDigest.getInstance("SHA-256")
                    .digest(verifier.getBytes(StandardCharsets.US_ASCII));
            String challenge = Base64.getUrlEncoder().withoutPadding().encodeToString(digest);
            return new PkcePair(verifier, challenge);
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException("SHA-256 không khả dụng", e);
        }
    }
}
```

Bạn hiếm khi phải tự viết đoạn này – Spring Security, thư viện OIDC cho SPA và mobile đều làm sẵn – nhưng hiểu nó giúp bạn đọc log và chẩn đoán lỗi `invalid_grant`. PKCE ban đầu được thiết kế cho public client, nay được khuyến nghị cho **mọi** client, kể cả confidential client.

Ba chi tiết bảo mật khác của luồng này:

- **`state`:** giá trị ngẫu nhiên gắn với phiên trình duyệt, chống CSRF trên endpoint callback.
- **`nonce`** (OIDC): được Authorization Server đưa vào ID token; client kiểm tra để chống phát lại (*replay*) ID token.
- **`redirect_uri` khớp chính xác** với giá trị đã đăng ký. Cho phép wildcard là mở đường cho kẻ tấn công nhận code về domain của họ.

### SPA: token ở đâu?

Với SPA, có hai lựa chọn kiến trúc. SPA tự làm public client (Authorization Code + PKCE) và giữ token trong bộ nhớ JavaScript – đơn giản, nhưng nếu trang bị XSS thì token có thể bị đánh cắp. Hoặc dùng mẫu **BFF** (Backend-for-Frontend): một backend nhỏ cùng domain làm confidential client, giữ token phía server và chỉ cấp cho trình duyệt một session cookie `HttpOnly`, `Secure`, `SameSite`; BFF gắn access token khi chuyển tiếp request tới API. BFF an toàn hơn cho ứng dụng nhạy cảm (tài chính, y tế), đổi lại phải vận hành thêm một thành phần và bật CSRF protection vì đã quay về dùng cookie.

## Client Credentials

Luồng **Client Credentials** dùng khi **không có người dùng**: service gọi service, job batch, tích hợp hệ thống. Client tự xác thực với Authorization Server và nhận access token đại diện cho chính nó.

```bash
curl -s -X POST http://localhost:8080/realms/shop/protocol/openid-connect/token \
  -d grant_type=client_credentials \
  -d client_id=report-job \
  -d client_secret="$REPORT_JOB_SECRET" \
  -d scope=orders:read
```

Những điểm thiết kế cần chú ý:

- **Cách client xác thực:** `client_secret` là đơn giản nhất nhưng là một secret dài hạn phải lưu và xoay vòng. Mạnh hơn là `private_key_jwt` (client ký một JWT bằng khoá riêng, Authorization Server giữ khoá công khai) hoặc mTLS.
- **Cache token** tới gần lúc hết hạn thay vì xin token mới cho mỗi request – `OAuth2AuthorizedClientManager` của Spring Security làm việc này.
- **Mỗi service một client riêng** với scope tối thiểu, để có thể thu hồi và audit riêng từng service.
- **Khi cần giữ ngữ cảnh người dùng** qua nhiều service, Client Credentials làm mất thông tin "thay mặt ai". Có hai cách: *token relay* (chuyển tiếp access token của người dùng – đơn giản nhưng token phải được chấp nhận ở nhiều API) hoặc *token exchange* (RFC 8693: đổi token của người dùng lấy token mới có audience hẹp cho service đích).

## OpenID Connect

**OpenID Connect** (OIDC) là lớp **xác thực** xây trên OAuth 2.0. Client xin thêm scope `openid`, và ngoài access token, Authorization Server (lúc này gọi là *OpenID Provider*) trả về **ID token** – một JWT mô tả *người dùng đã đăng nhập như thế nào*. OIDC còn chuẩn hoá:

- **Discovery:** `/.well-known/openid-configuration` liệt kê mọi endpoint (authorize, token, userinfo, jwks, end_session) để client tự cấu hình – đây là thứ Spring dùng khi bạn khai báo `issuer-uri`.
- **JWKS:** tập khoá công khai để kiểm tra chữ ký token.
- **UserInfo endpoint:** trả thêm thông tin người dùng khi được gọi bằng access token.
- **Đăng xuất:** RP-initiated logout (ứng dụng chuyển người dùng tới endpoint đăng xuất của provider) và back-channel logout (provider gọi server-to-server tới từng ứng dụng để huỷ session).

Payload của một ID token:

```json
{
  "iss": "https://sso.example.com/realms/shop",
  "sub": "8f14e45f-ceea-467a-9575-1c2a3b4d5e6f",
  "aud": "order-web",
  "azp": "order-web",
  "exp": 1767225900,
  "iat": 1767225600,
  "auth_time": 1767225590,
  "nonce": "n-0S6_WzA2Mj",
  "preferred_username": "lan.nguyen",
  "email": "lan.nguyen@example.com"
}
```

### ID token và access token

| | ID token | Access token |
|---|---|---|
| Mục đích | Cho **client** biết người dùng là ai, đăng nhập lúc nào | Cho **API** biết request được phép làm gì |
| Người nhận (`aud`) | `client_id` của ứng dụng | API (resource server) |
| Định dạng | Luôn là JWT | JWT hoặc opaque, tuỳ Authorization Server |
| Ai đọc nội dung | Client đọc và kiểm tra | Chỉ resource server; client nên coi là chuỗi không đọc |
| Gửi tới API? | **Không** | Có, qua `Authorization: Bearer` |

Hai sai lầm phổ biến: gửi ID token tới API như bearer token (API không phải người nhận của nó), và để client tự parse access token để lấy thông tin người dùng (định dạng access token có thể thay đổi bất kỳ lúc nào; thông tin người dùng nên lấy từ ID token hoặc UserInfo).

### JWT hay opaque cho access token?

| | JWT (self-contained) | Opaque + introspection |
|---|---|---|
| Kiểm tra | Cục bộ bằng khoá công khai, không gọi mạng | Gọi endpoint introspection (RFC 7662) |
| Thu hồi | Khó trước khi hết hạn → thời hạn ngắn | Tức thì |
| Hiệu năng | Tốt, IdP không nằm trên đường nóng | Thêm độ trễ, thường phải cache |
| Lộ thông tin | Claim đọc được bởi bất kỳ ai cầm token | Không lộ gì |

Phần lớn hệ thống microservice chọn JWT với thời hạn ngắn (5–15 phút) cộng refresh token rotation; opaque phù hợp khi cần thu hồi tức thì hoặc token đi ra bên thứ ba.

## SSO với Keycloak

**Keycloak** là Identity Provider mã nguồn mở hỗ trợ OIDC, OAuth 2.0 và SAML 2.0. Các khái niệm chính:

| Khái niệm | Ý nghĩa |
|---|---|
| Realm | Không gian quản lý độc lập: người dùng, client, role, chính sách riêng. Mỗi tổ chức/môi trường thường là một realm |
| Client | Ứng dụng đăng ký với realm: `order-web` (confidential, Authorization Code), `report-job` (Client Credentials) |
| User, Group | Người dùng và nhóm; gán role cho group để dễ quản lý |
| Realm role, client role | Role dùng chung toàn realm, hoặc role riêng của một client |
| Client scope, mapper | Quy định claim nào được đưa vào token (role, email, audience…) |
| Identity Provider | Liên kết đăng nhập tới IdP khác (Google, Entra ID, SAML IdP của đối tác) – *identity brokering* |
| User Federation | Đọc người dùng từ LDAP/Active Directory có sẵn |

### SSO hoạt động thế nào

Khi người dùng đăng nhập ứng dụng A, Keycloak tạo một **SSO session** và đặt cookie trên domain của Keycloak. Khi người dùng mở ứng dụng B cùng realm, B chuyển hướng tới Keycloak theo luồng Authorization Code; Keycloak thấy session còn hiệu lực nên trả code ngay mà không hỏi mật khẩu. Đối với người dùng, đó là "đăng nhập một lần". Thời gian sống của SSO session (idle và max) là cấu hình của realm, tách biệt với thời hạn access token.

### Chạy thử và tích hợp

```bash
# Môi trường dev: dữ liệu lưu cục bộ, KHÔNG dùng cho production
docker run -p 8080:8080 \
  -e KC_BOOTSTRAP_ADMIN_USERNAME=admin \
  -e KC_BOOTSTRAP_ADMIN_PASSWORD=admin \
  quay.io/keycloak/keycloak:26.0.0 start-dev

# Metadata OIDC của realm "shop"
curl -s http://localhost:8080/realms/shop/.well-known/openid-configuration
```

Kiến trúc tham chiếu cho hệ thống microservice:

```text
 [Trình duyệt] ──session cookie──► (BFF / Gateway: OAuth2 Client)
                                        │   ▲ Authorization Code + PKCE
                                        │   └──────────────► (Keycloak, realm "shop")
                                        │ Bearer access token          ▲ JWKS: khoá công khai
                                        ▼                              │
                                  (Order API: Resource Server) ────────┤
                                        │ Client Credentials           │
                                        │ hoặc Token Exchange          │
                                        ▼                              │
                                  (Inventory API: Resource Server) ────┘
```

Mỗi API là một resource server kiểm tra token cục bộ bằng JWKS (cấu hình Spring đã trình bày trong bài Spring Security). Lưu ý Keycloak chỉ đưa API vào claim `aud` của access token khi bạn cấu hình *audience mapper* trong client scope; hãy làm điều đó để API kiểm tra được `aud`.

Khi đưa Keycloak lên production:

- Chạy chế độ production (`start`) với hostname, TLS và database ngoài (PostgreSQL); chạy nhiều node để đảm bảo sẵn sàng cao, vì Keycloak sập nghĩa là không ai đăng nhập được.
- Không dùng realm `master` cho ứng dụng; chỉ dùng nó để quản trị.
- Quản lý cấu hình realm như code (export/import, công cụ như keycloak-config-cli hoặc Terraform provider) để môi trường có thể tái lập và review được.
- Bật brute force detection, MFA (OTP, WebAuthn) cho tài khoản quản trị và nhân viên; giữ access token ngắn hạn.
- Theo dõi login event và admin event để phục vụ audit.

## Thiết kế phân quyền RBAC và ABAC

### RBAC

**RBAC** (Role-Based Access Control): người dùng được gán **role**, role gắn với tập **quyền**. RBAC dễ hiểu, dễ audit ("ai có role FINANCE_APPROVER?") và được mọi framework hỗ trợ. Điểm yếu là **bùng nổ role** (*role explosion*): khi quyền phụ thuộc ngữ cảnh – phòng ban, chi nhánh, hạn mức – bạn bắt đầu tạo `APPROVER_HN_DEPT_A_UNDER_50M`, và số role tăng theo cấp số nhân.

### ABAC

**ABAC** (Attribute-Based Access Control): quyết định dựa trên **chính sách** đánh giá thuộc tính của *chủ thể* (phòng ban, chức danh, hạn mức), *tài nguyên* (chủ sở hữu, độ mật, số tiền), *hành động* (đọc, duyệt) và *môi trường* (thời gian, vị trí, mức độ tin cậy của thiết bị). Ví dụ: "Quản lý được duyệt khoản chi của phòng mình, không quá hạn mức cá nhân, không tự duyệt khoản của chính mình, trong giờ làm việc."

```java
@Component
public class ExpenseApprovalPolicy {

    private static final ZoneId VN = ZoneId.of("Asia/Ho_Chi_Minh");
    private final Clock clock;

    public ExpenseApprovalPolicy(Clock clock) { this.clock = clock; }

    public Decision canApprove(Employee approver, Expense expense) {
        if (!approver.roles().contains("MANAGER"))                      // thuộc tính chủ thể (RBAC)
            return Decision.deny("Không phải quản lý");
        if (!approver.departmentId().equals(expense.departmentId()))    // chủ thể vs tài nguyên
            return Decision.deny("Khác phòng ban");
        if (expense.submittedBy().equals(approver.id()))
            return Decision.deny("Không được tự duyệt khoản của mình");
        if (expense.amount().compareTo(approver.approvalLimit()) > 0)
            return Decision.deny("Vượt hạn mức duyệt");
        LocalTime now = LocalTime.now(clock.withZone(VN));               // thuộc tính môi trường
        if (now.isBefore(LocalTime.of(8, 0)) || !now.isBefore(LocalTime.of(18, 0)))
            return Decision.deny("Ngoài giờ làm việc");
        return Decision.permit();
    }
}

public record Decision(boolean allowed, String reason) {
    public static Decision permit() { return new Decision(true, null); }
    public static Decision deny(String reason) { return new Decision(false, reason); }
}
```

Trả về `Decision` kèm lý do (thay vì chỉ `boolean`) giúp ghi audit log và giải thích cho người dùng vì sao bị từ chối. Chính sách này có thể được gọi từ `@PreAuthorize` qua bean reference, hoặc trực tiếp trong service sau khi tải `Expense`.

| Tiêu chí | RBAC | ABAC |
|---|---|---|
| Mô hình | Người dùng → role → quyền | Chính sách trên thuộc tính |
| Độ linh hoạt | Thấp với quy tắc theo ngữ cảnh | Cao |
| Audit "ai có quyền gì" | Dễ | Khó hơn, phải đánh giá chính sách |
| Hiệu năng | Kiểm tra chuỗi trong token | Có thể cần tải thuộc tính từ database |
| Phù hợp | Quyền thô theo chức năng | Quy tắc nghiệp vụ theo dữ liệu, tuân thủ |

Ngoài hai mô hình trên còn có **ReBAC** (Relationship-Based Access Control – quyền dựa trên quan hệ như "thành viên của dự án", "người được chia sẻ tài liệu"), phổ biến trong ứng dụng cộng tác, với các engine như OpenFGA.

### Kết hợp trong kiến trúc

Thực tế tốt nhất là **kết hợp**: RBAC và scope cho quyết định thô, ABAC cho quyết định theo dữ liệu.

- **Ở gateway/resource server:** kiểm tra token hợp lệ, `aud` đúng, scope/role thô (`SCOPE_orders:write`, `ROLE_STAFF`).
- **Ở service:** kiểm tra theo dữ liệu (chủ sở hữu, phòng ban, hạn mức) – chỉ service mới có dữ liệu để quyết định.
- **Scope khác role:** scope là quyền *người dùng uỷ cho client*, role là quyền *của người dùng*. Quyền thực tế của một request là giao của hai thứ: ứng dụng báo cáo chỉ có scope `orders:read` thì không thể huỷ đơn, kể cả khi người dùng là admin.
- **Đừng nhồi mọi quyền chi tiết vào token:** token phình to, quyền thay đổi phải chờ token hết hạn mới có hiệu lực. Đưa vào token những thuộc tính ổn định (role, tenant, phòng ban); quyền chi tiết tra cứu lúc chạy.
- Khi nhiều service cùng cần một bộ chính sách, cân nhắc tách thành **Policy Decision Point** dùng chung (Open Policy Agent, Keycloak Authorization Services), còn mỗi service là **Policy Enforcement Point** gọi tới nó – đổi lại là thêm độ trễ và thêm một thành phần phải vận hành.

## Lỗi thường gặp

- **Dùng OAuth 2.0 như giao thức đăng nhập** (coi có access token là đã biết người dùng). Dùng OIDC và kiểm tra ID token: chữ ký, `iss`, `aud`, `exp`, `nonce`.
- **Gửi ID token tới API, hoặc API không kiểm tra `aud`.** Token phát cho ứng dụng khác cũng được chấp nhận. Chỉ nhận access token có `aud` là chính API.
- **Nhúng `client_secret` vào SPA hoặc mobile app.** Public client không giữ được bí mật; dùng PKCE hoặc BFF.
- **Cho phép `redirect_uri` dạng wildcard.** Đăng ký URI chính xác cho từng môi trường.
- **Access token sống hàng giờ, refresh token không rotation.** Giữ access token ngắn, bật rotation và thu hồi refresh token khi đăng xuất.
- **Một client dùng chung cho mọi service.** Không thể thu hồi hay audit riêng. Mỗi service một client với scope tối thiểu.
- **Tạo role cho mọi tổ hợp ngữ cảnh.** Khi thấy role chứa tên phòng ban hay hạn mức, đó là lúc chuyển phần đó sang ABAC.
- **Cấu hình Keycloak bằng tay trên giao diện ở mọi môi trường.** Quản lý realm như code.

## Bài tập thực hành

1. **Quan sát luồng Authorization Code + PKCE:** Chạy Keycloak bằng Docker, tạo realm `shop`, client `order-web` và một người dùng. Thực hiện luồng thủ công: tự sinh `code_verifier`/`code_challenge` bằng đoạn Java trong bài, mở URL `/authorize` trên trình duyệt, lấy `code` từ redirect, đổi token bằng `curl`. Thử đổi code với `code_verifier` sai và ghi lại lỗi trả về. Giải mã ID token và access token, so sánh `aud` và các claim.
2. **SSO cho hai ứng dụng và một API:** Tạo hai ứng dụng Spring Boot dùng `oauth2Login()` (client `admin-web` và `shop-web`) và một Order API là resource server. Chứng minh đăng nhập ở ứng dụng thứ nhất thì vào ứng dụng thứ hai không phải nhập lại mật khẩu. Cấu hình audience mapper để access token có `aud: order-api` và để API từ chối token thiếu `aud`. Thêm một job dùng Client Credentials gọi API với scope `orders:read`.
3. **Thiết kế phân quyền:** Cho nghiệp vụ duyệt chi phí của một công ty có 3 chi nhánh, 10 phòng ban, hạn mức duyệt theo cấp bậc. Viết tài liệu thiết kế ngắn: role nào nằm trong Keycloak, thuộc tính nào trong token, chính sách ABAC nào ở service. Hiện thực `ExpenseApprovalPolicy` và viết unit test với `Clock.fixed(...)` cho các trường hợp được và bị từ chối.

## Tóm tắt

- OAuth 2.0 là khung uỷ quyền; OIDC bổ sung lớp xác thực với ID token, discovery, JWKS và UserInfo.
- Authorization Code + PKCE cho mọi trường hợp có người dùng; PKCE ràng buộc việc đổi code với client đã khởi tạo luồng.
- Client Credentials cho service-to-service không có người dùng; mỗi service một client, scope tối thiểu, cache token.
- ID token dành cho client, access token dành cho API; API phải kiểm tra chữ ký, `iss`, `exp` và `aud`.
- Keycloak cung cấp SSO qua SSO session; production cần chạy nhiều node, database ngoài, cấu hình realm như code và MFA.
- RBAC cho quyền thô, ABAC cho quy tắc theo dữ liệu và ngữ cảnh; kiểm tra thô ở gateway, kiểm tra theo dữ liệu ở service.
