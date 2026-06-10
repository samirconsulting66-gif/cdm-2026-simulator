import { isValidSnapshot, type SimSnapshot } from './snapshot';

const LS_KEY = 'cdm2026-save-slots';
const MAX_SLOTS = 30;

export interface SaveSlot {
  id: string;
  name: string;
  savedAt: string;
  snapshot: SimSnapshot;
}

function readAll(): SaveSlot[] {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((s): s is SaveSlot =>
      s && typeof s === 'object'
      && typeof s.id === 'string'
      && typeof s.name === 'string'
      && typeof s.savedAt === 'string'
      && isValidSnapshot(s.snapshot)
    );
  } catch {
    return [];
  }
}

function writeAll(slots: SaveSlot[]): void {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(slots));
  } catch { /* ignore quota */ }
}

export function listSlots(): SaveSlot[] {
  return readAll().sort((a, b) => b.savedAt.localeCompare(a.savedAt));
}

export function saveSlot(name: string, snapshot: SimSnapshot): SaveSlot {
  const trimmed = name.trim() || defaultName();
  const slots = readAll();
  const existing = slots.find(s => s.name === trimmed);
  if (existing) {
    existing.snapshot = { ...snapshot, name: trimmed };
    existing.savedAt = snapshot.savedAt;
    writeAll(slots);
    return existing;
  }
  const slot: SaveSlot = {
    id: makeId(),
    name: trimmed,
    savedAt: snapshot.savedAt,
    snapshot: { ...snapshot, name: trimmed },
  };
  const next = [slot, ...slots].slice(0, MAX_SLOTS);
  writeAll(next);
  return slot;
}

export function deleteSlot(id: string): void {
  writeAll(readAll().filter(s => s.id !== id));
}

export function renameSlot(id: string, newName: string): void {
  const trimmed = newName.trim();
  if (!trimmed) return;
  const slots = readAll();
  const slot = slots.find(s => s.id === id);
  if (!slot) return;
  slot.name = trimmed;
  slot.snapshot = { ...slot.snapshot, name: trimmed };
  writeAll(slots);
}

function makeId(): string {
  return `slot-${Date.now()}-${Math.floor(Math.random() * 1e6)}`;
}

function defaultName(): string {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
