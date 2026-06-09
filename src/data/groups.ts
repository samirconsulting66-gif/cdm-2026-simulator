import type { GroupLetter, GroupMatch, Team } from '../types';
import { TEAMS } from './teams';

export const GROUP_LETTERS: GroupLetter[] = ['A','B','C','D','E','F','G','H','I','J','K','L'];

// Ordre intra-groupe : position de tirage officielle (1 → 4)
export function teamsInGroup(letter: GroupLetter): Team[] {
  return TEAMS.filter(t => t.group === letter).sort(
    (a, b) => a.groupPosition - b.groupPosition,
  );
}

// Calendrier officiel — source : Dossier CdM 2026
// Heures stockées en Alger (GMT+1), comme le document source
interface RawFixture {
  group: GroupLetter;
  matchday: 1 | 2 | 3;
  homePos: 1 | 2 | 3 | 4;
  awayPos: 1 | 2 | 3 | 4;
  date: string;
  time: string;
  stadium: string;
}

const RAW_FIXTURES: RawFixture[] = [
  // ===== Journée 1 =====
  { group: 'A', matchday: 1, homePos: 1, awayPos: 2, date: '11/06/2026', time: '20:00', stadium: 'azt' },
  { group: 'A', matchday: 1, homePos: 3, awayPos: 4, date: '12/06/2026', time: '03:00', stadium: 'gdl' },
  { group: 'B', matchday: 1, homePos: 1, awayPos: 2, date: '12/06/2026', time: '20:00', stadium: 'tor' },
  { group: 'D', matchday: 1, homePos: 1, awayPos: 2, date: '13/06/2026', time: '02:00', stadium: 'la'  },
  { group: 'B', matchday: 1, homePos: 3, awayPos: 4, date: '13/06/2026', time: '20:00', stadium: 'sf'  },
  { group: 'C', matchday: 1, homePos: 1, awayPos: 2, date: '13/06/2026', time: '23:00', stadium: 'nyc' },
  { group: 'C', matchday: 1, homePos: 3, awayPos: 4, date: '14/06/2026', time: '02:00', stadium: 'bos' },
  { group: 'D', matchday: 1, homePos: 3, awayPos: 4, date: '14/06/2026', time: '02:00', stadium: 'van' },
  { group: 'E', matchday: 1, homePos: 1, awayPos: 2, date: '14/06/2026', time: '18:00', stadium: 'hou' },
  { group: 'F', matchday: 1, homePos: 1, awayPos: 2, date: '14/06/2026', time: '21:00', stadium: 'dal' },
  { group: 'E', matchday: 1, homePos: 3, awayPos: 4, date: '15/06/2026', time: '00:00', stadium: 'phi' },
  { group: 'F', matchday: 1, homePos: 3, awayPos: 4, date: '15/06/2026', time: '03:00', stadium: 'mty' },
  { group: 'H', matchday: 1, homePos: 1, awayPos: 2, date: '15/06/2026', time: '17:00', stadium: 'atl' },
  { group: 'G', matchday: 1, homePos: 1, awayPos: 2, date: '15/06/2026', time: '20:00', stadium: 'van' },
  { group: 'H', matchday: 1, homePos: 3, awayPos: 4, date: '15/06/2026', time: '23:00', stadium: 'mia' },
  { group: 'G', matchday: 1, homePos: 3, awayPos: 4, date: '16/06/2026', time: '02:00', stadium: 'la'  },
  { group: 'I', matchday: 1, homePos: 1, awayPos: 2, date: '16/06/2026', time: '20:00', stadium: 'nyc' },
  { group: 'I', matchday: 1, homePos: 3, awayPos: 4, date: '16/06/2026', time: '23:00', stadium: 'bos' },
  { group: 'J', matchday: 1, homePos: 1, awayPos: 2, date: '17/06/2026', time: '02:00', stadium: 'kc'  },
  { group: 'J', matchday: 1, homePos: 3, awayPos: 4, date: '17/06/2026', time: '05:00', stadium: 'sf'  },
  { group: 'K', matchday: 1, homePos: 1, awayPos: 2, date: '17/06/2026', time: '18:00', stadium: 'hou' },
  { group: 'L', matchday: 1, homePos: 1, awayPos: 2, date: '17/06/2026', time: '21:00', stadium: 'dal' },
  { group: 'L', matchday: 1, homePos: 3, awayPos: 4, date: '18/06/2026', time: '00:00', stadium: 'tor' },
  { group: 'K', matchday: 1, homePos: 3, awayPos: 4, date: '18/06/2026', time: '03:00', stadium: 'azt' },

  // ===== Journée 2 =====
  { group: 'A', matchday: 2, homePos: 4, awayPos: 2, date: '18/06/2026', time: '17:00', stadium: 'atl' },
  { group: 'B', matchday: 2, homePos: 4, awayPos: 2, date: '18/06/2026', time: '20:00', stadium: 'la'  },
  { group: 'B', matchday: 2, homePos: 1, awayPos: 3, date: '18/06/2026', time: '23:00', stadium: 'van' },
  { group: 'A', matchday: 2, homePos: 1, awayPos: 3, date: '19/06/2026', time: '02:00', stadium: 'gdl' },
  { group: 'D', matchday: 2, homePos: 1, awayPos: 3, date: '19/06/2026', time: '20:00', stadium: 'sea' },
  { group: 'C', matchday: 2, homePos: 4, awayPos: 2, date: '19/06/2026', time: '23:00', stadium: 'bos' },
  { group: 'C', matchday: 2, homePos: 1, awayPos: 3, date: '20/06/2026', time: '02:00', stadium: 'phi' },
  { group: 'D', matchday: 2, homePos: 4, awayPos: 2, date: '20/06/2026', time: '05:00', stadium: 'sf'  },
  { group: 'F', matchday: 2, homePos: 1, awayPos: 3, date: '20/06/2026', time: '18:00', stadium: 'hou' },
  { group: 'E', matchday: 2, homePos: 1, awayPos: 3, date: '20/06/2026', time: '21:00', stadium: 'tor' },
  { group: 'E', matchday: 2, homePos: 4, awayPos: 2, date: '21/06/2026', time: '01:00', stadium: 'kc'  },
  { group: 'F', matchday: 2, homePos: 4, awayPos: 2, date: '21/06/2026', time: '05:00', stadium: 'mty' },
  { group: 'H', matchday: 2, homePos: 1, awayPos: 3, date: '21/06/2026', time: '17:00', stadium: 'atl' },
  { group: 'G', matchday: 2, homePos: 1, awayPos: 3, date: '21/06/2026', time: '20:00', stadium: 'la'  },
  { group: 'H', matchday: 2, homePos: 4, awayPos: 2, date: '21/06/2026', time: '23:00', stadium: 'mia' },
  { group: 'G', matchday: 2, homePos: 4, awayPos: 2, date: '22/06/2026', time: '02:00', stadium: 'van' },
  { group: 'J', matchday: 2, homePos: 1, awayPos: 3, date: '22/06/2026', time: '18:00', stadium: 'dal' },
  { group: 'I', matchday: 2, homePos: 1, awayPos: 3, date: '22/06/2026', time: '22:00', stadium: 'phi' },
  { group: 'I', matchday: 2, homePos: 4, awayPos: 2, date: '23/06/2026', time: '01:00', stadium: 'nyc' },
  { group: 'J', matchday: 2, homePos: 4, awayPos: 2, date: '23/06/2026', time: '04:00', stadium: 'sf'  },
  { group: 'K', matchday: 2, homePos: 1, awayPos: 3, date: '23/06/2026', time: '18:00', stadium: 'hou' },
  { group: 'L', matchday: 2, homePos: 1, awayPos: 3, date: '23/06/2026', time: '21:00', stadium: 'bos' },
  { group: 'L', matchday: 2, homePos: 4, awayPos: 2, date: '24/06/2026', time: '00:00', stadium: 'tor' },
  { group: 'K', matchday: 2, homePos: 4, awayPos: 2, date: '24/06/2026', time: '03:00', stadium: 'gdl' },

  // ===== Journée 3 (matchs simultanés par groupe) =====
  { group: 'B', matchday: 3, homePos: 4, awayPos: 1, date: '24/06/2026', time: '20:00', stadium: 'van' },
  { group: 'B', matchday: 3, homePos: 2, awayPos: 3, date: '24/06/2026', time: '20:00', stadium: 'sea' },
  { group: 'C', matchday: 3, homePos: 4, awayPos: 1, date: '24/06/2026', time: '23:00', stadium: 'mia' },
  { group: 'C', matchday: 3, homePos: 2, awayPos: 3, date: '24/06/2026', time: '23:00', stadium: 'atl' },
  { group: 'A', matchday: 3, homePos: 4, awayPos: 1, date: '25/06/2026', time: '02:00', stadium: 'azt' },
  { group: 'A', matchday: 3, homePos: 2, awayPos: 3, date: '25/06/2026', time: '02:00', stadium: 'mty' },
  { group: 'E', matchday: 3, homePos: 4, awayPos: 1, date: '25/06/2026', time: '21:00', stadium: 'nyc' },
  { group: 'E', matchday: 3, homePos: 2, awayPos: 3, date: '25/06/2026', time: '21:00', stadium: 'phi' },
  { group: 'F', matchday: 3, homePos: 2, awayPos: 3, date: '26/06/2026', time: '00:00', stadium: 'dal' },
  { group: 'F', matchday: 3, homePos: 4, awayPos: 1, date: '26/06/2026', time: '00:00', stadium: 'kc'  },
  { group: 'D', matchday: 3, homePos: 4, awayPos: 1, date: '26/06/2026', time: '03:00', stadium: 'la'  },
  { group: 'D', matchday: 3, homePos: 2, awayPos: 3, date: '26/06/2026', time: '03:00', stadium: 'sf'  },
  { group: 'I', matchday: 3, homePos: 4, awayPos: 1, date: '26/06/2026', time: '20:00', stadium: 'bos' },
  { group: 'I', matchday: 3, homePos: 2, awayPos: 3, date: '26/06/2026', time: '20:00', stadium: 'tor' },
  { group: 'H', matchday: 3, homePos: 2, awayPos: 3, date: '27/06/2026', time: '01:00', stadium: 'hou' },
  { group: 'H', matchday: 3, homePos: 4, awayPos: 1, date: '27/06/2026', time: '01:00', stadium: 'gdl' },
  { group: 'G', matchday: 3, homePos: 2, awayPos: 3, date: '27/06/2026', time: '04:00', stadium: 'sea' },
  { group: 'G', matchday: 3, homePos: 4, awayPos: 1, date: '27/06/2026', time: '04:00', stadium: 'van' },
  { group: 'L', matchday: 3, homePos: 4, awayPos: 1, date: '27/06/2026', time: '22:00', stadium: 'nyc' },
  { group: 'L', matchday: 3, homePos: 2, awayPos: 3, date: '27/06/2026', time: '22:00', stadium: 'phi' },
  { group: 'K', matchday: 3, homePos: 4, awayPos: 1, date: '28/06/2026', time: '00:30', stadium: 'mia' },
  { group: 'K', matchday: 3, homePos: 2, awayPos: 3, date: '28/06/2026', time: '00:30', stadium: 'atl' },
  { group: 'J', matchday: 3, homePos: 2, awayPos: 3, date: '28/06/2026', time: '03:00', stadium: 'kc'  },
  { group: 'J', matchday: 3, homePos: 4, awayPos: 1, date: '28/06/2026', time: '03:00', stadium: 'dal' },
];

