import { GROUP_LETTERS } from '../data/groups';
import { TEAMS_BY_ID } from '../data/teams';
import { useSim } from '../store/SimulationStore';
import type { GroupLetter } from '../types';
import { Flag } from '../components/Flag';
import { useT, format } from '../i18n';
import {
  isGroupComplete,
  thirdPlacedRanking,
  areAllGroupsComplete,
  groupStageProgress,
} from '../lib/standings';

const THIRD_SLOT_BY_RANK = ['M74', 'M77', 'M79', 'M80', 'M81', 'M82', 'M85', 'M87'];

function GroupStandingCard({ letter }: { letter: GroupLetter }) {
  const { groupMatches, standings } = useSim();
  const { t, teamName } = useT();
  const rows = standings[letter] ?? [];
  const complete = isGroupComplete(groupMatches, letter);
  const playedInGroup = groupMatches
    .filter(m => m.group === letter && m.homeScore !== null && m.awayScore !== null)
    .length;
  const isProvisional = !complete && playedInGroup > 0;

  return (
    <section className={`standing-card ${isProvisional ? 'is-provisional' : ''} ${complete ? 'is-complete' : ''}`}>
      <header className="standing-card-header">
        <span className="standing-card-letter">{format(t.filters.groupX, { x: letter })}</span>
        {complete ? (
          <span className="standing-card-status complete">{t.standings.statusComplete}</span>
        ) : isProvisional ? (
          <span className="standing-card-status prov">
            {t.standings.provisional} <span className="standing-card-prog">{playedInGroup}/6</span>
          </span>
        ) : (
          <span className="standing-card-status">{t.standings.statusUpcoming}</span>
        )}
      </header>
      <table className="standing-table">
        <thead>
          <tr>
            <th>{t.standings.cols.rank}</th>
            <th className="standing-team-col">{t.standings.cols.team}</th>
            <th>{t.standings.cols.p}</th>
            <th>{t.standings.cols.w}</th>
            <th>{t.standings.cols.d}</th>
            <th>{t.standings.cols.l}</th>
            <th>{t.standings.cols.gf}</th>
            <th>{t.standings.cols.ga}</th>
            <th>{t.standings.cols.gd}</th>
            <th>{t.standings.cols.pts}</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((s, i) => {
            const team = TEAMS_BY_ID[s.teamId];
            if (!team) return null;
            return (
              <tr key={s.teamId} className={`pos-${i + 1}`}>
                <td>{i + 1}</td>
                <td className="standing-team-col">
                  <Flag code={team.code} size="sm" />
                  <span>{teamName(team.id)}</span>
                </td>
                <td>{s.played}</td>
                <td>{s.won}</td>
                <td>{s.drawn}</td>
                <td>{s.lost}</td>
                <td>{s.gf}</td>
                <td>{s.ga}</td>
                <td>{s.gd > 0 ? `+${s.gd}` : s.gd}</td>
                <td><strong>{s.points}</strong></td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </section>
  );
}

function BestThirdsSection() {
  const { standings, groupMatches } = useSim();
  const { t, teamName } = useT();
  const thirds = thirdPlacedRanking(standings);
  const ready = areAllGroupsComplete(groupMatches);
  const showProvisional = !ready;

  return (
    <>
      <h2 className="section-title with-margin-top">
        {t.standings.bestThirds}
        {showProvisional && <span className="section-title-prov-badge">{t.standings.provisional}</span>}
      </h2>
      <p className="page-subtitle">{t.standings.bestThirdsDesc}</p>

      <div className={`best-thirds-card ${showProvisional ? 'is-provisional' : ''}`}>
          <table className="best-thirds-table">
            <thead>
              <tr>
                <th>{t.standings.cols.rank}</th>
                <th>{t.standings.cols.team}</th>
                <th>{t.standings.cols.groupShort}</th>
                <th>{t.standings.cols.p}</th>
                <th>{t.standings.cols.w}</th>
                <th>{t.standings.cols.d}</th>
                <th>{t.standings.cols.l}</th>
                <th>{t.standings.cols.gf}</th>
                <th>{t.standings.cols.ga}</th>
                <th>{t.standings.cols.gd}</th>
                <th>{t.standings.cols.pts}</th>
                <th>{t.standings.qualification}</th>
              </tr>
            </thead>
            <tbody>
              {thirds.map((s, i) => {
                const team = TEAMS_BY_ID[s.teamId];
                if (!team) return null;
                const qualified = i < 8;
                return (
                  <tr key={s.teamId} className={qualified ? 'third-qualified' : 'third-out'}>
                    <td>{i + 1}</td>
                    <td>
                      <div className="third-team">
                        <Flag code={team.code} size="sm" />
                        <span>{teamName(team.id)}</span>
                      </div>
                    </td>
                    <td>{team.group}</td>
                    <td>{s.played}</td>
                    <td>{s.won}</td>
                    <td>{s.drawn}</td>
                    <td>{s.lost}</td>
                    <td>{s.gf}</td>
                    <td>{s.ga}</td>
                    <td>{s.gd > 0 ? `+${s.gd}` : s.gd}</td>
                    <td><strong>{s.points}</strong></td>
                    <td>
                      {qualified ? (
                        <span className="third-badge qualified">→ {THIRD_SLOT_BY_RANK[i]}</span>
                      ) : (
                        <span className="third-badge out">{t.standings.eliminated}</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
    </>
  );
}

export function StandingsPage() {
  const { groupMatches } = useSim();
  const { t } = useT();
  const progress = groupStageProgress(groupMatches);
  const ready = areAllGroupsComplete(groupMatches);
  const showBanner = progress.played > 0 && !ready;

  return (
    <main className="app-main">
      <h2 className="section-title">{t.standings.title}</h2>
      <p className="page-subtitle">{t.standings.description}</p>

      {showBanner && (
        <div className="standings-progress">
          <div className="standings-progress-text">
            <strong>{t.standings.provisionalBanner}</strong>
            <span className="standings-progress-stats">
              {format(t.standings.progressStats, { played: progress.played, total: progress.total })}
              {progress.matchdaysComplete > 0 && (
                <> · {format(t.standings.matchdayComplete, { n: progress.matchdaysComplete })}</>
              )}
              {progress.groupsComplete > 0 && (
                <> · {format(t.standings.groupsComplete, { n: progress.groupsComplete })}</>
              )}
            </span>
          </div>
          <div className="standings-progress-bar">
            <div
              className="standings-progress-fill"
              style={{ width: `${(progress.played / progress.total) * 100}%` }}
            />
          </div>
        </div>
      )}

      <div className="standings-grid">
        {GROUP_LETTERS.map(letter => (
          <GroupStandingCard key={letter} letter={letter} />
        ))}
      </div>

      <BestThirdsSection />
    </main>
  );
}
