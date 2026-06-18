import type { GroupMatch, KnockoutMatch } from '../types';
import { TEAMS_BY_ID } from '../data/teams';
import { resolveBracket } from './bracket';
import { buildInitialGroupMatches } from '../data/groups';
import { buildInitialBracket } from '../data/bracket';
import {
  getOfficialGroupResult,
  getOfficialKoResult,
} from '../data/officialResults';

// Distribution de Poisson par la méthode de Knuth
function poisson(lambda: number): number {
  if (lambda <= 0) return 0;
  const L = Math.exp(-lambda);
  let k = 0;
  let p = 1;
  do { k++; p *= Math.random(); } while (p > L);
  return k - 1;
}

function makeForceOf(overrides: Record<string, number>) {
  return (id: string | null | undefined): number => {
    if (!id) return 60;
    return overrides[id] ?? TEAMS_BY_ID[id]?.force ?? 60;
  };
}

// λ (espérance de buts) en fonction de l'écart de force.
// Force ∈ [47, 93], moyenne ~70. Un match équilibré → λ ≈ 1.25 (≈ 2.5 buts au total).
function expectedGoals(myForce: number, oppForce: number, alpha: number): number {
  const base = 1.25;
  const diff = myForce - oppForce;
  const lambda = base + alpha * diff / 12;
  return Math.max(0.15, Math.min(5.5, lambda));
}

function simulateMatchScores(
  homeId: string | null,
  awayId: string | null,
  forceOf: (id: string | null) => number,
  alpha: number,
): { home: number; away: number } {
  const h = forceOf(homeId);
  const a = forceOf(awayId);
  return {
    home: poisson(expectedGoals(h, a, alpha)),
    away: poisson(expectedGoals(a, h, alpha)),
  };
}

function simulatePenalties(
  homeId: string | null,
  awayId: string | null,
  forceOf: (id: string | null) => number,
  alpha: number,
): { home: number; away: number } {
  const h = forceOf(homeId);
  const a = forceOf(awayId);
  const diff = h - a;
  // Biais TAB pondéré par α (0.5 + α × diff × 0.005), clampé à 35-65%
  const homeProb = Math.max(0.35, Math.min(0.65, 0.5 + alpha * diff * 0.005));
  const awayProb = Math.max(0.35, Math.min(0.65, 0.5 - alpha * diff * 0.005));

  let home: number;
  let away: number;
  do {
    home = 0;
    away = 0;
    for (let i = 0; i < 5; i++) {
      if (Math.random() < homeProb) home++;
      if (Math.random() < awayProb) away++;
    }
    let round = 0;
    while (home === away && round < 15) {
      const ok1 = Math.random() < homeProb;
      const ok2 = Math.random() < awayProb;
      if (ok1) home++;
      if (ok2) away++;
      round++;
    }
  } while (home === away);
  return { home, away };
}

// Simule uniquement la phase de groupes — repropage les seeds mais vide
// les scores éliminatoires (puisque les têtes de série changent).
export function simulateGroupsOnly(
  forceOverrides: Record<string, number> = {},
  alpha: number = 1.0,
): {
  groupMatches: GroupMatch[];
  knockout: KnockoutMatch[];
} {
  const forceOf = makeForceOf(forceOverrides);

  const groupMatches: GroupMatch[] = buildInitialGroupMatches().map(m => {
    // Les matchs déjà joués IRL ne sont pas re-simulés : on conserve leur score.
    const official = getOfficialGroupResult(m.id);
    if (official) {
      return { ...m, homeScore: official.homeScore, awayScore: official.awayScore };
    }
    const { home, away } = simulateMatchScores(m.homeId, m.awayId, forceOf, alpha);
    return { ...m, homeScore: home, awayScore: away };
  });

  let knockout = buildInitialBracket();
  knockout = resolveBracket(groupMatches, knockout);
  return { groupMatches, knockout };
}

// Simule uniquement la phase finale — conserve les résultats de groupes
// passés en argument. Nécessite que tous les groupes soient joués.
export function simulateKnockoutOnly(
  groupMatches: GroupMatch[],
  forceOverrides: Record<string, number> = {},
  alpha: number = 1.0,
): {
  groupMatches: GroupMatch[];
  knockout: KnockoutMatch[];
} {
  const forceOf = makeForceOf(forceOverrides);

  let knockout = buildInitialBracket();
  knockout = resolveBracket(groupMatches, knockout);

  const rounds: KnockoutMatch['round'][] = ['R32', 'R16', 'QF', 'SF', 'FINAL', 'THIRD'];
  for (const round of rounds) {
    knockout = knockout.map(m => {
      if (m.round !== round) return m;
      if (!m.homeId || !m.awayId) return m;
      // Match KO déjà joué IRL : on conserve son score.
      const official = getOfficialKoResult(m.id);
      if (official) {
        return {
          ...m,
          homeScore: official.homeScore,
          awayScore: official.awayScore,
          homePen: official.homePen ?? null,
          awayPen: official.awayPen ?? null,
        };
      }
      const { home, away } = simulateMatchScores(m.homeId, m.awayId, forceOf, alpha);
      let homePen: number | null = null;
      let awayPen: number | null = null;
      if (home === away) {
        const p = simulatePenalties(m.homeId, m.awayId, forceOf, alpha);
        homePen = p.home;
        awayPen = p.away;
      }
      return { ...m, homeScore: home, awayScore: away, homePen, awayPen };
    });
    knockout = resolveBracket(groupMatches, knockout);
  }

  return { groupMatches, knockout };
}

// Simulation totale = groupes + phase finale en chaîne.
export function simulateEverything(
  forceOverrides: Record<string, number> = {},
  alpha: number = 1.0,
): {
  groupMatches: GroupMatch[];
  knockout: KnockoutMatch[];
} {
  const { groupMatches } = simulateGroupsOnly(forceOverrides, alpha);
  return simulateKnockoutOnly(groupMatches, forceOverrides, alpha);
}
