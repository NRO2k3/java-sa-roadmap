API là hợp đồng giữa các hệ thống, và hợp đồng thì khó sửa hơn code rất nhiều: một khi đối tác, ứng dụng mobile hay service của team khác đã phụ thuộc vào nó, mọi thay đổi phá vỡ tương thích đều tốn kém. Chọn sai phong cách API (dùng GraphQL cho giao tiếp nội bộ đơn giản, dùng REST cho luồng streaming độ trễ thấp) tạo ra chi phí kéo dài nhiều năm. Bài này so sánh REST, gRPC, GraphQL và WebSocket, hướng dẫn thiết kế API-first với OpenAPI, xây dựng service gRPC và GraphQL bằng Java, rồi đi vào ba chi tiết quyết định độ bền của một API: idempotency, pagination và rate limiting.

## Mục tiêu bài học

- So sánh REST, gRPC, GraphQL và WebSocket theo hiệu năng, tooling và use case, từ đó chọn đúng cho từng tình huống.
- Thiết kế API theo hướng API-first với OpenAPI và quy tắc tiến hoá không phá vỡ tương thích.
- Xây dựng một service gRPC với Protobuf bằng grpc-java, có deadline và xử lý lỗi đúng chuẩn.
- Viết API GraphQL bằng Spring for GraphQL và tránh vấn đề N+1.
- Thiết kế idempotency key, cursor pagination và rate limiting cho API công khai.

## Bốn phong cách API

### REST

REST mô hình hoá hệ thống thành **tài nguyên** (resource) có URL, thao tác qua các method HTTP chuẩn (`GET`, `POST`, `PUT`, `PATCH`, `DELETE`) và trả về mã trạng thái có ý nghĩa (`201 Created`, `404 Not Found`, `409 Conflict`). Payload thường là JSON. Điểm mạnh lớn nhất là **tính phổ quát**: mọi ngôn ngữ, mọi công cụ, mọi proxy đều hiểu HTTP; response của `GET` có thể được cache bởi trình duyệt và CDN qua header `Cache-Control`, `ETag`.

Cần nhớ ngữ nghĩa của method: `GET`, `PUT`, `DELETE` là **idempotent** (gọi nhiều lần cho cùng kết quả trên server), còn `POST` thì không. Điều này quyết định client có được tự động retry hay không.

### gRPC

gRPC là framework RPC chạy trên **HTTP/2**, dùng **Protocol Buffers (Protobuf)** làm định dạng nhị phân và ngôn ngữ mô tả hợp đồng. Từ file `.proto`, công cụ sinh code tạo sẵn class message, stub phía client và lớp cơ sở phía server cho nhiều ngôn ngữ. Payload nhị phân nhỏ hơn và parse nhanh hơn JSON; HTTP/2 cho phép nhiều request song song trên một connection. gRPC hỗ trợ bốn kiểu gọi: unary (một request, một response), server streaming, client streaming và bidirectional streaming.

Hạn chế: trình duyệt không gọi gRPC trực tiếp được (cần gRPC-Web và một proxy), payload không đọc được bằng mắt nên debug khó hơn, và load balancer tầng 4 (L4) không chia tải theo từng request vì connection HTTP/2 tồn tại lâu; cần load balancer tầng 7 (như Envoy) hoặc load balancing phía client.

### GraphQL

GraphQL cung cấp **một endpoint** và một **schema có kiểu**; client gửi truy vấn mô tả chính xác các field cần lấy, kể cả dữ liệu lồng nhau, và nhận về đúng hình dạng đó. Nó giải quyết over-fetching (nhận thừa dữ liệu) và under-fetching (phải gọi nhiều endpoint) khi có nhiều loại client với nhu cầu khác nhau: web, mobile, đối tác.

Cái giá: cache HTTP khó áp dụng vì mọi truy vấn thường là `POST /graphql`; một truy vấn lồng sâu có thể làm server quá tải, nên cần giới hạn độ sâu và độ phức tạp; và dễ gặp **vấn đề N+1** khi mỗi field con gọi database hay service riêng.

