// =====================================================
// Billing: reconcile Stripe subscription → salons projection
// =====================================================
// Scheduled (cron) with TEQBOOK_CRON_SECRET. Fetches Stripe truth for salons
// with billing_subscription_id and applies syncSubscriptionProjection.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { verifyCronSecret } from "../_shared/cron-secret.ts";
import { getBillingPriceConfig } from "../_shared/billing.ts";
import { syncSubscriptionProjection } from "../_shared/billing-sync-subscription-projection.ts";
import { markBillingInconsistent } from "../_shared/billing-recompute.ts";
import { ensureStripeAddonQuantitiesMatchDb } from "../_shared/billing-addon-sync.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type ReconcileBody = {
  limit?: number;
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const cronDenied = verifyCronSecret(req);
  if (cronDenied) return cronDenied;

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!supabaseUrl || !supabaseServiceKey || !stripeKey) {
      return new Response(JSON.stringify({ error: "Missing configuration" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const stripe = new Stripe(stripeKey, { apiVersion: "2024-11-20.acacia" });
    const priceConfig = getBillingPriceConfig();

    let limit = 80;
    try {
      const body = (await req.json().catch(() => ({}))) as ReconcileBody;
      if (typeof body.limit === "number" && body.limit > 0) {
        limit = Math.min(body.limit, 200);
      }
    } catch {
      // keep default
    }

    const { data: rows, error: selErr } = await supabase
      .from("salons")
      .select("id, billing_subscription_id")
      .not("billing_subscription_id", "is", null)
      .limit(limit);

    if (selErr) {
      return new Response(JSON.stringify({ error: selErr.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let processed = 0;
    let errors = 0;
    const details: string[] = [];

    for (const row of rows ?? []) {
      const subId = row.billing_subscription_id as string;
      try {
        const subscription = await stripe.subscriptions.retrieve(subId);
        await syncSubscriptionProjection(supabase, subscription, priceConfig);
        await ensureStripeAddonQuantitiesMatchDb(supabase, stripe, row.id as string, {
          markSyncing: false,
          maxRetries: 3,
        });
        processed += 1;
        details.push(`ok:${row.id}`);
      } catch (e) {
        errors += 1;
        const msg = e instanceof Error ? e.message : "unknown";
        console.error("billing_reconcile_salon_failed", { salon_id: row.id, subId, msg });
        const code = e instanceof Stripe.errors.StripeError ? e.code : null;
        if (code === "resource_missing") {
          await markBillingInconsistent(
            supabase,
            row.id,
            `reconcile:subscription_not_found:${subId}`,
          );
        } else {
          await markBillingInconsistent(
            supabase,
            row.id,
            `reconcile:stripe_error:${msg.slice(0, 500)}`,
          );
        }
        details.push(`err:${row.id}`);
      }
    }

    return new Response(
      JSON.stringify({
        processed,
        errors,
        batch_size: rows?.length ?? 0,
        details: details.slice(0, 50),
        timestamp: new Date().toISOString(),
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: "reconcile_failed",
        details: error instanceof Error ? error.message : "Unknown error",
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
