export type AppLocale =
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

export type PublicBookingMessages = {
  notFound: string;
  loadError: string;
  loadingSalon: string;
  headerSubtitle: string;
  payInSalonBadge: string;
  step1Title: string;
  step1Description: string;
  serviceLabel: string;
  servicePlaceholder: string;
  employeeLabel: string;
  employeePlaceholder: string;
  dateLabel: string;
  loadSlots: string;
  loadingSlots: string;
  step2Label: string;
  noSlotsYet: string;
  selectSlotPlaceholder: string;
  step3Title: string;
  step3Description: string;
  nameLabel: string;
  emailLabel: string;
  emailPlaceholder: string;
  phoneLabel: string;
  phonePlaceholder: string;
  submitSaving: string;
  submitLabel: string;
  payInfo: string;
  successMessage: string;
  createError: string;
  unavailableTitle: string;
  unavailableDescription: string;
};

export type LoginMessages = {
  title: string;
  description: string;
  emailLabel: string;
  emailPlaceholder: string;
  passwordLabel: string;
  passwordPlaceholder: string;
  loginError: string;
  loggingIn: string;
  loginButton: string;
  tip: string;
};

export type SignUpMessages = {
  title: string;
  description: string;
  confirmPasswordLabel: string;
  confirmPasswordPlaceholder: string;
  signupButton: string;
  signingUp: string;
  signupError: string;
  alreadyHaveAccount: string;
  loginLink: string;
  passwordMismatch: string;
};

export type OnboardingMessages = {
  title: string;
  description: string;
  footerHint: string;
  // Step 1: Grunninfo
  step1Title: string;
  step1Description: string;
  nameLabel: string;
  namePlaceholder: string;
  salonTypeLabel: string;
  salonTypeBarber: string;
  salonTypeNails: string;
  salonTypeMassage: string;
  salonTypeOther: string;
  paymentMethodLabel: string;
  paymentMethodPhysicalOnly: string;
  preferredLanguageLabel: string;
  nextButton: string;
  // Step 2: Åpningstider
  step2Title: string;
  step2Description: string;
  openingHoursLabel: string;
  openingHoursDescription: string;
  dayLabel: string;
  closedLabel: string;
  openLabel: string;
  fromLabel: string;
  toLabel: string;
  monday: string;
  tuesday: string;
  wednesday: string;
  thursday: string;
  friday: string;
  saturday: string;
  sunday: string;
  onlineBookingLabel: string;
  onlineBookingYes: string;
  onlineBookingNo: string;
  publicBookingLabel: string;
  publicBookingYes: string;
  publicBookingNo: string;
  backButton: string;
  // Step 3: Bekreft
  step3Title: string;
  step3Description: string;
  summaryLabel: string;
  summarySalonName: string;
  summarySalonType: string;
  summaryPaymentMethod: string;
  summaryPreferredLanguage: string;
  summaryOpeningHours: string;
  summaryOnlineBooking: string;
  summaryPublicBooking: string;
  createError: string;
  saving: string;
  createButton: string;
  // Legacy fields (for backward compatibility)
  saveButton: string;
  step1: string;
  step2: string;
  step3: string;
};

export type DashboardMessages = {
  brandSubtitle: string;
  overview: string;
  calendar: string;
  employees: string;
  services: string;
  shifts: string;
  customers: string;
  bookings: string;
  onboarding: string;
  tagline: string;
  builtFor: string;
  openNav: string;
  menu: string;
  closeNav: string;
  dashboardTitle: string;
  login: string;
  logout: string;
  langLabel: string;
};

export type HomeMessages = {
  title: string;
  description: string;
  nextStepTitle: string;
  nextStepDescription: string;
  nextStepBodyTitle: string;
  nextStepBodyText: string;
  onboardingTitle: string;
  onboardingDescription: string;
  onboardingBodyTitle: string;
  onboardingBodyText: string;
  bookingTitle: string;
  bookingDescription: string;
  bookingBodyTitle: string;
  bookingBodyText: string;
};

export type CalendarMessages = {
  title: string;
  description: string;
  mustBeLoggedIn: string;
  noSalon: string;
  loadError: string;
  selectedDayLabel: string;
  viewDay: string;
  viewWeek: string;
  filterEmployeeLabel: string;
  filterEmployeeAll: string;
  prev: string;
  today: string;
  next: string;
  loading: string;
  noEmployeesTitle: string;
  noEmployeesDescription: string;
  noBookingsTitle: string;
  noBookingsDescription: string;
  unknownService: string;
  unknownCustomer: string;
};

