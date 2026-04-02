/**
 * Machine-translate dashboard locale strings where merged value still equals English.
 * Respects placeholders {name}, {{x}} via ZZZ_PH_* sentinels. Skips: en (source), nb (human baseline).
 *
 * Backends (pick with MT_ENGINE or auto-detect):
 * - groq — https://console.groq.com (free tier; daily TPD cap — add OPENAI_API_KEY for auto-fallback)
 * - openai — OPENAI_API_KEY
 * - ollama — local LLM, no cloud key: install https://ollama.com then OLLAMA_MT_MODEL=llama3.2 MT_ENGINE=ollama
 * - libretranslate — self-hosted URL and/or LIBRETRANSLATE_API_KEY (official cloud requires key)
 *
 * Cache: scripts/.i18n-machine-cache.json
 *
 * Usage:
 *   pnpm exec tsx scripts/machine-translate-locales.ts
 *   pnpm exec tsx scripts/machine-translate-locales.ts --locale=pl
 *   pnpm exec tsx scripts/machine-translate-locales.ts --skip-locale=ar,nb
 *   MT_ENGINE=openai MT_DELAY_MS=400 pnpm exec tsx scripts/machine-translate-locales.ts
 */
import * as fs from "node:fs";
import * as path from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";

import type { AppLocale } from "../src/i18n/translations";
import { translations } from "../src/i18n/translations";
import { en } from "../src/i18n/locales/en/index";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, "../.env") });
dotenv.config({ path: path.join(__dirname, "../.env.local"), override: true });
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

/** Target language label for LLM prompts (English → X). */
const LOCALE_LABEL: Record<AppLocale, string> = {
  nb: "Norwegian Bokmål",
  en: "English",
  ar: "Arabic",
  so: "Somali",
  ti: "Tigrinya",
  am: "Amharic",
  tr: "Turkish",
  pl: "Polish",
  vi: "Vietnamese",
  zh: "Simplified Chinese",
  tl: "Tagalog (Filipino)",
  fa: "Persian (Farsi)",
  dar: "Dari (Eastern Persian)",
  ur: "Urdu",
  hi: "Hindi",
};

/**
 * LibreTranslate `target` codes from English (public instance language list).
 * Locales missing here are only supported via LLM backends.
 */
const LIBRETRANSLATE_TARGET: Partial<Record<AppLocale, string>> = {
  ar: "ar",
  tr: "tr",
  pl: "pl",
  vi: "vi",
  zh: "zh-Hans",
  tl: "tl",
  fa: "fa",
  dar: "fa",
  ur: "ur",
  hi: "hi",
};

type MtEngine = "groq" | "openai" | "ollama" | "libretranslate";

function ollamaModelName(): string {
  return (process.env.OLLAMA_MT_MODEL ?? process.env.OLLAMA_MODEL ?? "").trim();
}

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

function cacheKey(engine: MtEngine, locale: AppLocale, text: string): string {
  return `v5|${engine}|${locale}::${text}`;
}

function zzzMarkers(text: string): string[] {
  return [...text.matchAll(/ZZZ_PH_\d+_ZZZ/g)].map((m) => m[0]);
}

function resolveEngine(): MtEngine {
  const raw = process.env.MT_ENGINE?.trim().toLowerCase();
  if (raw === "groq") {
    if (!process.env.GROQ_API_KEY?.trim()) {
      console.error("MT_ENGINE=groq requires GROQ_API_KEY");
      process.exit(1);
    }
    return "groq";
  }
  if (raw === "openai") {
    if (!process.env.OPENAI_API_KEY?.trim()) {
      console.error("MT_ENGINE=openai requires OPENAI_API_KEY");
      process.exit(1);
    }
    return "openai";
  }
  if (raw === "libretranslate") {
    return "libretranslate";
  }
  if (raw === "ollama") {
    if (!ollamaModelName()) {
      console.error("MT_ENGINE=ollama requires OLLAMA_MT_MODEL or OLLAMA_MODEL (e.g. llama3.2)");
      process.exit(1);
    }
    return "ollama";
  }
  if (process.env.GROQ_API_KEY?.trim()) return "groq";
  if (process.env.OPENAI_API_KEY?.trim()) return "openai";
  if (ollamaModelName()) return "ollama";
  if (
    process.env.LIBRETRANSLATE_API_KEY?.trim() ||
    process.env.LIBRETRANSLATE_URL?.trim()
  ) {
    return "libretranslate";
  }
  console.error(`
No translation backend configured. Add one of:

  GROQ_API_KEY       — free: https://console.groq.com
  OPENAI_API_KEY     — https://platform.openai.com
  OLLAMA_MT_MODEL    — local: https://ollama.com (e.g. llama3.2) + MT_ENGINE=ollama
  LIBRETRANSLATE_URL — self-hosted, e.g. http://127.0.0.1:5000
  LIBRETRANSLATE_API_KEY + default cloud — https://portal.libretranslate.com

Optional: MT_ENGINE=groq|openai|ollama|libretranslate to force a backend.
See apps/dashboard/.env.example
`);
  process.exit(1);
}

