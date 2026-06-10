import { useEffect, useState } from 'react';
import { useSim } from '../store/SimulationStore';
import { useTimezone } from '../store/TimezoneStore';
import { TEAMS_BY_ID } from '../data/teams';
import { Flag } from '../components/Flag';
import { useT, format } from '../i18n';
import { areAllGroupsComplete, groupStageProgress } from '../lib/standings';

type ZoomLevel = 0 | 1 | 2 | 3 | 4;
const ZOOM_LS_KEY = 'cdm2026-bracket-zoom';

function loadZoom(): ZoomLevel {
  try {
    const raw = localStorage.getItem(ZOOM_LS_KEY);
    if (raw) {
      const n = parseInt(raw, 10);
      if ([0, 1, 2, 3, 4].includes(n)) return n as ZoomLevel;
    }
  } catch { /* ignore */ }
  return 0;
}
import { getChampionId, getWinnerId, getLoserId } from '../lib/bracket';
import {
  R32_LEFT_IDS, R32_RIGHT_IDS,
  R16_LEFT_IDS, R16_RIGHT_IDS,
  QF_LEFT_IDS, QF_RIGHT_IDS,
} from '../data/bracket';
import type { KnockoutMatch } from '../types';

function KoTeamRow({
  match, side,
}: {
  match: KnockoutMatch;
  side: 'home' | 'away';
}) {
  const { setKoScore } = useSim();
  const { teamName } = useT();
  const teamId = side === 'home' ? match.homeId : match.awayId;
  const team = teamId ? TEAMS_BY_ID[teamId] : null;
  const seed = side === 'home' ? match.homeSeed : match.awaySeed;
  const winnerId = getWinnerId(match);
  const loserId = getLoserId(match);
  const isWinner = !!winnerId && winnerId === teamId;
  const isLoser  = !!loserId  && loserId  === teamId;

  const score = side === 'home' ? match.homeScore : match.awayScore;
  const otherScore = side === 'home' ? match.awayScore : match.homeScore;
  const pen = side === 'home' ? match.homePen : match.awayPen;
  const showPen = pen !== null && pen !== undefined
    && score !== null && otherScore !== null && score === otherScore;

  const onScoreChange = (v: number | null) => {
    if (side === 'home') {
      setKoScore(match.id, v, match.awayScore, match.homePen, match.awayPen);
    } else {
      setKoScore(match.id, match.homeScore, v, match.homePen, match.awayPen);
    }
  };

  return (
    <div className={`ko-team ${team ? '' : 'empty'} ${isWinner ? 'winner' : ''} ${isLoser ? 'loser' : ''}`}>
      <span className="ko-team-name" title={team ? teamName(team.id) : seed}>
        {team ? (
          <>
            <Flag code={team.code} size="sm" />
            <span className="ko-team-label">{teamName(team.id)}</span>
          </>
        ) : (
          <>
            <span className="ko-flag-placeholder" />
            <span className="ko-team-seed">{seed}</span>
          </>
        )}
        {isWinner && (
          <svg className="ko-winner-tick" width="11" height="11" viewBox="0 0 14 14" fill="none" aria-hidden>
            <path d="M2 7 L6 11 L12 3" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        )}
      </span>
      <span className="ko-score-wrap">
        {showPen && <span className="ko-pen">({pen})</span>}
        <input
          type="number"
          min={0}
          max={99}
          className="ko-score-input"
          value={score === null ? '' : score}
          onChange={(e) => {
            const v = e.target.value;
            if (v === '') onScoreChange(null);
            else {
              const n = parseInt(v, 10);
              if (!Number.isNaN(n) && n >= 0) onScoreChange(n);
            }
          }}
          disabled={!team}
          placeholder="–"
        />
      </span>
    </div>
  );
}

function PenaltyControls({ match }: { match: KnockoutMatch }) {
  const { setKoScore } = useSim();
  const { t } = useT();
  if (match.homeScore === null || match.awayScore === null) return null;
  if (match.homeScore !== match.awayScore) return null;
  if (!match.homeId || !match.awayId) return null;
  return (
    <div className="ko-pen-row">
      <span className="ko-pen-label">{t.matches.penalties}</span>
      <input
        type="number"
        min={0}
        max={20}
        className="ko-pen-input"
        value={match.homePen === null ? '' : match.homePen}
        onChange={(e) => {
          const v = e.target.value === '' ? null : parseInt(e.target.value, 10);
          setKoScore(match.id, match.homeScore, match.awayScore, v, match.awayPen);
        }}
      />
      <span className="ko-pen-dash">–</span>
      <input
        type="number"
        min={0}
        max={20}
        className="ko-pen-input"
        value={match.awayPen === null ? '' : match.awayPen}
        onChange={(e) => {
          const v = e.target.value === '' ? null : parseInt(e.target.value, 10);
          setKoScore(match.id, match.homeScore, match.awayScore, match.homePen, v);
        }}
      />
    </div>
  );
}

