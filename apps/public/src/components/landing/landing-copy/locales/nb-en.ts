import type { LandingCopyEntry } from "../types";

export const nbEnCopy: { nb: LandingCopyEntry; en: LandingCopyEntry } = {
  nb: {
    brand: "TeqBook",
    heroTitle: "Booking for salonger – bygget for fysisk betaling",
    heroSubtitle:
      "TeqBook er et enkelt og moderne bookingsystem for frisører og salonger i Norden. Kundene booker på nett, men betaler alltid i salong.",
    ctaPrimary: "Kom i gang gratis",
    ctaSecondary: "Book demo",
    badge: "Bygget for salonger",
    pricingTitle: "Velg TeqBook-pakken som passer din salong",
    pricingSubtitle:
      "Bygget for salonger i alle størrelser — start enkelt, og oppgrader når som helst.",
    tiers: [
      {
        id: "starter",
        name: "TeqBook Starter",
        price: "$25 / month",
        badge: "For små salonger",
        description:
          "Perfekt for barber, frisør, negler eller massasje med 1–2 ansatte.",
        features: [
          "Online booking og kalender",
          "Kunderegister og tjenestestyring",
          "Fysisk betaling uten kompliserte integrasjoner",
          "WhatsApp-support fra mennesker som forstår internasjonale salonger",
          "Engelsk + én valgfri språkpakke",
          "SMS-varsler til kostpris",
        ],
      },
      {
        id: "pro",
        name: "TeqBook Pro",
        price: "$50 / month",
        badge: "Mest valgt",
        description:
          "For salonger med 3–6 ansatte som vil ha mer kontroll og færre no-shows.",
        features: [
          "Alt i Starter",
          "Full flerspråklig brukerflate for ansatte og kunder",
          "Avanserte rapporter på omsetning, kapasitetsutnyttelse og no-shows",
          "Automatiske påminnelser og varslinger",
          "Støtte for flere ansatte og enkle vaktlister",
          "Enkel varebeholdning for produkter du selger i salongen",
          "Brandet bookingside med din logo og farger",
        ],
        highlighted: true,
      },
      {
        id: "business",
        name: "TeqBook Business",
        price: "$75 / month",
        badge: "For voksende kjeder",
        description:
          "For større og mer travle salonger som trenger struktur, roller og bedre rapportering.",
        features: [
          "Alt i Pro",
          "Roller og tilgangskontroll (eier, leder, resepsjon, ansatt)",
          "Bedre statistikk og eksport for regnskap og rapportering",
          "Full kundebookingshistorikk",
        ],
      },
    ],
    stats: [
      {
        title: "Bygget for fysisk betaling",
        body: "Alle tekster og flows er optimalisert for at betaling skjer i salong – ikke på nett.",
      },
      {
        title: "Multi-salong fra dag én",
        body: "Ett TeqBook-login kan eie flere salonger, med datasikker multi-tenancy i Supabase.",
      },
      {
        title: "Klar for videre vekst",
        body: "MVP-en er bygget med tydelig roadmap for notifikasjoner, rapportering og kassasystem.",
      },
    ],
    affordableSimple: "Rimelig. Enkelt. Bygget for internasjonale salonger.",
    startFreeTrial: "Start gratis prøveperiode",
    addOnsTitle: "Add-ons",
    newBooking: "Ny booking",
    exampleCustomerName: "Maria Hansen",
    exampleService: "Klipp & styling",
    exampleDate: "15. mars, 14:00",
    today: "I dag",
    bookingsCount: "3 bookinger",
    cutService: "Klipp",
    signUpButton: "Opprett konto",
    logInButton: "Logg inn",
    addOnsDescription:
      "Bygg din egen TeqBook-pakke etter behov. Perfekt for salonger drevet av innvandrere som vil starte enkelt og vokse trygt.",
    multilingualBookingTitle: "Flerspråklig bookingside",
    multilingualBookingDescription:
      "$10 / month — Somali, Tigrinja, Urdu, Vietnamesisk, Arabisk, Tyrkisk m.fl.",
    extraStaffTitle: "Ekstra ansatt",
    extraStaffDescription:
      "$5 / month per ekstra ansatt — Skaler trygt når salongen vokser, uten store hopp i pris.",
    faqTitle: "Ofte stilte spørsmål",
    faq: [
      {
        q: "Må jeg ha kortbetaling på nett?",
        a: "Nei. Hele TeqBook er designet for at betaling skjer fysisk i salong. Du kan fortsatt legge inn notater om betaling, men ingen kort trekkes på nett.",
      },
      {
        q: "Kan jeg ha flere salonger i samme konto?",
        a: "Ja. TeqBook støtter flere salonger per eier, med strenge RLS-regler i databasen slik at data aldri blandes.",
      },
      {
        q: "Hva med SMS og e-post?",
        a: "Dette kommer i Phase 5. Systemet er allerede rigget med kunder og bookinger slik at vi enkelt kan koble på varsling senere.",
      },
    ],
  },
  en: {
    brand: "TeqBook",
    heroTitle: "Finally, a booking system that understands how real salons work.",
    heroSubtitle:
      "TeqBook keeps your day organized, your customers happy, and your business running smoothly — without complicated software or online payment requirements.",
    ctaPrimary: "Get started for free",
    ctaSecondary: "Book a demo",
    badge: "Built for salons",
    pricingTitle: "Choose your TeqBook plan",
    pricingSubtitle:
      "Built for salons of all sizes — start simple, then upgrade anytime.",
    tiers: [
      {
        id: "starter",
        name: "TeqBook Starter",
        price: "$25 / month",
        description: "Perfect for 1–2 person salons.",
        features: [
          "Online booking and calendar",
          "Customer list and service management",
          "Pay-in-salon flow",
          "WhatsApp support",
          "One additional language pack",
          "SMS reminders at cost price",
        ],
      },
      {
        id: "pro",
        name: "TeqBook Pro",
        price: "$50 / month",
        description:
          "For salons with 3–6 staff who want more control and fewer no-shows.",
        features: [
          "Includes everything in Starter, plus:",
          "Fully multilingual interface for staff and clients",
          "Advanced reports on revenue and capacity",
          "Automatic reminders and notifications",
          "Shift planning and staff scheduling",
          "Lightweight inventory for products you sell",
          "Branded booking page with your logo and colors",
        ],
        highlighted: true,
      },
      {
        id: "business",
        name: "TeqBook Business",
        price: "$75 / month",
        description:
          "For larger salons that need structure, roles and full reporting.",
        features: [
          "Includes everything in Pro, plus:",
          "Roles and access control (owner, manager, staff)",
          "Deeper statistics and export for accounting",
          "Full customer booking history",
        ],
      },
    ],
    stats: [
      {
        title: "Designed for real salons",
        body: "Simple, practical workflows built for barbers, hairdressers, nail and beauty salons.",
      },
      {
        title: "Perfect for pay-in-salon businesses",
        body: "No forced online payments or extra fees. Just a clean booking flow that fits how real salons operate.",
      },
      {
        title: "Grows with your salon",
        body: "Add staff, manage multiple locations, and keep your business organized as you expand.",
      },
    ],
    affordableSimple: "Affordable. Simple. Built for international salons.",
    startFreeTrial: "Start free trial",
    addOnsTitle: "Add-ons",
    newBooking: "New booking",
    exampleCustomerName: "Maria Hansen",
    exampleService: "Cut & styling",
    exampleDate: "March 15, 2:00 PM",
    today: "Today",
    bookingsCount: "3 bookings",
    cutService: "Cut",
    signUpButton: "Sign up",
    logInButton: "Log in",
    addOnsDescription:
      "Build the TeqBook setup that fits your salon. Ideal for international salon owners who want to start simple and grow safely.",
    multilingualBookingTitle: "Multilingual booking page",
    multilingualBookingDescription:
      "$10 / month — Let clients book in Somali, Tigrinya, Urdu, Vietnamese, Arabic, Turkish and more.",
    extraStaffTitle: "Extra staff member",
    extraStaffDescription:
      "$5 / month per additional staff — Scale your team without big jumps in pricing.",
    faqTitle: "Frequently asked questions",
    faq: [
      {
        q: "Do I need online card payments?",
        a: "No. TeqBook is built for pay-in-salon workflows. You can still track payments, but nothing is charged online.",
      },
      {
        q: "Can I manage multiple salons under one account?",
        a: "Yes. You can manage several locations safely and securely in one place.",
      },
      {
        q: "What about SMS and email reminders?",
        a: "Yes — reminders are fully supported so clients never forget their appointments.",
      },
    ],
  },
};
