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

    // Get reminders that should be sent with locking
    // This prevents concurrent processing of the same reminder
    const now = new Date().toISOString();
    const lockTimeout = new Date(Date.now() - 10 * 60 * 1000).toISOString(); // 10 minutes ago
    const instanceId = `edge-${Date.now()}-${Math.random().toString(36).substring(7)}`;
    
    // First, get reminders that are:
    // 1. pending and scheduled_at <= now, OR
    // 2. failed with next_attempt_at <= now (retry)
    // And not locked (or lock expired)
    const { data: pendingReminders, error: fetchError } = await supabase
      .from("reminders")
      .select(`
        id,
        booking_id,
        reminder_type,
        scheduled_at,
        attempts,
        next_attempt_at,
        bookings!inner(
          id,
          start_time,
          salon_id,
          customers(full_name, email),
          employees(full_name),
          services(name),
          salons(id, name, preferred_language, timezone)
        )
      `)
      .or(`and(status.eq.pending,scheduled_at.lte.${now}),and(status.eq.failed,next_attempt_at.lte.${now})`)
      .or(`locked_at.is.null,locked_at.lt.${lockTimeout}`)
      .order("scheduled_at", { ascending: true })
      .limit(limit);

    if (fetchError || !pendingReminders || pendingReminders.length === 0) {
      return new Response(
        JSON.stringify({ processed: 0, errors: 0, message: "No reminders to process" }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Lock reminders by updating status to 'sending' and setting lock fields
    // Only update if still pending or failed (atomic operation prevents race conditions)
    const reminderIds = pendingReminders.map(r => r.id);
    const { data: lockedReminders, error: lockError } = await supabase
      .from("reminders")
      .update({
        status: "sending",
        locked_at: now,
        locked_by: instanceId,
      })
      .in("id", reminderIds)
      .in("status", ["pending", "failed"])
      .select(`
        id,
        booking_id,
        reminder_type,
        scheduled_at,
        attempts,
        next_attempt_at,
        bookings!inner(
          id,
          start_time,
          salon_id,
          customers(full_name, email),
          employees(full_name),
          services(name),
          salons(id, name, preferred_language, timezone)
        )
      `);

    if (lockError || !lockedReminders || lockedReminders.length === 0) {
      console.log("No reminders could be locked (likely processed by another instance)");
      return new Response(
        JSON.stringify({ processed: 0, errors: 0, message: "No reminders available for processing" }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const reminders = lockedReminders;

    // Get Resend API key
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (!resendApiKey) {
      console.error("RESEND_API_KEY not configured");
      // Mark reminders as failed
      await supabase
        .from("reminders")
        .update({
          status: "failed",
          last_error: "RESEND_API_KEY not configured",
          locked_at: null,
          locked_by: null,
        })
        .in("id", reminderIds);
      
      return new Response(
        JSON.stringify({ error: "RESEND_API_KEY not configured" }),
        {
          status: 500,
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
              last_error: "Missing booking or customer email",
              locked_at: null,
              locked_by: null,
              updated_at: new Date().toISOString(),
            })
            .eq("id", reminder.id);
          errors++;
          continue;
        }

        // Increment attempts counter
        const currentAttempts = reminder.attempts || 0;
        await supabase
          .from("reminders")
          .update({
            attempts: currentAttempts + 1,
          })
          .eq("id", reminder.id);

        // Prepare booking data for email template
        const customerName = booking.customers?.full_name || "Customer";
        const serviceName = booking.services?.name || "Service";
        const employeeName = booking.employees?.full_name || null;
        const salonName = booking.salons?.name || "Salon";
        const language = booking.salons?.preferred_language || "en";
        const timezone = booking.salons?.timezone || "UTC";
        
        // Format booking time in salon timezone
        const bookingTime = new Date(booking.start_time);
        const formattedTime = bookingTime.toLocaleString("en-US", {
          timeZone: timezone,
          year: "numeric",
          month: "long",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        });

        // Determine reminder message based on type
        const reminderHours = reminder.reminder_type === "24h" ? "24" : "2";
        const subject = `Reminder: Your appointment in ${reminderHours} hours`;
        const reminderMessage = reminder.reminder_type === "24h"
          ? `This is a reminder that you have an appointment tomorrow at ${formattedTime}.`
          : `This is a reminder that you have an appointment in 2 hours at ${formattedTime}.`;

        // Create email HTML (simple template)
        const html = `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
              <h2 style="color: #2563eb;">Appointment Reminder</h2>
              <p>Hello ${customerName},</p>
              <p>${reminderMessage}</p>
              <div style="background-color: #f3f4f6; padding: 15px; border-radius: 5px; margin: 20px 0;">
                <p><strong>Service:</strong> ${serviceName}</p>
                ${employeeName ? `<p><strong>Stylist:</strong> ${employeeName}</p>` : ""}
                <p><strong>Time:</strong> ${formattedTime}</p>
                <p><strong>Salon:</strong> ${salonName}</p>
              </div>
              <p>We look forward to seeing you!</p>
              <p>Best regards,<br>${salonName}</p>
            </div>
          </body>
          </html>
        `;

        const text = `
Appointment Reminder

Hello ${customerName},

${reminderMessage}

Service: ${serviceName}
${employeeName ? `Stylist: ${employeeName}\n` : ""}Time: ${formattedTime}
Salon: ${salonName}

We look forward to seeing you!

Best regards,
${salonName}
        `.trim();

        // Send email directly via Resend API
        const fromEmail = Deno.env.get("EMAIL_FROM") || "noreply@teqbook.app";
        const fromName = Deno.env.get("EMAIL_FROM_NAME") || "TeqBook";
        
        const resendResponse = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${resendApiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: `${fromName} <${fromEmail}>`,
            to: booking.customers.email,
            subject,
            html,
            text,
          }),
        });

        if (!resendResponse.ok) {
          const errorData = await resendResponse.text();
          const errorMessage = `Resend API error: ${errorData}`;
          console.error(`[Reminder ${reminder.id}] Failed to send:`, errorMessage);
          
          // Calculate backoff: exponential backoff based on attempts
          const attempts = currentAttempts + 1;
          const backoffMinutes = Math.min(60, Math.pow(2, attempts)); // Max 60 minutes
          const nextAttemptAt = new Date(Date.now() + backoffMinutes * 60 * 1000).toISOString();
          
          await supabase
            .from("reminders")
            .update({
              status: "failed",
              last_error: errorMessage,
              next_attempt_at: nextAttemptAt,
              locked_at: null,
              locked_by: null,
              updated_at: new Date().toISOString(),
            })
            .eq("id", reminder.id);
          errors++;
          console.log(`[Reminder ${reminder.id}] Failed (attempt ${attempts}), will retry at ${nextAttemptAt}`);
        } else {
          const resendData = await resendResponse.json();
          console.log(`[Reminder ${reminder.id}] Sent successfully via Resend:`, resendData.id);
          
          // Mark reminder as sent
          await supabase
            .from("reminders")
            .update({
              status: "sent",
              sent_at: new Date().toISOString(),
              locked_at: null,
              locked_by: null,
              updated_at: new Date().toISOString(),
            })
            .eq("id", reminder.id);
          processed++;
        }
      } catch (error) {
        console.error(`[Reminder ${reminder.id}] Exception:`, error);
        const errorMessage = error instanceof Error ? error.message : "Unknown error";
        
        // Calculate backoff for exceptions too
        const attempts = currentAttempts + 1;
        const backoffMinutes = Math.min(60, Math.pow(2, attempts));
        const nextAttemptAt = new Date(Date.now() + backoffMinutes * 60 * 1000).toISOString();
        
        await supabase
          .from("reminders")
          .update({
            status: "failed",
            last_error: errorMessage,
            next_attempt_at: nextAttemptAt,
            locked_at: null,
            locked_by: null,
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

