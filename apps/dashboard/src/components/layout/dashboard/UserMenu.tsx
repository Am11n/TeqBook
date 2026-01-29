"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { User, CreditCard, LogOut } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getCurrentUser, signOut } from "@/lib/services/auth-service";
import { canAccessSettings } from "@/lib/utils/access-control";
import { getRoleDisplayName } from "@/lib/utils/access-control";
import { getInitials } from "@/lib/utils/dashboard/dashboard-utils";
import type { Salon, Profile } from "@/lib/types";

interface UserMenuProps {
  profile: Profile | null;
  salon: Salon | null;
  userRole: string | null;
  isMobile?: boolean;
}

export function UserMenu({ profile, salon, userRole, isMobile = false }: UserMenuProps) {
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    async function loadUserEmail() {
      const { data: user } = await getCurrentUser();
      setUserEmail(user?.email || null);
    }
    loadUserEmail();
  }, []);

  async function handleLogout() {
    setLoggingOut(true);
    try {
      await signOut();
      // Go to site root (public app), not dashboard root – full navigation so we leave this app
      window.location.href = "/";
    } catch (error) {
      console.error("Error logging out:", error);
      setLoggingOut(false);
    }
  }

  const displayName =
    profile?.first_name && profile?.last_name
      ? `${profile.first_name} ${profile.last_name}`
      : userEmail || "User";

  return (
    <div suppressHydrationWarning>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            className={`${
              isMobile ? "flex items-center" : "hidden h-9 w-9 items-center justify-center"
            } transition-all hover:scale-105 sm:${isMobile ? "hidden" : "flex"}`}
            suppressHydrationWarning
          >
            <Avatar
              className={`h-9 w-9 border-2 ${
                isMobile ? "border-white" : "border-card"
              } shadow-sm transition-all hover:shadow-md`}
            >
              {profile?.avatar_url && (
                <AvatarImage src={profile.avatar_url} alt="Profile avatar" />
              )}
              <AvatarFallback className="bg-gradient-to-br from-blue-600 to-blue-400 text-xs font-semibold text-white">
                {getInitials(userEmail || "")}
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
              <p className="text-sm font-medium leading-none">{displayName}</p>
              <p className="text-xs leading-none text-muted-foreground">
                {salon?.name || "Salon"}
              </p>
              {userRole && !isMobile && (
                <p className="text-xs leading-none text-muted-foreground">
                  {getRoleDisplayName(userRole)}
                </p>
              )}
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          {canAccessSettings(userRole) && (
            <DropdownMenuItem asChild>
              <Link href="/profile" prefetch={true} className="flex items-center gap-2 cursor-pointer">
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
  );
}

