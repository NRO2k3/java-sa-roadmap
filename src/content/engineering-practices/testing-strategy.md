Một bộ test tốt cho phép team deploy hằng ngày mà không run tay; một bộ test tồi thì chậm, hay đỏ ngẫu nhiên và vẫn để lọt bug ra production. Khác biệt không nằm ở số lượng test hay con số coverage, mà ở **chiến lược**: test cái gì ở tầng nào, test giữa các service ra sao, và làm sao biết test có thật sự bắt được lỗi. Dev Lead là người quyết định chiến lược đó cho team và giữ cho bộ test luôn đáng tin. Bài này đi qua test pyramid cho Spring Boot, contract testing, mutation testing và cách trị flaky test.

## Mục tiêu bài học

- Thiết kế test pyramid phù hợp cho một service Spring Boot, biết tầng nào test điều gì.
- Hiểu và áp dụng contract testing giữa các service với Pact hoặc Spring Cloud Contract.
- Dùng mutation testing (PIT) để đánh giá chất lượng test thay vì chỉ nhìn coverage.
- Chẩn đoán và xử lý flaky test, quản lý dữ liệu test cho ổn định.

## Test pyramid cho service Spring Boot

**Test pyramid** (kim tự tháp test) là mô hình gợi ý: nhiều test nhỏ, nhanh ở đáy; ít test lớn, chậm ở đỉnh. Lý do: test càng lớn càng chậm, càng tốn công bảo trì và khi đỏ càng khó biết lỗi ở đâu. Với một service Spring Boot, kim tự tháp thực tế trông như sau:

```text
                 /\
                /E2E\          Vài kịch bản chính, chạy trên staging
               /------\
              /Contract\       Mỗi cặp consumer-provider
             /----------\
            / Integration \    @SpringBootTest + Testcontainers (DB, Kafka)
           /--------------\
          /   Slice test   \   @WebMvcTest, @DataJpaTest
         /------------------\
        /     Unit test      \ Domain, service: không Spring context
       /______________________\
```

| Tầng | Test điều gì | Công cụ | Tốc độ |
|---|---|---|---|
| Unit | Logic nghiệp vụ, tính toán, validation, state machine | JUnit 5, Mockito, AssertJ | Mili giây |
| Slice | Controller (mapping, validation, JSON, security), repository (query thật) | `@WebMvcTest`, `@DataJpaTest` | Vài giây |
| Integration | Luồng xuyên tầng với hạ tầng thật: transaction, migration, Kafka | `@SpringBootTest`, Testcontainers, WireMock | Vài giây đến vài chục giây |
| Contract | Hợp đồng API/message giữa các service | Pact, Spring Cloud Contract | Nhanh, chạy ở cả hai phía |
| E2E | Kịch bản người dùng quan trọng trên môi trường gần production | REST Assured, Playwright | Chậm |

Kim tự tháp là gợi ý, không phải công thức. Với microservice mỏng chủ yếu gọi DB và service khác, logic nghiệp vụ ít, nhiều team chọn hình dạng "tổ ong" (testing honeycomb, cách gọi do Spotify phổ biến): integration test chiếm phần lớn vì đó là nơi lỗi thật xảy ra. Câu hỏi cần trả lời là "lỗi của service này thường nằm ở đâu", rồi dồn test vào đó.

### Unit test: nhanh và tập trung vào hành vi

```java
@ExtendWith(MockitoExtension.class)
class OrderServiceTest {

    @Mock OrderRepository orderRepository;
    @Mock InventoryClient inventoryClient;
    @InjectMocks OrderService orderService;

    @Test
    void rejectsOrderWhenStockIsInsufficient() {
        var cmd = new PlaceOrderCommand("c-1", List.of(new OrderLine("SKU-1", 5)));
        when(inventoryClient.available("SKU-1")).thenReturn(3);

        assertThatThrownBy(() -> orderService.place(cmd))
                .isInstanceOf(OutOfStockException.class)
                .hasMessageContaining("SKU-1");
        verify(orderRepository, never()).save(any());
    }
}
```

Test này không khởi động Spring nên chạy trong mili giây. Chỉ mock các ranh giới (repository, client gọi service khác), đừng mock value object hay chính class đang test. Nếu một test cần mock quá nhiều thứ, đó thường là dấu hiệu class đang gánh quá nhiều trách nhiệm.

### Integration test với Testcontainers

H2 hay các DB nhúng không có cùng hành vi với PostgreSQL thật (kiểu dữ liệu JSONB, khoá, cú pháp riêng). **Testcontainers** khởi động container DB thật cho test, và từ Spring Boot 3.1, annotation `@ServiceConnection` tự cấu hình kết nối:

