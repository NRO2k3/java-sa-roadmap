Spring Security là lựa chọn mặc định để bảo vệ ứng dụng Spring, nhưng cũng nổi tiếng khó hiểu vì vài dòng cấu hình che đi rất nhiều cơ chế. Khi nắm được cách một request đi qua SecurityFilterChain, được xác thực rồi phân quyền, bạn sẽ tự tin cấu hình từ form login cho trang quản trị, JWT cho REST API, tới OAuth2 cho hệ thống microservice – và quan trọng hơn, biết vì sao một request bị trả 401 hay 403. Bài này dùng Spring Security 6 với lambda DSL; `WebSecurityConfigurerAdapter` đã bị loại bỏ và kiểu nối chuỗi bằng `.and()` cũng đã bị deprecate.

## Mục tiêu bài học

- Mô tả kiến trúc filter của Spring Security và đường đi của một request qua SecurityFilterChain.
- Cấu hình xác thực bằng form login, HTTP Basic và JWT; biết khi nào dùng cách nào.
- Triển khai OAuth2 Resource Server (xác thực JWT từ Identity Provider) và OAuth2 Client.
- Phân quyền theo role/authority ở mức URL và mức method với `@PreAuthorize`.

## Kiến trúc SecurityFilterChain

### Từ Servlet filter tới SecurityFilterChain

Spring Security hoạt động hoàn toàn bằng **Servlet filter**, chạy *trước* `DispatcherServlet` và controller của bạn.

```text
HTTP request
    │
Tomcat: chuỗi Servlet filter
    │
DelegatingFilterProxy        ← filter của Servlet, chuyển tiếp sang một bean Spring
    │
FilterChainProxy             ← bean "springSecurityFilterChain"
    │  chọn SecurityFilterChain ĐẦU TIÊN khớp với request
    ├─ Chain #1  securityMatcher("/api/**")
    │     SecurityContextHolderFilter → CorsFilter → CsrfFilter → LogoutFilter
    │     → BearerTokenAuthenticationFilter → … → ExceptionTranslationFilter → AuthorizationFilter
    └─ Chain #2  mọi request còn lại
          … → UsernamePasswordAuthenticationFilter → BasicAuthenticationFilter → …
          → ExceptionTranslationFilter → AuthorizationFilter
    │
DispatcherServlet → Controller
```

- `DelegatingFilterProxy` là cầu nối: Servlet container không biết gì về bean Spring, nên filter này lấy bean `FilterChainProxy` từ `ApplicationContext` và giao việc cho nó.
- `FilterChainProxy` giữ danh sách các `SecurityFilterChain` và chọn **chain đầu tiên** khớp request (theo `securityMatcher` và thứ tự `@Order`). Nhờ vậy một ứng dụng có thể dùng JWT cho `/api/**` và form login cho phần còn lại.
- Mỗi `SecurityFilterChain` là một danh sách filter có thứ tự. Bật log `logging.level.org.springframework.security=TRACE` để xem chính xác filter nào chạy với từng request – công cụ chẩn đoán hữu ích nhất khi bị 401/403 khó hiểu.

### Các khái niệm cốt lõi

- **`Authentication`**: đại diện cho "ai đang gọi" – gồm principal (người dùng), credentials và danh sách `GrantedAuthority` (quyền).
- **`SecurityContextHolder`**: giữ `SecurityContext` chứa `Authentication` của request hiện tại, mặc định gắn vào thread qua `ThreadLocal`. Trong controller có thể lấy người dùng bằng `@AuthenticationPrincipal`.
- **`AuthenticationManager`**: interface xác thực; implementation thường dùng là `ProviderManager`, uỷ quyền cho một danh sách `AuthenticationProvider` (ví dụ `DaoAuthenticationProvider` dùng `UserDetailsService` + `PasswordEncoder`, `JwtAuthenticationProvider` dùng `JwtDecoder`).
- **`ExceptionTranslationFilter`**: chuyển exception bảo mật thành response. Người dùng **chưa xác thực** → gọi `AuthenticationEntryPoint` (trả 401 hoặc chuyển tới trang login). Người dùng **đã xác thực nhưng thiếu quyền** → gọi `AccessDeniedHandler` (trả 403).
- **`AuthorizationFilter`**: filter cuối cùng, dùng `AuthorizationManager` để kiểm tra các luật trong `authorizeHttpRequests`.

## Cấu hình xác thực: form login, Basic và JWT

### Form login và HTTP Basic

