import type { TranslationNamespaces } from "../../types";

/** Billing add-ons, SMS usage, estimates, and history — split out so `settings.ts` stays shorter. */
export const settingsBillingExtended: Partial<TranslationNamespaces["settings"]> = {
  billingAddonsTitle: "Add-on impact",
  billingAddonsDescription:
    "Extra staff and language charges are derived from active usage and synced to billing automatically.",
  billingAddonExtraStaffFallbackName: "Extra staff members",
  billingAddonExtraLanguagesFallbackName: "Extra languages",
  billingUnlimited: "Unlimited",
  billingAddonUsageLine: "Included: {included} • Active: {active} • Extra billed: {extra}",
  billingAddonStaffPriceFallback: "$5/month per staff",
  billingAddonLanguagePriceFallback: "$10/month per language",
  billingAddonStaffImpactLine: "{price} • Estimated monthly impact: {impact}",
  billingAddonLanguageImpactLine: "{price} • Estimated monthly impact: {impact}",
  billingAddonManagePlan: "Manage plan",
  billingAddonReviewLanguages: "Review languages",
  billingSmsUsageTitle: "SMS usage",
  billingSmsUsageDescription:
    "Included quota comes from admin plan features. Unlimited means no included cap for this period.",
  billingSmsLoading: "Loading SMS usage…",
  billingSmsIncludedLabel: "Included SMS",
  billingSmsUsedLabel: "Used",
  billingSmsOverageLabel: "Estimated overage",
  billingSmsExpectedCostLabel: "Expected extra cost",
  billingSmsQuotaWarning:
    "You have used {percent}% of your included SMS quota. Consider upgrading to avoid overage costs.",
  billingSmsHardCapWarning:
    "Hard cap reached for current period. New transactional SMS may be blocked.",
  billingSmsDisableSending: "Disable SMS sending",
  billingSmsEmailOnlyFallback: "Email-only fallback (no SMS)",
  billingSmsTogglesHint:
    "Toggles are local preview controls in this phase and will be persisted in a dedicated SMS settings step.",
  billingSmsDuplicateRows:
    "Multiple SMS usage records exist for this billing window. Please contact support.",
  billingSmsUsageError: "Could not load SMS usage: {detail}",
  billingSmsPlanDataError: "Could not load plan data for SMS quota: {detail}",
  billingSmsUnavailable: "SMS usage is temporarily unavailable. Please try again.",
  billingSmsStaleLine:
    "{detail} Showing last loaded values for this billing period.",
  billingEstimatedInvoiceTitle: "Estimated next invoice",
  billingEstimatedInvoiceHint:
    "This is an estimate and may change until the invoice is finalized.",
  billingEstimatedBasePlan: "Base plan",
  billingEstimatedExtraStaff: "Extra staff",
  billingEstimatedExtraLanguages: "Extra languages",
  billingEstimatedSmsOverage: "SMS overage",
  billingEstimatedTotal: "Estimated total",
  billingHistoryTitle: "Billing history",
  billingHistorySubtitle: "Invoice history and receipts",
  billingInvoiceOpen: "Open",
  billingInvoicePdf: "PDF",
  billingHistoryEmpty:
    "No invoices yet. They will appear here after your first successful billing cycle.",
  billingSubscriptionEndingAlert: "Subscription ending",
  openingHoursBreakDefault: "Break",
};
