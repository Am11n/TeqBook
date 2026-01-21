import { NextRequest, NextResponse } from "next/server";
import { sendBookingNotification } from "@/lib/services/unified-notification-service";
import { getSalonById } from "@/lib/repositories/salons";
import { logError, logWarn, logInfo } from "@/lib/services/logger";
import { supabase } from "@/lib/supabase-client";
import type { Booking } from "@/lib/types";

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

    // Send cancellation email to customer if email provided
    if (customerEmail) {
      logInfo("Sending cancellation email to customer", {
        bookingId: booking.id,
        recipientEmail: customerEmail,
        language: language || salon?.preferred_language || "en",
      });

      const emailResult = await sendBookingNotification("booking_cancelled", {
        booking: bookingForNotification,
        salonId,
        recipientUserId: null,
        recipientEmail: customerEmail,
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
    }

    // Send in-app notification to salon staff about cancellation
    // (especially useful if customer cancelled)
    try {
      const { data: salonStaff } = await supabase
        .from("profiles")
        .select("user_id, role")
        .eq("salon_id", salonId)
        .in("role", ["owner", "manager"]);

      if (salonStaff && salonStaff.length > 0) {
        logInfo("Sending cancellation in-app notifications to salon staff", {
          bookingId: booking.id,
          staffCount: salonStaff.length,
          cancelledBy,
        });

        const notificationResults = await Promise.allSettled(
          salonStaff.map((staff) =>
            sendBookingNotification("booking_cancelled", {
              booking: bookingForNotification,
              salonId,
              recipientUserId: staff.user_id,
              recipientEmail: null,
              language: language || salon?.preferred_language || "en",
            })
          )
        );

        const successCount = notificationResults.filter(
          (r) => r.status === "fulfilled" && r.value?.success
        ).length;

        results.salonInApp = {
          success: successCount > 0,
          sent: successCount,
          total: salonStaff.length,
        };

        logInfo("Cancellation in-app notification results", {
          bookingId: booking.id,
          successCount,
          totalStaff: salonStaff.length,
        });
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