### WebSocket

WebSocket mở một **kết nối hai chiều lâu dài** (full-duplex) bắt đầu bằng một lần nâng cấp từ HTTP. Server có thể đẩy dữ liệu cho client bất cứ lúc nào: chat, thông báo, bảng giá thời gian thực, trạng thái đơn hàng. Vì mỗi client giữ một connection có trạng thái, việc scale ngang cần thêm cơ chế phân phối message giữa các instance (ví dụ STOMP với broker relay hoặc Redis Pub/Sub). Nếu chỉ cần server đẩy một chiều, **Server-Sent Events (SSE)** đơn giản hơn vì chạy trên HTTP thông thường.

### So sánh và lựa chọn

| Tiêu chí | REST | gRPC | GraphQL | WebSocket |
|---|---|---|---|---|
| Giao thức | HTTP/1.1 hoặc HTTP/2 | HTTP/2 | Thường là HTTP | Kết nối TCP lâu dài sau upgrade |
| Định dạng | JSON (phổ biến) | Protobuf nhị phân | JSON | Tuỳ ý (text hoặc binary) |
| Hợp đồng | OpenAPI (tuỳ chọn) | `.proto` (bắt buộc) | Schema SDL (bắt buộc) | Tự định nghĩa |
| Hiệu năng | Tốt | Rất tốt, payload nhỏ | Phụ thuộc resolver | Độ trễ đẩy rất thấp |
| Trình duyệt | Trực tiếp | Cần gRPC-Web và proxy | Trực tiếp | Trực tiếp |
| Cache HTTP | Dễ | Không | Khó | Không áp dụng |
| Use case điển hình | API công khai, CRUD | Service nội bộ, streaming | BFF, nhiều loại client | Real-time hai chiều |

Gợi ý thực tế: **API công khai cho đối tác** chọn REST vì ai cũng tích hợp được. **Giao tiếp nội bộ giữa service**, lưu lượng lớn, cần độ trễ thấp hoặc streaming, chọn gRPC. **Tầng BFF (Backend for Frontend)** phục vụ nhiều màn hình với nhu cầu dữ liệu khác nhau, cân nhắc GraphQL. **Đẩy dữ liệu thời gian thực** chọn WebSocket hoặc SSE. Một hệ thống lớn thường dùng nhiều phong cách cùng lúc.

## Thiết kế API-first với OpenAPI

**API-first** nghĩa là viết và review hợp đồng API **trước khi** viết code. File OpenAPI trở thành nguồn sự thật: team frontend dựng mock server từ đó để làm song song, team backend sinh interface server, các team khác sinh client. Ngược lại, **code-first** (sinh spec từ annotation, ví dụ bằng springdoc-openapi) nhanh khi bắt đầu nhưng dễ để chi tiết triển khai rò rỉ vào hợp đồng.

```yaml
openapi: 3.0.3
info: { title: Order API, version: 1.2.0 }
paths:
  /orders:
    post:
      operationId: createOrder
      parameters:
        - { name: Idempotency-Key, in: header, required: true, schema: { type: string, format: uuid } }
      requestBody:
        required: true
        content:
          application/json:
            schema: { $ref: '#/components/schemas/CreateOrderRequest' }
      responses:
        '201': { description: Đơn hàng đã được tạo }
        '409': { description: Request cùng Idempotency-Key đang được xử lý }
        '422': { description: Idempotency-Key đã dùng cho payload khác }
        '429': { description: Vượt giới hạn tần suất gọi }
    get:
      operationId: listOrders
      parameters:
        - { name: cursor, in: query, schema: { type: string } }
        - { name: limit, in: query, schema: { type: integer, minimum: 1, maximum: 100, default: 20 } }
      responses:
        '200':
          description: Một trang đơn hàng
          content:
            application/json:
              schema: { $ref: '#/components/schemas/OrderPage' }
components:
  schemas:
    OrderPage:
      type: object
      required: [items]
      properties:
        items: { type: array, items: { $ref: '#/components/schemas/Order' } }
        nextCursor: { type: string, nullable: true }
    # CreateOrderRequest và Order lược bỏ cho gọn
```

