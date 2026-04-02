import type { TranslationNamespaces } from "../../types/namespaces";

export const onboarding: TranslationNamespaces["onboarding"] = {

    title: "Opprett din første salong",
    description:
      "Vi lager nå en salong i databasen og kobler brukeren din som eier.",
    footerHint:
      "Hvis du får feil her, sjekk at funksjonen og policies er opprettet i Supabase slik vi gjorde i SQL editoren.",
    // Step 1: Grunninfo
    step1Title: "Grunninfo",
    step1Description: "Fyll ut grunnleggende informasjon om salongen din.",
    nameLabel: "Salongnavn",
    namePlaceholder: "F.eks. TeqBook Frisør Majorstuen",
    salonTypeLabel: "Type salong",
    salonTypeBarber: "Barber",
    salonTypeNails: "Negler",
    salonTypeMassage: "Massasje",
    salonTypeOther: "Annet",
    paymentMethodLabel: "Standard betalingsmetode",
    paymentMethodPhysicalOnly: "Kun fysisk betaling (standard)",
    preferredLanguageLabel: "Foretrukket språk for ansatte",
    whatsappNumberLabel: "WhatsApp-nummer",
    whatsappNumberPlaceholder: "+47 99 99 99 99",
    whatsappNumberHint: "Inkluder landskode. Dette nummeret vil vises på din offentlige booking-side.",
    nextButton: "Neste",
    // Step 2: Åpningstider
    step2Title: "Åpningstider & innstillinger",
    step2Description: "Sett åpningstider for salongen din og konfigurer booking-innstillinger.",
    openingHoursLabel: "Åpningstider",
    openingHoursDescription: "Sett når salongen din er åpen hver dag i uken.",
    dayLabel: "Dag",
    closedLabel: "Stengt",
    openLabel: "Åpen",
    fromLabel: "Fra",
    toLabel: "Til",
    monday: "Mandag",
    tuesday: "Tirsdag",
    wednesday: "Onsdag",
    thursday: "Torsdag",
    friday: "Fredag",
    saturday: "Lørdag",
    sunday: "Søndag",
    onlineBookingLabel: "Online booking",
    onlineBookingYes: "Ja",
    onlineBookingNo: "Nei",
    publicBookingLabel: "Offentlig booking-side aktiv",
    publicBookingYes: "Ja",
    publicBookingNo: "Nei",
    backButton: "Tilbake",
    // Step 3: Bekreft
    step3Title: "Bekreft & opprett",
    step3Description: "Gjennomgå informasjonen og opprett salongen din.",
    summaryLabel: "Oppsummering",
    summarySalonName: "Salongnavn",
    summarySalonType: "Type salong",
    summaryPaymentMethod: "Betalingsmetode",
    summaryPreferredLanguage: "Foretrukket språk",
    summaryOpeningHours: "Åpningstider",
    summaryOnlineBooking: "Online booking",
    summaryPublicBooking: "Offentlig booking-side",
    createError: "Kunne ikke opprette salong.",
    saving: "Oppretter salong...",
    createButton: "Opprett salong",
    // Legacy fields
    saveButton: "Lagre salong",
    step1:
      "1. Denne siden kaller Postgres-funksjonen create_salon_for_current_user.",
    step2:
      "2. Funksjonen oppretter en rad i salons og en rad i profiles (eller oppdaterer den).",
    step3:
      "3. Når alt er lagret, redirects du til dashboardet.",
};
