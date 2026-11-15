Gần như mọi hệ thống Java mới hiện nay đều chạy trong container và được điều phối bởi Kubernetes. Với Solution Architect, hiểu sâu Docker và Kubernetes không chỉ là chuyện "viết được YAML": bạn cần biết image được build thế nào để nhanh và an toàn, JVM cư xử ra sao khi bị giới hạn bộ nhớ, và Kubernetes quyết định khi nào restart hay chuyển traffic vào một Pod. Những quyết định nhỏ ở tầng này ảnh hưởng trực tiếp đến độ ổn định, chi phí và tốc độ release của cả hệ thống.

## Mục tiêu bài học

- Viết được Dockerfile multi-stage, chạy bằng user không phải root, tận dụng layered jar; biết khi nào dùng Jib hoặc Buildpacks thay cho Dockerfile.
- Cấu hình JVM đúng trong container: hiểu container support, `MaxRAMPercentage`, giới hạn CPU và nguyên nhân OOMKilled.
- Nắm vai trò của Pod, Deployment, Service, Ingress, ConfigMap, Secret và cách chúng ghép lại thành một service hoàn chỉnh.
- Cấu hình startup/liveness/readiness probe với Spring Boot Actuator và autoscaling bằng HPA.
- Đóng gói ứng dụng bằng Helm chart với values riêng cho từng môi trường.

## Đóng gói ứng dụng Java thành image

### Tại sao cần multi-stage build

Một Dockerfile "ngây thơ" thường copy toàn bộ source vào image JDK, build bằng Maven rồi chạy luôn. Kết quả là image nặng hàng trăm MB, chứa cả compiler, Maven cache và source code, tức là vừa chậm khi pull vừa tăng bề mặt tấn công (attack surface: tập hợp các thành phần kẻ tấn công có thể khai thác).

**Multi-stage build** chia Dockerfile thành nhiều stage: stage build dùng image JDK đầy đủ, stage runtime chỉ dùng **JRE** (Java Runtime Environment: đủ để chạy, không có công cụ biên dịch) và chỉ copy kết quả cần thiết sang.

### Layered jar

Spring Boot tạo ra "fat jar" chứa cả code và toàn bộ thư viện. Nếu copy nguyên jar vào image, mỗi lần đổi một dòng code là cả layer vài chục MB thay đổi. **Layered jar** tách jar thành các layer theo tần suất thay đổi: `dependencies` (thư viện ổn định), `spring-boot-loader`, `snapshot-dependencies`, `application` (code của bạn, đổi thường xuyên nhất). Docker cache theo layer, nên lần build và pull sau chỉ phải xử lý layer `application` nhỏ.

Từ Spring Boot 3.3, lệnh giải nén là `java -Djarmode=tools -jar app.jar extract --layers`; các bản cũ hơn dùng `-Djarmode=layertools`.

```dockerfile
# ---- Stage 1: build ----
FROM eclipse-temurin:21-jdk AS build
WORKDIR /workspace
COPY mvnw pom.xml ./
COPY .mvn .mvn
RUN ./mvnw -B dependency:go-offline
COPY src src
RUN ./mvnw -B package -DskipTests \
 && java -Djarmode=tools -jar target/*.jar extract --layers --destination extracted

# ---- Stage 2: runtime ----
FROM eclipse-temurin:21-jre
RUN groupadd --system app && useradd --system --gid app app
WORKDIR /app
COPY --from=build /workspace/extracted/dependencies/ ./
COPY --from=build /workspace/extracted/spring-boot-loader/ ./
COPY --from=build /workspace/extracted/snapshot-dependencies/ ./
COPY --from=build /workspace/extracted/application/ ./
USER app
EXPOSE 8080
ENV JAVA_TOOL_OPTIONS="-XX:MaxRAMPercentage=75 -XX:+ExitOnOutOfMemoryError"
ENTRYPOINT ["java", "-jar", "app.jar"]
```

Một số điểm đáng chú ý:

- Copy `pom.xml` và tải dependency **trước** khi copy `src`, để layer dependency được cache khi chỉ code thay đổi.
- `USER app`: container không chạy bằng root, giảm thiệt hại nếu ứng dụng bị khai thác. Nhiều cluster còn bắt buộc điều này qua Pod Security Standards.
- `ENTRYPOINT` dạng mảng (exec form) giúp JVM là process PID 1 và nhận được tín hiệu `SIGTERM` để shutdown gọn gàng.
- File jar sau khi extract tên giống jar gốc; nếu artifact của bạn tên `order-service-1.0.jar` thì sửa lệnh chạy cho khớp, hoặc đặt `<finalName>app</finalName>` trong Maven.

