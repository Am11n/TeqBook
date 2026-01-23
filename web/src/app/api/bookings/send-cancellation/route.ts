import { NextRequest, NextResponse } from "next/server";
import { sendBookingNotification } from "@/lib/services/unified-notification-service";
import { getSalonById } from "@/lib/repositories/salons";
import { getBookingByIdWithSalonVerification } from "@/lib/repositories/bookings";
import { logError, logWarn, logInfo } from "@/lib/services/logger";
import { createClientForRouteHandler } from "@/lib/supabase/server";
import { authenticateAndVerifySalon } from "@/lib/api-auth";
import { checkRateLimit, incrementRateLimit } from "@/lib/services/rate-limit-service";
import type { Booking } from "@/lib/types";

// Note: sendBookingNotification is still used for customer email

export async function POST(request: NextRequest) {
  const response = NextResponse.next();
  
  try {
    const body = await request.json();
    const {
      bookingId,
      customerEmail,
      salonId,
      language,
      cancelledBy, // 'customer' | 'salon'
      bookingData, // Optional: booking data sent directly to avoid timing issues
    }: {
      bookingId: string;
      customerEmail?: string;
      salonId: string;
      language?: string;
      cancelledBy?: "customer" | "salon";
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
    } = body;

    // Log incoming request for debugging
    logInfo("send-cancellation API route called", {
      bookingId,
      customerEmail,
      salonId,
      cancelledBy,
    });

    if (!bookingId || !salonId) {
      logError("Missing required fields in send-cancellation API route", new Error("Missing required fields"), {
        bookingId: !!bookingId,
        salonId: !!salonId,
      });
      return NextResponse.json(
        { error: "Missing required fields: bookingId and salonId are required" },
        { status: 400 }
      );
    }

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

      // Construct booking object from provided data
      booking = {
        id: bookingData.id,
        salon_id: bookingData.salon_id,
        start_time: bookingData.start_time,
        end_time: bookingData.end_time || bookingData.start_time, // Fallback to start_time if null
        status: bookingData.status as "pending" | "confirmed" | "completed" | "cancelled" | "no-show" | "scheduled",
        is_walk_in: bookingData.is_walk_in,
        notes: null,
        // Required Booking fields
        customers: bookingData.customer_full_name ? { full_name: bookingData.customer_full_name } : null,
        employees: bookingData.employee_name ? { full_name: bookingData.employee_name } : null,
        services: bookingData.service_name ? { name: bookingData.service_name } : null,
        // Extended fields for notifications
        customer_full_name: bookingData.customer_full_name,
        customer_email: customerEmail || null,
        service: bookingData.service_name ? { name: bookingData.service_name } : null,
        employee: bookingData.employee_name ? { name: bookingData.employee_name } : null,
        salon: null, // Will be fetched below
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

    // Prepare booking data for notification (using fetched booking data)
    const bookingForNotification: Booking & {
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
      salon: salon ? { name: salon.name, timezone: salon.timezone } : booking.salon,
    };

    const results = {
      customerEmail: null as { success: boolean; error?: string } | null,
      salonInApp: null as { success: boolean; sent?: number; total?: number; error?: string } | null,
    };

    // Try to get customer email if not provided (use booking data from database)
    let resolvedCustomerEmail = customerEmail || booking.customer_email || null;
    if (!resolvedCustomerEmail && booking.id) {
      // Use database function to get customer email (bypasses RLS)
      const supabase = createClientForRouteHandler(request, response);
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

      const supabase = createClientForRouteHandler(request, response);
      const { data: notifiedCount, error: notifyError } = await supabase.rpc(
        "notify_salon_staff_booking_cancelled",
        {
          p_salon_id: salonId,
          p_customer_name: customerName,
          p_service_name: serviceName,
          p_booking_time: bookingTime,
          p_booking_id: booking.id,
          p_timezone: salon?.timezone || "UTC",
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

    const jsonResponse = NextResponse.json(results);
    
    // Copy cookies from response to jsonResponse
    response.cookies.getAll().forEach((cookie) => {
      jsonResponse.cookies.set(cookie.name, cookie.value, cookie);
    });
    
    return jsonResponse;
  } catch (error) {
    logError("Exception in send-cancellation API route", error, {});
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
