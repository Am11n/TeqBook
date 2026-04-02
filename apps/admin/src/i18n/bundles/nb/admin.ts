import type { TranslationNamespaces } from "../../types/namespaces";

export const admin: TranslationNamespaces["admin"] = {

    title: "Admin Dashboard",
    description: "Administrer alle salonger, brukere og systeminnstillinger.",
    mustBeSuperAdmin: "Du må være superadmin for å få tilgang til denne siden.",
    salonsTitle: "Alle salonger",
    salonsDescription: "Se og administrer alle salonger i systemet.",
    usersTitle: "Alle brukere",
    usersDescription: "Se og administrer alle brukere i systemet.",
    loading: "Laster…",
    loadError: "Kunne ikke laste data.",
    colSalonName: "Salongnavn",
    colSalonType: "Type",
    colOwner: "Eier",
    colCreatedAt: "Opprettet",
    colActions: "Handlinger",
    colUserName: "Navn",
    colUserEmail: "E-post",
    colIsSuperAdmin: "Superadmin",
    colSalon: "Salong",
    yes: "Ja",
    no: "Nei",
    emptySalons: "Ingen salonger funnet.",
    emptyUsers: "Ingen brukere funnet.",
};
