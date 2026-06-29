import { useMemo, useState } from 'react';
import { useSim } from '../store/SimulationStore';
import { useTimezone } from '../store/TimezoneStore';
import { TEAMS, TEAMS_BY_ID } from '../data/teams';
import { GROUP_LETTERS } from '../data/groups';
import { Flag } from '../components/Flag';
import { FilterDropdown } from '../components/FilterDropdown';
import { areAllGroupsComplete } from '../lib/standings';
import { isOfficialMatch } from '../data/officialResults';
import { useT, format } from '../i18n';
import type { GroupMatch, KnockoutMatch } from '../types';

type PhaseFilter = 'ALL' | 'GROUP' | 'R32' | 'R16' | 'QF' | 'SF' | 'THIRD' | 'FINAL';

const FR_MONTHS = ['janv.','févr.','mars','avr.','mai','juin','juil.','août','sept.','oct.','nov.','déc.'];
const FR_WEEKDAYS = ['dim.','lun.','mar.','mer.','jeu.','ven.','sam.'];

function pad2(n: number) { return String(n).padStart(2, '0'); }

function parseDateTime(date: string, time: string): number {
  const [d, m, y] = date.split('/').map(s => parseInt(s, 10));
  const [hh, mm] = time.split(':').map(s => parseInt(s, 10));
  return new Date(y, m - 1, d, hh, mm).getTime();
}

function formatShortDate(date: string): string {
  const [d, m, y] = date.split('/').map(s => parseInt(s, 10));
  const dt = new Date(y, m - 1, d);
  return `${FR_WEEKDAYS[dt.getDay()]} ${d} ${FR_MONTHS[m - 1]}`;
}

interface UnifiedMatch {
  kind: 'group' | 'ko';
  id: string;
  matchNumber: number;
  sortKey: number;
  date: string;
  time: string;
  dayDelta: -1 | 0 | 1;
  stadium: string;
  sectionKey: string;
  sectionTitle: string;
  group?: string;
  matchday?: 1 | 2 | 3;
  homeId: string | null;
  awayId: string | null;
  homeSeed?: string;
  awaySeed?: string;
  homeScore: number | null;
  awayScore: number | null;
  homePen?: number | null;
  awayPen?: number | null;
  aet?: boolean;
  rawGroup?: GroupMatch;
  rawKo?: KnockoutMatch;
}

const SECTION_ORDER: string[] = [
  'GROUP-1', 'GROUP-2', 'GROUP-3',
  'R32', 'R16', 'QF', 'SF', 'THIRD', 'FINAL',
];

function ScoreInput({
  value, onChange, disabled,
}: { value: number | null; onChange: (v: number | null) => void; disabled?: boolean }) {
  return (
    <input
      type="number"
      min={0}
      max={99}
      disabled={disabled}
      className="m-score-input"
      value={value === null ? '' : value}
      onChange={(e) => {
        const v = e.target.value;
        if (v === '') onChange(null);
        else {
          const n = parseInt(v, 10);
          if (!Number.isNaN(n) && n >= 0) onChange(n);
        }
      }}
      placeholder="–"
    />
  );
}

