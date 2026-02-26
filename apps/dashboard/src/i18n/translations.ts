export type AppLocale =
  | "nb"
  | "en"
  | "ar"
  | "so"
  | "ti"
  | "am"
  | "tr"
  | "pl"
  | "vi"
  | "zh"
  | "tl"
  | "fa"
  | "dar"
  | "ur"
  | "hi";

export type PublicBookingMessages = {
  notFound: string;
  loadError: string;
  loadingSalon: string;
  headerSubtitle: string;
  payInSalonBadge: string;
  step1Title: string;
  step1Description: string;
  serviceLabel: string;
  servicePlaceholder: string;
  employeeLabel: string;
  employeePlaceholder: string;
  dateLabel: string;
  loadSlots: string;
  loadingSlots: string;
  step2Label: string;
  noSlotsYet: string;
  selectSlotPlaceholder: string;
  step3Title: string;
  step3Description: string;
  nameLabel: string;
  emailLabel: string;
  emailPlaceholder: string;
  phoneLabel: string;
  phonePlaceholder: string;
  submitSaving: string;
  submitLabel: string;
  payInfo: string;
  successMessage: string;
  createError: string;
  unavailableTitle: string;
  unavailableDescription: string;
};

export type LoginMessages = {
  title: string;
  description: string;
  emailLabel: string;
  emailPlaceholder: string;
  passwordLabel: string;
  passwordPlaceholder: string;
  loginError: string;
  loggingIn: string;
  loginButton: string;
  tip: string;
  welcomeBackTitle: string;
  welcomeBackDescription: string;
  bullet1: string;
  bullet2: string;
  bullet3: string;
  trustLine: string;
  formSubtitle: string;
  forgotPassword: string;
  keepMeLoggedIn: string;
  dontHaveAccount: string;
  createOne: string;
  secureLoginLine: string;
};

export type SignUpMessages = {
  title: string;
  description: string;
  confirmPasswordLabel: string;
  confirmPasswordPlaceholder: string;
  signupButton: string;
  signingUp: string;
  signupError: string;
  alreadyHaveAccount: string;
  loginLink: string;
  passwordMismatch: string;
  createAccountTitle: string;
  createAccountDescription: string;
  bullet1: string;
  bullet2: string;
  bullet3: string;
  trustLine: string;
  formSubtitle: string;
  passwordPlaceholder: string;
  passwordHint: string;
  termsAgreement: string;
  secureLoginLine: string;
};

export type OnboardingMessages = {
  title: string;
  description: string;
  footerHint: string;
  // Step 1: Grunninfo
  step1Title: string;
  step1Description: string;
  nameLabel: string;
  namePlaceholder: string;
  salonTypeLabel: string;
  salonTypeBarber: string;
  salonTypeNails: string;
  salonTypeMassage: string;
  salonTypeOther: string;
  paymentMethodLabel: string;
  paymentMethodPhysicalOnly: string;
  countryLabel: string;
  preferredLanguageLabel: string;
  whatsappNumberLabel: string;
  whatsappNumberPlaceholder: string;
  whatsappNumberHint: string;
  nextButton: string;
  // Step 2: Åpningstider
  step2Title: string;
  step2Description: string;
  openingHoursLabel: string;
  openingHoursDescription: string;
  dayLabel: string;
  closedLabel: string;
  openLabel: string;
  fromLabel: string;
  toLabel: string;
  monday: string;
  tuesday: string;
  wednesday: string;
  thursday: string;
  friday: string;
  saturday: string;
  sunday: string;
  onlineBookingLabel: string;
  onlineBookingYes: string;
  onlineBookingNo: string;
  publicBookingLabel: string;
  publicBookingYes: string;
  publicBookingNo: string;
  backButton: string;
  // Step 3: Bekreft
  step3Title: string;
  step3Description: string;
  summaryLabel: string;
  summarySalonName: string;
  summarySalonType: string;
  summaryCountry: string;
  summaryPaymentMethod: string;
  summaryPreferredLanguage: string;
  summaryOpeningHours: string;
  summaryOnlineBooking: string;
  summaryPublicBooking: string;
  createError: string;
  saving: string;
  createButton: string;
  // Legacy fields (for backward compatibility)
  saveButton: string;
  step1: string;
  step2: string;
  step3: string;
};

