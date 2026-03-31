import { Users, UserCheck, UserX, AlertTriangle } from "lucide-react";
import { createElement } from "react";
import { translations } from "@/i18n/translations";
import type { TranslationNamespaces } from "@/i18n/types";

type EmployeesT = TranslationNamespaces["employees"];

export function resolveEmployees(t: EmployeesT): Required<EmployeesT> {
  return { ...translations.en.employees, ...t } as Required<EmployeesT>;
}

export function buildStatsItems(
  t: EmployeesT,
  stats: { total: number; active: number; inactive: number; missingSetup: number },
) {
  const m = resolveEmployees(t);
  return [
    { label: m.statsTotal, value: stats.total, icon: createElement(Users, { className: "h-4 w-4" }) },
    {
      label: m.statsActive,
      value: stats.active,
      variant: "success" as const,
      icon: createElement(UserCheck, { className: "h-4 w-4" }),
    },
    {
      label: m.statsInactive,
      value: stats.inactive,
      variant: (stats.inactive > 0 ? "warning" : "default") as "warning" | "default",
      icon: createElement(UserX, { className: "h-4 w-4" }),
    },
    {
      label: m.statsMissingSetup,
      value: stats.missingSetup,
      variant: (stats.missingSetup > 0 ? "danger" : "default") as "danger" | "default",
      icon: createElement(AlertTriangle, { className: "h-4 w-4" }),
    },
  ];
}

export function buildFilterChips(
  t: EmployeesT,
  stats: { active: number; inactive: number },
  hasShiftsFeature: boolean,
) {
  const m = resolveEmployees(t);
  const chips = [
    { id: "active", label: m.filterActive, count: stats.active },
    { id: "inactive", label: m.filterInactive, count: stats.inactive },
    { id: "missing_services", label: m.filterMissingServices },
  ];
  if (hasShiftsFeature) chips.push({ id: "missing_shifts", label: m.filterMissingShifts });
  return chips;
}

export function buildCardViewTranslations(t: EmployeesT) {
  const m = resolveEmployees(t);
  return {
    active: m.active,
    inactive: m.inactive,
    delete: m.delete,
    edit: m.edit,
  };
}

export function buildEmployeesTableTranslations(t: EmployeesT) {
  const m = resolveEmployees(t);
  return {
    colName: m.colName,
    colRole: m.colRole,
    colContact: m.colContact,
    colServices: m.colServices,
    colStatus: m.colStatus,
    colActions: m.colActions,
    colSetup: m.colSetup,
    active: m.active,
    inactive: m.inactive,
    delete: m.delete,
    edit: m.edit,
    addContact: m.addContact,
    canBeBooked: m.canBeBooked,
    notBookable: m.notBookable,
  };
}

export function buildCreateDialogTranslations(t: EmployeesT) {
  const m = resolveEmployees(t);
  return {
    dialogTitle: m.dialogTitle,
    dialogDescription: m.dialogDescription,
    nameLabel: m.nameLabel,
    namePlaceholder: m.namePlaceholder,
    emailLabel: m.emailLabel,
    emailPlaceholder: m.emailPlaceholder,
    phoneLabel: m.phoneLabel,
    phonePlaceholder: m.phonePlaceholder,
    roleLabel: m.roleLabel,
    rolePlaceholder: m.rolePlaceholder,
    preferredLanguageLabel: m.preferredLanguageLabel,
    servicesLabel: m.servicesLabel,
    servicesPlaceholder: m.servicesPlaceholder,
    cancel: m.cancel,
    addButton: m.addButton,
  };
}

export function buildDetailDialogTranslations(t: EmployeesT) {
  const m = resolveEmployees(t);
  return {
    editTitle: m.editTitle,
    detailDescription: m.detailDescription,
    editDescription: m.editDescription2,
    active: m.active,
    inactive: m.inactive,
    canBeBooked: m.canBeBooked,
    notBookable: m.notBookable,
    detailRole: m.detailRole,
    detailContact: m.detailContact,
    noContact: m.detailNoContact,
    detailServices: m.detailServices,
    noServices: m.noServices,
    shiftsLabel: m.shiftsLabel,
    shiftsRegistered: m.shiftsRegistered,
    noShifts: m.noShifts,
    close: m.close,
    edit: m.edit,
    cancel: m.cancel,
    save: m.save,
    saving: m.saving,
    nameLabel: m.nameLabel,
    emailLabel: m.emailLabel,
    phoneLabel: m.phoneLabel,
    roleLabel: m.roleLabel,
    selectRole: m.selectRole,
    roleOwner: m.roleOwner,
    roleManager: m.roleManager,
    roleStaff: m.roleStaff,
    preferredLang: m.preferredLanguageLabel,
    servicesLabel: m.servicesLabel,
    saveChanges: m.saveChanges,
    editDescriptionRich: m.editDescriptionRich,
    profileContextLine: m.profileContextLine,
    basicInfoSectionTitle: m.basicInfoSectionTitle,
    basicInfoSectionDescription: m.basicInfoSectionDescription,
    publicProfileSectionTitle: m.publicProfileSectionTitle,
    publicProfileSectionDescription: m.publicProfileSectionDescription,
    servicesSectionTitle: m.servicesSectionTitle,
    servicesSectionDescription: m.servicesSectionDescription,
    publicTitleLabel: m.publicTitleLabel,
    publicTitlePlaceholder: m.publicTitlePlaceholder,
    publicSortOrderLabel: m.publicSortOrderLabel,
    publicSortOrderPlaceholder: m.publicSortOrderPlaceholder,
    publicSortOrderHint: m.publicSortOrderHint,
    profileImageLabel: m.profileImageLabel,
    profileImageHint: m.profileImageHint,
    uploadImage: m.uploadImage,
    removeImage: m.removeImage,
    uploadingImage: m.uploadingImage,
    retryUploadImage: m.retryUploadImage,
    specialtiesLabel: m.specialtiesLabel,
    specialtiesHint: m.specialtiesHint,
    specialtiesPlaceholder: m.specialtiesPlaceholder,
    bioLabel: m.bioLabel,
    bioHint: m.bioHint,
    bioPlaceholder: m.bioPlaceholder,
    publicProfileVisibleLabel: m.publicProfileVisibleLabel,
    selectedServicesCount: m.selectedServicesCount,
    validationNameRequired: m.validationNameRequired,
    validationNameMin: m.validationNameMin,
    validationEmailInvalid: m.validationEmailInvalid,
    validationSortOrderInvalid: m.validationSortOrderInvalid,
    validationTagTooLong: m.validationTagTooLong,
    validationImageInvalidType: m.validationImageInvalidType,
    validationImageTooLarge: m.validationImageTooLarge,
    profileImageUploadFailed: m.profileImageUploadFailed,
  };
}
