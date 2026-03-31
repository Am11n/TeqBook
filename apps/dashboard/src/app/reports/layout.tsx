"use client";

import { useMemo } from "react";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { useLocale } from "@/components/locale-provider";
import { normalizeLocale } from "@/i18n/normalizeLocale";
import { translations } from "@/i18n/translations";
import { resolveNamespace } from "@/i18n/resolve-namespace";
import { TabbedPage, type TabDef } from "@teqbook/page";
import { usePathname, useRouter } from "next/navigation";

export default function ReportsLayout({ children }: { children: React.ReactNode }) {
  const { locale } = useLocale();
  const appLocale = normalizeLocale(locale);
  const t = useMemo(
    () => resolveNamespace("dashboard", translations[appLocale].dashboard),
    [appLocale],
  );

  const tabs: TabDef[] = [
    { id: "overview", label: t.reportsTabOverview, href: "/reports" },
    {
      id: "commissions",
      label: t.reportsTabCommissions,
      href: "/reports/commissions",
    },
    { id: "capacity", label: t.reportsTabCapacity, href: "/reports/capacity" },
    { id: "export", label: t.reportsTabExport, href: "/reports/export" },
  ];

  return (
    <DashboardShell>
      <TabbedPage
        title={t.reports}
        description={t.reportsDescription}
        tabs={tabs}
        usePathname={usePathname}
        useRouter={useRouter}
      >
        {children}
      </TabbedPage>
    </DashboardShell>
  );
}
