import type { AppLocale } from "@/i18n/translations";
import type { Slot } from "./types";

type RawAvailableSlot = {
  slot_start: string;
  slot_end: string;
};

export function normalizePhone(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) return "";
  const hasLeadingPlus = trimmed.startsWith("+");
  const digitsOnly = trimmed.replace(/\D/g, "");
  if (!digitsOnly) return "";
  return hasLeadingPlus ? `+${digitsOnly}` : digitsOnly;
}

export function maskEmail(email: string | null): string | null {
  if (!email) return null;
  const [name, domain] = email.split("@");
  if (!name || !domain) return email;
  const maskedName = name.length <= 1 ? "*" : `${name[0]}***`;
  return `${maskedName}@${domain}`;
}

export function maskPhone(phone: string | null): string | null {
  if (!phone) return null;
  const visible = phone.slice(-2);
  return `${phone.slice(0, Math.max(0, phone.length - 2)).replace(/[0-9]/g, "•")}${visible}`;
}

export function formatPreferredDate(date: string, locale: AppLocale): string {
  const parsed = new Date(`${date}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) return date;
  return new Intl.DateTimeFormat(locale, { day: "2-digit", month: "short", year: "numeric" }).format(parsed);
}

export function isValidIsoDate(date: string | null): date is string {
  return !!date && /^\d{4}-\d{2}-\d{2}$/.test(date);
}

export function mapAvailableSlots(data: RawAvailableSlot[]): Slot[] {
  return data.map((slot) => {
    const startDate = new Date(slot.slot_start);
    const endDate = new Date(slot.slot_end);
    const startMatch = slot.slot_start.match(/T(\d{2}):(\d{2})/);
    const endMatch = slot.slot_end.match(/T(\d{2}):(\d{2})/);

    if (startMatch && endMatch) {
      const label = `${startMatch[1]}:${startMatch[2]} – ${endMatch[1]}:${endMatch[2]}`;
      return { start: slot.slot_start, end: slot.slot_end, label };
    }

    const startHours = startDate.getHours().toString().padStart(2, "0");
    const startMinutes = startDate.getMinutes().toString().padStart(2, "0");
    const endHours = endDate.getHours().toString().padStart(2, "0");
    const endMinutes = endDate.getMinutes().toString().padStart(2, "0");
    const label = `${startHours}:${startMinutes} – ${endHours}:${endMinutes}`;
    return { start: slot.slot_start, end: slot.slot_end, label };
  });
}
