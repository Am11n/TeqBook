"use client";

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
  const t = translations[appLocale].dashboard;
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
          <h3 className="text-sm font-semibold">{t.reportsFiltersTitle ?? "Filters"}</h3>
          {activeFilters && (
            <Button variant="ghost" size="sm" onClick={clearFilters} className="h-6 px-2 text-xs">
              <X className="h-3 w-3 mr-1" />
              {t.reportsFiltersClear ?? "Clear"}
            </Button>
          )}
        </div>
        <Button variant="outline" size="sm" onClick={() => setShowFilters(!showFilters)}>
          {showFilters ? t.reportsFiltersHide ?? "Hide" : t.reportsFiltersShow ?? "Show"}{" "}
          {t.reportsFiltersTitle ?? "Filters"}
        </Button>
      </div>

      {showFilters && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-6">
          {/* Quick date ranges */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground">{t.reportsQuickRange ?? "Quick Range"}</label>
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
          <Field label={t.reportsStartDate ?? "Start Date"} htmlFor="startDate">
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
          <Field label={t.reportsEndDate ?? "End Date"} htmlFor="endDate">
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
          <Field label={t.reportsStatus ?? "Status"} htmlFor="status">
            <DialogSelect
              value={filters.status || ""}
              onChange={(v) => setFilters({ ...filters, status: v || null })}
              placeholder={t.reportsAll ?? "All"}
              options={[
                { value: "", label: t.reportsAll ?? "All" },
                { value: "pending", label: t.reportsPending ?? "Pending" },
                { value: "confirmed", label: t.reportsConfirmed ?? "Confirmed" },
                { value: "completed", label: t.reportsCompleted ?? "Completed" },
                { value: "cancelled", label: t.reportsCancelled ?? "Cancelled" },
                { value: "no-show", label: t.reportsNoShow ?? "No Show" },
              ]}
            />
          </Field>

          {/* Service */}
          <Field label={t.reportsService ?? "Service"} htmlFor="service">
            <DialogSelect
              value={filters.serviceId || ""}
              onChange={(v) => setFilters({ ...filters, serviceId: v || null })}
              placeholder={t.reportsAllServices ?? "All Services"}
              options={[
                { value: "", label: t.reportsAllServices ?? "All Services" },
                ...services.map((service) => ({ value: service.id, label: service.name })),
              ]}
            />
          </Field>

          {/* Employee */}
          <Field label={t.reportsEmployee ?? "Employee"} htmlFor="employee">
            <DialogSelect
              value={filters.employeeId || ""}
              onChange={(v) => setFilters({ ...filters, employeeId: v || null })}
              placeholder={t.reportsAllEmployees ?? "All Employees"}
              options={[
                { value: "", label: t.reportsAllEmployees ?? "All Employees" },
                ...employees.map((employee) => ({ value: employee.id, label: employee.full_name })),
              ]}
            />
          </Field>
        </div>
      )}
    </Card>
  );
}

