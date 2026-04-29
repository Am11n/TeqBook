#!/usr/bin/env tsx
/**
 * Ensures each dashboard API route uses an approved auth pattern
 * (session + salon verify, or cron secret, or explicit allowlist).
 */
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const API_ROOT = join(process.cwd(), "apps/dashboard/src/app/api");

const ALLOWLIST_NO_SESSION = new Set<string>([
  // Add relative paths from apps/dashboard/src/app/api if a route is intentionally different
]);

function listRouteFiles(dir: string, acc: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    if (name.startsWith(".")) continue;
    const p = join(dir, name);
    if (statSync(p).isDirectory()) {
      listRouteFiles(p, acc);
    } else if (name === "route.ts") {
      acc.push(p);
    }
  }
  return acc;
}

function relativeApiPath(abs: string): string {
  return abs.replace(API_ROOT + "/", "").replace(/\/route\.ts$/, "");
}

function main() {
  const routes = listRouteFiles(API_ROOT);
  const failures: string[] = [];

  const hasSessionAuth = (src: string) =>
    src.includes("authenticateAndVerifySalon") || src.includes("from \"@/lib/api-auth\"");
  const hasCronSecret = (src: string) =>
    src.includes("WAITLIST_CRON_SECRET") ||
    src.includes("x-cron-key") ||
    src.includes("isAuthorized(request)");

  for (const file of routes) {
    const rel = relativeApiPath(file);
    const src = readFileSync(file, "utf-8");
    if (ALLOWLIST_NO_SESSION.has(rel)) continue;
    if (!hasSessionAuth(src) && !hasCronSecret(src)) {
      failures.push(
        `${rel}: missing authenticateAndVerifySalon/api-auth or cron secret pattern — see docs/ops/api-route-auth-standard.md`,
      );
    }
  }

  if (failures.length > 0) {
    console.error(["check-dashboard-api-route-auth:", ...failures.map((f) => `  - ${f}`), ""].join("\n"));
    process.exit(1);
  }
  console.log("check-dashboard-api-route-auth: all dashboard API routes match approved patterns.");
}

main();
