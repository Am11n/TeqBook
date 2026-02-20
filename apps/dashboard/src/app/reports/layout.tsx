"use client";

import { useState, useEffect } from "react";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { PageHeader } from "@/components/layout/page-header";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { usePathname, useRouter } from "next/navigation";

export default function ReportsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const activeTab = pathname.includes("/commissions")
    ? "commissions"
    : pathname.includes("/capacity")
    ? "capacity"
    : pathname.includes("/export")
    ? "export"
    : "overview";

  const tabRoutes: Record<string, string> = {
    overview: "/reports",
    commissions: "/reports/commissions",
    capacity: "/reports/capacity",
    export: "/reports/export",
  };

  const handleTabChange = (value: string) => {
    const route = tabRoutes[value];
    if (route) router.push(route);
  };

  return (
    <DashboardShell>
      <PageHeader title="Reports" description="Analytics, commissions, capacity and data exports" />
      <div className="mt-6">
        {mounted ? (
          <Tabs value={activeTab} className="w-full" onValueChange={handleTabChange}>
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="commissions">Commissions</TabsTrigger>
              <TabsTrigger value="capacity">Capacity</TabsTrigger>
              <TabsTrigger value="export">Export</TabsTrigger>
            </TabsList>
            <TabsContent value={activeTab} className="mt-6">
              {children}
            </TabsContent>
          </Tabs>
        ) : (
          <div className="mt-6">{children}</div>
        )}
      </div>
    </DashboardShell>
  );
}
