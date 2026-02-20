/**
 * Format time string to readable format
 * Uses salon timezone if provided
 */
import { formatTimeInTimezone } from "@/lib/utils/timezone";

export function formatTime(
  timeString: string,
  timezone?: string | null,
  locale: string = "en",
  hour12Override?: boolean
): string {
  if (timezone) {
    return formatTimeInTimezone(timeString, timezone, locale, {
      hour: "2-digit",
      minute: "2-digit",
    }, hour12Override);
  }
  const date = new Date(timeString);
  const isNb = locale === "nb" || locale.startsWith("nb-") || locale === "no" || locale.startsWith("no-");
  return date.toLocaleTimeString(isNb ? "nb-NO" : "en-US", {
    hour: "2-digit",
    minute: "2-digit",
    ...(hour12Override !== undefined ? { hour12: hour12Override } : isNb ? { hour12: false } : {}),
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
