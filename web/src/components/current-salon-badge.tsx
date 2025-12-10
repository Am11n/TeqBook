"use client";

import { useEffect, useState } from "react";
import { getCurrentUser } from "@/lib/services/auth-service";
import { getProfileForUser } from "@/lib/services/profiles-service";
import { getSalonByIdForUser } from "@/lib/services/salons-service";

type SalonState =
  | { status: "loading" }
  | { status: "none" }
  | { status: "some"; name: string };

export function CurrentSalonBadge() {
  const [salonState, setSalonState] = useState<SalonState>({
    status: "loading",
  });

  useEffect(() => {
    async function loadSalon() {
      const { data: user, error: userError } = await getCurrentUser();

      if (userError || !user) {
        setSalonState({ status: "none" });
        return;
      }

      const { data: profile, error: profileError } = await getProfileForUser(user.id);

      if (profileError || !profile || !profile.salon_id) {
        setSalonState({ status: "none" });
        return;
      }

      const { data: salon, error: salonError } = await getSalonByIdForUser(profile.salon_id);

      if (salonError || !salon) {
        setSalonState({ status: "none" });
        return;
      }

      setSalonState({
        status: "some",
        name: salon.name,
      });
    }

    loadSalon();
  }, []);

  if (salonState.status === "loading") {
    return (
      <span className="text-xs text-muted-foreground">Laster salong…</span>
    );
  }

  if (salonState.status === "none") {
    return (
      <a
        href="/onboarding"
        className="text-xs font-medium text-primary hover:underline"
      >
        Opprett salong
      </a>
    );
  }

  return (
    <div className="flex flex-col text-right text-xs">
      <span className="font-medium">{salonState.name}</span>
      <span className="text-muted-foreground">Din salong</span>
    </div>
  );
}


