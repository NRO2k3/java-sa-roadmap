import type { LessonFlashcards } from '../types';

const flashcards: LessonFlashcards = {
  communication: [
    {
      front: 'BLUF là gì?',
      back: 'Bottom Line Up Front: đặt kết luận hoặc yêu cầu quan trọng nhất ở câu đầu tiên, sau đó mới đến bối cảnh và chi tiết. Người đọc bận chỉ cần đọc hai dòng đầu là nắm được ý chính.',
    },
    {
      front: 'Ba câu hỏi trước khi gửi một thông điệp',
      back: 'Ai là người nhận? Sau khi đọc hoặc nghe, họ cần làm gì? Họ đã biết gì rồi? Nếu chưa trả lời được câu thứ hai thì chưa nên gửi.',
    },
    {
      front: 'Tiêu đề email xin quyết định nên có gì?',
      back: 'Loại email (Cần quyết định, FYI, Cần hỗ trợ), chủ đề cụ thể và hạn chót. Ví dụ: "[Cần quyết định trước 15/8] Phương án nâng cấp Spring Boot 3 cho Payment Service".',
    },
    {
      front: 'Một tin nhắn chat công việc đầy đủ gồm những gì?',
      back: 'Bối cảnh, những gì đã thử, điều cần nhờ và mức độ gấp, gửi gọn trong một tin. Nhắn "Anh ơi" rồi chờ khiến người nhận bị gián đoạn hai lần.',
    },
    {
      front: 'Ba mục giúp design doc được đọc và góp ý',
      back: 'Ngoài phạm vi (non-goals) để tránh tranh luận lan man, câu hỏi mở để reviewer biết cần góp ý chỗ nào, và reviewer có tên kèm hạn góp ý thay vì "mọi người xem giúp".',
    },
    {
      front: 'Khung bốn bước khi trình bày cho người không chuyên',
      back: 'Vấn đề (một câu, không thuật ngữ), tác động (khách hàng, tiền, thời gian, rủi ro), phương án (2–3 lựa chọn kèm chi phí và rủi ro), đề xuất (bạn chọn gì, họ cần quyết điều gì).',
    },
    {
      front: 'Vì sao không nên hỏi "Anh/chị hiểu không ạ?"',
      back: 'Câu trả lời gần như luôn là "Hiểu". Hãy hỏi một câu buộc người nghe dùng thông tin vừa nghe, ví dụ "Phương án nào hợp với kế hoạch quý của bên kinh doanh hơn?", để biết họ nắm đến đâu.',
    },
    {
      front: 'Influence without authority',
      back: 'Khả năng khiến người khác đồng ý và hành động khi bạn không phải cấp trên của họ. Nguồn ảnh hưởng của lead là uy tín chuyên môn, việc giữ lời, quan hệ và dữ liệu.',
    },
    {
      front: '"Currency" trong mô hình của Cohen và Bradford',
      back: 'Những thứ đối phương coi trọng mà bạn có thể đưa để đổi lấy sự hỗ trợ: giảm việc, thông tin sớm, được ghi nhận, được hỏi ý kiến, hay được góp phần vào một mục tiêu lớn hơn.',
    },
    {
      front: 'Lời mời họp cần có những gì?',
      back: 'Mục tiêu cần đạt cuối buổi, tài liệu cần đọc trước, người quyết định, agenda có thời lượng từng phần, và danh sách người tham dự ít nhất có thể.',
    },
    {
      front: 'Parking lot trong cuộc họp',
      back: 'Danh sách ghi lại các ý lạc đề nhưng có giá trị để xử lý sau trong một buổi riêng. Cách này giữ cuộc họp đúng mục tiêu mà không gạt bỏ ý kiến của ai.',
    },
    {
      front: 'Biên bản họp gồm gì và gửi khi nào?',
      back: 'Quyết định kèm lý do và người quyết, action item có người phụ trách và hạn, câu hỏi mở hoặc parking lot. Nên gửi trong vòng 24 giờ sau cuộc họp.',
    },
  ],
  'self-management': [
    {
      front: 'IC (individual contributor) là gì?',
      back: 'Người tạo giá trị chủ yếu bằng công việc chuyên môn của chính mình như code, thiết kế hay test, thay vì thông qua việc dẫn dắt người khác.',
    },
    {
      front: 'Thước đo thành công thay đổi thế nào khi từ IC lên lead?',
      back: 'Từ "task của mình xong và tốt" sang "cả team giao hàng đều đặn và từng người tiến bộ". Phản hồi cũng chậm hơn: vài tuần đến vài tháng thay vì trong ngày.',
    },
    {
      front: 'Đường găng (critical path)',
      back: 'Chuỗi công việc quyết định ngày hoàn thành; một việc trên đó trễ thì cả dự án trễ. Lead hay bị gián đoạn nên tránh nhận task nằm trên đường găng.',
    },
    {
      front: 'Lead nên nhận loại việc code nào?',
      back: 'Spike, PoC, cải thiện CI và công cụ, bug không gấp, refactor nhỏ, viết test, pair programming và review. Mục đích là giữ bối cảnh codebase, không phải gánh tốc độ của team.',
    },
    {
      front: 'Dấu hiệu lead đang là nút cổ chai',
      back: 'PR chờ lead review quá một ngày, chỉ lead biết deploy hoặc xử lý một loại sự cố, team hỏi lead cả việc nhỏ, lead code vào buổi tối, lead không dám nghỉ phép một tuần.',
    },
    {
      front: 'Maker schedule và manager schedule khác nhau thế nào?',
      back: 'Manager schedule chia ngày thành từng khung một giờ. Maker schedule cần khối ít nhất nửa ngày để tập trung, nên một cuộc họp giữa buổi có thể phá cả buổi làm việc.',
    },
    {
      front: 'Các cách bảo vệ thời gian tập trung',
      back: 'Chặn khối focus trên calendar, gom họp vào một buổi, mở office hours, tắt thông báo khi tập trung, quy định kênh liên lạc khẩn cấp và ưu tiên giao tiếp bất đồng bộ.',
    },
    {
      front: 'Bốn ô của ma trận Eisenhower',
      back: 'Quan trọng và khẩn cấp: làm ngay. Quan trọng, không khẩn cấp: lên lịch. Khẩn cấp, không quan trọng: uỷ quyền. Không khẩn cấp, không quan trọng: loại bỏ.',
    },
    {
      front: 'Vì sao ô "quan trọng, không khẩn cấp" là trọng tâm của lead?',
      back: '1:1, mentoring, trả nợ kỹ thuật, tuyển dụng đều nằm ở ô này và không có hạn gấp nên dễ bị việc khẩn đẩy ra. Đầu tư vào đây giúp ô khẩn cấp nhỏ lại theo thời gian.',
    },
    {
      front: 'Ba câu hỏi trước khi uỷ quyền một việc',
      back: 'Chỉ mình mới làm được việc này không? Ai sẽ phát triển nhờ làm việc này? Người khác đã làm được ở mức đủ tốt chưa?',
    },
    {
      front: 'Mentor, coach và sponsor khác nhau thế nào?',
      back: 'Mentor chia sẻ kinh nghiệm của người đi trước. Coach đặt câu hỏi để bạn tự tìm câu trả lời. Sponsor dùng tiếng nói của mình để đề cử bạn vào cơ hội ở nơi bạn không có mặt.',
    },
    {
      front: 'Danh sách "Không làm" trong kế hoạch tuần',
      back: 'Những việc bạn chủ động không nhận trong tuần, như story trên đường găng hay cuộc họp đã có người đi thay. Nó giúp bạn nói "không" với chính mình trước khi phải nói với người khác.',
    },
  ],
  'next-steps': [
    {
      front: 'Career ladder kép (dual career ladder)',
      back: 'Hệ thống cấp bậc có hai nhánh song song là IC và quản lý, với các cấp tương đương nhau. Nhờ vậy kỹ sư giỏi có thể thăng tiến mà không bắt buộc phải đi quản lý.',
    },
    {
      front: 'Staff Engineer làm gì?',
      back: 'Cấp IC trên Senior, chịu trách nhiệm cho vấn đề kỹ thuật xuyên nhiều team: định hướng kỹ thuật, giải vấn đề khó, nâng chuẩn chất lượng, mentoring senior. Họ dành nhiều thời gian để viết và thuyết phục.',
    },
    {
      front: 'Engineering Manager làm gì?',
      back: 'Chịu trách nhiệm về con người và tổ chức: tuyển dụng, đánh giá và phát triển từng người, sức khoẻ team, khả năng giao hàng. Thường code rất ít hoặc không code.',
    },
    {
      front: 'Bốn kiểu Staff Engineer theo Will Larson',
      back: 'Tech Lead dẫn hướng một hoặc vài team; Architect sở hữu một mảng quan trọng; Solver đi sâu vấn đề khó rồi chuyển tiếp; Right Hand mở rộng tầm ảnh hưởng của một lãnh đạo cấp cao.',
    },
    {
      front: 'Con lắc kỹ sư – quản lý (Engineer/Manager Pendulum)',
      back: 'Quan điểm của Charity Majors: có thể chuyển qua lại giữa vai trò kỹ sư và quản lý, và kinh nghiệm ở mỗi bên giúp bạn làm tốt hơn ở bên còn lại.',
    },
    {
      front: 'Tech Lead Manager (TLM)',
      back: 'Vai trò lai vừa dẫn dắt kỹ thuật vừa quản lý con người cho một team nhỏ. Vai trò này thường khó duy trì khi team lớn dần.',
    },
    {
      front: 'Thử một hướng đi trước khi chọn bằng cách nào?',
      back: 'Làm một phần công việc của vai trò mới trong 3–6 tháng: hướng EM thì nhận tuyển dụng, đánh giá; hướng Staff thì dẫn sáng kiến liên team; hướng SA thì thiết kế liên hệ thống, tham gia presales.',
    },
    {
      front: 'PSM I',
      back: 'Chứng chỉ Scrum của Scrum.org, thi online, không bắt buộc học khoá. Theo Scrum.org: 80 câu trong 60 phút, cần đạt 85%, không hết hạn. Ôn bằng Scrum Guide và bài thi thử Scrum Open.',
    },
    {
      front: 'AWS Certified Developer – Associate',
      back: 'Chứng chỉ (mã đề DVA-C02 tại thời điểm biên soạn) về phát triển, triển khai và debug ứng dụng trên AWS như Lambda, DynamoDB, SQS. Hiệu lực 3 năm, là bước đệm tốt trước AWS Solutions Architect – Associate.',
    },
    {
      front: 'Brag document',
      back: 'Tài liệu cập nhật đều đặn ghi lại việc đã làm và kết quả, được Julia Evans phổ biến. Nhờ nó, bạn không phải cố nhớ lại cả năm khi đến kỳ đánh giá hoặc phỏng vấn.',
    },
    {
      front: 'Một mục portfolio lãnh đạo cần có gì?',
      back: 'Bối cảnh, vai trò của bạn, việc bạn đã làm, kết quả đo được của team, người đã tiến bộ, bài học, và link bằng chứng như design doc, ADR hay báo cáo.',
    },
    {
      front: 'Kế hoạch phát triển 12 tháng gồm những gì?',
      back: 'Hướng đi và lý do, mục tiêu sau 12 tháng, ba năng lực trọng tâm, việc học, việc làm thật và bằng chứng theo từng quý, chứng chỉ, người hỗ trợ, và điểm kiểm tra mỗi quý với cấp trên.',
    },
  ],
};

export default flashcards;
