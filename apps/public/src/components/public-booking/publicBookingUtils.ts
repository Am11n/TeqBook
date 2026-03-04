import type { AppLocale } from "@/i18n/translations";
import type { PublicBookingEffectiveBranding, PublicBookingTokens, Salon, Slot } from "./types";
import {
  TEQBOOK_LOGO,
  buildPublicBookingTokens as buildSharedPublicBookingTokens,
  resolveEffectiveBranding,
} from "@teqbook/shared/branding";

type RawAvailableSlot = {
  slot_start: string;
  slot_end: string;
  employee_id?: string;
  employee_name?: string;
};

export function computeEffectiveBranding(salon: Salon): PublicBookingEffectiveBranding {
  const resolved = resolveEffectiveBranding({
    plan: salon.plan,
    theme_pack_id: salon.theme_pack_id,
    theme_pack_version: salon.theme_pack_version,
    theme_pack_hash: salon.theme_pack_hash,
    theme_pack_snapshot: salon.theme_pack_snapshot
      ? {
          id: salon.theme_pack_snapshot.id || salon.theme_pack_id || "unknown-pack",
          version: salon.theme_pack_snapshot.version || salon.theme_pack_version || 1,
          hash: salon.theme_pack_snapshot.hash || salon.theme_pack_hash || "unknown-hash",
          tokens: {
            primaryColor: salon.theme_pack_snapshot.tokens?.primaryColor || "#2563eb",
            secondaryColor: salon.theme_pack_snapshot.tokens?.secondaryColor || "#dbeafe",
            fontFamily: salon.theme_pack_snapshot.tokens?.fontFamily || "Inter",
            radiusScale: salon.theme_pack_snapshot.tokens?.radiusScale || "standard",
            shadowScale: salon.theme_pack_snapshot.tokens?.shadowScale || "soft",
            headerVariant: salon.theme_pack_snapshot.tokens?.headerVariant || "standard",
            motionPreset: salon.theme_pack_snapshot.tokens?.motionPreset || "standard",
          },
        }
      : null,
    theme_overrides: salon.theme_overrides || null,
    theme: salon.theme || null,
  });

  return {
    plan: resolved.plan,
    source: resolved.source,
    logoUrl: resolved.logoUrl || TEQBOOK_LOGO,
    primaryColor: resolved.primaryColor,
    secondaryColor: resolved.secondaryColor,
    fontFamily: resolved.fontFamily,
    headerVariant: resolved.headerVariant,
  };
}

export function buildPublicBookingTokens(branding: PublicBookingEffectiveBranding): PublicBookingTokens {
  return buildSharedPublicBookingTokens({
    plan: branding.plan,
    source: branding.source,
    logoUrl: branding.logoUrl,
    primaryColor: branding.primaryColor,
    secondaryColor: branding.secondaryColor,
    fontFamily: branding.fontFamily,
    headerVariant: branding.headerVariant,
    radiusScale: "standard",
    shadowScale: "soft",
    motionPreset: "standard",
  });
}

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

export function getLocalIsoDate(baseDate = new Date()): string {
  const year = baseDate.getFullYear();
  const month = `${baseDate.getMonth() + 1}`.padStart(2, "0");
  const day = `${baseDate.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatSlotTimeInTimezone(isoString: string, timezone?: string | null): string | null {
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) return null;

  try {
    return new Intl.DateTimeFormat("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
      timeZone: timezone || undefined,
    }).format(date);
  } catch {
    return null;
  }
}

export function mapAvailableSlots(data: RawAvailableSlot[], salonTimezone?: string | null): Slot[] {
  const seenIds = new Map<string, number>();

  return data.map((slot) => {
    const startDate = new Date(slot.slot_start);
    const endDate = new Date(slot.slot_end);
    const employeeId = slot.employee_id ?? "";
    const baseId = `${employeeId}|${slot.slot_start}|${slot.slot_end}`;
    const duplicateCount = seenIds.get(baseId) ?? 0;
    seenIds.set(baseId, duplicateCount + 1);
    const id = duplicateCount === 0 ? baseId : `${baseId}#${duplicateCount}`;

    const formattedStart = formatSlotTimeInTimezone(slot.slot_start, salonTimezone);
    const formattedEnd = formatSlotTimeInTimezone(slot.slot_end, salonTimezone);
    if (formattedStart && formattedEnd) {
      const rangeLabel = `${formattedStart} – ${formattedEnd}`;
      const label = slot.employee_name ? `${rangeLabel} · ${slot.employee_name}` : rangeLabel;
      return { id, start: slot.slot_start, end: slot.slot_end, label, employeeId };
    }

    const startHours = startDate.getHours().toString().padStart(2, "0");
    const startMinutes = startDate.getMinutes().toString().padStart(2, "0");
    const endHours = endDate.getHours().toString().padStart(2, "0");
    const endMinutes = endDate.getMinutes().toString().padStart(2, "0");
    const rangeLabel = `${startHours}:${startMinutes} – ${endHours}:${endMinutes}`;
    const label = slot.employee_name ? `${rangeLabel} · ${slot.employee_name}` : rangeLabel;
    return { id, start: slot.slot_start, end: slot.slot_end, label, employeeId };
  });
}
