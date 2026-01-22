import { NextRequest, NextResponse } from "next/server";
import { sendBookingConfirmation } from "@/lib/services/email-service";
import { scheduleReminders } from "@/lib/services/reminder-service";
import { getSalonById } from "@/lib/repositories/salons";
import { logError, logWarn, logInfo } from "@/lib/services/logger";
import { supabase } from "@/lib/supabase-client";
import { authenticateAndVerifySalon } from "@/lib/api-auth";
import { checkRateLimit, incrementRateLimit } from "@/lib/services/rate-limit-service";
import type { Booking } from "@/lib/types";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      booking,
      customerEmail,
      salonId,
      language,
    }: {
      booking: Booking & {
        customer_full_name: string;
        service?: { name: string | null } | null;
        employee?: { name: string | null } | null;
        salon?: { name: string | null } | null;
      };
      customerEmail: string;
      salonId: string;
      language?: string;
    } = body;

    // Log incoming request for debugging
    logInfo("send-notifications API route called", {
      bookingId: booking?.id,
      customerEmail,
      salonId,
      hasBooking: !!booking,
    });

    if (!booking || !customerEmail || !salonId) {
      logError("Missing required fields in send-notifications API route", new Error("Missing required fields"), {
        booking: !!booking,
        customerEmail: !!customerEmail,
        salonId: !!salonId,
      });
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Authenticate user and verify salon access
    const authResult = await authenticateAndVerifySalon(request, salonId);
    
    if (authResult.error || !authResult.user || !authResult.hasAccess) {
      const statusCode = !authResult.user ? 401 : 403;
      logWarn("Unauthorized access attempt to send-notifications", {
        userId: authResult.user?.id,
        salonId,
        error: authResult.error,
      });
      return NextResponse.json(
        { error: authResult.error || "Unauthorized" },
        { status: statusCode }
      );
    }

    // Rate limiting: 10 requests per minute per user
    const userId = authResult.user.id;
    const rateLimitResult = await checkRateLimit(
      userId,
      "booking-notifications",
      { identifierType: "user_id", endpointType: "booking-notifications" }
    );

    if (!rateLimitResult.allowed) {
      logWarn("Rate limit exceeded for send-notifications", {
        userId,
        salonId,
        remainingAttempts: rateLimitResult.remainingAttempts,
      });
      return NextResponse.json(
        {
          error: "Rate limit exceeded",
          message: "Too many requests. Please try again later.",
        },
        {
          status: 429,
          headers: {
            "X-RateLimit-Limit": "10",
            "X-RateLimit-Remaining": rateLimitResult.remainingAttempts.toString(),
            "Retry-After": rateLimitResult.resetTime
              ? Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000).toString()
              : "60",
          },
        }
      );
    }

    // Increment rate limit counter
    await incrementRateLimit(
      userId,
      "booking-notifications",
      { identifierType: "user_id", endpointType: "booking-notifications" }
    );

    // Get salon info for language and name
    const salonResult = await getSalonById(salonId);
    const salon = salonResult.data;

    // Prepare booking data for email template
    const bookingForEmail: Booking & {
      customer_full_name: string;
      service?: { name: string | null } | null;
      employee?: { name: string | null } | null;
      salon?: { name: string | null } | null;
    } = {
      ...booking,
      customer_full_name: booking.customer_full_name,
      service: booking.service,
      employee: booking.employee,
      salon: salon ? { name: salon.name } : booking.salon,
    };

    // Send confirmation email to customer (don't fail if email fails)
    logInfo("Attempting to send booking confirmation email", {
      bookingId: booking.id,
      recipientEmail: customerEmail,
      language: language || salon?.preferred_language || "en",
      hasResendApiKey: !!process.env.RESEND_API_KEY,
    });

    const emailResult = await sendBookingConfirmation({
      booking: bookingForEmail,
      recipientEmail: customerEmail,
      language: language || salon?.preferred_language || "en",
      salonId,
    }).catch((emailError) => {
      logWarn("Failed to send booking confirmation email", {
        bookingId: booking.id,
        emailError: emailError instanceof Error ? emailError.message : "Unknown error",
      });
      return { data: null, error: emailError instanceof Error ? emailError.message : "Unknown error" };
    });

    logInfo("Email sending result", {
      bookingId: booking.id,
      emailSuccess: !emailResult.error,
      emailError: emailResult.error,
    });

    // Schedule reminders (24h and 2h before appointment)
    const reminderResult = await scheduleReminders({
      bookingId: booking.id,
      bookingStartTime: booking.start_time,
      salonId,
      timezone: salon?.preferred_language ? undefined : "UTC",
    }).catch((reminderError: unknown) => {
      logWarn("Failed to schedule reminders", {
        bookingId: booking.id,
        reminderError: reminderError instanceof Error ? reminderError.message : "Unknown error",
      });
      return { error: reminderError instanceof Error ? reminderError.message : "Unknown error" };
    });

    // Send in-app notification to salon owner and managers about new booking
    // Using database function to bypass RLS issues
    let inAppResult = null;
    try {
      const customerName = booking.customer_full_name || "Customer";
      const serviceName = booking.service?.name || booking.services?.name || "Service";
      const bookingTime = booking.start_time;

      logInfo("Calling notify_salon_staff_new_booking", {
        bookingId: booking.id,
        salonId,
        customerName,
        serviceName,
        bookingTime,
      });

      const { data: notifiedCount, error: notifyError } = await supabase.rpc(
        "notify_salon_staff_new_booking",
        {
          p_salon_id: salonId,
          p_customer_name: customerName,
          p_service_name: serviceName,
          p_booking_time: bookingTime,
          p_booking_id: booking.id,
        }
      );

      if (notifyError) {
        logWarn("Failed to notify salon staff via RPC", {
          bookingId: booking.id,
          error: notifyError.message,
        });
        inAppResult = {
          success: false,
          error: notifyError.message,
        };
      } else {
        logInfo("Salon staff notified successfully", {
          bookingId: booking.id,
          notifiedCount,
        });
        inAppResult = {
          success: true,
          sent: notifiedCount,
        };
      }
    } catch (inAppError) {
      logWarn("Failed to send in-app notifications to salon staff", {
        bookingId: booking.id,
        inAppError: inAppError instanceof Error ? inAppError.message : "Unknown error",
      });
      inAppResult = { success: false, error: inAppError instanceof Error ? inAppError.message : "Unknown error" };
    }

    return NextResponse.json({
      email: emailResult,
      reminders: reminderResult,
      inApp: inAppResult,
    });
  } catch (error) {
    logError("Exception in send-notifications API route", error, {});
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

