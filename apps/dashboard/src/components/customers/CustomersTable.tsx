"use client";

import { DataTable, type ColumnDef, type RowAction } from "@/components/shared/data-table";
import { Badge } from "@/components/ui/badge";
import { SetupBadge } from "@/components/setup-badge";
import { getCustomerIssues } from "@/lib/setup/health";
import { Edit, Trash2, ShieldCheck } from "lucide-react";
import type { Customer } from "@/lib/types";

interface CustomersTableProps {
  customers: Customer[];
  onDelete: (customerId: string) => void;
  onRowClick: (customer: Customer) => void;
  onEditClick: (customer: Customer) => void;
  translations: {
    colName: string;
    colContact: string;
    colNotes: string;
    colGdpr: string;
    colActions: string;
    delete: string;
    edit: string;
    consentOk: string;
    consentMissing: string;
    requestConsent: string;
    comingSoon: string;
  };
}

export function CustomersTable({
  customers,
  onDelete,
  onRowClick,
  onEditClick,
  translations,
}: CustomersTableProps) {
  const columns: ColumnDef<Customer>[] = [
    {
      id: "name",
      header: translations.colName,
      cell: (customer) => (
        <div className="font-medium text-sm">{customer.full_name}</div>
      ),
      getValue: (customer) => customer.full_name,
    },
    {
      id: "contact",
      header: translations.colContact,
      cell: (customer) => (
        <div className="text-sm text-muted-foreground">
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
        <div className="max-w-[200px] truncate text-sm text-muted-foreground">
          {customer.notes || "-"}
        </div>
      ),
      getValue: (customer) => customer.notes ?? "",
    },
    {
      id: "setup",
      header: "",
      cell: (customer) => {
        const issues = getCustomerIssues(customer);
        return <SetupBadge issues={issues} limit={1} />;
      },
      sortable: false,
    },
    {
      id: "gdpr",
      header: translations.colGdpr,
      cell: (customer) =>
        customer.gdpr_consent ? (
          <Badge
            variant="outline"
            className="border-emerald-200 bg-emerald-50 text-emerald-700"
          >
            {translations.consentOk}
          </Badge>
        ) : (
          <Badge
            variant="outline"
            className="border-yellow-300 bg-yellow-50 text-yellow-700"
          >
            {translations.consentMissing}
          </Badge>
        ),
      getValue: (customer) => (customer.gdpr_consent ? 1 : 0),
    },
  ];

  const getRowActions = (customer: Customer): RowAction<Customer>[] => [
    {
      label: translations.edit,
      icon: Edit,
      onClick: (c) => onEditClick(c),
    },
    {
      label: translations.requestConsent,
      icon: ShieldCheck,
      onClick: () => {
        alert(translations.comingSoon);
      },
    },
    {
      label: translations.delete,
      icon: Trash2,
      onClick: (c) => onDelete(c.id),
      variant: "destructive",
      separator: true,
    },
  ];

  return (
    <div className="mt-4 hidden md:block">
      <DataTable
        columns={columns}
        data={customers}
        rowKey={(c) => c.id}
        getRowActions={getRowActions}
        onRowClick={onRowClick}
        storageKey="dashboard-customers"
        emptyMessage="Ingen kunder funnet"
      />
    </div>
  );
}
