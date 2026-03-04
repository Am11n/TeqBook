import { formatDateInTimezone, formatTimeInTimezone } from "@/lib/utils/timezone";

export type Salon = {
  id: string;
  name: string;
  plan?: "starter" | "pro" | "business" | null;
  whatsapp_number?: string | null;
  timezone?: string | null;
  theme?: {
    primary?: string;
    secondary?: string;
    font?: string;
    logo_url?: string;
    headerVariant?: "standard" | "compact";
  } | null;
  theme_pack_id?: string | null;
  theme_pack_version?: number | null;
  theme_pack_hash?: string | null;
  theme_pack_snapshot?: Record<string, unknown> | null;
  theme_overrides?: Record<string, unknown> | null;
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
