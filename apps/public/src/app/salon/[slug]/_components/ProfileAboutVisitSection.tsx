"use client";

import { trackPublicEvent } from "@/components/public-booking/publicBookingTelemetry";
import { BASE_CARD_CLASS, formatOpeningHoursRange } from "../profile-helpers";
import { getLocalizedWeekdays, getProfilePageMessages } from "../profile-i18n";
import type { AppLocale } from "@/i18n/translations";
import type { CardStyle, SocialItem, SocialPlatform } from "../profile-types";

function SocialIcon({ platform }: { platform: SocialPlatform }) {
  if (platform === "instagram") {
    return (
      <span className="inline-flex h-5 w-5 items-center justify-center rounded-[6px] bg-gradient-to-br from-yellow-400 via-pink-500 to-purple-600">
        <svg aria-hidden="true" viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3.5" y="3.5" width="17" height="17" rx="5" />
          <circle cx="12" cy="12" r="4" />
          <circle cx="17.5" cy="6.5" r="0.8" fill="white" stroke="none" />
        </svg>
      </span>
    );
  }
  if (platform === "facebook") {
    return (
      <span className="inline-flex h-5 w-5 items-center justify-center rounded-[6px] bg-[#1877f2]">
        <svg aria-hidden="true" viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-white">
          <path d="M13.2 20v-7.2h2.4l.4-2.8h-2.8V8.2c0-.8.2-1.4 1.4-1.4h1.5V4.3c-.3 0-1.2-.1-2.2-.1-2.2 0-3.7 1.3-3.7 3.8V10H8v2.8h2.2V20h3z" />
        </svg>
      </span>
    );
  }
  if (platform === "twitter") {
    return (
      <span className="inline-flex h-5 w-5 items-center justify-center rounded-[6px] bg-black">
        <svg aria-hidden="true" viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-white">
          <path d="M18.9 3h2.9l-6.4 7.3L23 21h-6l-4.7-6.1L6.9 21H4l6.8-7.8L3.4 3h6.1l4.3 5.7L18.9 3zm-1 16.2h1.6L8.7 4.7H7l10.9 14.5z" />
        </svg>
      </span>
    );
  }
  if (platform === "tiktok") {
    return (
      <span className="inline-flex h-5 w-5 items-center justify-center rounded-[6px] bg-gradient-to-br from-cyan-400 via-black to-pink-500">
        <svg aria-hidden="true" viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-white">
          <path d="M14.9 4.5c.8 1.2 2 2 3.4 2.2V9c-1.4 0-2.7-.4-3.8-1.1v5.3c0 2.6-2.1 4.7-4.7 4.7S5 15.8 5 13.2s2.1-4.7 4.7-4.7c.2 0 .4 0 .6.1v2.5a2.2 2.2 0 0 0-.6-.1c-1.2 0-2.2 1-2.2 2.2s1 2.2 2.2 2.2 2.2-1 2.2-2.2V3h2.9v1.5z" />
        </svg>
      </span>
    );
  }
  return (
    <span className="inline-flex h-5 w-5 items-center justify-center rounded-[6px] bg-gradient-to-br from-sky-500 to-indigo-600">
      <svg aria-hidden="true" viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="9" />
        <path d="M3 12h18" />
        <path d="M12 3a13 13 0 0 1 0 18" />
        <path d="M12 3a13 13 0 0 0 0 18" />
      </svg>
    </span>
  );
}

type Props = {
  salonId: string;
  slug: string;
  heroName: string;
  addressLine: string | null;
  aboutDescription: string;
  socialItems: SocialItem[];
  openingHours: Array<{ dayOfWeek: number; isClosed: boolean; openTime: string | null; closeTime: string | null }>;
  todayDayOfWeek: number;
  isOpenNow: boolean | null;
  isClosedToday: boolean;
  hoursStatusLine: string;
  mapLink: string | null;
  mapPreviewImageUrl: string | null;
  mapImageUnavailable: boolean;
  onMapImageError: () => void;
  cardStyle: CardStyle;
  locale: AppLocale;
};

