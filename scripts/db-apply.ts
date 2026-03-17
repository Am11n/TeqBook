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
const DEFAULT_RETRY_ATTEMPTS = 5;
const DEFAULT_RETRY_BASE_DELAY_MS = 3000;
const RETRYABLE_PSQL_PATTERNS = [
  /ssl connection has been closed unexpectedly/i,
  /circuit breaker open/i,
  /connection to server .* failed:/i,
  /server closed the connection unexpectedly/i,
  /could not receive data from server/i,
];

function getPositiveIntEnv(name: string, fallback: number) {
  const raw = process.env[name];
  if (!raw) return fallback;
  const parsed = Number.parseInt(raw, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function sleepMs(ms: number) {
  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);
}

function isRetryablePsqlError(output: string) {
  return RETRYABLE_PSQL_PATTERNS.some((pattern) => pattern.test(output));
}

function runPsqlFile(dbUrl: string, relativeFile: string, logFile: string) {
  const filePath = resolve(process.cwd(), relativeFile);
  if (!existsSync(filePath)) {
    throw new Error(`Missing SQL file: ${relativeFile}`);
  }

  const retryAttempts = getPositiveIntEnv("TEQBOOK_DB_RETRY_ATTEMPTS", DEFAULT_RETRY_ATTEMPTS);
  const retryBaseDelayMs = getPositiveIntEnv("TEQBOOK_DB_RETRY_BASE_DELAY_MS", DEFAULT_RETRY_BASE_DELAY_MS);

  for (let attempt = 1; attempt <= retryAttempts; attempt += 1) {
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
        `\n## ${relativeFile} (attempt ${attempt}/${retryAttempts})`,
        `elapsed_ms=${end - start}`,
        result.stdout || "",
        result.stderr || "",
      ].join("\n"),
    );

    if (result.status === 0) {
      return;
    }

    const combinedOutput = `${result.stdout ?? ""}\n${result.stderr ?? ""}`;
    const retryable = isRetryablePsqlError(combinedOutput);
    if (!retryable || attempt === retryAttempts) {
      throw new Error(`psql failed for ${relativeFile}`);
    }

    const delayMs = retryBaseDelayMs * attempt;
    appendFileSync(
      logFile,
      `retrying_after_ms=${delayMs} reason=transient_connection_error\n`,
    );
    sleepMs(delayMs);
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

