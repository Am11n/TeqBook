// =====================================================
// Billing: Update Subscription Plan
// =====================================================
// Updates a Stripe subscription plan for a salon
//
// Usage:
// POST /functions/v1/billing-update-plan
// Body: { salon_id: string, subscription_id: string, new_plan: 'starter' | 'pro' | 'business' }

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import {
  checkRateLimit,
  createRateLimitErrorResponse,
} from "../_shared/rate-limit.ts";
import {
  computeExtraQuantity,
  getBaseLimits,
  getBillingPriceConfig,
  isValidStripePriceId,
} from "../_shared/billing.ts";

// Inline authentication function (no shared folder needed)
async function authenticateRequest(
  req: Request,
  supabaseUrl: string,
  supabaseAnonKey: string
): Promise<{ user: { id: string; email?: string; [key: string]: unknown } | null; error: string | null }> {
  try {
    const authHeader = req.headers.get("Authorization");
    
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return {
        user: null,
        error: "Missing or invalid Authorization header",
      };
    }

    const token = authHeader.replace("Bearer ", "");
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    });

    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(token);

    if (error || !user) {
      return {
        user: null,
        error: error?.message || "Invalid token",
      };
    }

    return {
      user,
      error: null,
    };
  } catch (err) {
    return {
      user: null,
      error: err instanceof Error ? err.message : "Authentication failed",
    };
  }
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-idempotency-key",
};

interface UpdatePlanRequest {
  salon_id: string;
  subscription_id: string;
  new_plan: "starter" | "pro" | "business";
  idempotency_key?: string;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Get environment variables
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY") ?? "";

