// Preview next invoice if user changes to new_plan immediately (matches billing-update-plan + always_invoice proration).
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import {
  checkRateLimit,
  createRateLimitErrorResponse,
} from "../_shared/rate-limit.ts";
import { authenticateRequest, authorizeSalonAccess } from "../_shared/auth.ts";
import { validateBillingBinding } from "../_shared/billing-binding.ts";
import {
  computeExtraQuantity,
  getBaseLimits,
  getBillingPriceConfig,
  isValidStripePriceId,
} from "../_shared/billing.ts";
import {
  collectAddonSubscriptionItemUpdates,
  getPlanSubscriptionItem,
} from "../_shared/billing-plan-subscription-items.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-idempotency-key",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Max-Age": "86400",
};

type Body = { salon_id?: string; new_plan?: "starter" | "pro" | "business" };

function isTimingLine(line: Stripe.InvoiceLineItem): boolean {
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
      return new Response(JSON.stringify({ error: "STRIPE_SECRET_KEY not set" }), {
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
        endpointType: "billing-preview-plan-change",
        supabaseUrl,
        supabaseServiceKey,
      },
      user,
    );
    if (!rateLimitResult.allowed) {
      const identifier = user?.id || req.headers.get("x-forwarded-for")?.split(",")[0].trim() || "unknown";
      const identifierType = user?.id ? "user_id" : "ip";
      return createRateLimitErrorResponse(
        rateLimitResult,
        identifier,
        identifierType,
        "billing-preview-plan-change",
        supabaseUrl,
        supabaseServiceKey,
      );
    }

    const body = (await req.json().catch(() => ({}))) as Body;
    const salonId = typeof body.salon_id === "string" ? body.salon_id : null;
    const newPlan = body.new_plan;
    if (!salonId || !newPlan || !["starter", "pro", "business"].includes(newPlan)) {
      return new Response(JSON.stringify({ error: "Missing salon_id or new_plan" }), {
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
      .select("billing_subscription_id, billing_customer_id, supported_languages")
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
      return new Response(JSON.stringify({ mode: "no_subscription" }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const priceConfig = getBillingPriceConfig();
    const newPriceId = priceConfig.planPriceIds[newPlan];
    if (!isValidStripePriceId(newPriceId)) {
      return new Response(
        JSON.stringify({ error: `Price ID not configured for plan: ${newPlan}` }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const stripe = new Stripe(stripeSecretKey, { apiVersion: "2024-11-20.acacia" });
    let subscription = await stripe.subscriptions.retrieve(subId);
    const stripeCustomerId =
      typeof subscription.customer === "string"
        ? subscription.customer
        : subscription.customer?.id ?? null;
    const bindErr = validateBillingBinding({
      stripeSubscriptionCustomerId: stripeCustomerId,
      salonBillingCustomerId: customerId,
    });
    if (bindErr) {
      return new Response(JSON.stringify({ mode: "degraded", reason: "binding_mismatch" }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (subscription.status === "canceled" || subscription.status === "incomplete") {
      return new Response(
        JSON.stringify({ error: "Subscription cannot be previewed in this state" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const [{ count: activeEmployeesCount }] = await Promise.all([
      supabase
        .from("employees")
        .select("id", { count: "exact", head: true })
        .eq("salon_id", salonId)
        .eq("is_active", true),
    ]);
    const activeEmployees = activeEmployeesCount ?? 0;
    const langs = salon.supported_languages;
    const activeLanguages = Array.isArray(langs) ? langs.length : 0;
    const baseLimits = getBaseLimits(newPlan);
    const extraStaffQty = computeExtraQuantity(activeEmployees, baseLimits.employees);
    const extraLanguagesQty = computeExtraQuantity(activeLanguages, baseLimits.languages);

    const { planItem } = getPlanSubscriptionItem(subscription, priceConfig);
    const planPriceChanged = planItem.price.id !== newPriceId;
    const addonItemUpdates = collectAddonSubscriptionItemUpdates(
      subscription,
      priceConfig,
      extraStaffQty,
      extraLanguagesQty,
    );

    const subscription_items: Stripe.SubscriptionUpdateParams.Item[] = [];
    if (planPriceChanged) {
      subscription_items.push({ id: planItem.id, price: newPriceId });
    }
    for (const u of addonItemUpdates) {
      subscription_items.push(u);
    }

    if (subscription_items.length === 0) {
      return new Response(
        JSON.stringify({ mode: "no_change", message: "Plan already matches selection." }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const canProrate = subscription.status === "active" || subscription.status === "trialing";

    const upcoming = await stripe.invoices.retrieveUpcoming({
      customer: customerId,
      subscription: subId,
      subscription_items,
      ...(canProrate ? { subscription_proration_behavior: "always_invoice" as const } : {}),
    });

    const currency = (upcoming.currency ?? "usd").toUpperCase();
    const rawLines = upcoming.lines?.data ?? [];
    const planPriceSet = new Set(Object.values(priceConfig.planPriceIds));
    const addonPriceIds = new Set(
      [priceConfig.addonPriceIds.extra_staff, priceConfig.addonPriceIds.extra_languages].filter(Boolean),
    );
    let subscription_minor = 0;
    let addons_minor = 0;
    let timing_adjustments_minor = 0;
    for (const line of rawLines) {
      const amt = line.amount ?? 0;
      if (isTimingLine(line)) {
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
      proration: Boolean(line.proration),
    }));

    return new Response(
      JSON.stringify({
        mode: "preview",
        currency,
        total_minor: upcoming.total,
        amount_due_minor: upcoming.amount_due,
        summary: {
          subscription_minor,
          addons_minor,
          timing_adjustments_minor,
        },
        lines,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, ...rateLimitResult.headers, "Content-Type": "application/json" },
      },
    );
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ mode: "degraded", reason: "preview_failed", details: msg.slice(0, 500) }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
