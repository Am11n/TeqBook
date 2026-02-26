"use client";

import { DashboardShell } from "@/components/layout/dashboard-shell";
import { useLocale } from "@/components/locale-provider";
import { normalizeLocale } from "@/i18n/normalizeLocale";
import { translations } from "@/i18n/translations";
import { TabbedPage, type TabDef } from "@teqbook/page";
import { usePathname, useRouter } from "next/navigation";

export default function ReportsLayout({ children }: { children: React.ReactNode }) {
  const { locale } = useLocale();
  const appLocale = normalizeLocale(locale);
  const t = translations[appLocale].dashboard;

  const tabs: TabDef[] = [
    { id: "overview", label: t.reportsTabOverview ?? "Overview", href: "/reports" },
    {
      id: "commissions",
      label: t.reportsTabCommissions ?? "Commissions",
      href: "/reports/commissions",
    },
    { id: "capacity", label: t.reportsTabCapacity ?? "Capacity", href: "/reports/capacity" },
    { id: "export", label: t.reportsTabExport ?? "Export", href: "/reports/export" },
  ];

  return (
    <DashboardShell>
      <TabbedPage
        title={t.reports}
        description={t.reportsDescription ?? "Analytics, commissions, capacity and data exports"}
        tabs={tabs}
        usePathname={usePathname}
        useRouter={useRouter}
      >
        {children}
      </TabbedPage>
    </DashboardShell>
  );
}