Quy trình API-first điển hình: viết spec trong pull request, chạy linter (ví dụ Spectral) để kiểm tra quy ước đặt tên, review với các team sử dụng, sinh code bằng openapi-generator ở bước build, và kiểm tra trong CI rằng spec mới không phá vỡ tương thích với spec cũ.

Quy tắc tiến hoá: **thêm** field tuỳ chọn hay endpoint mới là an toàn; **xoá** field, đổi tên, đổi kiểu, biến field tuỳ chọn thành bắt buộc là thay đổi phá vỡ, cần version mới (`/v2/...`) và thời gian chuyển đổi cho client.

## Xây dựng service gRPC với Protobuf

Hợp đồng `.proto` (đặt trong `src/main/proto`):

```text
syntax = "proto3";

package shop.order.v1;

option java_multiple_files = true;
option java_package = "com.example.shop.order.v1";

service OrderService {
  rpc GetOrder (GetOrderRequest) returns (Order);
  rpc WatchOrderStatus (GetOrderRequest) returns (stream OrderStatusEvent);
}

message GetOrderRequest {
  string order_id = 1;
}

message Order {
  string order_id = 1;
  string customer_id = 2;
  OrderStatus status = 3;
  int64 total_amount = 4;   // đơn vị nhỏ nhất của tiền tệ
  reserved 5;               // field cũ đã xoá: không bao giờ dùng lại số này
  reserved "coupon_code";
}

enum OrderStatus {
  ORDER_STATUS_UNSPECIFIED = 0;
  ORDER_STATUS_PENDING = 1;
  ORDER_STATUS_PAID = 2;
}

message OrderStatusEvent {
  string order_id = 1;
  OrderStatus status = 2;
}
```

Trong Protobuf, **số thứ tự field** (field number) mới là thứ được truyền trên dây, không phải tên. Vì vậy được đổi tên field, được thêm field mới với số mới, nhưng **không bao giờ** đổi số hay dùng lại số đã xoá; khai báo `reserved` để trình biên dịch chặn việc đó. Giá trị đầu tiên của enum trong proto3 phải là 0, nên đặt là `UNSPECIFIED`.

Plugin protobuf cho Maven hoặc Gradle sinh ra `OrderServiceGrpc` cùng các class message lúc build. Phía server kế thừa lớp cơ sở được sinh ra:

```java
public class OrderGrpcService extends OrderServiceGrpc.OrderServiceImplBase {

    private final OrderQueryService orders;

    public OrderGrpcService(OrderQueryService orders) {
        this.orders = orders;
    }

    @Override
    public void getOrder(GetOrderRequest request, StreamObserver<Order> responseObserver) {
        orders.find(request.getOrderId()).ifPresentOrElse(
                o -> {
                    responseObserver.onNext(Order.newBuilder()
                            .setOrderId(o.id())
                            .setCustomerId(o.customerId())
                            .setStatus(OrderStatus.valueOf("ORDER_STATUS_" + o.status()))
                            .setTotalAmount(o.totalAmount())
                            .build());
                    responseObserver.onCompleted();
                },
                () -> responseObserver.onError(Status.NOT_FOUND
                        .withDescription("Không tìm thấy đơn " + request.getOrderId())
                        .asRuntimeException()));
    }
}

// Khởi động server
Server server = ServerBuilder.forPort(9090)
        .addService(new OrderGrpcService(orderQueryService))
        .build()
        .start();
```

Phía client, **luôn đặt deadline**: nếu không, một lời gọi treo có thể giữ tài nguyên vô thời hạn.

