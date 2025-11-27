import PublicBookingPage from "@/components/public-booking-page";

type RouteParams = {
  salon_slug: string;
};

// With output: "export", dynamic routes must define generateStaticParams.
// For GitHub Pages we don't know real slugs at build time, so we export
// a single placeholder path. The actual runtime slugs will typically be
// used in a deployed environment with a real domain.
export const generateStaticParams = async (): Promise<RouteParams[]> => {
  return [{ salon_slug: "example-salon" }];
};

export default function BookSalonPage({ params }: { params: RouteParams }) {
  const { salon_slug } = params;
  return <PublicBookingPage slug={salon_slug} />;
}

