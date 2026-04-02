import type { TranslationNamespaces } from "../../types/namespaces";

export const customers: TranslationNamespaces["customers"] = {

    title: "Klienci",
    description:
      "Prosty rejestr klientów Twojego salonu. Używany razem z rezerwacjami.",
    mustBeLoggedIn: "Musisz być zalogowany, aby zobaczyć klientów.",
    noSalon:
      "Z Twoim kontem nie jest powiązany żaden salon. Najpierw ukończ onboarding.",
    loadError: "Nie udało się załadować klientów.",
    addError: "Nie udało się dodać klienta.",
    newCustomer: "Nowy klient",
    nameLabel: "Imię i nazwisko",
    namePlaceholder: "np. Jan Kowalski",
    emailLabel: "E‑mail (opcjonalnie)",
    emailPlaceholder: "customer@example.com",
    phonePlaceholder: "+47 99 99 99 99",
    phoneLabel: "Telefon (opcjonalnie)",
    notesLabel: "Notatki (opcjonalnie)",
    notesPlaceholder:
      "np. ulubiony stylista, alergie, itp.",
    gdprLabel:
      "Posiadam zgodę na przechowywanie danych i kontakt z tym klientem (RODO).",
    saving: "Zapisywanie…",
    addButton: "Dodaj klienta",
    tableTitle: "Twoi klienci",
    loading: "Ładowanie klientów…",
    emptyTitle: "Nie dodano jeszcze żadnych klientów",
    emptyDescription:
      "Gdy dodasz klientów w formularzu po lewej, pojawią się tutaj i będzie można powiązać ich z rezerwacjami.",
    mobileConsentYes: "Zgoda zapisana",
    mobileConsentNo: "Brak zgody",
    delete: "Usuń",
    colName: "Name",
    colContact: "Contact",
    colNotes: "Notatki",
    colGdpr: "RODO",
    colActions: "Akcje",
    consentYes: "Tak",
    consentNo: "Nie",
};
