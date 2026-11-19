import { useState } from 'react';
import { logInterview } from './activity';

const STORAGE_KEY = 'java-sa-roadmap:interview';

function load(): Set<string> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return new Set(raw ? (JSON.parse(raw) as string[]) : []);
  } catch {
    return new Set();
  }
}

/** Câu phỏng vấn đã tự đánh giá là trả lời được */
export function useInterviewMastered() {
  const [mastered, setMastered] = useState<Set<string>>(load);

  const mark = (id: string, known: boolean) => {
    const next = load();
    if (known) next.add(id);
    else next.delete(id);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify([...next]));
    } catch {
      // bỏ qua
    }
    setMastered(next);
    logInterview();
  };

  return { mastered, mark };
}
