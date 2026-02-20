"use client";

import { useState, useEffect } from "react";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { PageHeader } from "@/components/layout/page-header";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useLocale } from "@/components/locale-provider";
import { translations } from "@/i18n/translations";
import { normalizeLocale } from "@/i18n/normalizeLocale";
import { usePathname, useRouter } from "next/navigation";

export default function BookingsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { locale } = useLocale();
  const appLocale = normalizeLocale(locale);
  const t = translations[appLocale].bookings;
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const activeTab = pathname.includes("/waitlist") ? "waitlist" : "bookings";

  const tabRoutes: Record<string, string> = {
    bookings: "/bookings",
    waitlist: "/bookings/waitlist",
  };

  const handleTabChange = (value: string) => {
    const route = tabRoutes[value];
    if (route) router.push(route);
  };

  return (
    <DashboardShell>
      <PageHeader title={t.title} description={t.description} />
      <div className="mt-6">
        {mounted ? (
          <Tabs value={activeTab} className="w-full" onValueChange={handleTabChange}>
            <TabsList>
              <TabsTrigger value="bookings">{t.title}</TabsTrigger>
              <TabsTrigger value="waitlist">Waitlist</TabsTrigger>
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
