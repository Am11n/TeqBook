"use client";

import { ReactNode, useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useLocale } from "@/components/locale-provider";
import { useCurrentSalon } from "@/components/salon-provider";
import { translations } from "@/i18n/translations";
import type { AppLocale } from "@/i18n/translations";
import { getCurrentUser, signOut } from "@/lib/services/auth-service";
import { getProfileForUser, updatePreferencesForUser } from "@/lib/services/profiles-service";
import { updateSalonSettings } from "@/lib/services/salons-service";
import { ErrorBoundary } from "@/components/error-boundary";
import {
  LayoutDashboard,
  Calendar,
  Users,
  Scissors,
  Clock,
  UserCircle,
  BookOpen,
  Settings,
  Shield,
  Menu,
  X,
  Search,
  ChevronLeft,
  ChevronRight,
  User,
  CreditCard,
  LogOut,
  TrendingUp,
  Package,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { CommandPalette } from "@/components/command-palette";
import { NotificationCenter } from "@/components/notification-center";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  canAccessSettings,
  canManageEmployees,
  canManageServices,
  canViewReports,
  canManageShifts,
  getRoleDisplayName,
} from "@/lib/utils/access-control";
import { useFeatures } from "@/lib/hooks/use-features";
import { useSessionTimeout } from "@/hooks/use-session-timeout";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

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

