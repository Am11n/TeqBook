#!/usr/bin/env tsx

import { existsSync, readFileSync, statSync } from "fs";
import { resolve } from "path";

type BudgetConfig = {
  app: "public" | "dashboard" | "admin";
  maxTotalKb: number;
};

const budgets: BudgetConfig[] = [
  { app: "public", maxTotalKb: 900 },
  { app: "dashboard", maxTotalKb: 1200 },
  { app: "admin", maxTotalKb: 1100 },
];

function readBuildManifest(app: string): Record<string, string[]> {
  const manifestPath = resolve(process.cwd(), `apps/${app}/.next/build-manifest.json`);
  if (!existsSync(manifestPath)) {
    throw new Error(`Missing build manifest for ${app}: ${manifestPath}`);
  }
  return JSON.parse(readFileSync(manifestPath, "utf8")) as Record<string, string[]>;
}

function getUniqueJsFiles(manifest: Record<string, string[]>): string[] {
  const files = new Set<string>();
  Object.values(manifest).forEach((entry) => {
    if (Array.isArray(entry)) {
      entry.forEach((file) => {
        if (file.endsWith(".js") && file.startsWith("static/")) {
          files.add(file);
        }
      });
    }
  });
  return [...files];
}

function getTotalSizeKb(app: string, files: string[]): number {
  return (
    files.reduce((total, file) => {
      const fullPath = resolve(process.cwd(), `apps/${app}/.next/${file}`);
      if (!existsSync(fullPath)) return total;
      return total + statSync(fullPath).size;
    }, 0) / 1024
  );
}

let hasFailure = false;

for (const budget of budgets) {
  const manifest = readBuildManifest(budget.app);
  const jsFiles = getUniqueJsFiles(manifest);
  const totalKb = getTotalSizeKb(budget.app, jsFiles);

  console.log(
    `[bundle] ${budget.app}: ${totalKb.toFixed(1)} KB across ${jsFiles.length} JS chunks (budget ${budget.maxTotalKb} KB)`,
  );

  if (totalKb > budget.maxTotalKb) {
    hasFailure = true;
    console.error(
      `[bundle] Budget exceeded for ${budget.app}: ${totalKb.toFixed(1)} KB > ${budget.maxTotalKb} KB`,
    );
  }
}

if (hasFailure) {
  process.exit(1);
}

console.log("[bundle] All bundle budgets passed.");

