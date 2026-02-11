"use client";

import { motion } from "framer-motion";
import type { SalonType } from "@/lib/utils/onboarding/onboarding-utils";
import type { AppLocale } from "@/i18n/translations";
import { getCountryLabel } from "@/lib/utils/onboarding/country-timezones";

interface OnboardingStep3Props {
  name: string;
  salonType: SalonType;
  country: string;
  preferredLanguage: AppLocale;
  onlineBooking: boolean;
  publicBooking: boolean;
  status: "idle" | "loading" | "success" | "error";
  error: string | null;
  onBack: () => void;
  translations: {
    summaryLabel: string;
    summarySalonName: string;
    summarySalonType: string;
    summaryCountry: string;
    summaryPaymentMethod: string;
    summaryPreferredLanguage: string;
    summaryOnlineBooking: string;
    summaryPublicBooking: string;
    salonTypeBarber: string;
    salonTypeNails: string;
    salonTypeMassage: string;
    salonTypeOther: string;
    paymentMethodPhysicalOnly: string;
    onlineBookingYes: string;
    onlineBookingNo: string;
    publicBookingYes: string;
    publicBookingNo: string;
    backButton: string;
    saving: string;
    createButton: string;
  };
}

export function OnboardingStep3({
  name,
  salonType,
  country,
  preferredLanguage,
  onlineBooking,
  publicBooking,
  status,
  error,
  onBack,
  translations,
}: OnboardingStep3Props) {
  const getLanguageLabel = (lang: AppLocale) => {
    const labels: Record<AppLocale, string> = {
      nb: "🇳🇴 Norsk",
      en: "🇬🇧 English",
      ar: "🇸🇦 العربية",
      so: "🇸🇴 Soomaali",
      ti: "🇪🇷 ትግርኛ",
      am: "🇪🇹 አማርኛ",
      tr: "🇹🇷 Türkçe",
      pl: "🇵🇱 Polski",
      vi: "🇻🇳 Tiếng Việt",
      tl: "🇵🇭 Tagalog",
      zh: "🇨🇳 中文",
      fa: "🇮🇷 فارسی",
      dar: "🇦🇫 دری (Dari)",
      ur: "🇵🇰 اردو",
      hi: "🇮🇳 हिन्दी",
    };
    return labels[lang] || lang;
  };

  return (
    <motion.div
      className="space-y-5"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      <div className="rounded-xl border border-slate-200/60 bg-blue-50/40 backdrop-blur-md p-4">
        <h3 className="mb-4 text-sm font-semibold text-slate-900">{translations.summaryLabel}</h3>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-slate-600">{translations.summarySalonName}:</span>
            <span className="font-medium text-slate-900">{name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-600">{translations.summarySalonType}:</span>
            <span className="font-medium text-slate-900">
              {
                {
                  barber: translations.salonTypeBarber,
                  nails: translations.salonTypeNails,
                  massage: translations.salonTypeMassage,
                  other: translations.salonTypeOther,
                }[salonType]
              }
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-600">{translations.summaryCountry}:</span>
            <span className="font-medium text-slate-900">{getCountryLabel(country)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-600">{translations.summaryPaymentMethod}:</span>
            <span className="font-medium text-slate-900">
              {translations.paymentMethodPhysicalOnly}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-600">{translations.summaryPreferredLanguage}:</span>
            <span className="font-medium text-slate-900">{getLanguageLabel(preferredLanguage)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-600">{translations.summaryOnlineBooking}:</span>
            <span className="font-medium text-slate-900">
              {onlineBooking ? translations.onlineBookingYes : translations.onlineBookingNo}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-600">{translations.summaryPublicBooking}:</span>
            <span className="font-medium text-slate-900">
              {publicBooking ? translations.publicBookingYes : translations.publicBookingNo}
            </span>
          </div>
        </div>
      </div>

      {error && (
        <p className="text-sm text-red-500" aria-live="polite">
          {error}
        </p>
      )}

      <div className="flex justify-between pt-2">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-6 py-2.75 text-sm font-medium text-slate-700 transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-slate-900 focus-visible:ring-offset-white"
        >
          {translations.backButton}
        </button>
        <button
          type="submit"
          disabled={status === "loading"}
          className="inline-flex items-center justify-center h-11 rounded-xl bg-slate-900 px-6 text-sm font-semibold tracking-tight text-white shadow-[0_16px_40px_rgba(15,23,42,0.45)] transition hover:bg-opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-slate-900 focus-visible:ring-offset-white disabled:cursor-not-allowed disabled:opacity-70"
        >
          {status === "loading" ? translations.saving : translations.createButton}
        </button>
      </div>
    </motion.div>
  );
}

