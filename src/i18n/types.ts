export type Language = 'fr' | 'en' | 'es' | 'ar' | 'de' | 'pt' | 'zh' | 'ja' | 'ko';

export interface LanguageMeta {
  code: Language;
  label: string;        // nom dans sa propre langue
  shortLabel: string;   // ex. "FR"
  flag: string;         // emoji ou code
  dir: 'ltr' | 'rtl';
}

export const LANGUAGES: LanguageMeta[] = [
  { code: 'fr', label: 'Français',   shortLabel: 'FR', flag: '🇫🇷', dir: 'ltr' },
  { code: 'en', label: 'English',    shortLabel: 'EN', flag: '🇬🇧', dir: 'ltr' },
  { code: 'es', label: 'Español',    shortLabel: 'ES', flag: '🇪🇸', dir: 'ltr' },
  { code: 'ar', label: 'العربية',     shortLabel: 'AR', flag: '🇸🇦', dir: 'rtl' },
  { code: 'de', label: 'Deutsch',    shortLabel: 'DE', flag: '🇩🇪', dir: 'ltr' },
  { code: 'pt', label: 'Português',  shortLabel: 'PT', flag: '🇵🇹', dir: 'ltr' },
  { code: 'zh', label: '中文',        shortLabel: 'ZH', flag: '🇨🇳', dir: 'ltr' },
  { code: 'ja', label: '日本語',       shortLabel: 'JA', flag: '🇯🇵', dir: 'ltr' },
  { code: 'ko', label: '한국어',       shortLabel: 'KO', flag: '🇰🇷', dir: 'ltr' },
];

export interface Translations {
  brand: string;
  tabs: {
    matches: string;
    standings: string;
    bracket: string;
    teams: string;
    fifa: string;
  };
  buttons: {
    simulate: string;
    simulateTitle: string;
    reset: string;
    resetTitle: string;
    resetConfirm: string;
  };
  tz: {
    title: string;
    regions: {
      americas: string;
      europe: string;
      asia: string;
      oceania: string;
    };
    indicator: string;
    hint: string;
  };
  phases: {
    group: string;
    r32: string;
    r16: string;
    qf: string;
    sf: string;
    third: string;
    final: string;
    r32Long: string;
    r16Long: string;
    qfLong: string;
    sfLong: string;
    thirdLong: string;
    finalLong: string;
  };
  filters: {
    team: string;
    group: string;
    phase: string;
    day: string;
    allTeams: string;
    allGroups: string;
    allPhases: string;
    allDays: string;
    groupX: string;     // "Groupe {x}" ou "Group {x}"
  };
  matches: {
    title: string;
    matchN: string;       // "Match"
    matchdayN: string;    // "Journée"
    empty: string;
    penalties: string;
    pen: string;
    stadium: string;
    matchesCount: string; // "matchs"
  };
  standings: {
    title: string;
    description: string;
    qualifies: string;
    bestThirds: string;
    bestThirdsDesc: string;
    bestThirdsEmpty: string;
    qualification: string;
    eliminated: string;
    statusComplete: string;
    statusInProgress: string;
    statusUpcoming: string;
    provisional: string;
    provisionalBanner: string;
    progressStats: string;       // "{played}/{total} matchs joués"
    matchdayComplete: string;    // "Journée {N} terminée"
    groupsComplete: string;      // "{n}/12 groupes finalisés"
    cols: {
      rank: string;
      team: string;
      p: string;
      w: string;
      d: string;
      l: string;
      gf: string;
      ga: string;
      gd: string;
      pts: string;
      elo: string;
      groupShort: string;
    };
  };
  bracket: {
    title: string;
    description: string;
    empty: string;
    champion: string;
    finalist: string;
    thirdPlace: string;
    legendWinner: string;
    legendLoser: string;
    legendHint: string;
    provisional: string;
  };
  simFactor: {
    title: string;
    subtitle: string;
    chaos: string;
    surprising: string;
    standard: string;
    pronounced: string;
    strict: string;
  };
  teams: {
    title: string;
    teamsLabel: string;
    teamLabel: string;
    hostsLabel: string;
    hostLabel: string;
    forceAdjustedLabel: string;
    hint: string;
    hostBadge: string;
    cols: {
      idx: string;
      team: string;
      confederation: string;
      group: string;
      pos: string;
      force: string;
      participations: string;
      host: string;
    };
  };
  fifa: {
    title: string;
    source: string;
    wcInTop100: string;     // "{n} équipes de la CdM dans le top 100"
    rankMoved: string;       // "{n} rangs déplacés"
    wcOnly: string;
    wcBadge: string;
    notQualified: string;
    cols: {
      rank: string;
      evolution: string;
      team: string;
      confederation: string;
      points: string;
      deltaPoints: string;
      qualification: string;
      detail: string;
    };
    detailTitle: string;     // "Détail des {n} matchs — {name}"
    total: string;
    homeMark: string;        // "vs"
    awayMark: string;        // "@"
    resultW: string;
    resultD: string;
    resultL: string;
  };
  common: {
    yes: string;
    no: string;
    forceLabel: string;
  };
}
