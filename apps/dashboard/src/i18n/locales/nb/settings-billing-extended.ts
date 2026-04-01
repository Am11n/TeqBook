import type { TranslationNamespaces } from "../../types";

export const settingsBillingExtendedNb: Partial<TranslationNamespaces["settings"]> = {
  billingAddonsTitle: "Tilleggskostnader",
  billingAddonsDescription:
    "Ekstra ansatte og språk beregnes ut fra aktiv bruk og synkroniseres automatisk til fakturering.",
  billingAddonExtraStaffFallbackName: "Ekstra ansatte",
  billingAddonExtraLanguagesFallbackName: "Ekstra språk",
  billingUnlimited: "Ubegrenset",
  billingAddonUsageLine: "Inkludert: {included} • Aktive: {active} • Ekstra fakturert: {extra}",
  billingAddonStaffPriceFallback: "$5/måned per ansatt",
  billingAddonLanguagePriceFallback: "$10/måned per språk",
  billingAddonStaffImpactLine: "{price} • Estimert månedlig påvirkning: {impact}",
  billingAddonLanguageImpactLine: "{price} • Estimert månedlig påvirkning: {impact}",
  billingAddonManagePlan: "Administrer plan",
  billingAddonReviewLanguages: "Se språk",
  billingSmsUsageTitle: "SMS-bruk",
  billingSmsUsageDescription:
    "Inkludert kvote kommer fra admin-planfunksjoner. Ubegrenset betyr ingen inkludert grense for denne perioden.",
  billingSmsLoading: "Laster SMS-bruk…",
  billingSmsIncludedLabel: "Inkluderte SMS",
  billingSmsUsedLabel: "Brukt",
  billingSmsOverageLabel: "Estimert overforbruk",
  billingSmsExpectedCostLabel: "Forventet ekstrakostnad",
  billingSmsQuotaWarning:
    "Du har brukt {percent}% av den inkluderte SMS-kvoten. Vurder oppgradering for å unngå overforbrukskostnader.",
  billingSmsHardCapWarning:
    "Hard tak nådd for inneværende periode. Nye transaksjonelle SMS kan bli blokkert.",
  billingSmsDisableSending: "Deaktiver SMS-sending",
  billingSmsEmailOnlyFallback: "Kun e-post (ingen SMS)",
  billingSmsTogglesHint:
    "Bryterne er lokale forhåndskontroller i denne fasen og vil lagres i et dedikert SMS-innstillingssteg senere.",
  billingSmsDuplicateRows:
    "Flere SMS-forbruksrader finnes for dette faktureringsvinduet. Kontakt support.",
  billingSmsUsageError: "Kunne ikke laste SMS-bruk: {detail}",
  billingSmsPlanDataError: "Kunne ikke laste plandata for SMS-kvote: {detail}",
  billingSmsUnavailable: "SMS-bruk er midlertidig utilgjengelig. Prøv igjen.",
  billingSmsStaleLine:
    "{detail} Viser sist innlastede verdier for denne faktureringsperioden.",
  billingEstimatedInvoiceTitle: "Estimert neste faktura",
  billingEstimatedInvoiceHint:
    "Dette er et estimat og kan endre seg før fakturaen er endelig.",
  billingEstimatedBasePlan: "Grunnplan",
  billingEstimatedExtraStaff: "Ekstra ansatte",
  billingEstimatedExtraLanguages: "Ekstra språk",
  billingEstimatedSmsOverage: "SMS overforbruk",
  billingEstimatedTotal: "Estimert total",
  billingHistoryTitle: "Fakturahistorikk",
  billingHistorySubtitle: "Fakturaer og kvitteringer",
  billingInvoiceOpen: "Åpne",
  billingInvoicePdf: "PDF",
  billingHistoryEmpty:
    "Ingen fakturaer ennå. De vises her etter første vellykkede faktureringssyklus.",
  billingSubscriptionEndingAlert: "Abonnementet avsluttes",
  openingHoursBreakDefault: "Pause",
};
