"use client";

import { useState, useEffect } from "react";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { PageHeader } from "@/components/layout/page-header";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { usePathname, useRouter } from "next/navigation";

export default function SalesLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const activeTab = pathname.includes("/packages") ? "packages" : "gift-cards";

  const tabRoutes: Record<string, string> = {
    "gift-cards": "/sales/gift-cards",
    packages: "/sales/packages",
  };

  const handleTabChange = (value: string) => {
    const route = tabRoutes[value];
    if (route) router.push(route);
  };

  return (
    <DashboardShell>
      <PageHeader title="Salg" description="Gift cards and service packages" />
      <div className="mt-6">
        {mounted ? (
          <Tabs value={activeTab} className="w-full" onValueChange={handleTabChange}>
            <TabsList>
              <TabsTrigger value="gift-cards">Gift Cards</TabsTrigger>
              <TabsTrigger value="packages">Packages</TabsTrigger>
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
