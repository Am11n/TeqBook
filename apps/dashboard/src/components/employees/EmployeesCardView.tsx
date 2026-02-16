"use client";

import { Button } from "@/components/ui/button";
import { SetupBadge } from "@/components/setup-badge";
import { getEmployeeSetupIssues, isEmployeeBookable } from "@/lib/setup/health";
import { Check, X } from "lucide-react";
import type { Employee, Service, Shift } from "@/lib/types";

interface EmployeesCardViewProps {
  employees: Employee[];
  employeeServicesMap: Record<string, Service[]>;
  employeeShiftsMap: Record<string, Shift[]>;
  hasShiftsFeature?: boolean;
  onToggleActive: (employeeId: string, currentStatus: boolean) => void;
  onDelete: (employeeId: string) => void;
  onRowClick: (employee: Employee) => void;
  translations: {
    active: string;
    inactive: string;
    delete: string;
    edit: string;
  };
}

export function EmployeesCardView({
  employees,
  employeeServicesMap,
  employeeShiftsMap,
  hasShiftsFeature,
  onToggleActive,
  onDelete,
  onRowClick,
  translations,
}: EmployeesCardViewProps) {
  return (
    <div className="mt-4 space-y-3 md:hidden">
      {employees.map((employee) => {
        const issues = getEmployeeSetupIssues(employee, {
          services: employeeServicesMap[employee.id] ?? [],
          shifts: employeeShiftsMap[employee.id] ?? [],
          hasShiftsFeature,
        });
        const bookable = isEmployeeBookable(employee, {
          services: employeeServicesMap[employee.id] ?? [],
          shifts: employeeShiftsMap[employee.id] ?? [],
          hasShiftsFeature,
        });

        return (
          <div
            key={employee.id}
            className="rounded-lg border bg-card px-3 py-3 text-xs cursor-pointer hover:bg-accent/50 transition-colors"
            onClick={() => onRowClick(employee)}
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-medium">
                    {employee.full_name}
                  </span>
                  {bookable ? (
                    <Check className="h-3.5 w-3.5 text-emerald-500" />
                  ) : (
                    <X className="h-3.5 w-3.5 text-zinc-400" />
                  )}
                </div>
                {employee.role && (
                  <div className="text-[11px] text-muted-foreground">
                    {employee.role}
                  </div>
                )}
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className={
                  employee.is_active
                    ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                    : "border-zinc-200 bg-zinc-100 text-zinc-600"
                }
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleActive(employee.id, employee.is_active);
                }}
              >
                {employee.is_active ? translations.active : translations.inactive}
              </Button>
            </div>
            <div className="mt-2 space-y-1 text-[11px] text-muted-foreground">
              {employee.email && <div>{employee.email}</div>}
              {employee.phone && <div>{employee.phone}</div>}
              {employeeServicesMap[employee.id]?.length > 0 && (
                <div className="mt-1">
                  {employeeServicesMap[employee.id]
                    .map((s) => s.name)
                    .join(", ")}
                </div>
              )}
            </div>
            <SetupBadge issues={issues} limit={2} className="mt-2" />
            <div className="mt-2 flex justify-end gap-1">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onRowClick(employee);
                }}
              >
                {translations.edit}
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="text-red-600 hover:bg-red-50"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(employee.id);
                }}
              >
                {translations.delete}
              </Button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
