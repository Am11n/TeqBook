import { Users, UserCheck, UserX, AlertTriangle } from "lucide-react";
import { createElement } from "react";

export function buildStatsItems(
  t: Record<string, string>,
  stats: { total: number; active: number; inactive: number; missingSetup: number }
) {
  return [
    { label: t.statsTotal ?? "Total", value: stats.total, icon: createElement(Users, { className: "h-4 w-4" }) },
    { label: t.statsActive ?? "Active", value: stats.active, variant: "success" as const, icon: createElement(UserCheck, { className: "h-4 w-4" }) },
    { label: t.statsInactive ?? "Inactive", value: stats.inactive, variant: (stats.inactive > 0 ? "warning" : "default") as "warning" | "default", icon: createElement(UserX, { className: "h-4 w-4" }) },
    { label: t.statsMissingSetup ?? "Missing setup", value: stats.missingSetup, variant: (stats.missingSetup > 0 ? "danger" : "default") as "danger" | "default", icon: createElement(AlertTriangle, { className: "h-4 w-4" }) },
  ];
}

export function buildFilterChips(t: Record<string, string>, stats: { active: number; inactive: number }, hasShiftsFeature: boolean) {
  const chips = [
    { id: "active", label: t.filterActive ?? "Active", count: stats.active },
    { id: "inactive", label: t.filterInactive ?? "Inactive", count: stats.inactive },
    { id: "missing_services", label: t.filterMissingServices ?? "Missing services" },
  ];
  if (hasShiftsFeature) chips.push({ id: "missing_shifts", label: t.filterMissingShifts ?? "Missing shifts" });
  return chips;
}

export function buildCardViewTranslations(t: Record<string, string>) {
  return {
    active: t.active,
    inactive: t.inactive,
    delete: t.delete,
    edit: t.edit,
  };
}

export function buildEmployeesTableTranslations(t: Record<string, string>) {
  return {
    colName: t.colName,
    colRole: t.colRole,
    colContact: t.colContact,
    colServices: t.colServices,
    colStatus: t.colStatus,
    colActions: t.colActions,
    colSetup: t.colSetup ?? "Setup",
    active: t.active,
    inactive: t.inactive,
    delete: t.delete,
    edit: t.edit,
    addContact: t.addContact ?? "Add",
    canBeBooked: t.canBeBooked ?? "Can be booked",
    notBookable: t.notBookable ?? "Not bookable",
  };
}

export function buildCreateDialogTranslations(t: Record<string, string>) {
  return {
    dialogTitle: t.dialogTitle,
    dialogDescription: t.dialogDescription,
    nameLabel: t.nameLabel,
    namePlaceholder: t.namePlaceholder,
    emailLabel: t.emailLabel,
    emailPlaceholder: t.emailPlaceholder,
    phoneLabel: t.phoneLabel,
    phonePlaceholder: t.phonePlaceholder,
    roleLabel: t.roleLabel,
    rolePlaceholder: t.rolePlaceholder,
    preferredLanguageLabel: t.preferredLanguageLabel,
    servicesLabel: t.servicesLabel,
    servicesPlaceholder: t.servicesPlaceholder,
    cancel: t.cancel,
    addButton: t.addButton,
  };
}

