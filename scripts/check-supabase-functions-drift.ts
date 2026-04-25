#!/usr/bin/env tsx
/**
 * Fails if legacy `supabase/functions/*` and canonical `supabase/supabase/functions/*`
 * both define the same function folder but `index.ts` content differs (SHA-256).
 */
import { createHash } from "node:crypto";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

const CANON = join(process.cwd(), "supabase/supabase/functions");
const LEGACY = join(process.cwd(), "supabase/functions");

function sha256File(path: string): string {
  return createHash("sha256").update(readFileSync(path)).digest("hex");
}

function listFunctionDirs(root: string): string[] {
  if (!existsSync(root)) return [];
  const out: string[] = [];
  for (const name of readdirSync(root)) {
    if (name.startsWith(".")) continue;
    const p = join(root, name);
    if (!statSync(p).isDirectory()) continue;
    if (name === "_shared") continue;
    const indexTs = join(p, "index.ts");
    if (existsSync(indexTs)) out.push(name);
  }
  return out.sort();
}

function main() {
  const legacyNames = listFunctionDirs(LEGACY);
  const mismatches: string[] = [];

  for (const name of legacyNames) {
    const canonIndex = join(CANON, name, "index.ts");
    const legacyIndex = join(LEGACY, name, "index.ts");
    if (!existsSync(canonIndex)) continue;
    const a = sha256File(canonIndex);
    const b = sha256File(legacyIndex);
    if (a !== b) {
      mismatches.push(`${name}: canonical vs supabase/functions copy differ`);
    }
  }

  if (mismatches.length > 0) {
    console.error(
      [
        "check-supabase-functions-drift: canonical and legacy copies of the same Edge Function diverge:",
        ...mismatches.map((m) => `  - ${m}`),
        "",
        "Resolve by making supabase/supabase/functions the single source of truth and syncing or removing supabase/functions copies.",
      ].join("\n"),
    );
    process.exit(1);
  }

  console.log("check-supabase-functions-drift: no mismatched duplicate function trees.");
}

main();
