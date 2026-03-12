import type {
  AdminLoginMessages,
  AppLocale,
  BookingConfirmationMessages,
  Login2FAMessages,
  MarketingFooterMessages,
  MarketingLayoutMessages,
  MarketingNavMessages,
  MarketingPageMessages,
  NotFoundMessages,
} from "./translations";
import { copy as landingCopy } from "@/components/landing/landing-copy";

type PublicPageNamespaces = {
  marketingNav: MarketingNavMessages;
  marketingFooter: MarketingFooterMessages;
  marketingLayout: MarketingLayoutMessages;
  marketingPages: MarketingPageMessages;
  login2fa: Login2FAMessages;
  adminLogin: AdminLoginMessages;
  bookingConfirmation: BookingConfirmationMessages;
  notFoundPage: NotFoundMessages;
};

const enBase: PublicPageNamespaces = {
  marketingNav: {
    pricing: "Pricing",
    security: "Security",
    contact: "Contact",
    signup: "Sign up",
    login: "Log in",
    language: "Language",
    openMenu: "Open menu",
    closeMenu: "Close menu",
    primaryNavAria: "Primary navigation",
    mobileNavAria: "Mobile navigation menu",
  },
  marketingFooter: {
    pricing: "Pricing",
    security: "Security",
    contact: "Contact",
    privacy: "Privacy policy",
    terms: "Terms of service",
    tagline: "Helping salons stay organized, confident and fully booked globally.",
    navAria: "Footer navigation",
  },
  marketingLayout: {
    startFree: "Start free",
    contact: "Contact",
  },
  marketingPages: {
    pricing: {
      title: "Pricing | TeqBook",
      description:
        "Simple, transparent pricing for salons of all sizes. Start with Starter, upgrade anytime. No hidden fees.",
      heroTitle: "Choose your TeqBook plan",
      heroDescription:
        "Built for salons of all sizes. Start simple, then upgrade anytime.",
      heroBadge: "Affordable. Simple. Built for international salons.",
      whyProTitle: "Why salons choose Pro",
      whyProDescription: "Most salons start with Pro. Here is why.",
      fullComparisonTitle: "Full feature comparison",
      fullComparisonDescription: "See exactly what is included in each plan.",
      addonsTitle: "Add-ons",
      addonsDescription: "Build the TeqBook setup that fits your salon.",
      ctaTitle: "Spend less time managing. More time with clients.",
      ctaDescription:
        "TeqBook handles bookings, reminders and scheduling so you do not have to.",
      ctaPrimary: "Create your salon",
      ctaSecondary: "Book a demo",
      trustLine: "No credit card required.",
      startTrial: "Start free trial",
      feature: "Feature",
      bestFor: "Best for",
      teamSize: "Team size",
    },
    contact: {
      title: "Contact TeqBook",
      description:
        "Questions about plans, onboarding, or support? Send us a message and we will respond as soon as possible.",
      supportBadge: "TEQBOOK SUPPORT",
      intro:
        "Send us your message and we will follow up with practical next steps.",
      fullName: "Full name",
      fullNamePlaceholder: "Your full name",
      email: "Email address",
      emailPlaceholder: "you@salon.com",
      message: "Message",
      messagePlaceholder: "Tell us how we can help.",
      consent:
        "I consent to TeqBook storing my inquiry so the team can respond to my request.",
      sending: "Sending...",
      send: "Send message",
      supportInfoTitle: "Support information",
      supportInfoBody:
        "We usually reply within one business day. For urgent plan or onboarding questions, include your salon name in the message.",
      office: "Office",
      phone: "Phone",
      success: "Thanks! We will contact you shortly.",
      error: "Could not send your message right now.",
      networkError: "Network error. Please try again.",
    },
    security: {
      title: "Security and data protection",
      description:
        "Your salon data stays protected, private, and under your control.",
      technicalOverviewTitle: "Technical overview",
      technicalOverviewBody:
        "TeqBook runs on modern cloud infrastructure with strict data isolation between salons. Core services are monitored continuously, with backup and recovery controls designed to protect business continuity.",
      yourDataTitle: "Your data stays yours.",
      yourDataBody: "We never sell or share customer data.",
      contactSupport: "Contact support",
    },
    privacy: {
      title: "Privacy policy",
      description:
        "We are committed to handling salon and customer data responsibly.",
      effectiveDate: "Effective date: 25 February 2026",
      contact:
        "For privacy questions, rights requests, or complaints, contact support@teqbook.com.",
    },
    terms: {
      title: "Terms of service",
      description:
        "These terms explain the responsibilities and rights of TeqBook and its customers.",
      effectiveDate: "Effective date: 25 February 2026",
      acceptance:
        "By using TeqBook, you confirm that you have read and accepted these Terms of Service and the Privacy Policy.",
    },
  },
  login2fa: {
    title: "Two-factor authentication",
    description: "Enter the 6-digit code from your authenticator app",
    authCodeLabel: "Authentication code",
    placeholder: "000000",
    verify: "Verify",
    verifying: "Verifying...",
    backToLogin: "Back to login",
    missingFactorId: "Missing factor ID. Please try logging in again.",
    failedChallenge: "Failed to create 2FA challenge",
    enterCode: "Please enter the 6-digit code",
    invalidCode: "Invalid code. Please try again.",
    failedUser: "Failed to get user information",
    failedProfile: "Could not load user profile.",
  },
  adminLogin: {
    title: "Admin login",
    heading: "Welcome to Admin Panel",
    subtitle:
      "Manage salons, users and system settings. Authorized superadmins only.",
    bulletSalons: "Overview of all salons in the system",
    bulletUsers: "Manage users and access rights",
    bulletReports: "System analytics and reports",
    secureLine: "Secure access. Superadmins only.",
    cardTitle: "Admin log in",
    cardSubtitle: "Enter your admin credentials",
    emailLabel: "Email",
    passwordLabel: "Password",
    show: "Show",
    hide: "Hide",
    submit: "Log in as Admin",
    submitting: "Logging in...",
    secureFooter: "Secure login · TeqBook Admin Panel",
    missingCredentials: "Email and password are required.",
    invalidCredentials: "Invalid email or password.",
    confirmEmail: "Confirm your email address before logging in.",
    loginFailed: "Login failed. Please try again.",
    profileLoadFailed: "Could not load user profile.",
    profileMissing: "No profile found.",
    notSuperAdmin:
      "You do not have access to the admin panel. Only superadmins can log in here.",
    unknownError: "An unknown error occurred.",
  },
  bookingConfirmation: {
    loading: "Loading...",
    errorTitle: "Error",
    bookingNotFound: "Booking not found",
    backToBooking: "Back to booking",
    confirmedTitle: "Booking confirmed",
    cancelledTitle: "Booking cancelled",
    confirmedDescription: "Your booking has been confirmed successfully.",
    cancelledDescription: "Your booking has been cancelled.",
    reservationReceived: "Reservation received",
    reference: "Reference",
    service: "Service",
    servicePending: "Will be confirmed shortly",
    employee: "Employee",
    bestAvailable: "Best available",
    status: "Status",
    cancelBooking: "Cancel booking",
    bookAnother: "Book another",
    cancelReasonLabel: "Cancellation reason (optional)",
    cancelReasonPlaceholder: "Please let us know why you are cancelling...",
    keepBooking: "Keep booking",
    confirmCancellation: "Confirm cancellation",
    cancelling: "Cancelling...",
    changesViaWhatsapp: "Need to make changes? Contact us on WhatsApp",
    chatOnWhatsapp: "Chat on WhatsApp",
    loadBookingDetailsError: "Could not load booking details.",
    bookingFromAnotherSalonError: "Booking belongs to another salon.",
    cancelFailed: "Failed to cancel booking",
  },
  notFoundPage: {
    description: "This page could not be found. Here are some useful links:",
    navAria: "Relevant pages",
    home: "Home",
    productOverview: "Product overview",
    signup: "Sign up",
    login: "Log in",
  },
};

