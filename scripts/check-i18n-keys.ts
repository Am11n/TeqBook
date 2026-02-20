// check-i18n-keys.ts
//
// Verifies en<->nb key parity for all three apps (dashboard, admin, public).
// Also flags potentially untranslated nb values (identical to en).
//
// Usage: npx tsx scripts/check-i18n-keys.ts

import { en as dashEn } from "../apps/dashboard/src/i18n/en";
import { nb as dashNb } from "../apps/dashboard/src/i18n/nb";
import { en as adminEn } from "../apps/admin/src/i18n/en";
import { nb as adminNb } from "../apps/admin/src/i18n/nb";
import { en as publicEn } from "../apps/public/src/i18n/en";
import { nb as publicNb } from "../apps/public/src/i18n/nb";

type NestedObj = Record<string, unknown>;

function getAllKeys(obj: NestedObj, prefix = ""): string[] {
  const keys: string[] = [];
  for (const [k, v] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${k}` : k;
    if (typeof v === "object" && v !== null && !Array.isArray(v)) {
      keys.push(...getAllKeys(v as NestedObj, fullKey));
    } else {
      keys.push(fullKey);
    }
  }
  return keys;
}

function getNestedValue(obj: NestedObj, path: string): unknown {
  return path.split(".").reduce<unknown>((acc, key) => {
    if (typeof acc === "object" && acc !== null) return (acc as NestedObj)[key];
    return undefined;
  }, obj);
}

const SKIP_SAME = [
  "Placeholder", "placeholder", "planStarter", "planPro", "planBusiness",
];

function checkApp(
  name: string,
  en: NestedObj,
  nb: NestedObj
): { errors: number; warnings: number; untranslated: number } {
  const enKeys = getAllKeys(en);
  const nbKeys = getAllKeys(nb);
  let errors = 0;
  let warnings = 0;
  let untranslated = 0;

  console.log(`\n====== ${name} ======`);

  console.log(`\n--- Missing keys in nb.ts (present in en.ts) ---\n`);
  for (const key of enKeys) {
    if (getNestedValue(nb, key) === undefined) {
      console.log(`  MISSING: ${key}`);
      errors++;
    }
  }

  console.log(`\n--- Extra keys in nb.ts (not in en.ts) ---\n`);
  for (const key of nbKeys) {
    if (getNestedValue(en, key) === undefined) {
      console.log(`  EXTRA: ${key}`);
      warnings++;
    }
  }

  console.log(`\n--- Possibly untranslated in nb.ts ---\n`);
  for (const key of nbKeys) {
    const enVal = getNestedValue(en, key);
    const nbVal = getNestedValue(nb, key);
    if (
      typeof enVal === "string" &&
      typeof nbVal === "string" &&
      enVal === nbVal &&
      !SKIP_SAME.some((s) => key.includes(s)) &&
      enVal.length > 3
    ) {
      console.log(`  SAME: ${key} = "${nbVal}"`);
      untranslated++;
    }
  }

  console.log(`\n  ${name} summary: missing=${errors} extra=${warnings} untranslated=${untranslated}`);
  return { errors, warnings, untranslated };
}

const apps: Array<{ name: string; en: NestedObj; nb: NestedObj }> = [
  { name: "Dashboard", en: dashEn as unknown as NestedObj, nb: dashNb as unknown as NestedObj },
  { name: "Admin", en: adminEn as unknown as NestedObj, nb: adminNb as unknown as NestedObj },
  { name: "Public", en: publicEn as unknown as NestedObj, nb: publicNb as unknown as NestedObj },
];

let totalErrors = 0;
for (const app of apps) {
  const result = checkApp(app.name, app.en, app.nb);
  totalErrors += result.errors;
}

console.log(`\n====== Final ======`);
if (totalErrors > 0) {
  console.log(`FAIL: ${totalErrors} missing key(s) across all apps.\n`);
  process.exit(1);
} else {
  console.log(`PASS: All en.ts keys exist in nb.ts for all apps.\n`);
  process.exit(0);
}
