import { NextRequest, NextResponse } from "next/server";
import { sendBookingConfirmation } from "@/lib/services/email-service";
import { scheduleReminders } from "@/lib/services/reminder-service";
import { getSalonById } from "@/lib/repositories/salons";
import { logError, logWarn, logInfo } from "@/lib/services/logger";
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

    // Send confirmation email (don't fail if email fails)
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

    return NextResponse.json({
      email: emailResult,
      reminders: reminderResult,
    });
  } catch (error) {
    logError("Exception in send-notifications API route", error, {});
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

