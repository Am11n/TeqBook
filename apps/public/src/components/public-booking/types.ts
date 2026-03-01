import { translations, type AppLocale } from "@/i18n/translations";

export type PublicBookingPageProps = {
  slug: string;
};

export type Salon = {
  id: string;
  name: string;
  whatsapp_number?: string | null;
  supported_languages?: string[] | null;
  default_language?: string | null;
  preferred_language?: string | null;
  timezone?: string | null;
  theme?: {
    primary?: string;
    secondary?: string;
    font?: string;
    logo_url?: string;
  } | null;
};

export type Service = {
  id: string;
  name: string;
};

export type Employee = {
  id: string;
  full_name: string;
};

export type Slot = {
  start: string;
  end: string;
  label: string;
};

export type BookingMode = "book" | "waitlist";

export type WaitlistEntrySource = "direct" | "no-slots";

export type WaitlistReceipt = {
  alreadyJoined: boolean;
  serviceName: string;
  formattedDate: string;
  maskedEmail: string | null;
  maskedPhone: string | null;
};

export type PublicBookingCopy = (typeof translations)[AppLocale]["publicBooking"];
