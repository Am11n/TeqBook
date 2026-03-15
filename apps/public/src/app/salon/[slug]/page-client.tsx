"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Button, Dialog, DialogContent, DialogHeader, DialogTitle, Tabs, TabsContent, TabsList, TabsTrigger } from "@teqbook/ui";
import { buildPublicBookingCssVars } from "@/components/public-booking/publicBookingTokens";
import { trackPublicEvent } from "@/components/public-booking/publicBookingTelemetry";
import type { PublicBookingTokens } from "@/components/public-booking/types";

type PublicService = {
  id: string;
  name: string;
  durationMinutes: number | null;
  priceCents: number | null;
};

type PublicTeamMember = {
  id: string;
  name: string;
  title: string | null;
  imageUrl: string | null;
  bio: string | null;
  specialties: string[];
  languages: string[];
  ratingAverage: number | null;
  services: PublicService[];
};

type PublicProfileClientProps = {
  salonId: string;
  slug: string;
  hero: {
    name: string;
    coverImageUrl: string | null;
    logoUrl: string | null;
    addressLine: string | null;
    ratingAverage: number | null;
    ratingCount: number;
    isOpenNow: boolean | null;
    openStatusLabel: string | null;
  };
  about: {
    description: string;
  };
  servicesPreview: PublicService[];
  teamPreview: PublicTeamMember[];
  openingHours: Array<{
    dayOfWeek: number;
    isClosed: boolean;
    openTime: string | null;
    closeTime: string | null;
  }>;
  mapLink: string | null;
  mapPreviewImageUrl: string | null;
  bookUrl: string;
  shareUrl: string;
  socialLinks: {
    instagramUrl: string | null;
    facebookUrl: string | null;
    twitterUrl: string | null;
    tiktokUrl: string | null;
    websiteUrl: string | null;
  };
  portfolioPreview: Array<{
    id: string;
    imageUrl: string;
    caption: string | null;
  }>;
  reviewsSummary: {
    ratingAverage: number;
    ratingCount: number;
    latest: Array<{
      id: string;
      customerName: string;
      rating: number;
      comment: string | null;
      createdAt: string;
    }>;
  } | null;
  tokens: PublicBookingTokens;
};

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const BASE_CARD_CLASS = "rounded-2xl border bg-[var(--pb-surface)] shadow-[var(--pb-shadow-1)]";

function formatPrice(priceCents: number | null): string | null {
  if (!priceCents || priceCents <= 0) return null;
  return new Intl.NumberFormat("nb-NO", {
    style: "currency",
    currency: "NOK",
    maximumFractionDigits: 0,
  }).format(priceCents / 100);
}

function fallbackAvatar(name: string): string {
  const letters = name
    .split(" ")
    .map((part) => part.trim())
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || "");
  return letters.join("") || "TB";
}

function extractCity(addressLine: string | null): string | null {
  if (!addressLine) return null;
  const parts = addressLine
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);
  return parts.length > 1 ? parts[parts.length - 1] : null;
}

function buildTagline(description: string, addressLine: string | null): string {
  const trimmed = description.trim();
  const city = extractCity(addressLine);
  const premiumFallback = city
    ? `Precision cuts, fades and beard grooming in ${city}.`
    : "Precision cuts, fades and beard grooming.";
  const genericSignals = [
    "professional barber",
    "professional barber in",
    "book your next appointment online",
    "professional salon",
  ];

  if (!trimmed) return premiumFallback;
  if (genericSignals.some((signal) => trimmed.toLowerCase().includes(signal))) {
    return premiumFallback;
  }
  if (trimmed.length <= 140) return trimmed;
  return `${trimmed.slice(0, 137).trimEnd()}...`;
}

function getTodayOpeningHours(
  openingHours: Array<{
    dayOfWeek: number;
    isClosed: boolean;
    openTime: string | null;
    closeTime: string | null;
  }>
): { closeTime: string | null; isClosed: boolean } | null {
  const jsDay = new Date().getDay();
  const mondayBasedDay = (jsDay + 6) % 7;
  const today = openingHours.find((entry) => entry.dayOfWeek === mondayBasedDay);
  if (!today) return null;
  return { closeTime: today.closeTime, isClosed: today.isClosed };
}

