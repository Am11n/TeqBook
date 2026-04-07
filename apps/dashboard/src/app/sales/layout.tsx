"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Button } from "@/components/ui/button";
import { useLocale } from "@/components/locale-provider";
import { normalizeLocale } from "@/i18n/normalizeLocale";
import { translations } from "@/i18n/translations";
import { resolveNamespace } from "@/i18n/resolve-namespace";
import { TabbedPage, type TabDef } from "@teqbook/page";
import { usePathname, useRouter as useNextNavigationRouter } from "next/navigation";
import { DASHBOARD_SALES_MODULE_ENABLED } from "@/lib/config/dashboard-modules";

function SalesModuleDisabledPlaceholder() {
  const router = useRouter();
  const { locale } = useLocale();
  const appLocale = normalizeLocale(locale);
  const t = useMemo(
    () => resolveNamespace("dashboard", translations[appLocale].dashboard),
    [appLocale],
  );

  return (
    <DashboardShell>
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4 px-4 text-center">
        <h1 className="text-lg font-semibold">
          {t.salesModuleUnavailableTitle ?? "Sales is not available yet"}
        </h1>
        <p className="text-sm text-muted-foreground max-w-md">
          {t.salesModuleUnavailableDescription ??
            "Gift cards and packages are being improved before this area opens for everyone."}
        </p>
        <Button type="button" onClick={() => router.push("/")}>
          {t.salesModuleBackToOverview ?? "Back to overview"}
        </Button>
      </div>
    </DashboardShell>
  );
}

export default function SalesLayout({ children }: { children: React.ReactNode }) {
  const { locale } = useLocale();
  const appLocale = normalizeLocale(locale);
  const t = useMemo(
    () => resolveNamespace("dashboard", translations[appLocale].dashboard),
    [appLocale],
  );

  if (!DASHBOARD_SALES_MODULE_ENABLED) {
    return <SalesModuleDisabledPlaceholder />;
  }

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
        useRouter={useNextNavigationRouter}
      >
        {children}
      </TabbedPage>
    </DashboardShell>
  );
}
