import type { SmsProvider, SmsProviderSendInput, SmsProviderSendResult } from "./types";

const TWILIO_API_BASE = "https://api.twilio.com/2010-04-01";

function getTwilioConfig(): {
  accountSid: string;
  authToken: string;
  fromNumber: string;
} {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const fromNumber = process.env.TWILIO_FROM_NUMBER;

  if (!accountSid || !authToken || !fromNumber) {
    throw new Error("Twilio environment variables are missing");
  }

  return { accountSid, authToken, fromNumber };
}

export class TwilioAdapter implements SmsProvider {
  async send(input: SmsProviderSendInput): Promise<SmsProviderSendResult> {
    const startedAt = Date.now();

    try {
      const { accountSid, authToken, fromNumber } = getTwilioConfig();
      const endpoint = `${TWILIO_API_BASE}/Accounts/${accountSid}/Messages.json`;
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

      const payload = (await response.json()) as {
        sid?: string;
        message?: string;
        status?: string;
      };

      if (!response.ok) {
        return {
          success: false,
          providerName: "twilio",
          providerLatencyMs: Date.now() - startedAt,
          error: payload.message || `Twilio request failed (${response.status})`,
        };
      }

      return {
        success: true,
        providerMessageId: payload.sid,
        providerName: "twilio",
        providerLatencyMs: Date.now() - startedAt,
      };
    } catch (error) {
      return {
        success: false,
        providerName: "twilio",
        providerLatencyMs: Date.now() - startedAt,
        error: error instanceof Error ? error.message : "Unknown Twilio error",
      };
    }
  }
}
