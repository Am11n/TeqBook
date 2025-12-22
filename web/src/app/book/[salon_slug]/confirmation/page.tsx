// Server component wrapper for generateStaticParams
import BookingConfirmationPageClient from "./page-client";

type BookingConfirmationPageProps = {
  params: Promise<{ salon_slug: string }>;
};

// Generate static params for dynamic route (required for static export)
export function generateStaticParams() {
  // Return empty array for dynamic routes that should be generated at runtime
  return [];
}

export default async function BookingConfirmationPage({ params }: BookingConfirmationPageProps) {
  const resolvedParams = await params;
  return <BookingConfirmationPageClient salonSlug={resolvedParams.salon_slug} />;
}

