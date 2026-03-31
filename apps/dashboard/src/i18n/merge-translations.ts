import type { TranslationNamespaces } from "./types";

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

/** Deep-merge string maps: partial wins on leaves; base fills missing keys. */
function mergeStringLeaves(
  base: Record<string, unknown>,
  partial: Record<string, unknown>,
): Record<string, unknown> {
  const out: Record<string, unknown> = { ...base };
  for (const [key, val] of Object.entries(partial)) {
    if (val === undefined) continue;
    const existing = out[key];
    if (isRecord(existing) && isRecord(val)) {
      out[key] = mergeStringLeaves(existing, val);
    } else {
      out[key] = val;
    }
  }
  return out;
}

/**
 * Fills missing keys vs English so parity tests and UI never see `undefined`
 * for locales that are only partly translated.
 */
export function mergeWithEnglishBase(
  base: TranslationNamespaces,
  partial: TranslationNamespaces,
): TranslationNamespaces {
  const out = structuredClone(base) as TranslationNamespaces;
  for (const k of Object.keys(partial) as (keyof TranslationNamespaces)[]) {
    const b = out[k] as unknown as Record<string, unknown>;
    const p = partial[k] as unknown as Record<string, unknown>;
    if (isRecord(b) && isRecord(p)) {
      (out as Record<string, unknown>)[k as string] = mergeStringLeaves(b, p);
    }
  }
  return out;
}
