# Java Career Roadmap

Website học tập lộ trình trở thành **Solution Architect** và **Dev Lead** với tech stack **Java**, xây dựng bằng React + [Ant Design](https://ant.design/) + Vite, deploy tự động lên GitHub Pages.

## Tính năng

- **Hai lộ trình**, chuyển qua lại bằng một nút:
  - **Solution Architect**: Java Core → Spring → Dữ liệu → Messaging → Microservices → Cloud/DevOps → Bảo mật → System Design → Năng lực SA → Chứng chỉ
  - **Dev Lead**: Java Core → Spring → Dữ liệu → Chất lượng & kỹ thuật phần mềm → Microservices → Vận hành & độ tin cậy → Lãnh đạo kỹ thuật → Quản lý con người → Delivery & Agile → Phát triển sự nghiệp Lead
- Các giai đoạn kỹ thuật chung (Java Core, Spring, Dữ liệu, Microservices) **dùng chung tiến độ** cho cả hai lộ trình
- **Checklist kỹ năng** cho từng chủ đề, lưu tiến độ trong trình duyệt (localStorage), xuất/nhập file JSON
- **Dự án cột mốc** cho mỗi giai đoạn và tài liệu tham khảo chính thức
- **Mẫu kiến trúc**: 15 pattern (Saga, Outbox, CQRS, Circuit Breaker…) kèm công cụ Java và trade-off
- **Trắc nghiệm** 50 câu có giải thích, xáo trộn câu hỏi và đáp án, lọc theo giai đoạn
- **Tài nguyên**: sách, chứng chỉ (AWS/Azure/GCP/Oracle/Spring/CNCF/Scrum/PMP), website
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

## Cấu trúc

```
src/
  data/        # Nội dung: roadmap.ts (giai đoạn SA + định nghĩa 2 lộ trình), leadPhases.ts,
               # quiz.ts, patterns.ts, resources.ts
  pages/       # Home, Roadmap, PhaseDetail, Patterns, Quiz, Resources, Progress
  components/  # PhaseIcon, TrackSwitch
  progress.tsx # Lưu tiến độ (React context + localStorage)
  track.tsx    # Lộ trình đang chọn (SA / Dev Lead)
  App.tsx      # Layout, menu, tìm kiếm, theme
```

Muốn thêm/sửa nội dung, chỉ cần chỉnh các file trong `src/data/`.
