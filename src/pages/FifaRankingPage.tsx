import { useMemo, useState } from 'react';
import { useSim } from '../store/SimulationStore';
import { FIFA_WORLD_TOP100, FIFA_RANKING_DATE, type FifaRankingEntry } from '../data/fifaWorldRanking';
import { TEAMS_BY_ID } from '../data/teams';
import type { Confederation } from '../types';
import type { MatchDelta, Round } from '../lib/elo';
import { Flag } from '../components/Flag';
import { useT, format } from '../i18n';

type ConfedFilter = 'Tout' | Confederation;

const FILTERS: ConfedFilter[] = ['Tout', 'AFC', 'CAF', 'CONCACAF', 'CONMEBOL', 'OFC', 'UEFA'];


interface AdjustedEntry extends FifaRankingEntry {
  currentPoints: number;
  pointsDelta: number;
  currentRank: number;
  rankDelta: number;
  matchesPlayed: number;
  history: MatchDelta[];
}

export function FifaRankingPage() {
  const { elos } = useSim();
  const { t } = useT();
  const [filter, setFilter] = useState<ConfedFilter>('Tout');
  const [onlyWc, setOnlyWc] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);

  const ROUND_LABEL: Record<Round, string> = {
    GROUP: '',
    R32: t.phases.r32,
    R16: t.phases.r16,
    QF: t.phases.qf,
    SF: t.phases.sfLong,
    THIRD: t.bracket.thirdPlace,
    FINAL: t.phases.final,
  };
  void ROUND_LABEL;

  const adjusted: AdjustedEntry[] = useMemo(() => {
    const mapped = FIFA_WORLD_TOP100.map(e => {
      const eloState = e.teamId ? elos[e.teamId] : undefined;
      const currentPoints = eloState ? eloState.fifaPointsCurrent : e.points;
      return {
        ...e,
        currentPoints,
        pointsDelta: Math.round((currentPoints - e.points) * 100) / 100,
        matchesPlayed: eloState?.matches ?? 0,
        history: eloState?.history ?? [],
      };
    });
    mapped.sort((a, b) => b.currentPoints - a.currentPoints);
    return mapped.map((e, i) => ({
      ...e,
      currentRank: i + 1,
      rankDelta: e.rank - (i + 1),
    }));
  }, [elos]);

  const filtered = useMemo(() => {
    return adjusted.filter(e => {
      if (filter !== 'Tout' && e.confederation !== filter) return false;
      if (onlyWc && !e.teamId) return false;
      return true;
    });
  }, [adjusted, filter, onlyWc]);

  const wcCount = adjusted.filter(e => e.teamId).length;
  const movedCount = adjusted.filter(e => e.rankDelta !== 0).length;

  const toggle = (code: string, hasHistory: boolean) => {
    if (!hasHistory) return;
    setExpanded(curr => curr === code ? null : code);
  };

  return (
    <>
      <div className="tab-bar">
        <div className="tab-bar-inner">
          {FILTERS.map(f => (
            <button
              key={f}
              className={`sub-tab ${filter === f ? 'active' : ''}`}
              onClick={() => setFilter(f)}
            >
              {f}
            </button>
          ))}
          <button
            className={`sub-tab ${onlyWc ? 'active' : ''}`}
            style={{ marginLeft: 'auto' }}
            onClick={() => setOnlyWc(o => !o)}
          >
            {t.fifa.wcOnly}
          </button>
        </div>
      </div>

      <main className="app-main">
        <div className="teams-page-head">
          <div>
            <h2 className="section-title" style={{ marginBottom: 4 }}>{t.fifa.title}</h2>
            <div className="teams-summary">
              {t.fifa.source} — <strong>{FIFA_RANKING_DATE}</strong>
              <span className="teams-summary-sep">·</span>
              {format(t.fifa.wcInTop100, { n: wcCount })}
              {movedCount > 0 && (
                <>
                  <span className="teams-summary-sep">·</span>
                  {format(t.fifa.rankMoved, { n: movedCount })}
                </>
              )}
            </div>
          </div>
        </div>

        <div className="teams-table-card">
          <table className="teams-table fifa-ranking-table">
            <thead>
              <tr>
                <th className="align-center">{t.fifa.cols.rank}</th>
                <th className="align-center">{t.fifa.cols.evolution}</th>
                <th>{t.fifa.cols.team}</th>
                <th>{t.fifa.cols.confederation}</th>
                <th className="align-right">{t.fifa.cols.points}</th>
                <th className="align-right">{t.fifa.cols.deltaPoints}</th>
                <th className="align-center">{t.fifa.cols.qualification}</th>
                <th className="align-center">{t.fifa.cols.detail}</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(e => {
                const isExp = expanded === e.fifaCode;
                const hasHistory = e.history.length > 0;
                return (
                  <RowFragment
                    key={e.fifaCode}
                    entry={e}
                    isExpanded={isExp}
                    hasHistory={hasHistory}
                    onToggle={() => toggle(e.fifaCode, hasHistory)}
                  />
                );
              })}
            </tbody>
          </table>
        </div>
      </main>
    </>
  );
}

