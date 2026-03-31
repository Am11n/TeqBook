export type SettingsMessages = {
  title: string;
  description: string;
  generalTab: string;
  openingHoursTab: string;
  notificationsTab: string;
  billingTab: string;
  brandingTab: string;
  noShowTab?: string;
  importTab?: string;
  securityTab?: string;
  auditTrailTab?: string;
  // General settings
  generalTitle: string;
  generalDescription: string;
  salonNameLabel: string;
  salonTypeLabel: string;
  whatsappNumberLabel: string;
  whatsappNumberPlaceholder: string;
  whatsappNumberHint: string;
  supportedLanguagesLabel: string;
  supportedLanguagesHint: string;
  defaultLanguageLabel: string;
  defaultLanguageHint: string;
  userPreferredLanguageLabel: string;
  userPreferredLanguageHint: string;
  saveButton: string;
  saving: string;
  saved: string;
  error: string;
  // Notifications settings
  notificationsTitle: string;
  notificationsDescription: string;
  emailRemindersEnabled: string;
  emailRemindersHint: string;
  // Billing settings
  billingTitle: string;
  billingDescription: string;
  /** Free trial / subscription status copy on the billing plan card */
  billingTrialBadge?: string;
  billingTrialTitle?: string;
  /** Use {days} placeholder for the number */
  billingTrialDaysLeft?: string;
  billingTrialDaysLeftOne?: string;
  billingTrialEndsOn?: string;
  billingTrialBody?: string;
  billingNoSubscriptionTitle?: string;
  billingNoSubscriptionBody?: string;
  billingTrialEndedTitle?: string;
  billingTrialEndedBody?: string;
  billingSubscriptionEndedTitle?: string;
  billingSubscriptionEndedBody?: string;
  billingSubscriptionEndedHint?: string;
  billingStateActive?: string;
  billingStateInactive?: string;
  billingStateCancelling?: string;
  billingStatePastDue?: string;
  billingSubscribeNow?: string;
  billingRenewSubscription?: string;
  currentPlan: string;
  planStarter: string;
  planPro: string;
  planBusiness: string;
  addOns: string;
  // Branding settings
  brandingTitle: string;
  brandingDescription: string;
  comingSoon: string;
  // Tab-switch guard
  unsavedChangesTitle?: string;
  unsavedChangesDescription?: string;
  discardAndSwitch?: string;
  stayOnTab?: string;
  // StickySaveBar shared
  unsavedChanges?: string;
  discard?: string;
  savingLabel?: string;
  savedLabel?: string;
  lastSaved?: string;
  couldNotSave?: string;
  retry?: string;
  // General tab -- sections
  salonSectionTitle?: string;
  salonSectionDescription?: string;
  localizationTitle?: string;
  localizationDescription?: string;
  currencyLabel?: string;
  currencyDescription?: string;
  timezoneLabel?: string;
  timezoneDescription?: string;
  timeFormatLabel?: string;
  /** Option labels for 12h / 24h selector */
  timeFormat24OptionLabel?: string;
  timeFormat12OptionLabel?: string;
  // General tab -- languages
  bookingLanguagesTitle?: string;
  bookingLanguagesDescription?: string;
  searchLanguages?: string;
  languagesUsed?: string;
  upgradePlan?: string;
  languageLimitReached?: string;
  recommendedLanguages?: string;
  moreLanguages?: string;
  showMoreLanguages?: string;
  // General tab -- profile
  yourProfileTitle?: string;
  dashboardLanguageLabel?: string;
  dashboardLanguageHint?: string;
  yourRoleLabel?: string;
  // Notifications tab
  customerNotificationsTitle?: string;
  customerNotificationsDescription?: string;
  internalNotificationsTitle?: string;
  internalNotificationsDescription?: string;
  bookingConfirmationLabel?: string;
  bookingConfirmationDescription?: string;
  bookingReminderLabel?: string;
  bookingReminderDescription?: string;
  cancellationNoticeLabel?: string;
  cancellationNoticeDescription?: string;
  newBookingLabel?: string;
  newBookingDescription?: string;
  bookingChangesLabel?: string;
  bookingChangesDescription?: string;
  bookingCancellationsLabel?: string;
  bookingCancellationsDescription?: string;
  sendTestTo?: string;
  testEmailPlaceholder?: string;
  // General tab -- new fields
  businessAddressLabel?: string;
  businessAddressPlaceholder?: string;
  orgNumberLabel?: string;
  orgNumberPlaceholder?: string;
  bookingUrlLabel?: string;
  copyLink?: string;
  copied?: string;
  bookingPolicyTitle?: string;
  bookingPolicyDescription?: string;
  cancellationHoursLabel?: string;
  cancellationHoursHint?: string;
  defaultBufferLabel?: string;
  defaultBufferHint?: string;
  /** Suffix after cancellation hours input, e.g. "hours" */
  cancellationHoursUnit?: string;
  /** Suffix after buffer minutes input, e.g. "min" */
  bufferMinutesUnit?: string;
  shownOnBookingPage?: string;
  contactSectionTitle?: string;
  contactSectionDescription?: string;
  emailLabel?: string;
  /** Shown when the user has no email on file (e.g. em dash) */
  emailNotProvided?: string;
  /** Cover image upload failed and no API message was returned */
  coverImageUploadFailed?: string;
  /** Empty state when salon context is missing on general settings */
  generalNoSalonMessage?: string;
  // Status indicator
  missingSettingsName?: string;
  missingBookingLanguage?: string;
  allSettingsConfigured?: string;
  validationCancellationHoursNonNegative?: string;
  validationBufferMinutesNonNegative?: string;
  // Notifications -- status
  activeStatus?: string;
  disabledStatus?: string;
  // Security
  twoFactorRecommendation?: string;
  currentSession?: string;
  // Billing
  inactiveStatus?: string;
  invoicesEmptyState?: string;
  learnBillingLink?: string;
  auditTrailTitle?: string;
  auditTrailDescription?: string;
  auditTrailLoading?: string;
  auditTrailShowing?: string;
  auditTrailEntries?: string;
  auditTrailExportCsv?: string;
  auditTrailTime?: string;
  auditTrailAction?: string;
  auditTrailResourceType?: string;
  auditTrailDetails?: string;
  auditTrailChangedBy?: string;
  auditTrailSystemActor?: string;
  auditTrailUnknownActor?: string;
  auditTrailNoActivity?: string;
  auditTrailPage?: string;
  auditTrailOf?: string;
  auditTrailPrevious?: string;
  auditTrailNext?: string;
  auditFiltersTitle?: string;
  auditSearch?: string;
  auditSearchPlaceholder?: string;
  auditAction?: string;
  auditAllActions?: string;
  auditResourceType?: string;
  auditAllTypes?: string;
  auditStartDate?: string;
  auditEndDate?: string;
  auditResetFilters?: string;
  auditFiltersShow?: string;
  auditFiltersHide?: string;
  auditViewDetails?: string;
  profileTitle?: string;
  profileDescription?: string;
  profileCancel?: string;
  profileSaving?: string;
  profileSaveChanges?: string;
  // Notifications — toasts & email preview dialog
  notificationTestSent?: string;
  notificationTestSendFailed?: string;
  notificationPreviewTitle?: string;
  notificationPreviewDescription?: string;
  notificationPreviewSubjectLabel?: string;
  notificationPreviewBodyLabel?: string;
  // Billing — add-ons card
  billingAddonsTitle?: string;
  billingAddonsDescription?: string;
  billingAddonExtraStaffFallbackName?: string;
  billingAddonExtraLanguagesFallbackName?: string;
  billingUnlimited?: string;
  /** Included: {included} • Active: {active} • Extra billed: {extra} */
  billingAddonUsageLine?: string;
  billingAddonStaffPriceFallback?: string;
  billingAddonLanguagePriceFallback?: string;
  /** {price} • Estimated monthly impact: {impact} */
  billingAddonStaffImpactLine?: string;
  billingAddonLanguageImpactLine?: string;
  billingAddonManagePlan?: string;
  billingAddonReviewLanguages?: string;
  // Billing — SMS usage
  billingSmsUsageTitle?: string;
  billingSmsUsageDescription?: string;
  billingSmsLoading?: string;
  billingSmsIncludedLabel?: string;
  billingSmsUsedLabel?: string;
  billingSmsOverageLabel?: string;
  billingSmsExpectedCostLabel?: string;
  /** You have used {percent}% of your included SMS quota. ... */
  billingSmsQuotaWarning?: string;
  billingSmsHardCapWarning?: string;
  billingSmsDisableSending?: string;
  billingSmsEmailOnlyFallback?: string;
  billingSmsTogglesHint?: string;
  billingSmsDuplicateRows?: string;
  /** Could not load SMS usage: {detail} */
  billingSmsUsageError?: string;
  /** Could not load plan data for SMS quota: {detail} */
  billingSmsPlanDataError?: string;
  billingSmsUnavailable?: string;
  /** {detail} Showing last loaded values for this billing period. */
  billingSmsStaleLine?: string;
  billingEstimatedInvoiceTitle?: string;
  billingEstimatedInvoiceHint?: string;
  billingEstimatedBasePlan?: string;
  billingEstimatedExtraStaff?: string;
  billingEstimatedExtraLanguages?: string;
  billingEstimatedSmsOverage?: string;
  billingEstimatedTotal?: string;
  billingHistoryTitle?: string;
  billingHistorySubtitle?: string;
  billingInvoiceOpen?: string;
  billingInvoicePdf?: string;
  billingHistoryEmpty?: string;
};

export type AdminMessages = {
  title: string;
  description: string;
  mustBeSuperAdmin: string;
  salonsTitle: string;
  salonsDescription: string;
  usersTitle: string;
  usersDescription: string;
  loading: string;
  loadError: string;
  colSalonName: string;
  colSalonType: string;
  colOwner: string;
  colCreatedAt: string;
  colActions: string;
  colUserName: string;
  colUserEmail: string;
  colIsSuperAdmin: string;
  colSalon: string;
  yes: string;
  no: string;
  emptySalons: string;
  emptyUsers: string;
};
