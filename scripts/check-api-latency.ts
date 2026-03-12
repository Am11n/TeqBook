#!/usr/bin/env tsx

type Target = {
  name: string;
  url: string;
  maxP95Ms: number;
};

const rawTargets: Target[] = [
  {
    name: "public-health",
    url: process.env.PUBLIC_HEALTH_URL || "http://localhost:3001/",
    maxP95Ms: 250,
  },
  {
    name: "dashboard-health",
    url: process.env.DASHBOARD_HEALTH_URL || "http://localhost:3002/",
    maxP95Ms: 300,
  },
  {
    name: "admin-health",
    url: process.env.ADMIN_HEALTH_URL || "http://localhost:3003/",
    maxP95Ms: 300,
  },
];

const requestsPerTarget = Number(process.env.PERF_REQUESTS || "20");

function percentile(values: number[], pct: number): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const index = Math.min(sorted.length - 1, Math.max(0, Math.ceil((pct / 100) * sorted.length) - 1));
  return sorted[index];
}

async function measure(url: string): Promise<number> {
  const start = performance.now();
  const response = await fetch(url, { method: "GET" });
  if (!response.ok) {
    throw new Error(`HTTP ${response.status} for ${url}`);
  }
  return performance.now() - start;
}

async function run() {
  let hasFailure = false;

  for (const target of rawTargets) {
    const samples: number[] = [];

    for (let i = 0; i < requestsPerTarget; i += 1) {
      const latency = await measure(target.url);
      samples.push(latency);
    }

    const p95 = percentile(samples, 95);
    const avg = samples.reduce((acc, value) => acc + value, 0) / samples.length;

    console.log(
      `[perf] ${target.name}: avg=${avg.toFixed(1)}ms p95=${p95.toFixed(1)}ms (budget p95<=${target.maxP95Ms}ms)`,
    );

    if (p95 > target.maxP95Ms) {
      hasFailure = true;
      console.error(
        `[perf] Budget exceeded for ${target.name}: p95 ${p95.toFixed(1)}ms > ${target.maxP95Ms}ms`,
      );
    }
  }

  if (hasFailure) {
    process.exit(1);
  }

  console.log("[perf] All latency checks passed.");
}

run().catch((error) => {
  console.error("[perf] Latency check failed:", error instanceof Error ? error.message : String(error));
  process.exit(1);
});

