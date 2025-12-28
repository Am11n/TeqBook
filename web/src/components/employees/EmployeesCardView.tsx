"use client";

import { Button } from "@/components/ui/button";
import type { Employee, Service } from "@/lib/types";

interface EmployeesCardViewProps {
  employees: Employee[];
  employeeServicesMap: Record<string, Service[]>;
  onToggleActive: (employeeId: string, currentStatus: boolean) => void;
  onDelete: (employeeId: string) => void;
  translations: {
    active: string;
    inactive: string;
    delete: string;
  };
}

export function EmployeesCardView({
  employees,
  employeeServicesMap,
  onToggleActive,
  onDelete,
  translations,
}: EmployeesCardViewProps) {
  return (
    <div className="mt-4 space-y-3 md:hidden">
      {employees.map((employee) => (
        <div key={employee.id} className="rounded-lg border bg-card px-3 py-3 text-xs">
          <div className="flex items-start justify-between gap-2">
            <div>
              <div className="text-sm font-medium">{employee.full_name}</div>
              {employee.role && (
                <div className="text-[11px] text-muted-foreground">{employee.role}</div>
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
              onClick={() => onToggleActive(employee.id, employee.is_active)}
            >
              {employee.is_active ? translations.active : translations.inactive}
            </Button>
          </div>
          <div className="mt-2 space-y-1 text-[11px] text-muted-foreground">
            {employee.email && <div>{employee.email}</div>}
            {employee.phone && <div>{employee.phone}</div>}
            {employeeServicesMap[employee.id]?.length > 0 && (
              <div className="mt-1">
                <span className="font-medium">Tjenester: </span>
                {employeeServicesMap[employee.id].map((s) => s.name).join(", ")}
              </div>
            )}
          </div>
          <div className="mt-2 flex justify-end">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="text-red-600 hover:bg-red-50"
              onClick={() => onDelete(employee.id)}
            >
              {translations.delete}
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}

