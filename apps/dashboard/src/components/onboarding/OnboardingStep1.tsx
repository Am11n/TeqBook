"use client";

import { motion } from "framer-motion";
import { Field } from "@/components/form/Field";
import { DialogSelect } from "@/components/ui/dialog-select";
import type { SalonType } from "@/lib/utils/onboarding/onboarding-utils";
import type { AppLocale } from "@/i18n/translations";
import { COUNTRIES } from "@/lib/utils/onboarding/country-timezones";

interface OnboardingStep1Props {
  name: string;
  setName: (name: string) => void;
  salonType: SalonType;
  setSalonType: (type: SalonType) => void;
  country: string;
  setCountry: (code: string) => void;
  whatsappNumber: string;
  setWhatsappNumber: (number: string) => void;
  preferredLanguage: AppLocale;
  setPreferredLanguage: (lang: AppLocale) => void;
  onLocaleChange: (lang: AppLocale) => void;
  canProceed: boolean;
  onNext: () => void;
  translations: {
    nameLabel: string;
    namePlaceholder: string;
    salonTypeLabel: string;
    salonTypeBarber: string;
    salonTypeNails: string;
    salonTypeMassage: string;
    salonTypeOther: string;
    paymentMethodLabel: string;
    paymentMethodPhysicalOnly: string;
    countryLabel: string;
    preferredLanguageLabel: string;
    whatsappNumberLabel: string;
    whatsappNumberHint: string;
    whatsappNumberPlaceholder: string;
    nextButton: string;
  };
}

export function OnboardingStep1({
  name,
  setName,
  salonType,
  setSalonType,
  country,
  setCountry,
  whatsappNumber,
  setWhatsappNumber,
  preferredLanguage,
  setPreferredLanguage,
  onLocaleChange,
  canProceed,
  onNext,
  translations,
}: OnboardingStep1Props) {
  return (
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      <Field label={translations.nameLabel} htmlFor="name" required>
        <input
          id="name"
          type="text"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full rounded-xl border border-slate-200/60 bg-blue-50/80 backdrop-blur-md px-3.5 py-2.5 text-sm text-slate-900 outline-none ring-0 transition focus:border-blue-600 focus:bg-white/90 focus:ring-2 focus:ring-blue-600/30"
          placeholder={translations.namePlaceholder}
        />
      </Field>

      <Field label={translations.salonTypeLabel} htmlFor="salonType">
        <DialogSelect
          value={salonType}
          onChange={(v) => setSalonType(v as SalonType)}
          options={[
            { value: "barber", label: translations.salonTypeBarber },
            { value: "nails", label: translations.salonTypeNails },
            { value: "massage", label: translations.salonTypeMassage },
            { value: "other", label: translations.salonTypeOther },
          ]}
        />
      </Field>

      <Field label={translations.paymentMethodLabel}>
        <div className="rounded-xl border border-slate-200/60 bg-blue-50/80 backdrop-blur-md px-3.5 py-2.5 text-sm text-slate-600">
          {translations.paymentMethodPhysicalOnly}
        </div>
      </Field>

      <Field label={translations.countryLabel} htmlFor="country">
        <DialogSelect
          value={country}
          onChange={setCountry}
          options={COUNTRIES.map((c) => ({ value: c.code, label: c.label }))}
        />
      </Field>

      <Field label={translations.preferredLanguageLabel} htmlFor="preferredLanguage">
        <DialogSelect
          value={preferredLanguage}
          onChange={(v) => {
            const newLang = v as AppLocale;
            setPreferredLanguage(newLang);
            onLocaleChange(newLang);
          }}
          options={[
            { value: "nb", label: "Norsk" },
            { value: "en", label: "English" },
            { value: "ar", label: "العربية" },
            { value: "so", label: "Soomaali" },
            { value: "ti", label: "ትግርኛ" },
            { value: "am", label: "አማርኛ" },
            { value: "tr", label: "Türkçe" },
            { value: "pl", label: "Polski" },
            { value: "vi", label: "Tiếng Việt" },
            { value: "tl", label: "Tagalog" },
            { value: "zh", label: "中文" },
            { value: "fa", label: "فارسی" },
            { value: "dar", label: "دری (Dari)" },
            { value: "ur", label: "اردو" },
            { value: "hi", label: "हिन्दी" },
          ]}
        />
      </Field>

      <Field
        label={translations.whatsappNumberLabel}
        htmlFor="whatsappNumber"
        description={translations.whatsappNumberHint}
      >
        <input
          id="whatsappNumber"
          type="tel"
          value={whatsappNumber}
          onChange={(e) => setWhatsappNumber(e.target.value)}
          className="w-full rounded-xl border border-slate-200/60 bg-blue-50/80 backdrop-blur-md px-3.5 py-2.5 text-sm text-slate-900 outline-none ring-0 transition focus:border-blue-600 focus:bg-white/90 focus:ring-2 focus:ring-blue-600/30"
          placeholder={translations.whatsappNumberPlaceholder}
        />
      </Field>

      <div className="flex justify-end pt-2">
        <button
          type="button"
          onClick={onNext}
          disabled={!canProceed}
          className="inline-flex items-center justify-center h-11 rounded-xl bg-slate-900 px-6 text-sm font-semibold tracking-tight text-white shadow-[0_16px_40px_rgba(15,23,42,0.45)] transition hover:bg-opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-slate-900 focus-visible:ring-offset-white disabled:cursor-not-allowed disabled:opacity-70"
        >
          {translations.nextButton}
        </button>
      </div>
    </motion.div>
  );
}

