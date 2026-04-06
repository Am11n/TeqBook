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
  globalSearchPlaceholder?: string;
  languageMenuLabel?: string;
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
  /** Feedback empty state (no entries yet) */
  helpFeedbackEmptyIntro?: string;
  helpFeedbackEmptyBugDescription?: string;
  helpFeedbackEmptyFeatureDescription?: string;
  helpFeedbackEmptyImprovementDescription?: string;
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
  /** Support case category (dialog + badges) */
  supportCategoryGeneral?: string;
  supportCategoryBookingIssue?: string;
  supportCategoryPaymentIssue?: string;
  supportCategoryAccountIssue?: string;
  supportCategoryFeatureRequest?: string;
  supportCategoryOther?: string;
  supportCaseStatusOpen?: string;
  supportCaseStatusInProgress?: string;
  supportCaseStatusWaitingOnYou?: string;
  supportCaseStatusResolved?: string;
  supportCaseStatusClosed?: string;
  supportPriorityCritical?: string;
  supportPriorityHigh?: string;
  supportPriorityMedium?: string;
  supportPriorityLow?: string;
  feedbackTypeBugReport?: string;
  feedbackTypeFeatureRequestOption?: string;
  feedbackTypeImprovement?: string;
  feedbackTypeOtherOption?: string;
  feedbackStatusNew?: string;
  feedbackStatusPlanned?: string;
  feedbackStatusInProgress?: string;
  feedbackStatusDelivered?: string;
  feedbackStatusRejected?: string;
  feedbackPriorityHigh?: string;
  feedbackPriorityMedium?: string;
  feedbackPriorityLow?: string;
  supportCaseMessagesHeading?: string;
  supportCaseNoMessagesYet?: string;
  supportCaseReplyPlaceholder?: string;
  supportReplyOneFileAttached?: string;
  /** e.g. "{count} files attached" */
  supportReplyManyFilesAttached?: string;
  helpSendButton?: string;
  helpSaveButton?: string;
  /** e.g. "Created {when}" */
  supportCaseCreatedLine?: string;
  supportCaseClosedBanner?: string;
  feedbackDetailEditButton?: string;
  feedbackNoDescriptionBody?: string;
  /** e.g. "Created {when}" */
  feedbackDetailCreatedLine?: string;
  feedbackConversationHeading?: string;
  feedbackConversationEmpty?: string;
  feedbackCommentPlaceholder?: string;
  feedbackDoneDeliveredBanner?: string;
  feedbackDoneRejectedBanner?: string;
  feedbackTeamLabel?: string;
  // Sidebar tooltips
  collapseSidebar: string;
  expandSidebar: string;
  productLockTitle: string;
  productLockDescription: string;
  productLockCta: string;
  /** DialogSelect / DialogMultiSelect empty list */
  dialogSelectNoOptions?: string;
  dialogSelectPlaceholderDefault?: string;
  /** "{count} selected" for multi-select summary */
  dialogMultiSelectSelected?: string;
  supportCaseNoDescription?: string;
  commissionsSalonDefault?: string;
  packagesUnknownService?: string;
  /** Gift cards table (sales) */
  salesGiftCardsColCode?: string;
  salesGiftCardsColRecipient?: string;
  salesGiftCardsColValue?: string;
  salesGiftCardsColStatus?: string;
  salesGiftCardsColCreated?: string;
  salesGiftCardsStatusActive?: string;
  salesGiftCardsStatusInactive?: string;
  salesGiftCardsRowDeactivate?: string;
  salesGiftCardsSearchPlaceholder?: string;
  salesGiftCardsEmptyMessage?: string;
  salesGiftCardsValueOf?: string;
  salesGiftCardsInvalidValue?: string;
  salesGiftCardsCreateDescription?: string;
  /** e.g. "Value ({currency})" */
  salesGiftCardsCreateValueLabel?: string;
  salesGiftCardsCreateValuePlaceholder?: string;
  salesGiftCardsCreateRecipientNameLabel?: string;
  salesGiftCardsCreateRecipientNamePlaceholder?: string;
  salesGiftCardsCreateRecipientEmailLabel?: string;
  salesGiftCardsCreateRecipientEmailPlaceholder?: string;
  salesGiftCardsCreateCreating?: string;
  salesGiftCardsCreateSubmit?: string;
};

export type HomeMessages = {
  title: string;
  description: string;
  welcomeBack: string;
  welcomeSubtitle: string;
  /** Shown when ADVANCED_REPORTS is off (e.g. Starter) — avoid promising performance insights */
  welcomeSubtitleStarter: string;
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
  announcementsLoading?: string;
  noAnnouncementsYet: string;
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
  // Find first available dialog
  findFirstAvailableTitle: string;
  findFirstAvailableDescription: string;
  findFirstAvailableServiceLabel: string;
  findFirstAvailableServicePlaceholder: string;
  findFirstAvailableFromLabel: string;
  findFirstAvailableToOptionalLabel: string;
  findFirstAvailableSearching: string;
  findFirstAvailableFindSlots: string;
  findFirstAvailableNoSlots: string;
  findFirstAvailableSlotCountOne: string;
  /** e.g. "{count} slots found" */
  findFirstAvailableSlotCountOther: string;
  findFirstAvailableBook: string;
  // Quick create panel (calendar); shares labels with bookings where applicable
  quickCreateDescription: string;
  quickCreateLoading: string;
  quickCreateCustomerSearchPlaceholder: string;
  /** e.g. Create new customer "{name}" */
  quickCreateNewCustomerNamed: string;
  quickCreateStartTimeLabel: string;
  /** e.g. "Total: {total}min" */
  quickCreateTotalDuration: string;
  quickCreatePrepAbbr: string;
  quickCreateServiceAbbr: string;
  quickCreateCleanupAbbr: string;
  quickCreateDurationJoin: string;
  // Toolbar / views
  toolbarNewShort: string;
  toolbarFindSlot: string;
  viewList: string;
  densityCompactTooltip: string;
  densityComfortableTooltip: string;
  // Command palette
  commandPalettePlaceholder: string;
  /** e.g. No commands found. Press Enter to search for "{query}" */
  commandPaletteNoMatchEnterSearch: string;
  commandPaletteDateModeHint: string;
  commandGoToDate: string;
  /** Reschedule: customer approval flow */
  rescheduleModalTitle: string;
  rescheduleSendToCustomer: string;
  rescheduleMoveNow: string;
  rescheduleBypassDialogTitle: string;
  rescheduleBypassReasonLabel: string;
  rescheduleBypassConfirm: string;
  rescheduleSendingProposal: string;
  rescheduleProposalSent: string;
  rescheduleProposalFailed: string;
  rescheduleNoCustomerContact: string;
  rescheduleTimelineTitle: string;
  rescheduleTimelineEmpty: string;
  rescheduleActCreated: string;
  rescheduleActActivated: string;
  rescheduleActSuperseded: string;
  rescheduleActAccepted: string;
  rescheduleActDeclined: string;
  rescheduleActExpired: string;
  rescheduleActFailedSlot: string;
  rescheduleActNotificationFailed: string;
  rescheduleActDirect: string;
  rescheduleActDelivery: string;
  rescheduleStatusPrefix: string;
};
