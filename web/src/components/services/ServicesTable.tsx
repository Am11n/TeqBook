"use client";

import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatPrice, getCategoryLabel } from "@/lib/utils/services/services-utils";
import type { Service } from "@/lib/types";

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
  return (
    <div className="mt-4 hidden overflow-x-auto md:block">
      <Table className="text-sm">
        <TableHeader>
          <TableRow>
            <TableHead className="pr-4">{translations.colName}</TableHead>
            <TableHead className="pr-4">{translations.colCategory}</TableHead>
            <TableHead className="pr-4">{translations.colDuration}</TableHead>
            <TableHead className="pr-4">{translations.colPrice}</TableHead>
            <TableHead className="pr-4">{translations.colStatus}</TableHead>
            <TableHead className="text-right">{translations.colActions}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {services.map((service) => (
            <TableRow key={service.id}>
              <TableCell className="pr-4">
                <div className="font-medium">{service.name}</div>
              </TableCell>
              <TableCell className="pr-4 text-xs text-muted-foreground">
                {getCategoryLabel(service.category, translations)}
              </TableCell>
              <TableCell className="pr-4 text-xs text-muted-foreground">
                {service.duration_minutes} min
              </TableCell>
              <TableCell className="pr-4 text-xs text-muted-foreground">
                {formatPrice(service.price_cents, locale)}
              </TableCell>
              <TableCell className="pr-4 text-xs">
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
              </TableCell>
              <TableCell className="text-right text-xs">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="text-red-600 hover:bg-red-50"
                  onClick={() => onDelete(service.id)}
                >
                  {translations.delete}
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

