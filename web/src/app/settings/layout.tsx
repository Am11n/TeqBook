"use client";

import { DashboardShell } from "@/components/dashboard-shell";
import { PageHeader } from "@/components/page-header";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useLocale } from "@/components/locale-provider";
import { translations } from "@/i18n/translations";
import type { AppLocale } from "@/i18n/translations";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { locale } = useLocale();
  const pathname = usePathname();
  
  const appLocale =
    locale === "nb"
      ? "nb"
      : locale === "ar"
        ? "ar"
        : locale === "so"
          ? "so"
          : locale === "ti"
            ? "ti"
            : locale === "am"
              ? "am"
              : locale === "tr"
                ? "tr"
                : locale === "pl"
                  ? "pl"
                  : locale === "vi"
                    ? "vi"
                    : locale === "zh"
                      ? "zh"
                      : locale === "tl"
                        ? "tl"
                        : locale === "fa"
                          ? "fa"
                          : locale === "dar"
                            ? "dar"
                            : locale === "ur"
                              ? "ur"
                              : locale === "hi"
                                ? "hi"
                                : "en";
  const t = translations[appLocale].settings;

  // Determine active tab based on pathname
  const activeTab = pathname.includes("/notifications")
    ? "notifications"
    : pathname.includes("/billing")
    ? "billing"
    : pathname.includes("/branding")
    ? "branding"
    : "general";

  return (
    <DashboardShell>
      <PageHeader title={t.title} description={t.description} />
      <div className="mt-6">
        <Tabs value={activeTab} className="w-full" onValueChange={(value) => {
          // Navigate when tab changes
          if (value === "general") window.location.href = "/settings/general";
          else if (value === "notifications") window.location.href = "/settings/notifications";
          else if (value === "billing") window.location.href = "/settings/billing";
          else if (value === "branding") window.location.href = "/settings/branding";
        }}>
          <TabsList className="grid w-full max-w-2xl grid-cols-4">
            <TabsTrigger value="general">{t.generalTab}</TabsTrigger>
            <TabsTrigger value="notifications">{t.notificationsTab}</TabsTrigger>
            <TabsTrigger value="billing">{t.billingTab}</TabsTrigger>
            <TabsTrigger value="branding">{t.brandingTab}</TabsTrigger>
          </TabsList>
          <TabsContent value={activeTab} className="mt-6">
            {children}
          </TabsContent>
        </Tabs>
      </div>
    </DashboardShell>
  );
}