```java
@DataJpaTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
@Testcontainers
class OrderRepositoryTest {

    @Container
    @ServiceConnection
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:16-alpine");

    @Autowired OrderRepository orderRepository;

    @Test
    void findsPendingOrdersOlderThanCutoff() {
        orderRepository.save(OrderFixtures.pending("o-1", Instant.parse("2024-01-01T00:00:00Z")));
        orderRepository.save(OrderFixtures.pending("o-2", Instant.parse("2024-03-01T00:00:00Z")));

        var result = orderRepository.findPendingBefore(Instant.parse("2024-02-01T00:00:00Z"));

        assertThat(result).extracting(Order::getId).containsExactly("o-1");
    }
}
```

`Replace.NONE` ngăn `@DataJpaTest` thay DataSource bằng DB nhúng. Migration Flyway/Liquibase chạy như trên production, nên test này kiểm tra luôn cả script migration. Container khai báo `static` được dùng chung cho mọi test trong class; để dùng chung giữa nhiều class, có thể khai báo container trong một lớp cơ sở hoặc một `@TestConfiguration` dùng chung.

> **Lưu ý:** Spring cache lại application context giữa các test có cùng cấu hình. Mỗi tổ hợp `@MockitoBean` (thay cho `@MockBean` đã deprecated từ Spring Boot 3.4) khác nhau tạo ra một context mới, làm bộ test chậm đi rõ rệt. Hãy chuẩn hoá vài cấu hình test dùng chung thay vì mỗi class một kiểu.

## Contract testing giữa các service

Khi `order-service` gọi `customer-service`, có hai cách sai lầm phổ biến: mock `customer-service` trong test của order (mock có thể lệch khỏi API thật mà không ai biết), hoặc dựng cả hệ thống để chạy E2E (chậm, dễ vỡ). **Contract testing** nằm giữa: hai bên thống nhất một **hợp đồng** (contract) mô tả request và response, rồi mỗi bên tự kiểm chứng phía mình độc lập.

```text
 Consumer (order-service)                   Provider (customer-service)
 ------------------------                   ---------------------------
 Test consumer chạy với mock server   --->  Pact file (JSON)  --->  Provider replay
 sinh ra hợp đồng                           lưu ở Pact Broker       request thật vào
                                                                    API, so response
```

### Consumer-driven với Pact

Với **Pact**, consumer viết test mô tả những gì nó cần; test sinh ra file hợp đồng. Provider tải hợp đồng (thường từ **Pact Broker**, nơi lưu và quản lý phiên bản contract) và kiểm tra API thật có đáp ứng không.

```java
@ExtendWith(PactConsumerTestExt.class)
@PactTestFor(providerName = "customer-service")
class CustomerClientPactTest {

    @Pact(consumer = "order-service")
    V4Pact goldCustomer(PactDslWithProvider builder) {
        return builder
                .given("customer 42 exists with tier GOLD")
                .uponReceiving("get customer 42")
                    .path("/api/customers/42")
                    .method("GET")
                .willRespondWith()
                    .status(200)
                    .body(new PactDslJsonBody()
                            .integerType("id", 42)
                            .stringType("tier", "GOLD"))
                .toPact(V4Pact.class);
    }

    @Test
    void readsCustomerTier(MockServer mockServer) {
        var client = new CustomerClient(mockServer.getUrl());
        assertThat(client.getCustomer(42).tier()).isEqualTo("GOLD");
    }
}
```

`integerType`, `stringType` là **matcher theo kiểu**: hợp đồng chỉ yêu cầu `id` là số nguyên, không ép giá trị cụ thể, nên provider không bị ràng buộc dữ liệu thừa. Chuỗi trong `given(...)` là **provider state**: phía provider viết hàm chuẩn bị dữ liệu tương ứng trước khi replay. Consumer chỉ khai báo các field nó thật sự dùng; provider được tự do thêm field mới mà không phá ai.

Pact Broker có lệnh `can-i-deploy` để kiểm tra trước khi deploy: version này của service có tương thích với các version đang chạy trên môi trường đích không. Đây là chỗ contract testing thay thế được nhiều E2E test.

### Spring Cloud Contract

**Spring Cloud Contract** đi theo hướng ngược lại về mặt quy trình: hợp đồng thường được viết và lưu ở phía **provider** (Groovy, YAML hoặc Kotlin DSL). Plugin sinh ra test cho provider và sinh **stub WireMock** để consumer dùng trong test của mình.

