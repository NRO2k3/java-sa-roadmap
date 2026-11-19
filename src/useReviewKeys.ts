import { useEffect } from 'react';

interface Handlers {
  flip: () => void;
  answer: (known: boolean) => void;
}

/** Phím tắt khi ôn: Space/Enter lật thẻ, → hoặc 2 là đã nhớ, ← hoặc 1 là chưa nhớ */
export function useReviewKeys({ flip, answer }: Handlers) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      // Không cướp phím khi đang gõ chữ, chọn trong Select hay tích checkbox
      const target = e.target as HTMLElement;
      if (target.closest('input[type=text], input[type=search], input[type=checkbox], textarea, .ant-select')) return;
      if (e.key === ' ' || e.key === 'Enter') flip();
      else if (e.key === 'ArrowRight' || e.key === '2') answer(true);
      else if (e.key === 'ArrowLeft' || e.key === '1') answer(false);
      else return;
      // Bắt ở pha capture và chặn lại, kẻo Segmented đang focus tự đổi lựa chọn bằng phím mũi tên
      e.preventDefault();
      e.stopPropagation();
    };
    window.addEventListener('keydown', onKey, true);
    return () => window.removeEventListener('keydown', onKey, true);
  });
}