function stripSurroundingQuotes(s: string): string {
  const t = s.trim();
  if ((t.startsWith('"') && t.endsWith('"')) || (t.startsWith("«") && t.endsWith("»"))) {
    return t.slice(1, -1).trim();
  }
  return t;
}

/** Parse Groq-style "try again in 1m46.27s" / "try again in 90s" → milliseconds (capped). */
function parseRetryAfterMs(message: string): number | null {
  const mMin = message.match(/try again in\s+(\d+)m([\d.]+)s/i);
  if (mMin) {
    const sec = Number(mMin[1]) * 60 + Math.ceil(Number(mMin[2]));
    return Math.min(Math.max(sec * 1000, 5000), 600_000);
  }
  const mSec = message.match(/try again in\s+([\d.]+)s/i);
  if (mSec) {
    const sec = Math.ceil(Number(mSec[1]));
    return Math.min(Math.max(sec * 1000, 5000), 600_000);
  }
  return null;
}

function isLlmRateLimitError(message: string, httpStatus: number): boolean {
  const m = message.toLowerCase();
  return (
    httpStatus === 429 ||
    m.includes("rate limit") ||
    m.includes("tokens per day") ||
    m.includes("too many requests")
  );
}

function translationSystemAndUser(
  text: string,
  locale: AppLocale,
  opts?: { strictRetry?: boolean },
): { system: string; user: string } {
  const lang = LOCALE_LABEL[locale];
  const system = `You translate short UI strings for a salon booking web app.
Rules:
- Output ONLY the translated text. No quotes, labels, or explanations.
- Every substring matching ZZZ_PH_<digits>_ZZZ is a sacred placeholder: copy each one EXACTLY (same digits, same underscores, same Z letters) into your output. Never omit, renumber, split, or add spaces inside them.
- Keep brand tokens exactly: __TEQBOOK__, __SUPABASE__, __POSTGRES__, __STRIPE__.
- Preserve numbers, punctuation, and line breaks unless the target language requires normal typographic rules.`;

  const markers = zzzMarkers(text);
  let user =
    markers.length > 0
      ? `Translate from English to ${lang}.
Required verbatim substrings (must all appear unchanged in your output, same order): ${markers.join(", ")}

${text}`
      : `Translate from English to ${lang}:\n\n${text}`;

  if (opts?.strictRetry) {
    user += `\n\nCRITICAL: Your previous answer dropped or altered ZZZ_PH_* tokens. Output again; include every ZZZ_PH_N_ZZZ from the source above exactly once and unchanged.`;
  }

  return { system, user };
}

