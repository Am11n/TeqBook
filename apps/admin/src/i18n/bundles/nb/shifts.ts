import type { TranslationNamespaces } from "../../types/namespaces";

export const shifts: TranslationNamespaces["shifts"] = {

    title: "Shifts & åpningstider",
    description:
      "Definer faste arbeidstider per ansatt. Brukes senere for å beregne ledige bookbare tider.",
    mustBeLoggedIn: "Du må være logget inn for å se shifts.",
    noSalon:
      "Fant ingen salong tilknyttet brukeren din. Fullfør onboarding først.",
    loadError: "Kunne ikke laste shifts.",
    addError: "Kunne ikke legge til shift.",
    newShift: "Ny shift",
    employeeLabel: "Ansatt",
    employeePlaceholder: "Velg ansatt…",
    weekdayLabel: "Ukedag",
    startLabel: "Start",
    endLabel: "Slutt",
    saving: "Lagrer…",
    addButton: "Legg til shift",
    needEmployeeHint:
      "Du må først opprette minst én ansatt før du kan legge til shifts.",
    tableTitle: "Dine shifts",
    loading: "Laster shifts…",
    emptyTitle: "Ingen shifts registrert ennå",
    emptyDescription:
      "Når du legger til skift i skjemaet til venstre vil de vises her og senere brukes til å beregne ledige tider.",
    mobileUnknownEmployee: "Ukjent ansatt",
    desktopUnknownEmployee: "Ukjent ansatt",
    colEmployee: "Ansatt",
    colDay: "Dag",
    colTime: "Tid",
    colActions: "Handlinger",
    delete: "Slett",
};
