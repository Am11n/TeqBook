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
  };
}
