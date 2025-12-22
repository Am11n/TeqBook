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
    "authorization, x-client-info, apikey, content-type",
};

interface UpdatePlanRequest {
  salon_id: string;
  subscription_id: string;
  new_plan: "starter" | "pro" | "business";
}

// Plan to Stripe price ID mapping
// IMPORTANT: These are fallback values. Set actual Price IDs in Supabase Edge Functions secrets!
const PLAN_PRICE_IDS: Record<string, string> = {
  starter: Deno.env.get("STRIPE_PRICE_STARTER") || "",
  pro: Deno.env.get("STRIPE_PRICE_PRO") || "",
  business: Deno.env.get("STRIPE_PRICE_BUSINESS") || "",
};

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

    // Debug: Log what we're getting from environment
    console.log("Price IDs from environment:", {
      starter: Deno.env.get("STRIPE_PRICE_STARTER"),
      pro: Deno.env.get("STRIPE_PRICE_PRO"),
      business: Deno.env.get("STRIPE_PRICE_BUSINESS"),
    });
    console.log("PLAN_PRICE_IDS object:", PLAN_PRICE_IDS);
    
    const newPriceId = PLAN_PRICE_IDS[body.new_plan];
    console.log(`Selected price ID for ${body.new_plan}:`, newPriceId);
    
    if (!newPriceId || !newPriceId.startsWith("price_")) {
      return new Response(
        JSON.stringify({ 
          error: `Price ID not configured for plan: ${body.new_plan}`,
          details: `Please set STRIPE_PRICE_${body.new_plan.toUpperCase()} in Supabase Edge Functions secrets with your actual Stripe price ID (starts with 'price_'). Current value: ${newPriceId}`,
          hint: "Go to Stripe Dashboard → Products → [Your Product] → Pricing to find the price ID. After setting the secret, you must REDEPLOY the Edge Function for changes to take effect.",
          debug: {
            env_var: Deno.env.get(`STRIPE_PRICE_${body.new_plan.toUpperCase()}`),
            plan_price_ids: PLAN_PRICE_IDS,
          }
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

    // Update subscription with new price
    const updatedSubscription = await stripe.subscriptions.update(body.subscription_id, {
      items: [{
        id: subscription.items.data[0].id,
        price: newPriceId,
      }],
      proration_behavior: "always_invoice", // Prorate the difference
      metadata: {
        ...subscription.metadata,
        plan: body.new_plan,
      },
    });

    // Calculate new current period end
    const currentPeriodEnd = new Date(updatedSubscription.current_period_end * 1000).toISOString();

    // Update salon with new plan using service role key
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
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
        headers: { ...corsHeaders, "Content-Type": "application/json" },
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