export type DashboardMessages = {
  brandSubtitle: string;
  overview: string;
  calendar: string;
  employees: string;
  services: string;
  shifts: string;
  customers: string;
  bookings: string;
  personalliste: string;
  feedback: string;
  support: string;
  onboarding: string;
  settings: string;
  tagline: string;
  builtFor: string;
  openNav: string;
  menu: string;
  closeNav: string;
  dashboardTitle: string;
  login: string;
  logout: string;
  langLabel: string;
  // Sidebar section headers
  sectionOverview: string;
  sectionOperations: string;
  sectionManagement: string;
  sectionCompliance: string;
  sectionSystem: string;
  // Extra menu labels
  products: string;
  reports: string;
  sales?: string;
  help?: string;
  salesDescription?: string;
  helpDescription?: string;
  salesTabGiftCards?: string;
  salesTabPackages?: string;
  helpTabFeedback?: string;
  helpTabSupport?: string;
  reportsDescription?: string;
  reportsTabOverview?: string;
  reportsTabCommissions?: string;
  reportsTabCapacity?: string;
  reportsTabExport?: string;
  helpNewCase?: string;
  helpSubmitFeedback?: string;
  tabAll?: string;
  tabOpen?: string;
  tabWaitingOnYou?: string;
  tabClosed?: string;
  tabNew?: string;
  tabInProgress?: string;
  tabDone?: string;
  helpNoFeedbackInCategory?: string;
  salesNewGiftCard?: string;
  salesNewPackage?: string;
  salesNoGiftCardsTitle?: string;
  salesNoGiftCardsDescription?: string;
  salesNoPackagesTitle?: string;
  salesNoPackagesDescription?: string;
  reportsFiltersTitle?: string;
  reportsFiltersClear?: string;
  reportsFiltersShow?: string;
  reportsFiltersHide?: string;
  reportsQuickRange?: string;
  reportsStartDate?: string;
  reportsEndDate?: string;
  reportsStatus?: string;
  reportsAll?: string;
  reportsPending?: string;
  reportsConfirmed?: string;
  reportsCompleted?: string;
  reportsCancelled?: string;
  reportsNoShow?: string;
  reportsService?: string;
  reportsAllServices?: string;
  reportsEmployee?: string;
  reportsAllEmployees?: string;
  supportDialogTitle?: string;
  supportDialogDescription?: string;
  supportSalonLabel?: string;
  supportCategory?: string;
  supportSubject?: string;
  supportSubjectPlaceholder?: string;
  supportDescriptionLabel?: string;
  supportDescriptionPlaceholder?: string;
  supportAttachments?: string;
  supportAttachmentsHint?: string;
  supportCancel?: string;
  supportSubmitting?: string;
  supportSubmitCase?: string;
  supportRateLimitError?: string;
  supportUnknownError?: string;
  supportUploadFailed?: string;
  feedbackDialogTitle?: string;
  feedbackDialogDescription?: string;
  feedbackType?: string;
  feedbackTitle?: string;
  feedbackTitlePlaceholder?: string;
  feedbackDescriptionLabel?: string;
  feedbackDescriptionPlaceholder?: string;
  feedbackBugDescriptionPlaceholder?: string;
  feedbackScreenshots?: string;
  feedbackScreenshotsHint?: string;
  feedbackCancel?: string;
  feedbackSubmitting?: string;
  feedbackSubmit?: string;
  feedbackDupeTitle?: string;
  feedbackDupeFound?: string;
  feedbackViewExisting?: string;
  feedbackDismiss?: string;
  feedbackRateLimitError?: string;
  feedbackUnknownError?: string;
  feedbackUploadFailed?: string;
  // Sidebar tooltips
  collapseSidebar: string;
  expandSidebar: string;
};

