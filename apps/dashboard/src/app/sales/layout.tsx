"use client";

import { DashboardShell } from "@/components/layout/dashboard-shell";
import { useLocale } from "@/components/locale-provider";
import { normalizeLocale } from "@/i18n/normalizeLocale";
import { translations } from "@/i18n/translations";
import { TabbedPage, type TabDef } from "@teqbook/page";
import { usePathname, useRouter } from "next/navigation";

export default function SalesLayout({ children }: { children: React.ReactNode }) {
  const { locale } = useLocale();
  const appLocale = normalizeLocale(locale);
  const t = translations[appLocale].dashboard;

  const tabs: TabDef[] = [
    {
      id: "gift-cards",
      label: t.salesTabGiftCards ?? "Gift Cards",
      href: "/sales/gift-cards",
    },
    {
      id: "packages",
      label: t.salesTabPackages ?? "Packages",
      href: "/sales/packages",
    },
  ];

  return (
    <DashboardShell>
      <TabbedPage
        title={t.sales ?? "Sales"}
        description={t.salesDescription ?? "Gift cards and service packages"}
        tabs={tabs}
        usePathname={usePathname}
        useRouter={useRouter}
      >
        {children}
      </TabbedPage>
    </DashboardShell>
  );
}
