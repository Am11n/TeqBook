"use client";

import { useEffect, useState } from "react";
import { getCurrentUser } from "@/lib/services/auth-service";

type UserState =
  | { status: "loading" }
  | { status: "anonymous" }
  | { status: "authenticated"; email: string | null };

export function CurrentUserBadge() {
  const [userState, setUserState] = useState<UserState>({ status: "loading" });

  useEffect(() => {
    async function loadUser() {
      const { data: user, error } = await getCurrentUser();

      if (error || !user) {
        setUserState({ status: "anonymous" });
        return;
      }

      setUserState({
        status: "authenticated",
        email: user.email ?? null,
      });
    }

    loadUser();
  }, []);

  if (userState.status === "loading") {
    return (
      <span className="text-xs text-muted-foreground">Sjekker innlogging…</span>
    );
  }

  if (userState.status === "anonymous") {
    return (
      <a
        href="/login"
        className="text-xs font-medium text-primary hover:underline"
      >
        Logg inn
      </a>
    );
  }

  return (
    <div className="flex flex-col text-right text-xs">
      <span className="font-medium">
        {userState.email || "Innlogget bruker"}
      </span>
      <span className="text-muted-foreground">Kobles snart til salong</span>
    </div>
  );
}


