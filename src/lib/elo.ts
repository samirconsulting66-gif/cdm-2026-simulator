import type { GroupMatch, KnockoutMatch } from '../types';
import { TEAMS } from '../data/teams';

export type Round = KnockoutMatch['round'] | 'GROUP';

export interface MatchDelta {
  matchNumber: number;
  date: string;
  time: string;
  round: Round;
  matchday?: 1 | 2 | 3;
  group?: string;
  isHome: boolean;
  opponentId: string;
  selfScore: number;
  oppScore: number;
  selfPen?: number | null;
  oppPen?: number | null;
  result: 'W' | 'D' | 'L';
  fifaPointsDelta: number;
  eloDelta: number;
}

export interface EloState {
  current: number;
  initial: number;
  delta: number;
  matches: number;
  wins: number;
  draws: number;
  losses: number;
  // Points FIFA évolués (formule officielle FIFA — base 10^((opp-self)/600))
  fifaPointsInitial: number;
  fifaPointsCurrent: number;
  fifaPointsDelta: number;
  history: MatchDelta[];
}

// ELO initial dérivé de la force (47-93 → ~1455-2145)
export function initialElo(force: number): number {
  return 750 + force * 15;
}

// K-factor variable par phase (style FIFA, pour le calcul ELO interne)
function kFactorForRound(round: KnockoutMatch['round'] | 'GROUP'): number {
  switch (round) {
    case 'GROUP': return 30;
    case 'R32':   return 35;
    case 'R16':   return 40;
    case 'QF':    return 50;
    case 'SF':    return 55;
    case 'THIRD': return 35;
    case 'FINAL': return 60;
  }
}

// I-factor officiel FIFA (Coca-Cola Ranking) — pour la formule SUM
function iFactorForRound(round: KnockoutMatch['round'] | 'GROUP'): number {
  switch (round) {
    case 'GROUP': return 35;
    case 'R32':   return 50;
    case 'R16':   return 50;
    case 'QF':    return 50;
    case 'SF':    return 60;
    case 'THIRD': return 60;
    case 'FINAL': return 60;
  }
}

// Score attendu FIFA — base 600 (et non 400 comme le ELO classique)
function expectedFifa(myPoints: number, oppPoints: number): number {
  return 1 / (Math.pow(10, (oppPoints - myPoints) / 600) + 1);
}

// Multiplicateur d'écart de buts (formule officielle FIFA, simplifiée)
function goalDiffMultiplier(diff: number): number {
  const g = Math.abs(diff);
  if (g <= 1) return 1.0;
  if (g === 2) return 1.5;
  return (11 + g) / 8;
}

// Score attendu (proba de victoire) selon la différence d'ELO
function expectedScore(myElo: number, oppElo: number): number {
  return 1 / (1 + Math.pow(10, (oppElo - myElo) / 400));
}

interface ChronoMatch {
  matchNumber: number;
  date: string;
  time: string;
  homeId: string | null;
  awayId: string | null;
  homeScore: number | null;
  awayScore: number | null;
  homePen: number | null;
  awayPen: number | null;
  kind: 'group' | 'ko';
  round: Round;
  matchday?: 1 | 2 | 3;
  group?: string;
}

function parseTs(date: string, time: string): number {
  const [d, m, y] = date.split('/').map(s => parseInt(s, 10));
  const [hh, mm] = time.split(':').map(s => parseInt(s, 10));
  return new Date(y, m - 1, d, hh, mm).getTime();
}