const nbOverrides: Partial<PublicPageNamespaces> = {
  marketingNav: {
    ...enBase.marketingNav,
    pricing: "Priser",
    security: "Sikkerhet",
    contact: "Kontakt",
    signup: "Opprett konto",
    login: "Logg inn",
    language: "Språk",
    openMenu: "Åpne meny",
    closeMenu: "Lukk meny",
  },
  marketingFooter: {
    ...enBase.marketingFooter,
    pricing: "Priser",
    security: "Sikkerhet",
    contact: "Kontakt",
    privacy: "Personvern",
    terms: "Vilkår",
    tagline:
      "Hjelper salonger å holde orden, trygghet og fulle kalendere globalt.",
  },
  marketingLayout: {
    startFree: "Start gratis",
    contact: "Kontakt",
  },
  login2fa: {
    ...enBase.login2fa,
    title: "Tofaktorautentisering",
    description: "Skriv inn 6-sifret kode fra autentiseringsappen din",
    authCodeLabel: "Autentiseringskode",
    verify: "Verifiser",
    verifying: "Verifiserer...",
    backToLogin: "Tilbake til innlogging",
    missingFactorId: "Mangler faktor-ID. Prøv å logge inn på nytt.",
    failedChallenge: "Kunne ikke opprette 2FA-utfordring",
    enterCode: "Skriv inn den 6-sifrede koden",
    invalidCode: "Ugyldig kode. Prøv igjen.",
    failedUser: "Kunne ikke hente brukerinformasjon",
    failedProfile: "Kunne ikke laste brukerprofil.",
  },
  adminLogin: {
    ...enBase.adminLogin,
    title: "Admin innlogging",
    heading: "Velkommen til Admin Panel",
    subtitle:
      "Administrer salonger, brukere og systeminnstillinger. Kun autoriserte superadministratorer.",
    bulletSalons: "Oversikt over alle salonger i systemet",
    bulletUsers: "Administrer brukere og tilganger",
    bulletReports: "Systemanalyser og rapporter",
    secureLine: "Sikker tilgang. Kun superadministratorer.",
    cardTitle: "Admin Logg Inn",
    cardSubtitle: "Skriv inn dine admin-legitimasjoner",
    emailLabel: "E-post",
    passwordLabel: "Passord",
    show: "Vis",
    hide: "Skjul",
    submit: "Logg inn som Admin",
    submitting: "Logger inn...",
    missingCredentials: "E-post og passord er påkrevd.",
    invalidCredentials: "Ugyldig e-post eller passord.",
    confirmEmail: "Bekreft e-postadressen din før du logger inn.",
    loginFailed: "Innlogging feilet. Prøv igjen.",
    profileLoadFailed: "Kunne ikke laste brukerprofil.",
    profileMissing: "Ingen profil funnet.",
    notSuperAdmin:
      "Du har ikke tilgang til admin-panelet. Kun superadmins kan logge inn her.",
    unknownError: "En ukjent feil oppstod.",
  },
  bookingConfirmation: {
    ...enBase.bookingConfirmation,
    loading: "Laster...",
    errorTitle: "Feil",
    bookingNotFound: "Fant ikke booking",
    backToBooking: "Tilbake til booking",
    confirmedTitle: "Booking bekreftet",
    cancelledTitle: "Booking avlyst",
    confirmedDescription: "Bookingen din er bekreftet.",
    cancelledDescription: "Bookingen din er avlyst.",
    reservationReceived: "Reservasjon mottatt",
    reference: "Referanse",
    service: "Tjeneste",
    servicePending: "Bekreftes snart",
    employee: "Ansatt",
    bestAvailable: "Best tilgjengelig",
    status: "Status",
    cancelBooking: "Avbestill booking",
    bookAnother: "Book en ny",
    cancelReasonLabel: "Avbestillingsårsak (valgfritt)",
    cancelReasonPlaceholder: "Fortell oss hvorfor du avbestiller...",
    keepBooking: "Behold booking",
    confirmCancellation: "Bekreft avbestilling",
    cancelling: "Avbestiller...",
    changesViaWhatsapp: "Trenger du endringer? Kontakt oss på WhatsApp",
    chatOnWhatsapp: "Chat på WhatsApp",
    loadBookingDetailsError: "Kunne ikke laste bookingdetaljer.",
    bookingFromAnotherSalonError: "Bookingen tilhører en annen salong.",
    cancelFailed: "Kunne ikke avbestille booking",
  },
  notFoundPage: {
    ...enBase.notFoundPage,
    description: "Siden finnes ikke. Her er noen nyttige lenker:",
    navAria: "Relevante sider",
    home: "Hjem",
    productOverview: "Produktoversikt",
    signup: "Opprett konto",
    login: "Logg inn",
  },
};