```java
ManagedChannel channel = ManagedChannelBuilder.forAddress("order-service", 9090)
        .usePlaintext()   // chỉ cho môi trường dev; production dùng TLS
        .build();
OrderServiceGrpc.OrderServiceBlockingStub stub = OrderServiceGrpc.newBlockingStub(channel);

try {
    Order order = stub.withDeadlineAfter(300, TimeUnit.MILLISECONDS)
            .getOrder(GetOrderRequest.newBuilder().setOrderId("ORD-1").build());
} catch (StatusRuntimeException e) {
    switch (e.getStatus().getCode()) {
        case NOT_FOUND -> { /* trả 404 cho tầng trên */ }
        case DEADLINE_EXCEEDED, UNAVAILABLE -> { /* có thể retry hoặc fallback */ }
        default -> throw e;
    }
}
```

`ManagedChannel` tốn kém để tạo, hãy tạo một lần và dùng chung cho cả ứng dụng. gRPC có bộ mã trạng thái riêng (`NOT_FOUND`, `INVALID_ARGUMENT`, `DEADLINE_EXCEEDED`, `UNAVAILABLE`...); hãy dùng đúng mã để client quyết định có retry hay không.

## Spring for GraphQL

Spring for GraphQL (starter `spring-boot-starter-graphql`) xây trên GraphQL Java. Schema đặt trong `src/main/resources/graphql/schema.graphqls`:

```text
type Query {
  orderById(id: ID!): Order
}

type Mutation {
  cancelOrder(id: ID!, reason: String): Order
}

type Order {
  id: ID!
  status: String!
  createdAt: String!
  customer: Customer!
}

type Customer {
  id: ID!
  name: String!
}
```

Controller ánh xạ field trong schema sang method Java bằng annotation:

```java
@Controller
public class OrderGraphQlController {

    private final OrderService orders;
    private final CustomerClient customers;

    public OrderGraphQlController(OrderService orders, CustomerClient customers) {
        this.orders = orders;
        this.customers = customers;
    }

    @QueryMapping
    public Order orderById(@Argument String id) {
        return orders.findById(id).orElse(null);
    }

    @MutationMapping
    public Order cancelOrder(@Argument String id, @Argument String reason) {
        return orders.cancel(id, reason);
    }

    // Resolve field Order.customer cho TẤT CẢ Order trong response bằng một lần gọi
    @BatchMapping
    public Map<Order, Customer> customer(List<Order> orderList) {
        Set<String> ids = orderList.stream().map(Order::customerId).collect(Collectors.toSet());
        Map<String, Customer> byId = customers.findAllByIds(ids);
        return orderList.stream()
                .collect(Collectors.toMap(Function.identity(), o -> byId.get(o.customerId())));
    }
}
```

Nếu dùng `@SchemaMapping` cho field `customer`, mỗi `Order` trong danh sách sẽ gọi `CustomerClient` một lần: 100 đơn là 100 lời gọi (N+1). `@BatchMapping` dùng cơ chế DataLoader để gom tất cả lại thành một lần gọi. Bật giao diện thử truy vấn bằng `spring.graphql.graphiql.enabled=true` cho môi trường dev.

> **Lưu ý:** Kiểu `Int` của GraphQL là số nguyên có dấu 32-bit, không đủ cho số tiền lớn. Dùng custom scalar (ví dụ `Long` hoặc `BigDecimal` từ thư viện extended scalars) hoặc trả về chuỗi.

Để bảo vệ server, giới hạn độ sâu và độ phức tạp truy vấn bằng các `Instrumentation` của GraphQL Java như `MaxQueryDepthInstrumentation`, `MaxQueryComplexityInstrumentation`; Spring Boot tự đăng ký các bean `Instrumentation` bạn khai báo.

## Idempotency, pagination và rate limiting

### Idempotency key

