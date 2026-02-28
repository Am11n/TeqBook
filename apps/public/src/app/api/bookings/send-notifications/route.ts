import { NextRequest, NextResponse } from "next/server";
import { sendBookingConfirmation } from "@/lib/services/email-service";
import { scheduleReminders } from "@/lib/services/reminder-service";
import { getSalonById } from "@/lib/repositories/salons";
import { logError, logWarn, logInfo } from "@/lib/services/logger";
import { createClientForRouteHandler } from "@/lib/supabase/server";
import { checkRateLimit, incrementRateLimit } from "@/lib/services/rate-limit-service";
import { getRateLimitPolicy } from "@teqbook/shared/services/rate-limit";

type BookingNotificationPayload = {
  bookingId: string;
  salonId: string;
  customerEmail: string;
  customerPhone?: string;
  language?: string;
  bookingData?: {
    id: string;
    salon_id: string;
    start_time: string;
    end_time: string;
    status: string;
    is_walk_in: boolean;
    customer_full_name: string;
    customer_phone?: string;
    service_name?: string;
    employee_name?: string;
  };
};

const E164_REGEX = /^\+[1-9]\d{1,14}$/;

function normalizeToE164(input?: string | null): string | null {
  if (!input) return null;
  const trimmed = input.trim();
  if (!trimmed) return null;

  const normalized = trimmed.replace(/[^\d+]/g, "").replace(/(?!^)\+/g, "");
  return E164_REGEX.test(normalized) ? normalized : null;
}

async function sendTwilioSms(input: {
  to: string;
  body: string;
}): Promise<{ sent: boolean; id?: string; error?: string }> {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const fromNumber = process.env.TWILIO_FROM_NUMBER;

  if (!accountSid || !authToken || !fromNumber) {
    return { sent: false, error: "Twilio environment variables are missing" };
  }

  const endpoint = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;
  const auth = Buffer.from(`${accountSid}:${authToken}`).toString("base64");

  const body = new URLSearchParams();
  body.set("To", input.to);
  body.set("From", fromNumber);
  body.set("Body", input.body);

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: body.toString(),
  });

  const payload = (await response.json()) as { sid?: string; message?: string };
  if (!response.ok) {
    return {
      sent: false,
      error: payload.message || `Twilio request failed (${response.status})`,
    };
  }

  return { sent: true, id: payload.sid };
}

export async function POST(request: NextRequest) {
  const response = NextResponse.next();
  const rateLimitPolicy = getRateLimitPolicy("public-booking-notifications");

  try {
    const body = (await request.json()) as BookingNotificationPayload;
    const { bookingId, salonId, customerEmail, customerPhone, language, bookingData } = body;

    const logContext = {
      bookingId,
      salonId,
      customerEmail,
      hasCustomerPhone: !!customerPhone || !!bookingData?.customer_phone,
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

    const ipIdentifier = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    const rateLimitIdentifier = customerEmail || ipIdentifier;
    const rateLimitIdentifierType = customerEmail ? "email" : "ip";

    const rateLimitResult = await checkRateLimit(
      rateLimitIdentifier,
      "public-booking-notifications",
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
      "public-booking-notifications",
      {
        identifierType: rateLimitIdentifierType,
        failurePolicy: rateLimitPolicy.failurePolicy,
      }
    );

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
      salon: salon ? { name: salon.name, time_format: salon.time_format ?? null } : null,
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

    // Send customer SMS confirmation if phone exists and is valid E.164.
    const rawPhone = bookingData?.customer_phone || customerPhone || null;
    const normalizedPhone = normalizeToE164(rawPhone);
    const smsResult = normalizedPhone
      ? await (async () => {
          const serviceName = bookingData?.service_name || "your appointment";
          const salonName = salon?.name || "the salon";
          const dateTime = bookingData?.start_time
            ? new Date(bookingData.start_time)
            : null;

          const formattedDate = dateTime
            ? new Intl.DateTimeFormat("nb-NO", {
                day: "numeric",
                month: "long",
                year: "numeric",
              }).format(dateTime)
            : "not set";

          const formattedTime = dateTime
            ? new Intl.DateTimeFormat("nb-NO", {
                hour: "2-digit",
                minute: "2-digit",
                hour12: false,
              }).format(dateTime)
            : "not set";

          const message = `Confirmed: ${serviceName} at ${salonName} on ${formattedDate} at ${formattedTime}.`;

          try {
            const sent = await sendTwilioSms({
              to: normalizedPhone,
              body: message,
            });

            if (!sent.sent) {
              logWarn("Failed to send public booking confirmation SMS", {
                ...logContext,
                phone: normalizedPhone,
                error: sent.error,
              });
            }

            return sent;
          } catch (smsError) {
            const errorMessage = smsError instanceof Error ? smsError.message : "Unknown error";
            logWarn("Exception while sending public booking confirmation SMS", {
              ...logContext,
              phone: normalizedPhone,
              error: errorMessage,
            });
            return { sent: false, error: errorMessage };
          }
        })()
      : {
          sent: false,
          error: rawPhone ? "Customer phone must be valid E.164 format" : "No customer phone provided",
        };

    const jsonResponse = NextResponse.json({
      email: emailResult,
      sms: smsResult,
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