### Jib và Buildpacks: không cần viết Dockerfile

| Công cụ | Cách hoạt động | Nên dùng khi | Hạn chế |
|---|---|---|---|
| Dockerfile | Bạn tự viết từng bước | Cần kiểm soát hoàn toàn, có bước đặc biệt (cài thêm package) | Phải tự bảo trì best practice |
| **Jib** (plugin Maven/Gradle của Google) | Build image trực tiếp từ build tool, tự chia layer, không cần Docker daemon | CI không có Docker, muốn build nhanh và tái lập (reproducible) | Ít linh hoạt khi cần chạy lệnh tuỳ ý trong image |
| **Cloud Native Buildpacks** (`mvn spring-boot:build-image`, dùng Paketo) | Tự phát hiện ứng dụng Java, chọn JRE, cấu hình bộ nhớ, tạo image chuẩn | Muốn chuẩn hoá image cho nhiều team, giảm việc viết Dockerfile | Cần Docker daemon, image và quy trình build khó tuỳ biến hơn |

Với Jib, lệnh thường dùng là `mvn compile jib:build -Dimage=registry.example.com/order-service:1.4.2` (đẩy thẳng lên registry) hoặc `jib:dockerBuild` (build vào Docker local). Ở quy mô tổ chức, SA thường chọn **một** cách làm chuẩn cho mọi team để việc vá lỗ hổng base image được thực hiện tập trung.

## JVM trong container

### Container support

JVM hiện đại (JDK 10 trở lên, và được backport về JDK 8u191) có **container support** bật mặc định (`-XX:+UseContainerSupport`): JVM đọc giới hạn bộ nhớ và CPU từ cgroup của container thay vì đọc thông số của cả máy host. JDK 17 và 21 hỗ trợ cả cgroup v1 và cgroup v2; các bản JDK cũ chưa cập nhật có thể không nhận đúng giới hạn trên cgroup v2, đây là lý do nên dùng bản JDK được vá thường xuyên.

### Bộ nhớ: heap không phải là tất cả

Mặc định JVM chỉ dùng khoảng 25% bộ nhớ container cho heap (`MaxRAMPercentage=25`), quá lãng phí với container chỉ chạy một ứng dụng. Ngược lại, nếu đặt heap bằng toàn bộ limit, process sẽ vượt giới hạn vì JVM còn dùng bộ nhớ ngoài heap:

```text
Container memory limit (vd. 768Mi)
+--------------------------------------------------+
| Heap (-XX:MaxRAMPercentage=75 -> ~576Mi)         |
+--------------------------------------------------+
| Metaspace | Thread stacks | Code cache | Direct  |
| buffers (Netty, NIO) | GC structures | native    |
+--------------------------------------------------+
```

Khi tổng bộ nhớ của process vượt limit, kernel giết process và Kubernetes báo trạng thái `OOMKilled` với exit code 137. Lỗi này **khác** với `java.lang.OutOfMemoryError` (heap đầy, JVM tự ném). Quy tắc thực tế:

- Dùng `-XX:MaxRAMPercentage` (thường 60–75%) thay vì `-Xmx` cố định, để khi đổi limit không phải sửa lại cờ JVM.
- Ứng dụng nhiều thread, dùng nhiều direct buffer hoặc metaspace lớn thì để tỉ lệ thấp hơn.
- Thêm `-XX:+ExitOnOutOfMemoryError` để JVM thoát ngay khi heap đầy, Kubernetes sẽ khởi động lại Pod sạch sẽ thay vì để ứng dụng chạy trong trạng thái hỏng.
- Truyền cờ qua biến môi trường `JAVA_TOOL_OPTIONS`, để đổi cấu hình mà không cần build lại image.

### CPU

