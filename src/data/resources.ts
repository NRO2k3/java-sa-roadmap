import type { TrackId } from './roadmap';

export interface Book {
  title: string;
  author: string;
  topic: string;
  phaseId: string;
  mustRead?: boolean;
}

export interface Certification {
  name: string;
  provider: string;
  level: 'Associate' | 'Professional' | 'Expert';
  focus: string;
  url: string;
  tracks: TrackId[];
}

export interface Site {
  name: string;
  url: string;
  description: string;
  tags: string[];
}

export const books: Book[] = [
  { title: 'Effective Java (3rd Edition)', author: 'Joshua Bloch', topic: 'Java Core', phaseId: 'java-core', mustRead: true },
  { title: 'Java Concurrency in Practice', author: 'Brian Goetz', topic: 'Concurrency', phaseId: 'java-core', mustRead: true },
  { title: 'Clean Code', author: 'Robert C. Martin', topic: 'Chất lượng code', phaseId: 'java-core' },
  { title: 'Spring in Action (6th Edition)', author: 'Craig Walls', topic: 'Spring', phaseId: 'spring' },
  { title: 'High-Performance Java Persistence', author: 'Vlad Mihalcea', topic: 'JPA/Hibernate', phaseId: 'spring' },
  { title: 'Designing Data-Intensive Applications', author: 'Martin Kleppmann', topic: 'Dữ liệu & hệ phân tán', phaseId: 'data', mustRead: true },
  { title: 'Enterprise Integration Patterns', author: 'Gregor Hohpe, Bobby Woolf', topic: 'Tích hợp', phaseId: 'integration' },
  { title: 'Microservices Patterns', author: 'Chris Richardson', topic: 'Microservices (ví dụ Java)', phaseId: 'microservices', mustRead: true },
  { title: 'Building Microservices (2nd Edition)', author: 'Sam Newman', topic: 'Microservices', phaseId: 'microservices' },
  { title: 'Domain-Driven Design', author: 'Eric Evans', topic: 'DDD', phaseId: 'microservices' },
  { title: 'Implementing Domain-Driven Design', author: 'Vaughn Vernon', topic: 'DDD (ví dụ Java)', phaseId: 'microservices' },
  { title: 'Release It! (2nd Edition)', author: 'Michael T. Nygard', topic: 'Resilience', phaseId: 'microservices' },
  { title: 'Kubernetes in Action', author: 'Marko Lukša', topic: 'Kubernetes', phaseId: 'cloud' },
  { title: 'Site Reliability Engineering', author: 'Google', topic: 'SRE / vận hành', phaseId: 'cloud' },
  { title: 'Fundamentals of Software Architecture', author: 'Mark Richards, Neal Ford', topic: 'Kiến trúc phần mềm', phaseId: 'system-design', mustRead: true },
  { title: 'Software Architecture: The Hard Parts', author: 'Neal Ford et al.', topic: 'Trade-off trong hệ phân tán', phaseId: 'system-design' },
  { title: 'System Design Interview (Vol. 1 & 2)', author: 'Alex Xu', topic: 'System Design', phaseId: 'system-design' },
  { title: 'Clean Architecture', author: 'Robert C. Martin', topic: 'Kiến trúc ứng dụng', phaseId: 'system-design' },
  { title: 'Software Architecture in Practice (4th Edition)', author: 'Len Bass et al.', topic: 'Thuộc tính chất lượng', phaseId: 'sa-practice' },
  { title: 'The Software Architect Elevator', author: 'Gregor Hohpe', topic: 'Vai trò kiến trúc sư', phaseId: 'sa-practice', mustRead: true },
  { title: 'Solutions Architect’s Handbook', author: 'Saurabh Shrivastava, Neelanjali Srivastav', topic: 'Solution Architect', phaseId: 'sa-practice' },
  { title: 'Building Evolutionary Architectures (2nd Edition)', author: 'Neal Ford et al.', topic: 'Fitness function', phaseId: 'sa-practice' },
  { title: 'Refactoring (2nd Edition)', author: 'Martin Fowler', topic: 'Refactoring', phaseId: 'engineering-practices', mustRead: true },
  { title: 'Working Effectively with Legacy Code', author: 'Michael Feathers', topic: 'Code legacy', phaseId: 'engineering-practices' },
  { title: 'The Pragmatic Programmer (20th Anniversary)', author: 'David Thomas, Andrew Hunt', topic: 'Tư duy kỹ sư', phaseId: 'engineering-practices' },
  { title: 'Accelerate', author: 'Nicole Forsgren, Jez Humble, Gene Kim', topic: 'DORA & hiệu suất delivery', phaseId: 'production-ops', mustRead: true },
  { title: 'Team Topologies', author: 'Matthew Skelton, Manuel Pais', topic: 'Tổ chức team', phaseId: 'tech-leadership', mustRead: true },
  { title: 'Staff Engineer', author: 'Will Larson', topic: 'Lãnh đạo kỹ thuật', phaseId: 'tech-leadership' },
  { title: 'The Manager’s Path', author: 'Camille Fournier', topic: 'Từ Tech Lead đến quản lý', phaseId: 'people', mustRead: true },
  { title: 'Radical Candor', author: 'Kim Scott', topic: 'Feedback', phaseId: 'people' },
  { title: 'Turn the Ship Around!', author: 'L. David Marquet', topic: 'Trao quyền', phaseId: 'people' },
  { title: 'Peopleware (3rd Edition)', author: 'Tom DeMarco, Timothy Lister', topic: 'Con người trong dự án phần mềm', phaseId: 'people' },
  { title: 'The Phoenix Project', author: 'Gene Kim, Kevin Behr, George Spafford', topic: 'DevOps (tiểu thuyết)', phaseId: 'delivery' },
  { title: 'Making Work Visible', author: 'Dominica DeGrandis', topic: 'Kanban & WIP', phaseId: 'delivery' },
  { title: 'An Elegant Puzzle', author: 'Will Larson', topic: 'Quản lý kỹ thuật', phaseId: 'lead-career' },
];

