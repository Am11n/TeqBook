type GTag = (command: string, eventName: string, params?: Record<string, unknown>) => void;

export function trackPublicEvent(event: string, payload?: Record<string, unknown>) {
  if (typeof window === "undefined") return;

  const maybeGtag = (window as Window & { gtag?: GTag }).gtag;
  if (typeof maybeGtag === "function") {
    maybeGtag("event", event, payload);
  }
}