async function translateOllama(
  text: string,
  locale: AppLocale,
  opts?: { strictRetry?: boolean },
): Promise<string | null> {
  const model = ollamaModelName();
  if (!model) return null;

  const host = (process.env.OLLAMA_HOST?.trim() || "http://127.0.0.1:11434").replace(/\/$/, "");
  const { system, user } = translationSystemAndUser(text, locale, opts);

  let lastErr: Error | null = null;
  for (let attempt = 0; attempt < 6; attempt++) {
    try {
      const res = await fetch(`${host}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model,
          stream: false,
          messages: [
            { role: "system", content: system },
            { role: "user", content: user },
          ],
          options: { temperature: 0.15, num_predict: 2048 },
        }),
      });
      const data = (await res.json()) as {
        error?: string;
        message?: { content?: string };
      };
      const errText = data.error ?? "";
      if (!res.ok || errText) {
        lastErr = new Error(errText || `${res.status}`);
        await sleep(2000 + attempt * 2000);
        continue;
      }
      const content = data.message?.content?.trim();
      if (content) return stripSurroundingQuotes(content);
      lastErr = new Error("empty Ollama response");
    } catch (e) {
      lastErr = e instanceof Error ? e : new Error(String(e));
    }
    await sleep(1200 * (attempt + 1));
  }
  console.warn("Ollama translate failed:", text.replace(/ZZZ_PH_\d+_ZZZ/g, "{…}").slice(0, 72), lastErr?.message);
  return null;
}

async function translateLlm(
  text: string,
  locale: AppLocale,
  engine: "groq" | "openai",
  opts?: { strictRetry?: boolean },
): Promise<string | null> {
  const key =
    engine === "groq"
      ? process.env.GROQ_API_KEY?.trim()
      : process.env.OPENAI_API_KEY?.trim();
  if (!key) return null;

  const baseUrl =
    engine === "groq"
      ? (process.env.GROQ_API_BASE?.trim() || "https://api.groq.com/openai/v1").replace(/\/$/, "")
      : (process.env.OPENAI_API_BASE?.trim() || "https://api.openai.com/v1").replace(/\/$/, "");

  const model =
    engine === "groq"
      ? (process.env.GROQ_MT_MODEL?.trim() || "llama-3.3-70b-versatile")
      : (process.env.OPENAI_MT_MODEL?.trim() || "gpt-4o-mini");

  const { system, user } = translationSystemAndUser(text, locale, opts);

  let lastErr: Error | null = null;
  for (let attempt = 0; attempt < 8; attempt++) {
    try {
      const res = await fetch(`${baseUrl}/chat/completions`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${key}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model,
          temperature: 0.15,
          max_tokens: 2048,
          messages: [
            { role: "system", content: system },
            { role: "user", content: user },
          ],
        }),
      });
      const data = (await res.json()) as {
        error?: { message?: string };
        choices?: { message?: { content?: string } }[];
      };
      const errMsg = data.error?.message ?? "";
      if (!res.ok || errMsg) {
        lastErr = new Error(errMsg || `${res.status}`);
        if (isLlmRateLimitError(errMsg, res.status)) {
          const waitMs = parseRetryAfterMs(errMsg) ?? 25_000 + attempt * 15_000;
          console.warn(`LLM rate limit, sleeping ${Math.round(waitMs / 1000)}s…`);
          await sleep(waitMs);
          continue;
        }
        break;
      }
      const content = data.choices?.[0]?.message?.content?.trim();
      if (content) return stripSurroundingQuotes(content);
      lastErr = new Error("empty completion");
    } catch (e) {
      lastErr = e instanceof Error ? e : new Error(String(e));
    }
    await sleep(1200 * (attempt + 1));
  }
  console.warn("LLM translate failed:", text.replace(/ZZZ_PH_\d+_ZZZ/g, "{…}").slice(0, 72), lastErr?.message);
  return null;
}

async function translateLibreTranslate(text: string, locale: AppLocale): Promise<string | null> {
  const target = LIBRETRANSLATE_TARGET[locale];
  if (!target) {
    console.warn(
      `LibreTranslate: locale "${locale}" has no mapped target code on the public engine — use Groq, OpenAI, or local Ollama for this language.`,
    );
    return null;
  }

  const base = (process.env.LIBRETRANSLATE_URL?.trim() || "https://libretranslate.com").replace(/\/$/, "");
  const apiKey = process.env.LIBRETRANSLATE_API_KEY?.trim();

  let lastErr: Error | null = null;
  for (let attempt = 0; attempt < 5; attempt++) {
    try {
      const res = await fetch(`${base}/translate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          q: text.slice(0, 2500),
          source: "en",
          target,
          format: "text",
          ...(apiKey ? { api_key: apiKey } : {}),
        }),
      });
      const data = (await res.json()) as { translatedText?: string; error?: string };
      if (data.translatedText?.trim()) {
        return data.translatedText.trim();
      }
      lastErr = new Error(data.error || `${res.status}`);
      if (res.status === 429) {
        await sleep(8000 + attempt * 5000);
        continue;
      }
    } catch (e) {
      lastErr = e instanceof Error ? e : new Error(String(e));
    }
    await sleep(1200 * (attempt + 1));
  }
  console.warn("LibreTranslate failed:", text.replace(/ZZZ_PH_\d+_ZZZ/g, "{…}").slice(0, 72), lastErr?.message);
  return null;
}

