import { useEffect, useRef, useState } from 'react';
import { useT, LANGUAGES } from '../i18n';

export function LanguagePicker() {
  const { lang, setLang, meta } = useT();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <div ref={rootRef} className={`lang-picker ${open ? 'is-open' : ''}`}>
      <button
        type="button"
        className="lang-picker-button"
        onClick={() => setOpen(o => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        title="Language / Langue / Idioma / اللغة"
      >
        <span className="lang-picker-flag" aria-hidden>{meta.flag}</span>
        <span className="lang-picker-code">{meta.shortLabel}</span>
        <span className="lang-picker-chevron" aria-hidden>
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
            <path d="M2 3.5 L5 6.5 L8 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </span>
      </button>
      {open && (
        <div className="lang-popover" role="listbox">
          {LANGUAGES.map(l => {
            const isActive = l.code === lang;
            return (
              <button
                key={l.code}
                type="button"
                role="option"
                aria-selected={isActive}
                className={`lang-option ${isActive ? 'active' : ''}`}
                onClick={() => { setLang(l.code); setOpen(false); }}
                dir={l.dir}
              >
                <span className="lang-option-flag" aria-hidden>{l.flag}</span>
                <span className="lang-option-label">{l.label}</span>
                <span className="lang-option-code">{l.shortLabel}</span>
                {isActive && (
                  <span className="lang-option-check" aria-hidden>
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <path d="M2 7 L6 11 L12 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
