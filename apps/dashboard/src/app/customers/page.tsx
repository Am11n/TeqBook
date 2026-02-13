"use client";

import { useState } from "react";
import { PageLayout } from "@/components/layout/page-layout";
import { EmptyState } from "@/components/empty-state";
import { TableToolbar } from "@/components/table-toolbar";
import { StatsBar } from "@/components/stats-bar";
import { FilterChips } from "@/components/filter-chips";
import { Button } from "@/components/ui/button";
import { ErrorBoundary } from "@/components/error-boundary";
import { ErrorMessage } from "@/components/feedback/error-message";
import { useLocale } from "@/components/locale-provider";
import { translations } from "@/i18n/translations";
import { normalizeLocale } from "@/i18n/normalizeLocale";
import { useCustomers } from "@/lib/hooks/customers/useCustomers";
import { useEntityDialogState } from "@/lib/hooks/useEntityDialogState";
import { CreateCustomerDialog } from "@/components/customers/CreateCustomerDialog";
import { CustomersTable } from "@/components/customers/CustomersTable";
import { CustomerDetailDialog } from "@/components/customers/CustomerDetailDialog";
import { ImportCustomersDialog } from "@/components/customers/ImportCustomersDialog";
import { Users, ShieldCheck, ShieldX, PhoneOff } from "lucide-react";
import type { Customer } from "@/lib/types";

