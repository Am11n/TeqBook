// Server component wrapper for generateStaticParams
import { Suspense } from "react";
import BookingConfirmationPageClient from "./page-client";

type BookingConfirmationPageProps = {
  params: Promise<{ salon_slug: string }>;
};

// Generate static params for dynamic route
// For Vercel, this pre-generates a placeholder page at build time
// Additional routes will be generated on-demand at runtime
export function generateStaticParams() {
  // Return at least one placeholder for build-time generation
  // Vercel will handle additional routes dynamically
  return [{ salon_slug: "example-salon" }];
}

export default async function BookingConfirmationPage({ params }: BookingConfirmationPageProps) {
  const resolvedParams = await params;
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center px-4">
        <p className="text-sm text-muted-foreground">Loading...</p>
      </div>
    }>
      <BookingConfirmationPageClient salonSlug={resolvedParams.salon_slug} />
    </Suspense>
  );
}

