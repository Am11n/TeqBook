import { createClient } from "@supabase/supabase-js";

type QueryBudgetViolation = {
  queryid: string;
  calls: number;
  mean_exec_time: number;
  budget_ms: number;
  query: string;
};

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

async function main() {
  const supabaseUrl = requireEnv("NEXT_PUBLIC_SUPABASE_URL");
  const serviceRoleKey = requireEnv("SUPABASE_SERVICE_ROLE_KEY");
  const minCalls = Number(process.env.QUERY_BUDGET_MIN_CALLS || "20");
  const bookingBudgetMs = Number(process.env.QUERY_BUDGET_BOOKING_MS || "20");
  const dashboardBudgetMs = Number(process.env.QUERY_BUDGET_DASHBOARD_MS || "50");

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { data, error } = await supabase.rpc("get_query_budget_violations", {
    p_min_calls: minCalls,
    p_booking_budget_ms: bookingBudgetMs,
    p_dashboard_budget_ms: dashboardBudgetMs,
  });

  if (error) {
    throw new Error(`Failed to fetch query budget violations: ${error.message}`);
  }

  const violations = (data || []) as QueryBudgetViolation[];
  if (violations.length === 0) {
    console.log("Query budget gate passed. No violations found.");
    return;
  }

  console.error("Query budget violations detected:");
  for (const violation of violations) {
    console.error(
      `- queryid=${violation.queryid} calls=${violation.calls} mean=${violation.mean_exec_time.toFixed(
        2,
      )}ms budget=${violation.budget_ms}ms`,
    );
    console.error(`  ${violation.query}`);
  }

  process.exit(1);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});