export function ProfileAboutVisitSection(props: Props) {
  const m = getProfilePageMessages(props.locale);
  const weekdays = getLocalizedWeekdays(props.locale);
  const statusStyle =
    props.isClosedToday || props.isOpenNow === false
      ? {
          backgroundColor: "var(--pb-status-closed-bg)",
          color: "var(--pb-status-closed-text)",
          borderColor: "var(--pb-status-closed-text)",
        }
      : props.isOpenNow === true
        ? {
            backgroundColor: "var(--pb-status-open-bg)",
            color: "var(--pb-status-open-text)",
            borderColor: "var(--pb-status-open-text)",
          }
        : {
            backgroundColor: "var(--pb-secondary-bg)",
            color: "var(--pb-secondary-text)",
            borderColor: "var(--pb-secondary-border)",
          };

  return (
    <section className={`${BASE_CARD_CLASS} p-5 sm:p-6`} style={props.cardStyle}>
      <div className="space-y-6">
        <article>
          <h2 className="text-xl font-semibold">{m.aboutHeading}</h2>
          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-[var(--pb-muted)]">{props.aboutDescription}</p>
          {props.socialItems.length > 0 ? (
            <div className="mt-4 flex flex-wrap gap-2">
              {props.socialItems.map((item) => (
                <a
                  key={item.platform}
                  href={item.url}
                  target="_blank"
                  rel="noreferrer"
                  title={item.label}
                  aria-label={`${m.openPrefix} ${item.label}`}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[var(--pb-secondary-border)] bg-[var(--pb-secondary-bg)] text-[var(--pb-secondary-text)] transition hover:bg-[var(--pb-bg-surface)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--pb-primary)] focus-visible:ring-offset-2"
                  onClick={() => {
                    if (item.platform === "instagram") {
                      trackPublicEvent("click_instagram", {
                        salon_id: props.salonId,
                        slug: props.slug,
                        cta_location: "about",
                      });
                    }
                  }}
                >
                  <SocialIcon platform={item.platform} />
                </a>
              ))}
            </div>
          ) : null}
        </article>

        <div className="grid gap-4 border-t border-[var(--pb-divider)] pt-5 lg:grid-cols-2">
          <article className="space-y-3">
            <h3 className="text-lg font-semibold">{m.visitHeading}</h3>
            {props.addressLine ? <p className="text-sm text-[var(--pb-text-secondary)]">{props.addressLine}</p> : null}
            {props.mapLink ? (
              <a
                href={props.mapLink}
                target="_blank"
                rel="noreferrer"
                aria-label={`${m.openLocationInMaps}: ${props.heroName}`}
                className="group block overflow-hidden rounded-xl border border-[var(--pb-border-soft)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--pb-primary)] focus-visible:ring-offset-2"
                onClick={() =>
                  trackPublicEvent("click_map", {
                    salon_id: props.salonId,
                    slug: props.slug,
                    cta_location: "map",
                  })
                }
              >
                {props.mapPreviewImageUrl && !props.mapImageUnavailable ? (
                  <div className="relative h-44 w-full bg-[var(--pb-bg-surface-subtle)]">
                    <img
                      src={props.mapPreviewImageUrl}
                      alt=""
                      aria-hidden="true"
                      className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-[1.01]"
                      loading="lazy"
                      onError={props.onMapImageError}
                    />
                  </div>
                ) : (
                  <div className="relative h-44 w-full bg-gradient-to-br from-[var(--pb-bg-surface-subtle)] via-[var(--pb-bg-surface)] to-[var(--pb-bg-page)]" aria-hidden="true">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(139,118,99,0.18),transparent_40%),radial-gradient(circle_at_80%_80%,rgba(160,138,116,0.15),transparent_35%)]" />
                    <div className="absolute inset-0 flex items-center justify-center text-center">
                      <span className="text-xl" aria-hidden="true">📍</span>
                    </div>
                  </div>
                )}
              </a>
            ) : (
              <div className="overflow-hidden rounded-xl border border-[var(--pb-border-soft)]">
                {props.mapPreviewImageUrl && !props.mapImageUnavailable ? (
                  <div className="relative h-44 w-full bg-[var(--pb-bg-surface-subtle)]" aria-label={`${m.mapPreviewFor} ${props.heroName}`}>
                    <img src={props.mapPreviewImageUrl} alt={`${m.mapPreviewFor} ${props.heroName}`} className="h-full w-full object-cover" loading="lazy" onError={props.onMapImageError} />
                  </div>
                ) : (
                  <div className="relative h-44 w-full bg-gradient-to-br from-[var(--pb-bg-surface-subtle)] via-[var(--pb-bg-surface)] to-[var(--pb-bg-page)]" aria-label={`${m.mapPreviewFor} ${props.heroName}`}>
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(139,118,99,0.18),transparent_40%),radial-gradient(circle_at_80%_80%,rgba(160,138,116,0.15),transparent_35%)]" />
                    <div className="absolute inset-0 flex items-center justify-center text-center">
                      <span className="text-xl" aria-hidden="true">📍</span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </article>

          <article className="space-y-3">
            <h3 className="text-lg font-semibold">{m.openingHoursHeading}</h3>
            <p
              className="inline-flex w-fit rounded-full border px-2.5 py-1 text-sm font-medium"
              style={statusStyle}
            >
              {props.hoursStatusLine}
            </p>
            <ul className="space-y-1.5 text-sm">
              {props.openingHours.map((item) => {
                const isToday = item.dayOfWeek === props.todayDayOfWeek;
                return (
                  <li key={item.dayOfWeek} className="flex items-center justify-between">
                    <span className={isToday ? "font-semibold text-[var(--pb-text-primary)]" : "text-[var(--pb-muted)]"}>
                      {weekdays[item.dayOfWeek] || m.dayFallback}
                    </span>
                    <span className={isToday ? "font-semibold text-[var(--pb-text-primary)]" : "text-[var(--pb-muted)]"}>
                      {formatOpeningHoursRange(item, props.locale)}
                    </span>
                  </li>
                );
              })}
            </ul>
          </article>
        </div>
      </div>
    </section>
  );
}