function KoMatchCard({ matchId, extraClass, provisional }: { matchId: string; extraClass?: string; provisional?: boolean }) {
  const { knockout } = useSim();
  const { shift } = useTimezone();
  const { t, stadiumLabel } = useT();
  const m = knockout.find(x => x.id === matchId);
  if (!m) return null;
  const s = shift(m.date, m.time);
  const done = m.homeScore !== null && m.awayScore !== null;
  const winner = getWinnerId(m);
  const showProvBadge = provisional && (m.homeId || m.awayId);

  return (
    <div className={`ko-match ${extraClass ?? ''} ${done ? 'is-done' : ''} ${winner ? 'has-winner' : ''} ${showProvBadge ? 'is-provisional' : ''}`}>
      <div className="ko-match-meta">
        <span className="ko-match-label">{m.label}</span>
        <span className="ko-match-date">
          {s.date.slice(0, 5)} · {s.time}
          {s.dayDelta !== 0 && (
            <span className="day-delta-badge"> {s.dayDelta > 0 ? '+1j' : '−1j'}</span>
          )}
        </span>
      </div>
      <KoTeamRow match={m} side="home" />
      <KoTeamRow match={m} side="away" />
      <PenaltyControls match={m} />
      <div className="ko-match-foot">{stadiumLabel(m.stadium)}</div>
      {showProvBadge && (
        <span className="ko-prov-badge">
          {t.bracket.provisional}
        </span>
      )}
    </div>
  );
}

function BracketCol({
  title,
  count,
  ids,
  spacing,
  provisional,
}: {
  title: string;
  count: number;
  ids: string[];
  spacing: 1|2|3|4;
  provisional: boolean;
}) {
  return (
    <div className="bracket-col-wrap">
      <div className="bracket-col-title">
        <span>{title}</span>
        <span className="bracket-col-count">{count}</span>
      </div>
      <div className={`bracket-col spaced-${spacing}`}>
        {ids.map(id => <KoMatchCard key={id} matchId={id} provisional={provisional} />)}
      </div>
    </div>
  );
}

