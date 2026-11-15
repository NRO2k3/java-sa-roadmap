import type { LessonQuiz } from '../types';

const quiz: LessonQuiz = {
  'certs-java': [
    {
      question: 'Với các phiên bản Java SE 17 và 21, để đạt danh hiệu Oracle Certified Professional: Java SE Developer bạn cần làm gì?',
      options: [
        'Đạt chứng chỉ OCA rồi thi thêm bài OCP',
        'Đạt một bài thi duy nhất dành cho phiên bản đó',
        'Hoàn thành khoá học bắt buộc của Oracle rồi mới được thi',
        'Nộp portfolio dự án Java để hội đồng xét duyệt',
      ],
      answer: 1,
      explanation:
        'Từ thời Java 11, Oracle dùng một bài thi duy nhất cho OCP, ví dụ 1Z0-829 cho Java SE 17 và 1Z0-830 cho Java SE 21. Lộ trình OCA rồi OCP là của các phiên bản cũ.',
    },
    {
      question: 'Gặp một câu hỏi OCP có đoạn code và hỏi chương trình in ra gì, bước đầu tiên hợp lý nhất là gì?',
      options: [
        'Tính ngay kết quả in ra theo từng dòng',
        'Chọn đáp án dài nhất vì thường chi tiết nhất',
        'Bỏ qua và quay lại sau vì câu có code luôn khó',
        'Kiểm tra đoạn code có biên dịch được không trước',
      ],
      answer: 3,
      explanation:
        'Nhiều đáp án sai được dựng sẵn cho người bỏ qua lỗi biên dịch. Xác nhận code biên dịch được rồi mới tính kết quả chạy hoặc exception.',
    },
    {
      question:
        'Cho sealed interface Vehicle permits Car, Bike {} cùng final class Car implements Vehicle {} và class Bike implements Vehicle {}. Kết quả là gì?',
      options: [
        'Lỗi biên dịch vì Bike phải được khai báo final, sealed hoặc non-sealed',
        'Biên dịch được vì Bike có trong danh sách permits',
        'Biên dịch được nhưng Bike không thể tạo instance',
        'Lỗi lúc chạy khi tạo instance của Bike',
      ],
      answer: 0,
      explanation:
        'Mỗi lớp con được phép của một sealed type phải chọn rõ một trong ba modifier final, sealed hoặc non-sealed. Thiếu modifier là lỗi biên dịch, dạng chi tiết đề OCP rất hay hỏi.',
    },
    {
      question:
        'Ôn cho Spring Professional, bạn muốn hiểu vì sao Spring Boot tự tạo một bean DataSource. Thí nghiệm nào giúp nhất?',
      options: [
        'Đọc lại toàn bộ pom.xml để đoán starter nào đã tạo bean',
        'Thêm @Autowired vào mọi field để xem bean nào được tiêm vào',
        'Chạy với --debug hoặc xem Actuator conditions để đọc báo cáo auto-configuration',
        'Chuyển toàn bộ cấu hình sang XML để Spring không tự tạo bean nữa',
      ],
      answer: 2,
      explanation:
        'Báo cáo condition evaluation liệt kê auto-configuration nào được áp dụng hay bị bỏ qua và vì sao. Đây chính là cơ chế @ConditionalOn... mà đề thi Spring yêu cầu hiểu.',
    },
    {
      question:
        'Bạn đã vững Java, làm Spring Boot hằng ngày, đặt mục tiêu lên SA trong khoảng một năm và có ít thời gian ôn. Nên ưu tiên gì?',
      options: [
        'Thi lần lượt cả OCP Java và Spring trước, rồi mới học cloud',
        'Ưu tiên một chứng chỉ cloud architect, coi Java/Spring là tuỳ chọn',
        'Thi OCP của nhiều phiên bản Java để chứng chỉ dày hơn',
        'Bỏ qua mọi chứng chỉ và chỉ đọc sách về kiến trúc',
      ],
      answer: 1,
      explanation:
        'Với người đã vững nền tảng và nhắm vai trò SA, chứng chỉ cloud architect gắn trực tiếp với công việc hơn. Chứng chỉ Java/Spring hữu ích nhất khi cần củng cố nền tảng hoặc theo yêu cầu của công ty.',
    },
  ],

  'certs-cloud': [
    {
      question: 'Ngoài bài thi AZ-305, danh hiệu Microsoft Azure Solutions Architect Expert còn yêu cầu điều kiện nào?',
      options: [
        'Chứng chỉ Azure Fundamentals (AZ-900)',
        'Chứng chỉ AWS Solutions Architect Associate',
        'Chứng chỉ Azure Administrator Associate (AZ-104)',
        'Ít nhất ba năm kinh nghiệm được công ty xác nhận',
      ],
      answer: 2,
      explanation:
        'Danh hiệu Expert cần cả AZ-305 (thiết kế) và Azure Administrator Associate (AZ-104, triển khai và quản trị). AZ-900 là chứng chỉ nhập môn, không phải điều kiện.',
    },
    {
      question:
        'Ứng dụng Spring Boot chạy nhiều EC2 sau ALB trong Auto Scaling group, session lưu trong bộ nhớ instance nên người dùng bị đăng xuất khi scale-in. Yêu cầu ít sửa code. Giải pháp phù hợp nhất?',
      options: [
        'Lưu session vào ElastiCache for Redis bằng Spring Session',
        'Bật sticky session trên ALB',
        'Dùng instance lớn hơn và tắt Auto Scaling',
        'Ghi mỗi session thành một file trên S3',
      ],
      answer: 0,
      explanation:
        'Đưa session ra kho dùng chung giúp ứng dụng stateless, instance nào bị terminate cũng không mất session, và Spring Session chỉ cần thêm dependency và cấu hình. Sticky session vẫn mất session khi chính instance đó bị xoá.',
    },
    {
      question: 'Điểm khác biệt lớn nhất về hình thức thi của CKA/CKAD so với AWS Solutions Architect Associate là gì?',
      options: [
        'CKA/CKAD chỉ hỏi lý thuyết về container và image Docker',
        'CKA/CKAD làm bài trên giấy tại trung tâm khảo thí được chỉ định',
        'CKA/CKAD dựa trên các case study công bố trước giống Google',
        'CKA/CKAD là bài thi thực hành trên cluster thật qua terminal',
      ],
      answer: 3,
      explanation:
        'CKA và CKAD là bài thi performance-based: bạn thao tác kubectl trên cluster để hoàn thành nhiệm vụ trong thời gian giới hạn. Vì vậy tốc độ thao tác quan trọng không kém kiến thức.',
    },
    {
      question:
        'Trên Google Cloud, ứng dụng cần database quan hệ phân tán nhiều region, nhất quán mạnh và mở rộng ngang. Dịch vụ phù hợp nhất là gì?',
      options: [
        'Cloud SQL',
        'Cloud Spanner',
        'Bigtable',
        'BigQuery',
      ],
      answer: 1,
      explanation:
        'Spanner là database quan hệ phân tán toàn cầu với nhất quán mạnh. Cloud SQL hợp quy mô vừa trong một region, Bigtable là NoSQL theo khoá, BigQuery dành cho phân tích dữ liệu.',
    },
    {
      question:
        'Trong chiến lược migration "7 Rs", đưa ứng dụng từ máy chủ on-premises lên máy ảo cloud gần như nguyên trạng, không sửa code, gọi là gì?',
      options: [
        'Refactor',
        'Replatform',
        'Rehost',
        'Repurchase',
      ],
      answer: 2,
      explanation:
        'Rehost (lift-and-shift) chuyển nguyên trạng lên hạ tầng cloud. Replatform có thay đổi nhỏ như chuyển sang database managed, Refactor là thiết kế lại ứng dụng, Repurchase là chuyển sang sản phẩm SaaS.',
    },
  ],

  portfolio: [
    {
      question: 'Một năm sau, quyết định trong ADR-0002 không còn phù hợp và team chọn hướng khác. Cách xử lý đúng là gì?',
      options: [
        'Sửa trực tiếp nội dung ADR-0002 cho khớp quyết định mới',
        'Tạo ADR mới ghi quyết định mới và đánh dấu ADR-0002 là Superseded',
        'Xoá ADR-0002 khỏi repo để tránh gây nhầm lẫn',
        'Ghi chú quyết định mới vào commit message là đủ',
      ],
      answer: 1,
      explanation:
        'ADR là nhật ký quyết định nên giữ nguyên bản cũ để người sau hiểu bối cảnh lúc đó. Quyết định mới được ghi trong ADR mới, liên kết qua trạng thái Superseded.',
    },
    {
      question: 'Theo khung bài blog kiến trúc trong bài học, phần mở đầu hiệu quả nhất nên là gì?',
      options: [
        'Danh sách công nghệ sẽ dùng trong bài',
        'Giới thiệu chi tiết về bản thân và công ty',
        'Định nghĩa lý thuyết của pattern được áp dụng',
        'Vấn đề cụ thể với triệu chứng, con số và hệ quả kinh doanh',
      ],
      answer: 3,
      explanation:
        'Mở bằng vấn đề có con số giúp người đọc thấy ngay vì sao nên đọc tiếp và tạo bối cảnh cho các phương án phía sau. Công nghệ chỉ có ý nghĩa khi đặt trong vấn đề cụ thể.',
    },
    {
      question: 'Khi trả lời câu hỏi behavioral theo STAR, phần nào nên chiếm nhiều thời lượng nhất?',
      options: [
        'Action: bạn đã làm gì, vì sao, theo thứ tự nào',
        'Situation: mô tả đầy đủ bối cảnh dự án',
        'Task: liệt kê mọi trách nhiệm của team',
        'Result: kể lại phản hồi của từng stakeholder',
      ],
      answer: 0,
      explanation:
        'Người phỏng vấn đánh giá hành động và cách suy nghĩ của chính bạn, nên Action là phần dài nhất. Situation và Task chỉ cần đủ ngắn để hiểu bối cảnh, Result nên có con số.',
    },
    {
      question:
        'Ước lượng cho buổi system design: 2 triệu người dùng hoạt động mỗi ngày, mỗi người 10 lần đọc. Số request đọc trung bình mỗi giây khoảng bao nhiêu?',
      options: [
        'Khoảng 23 request/giây',
        'Khoảng 2.300 request/giây',
        'Khoảng 230 request/giây',
        'Khoảng 20.000 request/giây',
      ],
      answer: 2,
      explanation:
        '20 triệu lượt đọc chia cho 86.400 giây mỗi ngày được khoảng 230 request/giây. Sau đó nhân hệ số cao điểm và rút ra quyết định thiết kế như cache hoặc read replica.',
    },
    {
      question:
        'Bạn kể về quyết định chọn modular monolith cho team 8 người, người phỏng vấn hỏi: Tại sao không chọn microservices? Câu trả lời tốt nhất là gì?',
      options: [
        'Microservices đã lỗi thời, các công ty lớn đều đang quay về monolith',
        'Nêu bối cảnh, ràng buộc, tiêu chí đã cân nhắc và điều kiện để tách service sau này',
        'Quyết định do sếp đưa ra từ đầu nên team chỉ triển khai theo',
        'Monolith luôn nhanh và rẻ hơn microservices trong mọi trường hợp',
      ],
      answer: 1,
      explanation:
        'Câu trả lời mạnh cho thấy quyết định dựa trên bối cảnh (team nhỏ, miền nghiệp vụ còn biến động, năng lực vận hành) và có kế hoạch tiến hoá. Các khẳng định tuyệt đối hoặc đổ cho người khác đều là tín hiệu yếu.',
    },
  ],
};

export default quiz;
