// =====================================================
// Process Reminders Edge Function
// =====================================================
// Cron job to process and send booking reminders
// Should be called periodically (e.g., every 5 minutes)

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ProcessRemindersRequest {
  limit?: number;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  // Log cron job execution start
  const executionStart = new Date().toISOString();
  console.log(`[Cron Job] Starting process-reminders execution at ${executionStart}`);

  try {
    // Get environment variables
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !supabaseServiceKey) {
      return new Response(
        JSON.stringify({ error: "Missing Supabase configuration" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Create Supabase client with service role
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Parse request body (optional)
    let limit = 100;
    try {
      const body: ProcessRemindersRequest = await req.json().catch(() => ({}));
      limit = body.limit || 100;
    } catch {
      // No body provided, use default
    }

    // Get reminders that should be sent
    const now = new Date().toISOString();
    const { data: reminders, error: remindersError } = await supabase
      .from("reminders")
      .select(`
        id,
        booking_id,
        reminder_type,
        scheduled_at,
        bookings!inner(
          id,
          start_time,
          salon_id,
          customers(full_name, email),
          employees(full_name),
          services(name),
          salons(id, name, preferred_language)
        )
      `)
      .eq("status", "pending")
      .lte("scheduled_at", now)
      .order("scheduled_at", { ascending: true })
      .limit(limit);

    if (remindersError) {
      console.error("Error fetching reminders:", remindersError);
      return new Response(
        JSON.stringify({ error: "Failed to fetch reminders", details: remindersError.message }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    if (!reminders || reminders.length === 0) {
      return new Response(
        JSON.stringify({ processed: 0, errors: 0, message: "No reminders to process" }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    let processed = 0;
    let errors = 0;

    // Process each reminder
    for (const reminder of reminders) {
      try {
        const booking = reminder.bookings;
        
        // Skip if no booking or customer email
        if (!booking || !booking.customers?.email) {
          console.warn(`Reminder ${reminder.id} missing booking or customer email`);
          await supabase
            .from("reminders")
            .update({
              status: "failed",
              error_message: "Missing booking or customer email",
              updated_at: new Date().toISOString(),
            })
            .eq("id", reminder.id);
          errors++;
          continue;
        }

        // Prepare booking data for email
        const bookingForEmail = {
          id: booking.id,
          start_time: booking.start_time,
          end_time: booking.start_time, // TODO: Calculate from service duration
          status: "confirmed",
          is_walk_in: false,
          notes: null,
          customer_full_name: booking.customers?.full_name || "Customer",
          service: booking.services ? { name: booking.services.name } : null,
          employee: booking.employees ? { name: booking.employees.full_name } : null,
          salon: booking.salons ? { name: booking.salons.name } : null,
        };

        // Call email service Edge Function
        const emailFunctionUrl = `${supabaseUrl}/functions/v1/send-booking-reminder`;
        const emailResponse = await fetch(emailFunctionUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${supabaseServiceKey}`,
          },
          body: JSON.stringify({
            booking: bookingForEmail,
            recipientEmail: booking.customers.email,
            reminderType: reminder.reminder_type,
            language: booking.salons?.preferred_language || "en",
            salonId: booking.salon_id,
          }),
        });

        if (!emailResponse.ok) {
          const errorText = await emailResponse.text();
          console.error(`Failed to send reminder email for reminder ${reminder.id}:`, errorText);
          await supabase
            .from("reminders")
            .update({
              status: "failed",
              error_message: `Email service error: ${errorText}`,
              updated_at: new Date().toISOString(),
            })
            .eq("id", reminder.id);
          errors++;
        } else {
          // Mark reminder as sent
          await supabase
            .from("reminders")
            .update({
              status: "sent",
              sent_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            })
            .eq("id", reminder.id);
          processed++;
          console.log(`Reminder ${reminder.id} sent successfully`);
        }
      } catch (error) {
        console.error(`Exception processing reminder ${reminder.id}:`, error);
        await supabase
          .from("reminders")
          .update({
            status: "failed",
            error_message: error instanceof Error ? error.message : "Unknown error",
            updated_at: new Date().toISOString(),
          })
          .eq("id", reminder.id);
        errors++;
      }
    }

    // Log execution summary
    console.log(`[Cron Job] Processed ${processed} reminders, ${errors} errors out of ${reminders.length} total`);

    return new Response(
      JSON.stringify({
        processed,
        errors,
        total: reminders.length,
        message: `Processed ${processed} reminders, ${errors} errors`,
        timestamp: new Date().toISOString(),
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error processing reminders:", error);
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