JVM dùng số CPU nhìn thấy được để quyết định số GC thread, kích thước thread pool mặc định (ví dụ `ForkJoinPool.commonPool`). Nếu container chỉ được cấp dưới 2 CPU hoặc dưới khoảng 2GB bộ nhớ, JVM coi đó không phải "server-class machine" và mặc định chọn **Serial GC** thay vì G1. Hãy chỉ định rõ `-XX:+UseG1GC` nếu bạn cần G1, hoặc dùng `-XX:ActiveProcessorCount` để ghi đè số CPU JVM nhìn thấy.

Về CPU limit có một đánh đổi: limit giúp chia tài nguyên công bằng nhưng gây **throttling** (process bị tạm dừng khi dùng hết quota trong một chu kỳ), làm tăng độ trễ, đặc biệt lúc JVM khởi động và JIT biên dịch. Hãy đo thực tế trước khi siết CPU limit quá chặt.

## Các đối tượng Kubernetes cốt lõi

| Đối tượng | Vai trò |
|---|---|
| **Pod** | Đơn vị chạy nhỏ nhất, gồm một hoặc vài container dùng chung network và volume. Pod có thể bị xoá và tạo lại bất cứ lúc nào, IP không cố định. |
| **Deployment** | Khai báo trạng thái mong muốn (image nào, bao nhiêu replica). Quản lý ReplicaSet, hỗ trợ rolling update và rollback. |
| **Service** | Địa chỉ ổn định (DNS nội bộ) trỏ tới tập Pod theo label selector. Loại phổ biến: `ClusterIP` (nội bộ), `NodePort`, `LoadBalancer` (tạo load balancer của cloud). |
| **Ingress** | Định tuyến HTTP/HTTPS từ bên ngoài vào Service theo host và path. Cần có Ingress controller cài trong cluster. Gateway API là chuẩn mới hơn, linh hoạt hơn, đáng cân nhắc cho dự án mới. |
| **ConfigMap** | Cấu hình không nhạy cảm (URL, feature flag), inject vào Pod dưới dạng biến môi trường hoặc file. |
| **Secret** | Dữ liệu nhạy cảm (mật khẩu, token). Mặc định chỉ được mã hoá base64, **không** phải mã hoá thật; cần bật encryption at rest, giới hạn RBAC và thường kết hợp External Secrets Operator hoặc Vault. |

Ví dụ một Deployment cho service Java, có resource, probe và cấu hình lấy từ ConfigMap/Secret:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: order-service
spec:
  replicas: 3
  selector:
    matchLabels: { app: order-service }
  template:
    metadata:
      labels: { app: order-service }
    spec:
      terminationGracePeriodSeconds: 40
      containers:
        - name: app
          image: registry.example.com/order-service:1.4.2
          ports:
            - containerPort: 8080
          envFrom:
            - configMapRef: { name: order-service-config }
            - secretRef: { name: order-service-db }
          resources:
            requests: { cpu: "500m", memory: "768Mi" }
            limits: { cpu: "1", memory: "768Mi" }
          startupProbe:
            httpGet: { path: /actuator/health/liveness, port: 8080 }
            periodSeconds: 5
            failureThreshold: 24
          livenessProbe:
            httpGet: { path: /actuator/health/liveness, port: 8080 }
            periodSeconds: 10
          readinessProbe:
            httpGet: { path: /actuator/health/readiness, port: 8080 }
            periodSeconds: 5
```

Service và Ingress đi kèm:

```yaml
apiVersion: v1
kind: Service
metadata:
  name: order-service
spec:
  selector: { app: order-service }
  ports:
    - port: 80
      targetPort: 8080
---
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: order-service
spec:
  ingressClassName: example-ingress   # trùng với IngressClass của controller đang cài
  rules:
    - host: api.example.com
      http:
        paths:
          - path: /orders
            pathType: Prefix
            backend:
              service:
                name: order-service
                port: { number: 80 }
