import type { TranslationNamespaces } from "../../types/namespaces";

export const publicBooking: TranslationNamespaces["publicBooking"] = {

    notFound: "Fant ikke denne salongen eller den er ikke offentlig.",
    loadError: "Kunne ikke laste tjenester/ansatte.",
    loadingSalon: "Laster salong…",
    headerSubtitle: "Book time – betal fysisk i salong.",
    payInSalonBadge: "Betal i salong",
    step1Title: "1. Velg behandling",
    step1Description:
      "Start med å velge tjeneste, deretter ansatt og tidspunkt.",
    serviceLabel: "Tjeneste",
    servicePlaceholder: "Velg tjeneste…",
    employeeLabel: "Ansatt",
    employeePlaceholder: "Velg ansatt…",
    dateLabel: "Dato",
    loadSlots: "Hent ledige tider",
    loadingSlots: "Laster ledige tider…",
    step2Label: "2. Velg tidspunkt",
    noSlotsYet: "Hent først ledige tider",
    selectSlotPlaceholder: "Velg et tidspunkt…",
    step3Title: "3. Dine detaljer",
    step3Description:
      "Vi bruker dette til å bekrefte bookingen og eventuelt sende en påminnelse. Betaling skjer alltid i salong.",
    nameLabel: "Navn",
    emailLabel: "E-post (valgfri)",
    emailPlaceholder: "deg@eksempel.no",
    phoneLabel: "Telefon (valgfri)",
    phonePlaceholder: "+47 99 99 99 99",
    submitSaving: "Sender forespørsel…",
    submitLabel: "Bekreft forespørsel",
    payInfo:
      "Du betaler alltid fysisk i salong. Ingen kortbetaling på nett.",
    successMessage:
      "Bookingen er registrert! Du får bekreftelse fra salongen, og betaling skjer i salong.",
    createError: "Noe gikk galt ved opprettelse av booking.",
    unavailableTitle: "Kan ikke vise bookingside",
    unavailableDescription:
      "Denne salongen finnes ikke, eller er ikke satt som offentlig.",
};