async function fetchRawTranslation(
  phProtected: string,
  locale: AppLocale,
  engine: MtEngine,
  opts?: { strictRetry?: boolean },
): Promise<string | null> {
  if (engine === "libretranslate") return translateLibreTranslate(phProtected, locale);
  if (engine === "ollama") return translateOllama(phProtected, locale, opts);
  if (engine === "groq") {
    let out = await translateLlm(phProtected, locale, "groq", opts);
    const fbOff = process.env.MT_OPENAI_FALLBACK_ON_GROQ_LIMIT?.trim();
    const allowOpenAiFallback =
      fbOff !== "0" &&
      fbOff !== "false" &&
      Boolean(process.env.OPENAI_API_KEY?.trim());
    if (out == null && allowOpenAiFallback) {
      console.warn("Groq returned no translation; trying OpenAI fallback for this string.");
      out = await translateLlm(phProtected, locale, "openai", opts);
    }
    return out;
  }
  return translateLlm(phProtected, locale, "openai", opts);
}

function restoredFromRaw(raw: string | null, slots: string[]): string | null {
  if (raw == null) return null;
  return unapplyBrandMask(restorePlaceholders(raw, slots));
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

function argSkipLocales(): Set<AppLocale> {
  const eq = process.argv.find((a) => a.startsWith("--skip-locale="));
  if (!eq) return new Set();
  const raw = eq.split("=", 2)[1] ?? "";
  return new Set(
    raw
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean) as AppLocale[],
  );
}

async function main(): Promise<void> {
  const engine = resolveEngine();
  console.log(`Translation engine: ${engine}`);

  const only = argLocale();
  const maxStrings = argNum("--max-strings");

  const enFlat = flattenLeaves(en);
  const namespaces = [...new Set(Object.keys(enFlat).map(namespaceOfPath))].sort();

  const cache = loadCache();
  const delayMs = Number(process.env.MT_DELAY_MS) > 0 ? Number(process.env.MT_DELAY_MS) : 400;
  const skipLocales = argSkipLocales();

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
    if (skipLocales.has(loc)) {
      console.log(`\n=== ${loc} (skipped via --skip-locale) ===`);
      continue;
    }
    console.log(`\n=== ${loc} (${LOCALE_LABEL[loc]}) ===`);
    console.log(`  delay ${delayMs}ms between calls`);

    if (engine === "libretranslate" && LIBRETRANSLATE_TARGET[loc] == null) {
      console.warn(
        `  Skipping ${loc}: no LibreTranslate target mapping (use Groq/OpenAI for Somali, Tigrinya, Amharic, etc.).`,
      );
      continue;
    }

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
    const entryTotal = entries.length;

    for (const [english, paths] of entries) {
      const maskedBrand = applyBrandMask(english);
      const { text: phProtected, slots } = protectPlaceholders(maskedBrand);
      const ck = cacheKey(engine, loc, phProtected);

      let raw: string | null = null;
      if (cache[ck]) {
        const fromCache = restoredFromRaw(cache[ck], slots);
        if (fromCache && placeholdersMatch(english, fromCache)) {
          raw = cache[ck];
        } else {
          delete cache[ck];
        }
      }

      if (raw == null) {
        raw = await fetchRawTranslation(phProtected, loc, engine);
        let attempt = restoredFromRaw(raw, slots);
        const llm = engine === "groq" || engine === "openai" || engine === "ollama";
        if (llm && raw != null && attempt && !placeholdersMatch(english, attempt)) {
          raw = await fetchRawTranslation(phProtected, loc, engine, { strictRetry: true });
          attempt = restoredFromRaw(raw, slots);
        }
        const ok = attempt && placeholdersMatch(english, attempt);
        if (ok && raw != null) {
          cache[ck] = raw;
        }
      }

      const restoredTry = restoredFromRaw(raw, slots);
      let restored =
        restoredTry != null && placeholdersMatch(english, restoredTry)
          ? restoredTry
          : english;
      if (restoredTry != null && !placeholdersMatch(english, restoredTry)) {
        console.warn("placeholder mismatch after MT, keeping English:", english.slice(0, 72));
      }
      for (const p of paths) {
        translatedByPath[p] = restored;
      }
      n++;
      if (n % 25 === 0) {
        saveCache(cache);
        console.log(`  ... ${n}/${entryTotal}`);
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
