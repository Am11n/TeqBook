// =====================================================
// Billing: refresh subscription projection (single salon)
// =====================================================
// Authenticated dashboard call: pulls Stripe subscription truth
// and applies the same sync as webhooks / reconcile.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import {
  checkRateLimit,
  createRateLimitErrorResponse,
} from "../_shared/rate-limit.ts";
import { authenticateRequest, authorizeSalonAccess } from "../_shared/auth.ts";
import { getBillingPriceConfig } from "../_shared/billing.ts";
import { syncSubscriptionProjection } from "../_shared/billing-sync-subscription-projection.ts";
import { markBillingInconsistent } from "../_shared/billing-recompute.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-idempotency-key",
};

type Body = { salon_id?: string };

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY") ?? "";

    if (!stripeSecretKey) {
      return new Response(
        JSON.stringify({ error: "STRIPE_SECRET_KEY environment variable is not set" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const { user, error: authError } = await authenticateRequest(
      req,
      supabaseUrl,
      supabaseAnonKey,
    );
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized", details: authError }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const rateLimitResult = await checkRateLimit(
      req,
      {
        endpointType: "billing-refresh-subscription-projection",
        supabaseUrl,
        supabaseServiceKey,
      },
      user,
    );
    if (!rateLimitResult.allowed) {
      const identifier =
        user?.id || req.headers.get("x-forwarded-for")?.split(",")[0].trim() || "unknown";
      const identifierType = user?.id ? "user_id" : "ip";
      return createRateLimitErrorResponse(
        rateLimitResult,
        identifier,
        identifierType,
        "billing-refresh-subscription-projection",
        supabaseUrl,
        supabaseServiceKey,
      );
    }

    const body = (await req.json().catch(() => ({}))) as Body;
    const salonId = typeof body.salon_id === "string" ? body.salon_id : null;
    if (!salonId) {
      return new Response(JSON.stringify({ error: "Missing required field: salon_id" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const authz = await authorizeSalonAccess(user.id, salonId, supabaseUrl, supabaseServiceKey);
    if (!authz.allowed) {
      return new Response(JSON.stringify({ error: authz.error ?? "Forbidden" }), {
        status: authz.status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: salonRow, error: salonErr } = await supabase
      .from("salons")
      .select("billing_subscription_id")
      .eq("id", salonId)
      .maybeSingle();

    if (salonErr || !salonRow) {
      return new Response(JSON.stringify({ error: "Salon not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const subId = salonRow.billing_subscription_id as string | null;
    if (!subId) {
      return new Response(
        JSON.stringify({ refreshed: false, reason: "no_billing_subscription" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const stripe = new Stripe(stripeSecretKey, { apiVersion: "2024-11-20.acacia" });
    const priceConfig = getBillingPriceConfig();

    try {
      const subscription = await stripe.subscriptions.retrieve(subId);
      await syncSubscriptionProjection(supabase, subscription, priceConfig);
      const currentPeriodEndIso = subscription.current_period_end
        ? new Date(subscription.current_period_end * 1000).toISOString()
        : null;
      return new Response(
        JSON.stringify({
          refreshed: true,
          subscription_id: subscription.id,
          status: subscription.status,
          current_period_end: currentPeriodEndIso,
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    } catch (e) {
      const msg = e instanceof Error ? e.message : "unknown";
      const code = e instanceof Stripe.errors.StripeError ? e.code : null;
      if (code === "resource_missing") {
        await markBillingInconsistent(
          supabase,
          salonId,
          `refresh:subscription_not_found:${subId}`,
        );
      } else {
        await markBillingInconsistent(
          supabase,
          salonId,
          `refresh:stripe_error:${msg.slice(0, 500)}`,
        );
      }
      return new Response(
        JSON.stringify({ error: "stripe_retrieve_failed", details: msg }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: "refresh_failed",
        details: error instanceof Error ? error.message : "Unknown error",
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
