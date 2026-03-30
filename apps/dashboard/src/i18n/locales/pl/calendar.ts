import type { TranslationNamespaces } from '../../types';

export const calendar: TranslationNamespaces['calendar'] = {
    title: "Kalendarz",
    description:
      "Prosty wewnętrzny kalendarz według dnia i pracownika. Będzie podstawą dla przeciągnij‑i‑upuść oraz bardziej zaawansowanych widoków.",
    mustBeLoggedIn: "Musisz być zalogowany, aby zobaczyć kalendarz.",
    noSalon:
      "Z Twoim kontem nie jest powiązany żaden salon. Najpierw ukończ onboarding.",
    loadError: "Nie udało się załadować danych kalendarza.",
    selectedDayLabel: "Wybrany dzień:",
    viewDay: "Day view",
    viewWeek: "Week view",
    filterEmployeeLabel: "Filter by employee",
    filterEmployeeAll: "All employees",    prev: "Poprzedni",
    today: "Dzisiaj",
    next: "Następny",
    loading: "Ładowanie danych kalendarza…",
    noEmployeesTitle: "Brak pracowników",
    noEmployeesDescription:
      "Najpierw dodaj pracowników, aby zobaczyć ich w kalendarzu.",
    noBookingsTitle: "Brak rezerwacji w tym dniu",
    noBookingsDescription:
      "Wybierz inny dzień lub utwórz nowe rezerwacje.",
    unknownService: "Nieznana usługa",
    unknownCustomer: "Klient niezidentyfikowany / z ulicy",
  };
