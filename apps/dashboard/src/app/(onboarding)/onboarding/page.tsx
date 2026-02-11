"use client";

import { useLocale } from "@/components/locale-provider";
import { translations, type AppLocale } from "@/i18n/translations";
import { motion } from "framer-motion";
import { useOnboarding } from "@/lib/hooks/onboarding/useOnboarding";
import { OnboardingBranding } from "@/components/onboarding/OnboardingBranding";
import { OnboardingProgress } from "@/components/onboarding/OnboardingProgress";
import { OnboardingStep1 } from "@/components/onboarding/OnboardingStep1";
import { OnboardingStep2 } from "@/components/onboarding/OnboardingStep2";
import { OnboardingStep3 } from "@/components/onboarding/OnboardingStep3";

export default function OnboardingPage() {
  const { locale, setLocale } = useLocale();
  const appLocale = locale as AppLocale;
  const t = translations[appLocale].onboarding;

  const onboarding = useOnboarding({
    initialLocale: appLocale,
    translations: {
      createError: t.createError,
    },
  });

  const stepLabels = [
    t.step1Title || "Salon information",
    t.step2Title || "Settings",
    t.step3Title || "Confirm & Create",
  ];

  return (
    <main className="min-h-screen bg-blue-50 flex items-center justify-center px-4 py-6 sm:py-10 md:py-12">
      <div className="relative w-full max-w-6xl overflow-hidden rounded-[32px] bg-gradient-to-br from-blue-100 via-blue-50 to-slate-50 shadow-[0_40px_120px_rgba(15,23,42,0.25)]">
        {/* Bakgrunns-sirkler - nøyaktig samme som login/signup */}
        <div className="pointer-events-none absolute -left-40 -top-40 h-96 w-96 rounded-full bg-white/20 blur-3xl" />
        <div className="pointer-events-none absolute -right-32 bottom-0 h-80 w-80 rounded-full bg-blue-200/30 blur-3xl" />

        <div className="relative grid gap-8 sm:gap-12 p-8 md:p-12 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] lg:p-16">
          {/* Left side - Branding */}
          <OnboardingBranding />

          {/* Right side - Form card */}
          <section className="flex items-center justify-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="w-full max-w-[420px] rounded-3xl bg-white/90 px-5 pt-5 pb-6 shadow-[0_8px_40px_rgba(0,0,0,0.08)] backdrop-blur-xl border border-slate-100 overflow-hidden"
            >
              {/* Progress indicator */}
              <OnboardingProgress currentStep={onboarding.currentStep} stepLabels={stepLabels} />

              <div className="mb-6">
                <h2 className="text-xl font-semibold text-slate-900">
                  {stepLabels[onboarding.currentStep - 1]}
                </h2>
                <p className="mt-1 text-sm text-slate-600">
                  {onboarding.currentStep === 1 &&
                    "Add your core salon info so we can tailor bookings to your business."}
                  {onboarding.currentStep === 2 &&
                    "Configure your opening hours and booking preferences."}
                  {onboarding.currentStep === 3 &&
                    "Review your settings before creating your salon."}
                </p>
              </div>

              <form onSubmit={onboarding.handleSubmit} className="mt-6 space-y-6">
                {/* Step 1: Salon Information */}
                {onboarding.currentStep === 1 && (
                  <OnboardingStep1
                    name={onboarding.name}
                    setName={onboarding.setName}
                    salonType={onboarding.salonType}
                    setSalonType={onboarding.setSalonType}
                    country={onboarding.country}
                    setCountry={onboarding.setCountry}
                    whatsappNumber={onboarding.whatsappNumber}
                    setWhatsappNumber={onboarding.setWhatsappNumber}
                    preferredLanguage={onboarding.preferredLanguage}
                    setPreferredLanguage={onboarding.setPreferredLanguage}
                    onLocaleChange={setLocale}
                    canProceed={onboarding.canProceedStep1}
                    onNext={onboarding.handleNext}
                    translations={{
                      nameLabel: t.nameLabel,
                      namePlaceholder: t.namePlaceholder,
                      salonTypeLabel: t.salonTypeLabel,
                      salonTypeBarber: t.salonTypeBarber,
                      salonTypeNails: t.salonTypeNails,
                      salonTypeMassage: t.salonTypeMassage,
                      salonTypeOther: t.salonTypeOther,
                      paymentMethodLabel: t.paymentMethodLabel,
                      paymentMethodPhysicalOnly: t.paymentMethodPhysicalOnly,
                      countryLabel: t.countryLabel,
                      preferredLanguageLabel: t.preferredLanguageLabel,
                      whatsappNumberLabel: t.whatsappNumberLabel,
                      whatsappNumberHint: t.whatsappNumberHint,
                      whatsappNumberPlaceholder: t.whatsappNumberPlaceholder,
                      nextButton: t.nextButton,
                    }}
                  />
                )}

                {/* Step 2: Opening Hours & Settings */}
                {onboarding.currentStep === 2 && (
                  <OnboardingStep2
                    openingHours={onboarding.openingHours}
                    setOpeningHours={onboarding.setOpeningHours}
                    onlineBooking={onboarding.onlineBooking}
                    setOnlineBooking={onboarding.setOnlineBooking}
                    publicBooking={onboarding.publicBooking}
                    setPublicBooking={onboarding.setPublicBooking}
                    canProceed={onboarding.canProceedStep2}
                    onNext={onboarding.handleNext}
                    onBack={onboarding.handleBack}
                    translations={{
                      openingHoursLabel: t.openingHoursLabel,
                      openingHoursDescription: t.openingHoursDescription,
                      monday: t.monday,
                      tuesday: t.tuesday,
                      wednesday: t.wednesday,
                      thursday: t.thursday,
                      friday: t.friday,
                      saturday: t.saturday,
                      sunday: t.sunday,
                      closedLabel: t.closedLabel,
                      onlineBookingLabel: t.onlineBookingLabel,
                      onlineBookingYes: t.onlineBookingYes,
                      onlineBookingNo: t.onlineBookingNo,
                      publicBookingLabel: t.publicBookingLabel,
                      publicBookingYes: t.publicBookingYes,
                      publicBookingNo: t.publicBookingNo,
                      backButton: t.backButton,
                      nextButton: t.nextButton,
                    }}
                  />
                )}

                {/* Step 3: Confirm & Create */}
                {onboarding.currentStep === 3 && (
                  <OnboardingStep3
                    name={onboarding.name}
                    salonType={onboarding.salonType}
                    country={onboarding.country}
                    preferredLanguage={onboarding.preferredLanguage}
                    onlineBooking={onboarding.onlineBooking}
                    publicBooking={onboarding.publicBooking}
                    status={onboarding.status}
                    error={onboarding.error}
                    onBack={onboarding.handleBack}
                    translations={{
                      summaryLabel: t.summaryLabel,
                      summarySalonName: t.summarySalonName,
                      summarySalonType: t.summarySalonType,
                      summaryCountry: t.summaryCountry,
                      summaryPaymentMethod: t.summaryPaymentMethod,
                      summaryPreferredLanguage: t.summaryPreferredLanguage,
                      summaryOnlineBooking: t.summaryOnlineBooking,
                      summaryPublicBooking: t.summaryPublicBooking,
                      salonTypeBarber: t.salonTypeBarber,
                      salonTypeNails: t.salonTypeNails,
                      salonTypeMassage: t.salonTypeMassage,
                      salonTypeOther: t.salonTypeOther,
                      paymentMethodPhysicalOnly: t.paymentMethodPhysicalOnly,
                      onlineBookingYes: t.onlineBookingYes,
                      onlineBookingNo: t.onlineBookingNo,
                      publicBookingYes: t.publicBookingYes,
                      publicBookingNo: t.publicBookingNo,
                      backButton: t.backButton,
                      saving: t.saving,
                      createButton: t.createButton,
                    }}
                  />
                )}
              </form>

              <p className="mt-6 text-[11px] text-center text-slate-400">
                Your salon information is securely stored. You can update these settings anytime
                from your dashboard.
              </p>
            </motion.div>
          </section>
        </div>
      </div>
    </main>
  );
}
