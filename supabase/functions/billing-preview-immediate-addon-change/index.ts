import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { checkRateLimit, createRateLimitErrorResponse } from "../_shared/rate-limit.ts";
import { authenticateRequest, authorizeSalonAccess } from "../_shared/auth.ts";
import { validateBillingBinding } from "../_shared/billing-binding.ts";
import { getBillingPriceConfig, capStarterAddonQuantities } from "../_shared/billing.ts";
import { collectAddonSubscriptionItemUpdates } from "../_shared/billing-plan-subscription-items.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-idempotency-key",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Max-Age": "86400",
};

type AddonType = "extra_staff" | "extra_languages";
type Body = { salon_id?: string; addon_type?: AddonType; quantity?: unknown };

function parseNonNegInt(v: unknown): number | null {
  if (typeof v === "number" && Number.isInteger(v) && v >= 0) return v;
  if (typeof v === "string" && /^\d+$/.test(v)) return Number.parseInt(v, 10);
  return null;
}

function isTimingLine(line: Stripe.InvoiceLineItem): boolean {
  if (line.proration) return true;
  const d = line.description ?? "";
  return /remaining time|unused time|prorat/i.test(d);
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: corsHeaders });

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY") ?? "";
    if (!stripeSecretKey) {
      return new Response(JSON.stringify({ mode: "degraded", reason: "stripe_not_configured" }), {
        status: 200,
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
      { endpointType: "billing-preview-immediate-addon-change", supabaseUrl, supabaseServiceKey },
      user,
    );
    if (!rateLimitResult.allowed) {
      const identifier = user?.id || req.headers.get("x-forwarded-for")?.split(",")[0].trim() || "unknown";
      return createRateLimitErrorResponse(
        rateLimitResult,
        identifier,
        user?.id ? "user_id" : "ip",
        "billing-preview-immediate-addon-change",
        supabaseUrl,
        supabaseServiceKey,
      );
    }

    const body = (await req.json().catch(() => ({}))) as Body;
    const salonId = typeof body.salon_id === "string" ? body.salon_id : null;
    const addonType = body.addon_type === "extra_staff" || body.addon_type === "extra_languages" ? body.addon_type : null;
    const rawQty = parseNonNegInt(body.quantity);
    if (!salonId || !addonType || rawQty === null) {
      return new Response(JSON.stringify({ error: "Invalid payload" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const authz = await authorizeSalonAccess(user.id, salonId, supabaseUrl, supabaseServiceKey);
    if (!authz.allowed) {
      return new Response(JSON.stringify({ error: authz.error ?? "Forbidden" }), {
        status: authz.status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const { data: salon, error: salonErr } = await supabase
      .from("salons")
      .select("plan, billing_subscription_id, billing_customer_id, active_target_staff_capacity, active_target_language_capacity")
      .eq("id", salonId)
      .maybeSingle();
    if (salonErr || !salon?.billing_subscription_id || !salon.billing_customer_id || !salon.plan) {
      return new Response(JSON.stringify({ mode: "degraded", reason: "no_subscription" }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const plan = String(salon.plan);
    if (plan === "business") {
      return new Response(JSON.stringify({ mode: "degraded", reason: "addons_not_applicable_business" }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const capped = capStarterAddonQuantities(plan, {
      extra_staff: addonType === "extra_staff" ? rawQty : 0,
      extra_languages: addonType === "extra_languages" ? rawQty : 0,
    });
    const requestedQty = addonType === "extra_staff" ? capped.extra_staff : capped.extra_languages;

    const stripe = new Stripe(stripeSecretKey, { apiVersion: "2024-11-20.acacia" });
    const subscription = await stripe.subscriptions.retrieve(salon.billing_subscription_id as string);
    const stripeCustomerId =
      typeof subscription.customer === "string" ? subscription.customer : subscription.customer?.id ?? null;
    const bindErr = validateBillingBinding({
      stripeSubscriptionCustomerId: stripeCustomerId,
      salonBillingCustomerId: salon.billing_customer_id as string | null,
    });
    if (bindErr) {
      return new Response(JSON.stringify({ mode: "degraded", reason: "binding_mismatch", details: bindErr }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const priceConfig = getBillingPriceConfig();
    const itemByPrice = new Map(subscription.items.data.map((item) => [item.price.id, item] as const));
    const stripeStaff = itemByPrice.get(priceConfig.addonPriceIds.extra_staff)?.quantity ?? 0;
    const stripeLang = itemByPrice.get(priceConfig.addonPriceIds.extra_languages)?.quantity ?? 0;
    const includedStaff = plan === "starter" ? 2 : plan === "pro" ? 5 : 0;
    const includedLanguages = plan === "starter" ? 2 : plan === "pro" ? 5 : 0;
    const activeStaffTarget = Math.max(0, Number(salon.active_target_staff_capacity ?? (includedStaff + stripeStaff)));
    const activeLanguageTarget = Math.max(0, Number(salon.active_target_language_capacity ?? (includedLanguages + stripeLang)));
    const targetStaff = addonType === "extra_staff" ? requestedQty : Math.max(activeStaffTarget - includedStaff, 0);
    const targetLang = addonType === "extra_languages" ? requestedQty : Math.max(activeLanguageTarget - includedLanguages, 0);

    const subscriptionItems = collectAddonSubscriptionItemUpdates(subscription, priceConfig, targetStaff, targetLang);
    if (subscriptionItems.length === 0) {
      return new Response(
        JSON.stringify({
          mode: "preview",
          addon_type: addonType,
          quantity: requestedQty,
          currency: "USD",
          cost_now_minor: 0,
          cost_monthly_minor: 0,
          amount_due_minor: 0,
          lines: [],
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const canProrate = subscription.status === "active" || subscription.status === "trialing";
    const upcoming = await stripe.invoices.retrieveUpcoming({
      customer: salon.billing_customer_id as string,
      subscription: salon.billing_subscription_id as string,
      subscription_items: subscriptionItems,
      ...(canProrate ? { subscription_proration_behavior: "always_invoice" as const } : {}),
    });

    const currency = (upcoming.currency ?? "usd").toUpperCase();
    const lines = upcoming.lines?.data ?? [];
    const costNowMinor = lines.filter(isTimingLine).reduce((sum, line) => sum + (line.amount ?? 0), 0);

    const addonPriceId =
      addonType === "extra_staff" ? priceConfig.addonPriceIds.extra_staff : priceConfig.addonPriceIds.extra_languages;
    const recurringLine = lines.find((line) => line.price?.id === addonPriceId && !isTimingLine(line));
    const fallbackUnit = addonType === "extra_staff" ? 500 : 1000;
    const recurringMinor =
      recurringLine?.amount ??
      ((recurringLine?.price?.unit_amount ?? fallbackUnit) * (recurringLine?.quantity ?? requestedQty ?? 0));

    return new Response(
      JSON.stringify({
        mode: "preview",
        addon_type: addonType,
        quantity: requestedQty,
        currency,
        cost_now_minor: costNowMinor,
        cost_monthly_minor: recurringMinor,
        amount_due_minor: upcoming.amount_due ?? 0,
        lines: lines.map((line) => ({
          description: line.description ?? line.price?.nickname ?? "Line item",
          amount_minor: line.amount ?? 0,
          quantity: line.quantity ?? null,
          proration: Boolean(line.proration),
        })),
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ mode: "degraded", reason: "preview_failed", details: msg.slice(0, 500) }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
