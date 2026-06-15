// Résultats officiels figés des matchs déjà joués IRL.
// Au démarrage de l'app, ces scores sont appliqués au state (override
// du localStorage si nécessaire). La simulation et l'édition manuelle
// ne peuvent pas modifier ces matchs.
//
// Pour ajouter un nouveau match officiel : ajouter une entrée ci-dessous
// avec l'ID du match (visible dans data/groups.ts ou data/bracket.ts).

export interface OfficialResult {
  id: string;
  homeScore: number;
  awayScore: number;
  homePen?: number | null;
  awayPen?: number | null;
}

export const OFFICIAL_GROUP_RESULTS: OfficialResult[] = [
  { id: 'GA-1-12', homeScore: 2, awayScore: 0 }, // Mexique - Afrique du Sud (11/06)
  { id: 'GA-1-34', homeScore: 2, awayScore: 1 }, // Corée du Sud - Tchéquie (12/06)
  { id: 'GB-1-12', homeScore: 1, awayScore: 1 }, // Canada - Bosnie-Herzégovine (12/06)
  { id: 'GD-1-12', homeScore: 4, awayScore: 1 }, // États-Unis - Paraguay (13/06)
  { id: 'GB-1-34', homeScore: 1, awayScore: 1 }, // Qatar - Suisse (13/06)
  { id: 'GC-1-12', homeScore: 1, awayScore: 1 }, // Brésil - Maroc (13/06)
  { id: 'GC-1-34', homeScore: 0, awayScore: 1 }, // Haïti - Écosse (14/06) → Écosse 1-0
  { id: 'GD-1-34', homeScore: 2, awayScore: 0 }, // Australie - Turquie (14/06) → Australie 2-0
  { id: 'GE-1-12', homeScore: 7, awayScore: 1 }, // Allemagne - Curaçao (14/06) → Allemagne 7-1
  { id: 'GF-1-12', homeScore: 2, awayScore: 2 }, // Pays-Bas - Japon (14/06) → 2-2
  { id: 'GE-1-34', homeScore: 1, awayScore: 0 }, // Côte d'Ivoire - Équateur (15/06) → CIV 1-0
  { id: 'GF-1-34', homeScore: 5, awayScore: 1 }, // Suède - Tunisie (15/06) → Suède 5-1
  { id: 'GH-1-12', homeScore: 0, awayScore: 0 }, // Espagne - Cap-Vert (15/06) → 0-0
];

export const OFFICIAL_KO_RESULTS: OfficialResult[] = [];

const officialIds = new Set<string>([
  ...OFFICIAL_GROUP_RESULTS.map(r => r.id),
  ...OFFICIAL_KO_RESULTS.map(r => r.id),
]);

export function isOfficialMatch(id: string): boolean {
  return officialIds.has(id);
}

export function getOfficialGroupResult(id: string): OfficialResult | undefined {
  return OFFICIAL_GROUP_RESULTS.find(r => r.id === id);
}

export function getOfficialKoResult(id: string): OfficialResult | undefined {
  return OFFICIAL_KO_RESULTS.find(r => r.id === id);
}
