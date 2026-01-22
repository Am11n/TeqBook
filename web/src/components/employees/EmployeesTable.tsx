"use client";

import { TableWithViews, type ColumnDefinition } from "@/components/tables/TableWithViews";
import { Badge } from "@/components/ui/badge";
import type { Employee, Service } from "@/lib/types";

interface EmployeesTableProps {
  employees: Employee[];
  employeeServicesMap: Record<string, Service[]>;
  onToggleActive: (employeeId: string, currentStatus: boolean) => void;
  onDelete: (employeeId: string) => void;
  onEdit: (employee: Employee) => void;
  translations: {
    colName: string;
    colRole: string;
    colContact: string;
    colServices: string;
    colStatus: string;
    colActions: string;
    active: string;
    inactive: string;
    delete: string;
    edit: string;
  };
}

export function EmployeesTable({
  employees,
  employeeServicesMap,
  onToggleActive,
  onDelete,
  onEdit,
  translations,
}: EmployeesTableProps) {
  const columns: ColumnDefinition<Employee>[] = [
    {
      id: "name",
      label: translations.colName,
      render: (employee) => (
        <div className="font-medium">{employee.full_name}</div>
      ),
    },
    {
      id: "role",
      label: translations.colRole,
      render: (employee) => (
        <div className="text-xs text-muted-foreground">{employee.role || "-"}</div>
      ),
    },
    {
      id: "contact",
      label: translations.colContact,
      render: (employee) => (
        <div className="text-xs text-muted-foreground">
          {employee.email && <div>{employee.email}</div>}
          {employee.phone && <div>{employee.phone}</div>}
          {!employee.email && !employee.phone && "-"}
        </div>
      ),
    },
    {
      id: "services",
      label: translations.colServices,
      render: (employee) => (
        <div className="text-xs text-muted-foreground">
          {employeeServicesMap[employee.id]?.length > 0
            ? employeeServicesMap[employee.id].map((s) => s.name).join(", ")
            : "-"}
        </div>
      ),
    },
    {
      id: "status",
      label: translations.colStatus,
      render: (employee) => (
        <Badge
          variant="outline"
          className={
            employee.is_active
              ? "border-emerald-200 bg-emerald-50 text-emerald-700"
              : "border-zinc-200 bg-zinc-100 text-zinc-600"
          }
        >
          {employee.is_active ? translations.active : translations.inactive}
        </Badge>
      ),
    },
  ];

  return (
    <div className="mt-4 hidden md:block">
      <TableWithViews
        tableId="employees"
        columns={columns}
        data={employees}
        onEdit={onEdit}
        onDelete={(employee) => onDelete(employee.id)}
        renderDetails={(employee) => (
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-lg">{employee.full_name}</h3>
              <p className="text-sm text-muted-foreground mt-1">{employee.role || "No role"}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium">Email</p>
                <p className="text-sm text-muted-foreground">{employee.email || "-"}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Phone</p>
                <p className="text-sm text-muted-foreground">{employee.phone || "-"}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Status</p>
                <Badge
                  variant="outline"
                  className={
                    employee.is_active
                      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                      : "border-zinc-200 bg-zinc-100 text-zinc-600"
                  }
                >
                  {employee.is_active ? translations.active : translations.inactive}
                </Badge>
              </div>
              <div>
                <p className="text-sm font-medium">Services</p>
                <p className="text-sm text-muted-foreground">
                  {employeeServicesMap[employee.id]?.length > 0
                    ? employeeServicesMap[employee.id].map((s) => s.name).join(", ")
                    : "None"}
                </p>
              </div>
            </div>
          </div>
        )}
        emptyMessage="No employees available"
        actionsLabel={translations.colActions}
      />
    </div>
  );
}

