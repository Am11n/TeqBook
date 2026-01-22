import { NextRequest, NextResponse } from "next/server";
import { sendBookingConfirmation } from "@/lib/services/email-service";
import { scheduleReminders } from "@/lib/services/reminder-service";
import { getSalonById } from "@/lib/repositories/salons";
import { getBookingByIdWithSalonVerification } from "@/lib/repositories/bookings";
import { logError, logWarn, logInfo } from "@/lib/services/logger";
import { createClientForRouteHandler } from "@/lib/supabase/server";
import { authenticateAndVerifySalon } from "@/lib/api-auth";
import { checkRateLimit, incrementRateLimit } from "@/lib/services/rate-limit-service";
import type { Booking } from "@/lib/types";

export async function POST(request: NextRequest) {
  const response = NextResponse.next();
  
  try {
    const body = await request.json();
    const {
      bookingId,
      customerEmail,
      salonId,
      language,
    }: {
      bookingId: string;
      customerEmail: string;
      salonId: string;
      language?: string;
    } = body;

    // Log incoming request for debugging
    logInfo("send-notifications API route called", {
      bookingId,
      customerEmail,
      salonId,
    });

    if (!bookingId || !customerEmail || !salonId) {
      logError("Missing required fields in send-notifications API route", new Error("Missing required fields"), {
        bookingId: !!bookingId,
        customerEmail: !!customerEmail,
        salonId: !!salonId,
      });
      return NextResponse.json(
        { error: "Missing required fields: bookingId, customerEmail, and salonId are required" },
        { status: 400 }
      );
    }

    // Authenticate user and verify salon access
    const authResult = await authenticateAndVerifySalon(request, salonId, response);
    
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

    // Fetch booking from database (server-side)
    const bookingResult = await getBookingByIdWithSalonVerification(bookingId, salonId);
    
    if (bookingResult.error || !bookingResult.data) {
      logWarn("Booking not found or access denied", {
        bookingId,
        salonId,
        error: bookingResult.error,
      });
      return NextResponse.json(
        { error: bookingResult.error || "Booking not found" },
        { status: 404 }
      );
    }

    const booking = bookingResult.data;

    // Verify booking status is confirmed or pending
    if (booking.status !== "confirmed" && booking.status !== "pending") {
      logWarn("Attempt to send notification for invalid booking status", {
        bookingId,
        status: booking.status,
      });
      return NextResponse.json(
        { error: `Cannot send notifications for booking with status: ${booking.status}` },
        { status: 400 }
      );
    }

    // Verify customer email matches booking's customer email
    if (booking.customer_email && booking.customer_email !== customerEmail) {
      logWarn("Customer email mismatch", {
        bookingId,
        providedEmail: customerEmail,
        bookingEmail: booking.customer_email,
      });
      return NextResponse.json(
        { error: "Customer email does not match booking" },
        { status: 400 }
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

    // Prepare booking data for email template (using fetched booking data)
    const bookingForEmail: Booking & {
      customer_full_name: string;
      service?: { name: string | null } | null;
      employee?: { name: string | null } | null;
      salon?: { name: string | null } | null;
    } = {
      id: booking.id,
      start_time: booking.start_time,
      end_time: booking.end_time,
      status: booking.status,
      is_walk_in: booking.is_walk_in,
      notes: booking.notes,
      customers: booking.customer_full_name ? { full_name: booking.customer_full_name } : null,
      employees: booking.employee?.name ? { full_name: booking.employee.name } : null,
      services: booking.service?.name ? { name: booking.service.name } : null,
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

      // Use SSR client for database operations
      const supabase = createClientForRouteHandler(request, response);
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

    const jsonResponse = NextResponse.json({
      email: emailResult,
      reminders: reminderResult,
      inApp: inAppResult,
    });
    
    // Copy cookies from response to jsonResponse
    response.cookies.getAll().forEach((cookie) => {
      jsonResponse.cookies.set(cookie.name, cookie.value, cookie);
    });
    
    return jsonResponse;
  } catch (error) {
    logError("Exception in send-notifications API route", error, {});
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

