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
  aet?: boolean; // remporté après prolongation (a.p.)
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
  { id: 'GG-1-12', homeScore: 1, awayScore: 1 }, // Belgique - Égypte (15/06) → 1-1
  { id: 'GH-1-34', homeScore: 1, awayScore: 1 }, // Arabie Saoudite - Uruguay (15/06) → 1-1
  { id: 'GG-1-34', homeScore: 2, awayScore: 2 }, // Iran - Nouvelle-Zélande (16/06) → 2-2
  { id: 'GI-1-12', homeScore: 3, awayScore: 1 }, // France - Sénégal (16/06) → 3-1
  { id: 'GI-1-34', homeScore: 1, awayScore: 4 }, // Irak - Norvège (16/06) → 1-4
  { id: 'GJ-1-12', homeScore: 3, awayScore: 0 }, // Argentine - Algérie (17/06) → 3-0
  { id: 'GJ-1-34', homeScore: 3, awayScore: 1 }, // Autriche - Jordanie (17/06) → 3-1
  { id: 'GK-1-12', homeScore: 1, awayScore: 1 }, // Portugal - RD Congo (17/06) → 1-1
  { id: 'GL-1-12', homeScore: 4, awayScore: 2 }, // Angleterre - Croatie (17/06) → 4-2
  { id: 'GL-1-34', homeScore: 1, awayScore: 0 }, // Ghana - Panama (18/06) → 1-0
  { id: 'GK-1-34', homeScore: 1, awayScore: 3 }, // Ouzbékistan - Colombie (18/06) → 1-3
  // ─── Journée 2 ───
  { id: 'GA-2-42', homeScore: 1, awayScore: 1 }, // M25 Tchéquie - Afrique du Sud (18/06) → 1-1
  { id: 'GB-2-42', homeScore: 4, awayScore: 1 }, // M26 Suisse - Bosnie-Herzégovine (18/06) → Suisse 4-1
  { id: 'GB-2-13', homeScore: 6, awayScore: 0 }, // M27 Canada - Qatar (18/06) → Canada 6-0
  { id: 'GA-2-13', homeScore: 1, awayScore: 0 }, // M28 Mexique - Corée du Sud (19/06) → Mexique 1-0
  { id: 'GD-2-13', homeScore: 2, awayScore: 0 }, // M29 États-Unis - Australie (19/06) → USA 2-0
  { id: 'GC-2-42', homeScore: 0, awayScore: 1 }, // M30 Écosse - Maroc (19/06) → Maroc 1-0
  { id: 'GC-2-13', homeScore: 3, awayScore: 0 }, // M31 Brésil - Haïti (20/06) → Brésil 3-0
  { id: 'GD-2-42', homeScore: 0, awayScore: 1 }, // M32 Turquie - Paraguay (20/06) → Paraguay 1-0
  { id: 'GF-2-13', homeScore: 5, awayScore: 1 }, // M33 Pays-Bas - Suède (20/06) → Pays-Bas 5-1
  { id: 'GE-2-13', homeScore: 2, awayScore: 1 }, // M34 Allemagne - Côte d'Ivoire (20/06) → Allemagne 2-1
  { id: 'GE-2-42', homeScore: 0, awayScore: 0 }, // M35 Équateur - Curaçao (21/06) → 0-0
  { id: 'GF-2-42', homeScore: 0, awayScore: 4 }, // M36 Tunisie - Japon (21/06) → Japon 4-0
  { id: 'GH-2-13', homeScore: 4, awayScore: 0 }, // M37 Espagne - Arabie Saoudite (21/06) → Espagne 4-0
  { id: 'GG-2-13', homeScore: 0, awayScore: 0 }, // M38 Belgique - Iran (21/06) → 0-0
  { id: 'GH-2-42', homeScore: 2, awayScore: 2 }, // M39 Uruguay - Cap-Vert (21/06) → 2-2
  { id: 'GG-2-42', homeScore: 1, awayScore: 3 }, // M40 Nouvelle-Zélande - Égypte (22/06) → Égypte 3-1
  { id: 'GJ-2-13', homeScore: 2, awayScore: 0 }, // M41 Argentine - Autriche (22/06) → Argentine 2-0
  { id: 'GI-2-13', homeScore: 3, awayScore: 0 }, // M42 France - Irak (22/06) → France 3-0
  { id: 'GI-2-42', homeScore: 3, awayScore: 2 }, // M43 Norvège - Sénégal (23/06) → Norvège 3-2
  { id: 'GJ-2-42', homeScore: 1, awayScore: 2 }, // M44 Jordanie - Algérie (23/06) → Algérie 2-1
  { id: 'GK-2-13', homeScore: 5, awayScore: 0 }, // M45 Portugal - Ouzbékistan (23/06) → Portugal 5-0
  { id: 'GL-2-13', homeScore: 0, awayScore: 0 }, // M46 Angleterre - Ghana (23/06) → 0-0
  { id: 'GL-2-42', homeScore: 0, awayScore: 1 }, // M47 Panama - Croatie (24/06) → Croatie 1-0
  { id: 'GK-2-42', homeScore: 1, awayScore: 0 }, // M48 Colombie - RD Congo (24/06) → Colombie 1-0
  // ─── Journée 3 ───
  { id: 'GB-3-41', homeScore: 2, awayScore: 1 }, // M49 Suisse - Canada (24/06) → Suisse 2-1
  { id: 'GB-3-23', homeScore: 3, awayScore: 1 }, // M50 Bosnie-Herzégovine - Qatar (24/06) → Bosnie 3-1
  { id: 'GC-3-41', homeScore: 0, awayScore: 3 }, // M51 Écosse - Brésil (24/06) → Brésil 3-0
  { id: 'GC-3-23', homeScore: 4, awayScore: 2 }, // M52 Maroc - Haïti (24/06) → Maroc 4-2
  { id: 'GA-3-41', homeScore: 0, awayScore: 3 }, // M53 Tchéquie - Mexique (25/06) → Mexique 3-0
  { id: 'GA-3-23', homeScore: 1, awayScore: 0 }, // M54 Afrique du Sud - Corée du Sud (25/06) → Afrique du Sud 1-0
  { id: 'GE-3-41', homeScore: 2, awayScore: 1 }, // M55 Équateur - Allemagne (25/06) → Équateur 2-1
  { id: 'GE-3-23', homeScore: 0, awayScore: 2 }, // M56 Curaçao - Côte d'Ivoire (25/06) → Côte d'Ivoire 2-0
  { id: 'GF-3-23', homeScore: 1, awayScore: 1 }, // M57 Japon - Suède (26/06) → 1-1
  { id: 'GF-3-41', homeScore: 1, awayScore: 3 }, // M58 Tunisie - Pays-Bas (26/06) → Pays-Bas 3-1
  { id: 'GD-3-41', homeScore: 3, awayScore: 2 }, // M59 Turquie - États-Unis (26/06) → Turquie 3-2
  { id: 'GD-3-23', homeScore: 0, awayScore: 0 }, // M60 Paraguay - Australie (26/06) → 0-0
  { id: 'GI-3-41', homeScore: 1, awayScore: 4 }, // M61 Norvège - France (26/06) → France 4-1
  { id: 'GI-3-23', homeScore: 5, awayScore: 0 }, // M62 Sénégal - Irak (26/06) → Sénégal 5-0
  { id: 'GH-3-23', homeScore: 0, awayScore: 0 }, // M63 Cap-Vert - Arabie Saoudite (27/06) → 0-0
  { id: 'GH-3-41', homeScore: 0, awayScore: 1 }, // M64 Uruguay - Espagne (27/06) → Espagne 1-0
  { id: 'GG-3-23', homeScore: 1, awayScore: 1 }, // M65 Égypte - Iran (27/06) → 1-1
  { id: 'GG-3-41', homeScore: 1, awayScore: 5 }, // M66 Nouvelle-Zélande - Belgique (27/06) → Belgique 5-1
  { id: 'GL-3-41', homeScore: 0, awayScore: 2 }, // M67 Panama - Angleterre (27/06) → Angleterre 2-0
  { id: 'GL-3-23', homeScore: 2, awayScore: 1 }, // M68 Croatie - Ghana (27/06) → Croatie 2-1
  { id: 'GK-3-41', homeScore: 0, awayScore: 0 }, // M69 Colombie - Portugal (28/06) → 0-0
  { id: 'GK-3-23', homeScore: 3, awayScore: 1 }, // M70 RD Congo - Ouzbékistan (28/06) → RD Congo 3-1
  { id: 'GJ-3-23', homeScore: 3, awayScore: 3 }, // M71 Algérie - Autriche (28/06) → 3-3
  { id: 'GJ-3-41', homeScore: 1, awayScore: 3 }, // M72 Jordanie - Argentine (28/06) → Argentine 3-1
];

export const OFFICIAL_KO_RESULTS: OfficialResult[] = [
  // ─── Seizièmes (R32) ───
  { id: 'M73', homeScore: 0, awayScore: 1 }, // Afrique du Sud (2A) - Canada (2B) (28/06) → Canada 1-0
  { id: 'M74', homeScore: 2, awayScore: 1 }, // Brésil (1C) - Japon (2F) (29/06) → Brésil 2-1
  { id: 'M75', homeScore: 1, awayScore: 1, homePen: 3, awayPen: 4 }, // Allemagne (1E) - Paraguay (3ABCDF) (29/06) → 1-1, Paraguay 4-3 TAB
  { id: 'M76', homeScore: 1, awayScore: 1, homePen: 2, awayPen: 3 }, // Pays-Bas (1F) - Maroc (2C) (30/06) → 1-1, Maroc 3-2 TAB
  { id: 'M77', homeScore: 1, awayScore: 2 }, // Côte d'Ivoire (2E) - Norvège (2I) (30/06) → Norvège 2-1
  { id: 'M78', homeScore: 3, awayScore: 0 }, // France (1I) - Suède (3CDFGH) (30/06) → France 3-0
];

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
