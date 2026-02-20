// check-file-length.ts
// Scans apps source dirs for .ts/.tsx files exceeding MAX_LINES.
// With --ci flag: fails only if violation count exceeds the known baseline.
// Without --ci: always reports all violations.
// Usage: npx tsx scripts/check-file-length.ts [--ci]

import { readdirSync, readFileSync, statSync } from "fs";
import { join, relative } from "path";

const MAX_LINES = 300;

// Known violation count as of 2026-02-20 (before remaining cleanup phases).
// Decrease this as you refactor files. Never increase it.
const BASELINE_VIOLATIONS = 102;

const IGNORE_PATTERNS = [
  /\/i18n\//,
  /\/tests\//,
  /\.test\.(ts|tsx)$/,
  /\.spec\.(ts|tsx)$/,
  /\/landing\//,
  /\/e2e\//,
  /node_modules/,
  /\.next/,
];

const isCI = process.argv.includes("--ci");

function walk(dir: string): string[] {
  const results: string[] = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...walk(fullPath));
    } else if (/\.(ts|tsx)$/.test(entry.name)) {
      results.push(fullPath);
    }
  }
  return results;
}

const root = join(__dirname, "..");
const appDirs = ["apps/dashboard/src", "apps/admin/src", "apps/public/src"];

const violations: Array<{ path: string; lines: number }> = [];

for (const appDir of appDirs) {
  const absDir = join(root, appDir);
  try {
    statSync(absDir);
  } catch {
    continue;
  }

  const files = walk(absDir);
  for (const file of files) {
    const rel = relative(root, file);
    if (IGNORE_PATTERNS.some((p) => p.test(rel))) continue;

    const content = readFileSync(file, "utf-8");
    const lineCount = content.split("\n").length;

    if (lineCount > MAX_LINES) {
      violations.push({ path: rel, lines: lineCount });
    }
  }
}

violations.sort((a, b) => b.lines - a.lines);

for (const v of violations) {
  console.log(`  OVER: ${v.path} (${v.lines} lines)`);
}

console.log(`\n--- Summary ---`);
console.log(`  Max allowed: ${MAX_LINES} lines`);
console.log(`  Violations: ${violations.length}`);
console.log(`  Baseline: ${BASELINE_VIOLATIONS}`);
console.log("");

if (isCI) {
  if (violations.length > BASELINE_VIOLATIONS) {
    console.log(
      `FAIL: ${violations.length} violations exceeds baseline of ${BASELINE_VIOLATIONS}. ` +
        `You added ${violations.length - BASELINE_VIOLATIONS} new oversized file(s).\n`
    );
    process.exit(1);
  } else {
    const improved = BASELINE_VIOLATIONS - violations.length;
    if (improved > 0) {
      console.log(
        `PASS (improved): ${improved} fewer violation(s) than baseline. ` +
          `Update BASELINE_VIOLATIONS to ${violations.length} in this script.\n`
      );
    } else {
      console.log(`PASS: No new violations above baseline.\n`);
    }
    process.exit(0);
  }
} else {
  if (violations.length > 0) {
    console.log(`${violations.length} file(s) exceed ${MAX_LINES} lines.\n`);
    process.exit(1);
  } else {
    console.log(`All source files are within ${MAX_LINES} lines.\n`);
    process.exit(0);
  }
}