export const certifications: Certification[] = [
  {
    name: 'Oracle Certified Professional: Java SE 21 Developer',
    provider: 'Oracle',
    level: 'Professional',
    focus: 'Ngôn ngữ Java, API chuẩn, concurrency',
    url: 'https://education.oracle.com/',
    tracks: ['sa', 'lead'],
  },
  {
    name: 'Spring Certified Professional',
    provider: 'Broadcom (VMware)',
    level: 'Professional',
    focus: 'Spring Core, Boot, Data, Security, Testing',
    url: 'https://spring.academy/',
    tracks: ['sa', 'lead'],
  },
  {
    name: 'AWS Certified Solutions Architect – Associate',
    provider: 'AWS',
    level: 'Associate',
    focus: 'Thiết kế kiến trúc AWS bền vững, bảo mật, tối ưu chi phí',
    url: 'https://aws.amazon.com/certification/certified-solutions-architect-associate/',
    tracks: ['sa'],
  },
  {
    name: 'AWS Certified Solutions Architect – Professional',
    provider: 'AWS',
    level: 'Professional',
    focus: 'Kiến trúc đa tài khoản, migration, giải pháp phức tạp',
    url: 'https://aws.amazon.com/certification/certified-solutions-architect-professional/',
    tracks: ['sa'],
  },
  {
    name: 'Azure Solutions Architect Expert (AZ-305)',
    provider: 'Microsoft',
    level: 'Expert',
    focus: 'Thiết kế danh tính, dữ liệu, hạ tầng trên Azure',
    url: 'https://learn.microsoft.com/en-us/credentials/certifications/azure-solutions-architect/',
    tracks: ['sa'],
  },
  {
    name: 'Google Professional Cloud Architect',
    provider: 'Google Cloud',
    level: 'Professional',
    focus: 'Thiết kế và quản lý giải pháp trên GCP',
    url: 'https://cloud.google.com/learn/certification/cloud-architect',
    tracks: ['sa'],
  },
  {
    name: 'Certified Kubernetes Administrator (CKA)',
    provider: 'CNCF',
    level: 'Professional',
    focus: 'Vận hành cụm Kubernetes (thi thực hành)',
    url: 'https://www.cncf.io/training/certification/cka/',
    tracks: ['sa'],
  },
  {
    name: 'Certified Kubernetes Application Developer (CKAD)',
    provider: 'CNCF',
    level: 'Associate',
    focus: 'Thiết kế và triển khai ứng dụng trên Kubernetes',
    url: 'https://www.cncf.io/training/certification/ckad/',
    tracks: ['sa', 'lead'],
  },
  {
    name: 'TOGAF Enterprise Architecture',
    provider: 'The Open Group',
    level: 'Expert',
    focus: 'Khung kiến trúc doanh nghiệp, ADM',
    url: 'https://www.opengroup.org/togaf',
    tracks: ['sa'],
  },
  {
    name: 'AWS Certified Developer – Associate',
    provider: 'AWS',
    level: 'Associate',
    focus: 'Phát triển, triển khai và debug ứng dụng trên AWS',
    url: 'https://aws.amazon.com/certification/certified-developer-associate/',
    tracks: ['lead'],
  },
  {
    name: 'Professional Scrum Master I (PSM I)',
    provider: 'Scrum.org',
    level: 'Associate',
    focus: 'Scrum, vai trò Scrum Master, điều phối team Agile',
    url: 'https://www.scrum.org/assessments/professional-scrum-master-i-certification',
    tracks: ['lead'],
  },
  {
    name: 'Project Management Professional (PMP)',
    provider: 'PMI',
    level: 'Professional',
    focus: 'Quản lý dự án: phạm vi, tiến độ, rủi ro, stakeholder (predictive & agile)',
    url: 'https://www.pmi.org/certifications/project-management-pmp',
    tracks: ['lead'],
  },
];

