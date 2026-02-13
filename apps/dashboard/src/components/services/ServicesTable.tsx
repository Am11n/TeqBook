"use client";

import { DataTable, type ColumnDef, type RowAction } from "@/components/shared/data-table";
import { Badge } from "@/components/ui/badge";
import { SetupBadge } from "@/components/setup-badge";
import { getServiceSetupIssues } from "@/lib/setup/health";
import { formatPrice as _formatPrice, getCategoryLabel as _getCategoryLabel } from "@/lib/utils/services/services-utils";
import { Edit, Trash2, ArrowUp, ArrowDown } from "lucide-react";
import type { Service } from "@/lib/types";

interface ServicesTableTranslations {
  colName: string;
  colCategory: string;
  colDuration: string;
  colPrice: string;
  colStatus: string;
  colEmployees: string;
  active: string;
  inactive: string;
  delete: string;
  edit: string;
  moveUp: string;
  moveDown: string;
  // Category labels
  categoryCut: string;
  categoryBeard: string;
  categoryColor: string;
  categoryNails: string;
  categoryMassage: string;
  categoryOther: string;
  // Units
  staffUnit: string;
  prepBadge: string;
  afterBadge: string;
  locale: string;
}

interface ServicesTableProps {
  services: Service[];
  serviceEmployeeCountMap: Record<string, number>;
  onToggleActive: (serviceId: string, currentStatus: boolean) => void;
  onDelete: (serviceId: string) => void;
  onRowClick: (service: Service) => void;
  onEditClick: (service: Service) => void;
  onReorder: (serviceId: string, direction: "up" | "down") => void;
  translations: ServicesTableTranslations;
  currency: string;
}

export function ServicesTable({
  services,
  serviceEmployeeCountMap,
  onToggleActive,
  onDelete,
  onRowClick,
  onEditClick,
  onReorder,
  translations: t,
  currency,
}: ServicesTableProps) {
  const categoryLabels = {
    categoryCut: t.categoryCut,
    categoryBeard: t.categoryBeard,
    categoryColor: t.categoryColor,
    categoryNails: t.categoryNails,
    categoryMassage: t.categoryMassage,
    categoryOther: t.categoryOther,
  };
  const formatPrice = (cents: number) => _formatPrice(cents, t.locale, currency);
  const getCategoryLabel = (cat: string | null | undefined) =>
    _getCategoryLabel(cat, categoryLabels);

  const columns: ColumnDef<Service>[] = [
    {
      id: "name",
      header: t.colName,
      cell: (service) => (
        <div className="font-medium text-sm">{service.name}</div>
      ),
      getValue: (service) => service.name,
    },
    {
      id: "category",
      header: t.colCategory,
      cell: (service) => (
        <Badge variant="outline" className="text-xs">
          {getCategoryLabel(service.category)}
        </Badge>
      ),
      getValue: (service) => service.category ?? "other",
    },
    {
      id: "duration",
      header: t.colDuration,
      cell: (service) => (
        <span className="text-sm text-muted-foreground">
          {service.duration_minutes} min
        </span>
      ),
      getValue: (service) => service.duration_minutes,
    },
    {
      id: "price",
      header: t.colPrice,
      cell: (service) => (
        <span className="text-sm font-medium">
          {formatPrice(service.price_cents)}
        </span>
      ),
      getValue: (service) => service.price_cents,
    },
    {
      id: "employees",
      header: t.colEmployees,
      cell: (service) => {
        const count = serviceEmployeeCountMap[service.id] ?? 0;
        return (
          <span className="text-sm text-muted-foreground">
            {count} {t.staffUnit}
          </span>
        );
      },
      getValue: (service) => serviceEmployeeCountMap[service.id] ?? 0,
    },
    {
      id: "setup",
      header: "",
      cell: (service) => {
        const empCount = serviceEmployeeCountMap[service.id] ?? 0;
        const issues = getServiceSetupIssues(service, {
          employeeCount: empCount,
        });
        return <SetupBadge issues={issues} limit={1} />;
      },
      sortable: false,
    },
    {
      id: "buffer",
      header: "",
      cell: (service) => {
        const prep = service.prep_minutes ?? 0;
        const cleanup = service.cleanup_minutes ?? 0;
        if (prep === 0 && cleanup === 0) return null;
        return (
          <div className="flex gap-1 text-[11px] text-muted-foreground">
            {prep > 0 && (
              <span className="rounded bg-muted px-1">+{prep}m {t.prepBadge}</span>
            )}
            {cleanup > 0 && (
              <span className="rounded bg-muted px-1">+{cleanup}m {t.afterBadge}</span>
            )}
          </div>
        );
      },
      sortable: false,
      hideable: true,
      defaultVisible: true,
    },
    {
      id: "status",
      header: t.colStatus,
      cell: (service) => (
        <Badge
          variant="outline"
          className={`cursor-pointer ${
            service.is_active
              ? "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
              : "border-zinc-200 bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
          }`}
          onClick={(e) => {
            e.stopPropagation();
            onToggleActive(service.id, service.is_active);
          }}
        >
          {service.is_active ? t.active : t.inactive}
        </Badge>
      ),
      getValue: (service) => (service.is_active ? 1 : 0),
    },
  ];

  const getRowActions = (service: Service): RowAction<Service>[] => [
    {
      label: t.edit,
      icon: Edit,
      onClick: (s) => onEditClick(s),
    },
    {
      label: t.moveUp,
      icon: ArrowUp,
      onClick: (s) => onReorder(s.id, "up"),
    },
    {
      label: t.moveDown,
      icon: ArrowDown,
      onClick: (s) => onReorder(s.id, "down"),
    },
    {
      label: t.delete,
      icon: Trash2,
      onClick: (s) => onDelete(s.id),
      variant: "destructive",
      separator: true,
    },
  ];

  return (
    <div className="mt-4 hidden md:block">
      <DataTable
        columns={columns}
        data={services}
        rowKey={(s) => s.id}
        getRowActions={getRowActions}
        onRowClick={onRowClick}
        storageKey="dashboard-services"
        emptyMessage=""
      />
    </div>
  );
}
