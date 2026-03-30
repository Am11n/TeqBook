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
  newCustomers?: string;
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
