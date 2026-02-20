import { Resend } from "resend";
import { createEmailLog, updateEmailLogStatus } from "@/lib/repositories/email-log";
import { logError, logInfo, logWarn } from "@/lib/services/logger";
import type { SendEmailInput } from "./types";

const RESEND_API_KEY = process.env.RESEND_API_KEY || "";
const FROM_EMAIL = process.env.EMAIL_FROM || "noreply@teqbook.app";
const FROM_NAME = process.env.EMAIL_FROM_NAME || "TeqBook";

let resendClient: Resend | null = null;

function getResendClient(): Resend | null {
  if (!resendClient) {
    if (!RESEND_API_KEY) {
      if (process.env.NODE_ENV === "test" || process.env.NODE_ENV === "development") {
        return null;
      }
      throw new Error("RESEND_API_KEY environment variable is not set");
    }
    resendClient = new Resend(RESEND_API_KEY);
  }
  return resendClient;
}

export async function sendEmail(
  input: SendEmailInput
): Promise<{ data: { id: string } | null; error: string | null }> {
  const correlationId = crypto.randomUUID();
  const logContext = {
    correlationId,
    to: input.to,
    subject: input.subject,
    emailType: input.emailType || "other",
    salonId: input.salonId,
  };

  try {
    if (!input.to || !input.to.includes("@")) {
      logWarn("Invalid email address", { ...logContext, email: input.to });
      return { data: null, error: "Invalid email address" };
    }

    if (!input.subject || !input.html) {
      logWarn("Missing required email fields", logContext);
      return { data: null, error: "Subject and HTML content are required" };
    }

    const emailLogResult = await createEmailLog({
      salon_id: input.salonId || null,
      recipient_email: input.to,
      subject: input.subject,
      email_type: input.emailType || "other",
      status: "pending",
      metadata: input.metadata || null,
    });

    if (emailLogResult.error) {
      logError("Failed to create email log", new Error(emailLogResult.error), logContext);
    }

    let providerResponse;
    try {
      const client = getResendClient();

      logInfo("Preparing to send email via Resend", {
        ...logContext,
        hasClient: !!client,
        hasApiKey: !!RESEND_API_KEY,
        fromEmail: FROM_EMAIL,
        to: input.to,
      });

      if (!client) {
        logWarn("Resend client is null - simulating email send (no API key in dev/test)", logContext);
        providerResponse = {
          data: { id: `test-email-${Date.now()}` },
          error: null,
        } as { data: { id: string } | null; error: { message: string } | null };
      } else {
        const emailOptions: {
          from: string;
          to: string;
          subject: string;
          html: string;
          text?: string;
          reply_to?: string;
          headers?: Record<string, string>;
          tags?: Array<{ name: string; value: string }>;
          attachments?: Array<{ filename: string; content: string | Buffer; content_type?: string }>;
        } = {
          from: `${FROM_NAME} <${FROM_EMAIL}>`,
          to: input.to,
          subject: input.subject,
          html: input.html,
          text: input.text || input.html.replace(/<[^>]*>/g, ""),
          reply_to: process.env.EMAIL_REPLY_TO || FROM_EMAIL.replace("noreply", "support"),
          headers: {
            "X-Entity-Ref-ID": logContext.correlationId,
            "List-Unsubscribe": `<mailto:${process.env.EMAIL_UNSUBSCRIBE || FROM_EMAIL.replace("noreply", "unsubscribe")}?subject=unsubscribe>`,
            "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
            "Precedence": "bulk",
            "X-Auto-Response-Suppress": "All",
          },
          tags: [
            { name: "email_type", value: input.emailType || "other" },
            { name: "salon_id", value: input.salonId || "unknown" },
          ],
        };

        if (input.attachments && input.attachments.length > 0) {
          emailOptions.attachments = input.attachments.map((att) => ({
            filename: att.filename,
            content: att.content,
            content_type: att.contentType,
          }));
        }

        providerResponse = await client.emails.send(emailOptions);

        if (providerResponse.error) {
          throw new Error(providerResponse.error.message || "Email sending failed");
        }
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";

      if (emailLogResult.data?.id) {
        await updateEmailLogStatus({
          id: emailLogResult.data.id,
          status: "failed",
          error_message: errorMessage,
        });
      }

      logError("Failed to send email", error, { ...logContext, error: errorMessage });
      return { data: null, error: errorMessage };
    }

    if (emailLogResult.data?.id && providerResponse.data?.id) {
      await updateEmailLogStatus({
        id: emailLogResult.data.id,
        status: "sent",
        provider_id: providerResponse.data.id,
      });
    }

    logInfo("Email sent successfully", { ...logContext, providerId: providerResponse.data?.id });

    return {
      data: { id: providerResponse.data?.id || emailLogResult.data?.id || "" },
      error: null,
    };
  } catch (error) {
    logError("Exception sending email", error, logContext);
    return {
      data: null,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}