function formatTimeShort(value: string | null): string | null {
  if (!value) return null;
  return value.slice(0, 5);
}

function getTodayDayOfWeek(): number {
  return (new Date().getDay() + 6) % 7;
}

function formatOpeningHoursRange(item: { isClosed: boolean; openTime: string | null; closeTime: string | null }): string {
  if (item.isClosed) return "Closed";
  const open = formatTimeShort(item.openTime) || "--:--";
  const close = formatTimeShort(item.closeTime) || "--:--";
  return `${open} - ${close}`;
}

function MetaDivider() {
  return <span className="text-[var(--pb-border)]">·</span>;
}

type SocialPlatform = "instagram" | "facebook" | "twitter" | "tiktok" | "website";

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

function buildHoursStatusLine(isOpenNow: boolean | null, closeTime: string | null): string {
  if (isOpenNow === true) {
    const closeAt = formatTimeShort(closeTime);
    return closeAt ? `Open now · Closes at ${closeAt}` : "Open now";
  }
  if (isOpenNow === false) return "Closed now";
  return "Hours may vary";
}

export default function PublicSalonProfilePageClient(props: PublicProfileClientProps) {
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);
  const [shareMessage, setShareMessage] = useState<string | null>(null);
  const [teamModalTab, setTeamModalTab] = useState<"about" | "services">("about");
  const [mapImageUnavailable, setMapImageUnavailable] = useState(false);
  const socialItems = useMemo(
    () =>
      [
        { platform: "instagram" as const, url: props.socialLinks.instagramUrl, label: "Instagram" },
        { platform: "facebook" as const, url: props.socialLinks.facebookUrl, label: "Facebook" },
        { platform: "twitter" as const, url: props.socialLinks.twitterUrl, label: "X (Twitter)" },
        { platform: "tiktok" as const, url: props.socialLinks.tiktokUrl, label: "TikTok" },
        { platform: "website" as const, url: props.socialLinks.websiteUrl, label: "Website" },
      ].filter((item): item is { platform: SocialPlatform; url: string; label: string } => Boolean(item.url)),
    [props.socialLinks.facebookUrl, props.socialLinks.instagramUrl, props.socialLinks.tiktokUrl, props.socialLinks.twitterUrl, props.socialLinks.websiteUrl]
  );
  const selectedMember = useMemo(
    () => props.teamPreview.find((member) => member.id === selectedMemberId) || null,
    [props.teamPreview, selectedMemberId]
  );
  const heroTagline = useMemo(
    () => buildTagline(props.about.description, props.hero.addressLine),
    [props.about.description, props.hero.addressLine]
  );
  const todayHours = useMemo(() => getTodayOpeningHours(props.openingHours), [props.openingHours]);
  const openCloseMeta = useMemo(() => {
    if (props.hero.isOpenNow === true) {
      const closeAt = formatTimeShort(todayHours?.closeTime || null);
      return closeAt ? `Open now · Closes ${closeAt}` : "Open now";
    }
    if (props.hero.isOpenNow === false) return "Closed now";
    return props.hero.openStatusLabel;
  }, [props.hero.isOpenNow, props.hero.openStatusLabel, todayHours]);
  const hoursStatusLine = useMemo(
    () => buildHoursStatusLine(props.hero.isOpenNow, todayHours?.closeTime || null),
    [props.hero.isOpenNow, todayHours]
  );
  const todayDayOfWeek = useMemo(() => getTodayDayOfWeek(), []);
  const cardStyle = useMemo(
    () => ({ borderColor: props.tokens.colors.border, background: props.tokens.colors.cardBackground }),
    [props.tokens.colors.border, props.tokens.colors.cardBackground]
  );

  const handleShare = async () => {
    trackPublicEvent("click_share_profile", {
      salon_id: props.salonId,
      slug: props.slug,
      cta_location: "hero",
    });
    const shareData = {
      title: `${props.hero.name} | TeqBook`,
      text: `Book your next appointment at ${props.hero.name}`,
      url: props.shareUrl,
    };
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share(shareData);
        return;
      } catch {
        // Ignore cancellation and use fallback below.
      }
    }
    try {
      await navigator.clipboard.writeText(props.shareUrl);
      trackPublicEvent("copy_profile_link", {
        salon_id: props.salonId,
        slug: props.slug,
        cta_location: "hero_share_fallback",
      });
      setShareMessage("Link copied");
      setTimeout(() => setShareMessage(null), 2000);
    } catch {
      setShareMessage("Copy failed");
      setTimeout(() => setShareMessage(null), 2000);
    }
  };

  return (
    <div
      className="min-h-screen"
      style={{
        ...buildPublicBookingCssVars(props.tokens),
        background: props.tokens.colors.pageBackground,
        color: props.tokens.colors.text,
        fontFamily: props.tokens.typography.fontFamily,
      }}
    >
      <main className="mx-auto w-full max-w-6xl space-y-6 px-4 pb-24 pt-6 sm:px-6 lg:space-y-8">
        <section
          className="overflow-hidden rounded-3xl border shadow-sm"
          style={cardStyle}
        >
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
                      {props.hero.ratingAverage.toFixed(1)} ({props.hero.ratingCount} reviews)
                    </span>
                  ) : null}
                  {props.hero.ratingAverage !== null && props.hero.ratingCount > 0 && openCloseMeta ? <MetaDivider /> : null}
                  {openCloseMeta ? (
                    <span>{openCloseMeta}</span>
                  ) : null}
                </div>

                <p className="flex flex-wrap items-center gap-x-2 gap-y-1.5 text-sm text-[var(--pb-muted)]">
                  {props.hero.addressLine ? (
                    <span>{props.hero.addressLine}</span>
                  ) : null}
                  {props.hero.addressLine ? <MetaDivider /> : null}
                  <span>Pay in salon</span>
                </p>

                <p className="max-w-xl text-sm leading-relaxed text-[var(--pb-muted)] sm:text-base">{heroTagline}</p>
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
                    Book appointment
                  </Button>
                </Link>

                <Button
                  variant="outline"
                  onClick={handleShare}
                  aria-label="Share profile"
                  className="h-11 w-11 rounded-xl border-slate-300/80 bg-white/70 p-0 sm:w-11 hover:bg-white"
                >
                  <svg
                    aria-hidden="true"
                    viewBox="0 0 24 24"
                    className="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="18" cy="5" r="3" />
                    <circle cx="6" cy="12" r="3" />
                    <circle cx="18" cy="19" r="3" />
                    <path d="M8.6 13.5l6.8 4" />
                    <path d="M15.4 6.5l-6.8 4" />
                  </svg>
                </Button>

                {shareMessage ? <p className="text-xs text-[var(--pb-muted)]">{shareMessage}</p> : null}
              </div>
            </div>
          </div>
          <div className="sr-only" aria-live="polite">
            {shareMessage}
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">Services</h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {props.servicesPreview.slice(0, 6).map((service) => (
              <Link
                key={service.id}
                href={`${props.bookUrl}?serviceId=${encodeURIComponent(service.id)}`}
                className={`${BASE_CARD_CLASS} group flex min-h-[132px] flex-col justify-between p-4 transition duration-200 hover:-translate-y-0.5 hover:shadow-[var(--pb-shadow-2)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--pb-primary)] focus-visible:ring-offset-2`}
                style={cardStyle}
                onClick={() =>
                  trackPublicEvent("click_service_preview", {
                    salon_id: props.salonId,
                    slug: props.slug,
                    cta_location: "services_preview",
                    service_id: service.id,
                  })
                }
              >
                <div className="space-y-2">
                  <p className="font-medium">{service.name}</p>
                  <p className="text-sm text-[var(--pb-muted)]">
                    {service.durationMinutes ? `${service.durationMinutes} min` : "Duration on request"}
                    {formatPrice(service.priceCents) ? ` · ${formatPrice(service.priceCents)}` : ""}
                  </p>
                </div>
                <p className="inline-flex items-center gap-1 text-sm font-medium text-slate-700">
                  <span>Book</span>
                  <span aria-hidden="true" className="transition-transform group-hover:translate-x-0.5">→</span>
                </p>
              </Link>
            ))}
          </div>
          <Link href={props.bookUrl} className="inline-block text-sm font-medium text-slate-700 underline underline-offset-2">
            See all services
          </Link>
        </section>

        {props.teamPreview.length > 0 ? (
          <section className="space-y-3">
            <h2 className="text-xl font-semibold">Team</h2>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {props.teamPreview.map((member) => (
                <button
                  key={member.id}
                  type="button"
                  className={`${BASE_CARD_CLASS} group flex h-full flex-col gap-3 p-4 text-left transition duration-200 hover:-translate-y-0.5 hover:shadow-[var(--pb-shadow-2)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--pb-primary)] focus-visible:ring-offset-2`}
                  style={cardStyle}
                  onClick={() => {
                    setSelectedMemberId(member.id);
                    setTeamModalTab("about");
                    trackPublicEvent("click_team_member", {
                      salon_id: props.salonId,
                      slug: props.slug,
                      cta_location: "team_grid",
                      employee_id: member.id,
                    });
                    trackPublicEvent("open_team_member_modal", {
                      salon_id: props.salonId,
                      slug: props.slug,
                      cta_location: "team_grid",
                      employee_id: member.id,
                    });
                  }}
                >
                  <div className="flex items-center gap-3">
                    {member.imageUrl ? (
                      <div className="h-12 w-12 overflow-hidden rounded-full bg-[var(--pb-surface)]">
                        <img src={member.imageUrl} alt={member.name} className="h-full w-full object-cover" />
                      </div>
                    ) : (
                      <div
                        className="inline-flex h-12 w-12 items-center justify-center rounded-full font-semibold text-white"
                        style={{ backgroundColor: props.tokens.colors.primary }}
                      >
                        {fallbackAvatar(member.name)}
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="truncate font-medium">{member.name}</p>
                      <p className="truncate text-sm capitalize text-[var(--pb-muted)]">{member.title || "Team member"}</p>
                    </div>
                  </div>

                  <p className="line-clamp-2 text-sm text-[var(--pb-muted)]">
                    {member.bio || "Experienced barber focused on precision cuts and clean grooming."}
                  </p>

                  <div className="mt-auto flex flex-wrap gap-1.5">
                    {(member.specialties.length ? member.specialties : ["Haircut", "Grooming"]).slice(0, 2).map((tag) => (
                      <span key={`${member.id}-${tag}`} className="rounded-full border px-2 py-0.5 text-xs text-[var(--pb-muted)]">
                        {tag}
                      </span>
                    ))}
                  </div>
                  <p className="inline-flex w-fit items-center gap-1 rounded-full border px-3 py-1 text-sm font-medium text-slate-700 transition group-hover:bg-slate-50">
                    <span>View profile</span>
                    <span aria-hidden="true" className="transition-transform group-hover:translate-x-0.5">→</span>
                  </p>
                </button>
              ))}
            </div>
          </section>
        ) : null}

        {props.portfolioPreview.length > 0 ? (
          <section className="space-y-3">
            <h2 className="text-xl font-semibold">Portfolio</h2>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {props.portfolioPreview.map((item) => (
                <figure
                  key={item.id}
                  className="overflow-hidden rounded-xl border"
                  style={{ borderColor: props.tokens.colors.border }}
                >
                  <div className="aspect-square bg-[var(--pb-surface)]">
                    <img src={item.imageUrl} alt={item.caption || "Portfolio"} className="h-full w-full object-cover" />
                  </div>
                  {item.caption ? <figcaption className="px-2 py-1.5 text-xs text-[var(--pb-muted)]">{item.caption}</figcaption> : null}
                </figure>
              ))}
            </div>
          </section>
        ) : null}

        {props.reviewsSummary ? (
          <section
            className="space-y-3 rounded-xl border p-5"
            style={{ borderColor: props.tokens.colors.border, background: props.tokens.colors.cardBackground }}
          >
            <h2 className="text-xl font-semibold">Reviews</h2>
            <p className="text-sm text-[var(--pb-muted)]">
              ⭐ {props.reviewsSummary.ratingAverage.toFixed(1)} / 5 ({props.reviewsSummary.ratingCount} reviews)
            </p>
            <div className="space-y-3">
              {props.reviewsSummary.latest.map((review) => (
                <article key={review.id} className="rounded-lg border p-3" style={{ borderColor: props.tokens.colors.border }}>
                  <p className="text-sm font-medium">⭐ {review.rating}/5</p>
                  {review.comment ? <p className="mt-1 text-sm text-[var(--pb-muted)]">{review.comment}</p> : null}
                  <p className="mt-2 text-xs text-[var(--pb-muted)]">- {review.customerName}</p>
                </article>
              ))}
            </div>
          </section>
        ) : null}

        <section className={`${BASE_CARD_CLASS} p-5 sm:p-6`} style={cardStyle}>
          <div className="space-y-6">
            <article>
              <h2 className="text-xl font-semibold">About</h2>
              <p className="mt-3 max-w-3xl text-sm leading-relaxed text-[var(--pb-muted)]">{props.about.description}</p>
              {socialItems.length > 0 ? (
                <div className="mt-4 flex flex-wrap gap-2">
                  {socialItems.map((item) => (
                    <a
                      key={item.platform}
                      href={item.url}
                      target="_blank"
                      rel="noreferrer"
                      title={item.label}
                      aria-label={`Open ${item.label}`}
                      className="inline-flex h-9 w-9 items-center justify-center rounded-full border text-slate-700 transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--pb-primary)] focus-visible:ring-offset-2"
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

            <div className="grid gap-4 border-t border-[var(--pb-border)] pt-5 lg:grid-cols-2">
              <article className="space-y-3">
                <h3 className="text-lg font-semibold">Visit</h3>
                {props.mapLink ? (
                  <a
                    href={props.mapLink}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={`Open ${props.hero.name} location in Google Maps`}
                    className="group block overflow-hidden rounded-xl border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--pb-primary)] focus-visible:ring-offset-2"
                    onClick={() =>
                      trackPublicEvent("click_map", {
                        salon_id: props.salonId,
                        slug: props.slug,
                        cta_location: "map",
                      })
                    }
                  >
                    {props.mapPreviewImageUrl && !mapImageUnavailable ? (
                      <div className="relative h-44 w-full bg-slate-100">
                        <img
                          src={props.mapPreviewImageUrl}
                          alt=""
                          aria-hidden="true"
                          className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-[1.01]"
                          loading="lazy"
                          onError={() => setMapImageUnavailable(true)}
                        />
                      </div>
                    ) : (
                      <div
                        className="relative h-44 w-full bg-gradient-to-br from-slate-100 via-slate-50 to-white"
                        aria-hidden="true"
                      >
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(148,163,184,0.25),transparent_40%),radial-gradient(circle_at_80%_80%,rgba(148,163,184,0.22),transparent_35%)]" />
                        <div className="absolute inset-0 flex items-center justify-center text-center">
                          <span className="text-xl" aria-hidden="true">📍</span>
                        </div>
                      </div>
                    )}
                  </a>
                ) : (
                  <div className="overflow-hidden rounded-xl border">
                    {props.mapPreviewImageUrl && !mapImageUnavailable ? (
                      <div className="relative h-44 w-full bg-slate-100" aria-label={`Map preview for ${props.hero.name}`}>
                        <img
                          src={props.mapPreviewImageUrl}
                          alt={`Map preview for ${props.hero.name}`}
                          className="h-full w-full object-cover"
                          loading="lazy"
                          onError={() => setMapImageUnavailable(true)}
                        />
                      </div>
                    ) : (
                      <div
                        className="relative h-44 w-full bg-gradient-to-br from-slate-100 via-slate-50 to-white"
                        aria-label={`Map preview for ${props.hero.name}`}
                      >
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(148,163,184,0.25),transparent_40%),radial-gradient(circle_at_80%_80%,rgba(148,163,184,0.22),transparent_35%)]" />
                        <div className="absolute inset-0 flex items-center justify-center text-center">
                          <span className="text-xl" aria-hidden="true">📍</span>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </article>

              <article className="space-y-3">
                <h3 className="text-lg font-semibold">Opening hours</h3>
                <p className="text-sm font-medium text-slate-700">{hoursStatusLine}</p>
                <ul className="space-y-1.5 text-sm">
                  {props.openingHours.map((item) => {
                    const isToday = item.dayOfWeek === todayDayOfWeek;
                    return (
                      <li key={item.dayOfWeek} className="flex items-center justify-between">
                        <span className={isToday ? "font-semibold text-slate-900" : "text-[var(--pb-muted)]"}>
                          {WEEKDAYS[item.dayOfWeek] || "Day"}
                        </span>
                        <span className={isToday ? "font-semibold text-slate-900" : "text-[var(--pb-muted)]"}>
                          {formatOpeningHoursRange(item)}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              </article>
            </div>
          </div>
        </section>
      </main>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t bg-[var(--pb-surface)] p-3 lg:hidden">
        <Link href={props.bookUrl}>
          <Button
            className="w-full"
            style={{ backgroundColor: props.tokens.colors.primary, color: props.tokens.colors.primaryText }}
            onClick={() =>
              trackPublicEvent("click_book_from_profile", {
                salon_id: props.salonId,
                slug: props.slug,
                cta_location: "sticky_mobile",
              })
            }
          >
            Book appointment
          </Button>
        </Link>
      </div>

      <Dialog open={Boolean(selectedMember)} onOpenChange={(next) => (!next ? setSelectedMemberId(null) : undefined)}>
        <DialogContent className="max-w-md">
          {selectedMember ? (
            <>
              <DialogHeader>
                <DialogTitle>{selectedMember.name}</DialogTitle>
              </DialogHeader>
              <Tabs
                value={teamModalTab}
                onValueChange={(value) => {
                  setTeamModalTab(value as "about" | "services");
                  trackPublicEvent("switch_team_member_tab", {
                    salon_id: props.salonId,
                    slug: props.slug,
                    cta_location: "team_modal",
                    employee_id: selectedMember.id,
                    tab: value,
                  });
                }}
              >
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="about">About</TabsTrigger>
                  <TabsTrigger value="services">Services</TabsTrigger>
                </TabsList>
                <TabsContent value="about" className="space-y-3">
                  {selectedMember.imageUrl ? (
                    <div className="h-16 w-16 overflow-hidden rounded-full bg-[var(--pb-surface)]">
                      <img src={selectedMember.imageUrl} alt={selectedMember.name} className="h-full w-full object-cover" />
                    </div>
                  ) : (
                    <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-[var(--pb-surface)] text-lg font-semibold">
                      {fallbackAvatar(selectedMember.name)}
                    </div>
                  )}
                  <p className="text-sm text-[var(--pb-muted)]">{selectedMember.title || "Team member"}</p>
                  <p className="text-sm text-[var(--pb-muted)]">
                    {selectedMember.bio || `${selectedMember.name} helps customers with modern cuts and grooming.`}
                  </p>
                  {selectedMember.specialties.length > 0 ? (
                    <div>
                      <p className="text-xs font-medium uppercase text-[var(--pb-muted)]">Specialties</p>
                      <p className="text-sm">{selectedMember.specialties.join(", ")}</p>
                    </div>
                  ) : null}
                  {selectedMember.languages.length > 0 ? (
                    <div>
                      <p className="text-xs font-medium uppercase text-[var(--pb-muted)]">Languages</p>
                      <p className="text-sm">{selectedMember.languages.join(", ")}</p>
                    </div>
                  ) : null}
                </TabsContent>
                <TabsContent value="services" className="space-y-2">
                  {selectedMember.services.length > 0 ? (
                    selectedMember.services.map((service) => (
                      <Link
                        key={service.id}
                        href={`${props.bookUrl}?employeeId=${encodeURIComponent(selectedMember.id)}&serviceId=${encodeURIComponent(service.id)}`}
                        className="block rounded-lg border px-3 py-2"
                        style={{ borderColor: props.tokens.colors.border }}
                      >
                        <p className="text-sm font-medium">{service.name}</p>
                        <p className="text-xs text-[var(--pb-muted)]">
                          {service.durationMinutes ? `${service.durationMinutes} min` : "Duration on request"}
                          {formatPrice(service.priceCents) ? ` · ${formatPrice(service.priceCents)}` : ""}
                        </p>
                      </Link>
                    ))
                  ) : (
                    <p className="text-sm text-[var(--pb-muted)]">Services will be shown here.</p>
                  )}
                </TabsContent>
              </Tabs>
              <Link
                href={`${props.bookUrl}?employeeId=${encodeURIComponent(selectedMember.id)}`}
                onClick={() =>
                  trackPublicEvent("click_book_from_team_modal", {
                    salon_id: props.salonId,
                    slug: props.slug,
                    cta_location: "team_modal",
                    employee_id: selectedMember.id,
                  })
                }
              >
                <Button className="mt-3 w-full">Book with {selectedMember.name}</Button>
              </Link>
            </>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}
