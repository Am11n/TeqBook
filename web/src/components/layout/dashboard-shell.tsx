"use client";

import { ReactNode, useState, useEffect, memo } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useLocale } from "@/components/locale-provider";
import { useCurrentSalon } from "@/components/salon-provider";
import { translations } from "@/i18n/translations";
import { normalizeLocale } from "@/i18n/normalizeLocale";
import { getProfileForUser, updatePreferencesForUser } from "@/lib/services/profiles-service";
import { ErrorBoundary } from "@/components/error-boundary";
import { CommandPalette } from "@/components/command-palette";
import { useFeatures } from "@/lib/hooks/use-features";
import { useSessionTimeout } from "@/hooks/use-session-timeout";
import { useDashboardMenuItems } from "@/lib/hooks/dashboard/useDashboardMenuItems";
import { DashboardHeader } from "./dashboard/DashboardHeader";
import { DashboardSidebar } from "./dashboard/DashboardSidebar";
import { MobileNavigation } from "./dashboard/MobileNavigation";
import { SessionTimeoutDialog } from "./dashboard/SessionTimeoutDialog";

type DashboardShellProps = {
  children: ReactNode;
};

// Module-level state to persist across component re-mounts (no localStorage, only in-memory)
// This ensures sidebar state persists when navigating between pages
let globalSidebarState: { loaded: boolean; state: boolean | null } = { loaded: false, state: null };

export function DashboardShell({ children }: DashboardShellProps) {
  return (
    <ErrorBoundary>
      <DashboardShellContent>{children}</DashboardShellContent>
    </ErrorBoundary>
  );
}

// Memoize DashboardShellContent to prevent unnecessary re-renders when only children change
// This ensures the sidebar doesn't re-render when navigating between pages
const DashboardShellContent = memo(function DashboardShellContent({ children }: DashboardShellProps) {
  const { locale } = useLocale();
  const { salon, isSuperAdmin, userRole, isReady, loading, user, profile } = useCurrentSalon();
  const { loading: featuresLoading, features } = useFeatures();
  const { showWarning, timeRemaining, extendSession, logout: handleSessionLogout } = useSessionTimeout();
  const router = useRouter();
  const pathname = usePathname();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const appLocale = normalizeLocale(locale);
  const texts = translations[appLocale].dashboard;

  // Don't render DashboardShell on admin pages - they use AdminShell instead
  if (pathname.startsWith("/admin")) {
    return <>{children}</>;
  }

  // Only use features after mount to avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  // Redirect unauthenticated users to login
  useEffect(() => {
    // Only check after mount and when loading is complete
    if (!mounted || loading) return;

    // List of public routes that don't require authentication
    const publicRoutes = ["/", "/login", "/signup", "/onboarding", "/landing"];
    const isPublicRoute = publicRoutes.includes(pathname) || pathname.startsWith("/book/");

    // If user is not authenticated and trying to access protected route, redirect to login
    // Check both user and isReady to ensure we have authenticated user data
    if (!isPublicRoute && (!user || !isReady)) {
      // Use replace to prevent back button from going back to protected route
      router.replace("/login");
      return;
    }
  }, [mounted, loading, user, isReady, pathname, router]);

  // Close mobile nav when route changes
  useEffect(() => {
    setMobileNavOpen(false);
  }, [pathname]);

  // Load sidebar collapse state from Supabase (only once per page session)
  useEffect(() => {
    // If we've already loaded the state globally, use it immediately
    if (globalSidebarState.loaded && globalSidebarState.state !== null) {
      setSidebarCollapsed(globalSidebarState.state);
      return;
    }

    // Load from Supabase only if we haven't loaded it yet
    async function loadSidebarState() {
      const { getCurrentUser } = await import("@/lib/services/auth-service");
      const { data: user } = await getCurrentUser();
      if (!user) {
        globalSidebarState = { loaded: true, state: false };
        return;
      }

      const { data: profile } = await getProfileForUser(user.id);

      if (profile?.user_preferences?.sidebarCollapsed !== undefined) {
        const isCollapsed = profile.user_preferences.sidebarCollapsed;
        globalSidebarState = { loaded: true, state: isCollapsed };
        setSidebarCollapsed(isCollapsed);
      } else {
        globalSidebarState = { loaded: true, state: false };
      }
    }
    loadSidebarState();
  }, []);

  // Save sidebar collapse state to Supabase
  // This is the ONLY function that should change sidebarCollapsed state
  async function toggleSidebar() {
    const newState = !sidebarCollapsed;
    setSidebarCollapsed(newState);

    // Update global state immediately so it persists across re-mounts
    globalSidebarState = { loaded: true, state: newState };

    const { getCurrentUser } = await import("@/lib/services/auth-service");
    const { data: user } = await getCurrentUser();
    if (!user) return;

    await updatePreferencesForUser(user.id, { sidebarCollapsed: newState });
  }

  // Keyboard shortcut for command palette (CMD+K / CTRL+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setCommandPaletteOpen(true);
      }
      // Close with Escape
      if (e.key === "Escape" && commandPaletteOpen) {
        setCommandPaletteOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [commandPaletteOpen]);

  // Get menu items using hook
  const { overviewItems, operationsItems, managementItems, systemItems } = useDashboardMenuItems({
    appLocale,
    userRole,
    isSuperAdmin,
    mounted,
    featuresLoading,
    features,
  });

  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden bg-gradient-to-br from-blue-50 via-slate-50 to-white">
      {/* Header */}
      <DashboardHeader
        salon={salon as any}
        profile={profile as any}
        userRole={userRole}
        locale={appLocale}
        onMobileNavOpen={() => setMobileNavOpen(true)}
        onCommandPaletteOpen={() => setCommandPaletteOpen(true)}
        texts={{
          openNav: texts.openNav,
        }}
      />

      {/* Main content area with sidebar */}
      <div className="flex flex-1 overflow-hidden">
        {/* Desktop sidebar */}
        <DashboardSidebar
          sidebarCollapsed={sidebarCollapsed}
          onToggleSidebar={toggleSidebar}
          overviewItems={overviewItems}
          operationsItems={operationsItems}
          managementItems={managementItems}
          systemItems={systemItems}
          pathname={pathname}
          builtForText={texts.builtFor}
        />

        <main className="flex flex-1 flex-col overflow-y-auto">
          <section className="flex-1 px-3 py-4 md:px-8 md:py-8">{children}</section>
        </main>
      </div>

      {/* Command Palette */}
      <CommandPalette open={commandPaletteOpen} onClose={() => setCommandPaletteOpen(false)} />

      {/* Session Timeout Warning Dialog */}
      <SessionTimeoutDialog
        open={showWarning}
        timeRemaining={timeRemaining}
        onExtendSession={extendSession}
        onLogout={handleSessionLogout}
      />

      {/* Mobile nav overlay */}
      <MobileNavigation
        open={mobileNavOpen}
        onClose={() => setMobileNavOpen(false)}
        overviewItems={overviewItems}
        operationsItems={operationsItems}
        managementItems={managementItems}
        systemItems={systemItems}
        pathname={pathname}
        builtForText={texts.builtFor}
        closeNavText={texts.closeNav}
      />
    </div>
  );
});
