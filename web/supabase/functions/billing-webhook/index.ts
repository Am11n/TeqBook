// =====================================================
// Billing: Stripe Webhook Handler
// =====================================================
// Handles Stripe webhook events for subscription lifecycle
//
// Usage:
// POST /functions/v1/billing-webhook
// Headers: stripe-signature (from Stripe)
// Body: Stripe event JSON

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, stripe-signature",
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Get environment variables
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    const stripeWebhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET") ?? "";

    if (!stripeWebhookSecret) {
      return new Response(
        JSON.stringify({ error: "STRIPE_WEBHOOK_SECRET environment variable is not set" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Get Stripe signature from headers
    const signature = req.headers.get("stripe-signature");
    if (!signature) {
      return new Response(
        JSON.stringify({ error: "Missing stripe-signature header" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Get raw body for signature verification
    const body = await req.text();

    // Initialize Stripe
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") ?? "", {
      apiVersion: "2024-11-20.acacia",
    });

    // Verify webhook signature
    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        stripeWebhookSecret
      );
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      console.error("Webhook signature verification failed:", errorMessage);
      return new Response(
        JSON.stringify({ error: `Webhook signature verification failed: ${errorMessage}` }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Initialize Supabase client with service role key
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Handle different event types
    switch (event.type) {
      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        const salonId = subscription.metadata.salon_id;

        if (!salonId) {
          console.warn("Subscription missing salon_id in metadata:", subscription.id);
          break;
        }

        // Update salon with subscription details
        const { error: updateError } = await supabase
          .from("salons")
          .update({
            billing_subscription_id: subscription.id,
            plan: subscription.metadata.plan || null,
            current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
          })
          .eq("id", salonId);

        if (updateError) {
          console.error("Error updating salon subscription:", updateError);
        } else {
          console.log(`Updated salon ${salonId} with subscription ${subscription.id}`);
        }
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const salonId = subscription.metadata.salon_id;

        if (!salonId) {
          console.warn("Subscription missing salon_id in metadata:", subscription.id);
          break;
        }

        // Optionally: Set plan to null or a default value when subscription is cancelled
        // For now, we'll keep the plan but clear the subscription_id
        const { error: updateError } = await supabase
          .from("salons")
          .update({
            billing_subscription_id: null,
            // Optionally: plan: null, or keep the plan for grace period
          })
          .eq("id", salonId);

        if (updateError) {
          console.error("Error updating salon after subscription deletion:", updateError);
        } else {
          console.log(`Cleared subscription for salon ${salonId}`);
        }
        break;
      }

      case "invoice.payment_succeeded": {
        const invoice = event.data.object as Stripe.Invoice;
        const subscriptionId = invoice.subscription as string;

        if (subscriptionId) {
          // Retrieve subscription to get salon_id
          const subscription = await stripe.subscriptions.retrieve(subscriptionId);
          const salonId = subscription.metadata.salon_id;

          if (salonId) {
            // Update current_period_end if needed
            const { error: updateError } = await supabase
              .from("salons")
              .update({
                current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
              })
              .eq("id", salonId);

            if (updateError) {
              console.error("Error updating salon after payment:", updateError);
            }
          }
        }
        console.log(`Payment succeeded for invoice ${invoice.id}`);
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        const subscriptionId = invoice.subscription as string;

        if (subscriptionId) {
          // You might want to notify the salon owner or update a status
          console.log(`Payment failed for subscription ${subscriptionId}, invoice ${invoice.id}`);
          // TODO: Send notification email or update status
        }
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return new Response(
      JSON.stringify({ received: true, event_type: event.type }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error processing webhook:", error);
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
