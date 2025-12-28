"use client";

import Image from "next/image";
import Link from "next/link";
import { Menu, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NotificationCenter } from "@/components/notification-center";
import { useLocale } from "@/components/locale-provider";
import { updateSalonSettings } from "@/lib/services/salons-service";
import { UserMenu } from "./UserMenu";
import type { AppLocale } from "@/i18n/translations";

interface DashboardHeaderProps {
  salon: any; // Salon type from useCurrentSalon
  profile: any; // Profile type from useCurrentSalon
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
          href="/dashboard"
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
          href="/dashboard"
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

  return (
    <div className="hidden h-9 w-9 items-center justify-center rounded-lg bg-card/60 backdrop-blur-lg transition-all hover:scale-105 hover:bg-muted/60 sm:flex">
      <select
        value={locale || "en"}
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
        style={{ backgroundImage: "none" }}
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
  );
}

