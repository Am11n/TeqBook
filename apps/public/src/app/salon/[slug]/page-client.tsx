"use client";

import { useMemo, useState } from "react";
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
  formatTimeShort,
} from "./profile-helpers";
import type { PublicProfileClientProps } from "./profile-types";

export default function PublicSalonProfilePageClient(props: PublicProfileClientProps) {
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);
  const [shareMessage, setShareMessage] = useState<string | null>(null);
  const [teamModalTab, setTeamModalTab] = useState<"about" | "services">("about");
  const [mapImageUnavailable, setMapImageUnavailable] = useState(false);

  const selectedMember = useMemo(
    () => props.teamPreview.find((member) => member.id === selectedMemberId) || null,
    [props.teamPreview, selectedMemberId]
  );
  const heroTagline = useMemo(
    () => buildTagline(props.about.description, props.hero.addressLine),
    [props.about.description, props.hero.addressLine]
  );
  const socialItems = useMemo(() => buildSocialItems(props.socialLinks), [props.socialLinks]);
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
        <ProfileHeroSection
          salonId={props.salonId}
          slug={props.slug}
          hero={props.hero}
          bookUrl={props.bookUrl}
          tokens={props.tokens}
          heroTagline={heroTagline}
          openCloseMeta={openCloseMeta}
          shareMessage={shareMessage}
          onShare={handleShare}
          cardStyle={cardStyle}
        />

        <ProfileServicesSection
          salonId={props.salonId}
          slug={props.slug}
          bookUrl={props.bookUrl}
          services={props.servicesPreview}
          cardStyle={cardStyle}
        />

        <ProfileTeamSection
          salonId={props.salonId}
          slug={props.slug}
          members={props.teamPreview}
          cardStyle={cardStyle}
          primaryColor={props.tokens.colors.primary}
          onOpenMember={(memberId) => {
            setSelectedMemberId(memberId);
            setTeamModalTab("about");
          }}
        />

        <ProfilePortfolioSection
          items={props.portfolioPreview}
          borderColor={props.tokens.colors.border}
        />

        <ProfileReviewsSection
          reviewsSummary={props.reviewsSummary}
          borderColor={props.tokens.colors.border}
          cardBackground={props.tokens.colors.cardBackground}
        />

        <ProfileAboutVisitSection
          salonId={props.salonId}
          slug={props.slug}
          heroName={props.hero.name}
          aboutDescription={props.about.description}
          socialItems={socialItems}
          openingHours={props.openingHours}
          todayDayOfWeek={todayDayOfWeek}
          hoursStatusLine={hoursStatusLine}
          mapLink={props.mapLink}
          mapPreviewImageUrl={props.mapPreviewImageUrl}
          mapImageUnavailable={mapImageUnavailable}
          onMapImageError={() => setMapImageUnavailable(true)}
          cardStyle={cardStyle}
        />
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

      <ProfileTeamDialog
        salonId={props.salonId}
        slug={props.slug}
        bookUrl={props.bookUrl}
        borderColor={props.tokens.colors.border}
        selectedMember={selectedMember}
        tab={teamModalTab}
        onTabChange={setTeamModalTab}
        onOpenChange={(open) => {
          if (!open) setSelectedMemberId(null);
        }}
      />
    </div>
  );
}
