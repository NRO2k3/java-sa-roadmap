import { useState } from 'react';
import { logCards } from './activity';

const STORAGE_KEY = 'java-sa-roadmap:flashcards';
const DAY = 24 * 60 * 60 * 1000;
// Hộp Leitner: nhớ thì lên hộp và giãn lịch ôn, quên thì về hộp 0 để ôn lại ngay
export const INTERVAL_DAYS = [0, 1, 3, 7, 14, 30];
/** Từ hộp này (ôn lại sau ≥ 7 ngày) coi như đã thuộc */
export const MASTERED_BOX = 3;

export interface CardState {
  box: number;
  due: number;
}

/** Trạng thái ôn của từng thẻ, key là id thẻ */
export type ReviewStates = Record<string, CardState>;

function load(): ReviewStates {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as ReviewStates) : {};
  } catch {
    return {};
  }
}

function save(states: ReviewStates) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(states));
  } catch {
    // bỏ qua
  }
}

export const isDue = (state: CardState | undefined, now: number) => !state || state.due <= now;

export function useFlashcardReview() {
  const [states, setStates] = useState<ReviewStates>(load);

  const grade = (id: string, remembered: boolean) => {
    const current = load();
    const box = remembered ? Math.min((current[id]?.box ?? 0) + 1, INTERVAL_DAYS.length - 1) : 0;
    const today = new Date().setHours(0, 0, 0, 0);
    // Hẹn theo ngày để sáng hôm sau đã thấy thẻ đến hạn, không phải đợi đúng giờ
    const due = box === 0 ? Date.now() : today + INTERVAL_DAYS[box] * DAY;
    const next = { ...current, [id]: { box, due } };
    save(next);
    setStates(next);
    logCards();
  };

  const reset = (ids: string[]) => {
    const next = { ...load() };
    ids.forEach((id) => delete next[id]);
    save(next);
    setStates(next);
  };

  return { states, grade, reset };
}
