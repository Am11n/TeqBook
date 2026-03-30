import type { Metadata } from "next";
import { notFound } from "next/navigation";
import PublicSalonProfilePageClient from "./page-client";
import { getPublicSalonProfileBySlug } from "@/lib/server/public-salon-profile";

type RouteParams = {
  slug: string;
};

function getBaseUrl(): string {
  const raw =
    process.env.NEXT_PUBLIC_APP_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "https://teqbook.com");
  return raw.replace(/\/$/, "");
}

export async function generateMetadata({ params }: { params: Promise<RouteParams> }): Promise<Metadata> {
  const { slug } = await params;
  const result = await getPublicSalonProfileBySlug(slug);
  if (result.kind !== "ok") {
    return {
      title: "Salon not found | TeqBook",
      description: "This salon profile is not available.",
      robots: { index: false, follow: false },
    };
  }

  const city = result.data.hero.city ? ` in ${result.data.hero.city}` : "";
  const title = `${result.data.hero.name} | Barber${city} | TeqBook`;
  const description = result.data.about.description;
  const canonical = `${getBaseUrl()}/salon/${result.data.slug}`;

  return {
    title,
    description,
    alternates: {
      canonical,
    },
    openGraph: {
      title,
      description,
      url: canonical,
      images: result.data.hero.coverImageUrl ? [result.data.hero.coverImageUrl] : undefined,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: result.data.hero.coverImageUrl ? [result.data.hero.coverImageUrl] : undefined,
    },
  };
}

export default async function SalonPublicProfilePage({ params }: { params: Promise<RouteParams> }) {
  const { slug } = await params;
  const result = await getPublicSalonProfileBySlug(slug);
  if (result.kind !== "ok") {
    notFound();
  }

  return (
    <PublicSalonProfilePageClient
      salonId={result.data.salonId}
      slug={result.data.slug}
      hero={result.data.hero}
      about={result.data.about}
      servicesPreview={result.data.servicesPreview}
      teamPreview={result.data.teamPreview}
      openingHours={result.data.openingHours}
      mapLink={result.data.mapLink}
      mapPreviewImageUrl={result.data.mapPreviewImageUrl}
      bookUrl={result.data.bookUrl}
      shareUrl={result.data.shareUrl}
      socialLinks={result.data.socialLinks}
      portfolioPreview={result.data.portfolioPreview}
      reviewsSummary={result.data.reviewsSummary}
      tokens={result.data.tokens}
      locale={result.data.locale}
      supportedLanguages={result.data.supportedLanguages}
      publicBooking={result.data.publicBooking}
    />
  );
}
