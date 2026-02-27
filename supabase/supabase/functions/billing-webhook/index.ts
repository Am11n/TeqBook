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
    // For webhooks, we verify using Stripe signature, not Supabase auth
    // However, Supabase may require apikey header for Edge Functions
    // Check if apikey is provided (optional for webhooks, but may be required by Supabase)
    const apikey = req.headers.get("apikey") || new URL(req.url).searchParams.get("apikey");
    
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

    // Verify webhook signature and prevent replay attacks
    let event: Stripe.Event;
    try {
      // Extract timestamp from signature header to check for replay attacks
      // Stripe signature format: t=timestamp,v1=signature,v0=signature
      const signatureParts = signature.split(",");
      const timestampPart = signatureParts.find((part) => part.startsWith("t="));
      
      if (timestampPart) {
        const timestamp = parseInt(timestampPart.split("=")[1]);
        const currentTime = Math.floor(Date.now() / 1000);
        const age = currentTime - timestamp;
        
        // Reject webhooks older than 5 minutes (300 seconds) to prevent replay attacks
        // Stripe SDK also validates this, but we add explicit check for clarity
        if (age > 300) {
          console.error("Webhook timestamp too old (replay attack):", { age, timestamp, currentTime });
          return new Response(
            JSON.stringify({ error: "Webhook timestamp too old - possible replay attack" }),
            {
              status: 400,
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            }
          );
        }
        
        // Reject webhooks with future timestamps
        if (age < -300) {
          console.error("Webhook timestamp in future:", { age, timestamp, currentTime });
          return new Response(
            JSON.stringify({ error: "Webhook timestamp in future" }),
            {
              status: 400,
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            }
          );
        }
      }

      // Verify webhook signature using Stripe SDK
      // In Deno/Edge Functions, we must use constructEventAsync instead of constructEvent
      // This validates the signature and also checks timestamp (within 5 minutes)
      event = await stripe.webhooks.constructEventAsync(
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

        // If subscription is canceled, clear subscription_id but keep current_period_end
        if (subscription.status === "canceled" || subscription.canceled_at) {
          const { error: updateError } = await supabase
            .from("salons")
            .update({
              billing_subscription_id: null,
              current_period_end: subscription.current_period_end 
                ? new Date(subscription.current_period_end * 1000).toISOString()
                : null,
            })
            .eq("id", salonId);

          if (updateError) {
            console.error("Error updating salon after subscription cancellation:", updateError);
          } else {
            console.log(`Cleared subscription for salon ${salonId} - subscription was canceled`);
          }
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
            // Update current_period_end and reset payment failure status
            const { error: updateError } = await supabase
              .from("salons")
              .update({
                current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
                payment_failure_count: 0,
                payment_failed_at: null,
                last_payment_retry_at: null,
                payment_status: "active",
              })
              .eq("id", salonId);

            if (updateError) {
              console.error("Error updating salon after payment:", updateError);
            } else {
              console.log(`Payment succeeded for invoice ${invoice.id}, reset payment failure status for salon ${salonId}`);
            }
          }
        }
        console.log(`Payment succeeded for invoice ${invoice.id}`);
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        const subscriptionId = invoice.subscription as string | null;

        console.log("Processing invoice.payment_failed event:", {
          invoice_id: invoice.id,
          subscription_id: subscriptionId,
          customer_id: invoice.customer,
        });

        let salonId: string | null = null;

        // Try to find salon_id via subscription metadata first (if subscription exists)
        if (subscriptionId) {
          try {
            // Retrieve subscription to get salon_id
            const subscription = await stripe.subscriptions.retrieve(subscriptionId);
            
            // Get salon_id from subscription metadata
            salonId = subscription.metadata.salon_id || null;

            console.log("Retrieved subscription:", {
              subscription_id: subscription.id,
              salon_id: salonId,
              metadata: subscription.metadata,
            });

            // If subscription metadata doesn't have salon_id, try to find salon via customer_id
            if (!salonId && invoice.customer) {
              console.log("Subscription missing salon_id in metadata, trying to find salon via customer_id:", {
                customer_id: invoice.customer,
              });
              
              // Try to find salon by billing_customer_id
              const { data: salonByCustomer } = await supabase
                .from("salons")
                .select("id")
                .eq("billing_customer_id", invoice.customer as string)
                .maybeSingle();
              
              if (salonByCustomer) {
                salonId = salonByCustomer.id;
                console.log("Found salon via customer_id:", salonId);
                
                // Update subscription metadata with salon_id for future webhooks
                try {
                  await stripe.subscriptions.update(subscriptionId, {
                    metadata: {
                      ...subscription.metadata,
                      salon_id: salonId,
                    },
                  });
                  console.log("Updated subscription metadata with salon_id");
                } catch (updateError) {
                  console.warn("Failed to update subscription metadata:", updateError);
                }
              }
            }
          } catch (subscriptionError) {
            console.error("Error retrieving subscription:", {
              subscription_id: subscriptionId,
              error: subscriptionError instanceof Error ? subscriptionError.message : "Unknown error",
            });
            // Continue to try finding salon via customer_id even if subscription retrieval fails
          }
        }

        // Fallback: If no subscription or subscription doesn't have salon_id, try to find salon directly via customer_id
        if (!salonId && invoice.customer) {
          console.log("No subscription or subscription missing salon_id, trying to find salon directly via customer_id:", {
            customer_id: invoice.customer,
            has_subscription: !!subscriptionId,
          });
          
          const { data: salonByCustomer } = await supabase
            .from("salons")
            .select("id")
            .eq("billing_customer_id", invoice.customer as string)
            .maybeSingle();
          
          if (salonByCustomer) {
            salonId = salonByCustomer.id;
            console.log("Found salon directly via customer_id:", salonId);
          } else {
            console.warn("Could not find salon by customer_id:", {
              customer_id: invoice.customer,
              subscription_id: subscriptionId,
            });
          }
        }
        
        if (!salonId) {
          console.warn("Cannot process payment failure - no salon_id found:", {
            subscription_id: subscriptionId,
            customer_id: invoice.customer,
          });
          break;
        }

        try {
          // At this point, salonId is guaranteed to be set
          // Get failure reason from invoice
          const failureReason = invoice.last_payment_error?.message || "payment_failed";
          
          // Get current salon data
          const { data: salon } = await supabase
            .from("salons")
            .select("id, name, billing_customer_id, payment_failure_count, payment_failed_at, payment_status")
            .eq("id", salonId)
            .single();

          if (salon) {
            const currentFailureCount = (salon.payment_failure_count || 0) + 1;
            const now = new Date().toISOString();
            const GRACE_PERIOD_DAYS = 7;
            const MAX_RETRY_ATTEMPTS = 3;
            
            // Calculate grace period end
            const gracePeriodEndsAt = salon.payment_failed_at
              ? new Date(new Date(salon.payment_failed_at).getTime() + GRACE_PERIOD_DAYS * 24 * 60 * 60 * 1000).toISOString()
              : new Date(Date.now() + GRACE_PERIOD_DAYS * 24 * 60 * 60 * 1000).toISOString();

            // Update salon with payment failure
            const updateData: any = {
              payment_failure_count: currentFailureCount,
              last_payment_retry_at: now,
            };

            // Set payment_failed_at if this is the first failure
            if (!salon.payment_failed_at) {
              updateData.payment_failed_at = now;
            }

            // Update payment status
            if (currentFailureCount >= MAX_RETRY_ATTEMPTS) {
              const daysSinceFirstFailure = salon.payment_failed_at
                ? Math.floor((Date.now() - new Date(salon.payment_failed_at).getTime()) / (24 * 60 * 60 * 1000))
                : 0;

              if (daysSinceFirstFailure >= GRACE_PERIOD_DAYS) {
                updateData.payment_status = "restricted";
              } else {
                updateData.payment_status = "grace_period";
              }
            } else {
              updateData.payment_status = "failed";
            }

            const { error: updateError } = await supabase
              .from("salons")
              .update(updateData)
              .eq("id", salonId);

            if (updateError) {
              console.error("Error updating salon payment failure status:", {
                error: updateError,
                salonId,
                updateData,
              });
            } else {
              console.log(`Payment failed for invoice ${invoice.id}. Updated salon ${salonId} with failure count ${currentFailureCount}`, {
                salonId,
                subscription_id: subscriptionId || null,
                customer_id: invoice.customer,
                payment_status: updateData.payment_status,
                payment_failure_count: currentFailureCount,
              });
              
              // Get salon owner email and send notification
              const { data: profile } = await supabase
                .from("profiles")
                .select("user_id, email")
                .eq("salon_id", salonId)
                .eq("role", "owner")
                .single();

              if (profile?.email) {
                // Note: Email sending would be done via Edge Function or background job
                // For now, we log it - email service integration can be added later
                console.log(`Should send payment failure email to ${profile.email} for salon ${salonId}`);
              }
            }
          } else {
            console.warn("Salon not found in database:", salonId);
          }
        } catch (error) {
          console.error("Error processing payment failure:", {
            salonId,
            invoice_id: invoice.id,
            customer_id: invoice.customer,
            error: error instanceof Error ? error.message : "Unknown error",
          });
        }
        break;
      }

      case "invoice.upcoming": {
        const invoice = event.data.object as Stripe.Invoice;
        console.log("Invoice upcoming received - SMS overage hook is preview-only in this phase", {
          invoice_id: invoice.id,
          customer_id: invoice.customer,
          subscription_id: invoice.subscription,
        });
        break;
      }

      default: {
        console.log(`Unhandled event type: ${event.type}`);
      }
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
