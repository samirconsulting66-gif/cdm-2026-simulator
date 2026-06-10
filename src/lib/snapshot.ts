import type { GroupMatch, KnockoutMatch } from '../types';

export const SNAPSHOT_VERSION = 1;
export const SNAPSHOT_TYPE = 'cdm2026-sim-snapshot';

export interface SimSnapshotData {
  groupMatches: GroupMatch[];
  knockout: KnockoutMatch[];
  forceOverrides: Record<string, number>;
  simFactor: number;
}

export interface SimSnapshot {
  type: typeof SNAPSHOT_TYPE;
  version: number;
  savedAt: string;
  name?: string;
  data: SimSnapshotData;
}

export function createSnapshot(data: SimSnapshotData, name?: string): SimSnapshot {
  return {
    type: SNAPSHOT_TYPE,
    version: SNAPSHOT_VERSION,
    savedAt: new Date().toISOString(),
    name,
    data: {
      groupMatches: data.groupMatches,
      knockout: data.knockout,
      forceOverrides: { ...data.forceOverrides },
      simFactor: data.simFactor,
    },
  };
}

export function isValidSnapshot(obj: unknown): obj is SimSnapshot {
  if (!obj || typeof obj !== 'object') return false;
  const s = obj as Partial<SimSnapshot>;
  if (s.type !== SNAPSHOT_TYPE) return false;
  if (typeof s.version !== 'number') return false;
  if (!s.data || typeof s.data !== 'object') return false;
  const d = s.data as Partial<SimSnapshotData>;
  return Array.isArray(d.groupMatches)
      && Array.isArray(d.knockout)
      && typeof d.forceOverrides === 'object' && d.forceOverrides !== null
      && typeof d.simFactor === 'number';
}

export function downloadSnapshot(snap: SimSnapshot, filename?: string) {
  const fname = filename ?? defaultFilename(snap);
  const json = JSON.stringify(snap, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fname;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 0);
}

export function defaultFilename(snap: SimSnapshot): string {
  const stamp = snap.savedAt.replace(/[:.]/g, '-').replace('T', '_').slice(0, 19);
  const base = snap.name ? slugify(snap.name) : 'simulation';
  return `cdm2026-${base}-${stamp}.json`;
}

function slugify(s: string): string {
  return s
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-zA-Z0-9-_]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase()
    .slice(0, 40) || 'simulation';
}

export function readSnapshotFile(file: File): Promise<SimSnapshot> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Lecture du fichier impossible'));
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result));
        if (!isValidSnapshot(parsed)) {
          reject(new Error('Fichier invalide : ce n’est pas un snapshot du simulateur'));
          return;
        }
        resolve(parsed);
      } catch {
        reject(new Error('Fichier JSON invalide'));
      }
    };
    reader.readAsText(file);
  });
}