**Form login** phù hợp với ứng dụng web render phía server: người dùng nhập username/password, server tạo HTTP session và trả cookie `JSESSIONID`; các request sau được nhận diện qua cookie. Spring Security tự đổi session id sau khi đăng nhập để chống *session fixation*.

**HTTP Basic** gửi `username:password` mã hoá Base64 trong header `Authorization` ở **mọi** request. Base64 không phải mã hoá bảo mật, nên Basic chỉ chấp nhận được qua HTTPS và phù hợp với công cụ nội bộ hoặc script, không phù hợp cho người dùng cuối.

```java
@Bean
@Order(2)
SecurityFilterChain webChain(HttpSecurity http) throws Exception {
    http
        .authorizeHttpRequests(auth -> auth
            .requestMatchers("/css/**", "/actuator/health").permitAll()
            .requestMatchers("/admin/**").hasRole("ADMIN")
            .anyRequest().authenticated())
        .formLogin(Customizer.withDefaults())       // trang /login mặc định, dùng session cookie
        .httpBasic(Customizer.withDefaults());      // cho script nội bộ gọi bằng Basic
    return http.build();
}

@Bean
PasswordEncoder passwordEncoder() {
    return PasswordEncoderFactories.createDelegatingPasswordEncoder();   // mặc định bcrypt
}

@Bean
UserDetailsService userDetailsService(UserAccountRepository accounts) {
    return username -> accounts.findByUsername(username)
            .map(a -> User.withUsername(a.username())
                    .password(a.passwordHash())                  // dạng "{bcrypt}$2a$10$…"
                    .roles(a.roles().toArray(String[]::new))     // tự thêm tiền tố ROLE_
                    .build())
            .orElseThrow(() -> new UsernameNotFoundException(username));
}
```

`DelegatingPasswordEncoder` lưu hash kèm tiền tố thuật toán (`{bcrypt}`, `{argon2}`…), cho phép nâng cấp thuật toán dần mà không vô hiệu hoá mật khẩu cũ. Không bao giờ lưu mật khẩu dạng rõ hoặc dùng hash nhanh như MD5/SHA-1.

Với ứng dụng dùng session cookie, **CSRF protection phải bật** (mặc định đã bật): trình duyệt tự đính kèm cookie vào mọi request tới domain, kể cả request do trang độc hại khởi tạo, nên server cần một CSRF token mà trang độc hại không đọc được. Thymeleaf tự chèn token này vào form.

### JWT cho REST API stateless

**JWT** (JSON Web Token) gồm ba phần Base64URL nối bằng dấu chấm: `header.payload.signature`. Payload chứa các *claim* như `sub` (chủ thể), `exp` (hết hạn), `scope`. Chữ ký được tạo bằng khoá bí mật dùng chung (HS256) hoặc khoá riêng (RS256/ES256 – bên nhận chỉ cần khoá công khai để kiểm tra). Vì token tự chứa thông tin, server kiểm tra **cục bộ** mà không cần tra database hay session – thuận lợi để mở rộng ngang. Đổi lại, token không thể thu hồi trước hạn một cách đơn giản, nên access token cần thời hạn ngắn (vài phút đến vài chục phút) và dùng refresh token để lấy token mới.

Bạn **không cần tự viết filter đọc JWT**. Spring Security xử lý JWT qua module OAuth2 Resource Server: `BearerTokenAuthenticationFilter` đọc header `Authorization: Bearer …`, `JwtDecoder` kiểm tra chữ ký và thời hạn, `JwtAuthenticationConverter` biến claim thành authority.

```java
@Bean
@Order(1)
SecurityFilterChain apiChain(HttpSecurity http) throws Exception {
    http
        .securityMatcher("/api/**")
        .authorizeHttpRequests(auth -> auth
            .requestMatchers(HttpMethod.GET, "/api/v1/products/**").permitAll()
            .requestMatchers("/api/v1/admin/**").hasRole("ADMIN")
            .requestMatchers(HttpMethod.POST, "/api/v1/orders").hasAuthority("SCOPE_orders:write")
            .anyRequest().authenticated())
        .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
        .csrf(csrf -> csrf.disable())    // token đi trong header Authorization, không dựa vào cookie
        .oauth2ResourceServer(oauth2 -> oauth2
            .jwt(jwt -> jwt.jwtAuthenticationConverter(KeycloakRoles.converter())));
    return http.build();
}
```

Tắt CSRF ở đây là hợp lý vì trình duyệt **không tự động** gắn header `Authorization` vào request do trang khác khởi tạo. Nếu bạn lưu JWT trong cookie, lập luận này không còn đúng và phải bật lại CSRF.

