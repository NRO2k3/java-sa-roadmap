import { useState } from 'react';

const STORAGE_KEY = 'java-sa-roadmap:lesson-scores';

/** Điểm cao nhất (%) của trắc nghiệm cuối bài, key là `${phaseId}.${topicId}` */
export type LessonScores = Record<string, number>;

export const lessonKey = (phaseId: string, topicId: string) => `${phaseId}.${topicId}`;

function load(): LessonScores {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as LessonScores) : {};
  } catch {
    return {};
  }
}

export function useLessonScores() {
  const [scores, setScores] = useState<LessonScores>(load);

  // Chỉ giữ điểm cao nhất
  const record = (key: string, pct: number) => {
    const current = load();
    if ((current[key] ?? -1) >= pct) return;
    const next = { ...current, [key]: pct };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // bỏ qua
    }
    setScores(next);
  };

  return { scores, record };
}
