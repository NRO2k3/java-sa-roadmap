import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { trackById, trackPhases, tracks, type Phase, type Track, type TrackId } from './data/roadmap';

const STORAGE_KEY = 'java-sa-roadmap:track';

interface TrackContextValue {
  track: Track;
  trackPhaseList: Phase[];
  setTrack: (id: TrackId) => void;
}

const TrackContext = createContext<TrackContextValue | null>(null);

function load(): TrackId {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved && trackById(saved)) return saved as TrackId;
  } catch {
    // bỏ qua
  }
  return tracks[0].id;
}

export function TrackProvider({ children }: { children: ReactNode }) {
  const [trackId, setTrackId] = useState<TrackId>(load);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, trackId);
    } catch {
      // bỏ qua
    }
  }, [trackId]);

  const value = useMemo<TrackContextValue>(() => {
    const track = trackById(trackId)!;
    return { track, trackPhaseList: trackPhases(track), setTrack: setTrackId };
  }, [trackId]);

  return <TrackContext.Provider value={value}>{children}</TrackContext.Provider>;
}

export function useTrack() {
  const ctx = useContext(TrackContext);
  if (!ctx) throw new Error('useTrack phải dùng bên trong TrackProvider');
  return ctx;
}
