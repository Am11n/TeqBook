"use client";

import Link from "next/link";
import { trackPublicEvent } from "@/components/public-booking/publicBookingTelemetry";
import { BASE_CARD_CLASS, formatPrice } from "../profile-helpers";
import { getProfilePageMessages } from "../profile-i18n";
import type { AppLocale } from "@/i18n/translations";
import type { CardStyle, PublicService } from "../profile-types";

type Props = {
  salonId: string;
  slug: string;
  bookUrl: string;
  services: PublicService[];
  cardStyle: CardStyle;
  locale: AppLocale;
};

export function ProfileServicesSection({ salonId, slug, bookUrl, services, cardStyle, locale }: Props) {
  const m = getProfilePageMessages(locale);
  return (
    <section className="space-y-3">
      <h2 className="text-xl font-semibold">{m.servicesHeading}</h2>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {services.slice(0, 6).map((service) => (
          <Link
            key={service.id}
            href={`${bookUrl}?serviceId=${encodeURIComponent(service.id)}`}
            className={`${BASE_CARD_CLASS} group flex min-h-[132px] flex-col justify-between p-4 transition-[transform,box-shadow,border-color] duration-[var(--pb-motion-standard)] ease-[var(--pb-ease-out)] hover:-translate-y-0.5 hover:border-[var(--pb-border-strong)] hover:shadow-[var(--pb-shadow-2)] active:translate-y-px focus-visible:outline-none focus-visible:ring-[var(--pb-focus-width)] focus-visible:ring-[var(--pb-focus)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--pb-bg)] motion-reduce:transform-none motion-reduce:transition-none`}
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
                {service.durationMinutes ? `${service.durationMinutes} ${m.minuteShort}` : m.durationOnRequest}
                {formatPrice(service.priceCents, locale) ? ` · ${formatPrice(service.priceCents, locale)}` : ""}
              </p>
            </div>
            <p className="inline-flex items-center gap-1 text-sm font-medium text-[var(--pb-text-secondary)]">
              <span>{m.book}</span>
              <span aria-hidden="true" className="transition-transform duration-[var(--pb-motion-fast)] ease-[var(--pb-ease-out)] group-hover:translate-x-0.5 group-focus-visible:translate-x-0.5 motion-reduce:transform-none">→</span>
            </p>
          </Link>
        ))}
      </div>
      <Link href={bookUrl} className="inline-block text-sm font-medium text-[var(--pb-text-secondary)] underline underline-offset-2 transition-colors duration-[var(--pb-motion-fast)] ease-[var(--pb-ease-out)] hover:text-[var(--pb-text-primary)] focus-visible:outline-none focus-visible:ring-[var(--pb-focus-width)] focus-visible:ring-[var(--pb-focus)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--pb-bg)]">
        {m.seeAllServices}
      </Link>
    </section>
  );
}