```yaml
# src/test/resources/contracts/customer/get_customer.yml (phía provider)
request:
  method: GET
  url: /api/customers/42
response:
  status: 200
  headers:
    Content-Type: application/json
  body:
    id: 42
    tier: GOLD
```

**Chọn công cụ nào?** Spring Cloud Contract hợp với hệ sinh thái toàn Spring/JVM, provider chủ động công bố API. Pact hợp khi consumer đa ngôn ngữ (frontend JavaScript, service Go) và muốn consumer dẫn dắt hợp đồng. Contract test kiểm tra **hình dạng** giao tiếp, không thay thế test nghiệp vụ của provider.

## Mutation testing: test có thật sự bắt được lỗi?

Coverage 90% chỉ nói rằng 90% dòng code **được chạy qua** khi test, không nói test có **kiểm tra** kết quả hay không. Một test gọi method mà không có assertion vẫn tăng coverage. **Mutation testing** trả lời câu hỏi khó hơn: nếu code sai, test có phát hiện không?

Cách hoạt động của **PIT** (pitest): tạo ra nhiều **mutant**, mỗi mutant là bản code bị sửa một chỗ nhỏ có chủ đích, như đổi `<` thành `<=`, đảo điều kiện, thay giá trị trả về, xoá lời gọi method `void`. Với mỗi mutant, PIT chạy các test liên quan:

- Test đỏ: mutant bị **killed** (tốt, test bắt được thay đổi).
- Test vẫn xanh: mutant **survived** (test chưa đủ chặt ở chỗ đó).

**Mutation score** = số mutant bị killed / tổng số mutant. Ví dụ, code `if (amount > FREE_SHIPPING_THRESHOLD)` có test với `amount` là 50.000 và 1.000.000 nhưng không test đúng ngưỡng; mutant đổi `>` thành `>=` sẽ sống sót, chỉ ra bạn thiếu test biên.

```xml
<plugin>
  <groupId>org.pitest</groupId>
  <artifactId>pitest-maven</artifactId>
  <version>${pitest.version}</version>
  <dependencies>
    <dependency>
      <groupId>org.pitest</groupId>
      <artifactId>pitest-junit5-plugin</artifactId>
      <version>${pitest-junit5.version}</version>
    </dependency>
  </dependencies>
  <configuration>
    <targetClasses>
      <param>com.example.order.domain.*</param>
    </targetClasses>
    <mutationThreshold>70</mutationThreshold>
  </configuration>
</plugin>
```

Chạy bằng `mvn test-compile org.pitest:pitest-maven:mutationCoverage`, báo cáo HTML nằm trong `target/pit-reports`. Plugin `pitest-junit5-plugin` cần thiết để PIT chạy được test JUnit 5.

**Dùng thế nào cho thực tế:** mutation testing tốn thời gian vì chạy test nhiều lần. Đừng chạy cho cả codebase ở mỗi PR. Hãy giới hạn ở package domain chứa logic quan trọng (`targetClasses`), chạy định kỳ hoặc chỉ trên code thay đổi (goal `scmMutationCoverage`). Không đặt mục tiêu 100%: một số mutant là **equivalent mutant**, tức là thay đổi không làm đổi hành vi, nên không test nào giết được.

## Flaky test và dữ liệu test

**Flaky test** là test lúc xanh lúc đỏ dù code không đổi. Tác hại lớn hơn vẻ ngoài: khi team quen bấm "chạy lại", họ sẽ bỏ qua cả những lần đỏ do bug thật.

### Nguyên nhân phổ biến và cách sửa

| Nguyên nhân | Dấu hiệu | Cách sửa |
|---|---|---|
| Phụ thuộc thời gian | Đỏ vào cuối tháng, gần nửa đêm, khác múi giờ CI | Inject `Clock`, dùng `Clock.fixed(...)` trong test |
| Bất đồng bộ | Dùng `Thread.sleep(1000)` chờ consumer Kafka | Dùng Awaitility: `await().atMost(10, SECONDS).untilAsserted(...)` |
| Dữ liệu dùng chung | Đỏ khi chạy cả suite, xanh khi chạy riêng | Mỗi test tự tạo dữ liệu với id ngẫu nhiên/duy nhất, dọn sau test |
| Thứ tự không xác định | So sánh kết quả từ `HashMap`, query không `ORDER BY` | Dùng `containsExactlyInAnyOrder` hoặc thêm `ORDER BY` |
| Tài nguyên bên ngoài | Gọi API thật của đối tác trong test | Dùng WireMock hoặc contract test |

