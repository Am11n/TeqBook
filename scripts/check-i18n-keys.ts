#!/usr/bin/env npx ts-node
/**
 * check-i18n-keys.ts
 *
 * Verifies that all keys in the translations type exist in en.ts (source of truth).
 * Also checks nb.ts for untranslated keys (values identical to en.ts).
 *
 * Usage: npx ts-node scripts/check-i18n-keys.ts
 */

import { en } from "../apps/dashboard/src/i18n/en";
import { nb } from "../apps/dashboard/src/i18n/nb";

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

const enKeys = getAllKeys(en as unknown as NestedObj);
const nbKeys = getAllKeys(nb as unknown as NestedObj);

let errors = 0;
let warnings = 0;

// 1) Check that all en.ts keys exist in nb.ts
console.log("\n--- Missing keys in nb.ts (present in en.ts) ---\n");
for (const key of enKeys) {
  const nbVal = getNestedValue(nb as unknown as NestedObj, key);
  if (nbVal === undefined) {
    console.log(`  MISSING: ${key}`);
    errors++;
  }
}

// 2) Check that all nb.ts keys exist in en.ts
console.log("\n--- Extra keys in nb.ts (not in en.ts) ---\n");
for (const key of nbKeys) {
  const enVal = getNestedValue(en as unknown as NestedObj, key);
  if (enVal === undefined) {
    console.log(`  EXTRA: ${key}`);
    warnings++;
  }
}

// 3) Check for untranslated nb.ts values (identical to en.ts)
console.log("\n--- Possibly untranslated in nb.ts (same as en.ts) ---\n");
let untranslated = 0;
for (const key of nbKeys) {
  const enVal = getNestedValue(en as unknown as NestedObj, key);
  const nbVal = getNestedValue(nb as unknown as NestedObj, key);
  if (
    typeof enVal === "string" &&
    typeof nbVal === "string" &&
    enVal === nbVal &&
    // Skip keys that are commonly the same (names, codes, placeholders)
    !key.includes("Placeholder") &&
    !key.includes("placeholder") &&
    !key.includes("planStarter") &&
    !key.includes("planPro") &&
    !key.includes("planBusiness") &&
    enVal.length > 3
  ) {
    console.log(`  SAME: ${key} = "${nbVal}"`);
    untranslated++;
  }
}

console.log(`\n--- Summary ---`);
console.log(`  Missing in nb.ts: ${errors}`);
console.log(`  Extra in nb.ts: ${warnings}`);
console.log(`  Possibly untranslated: ${untranslated}`);
console.log("");

if (errors > 0) {
  console.log("FAIL: Missing keys found. Add them to nb.ts.\n");
  process.exit(1);
} else {
  console.log("PASS: All en.ts keys exist in nb.ts.\n");
  process.exit(0);
}
