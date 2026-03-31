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
  /** Shown when employee has no email or phone in detail view */
  detailNoContact?: string;
  detailStatus?: string;
  // New: Roles in Norwegian
  roleOwner?: string;
  roleManager?: string;
  roleStaff?: string;
  // New: Capacity
  capacityTitle?: string;
  capacityMessage?: string;
  /** Near limit banner title; use {entity} */
  capacityNearTitle?: string;
  /** Near limit banner body; use {current}, {limit}, {entity} */
  capacityNearMessage?: string;
  /** At-limit banner title; use {entity} */
  capacityBlockedTitle?: string;
  /** At-limit banner body; use {current}, {limit}, {entity} */
  capacityBlockedMessage?: string;
  deactivateToFree?: string;
  upgradePlan?: string;
  /** Progress row label when limit is set (e.g. Staff) */
  limitGaugeStaffLabel?: string;
  /** Shown when there is no numeric cap */
  limitGaugeUnlimitedStaff?: string;
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
  /** Shown when staff list or related data fails to load */
  listLoadError?: string;
  /** Label for shifts column / section in staff detail */
  shiftsLabel?: string;
  // Setup shifts link
  setupShifts?: string;
  // Staff count
  staffCount?: string;
  // Enhanced employee detail/edit modal
  editDescriptionRich?: string;
  profileContextLine?: string;
  basicInfoSectionTitle?: string;
  basicInfoSectionDescription?: string;
  publicProfileSectionTitle?: string;
  publicProfileSectionDescription?: string;
  servicesSectionTitle?: string;
  servicesSectionDescription?: string;
  publicTitleLabel?: string;
  publicTitlePlaceholder?: string;
  publicSortOrderLabel?: string;
  publicSortOrderPlaceholder?: string;
  publicSortOrderHint?: string;
  profileImageLabel?: string;
  profileImageHint?: string;
  uploadImage?: string;
  removeImage?: string;
  uploadingImage?: string;
  retryUploadImage?: string;
  specialtiesLabel?: string;
  specialtiesHint?: string;
  specialtiesPlaceholder?: string;
  bioLabel?: string;
  bioHint?: string;
  bioPlaceholder?: string;
  publicProfileVisibleLabel?: string;
  selectedServicesCount?: string;
  validationNameRequired?: string;
  validationNameMin?: string;
  validationEmailInvalid?: string;
  validationSortOrderInvalid?: string;
  validationTagTooLong?: string;
  validationImageInvalidType?: string;
  validationImageTooLarge?: string;
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
