type GTag = (command: string, eventName: string, params?: Record<string, unknown>) => void;

export function trackPublicEvent(event: string, payload?: Record<string, unknown>) {
  if (typeof window === "undefined") return;

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
