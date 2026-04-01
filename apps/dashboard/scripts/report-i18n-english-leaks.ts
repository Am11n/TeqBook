/**
 * One-off / CI helper: share of leaf strings still identical to English after merge.
 * Run: pnpm exec tsx scripts/report-i18n-english-leaks.ts
 */
import { translations, type AppLocale } from "../src/i18n/translations";

function flatten(value: unknown, prefix = "", out: Record<string, string> = {}): Record<string, string> {
  if (typeof value === "string") {
    out[prefix] = value;
    return out;
  }
  if (value && typeof value === "object" && !Array.isArray(value)) {
    for (const [k, v] of Object.entries(value)) {
      flatten(v, prefix ? `${prefix}.${k}` : k, out);
    }
  }
  return out;
}

const enFlat = flatten(translations.en);
const paths = Object.keys(enFlat).sort();
const locales: AppLocale[] = [
  "nb",
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

function topNamespacesForLocale(loc: AppLocale, limit: number) {
  const cur = flatten(translations[loc]);
  const byNs: Record<string, { same: number; total: number }> = {};
  for (const p of paths) {
    const ns = p.split(".")[0] ?? "";
    if (!byNs[ns]) byNs[ns] = { same: 0, total: 0 };
    byNs[ns].total++;
    if (cur[p] === enFlat[p]) byNs[ns].same++;
  }
  return Object.entries(byNs)
    .map(([ns, { same, total }]) => ({ ns, same, total, pct: (100 * same) / total }))
    .sort((a, b) => b.same - a.same);
}

const loc = (process.argv[2] as AppLocale) || "ar";
if (process.argv[2] === "--all") {
  for (const l of locales) {
    const cur = flatten(translations[l]);
    let same = 0;
    for (const p of paths) {
      if (cur[p] === enFlat[p]) same++;
    }
    const pct = ((100 * same) / paths.length).toFixed(1);
    console.log(`${l}\t${same}/${paths.length}\t${pct}% still English`);
  }
} else {
  console.log(`Namespace leak breakdown for ${loc} (most English first):\n`);
  for (const row of topNamespacesForLocale(loc, 20)) {
    console.log(`${row.ns}\t${row.same}/${row.total}\t${row.pct.toFixed(0)}%`);
  }
}
