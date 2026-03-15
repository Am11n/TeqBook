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
  shareMessage: string | null;
  onShare: () => void;
  cardStyle: CardStyle;
  locale: AppLocale;
};

export function ProfileHeroSection(props: Props) {
  const m = getProfilePageMessages(props.locale);
  return (
    <section className="overflow-hidden rounded-3xl border shadow-sm" style={props.cardStyle}>
      <div className="grid md:grid-cols-[1fr_1fr]">
        <div className="relative order-1 min-h-[230px] md:order-2 md:min-h-[340px]">
          {props.hero.coverImageUrl ? (
            <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${props.hero.coverImageUrl})` }} />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-slate-200 via-slate-100 to-slate-50" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/15 via-black/0 to-transparent md:bg-gradient-to-l md:from-black/10 md:via-black/0 md:to-transparent" />
          {props.hero.logoUrl ? (
            <div className="absolute right-3 top-3 rounded-lg border bg-white/92 p-1.5 shadow-sm backdrop-blur-sm">
              <img src={props.hero.logoUrl} alt={props.hero.name} className="h-8 w-8 rounded object-contain sm:h-10 sm:w-10" />
            </div>
          ) : null}
        </div>

        <div className="order-2 space-y-4 p-5 sm:p-6 md:order-1 md:p-7">
          <div className="space-y-2.5">
            <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl md:text-4xl">{props.hero.name}</h1>

            <div className="flex flex-wrap items-center gap-x-2 gap-y-1.5 text-sm text-[var(--pb-muted)]">
              {props.hero.ratingAverage !== null && props.hero.ratingCount > 0 ? (
                <span className="inline-flex items-center gap-1.5">
                  <span className="text-amber-500">★</span>
                  {props.hero.ratingAverage.toFixed(1)} ({props.hero.ratingCount} {m.reviewsWord})
                </span>
              ) : null}
              {props.hero.ratingAverage !== null && props.hero.ratingCount > 0 && props.openCloseMeta ? <MetaDivider /> : null}
              {props.openCloseMeta ? <span>{props.openCloseMeta}</span> : null}
            </div>

            <p className="flex flex-wrap items-center gap-x-2 gap-y-1.5 text-sm text-[var(--pb-muted)]">
              {props.hero.addressLine ? <span>{props.hero.addressLine}</span> : null}
              {props.hero.addressLine ? <MetaDivider /> : null}
              <span>{m.payInSalon}</span>
            </p>

            <p className="max-w-xl text-sm leading-relaxed text-[var(--pb-muted)] sm:text-base">{props.heroTagline}</p>
          </div>

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
              className="h-11 w-11 rounded-xl border-slate-300/80 bg-white/70 p-0 sm:w-11 hover:bg-white"
            >
              <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="18" cy="5" r="3" />
                <circle cx="6" cy="12" r="3" />
                <circle cx="18" cy="19" r="3" />
                <path d="M8.6 13.5l6.8 4" />
                <path d="M15.4 6.5l-6.8 4" />
              </svg>
            </Button>

            {props.shareMessage ? <p className="text-xs text-[var(--pb-muted)]">{props.shareMessage}</p> : null}
          </div>
        </div>
      </div>
      <div className="sr-only" aria-live="polite">
        {props.shareMessage}
      </div>
    </section>
  );
}
