"use client";

import { useState, useEffect } from "react";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { PageHeader } from "@/components/layout/page-header";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useLocale } from "@/components/locale-provider";
import { translations } from "@/i18n/translations";
import { usePathname, useRouter } from "next/navigation";
import { useFeatures } from "@/lib/hooks/use-features";

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { locale } = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const { hasFeature } = useFeatures();
  const [mounted, setMounted] = useState(false);
  const [featuresMounted, setFeaturesMounted] = useState(false);

  // Only use features after mount to avoid hydration mismatch
  useEffect(() => {
    setFeaturesMounted(true);
  }, []);

  // Only render tabs on client to avoid hydration mismatch
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);
  
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
  const activeTab = pathname.includes("/opening-hours")
    ? "opening-hours"
    : pathname.includes("/notifications")
    ? "notifications"
    : pathname.includes("/billing")
    ? "billing"
    : pathname.includes("/branding")
    ? "branding"
    : pathname.includes("/security")
    ? "security"
    : "general";

  return (
    <DashboardShell>
      <PageHeader title={t.title} description={t.description} />
      <div className="mt-6">
        {mounted ? (
          <Tabs value={activeTab} className="w-full" onValueChange={(value) => {
            // Use client-side navigation for instant tab switching
            if (value === "general") router.push("/settings/general");
            else if (value === "opening-hours") router.push("/settings/opening-hours");
            else if (value === "notifications") router.push("/settings/notifications");
            else if (value === "billing") router.push("/settings/billing");
            else if (value === "security") router.push("/settings/security");
            else if (value === "branding") router.push("/settings/branding");
          }}>
            <TabsList className={`grid w-full max-w-3xl ${
              featuresMounted && hasFeature("BRANDING") ? "grid-cols-6" : "grid-cols-5"
            }`}>
              <TabsTrigger value="general">{t.generalTab}</TabsTrigger>
              <TabsTrigger value="opening-hours">{t.openingHoursTab}</TabsTrigger>
              <TabsTrigger value="notifications">{t.notificationsTab}</TabsTrigger>
              <TabsTrigger value="billing">{t.billingTab}</TabsTrigger>
              <TabsTrigger value="security">Security</TabsTrigger>
              {featuresMounted && hasFeature("BRANDING") && (
                <TabsTrigger value="branding">{t.brandingTab}</TabsTrigger>
              )}
            </TabsList>
            <TabsContent value={activeTab} className="mt-6">
              {children}
            </TabsContent>
          </Tabs>
        ) : (
          <div className="mt-6">
            {children}
          </div>
        )}
      </div>
    </DashboardShell>
  );
}

