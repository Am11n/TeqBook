import PublicBookingPage from "@/components/public-booking-page";

type PageProps = {
  params: Promise<{
    salon_slug: string;
  }>;
};

export default async function BookSalonPage({ params }: PageProps) {
  const { salon_slug } = await params;
  return <PublicBookingPage slug={salon_slug} />;
}



