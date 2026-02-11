"use client";

import { DataTable, type ColumnDef, type RowAction } from "@/components/shared/data-table";
import { Badge } from "@/components/ui/badge";
import type { Employee, Service } from "@/lib/types";
import { Edit, Trash2 } from "lucide-react";

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
  const columns: ColumnDef<Employee>[] = [
    {
      id: "name",
      header: translations.colName,
      cell: (employee) => (
        <div className="font-medium">{employee.full_name}</div>
      ),
      getValue: (employee) => employee.full_name,
    },
    {
      id: "role",
      header: translations.colRole,
      cell: (employee) => (
        <div className="text-xs text-muted-foreground">{employee.role || "-"}</div>
      ),
      getValue: (employee) => employee.role ?? "",
    },
    {
      id: "contact",
      header: translations.colContact,
      cell: (employee) => (
        <div className="text-xs text-muted-foreground">
          {employee.email && <div>{employee.email}</div>}
          {employee.phone && <div>{employee.phone}</div>}
          {!employee.email && !employee.phone && "-"}
        </div>
      ),
      getValue: (employee) => employee.email ?? employee.phone ?? "",
    },
    {
      id: "services",
      header: translations.colServices,
      cell: (employee) => (
        <div className="text-xs text-muted-foreground">
          {employeeServicesMap[employee.id]?.length > 0
            ? employeeServicesMap[employee.id].map((s) => s.name).join(", ")
            : "-"}
        </div>
      ),
      getValue: (employee) => employeeServicesMap[employee.id]?.length ?? 0,
    },
    {
      id: "status",
      header: translations.colStatus,
      cell: (employee) => (
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
      getValue: (employee) => (employee.is_active ? 1 : 0),
    },
  ];

  const getRowActions = (employee: Employee): RowAction<Employee>[] => [
    {
      label: translations.edit,
      icon: Edit,
      onClick: (e) => onEdit(e),
    },
    {
      label: translations.delete,
      icon: Trash2,
      onClick: (e) => onDelete(e.id),
      variant: "destructive",
      separator: true,
    },
  ];

  return (
    <div className="mt-4 hidden md:block">
      <DataTable
        columns={columns}
        data={employees}
        rowKey={(e) => e.id}
        getRowActions={getRowActions}
        storageKey="dashboard-employees"
        emptyMessage="No employees available"
      />
    </div>
  );
}
