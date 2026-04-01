/**
 * Machine-translate dashboard locale strings where merged value still equals English.
 * Uses MyMemory public API (rate-limit friendly). Respects placeholders {name}, {{x}}.
 * Skips: en (source), nb (human baseline).
 *
 * Cache: scripts/.i18n-machine-cache.json (safe to commit or gitignore)
 *
 * Usage:
 *   pnpm exec tsx scripts/machine-translate-locales.ts
 *   pnpm exec tsx scripts/machine-translate-locales.ts --locale=ar
 */
import * as fs from "node:fs";
import * as path from "node:path";
import { fileURLToPath } from "node:url";

import type { AppLocale } from "../src/i18n/translations";
import { translations } from "../src/i18n/translations";
import { en } from "../src/i18n/locales/en/index";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CACHE_PATH = path.join(__dirname, ".i18n-machine-cache.json");
const LOCALES_ROOT = path.join(__dirname, "../src/i18n/locales");

const TARGETS: AppLocale[] = [
  "ar",
  "so",
  "ti",
  "am",
  "tr",
  "pl",
  "vi",
  "zh",
  "tl",
  "fa",
  "dar",
  "ur",
  "hi",
];

/** MyMemory langpair target codes */
const LANG_PAIR: Record<AppLocale, string | null> = {
  nb: null,
  en: null,
  ar: "ar",
  so: "so",
  ti: "ti",
  am: "am",
  tr: "tr",
  pl: "pl",
  vi: "vi",
  zh: "zh-CN",
  tl: "tl",
  fa: "fa",
  dar: "fa",
  ur: "ur",
  hi: "hi",
};

const BRAND_TOKENS: [RegExp, string][] = [
  [/TeqBook/g, "__TEQBOOK__"],
  [/Supabase/g, "__SUPABASE__"],
  [/Postgres/g, "__POSTGRES__"],
  [/Stripe/g, "__STRIPE__"],
];

function flattenLeaves(value: unknown, prefix = "", out: Record<string, string> = {}): Record<string, string> {
  if (typeof value === "string") {
    out[prefix] = value;
    return out;
  }
  if (value && typeof value === "object" && !Array.isArray(value)) {
    for (const [k, v] of Object.entries(value)) {
      const p = prefix ? `${prefix}.${k}` : k;
      flattenLeaves(v, p, out);
    }
  }
  return out;
}

/** ASCII markers — MyMemory strips/damages Unicode private-use placeholder sentinels. */
const PH_WRAP = (i: number) => `ZZZ_PH_${i}_ZZZ`;

function protectPlaceholders(s: string): { text: string; slots: string[] } {
  const slots: string[] = [];
  const text = s.replace(/\{\{?\w+\}?\}/g, (m) => {
    const i = slots.length;
    slots.push(m);
    return PH_WRAP(i);
  });
  return { text, slots };
}

function restorePlaceholders(s: string, slots: string[]): string {
  return s.replace(/ZZZ_PH_(\d+)_ZZZ/g, (_, idx) => slots[Number(idx)] ?? "");
}

const PLACEHOLDER_REGEX = /\{\{?\w+\}?\}/g;

function placeholderSignature(text: string): string {
  return [...(text.match(PLACEHOLDER_REGEX) ?? [])].sort().join("|");
}

function placeholdersMatch(sourceEnglish: string, translated: string): boolean {
  return placeholderSignature(sourceEnglish) === placeholderSignature(translated);
}

function applyBrandMask(s: string): string {
  let t = s;
  for (const [re, tok] of BRAND_TOKENS) {
    t = t.replace(re, tok);
  }
  return t;
}

function unapplyBrandMask(s: string): string {
  let t = s;
  t = t.replace(/__TEQBOOK__/g, "TeqBook");
  t = t.replace(/__SUPABASE__/g, "Supabase");
  t = t.replace(/__POSTGRES__/g, "Postgres");
  t = t.replace(/__STRIPE__/g, "Stripe");
  return t;
}

type Cache = Record<string, string>;

function loadCache(): Cache {
  try {
    return JSON.parse(fs.readFileSync(CACHE_PATH, "utf8")) as Cache;
  } catch {
    return {};
  }
}

function saveCache(c: Cache): void {
  fs.writeFileSync(CACHE_PATH, JSON.stringify(c, null, 2), "utf8");
}

function cacheKey(pair: string, text: string): string {
  return `${pair}::${text}`;
}

async function translateLine(text: string, pair: string, cache: Cache): Promise<string> {
  const ck = cacheKey(pair, text);
  if (cache[ck]) return cache[ck];
  const url = new URL("https://api.mymemory.translated.net/get");
  url.searchParams.set("q", text.slice(0, 450));
  url.searchParams.set("langpair", pair);

  let lastErr: Error | null = null;
  for (let attempt = 0; attempt < 4; attempt++) {
    try {
      const res = await fetch(url.toString());
      const data = (await res.json()) as {
        responseStatus?: number;
        responseData?: { translatedText?: string };
      };
      const out = data.responseData?.translatedText?.trim();
      if (out && data.responseStatus === 200) {
        cache[ck] = out;
        return out;
      }
      lastErr = new Error(String(data.responseStatus));
    } catch (e) {
      lastErr = e instanceof Error ? e : new Error(String(e));
    }
    await sleep(800 * (attempt + 1));
  }
  console.warn("translate failed, keeping English:", text.slice(0, 60), lastErr?.message);
  cache[ck] = text;
  return text;
}

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