const arOverrides: Partial<PublicPageNamespaces> = {
  marketingNav: {
    ...enBase.marketingNav,
    pricing: "الأسعار",
    security: "الأمان",
    contact: "اتصل بنا",
    signup: "إنشاء حساب",
    login: "تسجيل الدخول",
    language: "اللغة",
    openMenu: "فتح القائمة",
    closeMenu: "إغلاق القائمة",
  },
  marketingFooter: {
    ...enBase.marketingFooter,
    pricing: "الأسعار",
    security: "الأمان",
    contact: "اتصل بنا",
    privacy: "سياسة الخصوصية",
    terms: "شروط الخدمة",
  },
  marketingLayout: {
    startFree: "ابدأ مجانًا",
    contact: "اتصل بنا",
  },
};

const faOverrides: Partial<PublicPageNamespaces> = {
  marketingNav: {
    ...enBase.marketingNav,
    pricing: "قیمت‌ها",
    security: "امنیت",
    contact: "تماس",
    signup: "ایجاد حساب",
    login: "ورود",
    language: "زبان",
    openMenu: "باز کردن منو",
    closeMenu: "بستن منو",
  },
  marketingFooter: {
    ...enBase.marketingFooter,
    pricing: "قیمت‌ها",
    security: "امنیت",
    contact: "تماس",
    privacy: "حریم خصوصی",
    terms: "شرایط استفاده",
  },
  marketingLayout: {
    startFree: "شروع رایگان",
    contact: "تماس",
  },
};

