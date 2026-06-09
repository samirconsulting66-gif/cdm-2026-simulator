import type { GroupLetter, GroupMatch, KnockoutMatch } from '../types';
import {
  computeStandings,
  thirdPlacedRanking,
} from './standings';
import { BRACKET_SLOTS } from '../data/bracket';

const R32_THIRD_SLOTS_ORDER = [
  'M74', 'M77', 'M79', 'M80', 'M81', 'M82', 'M85', 'M87',
];

// Résolution progressive : on remplit le bracket avec le classement courant,
// même si la phase de groupes n'est pas terminée. Les positions seront
// "provisoires" tant que les 72 matchs de groupes ne sont pas tous joués.
export function resolveBracket(
  groupMatches: GroupMatch[],
  knockout: KnockoutMatch[],
): KnockoutMatch[] {
  const out = knockout.map(m => ({ ...m, homeId: null as string | null, awayId: null as string | null }));

  // S'il n'y a aucun match joué, on laisse le bracket vide.
  const anyPlayed = groupMatches.some(m => m.homeScore !== null && m.awayScore !== null);
  if (!anyPlayed) return out;

  const standings = computeStandings(groupMatches);
  const seedToTeamId: Record<string, string> = {};

  for (const letter of Object.keys(standings) as GroupLetter[]) {
    const s = standings[letter];
    if (s[0]) seedToTeamId[`1${letter}`] = s[0].teamId;
    if (s[1]) seedToTeamId[`2${letter}`] = s[1].teamId;
  }

  // 8 best 3rd-placed teams assigned by ranking to bracket slots in fixed order
  const thirds = thirdPlacedRanking(standings).slice(0, 8);
  R32_THIRD_SLOTS_ORDER.forEach((matchId, i) => {
    const slot = BRACKET_SLOTS.find(s => s.id === matchId);
    if (!slot) return;
    const third = thirds[i];
    if (!third) return;
    const seedKey = slot.awaySeed.startsWith('3') ? slot.awaySeed : slot.homeSeed;
    seedToTeamId[seedKey] = third.teamId;
  });

  // Resolve R32 first
  for (const m of out) {
    if (m.round === 'R32') {
      m.homeId = seedToTeamId[m.homeSeed] ?? null;
      m.awayId = seedToTeamId[m.awaySeed] ?? null;
    }
  }

  // Then propagate winners through R16 → QF → SF → FINAL/THIRD
  const propagateOrder: KnockoutMatch['round'][] = ['R16', 'QF', 'SF', 'FINAL', 'THIRD'];
  for (const round of propagateOrder) {
    for (const m of out) {
      if (m.round !== round) continue;
      m.homeId = resolveSeed(m.homeSeed, out, seedToTeamId);
      m.awayId = resolveSeed(m.awaySeed, out, seedToTeamId);
    }
  }

  return out;
}

function resolveSeed(
  seed: string,
  matches: KnockoutMatch[],
  seedMap: Record<string, string>,
): string | null {
  if (seedMap[seed]) return seedMap[seed];
  if (seed.startsWith('W')) {
    const src = matches.find(m => m.id === 'M' + seed.slice(1));
    return getWinnerId(src);
  }
  if (seed.startsWith('RU')) {
    const src = matches.find(m => m.id === 'M' + seed.slice(2));
    return getLoserId(src);
  }
  return null;
}

export function getWinnerId(m: KnockoutMatch | undefined): string | null {
  if (!m) return null;
  if (m.homeScore === null || m.awayScore === null) return null;
  if (m.homeScore > m.awayScore) return m.homeId;
  if (m.awayScore > m.homeScore) return m.awayId;
  // tie → penalties
  if (m.homePen !== null && m.awayPen !== null && m.homePen !== m.awayPen) {
    return m.homePen > m.awayPen ? m.homeId : m.awayId;
  }
  return null;
}

export function getLoserId(m: KnockoutMatch | undefined): string | null {
  if (!m) return null;
  const w = getWinnerId(m);
  if (!w) return null;
  return w === m.homeId ? m.awayId : m.homeId;
}

export function getChampionId(matches: KnockoutMatch[]): string | null {
  const final = matches.find(m => m.id === 'M104');
  return getWinnerId(final);
}
