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
import { LoadingScreen } from "@/components/loading-screen";
// eslint-disable-next-line no-restricted-imports
import type { User } from "@supabase/supabase-js";
import type { AppLocale } from "@/i18n/translations";
// eslint-disable-next-line no-restricted-imports
import { supabase } from "@/lib/supabase-client";

// Ensure we're on client side
const isClient = typeof window !== "undefined";

type Profile = {
  user_id: string;
  salon_id: string | null;
  is_superadmin?: boolean;
  role?: string | null;
  preferred_language?: string | null;
};

type Salon = {
  id: string;
  name: string;
  slug: string | null;
  is_public: boolean;
  preferred_language: string | null;
  salon_type?: string | null;
  whatsapp_number?: string | null;
  supported_languages?: string[] | null;
  default_language?: string | null;
  theme?: {
    primary?: string;
    secondary?: string;
    font?: string;
    logo_url?: string;
    presets?: string[];
  } | null;
  plan?: "starter" | "pro" | "business" | null;
  // Billing fields (for future Stripe integration)
  billing_customer_id?: string | null;
  billing_subscription_id?: string | null;
  current_period_end?: string | null;
  trial_end?: string | null;
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
  // Get user role (superadmin, owner, manager, staff)
  userRole: string | null;
  refreshSalon: () => Promise<void>;
};

const SalonContext = createContext<SalonContextType | null>(null);

type SalonProviderProps = {
  children: ReactNode;
};

export function SalonProvider({ children }: SalonProviderProps) {
  const { setLocale } = useLocale();
  // Start with "loading" - will be resolved on client side
  const [state, setState] = useState<SalonContextValue>({
    status: "loading",
  });

  const loadSalonData = useCallback(async () => {
    try {
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
        try {
          const { data: salonData, error: salonError } = await getSalonByIdForUser(profile.salon_id);

          if (salonError) {
            console.warn("Error loading salon data:", salonError);
            // Don't set error state - just continue without salon data
            setState({ status: "no-salon" });
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
        } catch (err) {
          console.warn("Exception loading salon data:", err);
          setState({ status: "no-salon" });
          return;
        }
      }

      setState({
        status: "ready",
        user,
        profile,
        salon,
      });
    } catch (err) {
      console.error("Error in loadSalonData:", err);
      // Set to unauthenticated state instead of error to prevent crashes
      setState({ status: "unauthenticated" });
    }
  }, [setLocale]);

  useEffect(() => {
    // Only run on client side
    if (typeof window === "undefined") {
      return;
    }

    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadSalonData();

    // Listen for auth changes
    try {
      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange(() => {
        loadSalonData();
      });

      return () => {
        subscription.unsubscribe();
      };
    } catch (err) {
      console.warn("Error setting up auth listener:", err);
      // Continue without auth listener
    }
  }, [loadSalonData]);

  const value = useMemo<SalonContextType>(() => {
    if (state.status === "ready") {
      // Determine user role: superadmin > profile.role > default to "owner"
      const userRole = state.profile?.is_superadmin
        ? "superadmin"
        : (state.profile?.role || "owner");
      
      return {
        salon: state.salon,
        profile: state.profile,
        user: state.user,
        loading: false,
        error: null,
        isReady: true,
        isSuperAdmin: state.profile?.is_superadmin ?? false,
        userRole,
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
      userRole: null,
      refreshSalon: loadSalonData,
    };
  }, [state, loadSalonData]);

  // Show loading screen when loading (only on client to avoid hydration mismatch)
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  // On server or before mount, just render children
  if (!mounted) {
    return (
      <SalonContext.Provider value={value}>
        {children}
      </SalonContext.Provider>
    );
  }

  // On client, show loading screen if loading
  if (state.status === "loading") {
    return (
      <SalonContext.Provider value={value}>
        <LoadingScreen />
      </SalonContext.Provider>
    );
  }

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