function RowFragment({
  entry, isExpanded, hasHistory, onToggle,
}: {
  entry: AdjustedEntry;
  isExpanded: boolean;
  hasHistory: boolean;
  onToggle: () => void;
}) {
  const { t, teamName } = useT();
  const e = entry;
  const displayName = teamName(e.teamId ?? e.isoCode);
  return (
    <>
      <tr
        className={`${e.teamId ? 'is-wc-row' : ''} ${isExpanded ? 'is-expanded' : ''} ${hasHistory ? 'is-clickable' : ''}`}
        onClick={onToggle}
      >
        <td className="align-center rank-cell">
          <span className="fifa-rank-num">{e.currentRank}</span>
        </td>
        <td className="align-center">
          <RankDeltaBadge delta={e.rankDelta} />
        </td>
        <td className="team-name-cell">
          <Flag code={e.isoCode} size="sm" />
          <span className="team-name-text">{displayName}</span>
        </td>
        <td>
          <span className="conf-badge">{e.confederation}</span>
        </td>
        <td className="align-right">
          <span className="fifa-points">{e.currentPoints.toFixed(2)}</span>
        </td>
        <td className="align-right">
          <PointsDeltaBadge delta={e.pointsDelta} matches={e.matchesPlayed} />
        </td>
        <td className="align-center">
          {e.teamId
            ? <span className="wc-badge">{t.fifa.wcBadge}</span>
            : <span className="not-wc-badge">{t.fifa.notQualified}</span>}
        </td>
        <td className="align-center">
          {hasHistory ? (
            <button type="button" className={`detail-toggle ${isExpanded ? 'open' : ''}`} aria-label="Voir les matchs">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M3 4 L6 7 L9 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              {e.matchesPlayed}
            </button>
          ) : <span className="dash">—</span>}
        </td>
      </tr>
      {isExpanded && hasHistory && (
        <tr className="match-history-row">
          <td colSpan={8}>
            <MatchHistoryDetail entry={e} />
          </td>
        </tr>
      )}
    </>
  );
}

function MatchHistoryDetail({ entry }: { entry: AdjustedEntry }) {
  const { t, teamName } = useT();
  const displayName = entry.teamId ? teamName(entry.teamId) : entry.name;
  const matches = [...entry.history].sort((a, b) => a.matchNumber - b.matchNumber);
  return (
    <div className="match-history">
      <div className="match-history-head">
        <span className="match-history-title">
          {format(t.fifa.detailTitle, { n: matches.length, name: displayName })}
        </span>
        <span className="match-history-summary">
          {t.fifa.total} :{' '}
          <span className={entry.pointsDelta > 0 ? 'mh-up' : entry.pointsDelta < 0 ? 'mh-down' : 'mh-flat'}>
            {entry.pointsDelta > 0 ? '+' : ''}{entry.pointsDelta.toFixed(2)} pts
          </span>
        </span>
      </div>
      <div className="match-history-list">
        {matches.map(m => <MatchLine key={m.matchNumber} m={m} />)}
      </div>
    </div>
  );
}

function MatchLine({ m }: { m: MatchDelta }) {
  const { t, teamName } = useT();
  const opp = TEAMS_BY_ID[m.opponentId];
  const resColor = m.result === 'W' ? 'mh-up' : m.result === 'L' ? 'mh-down' : 'mh-flat';
  const resLabel = m.result === 'W' ? t.fifa.resultW : m.result === 'L' ? t.fifa.resultL : t.fifa.resultD;
  const roundLabel: Record<Round, string> = {
    GROUP: '',
    R32: t.phases.r32,
    R16: t.phases.r16,
    QF: t.phases.qf,
    SF: t.phases.sfLong,
    THIRD: t.bracket.thirdPlace,
    FINAL: t.phases.final,
  };
  const phaseLabel = m.round === 'GROUP'
    ? `${format(t.filters.groupX, { x: m.group ?? '' })} · ${t.matches.matchdayN[0]}${m.matchday}`
    : roundLabel[m.round];
  const showPen = m.selfPen !== null && m.selfPen !== undefined
    && m.oppPen !== null && m.oppPen !== undefined;

  return (
    <div className="mh-line">
      <span className="mh-match-num">M{String(m.matchNumber).padStart(2, '0')}</span>
      <span className="mh-date">{m.date.slice(0, 5)}</span>
      <span className="mh-phase">{phaseLabel}</span>
      <span className="mh-vs">
        <span className="mh-vs-text">{m.isHome ? t.fifa.homeMark : t.fifa.awayMark}</span>
        {opp && <Flag code={opp.code} size="sm" />}
        <span className="mh-opp-name">{opp ? teamName(opp.id) : m.opponentId}</span>
      </span>
      <span className="mh-score">
        <span className={`mh-result ${resColor}`}>{resLabel}</span>
        <span className="mh-score-num">{m.selfScore}–{m.oppScore}</span>
        {showPen && (
          <span className="mh-pen">({m.selfPen}–{m.oppPen} {t.matches.pen})</span>
        )}
      </span>
      <span className={`mh-pts ${m.fifaPointsDelta > 0 ? 'mh-up' : m.fifaPointsDelta < 0 ? 'mh-down' : 'mh-flat'}`}>
        {m.fifaPointsDelta > 0 ? '+' : ''}{m.fifaPointsDelta.toFixed(2)}
      </span>
    </div>
  );
}

function RankDeltaBadge({ delta }: { delta: number }) {
  if (delta === 0) return <span className="rank-delta flat">—</span>;
  const up = delta > 0;
  return (
    <span className={`rank-delta ${up ? 'up' : 'down'}`}>
      <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden>
        {up
          ? <path d="M5 1 L1 6 H4 V9 H6 V6 H9 Z" fill="currentColor"/>
          : <path d="M5 9 L1 4 H4 V1 H6 V4 H9 Z" fill="currentColor"/>}
      </svg>
      {Math.abs(delta)}
    </span>
  );
}

function PointsDeltaBadge({ delta, matches }: { delta: number; matches: number }) {
  if (matches === 0) return <span className="dash">—</span>;
  if (delta === 0) return <span className="points-delta flat">±0.00</span>;
  const up = delta > 0;
  return (
    <span className={`points-delta ${up ? 'up' : 'down'}`}>
      {up ? '+' : ''}{delta.toFixed(2)}
    </span>
  );
}
