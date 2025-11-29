import PublicBookingPage from "@/components/public-booking-page";

type RouteParams = {
  salon_slug: string;
};

// With output: "export", dynamic routes must define generateStaticParams.
// For GitHub Pages we don't know real slugs at build time, so we export
// a single placeholder path. The actual runtime slugs will typically be
// used in a deployed environment with a real domain.
export function generateStaticParams(): RouteParams[] {
  // Always return at least one placeholder to satisfy Next.js static export requirements
  // In production, this will be used for static generation
  // In dev mode, Next.js will still allow dynamic routes
  return [{ salon_slug: "example-salon" }];
}

export default async function BookSalonPage({
  params,
}: {
  params: Promise<RouteParams>;
}) {
  const { salon_slug } = await params;
  return <PublicBookingPage slug={salon_slug} />;
}

