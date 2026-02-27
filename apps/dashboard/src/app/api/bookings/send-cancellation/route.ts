import { NextRequest, NextResponse } from "next/server";
import { sendBookingNotification } from "@/lib/services/unified-notification-service";
import { getSalonById } from "@/lib/repositories/salons";
import { getBookingByIdWithSalonVerification } from "@/lib/repositories/bookings";
import { logError, logWarn, logInfo } from "@/lib/services/logger";
import { createClientForRouteHandler } from "@/lib/supabase/server";
import { authenticateAndVerifySalon } from "@/lib/api-auth";
import { checkRateLimit, incrementRateLimit } from "@/lib/services/rate-limit-service";
import { getRateLimitPolicy } from "@teqbook/shared/services/rate-limit";
import type { Booking } from "@/lib/types";
import { UUID_REGEX, type SendCancellationBody } from "../_shared/types";
import { prepareBookingForNotification, notifySalonStaffCancellation } from "../_shared/notify-staff";

export async function POST(request: NextRequest) {
  const response = NextResponse.next();
  const rateLimitPolicy = getRateLimitPolicy("booking-cancellation");
  
  try {
    const body = await request.json();
    const { bookingId, customerEmail: bodyCustomerEmail, salonId: bodySalonId, language: bodyLanguage, cancelledBy, cancellationReason, bookingData }: SendCancellationBody = body;

    logInfo("send-cancellation API route called (dashboard)", {
      bookingId,
      bodySalonId,
    });

    if (!bookingId) {
      logError("Missing bookingId in send-cancellation API route", new Error("Missing bookingId"), {
        bookingId: !!bookingId,
      });
      return NextResponse.json(
        { error: "Missing required field: bookingId is required" },
        { status: 400 }
      );
    }

    if (!UUID_REGEX.test(bookingId)) {
      logWarn("Invalid bookingId format", { bookingId });
      return NextResponse.json(
        { error: "Invalid bookingId format: must be a valid UUID" },
        { status: 400 }
      );
    }

    // Same as send-notifications: fetch booking first to get salonId and customer email
    const supabase = createClientForRouteHandler(request, response);
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
    const customerEmailFromRow = (() => {
      const c = Array.isArray((bookingRow as { customers?: unknown }).customers)
        ? (bookingRow as { customers?: { email?: string | null }[] }).customers?.[0]
        : (bookingRow as { customers?: { email?: string | null } | null }).customers;
      return (c as { email?: string | null } | null)?.email ?? null;
    })();
    const customerPhoneFromRow = (() => {
      const c = Array.isArray((bookingRow as { customers?: unknown }).customers)
        ? (bookingRow as { customers?: { phone?: string | null }[] }).customers?.[0]
        : (bookingRow as { customers?: { phone?: string | null } | null }).customers;
      return (c as { phone?: string | null } | null)?.phone ?? null;
    })();

    // Authenticate user and verify salon access
    const authResult = await authenticateAndVerifySalon(request, salonId, response);
    
    if (authResult.error || !authResult.user || !authResult.hasAccess) {
      const statusCode = !authResult.user ? 401 : 403;
      logWarn("Unauthorized access attempt to send-cancellation", {
        userId: authResult.user?.id,
        salonId,
        bookingId,
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

      // Construct booking object from provided data (same pattern as send-notifications)
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
        customer_email: bodyCustomerEmail || customerEmailFromRow || null,
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

      booking = bookingResult.data;
    }

    // Rate limiting: 10 requests per minute per user
    const userId = authResult.user.id;
    const rateLimitResult = await checkRateLimit(
      userId,
      "booking-cancellation",
      {
        identifierType: "user_id",
        endpointType: "booking-cancellation",
        failurePolicy: rateLimitPolicy.failurePolicy,
      }
    );

    if (!rateLimitResult.allowed) {
      logWarn("Rate limit exceeded for send-cancellation", {
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
      "booking-cancellation",
      {
        identifierType: "user_id",
        endpointType: "booking-cancellation",
        failurePolicy: rateLimitPolicy.failurePolicy,
      }
    );

    // Get salon info for language and name
    const salonResult = await getSalonById(salonId);
    const salon = salonResult.data;

    // Prepare booking data for notification (using fetched booking data)
    const bookingForNotification = prepareBookingForNotification(booking, salon);

    const results = {
      customerEmail: null as { success: boolean; error?: string } | null,
      salonInApp: null as { success: boolean; sent?: number; total?: number; error?: string } | null,
    };

    // Resolve customer email (same order as send-notifications: body, then from booking/row, then RPC fallback)
    let customerEmail = booking.customer_email || bodyCustomerEmail || customerEmailFromRow || null;
    if (!customerEmail && booking.id) {
      const { data: email } = await supabase.rpc("get_booking_customer_email", {
        p_booking_id: booking.id,
      });
      if (email) {
        customerEmail = email;
        logInfo("Resolved customer email via RPC", { bookingId: booking.id });
      }
    }

    const language = bodyLanguage || salon?.preferred_language || "en";

    // Send cancellation email to customer when we have email (same pattern as send-notifications)
    if (customerEmail) {
      logInfo("Sending cancellation email to customer", {
        bookingId: booking.id,
        recipientEmail: customerEmail,
        language,
      });

    const emailResult = await sendBookingNotification("booking_cancelled", {
      booking: bookingForNotification,
      salonId,
      recipientUserId: null,
      recipientEmail: customerEmail,
      recipientPhone: customerPhoneFromRow,
      language,
      cancellationReason: cancellationReason ?? undefined,
    }).catch((emailError) => {
      logWarn("Failed to send cancellation email to customer", {
        bookingId: booking.id,
        emailError: emailError instanceof Error ? emailError.message : "Unknown error",
      });
      return { success: false, error: emailError instanceof Error ? emailError.message : "Unknown error" };
    });

    results.customerEmail = {
      success: emailResult.success,
      error: 'channels' in emailResult ? emailResult.channels?.email?.error : emailResult.error,
    };
    } else {
      logInfo("No customer email for cancellation notification", { bookingId: booking.id });
    }

    results.salonInApp = await notifySalonStaffCancellation(request, response, bookingForNotification, salonId, salon?.timezone || "UTC");

    const jsonResponse = NextResponse.json(results);
    
    // Copy cookies from response to jsonResponse
    response.cookies.getAll().forEach((cookie) => {
      jsonResponse.cookies.set(cookie.name, cookie.value, cookie);
    });
    
    return jsonResponse;
  } catch (error) {
    logError("Exception in send-cancellation API route (dashboard)", error, {});
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

