"use client";

import Link from "next/link";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { copy } from "@/components/landing/landing-copy";

/** Default LCP copy (en) so hero text is in initial HTML before LandingHero chunk loads. */
const lcp = copy.en;

/** Placeholder with real hero LCP content so first paint has title + CTA even if dynamic chunk 404s or loads late. */
export function HeroPlaceholder() {
  return (
    <section className="relative -mt-[120px] pt-[120px] border-b border-blue-200/30 overflow-hidden bg-blue-50 min-h-[calc(100vh-120px)]">
      <div className="pointer-events-none absolute inset-0 top-0">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-blue-100 to-blue-100" />
      </div>
      <div className="relative z-10 mx-auto flex max-w-7xl flex-col gap-6 px-4 py-8 sm:px-6 sm:py-12 md:py-16 lg:flex-row lg:items-center lg:gap-16">
        <div className="flex-1 space-y-6">
          <span className="inline-flex items-center gap-2 rounded-full border border-blue-200/50 bg-white/70 px-4 py-1.5 text-xs font-medium uppercase tracking-wide text-blue-700 shadow-sm backdrop-blur-md">
            <Sparkles className="h-3.5 w-3.5 text-blue-600" aria-hidden />
            {lcp.badge}
          </span>
          <h1 className="text-balance bg-gradient-to-br from-slate-900 via-slate-800 to-slate-700 bg-clip-text text-4xl font-semibold leading-tight tracking-tight text-transparent sm:text-5xl md:text-6xl lg:text-7xl">
            {lcp.heroTitle}
          </h1>
          <p className="max-w-2xl text-base leading-relaxed text-slate-600 sm:text-lg">
            {lcp.heroSubtitle}
          </p>
          <div className="flex flex-col gap-4 sm:flex-row">
            <Link href="/signup" className="w-full sm:w-auto">
              <Button
                size="lg"
                className="w-full rounded-2xl bg-gradient-to-r from-indigo-600 to-indigo-700 px-10 py-7 text-base font-semibold text-white sm:w-auto"
              >
                {lcp.ctaPrimary}
              </Button>
            </Link>
            <Link href="/contact" className="w-full sm:w-auto">
              <Button variant="outline" size="lg" className="w-full rounded-xl sm:w-auto" type="button">
                {lcp.ctaSecondary}
              </Button>
            </Link>
          </div>
        </div>
        <div className="relative flex-1 lg:min-h-[500px]" aria-hidden="true" />
      </div>
    </section>
  );
}
