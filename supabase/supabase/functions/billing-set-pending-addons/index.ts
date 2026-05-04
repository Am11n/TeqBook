// =====================================================
// Billing: set pending target add-on quantities (absolute next-period targets)
// =====================================================
// Writes `salons.pending_target_*` — desired paid extra_staff / extra_languages on Stripe
// after the next billing boundary apply. Does not call Stripe immediately.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import {
  checkRateLimit,
  createRateLimitErrorResponse,
} from "../_shared/rate-limit.ts";
import { authenticateRequest, authorizeSalonAccess } from "../_shared/auth.ts";
import { capStarterAddonQuantities } from "../_shared/billing.ts";
import { validateBillingBinding } from "../_shared/billing-binding.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-idempotency-key",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Max-Age": "86400",
};

type Body = {
  salon_id?: string;
  /** Absolute desired paid extra_staff units after next boundary (non-negative). */
  pending_target_extra_staff?: unknown;
  pending_target_extra_languages?: unknown;
};

function parseNonNegInt(v: unknown): number | null {
  if (typeof v === "number" && Number.isInteger(v) && v >= 0) return v;
  if (typeof v === "string" && /^\d+$/.test(v)) return parseInt(v, 10);
  return null;
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
        endpointType: "billing-set-pending-addons",
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
        "billing-set-pending-addons",
        supabaseUrl,
        supabaseServiceKey,
      );
    }

    const body = (await req.json().catch(() => ({}))) as Body;
    if (!body.salon_id || typeof body.salon_id !== "string") {
      return new Response(JSON.stringify({ error: "Missing required field: salon_id" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const ps = parseNonNegInt(body.pending_target_extra_staff);
    const pl = parseNonNegInt(body.pending_target_extra_languages);
    if (ps === null || pl === null) {
      return new Response(
        JSON.stringify({
          error: "pending_target_extra_staff and pending_target_extra_languages must be non-negative integers",
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const authz = await authorizeSalonAccess(user.id, body.salon_id, supabaseUrl, supabaseServiceKey);
    if (!authz.allowed) {
      return new Response(JSON.stringify({ error: authz.error ?? "Forbidden" }), {
        status: authz.status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: salon, error: salonErr } = await supabase
      .from("salons")
      .select("plan, billing_subscription_id, billing_customer_id")
      .eq("id", body.salon_id)
      .maybeSingle();

    if (salonErr || !salon?.billing_subscription_id || !salon.plan) {
      return new Response(JSON.stringify({ error: "Salon has no active subscription" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const stripe = new Stripe(stripeSecretKey, { apiVersion: "2024-11-20.acacia" });
    const subscription = await stripe.subscriptions.retrieve(salon.billing_subscription_id as string);
    const stripeCustomerId =
      typeof subscription.customer === "string"
        ? subscription.customer
        : subscription.customer?.id ?? null;
    const bindErr = validateBillingBinding({
      stripeSubscriptionCustomerId: stripeCustomerId,
      salonBillingCustomerId: salon.billing_customer_id as string | null,
    });
    if (bindErr) {
      return new Response(JSON.stringify({ error: "Billing binding mismatch", details: bindErr }), {
        status: 409,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const plan = salon.plan as "starter" | "pro" | "business";
    const capped = capStarterAddonQuantities(plan, {
      extra_staff: ps,
      extra_languages: pl,
    });

    const { error: updErr } = await supabase
      .from("salons")
      .update({
        pending_target_extra_staff: capped.extra_staff,
        pending_target_extra_languages: capped.extra_languages,
      })
      .eq("id", body.salon_id);

    if (updErr) {
      return new Response(JSON.stringify({ error: updErr.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(
      JSON.stringify({
        success: true,
        pending_target_extra_staff: capped.extra_staff,
        pending_target_extra_languages: capped.extra_languages,
        capped: capped.extra_staff !== ps || capped.extra_languages !== pl,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
