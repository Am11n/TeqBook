"use client";

import { DashboardShell } from "@/components/layout/dashboard-shell";
import { TabbedPage, type TabDef } from "@teqbook/page";
import { usePathname, useRouter } from "next/navigation";

const tabs: TabDef[] = [
  { id: "feedback", label: "Tilbakemelding", href: "/help/feedback" },
  { id: "support", label: "Support", href: "/help/support" },
];

export default function HelpLayout({ children }: { children: React.ReactNode }) {
  return (
    <DashboardShell>
      <TabbedPage
        title="Hjelp"
        description="Feedback and support"
        tabs={tabs}
        usePathname={usePathname}
        useRouter={useRouter}
      >
        {children}
      </TabbedPage>
    </DashboardShell>
  );
}