export type HomeMessages = {
  title: string;
  description: string;
  welcomeBack: string;
  welcomeSubtitle: string;
  // Today's bookings card
  todaysBookings: string;
  viewCalendar: string;
  noBookingsYet: string;
  noBookingsYetSubtitle: string;
  createFirstBooking: string;
  // Staff overview card
  yourStaff: string;
  manageStaff: string;
  online: string;
  offline: string;
  // Quick actions card
  quickActions: string;
  addNewBooking: string;
  addNewCustomer: string;
  addNewService: string;
  inviteNewStaff: string;
  // Performance snapshot
  thisWeek: string;
  bookingsLabel: string;
  newCustomersLabel: string;
  topServiceLabel: string;
  mostBookedStaffLabel: string;
  noInsightsYet: string;
  // KPI labels
  totalBookingsThisWeek: string;
  returningCustomers: string;
  newCustomers?: string;
  revenueEstimate: string;
  // Staff empty state
  manageStaffPermissions: string;
  // Announcements
  announcements: string;
  announcementWalkIn: string;
  announcementLanguages: string;
  announcementDashboardUpdate: string;
  viewAllUpdates: string;
  // Legacy (deprecated, kept for backward compatibility)
  nextStepTitle: string;
  nextStepDescription: string;
  nextStepBodyTitle: string;
  nextStepBodyText: string;
  onboardingTitle: string;
  onboardingDescription: string;
  onboardingBodyTitle: string;
  onboardingBodyText: string;
  bookingTitle: string;
  bookingDescription: string;
  bookingBodyTitle: string;
  bookingBodyText: string;
};

export type CalendarMessages = {
  title: string;
  description: string;
  mustBeLoggedIn: string;
  noSalon: string;
  loadError: string;
  selectedDayLabel: string;
  viewDay: string;
  viewWeek: string;
  filterEmployeeLabel: string;
  filterEmployeeAll: string;
  prev: string;
  today: string;
  next: string;
  loading: string;
  noEmployeesTitle: string;
  noEmployeesDescription: string;
  noBookingsTitle: string;
  noBookingsDescription: string;
  unknownService: string;
  unknownCustomer: string;
};

export type EmployeesMessages = {
  title: string;
  description: string;
  mustBeLoggedIn: string;
  noSalon: string;
  addError: string;
  newEmployee: string;
  nameLabel: string;
  emailLabel: string;
  phoneLabel: string;
  roleLabel: string;
  rolePlaceholder: string;
  preferredLanguageLabel: string;
  servicesLabel: string;
  servicesPlaceholder: string;
  namePlaceholder: string;
  emailPlaceholder: string;
  phonePlaceholder: string;
  loading: string;
  emptyTitle: string;
  emptyDescription: string;
  tableTitle: string;
  colName: string;
  colRole: string;
  colContact: string;
  colServices: string;
  colStatus: string;
  colActions: string;
  active: string;
  inactive: string;
  delete: string;
  edit: string;
  addButton: string;
  dialogTitle: string;
  dialogDescription: string;
  editTitle: string;
  editDescription: string;
  cancel: string;
  save: string;
  saving: string;
  updateError: string;
  // New: KPI / stats
  statsTotal?: string;
  statsActive?: string;
  statsInactive?: string;
  statsMissingSetup?: string;
  // New: Setup health
  colSetup?: string;
  completeSetup?: string;
  missingServices?: string;
  missingShifts?: string;
  notBookable?: string;
  canBeBooked?: string;
  addContact?: string;
  // New: Filters
  searchPlaceholder?: string;
  filterActive?: string;
  filterInactive?: string;
  filterMissingServices?: string;
  filterMissingShifts?: string;
  // New: Bulk assign
  assignServices?: string;
  assignServicesDescription?: string;
  selectAllVisible?: string;
  selectAllInCategory?: string;
  saveChanges?: string;
  // New: Detail dialog
  detailTitle?: string;
  detailServices?: string;
  detailRole?: string;
  detailContact?: string;
  detailStatus?: string;
  // New: Roles in Norwegian
  roleOwner?: string;
  roleManager?: string;
  roleStaff?: string;
  // New: Capacity
  capacityTitle?: string;
  capacityMessage?: string;
  deactivateToFree?: string;
  upgradePlan?: string;
  // New: Quick fix
  bookingBlocked?: string;
  fixNow?: string;
  // Detail dialog extra
  detailDescription?: string;
  editDescription2?: string;
  noServices?: string;
  shiftsRegistered?: string;
  noShifts?: string;
  close?: string;
  selectRole?: string;
  preferredLang?: string;
  // Employee empty state
  emptyActionDescription?: string;
  // Confirm delete
  confirmDelete?: string;
  // Setup shifts link
  setupShifts?: string;
  // Staff count
  staffCount?: string;
};

