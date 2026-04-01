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
import { LoadingScreen } from "@/components/loading-screen";
import type { AppLocale } from "@/i18n/translations";
import type { Salon } from "@/lib/types";
import { getAdminAppSignInUrl } from "@/lib/admin-app-url";

import type { Profile } from "@/lib/types";

type SalonContextValue =
  | { status: "loading" }
  | { status: "error"; error: string }
  | { status: "unauthenticated" }
  | { status: "no-salon" }
  | { status: "superadmin-blocked" }
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
  isReady: boolean;
  userRole: string | null;
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
    try {
      setState({ status: "loading" });

      const { data: user, error: userError } = await getCurrentUser();

      if (userError || !user) {
        setState({ status: "unauthenticated" });
        return;
      }

      const { data: profile, error: profileError } = await getProfileForUser(user.id);

      if (profileError || !profile) {
        setState({ status: "no-salon" });
        return;
      }

      if (profile.is_superadmin) {
        const signIn = getAdminAppSignInUrl();
        if (signIn && typeof window !== "undefined") {
          window.location.assign(signIn);
          return;
        }
        setState({ status: "superadmin-blocked" });
        return;
      }

      if (!profile.salon_id) {
        setState({ status: "no-salon" });
        return;
      }

      let salon = null;
      try {
        const { data: salonData, error: salonError } = await getSalonByIdForUser(profile.salon_id);

        if (salonError) {
          console.warn("Error loading salon data:", salonError);
          setState({ status: "no-salon" });
          return;
        }

        salon = salonData;

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

      setErrorContext({
        userId: user.id,
        userEmail: user.email,
        salonId: salon?.id || null,
        salonName: salon?.name || null,
        userRole: profile.role || "owner",
      });

      setState({
        status: "ready",
        user,
        profile,
        salon,
      });
    } catch (err) {
      console.error("Error in loadSalonData:", err);
      clearErrorContext();
      setState({ status: "unauthenticated" });
    }
  }, [setLocale]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadSalonData();

    try {
      const unsubscribe = subscribeToAuthChanges(() => {
        loadSalonData();
      });

      return () => {
        unsubscribe();
      };
    } catch (err) {
      console.warn("Error setting up auth listener:", err);
    }
  }, [loadSalonData]);

  const value = useMemo<SalonContextType>(() => {
    try {
      if (state.status === "ready") {
        const userRole = state.profile?.role || "owner";

        return {
          salon: state.salon,
          profile: state.profile,
          user: state.user,
          loading: false,
          error: null,
          isReady: true,
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
        userRole: null,
        refreshSalon: loadSalonData,
      };
    } catch (err) {
      console.error("Error in SalonProvider value calculation:", err);
      return {
        salon: null,
        profile: null,
        user: null,
        loading: false,
        error: err instanceof Error ? err.message : "Unknown error",
        isReady: false,
        userRole: null,
        refreshSalon: loadSalonData,
      };
    }
  }, [state, loadSalonData]);

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <SalonContext.Provider value={value}>
        {children}
      </SalonContext.Provider>
    );
  }

  if (state.status === "loading") {
    return (
      <SalonContext.Provider value={value}>
        <LoadingScreen />
      </SalonContext.Provider>
    );
  }

  if (state.status === "superadmin-blocked") {
    return (
      <SalonContext.Provider value={value}>
        <div className="flex min-h-screen items-center justify-center bg-background p-6 text-center">
          <p className="text-muted-foreground max-w-md text-sm">
            Superadmin accounts cannot use the salon dashboard. Set{" "}
            <code className="rounded bg-muted px-1 py-0.5 text-xs">NEXT_PUBLIC_ADMIN_APP_URL</code>{" "}
            to your Admin app base URL (for local dev, e.g.{" "}
            <code className="rounded bg-muted px-1 py-0.5 text-xs">http://localhost:3003</code>
            ), redeploy, then open the Admin app to sign in.
          </p>
        </div>
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
