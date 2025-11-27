"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase-client";

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
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        setSalonState({ status: "none" });
        return;
      }

      const { data, error } = await supabase
        .from("profiles")
        .select("salons(name)")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error || !data || !("salons" in data) || !data.salons) {
        setSalonState({ status: "none" });
        return;
      }

      setSalonState({
        status: "some",
        name: (data as any).salons.name as string,
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


