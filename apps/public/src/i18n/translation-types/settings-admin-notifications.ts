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
