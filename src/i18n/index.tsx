import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { LANGUAGES, type Language, type LanguageMeta, type Translations } from './types';
import { fr } from './fr';
import { en } from './en';
import { es } from './es';
import { ar } from './ar';
import { de } from './de';
import { pt } from './pt';
import { zh } from './zh';
import { ja } from './ja';
import { ko } from './ko';
import { TEAM_NAMES } from './teamNames';
import { STADIUM_LABELS } from './stadiumLabels';
import { TEAMS_BY_ID } from '../data/teams';
import { stadiumLabel as defaultStadiumLabel } from '../data/stadiums';

const ALL: Record<Language, Translations> = { fr, en, es, ar, de, pt, zh, ja, ko };
const LS_KEY = 'cdm2026-lang';

interface I18nContextValue {
  lang: Language;
  meta: LanguageMeta;
  t: Translations;
  setLang: (l: Language) => void;
  teamName: (id: string) => string;
  stadiumLabel: (id: string) => string;
}

const I18nContext = createContext<I18nContextValue | null>(null);

function loadInitial(): Language {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (raw && LANGUAGES.some(l => l.code === raw)) return raw as Language;
  } catch { /* ignore */ }
  return 'fr';
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Language>(loadInitial);

  useEffect(() => {
    try { localStorage.setItem(LS_KEY, lang); } catch { /* ignore */ }
    const meta = LANGUAGES.find(l => l.code === lang);
    if (meta) {
      document.documentElement.lang = lang;
      document.documentElement.dir = meta.dir;
    }
  }, [lang]);

  const meta = LANGUAGES.find(l => l.code === lang) ?? LANGUAGES[0];

  const teamName = (id: string): string => {
    return TEAM_NAMES[lang]?.[id]
      ?? TEAM_NAMES.fr[id]
      ?? TEAMS_BY_ID[id]?.name
      ?? id;
  };

  const stadiumLabel = (id: string): string => {
    return STADIUM_LABELS[lang]?.[id]
      ?? STADIUM_LABELS.fr[id]
      ?? defaultStadiumLabel(id);
  };

  const value: I18nContextValue = {
    lang,
    meta,
    t: ALL[lang],
    setLang: setLangState,
    teamName,
    stadiumLabel,
  };
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useT() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useT must be used within I18nProvider');
  return ctx;
}

/** Remplace les placeholders {key} dans une chaîne. */
export function format(template: string, vars: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (_, k) => String(vars[k] ?? ''));
}

export { LANGUAGES, type Language, type LanguageMeta, type Translations };
