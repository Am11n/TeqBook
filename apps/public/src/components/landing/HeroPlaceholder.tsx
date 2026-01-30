"use client";

/** Placeholder shown while LandingHero loads (client-only). Same shell so layout is stable. */
export function HeroPlaceholder() {
  return (
    <section className="relative -mt-[120px] pt-[120px] border-b border-blue-200/30 overflow-hidden bg-blue-50 min-h-[calc(100vh-120px)]">
      <div className="pointer-events-none absolute inset-0 top-0">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-blue-100 to-blue-100" />
      </div>
      <div className="relative z-10 mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12 md:py-16 min-h-[calc(100vh-120px)]" aria-hidden="true" />
    </section>
  );
}
