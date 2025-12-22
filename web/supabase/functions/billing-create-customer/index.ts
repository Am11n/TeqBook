// =====================================================
// Billing: Create Stripe Customer
// =====================================================
// Creates a Stripe customer for a salon
//
// Usage:
// POST /functions/v1/billing-create-customer
// Body: { salon_id: string, email: string, name: string }

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

interface CreateCustomerRequest {
  salon_id: string;
  email: string;
  name: string;
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

    // Parse request body
    const body: CreateCustomerRequest = await req.json();

    // Validate request
    if (!body.salon_id || !body.email || !body.name) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: salon_id, email, name" }),
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

    // Create Stripe customer
    const customer = await stripe.customers.create({
      email: body.email,
      name: body.name,
      metadata: {
        salon_id: body.salon_id,
        user_id: user.id,
      },
    });

    // Update salon with customer ID using service role key
    if (supabaseServiceKey) {
      const supabase = createClient(supabaseUrl, supabaseServiceKey);
      const { error: updateError } = await supabase
        .from("salons")
        .update({ billing_customer_id: customer.id })
        .eq("id", body.salon_id);

      if (updateError) {
        console.error("Error updating salon with customer ID:", updateError);
        // Don't fail the request - customer is created in Stripe
      } else {
        console.log(`Successfully updated salon ${body.salon_id} with customer ${customer.id}`);
      }
    } else {
      console.warn("SUPABASE_SERVICE_ROLE_KEY not set - skipping database update");
    }

    return new Response(
      JSON.stringify({
        success: true,
        customer_id: customer.id,
        email: customer.email,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error creating Stripe customer:", error);
    
    // Provide more detailed error information
    let errorMessage = "Internal server error";
    let errorDetails = error instanceof Error ? error.message : "Unknown error";
    
    // Check if it's a Stripe error
    if (error && typeof error === "object" && "type" in error) {
      errorMessage = "Stripe API error";
      errorDetails = errorDetails;
    }
    
    return new Response(
      JSON.stringify({
        error: errorMessage,
        details: errorDetails,
        // Include stack trace in development
        ...(process.env.NODE_ENV === "development" && error instanceof Error && { stack: error.stack }),
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
