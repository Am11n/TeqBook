// =====================================================
// Billing: Create Stripe Subscription
// =====================================================
// Creates a Stripe subscription for a salon
//
// Usage:
// POST /functions/v1/billing-create-subscription
// Body: { salon_id: string, customer_id: string, plan: 'starter' | 'pro' | 'business' }

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

interface CreateSubscriptionRequest {
  salon_id: string;
  customer_id: string;
  plan: "starter" | "pro" | "business";
}

// Plan to Stripe price ID mapping
// IMPORTANT: Set actual Price IDs in Supabase Edge Functions secrets!
// You can find them in Stripe Dashboard → Products → [Your Product] → Pricing
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
    const body: CreateSubscriptionRequest = await req.json();

    // Validate request
    if (!body.salon_id || !body.customer_id || !body.plan) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: salon_id, customer_id, plan" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    if (!["starter", "pro", "business"].includes(body.plan)) {
      return new Response(
        JSON.stringify({ error: "Invalid plan. Must be starter, pro, or business" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const priceId = PLAN_PRICE_IDS[body.plan];
    if (!priceId || !priceId.startsWith("price_")) {
      return new Response(
        JSON.stringify({ 
          error: `Price ID not configured for plan: ${body.plan}`,
          details: `Please set STRIPE_PRICE_${body.plan.toUpperCase()} in Supabase Edge Functions secrets with your actual Stripe price ID (starts with 'price_'). Current value: ${priceId}`,
          hint: "Go to Stripe Dashboard → Products → [Your Product] → Pricing to find the price ID"
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

    // Create Stripe subscription
    const subscription = await stripe.subscriptions.create({
      customer: body.customer_id,
      items: [{ price: priceId }],
      metadata: {
        salon_id: body.salon_id,
        plan: body.plan,
        user_id: user.id,
      },
      payment_behavior: "default_incomplete", // Require payment method
      payment_settings: {
        payment_method_types: ["card"],
        save_default_payment_method: "on_subscription",
      },
      expand: ["latest_invoice.payment_intent"],
    });

    // Calculate current period end
    const currentPeriodEnd = new Date(subscription.current_period_end * 1000).toISOString();

    // Update salon with subscription ID and plan using service role key
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const { error: updateError } = await supabase
      .from("salons")
      .update({
        billing_subscription_id: subscription.id,
        plan: body.plan,
        current_period_end: currentPeriodEnd,
      })
      .eq("id", body.salon_id);

    if (updateError) {
      console.error("Error updating salon with subscription:", updateError);
      // Don't fail the request, subscription is created in Stripe
    }

    // Extract client secret for payment if needed
    const invoice = subscription.latest_invoice as Stripe.Invoice;
    const paymentIntent = invoice?.payment_intent as Stripe.PaymentIntent;
    const clientSecret = paymentIntent?.client_secret;

    return new Response(
      JSON.stringify({
        success: true,
        subscription_id: subscription.id,
        plan: body.plan,
        current_period_end: currentPeriodEnd,
        status: subscription.status,
        client_secret: clientSecret, // For frontend payment confirmation
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error creating Stripe subscription:", error);
    
    // Handle Stripe-specific errors
    if (error instanceof Stripe.errors.StripeError) {
      return new Response(
        JSON.stringify({
          error: "Stripe error",
          details: error.message,
          type: error.type,
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