    if (!stripeSecretKey) {
      return new Response(
        JSON.stringify({ error: "STRIPE_SECRET_KEY environment variable is not set" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Authenticate request
    const { user, error: authError } = await authenticateRequest(
      req,
      supabaseUrl,
      supabaseAnonKey
    );

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized", details: authError }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Check rate limit
    const rateLimitResult = await checkRateLimit(
      req,
      {
        endpointType: "billing-update-plan",
        supabaseUrl,
        supabaseServiceKey,
      },
      user
    );

    if (!rateLimitResult.allowed) {
      const identifier = user?.id || req.headers.get("x-forwarded-for")?.split(",")[0].trim() || "unknown";
      const identifierType = user?.id ? "user_id" : "ip";
      return createRateLimitErrorResponse(
        rateLimitResult,
        identifier,
        identifierType,
        "billing-update-plan",
        supabaseUrl,
        supabaseServiceKey
      );
    }

    // Parse request body
    const body: UpdatePlanRequest = await req.json();

    // Validate request
    if (!body.salon_id || !body.subscription_id || !body.new_plan) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: salon_id, subscription_id, new_plan" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    if (!["starter", "pro", "business"].includes(body.new_plan)) {
      return new Response(
        JSON.stringify({ error: "Invalid plan. Must be starter, pro, or business" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const priceConfig = getBillingPriceConfig();
    const newPriceId = priceConfig.planPriceIds[body.new_plan];

    if (!isValidStripePriceId(newPriceId)) {
      return new Response(
        JSON.stringify({ 
          error: `Price ID not configured for plan: ${body.new_plan}`,
          details: `Please set STRIPE_PRICE_${body.new_plan.toUpperCase()} in Supabase Edge Functions secrets with your actual Stripe price ID (starts with 'price_'). Current value: ${String(newPriceId)}`,
          hint: "Go to Stripe Dashboard → Products → [Your Product] → Pricing to find the price ID. After setting the secret, you must REDEPLOY the Edge Function for changes to take effect.",
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Initialize Stripe
    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: "2024-11-20.acacia",
    });

    // Retrieve current subscription
    let subscription: Stripe.Subscription;
    try {
      subscription = await stripe.subscriptions.retrieve(body.subscription_id);
    } catch (err) {
      if (err instanceof Stripe.errors.StripeError) {
        return new Response(
          JSON.stringify({
            error: "Failed to retrieve subscription",
            details: err.message,
            code: err.code,
          }),
          {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
      throw err;
    }

    // Check if subscription has items
    if (!subscription.items.data || subscription.items.data.length === 0) {
      return new Response(
        JSON.stringify({
          error: "Subscription has no items",
          details: "Cannot update subscription without items",
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Check subscription status - cannot update incomplete or canceled subscriptions
    if (subscription.status === "incomplete" || subscription.status === "incomplete_expired") {
      return new Response(
        JSON.stringify({
          error: "Cannot update incomplete subscription",
          details: `Subscription is in '${subscription.status}' status. Please complete the payment first before changing plans.`,
          hint: "Go to Stripe Dashboard and complete the payment, or cancel this subscription and create a new one.",
          subscription_status: subscription.status,
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Check if subscription is canceled or scheduled for cancellation
    if (
      subscription.status === "canceled" || 
      subscription.canceled_at || 
      subscription.cancel_at_period_end
    ) {
      return new Response(
        JSON.stringify({
          error: "Cannot update canceled subscription",
          details: subscription.status === "canceled" 
            ? "This subscription has been canceled and can only update cancellation_details and metadata."
            : "This subscription is scheduled for cancellation and cannot be updated.",
          hint: "Please create a new subscription with the desired plan instead.",
          subscription_status: subscription.status,
          canceled_at: subscription.canceled_at,
          cancel_at_period_end: subscription.cancel_at_period_end,
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // For incomplete subscriptions, we need to handle them differently
    // Option 1: Cancel incomplete subscription and create new one
    // Option 2: Wait for payment to complete
    // For now, we'll prevent the update and suggest completing payment first

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const [{ count: activeEmployeesCount }, { data: salonRow }] = await Promise.all([
      supabase
        .from("employees")
        .select("id", { count: "exact", head: true })
        .eq("salon_id", body.salon_id)
        .eq("is_active", true),
      supabase
        .from("salons")
        .select("supported_languages")
        .eq("id", body.salon_id)
        .maybeSingle(),
    ]);

    const activeEmployees = activeEmployeesCount ?? 0;
    const activeLanguages = Array.isArray(salonRow?.supported_languages)
      ? salonRow.supported_languages.length
      : 0;
    const baseLimits = getBaseLimits(body.new_plan);
    const extraStaffQty = computeExtraQuantity(activeEmployees, baseLimits.employees);
    const extraLanguagesQty = computeExtraQuantity(activeLanguages, baseLimits.languages);

    const extraStaffPriceId = priceConfig.addonPriceIds.extra_staff;
    const extraLanguagesPriceId = priceConfig.addonPriceIds.extra_languages;

    const currentItems = subscription.items.data;
    const planPriceSet = new Set(Object.values(priceConfig.planPriceIds));
    const planItem =
      currentItems.find((item) => planPriceSet.has(item.price.id)) ??
      currentItems[0];
    const updateItems: Stripe.SubscriptionUpdateParams.Item[] = [
      { id: planItem.id, price: newPriceId },
    ];
    const itemsByPriceId = new Map(
      currentItems
        .map((item) => [item.price.id, item] as const)
    );

    const applyAddonItem = (
      addonPriceId: string,
      quantity: number,
    ) => {
      if (!isValidStripePriceId(addonPriceId)) return;
      const existing = itemsByPriceId.get(addonPriceId);
      if (existing && quantity <= 0) {
        updateItems.push({ id: existing.id, deleted: true });
        return;
      }
      if (existing) {
        updateItems.push({ id: existing.id, quantity });
        return;
      }
      if (quantity > 0) {
        updateItems.push({ price: addonPriceId, quantity });
      }
    };

    applyAddonItem(extraStaffPriceId, extraStaffQty);
    applyAddonItem(extraLanguagesPriceId, extraLanguagesQty);

    // Update subscription with new price and usage-derived addons.
    // Only use proration_behavior for active subscriptions
    const updateParams: Stripe.SubscriptionUpdateParams = {
      items: updateItems,
      metadata: {
        ...subscription.metadata,
        plan: body.new_plan,
      },
    };

    // Only add proration for active/trialing subscriptions
    if (subscription.status === "active" || subscription.status === "trialing") {
      updateParams.proration_behavior = "always_invoice";
    }

    let updatedSubscription: Stripe.Subscription;
    try {
      const requestIdempotencyKey =
        body.idempotency_key ||
        req.headers.get("x-idempotency-key") ||
        `update-plan:${body.salon_id}:${body.subscription_id}:${body.new_plan}`;
      updatedSubscription = await stripe.subscriptions.update(body.subscription_id, updateParams, {
        idempotencyKey: requestIdempotencyKey,
      });
    } catch (updateError) {
      // Handle Stripe errors, especially for canceled subscriptions
      if (updateError instanceof Stripe.errors.StripeError) {
        if (
          updateError.message.includes("canceled subscription") ||
          updateError.code === "resource_missing" ||
          updateError.type === "invalid_request_error"
        ) {
          return new Response(
            JSON.stringify({
              error: "Cannot update subscription",
              details: updateError.message,
              code: updateError.code,
              type: updateError.type,
              hint: "This subscription may have been canceled. Please create a new subscription with the desired plan instead.",
            }),
            {
              status: 400,
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            }
          );
        }
      }
      throw updateError;
    }

    // Calculate new current period end
    const currentPeriodEnd = new Date(updatedSubscription.current_period_end * 1000).toISOString();

    // Update salon with new plan using service role key
    const { error: updateError } = await supabase
      .from("salons")
      .update({
        plan: body.new_plan,
        current_period_end: currentPeriodEnd,
      })
      .eq("id", body.salon_id);

    if (updateError) {
      console.error("Error updating salon with new plan:", updateError);
    }

    return new Response(
      JSON.stringify({
        success: true,
        plan: body.new_plan,
        subscription_id: updatedSubscription.id,
        current_period_end: currentPeriodEnd,
        status: updatedSubscription.status,
      }),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          ...rateLimitResult.headers,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("Error updating subscription plan:", error);
    
    // Handle Stripe-specific errors
    if (error instanceof Stripe.errors.StripeError) {
      return new Response(
        JSON.stringify({
          error: "Stripe error",
          details: error.message,
          type: error.type,
          code: error.code,
          param: error instanceof Stripe.errors.StripeError && 'param' in error ? error.param : undefined,
          hint: error.type === "invalid_request_error" 
            ? "Check that the subscription exists and the price ID is correct"
            : undefined,
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

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
