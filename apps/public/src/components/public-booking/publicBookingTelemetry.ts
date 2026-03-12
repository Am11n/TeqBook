import {
  PUBLIC_BOOKING_ANALYTICS_EVENTS,
  type PublicBookingAnalyticsEvent,
} from "@teqbook/shared";

type GTag = (
  command: string,
  eventName: string,
  params?: Record<string, unknown>,
) => void;

const allowedEvents = new Set<string>(PUBLIC_BOOKING_ANALYTICS_EVENTS);

export function trackPublicEvent(
  event: PublicBookingAnalyticsEvent,
  payload?: Record<string, unknown>,
) {
  if (typeof window === "undefined") return;
  if (!allowedEvents.has(event)) return;

  const maybeGtag = (window as Window & { gtag?: GTag }).gtag;
  const normalizedPayload = payload ? { ...payload } : undefined;
  if (normalizedPayload && "slug" in normalizedPayload && !("salon_slug" in normalizedPayload)) {
    normalizedPayload.salon_slug = normalizedPayload.slug;
    delete normalizedPayload.slug;
  }
  if (typeof maybeGtag === "function") {
    maybeGtag("event", event, normalizedPayload);
  }
}