Trong ứng dụng nguyên khối tự phát hành token (ví dụ endpoint `/api/v1/auth/token` sau khi kiểm tra mật khẩu), có thể khai báo `JwtDecoder` và `JwtEncoder` với một khoá HMAC:

```java
@Bean
JwtDecoder jwtDecoder(@Value("${app.jwt.secret}") String secret) {
    return NimbusJwtDecoder.withSecretKey(hmacKey(secret)).build();   // mặc định HS256
}

@Bean
JwtEncoder jwtEncoder(@Value("${app.jwt.secret}") String secret) {
    return new NimbusJwtEncoder(new ImmutableSecret<>(hmacKey(secret)));
}

private static SecretKey hmacKey(String secret) {
    // HS256 yêu cầu khoá tối thiểu 256 bit (32 byte); secret lấy từ biến môi trường/Vault
    return new SecretKeySpec(secret.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
}
```

Khi phát token bằng `JwtEncoder`, tạo `JwtClaimsSet` (issuer, subject, `issuedAt`, `expiresAt`, `scope`) và nhớ chỉ định `JwsHeader.with(MacAlgorithm.HS256)` vì header mặc định là RS256. Khi hệ thống có nhiều service, đừng để mỗi service tự phát token: hãy dùng một Authorization Server chuyên dụng (Keycloak, Spring Authorization Server…) – nội dung của bài Identity & Access Management.

## OAuth2 Resource Server và OAuth2 Client

### Resource Server: xác thực token do Identity Provider phát

Trong kiến trúc OAuth2, **resource server** là API nhận access token và quyết định có phục vụ hay không. Với Spring Boot, chỉ cần `spring-boot-starter-oauth2-resource-server` và vài dòng cấu hình:

```yaml
spring:
  security:
    oauth2:
      resourceserver:
        jwt:
          issuer-uri: https://sso.example.com/realms/shop
          audiences: order-api        # chỉ nhận token phát cho API này
```

Từ `issuer-uri`, Spring tìm metadata của Identity Provider (OIDC discovery) để biết địa chỉ **JWK Set** – tập khoá công khai dùng kiểm tra chữ ký; có thể khai báo trực tiếp `jwk-set-uri` thay thế. Với mỗi request, Spring kiểm tra chữ ký (khoá được cache, tự tải lại khi gặp `kid` lạ – thuận tiện khi IdP xoay vòng khoá), kiểm tra `exp`/`nbf`, `iss` và `aud` nếu đã cấu hình. Mặc định, claim `scope` (hoặc `scp`) được chuyển thành authority có tiền tố `SCOPE_`: token có `"scope": "orders:read orders:write"` sẽ có authority `SCOPE_orders:read` và `SCOPE_orders:write`.

Keycloak đặt role của realm trong claim lồng nhau `realm_access.roles`, nên cần converter riêng để biến chúng thành `ROLE_…`:

```java
public final class KeycloakRoles {

    private KeycloakRoles() {}

    public static JwtAuthenticationConverter converter() {
        var scopes = new JwtGrantedAuthoritiesConverter();    // "scope" → SCOPE_xxx
        var converter = new JwtAuthenticationConverter();
        converter.setJwtGrantedAuthoritiesConverter(jwt -> {
            Collection<GrantedAuthority> authorities = new ArrayList<>(scopes.convert(jwt));
            Map<String, Object> realmAccess = jwt.getClaimAsMap("realm_access");
            if (realmAccess != null && realmAccess.get("roles") instanceof List<?> roles) {
                roles.forEach(r -> authorities.add(new SimpleGrantedAuthority("ROLE_" + r)));
            }
            return authorities;
        });
        converter.setPrincipalClaimName("preferred_username");   // authentication.getName()
        return converter;
    }
}
```

Ngoài JWT, resource server có thể dùng **opaque token** (`.oauth2ResourceServer(o -> o.opaqueToken(...))`): token là chuỗi ngẫu nhiên, API gọi endpoint *introspection* của IdP để hỏi token còn hiệu lực không. Ưu điểm là thu hồi tức thì; nhược điểm là thêm một lời gọi mạng cho mỗi request (thường phải cache) và IdP trở thành điểm phụ thuộc trên đường nóng.

### OAuth2 Client: đăng nhập và gọi API khác

Module `spring-boot-starter-oauth2-client` phục vụ hai nhu cầu:

