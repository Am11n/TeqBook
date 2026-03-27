// =====================================================
// Billing: Finalize SetupIntent — set default payment method
// =====================================================
// After the client confirms a SetupIntent, call this so Stripe customer
// invoice_settings.default_payment_method is set for future invoices.
//
// POST /functions/v1/billing-finalize-setup-intent
// Body: { salon_id, customer_id, setup_intent_id }

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { authenticateRequest } from "../_shared/auth.ts";
import { checkRateLimit, createRateLimitErrorResponse } from "../_shared/rate-limit.ts";

function extractIdentifier(
  req: Request,
  user: { id: string } | null
): { identifier: string; identifierType: "ip" | "user_id" } {
  if (user?.id) {
    return { identifier: user.id, identifierType: "user_id" };
  }
  const forwardedFor = req.headers.get("x-forwarded-for");
  const ip = forwardedFor ? forwardedFor.split(",")[0].trim() : "unknown";
  return { identifier: ip, identifierType: "ip" };
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

interface FinalizeSetupIntentRequest {
  salon_id: string;
  customer_id: string;
  setup_intent_id: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
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

    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    const rateLimitResult = await checkRateLimit(
      req,
      {
        endpointType: "billing-finalize-setup-intent",
        supabaseUrl,
        supabaseServiceKey,
      },
      user
    );

    if (!rateLimitResult.allowed) {
      const { identifier, identifierType } = extractIdentifier(req, user);
      return createRateLimitErrorResponse(
        rateLimitResult,
        identifier,
        identifierType,
        "billing-finalize-setup-intent",
        supabaseUrl,
        supabaseServiceKey
      );
    }

    const body: FinalizeSetupIntentRequest = await req.json();
    const { salon_id, customer_id, setup_intent_id } = body;

    if (!salon_id || !customer_id || !setup_intent_id) {
      return new Response(
        JSON.stringify({
          error: "Missing required fields: salon_id, customer_id, setup_intent_id",
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Missing authorization header" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUser = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: salon, error: salonError } = await supabaseUser
      .from("salons")
      .select("id, owner_id, billing_customer_id")
      .eq("id", salon_id)
      .single();

    if (salonError || !salon) {
      return new Response(JSON.stringify({ error: "Salon not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (salon.owner_id !== user.id) {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (salon.billing_customer_id !== customer_id) {
      return new Response(JSON.stringify({ error: "Customer does not match salon" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: "2024-11-20.acacia",
    });

    const setupIntent = await stripe.setupIntents.retrieve(setup_intent_id);

    if (setupIntent.customer !== customer_id) {
      return new Response(
        JSON.stringify({ error: "Setup intent does not belong to this customer" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    if (setupIntent.status !== "succeeded") {
      return new Response(
        JSON.stringify({
          error: `Setup intent not succeeded (status: ${setupIntent.status})`,
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const paymentMethodId =
      typeof setupIntent.payment_method === "string"
        ? setupIntent.payment_method
        : setupIntent.payment_method?.id;

    if (!paymentMethodId) {
      return new Response(JSON.stringify({ error: "No payment method on setup intent" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    await stripe.customers.update(customer_id, {
      invoice_settings: {
        default_payment_method: paymentMethodId,
      },
    });

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: {
        ...corsHeaders,
        ...rateLimitResult.headers,
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("Error in billing-finalize-setup-intent:", error);

    if (error instanceof Stripe.errors.StripeError) {
      return new Response(
        JSON.stringify({
          error: "Stripe error",
          details: error.message,
          type: error.type,
          code: error.code,
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
