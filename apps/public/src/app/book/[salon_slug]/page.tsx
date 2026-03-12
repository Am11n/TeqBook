import { Suspense } from "react";
import PublicBookingPage from "@/components/public-booking-page";
import { LoadingScreen } from "@/components/loading-screen";

type RouteParams = {
  salon_slug: string;
};

// Generate static params for dynamic route
// For Vercel, this pre-generates a placeholder page at build time
// Additional routes will be generated on-demand at runtime
export function generateStaticParams(): RouteParams[] {
  // Return at least one placeholder for build-time generation
  // Vercel will handle additional routes dynamically
  return [{ salon_slug: "example-salon" }];
}

export default async function BookSalonPage({
  params,
}: {
  params: Promise<RouteParams>;
}) {
  const { salon_slug } = await params;
  // Note: searchParams are handled in the client component via useSearchParams
  // Suspense is required for useSearchParams() in App Router
  return (
    <Suspense fallback={<LoadingScreen />}>
      <PublicBookingPage slug={salon_slug} />
    </Suspense>
  );
}

