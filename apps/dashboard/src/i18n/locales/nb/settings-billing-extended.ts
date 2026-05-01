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
  billingAddonUsagePendingStripe:
    "Tillegg synkroniseres med Stripe. Vi viser ikke dollartall som «neste faktura» før synk er ferdig.",
  billingAddonImpactHiddenUntilSync: "Månedlig $-påvirkning skjules til Stripe har bekreftet tilleggskvanta.",
  billingInvoicePreviewStripeTitle: "Neste faktura (Stripe-forhåndsvisning)",
  billingInvoicePreviewStripeHint:
    "Beløp hentes fra Stripes kommende faktura etter at tillegg er synket. De kan fortsatt endre seg før fakturaen ferdigstilles.",
  billingInvoicePreviewDegradedTitle: "Forhåndsvisning av neste faktura er ikke tilgjengelig",
  billingInvoicePreviewDegradedBody:
    "Vi viser ikke et estimert totalbeløp før faktureringssynk er frisk. Last siden på nytt om litt, eller kontakt support ved vedvarende problem.",
  billingInvoicePreviewSyncingBody: "Synkroniserer tillegg med Stripe … forhåndsvisning vises når det er ferdig.",
  billingInvoicePreviewNoSubscription: "Velg betalt plan for å se Stripe-forhåndsvisning av faktura her.",
  billingInvoicePreviewSmsSupplement: "SMS-overskudd (bruksbasert estimat, kan mangle i Stripe-forhåndsvisningen)",
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
  billingAutoRenewFootnote:
    "Betalte planer fornyes automatisk hver faktureringsperiode til du sier opp. Si opp før neste fornyelse hvis du ikke vil ha en ny periode.",
  billingStateGrace: "Betalingsutsettelse",
  billingStateSuspended: "Pauset",
  billingStateInconsistentBilling: "Synk av fakturering",
  billingInconsistentBillingTitle: "Fakturering trenger oppmerksomhet",
  billingInconsistentBillingBody:
    "Vi kunne ikke bekrefte abonnementet med betalingsleverandøren. Åpne fakturering for å se mer, eller kontakt support hvis dette vedvarer.",
  billingSuspendedAccessTitle: "Tilgang pauset",
  billingSuspendedAccessBody:
    "Abonnementet er ikke i orden. Oppdater betalingsmåte under fakturering for å gjenopprette tilgang.",
  billingPeriodStaleSyncTitle: "Oppdaterer faktureringsperiode",
  billingPeriodStaleSyncBody:
    "Neste fakturadato som vises er før dagens dato. Vi synkroniserer med betalingsleverandøren for å hente den fornyede perioden.",
  billingPeriodStaleFailedTitle: "Kunne ikke oppdatere fakturadato",
  billingPeriodStaleFailedBody:
    "Den viste fornyelsesdatoen kan være utdatert. Sjekk at fakturerings-funksjoner er deployet, prøv å laste siden på nytt, eller kontakt support.",
};
