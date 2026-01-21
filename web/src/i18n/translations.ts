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
  welcomeBackTitle: string;
  welcomeBackDescription: string;
  bullet1: string;
  bullet2: string;
  bullet3: string;
  trustLine: string;
  formSubtitle: string;
  forgotPassword: string;
  keepMeLoggedIn: string;
  dontHaveAccount: string;
  createOne: string;
  secureLoginLine: string;
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
  createAccountTitle: string;
  createAccountDescription: string;
  bullet1: string;
  bullet2: string;
  bullet3: string;
  trustLine: string;
  formSubtitle: string;
  passwordPlaceholder: string;
  passwordHint: string;
  termsAgreement: string;
  secureLoginLine: string;
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
  whatsappNumberLabel: string;
  whatsappNumberPlaceholder: string;
  whatsappNumberHint: string;
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
  settings: string;
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
  welcomeBack: string;
  welcomeSubtitle: string;
  // Today's bookings card
  todaysBookings: string;
  viewCalendar: string;
  noBookingsYet: string;
  noBookingsYetSubtitle: string;
  createFirstBooking: string;
  // Staff overview card
  yourStaff: string;
  manageStaff: string;
  online: string;
  offline: string;
  // Quick actions card
  quickActions: string;
  addNewBooking: string;
  addNewCustomer: string;
  addNewService: string;
  inviteNewStaff: string;
  // Performance snapshot
  thisWeek: string;
  bookingsLabel: string;
  newCustomersLabel: string;
  topServiceLabel: string;
  mostBookedStaffLabel: string;
  noInsightsYet: string;
  // KPI labels
  totalBookingsThisWeek: string;
  returningCustomers: string;
  revenueEstimate: string;
  // Staff empty state
  manageStaffPermissions: string;
  // Announcements
  announcements: string;
  announcementWalkIn: string;
  announcementLanguages: string;
  announcementDashboardUpdate: string;
  viewAllUpdates: string;
  // Legacy (deprecated, kept for backward compatibility)
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
  edit: string;
  addButton: string;
  editTitle: string;
  editDescription: string;
  cancel: string;
  save: string;
  saving: string;
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

export type SettingsMessages = {
  title: string;
  description: string;
  generalTab: string;
  notificationsTab: string;
  billingTab: string;
  brandingTab: string;
  // General settings
  generalTitle: string;
  generalDescription: string;
  salonNameLabel: string;
  salonTypeLabel: string;
  whatsappNumberLabel: string;
  whatsappNumberPlaceholder: string;
  whatsappNumberHint: string;
  supportedLanguagesLabel: string;
  supportedLanguagesHint: string;
  defaultLanguageLabel: string;
  defaultLanguageHint: string;
  userPreferredLanguageLabel: string;
  userPreferredLanguageHint: string;
  saveButton: string;
  saving: string;
  saved: string;
  error: string;
  // Notifications settings
  notificationsTitle: string;
  notificationsDescription: string;
  emailRemindersEnabled: string;
  emailRemindersHint: string;
  // Billing settings
  billingTitle: string;
  billingDescription: string;
  currentPlan: string;
  planStarter: string;
  planPro: string;
  planBusiness: string;
  addOns: string;
  // Branding settings
  brandingTitle: string;
  brandingDescription: string;
  comingSoon: string;
};

export type AdminMessages = {
  title: string;
  description: string;
  mustBeSuperAdmin: string;
  salonsTitle: string;
  salonsDescription: string;
  usersTitle: string;
  usersDescription: string;
  loading: string;
  loadError: string;
  colSalonName: string;
  colSalonType: string;
  colOwner: string;
  colCreatedAt: string;
  colActions: string;
  colUserName: string;
  colUserEmail: string;
  colIsSuperAdmin: string;
  colSalon: string;
  yes: string;
  no: string;
  emptySalons: string;
  emptyUsers: string;
};

export type ProductsMessages = {
  title: string;
  description: string;
  noProducts: string;
  createFirst: string;
  name: string;
  price: string;
  stock: string;
  sku: string;
  status: string;
  actions: string;
  create: string;
  edit: string;
  delete: string;
  save: string;
  cancel: string;
  active: string;
  inactive: string;
  namePlaceholder: string;
  pricePlaceholder: string;
  stockPlaceholder: string;
  skuPlaceholder: string;
};

export type NotificationsMessages = {
  title: string;
  noNotifications: string;
  markAllRead: string;
  viewAll: string;
  justNow: string;
  minutesAgo: string;
  hoursAgo: string;
  daysAgo: string;
  bookingConfirmedTitle: string;
  bookingConfirmedBody: string;
  bookingChangedTitle: string;
  bookingChangedBody: string;
  bookingCancelledTitle: string;
  bookingCancelledBody: string;
  reminder24hTitle: string;
  reminder24hBody: string;
  reminder2hTitle: string;
  reminder2hBody: string;
  newBookingTitle: string;
  newBookingBody: string;
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
  settings: SettingsMessages;
  admin: AdminMessages;
  products: ProductsMessages;
  notifications: NotificationsMessages;
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


