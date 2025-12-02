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
import { useLocale } from "@/components/locale-provider";
import type { User } from "@supabase/supabase-js";
import type { AppLocale } from "@/i18n/translations";

type Profile = {
  user_id: string;
  salon_id: string;
  is_superadmin?: boolean;
};

type Salon = {
  id: string;
  name: string;
  slug: string | null;
  is_public: boolean;
  preferred_language: string | null;
  salon_type?: string | null;
  whatsapp_number?: string | null;
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
      salon: Salon | null;
    };

type SalonContextType = {
  salon: Salon | null;
  profile: Profile | null;
  user: User | null;
  loading: boolean;
  error: string | null;
  // Helper to check if we have all required data
  isReady: boolean;
  // Helper to check if user is superadmin
  isSuperAdmin: boolean;
  refreshSalon: () => Promise<void>;
};

const SalonContext = createContext<SalonContextType | null>(null);

type SalonProviderProps = {
  children: ReactNode;
};

export function SalonProvider({ children }: SalonProviderProps) {
  const { setLocale } = useLocale();
  const [state, setState] = useState<SalonContextValue>({
    status: "loading",
  });

  const loadSalonData = async () => {
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

      // 2. Get profile with salon_id and is_superadmin
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("user_id, salon_id, is_superadmin")
        .eq("user_id", user.id)
        .maybeSingle();

      // Super admins don't need a salon_id
      if (profileError) {
        setState({ status: "no-salon" });
        return;
      }

      // If not superadmin and no salon_id, redirect to onboarding
      if (!profile?.is_superadmin && !profile?.salon_id) {
        setState({ status: "no-salon" });
        return;
      }

      // 3. Get salon data (only if not superadmin or if salon_id exists)
      let salon = null;
      if (profile.salon_id) {
        const { data: salonData, error: salonError } = await supabase
          .from("salons")
          .select("id, name, slug, is_public, preferred_language, salon_type, whatsapp_number")
          .eq("id", profile.salon_id)
          .maybeSingle();

        if (salonError) {
          setState({
            status: "error",
            error: salonError?.message ?? "Could not load salon data.",
          });
          return;
        }

        salon = salonData;

        // 4. Set locale from salon's preferred_language if available
        if (salon?.preferred_language) {
          const validLocales: AppLocale[] = [
            "nb",
            "en",
            "ar",
            "so",
            "ti",
            "am",
            "tr",
            "pl",
            "vi",
            "zh",
            "tl",
            "fa",
            "dar",
            "ur",
            "hi",
          ];
          if (validLocales.includes(salon.preferred_language as AppLocale)) {
            setLocale(salon.preferred_language as AppLocale);
          }
        }
      }

      setState({
        status: "ready",
        user,
        profile,
        salon,
      });
  };

  useEffect(() => {
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
  }, [setLocale]);

  const value = useMemo<SalonContextType>(() => {
    if (state.status === "ready") {
      return {
        salon: state.salon,
        profile: state.profile,
        user: state.user,
        loading: false,
        error: null,
        isReady: true,
        isSuperAdmin: state.profile?.is_superadmin ?? false,
        refreshSalon: loadSalonData,
      };
    }

    return {
      salon: null,
      profile: null,
      user: null,
      loading: state.status === "loading",
      error: state.status === "error" ? state.error : null,
      isReady: false,
      isSuperAdmin: false,
      refreshSalon: loadSalonData,
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

