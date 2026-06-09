import { useSim, SIM_FACTOR_PRESETS, type SimFactorKey } from '../store/SimulationStore';
import { useT } from '../i18n';

const ICONS: Record<SimFactorKey, string> = {
  chaos:       '🎲',
  surprising:  '⚡',
  standard:    '⚖️',
  pronounced:  '🎯',
  strict:      '🏆',
};

export function SimFactorPicker() {
  const { simFactor, setSimFactor } = useSim();
  const { t } = useT();

  // Trouve l'index actif (le plus proche)
  const activeIdx = SIM_FACTOR_PRESETS.reduce((best, p, i) =>
    Math.abs(p.value - simFactor) < Math.abs(SIM_FACTOR_PRESETS[best].value - simFactor) ? i : best
  , 0);

  return (
    <section className="sim-factor">
      <header className="sim-factor-head">
        <span className="sim-factor-title">{t.simFactor.title}</span>
        <span className="sim-factor-subtitle">{t.simFactor.subtitle}</span>
      </header>
      <div className="sim-factor-segments" role="radiogroup" aria-label={t.simFactor.title}>
        {SIM_FACTOR_PRESETS.map((p, i) => {
          const isActive = i === activeIdx;
          const label = t.simFactor[p.key];
          return (
            <button
              key={p.key}
              type="button"
              role="radio"
              aria-checked={isActive}
              className={`sim-factor-btn pos-${i + 1} ${isActive ? 'active' : ''}`}
              onClick={() => setSimFactor(p.value)}
              title={`α = ${p.value}`}
            >
              <span className="sim-factor-icon" aria-hidden>{ICONS[p.key]}</span>
              <span className="sim-factor-label">{label}</span>
              <span className="sim-factor-alpha">α {p.value.toFixed(1)}</span>
            </button>
          );
        })}
      </div>
      <div className="sim-factor-track">
        <div
          className="sim-factor-track-fill"
          style={{ width: `${(activeIdx / (SIM_FACTOR_PRESETS.length - 1)) * 100}%` }}
        />
      </div>
    </section>
  );
}
