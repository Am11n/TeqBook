import { NextRequest, NextResponse } from "next/server";
import { sendBookingNotification } from "@/lib/services/unified-notification-service";
import { scheduleReminders } from "@/lib/services/reminder-service";
import { getSalonById } from "@/lib/repositories/salons";
import { getBookingByIdWithSalonVerification } from "@/lib/repositories/bookings";
import { logError, logWarn, logInfo } from "@/lib/services/logger";
import { createClientForRouteHandler } from "@/lib/supabase/server";
import { authenticateAndVerifySalon } from "@/lib/api-auth";
import { checkRateLimit, incrementRateLimit } from "@/lib/services/rate-limit-service";
import { getRateLimitPolicy } from "@teqbook/shared/services/rate-limit";
import type { Booking } from "@/lib/types";
import { UUID_REGEX, type SendNotificationsBody } from "../_shared/types";
import { prepareBookingForNotification, notifySalonStaff } from "../_shared/notify-staff";

export async function POST(request: NextRequest) {
  const response = NextResponse.next();
  const rateLimitPolicy = getRateLimitPolicy("booking-notifications");
  
  try {
    const body = await request.json();
    const { bookingId, customerEmail: bodyCustomerEmail, salonId: bodySalonId, language: bodyLanguage, bookingData }: SendNotificationsBody = body;

    // Log incoming request for debugging
    logInfo("send-notifications API route called (dashboard)", {
      bookingId,
      bodySalonId,
    });

    // Validate bookingId is provided
    if (!bookingId) {
      logError("Missing bookingId in send-notifications API route", new Error("Missing bookingId"), {
        bookingId: !!bookingId,
      });
      return NextResponse.json(
        { error: "Missing required field: bookingId is required" },
        { status: 400 }
      );
    }

    // Validate bookingId is UUID format
    if (!UUID_REGEX.test(bookingId)) {
      logWarn("Invalid bookingId format", {
        bookingId,
      });
      return NextResponse.json(
        { error: "Invalid bookingId format: must be a valid UUID" },
        { status: 400 }
      );
    }

    // Fetch booking from database (server-side)
    // We need to get salonId from booking first, then verify access
    const supabase = createClientForRouteHandler(request, response);
    
    // First, get booking to find salonId
    const { data: bookingRow, error: bookingFetchError } = await supabase
      .from("bookings")
      .select("id, salon_id, status, customers(email, phone)")
      .eq("id", bookingId)
      .maybeSingle();

    if (bookingFetchError || !bookingRow) {
      logWarn("Booking not found", {
        bookingId,
        error: bookingFetchError?.message,
      });
      return NextResponse.json(
        { error: bookingFetchError?.message || "Booking not found" },
        { status: 404 }
      );
    }

    const salonId = bodySalonId || bookingRow.salon_id;

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

    // Use booking data from request if provided, otherwise fetch from database
    let booking: Booking & {
      salon_id: string;
      customer_full_name: string;
      customer_email?: string | null;
      service?: { name: string | null } | null;
      employee?: { name: string | null } | null;
      salon?: { name: string | null; timezone?: string | null } | null;
    };

    if (bookingData) {
      // Use booking data sent directly (avoids timing issues with database replication)
      // Verify salon_id matches
      if (bookingData.salon_id !== salonId) {
        logWarn("Booking salon_id mismatch", {
          bookingId,
          providedSalonId: salonId,
          bookingSalonId: bookingData.salon_id,
        });
        return NextResponse.json(
          { error: "Booking does not belong to this salon" },
          { status: 403 }
        );
      }

      booking = {
        id: bookingData.id,
        salon_id: bookingData.salon_id,
        start_time: bookingData.start_time,
        end_time: bookingData.end_time || bookingData.start_time,
        status: bookingData.status as "pending" | "confirmed" | "completed" | "cancelled" | "no-show" | "scheduled",
        is_walk_in: bookingData.is_walk_in,
        notes: null,
        customers: bookingData.customer_full_name ? { full_name: bookingData.customer_full_name } : null,
        employees: bookingData.employee_name ? { full_name: bookingData.employee_name } : null,
        services: bookingData.service_name ? { name: bookingData.service_name } : null,
        customer_full_name: bookingData.customer_full_name,
        customer_email: bodyCustomerEmail || null,
        service: bookingData.service_name ? { name: bookingData.service_name } : null,
        employee: bookingData.employee_name ? { name: bookingData.employee_name } : null,
        salon: null,
      } as Booking & {
        salon_id: string;
        customer_full_name: string;
        customer_email?: string | null;
        service?: { name: string | null } | null;
        employee?: { name: string | null } | null;
        salon?: { name: string | null; timezone?: string | null } | null;
      };
    } else {
      // Fetch full booking data from database (server-side)
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

      booking = bookingResult.data;
    }

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

    // Resolve customer email (prefer booking, then body)
    const customerPhoneFromRow = (() => {
      const c = Array.isArray((bookingRow as { customers?: unknown }).customers)
        ? (bookingRow as { customers?: { phone?: string | null }[] }).customers?.[0]
        : (bookingRow as { customers?: { phone?: string | null } | null }).customers;
      return (c as { phone?: string | null } | null)?.phone ?? null;
    })();

    let customerEmail = booking.customer_email || bodyCustomerEmail || null;

    if (!customerEmail) {
      logWarn("Booking missing customer email", {
        bookingId,
      });
      return NextResponse.json(
        { error: "Booking does not have a customer email address" },
        { status: 400 }
      );
    }

    // Rate limiting: 10 requests per minute per user
    const userId = authResult.user.id;
    const rateLimitResult = await checkRateLimit(
      userId,
      "booking-notifications",
      {
        identifierType: "user_id",
        endpointType: "booking-notifications",
        failurePolicy: rateLimitPolicy.failurePolicy,
      }
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
            "X-RateLimit-Limit": rateLimitPolicy.maxAttempts.toString(),
            "X-RateLimit-Remaining": rateLimitResult.remainingAttempts.toString(),
            "X-RateLimit-Reset": rateLimitResult.resetTime
              ? Math.ceil(rateLimitResult.resetTime / 1000).toString()
              : Math.ceil((Date.now() + rateLimitPolicy.windowMs) / 1000).toString(),
            "Retry-After": rateLimitResult.resetTime
              ? Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000).toString()
              : Math.ceil(rateLimitPolicy.windowMs / 1000).toString(),
          },
        }
      );
    }

    // Increment rate limit counter
    await incrementRateLimit(
      userId,
      "booking-notifications",
      {
        identifierType: "user_id",
        endpointType: "booking-notifications",
        failurePolicy: rateLimitPolicy.failurePolicy,
      }
    );

    // Get salon info for language and timezone
    const salonResult = await getSalonById(salonId);
    const salon = salonResult.data;

    const language = bodyLanguage || salon?.preferred_language || "en";

    const bookingForNotification = prepareBookingForNotification(booking, salon);

    const results = {
      email: null as { success: boolean; error?: string } | null,
      reminders: null as { error: string | null } | null,
      inApp: null as { success: boolean; sent?: number; error?: string } | null,
    };

    // Send confirmation email (and in-app for customer if configured) via unified notification service
    const emailResult = await sendBookingNotification("booking_confirmed", {
      booking: bookingForNotification,
      salonId,
      recipientUserId: null,
      recipientEmail: customerEmail,
      recipientPhone: customerPhoneFromRow,
      language,
    }).catch((err) => {
      logWarn("Failed to send booking confirmation via unified notification service", {
        bookingId: booking.id,
        error: err instanceof Error ? err.message : "Unknown error",
      });
      return { success: false, error: err instanceof Error ? err.message : "Unknown error" };
    });

    results.email = {
      success: emailResult.success,
      error: 'channels' in emailResult ? emailResult.channels?.email?.error : emailResult.error,
    };

    // Schedule reminders (24h and 2h before appointment)
    const reminderResult = await scheduleReminders({
      bookingId: booking.id,
      bookingStartTime: booking.start_time,
      salonId,
      timezone: salon?.timezone || "UTC",
    }).catch((reminderError: unknown) => {
      logWarn("Failed to schedule reminders", {
        bookingId: booking.id,
        reminderError: reminderError instanceof Error ? reminderError.message : "Unknown error",
      });
      return { error: reminderError instanceof Error ? reminderError.message : "Unknown error" };
    });

    results.reminders = reminderResult;

    results.inApp = await notifySalonStaff(request, response, bookingForNotification, salonId, salon?.timezone || "UTC");

    const jsonResponse = NextResponse.json(results);
    
    // Copy cookies from response to jsonResponse
    response.cookies.getAll().forEach((cookie) => {
      jsonResponse.cookies.set(cookie.name, cookie.value, cookie);
    });
    
    return jsonResponse;
  } catch (error) {
    logError("Exception in send-notifications API route (dashboard)", error, {});
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

