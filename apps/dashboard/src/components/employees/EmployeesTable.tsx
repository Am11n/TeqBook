"use client";

import { DataTable, type ColumnDef, type RowAction } from "@/components/shared/data-table";
import { Badge } from "@/components/ui/badge";
import { SetupBadge } from "@/components/setup-badge";
import { getEmployeeSetupIssues, isEmployeeBookable } from "@/lib/setup/health";
import { Check, X, Edit, Trash2 } from "lucide-react";
import type { Employee, Service, Shift } from "@/lib/types";

interface EmployeesTableProps {
  employees: Employee[];
  employeeServicesMap: Record<string, Service[]>;
  employeeShiftsMap: Record<string, Shift[]>;
  hasShiftsFeature?: boolean;
  onToggleActive: (employeeId: string, currentStatus: boolean) => void;
  onDelete: (employeeId: string) => void;
  onRowClick: (employee: Employee) => void;
  onEditClick: (employee: Employee) => void;
  translations: {
    colName: string;
    colRole: string;
    colContact: string;
    colServices: string;
    colStatus: string;
    colActions: string;
    colSetup: string;
    active: string;
    inactive: string;
    delete: string;
    edit: string;
    addContact: string;
    canBeBooked: string;
    notBookable: string;
  };
}

export function EmployeesTable({
  employees,
  employeeServicesMap,
  employeeShiftsMap,
  hasShiftsFeature,
  onToggleActive,
  onDelete,
  onRowClick,
  onEditClick,
  translations,
}: EmployeesTableProps) {
  const columns: ColumnDef<Employee>[] = [
    {
      id: "name",
      header: translations.colName,
      cell: (employee) => (
        <div className="font-medium text-sm">{employee.full_name}</div>
      ),
      getValue: (employee) => employee.full_name,
    },
    {
      id: "role",
      header: translations.colRole,
      cell: (employee) => (
        <div className="text-sm text-muted-foreground">
          {employee.role || "-"}
        </div>
      ),
      getValue: (employee) => employee.role ?? "",
    },
    {
      id: "contact",
      header: translations.colContact,
      cell: (employee) => (
        <div className="text-sm text-muted-foreground">
          {employee.email && <div>{employee.email}</div>}
          {employee.phone && <div>{employee.phone}</div>}
          {!employee.email && !employee.phone && (
            <span className="text-xs text-blue-600 hover:underline cursor-pointer">
              {translations.addContact}
            </span>
          )}
        </div>
      ),
      getValue: (employee) => employee.email ?? employee.phone ?? "",
    },
    {
      id: "services",
      header: translations.colServices,
      cell: (employee) => {
        const svcList = employeeServicesMap[employee.id];
        return (
          <div className="text-sm text-muted-foreground">
            {svcList?.length > 0
              ? svcList.map((s) => s.name).join(", ")
              : "-"}
          </div>
        );
      },
      getValue: (employee) => employeeServicesMap[employee.id]?.length ?? 0,
    },
    {
      id: "setup",
      header: translations.colSetup,
      cell: (employee) => {
        const issues = getEmployeeSetupIssues(employee, {
          services: employeeServicesMap[employee.id] ?? [],
          shifts: employeeShiftsMap[employee.id] ?? [],
          hasShiftsFeature,
        });
        return <SetupBadge issues={issues} limit={2} />;
      },
      sortable: false,
    },
    {
      id: "bookable",
      header: "",
      cell: (employee) => {
        const bookable = isEmployeeBookable(employee, {
          services: employeeServicesMap[employee.id] ?? [],
          shifts: employeeShiftsMap[employee.id] ?? [],
          hasShiftsFeature,
        });
        return bookable ? (
          <span title={translations.canBeBooked}>
            <Check className="h-4 w-4 text-emerald-500" />
          </span>
        ) : (
          <span title={translations.notBookable}>
            <X className="h-4 w-4 text-zinc-400" />
          </span>
        );
      },
      sortable: false,
      hideable: true,
      defaultVisible: true,
    },
    {
      id: "status",
      header: translations.colStatus,
      cell: (employee) => (
        <Badge
          variant="outline"
          className={`cursor-pointer ${
            employee.is_active
              ? "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
              : "border-zinc-200 bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
          }`}
          onClick={(e) => {
            e.stopPropagation();
            onToggleActive(employee.id, employee.is_active);
          }}
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
      onClick: (e) => onEditClick(e),
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
        onRowClick={onRowClick}
        storageKey="dashboard-employees"
        emptyMessage="Ingen ansatte funnet"
      />
    </div>
  );
}
