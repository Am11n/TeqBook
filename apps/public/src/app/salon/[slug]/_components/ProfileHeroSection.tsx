"use client";

import Link from "next/link";
import { Button } from "@teqbook/ui";
import { trackPublicEvent } from "@/components/public-booking/publicBookingTelemetry";
import type { AppLocale } from "@/i18n/translations";
import { getProfilePageMessages } from "../profile-i18n";
import type { CardStyle, PublicProfileClientProps } from "../profile-types";

type Props = {
  salonId: string;
  slug: string;
  hero: PublicProfileClientProps["hero"];
  bookUrl: string;
  tokens: PublicProfileClientProps["tokens"];
  heroTagline: string;
  openCloseMeta: string | null;
  statusKind: "open" | "closed" | "neutral";
  shareMessage: string | null;
  onShare: () => void;
  cardStyle: CardStyle;
  locale: AppLocale;
};

export function ProfileHeroSection(props: Props) {
  const m = getProfilePageMessages(props.locale);
  return (
    <section
      className="group overflow-hidden rounded-3xl border border-[var(--pb-border-soft)] shadow-[var(--pb-shadow-1)] transition-[box-shadow,border-color] duration-[var(--pb-motion-standard)] ease-[var(--pb-ease-out)] hover:border-[var(--pb-border-strong)] hover:shadow-[var(--pb-shadow-2)]"
      style={props.cardStyle}
    >
      <div className="grid md:grid-cols-[1.1fr_0.9fr]">
        <div className="relative order-1 min-h-[230px] md:order-2 md:min-h-[340px]">
          {props.hero.coverImageUrl ? (
            <div
              className="absolute inset-0 bg-cover bg-center transition-transform duration-[var(--pb-motion-standard)] ease-[var(--pb-ease-out)] motion-reduce:transform-none md:group-hover:scale-[1.02]"
              style={{ backgroundImage: `url(${props.hero.coverImageUrl})` }}
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-[var(--pb-bg-surface-subtle)] via-[var(--pb-bg-surface)] to-[var(--pb-bg-page)]" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[var(--pb-overlay)] via-transparent to-transparent md:bg-gradient-to-l md:from-[var(--pb-overlay)] md:via-transparent md:to-transparent" />
          {props.hero.logoUrl ? (
            <div className="absolute right-3 top-3 rounded-xl border border-[var(--pb-border-soft)] bg-[var(--pb-bg-surface)] p-2 shadow-[var(--pb-shadow-1)]">
              <img src={props.hero.logoUrl} alt={props.hero.name} className="h-8 w-8 rounded object-contain sm:h-11 sm:w-11" />
            </div>
          ) : null}
        </div>

        <div className="relative order-2 flex h-full flex-col overflow-hidden p-5 sm:p-6 md:order-1 md:p-8">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-[color-mix(in_srgb,var(--pb-accent-primary)_8%,transparent)] to-transparent"
          />
          <div className="relative space-y-2.5">
            <h1 className="text-[clamp(1.84rem,3.15vw,2.6rem)] font-semibold tracking-[-0.027em] text-[var(--pb-text-primary)]">
              {props.hero.name}
            </h1>

            {props.openCloseMeta ? (
              props.statusKind === "closed" ? (
                <span
                  className="inline-flex w-fit rounded-full border px-2.5 py-1 text-sm font-medium"
                  style={{
                    backgroundColor: "var(--pb-status-closed-bg)",
                    color: "var(--pb-status-closed-text)",
                    borderColor: "var(--pb-status-closed-text)",
                  }}
                >
                  {props.openCloseMeta}
                </span>
              ) : props.statusKind === "open" ? (
                <span
                  className="inline-flex w-fit rounded-full border px-2.5 py-1 text-sm font-medium"
                  style={{
                    backgroundColor: "var(--pb-status-open-bg)",
                    color: "var(--pb-status-open-text)",
                    borderColor: "var(--pb-status-open-text)",
                  }}
                >
                  {props.openCloseMeta}
                </span>
              ) : (
                <span className="inline-flex w-fit rounded-full border border-[var(--pb-secondary-border)] bg-[var(--pb-secondary-bg)] px-2.5 py-1 text-sm font-medium text-[var(--pb-secondary-text)]">
                  {props.openCloseMeta}
                </span>
              )
            ) : null}

            <div className="flex flex-wrap items-center gap-1.5 text-[13.5px] text-[var(--pb-text-secondary)]">
              {props.hero.ratingAverage !== null && props.hero.ratingCount > 0 ? (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--pb-secondary-border)] bg-[var(--pb-secondary-bg)] px-2.5 py-1">
                  <span className="text-[var(--pb-accent-primary)]">★</span>
                  {props.hero.ratingAverage.toFixed(1)} ({props.hero.ratingCount} {m.reviewsWord})
                </span>
              ) : null}
              <span className="inline-flex items-center rounded-full border border-[var(--pb-secondary-border)] bg-[var(--pb-secondary-bg)] px-2.5 py-1">
                {m.payInSalon}
              </span>
              {props.hero.addressLine ? (
                <span className="inline-flex items-center rounded-full border border-[var(--pb-secondary-border)] bg-[var(--pb-secondary-bg)] px-2.5 py-1">
                  {props.hero.addressLine}
                </span>
              ) : null}
            </div>

            <p className="max-w-[49ch] text-[15px] leading-[1.85] text-[var(--pb-text-secondary)] sm:text-[15.5px]">
              {props.heroTagline}
            </p>
          </div>

          <div className="relative mt-auto border-t border-[var(--pb-divider)] pt-4">
            <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center">
              <Link href={props.bookUrl} className="w-full sm:flex-1">
                <Button
                  className="h-[2.875rem] w-full rounded-xl border border-transparent px-5 text-[0.95rem] font-semibold shadow-[var(--pb-shadow-1)] transition-[transform,box-shadow,background-color,border-color] duration-[var(--pb-motion-fast)] ease-[var(--pb-ease-out)] hover:translate-y-[var(--pb-button-hover-lift)] hover:shadow-[var(--pb-shadow-2)] active:translate-y-px focus-visible:outline-none focus-visible:ring-[var(--pb-focus-width)] focus-visible:ring-[var(--pb-focus)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--pb-bg)] motion-reduce:transform-none"
                  onClick={() =>
                    trackPublicEvent("click_book_from_profile", {
                      salon_id: props.salonId,
                      slug: props.slug,
                      cta_location: "hero",
                    })
                  }
                  style={{ backgroundColor: props.tokens.colors.primary, color: props.tokens.colors.primaryText }}
                >
                  {m.bookAppointment}
                </Button>
              </Link>

              <Button
                variant="outline"
                onClick={props.onShare}
                aria-label={m.shareProfileAria}
                className="h-[2.875rem] min-w-11 rounded-xl border-[var(--pb-secondary-border)] bg-[var(--pb-secondary-bg)] px-3 text-[var(--pb-secondary-text)] transition-[transform,background-color,border-color,box-shadow] duration-[var(--pb-motion-fast)] ease-[var(--pb-ease-out)] hover:-translate-y-px hover:border-[var(--pb-border-strong)] hover:bg-[var(--pb-bg-surface)] hover:shadow-[var(--pb-shadow-1)] active:translate-y-px focus-visible:outline-none focus-visible:ring-[var(--pb-focus-width)] focus-visible:ring-[var(--pb-focus)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--pb-bg)] motion-reduce:transform-none"
              >
                <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="18" cy="5" r="3" />
                  <circle cx="6" cy="12" r="3" />
                  <circle cx="18" cy="19" r="3" />
                  <path d="M8.6 13.5l6.8 4" />
                  <path d="M15.4 6.5l-6.8 4" />
                </svg>
                <span className="hidden pl-2 text-sm font-medium tracking-[0.01em] sm:inline">{m.shareProfileAria}</span>
              </Button>
            </div>
            {props.shareMessage ? <p className="mt-2 text-xs text-[var(--pb-muted)]">{props.shareMessage}</p> : null}
          </div>
        </div>
      </div>
      <div className="sr-only" aria-live="polite">
        {props.shareMessage}
      </div>
    </section>
  );
}