export type EmployeesMessages = {
  title: string;
  description: string;
  mustBeLoggedIn: string;
  noSalon: string;
  addError: string;
  newEmployee: string;
  nameLabel: string;
  emailLabel: string;
  phoneLabel: string;
  roleLabel: string;
  rolePlaceholder: string;
  preferredLanguageLabel: string;
  servicesLabel: string;
  servicesPlaceholder: string;
  namePlaceholder: string;
  emailPlaceholder: string;
  phonePlaceholder: string;
  loading: string;
  emptyTitle: string;
  emptyDescription: string;
  tableTitle: string;
  colName: string;
  colRole: string;
  colContact: string;
  colServices: string;
  colStatus: string;
  colActions: string;
  active: string;
  inactive: string;
  delete: string;
  addButton: string;
  updateError: string;
};

export type ServicesMessages = {
  title: string;
  description: string;
  mustBeLoggedIn: string;
  noSalon: string;
  addError: string;
  updateError: string;
  newService: string;
  nameLabel: string;
  namePlaceholder: string;
  categoryLabel: string;
  categoryCut: string;
  categoryBeard: string;
  categoryColor: string;
  categoryNails: string;
  categoryMassage: string;
  categoryOther: string;
  durationLabel: string;
  priceLabel: string;
  sortOrderLabel: string;
  loading: string;
  emptyTitle: string;
  emptyDescription: string;
  tableTitle: string;
  colName: string;
  colCategory: string;
  colDuration: string;
  colPrice: string;
  colStatus: string;
  colActions: string;
  active: string;
  inactive: string;
  delete: string;
};

export type CustomersMessages = {
  title: string;
  description: string;
  mustBeLoggedIn: string;
  noSalon: string;
  loadError: string;
  addError: string;
  newCustomer: string;
  nameLabel: string;
  namePlaceholder: string;
  emailLabel: string;
  emailPlaceholder: string;
  phoneLabel: string;
  phonePlaceholder: string;
  notesLabel: string;
  notesPlaceholder: string;
  gdprLabel: string;
  saving: string;
  addButton: string;
  tableTitle: string;
  loading: string;
  emptyTitle: string;
  emptyDescription: string;
  mobileConsentYes: string;
  mobileConsentNo: string;
  delete: string;
  colName: string;
  colContact: string;
  colNotes: string;
  colGdpr: string;
  colActions: string;
  consentYes: string;
  consentNo: string;
};

export type BookingsMessages = {
  title: string;
  description: string;
  mustBeLoggedIn: string;
  noSalon: string;
  loadError: string;
  slotsError: string;
  invalidSlot: string;
  createError: string;
  listTitle: string;
  newBookingButton: string;
  loading: string;
  emptyTitle: string;
  emptyDescription: string;
  unknownService: string;
  unknownEmployee: string;
  unknownCustomer: string;
  colDate: string;
  colTime: string;
  colService: string;
  colEmployee: string;
  colCustomer: string;
  colStatus: string;
  colType: string;
  colNotes: string;
  statusPending: string;
  statusConfirmed: string;
  statusNoShow: string;
  statusCompleted: string;
  statusCancelled: string;
  statusScheduled: string;
  typeWalkIn: string;
  typeOnline: string;
  dialogTitle: string;
  dialogDescription: string;
  employeeLabel: string;
  employeePlaceholder: string;
  serviceLabel: string;
  servicePlaceholder: string;
  dateLabel: string;
  timeLabel: string;
  loadSlotsButton: string;
  loadingSlots: string;
  noSlotsYet: string;
  selectSlotPlaceholder: string;
  customerNameLabel: string;
  customerEmailLabel: string;
  customerEmailPlaceholder: string;
  customerPhoneLabel: string;
  customerPhonePlaceholder: string;
  isWalkInLabel: string;
  cancelButton: string;
  createBooking: string;
  creatingBooking: string;
};

export type ShiftsMessages = {
  title: string;
  description: string;
  mustBeLoggedIn: string;
  noSalon: string;
  loadError: string;
  addError: string;
  newShift: string;
  employeeLabel: string;
  employeePlaceholder: string;
  weekdayLabel: string;
  startLabel: string;
  endLabel: string;
  saving: string;
  addButton: string;
  needEmployeeHint: string;
  tableTitle: string;
  loading: string;
  emptyTitle: string;
  emptyDescription: string;
  mobileUnknownEmployee: string;
  desktopUnknownEmployee: string;
  colEmployee: string;
  colDay: string;
  colTime: string;
  colActions: string;
  delete: string;
};

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
};

import { nb } from "./nb";
import { en } from "./en";
import { so } from "./so";
import { ar } from "./ar";
import { ti } from "./ti";
import { am } from "./am";
import { tr } from "./tr";
import { pl } from "./pl";
import { vi } from "./vi";
import { zh } from "./zh";
import { tl } from "./tl";
import { fa } from "./fa";
import { dar } from "./dar";
import { ur } from "./ur";
import { hi } from "./hi";

export const translations: Record<AppLocale, TranslationNamespaces> = {
  nb,
  en,
  so,
  ar,
  am,
  ti,
  tr,
  pl,
  vi,
  zh,
  tl,
  fa,
  dar,
  ur,
  hi,
};