```

**Requests** là lượng tài nguyên scheduler dùng để chọn node (cam kết tối thiểu); **limits** là trần tối đa. Với bộ nhớ, nên đặt request bằng limit: Pod không bao giờ dùng vượt mức đã đăng ký nên giảm nguy cơ bị đuổi (evict) khi node thiếu bộ nhớ.

## Health probe và autoscaling

### Ba loại probe

- **startupProbe**: kiểm tra ứng dụng đã khởi động xong chưa. Trong lúc startup probe chưa thành công, Kubernetes **chưa** chạy liveness/readiness. Rất hữu ích cho Java vốn khởi động chậm: ví dụ trên cho phép tối đa 24 × 5 = 120 giây.
- **livenessProbe**: ứng dụng còn "sống" không? Thất bại liên tiếp thì Kubernetes **restart container**.
- **readinessProbe**: ứng dụng có sẵn sàng nhận traffic không? Thất bại thì Pod bị **gỡ khỏi Service** (không nhận request) nhưng không bị restart.

Spring Boot Actuator cung cấp sẵn `/actuator/health/liveness` và `/actuator/health/readiness`. Hai endpoint này tự bật khi ứng dụng phát hiện mình chạy trên Kubernetes; khi chạy nơi khác thì bật bằng cấu hình:

```yaml
management:
  endpoint:
    health:
      probes:
        enabled: true
      group:
        readiness:
          include: readinessState,db
server:
  shutdown: graceful
spring:
  lifecycle:
    timeout-per-shutdown-phase: 30s
```

> **Lưu ý:** Liveness **không** nên kiểm tra database hay service bên ngoài. Nếu DB chết mà liveness phụ thuộc DB, Kubernetes sẽ restart toàn bộ Pod liên tục (restart storm) mà không giải quyết được gì. Phụ thuộc bên ngoài, nếu muốn, chỉ đưa vào readiness, và cân nhắc kỹ vì DB chết thì mọi Pod cùng mất readiness.

`server.shutdown: graceful` giúp ứng dụng xử lý nốt request đang chạy khi nhận `SIGTERM`. Đặt `terminationGracePeriodSeconds` lớn hơn thời gian shutdown của ứng dụng để Kubernetes không kill quá sớm.

### HorizontalPodAutoscaler

**HPA** tự tăng giảm số replica dựa trên metric. Cần có metrics-server trong cluster.

```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: order-service
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: order-service
  minReplicas: 3
  maxReplicas: 10
  metrics:
    - type: Resource
      resource:
        name: cpu
        target:
          type: Utilization
          averageUtilization: 70
  behavior:
    scaleDown:
      stabilizationWindowSeconds: 300
```

`averageUtilization: 70` tính theo phần trăm của **CPU request**, nên thiếu request thì HPA không hoạt động đúng. Với Java, CPU tăng vọt lúc khởi động (JIT) có thể khiến HPA scale lên không cần thiết; startup probe và `stabilizationWindowSeconds` giúp giảm dao động. Metric bộ nhớ thường kém hiệu quả với JVM vì heap ít khi co lại sau khi tăng. Với workload tiêu thụ message, scale theo độ trễ hàng đợi (ví dụ dùng KEDA) thường hợp lý hơn CPU.

## Đóng gói với Helm

Khi có nhiều service và nhiều môi trường, copy YAML cho từng nơi nhanh chóng trở thành ác mộng. **Helm** là trình quản lý package cho Kubernetes: một **chart** là bộ template YAML có tham số, mỗi lần cài là một **release** có lịch sử phiên bản để rollback.

```text
order-service/
  Chart.yaml          # tên, version của chart (apiVersion: v2 cho Helm 3)
  values.yaml         # giá trị mặc định
  values-prod.yaml    # ghi đè cho production
  templates/
    deployment.yaml
    service.yaml
    hpa.yaml
    _helpers.tpl      # hàm template dùng chung (tên, label)
```

Template dùng cú pháp Go template để chèn giá trị:

```yaml
# templates/deployment.yaml (trích)
spec:
  {{- if not .Values.autoscaling.enabled }}
  replicas: {{ .Values.replicaCount }}
  {{- end }}
  template:
    spec:
      containers:
        - name: app
          image: "{{ .Values.image.repository }}:{{ .Values.image.tag }}"
          resources:
            {{- toYaml .Values.resources | nindent 12 }}
```

Các lệnh hay dùng:

```bash
helm template order-service ./order-service -f values-prod.yaml   # render ra YAML để review
helm upgrade --install order-service ./order-service \
  -n prod -f values-prod.yaml --atomic --timeout 5m
