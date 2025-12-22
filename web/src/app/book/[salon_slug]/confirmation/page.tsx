// Server component wrapper for generateStaticParams
import { Suspense } from "react";
import BookingConfirmationPageClient from "./page-client";

type BookingConfirmationPageProps = {
  params: Promise<{ salon_slug: string }>;
};

// Generate static params for dynamic route (required for static export)
export function generateStaticParams() {
  // Return at least one placeholder to satisfy Next.js static export requirements
  // In production, this will be used for static generation
  // In dev mode, Next.js will still allow dynamic routes
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

