import { DEFAULT_PREFS, FORMS } from "../data/moods";
import type {
  BatchCache,
  ContentWarning,
  HistoryRecord,
  ShownRecord,
  StoredPrefs,
} from "./types";

const HISTORY_KEY = "duwan:history:v1";
const PREFS_KEY = "duwan:prefs:v1";
const SHOWN_KEY = "duwan:shown:v1";
const BATCH_KEY = "duwan:batch:v1";
const SESSION_KEY = "duwan:session:v1";
const SHOWN_WINDOW_MS = 7 * 24 * 60 * 60 * 1000;
let fallbackNonce = "";

function readJson<T>(key: string): T | null {
  try {
    const value = window.localStorage.getItem(key);
    return value ? (JSON.parse(value) as T) : null;
  } catch {
    return null;
  }
}

function writeJson(key: string, value: unknown): void {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Local storage may be unavailable; the reading flow still works for this session.
  }
}

export function loadHistory(): HistoryRecord[] {
  const value = readJson<HistoryRecord[]>(HISTORY_KEY);
  if (!Array.isArray(value)) return [];
  return value.filter(
    (item) =>
      typeof item?.id === "string" &&
      typeof item?.unitId === "string" &&
      typeof item?.finishedAt === "string",
  );
}

export function saveHistory(records: HistoryRecord[]): void {
  writeJson(HISTORY_KEY, records);
}

export function makeHistoryId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `read-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function recentUnitIds(records: HistoryRecord[], limit = 8): string[] {
  const ids: string[] = [];
  for (const record of records) {
    if (!ids.includes(record.unitId)) ids.push(record.unitId);
    if (ids.length >= limit) break;
  }
  return ids;
}

export function loadShown(): ShownRecord[] {
  const value = readJson<ShownRecord[]>(SHOWN_KEY);
  if (!Array.isArray(value)) return [];
  const cutoff = Date.now() - SHOWN_WINDOW_MS;
  return value.filter((item) => {
    if (typeof item?.unitId !== "string" || typeof item?.shownAt !== "string") return false;
    const time = Date.parse(item.shownAt);
    return Number.isFinite(time) && time >= cutoff;
  });
}

export function shownUnitIds(): string[] {
  return loadShown()
    .sort((a, b) => Date.parse(b.shownAt) - Date.parse(a.shownAt))
    .map((item) => item.unitId);
}

export function recordShown(unitIds: string[]): void {
  if (unitIds.length === 0) return;
  const now = new Date().toISOString();
  const byId = new Map(loadShown().map((item) => [item.unitId, item]));
  unitIds.forEach((unitId) => byId.set(unitId, { unitId, shownAt: now }));
  const kept = [...byId.values()].sort(
    (a, b) => Date.parse(b.shownAt) - Date.parse(a.shownAt),
  );
  writeJson(SHOWN_KEY, kept.slice(0, 300));
}

export function loadBatchCache(): BatchCache | null {
  const value = readJson<BatchCache>(BATCH_KEY);
  if (!value || typeof value.seed !== "string" || !Array.isArray(value.ids)) return null;
  return value;
}

export function saveBatchCache(cache: BatchCache): void {
  writeJson(BATCH_KEY, cache);
}

export function getSessionNonce(): string {
  try {
    const existing = window.sessionStorage.getItem(SESSION_KEY);
    if (existing) return existing;
    const nonce =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    window.sessionStorage.setItem(SESSION_KEY, nonce);
    return nonce;
  } catch {
    if (!fallbackNonce) {
      fallbackNonce = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    }
    return fallbackNonce;
  }
}

export function loadPrefs(): StoredPrefs {
  const value = readJson<Partial<StoredPrefs>>(PREFS_KEY);
  if (!value) return { ...DEFAULT_PREFS };
  const minutes = value.minutes === 5 || value.minutes === 25 ? value.minutes : 15;
  const form = FORMS.some((item) => item.value === value.form) ? value.form! : "any";
  const avoid = Array.isArray(value.avoid) ? (value.avoid as ContentWarning[]) : [];
  return { minutes, form, avoid };
}

export function savePrefs(prefs: StoredPrefs): void {
  writeJson(PREFS_KEY, prefs);
}

export function formatDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, "0")}.${String(
    date.getDate(),
  ).padStart(2, "0")}`;
}

export function formatClock(seconds: number): string {
  const safe = Math.max(0, Math.floor(seconds));
  const minutes = Math.floor(safe / 60);
  const rest = safe % 60;
  return `${String(minutes).padStart(2, "0")}:${String(rest).padStart(2, "0")}`;
}
