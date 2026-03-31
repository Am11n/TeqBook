"use client";

import { useMemo } from "react";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { useLocale } from "@/components/locale-provider";
import { normalizeLocale } from "@/i18n/normalizeLocale";
import { translations } from "@/i18n/translations";
import { resolveNamespace } from "@/i18n/resolve-namespace";
import { TabbedPage, type TabDef } from "@teqbook/page";
import { usePathname, useRouter } from "next/navigation";

export default function HelpLayout({ children }: { children: React.ReactNode }) {
  const { locale } = useLocale();
  const appLocale = normalizeLocale(locale);
  const t = useMemo(
    () => resolveNamespace("dashboard", translations[appLocale].dashboard),
    [appLocale],
  );

  const tabs: TabDef[] = [
    {
      id: "feedback",
      label: t.helpTabFeedback,
      href: "/help/feedback",
    },
    {
      id: "support",
      label: t.helpTabSupport,
      href: "/help/support",
    },
  ];

  return (
    <DashboardShell>
      <TabbedPage
        title={t.help}
        description={t.helpDescription}
        tabs={tabs}
        usePathname={usePathname}
        useRouter={useRouter}
      >
        {children}
      </TabbedPage>
    </DashboardShell>
  );
}