export function computeElos(
  groupMatches: GroupMatch[],
  knockout: KnockoutMatch[],
  forceOverrides: Record<string, number> = {},
): Record<string, EloState> {
  const initial: Record<string, number> = {};
  const current: Record<string, number> = {};
  const fifaInit: Record<string, number> = {};
  const fifaCur: Record<string, number> = {};
  const stats: Record<string, { matches: number; wins: number; draws: number; losses: number }> = {};
  const history: Record<string, MatchDelta[]> = {};
  for (const t of TEAMS) {
    const effForce = forceOverrides[t.id] ?? t.force;
    const e = initialElo(effForce);
    initial[t.id] = e;
    current[t.id] = e;
    const fp = t.fifaPoints ?? 1200;
    fifaInit[t.id] = fp;
    fifaCur[t.id] = fp;
    stats[t.id] = { matches: 0, wins: 0, draws: 0, losses: 0 };
    history[t.id] = [];
  }

  const all: ChronoMatch[] = [];
  for (const m of groupMatches) {
    all.push({
      matchNumber: m.matchNumber,
      date: m.date, time: m.time,
      homeId: m.homeId, awayId: m.awayId,
      homeScore: m.homeScore, awayScore: m.awayScore,
      homePen: null, awayPen: null,
      kind: 'group', round: 'GROUP',
      matchday: m.matchday, group: m.group,
    });
  }
  for (const m of knockout) {
    all.push({
      matchNumber: m.matchNumber,
      date: m.date, time: m.time,
      homeId: m.homeId, awayId: m.awayId,
      homeScore: m.homeScore, awayScore: m.awayScore,
      homePen: m.homePen, awayPen: m.awayPen,
      kind: 'ko', round: m.round,
    });
  }

  all.sort((a, b) => parseTs(a.date, a.time) - parseTs(b.date, b.time));

  for (const m of all) {
    if (m.homeScore === null || m.awayScore === null) continue;
    if (!m.homeId || !m.awayId) continue;

    const rH = current[m.homeId];
    const rA = current[m.awayId];
    if (rH === undefined || rA === undefined) continue;

    const eH = expectedScore(rH, rA);
    const eA = 1 - eH;

    let sH: number;
    let sA: number;
    // wFifa = score officiel FIFA pour la formule SUM (diffère pour les TAB)
    let wHFifa: number;
    let wAFifa: number;

    if (m.homeScore > m.awayScore) {
      sH = 1; sA = 0;
      wHFifa = 1; wAFifa = 0;
      stats[m.homeId].wins++; stats[m.awayId].losses++;
    } else if (m.homeScore < m.awayScore) {
      sH = 0; sA = 1;
      wHFifa = 0; wAFifa = 1;
      stats[m.awayId].wins++; stats[m.homeId].losses++;
    } else {
      if (m.kind === 'ko' && m.homePen !== null && m.awayPen !== null && m.homePen !== m.awayPen) {
        // TAB — ELO : 0.75/0.25 ; FIFA : 0.75/0.5
        if (m.homePen > m.awayPen) {
          sH = 0.75; sA = 0.25;
          wHFifa = 0.75; wAFifa = 0.5;
          stats[m.homeId].wins++; stats[m.awayId].losses++;
        } else {
          sH = 0.25; sA = 0.75;
          wHFifa = 0.5; wAFifa = 0.75;
          stats[m.awayId].wins++; stats[m.homeId].losses++;
        }
      } else {
        sH = 0.5; sA = 0.5;
        wHFifa = 0.5; wAFifa = 0.5;
        stats[m.homeId].draws++; stats[m.awayId].draws++;
      }
    }

    // — ELO classique (interne) —
    const k = kFactorForRound(m.round);
    const g = goalDiffMultiplier(m.homeScore - m.awayScore);
    const eloDeltaH = k * g * (sH - eH);
    const eloDeltaA = k * g * (sA - eA);
    current[m.homeId] = rH + eloDeltaH;
    current[m.awayId] = rA + eloDeltaA;

    // — Points FIFA (formule officielle SUM) —
    const iFactor = iFactorForRound(m.round);
    const fH = fifaCur[m.homeId];
    const fA = fifaCur[m.awayId];
    const eFifaH = expectedFifa(fH, fA);
    const eFifaA = 1 - eFifaH;
    const fifaDeltaH = iFactor * (wHFifa - eFifaH);
    const fifaDeltaA = iFactor * (wAFifa - eFifaA);
    fifaCur[m.homeId] = fH + fifaDeltaH;
    fifaCur[m.awayId] = fA + fifaDeltaA;

    stats[m.homeId].matches++;
    stats[m.awayId].matches++;

    // — Historique par équipe —
    const resultHome: 'W' | 'D' | 'L' = sH > sA ? 'W' : sH < sA ? 'L' : 'D';
    const resultAway: 'W' | 'D' | 'L' = sA > sH ? 'W' : sA < sH ? 'L' : 'D';

    history[m.homeId].push({
      matchNumber: m.matchNumber,
      date: m.date,
      time: m.time,
      round: m.round,
      matchday: m.matchday,
      group: m.group,
      isHome: true,
      opponentId: m.awayId,
      selfScore: m.homeScore,
      oppScore: m.awayScore,
      selfPen: m.homePen,
      oppPen: m.awayPen,
      result: resultHome,
      fifaPointsDelta: Math.round(fifaDeltaH * 100) / 100,
      eloDelta: Math.round(eloDeltaH),
    });
    history[m.awayId].push({
      matchNumber: m.matchNumber,
      date: m.date,
      time: m.time,
      round: m.round,
      matchday: m.matchday,
      group: m.group,
      isHome: false,
      opponentId: m.homeId,
      selfScore: m.awayScore,
      oppScore: m.homeScore,
      selfPen: m.awayPen,
      oppPen: m.homePen,
      result: resultAway,
      fifaPointsDelta: Math.round(fifaDeltaA * 100) / 100,
      eloDelta: Math.round(eloDeltaA),
    });
  }

  const out: Record<string, EloState> = {};
  for (const id of Object.keys(initial)) {
    const c = Math.round(current[id]);
    const i = Math.round(initial[id]);
    const fpInit = Math.round(fifaInit[id] * 100) / 100;
    const fpCur = Math.round(fifaCur[id] * 100) / 100;
    out[id] = {
      current: c,
      initial: i,
      delta: c - i,
      matches: stats[id].matches,
      wins: stats[id].wins,
      draws: stats[id].draws,
      losses: stats[id].losses,
      fifaPointsInitial: fpInit,
      fifaPointsCurrent: fpCur,
      fifaPointsDelta: Math.round((fpCur - fpInit) * 100) / 100,
      history: history[id],
    };
  }
  return out;
}
