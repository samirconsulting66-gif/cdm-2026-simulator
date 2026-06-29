export type Confederation = 'AFC' | 'CAF' | 'CONCACAF' | 'CONMEBOL' | 'OFC' | 'UEFA';

export type GroupLetter =
  | 'A' | 'B' | 'C' | 'D' | 'E' | 'F'
  | 'G' | 'H' | 'I' | 'J' | 'K' | 'L';

export interface Team {
  id: string;
  code: string;
  name: string;
  confederation: Confederation;
  group: GroupLetter;
  groupPosition: 1 | 2 | 3 | 4;
  fifaRank: number;
  fifaPoints?: number;
  force: number;
  participations: number;
  isHost?: boolean;
  color: string;
  textColor: 'white' | 'black';
}

export interface GroupMatch {
  id: string;
  matchNumber: number;
  group: GroupLetter;
  matchday: 1 | 2 | 3;
  homeId: string;
  awayId: string;
  date: string;
  time: string;
  stadium: string;
  homeScore: number | null;
  awayScore: number | null;
}

export interface KnockoutMatch {
  id: string;
  matchNumber: number;
  round: 'R32' | 'R16' | 'QF' | 'SF' | 'FINAL' | 'THIRD';
  label: string;
  date: string;
  time: string;
  stadium: string;
  homeSeed: string;
  awaySeed: string;
  homeId: string | null;
  awayId: string | null;
  homeScore: number | null;
  awayScore: number | null;
  homePen: number | null;
  awayPen: number | null;
  aet: boolean; // remporté après prolongation (a.p.)
}

export interface Standing {
  teamId: string;
  group: GroupLetter;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  gf: number;
  ga: number;
  gd: number;
  points: number;
  rank: number;
}
