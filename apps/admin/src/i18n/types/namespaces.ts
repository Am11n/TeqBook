import type {
  PublicBookingMessages,
  LoginMessages,
  SignUpMessages,
  OnboardingMessages,
} from "./message-types-1";
import type {
  DashboardMessages,
  HomeMessages,
  CalendarMessages,
  EmployeesMessages,
  ServicesMessages,
  CustomersMessages,
} from "./message-types-2";
import type {
  BookingsMessages,
  ShiftsMessages,
  SettingsMessages,
  AdminMessages,
  ProductsMessages,
  NotificationsMessages,
} from "./message-types-3";

export type {
  PublicBookingMessages,
  LoginMessages,
  SignUpMessages,
  OnboardingMessages,
} from "./message-types-1";
export type {
  DashboardMessages,
  HomeMessages,
  CalendarMessages,
  EmployeesMessages,
  ServicesMessages,
  CustomersMessages,
} from "./message-types-2";
export type {
  BookingsMessages,
  ShiftsMessages,
  SettingsMessages,
  AdminMessages,
  ProductsMessages,
  NotificationsMessages,
} from "./message-types-3";

export type TranslationNamespaces = {
  publicBooking: PublicBookingMessages;
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