export type ServicesMessages = {
  title: string;
  description: string;
  mustBeLoggedIn: string;
  noSalon: string;
  addError: string;
  updateError: string;
  newService: string;
  nameLabel: string;
  namePlaceholder: string;
  categoryLabel: string;
  categoryCut: string;
  categoryBeard: string;
  categoryColor: string;
  categoryNails: string;
  categoryMassage: string;
  categoryOther: string;
  durationLabel: string;
  priceLabel: string;
  sortOrderLabel: string;
  loading: string;
  emptyTitle: string;
  emptyDescription: string;
  tableTitle: string;
  colName: string;
  colCategory: string;
  colDuration: string;
  colPrice: string;
  colStatus: string;
  colActions: string;
  active: string;
  inactive: string;
  delete: string;
  dialogTitle: string;
  dialogDescription: string;
  cancel: string;
  // New: KPI / stats
  statsTotal?: string;
  statsActive?: string;
  statsCategories?: string;
  statsWithoutEmployees?: string;
  // New: Table enrichment
  colEmployees?: string;
  colBuffer?: string;
  noEmployeesAssigned?: string;
  // New: Filters
  searchPlaceholder?: string;
  filterActive?: string;
  filterInactive?: string;
  groupByCategory?: string;
  // New: Templates
  addFromTemplate?: string;
  templateDialogTitle?: string;
  templateDialogDescription?: string;
  useSuggestedPrices?: string;
  suggestedPrice?: string;
  createSelected?: string;
  // New: Bulk actions
  bulkAdjustPrice?: string;
  bulkRoundPrice?: string;
  bulkChangeCategory?: string;
  bulkActivate?: string;
  bulkDeactivate?: string;
  previewChanges?: string;
  before?: string;
  after?: string;
  applyChanges?: string;
  // New: Detail dialog
  detailTitle?: string;
  save?: string;
  saving?: string;
  edit?: string;
  // New: Sort order
  moveUp?: string;
  moveDown?: string;
  // New: Prep/cleanup
  prepMinutesLabel?: string;
  cleanupMinutesLabel?: string;
  // Detail dialog
  detailDescription?: string;
  editDescription?: string;
  close?: string;
  // Bulk price dialog
  bulkDialogTitle?: string;
  bulkDialogAppliesTo?: string;
  bulkAdjustWithPercent?: string;
  bulkRoundOff?: string;
  percentLabel?: string;
  roundToNearest?: string;
  // Templates extra
  templateLeaveEmptyHint?: string;
  creating?: string;
  // Staff label
  staffCount?: string;
  staffUnit?: string;
  // Prep/cleanup badges
  prepBadge?: string;
  afterBadge?: string;
  // Confirm
  confirmDelete?: string;
};

