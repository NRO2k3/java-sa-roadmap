import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { logSkills } from './activity';

const STORAGE_KEY = 'java-sa-roadmap:progress';

interface ProgressContextValue {
  done: Set<string>;
  isDone: (id: string) => boolean;
  toggle: (id: string, checked: boolean) => void;
  setMany: (ids: string[], checked: boolean) => void;
  countDone: (ids: string[]) => number;
  reset: () => void;
  importIds: (ids: string[]) => void;
}

const ProgressContext = createContext<ProgressContextValue | null>(null);

function load(): Set<string> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return new Set(raw ? (JSON.parse(raw) as string[]) : []);
  } catch {
    return new Set();
  }
}

export function ProgressProvider({ children }: { children: ReactNode }) {
  const [done, setDone] = useState<Set<string>>(load);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify([...done]));
    } catch {
      // Trình duyệt chặn storage: vẫn dùng được trong phiên hiện tại
    }
  }, [done]);

  const doneRef = useRef(done);
  doneRef.current = done;

  const setMany = useCallback((ids: string[], checked: boolean) => {
    // Ghi nhận cho trang thói quen, chỉ đếm kỹ năng mới đạt
    const added = checked ? ids.filter((id) => !doneRef.current.has(id)).length : 0;
    if (added > 0) logSkills(added);
    setDone((prev) => {
      const next = new Set(prev);
      ids.forEach((id) => (checked ? next.add(id) : next.delete(id)));
      return next;
    });
  }, []);

  const value = useMemo<ProgressContextValue>(
    () => ({
      done,
      isDone: (id) => done.has(id),
      toggle: (id, checked) => setMany([id], checked),
      setMany,
      countDone: (ids) => ids.filter((id) => done.has(id)).length,
      reset: () => setDone(new Set()),
      importIds: (ids) => setDone(new Set(ids)),
    }),
    [done, setMany],
  );

  return <ProgressContext.Provider value={value}>{children}</ProgressContext.Provider>;
}

export function useProgress() {
  const ctx = useContext(ProgressContext);
  if (!ctx) throw new Error('useProgress phải dùng bên trong ProgressProvider');
  return ctx;
}

export const percent = (doneCount: number, total: number) =>
  total === 0 ? 0 : Math.round((doneCount / total) * 100);
