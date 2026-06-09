import type { GroupLetter, GroupMatch, Standing } from '../types';
import { TEAMS_BY_ID } from '../data/teams';
import { GROUP_LETTERS, teamsInGroup } from '../data/groups';

export function emptyStanding(teamId: string, group: GroupLetter): Standing {
  return {
    teamId,
    group,
    played: 0, won: 0, drawn: 0, lost: 0,
    gf: 0, ga: 0, gd: 0, points: 0,
    rank: 0,
  };
}

export function computeStandings(
  matches: GroupMatch[],
  forceOverrides: Record<string, number> = {},
): Record<GroupLetter, Standing[]> {
  const result: Record<string, Standing[]> = {};

  for (const letter of GROUP_LETTERS) {
    const standings = new Map<string, Standing>();
    for (const t of teamsInGroup(letter)) {
      standings.set(t.id, emptyStanding(t.id, letter));
    }

    const groupMatches = matches.filter(m => m.group === letter);
    for (const m of groupMatches) {
      if (m.homeScore === null || m.awayScore === null) continue;
      const h = standings.get(m.homeId);
      const a = standings.get(m.awayId);
      if (!h || !a) continue;
      h.played++; a.played++;
      h.gf += m.homeScore; h.ga += m.awayScore;
      a.gf += m.awayScore; a.ga += m.homeScore;
      if (m.homeScore > m.awayScore) {
        h.won++; a.lost++; h.points += 3;
      } else if (m.homeScore < m.awayScore) {
        a.won++; h.lost++; a.points += 3;
      } else {
        h.drawn++; a.drawn++; h.points++; a.points++;
      }
    }

    const arr = Array.from(standings.values()).map(s => ({
      ...s,
      gd: s.gf - s.ga,
    }));
    const cmp = makeComparator(forceOverrides);
    arr.sort(cmp);
    arr.forEach((s, i) => { s.rank = i + 1; });
    result[letter] = arr;
  }

  return result as Record<GroupLetter, Standing[]>;
}

function makeComparator(forceOverrides: Record<string, number>) {
  const forceOf = (id: string) =>
    forceOverrides[id] ?? TEAMS_BY_ID[id]?.force ?? 0;
  return (a: Standing, b: Standing): number => {
    if (b.points !== a.points) return b.points - a.points;
    if (b.gd !== a.gd) return b.gd - a.gd;
    if (b.gf !== a.gf) return b.gf - a.gf;
    return forceOf(b.teamId) - forceOf(a.teamId);
  };
}

export function compareStandings(a: Standing, b: Standing): number {
  if (b.points !== a.points) return b.points - a.points;
  if (b.gd !== a.gd) return b.gd - a.gd;
  if (b.gf !== a.gf) return b.gf - a.gf;
  const fa = TEAMS_BY_ID[a.teamId]?.force ?? 0;
  const fb = TEAMS_BY_ID[b.teamId]?.force ?? 0;
  return fb - fa;
}

export function isGroupComplete(
  matches: GroupMatch[],
  letter: GroupLetter,
): boolean {
  const groupMatches = matches.filter(m => m.group === letter);
  return groupMatches.length === 6
    && groupMatches.every(m => m.homeScore !== null && m.awayScore !== null);
}

export function areAllGroupsComplete(matches: GroupMatch[]): boolean {
  return GROUP_LETTERS.every(l => isGroupComplete(matches, l));
}

export function groupStageProgress(matches: GroupMatch[]): {
  played: number;
  total: number;
  groupsComplete: number;
  matchdaysComplete: 0 | 1 | 2 | 3;
} {
  const total = matches.length;
  const played = matches.filter(m => m.homeScore !== null && m.awayScore !== null).length;
  const groupsComplete = GROUP_LETTERS.filter(l => isGroupComplete(matches, l)).length;

  let matchdaysComplete: 0 | 1 | 2 | 3 = 0;
  for (const md of [1, 2, 3] as const) {
    const mdMatches = matches.filter(m => m.matchday === md);
    if (mdMatches.length > 0 && mdMatches.every(m => m.homeScore !== null && m.awayScore !== null)) {
      matchdaysComplete = md;
    } else {
      break;
    }
  }

  return { played, total, groupsComplete, matchdaysComplete };
}

export function thirdPlacedRanking(
  standings: Record<GroupLetter, Standing[]>,
): Standing[] {
  const thirds: Standing[] = [];
  for (const letter of GROUP_LETTERS) {
    const s = standings[letter];
    if (s && s[2]) thirds.push(s[2]);
  }
  thirds.sort(compareStandings);
  return thirds;
}
