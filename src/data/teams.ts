import type { Team } from '../types';

// Force et position dans le groupe = source officielle (Dossier CdM 2026)
// fifaRank / fifaPoints : top 20 = Wikipedia avril 2026 ; reste = FIFA API sept. 2025
export const TEAMS: Team[] = [
  // ============ GROUPE A ============
  { id: 'mx',     code: 'mx',     name: 'Mexique',             confederation: 'CONCACAF', group: 'A', groupPosition: 1, fifaRank: 15, fifaPoints: 1681.03, force: 70, participations: 17, isHost: true,  color: '#0d6e3b', textColor: 'white' },
  { id: 'za',     code: 'za',     name: 'Afrique du Sud',      confederation: 'CAF',      group: 'A', groupPosition: 2, fifaRank: 55, fifaPoints: 1448.67, force: 58, participations: 3,                  color: '#e8b80c', textColor: 'black' },
  { id: 'kr',     code: 'kr',     name: 'Corée du Sud',        confederation: 'AFC',      group: 'A', groupPosition: 3, fifaRank: 23, fifaPoints: 1593.19, force: 68, participations: 10,                 color: '#d8232a', textColor: 'white' },
  { id: 'cz',     code: 'cz',     name: 'Tchéquie',            confederation: 'UEFA',     group: 'A', groupPosition: 4, fifaRank: 39, fifaPoints: 1500.29, force: 66, participations: 9,                  color: '#d8232a', textColor: 'white' },

  // ============ GROUPE B ============
  { id: 'ca',     code: 'ca',     name: 'Canada',              confederation: 'CONCACAF', group: 'B', groupPosition: 1, fifaRank: 26, fifaPoints: 1558.04, force: 67, participations: 2,  isHost: true,  color: '#d8232a', textColor: 'white' },
  { id: 'ba',     code: 'ba',     name: 'Bosnie-Herzégovine',  confederation: 'UEFA',     group: 'B', groupPosition: 2, fifaRank: 73, fifaPoints: 1344.25, force: 63, participations: 1,                  color: '#1d3a8a', textColor: 'white' },
  { id: 'qa',     code: 'qa',     name: 'Qatar',               confederation: 'AFC',      group: 'B', groupPosition: 3, fifaRank: 53, fifaPoints: 1453.65, force: 55, participations: 1,                  color: '#7c1a3d', textColor: 'white' },
  { id: 'ch',     code: 'ch',     name: 'Suisse',              confederation: 'UEFA',     group: 'B', groupPosition: 4, fifaRank: 19, fifaPoints: 1649.40, force: 76, participations: 12,                 color: '#d8232a', textColor: 'white' },

  // ============ GROUPE C ============
  { id: 'br',     code: 'br',     name: 'Brésil',              confederation: 'CONMEBOL', group: 'C', groupPosition: 1, fifaRank: 6,  fifaPoints: 1761.16, force: 90, participations: 22,                 color: '#f2c200', textColor: 'black' },
  { id: 'ma',     code: 'ma',     name: 'Maroc',               confederation: 'CAF',      group: 'C', groupPosition: 2, fifaRank: 8,  fifaPoints: 1755.87, force: 78, participations: 6,                  color: '#c1272d', textColor: 'white' },
  { id: 'ht',     code: 'ht',     name: 'Haïti',               confederation: 'CONCACAF', group: 'C', groupPosition: 3, fifaRank: 87, fifaPoints: 1269.24, force: 48, participations: 1,                  color: '#1a3a78', textColor: 'white' },
  { id: 'gb-sct', code: 'gb-sct', name: 'Écosse',              confederation: 'UEFA',     group: 'C', groupPosition: 4, fifaRank: 43, fifaPoints: 1485.08, force: 64, participations: 7,                  color: '#1a3a78', textColor: 'white' },

  // ============ GROUPE D ============
  { id: 'us',     code: 'us',     name: 'États-Unis',          confederation: 'CONCACAF', group: 'D', groupPosition: 1, fifaRank: 16, fifaPoints: 1673.13, force: 72, participations: 11, isHost: true,  color: '#1e3a8a', textColor: 'white' },
  { id: 'py',     code: 'py',     name: 'Paraguay',            confederation: 'CONMEBOL', group: 'D', groupPosition: 2, fifaRank: 37, fifaPoints: 1501.01, force: 62, participations: 8,                  color: '#d8232a', textColor: 'white' },
  { id: 'au',     code: 'au',     name: 'Australie',           confederation: 'AFC',      group: 'D', groupPosition: 3, fifaRank: 25, fifaPoints: 1583.49, force: 65, participations: 6,                  color: '#f2c200', textColor: 'black' },
  { id: 'tr',     code: 'tr',     name: 'Turquie',             confederation: 'UEFA',     group: 'D', groupPosition: 4, fifaRank: 27, fifaPoints: 1555.72, force: 74, participations: 2,                  color: '#e30a17', textColor: 'white' },

  // ============ GROUPE E ============
  { id: 'de',     code: 'de',     name: 'Allemagne',           confederation: 'UEFA',     group: 'E', groupPosition: 1, fifaRank: 10, fifaPoints: 1730.37, force: 86, participations: 20,                 color: '#1a1a1a', textColor: 'white' },
  { id: 'cw',     code: 'cw',     name: 'Curaçao',             confederation: 'CONCACAF', group: 'E', groupPosition: 2, fifaRank: 84, fifaPoints: 1282.42, force: 47, participations: 0,                  color: '#1976d2', textColor: 'white' },
  { id: 'ci',     code: 'ci',     name: "Côte d'Ivoire",       confederation: 'CAF',      group: 'E', groupPosition: 3, fifaRank: 44, fifaPoints: 1483.90, force: 70, participations: 3,                  color: '#ee7400', textColor: 'white' },
  { id: 'ec',     code: 'ec',     name: 'Équateur',            confederation: 'CONMEBOL', group: 'E', groupPosition: 4, fifaRank: 24, fifaPoints: 1588.04, force: 71, participations: 4,                  color: '#f2c200', textColor: 'black' },

  // ============ GROUPE F ============
  { id: 'nl',     code: 'nl',     name: 'Pays-Bas',            confederation: 'UEFA',     group: 'F', groupPosition: 1, fifaRank: 7,  fifaPoints: 1757.87, force: 84, participations: 10,                 color: '#ee7400', textColor: 'white' },
  { id: 'jp',     code: 'jp',     name: 'Japon',               confederation: 'AFC',      group: 'F', groupPosition: 2, fifaRank: 18, fifaPoints: 1660.43, force: 76, participations: 7,                  color: '#0a5fa5', textColor: 'white' },
  { id: 'se',     code: 'se',     name: 'Suède',               confederation: 'UEFA',     group: 'F', groupPosition: 3, fifaRank: 32, fifaPoints: 1524.62, force: 66, participations: 12,                 color: '#1a6e3b', textColor: 'white' },
  { id: 'tn',     code: 'tn',     name: 'Tunisie',             confederation: 'CAF',      group: 'F', groupPosition: 4, fifaRank: 46, fifaPoints: 1483.02, force: 64, participations: 6,                  color: '#d72027', textColor: 'white' },

  // ============ GROUPE G ============
  { id: 'be',     code: 'be',     name: 'Belgique',            confederation: 'UEFA',     group: 'G', groupPosition: 1, fifaRank: 9,  fifaPoints: 1734.71, force: 82, participations: 13,                 color: '#7c1a3d', textColor: 'white' },
  { id: 'eg',     code: 'eg',     name: 'Égypte',              confederation: 'CAF',      group: 'G', groupPosition: 2, fifaRank: 35, fifaPoints: 1519.18, force: 67, participations: 3,                  color: '#d72027', textColor: 'white' },
  { id: 'ir',     code: 'ir',     name: 'Iran',                confederation: 'AFC',      group: 'G', groupPosition: 3, fifaRank: 21, fifaPoints: 1622.61, force: 68, participations: 6,                  color: '#d72027', textColor: 'white' },
  { id: 'nz',     code: 'nz',     name: 'Nouvelle-Zélande',    confederation: 'OFC',      group: 'G', groupPosition: 4, fifaRank: 83, fifaPoints: 1283.94, force: 50, participations: 2,                  color: '#1a1a1a', textColor: 'white' },

  // ============ GROUPE H ============
  { id: 'es',     code: 'es',     name: 'Espagne',             confederation: 'UEFA',     group: 'H', groupPosition: 1, fifaRank: 2,  fifaPoints: 1876.40, force: 92, participations: 16,                 color: '#d8232a', textColor: 'white' },
  { id: 'cv',     code: 'cv',     name: 'Cap-Vert',            confederation: 'CAF',      group: 'H', groupPosition: 2, fifaRank: 70, fifaPoints: 1363.21, force: 52, participations: 0,                  color: '#1a3a78', textColor: 'white' },
  { id: 'sa',     code: 'sa',     name: 'Arabie Saoudite',     confederation: 'AFC',      group: 'H', groupPosition: 3, fifaRank: 59, fifaPoints: 1420.65, force: 58, participations: 6,                  color: '#0a5c36', textColor: 'white' },
  { id: 'uy',     code: 'uy',     name: 'Uruguay',             confederation: 'CONMEBOL', group: 'H', groupPosition: 4, fifaRank: 17, fifaPoints: 1673.07, force: 81, participations: 14,                 color: '#76b1e0', textColor: 'black' },

  // ============ GROUPE I ============
  { id: 'fr',     code: 'fr',     name: 'France',              confederation: 'UEFA',     group: 'I', groupPosition: 1, fifaRank: 1,  fifaPoints: 1877.32, force: 91, participations: 16,                 color: '#0055a4', textColor: 'white' },
  { id: 'sn',     code: 'sn',     name: 'Sénégal',             confederation: 'CAF',      group: 'I', groupPosition: 2, fifaRank: 14, fifaPoints: 1688.99, force: 75, participations: 3,                  color: '#0d6e3b', textColor: 'white' },
  { id: 'iq',     code: 'iq',     name: 'Irak',                confederation: 'AFC',      group: 'I', groupPosition: 3, fifaRank: 58, fifaPoints: 1422.20, force: 54, participations: 1,                  color: '#127436', textColor: 'white' },
  { id: 'no',     code: 'no',     name: 'Norvège',             confederation: 'UEFA',     group: 'I', groupPosition: 4, fifaRank: 31, fifaPoints: 1526.23, force: 77, participations: 3,                  color: '#d8232a', textColor: 'white' },

  // ============ GROUPE J ============
  { id: 'ar',     code: 'ar',     name: 'Argentine',           confederation: 'CONMEBOL', group: 'J', groupPosition: 1, fifaRank: 3,  fifaPoints: 1874.81, force: 93, participations: 18,                 color: '#76b1e0', textColor: 'black' },
  { id: 'dz',     code: 'dz',     name: 'Algérie',             confederation: 'CAF',      group: 'J', groupPosition: 2, fifaRank: 38, fifaPoints: 1500.74, force: 69, participations: 4,                  color: '#0d6e3b', textColor: 'white' },
  { id: 'at',     code: 'at',     name: 'Autriche',            confederation: 'UEFA',     group: 'J', groupPosition: 3, fifaRank: 22, fifaPoints: 1601.86, force: 73, participations: 7,                  color: '#ef3340', textColor: 'white' },
  { id: 'jo',     code: 'jo',     name: 'Jordanie',            confederation: 'AFC',      group: 'J', groupPosition: 4, fifaRank: 62, fifaPoints: 1391.33, force: 56, participations: 0,                  color: '#d12230', textColor: 'white' },

  // ============ GROUPE K ============
  { id: 'pt',     code: 'pt',     name: 'Portugal',            confederation: 'UEFA',     group: 'K', groupPosition: 1, fifaRank: 5,  fifaPoints: 1763.83, force: 88, participations: 8,                  color: '#d8232a', textColor: 'white' },
  { id: 'cd',     code: 'cd',     name: 'RD Congo',            confederation: 'CAF',      group: 'K', groupPosition: 2, fifaRank: 60, fifaPoints: 1407.60, force: 60, participations: 1,                  color: '#1976d2', textColor: 'white' },
  { id: 'uz',     code: 'uz',     name: 'Ouzbékistan',         confederation: 'AFC',      group: 'K', groupPosition: 3, fifaRank: 54, fifaPoints: 1453.31, force: 59, participations: 0,                  color: '#1d3a8a', textColor: 'white' },
  { id: 'co',     code: 'co',     name: 'Colombie',            confederation: 'CONMEBOL', group: 'K', groupPosition: 4, fifaRank: 13, fifaPoints: 1693.09, force: 80, participations: 6,                  color: '#f2c200', textColor: 'black' },

  // ============ GROUPE L ============
  { id: 'gb-eng', code: 'gb-eng', name: 'Angleterre',          confederation: 'UEFA',     group: 'L', groupPosition: 1, fifaRank: 4,  fifaPoints: 1825.97, force: 89, participations: 16,                 color: '#f5f5f5', textColor: 'black' },
  { id: 'hr',     code: 'hr',     name: 'Croatie',             confederation: 'UEFA',     group: 'L', groupPosition: 2, fifaRank: 11, fifaPoints: 1717.07, force: 79, participations: 6,                  color: '#d8232a', textColor: 'white' },
  { id: 'gh',     code: 'gh',     name: 'Ghana',               confederation: 'CAF',      group: 'L', groupPosition: 3, fifaRank: 75, fifaPoints: 1340.84, force: 61, participations: 4,                  color: '#f2c200', textColor: 'black' },
  { id: 'pa',     code: 'pa',     name: 'Panama',              confederation: 'CONCACAF', group: 'L', groupPosition: 4, fifaRank: 29, fifaPoints: 1529.71, force: 53, participations: 1,                  color: '#d8232a', textColor: 'white' },
];

export const TEAMS_BY_ID: Record<string, Team> = Object.fromEntries(
  TEAMS.map(t => [t.id, t])
);
