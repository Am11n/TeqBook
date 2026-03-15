import type { CSSProperties } from "react";
import type { PublicBookingTokens } from "@/components/public-booking/types";

export type PublicService = {
  id: string;
  name: string;
  durationMinutes: number | null;
  priceCents: number | null;
};

export type PublicTeamMember = {
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

export type OpeningHourItem = {
  dayOfWeek: number;
  isClosed: boolean;
  openTime: string | null;
  closeTime: string | null;
};

export type PublicProfileClientProps = {
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
  openingHours: OpeningHourItem[];
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

export type CardStyle = CSSProperties;

export type SocialPlatform = "instagram" | "facebook" | "twitter" | "tiktok" | "website";

export type SocialItem = {
  platform: SocialPlatform;
  url: string;
  label: string;
};
