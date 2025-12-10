"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
  useCallback,
  ReactNode,
} from "react";
import { getCurrentUser } from "@/lib/services/auth-service";
import { getProfileForUser } from "@/lib/services/profiles-service";
import { getSalonByIdForUser } from "@/lib/services/salons-service";
import { useLocale } from "@/components/locale-provider";
// eslint-disable-next-line no-restricted-imports
import type { User } from "@supabase/supabase-js";
import type { AppLocale } from "@/i18n/translations";
// eslint-disable-next-line no-restricted-imports
import { supabase } from "@/lib/supabase-client";

type Profile = {
  user_id: string;
  salon_id: string | null;
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
  theme?: {
    primary?: string;
    secondary?: string;
    font?: string;
    logo_url?: string;
    presets?: string[];
  } | null;
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

  const loadSalonData = useCallback(async () => {
      setState({ status: "loading" });

      // 1. Get current user
      const { data: user, error: userError } = await getCurrentUser();

      if (userError || !user) {
        setState({ status: "unauthenticated" });
        return;
      }

      // 2. Get profile with salon_id and is_superadmin
      const { data: profile, error: profileError } = await getProfileForUser(user.id);

      // Super admins don't need a salon_id
      if (profileError || !profile) {
        setState({ status: "no-salon" });
        return;
      }

      // If not superadmin and no salon_id, redirect to onboarding
      if (!profile.is_superadmin && !profile.salon_id) {
        setState({ status: "no-salon" });
        return;
      }

      // 3. Get salon data (only if not superadmin or if salon_id exists)
      let salon = null;
      if (profile.salon_id) {
        const { data: salonData, error: salonError } = await getSalonByIdForUser(profile.salon_id);

        if (salonError) {
          setState({
            status: "error",
            error: salonError ?? "Could not load salon data.",
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
  }, [setLocale]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
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
  }, [loadSalonData]);

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
  }, [state, loadSalonData]);

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

