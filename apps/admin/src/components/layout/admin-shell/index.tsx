"use client";

import { type ReactNode, useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useLocale } from "@/components/locale-provider";
import { useCurrentSalon } from "@/components/salon-provider";
import { translations, type AppLocale } from "@/i18n/translations";
import { CommandPalette } from "@/components/shared/command-palette";
import { getCurrentUser, signOut } from "@/lib/services/auth-service";
import { ErrorBoundary } from "@/components/error-boundary";
import { AdminCommandPalette } from "@/components/admin-command-palette";
import { ShellHeader } from "./ShellHeader";
import { SidebarNav } from "./SidebarNav";
import { MobileNav } from "./MobileNav";
import { NAV_SECTIONS, computeActiveHref } from "./nav-config";

const VALID_LOCALES = new Set<string>([
  "nb", "en", "ar", "so", "ti", "am", "tr", "pl", "vi", "zh", "tl", "fa", "dar", "ur", "hi",
]);

export function AdminShell({ children }: { children: ReactNode }) {
  return (
    <ErrorBoundary>
      <CommandPalette />
      <AdminShellContent>{children}</AdminShellContent>
    </ErrorBoundary>
  );
}

function AdminShellContent({ children }: { children: ReactNode }) {
  const { locale, setLocale } = useLocale();
  const { isSuperAdmin, profile, salon } = useCurrentSalon();
  const router = useRouter();
  const pathname = usePathname();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  useEffect(() => { setMounted(true); }, []);
  useEffect(() => { setMobileNavOpen(false); }, [pathname]);
  useEffect(() => {
    if (mounted && !isSuperAdmin) router.push("/dashboard");
  }, [mounted, isSuperAdmin, router]);

  const appLocale = (VALID_LOCALES.has(locale) ? locale : "en") as AppLocale;
  const texts = translations[appLocale].admin;
  void texts;

  useEffect(() => {
    getCurrentUser().then(({ data: user }) => {
      if (user?.email) setUserEmail(user.email);
    });
  }, []);

  async function handleSignOut() {
    setLoggingOut(true);
    try {
      const { error } = await signOut();
      if (error) { console.error("Error signing out:", error); setLoggingOut(false); return; }
      window.location.replace("/");
    } catch (error) {
      console.error("Error signing out:", error);
      setLoggingOut(false);
    }
  }

  const activeHref = computeActiveHref(pathname);

  if (!mounted || !isSuperAdmin) return null;

  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden bg-gradient-to-br from-blue-50 via-slate-50 to-white">
      <ShellHeader
        locale={locale}
        salon={salon}
        setLocale={setLocale}
        profile={profile}
        userEmail={userEmail}
        loggingOut={loggingOut}
        onOpenMobileNav={() => setMobileNavOpen(true)}
        onOpenCommandPalette={() => setCommandPaletteOpen(true)}
        onSignOut={handleSignOut}
      />

      <div className="flex flex-1 overflow-hidden">
        <aside
          className={`hidden border-r border-border/5 bg-sidebar backdrop-blur-md transition-all duration-[250ms] ease-in-out md:flex md:flex-col shadow-[0_20px_60px_rgba(15,23,42,0.08)] ${
            sidebarCollapsed ? "w-20" : "w-72"
          }`}
        >
          <div className="flex h-full flex-col p-5 overflow-y-auto">
            <SidebarNav
              sections={NAV_SECTIONS}
              activeHref={activeHref}
              collapsed={sidebarCollapsed}
              onToggle={() => setSidebarCollapsed((c) => !c)}
            />
            {!sidebarCollapsed && (
              <div className="mt-auto pt-4 border-t border-border/60">
                <p className="text-xs text-muted-foreground">Built for system administration</p>
              </div>
            )}
          </div>
        </aside>

        <main className="flex flex-1 flex-col overflow-y-auto">
          <section className="flex-1 px-3 py-4 md:px-8 md:py-8">{children}</section>
        </main>
      </div>

      <AdminCommandPalette open={commandPaletteOpen} onClose={() => setCommandPaletteOpen(false)} />
      <MobileNav open={mobileNavOpen} activeHref={activeHref} onClose={() => setMobileNavOpen(false)} />
    </div>
  );
}
