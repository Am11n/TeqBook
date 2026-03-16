#!/usr/bin/env tsx
import { appendFileSync, existsSync, mkdirSync, readFileSync } from "fs";
import { resolve } from "path";
import { spawnSync } from "child_process";
import * as dotenv from "dotenv";
import {
  ensureRootEnvLoaded,
  getTargetFromEnv,
  readJsonFile,
  verifyProjectRefMatchesTarget,
  writePreflightNote,
} from "./lib/db-env";

type Manifest = {
  version: number;
  baseline: string;
  postBaseline: string[];
};

const MANIFEST_PATH = "supabase/supabase/migration-manifest.json";
const LOG_DIR = "docs/ops/evidence/db-apply-logs";

function runPsqlFile(dbUrl: string, relativeFile: string, logFile: string) {
  const filePath = resolve(process.cwd(), relativeFile);
  if (!existsSync(filePath)) {
    throw new Error(`Missing SQL file: ${relativeFile}`);
  }

  const start = Date.now();
  const result = spawnSync(
    "psql",
    [dbUrl, "-v", "ON_ERROR_STOP=1", "-f", filePath],
    { encoding: "utf-8" },
  );
  const end = Date.now();

  appendFileSync(
    logFile,
    [
      `\n## ${relativeFile}`,
      `elapsed_ms=${end - start}`,
      result.stdout || "",
      result.stderr || "",
    ].join("\n"),
  );

  if (result.status !== 0) {
    throw new Error(`psql failed for ${relativeFile}`);
  }
}

function main() {
  dotenv.config({ path: resolve(process.cwd(), ".env.local") });
  ensureRootEnvLoaded();
  const target = getTargetFromEnv();
  const currentRef = verifyProjectRefMatchesTarget(target);
  writePreflightNote(target, "db:apply");

  const dbUrl = process.env.SUPABASE_DB_URL;
  if (!dbUrl) {
    throw new Error("SUPABASE_DB_URL must be set in .env.local for db:apply");
  }

  const manifest = readJsonFile<Manifest>(MANIFEST_PATH);
  mkdirSync(resolve(process.cwd(), LOG_DIR), { recursive: true });
  const logFile = resolve(
    process.cwd(),
    LOG_DIR,
    `apply-${target}-${currentRef}-${new Date().toISOString().replace(/[:.]/g, "-")}.md`,
  );

  appendFileSync(
    logFile,
    [
      "# DB Apply Run",
      `target=${target}`,
      `project_ref=${currentRef}`,
      `manifest=${MANIFEST_PATH}`,
      `started_at=${new Date().toISOString()}`,
      "",
    ].join("\n"),
  );

  runPsqlFile(dbUrl, manifest.baseline, logFile);
  for (const migrationFile of manifest.postBaseline) {
    runPsqlFile(dbUrl, migrationFile, logFile);
  }

  appendFileSync(logFile, `\ncompleted_at=${new Date().toISOString()}\nstatus=success\n`);
  console.log(`DB apply completed. Log: ${logFile}`);
}

main();

