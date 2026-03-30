import type { OpeningHourItem, SocialItem } from "./profile-types";
import type { AppLocale } from "@/i18n/translations";
import { getLocaleTag, getProfilePageMessages } from "./profile-i18n";

export const BASE_CARD_CLASS = "rounded-2xl border border-[var(--pb-border-soft)] bg-[var(--pb-surface)] shadow-[var(--pb-shadow-1)]";

export function formatPrice(priceCents: number | null, locale: AppLocale): string | null {
  if (!priceCents || priceCents <= 0) return null;
  return new Intl.NumberFormat(getLocaleTag(locale), {
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

export function buildTagline(description: string, addressLine: string | null, locale: AppLocale): string {
  const m = getProfilePageMessages(locale);
  const trimmed = description.trim();
  const city = extractCity(addressLine);
  const premiumFallback = city
    ? `${m.teamBioFallback} ${city}.`
    : m.teamBioFallback;
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

export function formatOpeningHoursRange(item: OpeningHourItem, locale: AppLocale): string {
  const m = getProfilePageMessages(locale);
  if (item.isClosed) return m.closedDay;
  const open = formatTimeShort(item.openTime) || "--:--";
  const close = formatTimeShort(item.closeTime) || "--:--";
  return `${open} - ${close}`;
}

export function buildHoursStatusLine(
  isOpenNow: boolean | null,
  isClosedToday: boolean,
  closeTime: string | null,
  locale: AppLocale
): string {
  const m = getProfilePageMessages(locale);
  if (isClosedToday) return m.closedNow;
  if (isOpenNow === true) {
    const closeAt = formatTimeShort(closeTime);
    return closeAt ? `${m.openNow} · ${m.closesAtLabel} ${closeAt}` : m.openNow;
  }
  if (isOpenNow === false) return m.closedNow;
  return m.hoursMayVary;
}

export function buildSocialItems(socialLinks: {
  instagramUrl: string | null;
  facebookUrl: string | null;
  twitterUrl: string | null;
  tiktokUrl: string | null;
  websiteUrl: string | null;
}, locale: AppLocale): SocialItem[] {
  const m = getProfilePageMessages(locale);
  return [
    { platform: "instagram", url: socialLinks.instagramUrl, label: m.socialInstagram },
    { platform: "facebook", url: socialLinks.facebookUrl, label: m.socialFacebook },
    { platform: "twitter", url: socialLinks.twitterUrl, label: m.socialTwitter },
    { platform: "tiktok", url: socialLinks.tiktokUrl, label: m.socialTiktok },
    { platform: "website", url: socialLinks.websiteUrl, label: m.socialWebsite },
  ].filter((item): item is SocialItem => Boolean(item.url));
}
