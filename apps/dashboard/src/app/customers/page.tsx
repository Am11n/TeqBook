"use client";

import { useEffect, useState } from "react";
import { PageLayout } from "@/components/layout/page-layout";
import { EmptyState } from "@/components/empty-state";
import { TableToolbar } from "@/components/table-toolbar";
import { Button } from "@/components/ui/button";
import { useLocale } from "@/components/locale-provider";
import { translations } from "@/i18n/translations";
import { normalizeLocale } from "@/i18n/normalizeLocale";
import { useCurrentSalon } from "@/components/salon-provider";
import {
  getCustomersForCurrentSalon,
  deleteCustomer,
} from "@/lib/repositories/customers";
import { ErrorBoundary } from "@/components/error-boundary";
import { ErrorMessage } from "@/components/feedback/error-message";
import type { Customer } from "@/lib/types";
import { useFeatures } from "@/lib/hooks/use-features";
import Link from "next/link";
import { CustomersTable } from "@/components/customers/CustomersTable";
import { CreateCustomerDialog } from "@/components/customers/CreateCustomerDialog";

export default function CustomersPage() {
  const { locale } = useLocale();
  const appLocale = normalizeLocale(locale);
  const t = translations[appLocale].customers;
  const { salon, loading: salonLoading, error: salonError, isReady } = useCurrentSalon();
  const { hasFeature } = useFeatures();
  const canViewHistory = hasFeature("CUSTOMER_HISTORY");
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    if (!isReady) {
      if (salonError) {
        setError(salonError);
      } else if (salonLoading) {
        setLoading(true);
      } else {
        setError(t.noSalon);
        setLoading(false);
      }
      return;
    }

    async function loadCustomers() {
      setLoading(true);
      setError(null);

      if (!salon?.id) {
        setError(t.noSalon);
        setLoading(false);
        return;
      }

      const { data: customersData, error: customersError } = await getCustomersForCurrentSalon(salon.id);

      if (customersError) {
        setError(customersError);
        setLoading(false);
        return;
      }

      setCustomers(customersData ?? []);
      setLoading(false);
    }

    loadCustomers();
  }, [isReady, salon?.id, salonLoading, salonError, t.noSalon]);

  const handleCustomerCreated = (customer: Customer) => {
    setCustomers((prev) => [customer, ...prev]);
  };

  async function handleDelete(id: string) {
    if (!salon?.id) return;

    const { error: deleteError } = await deleteCustomer(salon.id, id);

    if (deleteError) {
      setError(deleteError);
      return;
    }

    setCustomers((prev) => prev.filter((c) => c.id !== id));
  }

  return (
    <ErrorBoundary>
      <PageLayout
        title={t.title}
        description={t.description}
        actions={
          <Button
            type="button"
            size="sm"
            onClick={() => setIsDialogOpen(true)}
          >
            {t.addButton}
          </Button>
        }
      >
        {error && (
          <ErrorMessage
            message={error}
            onDismiss={() => setError(null)}
            variant="destructive"
            className="mb-4"
          />
        )}

        <div className="rounded-xl border bg-card p-4 shadow-sm">
          <TableToolbar title={t.tableTitle} />
          {loading ? (
            <p className="mt-4 text-sm text-muted-foreground">
              {t.loading}
            </p>
          ) : customers.length === 0 ? (
            <div className="mt-4">
              <EmptyState
                title={t.emptyTitle}
                description={t.emptyDescription}
              />
            </div>
          ) : (
            <>
              {/* Mobil: kortvisning */}
              <div className="mt-4 space-y-3 md:hidden">
                {customers.map((customer) => (
                  <div
                    key={customer.id}
                    className="rounded-lg border bg-card px-3 py-3 text-xs"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="text-sm font-medium">
                          {customer.full_name}
                        </div>
                        <div className="mt-1 space-y-0.5 text-[11px] text-muted-foreground">
                          {customer.email && <div>{customer.email}</div>}
                          {customer.phone && <div>{customer.phone}</div>}
                        </div>
                      </div>
                    </div>
                    {customer.notes && (
                      <p className="mt-2 text-[11px] text-muted-foreground">
                        {customer.notes}
                      </p>
                    )}
                    <div className="mt-2 flex items-center justify-between text-[11px] text-muted-foreground">
                      <span>
                        {customer.gdpr_consent
                          ? t.mobileConsentYes
                          : t.mobileConsentNo}
                      </span>
                      <div className="flex gap-2">
                        {canViewHistory && (
                          <Link href={`/customers/${customer.id}/history`}>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                            >
                              History
                            </Button>
                          </Link>
                        )}
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="text-red-600 hover:bg-red-50"
                          onClick={() => handleDelete(customer.id)}
                        >
                          {t.delete}
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Desktop: tabellvisning */}
              <CustomersTable
                customers={customers}
                canViewHistory={canViewHistory}
                onDelete={handleDelete}
                translations={{
                  colName: t.colName,
                  colContact: t.colContact,
                  colNotes: t.colNotes,
                  colGdpr: t.colGdpr,
                  colActions: t.colActions,
                  consentYes: t.consentYes,
                  consentNo: t.consentNo,
                  delete: t.delete,
                }}
              />
            </>
          )}
        </div>

        {/* Create Customer Dialog */}
        <CreateCustomerDialog
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          onCustomerCreated={handleCustomerCreated}
          translations={{
            dialogTitle: t.dialogTitle,
            dialogDescription: t.dialogDescription,
            nameLabel: t.nameLabel,
            namePlaceholder: t.namePlaceholder,
            emailLabel: t.emailLabel,
            emailPlaceholder: t.emailPlaceholder,
            phoneLabel: t.phoneLabel,
            phonePlaceholder: t.phonePlaceholder,
            notesLabel: t.notesLabel,
            notesPlaceholder: t.notesPlaceholder,
            gdprLabel: t.gdprLabel,
            cancel: t.cancel,
            addButton: t.addButton,
            saving: t.saving,
          }}
        />
      </PageLayout>
    </ErrorBoundary>
  );
}
