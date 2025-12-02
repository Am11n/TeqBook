"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { supabase } from "@/lib/supabase-client";
import { useLocale } from "@/components/locale-provider";
import { translations, type AppLocale } from "@/i18n/translations";
import { motion } from "framer-motion";

type OnboardingStep = 1 | 2 | 3;

type SalonType = "barber" | "nails" | "massage" | "other";

type OpeningHours = {
  day: number; // 0 = Monday, 6 = Sunday
  isOpen: boolean;
  openTime: string; // HH:mm format
  closeTime: string; // HH:mm format
};

const DEFAULT_OPENING_HOURS: OpeningHours[] = [
  { day: 0, isOpen: true, openTime: "09:00", closeTime: "17:00" }, // Monday
  { day: 1, isOpen: true, openTime: "09:00", closeTime: "17:00" }, // Tuesday
  { day: 2, isOpen: true, openTime: "09:00", closeTime: "17:00" }, // Wednesday
  { day: 3, isOpen: true, openTime: "09:00", closeTime: "17:00" }, // Thursday
  { day: 4, isOpen: true, openTime: "09:00", closeTime: "17:00" }, // Friday
  { day: 5, isOpen: false, openTime: "09:00", closeTime: "17:00" }, // Saturday
  { day: 6, isOpen: false, openTime: "09:00", closeTime: "17:00" }, // Sunday
];

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

  // Step 2: Åpningstider & Innstillinger
  const [openingHours, setOpeningHours] = useState<OpeningHours[]>(
    DEFAULT_OPENING_HOURS
  );
  const [onlineBooking, setOnlineBooking] = useState(false);
  const [publicBooking, setPublicBooking] = useState(true);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setError(null);

    // First create the salon
    const { data: salonData, error: rpcError } = await supabase.rpc(
      "create_salon_for_current_user",
      {
        salon_name: name,
        salon_type_param: salonType,
        preferred_language_param: preferredLanguage,
        online_booking_enabled_param: onlineBooking,
        is_public_param: publicBooking,
      },
    );

    if (rpcError || !salonData) {
      setError(rpcError?.message ?? t.createError);
      setStatus("error");
      return;
    }

    // Then create opening hours
    const openingHoursToInsert = openingHours
      .filter((oh) => oh.isOpen)
      .map((oh) => ({
        salon_id: salonData,
        day_of_week: oh.day,
        open_time: oh.openTime,
        close_time: oh.closeTime,
      }));

    if (openingHoursToInsert.length > 0) {
      const { error: hoursError } = await supabase
        .from("opening_hours")
        .insert(openingHoursToInsert);

      if (hoursError) {
        setError(hoursError.message ?? t.createError);
        setStatus("error");
        return;
      }
    }

    const data = salonData;

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

  const stepLabels = [
    t.step1Title || "Salon information",
    t.step2Title || "Settings",
    t.step3Title || "Confirm & Create",
  ];

  const progressPercentage = ((currentStep - 1) / 2) * 100;

  return (
    <main className="min-h-screen bg-[#eef3ff] flex items-center justify-center px-4 py-6 sm:py-10 md:py-12">
      <div className="relative w-full max-w-6xl overflow-hidden rounded-[32px] bg-gradient-to-br from-[#d4e0ff] via-[#e3ebff] to-[#f5f7ff] shadow-[0_40px_120px_rgba(15,23,42,0.25)]">
        {/* Bakgrunns-sirkler - nøyaktig samme som login/signup */}
        <div className="pointer-events-none absolute -left-40 -top-40 h-96 w-96 rounded-full bg-white/20 blur-3xl" />
        <div className="pointer-events-none absolute -right-32 bottom-0 h-80 w-80 rounded-full bg-[#c7d7ff]/30 blur-3xl" />

        <div className="relative grid gap-8 sm:gap-12 p-8 md:p-12 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] lg:p-16">
          {/* Left side - Branding */}
          <motion.section 
            className="flex flex-col justify-center"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            {/* Logo row */}
            <Link href="/" className="flex items-center gap-3 mb-8 hover:opacity-80 transition-opacity">
              <Image
                src="/Favikon.svg"
                alt="TeqBook logo"
                width={40}
                height={40}
                className="drop-shadow-[0_2px_8px_rgba(15,23,42,0.15)]"
              />
              <span className="text-xl font-semibold tracking-tight text-slate-900">
                TeqBook
              </span>
            </Link>

            {/* Headline */}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-semibold leading-[1.2] tracking-tight text-slate-900 max-w-[460px]">
              Set up your{" "}
              <span className="text-[#1d4ed8]">TeqBook</span> salon
            </h1>

            {/* Description */}
            <p className="mt-4 max-w-[460px] text-sm sm:text-base text-slate-600">
              We'll help you set up your salon so you can start accepting bookings in minutes.
            </p>

            {/* Bullets */}
            <ul className="mt-6 space-y-2 text-sm text-slate-700">
              <li className="flex items-start gap-2">
                <span className="mt-[3px] h-1.5 w-1.5 rounded-full bg-[#2563eb]" />
                <span>Add your salon details</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-[3px] h-1.5 w-1.5 rounded-full bg-[#2563eb]" />
                <span>Customize your booking settings</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-[3px] h-1.5 w-1.5 rounded-full bg-[#2563eb]" />
                <span>Invite staff when you're ready</span>
              </li>
            </ul>

            {/* Trust line */}
            <p className="mt-8 text-xs text-slate-500">
              Trusted by salons that want simple, clean scheduling – not bloated software.
            </p>
          </motion.section>

          {/* Right side - Form card */}
          <section className="flex items-center justify-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="w-full max-w-[420px] rounded-3xl bg-white/90 px-5 pt-5 pb-6 shadow-[0_8px_40px_rgba(0,0,0,0.08)] backdrop-blur-xl border border-slate-100 overflow-hidden"
            >
              {/* Progress indicator */}
              <div className="mb-5">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">
                    Step {currentStep} of 3
                  </span>
                  <span className="text-[10px] text-slate-400">
                    {stepLabels[currentStep - 1]}
                  </span>
                </div>
                {/* Step indicators with circles and connectors */}
                <div className="flex items-center">
                  {[1, 2, 3].map((step) => {
                    const isActive = currentStep === step;
                    const isCompleted = currentStep > step;
                    return (
                      <div key={step} className="flex items-center flex-1 last:flex-none">
                        {/* Circle indicator */}
                        <motion.div 
                          className="relative z-10"
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ duration: 0.3, delay: step * 0.1 }}
                        >
                          <div
                            className={`h-3 w-3 rounded-full transition-all duration-300 ${
                              isActive
                                ? "bg-[#1d4ed8] ring-2 ring-[#1d4ed8]/30 ring-offset-2 ring-offset-white"
                                : isCompleted
                                ? "bg-slate-300"
                                : "bg-slate-200"
                            }`}
                          />
                        </motion.div>
                        {/* Connector line */}
                        {step < 3 && (
                          <div className="flex-1 h-[2px] mx-2 relative -z-0">
                            <motion.div
                              className={`h-full rounded-full ${
                                isCompleted || currentStep > step
                                  ? "bg-slate-300"
                                  : "bg-slate-200"
                              }`}
                              initial={{ width: 0 }}
                              animate={{ width: "100%" }}
                              transition={{ duration: 0.4, delay: step * 0.1 + 0.2 }}
                            />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="mb-6">
                <h2 className="text-xl font-semibold text-slate-900">
                  {stepLabels[currentStep - 1]}
                </h2>
                <p className="mt-1 text-sm text-slate-600">
                  {currentStep === 1 && "Add your core salon info so we can tailor bookings to your business."}
                  {currentStep === 2 && "Configure your opening hours and booking preferences."}
                  {currentStep === 3 && "Review your settings before creating your salon."}
                </p>
              </div>

              <form onSubmit={handleSubmit} className="mt-6 space-y-5">
                {/* Step 1: Salon Information */}
                {currentStep === 1 && (
                  <motion.div 
                    className="space-y-5"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                  >
                    <div className="space-y-1.5">
                      <label htmlFor="name" className="text-sm font-medium text-slate-800">
                {t.nameLabel}
              </label>
              <input
                id="name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                        className="w-full rounded-xl border border-slate-200/60 bg-[#edf2ff]/80 backdrop-blur-md px-3.5 py-2.5 text-sm text-slate-900 outline-none ring-0 transition focus:border-[#2563eb] focus:bg-white/90 focus:ring-2 focus:ring-[#2563eb]/30"
                placeholder={t.namePlaceholder}
              />
            </div>

                    <div className="space-y-1.5">
                      <label htmlFor="salonType" className="text-sm font-medium text-slate-800">
                        {t.salonTypeLabel}
                      </label>
                      <select
                        id="salonType"
                        value={salonType}
                        onChange={(e) => setSalonType(e.target.value as SalonType)}
                        className="w-full rounded-xl border border-slate-200/60 bg-[#edf2ff]/80 backdrop-blur-md px-3.5 py-2.5 text-sm text-slate-900 outline-none ring-0 transition focus:border-[#2563eb] focus:bg-white/90 focus:ring-2 focus:ring-[#2563eb]/30"
                      >
                        <option value="barber">{t.salonTypeBarber}</option>
                        <option value="nails">{t.salonTypeNails}</option>
                        <option value="massage">{t.salonTypeMassage}</option>
                        <option value="other">{t.salonTypeOther}</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-slate-800">
                        {t.paymentMethodLabel}
                      </label>
                      <div className="rounded-xl border border-slate-200/60 bg-[#edf2ff]/80 backdrop-blur-md px-3.5 py-2.5 text-sm text-slate-600">
                        {t.paymentMethodPhysicalOnly}
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label htmlFor="preferredLanguage" className="text-sm font-medium text-slate-800">
                        {t.preferredLanguageLabel}
                      </label>
                      <select
                        id="preferredLanguage"
                        value={preferredLanguage}
                        onChange={(e) => {
                          const newLang = e.target.value as AppLocale;
                          setPreferredLanguage(newLang);
                          setLocale(newLang);
                        }}
                        className="w-full rounded-xl border border-slate-200/60 bg-[#edf2ff]/80 backdrop-blur-md px-3.5 py-2.5 text-sm text-slate-900 outline-none ring-0 transition focus:border-[#2563eb] focus:bg-white/90 focus:ring-2 focus:ring-[#2563eb]/30"
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

                    <div className="flex justify-end pt-2">
                      <button
                        type="button"
                        onClick={handleNext}
                        disabled={!canProceedStep1}
                        className="inline-flex items-center justify-center h-11 rounded-xl bg-slate-900 px-6 text-sm font-semibold tracking-tight text-white shadow-[0_16px_40px_rgba(15,23,42,0.45)] transition hover:bg-opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-slate-900 focus-visible:ring-offset-white disabled:cursor-not-allowed disabled:opacity-70"
                      >
                        {t.nextButton}
                      </button>
                    </div>
                  </motion.div>
                )}

                {/* Step 2: Opening Hours & Settings */}
                {currentStep === 2 && (
                  <motion.div 
                    className="space-y-5"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                  >
                    {/* Opening Hours Section */}
                    <div>
                      <div>
                        <h3 className="text-sm font-semibold text-slate-900">
                          {t.openingHoursLabel}
                        </h3>
                        <p className="mt-1 text-xs text-slate-500/80">
                          {t.openingHoursDescription}
                        </p>
                      </div>
                      <div className="mt-3 w-full space-y-1.5">
                        {openingHours.map((dayHours, index) => {
                          const dayNames = [
                            t.monday,
                            t.tuesday,
                            t.wednesday,
                            t.thursday,
                            t.friday,
                            t.saturday,
                            t.sunday,
                          ];
                          return (
                            <div key={dayHours.day}>
                              {dayHours.isOpen ? (
                                <div className="grid grid-cols-[20px_90px_1fr_18px_1fr] items-center gap-2 rounded-xl px-3 py-1.5 hover:bg-slate-50/50 transition-colors">
                                  {/* Checkbox */}
                                  <label className="flex items-center cursor-pointer">
                                    <input
                                      type="checkbox"
                                      checked={dayHours.isOpen}
                                      onChange={(e) => {
                                        const updated = [...openingHours];
                                        updated[index] = {
                                          ...dayHours,
                                          isOpen: e.target.checked,
                                        };
                                        setOpeningHours(updated);
                                      }}
                                      className="h-4 w-4 rounded border-slate-300 text-[#2563eb] focus:ring-2 focus:ring-[#2563eb]/30"
                                    />
                                  </label>
                                  
                                  {/* Day name */}
                                  <span className="text-sm font-medium text-slate-700">
                                    {dayNames[dayHours.day]}
                                  </span>
                                  
                                  {/* Start time */}
                                  <input
                                    type="time"
                                    value={dayHours.openTime}
                                    onChange={(e) => {
                                      const updated = [...openingHours];
                                      updated[index] = {
                                        ...dayHours,
                                        openTime: e.target.value,
                                      };
                                      setOpeningHours(updated);
                                    }}
                                    className="h-9 rounded-xl border border-slate-200/60 bg-white/90 px-3 text-sm outline-none ring-0 transition focus:border-[#2563eb] focus:ring-2 focus:ring-[#2563eb]/30"
                                  />
                                  
                                  {/* Arrow separator */}
                                  <span className="text-center text-sm text-slate-400">→</span>
                                  
                                  {/* End time */}
                                  <input
                                    type="time"
                                    value={dayHours.closeTime}
                                    onChange={(e) => {
                                      const updated = [...openingHours];
                                      updated[index] = {
                                        ...dayHours,
                                        closeTime: e.target.value,
                                      };
                                      setOpeningHours(updated);
                                    }}
                                    className="h-9 rounded-xl border border-slate-200/60 bg-white/90 px-3 text-sm outline-none ring-0 transition focus:border-[#2563eb] focus:ring-2 focus:ring-[#2563eb]/30"
                                  />
                                </div>
                              ) : (
                                <div className="grid grid-cols-[20px_90px_1fr_18px_1fr] items-center gap-2 rounded-xl px-3 py-1.5 opacity-50 hover:bg-slate-50/50 transition-colors">
                                  {/* Checkbox */}
                                  <label className="flex items-center cursor-pointer">
                                    <input
                                      type="checkbox"
                                      checked={false}
                                      onChange={(e) => {
                                        const updated = [...openingHours];
                                        updated[index] = {
                                          ...dayHours,
                                          isOpen: e.target.checked,
                                        };
                                        setOpeningHours(updated);
                                      }}
                                      className="h-4 w-4 rounded border-slate-300 text-[#2563eb] focus:ring-2 focus:ring-[#2563eb]/30"
                                    />
                                  </label>
                                  
                                  {/* Day name */}
                                  <span className="text-sm font-medium text-slate-700">
                                    {dayNames[dayHours.day]}
                                  </span>
                                  
                                  {/* Closed text spanning remaining columns */}
                                  <span className="col-span-3 text-right text-sm text-slate-400">
                                    {t.closedLabel}
                                  </span>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Booking Settings Section */}
                    <div className="mt-4">
                      <div>
                        <h3 className="text-sm font-semibold text-slate-900">
                          Booking settings
                        </h3>
                      </div>
                      <div className="mt-3 grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-xs font-medium text-slate-700">
                            {t.onlineBookingLabel}
                          </label>
                          <div className="flex flex-col gap-1.5">
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="radio"
                                name="onlineBooking"
                                checked={onlineBooking === true}
                                onChange={() => setOnlineBooking(true)}
                                className="h-3.5 w-3.5 border-slate-300 text-[#2563eb] focus:ring-2 focus:ring-[#2563eb]/30"
                              />
                              <span className="text-sm text-slate-700">{t.onlineBookingYes}</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="radio"
                                name="onlineBooking"
                                checked={onlineBooking === false}
                                onChange={() => setOnlineBooking(false)}
                                className="h-3.5 w-3.5 border-slate-300 text-[#2563eb] focus:ring-2 focus:ring-[#2563eb]/30"
                              />
                              <span className="text-sm text-slate-700">{t.onlineBookingNo}</span>
                            </label>
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-xs font-medium text-slate-700">
                            {t.publicBookingLabel}
                          </label>
                          <div className="flex flex-col gap-1.5">
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="radio"
                                name="publicBooking"
                                checked={publicBooking === true}
                                onChange={() => setPublicBooking(true)}
                                className="h-3.5 w-3.5 border-slate-300 text-[#2563eb] focus:ring-2 focus:ring-[#2563eb]/30"
                              />
                              <span className="text-sm text-slate-700">{t.publicBookingYes}</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="radio"
                                name="publicBooking"
                                checked={publicBooking === false}
                                onChange={() => setPublicBooking(false)}
                                className="h-3.5 w-3.5 border-slate-300 text-[#2563eb] focus:ring-2 focus:ring-[#2563eb]/30"
                              />
                              <span className="text-sm text-slate-700">{t.publicBookingNo}</span>
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-between pt-2">
                      <button
                        type="button"
                        onClick={handleBack}
                        className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-6 py-2.75 text-sm font-medium text-slate-700 transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-slate-900 focus-visible:ring-offset-white"
                      >
                        {t.backButton}
                      </button>
                      <button
                        type="button"
                        onClick={handleNext}
                        disabled={!canProceedStep2}
                        className="inline-flex items-center justify-center h-11 rounded-xl bg-slate-900 px-6 text-sm font-semibold tracking-tight text-white shadow-[0_16px_40px_rgba(15,23,42,0.45)] transition hover:bg-opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-slate-900 focus-visible:ring-offset-white disabled:cursor-not-allowed disabled:opacity-70"
                      >
                        {t.nextButton}
                      </button>
                    </div>
                  </motion.div>
                )}

                {/* Step 3: Confirm & Create */}
                {currentStep === 3 && (
                  <motion.div 
                    className="space-y-5"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                  >
                    <div className="rounded-xl border border-slate-200/60 bg-[#edf2ff]/40 backdrop-blur-md p-4">
                      <h3 className="mb-4 text-sm font-semibold text-slate-900">
                        {t.summaryLabel}
                      </h3>
                      <div className="space-y-3 text-sm">
                        <div className="flex justify-between">
                          <span className="text-slate-600">
                            {t.summarySalonName}:
                          </span>
                          <span className="font-medium text-slate-900">{name}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-600">
                            {t.summarySalonType}:
                          </span>
                          <span className="font-medium text-slate-900">
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
                          <span className="text-slate-600">
                            {t.summaryPaymentMethod}:
                          </span>
                          <span className="font-medium text-slate-900">
                            {t.paymentMethodPhysicalOnly}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-600">
                            {t.summaryPreferredLanguage}:
                          </span>
                          <span className="font-medium text-slate-900">
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
                          <span className="text-slate-600">
                            {t.summaryOnlineBooking}:
                          </span>
                          <span className="font-medium text-slate-900">
                            {onlineBooking ? t.onlineBookingYes : t.onlineBookingNo}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-600">
                            {t.summaryPublicBooking}:
                          </span>
                          <span className="font-medium text-slate-900">
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

                    <div className="flex justify-between pt-2">
                      <button
                        type="button"
                        onClick={handleBack}
                        className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-6 py-2.75 text-sm font-medium text-slate-700 transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-slate-900 focus-visible:ring-offset-white"
                      >
                        {t.backButton}
                      </button>
            <button
              type="submit"
              disabled={status === "loading"}
                        className="inline-flex items-center justify-center h-11 rounded-xl bg-slate-900 px-6 text-sm font-semibold tracking-tight text-white shadow-[0_16px_40px_rgba(15,23,42,0.45)] transition hover:bg-opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-slate-900 focus-visible:ring-offset-white disabled:cursor-not-allowed disabled:opacity-70"
            >
                        {status === "loading" ? t.saving : t.createButton}
            </button>
                    </div>
                  </motion.div>
                )}
          </form>

              <p className="mt-6 text-[11px] text-center text-slate-400">
                Your salon information is securely stored. You can update these settings anytime from your dashboard.
              </p>
            </motion.div>
          </section>
          </div>
      </div>
    </main>
  );
}
