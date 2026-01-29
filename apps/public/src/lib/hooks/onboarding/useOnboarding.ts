import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useLocale } from "@/components/locale-provider";
import { createSalonForCurrentUser, createOpeningHours } from "@/lib/services/onboarding-service";
import type { AppLocale } from "@/i18n/translations";
import type { OpeningHours, SalonType, OnboardingStep } from "@/lib/utils/onboarding/onboarding-utils";
import { DEFAULT_OPENING_HOURS } from "@/lib/utils/onboarding/onboarding-utils";

interface UseOnboardingOptions {
  initialLocale: AppLocale;
  translations: {
    createError: string;
  };
}

export function useOnboarding({ initialLocale, translations }: UseOnboardingOptions) {
  const router = useRouter();
  const { setLocale } = useLocale();

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

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setError(null);

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