export type CustomersMessages = {
  title: string;
  description: string;
  mustBeLoggedIn: string;
  noSalon: string;
  loadError: string;
  addError: string;
  newCustomer: string;
  nameLabel: string;
  namePlaceholder: string;
  emailLabel: string;
  emailPlaceholder: string;
  phoneLabel: string;
  phonePlaceholder: string;
  notesLabel: string;
  notesPlaceholder: string;
  gdprLabel: string;
  saving: string;
  addButton: string;
  tableTitle: string;
  loading: string;
  emptyTitle: string;
  emptyDescription: string;
  mobileConsentYes: string;
  mobileConsentNo: string;
  delete: string;
  colName: string;
  colContact: string;
  colNotes: string;
  colGdpr: string;
  colActions: string;
  consentYes: string;
  consentNo: string;
  dialogTitle: string;
  dialogDescription: string;
  cancel: string;
  // New: KPI / stats
  statsTotal?: string;
  statsWithConsent?: string;
  statsWithoutConsent?: string;
  statsWithoutContact?: string;
  // New: Filters
  searchPlaceholder?: string;
  filterWithConsent?: string;
  filterWithoutConsent?: string;
  filterWithContact?: string;
  filterWithoutContact?: string;
  // New: GDPR
  consentOk?: string;
  consentMissing?: string;
  requestConsent?: string;
  comingSoon?: string;
  // New: Detail dialog
  detailTitle?: string;
  detailBookingHistory?: string;
  detailNoHistory?: string;
  sendMessage?: string;
  copyPhone?: string;
  copyEmail?: string;
  copied?: string;
  edit?: string;
  save?: string;
  // New: Import
  importCustomers?: string;
  importDialogTitle?: string;
  importDialogDescription?: string;
  importUpload?: string;
  importPreview?: string;
  importConfirm?: string;
  importWillCreate?: string;
  importWillSkip?: string;
  importWillUpdate?: string;
  importError?: string;
  importUpdateExisting?: string;
  importProgress?: string;
  importDone?: string;
  importSelectFile?: string;
  importDragDrop?: string;
  importCreated?: string;
  importSkipped?: string;
  importUpdated?: string;
  importErrors?: string;
  // Detail dialog extra
  detailDescription?: string;
  editDescription?: string;
  close?: string;
  noNotes?: string;
  gdprConsentLabel?: string;
  bookingHistory?: string;
  noBookings?: string;
  sendMessageCopyPhone?: string;
  // Confirm
  confirmDelete?: string;
  customerHistoryTitle?: string;
  customerHistoryDescription?: string;
  customerHistoryFeatureTitle?: string;
  customerHistoryFeatureDescription?: string;
  customerHistoryUpgradePlan?: string;
  customerHistoryBackToCustomers?: string;
  customerHistoryLoading?: string;
  customerHistoryExporting?: string;
  customerHistoryExportCsv?: string;
  customerHistoryTotalVisits?: string;
  customerHistoryTotalBookingsSuffix?: string;
  customerHistoryTotalSpent?: string;
  customerHistoryFavoritePrefix?: string;
  customerHistoryFavoriteEmployee?: string;
  customerHistoryCancelledSuffix?: string;
  customerHistoryLastVisit?: string;
  customerHistoryFirstPrefix?: string;
  customerHistoryStatus?: string;
  customerHistoryAllStatuses?: string;
  customerHistoryNoBookingsFound?: string;
  customerHistoryDate?: string;
  customerHistoryService?: string;
  customerHistoryEmployee?: string;
  customerHistoryStatusLabel?: string;
  customerHistoryPrice?: string;
  customerHistoryShowing?: string;
  customerHistoryPrevious?: string;
  customerHistoryNext?: string;
};

