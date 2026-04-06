import type { TranslationNamespaces } from '../../types';

export const home: TranslationNamespaces['home'] = {
    title: "Overview",
    description:
      "A quick status overview for your salon. Numbers here will soon come from the booking engine.",
    welcomeBack: "Welcome back, {name}.",
    welcomeSubtitle:
      "Here's an overview of your salon – staff, appointments, customers and performance.",
    welcomeSubtitleStarter:
      "Here's an overview of your salon – staff, appointments and customers.",
    todaysBookings: "Today's bookings",
    viewCalendar: "View calendar",
    noBookingsYet: "No bookings yet.",
    noBookingsYetSubtitle: "New appointments will appear here.",
    createFirstBooking: "Create your first booking",
    yourStaff: "Your staff",
    manageStaff: "Manage staff",
    online: "Online",
    offline: "Offline",
    quickActions: "Quick actions",
    addNewBooking: "Add new booking",
    addNewCustomer: "Add new customer",
    addNewService: "Add new service",
    inviteNewStaff: "Invite new staff member",
    // Performance snapshot
    thisWeek: "This week",
    bookingsLabel: "Bookings",
    newCustomersLabel: "New customers",
    topServiceLabel: "Top service",
    mostBookedStaffLabel: "Most booked staff",
    noInsightsYet:
      "Your salon insights will appear here once bookings start coming in.",
    // KPI labels
    totalBookingsThisWeek: "Total bookings this week",
    returningCustomers: "Returning customers",
    newCustomers: "New customers",
    revenueEstimate: "Revenue estimate (manual payments)",
    // Staff empty state
    manageStaffPermissions: "Manage staff permissions and roles",
    // Announcements
    announcements: "Announcements",
    announcementWalkIn: "You can now accept walk-in bookings.",
    announcementLanguages: "New languages available: Turkish, Arabic",
    announcementDashboardUpdate: "New dashboard update released.",
    viewAllUpdates: "View all updates",
    announcementsLoading: "Loading announcements…",
    noAnnouncementsYet: "No announcements yet.",
    // Legacy (deprecated)
    nextStepTitle: "Next step",
    nextStepDescription: "Technical setup",
    nextStepBodyTitle: "Connect Supabase",
    nextStepBodyText:
      "Add your Supabase keys to .env.local and enable multi-tenancy.",
    onboardingTitle: "Onboarding",
    onboardingDescription: "First salon",
    onboardingBodyTitle: "Create your first salon",
    onboardingBodyText:
      "We'll add a simple wizard for name, address and owner details.",
    bookingTitle: "Booking",
    bookingDescription: "Coming soon",
    bookingBodyTitle: "Internal calendar & public booking page",
    bookingBodyText:
      "This card will later be replaced with real booking data.",
  };
