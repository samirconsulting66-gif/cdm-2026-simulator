import { useMemo, useState } from 'react';
import { TEAMS } from '../data/teams';
import type { Confederation, Team } from '../types';
import { Flag } from '../components/Flag';
import { useSim } from '../store/SimulationStore';
import { SimFactorPicker } from '../components/SimFactorPicker';
import { useT, format } from '../i18n';

type Filter = 'Tout' | Confederation;

const FILTERS: Filter[] = ['Tout', 'AFC', 'CAF', 'CONCACAF', 'CONMEBOL', 'OFC', 'UEFA'];

type SortKey = 'name' | 'confederation' | 'group' | 'force' | 'participations';
type SortDir = 'asc' | 'desc';

type ColumnDef = { key: SortKey | 'pos' | 'host' | 'idx'; sortable: boolean; align?: 'right' | 'center' };

const COLUMN_DEFS: ColumnDef[] = [
  { key: 'idx',           sortable: false, align: 'center' },
  { key: 'name',          sortable: true },
  { key: 'confederation', sortable: true },
  { key: 'group',         sortable: true, align: 'center' },
  { key: 'pos',           sortable: false, align: 'center' },
  { key: 'force',         sortable: true, align: 'right' },
  { key: 'participations',sortable: true, align: 'right' },
  { key: 'host',          sortable: false, align: 'center' },
];

function forceColor(value: number): string {
  return value >= 85 ? '#0d6e3b'
       : value >= 75 ? '#3b9b5e'
       : value >= 65 ? '#8b8b3b'
       : value >= 55 ? '#c18b2b'
       :               '#b54848';
}

function ForceEditor({ team }: { team: Team }) {
  const { getForce, setForce, resetForce, forceOverrides } = useSim();
  const { teamName } = useT();
  const value = getForce(team.id);
  const isOverridden = forceOverrides[team.id] !== undefined;
  const color = forceColor(value);
  const pct = Math.max(0, Math.min(100, ((value - 30) / (100 - 30)) * 100));

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const n = parseInt(e.target.value, 10);
    if (!Number.isNaN(n)) setForce(team.id, n);
  };

  const onSlide = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForce(team.id, parseInt(e.target.value, 10));
  };

  const dec = () => setForce(team.id, Math.max(1, value - 1));
  const inc = () => setForce(team.id, Math.min(100, value + 1));

  return (
    <div className="force-edit">
      <div className="force-edit-bar">
        <div className="force-bar-track">
          <div
            className="force-bar-fill"
            style={{ width: `${pct}%`, background: color }}
          />
        </div>
        <input
          type="range"
          min={30}
          max={100}
          value={value}
          onChange={onSlide}
          className="force-slider"
          aria-label={`Force ${teamName(team.id)}`}
          title={`Glisser pour modifier · Original ${team.force}`}
        />
      </div>
      <button
        type="button"
        className="force-step-btn force-step-down"
        onClick={dec}
        disabled={value <= 1}
        title="Diminuer de 1"
        aria-label="Diminuer la force"
      >
        −
      </button>
      <input
        type="number"
        min={1}
        max={100}
        value={value}
        onChange={onChange}
        className={`force-input ${isOverridden ? 'is-overridden' : ''}`}
        style={{ color }}
      />
      <button
        type="button"
        className="force-step-btn force-step-up"
        onClick={inc}
        disabled={value >= 100}
        title="Augmenter de 1"
        aria-label="Augmenter la force"
      >
        +
      </button>
      {isOverridden && (
        <button
          type="button"
          className="force-reset-btn"
          onClick={() => resetForce(team.id)}
          title={`Restaurer la valeur d'origine (${team.force})`}
          aria-label="Restaurer la force d'origine"
        >
          <svg width="11" height="11" viewBox="0 0 14 14" fill="none">
            <path d="M2 7 a5 5 0 1 0 1.5-3.5 M2 1.5 v3 h3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
          </svg>
        </button>
      )}
    </div>
  );
}

function compareTeams(
  a: Team, b: Team, key: SortKey, dir: SortDir,
  getForce: (id: string) => number,
): number {
  const collator = new Intl.Collator('fr', { sensitivity: 'base' });
  let cmp = 0;
  switch (key) {
    case 'name':
      cmp = collator.compare(a.name, b.name);
      break;
    case 'confederation':
      cmp = a.confederation.localeCompare(b.confederation);
      if (cmp === 0) cmp = collator.compare(a.name, b.name);
      break;
    case 'group':
      cmp = a.group.localeCompare(b.group);
      if (cmp === 0) cmp = a.groupPosition - b.groupPosition;
      break;
    case 'force':
      cmp = getForce(a.id) - getForce(b.id);
      if (cmp === 0) cmp = collator.compare(a.name, b.name);
      break;
    case 'participations':
      cmp = a.participations - b.participations;
      if (cmp === 0) cmp = collator.compare(a.name, b.name);
      break;
  }
  return dir === 'asc' ? cmp : -cmp;
}

