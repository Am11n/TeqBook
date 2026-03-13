import { spawnSync } from "node:child_process";

const BASELINE_ISSUES = 1417;
const isCI = process.argv.includes("--ci");

const prettierArgs = [
  "exec",
  "prettier",
  "--check",
  "**/*.{ts,tsx,js,jsx,json,md,yml,yaml}",
];

const result = spawnSync("pnpm", prettierArgs, {
  encoding: "utf8",
  maxBuffer: 20 * 1024 * 1024,
});

const combinedOutput = `${result.stdout || ""}${result.stderr || ""}`;
const issueMatch = combinedOutput.match(/Code style issues found in (\d+) files\./);
const issues = issueMatch ? Number(issueMatch[1]) : result.status === 0 ? 0 : null;

if (issues === null) {
  process.stdout.write(combinedOutput);
  console.error("Unable to determine Prettier issue count.");
  process.exit(result.status ?? 1);
}

console.log(`Prettier issues: ${issues}`);
console.log(`Baseline: ${BASELINE_ISSUES}`);

if (isCI) {
  if (issues > BASELINE_ISSUES) {
    console.error(
      `FAIL: ${issues} issues exceeds baseline ${BASELINE_ISSUES} (+${issues - BASELINE_ISSUES}).`
    );
    process.exit(1);
  }

  if (issues < BASELINE_ISSUES) {
    console.log(
      `PASS (improved): ${BASELINE_ISSUES - issues} fewer issues than baseline. Update BASELINE_ISSUES to ${issues}.`
    );
  } else {
    console.log("PASS: No new Prettier issues above baseline.");
  }
  process.exit(0);
}

if (issues > 0) {
  process.stdout.write(combinedOutput);
  process.exit(1);
}

process.exit(0);
