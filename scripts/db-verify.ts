#!/usr/bin/env tsx
import { appendFileSync, mkdirSync } from "fs";
import { resolve } from "path";
import { spawnSync } from "child_process";
import * as dotenv from "dotenv";
import {
  ensureRootEnvLoaded,
  getTargetFromEnv,
  verifyProjectRefMatchesTarget,
  writePreflightNote,
} from "./lib/db-env";

const VERIFICATION_FILES = [
  "supabase/supabase/verification/00_schema_and_security.sql",
  "supabase/supabase/verification/01_booking_integrity.sql",
  "supabase/supabase/verification/02_data_quality.sql",
];

const LOG_DIR = "docs/ops/evidence/db-verify-logs";
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

function runVerification(dbUrl: string, sqlFile: string, logFile: string) {
  const fullFile = resolve(process.cwd(), sqlFile);
  const retryAttempts = getPositiveIntEnv("TEQBOOK_DB_RETRY_ATTEMPTS", DEFAULT_RETRY_ATTEMPTS);
  const retryBaseDelayMs = getPositiveIntEnv("TEQBOOK_DB_RETRY_BASE_DELAY_MS", DEFAULT_RETRY_BASE_DELAY_MS);

  for (let attempt = 1; attempt <= retryAttempts; attempt += 1) {
    const result = spawnSync(
      "psql",
      [dbUrl, "-v", "ON_ERROR_STOP=1", "-f", fullFile],
      { encoding: "utf-8" },
    );
    appendFileSync(
      logFile,
      [
        `\n## ${sqlFile} (attempt ${attempt}/${retryAttempts})`,
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
      throw new Error(`Verification failed at ${sqlFile}`);
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
  writePreflightNote(target, "db:verify");

  const dbUrl = process.env.SUPABASE_DB_URL;
  if (!dbUrl) {
    throw new Error("SUPABASE_DB_URL must be set in .env.local for db:verify");
  }

  mkdirSync(resolve(process.cwd(), LOG_DIR), { recursive: true });
  const logFile = resolve(
    process.cwd(),
    LOG_DIR,
    `verify-${target}-${currentRef}-${new Date().toISOString().replace(/[:.]/g, "-")}.md`,
  );
  appendFileSync(
    logFile,
    [
      "# DB Verification Run",
      `target=${target}`,
      `project_ref=${currentRef}`,
      `started_at=${new Date().toISOString()}`,
      "",
    ].join("\n"),
  );

  for (const file of VERIFICATION_FILES) {
    runVerification(dbUrl, file, logFile);
  }

  appendFileSync(logFile, `\ncompleted_at=${new Date().toISOString()}\nstatus=success\n`);
  console.log(`DB verification passed. Log: ${logFile}`);
}

main();