const COUNT_BY_CONF: Record<Confederation, number> = {
  AFC: 0, CAF: 0, CONCACAF: 0, CONMEBOL: 0, OFC: 0, UEFA: 0,
};
for (const t of TEAMS) COUNT_BY_CONF[t.confederation]++;

export function TeamsPage() {
  const { getForce, forceOverrides } = useSim();
  const { t, teamName } = useT();
  const [filter, setFilter] = useState<Filter>('Tout');
  const [sortKey, setSortKey] = useState<SortKey>('name');
  const [sortDir, setSortDir] = useState<SortDir>('asc');

  const colLabel = (key: ColumnDef['key']): string => {
    switch (key) {
      case 'idx': return t.teams.cols.idx;
      case 'name': return t.teams.cols.team;
      case 'confederation': return t.teams.cols.confederation;
      case 'group': return t.teams.cols.group;
      case 'pos': return t.teams.cols.pos;
      case 'force': return t.teams.cols.force;
      case 'participations': return t.teams.cols.participations;
      case 'host': return t.teams.cols.host;
    }
  };

  const rows = useMemo(() => {
    const list = filter === 'Tout'
      ? [...TEAMS]
      : TEAMS.filter(t => t.confederation === filter);
    list.sort((a, b) => compareTeams(a, b, sortKey, sortDir, getForce));
    return list;
  }, [filter, sortKey, sortDir, getForce]);

  const onSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir(d => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir(key === 'force' || key === 'participations' ? 'desc' : 'asc');
    }
  };

  const hostCount = rows.filter(x => x.isHost).length;
  const overrideCount = Object.keys(forceOverrides).length;

  return (
    <>
      <div className="tab-bar">
        <div className="tab-bar-inner">
          {FILTERS.map(f => {
            const count = f === 'Tout' ? TEAMS.length : COUNT_BY_CONF[f as Confederation];
            return (
              <button
                key={f}
                className={`sub-tab ${filter === f ? 'active' : ''}`}
                onClick={() => setFilter(f)}
              >
                {f} <span className="sub-tab-count">{count}</span>
              </button>
            );
          })}
        </div>
      </div>

      <main className="app-main">
        <div className="teams-page-head">
          <div>
            <h2 className="section-title" style={{ marginBottom: 4 }}>{t.teams.title}</h2>
            <div className="teams-summary">
              <strong>{rows.length}</strong> {rows.length > 1 ? t.teams.teamsLabel : t.teams.teamLabel}
              {hostCount > 0 && (
                <>
                  <span className="teams-summary-sep">·</span>
                  <strong>{hostCount}</strong> {hostCount > 1 ? t.teams.hostsLabel : t.teams.hostLabel}
                </>
              )}
              {overrideCount > 0 && (
                <>
                  <span className="teams-summary-sep">·</span>
                  <strong>{overrideCount}</strong> {t.teams.forceAdjustedLabel}
                </>
              )}
            </div>
          </div>
          <div className="teams-page-hint">{t.teams.hint}</div>
        </div>

        <SimFactorPicker />

        <div className="teams-table-card">
          <table className="teams-table">
            <thead>
              <tr>
                {COLUMN_DEFS.map(col => {
                  const isSorted = col.sortable && sortKey === (col.key as SortKey);
                  const arrow = isSorted ? (sortDir === 'asc' ? '↑' : '↓') : '';
                  return (
                    <th
                      key={col.key}
                      className={`${col.align ? `align-${col.align}` : ''} ${col.sortable ? 'sortable' : ''} ${isSorted ? 'is-sorted' : ''}`}
                      onClick={col.sortable ? () => onSort(col.key as SortKey) : undefined}
                    >
                      <span>{colLabel(col.key)}</span>
                      {col.sortable && <span className="sort-arrow">{arrow || '⇅'}</span>}
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {rows.map((team, i) => (
                <tr key={team.id} className={team.isHost ? 'is-host-row' : ''}>
                  <td className="align-center idx-cell">{i + 1}</td>
                  <td className="team-name-cell">
                    <span
                      className="team-color-dot"
                      style={{ background: team.color }}
                      aria-hidden
                    />
                    <Flag code={team.code} size="sm" />
                    <span className="team-name-text">{teamName(team.id)}</span>
                  </td>
                  <td>
                    <span className="conf-badge">{team.confederation}</span>
                  </td>
                  <td className="align-center">
                    <span className="group-pill">{format(t.filters.groupX, { x: team.group })}</span>
                  </td>
                  <td className="align-center pos-cell">{team.groupPosition}</td>
                  <td className="align-right">
                    <ForceEditor team={team} />
                  </td>
                  <td className="align-right">{team.participations}</td>
                  <td className="align-center">
                    {team.isHost ? <span className="host-badge">{t.teams.hostBadge}</span> : <span className="dash">—</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </>
  );
}
