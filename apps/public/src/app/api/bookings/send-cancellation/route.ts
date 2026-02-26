import { NextRequest, NextResponse } from "next/server";
import { sendBookingCancellation } from "@/lib/services/email-service";
import { getSalonById } from "@/lib/repositories/salons";
import { logError, logWarn, logInfo } from "@/lib/services/logger";
import { createClientForRouteHandler } from "@/lib/supabase/server";
import { checkRateLimit, incrementRateLimit } from "@/lib/services/rate-limit-service";
import { getRateLimitPolicy } from "@teqbook/shared/services/rate-limit";

/**
 * Public send-cancellation: same pattern as send-notifications.
 * When user is on teqbook.com/dashboard/, fetch("/api/bookings/send-cancellation") hits Public (teqbook.com), so this route must exist here.
 */

type BookingCancellationPayload = {
  bookingId: string;
  salonId: string;
  customerEmail: string;
  language?: string;
  cancellationReason?: string | null;
  bookingData?: {
    id: string;
    salon_id: string;
    start_time: string;
    end_time: string | null;
    status: string;
    is_walk_in: boolean;
    customer_full_name: string;
    service_name?: string;
    employee_name?: string;
  };
};

export async function POST(request: NextRequest) {
  const response = NextResponse.next();
  const rateLimitPolicy = getRateLimitPolicy("public-booking-cancellation");

  try {
    const body = (await request.json()) as BookingCancellationPayload;
    const { bookingId, salonId, customerEmail, language, cancellationReason, bookingData } = body;

    const logContext = {
      bookingId,
      salonId,
      customerEmail,
      hasBookingData: !!bookingData,
    };

    logInfo("Public send-cancellation API route called", logContext);

    if (!bookingId || !salonId) {
      logWarn("Missing required fields in public send-cancellation API route", logContext);
      return NextResponse.json(
        { error: "Missing required fields: bookingId and salonId are required" },
        { status: 400 },
      );
    }

    const ipIdentifier = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    const rateLimitIdentifier = customerEmail || ipIdentifier;
    const rateLimitIdentifierType = customerEmail ? "email" : "ip";

    const rateLimitResult = await checkRateLimit(
      rateLimitIdentifier,
      "public-booking-cancellation",
      {
        identifierType: rateLimitIdentifierType,
        failurePolicy: rateLimitPolicy.failurePolicy,
      }
    );

    if (!rateLimitResult.allowed) {
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

    await incrementRateLimit(
      rateLimitIdentifier,
      "public-booking-cancellation",
      {
        identifierType: rateLimitIdentifierType,
        failurePolicy: rateLimitPolicy.failurePolicy,
      }
    );

    const salonResult = await getSalonById(salonId);
    const salon = salonResult.data;

    if (salonResult.error || !salon) {
      logWarn("Salon not found when sending public cancellation notifications", {
        ...logContext,
        error: salonResult.error,
      });
    }

    const timezone = salon?.timezone || "UTC";
    const effectiveLanguage = language || salon?.preferred_language || "en";

    const bookingForEmail = {
      id: bookingId,
      start_time: bookingData?.start_time,
      end_time: bookingData?.end_time ?? bookingData?.start_time,
      status: bookingData?.status ?? "cancelled",
      is_walk_in: bookingData?.is_walk_in ?? false,
      notes: null,
      customers: bookingData?.customer_full_name
        ? { full_name: bookingData.customer_full_name }
        : null,
      employees: bookingData?.employee_name ? { full_name: bookingData.employee_name } : null,
      services: bookingData?.service_name ? { name: bookingData.service_name } : null,
      customer_full_name: bookingData?.customer_full_name ?? "Customer",
      service: bookingData?.service_name ? { name: bookingData.service_name } : null,
      employee: bookingData?.employee_name ? { name: bookingData.employee_name } : null,
      salon: salon ? { name: salon.name } : null,
    } as Parameters<typeof sendBookingCancellation>[0]["booking"];

    let emailResult: { data: { id: string } | null; error: string | null } = {
      data: null,
      error: null,
    };

    if (customerEmail) {
      logInfo("Attempting to send public booking cancellation email", {
        ...logContext,
        timezone,
        language: effectiveLanguage,
      });

      emailResult = await sendBookingCancellation({
        booking: bookingForEmail,
        recipientEmail: customerEmail,
        language: effectiveLanguage,
        salonId,
        timezone,
        cancellationReason: cancellationReason ?? undefined,
      }).catch((emailError) => {
        logWarn("Failed to send public booking cancellation email", {
          ...logContext,
          emailError: emailError instanceof Error ? emailError.message : "Unknown error",
        });
        return {
          data: null,
          error: emailError instanceof Error ? emailError.message : "Unknown error",
        };
      });
    } else {
      logInfo("No customer email for cancellation, skipping email", logContext);
    }

    let inAppResult: { success: boolean; sent?: unknown; error?: string } = { success: false };

    try {
      const customerName = bookingData?.customer_full_name || "Customer";
      const serviceName = bookingData?.service_name || "Service";
      const bookingTime = bookingData?.start_time;

      if (bookingTime) {
        logInfo("Calling notify_salon_staff_booking_cancelled from public API route", {
          ...logContext,
          customerName,
          serviceName,
          bookingTime,
        });

        const supabase = createClientForRouteHandler(request, response);
        const { data: notifiedCount, error: notifyError } = await supabase.rpc(
          "notify_salon_staff_booking_cancelled",
          {
            p_salon_id: salonId,
            p_customer_name: customerName,
            p_service_name: serviceName,
            p_booking_time: bookingTime,
            p_booking_id: bookingId,
            p_timezone: timezone,
          },
        );

        if (notifyError) {
          logWarn("Failed to notify salon staff via RPC (public cancellation route)", {
            ...logContext,
            error: notifyError.message,
          });
          inAppResult = { success: false, error: notifyError.message };
        } else {
          logInfo("Salon staff notified of cancellation via RPC (public route)", {
            ...logContext,
            notifiedCount,
          });
          inAppResult = { success: true, sent: notifiedCount };
        }
      } else {
        logWarn("Missing bookingTime in bookingData, skipping in-app cancellation notification", logContext);
        inAppResult = { success: false, error: "Missing booking start time" };
      }
    } catch (inAppError) {
      logWarn("Failed to send in-app cancellation notifications from public route", {
        ...logContext,
        inAppError: inAppError instanceof Error ? inAppError.message : "Unknown error",
      });
      inAppResult = {
        success: false,
        error: inAppError instanceof Error ? inAppError.message : "Unknown error",
      };
    }

    const jsonResponse = NextResponse.json({
      customerEmail: {
        success: !emailResult.error,
        error: emailResult.error ?? undefined,
      },
      salonInApp: inAppResult,
    });

    response.cookies.getAll().forEach((cookie) => {
      jsonResponse.cookies.set(cookie.name, cookie.value, cookie);
    });

    return jsonResponse;
  } catch (error) {
    logError("Exception in public send-cancellation API route", error, {});
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    );
  }
}
