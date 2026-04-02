import type { TranslationNamespaces } from "../../types/namespaces";

export const services: TranslationNamespaces["services"] = {

    title: "Tjenester",
    description:
      "Definer behandlinger med varighet og pris. Brukes senere i booking.",
    mustBeLoggedIn: "Du må være logget inn for å se tjenester.",
    noSalon:
      "Fant ingen salong tilknyttet brukeren din. Fullfør onboarding først.",
    addError: "Kunne ikke legge til tjeneste.",
    updateError: "Kunne ikke oppdatere tjeneste.",
    newService: "Ny tjeneste",
    nameLabel: "Navn",
    namePlaceholder: "F.eks. Klipp dame",
    categoryLabel: "Kategori",
    categoryCut: "Klipp",
    categoryBeard: "Skjegg",
    categoryColor: "Farge",
    categoryNails: "Negler",
    categoryMassage: "Massasje",
    categoryOther: "Annet",
    durationLabel: "Varighet (minutter)",
    priceLabel: "Pris (NOK)",
    sortOrderLabel: "Sorteringsrekkefølge",
    loading: "Laster tjenester…",
    emptyTitle: "Ingen tjenester registrert ennå",
    emptyDescription:
      "Legg til behandlinger i skjemaet til venstre. De brukes for å beregne varighet og pris i booking-motoren.",
    tableTitle: "Dine tjenester",
    colName: "Navn",
    colCategory: "Kategori",
    colDuration: "Varighet",
    colPrice: "Pris",
    colStatus: "Status",
    colActions: "Handlinger",
    active: "Aktiv",
    inactive: "Inaktiv",
    delete: "Slett",
};