const urOverrides: Partial<PublicPageNamespaces> = {
  marketingNav: {
    ...enBase.marketingNav,
    pricing: "قیمتیں",
    security: "سیکیورٹی",
    contact: "رابطہ",
    signup: "اکاؤنٹ بنائیں",
    login: "لاگ اِن",
    language: "زبان",
    openMenu: "مینو کھولیں",
    closeMenu: "مینو بند کریں",
  },
  marketingFooter: {
    ...enBase.marketingFooter,
    pricing: "قیمتیں",
    security: "سیکیورٹی",
    contact: "رابطہ",
    privacy: "پرائیویسی پالیسی",
    terms: "سروس کی شرائط",
  },
  marketingLayout: {
    startFree: "مفت شروع کریں",
    contact: "رابطہ",
  },
};

function withOverrides(
  base: PublicPageNamespaces,
  overrides: Partial<PublicPageNamespaces>,
): PublicPageNamespaces {
  return {
    marketingNav: overrides.marketingNav ?? base.marketingNav,
    marketingFooter: overrides.marketingFooter ?? base.marketingFooter,
    marketingLayout: overrides.marketingLayout ?? base.marketingLayout,
    marketingPages: overrides.marketingPages ?? base.marketingPages,
    login2fa: overrides.login2fa ?? base.login2fa,
    adminLogin: overrides.adminLogin ?? base.adminLogin,
    bookingConfirmation: overrides.bookingConfirmation ?? base.bookingConfirmation,
    notFoundPage: overrides.notFoundPage ?? base.notFoundPage,
  };
}

function localizedPricing(locale: AppLocale): MarketingPageMessages["pricing"] {
  const landing = landingCopy[locale];
  return {
    ...enBase.marketingPages.pricing,
    heroTitle: landing.pricingTitle,
    heroDescription: landing.pricingSubtitle,
    heroBadge: landing.affordableSimple,
    addonsTitle: landing.addOnsTitle,
    addonsDescription: landing.addOnsDescription,
    startTrial: landing.startFreeTrial,
    ctaPrimary: landing.signUpButton,
    ctaSecondary: landing.ctaSecondary,
  };
}

function withLocalizedPricing(locale: AppLocale, overrides: Partial<PublicPageNamespaces>) {
  return withOverrides(enBase, {
    ...overrides,
    marketingPages: {
      ...(overrides.marketingPages ?? enBase.marketingPages),
      pricing: localizedPricing(locale),
    },
  });
}

export const publicPageTranslations: Record<AppLocale, PublicPageNamespaces> = {
  en: withLocalizedPricing("en", {}),
  nb: withLocalizedPricing("nb", nbOverrides),
  ar: withLocalizedPricing("ar", arOverrides),
  so: withLocalizedPricing("so", {}),
  ti: withLocalizedPricing("ti", {}),
  am: withLocalizedPricing("am", {}),
  tr: withLocalizedPricing("tr", {}),
  pl: withLocalizedPricing("pl", {}),
  vi: withLocalizedPricing("vi", {}),
  zh: withLocalizedPricing("zh", {}),
  tl: withLocalizedPricing("tl", {}),
  fa: withLocalizedPricing("fa", faOverrides),
  dar: withLocalizedPricing("dar", {}),
  ur: withLocalizedPricing("ur", urOverrides),
  hi: withLocalizedPricing("hi", {}),
};

export function getPublicPageTranslations(locale: AppLocale): PublicPageNamespaces {
  const value = publicPageTranslations[locale];
  if (!value) {
    throw new Error(`Missing public-page translations for locale "${locale}"`);
  }
  return value;
}
