export type Level = 'Cơ bản' | 'Trung cấp' | 'Nâng cao';

export type ResourceType = 'doc' | 'book' | 'course' | 'article' | 'tool';

export interface Resource {
  title: string;
  url: string;
  type: ResourceType;
}

export interface Topic {
  id: string;
  title: string;
  level: Level;
  description: string;
  skills: string[];
  resources: Resource[];
}

export interface Phase {
  id: string;
  order: number;
  title: string;
  subtitle: string;
  role: string;
  duration: string;
  weeks: number;
  color: string;
  icon: PhaseIcon;
  goal: string;
  milestone: string;
  topics: Topic[];
}

export type PhaseIcon =
  | 'java'
  | 'spring'
  | 'data'
  | 'messaging'
  | 'microservices'
  | 'cloud'
  | 'security'
  | 'design'
  | 'architect'
  | 'career';

export const phases: Phase[] = [
  {
    id: 'java-core',
    order: 1,
    title: 'Nền tảng Java Core',
    subtitle: 'Ngôn ngữ, JVM và kỹ thuật lập trình vững chắc',
    role: 'Junior Java Developer',
    duration: '8–10 tuần',
    weeks: 10,
    color: '#f5222d',
    icon: 'java',
    goal: 'Viết code Java hiện đại (17/21) sạch, có test, hiểu cách JVM chạy code của bạn.',
    milestone:
      'Xây dựng CLI quản lý thư viện: dùng Collections, Stream API, xử lý file, đa luồng với ExecutorService, build bằng Maven và có > 80% test coverage.',
    topics: [
      {
        id: 'oop',
        title: 'OOP & Java hiện đại',
        level: 'Cơ bản',
        description:
          'Lập trình hướng đối tượng, các tính năng mới từ Java 8 đến 21 như record, sealed class, pattern matching, switch expression.',
        skills: [
          'Nắm vững 4 tính chất OOP: đóng gói, kế thừa, đa hình, trừu tượng',
          'Hiểu interface, abstract class, default method',
          'Dùng record, sealed class, pattern matching cho instanceof/switch',
          'Áp dụng nguyên lý SOLID trong thiết kế class',
          'Biết các Design Pattern GoF phổ biến: Factory, Builder, Strategy, Observer, Singleton',
        ],
        resources: [
          { title: 'dev.java – Learn Java', url: 'https://dev.java/learn/', type: 'doc' },
          { title: 'Refactoring Guru – Design Patterns', url: 'https://refactoring.guru/design-patterns', type: 'article' },
        ],
      },
      {
        id: 'collections-streams',
        title: 'Collections, Generics & Stream API',
        level: 'Cơ bản',
        description: 'Cấu trúc dữ liệu chuẩn của Java, generics và lập trình hàm với lambda/stream.',
        skills: [
          'Phân biệt List/Set/Map/Queue và độ phức tạp của từng implementation',
          'Hiểu equals/hashCode và cách HashMap hoạt động bên trong',
          'Viết generic class/method, hiểu wildcard (? extends / ? super)',
          'Thành thạo Stream API: map, filter, reduce, collect, groupingBy',
          'Dùng Optional đúng cách, tránh NullPointerException',
        ],
        resources: [
          { title: 'Oracle – Collections Framework', url: 'https://dev.java/learn/api/collections-framework/', type: 'doc' },
          { title: 'Oracle – Stream API', url: 'https://dev.java/learn/api/streams/', type: 'doc' },
        ],
      },
      {
        id: 'concurrency',
        title: 'Lập trình đồng thời (Concurrency)',
        level: 'Trung cấp',
        description: 'Thread, đồng bộ hoá, java.util.concurrent, CompletableFuture và Virtual Threads (Project Loom).',
        skills: [
          'Hiểu Thread, Runnable, Callable, vòng đời thread',
          'Dùng synchronized, volatile, Lock, Atomic*, hiểu Java Memory Model',
          'Sử dụng ExecutorService, thread pool và chọn kích thước pool',
          'Lập trình bất đồng bộ với CompletableFuture',
          'Dùng Virtual Threads (Java 21) và biết khi nào nên dùng',
          'Nhận biết deadlock, race condition, starvation',
        ],
        resources: [
          { title: 'JEP 444 – Virtual Threads', url: 'https://openjdk.org/jeps/444', type: 'doc' },
          { title: 'dev.java – Concurrency', url: 'https://dev.java/learn/concurrency/', type: 'doc' },
        ],
      },
      {
        id: 'jvm',
        title: 'JVM Internals & Performance',
        level: 'Nâng cao',
        description: 'Bộ nhớ JVM, Garbage Collector, class loading, JIT và công cụ profiling.',
        skills: [
          'Hiểu cấu trúc bộ nhớ: Heap, Stack, Metaspace',
          'So sánh các GC: G1, ZGC, Shenandoah, Parallel',
          'Đọc GC log, phân tích heap dump và thread dump',
          'Dùng JFR, JDK Mission Control, VisualVM để profiling',
          'Viết micro-benchmark với JMH',
        ],
        resources: [
          { title: 'JVM Specification (SE 21)', url: 'https://docs.oracle.com/javase/specs/jvms/se21/html/index.html', type: 'doc' },
          { title: 'OpenJDK JMH', url: 'https://github.com/openjdk/jmh', type: 'tool' },
        ],
      },
      {
        id: 'build-test',
        title: 'Build Tools & Testing',
        level: 'Cơ bản',
        description: 'Maven/Gradle, quản lý dependency, unit test và mock.',
        skills: [
          'Hiểu vòng đời build của Maven và cấu trúc pom.xml',
          'Viết build script Gradle (Kotlin DSL), multi-module project',
          'Viết unit test với JUnit 5 (parameterized, nested test)',
          'Mock dependency với Mockito, đo coverage bằng JaCoCo',
          'Áp dụng TDD cho một tính năng nhỏ',
        ],
        resources: [
          { title: 'Maven Guides', url: 'https://maven.apache.org/guides/', type: 'doc' },
          { title: 'Gradle User Guide', url: 'https://docs.gradle.org/current/userguide/userguide.html', type: 'doc' },
          { title: 'JUnit 5 User Guide', url: 'https://junit.org/junit5/docs/current/user-guide/', type: 'doc' },
          { title: 'Mockito', url: 'https://site.mockito.org/', type: 'tool' },
        ],
      },
    ],
  },
  {
    id: 'spring',
    order: 2,
    title: 'Hệ sinh thái Spring',
    subtitle: 'Spring Framework, Spring Boot và các dự án vệ tinh',
    role: 'Java Backend Developer',
    duration: '8–10 tuần',
    weeks: 10,
    color: '#52c41a',
    icon: 'spring',
    goal: 'Xây dựng REST API production-ready với Spring Boot, có bảo mật, test tích hợp và giám sát.',
    milestone:
      'Xây dựng API quản lý đơn hàng bằng Spring Boot 3: REST + OpenAPI, Spring Data JPA với PostgreSQL, bảo mật JWT, Actuator, test tích hợp với Testcontainers.',
    topics: [
      {
        id: 'spring-core',
        title: 'Spring Core: IoC, DI, AOP',
        level: 'Cơ bản',
        description: 'Container của Spring, vòng đời bean, cấu hình và lập trình hướng khía cạnh.',
        skills: [
          'Hiểu Inversion of Control và Dependency Injection (constructor injection)',
          'Nắm vòng đời bean, scope (singleton, prototype, request)',
          'Cấu hình bằng @Configuration, @Bean, @Profile, @Conditional',
          'Hiểu proxy và AOP (@Transactional, @Async hoạt động thế nào)',
        ],
        resources: [
          { title: 'Spring Framework Reference', url: 'https://docs.spring.io/spring-framework/reference/', type: 'doc' },
        ],
      },
      {
        id: 'spring-boot',
        title: 'Spring Boot & REST API',
        level: 'Cơ bản',
        description: 'Auto-configuration, starter, externalized config, xây dựng RESTful API chuẩn.',
        skills: [
          'Hiểu auto-configuration và cách viết starter riêng',
          'Quản lý cấu hình: application.yml, profile, @ConfigurationProperties',
          'Thiết kế REST API đúng chuẩn: HTTP method, status code, versioning',
          'Validate input (Bean Validation) và xử lý lỗi tập trung (@ControllerAdvice, ProblemDetail)',
          'Sinh tài liệu API với OpenAPI/springdoc',
          'Giám sát ứng dụng với Spring Boot Actuator',
        ],
        resources: [
          { title: 'Spring Boot Reference', url: 'https://docs.spring.io/spring-boot/index.html', type: 'doc' },
          { title: 'Spring Guides', url: 'https://spring.io/guides', type: 'course' },
          { title: 'springdoc-openapi', url: 'https://springdoc.org/', type: 'tool' },
        ],
      },
      {
        id: 'spring-data',
        title: 'Spring Data JPA & Hibernate',
        level: 'Trung cấp',
        description: 'ORM, quản lý transaction, tối ưu truy vấn và migration schema.',
        skills: [
          'Mapping entity, quan hệ (OneToMany, ManyToMany), fetch type',
          'Phát hiện và xử lý vấn đề N+1 query (fetch join, EntityGraph)',
          'Hiểu persistence context, dirty checking, first/second-level cache',
          'Quản lý transaction: propagation, isolation, rollback rule',
          'Quản lý migration bằng Flyway hoặc Liquibase',
        ],
        resources: [
          { title: 'Spring Data JPA Reference', url: 'https://docs.spring.io/spring-data/jpa/reference/', type: 'doc' },
          { title: 'Hibernate ORM Docs', url: 'https://hibernate.org/orm/documentation/', type: 'doc' },
        ],
      },
      {
        id: 'spring-security',
        title: 'Spring Security',
        level: 'Trung cấp',
        description: 'Xác thực, phân quyền, OAuth2 Resource Server, JWT.',
        skills: [
          'Hiểu kiến trúc SecurityFilterChain',
          'Cấu hình xác thực form, Basic, JWT',
          'Triển khai OAuth2 Resource Server và OAuth2 Client',
          'Phân quyền theo role/authority, method security (@PreAuthorize)',
        ],
        resources: [
          { title: 'Spring Security Reference', url: 'https://docs.spring.io/spring-security/reference/', type: 'doc' },
        ],
      },
      {
        id: 'reactive-testing',
        title: 'Reactive & Integration Testing',
        level: 'Nâng cao',
        description: 'Spring WebFlux, Project Reactor và kiểm thử tích hợp với container thật.',
        skills: [
          'Hiểu mô hình reactive, backpressure, Mono/Flux',
          'Biết khi nào chọn WebFlux, khi nào chọn MVC + Virtual Threads',
          'Viết slice test: @WebMvcTest, @DataJpaTest',
          'Test tích hợp với Testcontainers (PostgreSQL, Kafka, Redis)',
        ],
        resources: [
          { title: 'Spring WebFlux', url: 'https://docs.spring.io/spring-framework/reference/web/webflux.html', type: 'doc' },
          { title: 'Project Reactor', url: 'https://projectreactor.io/docs', type: 'doc' },
          { title: 'Testcontainers', url: 'https://testcontainers.com/', type: 'tool' },
        ],
      },
    ],
  },
  {
    id: 'data',
    order: 3,
    title: 'Dữ liệu & Lưu trữ',
    subtitle: 'SQL, NoSQL, caching và tìm kiếm',
    role: 'Mid-level Backend Developer',
    duration: '6–8 tuần',
    weeks: 8,
    color: '#fa8c16',
    icon: 'data',
    goal: 'Chọn đúng kho dữ liệu cho từng bài toán và thiết kế mô hình dữ liệu có khả năng mở rộng.',
    milestone:
      'Thiết kế mô hình dữ liệu cho hệ thống thương mại điện tử: PostgreSQL cho đơn hàng, Redis cache cho catalog, Elasticsearch cho tìm kiếm sản phẩm. Viết tài liệu giải thích lựa chọn.',
    topics: [
      {
        id: 'rdbms',
        title: 'Cơ sở dữ liệu quan hệ',
        level: 'Cơ bản',
        description: 'PostgreSQL/MySQL, chuẩn hoá, index, transaction và tối ưu truy vấn.',
        skills: [
          'Thiết kế schema, chuẩn hoá (1NF–3NF) và khi nào nên phi chuẩn hoá',
          'Hiểu B-Tree index, composite index, covering index',
          'Đọc execution plan (EXPLAIN ANALYZE) và tối ưu query',
          'Hiểu ACID, các mức isolation và hiện tượng dirty/phantom read',
          'Quản lý connection pool (HikariCP)',
        ],
        resources: [
          { title: 'PostgreSQL Documentation', url: 'https://www.postgresql.org/docs/current/', type: 'doc' },
          { title: 'Use The Index, Luke!', url: 'https://use-the-index-luke.com/', type: 'article' },
        ],
      },
      {
        id: 'nosql',
        title: 'NoSQL',
        level: 'Trung cấp',
        description: 'Document, key-value, wide-column, graph và cách chọn loại phù hợp.',
        skills: [
          'Phân biệt document (MongoDB), key-value (DynamoDB), wide-column (Cassandra), graph (Neo4j)',
          'Thiết kế dữ liệu theo access pattern',
          'Hiểu định lý CAP và PACELC',
          'Hiểu eventual consistency, quorum read/write',
        ],
        resources: [
          { title: 'MongoDB Docs', url: 'https://www.mongodb.com/docs/', type: 'doc' },
          { title: 'Apache Cassandra Docs', url: 'https://cassandra.apache.org/doc/latest/', type: 'doc' },
        ],
      },
      {
        id: 'caching',
        title: 'Caching',
        level: 'Trung cấp',
        description: 'Redis, các chiến lược cache và vấn đề nhất quán dữ liệu.',
        skills: [
          'Áp dụng cache-aside, read-through, write-through, write-behind',
          'Dùng Spring Cache abstraction với Redis/Caffeine',
          'Xử lý cache stampede, cache penetration, hot key',
          'Thiết kế TTL và chiến lược invalidation',
        ],
        resources: [
          { title: 'Redis Docs', url: 'https://redis.io/docs/latest/', type: 'doc' },
        ],
      },
      {
        id: 'scaling-data',
        title: 'Mở rộng dữ liệu & Tìm kiếm',
        level: 'Nâng cao',
        description: 'Replication, partitioning/sharding, full-text search và CDC.',
        skills: [
          'Hiểu replication leader-follower, multi-leader và độ trễ replication',
          'Thiết kế sharding: theo range, theo hash, consistent hashing',
          'Xây dựng tìm kiếm full-text với Elasticsearch/OpenSearch',
          'Đồng bộ dữ liệu bằng Change Data Capture (Debezium)',
        ],
        resources: [
          { title: 'Elastic Docs', url: 'https://www.elastic.co/guide/index.html', type: 'doc' },
          { title: 'Debezium Docs', url: 'https://debezium.io/documentation/', type: 'doc' },
        ],
      },
    ],
  },
  {
    id: 'integration',
    order: 4,
    title: 'Tích hợp & Messaging',
    subtitle: 'API, message broker và kiến trúc hướng sự kiện',
    role: 'Senior Backend Developer',
    duration: '6–8 tuần',
    weeks: 8,
    color: '#13c2c2',
    icon: 'messaging',
    goal: 'Thiết kế giao tiếp giữa các hệ thống: đồng bộ, bất đồng bộ, và hướng sự kiện một cách tin cậy.',
    milestone:
      'Tách hệ thống đơn hàng thành Order và Payment giao tiếp qua Kafka, áp dụng Transactional Outbox và Saga để đảm bảo nhất quán.',
    topics: [
      {
        id: 'api-styles',
        title: 'Phong cách API',
        level: 'Trung cấp',
        description: 'REST, gRPC, GraphQL, WebSocket và cách lựa chọn.',
        skills: [
          'So sánh REST, gRPC, GraphQL theo hiệu năng, tooling và use case',
          'Thiết kế API-first với OpenAPI',
          'Xây dựng service gRPC với Protobuf trong Java',
          'Dùng Spring for GraphQL',
          'Thiết kế idempotency key, pagination, rate limiting cho API',
        ],
        resources: [
          { title: 'OpenAPI Specification', url: 'https://swagger.io/specification/', type: 'doc' },
          { title: 'gRPC Java', url: 'https://grpc.io/docs/languages/java/', type: 'doc' },
          { title: 'Spring for GraphQL', url: 'https://docs.spring.io/spring-graphql/reference/', type: 'doc' },
        ],
      },
      {
        id: 'messaging',
        title: 'Message Broker',
        level: 'Trung cấp',
        description: 'Apache Kafka, RabbitMQ và đảm bảo giao nhận message.',
        skills: [
          'Hiểu kiến trúc Kafka: topic, partition, consumer group, offset',
          'Hiểu RabbitMQ: exchange, queue, routing key',
          'Phân biệt at-most-once, at-least-once, exactly-once',
          'Xử lý message lỗi: retry, dead-letter queue',
          'Dùng Spring for Apache Kafka / Spring AMQP',
        ],
        resources: [
          { title: 'Apache Kafka Documentation', url: 'https://kafka.apache.org/documentation/', type: 'doc' },
          { title: 'RabbitMQ Tutorials', url: 'https://www.rabbitmq.com/tutorials', type: 'course' },
        ],
      },
      {
        id: 'eda',
        title: 'Event-Driven Architecture',
        level: 'Nâng cao',
        description: 'Event sourcing, CQRS, Saga, Outbox và thiết kế event.',
        skills: [
          'Phân biệt event notification, event-carried state transfer, event sourcing',
          'Áp dụng CQRS tách mô hình đọc và ghi',
          'Triển khai Saga (choreography và orchestration)',
          'Triển khai Transactional Outbox để tránh dual-write',
          'Quản lý schema event (Avro, Schema Registry) và versioning',
        ],
        resources: [
          { title: 'microservices.io – Patterns', url: 'https://microservices.io/patterns/index.html', type: 'article' },
          { title: 'Martin Fowler – Event-Driven', url: 'https://martinfowler.com/articles/201701-event-driven.html', type: 'article' },
        ],
      },
      {
        id: 'eip',
        title: 'Enterprise Integration Patterns',
        level: 'Nâng cao',
        description: 'Các mẫu tích hợp doanh nghiệp và công cụ triển khai trong Java.',
        skills: [
          'Biết các mẫu EIP: Message Router, Translator, Aggregator, Splitter',
          'Dùng Apache Camel hoặc Spring Integration để tích hợp hệ thống cũ',
          'Hiểu vai trò của API Gateway, ESB và iPaaS',
        ],
        resources: [
          { title: 'Enterprise Integration Patterns', url: 'https://www.enterpriseintegrationpatterns.com/', type: 'article' },
          { title: 'Apache Camel Manual', url: 'https://camel.apache.org/manual/', type: 'doc' },
        ],
      },
    ],
  },
  {
    id: 'microservices',
    order: 5,
    title: 'Microservices & Hệ phân tán',
    subtitle: 'DDD, Spring Cloud, resilience và observability',
    role: 'Senior Developer / Tech Lead',
    duration: '8–10 tuần',
    weeks: 10,
    color: '#1677ff',
    icon: 'microservices',
    goal: 'Phân rã hệ thống đúng ranh giới nghiệp vụ và vận hành hệ phân tán ổn định, quan sát được.',
    milestone:
      'Xây dựng hệ thống 4–5 microservice với Spring Cloud Gateway, service discovery, Resilience4j, distributed tracing bằng OpenTelemetry và dashboard Grafana.',
    topics: [
      {
        id: 'ddd',
        title: 'Domain-Driven Design',
        level: 'Trung cấp',
        description: 'Strategic & tactical DDD để tìm ranh giới service.',
        skills: [
          'Xác định bounded context, ubiquitous language',
          'Vẽ context map: shared kernel, anti-corruption layer, customer-supplier',
          'Thiết kế aggregate, entity, value object, domain event',
          'Tổ chức workshop Event Storming',
          'Biết khi nào nên chọn modular monolith (Spring Modulith) thay vì microservices',
        ],
        resources: [
          { title: 'Domain Language – DDD', url: 'https://www.domainlanguage.com/ddd/', type: 'article' },
          { title: 'Spring Modulith', url: 'https://docs.spring.io/spring-modulith/reference/', type: 'doc' },
        ],
      },
      {
        id: 'spring-cloud',
        title: 'Spring Cloud',
        level: 'Trung cấp',
        description: 'Các thành phần hạ tầng cho microservices trong hệ sinh thái Spring.',
        skills: [
          'Dựng API Gateway với Spring Cloud Gateway',
          'Service discovery (Eureka/Consul hoặc Kubernetes DNS)',
          'Quản lý cấu hình tập trung (Spring Cloud Config)',
          'Gọi service khác bằng OpenFeign / RestClient có load balancing',
        ],
        resources: [
          { title: 'Spring Cloud', url: 'https://spring.io/projects/spring-cloud', type: 'doc' },
        ],
      },
      {
        id: 'resilience',
        title: 'Resilience & Fault Tolerance',
        level: 'Nâng cao',
        description: 'Thiết kế hệ thống chịu lỗi khi các phụ thuộc gặp sự cố.',
        skills: [
          'Áp dụng Circuit Breaker, Retry (exponential backoff + jitter), Timeout',
          'Dùng Bulkhead và Rate Limiter với Resilience4j',
          'Thiết kế graceful degradation và fallback',
          'Hiểu chaos engineering và cách kiểm thử khả năng chịu lỗi',
        ],
        resources: [
          { title: 'Resilience4j Docs', url: 'https://resilience4j.readme.io/docs', type: 'doc' },
        ],
      },
      {
        id: 'observability',
        title: 'Observability',
        level: 'Nâng cao',
        description: 'Logs, metrics, traces — ba trụ cột quan sát hệ thống.',
        skills: [
          'Ghi log có cấu trúc (JSON) và correlation ID',
          'Thu thập metrics bằng Micrometer + Prometheus, dựng dashboard Grafana',
          'Distributed tracing với OpenTelemetry',
          'Định nghĩa SLI/SLO/SLA và cảnh báo (alerting)',
        ],
        resources: [
          { title: 'OpenTelemetry Java', url: 'https://opentelemetry.io/docs/languages/java/', type: 'doc' },
          { title: 'Micrometer', url: 'https://docs.micrometer.io/micrometer/reference/', type: 'doc' },
          { title: 'Prometheus', url: 'https://prometheus.io/docs/introduction/overview/', type: 'doc' },
        ],
      },
    ],
  },
  {
    id: 'cloud',
    order: 6,
    title: 'Cloud & DevOps',
    subtitle: 'Container, Kubernetes, CI/CD, IaC và nền tảng cloud',
    role: 'Tech Lead',
    duration: '8–10 tuần',
    weeks: 10,
    color: '#722ed1',
    icon: 'cloud',
    goal: 'Đưa ứng dụng Java lên cloud tự động, an toàn, tối ưu chi phí theo các framework Well-Architected.',
    milestone:
      'Triển khai hệ thống microservice lên Kubernetes (EKS/AKS/GKE) bằng Terraform + Helm, CI/CD với GitHub Actions, có autoscaling và blue-green deployment.',
    topics: [
      {
        id: 'containers',
        title: 'Docker & Kubernetes',
        level: 'Trung cấp',
        description: 'Đóng gói và điều phối ứng dụng Java trong container.',
        skills: [
          'Viết Dockerfile tối ưu cho Java (multi-stage, layered jar, Jib/Buildpacks)',
          'Cấu hình JVM trong container (memory limit, MaxRAMPercentage)',
          'Hiểu Pod, Deployment, Service, Ingress, ConfigMap, Secret',
          'Cấu hình liveness/readiness probe, HPA autoscaling',
          'Đóng gói ứng dụng với Helm chart',
        ],
        resources: [
          { title: 'Docker Get Started', url: 'https://docs.docker.com/get-started/', type: 'course' },
          { title: 'Kubernetes Docs', url: 'https://kubernetes.io/docs/home/', type: 'doc' },
          { title: 'Helm Docs', url: 'https://helm.sh/docs/', type: 'doc' },
        ],
      },
      {
        id: 'cicd',
        title: 'CI/CD & GitOps',
        level: 'Trung cấp',
        description: 'Tự động hoá build, test, scan và deploy.',
        skills: [
          'Xây dựng pipeline với GitHub Actions hoặc Jenkins',
          'Tích hợp kiểm tra chất lượng: test, SonarQube, scan lỗ hổng dependency',
          'Chiến lược deploy: rolling, blue-green, canary',
          'Áp dụng GitOps với Argo CD',
        ],
        resources: [
          { title: 'GitHub Actions Docs', url: 'https://docs.github.com/en/actions', type: 'doc' },
          { title: 'Argo CD', url: 'https://argo-cd.readthedocs.io/', type: 'doc' },
        ],
      },
      {
        id: 'iac',
        title: 'Infrastructure as Code',
        level: 'Trung cấp',
        description: 'Quản lý hạ tầng bằng code, có review và version.',
        skills: [
          'Viết Terraform module, quản lý state từ xa',
          'Tổ chức môi trường dev/staging/prod',
          'Hiểu CloudFormation / Bicep / Pulumi để so sánh',
        ],
        resources: [
          { title: 'Terraform Docs', url: 'https://developer.hashicorp.com/terraform/docs', type: 'doc' },
        ],
      },
      {
        id: 'cloud-platforms',
        title: 'Nền tảng Cloud (AWS/Azure/GCP)',
        level: 'Nâng cao',
        description: 'Dịch vụ cốt lõi, mạng, và khung Well-Architected.',
        skills: [
          'Nắm dịch vụ cốt lõi: compute, storage, database, networking (VPC, subnet, LB)',
          'Hiểu IAM, multi-account/landing zone',
          'Áp dụng 6 trụ cột Well-Architected Framework',
          'Thiết kế kiến trúc multi-AZ, multi-region, chiến lược DR (RPO/RTO)',
          'Quản lý chi phí (FinOps): reserved/spot instance, right-sizing',
        ],
        resources: [
          { title: 'AWS Well-Architected', url: 'https://aws.amazon.com/architecture/well-architected/', type: 'doc' },
          { title: 'Azure Architecture Center', url: 'https://learn.microsoft.com/en-us/azure/architecture/', type: 'doc' },
          { title: 'Google Cloud Architecture Framework', url: 'https://cloud.google.com/architecture/framework', type: 'doc' },
        ],
      },
      {
        id: 'cloud-native-java',
        title: 'Cloud-native Java',
        level: 'Nâng cao',
        description: 'Tối ưu Java cho môi trường cloud và serverless.',
        skills: [
          'Biên dịch native image với GraalVM (Spring Boot Native)',
          'Tìm hiểu Quarkus/Micronaut để so sánh với Spring Boot',
          'Triển khai Java trên serverless (AWS Lambda + SnapStart)',
          'Áp dụng nguyên tắc 12-Factor App',
        ],
        resources: [
          { title: 'GraalVM Docs', url: 'https://www.graalvm.org/latest/docs/', type: 'doc' },
          { title: 'Quarkus Guides', url: 'https://quarkus.io/guides/', type: 'doc' },
          { title: 'The Twelve-Factor App', url: 'https://12factor.net/', type: 'article' },
        ],
      },
    ],
  },
  {
    id: 'security',
    order: 7,
    title: 'Bảo mật kiến trúc',
    subtitle: 'Security by design cho hệ thống doanh nghiệp',
    role: 'Tech Lead',
    duration: '4–6 tuần',
    weeks: 6,
    color: '#eb2f96',
    icon: 'security',
    goal: 'Đưa bảo mật vào từ khâu thiết kế: danh tính, dữ liệu, mạng và tuân thủ.',
    milestone:
      'Thêm Keycloak làm Identity Provider cho hệ thống microservice, bật mTLS giữa các service, lưu secret trong Vault và viết threat model theo STRIDE.',
    topics: [
      {
        id: 'appsec',
        title: 'Application Security',
        level: 'Trung cấp',
        description: 'Lỗ hổng ứng dụng phổ biến và cách phòng tránh trong Java.',
        skills: [
          'Hiểu OWASP Top 10 và cách phòng tránh trong Spring',
          'Phòng chống SQL injection, XSS, CSRF, SSRF',
          'Quét lỗ hổng dependency (OWASP Dependency-Check, Snyk)',
          'Lập threat model theo STRIDE',
        ],
        resources: [
          { title: 'OWASP Top 10', url: 'https://owasp.org/www-project-top-ten/', type: 'doc' },
        ],
      },
      {
        id: 'identity',
        title: 'Identity & Access Management',
        level: 'Nâng cao',
        description: 'OAuth 2.0, OpenID Connect, SSO và quản lý danh tính.',
        skills: [
          'Hiểu các luồng OAuth 2.0: Authorization Code + PKCE, Client Credentials',
          'Hiểu OpenID Connect, ID token vs access token',
          'Triển khai SSO với Keycloak',
          'Thiết kế phân quyền RBAC/ABAC',
        ],
        resources: [
          { title: 'OAuth 2.0', url: 'https://oauth.net/2/', type: 'doc' },
          { title: 'Keycloak Docs', url: 'https://www.keycloak.org/documentation', type: 'doc' },
        ],
      },
      {
        id: 'infra-security',
        title: 'Bảo mật hạ tầng & dữ liệu',
        level: 'Nâng cao',
        description: 'Secret, mã hoá, mạng và tuân thủ quy định.',
        skills: [
          'Quản lý secret với HashiCorp Vault / cloud KMS',
          'Mã hoá dữ liệu at-rest và in-transit, mTLS',
          'Áp dụng nguyên tắc Zero Trust, least privilege',
          'Hiểu các yêu cầu tuân thủ: GDPR, PCI-DSS, ISO 27001',
        ],
        resources: [
          { title: 'HashiCorp Vault', url: 'https://developer.hashicorp.com/vault/docs', type: 'doc' },
        ],
      },
    ],
  },
  {
    id: 'system-design',
    order: 8,
    title: 'System Design & Kiến trúc',
    subtitle: 'Phong cách kiến trúc, thuộc tính chất lượng, thiết kế quy mô lớn',
    role: 'Associate Solution Architect',
    duration: '8–12 tuần',
    weeks: 12,
    color: '#2f54eb',
    icon: 'design',
    goal: 'Thiết kế hệ thống đáp ứng yêu cầu phi chức năng và giải thích được các đánh đổi (trade-off).',
    milestone:
      'Thực hiện 5 bài thiết kế hệ thống hoàn chỉnh (URL shortener, chat, news feed, thanh toán, đặt vé): ước lượng tải, sơ đồ C4, lựa chọn công nghệ Java, phân tích trade-off.',
    topics: [
      {
        id: 'styles',
        title: 'Phong cách kiến trúc',
        level: 'Trung cấp',
        description: 'Các kiểu kiến trúc phổ biến và khi nào dùng.',
        skills: [
          'Layered, Hexagonal (Ports & Adapters), Clean Architecture',
          'Monolith, modular monolith, microservices, serverless',
          'Event-driven, space-based, pipeline architecture',
          'Kiểm soát kiến trúc bằng ArchUnit (fitness function)',
        ],
        resources: [
          { title: 'Martin Fowler – Software Architecture Guide', url: 'https://martinfowler.com/architecture/', type: 'article' },
          { title: 'ArchUnit', url: 'https://www.archunit.org/', type: 'tool' },
        ],
      },
      {
        id: 'quality-attributes',
        title: 'Thuộc tính chất lượng (NFR)',
        level: 'Trung cấp',
        description: 'Scalability, availability, performance, maintainability…',
        skills: [
          'Xác định và lượng hoá yêu cầu phi chức năng (quality attribute scenario)',
          'Tính toán availability (99.9% vs 99.99%) và chi phí tương ứng',
          'Ước lượng tải: QPS, dung lượng lưu trữ, băng thông (back-of-the-envelope)',
          'Kiểm thử tải với Gatling / k6',
        ],
        resources: [
          { title: 'Gatling Docs', url: 'https://docs.gatling.io/', type: 'tool' },
          { title: 'Grafana k6', url: 'https://grafana.com/docs/k6/latest/', type: 'tool' },
        ],
      },
      {
        id: 'scalability',
        title: 'Thiết kế hệ thống quy mô lớn',
        level: 'Nâng cao',
        description: 'Các khối xây dựng của hệ thống phân tán có khả năng mở rộng.',
        skills: [
          'Load balancing (L4/L7), CDN, reverse proxy',
          'Scale ngang vs scale dọc, stateless service',
          'Rate limiting (token bucket, sliding window)',
          'Consistent hashing, leader election, consensus (Raft)',
          'Thiết kế ID phân tán, distributed lock',
        ],
        resources: [
          { title: 'System Design Primer', url: 'https://github.com/donnemartin/system-design-primer', type: 'course' },
          { title: 'ByteByteGo', url: 'https://bytebytego.com/', type: 'course' },
        ],
      },
      {
        id: 'case-studies',
        title: 'Case study thực tế',
        level: 'Nâng cao',
        description: 'Học từ kiến trúc của các hệ thống lớn.',
        skills: [
          'Phân tích kiến trúc tham chiếu từ AWS/Azure Architecture Center',
          'Đọc engineering blog (Netflix, Uber, Shopee, Grab…)',
          'Thực hành phỏng vấn system design theo khung 4 bước',
        ],
        resources: [
          { title: 'AWS Architecture Center', url: 'https://aws.amazon.com/architecture/', type: 'doc' },
          { title: 'roadmap.sh – Software Architect', url: 'https://roadmap.sh/software-architect', type: 'article' },
        ],
      },
    ],
  },
  {
    id: 'sa-practice',
    order: 9,
    title: 'Năng lực Solution Architect',
    subtitle: 'Từ yêu cầu nghiệp vụ đến giải pháp được phê duyệt',
    role: 'Solution Architect',
    duration: '8–12 tuần',
    weeks: 12,
    color: '#faad14',
    icon: 'architect',
    goal: 'Dẫn dắt giải pháp end-to-end: hiểu nghiệp vụ, thiết kế, tài liệu hoá, thuyết phục stakeholder.',
    milestone:
      'Viết một Solution Architecture Document hoàn chỉnh cho bài toán thực tế: bối cảnh, yêu cầu, sơ đồ C4 (4 mức), 5+ ADR, ước tính chi phí cloud, roadmap triển khai và rủi ro.',
    topics: [
      {
        id: 'requirements',
        title: 'Phân tích yêu cầu & Stakeholder',
        level: 'Trung cấp',
        description: 'Hiểu bài toán kinh doanh trước khi chọn công nghệ.',
        skills: [
          'Thu thập yêu cầu chức năng và phi chức năng từ business',
          'Lập bản đồ stakeholder và quản lý kỳ vọng',
          'Xác định ràng buộc: ngân sách, thời gian, kỹ năng đội, pháp lý',
          'Chuyển yêu cầu nghiệp vụ thành capability và kiến trúc mục tiêu',
        ],
        resources: [
          { title: 'roadmap.sh – Software Architect', url: 'https://roadmap.sh/software-architect', type: 'article' },
        ],
      },
      {
        id: 'documentation',
        title: 'Tài liệu hoá kiến trúc',
        level: 'Trung cấp',
        description: 'Truyền đạt kiến trúc rõ ràng cho nhiều đối tượng.',
        skills: [
          'Vẽ sơ đồ theo mô hình C4 (Context, Container, Component, Code)',
          'Viết Architecture Decision Record (ADR)',
          'Dùng template arc42 cho tài liệu kiến trúc',
          'Diagram as code: Structurizr, PlantUML, Mermaid',
        ],
        resources: [
          { title: 'The C4 Model', url: 'https://c4model.com/', type: 'doc' },
          { title: 'Architecture Decision Records', url: 'https://adr.github.io/', type: 'doc' },
          { title: 'arc42', url: 'https://arc42.org/', type: 'doc' },
        ],
      },
      {
        id: 'tradeoffs',
        title: 'Đánh giá & Ra quyết định',
        level: 'Nâng cao',
        description: 'Phân tích đánh đổi, đánh giá công nghệ và nhà cung cấp.',
        skills: [
          'Phân tích trade-off có hệ thống (ATAM, ma trận quyết định)',
          'Đánh giá build vs buy, lựa chọn vendor',
          'Xây dựng PoC để giảm rủi ro kỹ thuật',
          'Ước tính chi phí giải pháp (TCO) và FinOps',
          'Lập kế hoạch migration hệ thống legacy (Strangler Fig)',
        ],
        resources: [
          { title: 'ATAM (Wikipedia)', url: 'https://en.wikipedia.org/wiki/Architecture_tradeoff_analysis_method', type: 'article' },
          { title: 'FinOps Foundation', url: 'https://www.finops.org/introduction/what-is-finops/', type: 'article' },
        ],
      },
      {
        id: 'enterprise',
        title: 'Enterprise Architecture & Governance',
        level: 'Nâng cao',
        description: 'Liên kết giải pháp với chiến lược doanh nghiệp.',
        skills: [
          'Hiểu TOGAF ADM và các tầng Business/Data/Application/Technology',
          'Tham gia Architecture Review Board, thiết lập nguyên tắc kiến trúc',
          'Quản lý technical debt và technology radar',
        ],
        resources: [
          { title: 'TOGAF Standard', url: 'https://www.opengroup.org/togaf', type: 'doc' },
        ],
      },
      {
        id: 'soft-skills',
        title: 'Kỹ năng mềm & Lãnh đạo',
        level: 'Trung cấp',
        description: 'SA thành công nhờ giao tiếp không kém gì kỹ thuật.',
        skills: [
          'Trình bày giải pháp cho cả người kỹ thuật và ban lãnh đạo',
          'Đàm phán, xử lý bất đồng giữa các team',
          'Mentoring developer, review thiết kế và code',
          'Viết tài liệu kỹ thuật ngắn gọn, có cấu trúc',
        ],
        resources: [],
      },
    ],
  },
  {
    id: 'career',
    order: 10,
    title: 'Chứng chỉ & Sự nghiệp',
    subtitle: 'Khẳng định năng lực và phát triển nghề nghiệp',
    role: 'Senior Solution Architect',
    duration: 'Liên tục',
    weeks: 8,
    color: '#a0d911',
    icon: 'career',
    goal: 'Có chứng chỉ được công nhận, portfolio kiến trúc và chuẩn bị cho phỏng vấn vị trí SA.',
    milestone:
      'Đạt ít nhất 1 chứng chỉ cloud architect, xuất bản portfolio gồm 3 bài thiết kế kiến trúc trên GitHub/blog cá nhân.',
    topics: [
      {
        id: 'certs-java',
        title: 'Chứng chỉ Java & Spring',
        level: 'Trung cấp',
        description: 'Chứng minh nền tảng kỹ thuật Java.',
        skills: [
          'Oracle Certified Professional: Java SE 17/21 Developer',
          'Spring Certified Professional (Broadcom/VMware)',
        ],
        resources: [
          { title: 'Oracle University', url: 'https://education.oracle.com/', type: 'course' },
          { title: 'Spring Academy', url: 'https://spring.academy/', type: 'course' },
        ],
      },
      {
        id: 'certs-cloud',
        title: 'Chứng chỉ Cloud Architect',
        level: 'Nâng cao',
        description: 'Các chứng chỉ có giá trị nhất cho vai trò SA.',
        skills: [
          'AWS Certified Solutions Architect – Associate',
          'AWS Certified Solutions Architect – Professional',
          'Microsoft Azure Solutions Architect Expert (AZ-305)',
          'Google Professional Cloud Architect',
          'CKA / CKAD (Kubernetes)',
        ],
        resources: [
          { title: 'AWS SA Associate', url: 'https://aws.amazon.com/certification/certified-solutions-architect-associate/', type: 'course' },
          { title: 'Azure Solutions Architect Expert', url: 'https://learn.microsoft.com/en-us/credentials/certifications/azure-solutions-architect/', type: 'course' },
          { title: 'Google Professional Cloud Architect', url: 'https://cloud.google.com/learn/certification/cloud-architect', type: 'course' },
          { title: 'CNCF CKA', url: 'https://www.cncf.io/training/certification/cka/', type: 'course' },
        ],
      },
      {
        id: 'portfolio',
        title: 'Portfolio & Phỏng vấn',
        level: 'Trung cấp',
        description: 'Thể hiện năng lực kiến trúc ra bên ngoài.',
        skills: [
          'Xây dựng portfolio: các bài thiết kế, ADR, sơ đồ C4 trên GitHub',
          'Viết blog / chia sẻ tại meetup về kiến trúc',
          'Luyện phỏng vấn system design và behavioral (STAR)',
          'Chuẩn bị câu chuyện về các quyết định kiến trúc đã làm',
        ],
        resources: [
          { title: 'System Design Primer', url: 'https://github.com/donnemartin/system-design-primer', type: 'course' },
        ],
      },
    ],
  },
];

export const skillId = (phaseId: string, topicId: string, index: number) =>
  `${phaseId}.${topicId}.${index}`;

export const phaseSkillIds = (phase: Phase) =>
  phase.topics.flatMap((t) => t.skills.map((_, i) => skillId(phase.id, t.id, i)));

export const topicSkillIds = (phaseId: string, topic: Topic) =>
  topic.skills.map((_, i) => skillId(phaseId, topic.id, i));

export const allSkillIds = phases.flatMap(phaseSkillIds);

export const totalWeeks = phases.reduce((sum, p) => sum + p.weeks, 0);

export const levelColor: Record<Level, string> = {
  'Cơ bản': 'green',
  'Trung cấp': 'blue',
  'Nâng cao': 'volcano',
};

export const resourceTypeLabel: Record<ResourceType, string> = {
  doc: 'Tài liệu',
  book: 'Sách',
  course: 'Khoá học',
  article: 'Bài viết',
  tool: 'Công cụ',
};
