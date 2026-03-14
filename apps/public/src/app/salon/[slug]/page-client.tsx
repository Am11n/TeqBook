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
  bookUrl: string;
  shareUrl: string;
  socialLinks: {
    instagramUrl: string | null;
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

export default function PublicSalonProfilePageClient(props: PublicProfileClientProps) {
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);
  const [shareMessage, setShareMessage] = useState<string | null>(null);
  const selectedMember = useMemo(
    () => props.teamPreview.find((member) => member.id === selectedMemberId) || null,
    [props.teamPreview, selectedMemberId]
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
          className="overflow-hidden rounded-2xl border"
          style={{ borderColor: props.tokens.colors.border, background: props.tokens.colors.cardBackground }}
        >
          {props.hero.coverImageUrl ? (
            <div className="h-52 w-full bg-cover bg-center" style={{ backgroundImage: `url(${props.hero.coverImageUrl})` }} />
          ) : (
            <div className="h-40 w-full bg-gradient-to-r from-slate-100 to-slate-50" />
          )}
          <div className="space-y-4 p-5 sm:p-6">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0 space-y-2">
                <h1 className="text-2xl font-semibold sm:text-3xl">{props.hero.name}</h1>
                {props.hero.ratingAverage !== null && props.hero.ratingCount > 0 ? (
                  <p className="text-sm text-[var(--pb-muted)]">
                    {"⭐ "}
                    {props.hero.ratingAverage.toFixed(1)} ({props.hero.ratingCount} reviews)
                  </p>
                ) : null}
                {props.hero.addressLine ? (
                  <p className="text-sm text-[var(--pb-muted)]">{props.hero.addressLine}</p>
                ) : null}
                {props.hero.openStatusLabel ? (
                  <p className="text-sm font-medium">{props.hero.openStatusLabel}</p>
                ) : null}
              </div>
              {props.hero.logoUrl ? (
                <img src={props.hero.logoUrl} alt={props.hero.name} className="h-12 w-12 rounded-lg object-contain" />
              ) : null}
            </div>
            <div className="flex flex-wrap gap-3">
              <Link href={props.bookUrl}>
                <Button
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
              <Button variant="outline" onClick={handleShare}>
                Share
              </Button>
              {shareMessage ? <p className="self-center text-xs text-[var(--pb-muted)]">{shareMessage}</p> : null}
            </div>
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">Services</h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {props.servicesPreview.map((service) => (
              <Link
                key={service.id}
                href={`${props.bookUrl}?serviceId=${encodeURIComponent(service.id)}`}
                className="rounded-xl border p-4 transition hover:shadow-sm"
                style={{ borderColor: props.tokens.colors.border, background: props.tokens.colors.cardBackground }}
                onClick={() =>
                  trackPublicEvent("click_service_preview", {
                    salon_id: props.salonId,
                    slug: props.slug,
                    cta_location: "services_preview",
                    service_id: service.id,
                  })
                }
              >
                <p className="font-medium">{service.name}</p>
                <p className="text-sm text-[var(--pb-muted)]">{service.durationMinutes ? `${service.durationMinutes} min` : "Duration on request"}</p>
                {formatPrice(service.priceCents) ? <p className="mt-1 text-sm">{formatPrice(service.priceCents)}</p> : null}
              </Link>
            ))}
          </div>
          <Link href={props.bookUrl} className="inline-block text-sm font-medium underline underline-offset-2">
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
                  className="rounded-xl border p-4 text-left transition hover:shadow-sm"
                  style={{ borderColor: props.tokens.colors.border, background: props.tokens.colors.cardBackground }}
                  onClick={() => {
                    setSelectedMemberId(member.id);
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
                  <div className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-full bg-[var(--pb-surface)] font-semibold">
                    {fallbackAvatar(member.name)}
                  </div>
                  <p className="font-medium">{member.name}</p>
                  <p className="text-sm capitalize text-[var(--pb-muted)]">{member.title || "Team member"}</p>
                  <p className="mt-2 text-sm text-[var(--pb-muted)]">{member.specialties.join(", ") || "Haircut and grooming"}</p>
                  <p className="mt-2 text-sm font-medium underline underline-offset-2">See profile</p>
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

        <section
          className="rounded-xl border p-5"
          style={{ borderColor: props.tokens.colors.border, background: props.tokens.colors.cardBackground }}
        >
          <h2 className="text-xl font-semibold">About</h2>
          <p className="mt-3 text-sm leading-relaxed text-[var(--pb-muted)]">{props.about.description}</p>
          {props.socialLinks.instagramUrl ? (
            <a
              href={props.socialLinks.instagramUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-3 inline-block text-sm font-medium underline underline-offset-2"
              onClick={() =>
                trackPublicEvent("click_instagram", {
                  salon_id: props.salonId,
                  slug: props.slug,
                  cta_location: "about",
                })
              }
            >
              Instagram
            </a>
          ) : null}
        </section>

        {props.mapLink ? (
          <section
            className="rounded-xl border p-5"
            style={{ borderColor: props.tokens.colors.border, background: props.tokens.colors.cardBackground }}
          >
            <h2 className="text-xl font-semibold">Location</h2>
            {props.hero.addressLine ? <p className="mt-2 text-sm text-[var(--pb-muted)]">{props.hero.addressLine}</p> : null}
            <a
              href={props.mapLink}
              target="_blank"
              rel="noreferrer"
              className="mt-3 inline-block text-sm font-medium underline underline-offset-2"
              onClick={() =>
                trackPublicEvent("click_map", {
                  salon_id: props.salonId,
                  slug: props.slug,
                  cta_location: "map",
                })
              }
            >
              Open in Google Maps
            </a>
          </section>
        ) : null}

        <section
          className="rounded-xl border p-5"
          style={{ borderColor: props.tokens.colors.border, background: props.tokens.colors.cardBackground }}
        >
          <h2 className="text-xl font-semibold">Opening hours</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {props.openingHours.map((item) => (
              <li key={item.dayOfWeek} className="flex items-center justify-between">
                <span className="text-[var(--pb-muted)]">{WEEKDAYS[item.dayOfWeek] || "Day"}</span>
                <span>{item.isClosed ? "Closed" : `${item.openTime || "--:--"} - ${item.closeTime || "--:--"}`}</span>
              </li>
            ))}
          </ul>
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
                defaultValue="about"
                onValueChange={(value) =>
                  trackPublicEvent("switch_team_member_tab", {
                    salon_id: props.salonId,
                    slug: props.slug,
                    cta_location: "team_modal",
                    employee_id: selectedMember.id,
                    tab: value,
                  })
                }
              >
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="about">About</TabsTrigger>
                  <TabsTrigger value="services">Services</TabsTrigger>
                </TabsList>
                <TabsContent value="about" className="space-y-3">
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
