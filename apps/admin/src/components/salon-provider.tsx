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
import { getCurrentUser, subscribeToAuthChanges, type User } from "@/lib/services/auth-service";
import { getProfileForUser } from "@/lib/services/profiles-service";
import { getSalonByIdForUser } from "@/lib/services/salons-service";
import { setErrorContext, clearErrorContext } from "@/lib/services/error-tracking-service";
import { useLocale } from "@/components/locale-provider";
import type { AppLocale } from "@/i18n/translations";
import type { Salon } from "@/lib/types";

// Component is client-side only

import type { Profile } from "@/lib/types";

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

/** Coalesces concurrent bootstrap loads (e.g. React Strict Mode dev double mount). Auth refresh always uses dedupe: false. */
let adminSalonBootstrapInFlight: Promise<void> | null = null;

type SalonProviderProps = {
  children: ReactNode;
};

export function SalonProvider({ children }: SalonProviderProps) {
  const { setLocale } = useLocale();
  // Start with "loading" - will be resolved on client side
  const [state, setState] = useState<SalonContextValue>({
    status: "loading",
  });

  const loadSalonData = useCallback(
    async (options?: { dedupe?: boolean }) => {
      const execute = async () => {
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

              // 4. Set locale from user's preferred_language (profile) or fall back to salon's preferred_language
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

              // Priority: user's profile.preferred_language > salon.preferred_language > 'en'
              const userLocale = profile?.preferred_language;
              const salonLocale = salon?.preferred_language;

              if (userLocale && validLocales.includes(userLocale as AppLocale)) {
                setLocale(userLocale as AppLocale);
              } else if (salonLocale && validLocales.includes(salonLocale as AppLocale)) {
                setLocale(salonLocale as AppLocale);
              }
            } catch (err) {
              console.warn("Exception loading salon data:", err);
              setState({ status: "no-salon" });
              return;
            }
          }

          // Set error tracking context for Sentry
          setErrorContext({
            userId: user.id,
            userEmail: user.email,
            salonId: salon?.id || null,
            salonName: salon?.name || null,
            userRole: profile.is_superadmin ? "superadmin" : profile.role || "owner",
          });

          setState({
            status: "ready",
            user,
            profile,
            salon,
          });
        } catch (err) {
          console.error("Error in loadSalonData:", err);
          // Clear error context on failure
          clearErrorContext();
          // Set to unauthenticated state instead of error to prevent crashes
          setState({ status: "unauthenticated" });
        }
      };

      if (options?.dedupe) {
        if (adminSalonBootstrapInFlight) {
          await adminSalonBootstrapInFlight;
          return;
        }
        adminSalonBootstrapInFlight = execute().finally(() => {
          adminSalonBootstrapInFlight = null;
        });
        await adminSalonBootstrapInFlight;
        return;
      }

      await execute();
    },
    [setLocale],
  );

  const refreshSalon = useCallback(() => loadSalonData(), [loadSalonData]);

  useEffect(() => {
    // Only run on client side
    if (typeof window === "undefined") {
      return;
    }

    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadSalonData({ dedupe: true });

    // Listen for auth changes
    try {
      const unsubscribe = subscribeToAuthChanges(() => {
        void loadSalonData();
      });

      return () => {
        unsubscribe();
      };
    } catch (err) {
      console.warn("Error setting up auth listener:", err);
      // Continue without auth listener
    }
  }, [loadSalonData]);

  const value = useMemo<SalonContextType>(() => {
    try {
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
          refreshSalon,
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
        refreshSalon,
      };
    } catch (err) {
      console.error("Error in SalonProvider value calculation:", err);
      // Return safe default value
      return {
        salon: null,
        profile: null,
        user: null,
        loading: false,
        error: err instanceof Error ? err.message : "Unknown error",
        isReady: false,
        isSuperAdmin: false,
        userRole: null,
        refreshSalon,
      };
    }
  }, [state, refreshSalon]);

  // Show loading screen when loading (only on client to avoid hydration mismatch)
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
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

