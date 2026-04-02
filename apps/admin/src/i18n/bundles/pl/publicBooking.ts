import type { TranslationNamespaces } from "../../types/namespaces";

export const publicBooking: TranslationNamespaces["publicBooking"] = {

    notFound: "Nie udało się znaleźć tego salonu lub nie jest oznaczony jako publiczny.",
    loadError: "Nie udało się załadować usług / pracowników.",
    loadingSalon: "Ładowanie danych salonu…",
    headerSubtitle: "Zarezerwuj wizytę – zapłać na miejscu w salonie.",
    payInSalonBadge: "Płatność w salonie",
    step1Title: "1. Wybierz usługę",
    step1Description:
      "Zacznij od wyboru usługi, a następnie pracownika i godziny.",
    serviceLabel: "Usługa",
    servicePlaceholder: "Wybierz usługę…",
    employeeLabel: "Pracownik",
    employeePlaceholder: "Wybierz pracownika…",
    dateLabel: "Data",
    loadSlots: "Pokaż dostępne godziny",
    loadingSlots: "Ładowanie dostępnych godzin…",
    step2Label: "2. Wybierz godzinę",
    noSlotsYet: "Najpierw załaduj dostępne godziny",
    selectSlotPlaceholder: "Wybierz godzinę…",
    step3Title: "3. Twoje dane",
    step3Description:
      "Używamy tych danych, aby potwierdzić Twoją wizytę i opcjonalnie wysłać przypomnienie. Płatność zawsze odbywa się w salonie.",
    nameLabel: "Imię i nazwisko",
    emailLabel: "E‑mail (opcjonalnie)",
    emailPlaceholder: "you@example.com",
    phoneLabel: "Telefon (opcjonalnie)",
    phonePlaceholder: "+47 99 99 99 99",
    submitSaving: "Wysyłanie prośby…",
    submitLabel: "Potwierdź rezerwację",
    payInfo:
      "Zawsze płacisz fizycznie w salonie. Brak płatności kartą online.",
    successMessage:
      "Twoja rezerwacja została zapisana! Salon skontaktuje się z Tobą w celu potwierdzenia, a płatność nastąpi w salonie.",
    createError: "Coś poszło nie tak podczas tworzenia rezerwacji.",
    unavailableTitle: "Nie można wyświetlić strony rezerwacji",
    unavailableDescription:
      "Ten salon nie istnieje lub nie jest oznaczony jako publiczny.",
};
