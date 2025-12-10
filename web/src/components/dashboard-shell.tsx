"use client";

import { ReactNode, useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import { CurrentUserBadge } from "@/components/current-user-badge";
import { CurrentSalonBadge } from "@/components/current-salon-badge";
import { Button } from "@/components/ui/button";
import { useLocale } from "@/components/locale-provider";
import { useCurrentSalon } from "@/components/salon-provider";
import { translations } from "@/i18n/translations";
import type { AppLocale } from "@/i18n/translations";
import { getCurrentUser, signOut } from "@/lib/services/auth-service";
import { getProfileForUser, updatePreferencesForUser } from "@/lib/services/profiles-service";
import { updateSalonSettings } from "@/lib/services/salons-service";
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
  Bell,
  Menu,
  X,
  Search,
  ChevronLeft,
  ChevronRight,
  User,
  CreditCard,
  LogOut,
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type DashboardShellProps = {
  children: ReactNode;
};

// Module-level state to persist across component re-mounts (no localStorage, only in-memory)
// This ensures sidebar state persists when navigating between pages
let globalSidebarState: { loaded: boolean; state: boolean | null } = { loaded: false, state: null };

export function DashboardShell({ children }: DashboardShellProps) {
  const { locale, setLocale } = useLocale();
  const { salon, isSuperAdmin, user } = useCurrentSalon();
  const router = useRouter();
  const pathname = usePathname();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
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

  // Scroll listener for header shadow
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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

  const managementItems = [
    { href: "/employees", label: texts.employees, icon: Users },
    { href: "/services", label: texts.services, icon: Scissors },
    { href: "/customers", label: texts.customers, icon: UserCircle },
    { href: "/shifts", label: texts.shifts, icon: Clock },
  ];

  const systemItems = [
    { href: "/settings/general", label: translations[appLocale].settings.title, icon: Settings },
    ...(isSuperAdmin
      ? [{ href: "/admin", label: translations[appLocale].admin.title, icon: Shield }]
      : []),
  ];

  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden bg-gradient-to-br from-[#eef3ff] via-[#f5f7ff] to-white">
      {/* Header - Full width at top */}
        <header className="sticky top-0 z-[50] flex h-[72px] w-full items-center justify-between border-b border-white/10 bg-gradient-to-r from-white/95 via-blue-50/30 to-white/95 backdrop-blur-md shadow-[0_1px_3px_rgba(0,0,0,0.05)]">
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
            <span className="text-lg font-semibold tracking-tight text-slate-900">
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
            <span className="text-base font-semibold tracking-tight text-slate-900">
              TeqBook
            </span>
          </Link>
        </div>

        {/* Center: Global search (Desktop only) */}
        <div className="hidden flex-1 items-center justify-center px-4 md:flex">
          <button
            onClick={() => setCommandPaletteOpen(true)}
            className="group flex w-full max-w-[600px] items-center gap-3 rounded-full bg-white/60 backdrop-blur-sm px-4 h-10 text-left transition-all duration-150 shadow-[inset_0_2px_4px_rgba(0,0,0,0.04)] focus-within:ring-2 focus-within:ring-[#1d4ed8]/20 focus-within:bg-white/80 hover:bg-white/70 hover:shadow-[inset_0_2px_6px_rgba(0,0,0,0.06)]"
          >
            <Search className="h-4 w-4 text-slate-400 transition-colors group-hover:text-[#1d4ed8]" />
            <span className="flex-1 text-sm text-slate-500 group-hover:text-slate-700">
              Search bookings, customers, services...
            </span>
            <kbd className="hidden rounded-md bg-white/90 border border-slate-200/60 px-2 py-0.5 font-mono text-[10px] font-medium text-slate-500 shadow-sm lg:block">
              ⌘K
            </kbd>
          </button>
        </div>

        {/* Right: Notifications, Language, Profile */}
        <div className="flex items-center gap-2 pr-6">
          {/* Notification Center */}
          <NotificationCenter />

          {/* Language selector (Desktop) */}
          <div className="hidden h-9 w-9 items-center justify-center rounded-lg bg-white/60 backdrop-blur-lg transition-all hover:scale-105 hover:bg-slate-100/60 sm:flex">
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
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="hidden h-9 w-9 items-center justify-center transition-all hover:scale-105 sm:flex">
                <Avatar className="h-9 w-9 border-2 border-white shadow-sm transition-all hover:shadow-md">
                  <AvatarFallback className="bg-gradient-to-br from-[#3068FF] to-[#6BA8FF] text-xs font-semibold text-white">
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

          {/* Mobile: Avatar only */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center sm:hidden">
                <Avatar className="h-9 w-9 border-2 border-white shadow-sm">
                  <AvatarFallback className="bg-gradient-to-br from-[#3068FF] to-[#6BA8FF] text-xs font-semibold text-white">
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
      </header>

      {/* Main content area with sidebar */}
      <div className="flex flex-1 overflow-hidden">
        {/* Desktop sidebar */}
        <aside
          className={`hidden border-r border-white/5 bg-gradient-to-b from-white/40 via-white/50 to-white/40 backdrop-blur-md transition-all duration-[250ms] ease-in-out md:flex md:flex-col shadow-[0_20px_60px_rgba(15,23,42,0.08)] ${
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
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Overview
                  </p>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          onClick={toggleSidebar}
                          className="flex h-6 w-6 items-center justify-center rounded border border-blue-200/60 bg-blue-50/80 transition-colors hover:bg-blue-100/60 hover:border-blue-300/60"
                          aria-label="Collapse sidebar"
                        >
                          <ChevronLeft className="h-3 w-3 text-blue-600" />
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
                          <ChevronRight className="h-3 w-3 text-blue-600" />
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
                <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-widest text-slate-400">
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
                <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-widest text-slate-400">
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
                <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-widest text-slate-400">
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
            <div className="mt-auto pt-4 border-t border-slate-100/60">
              <p className="text-xs text-slate-500">
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

          {/* Sliding panel with glassmorphism */}
          <div className="absolute inset-y-0 left-0 flex w-80 max-w-[85%] flex-col gap-6 rounded-r-[28px] border-r border-white/35 bg-white/65 p-6 backdrop-blur-xl shadow-[0_4px_40px_rgba(20,20,70,0.08)] pt-[72px]">
            <div className="flex items-center justify-between gap-2 mb-4">
              <div className="flex items-center gap-3">
                <Image
                  src="/Favikon.svg"
                  alt="TeqBook logo"
                  width={32}
                  height={32}
                  className="h-8 w-8"
                  priority
                />
                <div className="flex flex-col">
                  <span className="text-base font-semibold tracking-tight text-slate-900">
                    TeqBook
                  </span>
                  <span className="text-xs text-slate-500">
                    {texts.brandSubtitle}
                  </span>
                </div>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-9 w-9 rounded-lg"
                onClick={() => setMobileNavOpen(false)}
                aria-label={texts.closeNav}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            <nav className="flex flex-1 flex-col gap-4">
              {/* Overview */}
              <div>
                <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Overview
                </p>
                <div className="flex flex-col gap-1">
                  {overviewItems.map((item) => (
                    <MobileNavLink
                      key={item.href}
                      href={item.href}
                      label={item.label}
                      icon={item.icon}
                      isActive={pathname === item.href}
                      onNavigate={() => setMobileNavOpen(false)}
                    />
                  ))}
                </div>
              </div>

              {/* Operations */}
              <div>
                <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Operations
                </p>
                <div className="flex flex-col gap-1">
                  {operationsItems.map((item) => (
                    <MobileNavLink
                      key={item.href}
                      href={item.href}
                      label={item.label}
                      icon={item.icon}
                      isActive={pathname === item.href}
                      onNavigate={() => setMobileNavOpen(false)}
                    />
                  ))}
                </div>
              </div>

              {/* Management */}
              <div>
                <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Management
                </p>
                <div className="flex flex-col gap-1">
                  {managementItems.map((item) => (
                    <MobileNavLink
                      key={item.href}
                      href={item.href}
                      label={item.label}
                      icon={item.icon}
                      isActive={pathname === item.href || pathname.startsWith(item.href)}
                      onNavigate={() => setMobileNavOpen(false)}
                    />
                  ))}
                </div>
              </div>

              {/* System */}
              <div>
                <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
                  System
                </p>
                <div className="flex flex-col gap-1">
                  {systemItems.map((item) => (
                    <MobileNavLink
                      key={item.href}
                      href={item.href}
                      label={item.label}
                      icon={item.icon}
                      isActive={pathname.startsWith(item.href)}
                      onNavigate={() => setMobileNavOpen(false)}
                    />
                  ))}
                </div>
              </div>
            </nav>

            {/* Language selector and logout for mobile */}
            <div className="mt-4 flex flex-col gap-2 border-t border-slate-200/50 pt-4">
              <label className="text-xs font-medium text-slate-600">
                {texts.langLabel}:
              </label>
              <select
                value={locale}
                onChange={(e) => {
                  setLocale(e.target.value as any);
                  setMobileNavOpen(false);
                }}
                className="rounded-lg border border-slate-200 bg-white/80 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#3068FF]/20"
              >
                <option value="nb">🇳🇴 Norsk</option>
                <option value="en">🇬🇧 English</option>
                <option value="ar">🇸🇦 العربية</option>
                <option value="so">🇸🇴 Soomaali</option>
                <option value="ti">🇪🇷 ትግርኛ</option>
                <option value="am">🇪🇹 አማርኛ</option>
                <option value="tr">🇹🇷 Türkçe</option>
                <option value="pl">🇵🇱 Polski</option>
                <option value="vi">🇻🇳 Tiếng Việt</option>
                <option value="tl">🇵🇭 Tagalog</option>
                <option value="zh">🇨🇳 中文</option>
                <option value="fa">🇮🇷 فارسی</option>
                <option value="dar">🇦🇫 دری</option>
                <option value="ur">🇵🇰 اردو</option>
                <option value="hi">🇮🇳 हिन्दी</option>
              </select>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                disabled={loggingOut}
                className="mt-2 w-full text-xs text-slate-600 hover:bg-slate-100"
              >
                {loggingOut ? "..." : texts.logout}
              </Button>
            </div>

            <p className="mt-auto text-xs text-slate-500">
              {texts.builtFor}
            </p>
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
          ? "bg-blue-50 text-[#1d4ed8]"
          : "bg-transparent text-slate-600 hover:bg-blue-50/50 hover:text-[#1d4ed8]"
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
        <div className="absolute left-0 top-1/2 h-8 w-1 -translate-y-1/2 rounded-r-full bg-[#1d4ed8]" />
      )}
      
      {/* Collapsed active indicator - circular glow */}
      {isActive && collapsed && (
        <div className="absolute inset-0 rounded-xl bg-[#1d4ed8]/10" />
      )}
      
      <Icon
        className={`h-5 w-5 flex-shrink-0 transition-all duration-150 ${
          isActive
            ? "text-[#1d4ed8]"
            : "text-slate-500 group-hover:text-[#1d4ed8] group-hover:opacity-100"
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
          <TooltipContent side="right" className="rounded-lg bg-slate-900 px-2 py-1 text-xs text-white">
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
          ? "bg-gradient-to-r from-[#2C6FF8] to-[#6BA8FF] text-white shadow-[0_4px_14px_rgba(44,111,248,0.4)]"
          : "text-slate-600 hover:bg-black/5"
      } ${className ?? ""}`}
      onClick={onNavigate}
    >
      <Icon
        className={`h-5 w-5 ${
          isActive ? "text-white" : "text-slate-400 group-hover:text-slate-600"
        }`}
      />
      <span>{label}</span>
    </Link>
  );
}


