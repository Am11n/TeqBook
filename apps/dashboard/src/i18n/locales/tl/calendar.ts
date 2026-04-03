import type { TranslationNamespaces } from '../../types';

export const calendar: TranslationNamespaces['calendar'] = {
  title: "Kalendaryo",
  description:
    "Simpleng internal na kalendaryo ayon sa araw at empleyado. Base ito para sa drag-and-drop at mas advanced na view.",
  mustBeLoggedIn: "Mag-sign in muna para makita ang kalendaryo.",
  noSalon:
    "Walang salon na naka-link sa account mo. Kumpletuhin muna ang onboarding.",
  loadError: "Hindi ma-load ang calendar data.",
  selectedDayLabel: "Napiling araw:",
  viewDay: "Tingnan by araw",
  viewWeek: "Tingnan by linggo",
  filterEmployeeLabel: "I-filter ayon sa empleyado",
  filterEmployeeAll: "Lahat ng empleyado",
  prev: "Nakaraan",
  today: "Ngayon",
  next: "Susunod",
  loading: "Nilo-load ang calendar data…",
  noEmployeesTitle: "Wala pang empleyado",
  noEmployeesDescription:
    "Magdagdag muna ng empleyado para lumabas sila sa kalendaryo.",
  noBookingsTitle: "Walang booking sa araw na ito",
  noBookingsDescription:
    "Pumili ng ibang araw o gumawa ng bagong booking.",
  unknownService: "Hindi kilalang serbisyo",
  unknownCustomer: "Walk-in / hindi kilala",
};
