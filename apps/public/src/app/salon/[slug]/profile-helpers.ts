import type { OpeningHourItem, SocialItem } from "./profile-types";

export const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
export const BASE_CARD_CLASS = "rounded-2xl border bg-[var(--pb-surface)] shadow-[var(--pb-shadow-1)]";

export function formatPrice(priceCents: number | null): string | null {
  if (!priceCents || priceCents <= 0) return null;
  return new Intl.NumberFormat("nb-NO", {
    style: "currency",
    currency: "NOK",
    maximumFractionDigits: 0,
  }).format(priceCents / 100);
}

export function fallbackAvatar(name: string): string {
  const letters = name
    .split(" ")
    .map((part) => part.trim())
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || "");
  return letters.join("") || "TB";
}

function extractCity(addressLine: string | null): string | null {
  if (!addressLine) return null;
  const parts = addressLine
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);
  return parts.length > 1 ? parts[parts.length - 1] : null;
}

export function buildTagline(description: string, addressLine: string | null): string {
  const trimmed = description.trim();
  const city = extractCity(addressLine);
  const premiumFallback = city
    ? `Precision cuts, fades and beard grooming in ${city}.`
    : "Precision cuts, fades and beard grooming.";
  const genericSignals = [
    "professional barber",
    "professional barber in",
    "book your next appointment online",
    "professional salon",
  ];

  if (!trimmed) return premiumFallback;
  if (genericSignals.some((signal) => trimmed.toLowerCase().includes(signal))) {
    return premiumFallback;
  }
  if (trimmed.length <= 140) return trimmed;
  return `${trimmed.slice(0, 137).trimEnd()}...`;
}

export function getTodayOpeningHours(openingHours: OpeningHourItem[]): { closeTime: string | null; isClosed: boolean } | null {
  const jsDay = new Date().getDay();
  const mondayBasedDay = (jsDay + 6) % 7;
  const today = openingHours.find((entry) => entry.dayOfWeek === mondayBasedDay);
  if (!today) return null;
  return { closeTime: today.closeTime, isClosed: today.isClosed };
}

export function formatTimeShort(value: string | null): string | null {
  if (!value) return null;
  return value.slice(0, 5);
}

export function getTodayDayOfWeek(): number {
  return (new Date().getDay() + 6) % 7;
}

export function formatOpeningHoursRange(item: OpeningHourItem): string {
  if (item.isClosed) return "Closed";
  const open = formatTimeShort(item.openTime) || "--:--";
  const close = formatTimeShort(item.closeTime) || "--:--";
  return `${open} - ${close}`;
}

export function buildHoursStatusLine(isOpenNow: boolean | null, closeTime: string | null): string {
  if (isOpenNow === true) {
    const closeAt = formatTimeShort(closeTime);
    return closeAt ? `Open now · Closes at ${closeAt}` : "Open now";
  }
  if (isOpenNow === false) return "Closed now";
  return "Hours may vary";
}

export function buildSocialItems(socialLinks: {
  instagramUrl: string | null;
  facebookUrl: string | null;
  twitterUrl: string | null;
  tiktokUrl: string | null;
  websiteUrl: string | null;
}): SocialItem[] {
  return [
    { platform: "instagram", url: socialLinks.instagramUrl, label: "Instagram" },
    { platform: "facebook", url: socialLinks.facebookUrl, label: "Facebook" },
    { platform: "twitter", url: socialLinks.twitterUrl, label: "X (Twitter)" },
    { platform: "tiktok", url: socialLinks.tiktokUrl, label: "TikTok" },
    { platform: "website", url: socialLinks.websiteUrl, label: "Website" },
  ].filter((item): item is SocialItem => Boolean(item.url));
}
