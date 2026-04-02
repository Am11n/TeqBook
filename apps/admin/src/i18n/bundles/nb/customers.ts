import type { TranslationNamespaces } from "../../types/namespaces";

export const customers: TranslationNamespaces["customers"] = {

    title: "Kunder",
    description:
      "Et enkelt kunderegister for salongen din. Brukes sammen med bookinger.",
    mustBeLoggedIn: "Du må være logget inn for å se kunder.",
    noSalon:
      "Fant ingen salong tilknyttet brukeren din. Fullfør onboarding først.",
    loadError: "Kunne ikke laste kunder.",
    addError: "Kunne ikke legge til kunde.",
    newCustomer: "Ny kunde",
    nameLabel: "Navn",
    namePlaceholder: "F.eks. Ola Nordmann",
    emailLabel: "E-post (valgfri)",
    emailPlaceholder: "kunde@eksempel.no",
    phoneLabel: "Telefon (valgfri)",
    phonePlaceholder: "+47 99 99 99 99",
    notesLabel: "Notater (valgfri)",
    notesPlaceholder:
      "F.eks. foretrukket frisør, allergier, osv.",
    gdprLabel:
      "Jeg har samtykke til å lagre og kontakte denne kunden (GDPR).",
    saving: "Lagrer…",
    addButton: "Legg til kunde",
    tableTitle: "Dine kunder",
    loading: "Laster kunder…",
    emptyTitle: "Ingen kunder registrert ennå",
    emptyDescription:
      "Når du legger til kunder i skjemaet til venstre dukker de opp her. De kan knyttes til bookinger senere.",
    mobileConsentYes: "Samtykke lagret",
    mobileConsentNo: "Uten samtykke",
    delete: "Slett",
    colName: "Navn",
    colContact: "Kontakt",
    colNotes: "Notater",
    colGdpr: "GDPR",
    colActions: "Handlinger",
    consentYes: "Ja",
    consentNo: "Nei",
};
