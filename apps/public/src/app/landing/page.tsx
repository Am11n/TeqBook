"use client";

import { useState, useEffect, useCallback } from "react";
import dynamic from "next/dynamic";
import { copy, type Locale } from "@/components/landing/landing-copy";
import { LandingHeader } from "@/components/landing/LandingHeader";
import { LandingMobileMenu } from "@/components/landing/LandingMobileMenu";
import { LandingFooter } from "@/components/landing/LandingFooter";
import { HeroPlaceholder } from "@/components/landing/HeroPlaceholder";

const LandingHero = dynamic(
  () => import("@/components/landing/LandingHero").then((m) => m.LandingHero),
  { ssr: false, loading: () => <HeroPlaceholder /> }
);

const LANDING_LOCALE_KEY = "teqbook_landing_locale";
const VALID_LOCALES: Locale[] = [
  "nb", "en", "ar", "so", "ti", "am", "tr", "pl", "vi", "zh", "tl", "fa", "dar", "ur", "hi",
];

function getStoredLocale(): Locale | null {
  if (typeof window === "undefined") return null;
  try {
    const stored = localStorage.getItem(LANDING_LOCALE_KEY);
    if (stored && VALID_LOCALES.includes(stored as Locale)) return stored as Locale;
  } catch {
    /* ignore */
  }
  return null;
}

const LandingStats = dynamic(
  () => import("@/components/landing/LandingStats").then((m) => m.LandingStats),
  { ssr: true }
);

const LandingPricing = dynamic(
  () => import("@/components/landing/LandingPricing").then((m) => m.LandingPricing),
  { ssr: true }
);

const LandingFAQ = dynamic(
  () => import("@/components/landing/LandingFAQ").then((m) => m.LandingFAQ),
  { ssr: true }
);

export default function LandingPage() {
  const [locale, setLocaleState] = useState<Locale>("en");
  const [scrolled, setScrolled] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const t = copy[locale];

  const setLocale = useCallback((next: Locale | ((prev: Locale) => Locale)) => {
    setLocaleState((prev) => {
      const value = typeof next === "function" ? next(prev) : next;
      if (typeof window !== "undefined") {
        try {
          localStorage.setItem(LANDING_LOCALE_KEY, value);
        } catch {
          /* ignore */
        }
      }
      return value;
    });
  }, []);

  useEffect(() => {
    const stored = getStoredLocale();
    if (stored) setLocaleState(stored);
  }, []);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };
    // Check on mount and use a small delay to ensure window is available
    if (typeof window !== 'undefined') {
      checkMobile();
      window.addEventListener("resize", checkMobile);
      return () => window.removeEventListener("resize", checkMobile);
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const isScrolled = currentScrollY > 20;
      setScrolled(isScrolled);
      setScrollY(currentScrollY);
    };

    // Check initial scroll position
    handleScroll();

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Calculate scroll progress for smooth animations (0 to 1)
  const scrollProgress = Math.min(scrollY / 100, 1);
  
  // Logo size: large at top (1.8x), normal when scrolled (1x)
  const logoScale = 1.8 - (scrollProgress * 0.8);
  const headerHeight = scrolled ? "py-3" : "pt-12 pb-6";
  const logoTextSize = 1.8 - (scrollProgress * 0.8);


  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-slate-50 via-blue-50/30 to-blue-50/20">
      {/* Gradient background layers */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-blue-400/20 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-blue-400/20 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-300/10 blur-3xl" />
      </div>

      <LandingHeader
        locale={locale}
        setLocale={setLocale}
        scrolled={scrolled}
        isMobile={isMobile}
        logoScale={logoScale}
        logoTextSize={logoTextSize}
        headerHeight={headerHeight}
        brand={t.brand}
        signUpButton={t.signUpButton}
        logInButton={t.logInButton}
        onMobileMenuOpen={() => setMobileMenuOpen(true)}
      />

      <LandingMobileMenu
        open={mobileMenuOpen}
        locale={locale}
        setLocale={setLocale}
        onClose={() => setMobileMenuOpen(false)}
        brand={t.brand}
        signUpButton={t.signUpButton}
        logInButton={t.logInButton}
      />

      <main id="main" className="flex-1 relative" role="main">
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
      </main>

      <LandingFooter locale={locale} />
    </div>
  );
}
