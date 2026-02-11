"use client";

import { DataTable, type ColumnDef, type RowAction } from "@/components/shared/data-table";
import { formatPrice, getCategoryLabel } from "@/lib/utils/services/services-utils";
import type { Service } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Trash2 } from "lucide-react";

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
  const columns: ColumnDef<Service>[] = [
    {
      id: "name",
      header: translations.colName,
      cell: (service) => (
        <div className="font-medium">{service.name}</div>
      ),
      getValue: (service) => service.name,
    },
    {
      id: "category",
      header: translations.colCategory,
      cell: (service) => (
        <div className="text-xs text-muted-foreground">
          {getCategoryLabel(service.category, translations)}
        </div>
      ),
      getValue: (service) => service.category ?? "",
    },
    {
      id: "duration",
      header: translations.colDuration,
      cell: (service) => (
        <div className="text-xs text-muted-foreground">
          {service.duration_minutes} min
        </div>
      ),
      getValue: (service) => service.duration_minutes,
    },
    {
      id: "price",
      header: translations.colPrice,
      cell: (service) => (
        <div className="text-xs text-muted-foreground">
          {formatPrice(service.price_cents, locale)}
        </div>
      ),
      getValue: (service) => service.price_cents,
    },
    {
      id: "status",
      header: translations.colStatus,
      cell: (service) => (
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
      getValue: (service) => (service.is_active ? 1 : 0),
    },
  ];

  const getRowActions = (service: Service): RowAction<Service>[] => [
    {
      label: translations.delete,
      icon: Trash2,
      onClick: (s) => onDelete(s.id),
      variant: "destructive",
    },
  ];

  return (
    <div className="mt-4 hidden md:block">
      <DataTable
        columns={columns}
        data={services}
        rowKey={(s) => s.id}
        getRowActions={getRowActions}
        storageKey="dashboard-services"
        emptyMessage="No services available"
      />
    </div>
  );
}
