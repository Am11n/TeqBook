"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Button } from "@teqbook/ui";
import { useLocale } from "@/components/locale-provider";
import { buildPublicBookingCssVars } from "@/components/public-booking/publicBookingTokens";
import { trackPublicEvent } from "@/components/public-booking/publicBookingTelemetry";
import type { AppLocale } from "@/i18n/translations";
import { ProfileHeroSection } from "./_components/ProfileHeroSection";
import { ProfileServicesSection } from "./_components/ProfileServicesSection";
import { ProfileTeamSection } from "./_components/ProfileTeamSection";
import { ProfilePortfolioSection } from "./_components/ProfilePortfolioSection";
import { ProfileReviewsSection } from "./_components/ProfileReviewsSection";
import { ProfileAboutVisitSection } from "./_components/ProfileAboutVisitSection";
import { ProfileTeamDialog } from "./_components/ProfileTeamDialog";
import {
  buildHoursStatusLine,
  buildSocialItems,
  buildTagline,
  getTodayDayOfWeek,
  getTodayOpeningHours,
} from "./profile-helpers";
import { getProfilePageMessages } from "./profile-i18n";
import type { PublicProfileClientProps } from "./profile-types";

export default function PublicSalonProfilePageClient(props: PublicProfileClientProps) {
  const { setLocale: setAppLocale } = useLocale();
  const [locale, setLocaleState] = useState<AppLocale>(props.locale);
  const [selectedMember, setSelectedMember] = useState<PublicProfileClientProps["teamPreview"][number] | null>(null);
  const [shareMessage, setShareMessage] = useState<string | null>(null);
  const [teamModalTab, setTeamModalTab] = useState<"about" | "services">("about");
  const [mapImageUnavailable, setMapImageUnavailable] = useState(false);
  const lastTeamTriggerRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    const supported = props.supportedLanguages;
    if (supported.length === 0) {
      setLocaleState(props.locale);
      setAppLocale(props.locale);
      return;
    }
    try {
      const stored = localStorage.getItem(`booking-locale-${props.salonId}`);
      const fallback = props.locale;
      const preferred =
        stored && supported.includes(stored as AppLocale) ? (stored as AppLocale) : fallback;
      const next = supported.includes(preferred) ? preferred : supported[0] ?? fallback;
      setLocaleState(next);
      setAppLocale(next);
    } catch {
      setLocaleState(props.locale);
      setAppLocale(props.locale);
    }
  }, [props.salonId, props.locale, props.supportedLanguages, setAppLocale]);

  const handleProfileLocaleChange = useCallback(
    (next: AppLocale) => {
      setLocaleState(next);
      setAppLocale(next);
      try {
        localStorage.setItem(`booking-locale-${props.salonId}`, next);
      } catch {
        /* ignore storage failures */
      }
    },
    [props.salonId, setAppLocale],
  );

  const heroTagline = useMemo(
    () => buildTagline(props.about.description, props.hero.addressLine, locale),
    [props.about.description, props.hero.addressLine, locale]
  );
  const m = useMemo(() => getProfilePageMessages(locale), [locale]);
  const socialItems = useMemo(
    () => buildSocialItems(props.socialLinks, locale),
    [props.socialLinks, locale],
  );
  const todayHours = useMemo(() => getTodayOpeningHours(props.openingHours), [props.openingHours]);
  const openCloseMeta = useMemo(
    () => buildHoursStatusLine(props.hero.isOpenNow, Boolean(todayHours?.isClosed), todayHours?.closeTime || null, locale),
    [props.hero.isOpenNow, locale, todayHours?.closeTime, todayHours?.isClosed]
  );
  const hoursStatusLine = useMemo(
    () => buildHoursStatusLine(props.hero.isOpenNow, Boolean(todayHours?.isClosed), todayHours?.closeTime || null, locale),
    [props.hero.isOpenNow, todayHours, locale]
  );
  const profileStatusKind = useMemo<"open" | "closed" | "neutral">(() => {
    if (todayHours?.isClosed) return "closed";
    if (props.hero.isOpenNow === true) return "open";
    if (props.hero.isOpenNow === false) return "closed";
    return "neutral";
  }, [props.hero.isOpenNow, todayHours?.isClosed]);
  const todayDayOfWeek = useMemo(() => getTodayDayOfWeek(), []);
  const cardStyle = useMemo(
    () => ({ borderColor: props.tokens.colors.border, background: props.tokens.colors.cardBackground }),
    [props.tokens.colors.border, props.tokens.colors.cardBackground]
  );
  const cssVars = useMemo(() => buildPublicBookingCssVars(props.tokens), [props.tokens]);
  const dialogThemeStyle = useMemo(
    () => ({
      ...cssVars,
      color: props.tokens.colors.text,
      fontFamily: props.tokens.typography.fontFamily,
    }),
    [cssVars, props.tokens.colors.text, props.tokens.typography.fontFamily]
  );

  const handleShare = async () => {
    trackPublicEvent("click_share_profile", {
      salon_id: props.salonId,
      slug: props.slug,
      cta_location: "hero",
    });
    const shareData = {
      title: `${props.hero.name} | TeqBook`,
      text: `${m.shareText} ${props.hero.name}`,
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
      setShareMessage(m.linkCopied);
      setTimeout(() => setShareMessage(null), 2000);
    } catch {
      setShareMessage(m.copyFailed);
      setTimeout(() => setShareMessage(null), 2000);
    }
  };

  return (
    <div
      className="min-h-screen"
      style={{
        ...cssVars,
        background: props.tokens.colors.pageBackground,
        color: props.tokens.colors.text,
        fontFamily: props.tokens.typography.fontFamily,
      }}
    >
      <main className="mx-auto w-full max-w-6xl space-y-6 px-4 pb-24 pt-6 sm:px-6 lg:space-y-8">
        <ProfileHeroSection
          salonId={props.salonId}
          slug={props.slug}
          hero={props.hero}
          bookUrl={props.bookUrl}
          publicBooking={props.publicBooking}
          tokens={props.tokens}
          heroTagline={heroTagline}
          openCloseMeta={openCloseMeta}
          statusKind={profileStatusKind}
          shareMessage={shareMessage}
          onShare={handleShare}
          cardStyle={cardStyle}
          locale={locale}
          supportedLanguages={props.supportedLanguages}
          onLocaleChange={handleProfileLocaleChange}
        />

        <ProfileServicesSection
          salonId={props.salonId}
          slug={props.slug}
          bookUrl={props.bookUrl}
          publicBooking={props.publicBooking}
          services={props.servicesPreview}
          cardStyle={cardStyle}
          locale={locale}
        />

        <ProfileTeamSection
          salonId={props.salonId}
          slug={props.slug}
          members={props.teamPreview}
          cardStyle={cardStyle}
          primaryColor={props.tokens.colors.primary}
          primaryTextColor={props.tokens.colors.primaryText}
          openMemberId={selectedMember?.id || null}
          locale={locale}
          onOpenMember={(member, trigger) => {
            lastTeamTriggerRef.current = trigger;
            setSelectedMember(member);
            setTeamModalTab("about");
          }}
        />

        <ProfilePortfolioSection
          items={props.portfolioPreview}
          borderColor={props.tokens.colors.border}
          locale={locale}
        />

        <ProfileReviewsSection
          reviewsSummary={props.reviewsSummary}
          borderColor={props.tokens.colors.border}
          cardBackground={props.tokens.colors.cardBackground}
          locale={locale}
        />

        <ProfileAboutVisitSection
          salonId={props.salonId}
          slug={props.slug}
          heroName={props.hero.name}
          addressLine={props.hero.addressLine}
          aboutDescription={props.about.description}
          socialItems={socialItems}
          openingHours={props.openingHours}
          todayDayOfWeek={todayDayOfWeek}
          isOpenNow={props.hero.isOpenNow}
          isClosedToday={Boolean(todayHours?.isClosed)}
          hoursStatusLine={hoursStatusLine}
          mapLink={props.mapLink}
          mapPreviewImageUrl={props.mapPreviewImageUrl}
          mapImageUnavailable={mapImageUnavailable}
          onMapImageError={() => setMapImageUnavailable(true)}
          cardStyle={cardStyle}
          locale={locale}
        />
      </main>

      {props.publicBooking.available ? (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-[var(--pb-border-soft)] bg-[var(--pb-surface)] p-3 lg:hidden">
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
              {m.bookAppointment}
            </Button>
          </Link>
        </div>
      ) : null}

      <ProfileTeamDialog
        salonId={props.salonId}
        slug={props.slug}
        bookUrl={props.bookUrl}
        publicBooking={props.publicBooking}
        borderColor={props.tokens.colors.border}
        selectedMember={selectedMember}
        locale={locale}
        tab={teamModalTab}
        onTabChange={setTeamModalTab}
        themeStyle={dialogThemeStyle}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedMember(null);
            const trigger = lastTeamTriggerRef.current;
            if (trigger) setTimeout(() => trigger.focus(), 0);
          }
        }}
      />
    </div>
  );
}
