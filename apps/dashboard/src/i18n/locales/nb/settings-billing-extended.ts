import type { TranslationNamespaces } from "../../types";

export const settingsBillingExtendedNb: Partial<TranslationNamespaces["settings"]> = {
  billingAddonsTitle: "Tilleggskostnader",
  billingAddonsDescription:
    "Ekstra ansatte og språk: bruk er begrenset til det som allerede er betalt i inneværende periode. Du kan planlegge flere fra neste faktureringsdato; nye tillegg starter da — ikke midt i perioden (Modell A).",
  billingAddonsBusinessTitle: "Ansatte og språk inkludert",
  billingAddonsBusinessBody:
    "Business-planen inkluderer allerede ubegrenset antall aktive ansatte og booking-språk. Kjøpbare tillegg for ansatte og språk gjelder ikke — bruk «Administrer plan» hvis du vil endre abonnementet.",
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
  billingAddonActivateNow: "Aktiver nå (avansert)",
  billingAddonActivateNextPeriod: "Fra neste periode",
  billingAddonRecommended: "Anbefalt",
  billingAddonCostNow: "Kostnad denne perioden",
  billingAddonCostMonthly: "Månedlig løpende kostnad",
  billingAddonStartsAt: "Starter {date}",
  billingAddonNoCostNow: "Ingen ekstra kostnad nå",
  billingAddonAdvancedOption: "Dette valget kan gi ekstra kostnad midt i perioden.",
  billingAddonChooseTiming: "Velg når tillegget skal tre i kraft.",
  billingAddonQuantityLabel: "Antall",
  billingAddonConfirmSchedule: "Planlegg tillegg",
  billingAddonConfirmActivateNow: "Aktiver nå",
  billingAddonPreviewLoading: "Laster prisforhåndsvisning…",
  billingAddonPreviewFailed: "Kunne ikke laste prisforhåndsvisning for umiddelbar aktivering.",
  billingAddonPreviewRequired: "Umiddelbar aktivering krever vellykket forhåndsvisning først.",
  billingAddonPendingConflict:
    "Det finnes allerede et planlagt tillegg av denne typen. Umiddelbar aktivering erstatter den planlagte verdien for denne typen.",
  billingAddonPendingConflictAcknowledge:
    "Jeg forstår og vil erstatte planlagt verdi for denne tilleggstypen.",
  billingAddonImmediateBlockedByRole: "Kun owner/admin kan aktivere tillegg umiddelbart.",
  billingAddonUpdatingBilling: "Oppdaterer fakturering…",
  billingAddonDialogTitleStaff: "Ekstra ansatte",
  billingAddonDialogTitleLanguages: "Ekstra språk",
  billingAddonCtaStaff: "Legg til ekstra ansatte",
  billingAddonCtaLanguages: "Legg til ekstra språk",
  billingAddonNoAccessHint:
    "Du kan fortsatt planlegge tillegg fra neste periode. Umiddelbar aktivering er begrenset til owner/admin.",
  billingAddonUpgradeNearTitle: "Du nærmer deg prisen på neste plan.",
  billingAddonUpgradeAboveTitle: "Løpende tillegg koster nå like mye som neste plan.",
  billingAddonUpgradeBody:
    "Ved å bytte til {plan} kan du få mer inkludert kapasitet og bedre månedlig verdi.",
  billingAddonUpgradeSavings:
    "Nåværende løpende kostnad: {current}. Neste plan ({plan}): {next}. Forskjell: {delta}.",
  billingAddonUpgradeIncludes:
    "{plan} inkluderer opptil {employees} ansatte og {languages} språk før ekstra tillegg trengs.",
  billingAddonUpgradeCta: "Sammenlign planer",
  billingAddonManagePlanGlobal: "Endre plan",
  billingAddonActiveNowLabel: "Aktiv nå",
  billingAddonStartsNextPeriodLabel: "Starter neste faktureringsperiode ({date})",
  billingAddonScheduledLabel: "Neste periode",
  billingAddonScheduledNone: "Ingen planlagte endringer.",
  billingAddonAddMoreDisabledHint: "Oppgrader plan for å legge til flere.",
  billingAddonAddStaffAction: "Legg til ekstra ansatte",
  billingAddonAddLanguagesAction: "Legg til ekstra språk",
  billingAddonUsagePendingStripe:
    "Tilleggsfakturering synkroniseres fortsatt. Vi viser ikke dollartall før de stemmer med abonnementet, så du ikke får et villedende «neste faktura»-tall.",
  billingAddonImpactHiddenUntilSync:
    "Månedlig $-påvirkning skjules til faktureringen har bekreftet antall tilleggsplasser.",
  billingAddonBlockPlanIncludes: "Planen inkluderer",
  billingAddonBlockYouUse: "Du bruker",
  billingAddonTargetNowLabel: "Betalt kapasitetsmål nå",
  billingAddonPendingTargetLabel: "Planlagt kapasitetsmål",
  billingAddonTargetBelowUsageHint:
    "Nåværende bruk er over betalt kapasitetsmål. Øk målet eller reduser aktive ansatte/språk før du fortsetter.",
  billingAddonBlockExtraPaid: "Ekstra (betalt)",
  billingAddonExtraPaidLineStaff: "+{count} ansatte · {price}",
  billingAddonExtraPaidLineLang: "+{count} språk · {price}",
  billingAddonExtraPaidNone: "Ingen",
  billingAddonPaidThisCycleHint:
    "«Ekstra (betalt)» viser plasser Stripe fakturerer i denne abonnementsperioden. Tillegg du planlegger til neste fornyelse (ovenfor) belastes ikke før den datoen og endrer ikke dette tallet.",
  billingAddonLimitAtCapacity:
    "Du er ved dagens abonnementskapasitet for dette punktet. Oppgrader eller kjøp plasser under Fakturering.",
  billingAddonLimitPressureHigh:
    "Du nærmer deg abonnementsgrensen ({percent}% av gjeldende tak). Vurder oppgradering.",
  billingAddonLimitPressureMedium:
    "Du bruker en stor del av kapasiteten ({percent}% av gjeldende tak).",
  billingActiveCapacityTitle: "Aktiv kapasitet nå",
  billingActiveCapacityIntro:
    "Hva du kan bruke i dag: inkludert i planen pluss tilleggsenheter som allerede ligger på denne faktureringsperioden.",
  billingPlannedFromNextPeriodTitle: "Planlagt fra neste periode",
  billingPlannedFromNextPeriodIntro:
    "Ekstra enheter du har planlagt fra neste faktureringsdato ({date}). Fakturering og tilgang starter samtidig da.",
  billingPendingExtraStaffLabel: "Ekstra ansatt-enheter å planlegge til neste periode",
  billingPendingExtraLanguagesLabel: "Ekstra språk-enheter å planlegge til neste periode",
  billingPendingSaveButton: "Lagre planlagte tillegg",
  billingPendingSaving: "Lagrer…",
  billingPendingCappedHint: "Noen verdier ble begrenset av planens maksimum for tillegg.",
  billingPlannedNone: "Ingen ekstra enheter planlagt for neste periode.",
  generalAddonLanguagesScheduledNotice:
    "Et ekstra språktillegg ble planlagt til neste faktureringsdato ({date}). Du kan bruke språket nå; kostnaden for plassen følger den datoen.",
  billingPendingSectionHint:
    "Planlegg tillegg her for neste periode uten å endre Stripe-linjer midt i perioden.",
  billingInvoiceTimingAdjustmentsLabel: "Tidsjusteringer i perioden",
  billingInvoiceProrationFootnote:
    "Totalen er det betalingsleverandøren tar på neste faktura (plan + faste tillegg). Tids- eller prorering-linjer kan fortsatt finnes i Stripe; hovedvisningen fokuserer på de faste delene. Planbytte kan fortsatt faktureres umiddelbart etter egne regler.",
  billingInvoiceShowStripeDetails: "Vis linjedetaljer",
  billingInvoiceHideStripeDetails: "Skjul linjedetaljer",
  billingInvoiceDetailRecurringHeading: "Abonnement og faste tillegg",
  billingInvoiceDetailProrationHeading: "Prorering og tidsjusteringer",
  billingInvoiceDetailProrationLead:
    "Stripe legger til disse når plasser eller språk endres midt i perioden. Totalen over er fortsatt det beste svaret på «hva kommer neste gang».",
  billingInvoicePreviewStripeTitle: "Neste faktura",
  billingInvoicePreviewStripeHint:
    "Dette er det beste estimatet for hva du betaler på neste faktura, basert på dagens plan og bruk. Det kan fortsatt endre seg litt før fakturaen er endelig.",
  billingInvoicePreviewDegradedTitle: "Forhåndsvisning av neste faktura er ikke tilgjengelig",
  billingInvoicePreviewDegradedBody:
    "Vi viser ikke et estimert totalbeløp før faktureringssynk er frisk. Last siden på nytt om litt, eller kontakt support ved vedvarende problem.",
  billingInvoicePreviewSyncingBody: "Synkroniserer tilleggsfakturering … forhåndsvisning vises straks.",
  billingInvoicePreviewNoSubscription: "Velg betalt plan for å se forhåndsvisning av neste faktura her.",
  billingPlanTimingTitle: "Når skal endringen tre i kraft?",
  billingPlanChangeImmediateLabel: "Endre nå",
  billingPlanChangeNextPeriodLabel: "Fra neste faktureringsperiode",
  billingPlanChangeImmediateDescription:
    "Abonnementet oppdateres med én gang. Neste faktura kan inkludere prorering eller kreditter—se estimatet under.",
  billingPlanChangeNextPeriodDescription:
    "Ingen ekstra trekk før fornyelse. Dagens plangrenser gjelder til neste faktureringsdato.",
  billingPlanPreviewTitle: "Estimert neste faktura (ved endring nå)",
  billingPlanPreviewLoadError:
    "Kunne ikke laste forhåndsvisning. Du kan fortsatt bekrefte—beløp kan avvike litt.",
  billingPlanPreviewTotal: "Estimert total",
  billingPlanPreviewTimingLine: "Tidsjusteringer / prorering",
  billingPlanPreviewDisclaimer:
    "Estimat fra betalingsleverandør og kan endres til fakturaen er endelig.",
  billingPlanNextPeriodSummary:
    "Fra {date} vises abonnementet som {plan}. Du er på {current} frem til da.",
  billingPlanNextPeriodDateLabel: "Neste fornyelse",
  billingPlanPendingBanner:
    "Planlagt bytte til {plan} den {date}. Du er fortsatt på {current} nå.",
  billingPlanPendingCancel: "Avbryt planlagt endring",
  billingPlanChangeSyncing: "Oppdaterer abonnement…",
  billingInvoicePreviewSmsSupplement:
    "SMS-overskudd (bruksbasert estimat; kan mangle i forhåndsvisningen av neste faktura)",
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
  billingEstimatedInvoiceTitle: "Neste faktura",
  billingEstimatedInvoiceHint:
    "Beste estimat for neste trekk; kan endre seg litt før fakturaen er endelig.",
  billingEstimatedBasePlan: "Grunnplan",
  billingEstimatedExtraStaff: "Ekstra ansatte",
  billingEstimatedExtraLanguages: "Ekstra språk",
  billingEstimatedSmsOverage: "SMS overforbruk",
  billingEstimatedTotal: "Total (neste faktura)",
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
  billingUsageEmployeesBarLabel: "Ansatte (aktive / totalt tillatt)",
  billingUsageLanguagesBarLabel: "Språk (aktive / totalt tillatt)",
  billingPlanLimitsFootnote:
    "«Totalt tillatt» er plasser i pakken pluss eventuelle kjøpte tilleggsplasser — ikke bare det som følger med Starter.",
};
