import { useEffect, useRef, useState } from 'react';
import { useT } from '../i18n';
import { useSim } from '../store/SimulationStore';
import { downloadSnapshot, readSnapshotFile } from '../lib/snapshot';

export function ExportPicker() {
  const { t } = useT();
  const { getSnapshot, loadSnapshot } = useSim();
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) {
      setError(null);
      return;
    }
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

  const handleExport = () => {
    const snap = getSnapshot();
    downloadSnapshot(snap);
    setOpen(false);
  };

  const handlePickFile = () => fileRef.current?.click();

  const handleFile = async (file: File | null) => {
    if (!file) return;
    setError(null);
    try {
      const snap = await readSnapshotFile(file);
      if (!confirm(t.exportio.importConfirm)) return;
      loadSnapshot(snap);
      setOpen(false);
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      setError(t.exportio.importError.replace('{msg}', msg));
    } finally {
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  return (
    <div ref={rootRef} className={`export-picker ${open ? 'is-open' : ''}`}>
      <button
        type="button"
        className="btn btn-export"
        onClick={() => setOpen(o => !o)}
        title={t.exportio.buttonTitle}
        aria-haspopup="dialog"
        aria-expanded={open}
      >
        <svg width="13" height="13" viewBox="0 0 14 14" fill="none" aria-hidden>
          <path d="M7 1.5 v8 M4 6 l3 3 3 -3 M2.5 11.5 h9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
        </svg>
        <span>{t.exportio.button}</span>
      </button>
      {open && (
        <div className="export-popover" role="dialog" aria-label={t.exportio.popoverTitle}>
          <div className="export-popover-header">{t.exportio.popoverTitle}</div>
          <button
            type="button"
            className="export-action"
            onClick={handleExport}
            title={t.exportio.exportActionTitle}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
              <path d="M7 1.5 v8 M4 6 l3 3 3 -3 M2.5 11.5 h9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
            </svg>
            <span>{t.exportio.exportAction}</span>
          </button>
          <button
            type="button"
            className="export-action"
            onClick={handlePickFile}
            title={t.exportio.importActionTitle}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
              <path d="M7 9.5 v-8 M4 5 l3 -3 3 3 M2.5 11.5 h9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
            </svg>
            <span>{t.exportio.importAction}</span>
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="application/json,.json"
            style={{ display: 'none' }}
            onChange={e => handleFile(e.target.files?.[0] ?? null)}
          />
          {error && <div className="export-error">{error}</div>}
        </div>
      )}
    </div>
  );
}