function escapeTsString(s: string): string {
  return s
    .replace(/\\/g, "\\\\")
    .replace(/"/g, '\\"')
    .replace(/\r\n/g, "\n")
    .replace(/\n/g, "\\n");
}

function namespaceOfPath(p: string): string {
  return p.split(".")[0] ?? "";
}

/** Build nested object from flat paths under a namespace prefix */
function nestUnderNamespace(flat: Record<string, string>, ns: string): Record<string, unknown> {
  const prefix = `${ns}.`;
  const root: Record<string, unknown> = {};
  for (const [path, val] of Object.entries(flat)) {
    if (!path.startsWith(prefix)) continue;
    const rest = path.slice(prefix.length);
    const parts = rest.split(".");
    let cur: Record<string, unknown> = root;
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i]!;
      if (i === parts.length - 1) {
        cur[part] = val;
      } else {
        if (!cur[part] || typeof cur[part] !== "object") {
          cur[part] = {};
        }
        cur = cur[part] as Record<string, unknown>;
      }
    }
  }
  return root;
}

function serializeNamespaceObject(obj: Record<string, unknown>, indent: string): string {
  const lines: string[] = [];
  const keys = Object.keys(obj).sort();
  for (const k of keys) {
    const v = obj[k];
    if (typeof v === "string") {
      lines.push(`${indent}${k}: "${escapeTsString(v)}",`);
    } else if (v && typeof v === "object" && !Array.isArray(v)) {
      lines.push(`${indent}${k}: {`);
      lines.push(serializeNamespaceObject(v as Record<string, unknown>, indent + "    "));
      lines.push(`${indent}},`);
    }
  }
  return lines.join("\n");
}

function writeNamespaceFile(locale: AppLocale, ns: string, tree: Record<string, unknown>): void {
  const dir = path.join(LOCALES_ROOT, locale);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  const varName = ns === "publicBooking" ? "publicBooking" : ns;
  const body = serializeNamespaceObject(tree, "    ");
  const content = `import type { TranslationNamespaces } from '../../types';

export const ${varName}: TranslationNamespaces['${ns}'] = {
${body}
  };
`;
  const outPath = path.join(dir, `${ns}.ts`);
  fs.writeFileSync(outPath, content, "utf8");
}

function argNum(name: string): number | null {
  const eq = process.argv.find((a) => a.startsWith(`${name}=`));
  if (eq) return Number(eq.split("=", 2)[1]);
  const i = process.argv.indexOf(name);
  if (i === -1 || !process.argv[i + 1]) return null;
  return Number(process.argv[i + 1]);
}

function argLocale(): AppLocale | null {
  const eq = process.argv.find((a) => a.startsWith("--locale="));
  if (eq) return eq.split("=", 2)[1] as AppLocale;
  const i = process.argv.indexOf("--locale");
  if (i !== -1 && process.argv[i + 1]) return process.argv[i + 1] as AppLocale;
  return null;
}

async function main(): Promise<void> {
  const only = argLocale();
  const maxStrings = argNum("--max-strings");

  const enFlat = flattenLeaves(en);
  const namespaces = [...new Set(Object.keys(enFlat).map(namespaceOfPath))].sort();

  const cache = loadCache();
  const delayMs = 180;

  const runLocales = only
    ? TARGETS.includes(only)
      ? [only]
      : []
    : TARGETS;

  if (only && runLocales.length === 0) {
    console.error("Unknown or skipped locale:", only);
    process.exit(1);
  }

  for (const loc of runLocales) {
    const pairCode = LANG_PAIR[loc];
    if (!pairCode) continue;
    const pair = `en|${pairCode}`;
    console.log(`\n=== ${loc} (${pair}) ===`);

    const curFlat = flattenLeaves(translations[loc]);
    const toTranslate = new Map<string, Set<string>>();

    for (const p of Object.keys(enFlat)) {
      if (curFlat[p] !== enFlat[p]) continue;
      const text = enFlat[p]!;
      if (!text.trim()) continue;
      if (!toTranslate.has(text)) toTranslate.set(text, new Set());
      toTranslate.get(text)!.add(p);
    }

    console.log(`  paths still English: ${[...toTranslate.values()].reduce((a, s) => a + s.size, 0)}`);
    console.log(`  unique source strings: ${toTranslate.size}`);

    let n = 0;
    const translatedByPath: Record<string, string> = { ...curFlat };
    const entries = [...toTranslate.entries()];
    if (maxStrings != null && Number.isFinite(maxStrings)) {
      entries.splice(maxStrings);
    }

    for (const [english, paths] of entries) {
      const maskedBrand = applyBrandMask(english);
      const { text: phProtected, slots } = protectPlaceholders(maskedBrand);
      const translated = await translateLine(phProtected, pair, cache);
      let restored = unapplyBrandMask(restorePlaceholders(translated, slots));
      if (!placeholdersMatch(english, restored)) {
        console.warn("placeholder mismatch after MT, keeping English:", english.slice(0, 72));
        restored = english;
      }
      for (const p of paths) {
        translatedByPath[p] = restored;
      }
      n++;
      if (n % 25 === 0) {
        saveCache(cache);
        console.log(`  ... ${n}/${toTranslate.size}`);
      }
      await sleep(delayMs);
    }

    saveCache(cache);

    if (maxStrings != null && Number.isFinite(maxStrings)) {
      console.log("  (--max-strings: skipping file writes)");
      continue;
    }

    for (const ns of namespaces) {
      const tree = nestUnderNamespace(translatedByPath, ns) as Record<string, unknown>;
      if (Object.keys(tree).length === 0) continue;
      writeNamespaceFile(loc, ns, tree);
      console.log(`  wrote ${loc}/${ns}.ts`);
    }
  }

  saveCache(cache);
  console.log("\nDone. Run: pnpm exec tsc --noEmit && pnpm run test:i18n:all");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
