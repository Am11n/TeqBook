import { useState, FormEvent, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useLocale } from "@/components/locale-provider";
import { createSalonForCurrentUser, createOpeningHours } from "@/lib/services/onboarding-service";
import { getCurrentUser } from "@/lib/services/auth-service";
import { ensureProfileForUser } from "@/lib/services/profiles-service";
import { translations, type AppLocale } from "@/i18n/translations";
import type { OpeningHours, SalonType, OnboardingStep } from "@/lib/utils/onboarding/onboarding-utils";
import { DEFAULT_OPENING_HOURS } from "@/lib/utils/onboarding/onboarding-utils";

interface UseOnboardingOptions {
  initialLocale: AppLocale;
  translations: {
    createError: string;
  };
}

const ONBOARDING_DRAFT_STORAGE_PREFIX = "teqbook:onboarding:draft:v1";
const VALID_SALON_TYPES: SalonType[] = ["barber", "nails", "massage", "other"];

type OnboardingDraft = {
  currentStep: OnboardingStep;
  name: string;
  salonType: SalonType;
  whatsappNumber: string;
  preferredLanguage: AppLocale;
  openingHours: OpeningHours[];
  onlineBooking: boolean;
  publicBooking: boolean;
};

function isValidAppLocale(value: string): value is AppLocale {
  return value in translations;
}

function sanitizeStep(value: unknown): OnboardingStep {
  if (value === 1 || value === 2 || value === 3) return value;
  return 1;
}

function sanitizeSalonType(value: unknown): SalonType {
  if (typeof value === "string" && VALID_SALON_TYPES.includes(value as SalonType)) {
    return value as SalonType;
  }
  return "barber";
}

function sanitizeOpeningHours(value: unknown): OpeningHours[] {
  if (!Array.isArray(value)) return DEFAULT_OPENING_HOURS;

  const sanitized = value
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const row = item as Partial<OpeningHours>;
      if (
        typeof row.day !== "number" ||
        row.day < 0 ||
        row.day > 6 ||
        typeof row.isOpen !== "boolean" ||
        typeof row.openTime !== "string" ||
        typeof row.closeTime !== "string"
      ) {
        return null;
      }
      return {
        day: row.day,
        isOpen: row.isOpen,
        openTime: row.openTime,
        closeTime: row.closeTime,
      } satisfies OpeningHours;
    })
    .filter((row): row is OpeningHours => row !== null)
    .sort((a, b) => a.day - b.day);

  return sanitized.length === 7 ? sanitized : DEFAULT_OPENING_HOURS;
}

