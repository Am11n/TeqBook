import type { ColumnDef, SavedView } from "./types";

export function loadSavedViews(storageKey: string): SavedView[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem(`dt-views-${storageKey}`);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

export function saveSavedViews(storageKey: string, views: SavedView[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(`dt-views-${storageKey}`, JSON.stringify(views));
  } catch {
    /* ignore */
  }
}

export function loadColumnVisibility(
  storageKey: string,
  columns: ColumnDef<unknown>[],
): Record<string, boolean> {
  if (typeof window === "undefined") {
    return Object.fromEntries(columns.map((col) => [col.id, col.defaultVisible !== false]));
  }
  try {
    const stored = localStorage.getItem(`dt-cols-${storageKey}`);
    if (stored) return JSON.parse(stored);
  } catch {
    /* fall through */
  }
  return Object.fromEntries(columns.map((col) => [col.id, col.defaultVisible !== false]));
}

export function saveColumnVisibility(storageKey: string, visibility: Record<string, boolean>) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(`dt-cols-${storageKey}`, JSON.stringify(visibility));
  } catch {
    /* ignore */
  }
}
