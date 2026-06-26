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
    const ranked = rankGroup(arr, groupMatches, forceOverrides);
    ranked.forEach((s, i) => { s.rank = i + 1; });
    result[letter] = ranked;
  }

  return result as Record<GroupLetter, Standing[]>;
}

// Classement d'un groupe — règlement FIFA Coupe du Monde 2026.
// À égalité de points, la CONFRONTATION DIRECTE prime sur les critères
// généraux (changement majeur vs éditions précédentes). Ordre officiel :
//   1. points dans les matchs entre les équipes à égalité
//   2. différence de buts entre les équipes à égalité
//   3. buts marqués entre les équipes à égalité
//   4. différence de buts générale
//   5. buts marqués généraux
//   6. fair-play (cartons — non suivi ici)
//   7. classement FIFA (approximé par la Force)
function rankGroup(
  teams: Standing[],
  matches: GroupMatch[],
  forceOverrides: Record<string, number>,
): Standing[] {
  const byPoints = [...teams].sort((a, b) => b.points - a.points);
  const out: Standing[] = [];
  let i = 0;
  while (i < byPoints.length) {
    let j = i + 1;
    while (j < byPoints.length && byPoints[j].points === byPoints[i].points) j++;
    const tied = byPoints.slice(i, j);
    out.push(...(tied.length > 1 ? breakTie(tied, matches, forceOverrides) : tied));
    i = j;
  }
  return out;
}

type MiniRow = { pts: number; gd: number; gf: number };

// Mini-championnat ne comptant que les matchs entre les équipes concernées.
function miniTable(teams: Standing[], matches: GroupMatch[]): Map<string, MiniRow> {
  const ids = new Set(teams.map(t => t.teamId));
  const m = new Map<string, MiniRow>();
  for (const t of teams) m.set(t.teamId, { pts: 0, gd: 0, gf: 0 });
  for (const g of matches) {
    if (g.homeScore === null || g.awayScore === null) continue;
    if (!ids.has(g.homeId) || !ids.has(g.awayId)) continue;
    const h = m.get(g.homeId)!;
    const a = m.get(g.awayId)!;
    h.gf += g.homeScore; a.gf += g.awayScore;
    h.gd += g.homeScore - g.awayScore;
    a.gd += g.awayScore - g.homeScore;
    if (g.homeScore > g.awayScore) h.pts += 3;
    else if (g.homeScore < g.awayScore) a.pts += 3;
    else { h.pts++; a.pts++; }
  }
  return m;
}

// Critères généraux (4 → 7), utilisés quand la confrontation directe ne sépare pas.
function overallComparator(forceOverrides: Record<string, number>) {
  const forceOf = (id: string) =>
    forceOverrides[id] ?? TEAMS_BY_ID[id]?.force ?? 0;
  return (a: Standing, b: Standing): number => {
    if (b.gd !== a.gd) return b.gd - a.gd;
    if (b.gf !== a.gf) return b.gf - a.gf;
    return forceOf(b.teamId) - forceOf(a.teamId);
  };
}

// Départage un paquet d'équipes à égalité de points.
// Récursif : si la confrontation directe sépare le paquet en sous-groupes
// encore à égalité, on la ré-applique au sous-groupe (conforme au règlement).
function breakTie(
  tied: Standing[],
  matches: GroupMatch[],
  forceOverrides: Record<string, number>,
): Standing[] {
  const mini = miniTable(tied, matches);
  const sorted = [...tied].sort((a, b) => {
    const ma = mini.get(a.teamId)!;
    const mb = mini.get(b.teamId)!;
    if (mb.pts !== ma.pts) return mb.pts - ma.pts;
    if (mb.gd !== ma.gd) return mb.gd - ma.gd;
    if (mb.gf !== ma.gf) return mb.gf - ma.gf;
    return 0;
  });

  const out: Standing[] = [];
  let i = 0;
  while (i < sorted.length) {
    const mi = mini.get(sorted[i].teamId)!;
    let j = i + 1;
    while (j < sorted.length) {
      const mj = mini.get(sorted[j].teamId)!;
      if (mj.pts === mi.pts && mj.gd === mi.gd && mj.gf === mi.gf) j++;
      else break;
    }
    const run = sorted.slice(i, j);
    if (run.length === 1) {
      out.push(run[0]);
    } else if (run.length === tied.length) {
      // la confrontation directe n'a départagé personne → critères généraux
      out.push(...[...run].sort(overallComparator(forceOverrides)));
    } else {
      // sous-groupe encore à égalité → ré-application de la confrontation directe
      out.push(...breakTie(run, matches, forceOverrides));
    }
    i = j;
  }
  return out;
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
