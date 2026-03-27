import { logInfo, logWarn } from "@/lib/services/logger";

export type SmsBillingFlow =
  | "billing_read"
  | "booking_sms"
  | "waitlist_sms"
  | "waitlist_offer_sms"
  | "sms_write";

export function logSmsBillingWindowResolved(
  flow: SmsBillingFlow,
  salonId: string,
  periodStart: string,
  periodEnd: string,
  extra?: Record<string, unknown>
): void {
  logInfo("SMS billing window resolved", {
    app: "dashboard",
    smsBillingFlow: flow,
    salon_id: salonId,
    period_start: periodStart,
    period_end: periodEnd,
    ...extra,
  });
}

export function logSmsBillingWindowMismatch(
  message: string,
  salonId: string,
  periodStart: string,
  periodEnd: string,
  extra?: Record<string, unknown>
): void {
  logWarn(message, {
    app: "dashboard",
    smsBillingFlow: "billing_read",
    salon_id: salonId,
    period_start: periodStart,
    period_end: periodEnd,
    ...extra,
  });
}
