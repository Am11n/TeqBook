/**
 * Format time string to readable format
 * Uses salon timezone if provided
 */
import { formatTimeInTimezone } from "@/lib/utils/timezone";

export function formatTime(
  timeString: string,
  timezone?: string | null,
  locale: string = "en"
): string {
  if (timezone) {
    return formatTimeInTimezone(timeString, timezone, locale, {
      hour: "2-digit",
      minute: "2-digit",
    });
  }
  const date = new Date(timeString);
  return date.toLocaleTimeString(locale === "nb" || locale.startsWith("nb-") || locale === "no" || locale.startsWith("no-") ? "nb-NO" : "en-US", {
    hour: "2-digit",
    minute: "2-digit",
    ...(locale === "nb" || locale.startsWith("nb-") || locale === "no" || locale.startsWith("no-") ? { hour12: false } : {}),
  });
}

/**
 * Get initials from name
 */
export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

/**
 * Get owner name from email
 */
export function getOwnerNameFromEmail(email: string | null | undefined): string {
  if (!email) return "";
  const name = email.split("@")[0];
  return name.charAt(0).toUpperCase() + name.slice(1);
}
