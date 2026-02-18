import { NextRequest, NextResponse } from "next/server";
import { authenticateAndVerifySalon } from "@/lib/api-auth";
import { sendEmail } from "@/lib/services/email-service";
import { getSalonById } from "@/lib/repositories/salons";
import { logError, logInfo, logWarn } from "@/lib/services/logger";

export async function POST(request: NextRequest) {
  const response = NextResponse.next();

  try {
    const body = await request.json();
    const { recipientEmail, group, salonId } = body as {
      recipientEmail?: string;
      group?: "customer" | "internal";
      salonId?: string;
    };

    if (!recipientEmail || !salonId || !group) {
      return NextResponse.json(
        { error: "Missing required fields: recipientEmail, group, salonId" },
        { status: 400 }
      );
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(recipientEmail)) {
      return NextResponse.json(
        { error: "Invalid email address" },
        { status: 400 }
      );
    }

    const authResult = await authenticateAndVerifySalon(request, salonId, response);

    if (authResult.error || !authResult.user || !authResult.hasAccess) {
      const statusCode = !authResult.user ? 401 : 403;
      logWarn("Unauthorized access attempt to send-test-notification", {
        userId: authResult.user?.id,
        salonId,
        error: authResult.error,
      });
      return NextResponse.json(
        { error: authResult.error || "Unauthorized" },
        { status: statusCode }
      );
    }

    const salonResult = await getSalonById(salonId);
    const salonName = salonResult.data?.name || "Your Salon";

    const isCustomer = group === "customer";
    const subject = isCustomer
      ? `Test: Customer Notification — ${salonName}`
      : `Test: Internal Notification — ${salonName}`;

    const heading = isCustomer
      ? "Customer Notification Test"
      : "Internal Notification Test";

    const explanation = isCustomer
      ? "This is what your customers will receive when a booking event occurs (confirmation, reminder, or cancellation)."
      : "This is what you will receive when a booking event occurs (new booking, change, or cancellation).";

    const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 520px; margin: 0 auto; padding: 32px 16px; color: #1a1a1a;">
  <div style="border: 1px solid #e5e5e5; border-radius: 8px; padding: 24px;">
    <h2 style="margin: 0 0 8px; font-size: 18px;">${heading}</h2>
    <p style="margin: 0 0 16px; font-size: 14px; color: #666;">${explanation}</p>
    <hr style="border: none; border-top: 1px solid #e5e5e5; margin: 16px 0;">
    <table style="width: 100%; font-size: 14px; border-collapse: collapse;">
      <tr><td style="padding: 4px 0; color: #666;">Salon</td><td style="padding: 4px 0; text-align: right; font-weight: 500;">${salonName}</td></tr>
      <tr><td style="padding: 4px 0; color: #666;">Type</td><td style="padding: 4px 0; text-align: right; font-weight: 500;">${isCustomer ? "Customer email" : "Internal email"}</td></tr>
      <tr><td style="padding: 4px 0; color: #666;">Status</td><td style="padding: 4px 0; text-align: right; font-weight: 500; color: #16a34a;">Working</td></tr>
    </table>
    <hr style="border: none; border-top: 1px solid #e5e5e5; margin: 16px 0;">
    <p style="margin: 0; font-size: 12px; color: #999;">This is a test email from TeqBook. No action is required.</p>
  </div>
</body>
</html>`.trim();

    const text = `${heading}\n\n${explanation}\n\nSalon: ${salonName}\nType: ${isCustomer ? "Customer email" : "Internal email"}\nStatus: Working\n\nThis is a test email from TeqBook. No action is required.`;

    logInfo("Sending test notification email", {
      userId: authResult.user.id,
      salonId,
      group,
      recipientEmail,
    });

    const emailResult = await sendEmail({
      to: recipientEmail,
      subject,
      html,
      text,
      salonId,
      emailType: "other",
      metadata: { test: true, group },
    });

    if (emailResult.error) {
      logError("Failed to send test notification email", new Error(emailResult.error), {
        userId: authResult.user.id,
        salonId,
        recipientEmail,
      });
      return NextResponse.json(
        { error: emailResult.error },
        { status: 500 }
      );
    }

    const jsonResponse = NextResponse.json({ success: true, id: emailResult.data?.id });
    response.cookies.getAll().forEach((cookie) => {
      jsonResponse.cookies.set(cookie.name, cookie.value, cookie);
    });
    return jsonResponse;
  } catch (error) {
    logError("Exception in send-test-notification API route", error, {});
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
