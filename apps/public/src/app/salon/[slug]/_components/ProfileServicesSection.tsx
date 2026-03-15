"use client";

import Link from "next/link";
import { trackPublicEvent } from "@/components/public-booking/publicBookingTelemetry";
import { BASE_CARD_CLASS, formatPrice } from "../profile-helpers";
import type { CardStyle, PublicService } from "../profile-types";

type Props = {
  salonId: string;
  slug: string;
  bookUrl: string;
  services: PublicService[];
  cardStyle: CardStyle;
};

export function ProfileServicesSection({ salonId, slug, bookUrl, services, cardStyle }: Props) {
  return (
    <section className="space-y-3">
      <h2 className="text-xl font-semibold">Services</h2>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {services.slice(0, 6).map((service) => (
          <Link
            key={service.id}
            href={`${bookUrl}?serviceId=${encodeURIComponent(service.id)}`}
            className={`${BASE_CARD_CLASS} group flex min-h-[132px] flex-col justify-between p-4 transition duration-200 hover:-translate-y-0.5 hover:shadow-[var(--pb-shadow-2)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--pb-primary)] focus-visible:ring-offset-2`}
            style={cardStyle}
            onClick={() =>
              trackPublicEvent("click_service_preview", {
                salon_id: salonId,
                slug,
                cta_location: "services_preview",
                service_id: service.id,
              })
            }
          >
            <div className="space-y-2">
              <p className="font-medium">{service.name}</p>
              <p className="text-sm text-[var(--pb-muted)]">
                {service.durationMinutes ? `${service.durationMinutes} min` : "Duration on request"}
                {formatPrice(service.priceCents) ? ` · ${formatPrice(service.priceCents)}` : ""}
              </p>
            </div>
            <p className="inline-flex items-center gap-1 text-sm font-medium text-slate-700">
              <span>Book</span>
              <span aria-hidden="true" className="transition-transform group-hover:translate-x-0.5">→</span>
            </p>
          </Link>
        ))}
      </div>
      <Link href={bookUrl} className="inline-block text-sm font-medium text-slate-700 underline underline-offset-2">
        See all services
      </Link>
    </section>
  );
}
