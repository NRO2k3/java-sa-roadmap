import { useEffect, useState } from 'react';

const STORAGE_KEY = 'java-sa-roadmap:activity';
const GOAL_KEY = 'java-sa-roadmap:daily-goal';
const CHANGE_EVENT = 'java-sa-roadmap:activity-change';
const IDLE_MS = 2 * 60 * 1000;

export interface DayActivity {
  /** Phút có thao tác trên site */
  minutes: number;
  /** Bài học đã mở trong ngày, dạng `${phaseId}.${topicId}` */
  lessons: string[];
  /** Số câu trắc nghiệm đã trả lời */
  quiz: number;
  /** Số lượt chấm flashcard */
  cards: number;
  /** Số kỹ năng được đánh dấu đạt */
  skills: number;
  /** Số lượt ôn câu hỏi phỏng vấn (dữ liệu cũ không có) */
  interview?: number;
}

/** Hoạt động theo ngày (giờ máy), key dạng YYYY-MM-DD */
export type ActivityLog = Record<string, DayActivity>;

export const DEFAULT_GOAL = 30;

export function dayKey(date = new Date()) {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export const emptyDay = (): DayActivity => ({ minutes: 0, lessons: [], quiz: 0, cards: 0, skills: 0 });

/** Ngày được tính là có học: ít nhất 5 phút hoặc có làm bài, ôn thẻ, đánh dấu kỹ năng */
export const isActiveDay = (d?: DayActivity) =>
  !!d && (d.minutes >= 5 || d.lessons.length > 0 || d.quiz > 0 || d.cards > 0 || d.skills > 0 || (d.interview ?? 0) > 0);

function load(): ActivityLog {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as ActivityLog) : {};
  } catch {
    return {};
  }
}

function update(change: (day: DayActivity) => void) {
  const log = load();
  const key = dayKey();
  const day = { ...emptyDay(), ...log[key] };
  change(day);
  log[key] = day;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(log));
  } catch {
    // bỏ qua
  }
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

export const logLesson = (key: string) =>
  update((d) => {
    if (!d.lessons.includes(key)) d.lessons = [...d.lessons, key];
  });
export const logQuiz = (count = 1) => update((d) => (d.quiz += count));
export const logCards = (count = 1) => update((d) => (d.cards += count));
export const logSkills = (count: number) => update((d) => (d.skills += count));
export const logInterview = () => update((d) => (d.interview = (d.interview ?? 0) + 1));

/** Đếm phút học: chỉ tính khi tab đang hiện và có thao tác trong 2 phút gần nhất */
export function useStudyTimer() {
  useEffect(() => {
    let lastInput = Date.now();
    const touch = () => {
      lastInput = Date.now();
    };
    const events = ['pointerdown', 'pointermove', 'keydown', 'scroll', 'wheel', 'touchstart'];
    events.forEach((e) => window.addEventListener(e, touch, { passive: true }));
    const timer = window.setInterval(() => {
      if (document.visibilityState === 'visible' && Date.now() - lastInput < IDLE_MS) update((d) => (d.minutes += 1));
    }, 60 * 1000);
    return () => {
      window.clearInterval(timer);
      events.forEach((e) => window.removeEventListener(e, touch));
    };
  }, []);
}

export function useActivityLog(): ActivityLog {
  const [log, setLog] = useState<ActivityLog>(load);
  useEffect(() => {
    const refresh = () => setLog(load());
    window.addEventListener(CHANGE_EVENT, refresh);
    // Tab khác ghi hoạt động thì cập nhật luôn
    window.addEventListener('storage', refresh);
    return () => {
      window.removeEventListener(CHANGE_EVENT, refresh);
      window.removeEventListener('storage', refresh);
    };
  }, []);
  return log;
}

export function useDailyGoal(): [number, (minutes: number) => void] {
  const [goal, setGoal] = useState(() => {
    try {
      return Number(localStorage.getItem(GOAL_KEY)) || DEFAULT_GOAL;
    } catch {
      return DEFAULT_GOAL;
    }
  });
  const change = (minutes: number) => {
    setGoal(minutes);
    try {
      localStorage.setItem(GOAL_KEY, String(minutes));
    } catch {
      // bỏ qua
    }
  };
  return [goal, change];
}
