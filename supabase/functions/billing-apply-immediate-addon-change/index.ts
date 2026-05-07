import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { checkRateLimit, createRateLimitErrorResponse } from "../_shared/rate-limit.ts";
import { authenticateRequest, authorizeSalonAccess } from "../_shared/auth.ts";
import { validateBillingBinding } from "../_shared/billing-binding.ts";
import { getBillingPriceConfig, capStarterAddonQuantities } from "../_shared/billing.ts";
import { collectAddonSubscriptionItemUpdates } from "../_shared/billing-plan-subscription-items.ts";
import { syncSubscriptionProjection } from "../_shared/billing-sync-subscription-projection.ts";

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

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: corsHeaders });

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY") ?? "";
    if (!stripeSecretKey) {
      return new Response(JSON.stringify({ success: false, reason: "stripe_not_configured" }), {
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
      { endpointType: "billing-apply-immediate-addon-change", supabaseUrl, supabaseServiceKey },
      user,
    );
    if (!rateLimitResult.allowed) {
      const identifier = user?.id || req.headers.get("x-forwarded-for")?.split(",")[0].trim() || "unknown";
      return createRateLimitErrorResponse(
        rateLimitResult,
        identifier,
        user?.id ? "user_id" : "ip",
        "billing-apply-immediate-addon-change",
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
    const { data: profile } = await supabase
      .from("profiles")
      .select("role, is_superadmin")
      .eq("user_id", user.id)
      .maybeSingle();
    const role = String(profile?.role ?? "");
    const canImmediate = profile?.is_superadmin === true || role === "owner" || role === "admin";
    if (!canImmediate) {
      return new Response(JSON.stringify({ success: false, reason: "forbidden_immediate_role" }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: salon, error: salonErr } = await supabase
      .from("salons")
      .select(
        "plan, billing_subscription_id, billing_customer_id, active_target_staff_capacity, active_target_language_capacity, pending_target_staff_capacity, pending_target_language_capacity",
      )
      .eq("id", salonId)
      .maybeSingle();
    if (salonErr || !salon?.billing_subscription_id || !salon.billing_customer_id || !salon.plan) {
      return new Response(JSON.stringify({ success: false, reason: "no_subscription" }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const plan = String(salon.plan);
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
      return new Response(JSON.stringify({ success: false, reason: "binding_mismatch" }), {
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
    const nextActiveStaffTarget = addonType === "extra_staff" ? includedStaff + requestedQty : activeStaffTarget;
    const nextActiveLanguageTarget = addonType === "extra_languages" ? includedLanguages + requestedQty : activeLanguageTarget;
    const targetStaff = Math.max(nextActiveStaffTarget - includedStaff, 0);
    const targetLang = Math.max(nextActiveLanguageTarget - includedLanguages, 0);
    const subscriptionItems = collectAddonSubscriptionItemUpdates(subscription, priceConfig, targetStaff, targetLang);

    const canProrate = subscription.status === "active" || subscription.status === "trialing";
    const updatedSubscription =
      subscriptionItems.length > 0
        ? await stripe.subscriptions.update(salon.billing_subscription_id as string, {
            items: subscriptionItems,
            ...(canProrate ? { proration_behavior: "always_invoice" as const } : {}),
            metadata: { ...subscription.metadata, salon_id: salonId, immediate_addon_change: addonType },
          })
        : subscription;

    await syncSubscriptionProjection(supabase, updatedSubscription, priceConfig);

    const pendingUpdate =
      addonType === "extra_staff"
        ? {
            active_target_staff_capacity: nextActiveStaffTarget,
            pending_target_staff_capacity: nextActiveStaffTarget,
          }
        : {
            active_target_language_capacity: nextActiveLanguageTarget,
            pending_target_language_capacity: nextActiveLanguageTarget,
          };
    const { error: pendingErr } = await supabase.from("salons").update(pendingUpdate).eq("id", salonId);
    if (pendingErr) {
      console.error("billing-apply-immediate-addon-change: pending clear failed", pendingErr);
    }

    return new Response(
      JSON.stringify({
        success: true,
        addon_type: addonType,
        quantity: requestedQty,
        pending_cleared: true,
        subscription_id: updatedSubscription.id,
        current_period_end: updatedSubscription.current_period_end
          ? new Date(updatedSubscription.current_period_end * 1000).toISOString()
          : null,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ success: false, reason: "apply_failed", details: msg.slice(0, 500) }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
