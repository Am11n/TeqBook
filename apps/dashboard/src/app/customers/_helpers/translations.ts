import { createElement } from "react";
import { Users, ShieldCheck, ShieldX, PhoneOff } from "lucide-react";

export function buildStatsItems(
  t: Record<string, string>,
  stats: { total: number; withConsent: number; withoutConsent: number; withoutContact: number }
) {
  return [
    { label: t.statsTotal ?? "Total", value: stats.total, icon: createElement(Users, { className: "h-4 w-4" }) },
    { label: t.statsWithConsent ?? "With consent", value: stats.withConsent, variant: "success" as const, icon: createElement(ShieldCheck, { className: "h-4 w-4" }) },
    { label: t.statsWithoutConsent ?? "Without consent", value: stats.withoutConsent, variant: (stats.withoutConsent > 0 ? "warning" : "default") as "warning" | "default", icon: createElement(ShieldX, { className: "h-4 w-4" }) },
    { label: t.statsWithoutContact ?? "Without contact", value: stats.withoutContact, variant: (stats.withoutContact > 0 ? "danger" : "default") as "danger" | "default", icon: createElement(PhoneOff, { className: "h-4 w-4" }) },
  ];
}

export function buildTableTranslations(t: Record<string, string>) {
  return {
    colName: t.colName, colEmail: t.colEmail, colPhone: t.colPhone,
    colConsent: t.colConsent, colNotes: t.colNotes ?? "Notes",
    consentOk: t.consentOk ?? "OK", consentMissing: t.consentMissing ?? "Missing",
    delete: t.delete ?? "Delete", edit: t.edit ?? "Edit",
    noPhone: t.noPhone ?? "No phone", noEmail: t.noEmail ?? "No email",
  };
}

export function buildDetailDialogTranslations(t: Record<string, string>) {
  return {
    editTitle: t.editTitle ?? "Edit customer",
    detailDescription: t.detailDescription ?? "Customer overview",
    editDescription: t.editDescription ?? "Update customer info.",
    emailLabel: t.emailLabel ?? "Email", phoneLabel: t.phoneLabel ?? "Phone",
    nameLabel: t.nameLabel ?? "Name", notesLabel: t.notesLabel ?? "Notes",
    noNotes: t.noNotes ?? "No notes", gdprConsentLabel: t.gdprConsentLabel ?? "GDPR consent",
    consentOk: t.consentOk ?? "OK", consentMissing: t.consentMissing ?? "Missing",
    bookingHistory: t.bookingHistory ?? "Booking history",
    noBookings: t.noBookings ?? "No bookings yet",
    sendMessageCopyPhone: t.sendMessageCopyPhone ?? "Copy phone",
    copied: t.copied ?? "Copied", close: t.close ?? "Close",
    edit: t.edit ?? "Edit", cancel: t.cancel ?? "Cancel",
    save: t.save ?? "Save", saving: t.saving ?? "Saving...",
  };
}
