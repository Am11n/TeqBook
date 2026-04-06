import type { AppLocale } from "./translation-types";

export type BookingRescheduleCopy = {
  title: string;
  description: string;
  accept: string;
  decline: string;
  working: string;
  successAccepted: string;
  successDeclined: string;
  errorGeneric: string;
  errorExpired: string;
  errorSuperseded: string;
  errorSlotTaken: string;
  errorAlreadyAccepted: string;
  errorAlreadyDeclined: string;
  errorInvalid: string;
  contactSalon: string;
  missingToken: string;
};

const en: BookingRescheduleCopy = {
  title: "Reschedule request",
  description:
    "The salon proposed a new time for your appointment. You can accept the new time or keep your original booking.",
  accept: "Accept new time",
  decline: "Keep original time",
  working: "Submitting…",
  successAccepted: "You accepted the new time. Thank you.",
  successDeclined: "You kept the original time. Thank you.",
  errorGeneric: "We could not process your response. Please contact the salon.",
  errorExpired: "This request has expired. Please contact the salon to reschedule.",
  errorSuperseded: "The salon sent a newer request. Check your latest message from them.",
  errorSlotTaken: "That time is no longer available. Please contact the salon.",
  errorAlreadyAccepted: "This was already accepted.",
  errorAlreadyDeclined: "This was already declined.",
  errorInvalid: "This link is not valid.",
  contactSalon: "If you need help, contact the salon directly.",
  missingToken: "This page needs a valid link from your message.",
};

const nb: BookingRescheduleCopy = {
  title: "Forespørsel om ny tid",
  description:
    "Salongen foreslår en ny tid for timen din. Du kan godta den nye tiden eller beholde opprinnelig booking.",
  accept: "Godta ny tid",
  decline: "Behold opprinnelig tid",
  working: "Sender…",
  successAccepted: "Du godtok den nye tiden. Takk.",
  successDeclined: "Du beholdt opprinnelig tid. Takk.",
  errorGeneric: "Vi kunne ikke behandle svaret ditt. Kontakt salongen.",
  errorExpired: "Forespørselen er utløpt. Kontakt salongen for å flytte timen.",
  errorSuperseded: "Salongen har sendt en nyere forespørsel. Sjekk siste melding fra dem.",
  errorSlotTaken: "Den tiden er ikke lenger ledig. Kontakt salongen.",
  errorAlreadyAccepted: "Dette er allerede godtatt.",
  errorAlreadyDeclined: "Dette er allerede avslått.",
  errorInvalid: "Denne lenken er ikke gyldig.",
  contactSalon: "Ta kontakt med salongen om du trenger hjelp.",
  missingToken: "Denne siden trenger en gyldig lenke fra meldingen din.",
};

export const bookingRescheduleMessages: Record<AppLocale, BookingRescheduleCopy> = {
  en,
  nb,
  ar: en,
  so: en,
  ti: en,
  am: en,
  tr: en,
  pl: en,
  vi: en,
  zh: en,
  tl: en,
  fa: en,
  dar: en,
  ur: en,
  hi: en,
};

export function resolveBookingRescheduleLocale(acceptLanguage: string | null): AppLocale {
  if (!acceptLanguage) return "en";
  const first = acceptLanguage.split(",")[0]?.trim().toLowerCase().split("-")[0];
  if (first === "nb" || first === "no") return "nb";
  const allowed: AppLocale[] = [
    "en",
    "nb",
    "ar",
    "so",
    "ti",
    "am",
    "tr",
    "pl",
    "vi",
    "zh",
    "tl",
    "fa",
    "dar",
    "ur",
    "hi",
  ];
  if (first && allowed.includes(first as AppLocale)) return first as AppLocale;
  return "en";
}