export function useOnboarding({ initialLocale, translations }: UseOnboardingOptions) {
  const router = useRouter();
  const { setLocale } = useLocale();
  const [draftStorageKey, setDraftStorageKey] = useState<string | null>(null);
  const [isDraftHydrated, setIsDraftHydrated] = useState(false);

  const [currentStep, setCurrentStep] = useState<OnboardingStep>(1);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  // Step 1: Grunninfo
  const [name, setName] = useState("");
  const [salonType, setSalonType] = useState<SalonType>("barber");
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [preferredLanguage, setPreferredLanguage] = useState<AppLocale>(initialLocale);

  // Step 2: Åpningstider & Innstillinger
  const [openingHours, setOpeningHours] = useState<OpeningHours[]>(DEFAULT_OPENING_HOURS);
  const [onlineBooking, setOnlineBooking] = useState(false);
  const [publicBooking, setPublicBooking] = useState(true);

  useEffect(() => {
    let isCancelled = false;

    const hydrateDraft = async () => {
      const { data: currentUser } = await getCurrentUser();
      if (isCancelled) return;

      const storageKey = currentUser?.id
        ? `${ONBOARDING_DRAFT_STORAGE_PREFIX}:${currentUser.id}`
        : `${ONBOARDING_DRAFT_STORAGE_PREFIX}:anonymous`;

      setDraftStorageKey(storageKey);

      if (typeof window === "undefined") {
        setIsDraftHydrated(true);
        return;
      }

      const rawDraft = window.localStorage.getItem(storageKey);
      if (!rawDraft) {
        setIsDraftHydrated(true);
        return;
      }

      try {
        const parsed = JSON.parse(rawDraft) as Partial<OnboardingDraft>;
        setCurrentStep(sanitizeStep(parsed.currentStep));
        setName(typeof parsed.name === "string" ? parsed.name : "");
        setSalonType(sanitizeSalonType(parsed.salonType));
        setWhatsappNumber(typeof parsed.whatsappNumber === "string" ? parsed.whatsappNumber : "");
        if (typeof parsed.preferredLanguage === "string" && isValidAppLocale(parsed.preferredLanguage)) {
          setPreferredLanguage(parsed.preferredLanguage);
          setLocale(parsed.preferredLanguage);
        }
        setOpeningHours(sanitizeOpeningHours(parsed.openingHours));
        setOnlineBooking(Boolean(parsed.onlineBooking));
        setPublicBooking(typeof parsed.publicBooking === "boolean" ? parsed.publicBooking : true);
      } catch {
        window.localStorage.removeItem(storageKey);
      } finally {
        setIsDraftHydrated(true);
      }
    };

    void hydrateDraft();

    return () => {
      isCancelled = true;
    };
  }, [setLocale]);

  useEffect(() => {
    if (!isDraftHydrated || !draftStorageKey || typeof window === "undefined") return;

    const draft: OnboardingDraft = {
      currentStep,
      name,
      salonType,
      whatsappNumber,
      preferredLanguage,
      openingHours,
      onlineBooking,
      publicBooking,
    };

    window.localStorage.setItem(draftStorageKey, JSON.stringify(draft));
  }, [
    isDraftHydrated,
    draftStorageKey,
    currentStep,
    name,
    salonType,
    whatsappNumber,
    preferredLanguage,
    openingHours,
    onlineBooking,
    publicBooking,
  ]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setError(null);

    const { data: currentUser, error: userError } = await getCurrentUser();
    if (userError || !currentUser) {
      setError(userError ?? translations.createError);
      setStatus("error");
      return;
    }

    const { error: ensureProfileError } = await ensureProfileForUser({
      user_id: currentUser.id,
      role: "owner",
      preferred_language: preferredLanguage,
    });

    if (ensureProfileError) {
      setError(ensureProfileError);
      setStatus("error");
      return;
    }

    // First create the salon
    const { data: salonId, error: salonError } = await createSalonForCurrentUser({
      salon_name: name,
      salon_type: salonType,
      preferred_language: preferredLanguage,
      online_booking_enabled: onlineBooking,
      is_public: publicBooking,
      whatsapp_number: whatsappNumber.trim() || null,
    });

    if (salonError || !salonId) {
      setError(salonError ?? translations.createError);
      setStatus("error");
      return;
    }

    const { error: linkSalonError } = await ensureProfileForUser({
      user_id: currentUser.id,
      salon_id: salonId,
      role: "owner",
      preferred_language: preferredLanguage,
    });

    if (linkSalonError) {
      setError(linkSalonError);
      setStatus("error");
      return;
    }

    // Then create opening hours
    const openingHoursToInsert = openingHours
      .filter((oh) => oh.isOpen)
      .map((oh) => ({
        salon_id: salonId,
        day_of_week: oh.day,
        open_time: oh.openTime,
        close_time: oh.closeTime,
      }));

    if (openingHoursToInsert.length > 0) {
      const { error: hoursError } = await createOpeningHours(openingHoursToInsert);

      if (hoursError) {
        setError(hoursError);
        setStatus("error");
        return;
      }
    }

    // Set the locale to the preferred language before redirecting
    setLocale(preferredLanguage);
    if (draftStorageKey && typeof window !== "undefined") {
      window.localStorage.removeItem(draftStorageKey);
    }

    setStatus("success");
    router.push("/dashboard/");
  };

  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep((prev) => (prev + 1) as OnboardingStep);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => (prev - 1) as OnboardingStep);
    }
  };

  const canProceedStep1 = name.trim().length > 0;
  const canProceedStep2 = true; // Step 2 has no required fields

  return {
    // State
    currentStep,
    status,
    error,
    name,
    setName,
    salonType,
    setSalonType,
    whatsappNumber,
    setWhatsappNumber,
    preferredLanguage,
    setPreferredLanguage,
    openingHours,
    setOpeningHours,
    onlineBooking,
    setOnlineBooking,
    publicBooking,
    setPublicBooking,
    // Actions
    handleSubmit,
    handleNext,
    handleBack,
    canProceedStep1,
    canProceedStep2,
  };
}

