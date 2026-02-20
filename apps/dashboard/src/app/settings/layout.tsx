"use client";

import { useState, useEffect, useCallback, useRef, createContext, useContext } from "react";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { PageHeader } from "@/components/layout/page-header";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useLocale } from "@/components/locale-provider";
import { translations } from "@/i18n/translations";
import { normalizeLocale } from "@/i18n/normalizeLocale";
import { usePathname, useRouter } from "next/navigation";
import { useFeatures } from "@/lib/hooks/use-features";

// ─── Tab-switch dirty guard context ────────────────────

type DirtyStateMap = Record<string, boolean>;

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

// ─── Layout ───────────────────────────────────────────

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

  // Dirty state tracking
  const dirtyMapRef = useRef<DirtyStateMap>({});
  const [showGuardDialog, setShowGuardDialog] = useState(false);
  const pendingTabRef = useRef<string | null>(null);
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);

  useEffect(() => {
    setFeaturesMounted(true);
  }, []);

  useEffect(() => {
    setMounted(true);
  }, []);

  const appLocale = normalizeLocale(locale);
  const t = translations[appLocale].settings;

  const registerDirtyState = useCallback((tabId: string, isDirty: boolean) => {
    dirtyMapRef.current[tabId] = isDirty;
  }, []);

  const isAnyDirty = useCallback(() => {
    return Object.values(dirtyMapRef.current).some(Boolean);
  }, []);

  const reportLastSaved = useCallback((date: Date) => {
    setLastSavedAt(date);
  }, []);

  // Determine active tab based on pathname
  const activeTab = pathname.includes("/opening-hours")
    ? "opening-hours"
    : pathname.includes("/no-show-policy")
    ? "no-show-policy"
    : pathname.includes("/import")
    ? "import"
    : pathname.includes("/notifications")
    ? "notifications"
    : pathname.includes("/billing")
    ? "billing"
    : pathname.includes("/branding")
    ? "branding"
    : pathname.includes("/security")
    ? "security"
    : "general";

  const tabRoutes: Record<string, string> = {
    general: "/settings/general",
    "opening-hours": "/settings/opening-hours",
    "no-show-policy": "/settings/no-show-policy",
    import: "/settings/import",
    notifications: "/settings/notifications",
    billing: "/settings/billing",
    security: "/settings/security",
    branding: "/settings/branding",
  };

  const handleTabChange = (value: string) => {
    if (isAnyDirty()) {
      pendingTabRef.current = value;
      setShowGuardDialog(true);
      return;
    }
    const route = tabRoutes[value];
    if (route) router.push(route);
  };

  const handleGuardDiscard = () => {
    // Clear all dirty states
    dirtyMapRef.current = {};
    setShowGuardDialog(false);
    const tab = pendingTabRef.current;
    pendingTabRef.current = null;
    if (tab) {
      const route = tabRoutes[tab];
      if (route) router.push(route);
    }
  };

  const handleGuardStay = () => {
    pendingTabRef.current = null;
    setShowGuardDialog(false);
  };

  return (
    <TabGuardContext.Provider value={{ registerDirtyState, isAnyDirty, reportLastSaved }}>
      <DashboardShell>
        <PageHeader
          title={t.title}
          description={
            lastSavedAt
              ? `${t.description} \u00B7 Last saved ${lastSavedAt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`
              : t.description
          }
        />
        <div className="mt-6 tabular-nums">
          {mounted ? (
            <Tabs value={activeTab} className="w-full" onValueChange={handleTabChange}>
              <TabsList className="flex w-full max-w-5xl flex-wrap gap-0.5">
                <TabsTrigger value="general">{t.generalTab}</TabsTrigger>
                <TabsTrigger value="opening-hours">{t.openingHoursTab}</TabsTrigger>
                <TabsTrigger value="no-show-policy">No-show</TabsTrigger>
                <TabsTrigger value="import">Import</TabsTrigger>
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

        {/* Unsaved changes guard dialog */}
        <Dialog open={showGuardDialog} onOpenChange={setShowGuardDialog}>
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <DialogTitle>
                {t.unsavedChangesTitle ?? "Unsaved changes"}
              </DialogTitle>
              <DialogDescription>
                {t.unsavedChangesDescription ?? "You have unsaved changes that will be lost if you switch tabs."}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="ghost" onClick={handleGuardDiscard}>
                {t.discardAndSwitch ?? "Discard and switch"}
              </Button>
              <Button onClick={handleGuardStay}>
                {t.stayOnTab ?? "Stay"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </DashboardShell>
    </TabGuardContext.Provider>
  );
}
