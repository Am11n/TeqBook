"use client";

import { Button } from "@/components/ui/button";
import { formatPrice, getCategoryLabel } from "@/lib/utils/services/services-utils";
import type { Service } from "@/lib/types";

interface ServicesCardViewProps {
  services: Service[];
  locale: string;
  onToggleActive: (serviceId: string, currentStatus: boolean) => void;
  onDelete: (serviceId: string) => void;
  translations: {
    active: string;
    inactive: string;
    delete: string;
    categoryCut: string;
    categoryBeard: string;
    categoryColor: string;
    categoryNails: string;
    categoryMassage: string;
    categoryOther: string;
  };
}

export function ServicesCardView({
  services,
  locale,
  onToggleActive,
  onDelete,
  translations,
}: ServicesCardViewProps) {
  return (
    <div className="mt-4 space-y-3 md:hidden">
      {services.map((service) => (
        <div key={service.id} className="rounded-lg border bg-card px-3 py-3 text-xs">
          <div className="flex items-start justify-between gap-2">
            <div>
              <div className="text-sm font-medium">{service.name}</div>
              <div className="text-[11px] text-muted-foreground">
                {getCategoryLabel(service.category, translations)} • {service.duration_minutes} min
              </div>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className={
                service.is_active
                  ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                  : "border-zinc-200 bg-zinc-100 text-zinc-600"
              }
              onClick={() => onToggleActive(service.id, service.is_active ?? true)}
            >
              {service.is_active ? translations.active : translations.inactive}
            </Button>
          </div>
          <div className="mt-2 text-[11px] text-muted-foreground">
            {formatPrice(service.price_cents, locale)}
          </div>
          <div className="mt-2 flex justify-end">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="text-red-600 hover:bg-red-50"
              onClick={() => onDelete(service.id)}
            >
              {translations.delete}
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}