1. **Đăng nhập người dùng qua IdP** (`oauth2Login()`): ứng dụng web phía server hoặc BFF (Backend-for-Frontend) chuyển hướng người dùng tới IdP theo luồng Authorization Code, nhận code ở `/login/oauth2/code/{registrationId}`, đổi lấy token và tạo session cho người dùng.
2. **Gọi service khác bằng token** của chính ứng dụng (luồng Client Credentials) hoặc token của người dùng. `OAuth2AuthorizedClientManager` lo việc lấy token, cache và làm mới khi hết hạn. Với `RestClient` (Spring Security 6.4+) dùng `OAuth2ClientHttpRequestInterceptor`; với `WebClient` dùng `ServletOAuth2AuthorizedClientExchangeFilterFunction`.

```yaml
spring:
  security:
    oauth2:
      client:
        registration:
          keycloak:                        # đăng nhập người dùng (Authorization Code)
            client-id: order-web
            client-secret: ${ORDER_WEB_SECRET}
            authorization-grant-type: authorization_code
            scope: openid,profile,email
          inventory:                       # service gọi service (Client Credentials)
            provider: keycloak
            client-id: order-service
            client-secret: ${ORDER_SERVICE_SECRET}
            authorization-grant-type: client_credentials
        provider:
          keycloak:
            issuer-uri: https://sso.example.com/realms/shop
```

Một ứng dụng có thể vừa là client (gọi inventory) vừa là resource server (nhận token từ frontend) – đây là hình mẫu phổ biến trong microservice.

## Phân quyền theo role, authority và method security

### Role và authority

Với Spring Security, mọi quyền đều là `GrantedAuthority` – về bản chất là một chuỗi. **Role** chỉ là authority có tiền tố `ROLE_`: `hasRole("ADMIN")` tương đương `hasAuthority("ROLE_ADMIN")`. Một cách tổ chức dễ bảo trì: role mô tả *nhóm người dùng* (ADMIN, SUPPORT, CUSTOMER), authority/scope mô tả *quyền cụ thể* (`orders:read`, `orders:refund`). Có thể khai báo `RoleHierarchy` (ví dụ `ROLE_ADMIN > ROLE_SUPPORT`) để role cao tự có quyền của role thấp.

### Luật theo URL

Các luật trong `authorizeHttpRequests` được kiểm tra **theo thứ tự khai báo, luật đầu tiên khớp sẽ quyết định**. Hãy đặt luật cụ thể trước luật chung, và kết thúc bằng `anyRequest().authenticated()` hoặc `denyAll()` để mọi URL chưa được khai báo đều bị từ chối mặc định (*deny by default*).

### Method security

Luật theo URL chỉ thô (endpoint nào, role nào). Kiểm tra chi tiết như "người dùng chỉ xem được đơn hàng của chính mình" cần thông tin về dữ liệu, nên đặt ở tầng service với method security. Bật bằng `@EnableMethodSecurity` (thay cho `@EnableGlobalMethodSecurity` đã deprecate):

```java
@Configuration
@EnableMethodSecurity                       // bật @PreAuthorize, @PostAuthorize
class MethodSecurityConfig {}

@Service
public class OrderQueryService {

    private final OrderRepository orders;

    public OrderQueryService(OrderRepository orders) { this.orders = orders; }

    @PreAuthorize("hasAuthority('SCOPE_orders:read')")
    public List<OrderView> myOrders(Authentication auth) {
        return orders.findByCustomerId(auth.getName()).stream().map(OrderView::from).toList();
    }

    // Nhân viên hỗ trợ, hoặc chính chủ đơn hàng
    @PreAuthorize("hasRole('SUPPORT') or @orderAuthz.isOwner(#orderId, authentication)")
    public OrderView getOrder(Long orderId) {
        return orders.findById(orderId).map(OrderView::from)
                .orElseThrow(() -> new OrderNotFoundException(orderId));
    }
}

@Component("orderAuthz")
public class OrderAuthorization {
    private final OrderRepository orders;
    public OrderAuthorization(OrderRepository orders) { this.orders = orders; }

    public boolean isOwner(Long orderId, Authentication auth) {
        return orders.existsByIdAndCustomerId(orderId, auth.getName());
    }
}
```

Vài điểm cần nhớ:

