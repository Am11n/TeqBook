import type { TranslationNamespaces } from "../../types/namespaces";

export const shifts: TranslationNamespaces["shifts"] = {

    title: "Zmiany i godziny otwarcia",
    description:
      "Zdefiniuj stałe godziny pracy dla każdego pracownika. Będą używane do obliczania dostępnych terminów.",
    mustBeLoggedIn: "Musisz być zalogowany, aby zobaczyć zmiany.",
    noSalon:
      "Z Twoim kontem nie jest powiązany żaden salon. Najpierw ukończ onboarding.",
    loadError: "Nie udało się załadować zmian.",
    addError: "Nie udało się dodać zmiany.",
    newShift: "Nowa zmiana",
    employeeLabel: "Pracownik",
    employeePlaceholder: "Wybierz pracownika…",
    weekdayLabel: "Dzień tygodnia",
    startLabel: "Początek",
    endLabel: "Koniec",
    saving: "Zapisywanie…",
    addButton: "Dodaj zmianę",
    needEmployeeHint:
      "Zanim dodasz zmiany, musisz mieć dodanego przynajmniej jednego pracownika.",
    tableTitle: "Twoje zmiany",
    loading: "Ładowanie zmian…",
    emptyTitle: "Nie dodano jeszcze żadnych zmian",
    emptyDescription:
      "Gdy dodasz zmiany w formularzu po lewej, pojawią się tutaj i będą używane do obliczania dostępnych terminów.",
    mobileUnknownEmployee: "Nieznany pracownik",
    desktopUnknownEmployee: "Nieznany pracownik",
    colEmployee: "Pracownik",
    colDay: "Dzień",
    colTime: "Godzina",
    colActions: "Akcje",
    delete: "Usuń",
};
