"use client";

import { DataTable, type ColumnDef, type RowAction } from "@/components/shared/data-table";
import type { Customer } from "@/lib/types";
import { Eye, Trash2 } from "lucide-react";

interface CustomersTableProps {
  customers: Customer[];
  canViewHistory: boolean;
  onDelete: (customerId: string) => void;
  translations: {
    colName: string;
    colContact: string;
    colNotes: string;
    colGdpr: string;
    colActions: string;
    consentYes: string;
    consentNo: string;
    delete: string;
  };
}

export function CustomersTable({
  customers,
  canViewHistory,
  onDelete,
  translations,
}: CustomersTableProps) {
  const columns: ColumnDef<Customer>[] = [
    {
      id: "name",
      header: translations.colName,
      cell: (customer) => (
        <div className="font-medium">{customer.full_name}</div>
      ),
      getValue: (customer) => customer.full_name,
    },
    {
      id: "contact",
      header: translations.colContact,
      cell: (customer) => (
        <div className="text-xs text-muted-foreground">
          {customer.email && <div>{customer.email}</div>}
          {customer.phone && <div>{customer.phone}</div>}
          {!customer.email && !customer.phone && "-"}
        </div>
      ),
      getValue: (customer) => customer.email ?? customer.phone ?? "",
    },
    {
      id: "notes",
      header: translations.colNotes,
      cell: (customer) => (
        <div className="text-xs text-muted-foreground">{customer.notes || "-"}</div>
      ),
      sortable: false,
    },
    {
      id: "gdpr",
      header: translations.colGdpr,
      cell: (customer) => (
        <div className="text-xs text-muted-foreground">
          {customer.gdpr_consent ? translations.consentYes : translations.consentNo}
        </div>
      ),
      getValue: (customer) => (customer.gdpr_consent ? 1 : 0),
    },
  ];

  const getRowActions = (customer: Customer): RowAction<Customer>[] => {
    const actions: RowAction<Customer>[] = [];
    if (canViewHistory) {
      actions.push({
        label: "View History",
        icon: Eye,
        onClick: (c) => {
          window.location.href = `/customers/${c.id}/history`;
        },
      });
    }
    actions.push({
      label: translations.delete,
      icon: Trash2,
      onClick: (c) => onDelete(c.id),
      variant: "destructive",
      separator: true,
    });
    return actions;
  };

  return (
    <div className="mt-4 hidden md:block">
      <DataTable
        columns={columns}
        data={customers}
        rowKey={(c) => c.id}
        getRowActions={getRowActions}
        storageKey="dashboard-customers"
        emptyMessage="No customers available"
      />
    </div>
  );
}
