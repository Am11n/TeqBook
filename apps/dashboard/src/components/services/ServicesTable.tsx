"use client";

import { Button } from "@/components/ui/button";
import { TableWithViews, type ColumnDefinition } from "@/components/tables/TableWithViews";
import { formatPrice, getCategoryLabel } from "@/lib/utils/services/services-utils";
import type { Service } from "@/lib/types";
import { Badge } from "@/components/ui/badge";

interface ServicesTableProps {
  services: Service[];
  locale: string;
  onToggleActive: (serviceId: string, currentStatus: boolean) => void;
  onDelete: (serviceId: string) => void;
  translations: {
    colName: string;
    colCategory: string;
    colDuration: string;
    colPrice: string;
    colStatus: string;
    colActions: string;
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

export function ServicesTable({
  services,
  locale,
  onToggleActive,
  onDelete,
  translations,
}: ServicesTableProps) {
  const columns: ColumnDefinition<Service>[] = [
    {
      id: "name",
      label: translations.colName,
      render: (service) => (
        <div className="font-medium">{service.name}</div>
      ),
    },
    {
      id: "category",
      label: translations.colCategory,
      render: (service) => (
        <div className="text-xs text-muted-foreground">
          {getCategoryLabel(service.category, translations)}
        </div>
      ),
    },
    {
      id: "duration",
      label: translations.colDuration,
      render: (service) => (
        <div className="text-xs text-muted-foreground">
          {service.duration_minutes} min
        </div>
      ),
    },
    {
      id: "price",
      label: translations.colPrice,
      render: (service) => (
        <div className="text-xs text-muted-foreground">
          {formatPrice(service.price_cents, locale)}
        </div>
      ),
    },
    {
      id: "status",
      label: translations.colStatus,
      render: (service) => (
        <Badge
          variant="outline"
          className={
            service.is_active
              ? "border-emerald-200 bg-emerald-50 text-emerald-700"
              : "border-zinc-200 bg-zinc-100 text-zinc-600"
          }
        >
          {service.is_active ? translations.active : translations.inactive}
        </Badge>
      ),
    },
  ];

  return (
    <div className="mt-4 hidden md:block">
      <TableWithViews
        tableId="services"
        columns={columns}
        data={services}
        onDelete={(service) => onDelete(service.id)}
        renderDetails={(service) => (
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-lg">{service.name}</h3>
              <p className="text-sm text-muted-foreground mt-1">
                {getCategoryLabel(service.category, translations)}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium">Duration</p>
                <p className="text-sm text-muted-foreground">{service.duration_minutes} minutes</p>
              </div>
              <div>
                <p className="text-sm font-medium">Price</p>
                <p className="text-sm text-muted-foreground">{formatPrice(service.price_cents, locale)}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Status</p>
                <Badge
                  variant="outline"
                  className={
                    service.is_active
                      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                      : "border-zinc-200 bg-zinc-100 text-zinc-600"
                  }
                >
                  {service.is_active ? translations.active : translations.inactive}
                </Badge>
              </div>
            </div>
          </div>
        )}
        emptyMessage="No services available"
        actionsLabel={translations.colActions}
      />
    </div>
  );
}

