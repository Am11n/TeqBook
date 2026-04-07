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

export type FeatureGateMessages = {
  upgradeRequired: string;
  upgradeDescription: string;
  viewPlans: string;
  goBack: string;
  shiftsDescription?: string;
  inventoryDescription?: string;
  advanced_reportsDescription?: string;
  exportsDescription?: string;
  brandingDescription?: string;
  /** Shown when page requires Pro or Business (plan gate) */
  minimumProDescription?: string;
  [key: string]: string | undefined;
};
