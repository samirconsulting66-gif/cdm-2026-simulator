import { useEffect, useMemo, useRef, useState } from 'react';
import { useTimezone } from '../store/TimezoneStore';
import {
  TIMEZONE_OPTIONS,
  REGION_ICON,
  type Region,
  type TimezoneOption,
} from '../lib/time';
import { useT } from '../i18n';
import { tzHint } from '../i18n/timezoneHints';

export function TimezonePicker() {
  const { offset, setOffset } = useTimezone();
  const { t, lang } = useT();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  const REGION_LABEL: Record<Region, string> = t.tz.regions;

  const current = TIMEZONE_OPTIONS.find(o => o.offset === offset)
    ?? TIMEZONE_OPTIONS[0];

  const hintOf = (o: TimezoneOption) => tzHint(lang, o.offset);

  const groups = useMemo(() => {
    const map = new Map<Region, TimezoneOption[]>();
    for (const opt of TIMEZONE_OPTIONS) {
      const arr = map.get(opt.region);
      if (arr) arr.push(opt);
      else map.set(opt.region, [opt]);
    }
    return Array.from(map.entries());
  }, []);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const pick = (o: number) => {
    setOffset(o);
    setOpen(false);
  };

  return (
    <div ref={rootRef} className={`tz-picker ${open ? 'is-open' : ''}`}>
      <button
        type="button"
        className="tz-picker-button"
        onClick={() => setOpen(o => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        title="Fuseau horaire d'affichage"
      >
        <span className="tz-picker-icon" aria-hidden>🕐</span>
        <span className="tz-picker-content">
          <span className="tz-picker-label">{current.label}</span>
          <span className="tz-picker-hint">{hintOf(current)}</span>
        </span>
        <span className="tz-picker-chevron" aria-hidden>
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
            <path d="M2 3.5 L5 6.5 L8 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </span>
      </button>

      {open && (
        <div className="tz-popover" role="listbox" aria-label="Liste des fuseaux horaires">
          <div className="tz-popover-head">
            <span className="tz-popover-title">{t.tz.title}</span>
          </div>
          <div className="tz-popover-scroll">
            {groups.map(([region, opts]) => (
              <div key={region} className="tz-group">
                <div className="tz-group-header">
                  <span className="tz-group-icon" aria-hidden>{REGION_ICON[region]}</span>
                  <span>{REGION_LABEL[region]}</span>
                </div>
                {opts.map(opt => {
                  const isActive = opt.offset === offset;
                  return (
                    <button
                      key={opt.offset}
                      type="button"
                      role="option"
                      aria-selected={isActive}
                      className={`tz-option ${isActive ? 'active' : ''}`}
                      onClick={() => pick(opt.offset)}
                    >
                      <span className="tz-option-label">{opt.label}</span>
                      <span className="tz-option-hint">{hintOf(opt)}</span>
                      {isActive && (
                        <span className="tz-option-check" aria-hidden>
                          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                            <path d="M2 7 L6 11 L12 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
