"use client";

import { ReactNode, useState, useEffect, memo } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useLocale } from "@/components/locale-provider";
import { useCurrentSalon } from "@/components/salon-provider";
import { translations } from "@/i18n/translations";
import type { AppLocale } from "@/i18n/translations";
import { getCurrentUser, signOut } from "@/lib/services/auth-service";
import { ErrorBoundary } from "@/components/error-boundary";
import {
  LayoutDashboard,
  Shield,
  Users,
  Building2,
  TrendingUp,
  Menu,
  X,
  LogOut,
  User,
  Search,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { AdminCommandPalette } from "@/components/admin-command-palette";

type AdminShellProps = {
  children: ReactNode;
};

export function AdminShell({ children }: AdminShellProps) {
  return (
    <ErrorBoundary>
      <AdminShellContent>{children}</AdminShellContent>
    </ErrorBoundary>
  );
}

function AdminShellContent({ children }: AdminShellProps) {
  const { locale, setLocale } = useLocale();
  const { isSuperAdmin, profile } = useCurrentSalon();
  const router = useRouter();
  const pathname = usePathname();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Close mobile nav when route changes
  useEffect(() => {
    setMobileNavOpen(false);
  }, [pathname]);

  // Redirect if not superadmin
  useEffect(() => {
    if (mounted && !isSuperAdmin) {
      router.push("/dashboard");
    }
  }, [mounted, isSuperAdmin, router]);

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
  const texts = translations[appLocale].admin;

  useEffect(() => {
    async function loadUserEmail() {
      const { data: user } = await getCurrentUser();
      if (user?.email) {
        setUserEmail(user.email);
      }
    }
    loadUserEmail();
  }, []);

  async function handleSignOut() {
    setLoggingOut(true);
    try {
      const { error } = await signOut();
      if (error) {
        console.error("Error signing out:", error);
        setLoggingOut(false);
        return;
      }
      // Use window.location.replace for a full page reload to ensure clean logout
      // This prevents the back button from going back to admin pages
      window.location.replace("/");
    } catch (error) {
      console.error("Error signing out:", error);
      setLoggingOut(false);
    }
  }

  function getInitials(email: string | null) {
    if (!email) return "A";
    const name = email.split("@")[0];
    return name.charAt(0).toUpperCase() + (name.length > 1 ? name.charAt(1).toUpperCase() : "");
  }

  function toggleSidebar() {
    setSidebarCollapsed(!sidebarCollapsed);
  }

  // Admin-specific navigation items organized by sections
  const overviewItems = [
    { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  ];

  const managementItems = [
    { href: "/admin/salons", label: "Salons", icon: Building2 },
    { href: "/admin/users", label: "Users", icon: Users },
  ];

  const analyticsItems = [
    { href: "/admin/analytics", label: "Analytics", icon: TrendingUp },
  ];

  if (!mounted || !isSuperAdmin) {
    return null;
  }

  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden bg-gradient-to-br from-blue-50 via-slate-50 to-white">
      {/* Header - Full width at top */}
      <header className="sticky top-0 z-[50] flex h-[72px] w-full items-center justify-between border-b border-border bg-card/95 backdrop-blur-md shadow-[0_1px_3px_rgba(0,0,0,0.05)]">
        {/* Left: Logo + Admin (Desktop) / Hamburger (Mobile) */}
        <div className="flex items-center gap-3 pl-6">
          {/* Mobile: Hamburger menu */}
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-9 w-9 rounded-lg transition-transform hover:scale-105 md:hidden"
            onClick={() => setMobileNavOpen(true)}
            aria-label="Open navigation"
          >
            <Menu className="h-5 w-5" />
          </Button>

          {/* Desktop: Logo + Admin */}
          <Link
            href="/admin"
            className="hidden items-center gap-3 transition-all duration-150 hover:scale-105 hover:drop-shadow-[0_2px_8px_rgba(29,78,216,0.15)] md:flex"
          >
            <Image
              src="/Favikon.svg"
              alt="TeqBook Admin"
              width={32}
              height={32}
              className="h-8 w-8 transition-transform duration-150"
              priority
            />
            <span className="text-lg font-semibold tracking-tight text-foreground">
              TeqBook Admin
            </span>
          </Link>

          {/* Mobile: Logo centered */}
          <Link
            href="/admin"
            className="flex items-center gap-2 transition-opacity hover:opacity-80 md:hidden"
          >
            <Image
              src="/Favikon.svg"
              alt="TeqBook Admin"
              width={28}
              height={28}
              className="h-7 w-7"
              priority
            />
            <span className="text-base font-semibold tracking-tight text-foreground">
              TeqBook Admin
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
              Search salons, users, analytics...
            </span>
            <kbd className="hidden rounded-md bg-card/90 border border-border/60 px-2 py-0.5 font-mono text-[10px] font-medium text-muted-foreground shadow-sm lg:block">
              ⌘K
            </kbd>
          </button>
        </div>

        {/* Right: Language, Profile */}
        <div className="flex items-center gap-2 pr-6">
          {/* Language selector (Desktop) */}
          <div className="hidden h-9 w-9 items-center justify-center rounded-lg bg-card/60 backdrop-blur-lg transition-all hover:scale-105 hover:bg-muted/60 sm:flex">
            <select
              value={locale}
              onChange={(e) => {
                const newLocale = e.target.value as AppLocale;
                setLocale(newLocale);
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
                    {profile?.avatar_url && (
                      <AvatarImage src={profile.avatar_url} alt="Profile avatar" />
                    )}
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
                      {profile?.first_name && profile?.last_name
                        ? `${profile.first_name} ${profile.last_name}`
                        : userEmail || "Admin"}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                      Super Admin
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/profile" className="flex items-center gap-2 cursor-pointer">
                    <User className="h-4 w-4" />
                    <span>My profile</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleSignOut}
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
                    {profile?.avatar_url && (
                      <AvatarImage src={profile.avatar_url} alt="Profile avatar" />
                    )}
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
                      {profile?.first_name && profile?.last_name
                        ? `${profile.first_name} ${profile.last_name}`
                        : userEmail || "Admin"}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                      Super Admin
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/profile" className="flex items-center gap-2 cursor-pointer">
                    <User className="h-4 w-4" />
                    <span>My profile</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleSignOut}
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
                      isActive={pathname === item.href || pathname.startsWith(item.href + "/")}
                      collapsed={sidebarCollapsed}
                    />
                  ))}
                </div>
              </div>

              {/* Analytics Section */}
              <div>
                {!sidebarCollapsed && (
                  <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                    Analytics
                  </p>
                )}
                <div className="flex flex-col gap-1.5">
                  {analyticsItems.map((item) => (
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
            </nav>

            {/* Built for text at bottom */}
            {!sidebarCollapsed && (
              <div className="mt-auto pt-4 border-t border-border/60">
                <p className="text-xs text-muted-foreground">
                  Built for system administration
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

      {/* Admin Command Palette */}
      <AdminCommandPalette
        open={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
      />

      {/* Mobile nav overlay */}
      {mobileNavOpen && (
        <div className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm md:hidden">
          {/* Clickable backdrop */}
          <button
            type="button"
            aria-label="Close navigation"
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
              aria-label="Close navigation"
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
                        isActive={pathname === item.href || pathname.startsWith(item.href + "/")}
                        collapsed={false}
                      />
                    ))}
                  </div>
                </div>

                {/* Analytics Section */}
                <div>
                  <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                    Analytics
                  </p>
                  <div className="flex flex-col gap-1.5">
                    {analyticsItems.map((item) => (
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
              </nav>

              {/* Built for text at bottom */}
              <div className="mt-auto pt-4 border-t border-border/60">
                <p className="text-xs text-muted-foreground">
                  Built for system administration
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

const NavLink = memo(function NavLink({ href, label, icon: Icon, isActive = false, collapsed = false, className }: NavLinkProps) {
  const content = (
    <Link
      href={href}
      prefetch={true}
      className={`group relative flex items-center rounded-xl text-[15px] font-medium transition-all duration-150 ease-out ${
        isActive
          ? "bg-primary/10 text-primary"
          : "bg-transparent text-foreground/70 hover:bg-primary/5 hover:text-primary"
      } ${collapsed ? "justify-center px-3 py-3" : "gap-2 px-4 py-3"} ${className ?? ""} ${
        !isActive ? "hover:-translate-y-[1px]" : ""
      }`}
      onClick={(e) => {
        // Prevent sidebar from expanding when clicking a link in collapsed state
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
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            {content}
          </TooltipTrigger>
          <TooltipContent side="right">
            {label}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return content;
});
