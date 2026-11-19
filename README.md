# Java Career Roadmap

Website học tập lộ trình trở thành **Solution Architect** và **Dev Lead** với tech stack **Java**, xây dựng bằng React + [Ant Design](https://ant.design/) + Vite, deploy tự động lên GitHub Pages.

## Tính năng

- **Hai lộ trình**, chuyển qua lại bằng một nút:
  - **Solution Architect**: Java Core → Spring → Dữ liệu → Messaging → Microservices → Cloud/DevOps → Bảo mật → System Design → Năng lực SA → Chứng chỉ
  - **Dev Lead**: Java Core → Spring → Dữ liệu → Chất lượng & kỹ thuật phần mềm → Microservices → Vận hành & độ tin cậy → Lãnh đạo kỹ thuật → Quản lý con người → Delivery & Agile → Phát triển sự nghiệp Lead
- Các giai đoạn kỹ thuật chung (Java Core, Spring, Dữ liệu, Microservices) **dùng chung tiến độ** cho cả hai lộ trình
- **Bài học** cho từng chủ đề: giải thích kiến thức, ví dụ code Java/Spring có tô màu, lỗi thường gặp, bài tập thực hành, tóm tắt
- **Trắc nghiệm cuối mỗi bài** (5 câu, có giải thích), lưu điểm cao nhất; đạt từ 80% có thể đánh dấu hoàn thành kỹ năng của bài
- **Checklist kỹ năng** cho từng chủ đề, lưu tiến độ trong trình duyệt (localStorage), xuất/nhập file JSON
- **Dự án cột mốc** cho mỗi giai đoạn và tài liệu tham khảo chính thức
- **Mẫu kiến trúc**: 15 pattern (Saga, Outbox, CQRS, Circuit Breaker…) kèm công cụ Java và trade-off
- **Trang ôn tập** gộp câu hỏi giai đoạn và câu hỏi cuối các bài, chọn 10/20/50 câu hoặc tất cả, lọc theo giai đoạn, xáo trộn câu hỏi và đáp án
- **Tài nguyên**: sách, chứng chỉ (AWS/Azure/GCP/Oracle/Spring/CNCF/Scrum/PMP), website
- **Flashcard ôn tập** lặp lại ngắt quãng (1, 3, 7, 14, 30 ngày), theo bài, giai đoạn hoặc mẫu kiến trúc, có phím tắt
- **Ôn phỏng vấn**: câu hỏi phỏng vấn hay gặp theo từng bài, dạng thẻ ảnh (ý chính, bảng so sánh, code, mẹo, câu hỏi
  nối tiếp), lọc theo cấp độ Junior/Middle/Senior, chế độ luyện che đáp án, tải thẻ thành ảnh PNG
- **Thói quen học**: tự đếm phút học, bài đã đọc, câu hỏi, flashcard mỗi ngày; chuỗi ngày học, lịch nhiệt, đánh giá chăm chỉ hay lười
- **Nhắc học qua Telegram** mỗi tối kèm flashcard và câu hỏi trong ngày (xem bên dưới)
- Tìm kiếm chủ đề, chế độ sáng/tối, responsive trên điện thoại

## Chạy local

```bash
npm install
npm run dev
```

Mở http://localhost:5173

## Deploy lên GitHub Pages

1. Tạo repository mới trên GitHub (ví dụ `java-sa-roadmap`).
2. Đẩy code lên nhánh `main`:

   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/<username>/java-sa-roadmap.git
   git push -u origin main
   ```

3. Trên GitHub: **Settings → Pages → Build and deployment → Source** chọn **GitHub Actions**.
4. Workflow `.github/workflows/deploy.yml` sẽ tự build và deploy. Site có tại
   `https://<username>.github.io/java-sa-roadmap/`.

Site dùng `HashRouter` và `base: './'` nên chạy được dưới bất kỳ tên repo nào, reload trang con không bị 404.

## Nhắc học qua Telegram

Workflow `.github/workflows/study-reminder.yml` chạy lúc 20:00 giờ Việt Nam mỗi ngày. Mỗi ngày là một bài theo thứ tự
lộ trình: tin nhắn giới thiệu bài kèm flashcard (đáp án che bằng spoiler) và nút mở bài, tiếp theo là một câu quiz
dạng poll của Telegram (chọn đáp án là thấy đúng/sai và giải thích).

1. Trên Telegram, chat với **@BotFather**, gõ `/newbot` và làm theo hướng dẫn để lấy **bot token**.
2. Mở chat với bot vừa tạo và gửi một tin bất kỳ (ví dụ `/start`).
3. Mở `https://api.telegram.org/bot<TOKEN>/getUpdates` trên trình duyệt, tìm `"chat":{"id":...}` để lấy **chat id**.
4. Trên GitHub: **Settings → Secrets and variables → Actions → New repository secret**, tạo
   `TELEGRAM_BOT_TOKEN` và `TELEGRAM_CHAT_ID`.
5. Vào tab **Actions → Study reminder (Telegram) → Run workflow** để gửi thử.

Tuỳ chọn: tạo biến (tab *Variables*) `STUDY_TRACK` = `sa` hoặc `lead` để chỉ nhắc nội dung một lộ trình, và
`STUDY_START_DATE` (dạng `2026-11-15`) là ngày gửi bài 1. Muốn đổi giờ,
sửa dòng `cron` (giờ UTC). Lưu ý GitHub có thể chạy lịch trễ vài phút và tự tắt lịch nếu repo không có commit trong 60 ngày.

Chạy thử không gửi: `DRY_RUN=1 node --experimental-strip-types scripts/telegram-reminder.mjs`

## Cấu trúc

```
src/
  data/        # Nội dung: roadmap.ts (giai đoạn SA + định nghĩa 2 lộ trình), leadPhases.ts,
               # quiz.ts, patterns.ts, resources.ts
  content/     # Bài học: <phaseId>/<topicId>.md, quiz.ts (5 câu mỗi bài), flashcards.ts, interview.ts
  pages/       # Home, Roadmap, PhaseDetail, Lesson, Patterns, Quiz, Flashcards, Interview, Resources, Progress, Habits
  components/  # PhaseIcon, TrackSwitch, Markdown, LessonQuiz, SkillChecklist, ResourceList
  progress.tsx # Lưu tiến độ (React context + localStorage)
  activity.ts  # Ghi nhận hoạt động học mỗi ngày cho trang Thói quen
scripts/       # telegram-reminder.mjs
  track.tsx    # Lộ trình đang chọn (SA / Dev Lead)
  App.tsx      # Layout, menu, tìm kiếm, theme
```

Muốn thêm/sửa lộ trình, chỉnh các file trong `src/data/`. Muốn sửa bài học, chỉnh file markdown trong
`src/content/<phaseId>/`; bài nào có file `.md` thì trang giai đoạn tự hiện nút "Vào học bài".