export function BracketPage() {
  const { groupMatches, knockout } = useSim();
  const { t, teamName } = useT();
  const [zoom, setZoomState] = useState<ZoomLevel>(loadZoom);
  const ready = areAllGroupsComplete(groupMatches);
  const progress = groupStageProgress(groupMatches);
  const provisional = !ready;
  const noData = progress.played === 0;
  const champion = getChampionId(knockout);
  const championTeam = champion ? TEAMS_BY_ID[champion] : null;

  const setZoom = (z: ZoomLevel) => {
    setZoomState(z);
    try { localStorage.setItem(ZOOM_LS_KEY, String(z)); } catch { /* ignore */ }
  };

  // Navigation clavier
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement) return;
      if (e.key === 'ArrowRight') setZoom(Math.min(4, zoom + 1) as ZoomLevel);
      else if (e.key === 'ArrowLeft') setZoom(Math.max(0, zoom - 1) as ZoomLevel);
      else if (e.key === 'Escape') setZoom(0);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [zoom]);

  const showR32 = zoom < 1;
  const showR16 = zoom < 2;
  const showQF  = zoom < 3;
  const showSF  = zoom < 4;

  const ZOOM_BUTTONS: { level: ZoomLevel; label: string; icon: string }[] = [
    { level: 0, label: t.bracket.overview, icon: '⊕' },
    { level: 1, label: t.phases.r16, icon: '⊙' },
    { level: 2, label: t.phases.qf,  icon: '⊙' },
    { level: 3, label: t.phases.sf,  icon: '⊙' },
    { level: 4, label: t.phases.final, icon: '🏆' },
  ];

  const finalMatch = knockout.find(m => m.id === 'M104');
  const thirdMatch = knockout.find(m => m.id === 'M103');
  const runnerUpId = finalMatch ? getLoserId(finalMatch) : null;
  const runnerUpTeam = runnerUpId ? TEAMS_BY_ID[runnerUpId] : null;
  const thirdWinnerId = thirdMatch ? getWinnerId(thirdMatch) : null;
  const thirdWinnerTeam = thirdWinnerId ? TEAMS_BY_ID[thirdWinnerId] : null;

  return (
    <main className="app-main">
      <div className="bracket-toolbar">
        <div>
          <h2 className="section-title" style={{ marginBottom: 4 }}>{t.bracket.title}</h2>
          <p className="page-subtitle" style={{ marginBottom: 0 }}>{t.bracket.description}</p>
        </div>
      </div>

      <div className="bracket-zoom-bar">
        <div className="bracket-zoom-buttons" role="radiogroup" aria-label={t.bracket.overview}>
          {ZOOM_BUTTONS.map(b => (
            <button
              key={b.level}
              type="button"
              role="radio"
              aria-checked={zoom === b.level}
              className={`bracket-zoom-btn ${zoom === b.level ? 'active' : ''}`}
              onClick={() => setZoom(b.level)}
            >
              <span className="bracket-zoom-icon" aria-hidden>{b.icon}</span>
              <span className="bracket-zoom-label">{b.label}</span>
            </button>
          ))}
        </div>
        <div className="bracket-zoom-hint">
          <kbd>←</kbd> / <kbd>→</kbd> · <kbd>Esc</kbd> — {t.bracket.zoomHint}
        </div>
      </div>

      {noData && !championTeam && (
        <div className="bracket-message">{t.bracket.empty}</div>
      )}

      {!noData && !ready && (
        <div className="bracket-progress">
          <div className="bracket-progress-text">
            <strong>{t.standings.provisionalBanner}</strong>
            <span className="bracket-progress-stats">
              {format(t.standings.progressStats, { played: progress.played, total: progress.total })}
              {progress.matchdaysComplete > 0 && (
                <> · {format(t.standings.matchdayComplete, { n: progress.matchdaysComplete })}</>
              )}
              {progress.groupsComplete > 0 && (
                <> · {format(t.standings.groupsComplete, { n: progress.groupsComplete })}</>
              )}
            </span>
          </div>
          <div className="bracket-progress-bar">
            <div
              className="bracket-progress-fill"
              style={{ width: `${(progress.played / progress.total) * 100}%` }}
            />
          </div>
        </div>
      )}

      {championTeam && (
        <div className="podium">
          <div className="podium-item silver">
            <div className="podium-medal">🥈</div>
            <div className="podium-place">{t.bracket.finalist}</div>
            {runnerUpTeam ? (
              <>
                <Flag code={runnerUpTeam.code} />
                <div className="podium-name">{teamName(runnerUpTeam.id)}</div>
              </>
            ) : <div className="podium-name placeholder">—</div>}
          </div>

          <div className="podium-item gold">
            <div className="podium-crown" aria-hidden>👑</div>
            <div className="podium-medal big">🏆</div>
            <div className="podium-place">{t.bracket.champion}</div>
            <Flag code={championTeam.code} />
            <div className="podium-name big">{teamName(championTeam.id)}</div>
          </div>

          <div className="podium-item bronze">
            <div className="podium-medal">🥉</div>
            <div className="podium-place">{t.bracket.thirdPlace}</div>
            {thirdWinnerTeam ? (
              <>
                <Flag code={thirdWinnerTeam.code} />
                <div className="podium-name">{teamName(thirdWinnerTeam.id)}</div>
              </>
            ) : <div className="podium-name placeholder">—</div>}
          </div>
        </div>
      )}

      <div className="bracket-scroll">
        <div className={`bracket-grid zoom-${zoom}`}>
          {showR32 && <BracketCol title={t.phases.r32} count={8} ids={R32_LEFT_IDS} spacing={1} provisional={provisional} />}
          {showR16 && <BracketCol title={t.phases.r16} count={4} ids={R16_LEFT_IDS} spacing={2} provisional={provisional} />}
          {showQF  && <BracketCol title={t.phases.qf}  count={2} ids={QF_LEFT_IDS}  spacing={3} provisional={provisional} />}
          {showSF  && <BracketCol title={t.phases.sf}  count={1} ids={['M101']}     spacing={4} provisional={provisional} />}

          <div className="bracket-col-wrap bracket-center-col">
            <div className="bracket-col-title centered">
              <span>{t.phases.final}</span>
            </div>
            <div className="bracket-center">
              <div className="bracket-center-block">
                <div className="bracket-center-tag">🏆 {t.phases.final}</div>
                <KoMatchCard matchId="M104" extraClass="final-card" provisional={provisional} />
              </div>
              <div className="bracket-center-block">
                <div className="bracket-center-tag muted">{t.bracket.thirdPlace}</div>
                <KoMatchCard matchId="M103" extraClass="third-card" provisional={provisional} />
              </div>
            </div>
          </div>

          {showSF  && <BracketCol title={t.phases.sf}  count={1} ids={['M102']}      spacing={4} provisional={provisional} />}
          {showQF  && <BracketCol title={t.phases.qf}  count={2} ids={QF_RIGHT_IDS}  spacing={3} provisional={provisional} />}
          {showR16 && <BracketCol title={t.phases.r16} count={4} ids={R16_RIGHT_IDS} spacing={2} provisional={provisional} />}
          {showR32 && <BracketCol title={t.phases.r32} count={8} ids={R32_RIGHT_IDS} spacing={1} provisional={provisional} />}
        </div>
      </div>

      <div className="bracket-legend">
        <span className="legend-item"><span className="legend-dot winner-dot" /> {t.bracket.legendWinner}</span>
        <span className="legend-item"><span className="legend-dot loser-dot" /> {t.bracket.legendLoser}</span>
        <span className="legend-item">{t.bracket.legendHint}</span>
      </div>
    </main>
  );
}
