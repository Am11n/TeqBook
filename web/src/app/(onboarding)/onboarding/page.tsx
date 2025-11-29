"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase-client";
import { FormLayout } from "@/components/form-layout";
import { useLocale } from "@/components/locale-provider";
import { translations, type AppLocale } from "@/i18n/translations";
import { Button } from "@/components/ui/button";

type OnboardingStep = 1 | 2 | 3;

type SalonType = "barber" | "nails" | "massage" | "other";

export default function OnboardingPage() {
  const router = useRouter();
  const { locale, setLocale } = useLocale();
  const appLocale = locale as AppLocale;
  const t = translations[appLocale].onboarding;

  const [currentStep, setCurrentStep] = useState<OnboardingStep>(1);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">(
    "idle",
  );
  const [error, setError] = useState<string | null>(null);

  // Step 1: Grunninfo
  const [name, setName] = useState("");
  const [salonType, setSalonType] = useState<SalonType>("barber");
  // Initialize preferredLanguage from current locale
  const [preferredLanguage, setPreferredLanguage] = useState<AppLocale>(
    appLocale
  );

  // Step 2: Innstillinger
  const [onlineBooking, setOnlineBooking] = useState(false);
  const [publicBooking, setPublicBooking] = useState(true);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setError(null);

    // Call RPC function with all onboarding fields
    const { data, error: rpcError } = await supabase.rpc(
      "create_salon_for_current_user",
      {
        salon_name: name,
        salon_type_param: salonType,
        preferred_language_param: preferredLanguage,
        online_booking_enabled_param: onlineBooking,
        is_public_param: publicBooking,
      },
    );

    if (rpcError || !data) {
      setError(rpcError?.message ?? t.createError);
      setStatus("error");
      return;
    }

    // Set the locale to the preferred language before redirecting
    setLocale(preferredLanguage);

    setStatus("success");
    router.push("/dashboard");
  }

  function handleNext() {
    if (currentStep < 3) {
      setCurrentStep((prev) => (prev + 1) as OnboardingStep);
    }
  }

  function handleBack() {
    if (currentStep > 1) {
      setCurrentStep((prev) => (prev - 1) as OnboardingStep);
    }
  }

  const canProceedStep1 = name.trim().length > 0;
  const canProceedStep2 = true; // Step 2 has no required fields

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-2xl">
        <FormLayout
          title={t.title}
          description={t.description}
          footer={
            <p className="mt-2 text-xs text-muted-foreground">{t.footerHint}</p>
          }
        >
          {/* Progress indicator */}
          <div className="mb-6 flex items-center justify-center gap-2">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex items-center gap-2">
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium ${
                    currentStep === step
                      ? "bg-primary text-primary-foreground"
                      : currentStep > step
                      ? "bg-emerald-500 text-white"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {step}
                </div>
                {step < 3 && (
                  <div
                    className={`h-0.5 w-8 ${
                      currentStep > step ? "bg-emerald-500" : "bg-muted"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Step 1: Grunninfo */}
            {currentStep === 1 && (
              <div className="space-y-4">
                <div>
                  <h2 className="text-lg font-semibold">{t.step1Title}</h2>
                  <p className="text-sm text-muted-foreground">
                    {t.step1Description}
                  </p>
                </div>

                <div className="space-y-2 text-sm">
                  <label htmlFor="name" className="font-medium">
                    {t.nameLabel}
                  </label>
                  <input
                    id="name"
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="h-10 w-full rounded-md border bg-background px-3 text-sm outline-none ring-ring/0 transition focus-visible:ring-2"
                    placeholder={t.namePlaceholder}
                  />
                </div>

                <div className="space-y-2 text-sm">
                  <label htmlFor="salonType" className="font-medium">
                    {t.salonTypeLabel}
                  </label>
                  <select
                    id="salonType"
                    value={salonType}
                    onChange={(e) => setSalonType(e.target.value as SalonType)}
                    className="h-10 w-full rounded-md border bg-background px-3 text-sm outline-none ring-ring/0 transition focus-visible:ring-2"
                  >
                    <option value="barber">{t.salonTypeBarber}</option>
                    <option value="nails">{t.salonTypeNails}</option>
                    <option value="massage">{t.salonTypeMassage}</option>
                    <option value="other">{t.salonTypeOther}</option>
                  </select>
                </div>

                <div className="space-y-2 text-sm">
                  <label className="font-medium">
                    {t.paymentMethodLabel}
                  </label>
                  <div className="rounded-md border bg-muted/50 p-3 text-sm text-muted-foreground">
                    {t.paymentMethodPhysicalOnly}
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  <label htmlFor="preferredLanguage" className="font-medium">
                    {t.preferredLanguageLabel}
                  </label>
                  <select
                    id="preferredLanguage"
                    value={preferredLanguage}
                    onChange={(e) => {
                      const newLang = e.target.value as AppLocale;
                      setPreferredLanguage(newLang);
                      // Update the global locale immediately so the UI updates
                      setLocale(newLang);
                    }}
                    className="h-10 w-full rounded-md border bg-background px-3 text-sm outline-none ring-ring/0 transition focus-visible:ring-2"
                  >
                    <option value="nb">🇳🇴 Norsk</option>
                    <option value="en">🇬🇧 English</option>
                    <option value="ar">🇸🇦 العربية</option>
                    <option value="so">🇸🇴 Soomaali</option>
                    <option value="ti">🇪🇷 ትግርኛ</option>
                    <option value="am">🇪🇹 አማርኛ</option>
                    <option value="tr">🇹🇷 Türkçe</option>
                    <option value="pl">🇵🇱 Polski</option>
                    <option value="vi">🇻🇳 Tiếng Việt</option>
                    <option value="tl">🇵🇭 Tagalog</option>
                    <option value="zh">🇨🇳 中文</option>
                    <option value="fa">🇮🇷 فارسی</option>
                    <option value="dar">🇦🇫 دری (Dari)</option>
                    <option value="ur">🇵🇰 اردو</option>
                    <option value="hi">🇮🇳 हिन्दी</option>
                  </select>
                </div>

                <div className="flex justify-end">
                  <Button
                    type="button"
                    onClick={handleNext}
                    disabled={!canProceedStep1}
                  >
                    {t.nextButton}
                  </Button>
                </div>
              </div>
            )}

            {/* Step 2: Innstillinger */}
            {currentStep === 2 && (
              <div className="space-y-4">
                <div>
                  <h2 className="text-lg font-semibold">{t.step2Title}</h2>
                  <p className="text-sm text-muted-foreground">
                    {t.step2Description}
                  </p>
                </div>

                <div className="space-y-2 text-sm">
                  <label className="font-medium">
                    {t.onlineBookingLabel}
                  </label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="onlineBooking"
                        checked={onlineBooking === true}
                        onChange={() => setOnlineBooking(true)}
                        className="h-4 w-4"
                      />
                      <span>{t.onlineBookingYes}</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="onlineBooking"
                        checked={onlineBooking === false}
                        onChange={() => setOnlineBooking(false)}
                        className="h-4 w-4"
                      />
                      <span>{t.onlineBookingNo}</span>
                    </label>
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  <label className="font-medium">
                    {t.publicBookingLabel}
                  </label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="publicBooking"
                        checked={publicBooking === true}
                        onChange={() => setPublicBooking(true)}
                        className="h-4 w-4"
                      />
                      <span>{t.publicBookingYes}</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="publicBooking"
                        checked={publicBooking === false}
                        onChange={() => setPublicBooking(false)}
                        className="h-4 w-4"
                      />
                      <span>{t.publicBookingNo}</span>
                    </label>
                  </div>
                </div>

                <div className="flex justify-between">
                  <Button type="button" variant="outline" onClick={handleBack}>
                    {t.backButton}
                  </Button>
                  <Button
                    type="button"
                    onClick={handleNext}
                    disabled={!canProceedStep2}
                  >
                    {t.nextButton}
                  </Button>
                </div>
              </div>
            )}

            {/* Step 3: Bekreft */}
            {currentStep === 3 && (
              <div className="space-y-4">
                <div>
                  <h2 className="text-lg font-semibold">{t.step3Title}</h2>
                  <p className="text-sm text-muted-foreground">
                    {t.step3Description}
                  </p>
                </div>

                <div className="rounded-lg border bg-card p-4">
                  <h3 className="mb-4 font-medium">{t.summaryLabel}</h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        {t.summarySalonName}:
                      </span>
                      <span className="font-medium">{name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        {t.summarySalonType}:
                      </span>
                      <span className="font-medium">
                        {
                          {
                            barber: t.salonTypeBarber,
                            nails: t.salonTypeNails,
                            massage: t.salonTypeMassage,
                            other: t.salonTypeOther,
                          }[salonType]
                        }
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        {t.summaryPaymentMethod}:
                      </span>
                      <span className="font-medium">
                        {t.paymentMethodPhysicalOnly}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        {t.summaryPreferredLanguage}:
                      </span>
                      <span className="font-medium">
                        {preferredLanguage === "nb"
                          ? "🇳🇴 Norsk"
                          : preferredLanguage === "en"
                          ? "🇬🇧 English"
                          : preferredLanguage === "ar"
                          ? "🇸🇦 العربية"
                          : preferredLanguage}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        {t.summaryOnlineBooking}:
                      </span>
                      <span className="font-medium">
                        {onlineBooking ? t.onlineBookingYes : t.onlineBookingNo}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        {t.summaryPublicBooking}:
                      </span>
                      <span className="font-medium">
                        {publicBooking
                          ? t.publicBookingYes
                          : t.publicBookingNo}
                      </span>
                    </div>
                  </div>
                </div>

                {error && (
                  <p className="text-sm text-red-500" aria-live="polite">
                    {error}
                  </p>
                )}

                <div className="flex justify-between">
                  <Button type="button" variant="outline" onClick={handleBack}>
                    {t.backButton}
                  </Button>
                  <Button
                    type="submit"
                    disabled={status === "loading"}
                    className="min-w-[120px]"
                  >
                    {status === "loading" ? t.saving : t.createButton}
                  </Button>
                </div>
              </div>
            )}
          </form>
        </FormLayout>
      </div>
    </div>
  );
}
