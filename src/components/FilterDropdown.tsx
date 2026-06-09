import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';

export interface FilterOption<T extends string> {
  value: T;
  label: ReactNode;       // Affichage dans la liste
  selectedLabel?: ReactNode;  // Affichage dans le bouton si différent
  searchText?: string;    // Texte pour le filtre de recherche
  icon?: ReactNode;       // Icône / drapeau optionnel
  group?: string;         // En-tête de section optionnel
}

interface Props<T extends string> {
  label: string;
  value: T;
  options: FilterOption<T>[];
  onChange: (v: T) => void;
  searchable?: boolean;
  searchPlaceholder?: string;
  width?: number;
  align?: 'left' | 'right';
}

export function FilterDropdown<T extends string>({
  label, value, options, onChange,
  searchable = false, searchPlaceholder, width = 220, align = 'left',
}: Props<T>) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
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

  useEffect(() => { if (open) setSearch(''); }, [open]);

  const current = options.find(o => o.value === value);

  const filtered = useMemo(() => {
    if (!searchable || !search.trim()) return options;
    const q = search.trim().toLowerCase();
    return options.filter(o =>
      (o.searchText ?? '').toLowerCase().includes(q)
    );
  }, [options, search, searchable]);

  // Construit la liste avec en-têtes de section si .group défini
  const renderedList = useMemo(() => {
    const out: Array<{ type: 'header'; label: string } | { type: 'opt'; opt: FilterOption<T> }> = [];
    let lastGroup: string | undefined = undefined;
    for (const opt of filtered) {
      if (opt.group && opt.group !== lastGroup) {
        out.push({ type: 'header', label: opt.group });
        lastGroup = opt.group;
      }
      out.push({ type: 'opt', opt });
    }
    return out;
  }, [filtered]);

  return (
    <div ref={rootRef} className={`filter-dd ${open ? 'is-open' : ''}`} style={{ width }}>
      <span className="filter-dd-label">{label}</span>
      <button
        type="button"
        className="filter-dd-button"
        onClick={() => setOpen(o => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        {current?.icon && <span className="filter-dd-button-icon">{current.icon}</span>}
        <span className="filter-dd-button-text">
          {current?.selectedLabel ?? current?.label ?? '—'}
        </span>
        <span className="filter-dd-chevron" aria-hidden>
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
            <path d="M2 3.5 L5 6.5 L8 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </span>
      </button>

      {open && (
        <div className={`filter-dd-popover align-${align}`} role="listbox" aria-label={label}>
          {searchable && (
            <div className="filter-dd-search">
              <svg width="13" height="13" viewBox="0 0 14 14" fill="none" aria-hidden>
                <circle cx="6" cy="6" r="4" stroke="currentColor" strokeWidth="1.5" fill="none"/>
                <path d="M9 9 L12 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              <input
                type="text"
                placeholder={searchPlaceholder ?? 'Rechercher…'}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                autoFocus
              />
            </div>
          )}
          <div className="filter-dd-list">
            {renderedList.length === 0 && (
              <div className="filter-dd-empty">—</div>
            )}
            {renderedList.map((row, i) => {
              if (row.type === 'header') {
                return <div key={`h-${i}`} className="filter-dd-group">{row.label}</div>;
              }
              const opt = row.opt;
              const isActive = opt.value === value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  role="option"
                  aria-selected={isActive}
                  className={`filter-dd-opt ${isActive ? 'active' : ''}`}
                  onClick={() => { onChange(opt.value); setOpen(false); }}
                >
                  {opt.icon && <span className="filter-dd-opt-icon">{opt.icon}</span>}
                  <span className="filter-dd-opt-label">{opt.label}</span>
                  {isActive && (
                    <span className="filter-dd-opt-check" aria-hidden>
                      <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
                        <path d="M2 7 L6 11 L12 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
