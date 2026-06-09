import type { KnockoutMatch } from '../types';

export interface BracketSlot {
  id: string;
  matchNumber: number;
  round: KnockoutMatch['round'];
  label: string;
  date: string;
  time: string;
  stadium: string;
  homeSeed: string;
  awaySeed: string;
}

// Dates, heures (Alger GMT+1) et stades — source : Dossier CdM 2026
// Pour les tours sans horaire dans le document (R16, QF, SF, 3e, Finale),
// horaires par défaut raisonnables.
export const BRACKET_SLOTS: BracketSlot[] = [
  // ===== Seizièmes (R32) — 28/06 → 04/07 =====
  { id: 'M73', matchNumber: 73, round: 'R32', label: 'M73', date: '28/06/2026', time: '20:00', stadium: 'la',  homeSeed: '2A', awaySeed: '2B' },
  { id: 'M76', matchNumber: 76, round: 'R32', label: 'M76', date: '29/06/2026', time: '18:00', stadium: 'hou', homeSeed: '1C', awaySeed: '2F' },
  { id: 'M74', matchNumber: 74, round: 'R32', label: 'M74', date: '29/06/2026', time: '21:30', stadium: 'bos', homeSeed: '1E', awaySeed: '3ABCDF' },
  { id: 'M75', matchNumber: 75, round: 'R32', label: 'M75', date: '30/06/2026', time: '02:00', stadium: 'mty', homeSeed: '1F', awaySeed: '2C' },
  { id: 'M78', matchNumber: 78, round: 'R32', label: 'M78', date: '30/06/2026', time: '18:00', stadium: 'dal', homeSeed: '2E', awaySeed: '2I' },
  { id: 'M77', matchNumber: 77, round: 'R32', label: 'M77', date: '30/06/2026', time: '22:00', stadium: 'nyc', homeSeed: '1I', awaySeed: '3CDFGH' },
  { id: 'M79', matchNumber: 79, round: 'R32', label: 'M79', date: '01/07/2026', time: '02:00', stadium: 'azt', homeSeed: '1A', awaySeed: '3CEFHI' },
  { id: 'M80', matchNumber: 80, round: 'R32', label: 'M80', date: '01/07/2026', time: '17:00', stadium: 'atl', homeSeed: '1L', awaySeed: '3EHIJK' },
  { id: 'M82', matchNumber: 82, round: 'R32', label: 'M82', date: '01/07/2026', time: '21:00', stadium: 'sea', homeSeed: '1G', awaySeed: '3AEHIJ' },
  { id: 'M81', matchNumber: 81, round: 'R32', label: 'M81', date: '02/07/2026', time: '01:00', stadium: 'sf',  homeSeed: '1D', awaySeed: '3BEFIJ' },
  { id: 'M84', matchNumber: 84, round: 'R32', label: 'M84', date: '02/07/2026', time: '20:00', stadium: 'la',  homeSeed: '1H', awaySeed: '2J' },
  { id: 'M83', matchNumber: 83, round: 'R32', label: 'M83', date: '03/07/2026', time: '00:00', stadium: 'tor', homeSeed: '2K', awaySeed: '2L' },
  { id: 'M85', matchNumber: 85, round: 'R32', label: 'M85', date: '03/07/2026', time: '04:00', stadium: 'van', homeSeed: '1B', awaySeed: '3EFGIJ' },
  { id: 'M88', matchNumber: 88, round: 'R32', label: 'M88', date: '03/07/2026', time: '19:00', stadium: 'dal', homeSeed: '2D', awaySeed: '2G' },
  { id: 'M86', matchNumber: 86, round: 'R32', label: 'M86', date: '03/07/2026', time: '23:00', stadium: 'mia', homeSeed: '1J', awaySeed: '2H' },
  { id: 'M87', matchNumber: 87, round: 'R32', label: 'M87', date: '04/07/2026', time: '02:30', stadium: 'kc',  homeSeed: '1K', awaySeed: '3DEIJL' },

  // ===== Huitièmes (R16) — 04/07 → 07/07 =====
  { id: 'M89', matchNumber: 89, round: 'R16', label: 'M89', date: '04/07/2026', time: '21:00', stadium: 'phi', homeSeed: 'W74', awaySeed: 'W77' },
  { id: 'M90', matchNumber: 90, round: 'R16', label: 'M90', date: '04/07/2026', time: '17:00', stadium: 'hou', homeSeed: 'W73', awaySeed: 'W75' },
  { id: 'M91', matchNumber: 91, round: 'R16', label: 'M91', date: '05/07/2026', time: '21:00', stadium: 'nyc', homeSeed: 'W76', awaySeed: 'W78' },
  { id: 'M92', matchNumber: 92, round: 'R16', label: 'M92', date: '05/07/2026', time: '02:00', stadium: 'azt', homeSeed: 'W79', awaySeed: 'W80' },
  { id: 'M93', matchNumber: 93, round: 'R16', label: 'M93', date: '06/07/2026', time: '21:00', stadium: 'dal', homeSeed: 'W83', awaySeed: 'W84' },
  { id: 'M94', matchNumber: 94, round: 'R16', label: 'M94', date: '06/07/2026', time: '04:00', stadium: 'sea', homeSeed: 'W81', awaySeed: 'W82' },
  { id: 'M95', matchNumber: 95, round: 'R16', label: 'M95', date: '07/07/2026', time: '20:00', stadium: 'atl', homeSeed: 'W86', awaySeed: 'W88' },
  { id: 'M96', matchNumber: 96, round: 'R16', label: 'M96', date: '07/07/2026', time: '04:00', stadium: 'van', homeSeed: 'W85', awaySeed: 'W87' },

  // ===== Quarts (QF) — 09/07 → 11/07 =====
  { id: 'M97', matchNumber: 97, round: 'QF', label: 'M97', date: '09/07/2026', time: '21:00', stadium: 'bos', homeSeed: 'W89', awaySeed: 'W90' },
  { id: 'M98', matchNumber: 98, round: 'QF', label: 'M98', date: '10/07/2026', time: '03:00', stadium: 'la',  homeSeed: 'W93', awaySeed: 'W94' },
  { id: 'M99', matchNumber: 99, round: 'QF', label: 'M99', date: '11/07/2026', time: '21:00', stadium: 'mia', homeSeed: 'W91', awaySeed: 'W92' },
  { id: 'M100', matchNumber: 100, round: 'QF', label: 'M100', date: '11/07/2026', time: '03:00', stadium: 'kc',  homeSeed: 'W95', awaySeed: 'W96' },

  // ===== Demi-finales (SF) — 14 & 15/07 =====
  { id: 'M101', matchNumber: 101, round: 'SF', label: 'M101', date: '14/07/2026', time: '21:00', stadium: 'dal', homeSeed: 'W97', awaySeed: 'W98' },
  { id: 'M102', matchNumber: 102, round: 'SF', label: 'M102', date: '15/07/2026', time: '21:00', stadium: 'atl', homeSeed: 'W99', awaySeed: 'W100' },

  // ===== 3ème place — 18/07 =====
  { id: 'M103', matchNumber: 103, round: 'THIRD', label: 'M103', date: '18/07/2026', time: '21:00', stadium: 'mia', homeSeed: 'RU101', awaySeed: 'RU102' },

  // ===== Finale — 19/07 =====
  { id: 'M104', matchNumber: 104, round: 'FINAL', label: 'M104', date: '19/07/2026', time: '21:00', stadium: 'nyc', homeSeed: 'W101', awaySeed: 'W102' },
];

export const R32_LEFT_IDS = ['M74','M77','M73','M75','M83','M84','M81','M82'];
export const R32_RIGHT_IDS = ['M76','M78','M79','M80','M86','M88','M85','M87'];
export const R16_LEFT_IDS = ['M89','M90','M93','M94'];
export const R16_RIGHT_IDS = ['M91','M92','M95','M96'];
export const QF_LEFT_IDS = ['M97','M98'];
export const QF_RIGHT_IDS = ['M99','M100'];

export function buildInitialBracket(): KnockoutMatch[] {
  return BRACKET_SLOTS.map(s => ({
    id: s.id,
    matchNumber: s.matchNumber,
    round: s.round,
    label: s.label,
    date: s.date,
    time: s.time,
    stadium: s.stadium,
    homeSeed: s.homeSeed,
    awaySeed: s.awaySeed,
    homeId: null,
    awayId: null,
    homeScore: null,
    awayScore: null,
    homePen: null,
    awayPen: null,
  }));
}
