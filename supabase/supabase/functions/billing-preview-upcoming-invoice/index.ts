// =====================================================
// Billing: Stripe upcoming invoice preview (single salon)
// =====================================================
// Primary monetary estimate for dashboard: only returned when add-on sync is `synced`
// and product access is not `inconsistent_billing`.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import {
  checkRateLimit,
  createRateLimitErrorResponse,
} from "../_shared/rate-limit.ts";
import { authenticateRequest, authorizeSalonAccess } from "../_shared/auth.ts";
import { validateBillingBinding } from "../_shared/billing-binding.ts";
import { getBillingPriceConfig } from "../_shared/billing.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-idempotency-key",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Max-Age": "86400",
};

type Body = { salon_id?: string };

function isTimingAdjustmentLine(line: Stripe.InvoiceLineItem): boolean {
  if (line.proration) return true;
  const d = line.description ?? "";
  return /remaining time|unused time|prorat/i.test(d);
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY") ?? "";

    if (!stripeSecretKey) {
      return new Response(JSON.stringify({ error: "STRIPE_SECRET_KEY environment variable is not set" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { user, error: authError } = await authenticateRequest(req, supabaseUrl, supabaseAnonKey);
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized", details: authError }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const rateLimitResult = await checkRateLimit(
      req,
      {
        endpointType: "billing-preview-upcoming-invoice",
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
        "billing-preview-upcoming-invoice",
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

    const { data: salon, error: salonErr } = await supabase
      .from("salons")
      .select("*")
      .eq("id", salonId)
      .maybeSingle();

    if (salonErr || !salon) {
      return new Response(JSON.stringify({ error: "Salon not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const subId = salon.billing_subscription_id as string | null;
    const customerId = salon.billing_customer_id as string | null;
    if (!subId || !customerId) {
      return new Response(
        JSON.stringify({ mode: "no_subscription", reason: "no_billing_subscription" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    if (salon.product_access_state === "inconsistent_billing") {
      return new Response(
        JSON.stringify({ mode: "degraded", reason: "inconsistent_billing" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const addonState = salon.addon_billing_sync_state as string | null;
    if (addonState !== "synced") {
      return new Response(
        JSON.stringify({
          mode: "degraded",
          reason: addonState === "syncing" ? "addon_syncing" : `addon_state:${addonState ?? "unknown"}`,
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const stripe = new Stripe(stripeSecretKey, { apiVersion: "2024-11-20.acacia" });
    const subscription = await stripe.subscriptions.retrieve(subId);
    const stripeCustomerId =
      typeof subscription.customer === "string"
        ? subscription.customer
        : subscription.customer?.id ?? null;
    const bindErr = validateBillingBinding({
      stripeSubscriptionCustomerId: stripeCustomerId,
      salonBillingCustomerId: customerId,
    });
    if (bindErr) {
      return new Response(
        JSON.stringify({ mode: "degraded", reason: "binding_mismatch" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const upcoming = await stripe.invoices.retrieveUpcoming({
      customer: customerId,
      subscription: subId,
    });

    const currency = (upcoming.currency ?? "usd").toUpperCase();
    const rawLines = upcoming.lines?.data ?? [];
    const priceCfg = getBillingPriceConfig();
    const planPriceSet = new Set(Object.values(priceCfg.planPriceIds));
    const addonPriceIds = new Set(
      [priceCfg.addonPriceIds.extra_staff, priceCfg.addonPriceIds.extra_languages].filter(Boolean),
    );
    /** Non-proration recurring lines by price; proration/credits stay in timing bucket. */
    let subscription_minor = 0;
    let addons_minor = 0;
    let timing_adjustments_minor = 0;
    for (const line of rawLines) {
      const amt = line.amount ?? 0;
      if (isTimingAdjustmentLine(line)) {
        timing_adjustments_minor += amt;
        continue;
      }
      const pid = line.price?.id;
      if (pid && addonPriceIds.has(pid)) {
        addons_minor += amt;
      } else if (pid && planPriceSet.has(pid)) {
        subscription_minor += amt;
      }
    }
    const lines = rawLines.map((line) => ({
      description: line.description ?? line.price?.nickname ?? "Line item",
      amount_minor: line.amount,
      quantity: line.quantity ?? null,
    }));

    const salonRow = salon as {
      pending_extra_staff?: number;
      pending_extra_languages?: number;
      current_period_end?: string | null;
    };

    return new Response(
      JSON.stringify({
        mode: "stripe_preview",
        currency,
        total_minor: upcoming.total,
        amount_due_minor: upcoming.amount_due,
        summary: {
          subscription_minor,
          addons_minor,
          timing_adjustments_minor,
        },
        lines,
        pending_extra_staff: Math.max(0, Number(salonRow.pending_extra_staff) || 0),
        pending_extra_languages: Math.max(0, Number(salonRow.pending_extra_languages) || 0),
        current_period_end: salonRow.current_period_end ?? null,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({
        mode: "degraded",
        reason: "stripe_preview_failed",
        details: msg.slice(0, 500),
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