Mạng không đáng tin: client gửi `POST /orders`, server tạo đơn thành công nhưng response bị mất, client retry và tạo **đơn thứ hai**. **Idempotency key** giải quyết việc này: client sinh một UUID cho mỗi thao tác nghiệp vụ và gửi kèm trong header `Idempotency-Key`; mọi lần retry dùng **lại cùng key**. Server lưu key cùng kết quả lần xử lý đầu và trả lại kết quả đó cho các lần sau. Đã có bản nháp IETF chuẩn hoá header này, và nhiều cổng thanh toán dùng cơ chế tương tự.

```sql
CREATE TABLE idempotency_keys (
    client_id       VARCHAR(64) NOT NULL,
    idempotency_key UUID        NOT NULL,
    request_hash    CHAR(64)    NOT NULL,      -- SHA-256 của body, phát hiện dùng lại key sai
    status          VARCHAR(16) NOT NULL,      -- PROCESSING | COMPLETED
    response_code   INT,
    response_body   JSONB,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (client_id, idempotency_key)
);
```

Luồng xử lý:

1. `INSERT ... ON CONFLICT DO NOTHING` một dòng `PROCESSING`. Ràng buộc khoá chính đảm bảo chỉ một request "thắng" dù hai request đến cùng lúc.
2. Nếu insert thành công: xử lý nghiệp vụ, rồi cập nhật dòng thành `COMPLETED` kèm response, lý tưởng là trong cùng transaction với thao tác nghiệp vụ.
3. Nếu key đã tồn tại: `request_hash` khác thì trả `422` (key bị dùng cho request khác); đang `PROCESSING` thì trả `409` để client thử lại sau; đã `COMPLETED` thì trả lại đúng response đã lưu.
4. Nếu xử lý lỗi, xoá dòng để client có thể retry; dọn các key cũ theo thời hạn (ví dụ 24 giờ).

### Pagination

**Offset pagination** (`?page=50&size=20` thành `LIMIT 20 OFFSET 980`) dễ hiểu và cho phép nhảy trang, nhưng database vẫn phải đọc rồi bỏ qua toàn bộ các dòng trước offset, nên trang càng sâu càng chậm; khi có dòng mới chèn vào, người dùng thấy dòng bị lặp hoặc bị sót giữa hai trang.

**Cursor (keyset) pagination** ghi nhớ vị trí của dòng cuối trang trước và lấy tiếp từ đó:

```sql
-- Index phục vụ: (customer_id, created_at DESC, id DESC)
-- Trang tiếp theo: cursor giải mã thành (created_at, id) của dòng cuối trang trước
SELECT id, status, total_amount, created_at
FROM orders
WHERE customer_id = 42
  AND (created_at, id) < ('2024-05-01 08:30:00+07', 98765)
ORDER BY created_at DESC, id DESC
LIMIT 20;
```

Cột `id` được thêm vào để thứ tự luôn xác định khi nhiều dòng có cùng `created_at`. Cursor trả cho client nên là chuỗi **mờ** (opaque, ví dụ base64 của cặp giá trị) để server có thể đổi cách mã hoá sau này. Nhược điểm của keyset: không nhảy thẳng tới trang bất kỳ. Với API công khai và danh sách dài, cursor gần như luôn là lựa chọn đúng.

### Rate limiting

Rate limiting bảo vệ hệ thống khỏi client gọi quá nhiều, dù vô tình (vòng lặp lỗi) hay cố ý. Các thuật toán phổ biến:

- **Fixed window**: đếm request trong từng khung cố định (ví dụ mỗi phút). Đơn giản nhưng cho phép dồn gấp đôi quanh ranh giới hai khung.
- **Sliding window**: đếm trong cửa sổ trượt, chính xác hơn, tốn bộ nhớ hoặc tính toán hơn.
- **Token bucket**: bucket được nạp token đều đặn, mỗi request tiêu một token, cho phép burst ngắn tới dung lượng bucket.
- **Leaky bucket**: request vào hàng đợi và được xử lý với tốc độ đều, làm phẳng lưu lượng.