export function buildDetailDialogTranslations(t: Record<string, string>) {
  return {
    editTitle: t.editTitle,
    detailDescription: t.detailDescription ?? "Overview of staff member, services and setup status.",
    editDescription: t.editDescription2 ?? "Update staff information and services.",
    active: t.active,
    inactive: t.inactive,
    canBeBooked: t.canBeBooked ?? "Can be booked",
    notBookable: t.notBookable ?? "Not bookable",
    detailRole: t.detailRole ?? "Role",
    detailContact: t.detailContact ?? "Contact",
    noContact: t.addContact ?? "No contact info",
    detailServices: t.detailServices ?? "Services",
    noServices: t.noServices ?? "No services assigned",
    shiftsLabel: t.missingShifts ? t.colSetup ?? "Shifts" : "Shifts",
    shiftsRegistered: t.shiftsRegistered ?? "shifts registered",
    noShifts: t.noShifts ?? "No shifts",
    close: t.close ?? "Close",
    edit: t.edit,
    cancel: t.cancel,
    save: t.save,
    saving: t.saving,
    nameLabel: t.nameLabel,
    emailLabel: t.emailLabel,
    phoneLabel: t.phoneLabel,
    roleLabel: t.roleLabel,
    selectRole: t.selectRole ?? "Select role...",
    roleOwner: t.roleOwner ?? "Owner",
    roleManager: t.roleManager ?? "Manager",
    roleStaff: t.roleStaff ?? "Staff",
    preferredLang: t.preferredLanguageLabel,
    servicesLabel: t.servicesLabel,
    saveChanges: t.saveChanges ?? "Save changes",
    editDescriptionRich:
      t.editDescriptionRich ?? "Update staff information, public profile, and services.",
    profileContextLine:
      t.profileContextLine ?? "Staff profile and booking visibility",
    basicInfoSectionTitle: t.basicInfoSectionTitle ?? "Basic info",
    basicInfoSectionDescription:
      t.basicInfoSectionDescription ?? "Core contact and role details.",
    publicProfileSectionTitle: t.publicProfileSectionTitle ?? "Public profile",
    publicProfileSectionDescription:
      t.publicProfileSectionDescription ?? "Shown on your public booking page.",
    servicesSectionTitle: t.servicesSectionTitle ?? "Services",
    servicesSectionDescription:
      t.servicesSectionDescription ?? "Choose which services this staff member can perform.",
    publicTitleLabel: t.publicTitleLabel ?? "Public title",
    publicTitlePlaceholder: t.publicTitlePlaceholder ?? "Senior Barber",
    publicSortOrderLabel: t.publicSortOrderLabel ?? "Public sort order",
    publicSortOrderPlaceholder: t.publicSortOrderPlaceholder ?? "0",
    publicSortOrderHint:
      t.publicSortOrderHint ?? "Lower numbers appear first in public booking.",
    profileImageLabel: t.profileImageLabel ?? "Profile image",
    profileImageHint: t.profileImageHint ?? "JPG, PNG, or WebP up to 5 MB.",
    uploadImage: t.uploadImage ?? "Upload image",
    removeImage: t.removeImage ?? "Remove image",
    uploadingImage: t.uploadingImage ?? "Uploading image…",
    retryUploadImage: t.retryUploadImage ?? "Try upload again",
    specialtiesLabel: t.specialtiesLabel ?? "Specialties",
    specialtiesHint:
      t.specialtiesHint ?? "Press Enter or comma to add specialties.",
    specialtiesPlaceholder: t.specialtiesPlaceholder ?? "e.g. Fade",
    bioLabel: t.bioLabel ?? "Bio",
    bioHint:
      t.bioHint ??
      "Tip: Keep it short and customer-friendly (recommended max 240 characters).",
    bioPlaceholder:
      t.bioPlaceholder ??
      "Tell customers briefly about experience, style, or what they can expect.",
    publicProfileVisibleLabel:
      t.publicProfileVisibleLabel ?? "Visible on public profile",
    selectedServicesCount: t.selectedServicesCount ?? "{count} selected services",
    validationNameRequired: t.validationNameRequired ?? "Name is required.",
    validationNameMin: t.validationNameMin ?? "Name must be at least 2 characters.",
    validationEmailInvalid:
      t.validationEmailInvalid ?? "Please enter a valid email address.",
    validationSortOrderInvalid:
      t.validationSortOrderInvalid ?? "Sort order must be a whole number 0 or above.",
    validationTagTooLong:
      t.validationTagTooLong ?? "Each specialty must be 32 characters or less.",
    validationImageInvalidType:
      t.validationImageInvalidType ??
      "Invalid image format. Use JPG, PNG, or WebP.",
    validationImageTooLarge:
      t.validationImageTooLarge ?? "Image is too large. Maximum size is 5 MB.",
  };
}
