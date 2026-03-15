"use client";

import Link from "next/link";
import { Button } from "@teqbook/ui";
import { trackPublicEvent } from "@/components/public-booking/publicBookingTelemetry";
import type { AppLocale } from "@/i18n/translations";
import { getProfilePageMessages } from "../profile-i18n";
import type { CardStyle, PublicProfileClientProps } from "../profile-types";

function MetaDivider() {
  return <span className="text-[var(--pb-border)]">·</span>;
}

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
    <section className="overflow-hidden rounded-3xl border border-[var(--pb-border-soft)] shadow-[var(--pb-shadow-1)]" style={props.cardStyle}>
      <div className="grid md:grid-cols-[1fr_1fr]">
        <div className="relative order-1 min-h-[230px] md:order-2 md:min-h-[340px]">
          {props.hero.coverImageUrl ? (
            <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${props.hero.coverImageUrl})` }} />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-[var(--pb-bg-surface-subtle)] via-[var(--pb-bg-surface)] to-[var(--pb-bg-page)]" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[var(--pb-overlay)] via-transparent to-transparent md:bg-gradient-to-l md:from-[var(--pb-overlay)] md:via-transparent md:to-transparent" />
          {props.hero.logoUrl ? (
            <div className="absolute right-3 top-3 rounded-lg border border-[var(--pb-border-soft)] bg-[var(--pb-bg-surface)] p-1.5 shadow-[var(--pb-shadow-1)]">
              <img src={props.hero.logoUrl} alt={props.hero.name} className="h-8 w-8 rounded object-contain sm:h-10 sm:w-10" />
            </div>
          ) : null}
        </div>

        <div className="order-2 flex h-full flex-col p-5 sm:p-6 md:order-1 md:p-7">
          <div className="space-y-2.5">
            <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl md:text-4xl">{props.hero.name}</h1>

            <div className="flex flex-wrap items-center gap-x-2 gap-y-1.5 text-sm text-[var(--pb-muted)]">
              {props.hero.ratingAverage !== null && props.hero.ratingCount > 0 ? (
                <span className="inline-flex items-center gap-1.5">
                  <span className="text-[var(--pb-accent-primary)]">★</span>
                  {props.hero.ratingAverage.toFixed(1)} ({props.hero.ratingCount} {m.reviewsWord})
                </span>
              ) : null}
              {props.hero.ratingAverage !== null && props.hero.ratingCount > 0 && props.openCloseMeta ? <MetaDivider /> : null}
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
                  <span>{props.openCloseMeta}</span>
                )
              ) : null}
            </div>

            <p className="flex flex-wrap items-center gap-x-2 gap-y-1.5 text-sm text-[var(--pb-muted)]">
              {props.hero.addressLine ? <span>{props.hero.addressLine}</span> : null}
            </p>

            <p className="max-w-xl text-sm leading-relaxed text-[var(--pb-muted)] sm:text-base">{props.heroTagline}</p>
          </div>

          <div className="mt-auto border-t border-[var(--pb-divider)] pt-4">
            <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center">
              <Link href={props.bookUrl} className="w-full sm:w-auto">
                <Button
                  className="h-11 w-full rounded-xl px-5 font-medium sm:w-auto"
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
                className="h-11 w-11 rounded-xl border-[var(--pb-secondary-border)] bg-[var(--pb-secondary-bg)] p-0 text-[var(--pb-secondary-text)] hover:bg-[var(--pb-bg-surface)] sm:w-11"
              >
                <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="18" cy="5" r="3" />
                  <circle cx="6" cy="12" r="3" />
                  <circle cx="18" cy="19" r="3" />
                  <path d="M8.6 13.5l6.8 4" />
                  <path d="M15.4 6.5l-6.8 4" />
                </svg>
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
