// Toutes les heures stockées sont en heure d'Alger (GMT+1) — source du dossier officiel
export const SOURCE_TZ_OFFSET = 1;

export type Region = 'americas' | 'europe' | 'asia' | 'oceania';

export interface TimezoneOption {
  offset: number;
  label: string;
  hint: string;
  region: Region;
}

export const REGION_LABEL: Record<Region, string> = {
  americas: 'Amériques',
  europe: 'Europe · Afrique',
  asia: 'Moyen-Orient · Asie',
  oceania: 'Océanie',
};

export const REGION_ICON: Record<Region, string> = {
  americas: '🌎',
  europe: '🌍',
  asia: '🌏',
  oceania: '🌏',
};

export const TIMEZONE_OPTIONS: TimezoneOption[] = [
  { offset: -10, label: 'GMT−10', hint: 'Honolulu',                  region: 'americas' },
  { offset: -8,  label: 'GMT−8',  hint: 'Anchorage',                 region: 'americas' },
  { offset: -7,  label: 'GMT−7',  hint: 'Los Angeles · Vancouver',   region: 'americas' },
  { offset: -6,  label: 'GMT−6',  hint: 'Mexico · Houston',          region: 'americas' },
  { offset: -5,  label: 'GMT−5',  hint: 'Toronto · Chicago',         region: 'americas' },
  { offset: -4,  label: 'GMT−4',  hint: 'New York · Miami',          region: 'americas' },
  { offset: -3,  label: 'GMT−3',  hint: 'São Paulo · Buenos Aires',  region: 'americas' },
  { offset: 0,   label: 'GMT',    hint: 'Londres · Lisbonne',        region: 'europe'   },
  { offset: 1,   label: 'GMT+1',  hint: 'Alger · Tunis · Casablanca',region: 'europe'   },
  { offset: 2,   label: 'GMT+2',  hint: 'Paris · Berlin · Le Caire', region: 'europe'   },
  { offset: 3,   label: 'GMT+3',  hint: 'Riyad · Moscou · Doha',     region: 'asia'     },
  { offset: 4,   label: 'GMT+4',  hint: 'Dubaï · Bakou',             region: 'asia'     },
  { offset: 5,   label: 'GMT+5',  hint: 'Karachi · Tachkent',        region: 'asia'     },
  { offset: 6,   label: 'GMT+6',  hint: 'Dhaka · Astana',            region: 'asia'     },
  { offset: 7,   label: 'GMT+7',  hint: 'Bangkok · Jakarta · Hanoï', region: 'asia'     },
  { offset: 8,   label: 'GMT+8',  hint: 'Pékin · Singapour · Perth', region: 'asia'     },
  { offset: 9,   label: 'GMT+9',  hint: 'Tokyo · Séoul',             region: 'asia'     },
  { offset: 10,  label: 'GMT+10', hint: 'Sydney · Melbourne',        region: 'oceania'  },
  { offset: 12,  label: 'GMT+12', hint: 'Auckland',                  region: 'oceania'  },
];

function pad(n: number): string {
  return String(n).padStart(2, '0');
}

export interface ShiftedDateTime {
  date: string;
  time: string;
  dayDelta: -1 | 0 | 1;
}

export function shiftDateTime(
  date: string,
  time: string,
  targetOffset: number,
): ShiftedDateTime {
  const [d, m, y] = date.split('/').map(s => parseInt(s, 10));
  const [hh, mm] = time.split(':').map(s => parseInt(s, 10));
  // Moment UTC = heure locale source - décalage source
  const utcMs = Date.UTC(y, m - 1, d, hh - SOURCE_TZ_OFFSET, mm);
  const targetMs = utcMs + targetOffset * 3600_000;
  const t = new Date(targetMs);

  const newDate = `${pad(t.getUTCDate())}/${pad(t.getUTCMonth() + 1)}/${t.getUTCFullYear()}`;
  const newTime = `${pad(t.getUTCHours())}:${pad(t.getUTCMinutes())}`;

  // Décalage de jour (pour afficher +1j / -1j en cas de chevauchement)
  const srcDay = Date.UTC(y, m - 1, d);
  const newDay = Date.UTC(t.getUTCFullYear(), t.getUTCMonth(), t.getUTCDate());
  const dayDelta: -1 | 0 | 1 = newDay > srcDay ? 1 : newDay < srcDay ? -1 : 0;

  return { date: newDate, time: newTime, dayDelta };
}

export function labelForOffset(offset: number): string {
  const o = TIMEZONE_OPTIONS.find(t => t.offset === offset);
  return o?.label ?? `GMT${offset >= 0 ? '+' : '−'}${Math.abs(offset)}`;
}
