import PublicBookingPage from "@/components/public-booking-page";

type PageProps = {
  params: {
    salon_slug: string;
  };
};

// With output: "export", dynamic routes must define generateStaticParams.
// We don't pre-generate any concrete slugs at build time for GitHub Pages,
// so we return an empty list here and let the app handle routing client-side.
export function generateStaticParams(): PageProps["params"][] {
  return [];
}

export default function BookSalonPage({ params }: PageProps) {
  const { salon_slug } = params;
  return <PublicBookingPage slug={salon_slug} />;
}

