import type { TranslationNamespaces } from '../../types';

export const calendar: TranslationNamespaces['calendar'] = {
    title: "Calendar",
    description:
      "A simple internal calendar per day and employee. Used as a base for drag & drop and more advanced views later.",
    mustBeLoggedIn: "You must be signed in to view the calendar.",
    noSalon:
      "No salon is linked to your user. Please complete onboarding first.",
    loadError: "Could not load calendar data.",
    selectedDayLabel: "Selected day:",
    viewDay: "Day view",
    viewWeek: "Week view",
    filterEmployeeLabel: "Filter by employee",
    filterEmployeeAll: "All employees",
    prev: "Previous",
    today: "Today",
    next: "Next",
    loading: "Loading calendar data…",
    noEmployeesTitle: "No employees yet",
    noEmployeesDescription:
      "Create employees first to see them in the calendar.",
    noBookingsTitle: "No bookings for this day",
    noBookingsDescription:
      "Choose another date or create new bookings.",
    unknownService: "Unknown service",
    unknownCustomer: "Walk-in / unknown",
  };