helm history order-service -n prod
helm rollback order-service 3 -n prod
```

`--atomic` tự rollback nếu release không thành công trong thời gian chờ. Khi có nhiều service giống nhau, nhiều tổ chức xây một "library chart" hoặc chart chuẩn dùng chung, mỗi service chỉ cần file values riêng. Khi nào không cần Helm? Nếu chỉ có vài manifest đơn giản, Kustomize (tích hợp sẵn trong `kubectl`) với cơ chế overlay theo môi trường có thể đủ dùng và dễ đọc hơn.

## Lỗi thường gặp

- **Dùng tag `latest` cho image**: không biết đang chạy phiên bản nào, rollback không đáng tin. Hãy dùng tag theo version hoặc commit SHA, tốt nhất là cả digest.
- **Đặt `-Xmx` bằng memory limit**: Pod bị OOMKilled liên tục. Dùng `MaxRAMPercentage` và chừa phần ngoài heap.
- **Không đặt resource requests**: scheduler xếp quá nhiều Pod lên một node, HPA không tính được utilization. Luôn đặt requests dựa trên số liệu đo thực tế.
- **Liveness kiểm tra database**: gây restart storm khi DB gặp sự cố. Liveness chỉ phản ánh trạng thái nội tại của process.
- **Không có startup probe cho ứng dụng khởi động chậm**: liveness giết Pod trước khi Spring context kịp khởi tạo, Pod rơi vào CrashLoopBackOff. Thêm startupProbe thay vì tăng `initialDelaySeconds` một cách mò mẫm.
- **Để Secret dạng plain text trong Git**: base64 không phải mã hoá. Dùng Sealed Secrets, External Secrets Operator hoặc secret manager của cloud.
- **Chạy container bằng root và dùng image JDK đầy đủ**: tăng rủi ro bảo mật và kích thước image. Dùng JRE (hoặc image distroless) và user không đặc quyền.
- **Helm chart đặt cứng `replicas` khi đã bật HPA**: mỗi lần `helm upgrade` sẽ reset số replica mà HPA đã tính. Bỏ `replicas` khỏi template khi autoscaling bật.

## Bài tập thực hành

1. **Tối ưu image**: lấy một ứng dụng Spring Boot 3 có sẵn, viết Dockerfile multi-stage như trên. So sánh kích thước image với bản single-stage dùng JDK, rồi sửa một dòng code và đo xem lần build/push sau chỉ thay đổi layer nào (`docker history`). Thử build cùng ứng dụng bằng Jib và `spring-boot:build-image`, ghi lại ưu nhược điểm.
2. **Thí nghiệm bộ nhớ**: chạy container với `docker run -m 512m` và lần lượt đặt `-Xmx512m`, rồi `-XX:MaxRAMPercentage=75`. Tạo tải bằng một endpoint cấp phát nhiều thread hoặc direct buffer, quan sát khi nào bị kill với exit code 137. In `java -XX:+PrintFlagsFinal -version | grep -E "MaxHeapSize|UseSerialGC|UseG1GC"` bên trong container với các mức CPU/memory khác nhau.
3. **Triển khai trên cluster local** (kind, minikube hoặc k3d): viết Helm chart cho ứng dụng gồm Deployment, Service, Ingress, HPA; cấu hình startup/liveness/readiness probe. Dùng một công cụ tạo tải (ví dụ `hey` hoặc k6) để xem HPA scale lên, sau đó dừng tải và quan sát scale xuống sau cửa sổ ổn định.

## Tóm tắt

- Image Java tốt: multi-stage, base image JRE, user không phải root, layered jar để cache hiệu quả; Jib và Buildpacks là lựa chọn thay Dockerfile khi muốn chuẩn hoá.
- JVM đọc giới hạn từ cgroup; dùng `MaxRAMPercentage` và chừa bộ nhớ ngoài heap để tránh OOMKilled (exit code 137).
- Container ít CPU khiến JVM chọn Serial GC và giảm số thread; chỉ định GC rõ ràng và cân nhắc throttling khi đặt CPU limit.
- Deployment quản lý Pod, Service cho địa chỉ ổn định, Ingress (hoặc Gateway API) đưa traffic từ ngoài vào, ConfigMap/Secret tách cấu hình khỏi image.
- Startup probe cho Java khởi động chậm, liveness chỉ kiểm tra nội tại process, readiness quyết định Pod có nhận traffic.
- HPA tính utilization theo requests; cần đặt requests đúng và cửa sổ ổn định để tránh scale dao động.
- Helm biến manifest thành chart có tham số và lịch sử release, giúp triển khai nhất quán trên nhiều môi trường.
