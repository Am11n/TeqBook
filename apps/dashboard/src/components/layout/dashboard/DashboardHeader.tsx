"use client";

import Image from "next/image";
import Link from "next/link";
import { Menu, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { NotificationCenter } from "@/components/notification-center";
import { useLocale } from "@/components/locale-provider";
import { updateSalonSettings } from "@/lib/services/salons-service";
import { UserMenu } from "./UserMenu";
import type { Salon, Profile } from "@/lib/types";
import type { AppLocale } from "@/i18n/translations";

interface DashboardHeaderProps {
  salon: Salon | null;
  profile: Profile | null;
  userRole: string | null;
  locale: string;
  onMobileNavOpen: () => void;
  onCommandPaletteOpen: () => void;
  texts: {
    openNav: string;
  };
}

export function DashboardHeader({
  salon,
  profile,
  userRole,
  locale,
  onMobileNavOpen,
  onCommandPaletteOpen,
  texts,
}: DashboardHeaderProps) {
  return (
    <header className="sticky top-0 z-[50] flex h-[72px] w-full items-center justify-between border-b border-border bg-card/95 backdrop-blur-md shadow-[0_1px_3px_rgba(0,0,0,0.05)]">
      {/* Left: Logo + TeqBook (Desktop) / Hamburger (Mobile) */}
      <div className="flex items-center gap-3 pl-6">
        {/* Mobile: Hamburger menu */}
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-9 w-9 rounded-lg transition-transform hover:scale-105 md:hidden"
          onClick={onMobileNavOpen}
          aria-label={texts.openNav}
        >
          <Menu className="h-5 w-5" />
        </Button>

        {/* Desktop: Logo + TeqBook */}
        <Link
          href="/"
          prefetch={true}
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
          href="/"
          prefetch={true}
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
          onClick={onCommandPaletteOpen}
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
        {/* Notification Center */}
        <NotificationCenter />

        {/* Language selector (Desktop) */}
        <LanguageSelector locale={locale} salon={salon} />

        {/* User menu - Desktop */}
        <UserMenu profile={profile} salon={salon} userRole={userRole} isMobile={false} />

        {/* User menu - Mobile */}
        <UserMenu profile={profile} salon={salon} userRole={userRole} isMobile={true} />
      </div>
    </header>
  );
}

// Language selector component
function LanguageSelector({
  locale,
  salon,
}: {
  locale: string;
  salon: Salon | null;
}) {
  const { setLocale } = useLocale();

  const languageMap: Record<AppLocale, string> = {
    nb: "🇳🇴",
    en: "🇬🇧",
    ar: "🇸🇦",
    so: "🇸🇴",
    ti: "🇪🇷",
    am: "🇪🇹",
    tr: "🇹🇷",
    pl: "🇵🇱",
    vi: "🇻🇳",
    tl: "🇵🇭",
    zh: "🇨🇳",
    fa: "🇮🇷",
    dar: "🇦🇫",
    ur: "🇵🇰",
    hi: "🇮🇳",
  };

  const supportedLanguages =
    salon?.supported_languages && salon.supported_languages.length > 0
      ? salon.supported_languages
      : ["en", "nb"];

  const currentLocale = supportedLanguages.includes(locale as AppLocale)
    ? (locale as AppLocale)
    : ((supportedLanguages[0] || "en") as AppLocale);

  async function handleChange(newLocaleRaw: string) {
    const newLocale = newLocaleRaw as AppLocale;
    setLocale(newLocale);

    if (salon?.id) {
      await updateSalonSettings(salon.id, {
        preferred_language: newLocale,
      });
    }
  }

  return (
    <>
      {/* Mobile */}
      <div className="sm:hidden">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="flex h-9 w-9 items-center justify-center rounded-lg bg-card/60 backdrop-blur-lg outline-none transition-all hover:bg-muted/60 focus-visible:ring-2 focus-visible:ring-primary/20"
              aria-label="Language"
              title="Language"
            >
              <span className="text-base leading-none">
                {languageMap[currentLocale] || "🌐"}
              </span>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="min-w-36">
            {supportedLanguages.map((lang) => {
              const localeValue = lang as AppLocale;
              const label = languageMap[localeValue] || lang;
              return (
                <DropdownMenuItem
                  key={lang}
                  onClick={() => handleChange(lang)}
                  className="cursor-pointer"
                >
                  <span className="mr-2">{label}</span>
                  <span className="text-xs text-muted-foreground">
                    {localeValue.toUpperCase()}
                  </span>
                </DropdownMenuItem>
              );
            })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Desktop */}
      <div className="hidden h-9 w-9 items-center justify-center rounded-lg bg-card/60 backdrop-blur-lg transition-all hover:scale-105 hover:bg-muted/60 sm:flex">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="flex h-9 w-9 items-center justify-center rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-primary/20"
              aria-label="Language"
              title="Language"
            >
              <span className="text-base leading-none">
                {languageMap[currentLocale] || "🌐"}
              </span>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="min-w-36">
            {supportedLanguages.map((lang) => {
              const localeValue = lang as AppLocale;
              const label = languageMap[localeValue] || lang;
              return (
                <DropdownMenuItem
                  key={lang}
                  onClick={() => handleChange(lang)}
                  className="cursor-pointer"
                >
                  <span className="mr-2">{label}</span>
                  <span className="text-xs text-muted-foreground">
                    {localeValue.toUpperCase()}
                  </span>
                </DropdownMenuItem>
              );
            })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </>
  );
}