function MatchCard({ m, provisional }: { m: UnifiedMatch; provisional?: boolean }) {
  const { setGroupScore, setKoScore, setKoAet } = useSim();
  const { t, teamName, stadiumLabel } = useT();
  const home = m.homeId ? TEAMS_BY_ID[m.homeId] : null;
  const away = m.awayId ? TEAMS_BY_ID[m.awayId] : null;

  const isOfficial = isOfficialMatch(m.id);

  const isKoTie = m.kind === 'ko'
    && m.homeScore !== null && m.awayScore !== null
    && m.homeScore === m.awayScore;

  const dayBadge = m.dayDelta === 1 ? '+1j' : m.dayDelta === -1 ? '−1j' : null;

  const showProvBadge = provisional && m.kind === 'ko' && (m.homeId || m.awayId);

  const onHomeChange = (v: number | null) => {
    if (m.kind === 'group') setGroupScore(m.id, v, m.awayScore);
    else setKoScore(m.id, v, m.awayScore, m.homePen ?? null, m.awayPen ?? null);
  };
  const onAwayChange = (v: number | null) => {
    if (m.kind === 'group') setGroupScore(m.id, m.homeScore, v);
    else setKoScore(m.id, m.homeScore, v, m.homePen ?? null, m.awayPen ?? null);
  };

  return (
    <article className={`match-card ${showProvBadge ? 'is-provisional' : ''} ${isOfficial ? 'is-official' : ''}`}>
      {showProvBadge && (
        <span className="match-prov-badge">
          {t.bracket.provisional}
        </span>
      )}
      {isOfficial && (
        <span className="match-official-badge" title={t.matches.officialTitle}>
          <svg width="10" height="10" viewBox="0 0 14 14" fill="none" aria-hidden>
            <path d="M2 7 L6 11 L12 3" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          {t.matches.official}
        </span>
      )}
      <div className="match-card-head">
        <div className="match-card-phase">
          <span className="match-card-num">{t.matches.matchN} {m.matchNumber}</span>
          {m.kind === 'group' && (
            <span className="match-card-sep">·</span>
          )}
          {m.kind === 'group' && <span>{format(t.filters.groupX, { x: m.group ?? '' })}</span>}
        </div>
        <div className="match-card-time">
          <span className="match-card-date">{formatShortDate(m.date)}</span>
          <span className="match-card-sep">·</span>
          <span>{m.time}</span>
          {dayBadge && <span className="day-delta-badge" title="Décalage de jour dû au fuseau">{dayBadge}</span>}
        </div>
      </div>

      <div className="match-card-teams">
        <div className="mc-side home">
          {home ? (
            <>
              <span className="mc-name">{teamName(home.id)}</span>
              <Flag code={home.code} />
            </>
          ) : (
            <>
              <span className="mc-name placeholder">{m.homeSeed ?? '—'}</span>
              <div className="mc-flag-placeholder" />
            </>
          )}
        </div>
        <div className="mc-score">
          <ScoreInput
            value={m.homeScore}
            onChange={onHomeChange}
            disabled={isOfficial || (!home && m.kind === 'ko')}
          />
          <span className="mc-dash">–</span>
          <ScoreInput
            value={m.awayScore}
            onChange={onAwayChange}
            disabled={isOfficial || (!away && m.kind === 'ko')}
          />
          {m.kind === 'ko' && m.aet && (
            <span className="mc-aet-badge" title={t.matches.aetTitle}>{t.matches.aet}</span>
          )}
        </div>
        <div className="mc-side away">
          {away ? (
            <>
              <Flag code={away.code} />
              <span className="mc-name">{teamName(away.id)}</span>
            </>
          ) : (
            <>
              <div className="mc-flag-placeholder" />
              <span className="mc-name placeholder">{m.awaySeed ?? '—'}</span>
            </>
          )}
        </div>
      </div>

      {isKoTie && home && away && (
        <div className="match-card-pen">
          {t.matches.pen}
          <input
            type="number"
            className="m-score-input"
            min={0}
            max={20}
            value={m.homePen === null || m.homePen === undefined ? '' : m.homePen}
            onChange={(e) => {
              const v = e.target.value === '' ? null : parseInt(e.target.value, 10);
              setKoScore(m.id, m.homeScore, m.awayScore, v, m.awayPen ?? null);
            }}
          />
          <span>–</span>
          <input
            type="number"
            className="m-score-input"
            min={0}
            max={20}
            value={m.awayPen === null || m.awayPen === undefined ? '' : m.awayPen}
            onChange={(e) => {
              const v = e.target.value === '' ? null : parseInt(e.target.value, 10);
              setKoScore(m.id, m.homeScore, m.awayScore, m.homePen ?? null, v);
            }}
          />
        </div>
      )}

      {m.kind === 'ko' && home && away && m.homeScore !== null && m.awayScore !== null && (
        <label className={`match-card-aet ${m.aet ? 'is-on' : ''}`} title={t.matches.aetTitle}>
          <input
            type="checkbox"
            checked={!!m.aet}
            disabled={isOfficial}
            onChange={(e) => setKoAet(m.id, e.target.checked)}
          />
          <span>{t.matches.aetTitle}</span>
        </label>
      )}

      <div className="match-card-foot">
        <span className="match-card-stadium">{stadiumLabel(m.stadium)}</span>
        <span className="match-card-id">M{m.matchNumber.toString().padStart(2, '0')}</span>
      </div>
    </article>
  );
}

