import type { TranslationNamespaces } from '../../types';

export const home: TranslationNamespaces['home'] = {
    title: "Oversikt",
    description:
      "En rask status for salongen din. Tallene her vil etter hvert komme fra booking-motoren.",
    welcomeBack: "Velkommen tilbake, {name}.",
    welcomeSubtitle:
      "Her er en oversikt over salongen din – ansatte, avtaler, kunder og ytelse.",
    welcomeSubtitleStarter:
      "Her er en oversikt over salongen din – ansatte, avtaler og kunder.",
    todaysBookings: "Dagens bookinger",
    viewCalendar: "Se kalender",
    noBookingsYet: "Ingen bookinger ennå.",
    noBookingsYetSubtitle: "Nye avtaler vil vises her.",
    createFirstBooking: "Opprett din første booking",
    yourStaff: "Dine ansatte",
    manageStaff: "Administrer ansatte",
    online: "På nett",
    offline: "Frakoblet",
    quickActions: "Hurtighandlinger",
    addNewBooking: "Legg til ny booking",
    addNewCustomer: "Legg til ny kunde",
    addNewService: "Legg til ny tjeneste",
    inviteNewStaff: "Inviter ny ansatt",
    // Performance snapshot
    thisWeek: "Denne uken",
    bookingsLabel: "Bookinger",
    newCustomersLabel: "Nye kunder",
    topServiceLabel: "Mest booket tjeneste",
    mostBookedStaffLabel: "Mest booket ansatt",
    noInsightsYet:
      "Salongens innsikt vil vises her når bookinger begynner å komme inn.",
    // KPI labels
    totalBookingsThisWeek: "Totale bookinger denne uken",
    returningCustomers: "Tilbakevendende kunder",
    newCustomers: "Nye kunder",
    revenueEstimate: "Omsetningsestimat (manuelle betalinger)",
    // Staff empty state
    manageStaffPermissions: "Administrer ansattes tillatelser og roller",
    // Announcements
    announcements: "Kunngjøringer",
    announcementWalkIn: "Du kan nå ta imot walk-in bookinger.",
    announcementLanguages: "Nye språk tilgjengelig: Tyrkisk, Arabisk",
    announcementDashboardUpdate: "Ny dashboard-oppdatering utgitt.",
    viewAllUpdates: "Se alle oppdateringer",
    announcementsLoading: "Laster kunngjøringer…",
    noAnnouncementsYet: "Ingen kunngjøringer ennå.",
    // Legacy (deprecated)
    nextStepTitle: "Neste steg",
    nextStepDescription: "Teknisk oppsett",
    nextStepBodyTitle: "Koble til Supabase",
    nextStepBodyText:
      "Legg inn Supabase-nøkler i .env.local og sett opp multi-tenancy.",
    onboardingTitle: "Kom i gang",
    onboardingDescription: "Første salong",
    onboardingBodyTitle: "Opprett første salong",
    onboardingBodyText:
      "Vi lager en enkel wizard for navn, adresse og eier senere.",
    bookingTitle: "Timebestilling",
    bookingDescription: "Kommer snart",
    bookingBodyTitle: "Intern kalender & offentlig side",
    bookingBodyText:
      "Denne boksen blir senere erstattet av ekte bookingdata.",
  };
