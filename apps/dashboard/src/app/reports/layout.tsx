"use client";

import { DashboardShell } from "@/components/layout/dashboard-shell";
import { TabbedPage, type TabDef } from "@teqbook/page";
import { usePathname, useRouter } from "next/navigation";

const tabs: TabDef[] = [
  { id: "overview", label: "Overview", href: "/reports" },
  { id: "commissions", label: "Commissions", href: "/reports/commissions" },
  { id: "capacity", label: "Capacity", href: "/reports/capacity" },
  { id: "export", label: "Export", href: "/reports/export" },
];

export default function ReportsLayout({ children }: { children: React.ReactNode }) {
  return (
    <DashboardShell>
      <TabbedPage
        title="Reports"
        description="Analytics, commissions, capacity and data exports"
        tabs={tabs}
        usePathname={usePathname}
        useRouter={useRouter}
      >
        {children}
      </TabbedPage>
    </DashboardShell>
  );
}