function parseDate(s: string): number {
  const [d, m, y] = s.split('/').map(n => parseInt(n, 10));
  return Date.UTC(y, m - 1, d);
}
function parseTime(s: string): number {
  const [hh, mm] = s.split(':').map(n => parseInt(n, 10));
  return hh * 60 + mm;
}

function teamIdByPos(letter: GroupLetter, pos: 1 | 2 | 3 | 4): string {
  const teams = teamsInGroup(letter);
  return teams[pos - 1].id;
}

export function buildInitialGroupMatches(): GroupMatch[] {
  const sorted = [...RAW_FIXTURES].sort((a, b) => {
    const dA = parseDate(a.date);
    const dB = parseDate(b.date);
    if (dA !== dB) return dA - dB;
    const tA = parseTime(a.time);
    const tB = parseTime(b.time);
    if (tA !== tB) return tA - tB;
    if (a.group !== b.group) return a.group < b.group ? -1 : 1;
    return a.matchday - b.matchday;
  });

  return sorted.map((f, i) => ({
    id: `G${f.group}-${f.matchday}-${f.homePos}${f.awayPos}`,
    matchNumber: i + 1,
    group: f.group,
    matchday: f.matchday,
    homeId: teamIdByPos(f.group, f.homePos),
    awayId: teamIdByPos(f.group, f.awayPos),
    date: f.date,
    time: f.time,
    stadium: f.stadium,
    homeScore: null,
    awayScore: null,
  }));
}
