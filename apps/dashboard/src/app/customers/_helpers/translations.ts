import { createElement } from "react";
import { Users, ShieldCheck, ShieldX, PhoneOff } from "lucide-react";
import type { ResolvedNamespace } from "@/i18n/resolve-namespace";

type RC = ResolvedNamespace<"customers">;

export function buildStatsItems(
  t: RC,
  stats: { total: number; withConsent: number; withoutConsent: number; withoutContact: number },
) {
  return [
    { label: t.statsTotal, value: stats.total, icon: createElement(Users, { className: "h-4 w-4" }) },
    {
      label: t.statsWithConsent,
      value: stats.withConsent,
      variant: "success" as const,
      icon: createElement(ShieldCheck, { className: "h-4 w-4" }),
    },
    {
      label: t.statsWithoutConsent,
      value: stats.withoutConsent,
      variant: (stats.withoutConsent > 0 ? "warning" : "default") as "warning" | "default",
      icon: createElement(ShieldX, { className: "h-4 w-4" }),
    },
    {
      label: t.statsWithoutContact,
      value: stats.withoutContact,
      variant: (stats.withoutContact > 0 ? "danger" : "default") as "danger" | "default",
      icon: createElement(PhoneOff, { className: "h-4 w-4" }),
    },
  ];
}

export function buildDetailDialogTranslations(t: RC) {
  return {
    editTitle: t.editTitle,
    detailDescription: t.detailDescription,
    editDescription: t.editDescription,
    emailLabel: t.emailLabel,
    phoneLabel: t.phoneLabel,
    nameLabel: t.nameLabel,
    notesLabel: t.notesLabel,
    noNotes: t.noNotes,
    gdprConsentLabel: t.gdprConsentLabel,
    consentOk: t.consentOk,
    consentMissing: t.consentMissing,
    bookingHistory: t.bookingHistory,
    noBookings: t.noBookings,
    sendMessageCopyPhone: t.sendMessageCopyPhone,
    copied: t.copied,
    close: t.close,
    edit: t.edit,
    cancel: t.cancel,
    save: t.save,
    saving: t.saving,
  };
}