Về thiết kế: giới hạn theo **danh tính** (API key, user, tenant) thay vì chỉ theo IP; đặt ở **API Gateway** để chặn sớm; khi chạy nhiều instance, bộ đếm phải nằm ở kho dùng chung như Redis. Khi vượt giới hạn, trả `429 Too Many Requests` kèm header `Retry-After` để client biết khi nào thử lại. Trong Java, thư viện Bucket4j hiện thực token bucket với nhiều backend phân tán; Spring Cloud Gateway có sẵn bộ lọc rate limit dựa trên Redis.

## Lỗi thường gặp

- **Chọn phong cách theo trào lưu**: dùng GraphQL cho vài endpoint CRUD nội bộ làm tăng độ phức tạp mà không có lợi ích. Bắt đầu từ use case và loại client.
- **Thiếu deadline khi gọi gRPC**: lời gọi treo giữ thread và connection, lỗi lan dây chuyền. Luôn đặt `withDeadlineAfter` và truyền deadline xuống các lời gọi tiếp theo.
- **Dùng lại field number trong Protobuf**: client cũ đọc sai dữ liệu một cách âm thầm. Đánh dấu số đã xoá bằng `reserved`.
- **Resolver GraphQL gây N+1**: mỗi field con gọi database riêng. Dùng `@BatchMapping` hoặc DataLoader, và đặt giới hạn độ sâu truy vấn.
- **Retry `POST` không có idempotency key**: tạo đơn trùng, trừ tiền hai lần. Bắt buộc `Idempotency-Key` cho mọi thao tác tạo có tác dụng phụ quan trọng.
- **Offset pagination cho danh sách lớn**: trang sâu chậm dần và dữ liệu lặp hoặc sót. Dùng cursor pagination với index phù hợp.
- **Rate limit chỉ trong bộ nhớ từng instance**: giới hạn thực tế bị nhân với số instance. Dùng bộ đếm dùng chung.

## Bài tập thực hành

1. **API-first**: viết spec OpenAPI cho Order API gồm tạo đơn (có `Idempotency-Key`), xem đơn và liệt kê đơn bằng cursor pagination. Sinh interface server bằng openapi-generator cho Spring Boot, hiện thực bằng PostgreSQL, và viết test chứng minh gửi cùng key hai lần chỉ tạo một đơn.
2. **So sánh REST và gRPC**: hiện thực cùng thao tác "lấy đơn theo id" bằng REST (JSON) và gRPC. Đo kích thước payload và độ trễ p99 với 10.000 request, thử thêm server streaming cho trạng thái đơn. Ghi kết luận vào một ADR ngắn.
3. **GraphQL không N+1**: dựng Spring for GraphQL với query trả về danh sách 50 đơn kèm thông tin khách. Bật log SQL, đếm số query khi dùng `@SchemaMapping`, sau đó chuyển sang `@BatchMapping` và đếm lại.

## Tóm tắt

- REST phổ quát và dễ cache, hợp với API công khai; gRPC nhanh, có hợp đồng chặt và streaming, hợp với giao tiếp nội bộ; GraphQL linh hoạt cho nhiều loại client; WebSocket và SSE cho dữ liệu thời gian thực.
- API-first coi spec OpenAPI là nguồn sự thật, review trước khi code và kiểm tra tương thích trong CI.
- Với Protobuf, field number là hợp đồng: thêm field mới thoải mái, không bao giờ dùng lại số cũ, dùng `reserved`.
- gRPC client luôn cần deadline và xử lý mã trạng thái; `ManagedChannel` tạo một lần và dùng chung.
- Spring for GraphQL ánh xạ schema bằng `@QueryMapping`, `@MutationMapping`, và `@BatchMapping` để tránh N+1.
- Idempotency key chống tạo trùng khi retry; cursor pagination ổn định và nhanh hơn offset; rate limiting theo danh tính, bộ đếm dùng chung, trả `429` kèm `Retry-After`.
