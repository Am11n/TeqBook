import type { PublicBookingMessages } from "./public-booking";
import type { MarketingNavMessages, MarketingFooterMessages, MarketingLayoutMessages, MarketingPageMessages } from "./marketing";
import type {
  Login2FAMessages,
  AdminLoginMessages,
  BookingConfirmationMessages,
  NotFoundMessages,
} from "./login-and-marketing-pages";
import type { LoginMessages, SignUpMessages, OnboardingMessages } from "./auth-forms";
import type { DashboardMessages, HomeMessages } from "./dashboard-home";
import type {
  CalendarMessages,
  EmployeesMessages,
  ServicesMessages,
  CustomersMessages,
  BookingsMessages,
  ShiftsMessages,
} from "./entity-pages";
import type {
  SettingsMessages,
  AdminMessages,
  ProductsMessages,
  NotificationsMessages,
} from "./settings-admin-notifications";

export type TranslationNamespaces = {
  publicBooking: PublicBookingMessages;
  marketingNav?: MarketingNavMessages;
  marketingFooter?: MarketingFooterMessages;
  marketingLayout?: MarketingLayoutMessages;
  marketingPages?: MarketingPageMessages;
  login2fa?: Login2FAMessages;
  adminLogin?: AdminLoginMessages;
  bookingConfirmation?: BookingConfirmationMessages;
  notFoundPage?: NotFoundMessages;
  login: LoginMessages;
  signup: SignUpMessages;
  onboarding: OnboardingMessages;
  dashboard: DashboardMessages;
  home: HomeMessages;
  calendar: CalendarMessages;
  employees: EmployeesMessages;
  services: ServicesMessages;
  customers: CustomersMessages;
  bookings: BookingsMessages;
  shifts: ShiftsMessages;
  settings: SettingsMessages;
  admin: AdminMessages;
  products: ProductsMessages;
  notifications: NotificationsMessages;
};
