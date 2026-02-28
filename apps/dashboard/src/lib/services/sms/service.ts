import { createClient } from "@/lib/supabase/server";
import { getAdminClient } from "@/lib/supabase/admin";
import { logError } from "@/lib/services/logger";
import { checkRateLimit, incrementRateLimit } from "@/lib/services/rate-limit-service";
import { normalizeToE164 } from "./e164";
import { resolveSmsPolicyForSalon } from "./policy";
import { TwilioAdapter } from "./twilio-adapter";
import type {
  SendSmsInput,
  SendSmsResult,
  SmsProvider,
  SmsProviderSendResult,
  SmsType,
} from "./types";

type IncrementSmsUsageResponse = {
  allowed: boolean;
  idempotent_replay: boolean;
  log_id: string;
  status: "pending" | "blocked" | "sent" | "failed" | "delivered" | "undelivered";
  provider_message_id: string | null;
  used_count: number;
  overage_count: number;
  hard_cap_reached: boolean;
};

function getSmsProvider(): SmsProvider {
  const provider = process.env.SMS_PROVIDER?.toLowerCase() || "twilio";
  if (provider === "twilio") {
    return new TwilioAdapter();
  }

  // Keep the adapter contract stable while LINK is added later.
  throw new Error(`Unsupported SMS provider: ${provider}`);
}

function isTypeAllowed(type: SmsType, allowedTypes: SmsType[]): boolean {
  return allowedTypes.includes(type);
}

export async function sendSms(input: SendSmsInput): Promise<SendSmsResult> {
  const requestStartedAt = Date.now();
  const supabase = await createClient();

  try {
    const normalizedPhone = normalizeToE164(input.recipient);
    if (!normalizedPhone) {
      return {
        allowed: false,
        status: "failed",
        error: "Recipient phone must be valid E.164 format",
      };
    }

    const { data: policy, error: policyError } = await resolveSmsPolicyForSalon(input.salonId);
    if (policyError || !policy) {
      return {
        allowed: false,
        status: "failed",
        error: policyError || "SMS policy could not be resolved",
      };
    }

    if (!isTypeAllowed(input.type, policy.allowedTypes)) {
      return {
        allowed: false,
        status: "blocked",
        blockedReason: `SMS type ${input.type} is not allowed for ${policy.plan}`,
      };
    }

    const claimOrManualEndpoint = input.type === "waitlist_claim" ? "claim-sms" : input.type === "manual" ? "manual-sms" : null;
    if (claimOrManualEndpoint) {
      const rlIdentifier = `${input.salonId}:${input.type}:${normalizedPhone}`;
      const rl = await checkRateLimit(rlIdentifier, claimOrManualEndpoint, {
        endpointType: claimOrManualEndpoint,
        identifierType: "user_id",
      });
      if (!rl.allowed) {
        return {
          allowed: false,
          status: "blocked",
          blockedReason: `Rate limit exceeded (${claimOrManualEndpoint})`,
        };
      }
      await incrementRateLimit(rlIdentifier, claimOrManualEndpoint, {
        endpointType: claimOrManualEndpoint,
        identifierType: "user_id",
      });
    }

    const globalRlIdentifier =
      (input.metadata && typeof input.metadata.request_ip === "string"
        ? String(input.metadata.request_ip)
        : normalizedPhone) || "unknown";
    const globalRl = await checkRateLimit(globalRlIdentifier, "sms-global-abuse", {
      endpointType: "sms-global-abuse",
      identifierType: "ip",
    });
    if (!globalRl.allowed) {
      return {
        allowed: false,
        status: "blocked",
        blockedReason: "Global SMS abuse guard triggered",
      };
    }
    await incrementRateLimit(globalRlIdentifier, "sms-global-abuse", {
      endpointType: "sms-global-abuse",
      identifierType: "ip",
    });

    const rpcMetadata = {
      ...(input.metadata || {}),
      request_latency_ms: Date.now() - requestStartedAt,
      raw_recipient_input: input.recipient,
    };

    const { data: rpcData, error: rpcError } = await supabase.rpc("increment_sms_usage_and_log", {
      p_salon_id: input.salonId,
      p_period_start: input.billingPeriodStart,
      p_period_end: input.billingPeriodEnd,
      p_idempotency_key: input.idempotencyKey,
      p_recipient_phone: normalizedPhone,
      p_sms_type: input.type,
      p_included_quota: policy.includedQuota,
      p_hard_cap: policy.hardCap,
      p_effective_unit_price_at_send: policy.effectiveUnitPrice,
      p_plan_at_send: policy.plan,
      p_booking_id: input.bookingId || null,
      p_waitlist_id: input.waitlistId || null,
      p_currency: "NOK",
      p_metadata: rpcMetadata,
    });

    if (rpcError || !rpcData) {
      return {
        allowed: false,
        status: "failed",
        error: rpcError?.message || "increment_sms_usage_and_log returned no data",
      };
    }

    const usageResult = rpcData as unknown as IncrementSmsUsageResponse;

    if (!usageResult.allowed || usageResult.status === "blocked") {
      return {
        allowed: false,
        status: "blocked",
        logId: usageResult.log_id,
        blockedReason: "SMS blocked by quota or hard cap",
        usage: {
          usedCount: usageResult.used_count,
          overageCount: usageResult.overage_count,
          hardCapReached: usageResult.hard_cap_reached,
        },
      };
    }

    const provider = getSmsProvider();
    const providerResult = await provider.send({
      to: normalizedPhone,
      body: input.body,
      idempotencyKey: input.idempotencyKey,
    });

    await persistProviderResult(supabase, usageResult.log_id, providerResult, requestStartedAt);

    return {
      allowed: providerResult.success,
      status: providerResult.success ? "sent" : "failed",
      logId: usageResult.log_id,
      providerMessageId: providerResult.providerMessageId,
      error: providerResult.error,
      usage: {
        usedCount: usageResult.used_count,
        overageCount: usageResult.overage_count,
        hardCapReached: usageResult.hard_cap_reached,
      },
    };
  } catch (error) {
    logError("sendSms failed", error, {
      salonId: input.salonId,
      type: input.type,
      idempotencyKey: input.idempotencyKey,
    });

    return {
      allowed: false,
      status: "failed",
      error: error instanceof Error ? error.message : "Unknown SMS error",
    };
  }
}

async function persistProviderResult(
  _supabase: Awaited<ReturnType<typeof createClient>>,
  logId: string,
  providerResult: SmsProviderSendResult,
  requestStartedAt: number
): Promise<void> {
  const adminClient = getAdminClient();

  const { data: currentLog } = await adminClient
    .from("sms_log")
    .select("metadata")
    .eq("id", logId)
    .maybeSingle();

  const mergedMetadata =
    currentLog && typeof currentLog.metadata === "object" && currentLog.metadata !== null
      ? {
          ...(currentLog.metadata as Record<string, unknown>),
          request_latency_ms: Date.now() - requestStartedAt,
          provider_latency_ms: providerResult.providerLatencyMs,
        }
      : {
          request_latency_ms: Date.now() - requestStartedAt,
          provider_latency_ms: providerResult.providerLatencyMs,
        };

  const { error } = await adminClient
    .from("sms_log")
    .update({
      status: providerResult.success ? "sent" : "failed",
      provider_name: providerResult.providerName,
      provider_message_id: providerResult.providerMessageId || null,
      sent_at: providerResult.success ? new Date().toISOString() : null,
      error_message: providerResult.error || null,
      metadata: mergedMetadata,
    })
    .eq("id", logId);

  if (error) {
    logError("Failed to persist provider result in sms_log", error, { logId });
  }
}
