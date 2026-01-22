import { NextRequest, NextResponse } from "next/server";
import { sendBookingNotification } from "@/lib/services/unified-notification-service";
import { getSalonById } from "@/lib/repositories/salons";
import { logError, logWarn, logInfo } from "@/lib/services/logger";
import { supabase } from "@/lib/supabase-client";
import { authenticateAndVerifySalon } from "@/lib/api-auth";
import { checkRateLimit, incrementRateLimit } from "@/lib/services/rate-limit-service";
import type { Booking } from "@/lib/types";

// Note: sendBookingNotification is still used for customer email

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      booking,
      customerEmail,
      salonId,
      language,
      cancelledBy, // 'customer' | 'salon'
    }: {
      booking: Booking & {
        customer_full_name: string;
        service?: { name: string | null } | null;
        employee?: { name: string | null } | null;
        salon?: { name: string | null } | null;
      };
      customerEmail?: string;
      salonId: string;
      language?: string;
      cancelledBy?: "customer" | "salon";
    } = body;

    // Log incoming request for debugging
    logInfo("send-cancellation API route called", {
      bookingId: booking?.id,
      customerEmail,
      salonId,
      cancelledBy,
      hasBooking: !!booking,
    });

    if (!booking || !salonId) {
      logError("Missing required fields in send-cancellation API route", new Error("Missing required fields"), {
        booking: !!booking,
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
      logWarn("Unauthorized access attempt to send-cancellation", {
        userId: authResult.user?.id,
        salonId,
        bookingId: booking?.id,
        error: authResult.error,
      });
      return NextResponse.json(
        { error: authResult.error || "Unauthorized" },
        { status: statusCode }
      );
    }

    // Verify booking belongs to user's salon (if salon_id is present on booking)
    if ("salon_id" in booking && booking.salon_id && booking.salon_id !== salonId) {
      logWarn("Booking salon mismatch in send-cancellation", {
        userId: authResult.user.id,
        requestedSalonId: salonId,
        bookingSalonId: booking.salon_id,
      });
      return NextResponse.json(
        { error: "Booking does not belong to this salon" },
        { status: 403 }
      );
    }

    // Rate limiting: 10 requests per minute per user
    const userId = authResult.user.id;
    const rateLimitResult = await checkRateLimit(
      userId,
      "booking-cancellation",
      { identifierType: "user_id", endpointType: "booking-cancellation" }
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
      "booking-cancellation",
      { identifierType: "user_id", endpointType: "booking-cancellation" }
    );

    // Get salon info for language and name
    const salonResult = await getSalonById(salonId);
    const salon = salonResult.data;

    // Prepare booking data for notification
    const bookingForNotification: Booking & {
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

    const results = {
      customerEmail: null as { success: boolean; error?: string } | null,
      salonInApp: null as { success: boolean; sent?: number; total?: number; error?: string } | null,
    };

    // Try to get customer email if not provided
    let resolvedCustomerEmail = customerEmail;
    if (!resolvedCustomerEmail && booking.id) {
      // Use database function to get customer email (bypasses RLS)
      const { data: email, error: fetchError } = await supabase.rpc(
        "get_booking_customer_email",
        { p_booking_id: booking.id }
      );

      console.log("[send-cancellation] Customer email lookup result:", {
        bookingId: booking.id,
        email,
        fetchError: fetchError?.message,
      });

      if (email) {
        resolvedCustomerEmail = email;
        logInfo("Resolved customer email from booking", {
          bookingId: booking.id,
          customerEmail: resolvedCustomerEmail,
        });
      }
    }

    // Send cancellation email to customer if email available
    if (resolvedCustomerEmail) {
      logInfo("Sending cancellation email to customer", {
        bookingId: booking.id,
        recipientEmail: resolvedCustomerEmail,
        language: language || salon?.preferred_language || "en",
      });

      const emailResult = await sendBookingNotification("booking_cancelled", {
        booking: bookingForNotification,
        salonId,
        recipientUserId: null,
        recipientEmail: resolvedCustomerEmail,
        language: language || salon?.preferred_language || "en",
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
      logInfo("No customer email available for cancellation notification", {
        bookingId: booking.id,
      });
    }

    // Send in-app notification to salon staff about cancellation
    // Using database function to bypass RLS issues
    try {
      const customerName = booking.customer_full_name || "Customer";
      const serviceName = booking.service?.name || booking.services?.name || "Service";
      const bookingTime = booking.start_time;

      logInfo("Calling notify_salon_staff_booking_cancelled", {
        bookingId: booking.id,
        salonId,
        customerName,
        serviceName,
        bookingTime,
        cancelledBy,
      });

      const { data: notifiedCount, error: notifyError } = await supabase.rpc(
        "notify_salon_staff_booking_cancelled",
        {
          p_salon_id: salonId,
          p_customer_name: customerName,
          p_service_name: serviceName,
          p_booking_time: bookingTime,
          p_booking_id: booking.id,
        }
      );

      if (notifyError) {
        logWarn("Failed to notify salon staff about cancellation via RPC", {
          bookingId: booking.id,
          error: notifyError.message,
        });
        results.salonInApp = {
          success: false,
          error: notifyError.message,
        };
      } else {
        logInfo("Salon staff notified about cancellation", {
          bookingId: booking.id,
          notifiedCount,
        });
        results.salonInApp = {
          success: true,
          sent: notifiedCount,
        };
      }
    } catch (inAppError) {
      logWarn("Failed to send cancellation in-app notifications", {
        bookingId: booking.id,
        inAppError: inAppError instanceof Error ? inAppError.message : "Unknown error",
      });
      results.salonInApp = {
        success: false,
        error: inAppError instanceof Error ? inAppError.message : "Unknown error",
      };
    }

    return NextResponse.json(results);
  } catch (error) {
    logError("Exception in send-cancellation API route", error, {});
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
