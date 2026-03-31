import type { PublicBookingMessages, LoginMessages, SignUpMessages, OnboardingMessages } from './auth-booking';
import type { DashboardMessages, HomeMessages, CalendarMessages } from './dashboard-core';
import type { EmployeesMessages, ServicesMessages } from './employees-services';
import type { CustomersMessages, BookingsMessages } from './customers-bookings';
import type { ShiftsMessages, PersonallisteMessages } from './shifts-personalliste';
import type { SettingsMessages, AdminMessages } from './settings-admin';
import type { ProductsMessages, NotificationsMessages, FeatureGateMessages } from './misc';
import type { RepoErrorsMessages } from './repo-errors';

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
  personalliste: PersonallisteMessages;
  settings: SettingsMessages;
  admin: AdminMessages;
  products: ProductsMessages;
  notifications: NotificationsMessages;
  featureGate: FeatureGateMessages;
  repoErrors: RepoErrorsMessages;
};


export type { PublicBookingMessages, LoginMessages, SignUpMessages, OnboardingMessages, DashboardMessages, HomeMessages, CalendarMessages, EmployeesMessages, ServicesMessages, CustomersMessages, BookingsMessages, ShiftsMessages, PersonallisteMessages, SettingsMessages, AdminMessages, ProductsMessages, NotificationsMessages, FeatureGateMessages, RepoErrorsMessages };
