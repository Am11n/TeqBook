"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SetupBadge } from "@/components/setup-badge";
import { getServiceSetupIssues } from "@/lib/setup/health";
import { formatPrice as _formatPrice, getCategoryLabel as _getCategoryLabel } from "@/lib/utils/services/services-utils";
import type { Service } from "@/lib/types";

interface ServicesCardViewProps {
  services: Service[];
  serviceEmployeeCountMap: Record<string, number>;
  onToggleActive: (serviceId: string, currentStatus: boolean) => void;
  onDelete: (serviceId: string) => void;
  onRowClick: (service: Service) => void;
  translations: {
    active: string;
    inactive: string;
    delete: string;
    edit: string;
    categoryCut: string;
    categoryBeard: string;
    categoryColor: string;
    categoryNails: string;
    categoryMassage: string;
    categoryOther: string;
    staffUnit: string;
    locale: string;
  };
}

export function ServicesCardView({
  services,
  serviceEmployeeCountMap,
  onToggleActive,
  onDelete,
  onRowClick,
  translations: t,
}: ServicesCardViewProps) {
  const categoryLabels = {
    categoryCut: t.categoryCut,
    categoryBeard: t.categoryBeard,
    categoryColor: t.categoryColor,
    categoryNails: t.categoryNails,
    categoryMassage: t.categoryMassage,
    categoryOther: t.categoryOther,
  };
  const formatPrice = (cents: number) => _formatPrice(cents, t.locale);
  const getCategoryLabel = (cat: string | null | undefined) =>
    _getCategoryLabel(cat, categoryLabels);

  return (
    <div className="mt-4 space-y-3 md:hidden">
      {services.map((service) => {
        const empCount = serviceEmployeeCountMap[service.id] ?? 0;
        const issues = getServiceSetupIssues(service, {
          employeeCount: empCount,
        });

        return (
          <div
            key={service.id}
            className="rounded-lg border bg-card px-3 py-3 text-xs cursor-pointer hover:bg-accent/50 transition-colors"
            onClick={() => onRowClick(service)}
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <span className="text-sm font-medium">{service.name}</span>
                <div className="mt-1 flex flex-wrap gap-1">
                  <Badge variant="outline" className="text-[10px]">
                    {getCategoryLabel(service.category)}
                  </Badge>
                  <Badge variant="outline" className="text-[10px]">
                    {service.duration_minutes} min
                  </Badge>
                  <Badge variant="outline" className="text-[10px]">
                    {formatPrice(service.price_cents)}
                  </Badge>
                  <Badge variant="outline" className="text-[10px]">
                    {empCount} {t.staffUnit}
                  </Badge>
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
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleActive(service.id, service.is_active);
                }}
              >
                {service.is_active ? t.active : t.inactive}
              </Button>
            </div>
            <SetupBadge issues={issues} className="mt-2" />
            <div className="mt-2 flex justify-end gap-1">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onRowClick(service);
                }}
              >
                {t.edit}
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="text-red-600 hover:bg-red-50"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(service.id);
                }}
              >
                {t.delete}
              </Button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