- Method security hoạt động bằng **proxy**, nên chịu cùng giới hạn với `@Transactional`: lời gọi nội bộ và method `private` không được kiểm tra.
- Biểu thức `#orderId` cần tên tham số lúc chạy; dự án dùng `spring-boot-starter-parent` đã bật cờ biên dịch `-parameters`. Nếu không, thêm cờ này hoặc dùng `@P("orderId")`.
- `@PostAuthorize("returnObject.customerId() == authentication.name")` kiểm tra *sau* khi method chạy, dựa trên kết quả trả về – hữu ích khi chỉ biết chủ sở hữu sau khi tải dữ liệu, nhưng method vẫn đã thực thi, nên không dùng cho method có tác dụng phụ.
- Test bằng `spring-security-test`: `@WithMockUser(roles = "SUPPORT")` cho test service, hoặc `mockMvc.perform(get(...).with(jwt().authorities(...)))` cho test controller.

## Lỗi thường gặp

- **Tắt CSRF cho ứng dụng web dùng session cookie** chỉ vì "API bị 403". Hãy gửi CSRF token đúng cách; chỉ tắt cho API stateless dùng header `Authorization`.
- **Tự viết filter parse JWT.** Dễ quên kiểm tra chữ ký, `exp`, `iss`, `aud` hoặc chấp nhận `alg: none`. Dùng `oauth2ResourceServer().jwt()`.
- **Access token sống nhiều ngày.** Token bị lộ dùng được rất lâu. Giữ thời hạn ngắn, dùng refresh token và cân nhắc mô hình BFF để token không nằm trong JavaScript của trình duyệt.
- **Nhầm role và authority.** Lưu authority `"ADMIN"` (không có tiền tố) rồi kiểm tra `hasRole("ADMIN")` sẽ luôn thất bại. Thống nhất quy ước: role luôn có `ROLE_`.
- **Đặt luật chung trước luật cụ thể**, ví dụ `/api/**` authenticated đứng trước `/api/admin/**` hasRole ADMIN – luật admin không bao giờ được áp dụng.
- **Quên `@EnableMethodSecurity`.** Mọi `@PreAuthorize` bị bỏ qua mà không báo lỗi. Viết test khẳng định request thiếu quyền bị 403.
- **Chỉ kiểm tra quyền ở UI hoặc gateway.** Kẻ tấn công gọi thẳng API với id của người khác (lỗi IDOR). Luôn kiểm tra quyền sở hữu dữ liệu ở service.
- **`permitAll()` cho `/actuator/**`.** Lộ `env`, `heapdump`. Chỉ mở `health` và bảo vệ phần còn lại.

## Bài tập thực hành

1. **Hai chain trong một ứng dụng:** Cấu hình `/api/**` stateless dùng JWT HS256 tự phát hành (endpoint đăng nhập trả token sống 15 phút) và phần còn lại dùng form login. Dùng `curl` chứng minh: không token → 401, token hợp lệ nhưng thiếu quyền → 403, token hết hạn → 401. Bật log TRACE và đối chiếu danh sách filter của từng chain.
2. **Resource server với Keycloak:** Chạy Keycloak bằng Docker, tạo realm `shop`, client `order-api` và các realm role. Cấu hình `issuer-uri`, viết converter cho `realm_access.roles`, lấy token bằng luồng Client Credentials và gọi API. Thử sửa một ký tự trong token để thấy chữ ký bị từ chối.
3. **Phân quyền theo dữ liệu:** Viết `OrderQueryService.getOrder` với `@PreAuthorize` kiểm tra chủ sở hữu hoặc role SUPPORT. Viết test với `@WithMockUser` cho ba trường hợp (chủ đơn, người lạ, SUPPORT) và test controller bằng `jwt()`.

## Tóm tắt

- Spring Security là chuỗi Servlet filter: `DelegatingFilterProxy` → `FilterChainProxy` → `SecurityFilterChain` đầu tiên khớp request.
- `ExceptionTranslationFilter` quyết định 401 (chưa xác thực) hay 403 (thiếu quyền); `AuthorizationFilter` áp dụng luật URL theo thứ tự khai báo.
- Form login dùng session cookie và cần CSRF; Basic chỉ dùng qua HTTPS cho công cụ nội bộ; JWT phù hợp với API stateless.
- Đừng tự viết filter JWT – dùng OAuth2 Resource Server với `issuer-uri`/`jwk-set-uri`, kiểm tra cả `aud`, và map claim sang authority bằng `JwtAuthenticationConverter`.
- OAuth2 Client lo việc đăng nhập qua IdP và lấy/làm mới token khi gọi service khác.
- Role là authority có tiền tố `ROLE_`; phân quyền thô ở URL, phân quyền theo dữ liệu bằng `@PreAuthorize` ở service.
