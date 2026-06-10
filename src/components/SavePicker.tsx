import { useEffect, useRef, useState } from 'react';
import { useT } from '../i18n';
import { useSim } from '../store/SimulationStore';
import { listSlots, saveSlot, deleteSlot, type SaveSlot } from '../lib/saveSlots';

function formatRelative(iso: string, t: ReturnType<typeof useT>['t']): string {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return '';
  const diffMs = Date.now() - then;
  const m = Math.floor(diffMs / 60000);
  if (m < 1) return t.save.relativeTime.now;
  if (m < 60) return t.save.relativeTime.mAgo.replace('{n}', String(m));
  const h = Math.floor(m / 60);
  if (h < 24) return t.save.relativeTime.hAgo.replace('{n}', String(h));
  const d = Math.floor(h / 24);
  return t.save.relativeTime.dAgo.replace('{n}', String(d));
}

export function SavePicker() {
  const { t } = useT();
  const { getSnapshot, loadSnapshot } = useSim();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [slots, setSlots] = useState<SaveSlot[]>([]);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    setSlots(listSlots());
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

  const refresh = () => setSlots(listSlots());

  const handleSave = () => {
    const trimmed = name.trim();
    const existing = trimmed ? slots.find(s => s.name === trimmed) : null;
    if (existing && !confirm(t.save.overwriteConfirm)) return;
    const snap = getSnapshot(trimmed || undefined);
    saveSlot(trimmed, snap);
    setName('');
    refresh();
  };

  const handleLoad = (slot: SaveSlot) => {
    if (!confirm(t.save.loadConfirm.replace('{name}', slot.name))) return;
    loadSnapshot(slot.snapshot);
    setOpen(false);
  };

  const handleDelete = (slot: SaveSlot) => {
    if (!confirm(t.save.deleteConfirm.replace('{name}', slot.name))) return;
    deleteSlot(slot.id);
    refresh();
  };

  return (
    <div ref={rootRef} className={`save-picker ${open ? 'is-open' : ''}`}>
      <button
        type="button"
        className="btn btn-save"
        onClick={() => setOpen(o => !o)}
        title={t.save.buttonTitle}
        aria-haspopup="dialog"
        aria-expanded={open}
      >
        <svg width="13" height="13" viewBox="0 0 14 14" fill="none" aria-hidden>
          <path d="M2.5 2.5 h7 l2 2 v7 a0.5 0.5 0 0 1 -0.5 0.5 h-8 a0.5 0.5 0 0 1 -0.5 -0.5 v-9 a0.5 0.5 0 0 1 0.5 -0.5 z M4 2.5 v3 h5 v-3 M4 12 v-4 h5 v4" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" fill="none"/>
        </svg>
        <span>{t.save.button}</span>
      </button>
      {open && (
        <div className="save-popover" role="dialog" aria-label={t.save.popoverTitle}>
          <div className="save-popover-header">{t.save.popoverTitle}</div>
          <div className="save-row">
            <input
              type="text"
              className="save-input"
              placeholder={t.save.namePlaceholder}
              value={name}
              onChange={e => setName(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') handleSave(); }}
            />
            <button
              type="button"
              className="save-action"
              onClick={handleSave}
              title={t.save.saveActionTitle}
            >
              {t.save.saveAction}
            </button>
          </div>
          <div className="save-list">
            {slots.length === 0 && (
              <div className="save-empty">{t.save.empty}</div>
            )}
            {slots.map(slot => (
              <div key={slot.id} className="save-item">
                <div className="save-item-info">
                  <div className="save-item-name">{slot.name}</div>
                  <div className="save-item-meta">{formatRelative(slot.savedAt, t)}</div>
                </div>
                <div className="save-item-actions">
                  <button
                    type="button"
                    className="save-item-btn"
                    onClick={() => handleLoad(slot)}
                  >
                    {t.save.load}
                  </button>
                  <button
                    type="button"
                    className="save-item-btn danger"
                    onClick={() => handleDelete(slot)}
                    aria-label={t.save.delete}
                    title={t.save.delete}
                  >
                    <svg width="12" height="12" viewBox="0 0 14 14" fill="none" aria-hidden>
                      <path d="M3 4 h8 M5.5 4 v-1.5 h3 v1.5 M4 4 l0.5 8 a0.5 0.5 0 0 0 0.5 0.5 h4 a0.5 0.5 0 0 0 0.5 -0.5 l0.5 -8" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
