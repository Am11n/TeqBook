import type { AppLocale } from "@/i18n/translations";
import type { PublicBookingEffectiveBranding, PublicBookingTokens, Salon, Slot } from "./types";

type RawAvailableSlot = {
  slot_start: string;
  slot_end: string;
  employee_id?: string;
  employee_name?: string;
};

const TEQBOOK_PRIMARY = "#6d5efc";
const TEQBOOK_FONT = "Inter, system-ui, -apple-system, Segoe UI, sans-serif";
const TEQBOOK_LOGO = "/Favikon.svg";
const TEQBOOK_HEADER_VARIANT = "standard" as const;
const PRIMARY_TEXT_LIGHT = "#ffffff";
const PRIMARY_TEXT_DARK = "#101828";

type Rgb = { r: number; g: number; b: number };

function normalizeHexColor(input?: string | null): string | null {
  if (!input) return null;
  const trimmed = input.trim();
  const fullHex = /^#([a-fA-F0-9]{6})$/;
  const shortHex = /^#([a-fA-F0-9]{3})$/;

  if (fullHex.test(trimmed)) return trimmed.toLowerCase();

  const shortMatch = trimmed.match(shortHex);
  if (!shortMatch) return null;
  const [r, g, b] = shortMatch[1].split("");
  return `#${r}${r}${g}${g}${b}${b}`.toLowerCase();
}

function hexToRgb(hex: string): Rgb {
  return {
    r: Number.parseInt(hex.slice(1, 3), 16),
    g: Number.parseInt(hex.slice(3, 5), 16),
    b: Number.parseInt(hex.slice(5, 7), 16),
  };
}

function rgba(hex: string, alpha: number): string {
  const rgb = hexToRgb(hex);
  return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha})`;
}

function channelToLinear(channel: number): number {
  const value = channel / 255;
  return value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
}

function luminance(hex: string): number {
  const { r, g, b } = hexToRgb(hex);
  const [lr, lg, lb] = [channelToLinear(r), channelToLinear(g), channelToLinear(b)];
  return (0.2126 * lr) + (0.7152 * lg) + (0.0722 * lb);
}

function contrastRatio(a: string, b: string): number {
  const light = Math.max(luminance(a), luminance(b));
  const dark = Math.min(luminance(a), luminance(b));
  return (light + 0.05) / (dark + 0.05);
}

function mix(hex: string, baseHex: string, weight: number): string {
  const rgb = hexToRgb(hex);
  const base = hexToRgb(baseHex);
  const ratio = Math.max(0, Math.min(1, weight));
  const mixChannel = (a: number, b: number) => Math.round((a * (1 - ratio)) + (b * ratio));

  const toHex = (value: number) => value.toString(16).padStart(2, "0");
  return `#${toHex(mixChannel(rgb.r, base.r))}${toHex(mixChannel(rgb.g, base.g))}${toHex(mixChannel(rgb.b, base.b))}`;
}

function darken(hex: string, amount = 0.12): string {
  return mix(hex, "#000000", amount);
}

function pickPrimaryTextColor(primaryHex: string): string {
  const lightContrast = contrastRatio(primaryHex, PRIMARY_TEXT_LIGHT);
  const darkContrast = contrastRatio(primaryHex, PRIMARY_TEXT_DARK);
  return lightContrast >= darkContrast ? PRIMARY_TEXT_LIGHT : PRIMARY_TEXT_DARK;
}

function isAccessiblePrimary(primaryHex: string, surfaceHex: string): boolean {
  const primaryText = pickPrimaryTextColor(primaryHex);
  const contrastWithText = contrastRatio(primaryHex, primaryText);
  const contrastWithSurface = contrastRatio(primaryHex, surfaceHex);
  return contrastWithText >= 4.5 && contrastWithSurface >= 3;
}

function resolvePlan(plan?: Salon["plan"]): "starter" | "pro" | "business" {
  if (plan === "pro" || plan === "business") return plan;
  return "starter";
}

export function computeEffectiveBranding(salon: Salon): PublicBookingEffectiveBranding {
  const plan = resolvePlan(salon.plan);

  if (plan === "starter") {
    return {
      plan,
      source: "teqbook-default",
      logoUrl: TEQBOOK_LOGO,
      primaryColor: TEQBOOK_PRIMARY,
      fontFamily: TEQBOOK_FONT,
      headerVariant: TEQBOOK_HEADER_VARIANT,
    };
  }

  const theme = salon.theme ?? null;
  const maybePrimary = normalizeHexColor(theme?.primary ?? null);
  const primaryColor = maybePrimary && isAccessiblePrimary(maybePrimary, "#ffffff")
    ? maybePrimary
    : TEQBOOK_PRIMARY;

  const logoUrl = theme?.logo_url?.trim() || TEQBOOK_LOGO;
  const fontFamily = theme?.font?.trim() || TEQBOOK_FONT;
  const headerVariant = theme?.headerVariant === "compact" ? "compact" : TEQBOOK_HEADER_VARIANT;

  const hasMissingBranding = !theme?.logo_url || !theme?.primary || !theme?.font;
  const wasColorAdjusted = primaryColor !== maybePrimary;

  if (process.env.NODE_ENV !== "production" && (hasMissingBranding || wasColorAdjusted)) {
    const reasons: string[] = [];
    if (hasMissingBranding) reasons.push("missing_logo_or_primary_or_font");
    if (wasColorAdjusted) reasons.push("inaccessible_primary_fallback");
    console.warn(`[public-booking] Pro/Business branding fallback for salon "${salon.id}" (${reasons.join(", ")}).`);
  }

  return {
    plan,
    source: "salon-theme",
    logoUrl,
    primaryColor,
    fontFamily,
    headerVariant,
  };
}

export function buildPublicBookingTokens(branding: PublicBookingEffectiveBranding): PublicBookingTokens {
  const primary = branding.primaryColor;
  const primaryText = pickPrimaryTextColor(primary);
  const primaryHover = darken(primary, 0.14);
  const focusColor = rgba(primary, 0.35);

  return {
    colors: {
      primary,
      primaryHover,
      primaryText,
      surface: "#ffffff",
      surface2: "#f7f8fc",
      border: "#e3e6ef",
      mutedText: "#667085",
      successBg: "#ecfdf3",
      successText: "#0f6b3d",
      errorBg: "#fef3f2",
      errorText: "#b42318",
      warningBg: "#fffaeb",
      warningText: "#b54708",
    },
    typography: {
      fontFamily: branding.fontFamily,
      fontSizeScale: {
        xs: "0.75rem",
        sm: "0.875rem",
        base: "1rem",
        lg: "1.125rem",
        xl: "1.5rem",
      },
      fontWeight: {
        regular: 400,
        medium: 500,
        semibold: 600,
      },
    },
    radius: {
      sm: "0.5rem",
      md: "0.75rem",
      lg: "1rem",
    },
    shadow: {
      card: "0 8px 24px rgba(16,24,40,0.06)",
      focus: `0 0 0 3px ${focusColor}`,
    },
    spacing: {
      xs: "0.25rem",
      sm: "0.5rem",
      md: "0.75rem",
      lg: "1rem",
      xl: "1.5rem",
    },
    focusRing: {
      color: focusColor,
      width: "3px",
    },
  };
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
