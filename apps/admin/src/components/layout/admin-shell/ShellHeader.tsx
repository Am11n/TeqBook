import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Menu, LogOut, User, Search } from "lucide-react";
import { FAVICON_PATH } from "@/lib/constants";
import { NotificationCenter } from "@/components/notification-center";
import type { AppLocale } from "@/i18n/translations";
import { LanguageSelector } from "./LanguageSelector";

interface ShellHeaderProps {
  locale: string;
  salon: { supported_languages?: string[] | null } | null;
  setLocale: (locale: AppLocale) => void;
  profile: { avatar_url?: string | null; first_name?: string | null; last_name?: string | null } | null;
  userEmail: string | null;
  loggingOut: boolean;
  onOpenMobileNav: () => void;
  onOpenCommandPalette: () => void;
  onSignOut: () => void;
}

function getInitials(email: string | null) {
  if (!email) return "A";
  const name = email.split("@")[0];
  return name.charAt(0).toUpperCase() + (name.length > 1 ? name.charAt(1).toUpperCase() : "");
}

function UserAvatarMenu({
  profile, userEmail, loggingOut, onSignOut, className,
}: Pick<ShellHeaderProps, "profile" | "userEmail" | "loggingOut" | "onSignOut"> & { className?: string }) {
  return (
    <div suppressHydrationWarning className={className}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="flex items-center justify-center h-9 w-9 transition-all hover:scale-105">
            <Avatar className="h-9 w-9 border-2 border-card shadow-sm transition-all hover:shadow-md">
              {profile?.avatar_url && <AvatarImage src={profile.avatar_url} alt="Profile avatar" />}
              <AvatarFallback className="bg-gradient-to-br from-blue-600 to-blue-400 text-xs font-semibold text-white">
                {getInitials(userEmail)}
              </AvatarFallback>
            </Avatar>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56 rounded-xl bg-white/90 backdrop-blur-md border border-neutral-200/70 shadow-lg">
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">
                {profile?.first_name && profile?.last_name
                  ? `${profile.first_name} ${profile.last_name}`
                  : userEmail || "Admin"}
              </p>
              <p className="text-xs leading-none text-muted-foreground">Super Admin</p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link href="/profile" className="flex items-center gap-2 cursor-pointer">
              <User className="h-4 w-4" /><span>My profile</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={onSignOut} disabled={loggingOut}
            className="flex items-center gap-2 text-red-600 focus:text-red-600 cursor-pointer"
          >
            <LogOut className="h-4 w-4" />
            <span>{loggingOut ? "Logging out..." : "Log out"}</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

export function ShellHeader({
  locale, salon, setLocale, profile, userEmail,
  loggingOut, onOpenMobileNav, onOpenCommandPalette, onSignOut,
}: ShellHeaderProps) {
  return (
    <header className="sticky top-0 z-[50] flex h-[72px] w-full items-center justify-between border-b border-border bg-card/95 backdrop-blur-md shadow-[0_1px_3px_rgba(0,0,0,0.05)]">
      <div className="flex items-center gap-3 pl-6">
        <Button
          type="button" variant="ghost" size="icon"
          className="h-9 w-9 rounded-lg transition-transform hover:scale-105 md:hidden"
          onClick={onOpenMobileNav} aria-label="Open navigation"
        >
          <Menu className="h-5 w-5" />
        </Button>
        <Link href="/" className="hidden items-center gap-3 transition-all duration-150 hover:scale-105 hover:drop-shadow-[0_2px_8px_rgba(29,78,216,0.15)] md:flex">
          <Image src={FAVICON_PATH} alt="TeqBook Admin" width={32} height={32} className="h-8 w-8 transition-transform duration-150" priority />
          <span className="text-lg font-semibold tracking-tight text-foreground">TeqBook Admin</span>
        </Link>
        <Link href="/" className="flex items-center gap-2 transition-opacity hover:opacity-80 md:hidden">
          <Image src={FAVICON_PATH} alt="TeqBook Admin" width={28} height={28} className="h-7 w-7" priority />
          <span className="text-base font-semibold tracking-tight text-foreground">TeqBook Admin</span>
        </Link>
      </div>

      <div className="hidden flex-1 items-center justify-center px-4 md:flex">
        <button
          onClick={onOpenCommandPalette}
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

      <div className="flex items-center gap-2 pr-6">
        <LanguageSelector locale={locale} salon={salon} setLocale={setLocale} />
        <NotificationCenter />
        <UserAvatarMenu profile={profile} userEmail={userEmail} loggingOut={loggingOut} onSignOut={onSignOut} className="hidden sm:flex" />
        <UserAvatarMenu profile={profile} userEmail={userEmail} loggingOut={loggingOut} onSignOut={onSignOut} className="flex sm:hidden" />
      </div>
    </header>
  );
}
