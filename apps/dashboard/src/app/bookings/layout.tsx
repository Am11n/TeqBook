"use client";

import { DashboardShell } from "@/components/layout/dashboard-shell";
import { TabbedPage, type TabDef } from "@teqbook/page";
import { useLocale } from "@/components/locale-provider";
import { translations } from "@/i18n/translations";
import { normalizeLocale } from "@/i18n/normalizeLocale";
import { usePathname, useRouter } from "next/navigation";

const tabs: TabDef[] = [
  { id: "bookings", label: "", href: "/bookings" },
  { id: "waitlist", label: "Waitlist", href: "/bookings/waitlist" },
];

export default function BookingsLayout({ children }: { children: React.ReactNode }) {
  const { locale } = useLocale();
  const appLocale = normalizeLocale(locale);
  const t = translations[appLocale].bookings;

  const localTabs: TabDef[] = [
    { ...tabs[0], label: t.title },
    tabs[1],
  ];

  return (
    <DashboardShell>
      <TabbedPage
        title={t.title}
        description={t.description}
        tabs={localTabs}
        usePathname={usePathname}
        useRouter={useRouter}
      >
        {children}
      </TabbedPage>
    </DashboardShell>
  );
}