export type BookingsMessages = {
  title: string;
  description: string;
  mustBeLoggedIn: string;
  noSalon: string;
  loadError: string;
  slotsError: string;
  invalidSlot: string;
  createError: string;
  listTitle: string;
  newBookingButton: string;
  loading: string;
  emptyTitle: string;
  emptyDescription: string;
  unknownService: string;
  unknownEmployee: string;
  unknownCustomer: string;
  colDate: string;
  colTime: string;
  colService: string;
  colEmployee: string;
  colCustomer: string;
  colStatus: string;
  colType: string;
  colNotes: string;
  statusPending: string;
  statusConfirmed: string;
  statusNoShow: string;
  statusCompleted: string;
  statusCancelled: string;
  statusScheduled: string;
  typeWalkIn: string;
  typeOnline: string;
  dialogTitle: string;
  dialogDescription: string;
  employeeLabel: string;
  employeePlaceholder: string;
  serviceLabel: string;
  servicePlaceholder: string;
  dateLabel: string;
  timeLabel: string;
  loadSlotsButton: string;
  loadingSlots: string;
  noSlotsYet: string;
  selectSlotPlaceholder: string;
  customerNameLabel: string;
  customerEmailLabel: string;
  customerEmailPlaceholder: string;
  customerPhoneLabel: string;
  customerPhonePlaceholder: string;
  isWalkInLabel: string;
  cancelButton: string;
  createBooking: string;
  creatingBooking: string;
  summaryBookings: string;
  summaryNoShow: string;
  summaryNeedsAction: string;
  statusAll: string;
  filterUpcoming: string;
  filterConfirmed: string;
  filterCompleted: string;
  filterCancelled: string;
  filterNoShow: string;
  sidebarNextCustomer: string;
  sidebarNoUpcoming: string;
  sidebarStartTreatment: string;
  sidebarCancelBooking: string;
  waitlistTab?: string;
};

export type ShiftsMessages = {
  title: string;
  description: string;
  mustBeLoggedIn: string;
  noSalon: string;
  loadError: string;
  addError: string;
  newShift: string;
  employeeLabel: string;
  employeePlaceholder: string;
  weekdayLabel: string;
  startLabel: string;
  endLabel: string;
  saving: string;
  addButton: string;
  needEmployeeHint: string;
  tableTitle: string;
  loading: string;
  emptyTitle: string;
  emptyDescription: string;
  mobileUnknownEmployee: string;
  desktopUnknownEmployee: string;
  colEmployee: string;
  colDay: string;
  colTime: string;
  colActions: string;
  delete: string;
  // Week view
  addShiftCta: string;
  hoursThisWeek: string;
  daysWorking: string;
  lowCapacity: string;
  overlap: string;
  outsideHours: string;
  weekNumber: string;
  totalHours: string;
  activeEmployees: string;
  // Copy shifts dialog
  copyShifts: string;
  copyStepSource: string;
  copyStepPattern: string;
  copyStepTargets: string;
  copyFromEmployee: string;
  copyFromOpeningHours: string;
  copyNoShiftsHint: string;
  copyAddInterval: string;
  copyMondayToRest: string;
  copyTotalHours: string;
  copySelectTargets: string;
  copySearchEmployee: string;
  copySelectAll: string;
  copySelectNone: string;
  copySelectWithoutShifts: string;
  copyStrategyAdditive: string;
  copyStrategyAdditiveDesc: string;
  copyStrategyReplace: string;
  copyStrategyReplaceDesc: string;
  copyStrategyReplaceConfirm: string;
  copyPreviewCreate: string;
  copyPreviewSkip: string;
  copyPreviewConflict: string;
  copyPreviewDetails: string;
  copyApplyButton: string;
  copyApplyingButton: string;
  copyResultToast: string;
  copyResultSkipped: string;
  copyResultClose: string;
  copyBack: string;
  copyNext: string;
  saved: string;
  override: string;
  template: string;
  today: string;
  // List view
  noShiftsForEmployee: string;
  invalidTime: string;
  setupShiftsTitle: string;
  setupShiftsDescription: string;
  collapseAll: string;
  expandAll: string;
};

