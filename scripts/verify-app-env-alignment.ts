import { existsSync, readFileSync } from "fs";
import { resolve } from "path";
import { parse } from "dotenv";

type EnvTarget = "staging" | "pilot-production";

type EnvFileCheck = {
  label: string;
  path: string;
  env: Record<string, string>;
  projectRef: string | null;
};

const ENV_FILES = [
  { label: "root", path: ".env.local" },
  { label: "public", path: "apps/public/.env.local" },
  { label: "dashboard", path: "apps/dashboard/.env.local" },
  { label: "admin", path: "apps/admin/.env.local" },
] as const;

function parseProjectRefFromUrl(url: string): string | null {
  try {
    const parsed = new URL(url);
    const [ref] = parsed.hostname.split(".");
    return ref || null;
  } catch {
    return null;
  }
}

function detectMalformedEnvLine(raw: string): string[] {
  const issues: string[] = [];
  const lines = raw.split("\n");

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index] ?? "";
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;

    if (/^[A-Za-z_][A-Za-z0-9_]*\s*:/.test(trimmed)) {
      issues.push(
        `Line ${index + 1} appears to use ":" instead of "=" (${trimmed.slice(
          0,
          70,
        )})`,
      );
    }
  }

  return issues;
}

function readEnvFile(label: string, relativePath: string): EnvFileCheck {
  const fullPath = resolve(process.cwd(), relativePath);
  if (!existsSync(fullPath)) {
    throw new Error(`[${label}] Missing env file: ${relativePath}`);
  }

  const raw = readFileSync(fullPath, "utf-8");
  const env = parse(raw);
  const projectRef = parseProjectRefFromUrl(env.NEXT_PUBLIC_SUPABASE_URL ?? "");

  return {
    label,
    path: relativePath,
    env,
    projectRef,
  };
}

function validateTargetAlignment(rootEnv: Record<string, string>, activeRef: string) {
  const target = rootEnv.TEQBOOK_ENV_TARGET as EnvTarget | undefined;
  const expectedStagingRef = rootEnv.TEQBOOK_STAGING_PROJECT_REF;
  const expectedPilotRef = rootEnv.TEQBOOK_PILOT_PROJECT_REF;

  if (target !== "staging" && target !== "pilot-production") {
    throw new Error(
      "Invalid TEQBOOK_ENV_TARGET in root .env.local. Expected 'staging' or 'pilot-production'.",
    );
  }

  if (target === "staging" && expectedStagingRef && activeRef !== expectedStagingRef) {
    throw new Error(
      `Root target mismatch: expected staging ref '${expectedStagingRef}', got '${activeRef}'.`,
    );
  }

  if (
    target === "pilot-production" &&
    expectedPilotRef &&
    activeRef !== expectedPilotRef
  ) {
    throw new Error(
      `Root target mismatch: expected pilot ref '${expectedPilotRef}', got '${activeRef}'.`,
    );
  }
}

function main() {
  const issues: string[] = [];
  const checks: EnvFileCheck[] = [];

  for (const file of ENV_FILES) {
    const fullPath = resolve(process.cwd(), file.path);
    if (!existsSync(fullPath)) {
      issues.push(`[${file.label}] Missing file ${file.path}`);
      continue;
    }

    const raw = readFileSync(fullPath, "utf-8");
    const malformed = detectMalformedEnvLine(raw);
    for (const issue of malformed) {
      issues.push(`[${file.label}] ${issue}`);
    }

    try {
      checks.push(readEnvFile(file.label, file.path));
    } catch (error) {
      issues.push(error instanceof Error ? error.message : `[${file.label}] Unknown env read error`);
    }
  }

  for (const check of checks) {
    if (!check.env.NEXT_PUBLIC_SUPABASE_URL) {
      issues.push(`[${check.label}] NEXT_PUBLIC_SUPABASE_URL is missing`);
    }
    if (!check.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      issues.push(`[${check.label}] NEXT_PUBLIC_SUPABASE_ANON_KEY is missing`);
    }
    if (!check.projectRef) {
      issues.push(
        `[${check.label}] Could not derive project ref from NEXT_PUBLIC_SUPABASE_URL`,
      );
    }
  }

  const root = checks.find((c) => c.label === "root");
  if (!root || !root.projectRef) {
    issues.push("Cannot validate alignment because root .env.local is invalid.");
  } else {
    try {
      validateTargetAlignment(root.env, root.projectRef);
    } catch (error) {
      issues.push(error instanceof Error ? error.message : "Invalid root target alignment.");
    }

    for (const check of checks) {
      if (check.label === "root") continue;
      if (check.projectRef && check.projectRef !== root.projectRef) {
        issues.push(
          `[${check.label}] Project ref '${check.projectRef}' does not match root ref '${root.projectRef}'.`,
        );
      }
    }
  }

  if (issues.length > 0) {
    console.error("Environment preflight failed.");
    for (const issue of issues) {
      console.error(`- ${issue}`);
    }
    console.error(
      "Fix the env files before running dev. Recommended: copy .env.pilot or .env.staging to all .env.local files consistently.",
    );
    process.exit(1);
  }

  console.log("Environment preflight passed.");
  for (const check of checks) {
    console.log(
      `- ${check.label}: ${check.path} -> ${check.projectRef ?? "unknown-ref"}`,
    );
  }
}

main();
