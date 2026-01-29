import { NextRequest, NextResponse } from "next/server";
import { sendBookingConfirmation } from "@/lib/services/email-service";
import { scheduleReminders } from "@/lib/services/reminder-service";
import { getSalonById } from "@/lib/repositories/salons";
import { logError, logWarn, logInfo } from "@/lib/services/logger";
import { createClientForRouteHandler } from "@/lib/supabase/server";

type BookingNotificationPayload = {
  bookingId: string;
  salonId: string;
  customerEmail: string;
  language?: string;
  bookingData?: {
    id: string;
    salon_id: string;
    start_time: string;
    end_time: string;
    status: string;
    is_walk_in: boolean;
    customer_full_name: string;
    service_name?: string;
    employee_name?: string;
  };
};

export async function POST(request: NextRequest) {
  const response = NextResponse.next();

  try {
    const body = (await request.json()) as BookingNotificationPayload;
    const { bookingId, salonId, customerEmail, language, bookingData } = body;

    const logContext = {
      bookingId,
      salonId,
      customerEmail,
      hasBookingData: !!bookingData,
    };

    logInfo("Public send-notifications API route called", logContext);

    if (!bookingId || !salonId || !customerEmail) {
      logWarn("Missing required fields in public send-notifications API route", logContext);
      return NextResponse.json(
        { error: "Missing required fields: bookingId, salonId and customerEmail are required" },
        { status: 400 },
      );
    }

    // Fetch salon to get language/timezone and name
    const salonResult = await getSalonById(salonId);
    const salon = salonResult.data;

    if (salonResult.error || !salon) {
      logWarn("Salon not found when sending public booking notifications", {
        ...logContext,
        error: salonResult.error,
      });
    }

    const timezone = salon?.timezone || "UTC";
    const effectiveLanguage = language || salon?.preferred_language || "nb";

    // Build booking object for email from provided bookingData
    if (!bookingData || bookingData.id !== bookingId || bookingData.salon_id !== salonId) {
      logWarn("Invalid or missing bookingData in public send-notifications API route", {
        ...logContext,
        bookingDataId: bookingData?.id,
        bookingDataSalonId: bookingData?.salon_id,
      });
    }

    const bookingForEmail = {
      id: bookingId,
      start_time: bookingData?.start_time,
      end_time: bookingData?.end_time ?? bookingData?.start_time,
      status: bookingData?.status ?? "confirmed",
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
    } as any;

    // Send confirmation email (do not fail the request if email fails)
    logInfo("Attempting to send public booking confirmation email", {
      ...logContext,
      timezone,
      language: effectiveLanguage,
      hasResendApiKey: !!process.env.RESEND_API_KEY,
    });

    const emailResult = await sendBookingConfirmation({
      booking: bookingForEmail,
      recipientEmail: customerEmail,
      language: effectiveLanguage,
      salonId,
      timezone,
    }).catch((emailError) => {
      logWarn("Failed to send public booking confirmation email", {
        ...logContext,
        emailError: emailError instanceof Error ? emailError.message : "Unknown error",
      });
      return {
        data: null,
        error: emailError instanceof Error ? emailError.message : "Unknown error",
      };
    });

    // Schedule reminders (24h and 2h before appointment)
    const reminderResult = bookingData
      ? await scheduleReminders({
          bookingId,
          bookingStartTime: bookingData.start_time,
          salonId,
          timezone,
        }).catch((reminderError: unknown) => {
          logWarn("Failed to schedule reminders for public booking", {
            ...logContext,
            reminderError: reminderError instanceof Error
              ? reminderError.message
              : "Unknown error",
          });
          return {
            error:
              reminderError instanceof Error ? reminderError.message : "Unknown error",
          };
        })
      : { error: "Missing bookingData, could not schedule reminders" };

    // Notify salon staff via RPC so they get in-app (bell) notifications
    let inAppResult: { success: boolean; sent?: unknown; error?: string } = {
      success: false,
    };

    try {
      const customerName = bookingData?.customer_full_name || "Customer";
      const serviceName = bookingData?.service_name || "Service";
      const bookingTime = bookingData?.start_time;

      if (bookingTime) {
        logInfo("Calling notify_salon_staff_new_booking from public API route", {
          ...logContext,
          customerName,
          serviceName,
          bookingTime,
        });

        const supabase = createClientForRouteHandler(request, response);
        const { data: notifiedCount, error: notifyError } = await supabase.rpc(
          "notify_salon_staff_new_booking",
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
          logWarn("Failed to notify salon staff via RPC (public route)", {
            ...logContext,
            error: notifyError.message,
          });
          inAppResult = {
            success: false,
            error: notifyError.message,
          };
        } else {
          logInfo("Salon staff notified successfully via RPC (public route)", {
            ...logContext,
            notifiedCount,
          });
          inAppResult = {
            success: true,
            sent: notifiedCount,
          };
        }
      } else {
        logWarn("Missing bookingTime in bookingData, skipping in-app notification", logContext);
        inAppResult = {
          success: false,
          error: "Missing booking start time",
        };
      }
    } catch (inAppError) {
      logWarn("Failed to send in-app notifications to salon staff from public route", {
        ...logContext,
        inAppError: inAppError instanceof Error ? inAppError.message : "Unknown error",
      });
      inAppResult = {
        success: false,
        error: inAppError instanceof Error ? inAppError.message : "Unknown error",
      };
    }

    const jsonResponse = NextResponse.json({
      email: emailResult,
      reminders: reminderResult,
      inApp: inAppResult,
    });

    // Copy cookies from response to jsonResponse (to keep session behaviour consistent)
    response.cookies.getAll().forEach((cookie) => {
      jsonResponse.cookies.set(cookie.name, cookie.value, cookie);
    });

    return jsonResponse;
  } catch (error) {
    logError("Exception in public send-notifications API route", error, {});
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    );
  }
}

