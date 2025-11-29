"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
  ReactNode,
} from "react";
import { supabase } from "@/lib/supabase-client";
import type { User } from "@supabase/supabase-js";

type Profile = {
  user_id: string;
  salon_id: string;
};

type Salon = {
  id: string;
  name: string;
  slug: string | null;
  is_public: boolean;
};

type SalonContextValue =
  | { status: "loading" }
  | { status: "error"; error: string }
  | { status: "unauthenticated" }
  | { status: "no-salon" }
  | {
      status: "ready";
      user: User;
      profile: Profile;
      salon: Salon;
    };

type SalonContextType = {
  salon: Salon | null;
  profile: Profile | null;
  user: User | null;
  loading: boolean;
  error: string | null;
  // Helper to check if we have all required data
  isReady: boolean;
};

const SalonContext = createContext<SalonContextType | null>(null);

type SalonProviderProps = {
  children: ReactNode;
};

export function SalonProvider({ children }: SalonProviderProps) {
  const [state, setState] = useState<SalonContextValue>({
    status: "loading",
  });

  useEffect(() => {
    async function loadSalonData() {
      setState({ status: "loading" });

      // 1. Get current user
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        setState({ status: "unauthenticated" });
        return;
      }

      // 2. Get profile with salon_id
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("user_id, salon_id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (profileError || !profile?.salon_id) {
        setState({ status: "no-salon" });
        return;
      }

      // 3. Get salon data
      const { data: salon, error: salonError } = await supabase
        .from("salons")
        .select("id, name, slug, is_public")
        .eq("id", profile.salon_id)
        .maybeSingle();

      if (salonError || !salon) {
        setState({
          status: "error",
          error: salonError?.message ?? "Could not load salon data.",
        });
        return;
      }

      setState({
        status: "ready",
        user,
        profile,
        salon,
      });
    }

    loadSalonData();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      loadSalonData();
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const value = useMemo<SalonContextType>(() => {
    if (state.status === "ready") {
      return {
        salon: state.salon,
        profile: state.profile,
        user: state.user,
        loading: false,
        error: null,
        isReady: true,
      };
    }

    return {
      salon: null,
      profile: null,
      user: null,
      loading: state.status === "loading",
      error: state.status === "error" ? state.error : null,
      isReady: false,
    };
  }, [state]);

  return (
    <SalonContext.Provider value={value}>{children}</SalonContext.Provider>
  );
}

export function useCurrentSalon() {
  const ctx = useContext(SalonContext);
  if (!ctx) {
    throw new Error("useCurrentSalon must be used within a SalonProvider");
  }
  return ctx;
}