export const sites: Site[] = [
  { name: 'dev.java', url: 'https://dev.java/learn/', description: 'Trang học Java chính thức từ Oracle.', tags: ['Java'] },
  { name: 'Baeldung', url: 'https://www.baeldung.com/', description: 'Hướng dẫn Java & Spring chi tiết, cập nhật.', tags: ['Java', 'Spring'] },
  { name: 'Spring Guides', url: 'https://spring.io/guides', description: 'Hướng dẫn ngắn, thực hành từng chủ đề Spring.', tags: ['Spring'] },
  { name: 'roadmap.sh – Java', url: 'https://roadmap.sh/java', description: 'Lộ trình Java developer dạng sơ đồ.', tags: ['Roadmap'] },
  { name: 'roadmap.sh – Software Architect', url: 'https://roadmap.sh/software-architect', description: 'Lộ trình kiến trúc sư phần mềm.', tags: ['Roadmap', 'Kiến trúc'] },
  { name: 'microservices.io', url: 'https://microservices.io/', description: 'Thư viện pattern microservices của Chris Richardson.', tags: ['Microservices'] },
  { name: 'Martin Fowler', url: 'https://martinfowler.com/architecture/', description: 'Bài viết kinh điển về kiến trúc và thiết kế.', tags: ['Kiến trúc'] },
  { name: 'System Design Primer', url: 'https://github.com/donnemartin/system-design-primer', description: 'Tài liệu tổng hợp system design mã nguồn mở.', tags: ['System Design'] },
  { name: 'AWS Architecture Center', url: 'https://aws.amazon.com/architecture/', description: 'Kiến trúc tham chiếu và best practice trên AWS.', tags: ['Cloud'] },
  { name: 'Azure Architecture Center', url: 'https://learn.microsoft.com/en-us/azure/architecture/', description: 'Hướng dẫn kiến trúc và pattern cloud trên Azure.', tags: ['Cloud'] },
  { name: 'The C4 Model', url: 'https://c4model.com/', description: 'Cách vẽ sơ đồ kiến trúc phần mềm theo 4 mức.', tags: ['Tài liệu hoá'] },
  { name: 'Google Engineering Practices', url: 'https://google.github.io/eng-practices/', description: 'Hướng dẫn code review của Google.', tags: ['Code review', 'Dev Lead'] },
  { name: 'DORA', url: 'https://dora.dev/', description: 'Nghiên cứu về hiệu suất delivery phần mềm và 4 chỉ số DORA.', tags: ['Delivery', 'Dev Lead'] },
  { name: 'StaffEng', url: 'https://staffeng.com/', description: 'Câu chuyện và hướng dẫn cho con đường lãnh đạo kỹ thuật.', tags: ['Lãnh đạo', 'Dev Lead'] },
  { name: 'Team Topologies', url: 'https://teamtopologies.com/', description: 'Mô hình tổ chức team phần mềm hiệu quả.', tags: ['Tổ chức team', 'Dev Lead'] },
  { name: 'The Scrum Guide', url: 'https://scrumguides.org/', description: 'Định nghĩa chính thức của Scrum.', tags: ['Agile', 'Dev Lead'] },
  { name: 'Thoughtworks Technology Radar', url: 'https://www.thoughtworks.com/radar', description: 'Đánh giá xu hướng công nghệ định kỳ.', tags: ['Xu hướng'] },
];