const FR_WEEKDAYS_LONG = ['dimanche','lundi','mardi','mercredi','jeudi','vendredi','samedi'];
void FR_WEEKDAYS_LONG;

export function MatchesPage() {
  const { groupMatches, knockout } = useSim();
  const { shift, label: tzLabel } = useTimezone();
  const { t, teamName, lang } = useT();
  const [teamFilter, setTeamFilter] = useState<string>('ALL');
  const [groupFilter, setGroupFilter] = useState<string>('ALL');
  const [phaseFilter, setPhaseFilter] = useState<PhaseFilter>('ALL');
  const [dayFilter, setDayFilter] = useState<string>('ALL');
  const [matchdayFilter, setMatchdayFilter] = useState<string>('ALL');

  const provisional = !areAllGroupsComplete(groupMatches);

  // Date du jour (réelle) au format DD/MM/YYYY, pour la surligner dans le filtre Jour
  const todayKey = useMemo(() => {
    const now = new Date();
    return `${pad2(now.getDate())}/${pad2(now.getMonth() + 1)}/${now.getFullYear()}`;
  }, []);

  const PHASE_LABELS: Record<PhaseFilter, string> = {
    ALL: t.filters.allPhases,
    GROUP: t.phases.group,
    R32: t.phases.r32,
    R16: t.phases.r16,
    QF: t.phases.qf,
    SF: t.phases.sf,
    THIRD: t.phases.third,
    FINAL: t.phases.final,
  };

  const PHASE_ICONS: Record<PhaseFilter, string> = {
    ALL: '🎯',
    GROUP: '🔢',
    R32: '⚔️',
    R16: '⚔️',
    QF: '🎖️',
    SF: '🥇',
    THIRD: '🥉',
    FINAL: '🏆',
  };

  const ROUND_LABEL: Record<KnockoutMatch['round'], string> = {
    R32: t.phases.r32Long,
    R16: t.phases.r16Long,
    QF: t.phases.qfLong,
    SF: t.phases.sfLong,
    THIRD: t.phases.thirdLong,
    FINAL: t.phases.finalLong,
  };

  const unified: UnifiedMatch[] = useMemo(() => {
    const out: UnifiedMatch[] = [];
    for (const g of groupMatches) {
      const s = shift(g.date, g.time);
      out.push({
        kind: 'group',
        id: g.id,
        matchNumber: g.matchNumber,
        sortKey: parseDateTime(g.date, g.time),
        date: s.date,
        time: s.time,
        dayDelta: s.dayDelta,
        stadium: g.stadium,
        sectionKey: `GROUP-${g.matchday}`,
        sectionTitle: `${t.phases.group} — ${t.matches.matchdayN} ${pad2(g.matchday)}`,
        group: g.group,
        matchday: g.matchday,
        homeId: g.homeId,
        awayId: g.awayId,
        homeScore: g.homeScore,
        awayScore: g.awayScore,
        rawGroup: g,
      });
    }
    for (const k of knockout) {
      const s = shift(k.date, k.time);
      out.push({
        kind: 'ko',
        id: k.id,
        matchNumber: k.matchNumber,
        sortKey: parseDateTime(k.date, k.time),
        date: s.date,
        time: s.time,
        dayDelta: s.dayDelta,
        stadium: k.stadium,
        sectionKey: k.round,
        sectionTitle: ROUND_LABEL[k.round],
        homeId: k.homeId,
        awayId: k.awayId,
        homeSeed: k.homeSeed,
        awaySeed: k.awaySeed,
        homeScore: k.homeScore,
        awayScore: k.awayScore,
        homePen: k.homePen,
        awayPen: k.awayPen,
        aet: k.aet,
        rawKo: k,
      });
    }
    return out;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [groupMatches, knockout, shift, t]);

  const filtered = useMemo(() => {
    return unified.filter(m => {
      if (teamFilter !== 'ALL') {
        if (m.homeId !== teamFilter && m.awayId !== teamFilter) return false;
      }
      if (groupFilter !== 'ALL') {
        if (m.kind !== 'group' || m.group !== groupFilter) return false;
      }
      if (dayFilter !== 'ALL' && m.date !== dayFilter) return false;
      if (matchdayFilter !== 'ALL') {
        if (m.kind !== 'group' || String(m.matchday) !== matchdayFilter) return false;
      }
      if (phaseFilter === 'ALL') return true;
      if (phaseFilter === 'GROUP') return m.kind === 'group';
      return m.kind === 'ko' && m.rawKo?.round === phaseFilter;
    });
  }, [unified, teamFilter, groupFilter, phaseFilter, dayFilter, matchdayFilter]);

  // Jours uniques présents dans la liste unifiée, triés chronologiquement
  const dayOptions = useMemo(() => {
    const set = new Set<string>();
    for (const m of unified) set.add(m.date);
    return Array.from(set).sort((a, b) => {
      const [da, ma, ya] = a.split('/').map(Number);
      const [db, mb, yb] = b.split('/').map(Number);
      return new Date(ya, ma - 1, da).getTime() - new Date(yb, mb - 1, db).getTime();
    });
  }, [unified]);

  // Comptage de matchs par jour pour afficher en pilule
  const matchesByDay = useMemo(() => {
    const map: Record<string, number> = {};
    for (const m of unified) map[m.date] = (map[m.date] ?? 0) + 1;
    return map;
  }, [unified]);

  const formatDayLabel = (date: string) => {
    const [d, m, y] = date.split('/').map(Number);
    const dt = new Date(y, m - 1, d);
    const formatter = new Intl.DateTimeFormat(lang === 'fr' ? 'fr-FR'
      : lang === 'ar' ? 'ar'
      : lang === 'zh' ? 'zh-CN'
      : lang === 'ja' ? 'ja-JP'
      : lang === 'ko' ? 'ko-KR'
      : lang === 'de' ? 'de-DE'
      : lang === 'es' ? 'es-ES'
      : lang === 'pt' ? 'pt-PT'
      : 'en-US', {
      weekday: 'short', day: 'numeric', month: 'short',
    });
    return formatter.format(dt);
  };

  const grouped = useMemo(() => {
    const map = new Map<string, { title: string; matches: UnifiedMatch[] }>();
    for (const m of filtered) {
      let entry = map.get(m.sectionKey);
      if (!entry) {
        entry = { title: m.sectionTitle, matches: [] };
        map.set(m.sectionKey, entry);
      }
      entry.matches.push(m);
    }
    for (const entry of map.values()) {
      entry.matches.sort((a, b) => a.matchNumber - b.matchNumber);
    }
    return SECTION_ORDER
      .filter(key => map.has(key))
      .map(key => ({ key, ...map.get(key)! }));
  }, [filtered]);

  const teamsSorted = useMemo(() => {
    const collator = new Intl.Collator('fr', { sensitivity: 'base' });
    return [...TEAMS].sort((a, b) => collator.compare(teamName(a.id), teamName(b.id)));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [teamName]);

  return (
    <main className="app-main">
      <div className="matches-header">
        <div>
          <h2 className="section-title" style={{ marginBottom: 4 }}>{t.matches.title}</h2>
          <div className="tz-indicator">
            {t.tz.indicator} <strong>{tzLabel}</strong>
            <span className="tz-indicator-hint"> · {t.tz.hint}</span>
          </div>
        </div>
        <div className="matches-filters">
          <FilterDropdown<string>
            label={t.filters.team}
            value={teamFilter}
            onChange={setTeamFilter}
            searchable
            searchPlaceholder={`${t.filters.team}…`}
            width={240}
            options={[
              {
                value: 'ALL',
                label: t.filters.allTeams,
                searchText: t.filters.allTeams,
                icon: <span className="all-icon">🌍</span>,
              },
              ...teamsSorted.map(team => ({
                value: team.id,
                label: teamName(team.id),
                searchText: teamName(team.id),
                icon: <Flag code={team.code} size="sm" />,
              })),
            ]}
          />
          <FilterDropdown<string>
            label={t.filters.group}
            value={groupFilter}
            onChange={setGroupFilter}
            width={180}
            options={[
              {
                value: 'ALL',
                label: t.filters.allGroups,
                icon: <span className="all-icon">⚽</span>,
              },
              ...GROUP_LETTERS.map(letter => ({
                value: letter,
                label: format(t.filters.groupX, { x: letter }),
                icon: <span className="group-letter-icon">{letter}</span>,
              })),
            ]}
          />
          <FilterDropdown<string>
            label={t.filters.matchday}
            value={matchdayFilter}
            onChange={setMatchdayFilter}
            width={200}
            options={[
              {
                value: 'ALL',
                label: t.filters.allMatchdays,
                icon: <span className="all-icon">📅</span>,
              },
              ...(['1', '2', '3'] as const).map(d => ({
                value: d,
                label: `${t.matches.matchdayN} ${d}`,
                icon: <span className="group-letter-icon">{d}</span>,
              })),
            ]}
          />
          <FilterDropdown<PhaseFilter>
            label={t.filters.phase}
            value={phaseFilter}
            onChange={(v) => setPhaseFilter(v)}
            width={220}
            options={(Object.keys(PHASE_LABELS) as PhaseFilter[]).map(k => ({
              value: k,
              label: PHASE_LABELS[k],
              icon: <span className="phase-icon">{PHASE_ICONS[k]}</span>,
            }))}
          />
          <FilterDropdown<string>
            label={t.filters.day}
            value={dayFilter}
            onChange={setDayFilter}
            width={220}
            highlightValue={todayKey}
            options={[
              {
                value: 'ALL',
                label: t.filters.allDays,
                icon: <span className="all-icon">📅</span>,
              },
              ...dayOptions.map(d => ({
                value: d,
                label: (
                  <span className="day-opt">
                    <span className="day-opt-label">{formatDayLabel(d)}</span>
                    <span className="day-opt-count">{matchesByDay[d]}</span>
                  </span>
                ),
                selectedLabel: formatDayLabel(d),
                icon: <span className="phase-icon">📅</span>,
              })),
            ]}
          />
        </div>
      </div>

      {grouped.length === 0 && (
        <div className="matches-empty">{t.matches.empty}</div>
      )}

      <div className="matches-sections">
        {grouped.map(section => (
          <section key={section.key} className="matches-section">
            <header className="matches-section-header">
              <span className="matches-section-title">{section.title}</span>
              <span className="matches-section-count">{section.matches.length} {t.matches.matchesCount}</span>
            </header>
            <div className="matches-section-grid">
              {section.matches.map(m => <MatchCard key={m.id} m={m} provisional={provisional} />)}
            </div>
          </section>
        ))}
      </div>
    </main>
  );
}