export default function CustomersPage() {
  const { locale } = useLocale();
  const appLocale = normalizeLocale(locale);
  const t = translations[appLocale].customers;
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);

  const detailDialog = useEntityDialogState<Customer>();

  const {
    customers,
    filteredCustomers,
    loading,
    error,
    setError,
    loadCustomers,
    handleDelete,
    importCustomers,
    stats,
    searchQuery,
    setSearchQuery,
    activeFilters,
    setActiveFilters,
  } = useCustomers({
    translations: { noSalon: t.noSalon, loadError: t.loadError },
  });

  const filterChips = [
    {
      id: "with_consent",
      label: t.filterWithConsent ?? "With consent",
      count: stats.withConsent,
    },
    {
      id: "without_consent",
      label: t.filterWithoutConsent ?? "Without consent",
      count: stats.withoutConsent,
    },
    {
      id: "with_contact",
      label: t.filterWithContact ?? "With contact",
    },
    {
      id: "without_contact",
      label: t.filterWithoutContact ?? "Without contact",
      count: stats.withoutContact,
    },
  ];

  return (
    <ErrorBoundary>
      <PageLayout
        title={t.title}
        description={t.description}
        actions={
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsImportOpen(true)}
            >
              {t.importCustomers ?? "Import"}
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={() => setIsDialogOpen(true)}
            >
              {t.addButton}
            </Button>
          </div>
        }
        showCard={false}
      >
        {error && (
          <ErrorMessage
            message={error}
            onDismiss={() => setError(null)}
            variant="destructive"
            className="mb-4"
          />
        )}

        {/* KPI Header */}
        {!loading && customers.length > 0 && (
          <StatsBar
            className="mb-4"
            items={[
              {
                label: t.statsTotal ?? "Total",
                value: stats.total,
                icon: <Users className="h-4 w-4" />,
              },
              {
                label: t.statsWithConsent ?? "With consent",
                value: stats.withConsent,
                variant: "success",
                icon: <ShieldCheck className="h-4 w-4" />,
              },
              {
                label: t.statsWithoutConsent ?? "Without consent",
                value: stats.withoutConsent,
                variant: stats.withoutConsent > 0 ? "warning" : "default",
                icon: <ShieldX className="h-4 w-4" />,
              },
              {
                label: t.statsWithoutContact ?? "Without contact",
                value: stats.withoutContact,
                variant: stats.withoutContact > 0 ? "danger" : "default",
                icon: <PhoneOff className="h-4 w-4" />,
              },
            ]}
          />
        )}

        {/* Table Card */}
        <div className="rounded-xl border bg-card p-4 shadow-sm">
          <TableToolbar
            title={t.tableTitle}
            searchValue={searchQuery}
            onSearchChange={setSearchQuery}
            searchPlaceholder={t.searchPlaceholder ?? "Search customers..."}
            filters={
              <FilterChips
                chips={filterChips}
                value={activeFilters}
                onChange={setActiveFilters}
              />
            }
          />
          {loading ? (
            <p className="mt-4 text-sm text-muted-foreground">{t.loading}</p>
          ) : customers.length === 0 ? (
            <div className="mt-4">
              <EmptyState
                title={t.emptyTitle}
                description={t.emptyDescription}
                primaryAction={
                  <Button size="sm" onClick={() => setIsDialogOpen(true)}>
                    {t.addButton}
                  </Button>
                }
                secondaryAction={
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setIsImportOpen(true)}
                  >
                    {t.importCustomers ?? "Import from CSV"}
                  </Button>
                }
              />
            </div>
          ) : (
            <>
              {/* Mobile cards */}
              <div className="mt-4 space-y-3 md:hidden">
                {filteredCustomers.map((customer) => (
                  <div
                    key={customer.id}
                    className="rounded-lg border bg-card px-3 py-3 text-xs cursor-pointer hover:bg-accent/50 transition-colors"
                    onClick={() => detailDialog.onRowClick(customer)}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-sm font-medium">
                          {customer.full_name}
                        </span>
                        {customer.email && (
                          <div className="text-[11px] text-muted-foreground">
                            {customer.email}
                          </div>
                        )}
                        {customer.phone && (
                          <div className="text-[11px] text-muted-foreground">
                            {customer.phone}
                          </div>
                        )}
                      </div>
                      {customer.gdpr_consent ? (
                        <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-700">
                          {t.consentOk ?? "Consent: OK"}
                        </span>
                      ) : (
                        <span className="rounded-full bg-yellow-50 px-2 py-0.5 text-[10px] font-medium text-yellow-700">
                          {t.consentMissing ?? "Missing"}
                        </span>
                      )}
                    </div>
                    {customer.notes && (
                      <div className="mt-1 truncate text-[11px] text-muted-foreground">
                        {customer.notes}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Desktop table */}
              <CustomersTable
                customers={filteredCustomers}
                onDelete={handleDelete}
                onRowClick={detailDialog.onRowClick}
                onEditClick={(c) => detailDialog.openEdit(c.id)}
                translations={{
                  colName: t.colName,
                  colContact: t.colContact,
                  colNotes: t.colNotes,
                  colGdpr: t.colGdpr,
                  colActions: t.colActions,
                  delete: t.delete,
                  edit: t.edit ?? "Edit",
                  consentOk: t.consentOk ?? "Consent: OK",
                  consentMissing: t.consentMissing ?? "Consent: Missing",
                  requestConsent: t.requestConsent ?? "Request consent",
                  comingSoon: t.comingSoon ?? "Feature coming soon",
                }}
              />
            </>
          )}
        </div>

        {/* Create Customer Dialog */}
        <CreateCustomerDialog
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          onCustomerCreated={loadCustomers}
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

        {/* Customer Detail Dialog */}
        <CustomerDetailDialog
          customerId={detailDialog.selectedId}
          open={detailDialog.open}
          onOpenChange={(o) => {
            if (!o) detailDialog.close();
          }}
          mode={detailDialog.mode}
          onSwitchToEdit={detailDialog.switchToEdit}
          onSwitchToView={detailDialog.switchToView}
          customers={customers}
          onCustomerUpdated={loadCustomers}
          translations={{
            editTitle: t.detailTitle ?? "Edit customer",
            detailDescription: t.detailDescription ?? "Overview of customer, contact info and consent.",
            editDescription: t.editDescription ?? "Update customer information.",
            emailLabel: t.emailLabel,
            phoneLabel: t.phoneLabel,
            nameLabel: t.nameLabel,
            notesLabel: t.notesLabel,
            noNotes: t.noNotes ?? "No notes",
            gdprConsentLabel: t.gdprConsentLabel ?? "GDPR consent",
            consentOk: t.consentOk ?? "Consent: OK",
            consentMissing: t.consentMissing ?? "Consent: Missing",
            bookingHistory: t.bookingHistory ?? "Booking history",
            noBookings: t.noBookings ?? "No bookings yet",
            sendMessageCopyPhone: t.sendMessageCopyPhone ?? "Send message (copy phone)",
            copied: t.copied ?? "Copied!",
            close: t.close ?? "Close",
            edit: t.edit ?? "Edit",
            cancel: t.cancel,
            save: t.save ?? "Save",
            saving: t.saving,
            gdprLabel: t.gdprLabel,
          }}
        />

        {/* Import Dialog */}
        <ImportCustomersDialog
          open={isImportOpen}
          onOpenChange={setIsImportOpen}
          onImport={importCustomers}
        />
      </PageLayout>
    </ErrorBoundary>
  );
}
