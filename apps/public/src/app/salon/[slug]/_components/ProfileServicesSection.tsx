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
      <h2 className="text-xl font-semibold tracking-tight">{m.servicesHeading}</h2>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {services.slice(0, 6).map((service) => (
          <Link
            key={service.id}
            href={`${bookUrl}?serviceId=${encodeURIComponent(service.id)}`}
            className={`${BASE_CARD_CLASS} group relative flex min-h-[136px] flex-col justify-between p-4 transition-[transform,box-shadow,border-color,background-color] duration-[var(--pb-motion-standard)] ease-[var(--pb-ease-out)] hover:-translate-y-[2px] hover:border-[var(--pb-border-strong)] hover:shadow-[var(--pb-shadow-card)] active:translate-y-px focus-visible:outline-none focus-visible:ring-[var(--pb-focus-width)] focus-visible:ring-[var(--pb-focus)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--pb-bg)] motion-reduce:transform-none motion-reduce:transition-none`}
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
              <p className="pr-8 font-medium leading-5 text-[var(--pb-text-primary)]">{service.name}</p>
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="inline-flex items-center rounded-full border border-[var(--pb-secondary-border)] bg-[var(--pb-secondary-bg)] px-2.5 py-1 text-xs font-medium text-[var(--pb-secondary-text)]">
                  {service.durationMinutes ? `${service.durationMinutes} ${m.minuteShort}` : m.durationOnRequest}
                </span>
                {formatPrice(service.priceCents, locale) ? (
                  <span className="inline-flex items-center rounded-full border border-[var(--pb-secondary-border)] bg-[var(--pb-secondary-bg)] px-2.5 py-1 text-xs font-medium text-[var(--pb-secondary-text)]">
                    {formatPrice(service.priceCents, locale)}
                  </span>
                ) : null}
              </div>
            </div>
            <div className="mt-3 flex items-center justify-end gap-2 border-t border-[var(--pb-divider)] pt-2.5">
              <p className="inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-semibold transition-[background-color,border-color,color,transform] duration-[var(--pb-motion-fast)] ease-[var(--pb-ease-out)] group-hover:-translate-y-px group-hover:shadow-[var(--pb-shadow-1)]"
                style={{
                  borderColor: "color-mix(in srgb, var(--pb-primary) 22%, var(--pb-secondary-border) 78%)",
                  backgroundColor: "color-mix(in srgb, var(--pb-primary) 10%, var(--pb-secondary-bg) 90%)",
                  color: "color-mix(in srgb, var(--pb-text-primary) 88%, var(--pb-primary) 12%)",
                }}
              >
                <span>{m.book}</span>
                <span aria-hidden="true" className="transition-transform duration-[var(--pb-motion-fast)] ease-[var(--pb-ease-out)] group-hover:translate-x-1 group-focus-visible:translate-x-1 motion-reduce:transform-none">→</span>
              </p>
            </div>
          </Link>
        ))}
      </div>
      <Link href={bookUrl} className="inline-block text-sm font-medium text-[var(--pb-text-secondary)] underline underline-offset-2 transition-colors duration-[var(--pb-motion-fast)] ease-[var(--pb-ease-out)] hover:text-[var(--pb-text-primary)] focus-visible:outline-none focus-visible:ring-[var(--pb-focus-width)] focus-visible:ring-[var(--pb-focus)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--pb-bg)]">
        {m.seeAllServices}
      </Link>
    </section>
  );
}
