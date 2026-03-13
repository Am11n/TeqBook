export type Locale =
  | "nb"
  | "en"
  | "ar"
  | "so"
  | "ti"
  | "am"
  | "tr"
  | "pl"
  | "vi"
  | "zh"
  | "tl"
  | "fa"
  | "dar"
  | "ur"
  | "hi";

export type LandingCopyEntry = {
  brand: string;
  heroTitle: string;
  heroSubtitle: string;
  ctaPrimary: string;
  ctaSecondary: string;
  badge: string;
  pricingTitle: string;
  pricingSubtitle: string;
  affordableSimple: string;
  startFreeTrial: string;
  addOnsTitle: string;
  newBooking: string;
  exampleCustomerName: string;
  exampleService: string;
  exampleDate: string;
  today: string;
  bookingsCount: string;
  cutService: string;
  signUpButton: string;
  logInButton: string;
  addOnsDescription: string;
  multilingualBookingTitle: string;
  multilingualBookingDescription: string;
  extraStaffTitle: string;
  extraStaffDescription: string;
  tiers: {
    id: string;
    name: string;
    price: string;
    description: string;
    features: string[];
    highlighted?: boolean;
    badge?: string;
  }[];
  stats: { title: string; body: string }[];
  faqTitle: string;
  faq: { q: string; a: string }[];
};
