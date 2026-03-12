export const PUBLIC_BOOKING_ANALYTICS_EVENTS = [
  "waitlist_direct_opened",
  "booking_flow_dropoff_hint",
  "waitlist_no_slots_prompt_shown",
  "waitlist_no_slots_submitted",
  "waitlist_direct_submitted",
  "booking_flow_step_completed",
  "booking_cta_enabled_time",
  "booking_flow_abandon",
  "booking_completed",
  "booking_cancel_requested",
  "booking_cancel_completed",
] as const;

export type PublicBookingAnalyticsEvent =
  (typeof PUBLIC_BOOKING_ANALYTICS_EVENTS)[number];

export const SUPPORT_TICKET_CATEGORIES = [
  "billing",
  "booking",
  "notifications",
  "authentication",
  "ux",
  "integrations",
  "data",
  "other",
] as const;

export type SupportTicketCategory = (typeof SUPPORT_TICKET_CATEGORIES)[number];

export type ProductFunnelKpi =
  | "onboarding_conversion_rate"
  | "booking_completion_rate"
  | "payment_dropoff_rate"
  | "notification_delivery_success_rate";

