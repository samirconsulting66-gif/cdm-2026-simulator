import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { shiftDateTime, labelForOffset, SOURCE_TZ_OFFSET, type ShiftedDateTime } from '../lib/time';

const LS_KEY = 'cdm2026-tz';

interface TimezoneContextValue {
  offset: number;
  label: string;
  setOffset: (o: number) => void;
  shift: (date: string, time: string) => ShiftedDateTime;
}

const TimezoneContext = createContext<TimezoneContextValue | null>(null);

function loadOffset(): number {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (raw !== null) {
      const n = parseInt(raw, 10);
      if (!Number.isNaN(n)) return n;
    }
  } catch { /* ignore */ }
  return SOURCE_TZ_OFFSET;
}

export function TimezoneProvider({ children }: { children: ReactNode }) {
  const [offset, setOffsetState] = useState<number>(loadOffset);

  useEffect(() => {
    try { localStorage.setItem(LS_KEY, String(offset)); } catch { /* ignore */ }
  }, [offset]);

  const value: TimezoneContextValue = {
    offset,
    label: labelForOffset(offset),
    setOffset: setOffsetState,
    shift: (date, time) => shiftDateTime(date, time, offset),
  };

  return <TimezoneContext.Provider value={value}>{children}</TimezoneContext.Provider>;
}

export function useTimezone() {
  const ctx = useContext(TimezoneContext);
  if (!ctx) throw new Error('useTimezone must be used within TimezoneProvider');
  return ctx;
}
