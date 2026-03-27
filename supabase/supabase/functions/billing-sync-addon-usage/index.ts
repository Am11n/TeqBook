import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import {
  computeExtraQuantity,
  getBaseLimits,
  getBillingPriceConfig,
  isValidStripePriceId,
} from "../_shared/billing.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-idempotency-key",
};

type SyncUsageBody = { salon_id: string; idempotency_key?: string };

async function authenticateRequest(req: Request, supabaseUrl: string, supabaseAnonKey: string) {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return { user: null, error: "Missing or invalid Authorization header" };
  }
  const token = authHeader.replace("Bearer ", "");
  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: `Bearer ${token}` } },
  });
  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error || !user) {
    return { user: null, error: error?.message || "Invalid token" };
  }
  return { user, error: null };
}

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

    const body: SyncUsageBody = await req.json();
    if (!body.salon_id) {
      return new Response(JSON.stringify({ error: "Missing required field: salon_id" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const { data: profile } = await supabase
      .from("profiles")
      .select("salon_id")
      .eq("user_id", user.id)
      .maybeSingle();
    if (!profile || profile.salon_id !== body.salon_id) {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: salon } = await supabase
      .from("salons")
      .select("plan, billing_subscription_id, supported_languages")
      .eq("id", body.salon_id)
      .maybeSingle();
    if (!salon?.billing_subscription_id || !salon.plan) {
      return new Response(JSON.stringify({ synced: false, reason: "no_active_subscription" }), {
        status: 200,
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
    const baseLimits = getBaseLimits(salon.plan);

    const extraStaffQty = computeExtraQuantity(activeEmployees, baseLimits.employees);
    const extraLanguagesQty = computeExtraQuantity(activeLanguages, baseLimits.languages);

    const stripe = new Stripe(stripeSecretKey, { apiVersion: "2024-11-20.acacia" });
    const subscription = await stripe.subscriptions.retrieve(salon.billing_subscription_id);
    const priceConfig = getBillingPriceConfig();
    const itemsByPrice = new Map(subscription.items.data.map((item) => [item.price.id, item] as const));
    const updates: Stripe.SubscriptionUpdateParams.Item[] = [];

    const syncAddon = (priceId: string, quantity: number) => {
      if (!isValidStripePriceId(priceId)) return;
      const existing = itemsByPrice.get(priceId);
      if (existing && quantity <= 0) {
        updates.push({ id: existing.id, deleted: true });
        return;
      }
      if (existing) {
        updates.push({ id: existing.id, quantity });
        return;
      }
      if (quantity > 0) {
        updates.push({ price: priceId, quantity });
      }
    };

    syncAddon(priceConfig.addonPriceIds.extra_staff, extraStaffQty);
    syncAddon(priceConfig.addonPriceIds.extra_languages, extraLanguagesQty);

    if (updates.length > 0) {
      const idemKey =
        body.idempotency_key ||
        req.headers.get("x-idempotency-key") ||
        `sync-addon-usage:${body.salon_id}:${activeEmployees}:${activeLanguages}`;
      await stripe.subscriptions.update(
        salon.billing_subscription_id,
        { items: updates },
        { idempotencyKey: idemKey },
      );
    }

    const addonRows = [
      { salon_id: body.salon_id, type: "extra_staff", qty: extraStaffQty },
      { salon_id: body.salon_id, type: "extra_languages", qty: extraLanguagesQty },
    ];
    const upsertRows = addonRows.filter((row) => row.qty > 0);
    if (upsertRows.length > 0) {
      await supabase.from("addons").upsert(upsertRows, { onConflict: "salon_id,type" });
    }
    const removeTypes = addonRows.filter((row) => row.qty <= 0).map((row) => row.type);
    if (removeTypes.length > 0) {
      await supabase.from("addons").delete().eq("salon_id", body.salon_id).in("type", removeTypes);
    }

    return new Response(
      JSON.stringify({
        synced: true,
        active_employees: activeEmployees,
        active_languages: activeLanguages,
        extra_staff_qty: extraStaffQty,
        extra_languages_qty: extraLanguagesQty,
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
