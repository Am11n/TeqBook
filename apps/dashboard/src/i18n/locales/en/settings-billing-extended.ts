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
  billingAddonUsagePendingStripe:
    "Add-on billing is still syncing. Dollar amounts stay hidden until they match your subscription so we do not show a misleading “next invoice” number.",
  billingAddonImpactHiddenUntilSync:
    "Monthly $ impact stays hidden until billing confirms your add-on seat counts.",
  billingAddonBlockPlanIncludes: "Plan includes",
  billingAddonBlockYouUse: "You use",
  billingAddonBlockExtraPaid: "Extra (paid)",
  billingAddonExtraPaidLineStaff: "+{count} staff · {price}",
  billingAddonExtraPaidLineLang: "+{count} languages · {price}",
  billingAddonExtraPaidNone: "None",
  billingAddonLimitAtCapacity:
    "You are at your current subscription capacity for this item. Upgrade or add seats in Billing.",
  billingAddonLimitPressureHigh:
    "You are close to your subscription capacity ({percent}% of your current limit). Consider upgrading soon.",
  billingAddonLimitPressureMedium:
    "You are using most of your subscription capacity ({percent}% of your current limit).",
  billingInvoiceTimingAdjustmentsLabel: "Mid-cycle timing adjustments",
  billingInvoiceProrationFootnote:
    "The total is what the payment provider will charge on the next invoice. It equals the recurring plan and add-ons above plus any timing row when your subscription changed mid-period. Extra staff and language changes usually apply from the next bill onward. This is not an extra fee from TeqBook.",
  billingInvoiceShowStripeDetails: "Show line details",
  billingInvoiceHideStripeDetails: "Hide line details",
  billingInvoiceDetailRecurringHeading: "Subscription & recurring add-ons",
  billingInvoiceDetailProrationHeading: "Proration & timing adjustments",
  billingInvoiceDetailProrationLead:
    "Stripe adds these when seats or languages change mid-cycle. The estimated total above is still the number to trust for “what’s next.”",
  billingInvoicePreviewStripeTitle: "Next invoice",
  billingInvoicePreviewStripeHint:
    "This is the best preview of what you will pay on your next bill, based on today’s plan and usage. It can still change slightly until the invoice is finalized.",
  billingInvoicePreviewDegradedTitle: "Next invoice preview unavailable",
  billingInvoicePreviewDegradedBody:
    "We will not show an estimated total until billing sync is healthy. Open this page again in a moment, or contact support if this persists.",
  billingInvoicePreviewSyncingBody: "Syncing add-on billing… your preview will load in a moment.",
  billingInvoicePreviewNoSubscription: "Subscribe to a paid plan to see your next invoice preview here.",
  billingInvoicePreviewSmsSupplement:
    "SMS overage (usage-based estimate; may not yet appear in the next-invoice preview)",
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
  billingEstimatedInvoiceTitle: "Next invoice",
  billingEstimatedInvoiceHint:
    "Best preview of your next charge; may change slightly until the invoice finalizes.",
  billingEstimatedBasePlan: "Base plan",
  billingEstimatedExtraStaff: "Extra staff",
  billingEstimatedExtraLanguages: "Extra languages",
  billingEstimatedSmsOverage: "SMS overage",
  billingEstimatedTotal: "Total (next bill)",
  billingHistoryTitle: "Billing history",
  billingHistorySubtitle: "Invoice history and receipts",
  billingInvoiceOpen: "Open",
  billingInvoicePdf: "PDF",
  billingHistoryEmpty:
    "No invoices yet. They will appear here after your first successful billing cycle.",
  billingSubscriptionEndingAlert: "Subscription ending",
  openingHoursBreakDefault: "Break",
  billingPlanSelectionTitle: "Select a Plan",
  billingPlanSelectionDescription: "Choose a subscription plan that fits your needs",
  billingPlanPriceMonth: "{price} / month",
  billingPlanStarterFeature1: "Online booking and calendar",
  billingPlanStarterFeature2: "Customer list and service management",
  billingPlanStarterFeature3: "Pay-in-salon flow",
  billingPlanStarterFeature4: "WhatsApp communication (salon & customer)",
  billingPlanStarterFeature5: "One additional language pack",
  billingPlanStarterFeature6: "SMS reminders at cost price",
  billingPlanProFeature1: "Includes everything in Starter, plus:",
  billingPlanProFeature2: "Fully multilingual interface",
  billingPlanProFeature3: "Advanced reports on revenue and capacity",
  billingPlanProFeature4: "Automatic reminders and notifications",
  billingPlanProFeature5: "Shift planning and staff scheduling",
  billingPlanProFeature6: "Lightweight inventory for products",
  billingPlanProFeature7: "Branded booking page",
  billingPlanBusinessFeature1: "Includes everything in Pro, plus:",
  billingPlanBusinessFeature2: "Roles and access control",
  billingPlanBusinessFeature3: "Deeper statistics and export",
  billingPlanBusinessFeature4: "Priority support",
  billingPlanDialogCancel: "Cancel",
  billingPlanDialogSubscribe: "Subscribe",
  billingPlanDialogChangePlan: "Change Plan",
  billingPlanDialogProcessing: "Processing...",
  billingAutoRenewFootnote:
    "Paid plans renew automatically each billing period until you cancel. Cancel before the next renewal date if you do not want another period.",
  billingStateGrace: "Payment grace",
  billingStateSuspended: "Paused",
  billingStateInconsistentBilling: "Billing sync",
  billingInconsistentBillingTitle: "Billing needs attention",
  billingInconsistentBillingBody:
    "We could not confirm your subscription with our payment provider. Open billing to review, or contact support if this continues.",
  billingSuspendedAccessTitle: "Access paused",
  billingSuspendedAccessBody:
    "Your subscription is not in good standing. Update your payment method in billing to restore access.",
  billingPeriodStaleSyncTitle: "Updating billing period",
  billingPeriodStaleSyncBody:
    "The next billing date shown is before today. We are syncing with the payment provider to load the renewed period.",
  billingPeriodStaleFailedTitle: "Could not refresh billing date",
  billingPeriodStaleFailedBody:
    "The displayed renewal date may be out of date. Check that billing edge functions are deployed, then use refresh or contact support.",
};
