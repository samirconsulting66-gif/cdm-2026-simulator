import type { GroupLetter, GroupMatch, KnockoutMatch } from '../types';
import {
  computeStandings,
  thirdPlacedRanking,
} from './standings';
import { BRACKET_SLOTS } from '../data/bracket';
import {
  FIFA_THIRD_PLACE_TABLE,
  MATCH_TO_FIFA_SLOT,
  type SlotKey,
} from '../data/fifaThirdPlaceTable';

const R32_THIRD_SLOTS_ORDER = [
  'M75', 'M78', 'M79', 'M80', 'M82', 'M81', 'M85', 'M88',
];

// Pour chaque slot accueillant un 3ᵉ, la lettre du groupe interdit (= groupe du 1ᵉʳ
// qui affronte ce 3ᵉ en R32). Source : seeds officiels `3XXXXXX` du bracket FIFA 2026.
function getThirdSlotSeedKey(matchId: string): string | null {
  const slot = BRACKET_SLOTS.find(s => s.id === matchId);
  if (!slot) return null;
  return slot.awaySeed.startsWith('3') ? slot.awaySeed : slot.homeSeed;
}

// Appariement bijectif des 8 meilleurs 3ᵉˢ vers les 8 slots.
//
// Stratégie principale : lookup dans le tableau FIFA officiel
// (FIFA_THIRD_PLACE_TABLE, 495 combinaisons) qui donne pour chaque ensemble
// de 8 groupes qualifiés le mapping exact slot → groupe.
//
// Fallback : backtracking bipartite si pour une raison ou une autre la combi
// n'est pas trouvée (sécurité — ne devrait jamais arriver avec un classement
// valide). Le backtracking respecte les contraintes des seeds 3XXXXXX.
function assignThirdsToSlots(
  thirds: { teamId: string; group: GroupLetter }[],
): Record<number, string> | null {
  // --- Tentative 1 : tableau FIFA officiel ---
  if (thirds.length === 8) {
    const groups = thirds.map(t => t.group);
    const distinct = new Set(groups);
    if (distinct.size === 8) {
      const comboKey = [...groups].sort().join('');
      const mapping = FIFA_THIRD_PLACE_TABLE[comboKey];
      if (mapping) {
        // Index inverse : pour chaque slot FIFA, on cherche le 3e du groupe
        // attribué dans la liste de 3es.
        const thirdByGroup: Record<string, string> = {};
        for (const t of thirds) thirdByGroup[t.group] = t.teamId;

        const result: Record<number, string> = {};
        let ok = true;
        for (let i = 0; i < R32_THIRD_SLOTS_ORDER.length; i++) {
          const matchId = R32_THIRD_SLOTS_ORDER[i];
          const fifaSlot: SlotKey | undefined = MATCH_TO_FIFA_SLOT[matchId];
          if (!fifaSlot) { ok = false; break; }
          const groupLetter = mapping[fifaSlot];
          const teamId = thirdByGroup[groupLetter];
          if (!teamId) { ok = false; break; }
          result[i] = teamId;
        }
        if (ok) return result;
      }
    }
  }

  // --- Tentative 2 (fallback) : backtracking bipartite ---
  const allowed: Set<string>[] = R32_THIRD_SLOTS_ORDER.map(matchId => {
    const seedKey = getThirdSlotSeedKey(matchId);
    if (!seedKey) return new Set<string>();
    return new Set(seedKey.slice(1).split(''));
  });

  const result: Record<number, string> = {};
  const usedSlots = new Set<number>();

  function backtrack(thirdIdx: number): boolean {
    if (thirdIdx >= thirds.length) return true;
    const third = thirds[thirdIdx];
    for (let slotIdx = 0; slotIdx < R32_THIRD_SLOTS_ORDER.length; slotIdx++) {
      if (usedSlots.has(slotIdx)) continue;
      if (!allowed[slotIdx].has(third.group)) continue;
      usedSlots.add(slotIdx);
      result[slotIdx] = third.teamId;
      if (backtrack(thirdIdx + 1)) return true;
      usedSlots.delete(slotIdx);
      delete result[slotIdx];
    }
    return false;
  }

  return backtrack(0) ? result : null;
}

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

  // 8 meilleurs 3ᵉˢ assignés via matching bipartite : chaque slot `3XXXXXX`
  // ne reçoit qu'un 3ᵉ dont la lettre de groupe est listée (pour empêcher
  // qu'un 1ᵉʳ rencontre un 3ᵉ de son propre groupe en R32 ou en R16).
  const thirds = thirdPlacedRanking(standings).slice(0, 8);
  const assignment = assignThirdsToSlots(
    thirds.map(t => ({ teamId: t.teamId, group: t.group })),
  );
  R32_THIRD_SLOTS_ORDER.forEach((matchId, i) => {
    const seedKey = getThirdSlotSeedKey(matchId);
    if (!seedKey) return;
    const teamId = assignment ? assignment[i] : thirds[i]?.teamId;
    if (!teamId) return;
    seedToTeamId[seedKey] = teamId;
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
