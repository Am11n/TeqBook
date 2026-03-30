import type { TranslationNamespaces } from '../../types';

export const calendar: TranslationNamespaces['calendar'] = {
    title: "Kalendaryo",
    description:
      "Simple internal calendar ayon sa araw at empleyado. Ito ang base para sa drag‑and‑drop at mas advanced na mga view.",
    mustBeLoggedIn: "Kailangan mong mag-log in para makita ang kalendaryo.",
    noSalon:
      "Wala pang salon na naka-link sa account mo. Kumpletuhin muna ang onboarding.",
    loadError: "Hindi ma-load ang calendar data.",
    selectedDayLabel: "Napiling araw:",
    viewDay: "Day view",
    viewWeek: "Week view",
    filterEmployeeLabel: "Filter by employee",
    filterEmployeeAll: "All employees",    prev: "Nakaraan",
    today: "Ngayon",
    next: "Susunod",
    loading: "Ikinakarga ang calendar data…",
    noEmployeesTitle: "Wala pang empleyado",
    noEmployeesDescription:
      "Magdagdag muna ng mga empleyado para lumabas sila sa kalendaryo.",
    noBookingsTitle: "Walang booking sa araw na ito",
    noBookingsDescription:
      "Pumili ng ibang araw o gumawa ng bagong booking.",
    unknownService: "Hindi kilalang serbisyo",
    unknownCustomer: "Walk-in / hindi kilalang customer",
  };
