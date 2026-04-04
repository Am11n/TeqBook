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
  /** Subscribe / change-plan modal */
  billingPlanSelectionTitle?: string;
  billingPlanSelectionDescription?: string;
  /** Shown under plan name; must include {price} */
  billingPlanPriceMonth?: string;
  billingPlanStarterFeature1?: string;
  billingPlanStarterFeature2?: string;
  billingPlanStarterFeature3?: string;
  billingPlanStarterFeature4?: string;
  billingPlanStarterFeature5?: string;
  billingPlanStarterFeature6?: string;
  billingPlanProFeature1?: string;
  billingPlanProFeature2?: string;
  billingPlanProFeature3?: string;
  billingPlanProFeature4?: string;
  billingPlanProFeature5?: string;
  billingPlanProFeature6?: string;
  billingPlanProFeature7?: string;
  billingPlanBusinessFeature1?: string;
  billingPlanBusinessFeature2?: string;
  billingPlanBusinessFeature3?: string;
  billingPlanBusinessFeature4?: string;
  billingPlanDialogCancel?: string;
  billingPlanDialogSubscribe?: string;
  billingPlanDialogChangePlan?: string;
  billingPlanDialogProcessing?: string;
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
  /** CSV column header (full date-time); table column may use shorter label */
  auditCsvTimestamp?: string;
  /** CSV column header for resource identifier */
  auditCsvResourceId?: string;
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
  profileLoadFailed?: string;
  profileAvatarFileTooLarge?: string;
  profileAvatarUploadFailed?: string;
  profileAvatarRemoveFailed?: string;
  profileUpdateFailed?: string;
  profileUpdatedSuccess?: string;
  // Security — password card & change dialog
  passwordCardTitle?: string;
  passwordCardDescription?: string;
  passwordRowLabel?: string;
  passwordChangeAction?: string;
  changePasswordDialogTitle?: string;
  changePasswordDialogDescription?: string;
  changePasswordMismatchError?: string;
  changePasswordTooShortError?: string;
  changePasswordSuccess?: string;
  changePasswordCurrentLabel?: string;
  changePasswordCurrentPlaceholder?: string;
  changePasswordNewLabel?: string;
  changePasswordNewDescription?: string;
  changePasswordNewPlaceholder?: string;
  changePasswordConfirmLabel?: string;
  changePasswordConfirmPlaceholder?: string;
  changePasswordCancel?: string;
  changePasswordSubmitting?: string;
  changePasswordSubmit?: string;
  /** Dev / test billing hook (dashboard) */
  billingDevStripeCustomerRequired?: string;
  billingDevStripeSubscriptionRequired?: string;
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
  billingSubscriptionEndingAlert?: string;
  openingHoursBreakDefault?: string;
  // No-show policy page
  noShowPolicyLoading?: string;
  noShowPolicyPageTitle?: string;
  noShowPolicyPageDescription?: string;
  noShowPolicySaveSuccess?: string;
  noShowPolicyMaxStrikesLabel?: string;
  noShowPolicyMaxStrikesHint?: string;
  noShowPolicyWarningThresholdLabel?: string;
  noShowPolicyWarningThresholdHint?: string;
  noShowPolicyAutoBlockLabel?: string;
  noShowPolicyResetDaysLabel?: string;
  noShowPolicyResetDaysHint?: string;
  noShowPolicyResetNeverPlaceholder?: string;
  noShowPolicySaving?: string;
  noShowPolicySaveButton?: string;
  // Data import
  importPageTitle?: string;
  importPageDescription?: string;
  importTabCustomers?: string;
  importTabServices?: string;
  importTabEmployees?: string;
  importTabBookings?: string;
  importUploadDropPrompt?: string;
  importUploadSizeHint?: string;
  /** e.g. "Presets available: {names}" */
  importUploadPresetsLine?: string;
  // General — salon info (public profile fields)
  publicDescriptionLabel?: string;
  publicDescriptionPlaceholder?: string;
  coverImageLabel?: string;
  coverImageAlt?: string;
  coverImageEmpty?: string;
  coverImageUploading?: string;
  coverImageUploadButton?: string;
  coverImageRemoveButton?: string;
  coverImageFormatsHint?: string;
  salonTypeSelectPlaceholder?: string;
  salonTypeBarber?: string;
  salonTypeNails?: string;
  salonTypeMassage?: string;
  salonTypeOther?: string;
  publicLinksSectionLabel?: string;
  publicProfileLinkLabel?: string;
  publicProfileLinkBadge?: string;
  directBookingLinkLabel?: string;
  suggestedBioText?: string;
  instagramUrlLabel?: string;
  instagramUrlPlaceholder?: string;
  facebookUrlLabel?: string;
  facebookUrlPlaceholder?: string;
  twitterUrlLabel?: string;
  twitterUrlPlaceholder?: string;
  tiktokUrlLabel?: string;
  tiktokUrlPlaceholder?: string;
  websiteUrlLabel?: string;
  websiteUrlPlaceholder?: string;
  // Security — 2FA card
  twoFactorCardTitle?: string;
  twoFactorCardDescription?: string;
  twoFactorStatusLabel?: string;
  twoFactorStatusEnabled?: string;
  twoFactorStatusDisabled?: string;
  twoFactorEnabledAlert?: string;
  twoFactorDisabledAlert?: string;
  twoFactorRecommendShort?: string;
  twoFactorDisableButton?: string;
  twoFactorConfirmDisable?: string;
};
