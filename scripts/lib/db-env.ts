import { existsSync, readFileSync } from "fs";
import { resolve } from "path";

export type EnvTarget = "staging" | "pilot-production";

const VALID_TARGETS: EnvTarget[] = ["staging", "pilot-production"];

function parseProjectRefFromUrl(url: string): string | null {
  try {
    const parsed = new URL(url);
    const host = parsed.hostname; // <ref>.supabase.co
    const [ref] = host.split(".");
    return ref || null;
  } catch {
    return null;
  }
}

/** When set (e.g. in GitHub Actions), db:apply/db-verify read env from process only — no root .env.local file required. */
export function isDbProcessEnvMode(): boolean {
  return process.env.TEQBOOK_DB_USE_PROCESS_ENV === "1";
}

export function ensureRootEnvLoaded() {
  if (isDbProcessEnvMode()) {
    return;
  }
  const envLocalPath = resolve(process.cwd(), ".env.local");
  if (!existsSync(envLocalPath)) {
    throw new Error("Missing .env.local in repository root (or set TEQBOOK_DB_USE_PROCESS_ENV=1 with required env vars).");
  }
}

export function getTargetFromEnv(): EnvTarget {
  const target = process.env.TEQBOOK_ENV_TARGET ?? process.env.TEQBOOK_SUPABASE_TARGET;
  if (!target || !VALID_TARGETS.includes(target as EnvTarget)) {
    throw new Error(
      "TEQBOOK_ENV_TARGET (or TEQBOOK_SUPABASE_TARGET) must be set to 'staging' or 'pilot-production'",
    );
  }
  return target as EnvTarget;
}

export function getProjectRefFromEnvUrl(): string {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!url) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_URL is missing (set in .env.local or pass as CI secret when TEQBOOK_DB_USE_PROCESS_ENV=1)",
    );
  }
  const ref = parseProjectRefFromUrl(url);
  if (!ref) {
    throw new Error("Could not derive Supabase project ref from NEXT_PUBLIC_SUPABASE_URL");
  }
  return ref;
}

export function verifyProjectRefMatchesTarget(target: EnvTarget) {
  const currentRef = getProjectRefFromEnvUrl();
  const expectedStagingRef = process.env.TEQBOOK_STAGING_PROJECT_REF;
  const expectedPilotRef = process.env.TEQBOOK_PILOT_PROJECT_REF;

  if (target === "staging" && expectedStagingRef && currentRef !== expectedStagingRef) {
    throw new Error(
      `Project ref mismatch for staging. Expected '${expectedStagingRef}', got '${currentRef}'.`,
    );
  }

  if (
    target === "pilot-production" &&
    expectedPilotRef &&
    currentRef !== expectedPilotRef
  ) {
    throw new Error(
      `Project ref mismatch for pilot-production. Expected '${expectedPilotRef}', got '${currentRef}'.`,
    );
  }

  return currentRef;
}

export function writePreflightNote(target: EnvTarget, commandName: string) {
  const currentRef = getProjectRefFromEnvUrl();
  const note = [
    "DB command preflight",
    `- command: ${commandName}`,
    `- target: ${target}`,
    `- active project ref: ${currentRef}`,
    `- env source: ${isDbProcessEnvMode() ? "process env (TEQBOOK_DB_USE_PROCESS_ENV=1)" : ".env.local (switch from .env.staging or .env.pilot before running)"}`,
  ].join("\n");

  console.log(note);
}

export function readJsonFile<T>(filePath: string): T {
  const fullPath = resolve(process.cwd(), filePath);
  if (!existsSync(fullPath)) {
    throw new Error(`Missing file: ${filePath}`);
  }
  const raw = readFileSync(fullPath, "utf-8");
  return JSON.parse(raw) as T;
}

