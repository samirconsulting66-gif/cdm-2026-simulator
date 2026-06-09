import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { GroupMatch, KnockoutMatch } from '../types';
import { TEAMS_BY_ID } from '../data/teams';
import { buildInitialGroupMatches } from '../data/groups';
import { buildInitialBracket } from '../data/bracket';
import { resolveBracket } from '../lib/bracket';
import { computeStandings } from '../lib/standings';
import { computeElos } from '../lib/elo';
import { simulateEverything } from '../lib/random';

const LS_KEY = 'cdm2026-sim-v6';
const FORCE_LS_KEY = 'cdm2026-forces';
const FACTOR_LS_KEY = 'cdm2026-simfactor';

export const SIM_FACTOR_PRESETS = [
  { key: 'chaos',       value: 0.2 },
  { key: 'surprising',  value: 0.6 },
  { key: 'standard',    value: 1.0 },
  { key: 'pronounced',  value: 1.5 },
  { key: 'strict',      value: 2.0 },
] as const;

export type SimFactorKey = (typeof SIM_FACTOR_PRESETS)[number]['key'];

interface SimState {
  groupMatches: GroupMatch[];
  knockout: KnockoutMatch[];
}

interface SimContextValue extends SimState {
  setGroupScore: (id: string, home: number | null, away: number | null) => void;
  setKoScore: (
    id: string,
    home: number | null,
    away: number | null,
    homePen?: number | null,
    awayPen?: number | null,
  ) => void;
  reset: () => void;
  simulate: () => void;
  standings: ReturnType<typeof computeStandings>;
  elos: ReturnType<typeof computeElos>;
  forceOverrides: Record<string, number>;
  setForce: (teamId: string, force: number) => void;
  resetForce: (teamId: string) => void;
  getForce: (teamId: string) => number;
  simFactor: number;
  setSimFactor: (v: number) => void;
}

const SimContext = createContext<SimContextValue | null>(null);

function loadInitial(): SimState {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as SimState;
      if (parsed.groupMatches && parsed.knockout) return parsed;
    }
  } catch {
    // ignore
  }
  return {
    groupMatches: buildInitialGroupMatches(),
    knockout: buildInitialBracket(),
  };
}

function loadForceOverrides(): Record<string, number> {
  try {
    const raw = localStorage.getItem(FORCE_LS_KEY);
    if (raw) return JSON.parse(raw) as Record<string, number>;
  } catch { /* ignore */ }
  return {};
}

function loadSimFactor(): number {
  try {
    const raw = localStorage.getItem(FACTOR_LS_KEY);
    if (raw) {
      const n = parseFloat(raw);
      if (!Number.isNaN(n)) return Math.max(0.1, Math.min(3, n));
    }
  } catch { /* ignore */ }
  return 1.0;
}

export function SimulationProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<SimState>(loadInitial);
  const [forceOverrides, setForceOverrides] = useState<Record<string, number>>(loadForceOverrides);
  const [simFactor, setSimFactorState] = useState<number>(loadSimFactor);

  useEffect(() => {
    try { localStorage.setItem(LS_KEY, JSON.stringify(state)); } catch { /* ignore */ }
  }, [state]);

  useEffect(() => {
    try { localStorage.setItem(FORCE_LS_KEY, JSON.stringify(forceOverrides)); } catch { /* ignore */ }
  }, [forceOverrides]);

  useEffect(() => {
    try { localStorage.setItem(FACTOR_LS_KEY, String(simFactor)); } catch { /* ignore */ }
  }, [simFactor]);

  const setSimFactor = (v: number) => {
    setSimFactorState(Math.max(0.1, Math.min(3, v)));
  };

  const getForce = (teamId: string): number => {
    if (forceOverrides[teamId] !== undefined) return forceOverrides[teamId];
    return TEAMS_BY_ID[teamId]?.force ?? 60;
  };

  const standings = useMemo(
    () => computeStandings(state.groupMatches, forceOverrides),
    [state.groupMatches, forceOverrides],
  );

  const elos = useMemo(
    () => computeElos(state.groupMatches, state.knockout, forceOverrides),
    [state.groupMatches, state.knockout, forceOverrides],
  );

  const setGroupScore: SimContextValue['setGroupScore'] = (id, home, away) => {
    setState(prev => {
      const groupMatches = prev.groupMatches.map(m =>
        m.id === id ? { ...m, homeScore: home, awayScore: away } : m
      );
      const knockout = resolveBracket(groupMatches, prev.knockout);
      return { groupMatches, knockout };
    });
  };

  const setKoScore: SimContextValue['setKoScore'] = (id, home, away, homePen = null, awayPen = null) => {
    setState(prev => {
      let knockout = prev.knockout.map(m =>
        m.id === id ? { ...m, homeScore: home, awayScore: away, homePen, awayPen } : m
      );
      knockout = resolveBracket(prev.groupMatches, knockout);
      return { ...prev, knockout };
    });
  };

  const reset = () => {
    setState({
      groupMatches: buildInitialGroupMatches(),
      knockout: buildInitialBracket(),
    });
    setForceOverrides({});
  };

  const simulate = () => {
    setState(simulateEverything(forceOverrides, simFactor));
  };

  const setForce = (teamId: string, force: number) => {
    const clamped = Math.max(1, Math.min(100, Math.round(force)));
    setForceOverrides(prev => ({ ...prev, [teamId]: clamped }));
  };

  const resetForce = (teamId: string) => {
    setForceOverrides(prev => {
      const next = { ...prev };
      delete next[teamId];
      return next;
    });
  };

  const value: SimContextValue = {
    ...state,
    setGroupScore,
    setKoScore,
    reset,
    simulate,
    standings,
    elos,
    forceOverrides,
    setForce,
    resetForce,
    getForce,
    simFactor,
    setSimFactor,
  };

  return <SimContext.Provider value={value}>{children}</SimContext.Provider>;
}

export function useSim() {
  const ctx = useContext(SimContext);
  if (!ctx) throw new Error('useSim must be used within SimulationProvider');
  return ctx;
}
