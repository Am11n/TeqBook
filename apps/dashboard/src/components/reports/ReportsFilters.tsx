"use client";

import { useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Filter, X } from "lucide-react";
import { Field } from "@/components/form/Field";
import { DialogSelect } from "@/components/ui/dialog-select";
import { hasActiveFilters, setDateRangeFilter } from "@/lib/utils/reports/reports-utils";
import type { ReportsFilters as ReportsFiltersType } from "@/lib/services/reports-service";
import type { Employee, Service } from "@/lib/types";
import { useLocale } from "@/components/locale-provider";
import { normalizeLocale } from "@/i18n/normalizeLocale";
import { translations } from "@/i18n/translations";
import { resolveNamespace } from "@/i18n/resolve-namespace";

interface ReportsFiltersProps {
  filters: ReportsFiltersType;
  setFilters: (filters: ReportsFiltersType) => void;
  showFilters: boolean;
  setShowFilters: (show: boolean) => void;
  employees: Employee[];
  services: Service[];
}

export function ReportsFilters({
  filters,
  setFilters,
  showFilters,
  setShowFilters,
  employees,
  services,
}: ReportsFiltersProps) {
  const { locale } = useLocale();
  const appLocale = normalizeLocale(locale);
  const t = useMemo(
    () => resolveNamespace("dashboard", translations[appLocale].dashboard),
    [appLocale],
  );
  const activeFilters = hasActiveFilters(filters);

  const clearFilters = () => {
    setFilters({});
  };

  const handleDateRange = (days: number) => {
    const { startDate, endDate } = setDateRangeFilter(days);
    setFilters({
      ...filters,
      startDate,
      endDate,
    });
  };

  return (
    <Card className="mt-6 p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <h3 className="text-sm font-semibold">{t.reportsFiltersTitle}</h3>
          {activeFilters && (
            <Button variant="ghost" size="sm" onClick={clearFilters} className="h-6 px-2 text-xs">
              <X className="h-3 w-3 mr-1" />
              {t.reportsFiltersClear}
            </Button>
          )}
        </div>
        <Button variant="outline" size="sm" onClick={() => setShowFilters(!showFilters)}>
          {showFilters ? t.reportsFiltersHide : t.reportsFiltersShow}{" "}
          {t.reportsFiltersTitle}
        </Button>
      </div>

      {showFilters && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-6">
          {/* Quick date ranges */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground">{t.reportsQuickRange}</label>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" onClick={() => handleDateRange(7)} className="text-xs">
                7d
              </Button>
              <Button variant="outline" size="sm" onClick={() => handleDateRange(30)} className="text-xs">
                30d
              </Button>
              <Button variant="outline" size="sm" onClick={() => handleDateRange(90)} className="text-xs">
                90d
              </Button>
            </div>
          </div>

          {/* Start Date */}
          <Field label={t.reportsStartDate} htmlFor="startDate">
            <input
              id="startDate"
              type="date"
              value={filters.startDate ? new Date(filters.startDate).toISOString().split("T")[0] : ""}
              onChange={(e) =>
                setFilters({
                  ...filters,
                  startDate: e.target.value ? new Date(e.target.value).toISOString() : null,
                })
              }
              className="w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm"
            />
          </Field>

          {/* End Date */}
          <Field label={t.reportsEndDate} htmlFor="endDate">
            <input
              id="endDate"
              type="date"
              value={filters.endDate ? new Date(filters.endDate).toISOString().split("T")[0] : ""}
              onChange={(e) =>
                setFilters({
                  ...filters,
                  endDate: e.target.value ? new Date(e.target.value).toISOString() : null,
                })
              }
              className="w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm"
            />
          </Field>

          {/* Status */}
          <Field label={t.reportsStatus} htmlFor="status">
            <DialogSelect
              value={filters.status || ""}
              onChange={(v) => setFilters({ ...filters, status: v || null })}
              placeholder={t.reportsAll}
              options={[
                { value: "", label: t.reportsAll },
                { value: "pending", label: t.reportsPending },
                { value: "confirmed", label: t.reportsConfirmed },
                { value: "completed", label: t.reportsCompleted },
                { value: "cancelled", label: t.reportsCancelled },
                { value: "no-show", label: t.reportsNoShow },
              ]}
            />
          </Field>

          {/* Service */}
          <Field label={t.reportsService} htmlFor="service">
            <DialogSelect
              value={filters.serviceId || ""}
              onChange={(v) => setFilters({ ...filters, serviceId: v || null })}
              placeholder={t.reportsAllServices}
              options={[
                { value: "", label: t.reportsAllServices },
                ...services.map((service) => ({ value: service.id, label: service.name })),
              ]}
            />
          </Field>

          {/* Employee */}
          <Field label={t.reportsEmployee} htmlFor="employee">
            <DialogSelect
              value={filters.employeeId || ""}
              onChange={(v) => setFilters({ ...filters, employeeId: v || null })}
              placeholder={t.reportsAllEmployees}
              options={[
                { value: "", label: t.reportsAllEmployees },
                ...employees.map((employee) => ({ value: employee.id, label: employee.full_name })),
              ]}
            />
          </Field>
        </div>
      )}
    </Card>
  );
}

