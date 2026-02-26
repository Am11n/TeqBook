"use client";

import { DashboardShell } from "@/components/layout/dashboard-shell";
import { useLocale } from "@/components/locale-provider";
import { normalizeLocale } from "@/i18n/normalizeLocale";
import { translations } from "@/i18n/translations";
import { TabbedPage, type TabDef } from "@teqbook/page";
import { usePathname, useRouter } from "next/navigation";

export default function HelpLayout({ children }: { children: React.ReactNode }) {
  const { locale } = useLocale();
  const appLocale = normalizeLocale(locale);
  const t = translations[appLocale].dashboard;

  const tabs: TabDef[] = [
    {
      id: "feedback",
      label: t.helpTabFeedback ?? t.feedback,
      href: "/help/feedback",
    },
    {
      id: "support",
      label: t.helpTabSupport ?? t.support,
      href: "/help/support",
    },
  ];

  return (
    <DashboardShell>
      <TabbedPage
        title={t.help ?? "Help"}
        description={t.helpDescription ?? "Feedback and support"}
        tabs={tabs}
        usePathname={usePathname}
        useRouter={useRouter}
      >
        {children}
      </TabbedPage>
    </DashboardShell>
  );
}
