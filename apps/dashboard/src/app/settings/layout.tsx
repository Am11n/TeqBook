"use client";

import { useState, useCallback, useRef, createContext, useContext, useEffect } from "react";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { TabbedPage, type TabDef } from "@teqbook/page";
import { useLocale } from "@/components/locale-provider";
import { translations } from "@/i18n/translations";
import { normalizeLocale } from "@/i18n/normalizeLocale";
import { usePathname, useRouter } from "next/navigation";
import { useFeatures } from "@/lib/hooks/use-features";

interface TabGuardContextValue {
  registerDirtyState: (tabId: string, isDirty: boolean) => void;
  isAnyDirty: () => boolean;
  reportLastSaved: (date: Date) => void;
}

const TabGuardContext = createContext<TabGuardContextValue>({
  registerDirtyState: () => {},
  isAnyDirty: () => false,
  reportLastSaved: () => {},
});

export function useTabGuard() {
  return useContext(TabGuardContext);
}

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  const { locale } = useLocale();
  const { hasFeature } = useFeatures();
  const [featuresMounted, setFeaturesMounted] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);

  useEffect(() => {
    setFeaturesMounted(true);
  }, []);

  const appLocale = normalizeLocale(locale);
  const t = translations[appLocale].settings;

  const dirtyMapRef = useRef<Record<string, boolean>>({});

  const registerDirtyState = useCallback((tabId: string, isDirty: boolean) => {
    dirtyMapRef.current[tabId] = isDirty;
  }, []);

  const isAnyDirty = useCallback(() => {
    return Object.values(dirtyMapRef.current).some(Boolean);
  }, []);

  const reportLastSaved = useCallback((date: Date) => {
    setLastSavedAt(date);
  }, []);

  const tabs: TabDef[] = [
    { id: "general", label: t.generalTab, href: "/settings/general" },
    { id: "opening-hours", label: t.openingHoursTab, href: "/settings/opening-hours" },
    { id: "no-show-policy", label: t.noShowTab ?? "No-show", href: "/settings/no-show-policy" },
    { id: "import", label: t.importTab ?? "Import", href: "/settings/import" },
    { id: "notifications", label: t.notificationsTab, href: "/settings/notifications" },
    { id: "billing", label: t.billingTab, href: "/settings/billing" },
    { id: "security", label: t.securityTab ?? "Security", href: "/settings/security" },
    { id: "audit-trail", label: t.auditTrailTab ?? "Audit Trail", href: "/settings/audit-trail" },
    { id: "branding", label: t.brandingTab, href: "/settings/branding", visible: featuresMounted && hasFeature("BRANDING") },
  ];

  const description = lastSavedAt
    ? `${t.description} \u00B7 ${t.lastSaved ?? "Last saved"} ${lastSavedAt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`
    : t.description;

  return (
    <TabGuardContext.Provider value={{ registerDirtyState, isAnyDirty, reportLastSaved }}>
      <DashboardShell>
        <TabbedPage
          title={t.title}
          description={description}
          tabs={tabs}
          guardEnabled
          usePathname={usePathname}
          useRouter={useRouter}
        >
          {children}
        </TabbedPage>
      </DashboardShell>
    </TabGuardContext.Provider>
  );
}
