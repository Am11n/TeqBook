import { formatDateInTimezone, formatTimeInTimezone } from "@/lib/utils/timezone";

export type Salon = {
  id: string;
  name: string;
  whatsapp_number?: string | null;
  timezone?: string | null;
  theme?: {
    primary?: string;
    font?: string;
    logo_url?: string;
  } | null;
};

export function createDateFormatter(timezone: string, locale: string) {
  return (dateString: string) =>
    formatDateInTimezone(dateString, timezone, locale, {
      weekday: "long", year: "numeric", month: "long", day: "numeric",
    });
}

export function createTimeFormatter(timezone: string, locale: string) {
  return (dateString: string) =>
    formatTimeInTimezone(dateString, timezone, locale, {
      hour: "numeric", minute: "2-digit",
    });
}