function DashboardShellContent({ children }: DashboardShellProps) {
  const { locale, setLocale } = useLocale();
  const { salon, isSuperAdmin, userRole, isReady, loading, user } = useCurrentSalon();
  const { hasFeature, loading: featuresLoading } = useFeatures();
  const { showWarning, timeRemaining, extendSession, logout: handleSessionLogout } = useSessionTimeout();
  const router = useRouter();
  const pathname = usePathname();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  
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
  const [loggingOut, setLoggingOut] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  // const [scrolled, setScrolled] = useState(false); // Reserved for future use
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

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
  const texts = translations[appLocale].dashboard;

  useEffect(() => {
    async function loadUserEmail() {
      const { data: user } = await getCurrentUser();
      setUserEmail(user?.email || null);
    }
    loadUserEmail();
  }, []);

  // Load sidebar collapse state from Supabase (only once per page session)
  useEffect(() => {
      // If we've already loaded the state globally, use it immediately
    if (globalSidebarState.loaded && globalSidebarState.state !== null) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSidebarCollapsed(globalSidebarState.state);
      return;
    }

    // Load from Supabase only if we haven't loaded it yet
    async function loadSidebarState() {
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

    const { data: user } = await getCurrentUser();
    if (!user) return;

    await updatePreferencesForUser(user.id, { sidebarCollapsed: newState });
  }

  // Ensure sidebar state persists across navigation
  // This prevents sidebar from auto-expanding when navigating
  // Sidebar state should only change when user explicitly clicks the collapse button

  // Scroll listener for header shadow (reserved for future use)
  // useEffect(() => {
  //   const handleScroll = () => {
  //     setScrolled(window.scrollY > 10);
  //   };
  //   window.addEventListener("scroll", handleScroll);
  //   return () => window.removeEventListener("scroll", handleScroll);
  // }, []);

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

  async function handleLogout() {
    setLoggingOut(true);
    try {
      await signOut();
      router.push("/");
    } catch (error) {
      console.error("Error logging out:", error);
      setLoggingOut(false);
    }
  }

  const getInitials = (email: string | null) => {
    if (!email) return "U";
    const name = email.split("@")[0];
    return name.charAt(0).toUpperCase() + (name.length > 1 ? name.charAt(1).toUpperCase() : "");
  };

  // Menu items organized by sections
  const overviewItems = [
    { href: "/dashboard", label: texts.overview, icon: LayoutDashboard },
  ];

  const operationsItems = [
    { href: "/calendar", label: texts.calendar, icon: Calendar },
    { href: "/bookings", label: texts.bookings, icon: BookOpen },
  ];

  // Only check features after mount to avoid hydration mismatch
  const managementItems = [
    ...(canManageEmployees(userRole) ? [{ href: "/employees", label: texts.employees, icon: Users }] : []),
    ...(canManageServices(userRole) ? [{ href: "/services", label: texts.services, icon: Scissors }] : []),
    { href: "/customers", label: texts.customers, icon: UserCircle }, // All roles can view customers
    // Only check features after mount to avoid hydration mismatch
    ...(mounted && canManageServices(userRole) && hasFeature("INVENTORY") ? [{ href: "/products", label: "Products", icon: Package }] : []),
    ...(mounted && canManageShifts(userRole) && hasFeature("SHIFTS") ? [{ href: "/shifts", label: texts.shifts, icon: Clock }] : []),
    ...(mounted && canViewReports(userRole) && hasFeature("ADVANCED_REPORTS") ? [{ href: "/reports", label: "Reports", icon: TrendingUp }] : []),
  ];

  const systemItems = [
    ...(canAccessSettings(userRole)
      ? [{ href: "/settings/general", label: translations[appLocale].settings.title, icon: Settings }]
      : []),
    // Only show admin link if not already on admin pages
    ...(isSuperAdmin && !pathname.startsWith("/admin")
      ? [{ href: "/admin", label: translations[appLocale].admin.title, icon: Shield }]
      : []),
  ];

  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden bg-gradient-to-br from-blue-50 via-slate-50 to-white">
      {/* Header - Full width at top */}
        <header className="sticky top-0 z-[50] flex h-[72px] w-full items-center justify-between border-b border-border bg-card/95 backdrop-blur-md shadow-[0_1px_3px_rgba(0,0,0,0.05)]">
        {/* Left: Logo + TeqBook (Desktop) / Hamburger (Mobile) */}
        <div className="flex items-center gap-3 pl-6">
          {/* Mobile: Hamburger menu */}
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-9 w-9 rounded-lg transition-transform hover:scale-105 md:hidden"
            onClick={() => setMobileNavOpen(true)}
            aria-label={texts.openNav}
          >
            <Menu className="h-5 w-5" />
          </Button>

          {/* Desktop: Logo + TeqBook */}
          <Link
            href="/dashboard"
            className="hidden items-center gap-3 transition-all duration-150 hover:scale-105 hover:drop-shadow-[0_2px_8px_rgba(29,78,216,0.15)] md:flex"
          >
            <Image
              src="/Favikon.svg"
              alt="TeqBook logo"
              width={32}
              height={32}
              className="h-8 w-8 transition-transform duration-150"
              priority
            />
            <span className="text-lg font-semibold tracking-tight text-foreground">
              TeqBook
            </span>
          </Link>

          {/* Mobile: Logo centered */}
          <Link
            href="/dashboard"
            className="flex items-center gap-2 transition-opacity hover:opacity-80 md:hidden"
          >
            <Image
              src="/Favikon.svg"
              alt="TeqBook logo"
              width={28}
              height={28}
              className="h-7 w-7"
              priority
            />
            <span className="text-base font-semibold tracking-tight text-foreground">
              TeqBook
            </span>
          </Link>
        </div>

        {/* Center: Global search (Desktop only) */}
        <div className="hidden flex-1 items-center justify-center px-4 md:flex">
          <button
            onClick={() => setCommandPaletteOpen(true)}
            className="group flex w-full max-w-[600px] items-center gap-3 rounded-full bg-card/60 backdrop-blur-sm px-4 h-10 text-left transition-all duration-150 shadow-[inset_0_2px_4px_rgba(0,0,0,0.04)] focus-within:ring-2 focus-within:ring-primary/20 focus-within:bg-card/80 hover:bg-card/70 hover:shadow-[inset_0_2px_6px_rgba(0,0,0,0.06)]"
            >
            <Search className="h-4 w-4 text-muted-foreground transition-colors group-hover:text-primary" />
            <span className="flex-1 text-sm text-muted-foreground group-hover:text-foreground">
              Search bookings, customers, services...
            </span>
            <kbd className="hidden rounded-md bg-card/90 border border-border/60 px-2 py-0.5 font-mono text-[10px] font-medium text-muted-foreground shadow-sm lg:block">
              ⌘K
            </kbd>
          </button>
        </div>

        {/* Right: Notifications, Language, Profile */}
        <div className="flex items-center gap-2 pr-6">
          {/* WhatsApp Quick Button */}
          {salon?.whatsapp_number && (
            <a
              href={`https://wa.me/${salon.whatsapp_number.replace(/[^0-9]/g, "")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden h-9 w-9 items-center justify-center rounded-lg bg-green-50 text-green-700 transition-all hover:scale-105 hover:bg-green-100 sm:flex"
              aria-label="Chat on WhatsApp"
            >
              <svg
                className="h-5 w-5"
                fill="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
              </svg>
            </a>
          )}

          {/* Notification Center */}
          <NotificationCenter />

          {/* Language selector (Desktop) */}
          <div className="hidden h-9 w-9 items-center justify-center rounded-lg bg-card/60 backdrop-blur-lg transition-all hover:scale-105 hover:bg-muted/60 sm:flex">
            <select
              value={locale}
              onChange={async (e) => {
                const newLocale = e.target.value as AppLocale;
                setLocale(newLocale);
                
                // Update salon's preferred_language via service
                if (salon?.id) {
                  await updateSalonSettings(salon.id, {
                    preferred_language: newLocale,
                  });
                }
              }}
              className="h-full w-full cursor-pointer border-none bg-transparent text-base outline-none focus:ring-0 appearance-none text-center"
              style={{ backgroundImage: 'none' }}
            >
              <option value="nb">🇳🇴</option>
              <option value="en">🇬🇧</option>
              <option value="ar">🇸🇦</option>
              <option value="so">🇸🇴</option>
              <option value="ti">🇪🇷</option>
              <option value="am">🇪🇹</option>
              <option value="tr">🇹🇷</option>
              <option value="pl">🇵🇱</option>
              <option value="vi">🇻🇳</option>
              <option value="tl">🇵🇭</option>
              <option value="zh">🇨🇳</option>
              <option value="fa">🇮🇷</option>
              <option value="dar">🇦🇫</option>
              <option value="ur">🇵🇰</option>
              <option value="hi">🇮🇳</option>
            </select>
          </div>

          {/* User avatar with dropdown */}
          <div suppressHydrationWarning>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="hidden h-9 w-9 items-center justify-center transition-all hover:scale-105 sm:flex">
                  <Avatar className="h-9 w-9 border-2 border-card shadow-sm transition-all hover:shadow-md">
                    <AvatarFallback className="bg-gradient-to-br from-blue-600 to-blue-400 text-xs font-semibold text-white">
                      {getInitials(userEmail)}
                    </AvatarFallback>
                  </Avatar>
                </button>
              </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-56 rounded-xl bg-white/90 backdrop-blur-md border border-neutral-200/70 shadow-lg"
            >
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {userEmail || "User"}
                  </p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {salon?.name || "Salon"}
                  </p>
                  {userRole && (
                    <p className="text-xs leading-none text-muted-foreground">
                      {getRoleDisplayName(userRole)}
                    </p>
                  )}
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              {canAccessSettings(userRole) && (
                <DropdownMenuItem asChild>
                  <Link href="/settings/general" className="flex items-center gap-2 cursor-pointer">
                    <User className="h-4 w-4" />
                    <span>My profile</span>
                  </Link>
                </DropdownMenuItem>
              )}
              <DropdownMenuItem disabled className="flex items-center gap-2">
                <CreditCard className="h-4 w-4" />
                <span>Billing (coming soon)</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleLogout}
                disabled={loggingOut}
                className="flex items-center gap-2 text-red-600 focus:text-red-600 cursor-pointer"
              >
                <LogOut className="h-4 w-4" />
                <span>{loggingOut ? "Logging out..." : "Log out"}</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          </div>

          {/* Mobile: Avatar only */}
          <div suppressHydrationWarning>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center sm:hidden">
                  <Avatar className="h-9 w-9 border-2 border-white shadow-sm">
                    <AvatarFallback className="bg-gradient-to-br from-blue-600 to-blue-400 text-xs font-semibold text-white">
                      {getInitials(userEmail)}
                    </AvatarFallback>
                  </Avatar>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-56 rounded-xl bg-white/90 backdrop-blur-md border border-neutral-200/70 shadow-lg"
              >
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {userEmail || "User"}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {salon?.name || "Salon"}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/settings/general" className="flex items-center gap-2 cursor-pointer">
                    <User className="h-4 w-4" />
                    <span>My profile</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem disabled className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4" />
                  <span>Billing (coming soon)</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleLogout}
                  disabled={loggingOut}
                  className="flex items-center gap-2 text-red-600 focus:text-red-600 cursor-pointer"
                >
                  <LogOut className="h-4 w-4" />
                  <span>{loggingOut ? "Logging out..." : "Log out"}</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Main content area with sidebar */}
      <div className="flex flex-1 overflow-hidden">
        {/* Desktop sidebar */}
        <aside
          className={`hidden border-r border-border/5 bg-sidebar backdrop-blur-md transition-all duration-[250ms] ease-in-out md:flex md:flex-col shadow-[0_20px_60px_rgba(15,23,42,0.08)] ${
            sidebarCollapsed ? "w-20" : "w-72"
          }`}
        >
        <div className="flex h-full flex-col p-5 overflow-y-auto">
          {/* Navigation */}
          <nav className="flex flex-1 flex-col gap-3 overflow-y-auto min-h-0">
            {/* Overview Section */}
            <div>
              {!sidebarCollapsed && (
                <div className="mb-2 flex items-center justify-between px-3">
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Overview
                  </p>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          onClick={toggleSidebar}
                          className="flex h-6 w-6 items-center justify-center rounded border border-primary/20 bg-primary/10 transition-colors hover:bg-primary/20 hover:border-primary/30"
                          aria-label="Collapse sidebar"
                        >
                          <ChevronLeft className="h-3 w-3 text-primary" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent side="right">
                        Collapse sidebar
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              )}
              {sidebarCollapsed && (
                <div className="mb-2 flex items-center justify-center">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          onClick={toggleSidebar}
                          className="flex h-6 w-6 items-center justify-center rounded border border-blue-200/60 bg-blue-50/80 transition-colors hover:bg-blue-100/60 hover:border-blue-300/60"
                          aria-label="Expand sidebar"
                        >
                          <ChevronRight className="h-3 w-3 text-primary" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent side="right">
                        Expand sidebar
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              )}
              <div className="flex flex-col gap-1.5">
                {overviewItems.map((item) => (
                  <NavLink
                    key={item.href}
                    href={item.href}
                    label={item.label}
                    icon={item.icon}
                    isActive={pathname === item.href || pathname.startsWith(item.href + "/")}
                    collapsed={sidebarCollapsed}
                  />
                ))}
              </div>
            </div>

            {/* Operations Section */}
            <div>
              {!sidebarCollapsed && (
                <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                  Operations
                </p>
              )}
              <div className="flex flex-col gap-1.5">
                {operationsItems.map((item) => (
                  <NavLink
                    key={item.href}
                    href={item.href}
                    label={item.label}
                    icon={item.icon}
                    isActive={pathname === item.href || pathname.startsWith(item.href + "/")}
                    collapsed={sidebarCollapsed}
                  />
                ))}
              </div>
            </div>

            {/* Management Section */}
            <div>
              {!sidebarCollapsed && (
                <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                  Management
                </p>
              )}
              <div className="flex flex-col gap-1.5">
                {managementItems.map((item) => (
                  <NavLink
                    key={item.href}
                    href={item.href}
                    label={item.label}
                    icon={item.icon}
                    isActive={pathname === item.href || pathname.startsWith(item.href)}
                    collapsed={sidebarCollapsed}
                  />
                ))}
              </div>
            </div>

            {/* System Section */}
            <div>
              {!sidebarCollapsed && (
                <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                  System
                </p>
              )}
              <div className="flex flex-col gap-1.5">
                {systemItems.map((item) => (
                  <NavLink
                    key={item.href}
                    href={item.href}
                    label={item.label}
                    icon={item.icon}
                    isActive={pathname.startsWith(item.href)}
                    collapsed={sidebarCollapsed}
                  />
                ))}
              </div>
            </div>
          </nav>

          {/* Built for text at bottom */}
          {!sidebarCollapsed && (
            <div className="mt-auto pt-4 border-t border-border/60">
              <p className="text-xs text-muted-foreground">
                {texts.builtFor}
              </p>
            </div>
          )}
        </div>
      </aside>

        <main className="flex flex-1 flex-col overflow-y-auto">
          <section className="flex-1 px-3 py-4 md:px-8 md:py-8">
            {children}
          </section>
        </main>
      </div>

      {/* Command Palette */}
      <CommandPalette
        open={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
      />

      {/* Session Timeout Warning Dialog */}
      <Dialog open={showWarning} onOpenChange={() => {}}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Session Timeout Warning</DialogTitle>
            <DialogDescription>
              Your session will expire in {timeRemaining}. Would you like to extend your session?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => {
                handleSessionLogout();
              }}
            >
              Log Out
            </Button>
            <Button
              onClick={() => {
                extendSession();
              }}
            >
              Stay Logged In
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Mobile nav overlay */}
      {mobileNavOpen && (
        <div className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm md:hidden">
          {/* Clickable backdrop */}
          <button
            type="button"
            aria-label="Lukk navigasjon"
            className="absolute inset-0 h-full w-full cursor-default"
            onClick={() => setMobileNavOpen(false)}
          />

          {/* Sliding panel - matching desktop sidebar */}
          <div className="absolute inset-y-0 left-0 flex w-80 max-w-[85%] flex-col border-r border-border/5 bg-sidebar backdrop-blur-md shadow-[0_20px_60px_rgba(15,23,42,0.08)] pt-[72px]">
            {/* Close button at top right */}
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute top-4 right-4 h-9 w-9 rounded-lg z-10"
              onClick={() => setMobileNavOpen(false)}
              aria-label={texts.closeNav}
            >
              <X className="h-5 w-5" />
            </Button>

            <div className="flex h-full flex-col p-5 overflow-y-auto">
              <nav className="flex flex-1 flex-col gap-3 overflow-y-auto min-h-0">
                {/* Overview Section */}
                <div>
                  <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                    Overview
                  </p>
                  <div className="flex flex-col gap-1.5">
                    {overviewItems.map((item) => (
                      <NavLink
                        key={item.href}
                        href={item.href}
                        label={item.label}
                        icon={item.icon}
                        isActive={pathname === item.href || pathname.startsWith(item.href + "/")}
                        collapsed={false}
                      />
                    ))}
                  </div>
                </div>

                {/* Operations Section */}
                <div>
                  <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                    Operations
                  </p>
                  <div className="flex flex-col gap-1.5">
                    {operationsItems.map((item) => (
                      <NavLink
                        key={item.href}
                        href={item.href}
                        label={item.label}
                        icon={item.icon}
                        isActive={pathname === item.href || pathname.startsWith(item.href + "/")}
                        collapsed={false}
                      />
                    ))}
                  </div>
                </div>

                {/* Management Section */}
                <div>
                  <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                    Management
                  </p>
                  <div className="flex flex-col gap-1.5">
                    {managementItems.map((item) => (
                      <NavLink
                        key={item.href}
                        href={item.href}
                        label={item.label}
                        icon={item.icon}
                        isActive={pathname === item.href || pathname.startsWith(item.href)}
                        collapsed={false}
                      />
                    ))}
                  </div>
                </div>

                {/* System Section */}
                <div>
                  <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                    System
                  </p>
                  <div className="flex flex-col gap-1.5">
                    {systemItems.map((item) => (
                      <NavLink
                        key={item.href}
                        href={item.href}
                        label={item.label}
                        icon={item.icon}
                        isActive={pathname.startsWith(item.href)}
                        collapsed={false}
                      />
                    ))}
                  </div>
                </div>
              </nav>

              {/* Built for text at bottom */}
              <div className="mt-auto pt-4 border-t border-border/60">
                <p className="text-xs text-muted-foreground">
                  {texts.builtFor}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

type NavLinkProps = {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  isActive?: boolean;
  collapsed?: boolean;
  className?: string;
};

function NavLink({ href, label, icon: Icon, isActive = false, collapsed = false, className }: NavLinkProps) {
  const content = (
    <Link
      href={href}
      className={`group relative flex items-center rounded-xl text-[15px] font-medium transition-all duration-150 ease-out ${
        isActive
          ? "bg-primary/10 text-primary"
          : "bg-transparent text-foreground/70 hover:bg-primary/5 hover:text-primary"
      } ${collapsed ? "justify-center px-3 py-3" : "gap-2 px-4 py-3"} ${className ?? ""} ${
        !isActive ? "hover:-translate-y-[1px]" : ""
      }`}
      onClick={(e) => {
        // Prevent sidebar from expanding when clicking a link in collapsed state
        // The link navigation will happen normally, but we don't want to change sidebar state
        e.stopPropagation();
      }}
    >
      {/* Active indicator pill */}
      {isActive && !collapsed && (
        <div className="absolute left-0 top-1/2 h-8 w-1 -translate-y-1/2 rounded-r-full bg-blue-700" />
      )}
      
      {/* Collapsed active indicator - circular glow */}
      {isActive && collapsed && (
        <div className="absolute inset-0 rounded-xl bg-blue-700/10" />
      )}
      
      <Icon
        className={`h-5 w-5 flex-shrink-0 transition-all duration-150 ${
          isActive
            ? "text-blue-700"
            : "text-muted-foreground group-hover:text-primary group-hover:opacity-100"
        } ${!isActive ? "opacity-70 group-hover:opacity-100" : ""}`}
      />
      {!collapsed && (
        <span className={`truncate transition-opacity duration-200 ${collapsed ? "opacity-0" : "opacity-100"}`}>
          {label}
        </span>
      )}
    </Link>
  );

  if (collapsed) {
    return (
      <TooltipProvider delayDuration={200}>
        <Tooltip>
          <TooltipTrigger asChild>{content}</TooltipTrigger>
          <TooltipContent side="right" className="rounded-lg bg-foreground px-2 py-1 text-xs text-background">
            {label}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return content;
}

type MobileNavLinkProps = NavLinkProps & {
  onNavigate?: () => void;
};

function MobileNavLink({
  href,
  label,
  icon: Icon,
  isActive = false,
  className,
  onNavigate,
}: MobileNavLinkProps) {
  return (
    <Link
      href={href}
      className={`group flex items-center gap-3 rounded-xl px-4 py-3 text-[15px] font-medium transition-all ${
        isActive
          ? "bg-primary text-primary-foreground shadow-[0_4px_14px_rgba(44,111,248,0.4)]"
          : "text-foreground/70 hover:bg-muted/50"
      } ${className ?? ""}`}
      onClick={onNavigate}
    >
      <Icon
        className={`h-5 w-5 ${
          isActive ? "text-primary-foreground" : "text-muted-foreground group-hover:text-foreground"
        }`}
      />
      <span>{label}</span>
    </Link>
  );
}


