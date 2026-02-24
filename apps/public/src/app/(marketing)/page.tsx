"use client";

import { useEffect } from "react";
import dynamic from "next/dynamic";
import { copy } from "@/components/landing/landing-copy";
import { useLocale } from "@/components/locale-provider";
import { HeroPlaceholder } from "@/components/landing/HeroPlaceholder";
import { LandingPricing } from "@/components/landing/LandingPricing";
import type { AppLocale } from "@/i18n/translations";

const LANDING_LOCALE_KEY = "teqbook_landing_locale";

const LandingHero = dynamic(
  () => import("@/components/landing/LandingHero").then((m) => m.LandingHero),
  { ssr: false, loading: () => <HeroPlaceholder /> }
);

const LandingStats = dynamic(
  () => import("@/components/landing/LandingStats").then((m) => m.LandingStats),
  { ssr: true }
);

const LandingFAQ = dynamic(
  () => import("@/components/landing/LandingFAQ").then((m) => m.LandingFAQ),
  { ssr: true }
);

export default function LandingPage() {
  const { locale, setLocale } = useLocale();

  useEffect(() => {
    try {
      const stored = localStorage.getItem(LANDING_LOCALE_KEY);
      if (stored && stored in copy) {
        setLocale(stored as AppLocale);
      }
    } catch { /* ignore */ }
  }, [setLocale]);

  const t = copy[locale as keyof typeof copy] ?? copy.en;

  return (
    <div className="flex flex-col bg-gradient-to-b from-slate-50 via-blue-50/30 to-blue-50/20">
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-blue-400/20 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-blue-400/20 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-300/10 blur-3xl" />
      </div>

      <LandingHero
        locale={locale}
        badge={t.badge}
        heroTitle={t.heroTitle}
        heroSubtitle={t.heroSubtitle}
        ctaPrimary={t.ctaPrimary}
        ctaSecondary={t.ctaSecondary}
        newBooking={t.newBooking}
        exampleCustomerName={t.exampleCustomerName}
        exampleService={t.exampleService}
        exampleDate={t.exampleDate}
        today={t.today}
        bookingsCount={t.bookingsCount}
        cutService={t.cutService}
      />

      <LandingStats stats={t.stats} />

      <LandingPricing
        pricingTitle={t.pricingTitle}
        pricingSubtitle={t.pricingSubtitle}
        affordableSimple={t.affordableSimple}
        tiers={t.tiers}
        startFreeTrial={t.startFreeTrial}
        addOnsTitle={t.addOnsTitle}
        addOnsDescription={t.addOnsDescription}
        multilingualBookingTitle={t.multilingualBookingTitle}
        multilingualBookingDescription={t.multilingualBookingDescription}
        extraStaffTitle={t.extraStaffTitle}
        extraStaffDescription={t.extraStaffDescription}
      />

      <LandingFAQ faqTitle={t.faqTitle} faq={t.faq} />
    </div>
  );
}
