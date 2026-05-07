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
  /** Legacy absolute paid-extra fields (compat). */
  pending_target_extra_staff?: unknown;
  pending_target_extra_languages?: unknown;
  /** New target-capacity fields. */
  active_target_staff_capacity?: unknown;
  active_target_language_capacity?: unknown;
  pending_target_staff_capacity?: unknown;
  pending_target_language_capacity?: unknown;
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
      .select(
        "plan, billing_subscription_id, billing_customer_id, supported_languages, active_target_staff_capacity, active_target_language_capacity, pending_target_staff_capacity, pending_target_language_capacity",
      )
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
    const includedStaff = plan === "starter" ? 2 : plan === "pro" ? 5 : 0;
    const includedLanguages = plan === "starter" ? 2 : plan === "pro" ? 5 : 0;

    const legacyPendingExtraStaff = parseNonNegInt(body.pending_target_extra_staff);
    const legacyPendingExtraLanguages = parseNonNegInt(body.pending_target_extra_languages);
    const newPendingStaffTarget = parseNonNegInt(body.pending_target_staff_capacity);
    const newPendingLanguageTarget = parseNonNegInt(body.pending_target_language_capacity);
    const newActiveStaffTarget = parseNonNegInt(body.active_target_staff_capacity);
    const newActiveLanguageTarget = parseNonNegInt(body.active_target_language_capacity);

    if (
      (body.pending_target_extra_staff !== undefined && legacyPendingExtraStaff === null) ||
      (body.pending_target_extra_languages !== undefined && legacyPendingExtraLanguages === null) ||
      (body.pending_target_staff_capacity !== undefined && newPendingStaffTarget === null) ||
      (body.pending_target_language_capacity !== undefined && newPendingLanguageTarget === null) ||
      (body.active_target_staff_capacity !== undefined && newActiveStaffTarget === null) ||
      (body.active_target_language_capacity !== undefined && newActiveLanguageTarget === null)
    ) {
      return new Response(JSON.stringify({ error: "Target values must be non-negative integers" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const [{ count: activeEmployeesCount }] = await Promise.all([
      supabase
        .from("employees")
        .select("id", { count: "exact", head: true })
        .eq("salon_id", body.salon_id)
        .eq("is_active", true),
    ]);
    const activeEmployees = activeEmployeesCount ?? 0;
    const activeLanguages = Array.isArray(salon.supported_languages) ? salon.supported_languages.length : 0;

    const currentActiveStaffTarget = Math.max(0, Number(salon.active_target_staff_capacity ?? includedStaff));
    const currentActiveLanguageTarget = Math.max(0, Number(salon.active_target_language_capacity ?? includedLanguages));
    const currentPendingStaffTarget = Math.max(0, Number(salon.pending_target_staff_capacity ?? currentActiveStaffTarget));
    const currentPendingLanguageTarget = Math.max(0, Number(salon.pending_target_language_capacity ?? currentActiveLanguageTarget));

    let activeStaffTarget = newActiveStaffTarget ?? currentActiveStaffTarget;
    let activeLanguageTarget = newActiveLanguageTarget ?? currentActiveLanguageTarget;
    let pendingStaffTarget =
      newPendingStaffTarget ??
      (legacyPendingExtraStaff !== null ? includedStaff + legacyPendingExtraStaff : currentPendingStaffTarget);
    let pendingLanguageTarget =
      newPendingLanguageTarget ??
      (legacyPendingExtraLanguages !== null ? includedLanguages + legacyPendingExtraLanguages : currentPendingLanguageTarget);

    if (activeStaffTarget < activeEmployees) {
      return new Response(
        JSON.stringify({
          error: "Active staff target cannot be below active usage",
          code: "target_below_usage_staff",
          usage: activeEmployees,
          required_min_target: activeEmployees,
        }),
        { status: 409, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }
    if (activeLanguageTarget < activeLanguages) {
      return new Response(
        JSON.stringify({
          error: "Active language target cannot be below active usage",
          code: "target_below_usage_languages",
          usage: activeLanguages,
          required_min_target: activeLanguages,
        }),
        { status: 409, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const cappedActive = capStarterAddonQuantities(plan, {
      extra_staff: Math.max(activeStaffTarget - includedStaff, 0),
      extra_languages: Math.max(activeLanguageTarget - includedLanguages, 0),
    });
    const cappedPending = capStarterAddonQuantities(plan, {
      extra_staff: Math.max(pendingStaffTarget - includedStaff, 0),
      extra_languages: Math.max(pendingLanguageTarget - includedLanguages, 0),
    });
    activeStaffTarget = includedStaff + cappedActive.extra_staff;
    activeLanguageTarget = includedLanguages + cappedActive.extra_languages;
    pendingStaffTarget = includedStaff + cappedPending.extra_staff;
    pendingLanguageTarget = includedLanguages + cappedPending.extra_languages;

    const { error: updErr } = await supabase
      .from("salons")
      .update({
        active_target_staff_capacity: activeStaffTarget,
        active_target_language_capacity: activeLanguageTarget,
        pending_target_staff_capacity: pendingStaffTarget,
        pending_target_language_capacity: pendingLanguageTarget,
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
        active_target_staff_capacity: activeStaffTarget,
        active_target_language_capacity: activeLanguageTarget,
        pending_target_staff_capacity: pendingStaffTarget,
        pending_target_language_capacity: pendingLanguageTarget,
        pending_target_extra_staff: Math.max(pendingStaffTarget - includedStaff, 0),
        pending_target_extra_languages: Math.max(pendingLanguageTarget - includedLanguages, 0),
        capped:
          activeStaffTarget !== (newActiveStaffTarget ?? currentActiveStaffTarget) ||
          activeLanguageTarget !== (newActiveLanguageTarget ?? currentActiveLanguageTarget) ||
          pendingStaffTarget !==
            (newPendingStaffTarget ??
              (legacyPendingExtraStaff !== null ? includedStaff + legacyPendingExtraStaff : currentPendingStaffTarget)) ||
          pendingLanguageTarget !==
            (newPendingLanguageTarget ??
              (legacyPendingExtraLanguages !== null
                ? includedLanguages + legacyPendingExtraLanguages
                : currentPendingLanguageTarget)),
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
