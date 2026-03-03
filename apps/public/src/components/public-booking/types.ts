import { translations, type AppLocale } from "@/i18n/translations";

export type PublicBookingPageProps = {
  slug: string;
};

export type Salon = {
  id: string;
  name: string;
  plan?: "starter" | "pro" | "business" | null;
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
    headerVariant?: "standard" | "compact";
  } | null;
};

export type PublicBrandingSource = "teqbook-default" | "salon-theme";

export type PublicBookingEffectiveBranding = {
  plan: "starter" | "pro" | "business";
  source: PublicBrandingSource;
  logoUrl: string;
  primaryColor: string;
  fontFamily: string;
  headerVariant: "standard" | "compact";
};

export type PublicBookingTokens = {
  colors: {
    primary: string;
    primaryHover: string;
    primaryText: string;
    surface: string;
    surface2: string;
    border: string;
    mutedText: string;
    successBg: string;
    successText: string;
    errorBg: string;
    errorText: string;
    warningBg: string;
    warningText: string;
  };
  typography: {
    fontFamily: string;
    fontSizeScale: {
      xs: string;
      sm: string;
      base: string;
      lg: string;
      xl: string;
    };
    fontWeight: {
      regular: number;
      medium: number;
      semibold: number;
    };
  };
  radius: {
    sm: string;
    md: string;
    lg: string;
  };
  shadow: {
    card: string;
    focus: string;
  };
  spacing: {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
  focusRing: {
    color: string;
    width: string;
  };
};

export type Service = {
  id: string;
  name: string;
  duration_minutes?: number | null;
  price_cents?: number | null;
  featured?: boolean | null;
};

export type Employee = {
  id: string;
  full_name: string;
};

export type Slot = {
  id: string;
  start: string;
  end: string;
  label: string;
  employeeId: string;
};

export type BookingMode = "book" | "waitlist";
export type SelectionStatus =
  | "loading"
  | "ready"
  | "missing_setup"
  | "no_active_services"
  | "no_active_employees"
  | "not_found"
  | "error";

export const ANY_EMPLOYEE_VALUE = "__any_employee__";

export type WaitlistEntrySource = "direct" | "no-slots";

export type WaitlistReceipt = {
  alreadyJoined: boolean;
  serviceName: string;
  formattedDate: string;
  maskedEmail: string | null;
  maskedPhone: string | null;
};

export type PublicBookingCopy = (typeof translations)[AppLocale]["publicBooking"];
