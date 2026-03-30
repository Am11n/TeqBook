import type { TranslationNamespaces } from '../../types';

export const calendar: TranslationNamespaces['calendar'] = {
    title: "Kalender",
    description:
      "En enkel intern kalender per dag og ansatt. Brukes som grunnlag for drag & drop og mer avansert visning senere.",
    mustBeLoggedIn: "Du må være logget inn for å se kalenderen.",
    noSalon:
      "Fant ingen salong tilknyttet brukeren din. Fullfør onboarding først.",
    loadError: "Kunne ikke laste kalenderdata.",
    selectedDayLabel: "Valgt dag:",
    viewDay: "Dagvisning",
    viewWeek: "Ukevisning",
    filterEmployeeLabel: "Filtrer på ansatt",
    filterEmployeeAll: "Alle ansatte",
    prev: "Forrige",
    today: "I dag",
    next: "Neste",
    loading: "Laster kalender-data…",
    noEmployeesTitle: "Ingen ansatte ennå",
    noEmployeesDescription:
      "Opprett ansatte først for å se dem i kalenderen.",
    noBookingsTitle: "Ingen bookinger denne dagen",
    noBookingsDescription:
      "Velg en annen dato eller opprett nye bookinger.",
    unknownService: "Ukjent tjeneste",
    unknownCustomer: "Walk-in / ukjent",
  };
