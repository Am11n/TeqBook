import { cache } from "react";
import { getAdminClient } from "@/lib/supabase/admin";
import { buildPublicBookingTokens, computeEffectiveBranding } from "@/components/public-booking/publicBookingUtils";
import type { PublicBookingTokens, Salon as BookingSalon } from "@/components/public-booking/types";

type PublicService = {
  id: string;
  name: string;
  durationMinutes: number | null;
  priceCents: number | null;
};

type PublicTeamMember = {
  id: string;
  name: string;
  title: string | null;
  imageUrl: string | null;
  bio: string | null;
  specialties: string[];
  languages: string[];
  ratingAverage: number | null;
  services: PublicService[];
};

type OpeningHourView = {
  dayOfWeek: number;
  isClosed: boolean;
  openTime: string | null;
  closeTime: string | null;
};

type ProfileHero = {
  name: string;
  coverImageUrl: string | null;
  logoUrl: string | null;
  addressLine: string | null;
  city: string | null;
  ratingAverage: number | null;
  ratingCount: number;
  isOpenNow: boolean | null;
  openStatusLabel: string | null;
};

export type PublicSalonProfileViewModel = {
  hero: ProfileHero;
  about: {
    description: string;
  };
  servicesPreview: PublicService[];
  teamPreview: PublicTeamMember[];
  portfolioPreview: Array<{
    id: string;
    imageUrl: string;
    caption: string | null;
  }>;
  reviewsSummary: {
    ratingAverage: number;
    ratingCount: number;
    latest: Array<{
      id: string;
      customerName: string;
      rating: number;
      comment: string | null;
      createdAt: string;
    }>;
  } | null;
  openingHours: OpeningHourView[];
  mapLink: string | null;
  bookUrl: string;
  shareUrl: string;
  socialLinks: {
    instagramUrl: string | null;
    websiteUrl: string | null;
  };
  timezone: string;
  tokens: PublicBookingTokens;
  salonId: string;
  slug: string;
};

const FALLBACK_TIMEZONE = "Europe/Oslo";

function getNowInTimezoneParts(timezone: string): { weekday: number; hhmm: string } | null {
  try {
    const formatter = new Intl.DateTimeFormat("en-GB", {
      weekday: "short",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
      timeZone: timezone,
    });
    const parts = formatter.formatToParts(new Date());
    const weekdayToken = parts.find((part) => part.type === "weekday")?.value || "";
    const hour = parts.find((part) => part.type === "hour")?.value || "00";
    const minute = parts.find((part) => part.type === "minute")?.value || "00";
    const weekdayMap: Record<string, number> = {
      Mon: 0,
      Tue: 1,
      Wed: 2,
      Thu: 3,
      Fri: 4,
      Sat: 5,
      Sun: 6,
    };
    const weekday = weekdayMap[weekdayToken];
    if (typeof weekday !== "number") return null;
    return { weekday, hhmm: `${hour}:${minute}` };
  } catch {
    return null;
  }
}

function isOpenNow(openingHours: OpeningHourView[], timezone: string): { isOpenNow: boolean | null; label: string | null } {
  if (!openingHours.length) return { isOpenNow: null, label: null };
  const now = getNowInTimezoneParts(timezone);
  if (!now) return { isOpenNow: null, label: null };

  const todayHours = openingHours.find((item) => item.dayOfWeek === now.weekday);
  if (!todayHours || todayHours.isClosed || !todayHours.openTime || !todayHours.closeTime) {
    return { isOpenNow: null, label: null };
  }

  const open = now.hhmm >= todayHours.openTime && now.hhmm < todayHours.closeTime;
  if (!open) return { isOpenNow: false, label: "Closed now" };
  return { isOpenNow: true, label: `Open until ${todayHours.closeTime}` };
}

function getCityFromAddress(address: string | null): string | null {
  if (!address) return null;
  const segments = address.split(",").map((segment) => segment.trim()).filter(Boolean);
  if (!segments.length) return null;
  return segments[segments.length - 1] || null;
}

function buildAboutFallback(salonType: string | null, city: string | null, salonName: string): string {
  const typeLabel = salonType?.trim() ? salonType : "salon";
  if (city) return `${salonName} is a professional ${typeLabel} in ${city}. Book your next appointment online.`;
  return `${salonName} is a professional ${typeLabel}. Book your next appointment online.`;
}

type ProfileFetchResult =
  | { kind: "not_found" }
  | { kind: "ok"; data: PublicSalonProfileViewModel };

