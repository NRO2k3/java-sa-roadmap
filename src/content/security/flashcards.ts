import type { LessonFlashcards } from '../types';

const flashcards: LessonFlashcards = {
  appsec: [
    {
      front: 'Vì sao framework không tự sửa được Broken Access Control?',
      back: 'Spring Security biết người dùng là ai, nhưng chỉ code nghiệp vụ mới biết dữ liệu thuộc về ai. Phải kiểm tra quyền sở hữu ở tầng service và viết test phân quyền.',
    },
    {
      front: 'Cách phòng SQL injection tận gốc?',
      back: 'Tham số hoá truy vấn: câu lệnh và giá trị được gửi riêng cho database nên giá trị không bao giờ thành cú pháp. Phần không tham số hoá được như tên cột, chiều sắp xếp phải qua whitelist.',
    },
    {
      front: 'Ba dạng XSS?',
      back: 'Stored: payload được lưu rồi hiển thị cho người khác. Reflected: payload trong tham số được phản chiếu ngay vào response. DOM-based: JavaScript phía client tự chèn dữ liệu không tin cậy vào DOM.',
    },
    {
      front: 'Output encoding theo ngữ cảnh là gì?',
      back: 'Mã hoá dữ liệu khi xuất, đúng với nơi nó xuất hiện: nội dung HTML, thuộc tính, JavaScript, URL. Thymeleaf th:text và JSX của React làm điều này mặc định.',
    },
    {
      front: 'Content Security Policy (CSP) giúp gì?',
      back: 'Giới hạn nguồn script và tài nguyên mà trình duyệt được phép tải, là lớp phòng thủ bổ sung khi XSS lọt qua. Spring Security không tự đặt CSP, bạn phải khai báo theo ứng dụng.',
    },
    {
      front: 'Vì sao CSRF chỉ đe doạ xác thực dựa trên cookie?',
      back: 'Trình duyệt tự gắn cookie vào request do trang khác khởi tạo, nhưng không tự gắn header Authorization. API stateless dùng bearer token trong header không bị CSRF theo cơ chế này.',
    },
    {
      front: 'Vì sao SSRF đặc biệt nguy hiểm trên cloud?',
      back: 'Server có thể bị lừa gọi endpoint metadata 169.254.169.254, nơi có thể chứa credential tạm thời của máy, hoặc dịch vụ nội bộ không xác thực. Server trở thành proxy vượt qua firewall.',
    },
    {
      front: 'SCA (Software Composition Analysis) là gì?',
      back: 'Tự động đối chiếu dependency, kể cả transitive, với cơ sở dữ liệu lỗ hổng như NVD. Công cụ: OWASP Dependency-Check, Snyk, Dependabot, OSV-Scanner, Trivy.',
    },
    {
      front: 'SBOM dùng để làm gì?',
      back: 'Danh sách thành phần phần mềm theo chuẩn CycloneDX hoặc SPDX cho mỗi bản phát hành, giúp trả lời ngay hệ thống nào đang dùng thư viện X phiên bản Y khi có CVE mới.',
    },
    {
      front: 'Sáu nhóm STRIDE và thuộc tính bị vi phạm?',
      back: 'Spoofing: xác thực. Tampering: toàn vẹn. Repudiation: không thể chối bỏ. Information disclosure: bảo mật. Denial of service: sẵn sàng. Elevation of privilege: phân quyền.',
    },
    {
      front: 'Trust boundary trong DFD là gì?',
      back: 'Ranh giới nơi dữ liệu đi từ vùng ít tin cậy sang vùng tin cậy hơn, ví dụ từ Internet vào API gateway. Mối đe doạ thường tập trung ở các luồng cắt qua ranh giới này.',
    },
    {
      front: 'Bốn câu hỏi cốt lõi của threat modeling?',
      back: 'Chúng ta đang xây dựng gì? Điều gì có thể sai? Chúng ta sẽ làm gì với nó? Chúng ta đã làm đủ tốt chưa?',
    },
  ],
  identity: [
    {
      front: 'OAuth 2.0 là giao thức xác thực hay uỷ quyền?',
      back: 'Uỷ quyền: cho phép ứng dụng truy cập tài nguyên thay mặt người dùng mà không biết mật khẩu. Phần xác thực (người dùng là ai) do OpenID Connect bổ sung.',
    },
    {
      front: 'Confidential client khác public client thế nào?',
      back: 'Confidential client chạy trên server và giữ được client_secret. Public client như SPA, mobile, desktop không giữ được bí mật, nên dùng PKCE hoặc mẫu BFF.',
    },
    {
      front: 'code_challenge trong PKCE được tính thế nào?',
      back: 'code_challenge = BASE64URL(SHA256(code_verifier)) với code_challenge_method=S256. code_verifier là chuỗi ngẫu nhiên, client giữ bí mật và chỉ gửi ở bước đổi code lấy token.',
    },
    {
      front: 'state và nonce khác nhau thế nào?',
      back: 'state chống CSRF trên endpoint callback, client so khớp giá trị khi nhận redirect. nonce được Authorization Server đưa vào ID token để client chống phát lại ID token.',
    },
    {
      front: 'Refresh token rotation là gì?',
      back: 'Mỗi lần dùng refresh token, client nhận một refresh token mới và token cũ bị vô hiệu. Nhờ vậy dễ phát hiện và hạn chế thiệt hại khi refresh token bị đánh cắp.',
    },
    {
      front: 'Mẫu BFF cho SPA hoạt động thế nào?',
      back: 'Một backend cùng domain làm confidential client, giữ token phía server; trình duyệt chỉ có session cookie HttpOnly, Secure, SameSite. Vì quay lại dùng cookie nên phải bật CSRF protection.',
    },
    {
      front: 'Token exchange (RFC 8693) giải quyết vấn đề gì?',
      back: 'Đổi token của người dùng lấy token mới có audience hẹp cho service đích, giữ được ngữ cảnh người dùng khi request đi qua nhiều service mà không phải chuyển tiếp một token dùng chung.',
    },
    {
      front: 'ID token và access token dành cho ai?',
      back: 'ID token có aud là client_id, dành cho client biết người dùng là ai. Access token dành cho API kiểm tra quyền; client nên coi nó là chuỗi không đọc.',
    },
    {
      front: 'Realm trong Keycloak là gì?',
      back: 'Không gian quản lý độc lập gồm người dùng, client, role và chính sách riêng. Realm master chỉ dùng để quản trị, không dùng cho ứng dụng.',
    },
    {
      front: 'Identity brokering khác user federation thế nào?',
      back: 'Identity brokering: Keycloak chuyển việc đăng nhập tới IdP khác như Google, Entra ID hay SAML IdP của đối tác. User federation: Keycloak đọc người dùng từ LDAP hoặc Active Directory có sẵn.',
    },
    {
      front: 'Role explosion là gì?',
      back: 'Khi RBAC phải nhét ngữ cảnh như phòng ban, chi nhánh, hạn mức vào tên role, số role tăng bùng nổ. Đó là dấu hiệu nên chuyển phần quy tắc theo ngữ cảnh sang ABAC.',
    },
    {
      front: 'Scope khác role thế nào?',
      back: 'Scope là quyền người dùng uỷ cho client; role là quyền của chính người dùng. Quyền thực tế của một request là giao của hai thứ.',
    },
  ],
  'infra-security': [
    {
      front: 'Bài toán "secret zero" là gì?',
      back: 'Để lấy secret từ Vault, ứng dụng cần một credential ban đầu, mà credential đó lại là secret. Lời giải là dùng danh tính do nền tảng cấp như service account Kubernetes hoặc IAM role.',
    },
    {
      front: 'Các secrets engine chính của Vault?',
      back: 'kv lưu key-value có version, database sinh tài khoản database động có TTL, pki cấp certificate, transit mã hoá như một dịch vụ để ứng dụng không phải cầm khoá.',
    },
    {
      front: 'KMS khác secret manager thế nào?',
      back: 'KMS quản lý khoá mã hoá, khoá chính không rời dịch vụ và ứng dụng gọi API để mã hoá, giải mã. Secret manager lưu secret như mật khẩu, API key, có version và hỗ trợ xoay vòng.',
    },
    {
      front: 'Kubernetes Secret có được mã hoá mặc định không?',
      back: 'Không, chỉ được mã hoá Base64. Cần bật mã hoá etcd at-rest, giới hạn RBAC đọc Secret, hoặc đồng bộ từ Vault qua External Secrets Operator hay Secrets Store CSI Driver.',
    },
    {
      front: 'mTLS khác TLS thông thường ở điểm nào?',
      back: 'Với TLS thông thường chỉ client kiểm tra server. Với mTLS, server cũng yêu cầu certificate của client, nhờ đó mỗi service có một danh tính mật mã.',
    },
    {
      front: 'SSL bundle trong Spring Boot là gì?',
      back: 'Từ Boot 3.1, cấu hình keystore và truststore được gom dưới spring.ssl.bundle, dùng chung cho server qua server.ssl.bundle và cho client qua RestClientSsl; reload-on-rotation nạp lại certificate khi file đổi.',
    },
    {
      front: 'Mã hoá field-level ở tầng ứng dụng chống được gì?',
      back: 'Chống DBA, backup bị lộ và SQL injection đọc bảng, vì database chỉ thấy bản mã. Đổi lại không tìm kiếm hay sắp xếp được trên cột đó, trừ khi lưu thêm blind index.',
    },
    {
      front: 'Quy tắc khi dùng AES-GCM?',
      back: 'Dùng IV 12 byte ngẫu nhiên mới cho mỗi lần mã hoá, không bao giờ dùng lại IV với cùng khoá, tag 128 bit. Khoá lấy từ KMS hoặc Vault và lưu kèm phiên bản khoá để xoay vòng.',
    },
    {
      front: 'Crypto-shredding là gì?',
      back: 'Mã hoá dữ liệu của mỗi người bằng một khoá riêng; khi cần xoá theo GDPR chỉ việc huỷ khoá, dữ liệu trong backup và event log bất biến trở nên không đọc được.',
    },
    {
      front: 'Just-in-time access và break-glass là gì?',
      back: 'Just-in-time: quyền production chỉ được cấp khi cần, có phê duyệt và thời hạn. Break-glass: quy trình truy cập khẩn cấp khi có sự cố, được ghi log và review lại sau.',
    },
    {
      front: 'ISO/IEC 27001 là gì?',
      back: 'Tiêu chuẩn quốc tế về hệ thống quản lý an toàn thông tin (ISMS), tiếp cận dựa trên rủi ro và có thể được chứng nhận. Bản 2022 có 93 biện pháp kiểm soát trong Phụ lục A.',
    },
    {
      front: 'GDPR yêu cầu thông báo vi phạm dữ liệu trong bao lâu?',
      back: 'Thông báo cho cơ quan giám sát trong vòng 72 giờ kể từ khi biết về vi phạm, khi khả thi. Kiến trúc cần khả năng phát hiện và điều tra sự cố nhanh.',
    },
  ],
};

export default flashcards;
