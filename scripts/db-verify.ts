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

function runVerification(dbUrl: string, sqlFile: string, logFile: string) {
  const fullFile = resolve(process.cwd(), sqlFile);
  const result = spawnSync(
    "psql",
    [dbUrl, "-v", "ON_ERROR_STOP=1", "-f", fullFile],
    { encoding: "utf-8" },
  );
  appendFileSync(
    logFile,
    [`\n## ${sqlFile}`, result.stdout || "", result.stderr || ""].join("\n"),
  );
  if (result.status !== 0) {
    throw new Error(`Verification failed at ${sqlFile}`);
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