export type PersonallisteMessages = {
  title: string;
  description: string;
  noSalon: string;
  loadError: string;
  dateFrom: string;
  dateTo: string;
  exportCsv: string;
  exportPdf: string;
  colDate: string;
  colEmployee: string;
  colCheckIn: string;
  colCheckOut: string;
  colDuration: string;
  colStatus: string;
  colChangedBy: string;
  statusOk: string;
  statusEdited: string;
  emptyTitle: string;
  emptyDescription: string;
  registerEntry: string;
  edit: string;
  registerDialogTitle: string;
  registerDialogDescription: string;
  editDialogTitle: string;
  editDialogDescription: string;
  employeePlaceholder: string;
  cancel: string;
  save: string;
  saving: string;
};

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
  shownOnBookingPage?: string;
  contactSectionTitle?: string;
  contactSectionDescription?: string;
  emailLabel?: string;
  // Status indicator
  missingSettingsName?: string;
  missingBookingLanguage?: string;
  allSettingsConfigured?: string;
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
  auditViewDetails?: string;
  profileTitle?: string;
  profileDescription?: string;
  profileCancel?: string;
  profileSaving?: string;
  profileSaveChanges?: string;
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

export type ProductsMessages = {
  title: string;
  description: string;
  noProducts: string;
  createFirst: string;
  name: string;
  price: string;
  stock: string;
  sku: string;
  status: string;
  actions: string;
  create: string;
  edit: string;
  delete: string;
  save: string;
  cancel: string;
  active: string;
  inactive: string;
  namePlaceholder: string;
  pricePlaceholder: string;
  stockPlaceholder: string;
  skuPlaceholder: string;
};

export type NotificationsMessages = {
  title: string;
  noNotifications: string;
  markAllRead: string;
  viewAll: string;
  justNow: string;
  minutesAgo: string;
  hoursAgo: string;
  daysAgo: string;
  bookingConfirmedTitle: string;
  bookingConfirmedBody: string;
  bookingChangedTitle: string;
  bookingChangedBody: string;
  bookingCancelledTitle: string;
  bookingCancelledBody: string;
  reminder24hTitle: string;
  reminder24hBody: string;
  reminder2hTitle: string;
  reminder2hBody: string;
  newBookingTitle: string;
  newBookingBody: string;
};

export type FeatureGateMessages = {
  upgradeRequired: string;
  upgradeDescription: string;
  viewPlans: string;
  goBack: string;
  shiftsDescription?: string;
  inventoryDescription?: string;
  advanced_reportsDescription?: string;
  exportsDescription?: string;
  brandingDescription?: string;
  [key: string]: string | undefined;
};

export type TranslationNamespaces = {
  publicBooking: PublicBookingMessages;
  login: LoginMessages;
  signup: SignUpMessages;
  onboarding: OnboardingMessages;
  dashboard: DashboardMessages;
  home: HomeMessages;
  calendar: CalendarMessages;
  employees: EmployeesMessages;
  services: ServicesMessages;
  customers: CustomersMessages;
  bookings: BookingsMessages;
  shifts: ShiftsMessages;
  personalliste: PersonallisteMessages;
  settings: SettingsMessages;
  admin: AdminMessages;
  products: ProductsMessages;
  notifications: NotificationsMessages;
  featureGate: FeatureGateMessages;
};

import { nb } from "./nb";
import { en } from "./en";
import { so } from "./so";
import { ar } from "./ar";
import { ti } from "./ti";
import { am } from "./am";
import { tr } from "./tr";
import { pl } from "./pl";
import { vi } from "./vi";
import { zh } from "./zh";
import { tl } from "./tl";
import { fa } from "./fa";
import { dar } from "./dar";
import { ur } from "./ur";
import { hi } from "./hi";

export const translations: Record<AppLocale, TranslationNamespaces> = {
  nb,
  en,
  so,
  ar,
  am,
  ti,
  tr,
  pl,
  vi,
  zh,
  tl,
  fa,
  dar,
  ur,
  hi,
};


