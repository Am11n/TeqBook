"use client";

import { useMemo } from "react";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { useLocale } from "@/components/locale-provider";
import { normalizeLocale } from "@/i18n/normalizeLocale";
import { translations } from "@/i18n/translations";
import { resolveNamespace } from "@/i18n/resolve-namespace";
import { TabbedPage, type TabDef } from "@teqbook/page";
import { usePathname, useRouter } from "next/navigation";

export default function SalesLayout({ children }: { children: React.ReactNode }) {
  const { locale } = useLocale();
  const appLocale = normalizeLocale(locale);
  const t = useMemo(
    () => resolveNamespace("dashboard", translations[appLocale].dashboard),
    [appLocale],
  );

  const tabs: TabDef[] = [
    {
      id: "gift-cards",
      label: t.salesTabGiftCards,
      href: "/sales/gift-cards",
    },
    {
      id: "packages",
      label: t.salesTabPackages,
      href: "/sales/packages",
    },
  ];

  return (
    <DashboardShell>
      <TabbedPage
        title={t.sales}
        description={t.salesDescription}
        tabs={tabs}
        usePathname={usePathname}
        useRouter={useRouter}
      >
        {children}
      </TabbedPage>
    </DashboardShell>
  );
}
