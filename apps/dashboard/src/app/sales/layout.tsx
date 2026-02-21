"use client";

import { DashboardShell } from "@/components/layout/dashboard-shell";
import { TabbedPage, type TabDef } from "@teqbook/page";
import { usePathname, useRouter } from "next/navigation";

const tabs: TabDef[] = [
  { id: "gift-cards", label: "Gift Cards", href: "/sales/gift-cards" },
  { id: "packages", label: "Packages", href: "/sales/packages" },
];

export default function SalesLayout({ children }: { children: React.ReactNode }) {
  return (
    <DashboardShell>
      <TabbedPage
        title="Salg"
        description="Gift cards and service packages"
        tabs={tabs}
        usePathname={usePathname}
        useRouter={useRouter}
      >
        {children}
      </TabbedPage>
    </DashboardShell>
  );
}
