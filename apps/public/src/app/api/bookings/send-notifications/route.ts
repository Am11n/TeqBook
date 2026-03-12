import { NextRequest, NextResponse } from "next/server";
import { sendBookingConfirmation } from "@/lib/services/email-service";
import { scheduleReminders } from "@/lib/services/reminder-service";
import { getSalonById } from "@/lib/repositories/salons";
import { logError, logWarn, logInfo } from "@/lib/services/logger";
import { createClientForRouteHandler } from "@/lib/supabase/server";
import { getAdminClient } from "@/lib/supabase/admin";
import { checkRateLimit, incrementRateLimit } from "@/lib/services/rate-limit-service";
import { getRateLimitPolicy } from "@teqbook/shared/services/rate-limit";
import { REQUEST_ID_HEADER, getRequestIdFromHeaders } from "@teqbook/shared";

type BookingNotificationPayload = {
  bookingId: string;
  salonId: string;
  customerEmail?: string;
  language?: string;
};

const E164_REGEX = /^\+[1-9]\d{1,14}$/;
const MAX_NOTIFICATION_ATTEMPTS = 5;

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
  const requestId = getRequestIdFromHeaders(request.headers);

  try {
    const body = (await request.json()) as BookingNotificationPayload;
    const { bookingId, salonId, customerEmail, language } = body;

    const logContext = {
      requestId,
      bookingId,
      salonId,
      customerEmail,
    };

    logInfo("Public send-notifications API route called", logContext);

    if (!bookingId || !salonId) {
      logWarn("Missing required fields in public send-notifications API route", logContext);
      return NextResponse.json(
        { error: "Missing required fields: bookingId and salonId are required" },
        { status: 400 },
      );
    }

    const ipIdentifier = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    const rateLimitIdentifier = `${ipIdentifier}:${bookingId}`;
    const rateLimitIdentifierType = "ip";

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

    const admin = getAdminClient();
    const { data: bookingRow, error: bookingError } = await admin
      .from("bookings")
      .select(
        "id, salon_id, start_time, end_time, status, is_walk_in, customers(full_name, email, phone), employees(full_name), services(name)",
      )
      .eq("id", bookingId)
      .eq("salon_id", salonId)
      .maybeSingle();

    if (bookingError || !bookingRow) {
      logWarn("Booking not found in authoritative lookup", {
        ...logContext,
        error: bookingError?.message,
      });
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    if (!["confirmed", "pending", "scheduled"].includes(bookingRow.status)) {
      return NextResponse.json(
        { error: `Cannot send notifications for booking status: ${bookingRow.status}` },
        { status: 400 },
      );
    }

    const bookingCustomer = Array.isArray(bookingRow.customers)
      ? bookingRow.customers[0]
      : bookingRow.customers;
    const bookingEmployee = Array.isArray(bookingRow.employees)
      ? bookingRow.employees[0]
      : bookingRow.employees;
    const bookingService = Array.isArray(bookingRow.services)
      ? bookingRow.services[0]
      : bookingRow.services;

    const authoritativeEmail = bookingCustomer?.email?.trim() || null;
    const authoritativePhone = bookingCustomer?.phone?.trim() || null;

    if (!authoritativeEmail) {
      return NextResponse.json(
        { error: "Booking does not have a customer email address" },
        { status: 400 },
      );
    }

    if (customerEmail && customerEmail.trim().toLowerCase() !== authoritativeEmail.toLowerCase()) {
      return NextResponse.json(
        { error: "Provided customerEmail does not match booking owner" },
        { status: 403 },
      );
    }

    const { data: existingEvent } = await admin
      .from("notification_events")
      .select("id, status, attempts")
      .eq("booking_id", bookingId)
      .eq("event_type", "confirmation")
      .maybeSingle();

    if (existingEvent?.status === "sent") {
      const alreadySent = NextResponse.json({
        email: { data: null, error: null, skipped: true },
        sms: { sent: false, skipped: true },
        reminders: { error: null, skipped: true },
        inApp: { success: true, skipped: true },
      });
      alreadySent.headers.set(REQUEST_ID_HEADER, requestId);
      return alreadySent;
    }

    const nextAttempt = (existingEvent?.attempts ?? 0) + 1;
    await admin.from("notification_events").upsert(
      {
        booking_id: bookingId,
        event_type: "confirmation",
        status: "processing",
        attempts: nextAttempt,
        last_error: null,
        dead_letter_reason: null,
        next_retry_at: null,
      },
      { onConflict: "booking_id,event_type" },
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

    const bookingForEmail = {
      id: bookingRow.id,
      start_time: bookingRow.start_time,
      end_time: bookingRow.end_time ?? bookingRow.start_time,
      status: bookingRow.status ?? "confirmed",
      is_walk_in: bookingRow.is_walk_in ?? false,
      notes: null,
      customers: bookingCustomer?.full_name ? { full_name: bookingCustomer.full_name } : null,
      employees: bookingEmployee?.full_name ? { full_name: bookingEmployee.full_name } : null,
      services: bookingService?.name ? { name: bookingService.name } : null,
      customer_full_name: bookingCustomer?.full_name ?? "Customer",
      service: bookingService?.name ? { name: bookingService.name } : null,
      employee: bookingEmployee?.full_name ? { name: bookingEmployee.full_name } : null,
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
      recipientEmail: authoritativeEmail,
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
    const reminderResult = await scheduleReminders({
      bookingId,
      bookingStartTime: bookingRow.start_time,
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
    });

    // Notify salon staff via RPC so they get in-app (bell) notifications
    let inAppResult: { success: boolean; sent?: unknown; error?: string } = {
      success: false,
    };

    try {
      const customerName = bookingCustomer?.full_name || "Customer";
      const serviceName = bookingService?.name || "Service";
      const bookingTime = bookingRow.start_time;

      if (bookingTime) {
        logInfo("Calling notify_salon_staff_new_booking from public API route", {
          ...logContext,
          customerName,
          serviceName,
          bookingTime,
        });

        const supabase = createClientForRouteHandler(request, response, requestId);
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
        logWarn("Missing bookingTime in authoritative booking, skipping in-app notification", logContext);
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
    const rawPhone = authoritativePhone;
    const normalizedPhone = normalizeToE164(rawPhone);
    const smsResult = normalizedPhone
      ? await (async () => {
          const serviceName = bookingService?.name || "your appointment";
          const salonName = salon?.name || "the salon";
          const dateTime = bookingRow.start_time
            ? new Date(bookingRow.start_time)
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

    const anyDeliverySuccess = Boolean(emailResult?.data || smsResult?.sent || inAppResult?.success);
    if (anyDeliverySuccess) {
      await admin
        .from("notification_events")
        .update({
          status: "sent",
          sent_at: new Date().toISOString(),
          last_error: null,
          provider_used: smsResult?.sent ? "twilio" : "resend",
          next_retry_at: null,
        })
        .eq("booking_id", bookingId)
        .eq("event_type", "confirmation");
    } else {
      const shouldDeadLetter = nextAttempt >= MAX_NOTIFICATION_ATTEMPTS;
      const errorReason =
        emailResult?.error ||
        smsResult?.error ||
        inAppResult?.error ||
        "No channel delivered confirmation";

      await admin
        .from("notification_events")
        .update({
          status: shouldDeadLetter ? "dead_letter" : "failed",
          last_error: errorReason,
          dead_letter_reason: shouldDeadLetter ? errorReason : null,
          next_retry_at: shouldDeadLetter
            ? null
            : new Date(Date.now() + Math.min(30, 2 ** nextAttempt) * 60_000).toISOString(),
        })
        .eq("booking_id", bookingId)
        .eq("event_type", "confirmation");
    }

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

    jsonResponse.headers.set(REQUEST_ID_HEADER, requestId);
    return jsonResponse;
  } catch (error) {
    logError("Exception in public send-notifications API route", error, {});
    const errorResponse = NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    );
    errorResponse.headers.set(REQUEST_ID_HEADER, requestId);
    return errorResponse;
  }
}