export const getPublicSalonProfileBySlug = cache(async (slug: string): Promise<ProfileFetchResult> => {
  const normalizedSlug = slug.trim().toLowerCase();
  if (!normalizedSlug) return { kind: "not_found" };

  const supabase = getAdminClient();
  const { data: salon, error: salonError } = await supabase
    .from("salons")
    .select(
      "id, name, slug, is_public, salon_type, business_address, timezone, preferred_language, supported_languages, default_language, whatsapp_number, plan, theme, theme_pack_id, theme_pack_version, theme_pack_hash, theme_pack_snapshot, theme_overrides"
    )
    .eq("slug", normalizedSlug)
    .eq("is_public", true)
    .maybeSingle();

  if (salonError || !salon) return { kind: "not_found" };

  const timezone = salon.timezone || FALLBACK_TIMEZONE;

  const [{ data: servicesData }, { data: employeesData }, { data: openingHoursData }, { data: employeeServicesData }] =
    await Promise.all([
      supabase
        .from("services")
        .select("id, name, duration_minutes, price_cents, is_active, sort_order")
        .eq("salon_id", salon.id)
        .eq("is_active", true)
        .order("sort_order", { ascending: true, nullsFirst: false })
        .order("name", { ascending: true })
        .limit(1000),
      supabase
        .from("employees")
        .select("id, full_name, role, preferred_language, is_active, deleted_at")
        .eq("salon_id", salon.id)
        .eq("is_active", true)
        .is("deleted_at", null)
        .order("created_at", { ascending: true })
        .limit(1000),
      supabase
        .from("opening_hours")
        .select("day_of_week, is_closed, open_time, close_time")
        .eq("salon_id", salon.id)
        .order("day_of_week", { ascending: true })
        .limit(14),
      supabase
        .from("employee_services")
        .select("employee_id, service_id")
        .eq("salon_id", salon.id)
        .limit(2000),
    ]);

  const allServices: PublicService[] = (servicesData || []).map((service) => ({
    id: service.id,
    name: service.name,
    durationMinutes: service.duration_minutes ?? null,
    priceCents: service.price_cents ?? null,
  }));
  const servicesById = new Map(allServices.map((service) => [service.id, service]));

  const serviceIdsByEmployee = (employeeServicesData || []).reduce<Record<string, string[]>>((acc, row) => {
    const employeeId = String(row.employee_id || "");
    const serviceId = String(row.service_id || "");
    if (!employeeId || !serviceId) return acc;
    if (!acc[employeeId]) acc[employeeId] = [];
    acc[employeeId].push(serviceId);
    return acc;
  }, {});

  const teamPreview: PublicTeamMember[] = (employeesData || [])
    .slice(0, 6)
    .map((employee) => {
      const assignedServices = (serviceIdsByEmployee[employee.id] || [])
        .map((serviceId) => servicesById.get(serviceId))
        .filter((service): service is PublicService => Boolean(service))
        .slice(0, 12);
      const specialties = assignedServices.slice(0, 2).map((service) => service.name);
      const language = employee.preferred_language?.trim();
      return {
        id: employee.id,
        name: employee.full_name,
        title: employee.role || null,
        imageUrl: null,
        bio: null,
        specialties,
        languages: language ? [language] : [],
        ratingAverage: null,
        services: assignedServices,
      };
    });

  const openingHours: OpeningHourView[] = (openingHoursData || []).map((entry) => ({
    dayOfWeek: entry.day_of_week,
    isClosed: Boolean(entry.is_closed),
    openTime: entry.is_closed ? null : entry.open_time || null,
    closeTime: entry.is_closed ? null : entry.close_time || null,
  }));

  const city = getCityFromAddress(salon.business_address || null);
  const aboutDescription = buildAboutFallback(salon.salon_type || null, city, salon.name);
  const openStatus = isOpenNow(openingHours, timezone);
  const bookingSalon: BookingSalon = {
    id: salon.id,
    name: salon.name,
    plan: (salon.plan as "starter" | "pro" | "business" | null) || "starter",
    whatsapp_number: salon.whatsapp_number || null,
    supported_languages: salon.supported_languages || null,
    default_language: salon.default_language || null,
    preferred_language: salon.preferred_language || null,
    timezone,
    theme: salon.theme || null,
    theme_pack_id: salon.theme_pack_id || null,
    theme_pack_version: salon.theme_pack_version || null,
    theme_pack_hash: salon.theme_pack_hash || null,
    theme_pack_snapshot: salon.theme_pack_snapshot || null,
    theme_overrides: salon.theme_overrides || null,
  };
  const effectiveBranding = computeEffectiveBranding(bookingSalon);
  const tokens = buildPublicBookingTokens(effectiveBranding);

  const origin =
    process.env.NEXT_PUBLIC_APP_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "https://teqbook.com");
  const safeOrigin = origin.replace(/\/$/, "");
  const shareUrl = `${safeOrigin}/salon/${salon.slug}`;
  const bookUrl = `${safeOrigin}/book/${salon.slug}`;
  const mapLink = salon.business_address
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(salon.business_address)}`
    : null;

  return {
    kind: "ok",
    data: {
      hero: {
        name: salon.name,
        coverImageUrl: null,
        logoUrl: effectiveBranding.logoUrl || null,
        addressLine: salon.business_address || null,
        city,
        ratingAverage: null,
        ratingCount: 0,
        isOpenNow: openStatus.isOpenNow,
        openStatusLabel: openStatus.label,
      },
      about: {
        description: aboutDescription,
      },
      servicesPreview: allServices.slice(0, 6),
      teamPreview,
      portfolioPreview: [],
      reviewsSummary: null,
      openingHours,
      mapLink,
      bookUrl,
      shareUrl,
      socialLinks: {
        instagramUrl: null,
        websiteUrl: null,
      },
      timezone,
      tokens,
      salonId: salon.id,
      slug: salon.slug,
    },
  };
});
