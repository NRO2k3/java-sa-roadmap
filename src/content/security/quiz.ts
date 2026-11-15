import type { LessonQuiz } from '../types';

const quiz: LessonQuiz = {
  appsec: [
    {
      question:
        'Đoạn code: jdbcTemplate.query("SELECT * FROM orders WHERE status = ? ORDER BY " + sortParam, mapper, status), trong đó sortParam lấy từ query string. Đánh giá nào đúng?',
      options: [
        'An toàn vì status đã được bind qua placeholder',
        'Vẫn có thể bị SQL injection qua sortParam; cần ánh xạ sortParam qua whitelist tên cột',
        'Chỉ nguy hiểm nếu database là MySQL, PostgreSQL thì an toàn',
        'An toàn nếu escape dấu nháy đơn trong sortParam',
      ],
      answer: 1,
      explanation:
        'Tên cột và chiều sắp xếp không thể tham số hoá, nên phần nối chuỗi vẫn là điểm injection. Escape thủ công dễ bị vượt qua; whitelist ánh xạ giá trị client sang tên cột cố định mới chặn tận gốc.',
    },
    {
      question:
        'Trang sản phẩm hiển thị bình luận của người dùng bằng th:utext để giữ định dạng in đậm, xuống dòng. Rủi ro chính và cách xử lý phù hợp nhất là gì?',
      options: [
        'Không có rủi ro vì Thymeleaf luôn escape nội dung',
        'CSRF; cần thêm CSRF token vào form gửi bình luận',
        'Stored XSS; dùng th:text, hoặc nếu cần giữ HTML thì sanitize theo allowlist và bổ sung CSP',
        'SQL injection; cần dùng PreparedStatement khi lưu bình luận',
      ],
      answer: 2,
      explanation:
        'th:utext xuất nội dung không escape, nên script trong bình luận sẽ chạy trên trình duyệt của mọi người xem. Output encoding (th:text) hoặc sanitize theo allowlist là biện pháp chính, CSP là lớp phòng thủ bổ sung.',
    },
    {
      question:
        'Tính năng webhook cho phép khách hàng nhập URL để hệ thống gọi tới khi đơn hàng thay đổi trạng thái. Biện pháp nào xử lý đúng gốc rủi ro SSRF?',
      options: [
        'Chặn mọi URL chứa chuỗi "localhost" hoặc "127.0.0.1"',
        'Bắt buộc URL dùng https là đủ an toàn',
        'Mã hoá URL trước khi lưu vào database',
        'Allowlist đích, kiểm tra IP sau khi phân giải không thuộc dải nội bộ, tắt redirect và kiểm soát egress',
      ],
      answer: 3,
      explanation:
        'Blocklist theo chuỗi bị vượt qua bằng IP dạng khác, tên miền trỏ về IP nội bộ hoặc redirect. Cần kiểm tra đích thật sự sau khi phân giải, không theo redirect và giới hạn egress ở tầng mạng.',
    },
    {
      question:
        'Nhân viên CSKH thực hiện hoàn tiền cho một đơn hàng rồi phủ nhận việc đó, và hệ thống không có log đáng tin cậy để chứng minh ai đã làm. Theo STRIDE, đây là nhóm mối đe doạ nào?',
      options: ['Repudiation', 'Spoofing', 'Tampering', 'Elevation of privilege'],
      answer: 0,
      explanation:
        'Repudiation là khả năng chối bỏ hành động đã thực hiện, vi phạm thuộc tính không thể chối bỏ. Biện pháp là audit log bất biến ghi ai làm gì, lúc nào.',
    },
    {
      question:
        'OWASP Dependency-Check chặn build vì một thư viện transitive có CVE với CVSS 9.8. Cách xử lý phù hợp nhất là gì?',
      options: [
        'Thêm suppression vĩnh viễn để build xanh trở lại',
        'Đánh giá mức ảnh hưởng, ghi đè lên phiên bản đã vá qua dependencyManagement rồi chạy lại test',
        'Tạm tắt plugin trong pipeline cho tới khi có thời gian xử lý',
        'Nâng ngưỡng failBuildOnCVSS lên 10 cho dự án này',
      ],
      answer: 1,
      explanation:
        'Nâng cấp là cách sửa ưu tiên, và dependency transitive có thể được ghi đè phiên bản qua dependencyManagement. Suppression chỉ dùng khi có lý do rõ ràng, người phê duyệt và ngày hết hạn.',
    },
  ],
  identity: [
    {
      question: 'PKCE bảo vệ luồng Authorization Code trước mối đe doạ nào?',
      options: [
        'Mật khẩu người dùng bị đánh cắp ngay trên trang đăng nhập',
        'Kẻ chặn được authorization code nhưng không có code_verifier nên không đổi được token',
        'Access token bị lộ khi gửi tới resource server',
        'Kẻ tấn công brute force client_secret của ứng dụng',
      ],
      answer: 1,
      explanation:
        'Client chỉ gửi code_challenge (bản băm) lúc bắt đầu và giữ code_verifier tới bước đổi token. Authorization Server chỉ cấp token khi SHA256(code_verifier) khớp code_challenge.',
    },
    {
      question:
        'API order-api nhận bearer token có payload {"iss": "https://sso.example.com/realms/shop", "aud": "order-web", "nonce": "n-0S6_WzA2Mj", "auth_time": 1767225590, "sub": "8f14e45f"}. API nên xử lý thế nào?',
      options: [
        'Chấp nhận vì issuer là IdP tin cậy và chữ ký hợp lệ',
        'Chấp nhận nếu exp chưa tới',
        'Từ chối vì đây là ID token phát cho client order-web, aud không phải order-api',
        'Gọi UserInfo endpoint để đổi token này sang access token',
      ],
      answer: 2,
      explanation:
        'Claim nonce, auth_time và aud bằng client_id là dấu hiệu của ID token, vốn dành cho client chứ không phải API. Resource server chỉ nên nhận access token có aud là chính nó.',
    },
    {
      question:
        'Job đối soát chạy lúc 2 giờ sáng cần gọi Reporting API, không có người dùng nào tham gia. Luồng OAuth 2.0 phù hợp là gì?',
      options: [
        'Client Credentials',
        'Authorization Code + PKCE với một tài khoản người dùng dành cho job',
        'Device Authorization Grant',
        'Dùng refresh token của một admin được lưu sẵn trong cấu hình',
      ],
      answer: 0,
      explanation:
        'Client Credentials dành cho giao tiếp máy với máy: client tự xác thực và nhận token đại diện cho chính nó. Lưu refresh token của người thật vào job vừa sai mục đích vừa khó thu hồi và audit.',
    },
    {
      question:
        'Người dùng đã đăng nhập ứng dụng A, sau đó mở ứng dụng B cùng realm Keycloak và không phải nhập lại mật khẩu. Cơ chế nào tạo ra điều này?',
      options: [
        'Ứng dụng B đọc cookie session của ứng dụng A',
        'Access token của A được chia sẻ cho B qua localStorage',
        'Keycloak lưu mật khẩu trong trình duyệt và tự điền',
        'Keycloak thấy SSO session (cookie trên domain Keycloak) còn hiệu lực nên trả authorization code ngay',
      ],
      answer: 3,
      explanation:
        'B vẫn chạy luồng Authorization Code bình thường, nhưng khi trình duyệt tới Keycloak, SSO session còn hiệu lực nên Keycloak không hỏi mật khẩu. Mỗi ứng dụng vẫn nhận token riêng của mình.',
    },
    {
      question:
        'Quy tắc: quản lý chỉ được duyệt khoản chi của phòng mình, không vượt hạn mức cá nhân và không tự duyệt khoản của chính mình. Mô hình phân quyền nào phù hợp?',
      options: [
        'RBAC thuần, tạo role cho từng tổ hợp phòng ban và hạn mức',
        'ABAC (thường kết hợp RBAC): chính sách đánh giá thuộc tính người duyệt và khoản chi',
        'Chỉ cần scope OAuth phù hợp trong access token',
        'Kiểm tra ở API gateway dựa trên đường dẫn URL',
      ],
      answer: 1,
      explanation:
        'Quy tắc phụ thuộc thuộc tính của chủ thể và tài nguyên nên RBAC thuần dẫn tới bùng nổ role. ABAC đánh giá phòng ban, hạn mức, người tạo khoản chi lúc chạy, thường đặt ở service nơi có dữ liệu.',
    },
  ],
  'infra-security': [
    {
      question:
        'Lợi ích chính của secrets engine database (secret động) trong Vault so với một mật khẩu database dùng chung cho mọi instance là gì?',
      options: [
        'Mật khẩu được mã hoá Base64 trước khi trả cho ứng dụng',
        'Mỗi instance nhận tài khoản riêng có TTL, tự hết hạn và thu hồi được, nên giới hạn thiệt hại khi bị lộ',
        'Ứng dụng không cần kết nối trực tiếp tới database nữa',
        'Vault cache kết quả truy vấn để giảm tải cho database',
      ],
      answer: 1,
      explanation:
        'Secret động ngắn hạn và riêng cho từng instance giúp thu hồi chính xác, audit được ai dùng tài khoản nào và rút ngắn thời gian một credential bị lộ còn dùng được.',
    },
    {
      question: 'Trong envelope encryption với KMS, thứ gì được lưu cạnh dữ liệu đã mã hoá?',
      options: [
        'KEK dạng rõ để giải mã nhanh',
        'DEK dạng rõ',
        'DEK đã được mã hoá bằng KEK',
        'Không lưu gì, mỗi lần giải mã KMS sinh lại khoá từ dữ liệu',
      ],
      answer: 2,
      explanation:
        'DEK mã hoá dữ liệu, còn KEK nằm trong KMS mã hoá DEK. Chỉ DEK đã mã hoá được lưu kèm dữ liệu; muốn giải mã phải gọi KMS, nên quyền và audit được kiểm soát tập trung.',
    },
    {
      question:
        'Cấu hình Spring Boot có server.ssl.bundle: service và server.ssl.client-auth: need. Ý nghĩa của client-auth: need là gì?',
      options: [
        'Server yêu cầu client trình certificate hợp lệ được CA trong truststore ký, nếu không thì từ chối kết nối',
        'Client phải gửi username và password qua HTTP Basic',
        'Server chỉ kiểm tra certificate nếu client tự nguyện gửi',
        'Server bắt buộc client dùng TLS 1.3',
      ],
      answer: 0,
      explanation:
        'need bật mTLS bắt buộc: thiếu certificate hợp lệ thì handshake thất bại. Giá trị want mới là chế độ tuỳ chọn, còn phiên bản TLS được cấu hình ở chỗ khác.',
    },
    {
      question:
        'Order service dùng một user database có quyền DDL (CREATE, DROP) cho cả lúc chạy lẫn lúc chạy migration. Cách áp dụng least privilege phù hợp nhất?',
      options: [
        'Giữ nguyên nhưng đổi mật khẩu thường xuyên hơn',
        'Cấp thêm quyền superuser để tránh lỗi thiếu quyền khi deploy',
        'Dùng chung một user cho mọi service để dễ quản lý',
        'Tách user migration có quyền DDL chỉ dùng trong pipeline và user ứng dụng chỉ có DML trên schema của service',
      ],
      answer: 3,
      explanation:
        'Ứng dụng lúc chạy không cần DDL; nếu bị SQL injection hay bị chiếm quyền, user chỉ có DML trên schema riêng giới hạn đáng kể thiệt hại. Đổi mật khẩu thường xuyên không làm giảm quyền.',
    },
    {
      question:
        'Hệ thống cần hỗ trợ thanh toán định kỳ bằng thẻ. Thiết kế nào thu hẹp phạm vi PCI-DSS nhiều nhất?',
      options: [
        'Lưu số thẻ và CVV đã mã hoá AES-GCM trong một database riêng',
        'Dùng hosted fields của cổng thanh toán và chỉ lưu token do nhà cung cấp trả về',
        'Lưu số thẻ dạng rõ nhưng đặt database trong mạng nội bộ',
        'Lưu CVV trong Redis với TTL ngắn để dùng cho lần thanh toán sau',
      ],
      answer: 1,
      explanation:
        'Khi số thẻ đi thẳng từ trình duyệt tới nhà cung cấp, hệ thống của bạn không lưu, xử lý hay truyền dữ liệu chủ thẻ. CVV không được lưu sau khi giao dịch được cấp phép, kể cả khi đã mã hoá.',
    },
  ],
};

export default quiz;
