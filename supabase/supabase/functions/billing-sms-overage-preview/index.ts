// =====================================================
// Billing SMS Overage Preview (inactive billing hook)
// =====================================================
// Purpose:
// - Aggregate SMS overage for active billing periods
// - Preview upcoming invoice-item payloads without charging
// - Prepare the path for future Stripe invoice item creation
//
// This function intentionally does NOT create Stripe invoice items yet.
// =====================================================

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    const previewToken = Deno.env.get("SMS_OVERAGE_PREVIEW_TOKEN") ?? "";

    const authHeader = req.headers.get("authorization") ?? "";
    if (!previewToken || authHeader !== `Bearer ${previewToken}`) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const nowIso = new Date().toISOString();

    const { data: usageRows, error: usageError } = await supabase
      .from("sms_usage")
      .select("salon_id, period_start, period_end, overage_count, overage_cost_estimate")
      .gt("overage_count", 0)
      .gt("period_end", nowIso)
      .order("period_end", { ascending: true });

    if (usageError) {
      return new Response(JSON.stringify({ error: usageError.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(
      JSON.stringify({
        success: true,
        mode: "preview_only",
        count: usageRows?.length ?? 0,
        items:
          usageRows?.map((row) => ({
            salon_id: row.salon_id,
            period_start: row.period_start,
            period_end: row.period_end,
            overage_count: row.overage_count,
            estimated_invoice_amount_nok: row.overage_cost_estimate,
          })) ?? [],
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
