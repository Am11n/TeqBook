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
  return (
    <div className="mt-4 hidden overflow-x-auto md:block">
      <Table className="text-sm">
        <TableHeader>
          <TableRow>
            <TableHead className="pr-4">{translations.colName}</TableHead>
            <TableHead className="pr-4">{translations.colRole}</TableHead>
            <TableHead className="pr-4">{translations.colContact}</TableHead>
            <TableHead className="pr-4">{translations.colServices}</TableHead>
            <TableHead className="pr-4">{translations.colStatus}</TableHead>
            <TableHead className="text-right">{translations.colActions}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {employees.map((employee) => (
            <TableRow key={employee.id}>
              <TableCell className="pr-4">
                <div className="font-medium">{employee.full_name}</div>
              </TableCell>
              <TableCell className="pr-4 text-xs text-muted-foreground">
                {employee.role || "-"}
              </TableCell>
              <TableCell className="pr-4 text-xs text-muted-foreground">
                {employee.email && <div>{employee.email}</div>}
                {employee.phone && <div>{employee.phone}</div>}
                {!employee.email && !employee.phone && "-"}
              </TableCell>
              <TableCell className="pr-4 text-xs text-muted-foreground">
                {employeeServicesMap[employee.id]?.length > 0
                  ? employeeServicesMap[employee.id].map((s) => s.name).join(", ")
                  : "-"}
              </TableCell>
              <TableCell className="pr-4 text-xs">
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
              </TableCell>
              <TableCell className="text-right text-xs">
                <div className="flex items-center justify-end gap-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => onEdit(employee)}
                  >
                    {translations.edit}
                  </Button>
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
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

