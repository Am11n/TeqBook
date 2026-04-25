#!/usr/bin/env tsx
/**
 * Ensures every migration .sql file touched in the current git diff (vs a base ref)
 * is listed in `migration-manifest.json` postBaseline. Legacy files on disk that are
 * not part of the diff are ignored (this repo keeps many historical SQL files outside
 * the manifest-driven apply path).
 */
import { execSync } from "node:child_process";
import { readJsonFile } from "./lib/db-env";

type Manifest = {
  version: number;
  baseline: string;
  postBaseline: string[];
};

const MANIFEST_PATH = "supabase/supabase/migration-manifest.json";

function normalizePath(file: string): string {
  return file.trim().replaceAll("\\", "/");
}

function getChangedMigrationSqlFiles(baseRef: string): string[] {
  try {
    execSync(`git rev-parse --verify ${baseRef}`, { stdio: "pipe" });
  } catch {
    console.warn(
      `[check-migration-manifest-coverage] Base ref "${baseRef}" not found — skipping (no git remote or shallow clone).`,
    );
    return [];
  }

  let out: string;
  try {
    out = execSync(`git diff --name-only ${baseRef}...HEAD`, {
      encoding: "utf-8",
      maxBuffer: 10 * 1024 * 1024,
    });
  } catch (e) {
    console.warn("[check-migration-manifest-coverage] git diff failed:", e);
    return [];
  }

  return out
    .split("\n")
    .map((line) => normalizePath(line))
    .filter((f) => f.endsWith(".sql") && f.startsWith("supabase/supabase/migrations/"));
}

function main() {
  const baseRef = (process.env.MIGRATION_COVERAGE_BASE_REF ?? "origin/main").trim();
  const changed = getChangedMigrationSqlFiles(baseRef);
  if (changed.length === 0) {
    console.log("[check-migration-manifest-coverage] No migration SQL changes in diff range.");
    return;
  }

  const manifest = readJsonFile<Manifest>(MANIFEST_PATH);
  const inManifest = new Set(manifest.postBaseline.map((p) => normalizePath(p)));
  const missing = changed.filter((f) => !inManifest.has(f));

  if (missing.length > 0) {
    console.error(
      [
        "check-migration-manifest-coverage: migration file(s) changed in git diff but missing from migration-manifest.json postBaseline:",
        ...missing.map((m) => `  - ${m}`),
        "",
        "Add each file to postBaseline (canonical order), then run pnpm run db:manifest:lock.",
      ].join("\n"),
    );
    process.exit(1);
  }

  console.log("[check-migration-manifest-coverage] All changed migration SQL files are listed in manifest.");
}

main();
