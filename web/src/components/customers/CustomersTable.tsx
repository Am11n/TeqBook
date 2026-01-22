"use client";

import { TableWithViews, type ColumnDefinition } from "@/components/tables/TableWithViews";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import type { Customer } from "@/lib/types";

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
  const columns: ColumnDefinition<Customer>[] = [
    {
      id: "name",
      label: translations.colName,
      render: (customer) => (
        <div className="font-medium">{customer.full_name}</div>
      ),
    },
    {
      id: "contact",
      label: translations.colContact,
      render: (customer) => (
        <div className="text-xs text-muted-foreground">
          {customer.email && <div>{customer.email}</div>}
          {customer.phone && <div>{customer.phone}</div>}
          {!customer.email && !customer.phone && "-"}
        </div>
      ),
    },
    {
      id: "notes",
      label: translations.colNotes,
      render: (customer) => (
        <div className="text-xs text-muted-foreground">{customer.notes || "-"}</div>
      ),
    },
    {
      id: "gdpr",
      label: translations.colGdpr,
      render: (customer) => (
        <div className="text-xs text-muted-foreground">
          {customer.gdpr_consent ? translations.consentYes : translations.consentNo}
        </div>
      ),
    },
  ];

  return (
    <div className="mt-4 hidden md:block">
      <TableWithViews
        tableId="customers"
        columns={columns}
        data={customers}
        onDelete={(customer) => onDelete(customer.id)}
        onViewDetails={(customer) => {
          if (canViewHistory) {
            window.location.href = `/customers/${customer.id}/history`;
          }
        }}
        renderDetails={(customer) => (
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-lg">{customer.full_name}</h3>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium">Email</p>
                <p className="text-sm text-muted-foreground">{customer.email || "-"}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Phone</p>
                <p className="text-sm text-muted-foreground">{customer.phone || "-"}</p>
              </div>
              <div>
                <p className="text-sm font-medium">GDPR Consent</p>
                <p className="text-sm text-muted-foreground">
                  {customer.gdpr_consent ? translations.consentYes : translations.consentNo}
                </p>
              </div>
              {customer.notes && (
                <div className="col-span-2">
                  <p className="text-sm font-medium">Notes</p>
                  <p className="text-sm text-muted-foreground">{customer.notes}</p>
                </div>
              )}
            </div>
          </div>
        )}
        emptyMessage="No customers available"
        actionsLabel={translations.colActions}
      />
    </div>
  );
}
