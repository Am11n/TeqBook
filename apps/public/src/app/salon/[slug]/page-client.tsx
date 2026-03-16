"use client";

import { useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Button } from "@teqbook/ui";
import { buildPublicBookingCssVars } from "@/components/public-booking/publicBookingTokens";
import { trackPublicEvent } from "@/components/public-booking/publicBookingTelemetry";
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
  const [selectedMember, setSelectedMember] = useState<PublicProfileClientProps["teamPreview"][number] | null>(null);
  const [shareMessage, setShareMessage] = useState<string | null>(null);
  const [teamModalTab, setTeamModalTab] = useState<"about" | "services">("about");
  const [mapImageUnavailable, setMapImageUnavailable] = useState(false);
  const lastTeamTriggerRef = useRef<HTMLButtonElement | null>(null);

  const heroTagline = useMemo(
    () => buildTagline(props.about.description, props.hero.addressLine, props.locale),
    [props.about.description, props.hero.addressLine, props.locale]
  );
  const m = useMemo(() => getProfilePageMessages(props.locale), [props.locale]);
  const socialItems = useMemo(() => buildSocialItems(props.socialLinks), [props.socialLinks]);
  const todayHours = useMemo(() => getTodayOpeningHours(props.openingHours), [props.openingHours]);
  const openCloseMeta = useMemo(
    () => buildHoursStatusLine(props.hero.isOpenNow, Boolean(todayHours?.isClosed), todayHours?.closeTime || null, props.locale),
    [props.hero.isOpenNow, props.locale, todayHours?.closeTime, todayHours?.isClosed]
  );
  const hoursStatusLine = useMemo(
    () => buildHoursStatusLine(props.hero.isOpenNow, Boolean(todayHours?.isClosed), todayHours?.closeTime || null, props.locale),
    [props.hero.isOpenNow, todayHours, props.locale]
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
          tokens={props.tokens}
          heroTagline={heroTagline}
          openCloseMeta={openCloseMeta}
          statusKind={profileStatusKind}
          shareMessage={shareMessage}
          onShare={handleShare}
          cardStyle={cardStyle}
          locale={props.locale}
        />

        <ProfileServicesSection
          salonId={props.salonId}
          slug={props.slug}
          bookUrl={props.bookUrl}
          services={props.servicesPreview}
          cardStyle={cardStyle}
          locale={props.locale}
        />

        <ProfileTeamSection
          salonId={props.salonId}
          slug={props.slug}
          members={props.teamPreview}
          cardStyle={cardStyle}
          primaryColor={props.tokens.colors.primary}
          primaryTextColor={props.tokens.colors.primaryText}
          openMemberId={selectedMember?.id || null}
          locale={props.locale}
          onOpenMember={(member, trigger) => {
            lastTeamTriggerRef.current = trigger;
            setSelectedMember(member);
            setTeamModalTab("about");
          }}
        />

        <ProfilePortfolioSection
          items={props.portfolioPreview}
          borderColor={props.tokens.colors.border}
          locale={props.locale}
        />

        <ProfileReviewsSection
          reviewsSummary={props.reviewsSummary}
          borderColor={props.tokens.colors.border}
          cardBackground={props.tokens.colors.cardBackground}
          locale={props.locale}
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
          locale={props.locale}
        />
      </main>

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

      <ProfileTeamDialog
        salonId={props.salonId}
        slug={props.slug}
        bookUrl={props.bookUrl}
        borderColor={props.tokens.colors.border}
        selectedMember={selectedMember}
        locale={props.locale}
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