### Quy trình xử lý flaky test cho team

1. **Phát hiện**: Maven Surefire có tuỳ chọn `-Dsurefire.rerunFailingTestsCount=2`, báo cáo test nào đỏ rồi xanh khi chạy lại là flaky. Dùng nó để **phát hiện**, không phải để che giấu.
2. **Cách ly (quarantine)**: chuyển test flaky ra khỏi bộ test bắt buộc (ví dụ gắn `@Tag("flaky")` và loại khỏi pipeline chính), kèm ticket có người phụ trách và hạn sửa.
3. **Sửa hoặc xoá**: test flaky cách ly quá lâu mà không ai sửa thì nên xoá và viết lại, vì nó không bảo vệ gì cả.

### Quản lý dữ liệu test

- **Test Data Builder / Object Mother**: tạo object test qua builder với giá trị mặc định hợp lệ, test chỉ ghi đè field nó quan tâm, ví dụ `OrderFixtures.pending(id, createdAt)`. Khi thêm field bắt buộc mới, chỉ sửa builder một chỗ.
- **Mỗi test tự chuẩn bị dữ liệu của nó**: tránh file SQL seed khổng lồ dùng chung cho mọi test, sửa một dòng làm đỏ hàng chục test không liên quan.
- **Cẩn thận với `@Transactional` trong test**: nó rollback sau mỗi test, nhưng với `@SpringBootTest(webEnvironment = RANDOM_PORT)`, request HTTP chạy trên thread khác nên không nằm trong transaction của test và dữ liệu không bị rollback. Khi đó hãy dọn dữ liệu chủ động.
- **Không dùng dữ liệu production thật** chứa thông tin cá nhân trong test; nếu cần dữ liệu giống thật, hãy ẩn danh hoá.

## Lỗi thường gặp

- **Coi coverage là mục tiêu**: team viết test không assertion cho đủ 80%. Cách sửa: dùng coverage để tìm vùng chưa test, dùng mutation testing ở phần domain để đo chất lượng.
- **Kim tự tháp ngược (ice cream cone)**: phần lớn là E2E và test tay, pipeline chạy hàng giờ. Cách sửa: đẩy kiểm tra logic xuống unit/slice test, giữ E2E cho vài luồng quan trọng nhất.
- **Mock mọi thứ**: test chỉ kiểm tra "method A gọi method B", refactor nhỏ cũng làm đỏ hàng loạt. Cách sửa: kiểm tra kết quả và trạng thái, chỉ mock ở ranh giới hệ thống.
- **Dùng H2 thay PostgreSQL**: test xanh nhưng query lỗi trên production. Cách sửa: Testcontainers với đúng version DB production.
- **Chấp nhận flaky test**: "cứ chạy lại là xanh". Cách sửa: quy trình phát hiện, cách ly, sửa với người phụ trách rõ ràng.

## Bài tập thực hành

1. **Vẽ kim tự tháp hiện tại**: đếm số test và thời gian chạy theo từng tầng của một service trong team. So với hình dạng mong muốn, viết đề xuất ba thay đổi cụ thể (chuyển test nào xuống tầng nào, thay H2 bằng Testcontainers ở đâu).
2. **Chạy PIT cho package domain**: cấu hình pitest-maven cho một package nghiệp vụ, chạy và chọn ba mutant sống sót. Với mỗi mutant, viết test giết nó và giải thích test cũ thiếu điều gì.
3. **Contract test cho một cặp service**: chọn một lời gọi REST giữa hai service của team, viết Pact consumer test ở phía gọi và provider verification ở phía được gọi, hoặc làm tương đương với Spring Cloud Contract.

## Tóm tắt

- Test pyramid: nhiều unit test, đủ slice/integration test với hạ tầng thật, ít E2E; điều chỉnh hình dạng theo nơi lỗi thật sự hay xảy ra.
- Dùng Testcontainers với `@ServiceConnection` để test với DB thật thay cho DB nhúng.
- Contract testing (Pact, Spring Cloud Contract) kiểm tra hợp đồng giữa các service mà không cần dựng cả hệ thống.
- Coverage chỉ đo code được chạy qua; mutation testing với PIT đo test có bắt được lỗi hay không.
- Flaky test phá huỷ niềm tin vào CI: phát hiện, cách ly, sửa hoặc xoá, đừng chấp nhận "chạy lại là được".
- Mỗi test tự chuẩn bị dữ liệu qua builder/fixture, tránh dùng chung trạng thái giữa các test.
