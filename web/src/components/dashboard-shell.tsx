"use client";

import { ReactNode, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { CurrentUserBadge } from "@/components/current-user-badge";
import { CurrentSalonBadge } from "@/components/current-salon-badge";
import { Button } from "@/components/ui/button";
import { useLocale } from "@/components/locale-provider";
import { useCurrentSalon } from "@/components/salon-provider";
import { translations } from "@/i18n/translations";
import type { AppLocale } from "@/i18n/translations";
import { supabase } from "@/lib/supabase-client";

type DashboardShellProps = {
  children: ReactNode;
};

export function DashboardShell({ children }: DashboardShellProps) {
  const { locale, setLocale } = useLocale();
  const { salon } = useCurrentSalon();
  const router = useRouter();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

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

  async function handleLogout() {
    setLoggingOut(true);
    try {
      await supabase.auth.signOut();
      router.push("/landing");
    } catch (error) {
      console.error("Error logging out:", error);
      setLoggingOut(false);
    }
  }

  return (
    <div className="relative flex min-h-screen w-full overflow-x-hidden">
      {/* Desktop sidebar */}
      <aside className="hidden w-64 border-r bg-sidebar px-6 py-6 md:flex md:flex-col md:gap-8">
        <Link href="/dashboard" className="flex items-center gap-2">
          <Image
            src="/Favikon.svg"
            alt="TeqBook logo"
            width={120}
            height={32}
            className="h-8 w-auto"
            priority
          />
          <div className="flex flex-col">
            <span className="text-sm font-semibold tracking-tight">
              TeqBook
            </span>
            <span className="text-xs text-muted-foreground">
              {texts.brandSubtitle}
            </span>
          </div>
        </Link>

        <nav className="mt-4 flex flex-1 flex-col gap-1 text-sm">
          <NavLink href="/dashboard" label={texts.overview} />
          <NavLink href="/calendar" label={texts.calendar} />
          <NavLink href="/employees" label={texts.employees} />
          <NavLink href="/services" label={texts.services} />
          <NavLink href="/shifts" label={texts.shifts} />
          <NavLink href="/customers" label={texts.customers} />
          <NavLink href="/bookings" label={texts.bookings} />
          <NavLink
            href="/settings/general"
            label={translations[appLocale].settings.title}
            className="mt-4"
          />
        </nav>

        <p className="mt-auto text-xs text-muted-foreground">
          {texts.builtFor}
        </p>
      </aside>

      <main className="flex flex-1 flex-col">
        <header className="flex items-center justify-between border-b bg-background/70 px-3 py-2 backdrop-blur md:px-8 md:py-3">
          <div className="flex items-center gap-3">
            {/* Mobile menu button */}
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="h-8 w-8 rounded-md md:hidden"
              onClick={() => setMobileNavOpen(true)}
              aria-label={texts.openNav}
            >
              <span className="sr-only">{texts.menu}</span>
              <span className="flex flex-col gap-[3px]">
                <span className="block h-[2px] w-4 rounded bg-foreground" />
                <span className="block h-[2px] w-4 rounded bg-foreground" />
                <span className="block h-[2px] w-4 rounded bg-foreground" />
              </span>
            </Button>

            <div className="flex flex-col gap-0.5">
              <h1 className="text-base font-semibold tracking-tight md:text-lg">
                {texts.dashboardTitle}
              </h1>
              <p className="text-xs text-muted-foreground md:text-sm">
                {texts.tagline}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Language dropdown */}
            <div className="hidden items-center gap-1 rounded-full border bg-card px-2 py-1 text-[10px] font-medium text-muted-foreground sm:flex">
              <span>{texts.langLabel}:</span>
              <select
                value={locale}
                onChange={async (e) => {
                  const newLocale = e.target.value as AppLocale;
                  setLocale(newLocale);
                  
                  // Update salon's preferred_language in Supabase
                  if (salon?.id) {
                    await supabase
                      .from("salons")
                      .update({ preferred_language: newLocale })
                      .eq("id", salon.id);
                  }
                }}
                className="h-6 rounded-full border-none bg-transparent px-1 text-[10px] outline-none focus-visible:ring-0"
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
            </div>
            <div className="hidden flex-col items-end gap-1 text-right md:flex">
              <CurrentSalonBadge />
              <CurrentUserBadge />
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleLogout}
              disabled={loggingOut}
              className="h-8 text-xs"
            >
              {loggingOut ? "..." : texts.logout}
            </Button>
          </div>
        </header>

        <section className="flex-1 px-3 py-4 md:px-8 md:py-8">
          {children}
        </section>
      </main>

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

          {/* Sliding panel */}
          <div className="absolute inset-y-0 left-0 flex w-72 max-w-[80%] flex-col gap-6 border-r bg-sidebar px-5 py-5">
            <div className="flex items-center justify-between gap-2">
              <Link
                href="/dashboard"
                className="flex items-center gap-2"
                onClick={() => setMobileNavOpen(false)}
              >
                <Image
                  src="/Favikon.svg"
                  alt="TeqBook logo"
                  width={120}
                  height={32}
                  className="h-8 w-auto"
                  priority
                />
                <div className="flex flex-col">
                  <span className="text-sm font-semibold tracking-tight">
                    TeqBook
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {texts.brandSubtitle}
                  </span>
                </div>
              </Link>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => setMobileNavOpen(false)}
                aria-label={texts.closeNav}
              >
                <span className="block h-[2px] w-4 rotate-45 rounded bg-foreground" />
                <span className="block h-[2px] w-4 -rotate-45 rounded bg-foreground -mt-[2px]" />
              </Button>
            </div>

            <nav className="flex flex-1 flex-col gap-1 text-sm">
              <MobileNavLink
                href="/dashboard"
                label={texts.overview}
                onNavigate={() => setMobileNavOpen(false)}
              />
              <MobileNavLink
                href="/calendar"
                label={texts.calendar}
                onNavigate={() => setMobileNavOpen(false)}
              />
              <MobileNavLink
                href="/employees"
                label={texts.employees}
                onNavigate={() => setMobileNavOpen(false)}
              />
              <MobileNavLink
                href="/services"
                label={texts.services}
                onNavigate={() => setMobileNavOpen(false)}
              />
              <MobileNavLink
                href="/shifts"
                label={texts.shifts}
                onNavigate={() => setMobileNavOpen(false)}
              />
              <MobileNavLink
                href="/customers"
                label={texts.customers}
                onNavigate={() => setMobileNavOpen(false)}
              />
              <MobileNavLink
                href="/bookings"
                label={texts.bookings}
                onNavigate={() => setMobileNavOpen(false)}
              />
              <MobileNavLink
                href="/onboarding"
                label={texts.onboarding}
                onNavigate={() => setMobileNavOpen(false)}
              />
            </nav>

            {/* Language selector and logout for mobile */}
            <div className="mt-4 flex flex-col gap-2 border-t pt-4">
              <label className="text-xs font-medium text-muted-foreground">
                {texts.langLabel}:
              </label>
              <select
                value={locale}
                onChange={(e) => {
                  setLocale(e.target.value as any);
                  setMobileNavOpen(false);
                }}
                className="rounded-md border bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
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
                variant="outline"
                size="sm"
                onClick={handleLogout}
                disabled={loggingOut}
                className="mt-2 w-full text-xs"
              >
                {loggingOut ? "..." : texts.logout}
              </Button>
            </div>

            <p className="mt-auto text-xs text-muted-foreground">
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
  className?: string;
};

function NavLink({ href, label, className }: NavLinkProps) {
  return (
    <Link
      href={href}
      className={`rounded-md px-3 py-2 text-left text-muted-foreground hover:bg-sidebar-accent hover:text-foreground ${className ?? ""}`}
    >
      {label}
    </Link>
  );
}

type MobileNavLinkProps = NavLinkProps & {
  onNavigate?: () => void;
};

function MobileNavLink({ href, label, className, onNavigate }: MobileNavLinkProps) {
  return (
    <Link
      href={href}
      className={`rounded-md px-3 py-2 text-left text-foreground hover:bg-sidebar-accent ${className ?? ""}`}
      onClick={onNavigate}
    >
      {label}
    </Link>
  );
}


