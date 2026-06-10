import { useEffect, useState } from 'react';
import { SimulationProvider, useSim } from './store/SimulationStore';
import { TimezoneProvider } from './store/TimezoneStore';
import { TimezonePicker } from './components/TimezonePicker';
import { LanguagePicker } from './components/LanguagePicker';
import { SavePicker } from './components/SavePicker';
import { ExportPicker } from './components/ExportPicker';
import { I18nProvider, useT } from './i18n';
import { TeamsPage } from './pages/TeamsPage';
import { MatchesPage } from './pages/MatchesPage';
import { StandingsPage } from './pages/StandingsPage';
import { BracketPage } from './pages/BracketPage';
import { FifaRankingPage } from './pages/FifaRankingPage';

type Page = 'teams' | 'matches' | 'standings' | 'bracket' | 'fifa';

const PAGE_LIST: Page[] = ['matches', 'standings', 'bracket', 'teams', 'fifa'];

const PAGE_LS_KEY = 'cdm2026-page';

function loadInitialPage(): Page {
  try {
    const raw = localStorage.getItem(PAGE_LS_KEY);
    if (raw && PAGE_LIST.includes(raw as Page)) return raw as Page;
  } catch { /* ignore */ }
  return 'matches';
}

function SimulateButtons() {
  const { simulate, simulateGroups, simulateBracket, groupMatches } = useSim();
  const { t } = useT();
  const groupsReady = groupMatches.every(m => m.homeScore !== null && m.awayScore !== null);
  return (
    <div className="sim-group" role="group" aria-label={t.buttons.simulate}>
      <span className="sim-group-icon" aria-hidden>🎲</span>
      <button
        type="button"
        className="sim-group-btn primary"
        onClick={() => simulate()}
        title={t.buttons.simulateAllTitle}
      >
        {t.buttons.simulateAll}
      </button>
      <button
        type="button"
        className="sim-group-btn"
        onClick={() => simulateGroups()}
        title={t.buttons.simulateGroupsTitle}
      >
        {t.buttons.simulateGroups}
      </button>
      <button
        type="button"
        className="sim-group-btn"
        onClick={() => simulateBracket()}
        title={t.buttons.simulateFinalTitle}
        disabled={!groupsReady}
      >
        {t.buttons.simulateFinal}
      </button>
    </div>
  );
}

function ResetButton() {
  const { reset } = useSim();
  const { t } = useT();
  return (
    <button
      type="button"
      className="btn btn-reset"
      onClick={() => {
        if (confirm(t.buttons.resetConfirm)) {
          reset();
        }
      }}
      title={t.buttons.resetTitle}
    >
      <svg width="13" height="13" viewBox="0 0 14 14" fill="none" aria-hidden>
        <path d="M2 7 a5 5 0 1 0 1.5-3.5 M2 1.5 v3 h3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
      </svg>
      <span>{t.buttons.reset}</span>
    </button>
  );
}

function Shell() {
  const [page, setPage] = useState<Page>(loadInitialPage);
  const { t } = useT();

  useEffect(() => {
    try { localStorage.setItem(PAGE_LS_KEY, page); } catch { /* ignore */ }
  }, [page]);

  const PAGES: { id: Page; label: string }[] = [
    { id: 'matches',   label: t.tabs.matches },
    { id: 'standings', label: t.tabs.standings },
    { id: 'bracket',   label: t.tabs.bracket },
    { id: 'teams',     label: t.tabs.teams },
    { id: 'fifa',      label: t.tabs.fifa },
  ];

  return (
    <div className="app">
      <header className="app-header">
        <div className="app-header-inner">
          <div className="app-header-top">
            <div className="brand">
              <span className="brand-dot" />
              <span>{t.brand}</span>
            </div>
            <div className="header-actions">
              <LanguagePicker />
              <TimezonePicker />
              <span className="header-divider" aria-hidden />
              <SimulateButtons />
              <span className="header-divider" aria-hidden />
              <SavePicker />
              <ExportPicker />
              <span className="header-divider" aria-hidden />
              <ResetButton />
            </div>
          </div>
          <nav className="tabs">
            {PAGES.map(p => (
              <button
                key={p.id}
                className={`tab ${page === p.id ? 'active' : ''}`}
                onClick={() => setPage(p.id)}
              >
                {p.label}
              </button>
            ))}
          </nav>
        </div>
      </header>

      {page === 'teams' && <TeamsPage />}
      {page === 'matches' && <MatchesPage />}
      {page === 'standings' && <StandingsPage />}
      {page === 'bracket' && <BracketPage />}
      {page === 'fifa' && <FifaRankingPage />}
    </div>
  );
}

function App() {
  return (
    <I18nProvider>
      <TimezoneProvider>
        <SimulationProvider>
          <Shell />
        </SimulationProvider>
      </TimezoneProvider>
    </I18nProvider>
  );
}

export default App;
