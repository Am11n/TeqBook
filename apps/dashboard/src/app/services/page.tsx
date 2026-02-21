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
import { useCurrentSalon } from "@/components/salon-provider";
import { translations } from "@/i18n/translations";
import { normalizeLocale } from "@/i18n/normalizeLocale";
import { useServices } from "@/lib/hooks/services/useServices";
import { useEntityDialogState } from "@/lib/hooks/useEntityDialogState";
import { CreateServiceDialog } from "@/components/services/CreateServiceDialog";
import { ServicesTable } from "@/components/services/ServicesTable";
import { ServicesCardView } from "@/components/services/ServicesCardView";
import { ServiceDetailDialog } from "@/components/services/ServiceDetailDialog";
import { ServiceTemplatesDialog } from "@/components/services/ServiceTemplatesDialog";
import { BulkPriceDialog } from "@/components/services/BulkPriceDialog";
import { Package, PackageCheck, Layers, UserX } from "lucide-react";
import type { Service } from "@/lib/types";
import {
  buildCardViewTranslations,
  buildTableTranslations,
  buildCreateDialogTranslations,
  buildDetailDialogTranslations,
} from "./_helpers/translations";

export default function ServicesPage() {
  const { locale } = useLocale();
  const { salon } = useCurrentSalon();
  const appLocale = normalizeLocale(locale);
  const salonCurrency = salon?.currency ?? "NOK";
  const t = translations[appLocale].services;
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isTemplateOpen, setIsTemplateOpen] = useState(false);
  const [isBulkPriceOpen, setIsBulkPriceOpen] = useState(false);
  const [bulkSelectedIds, setBulkSelectedIds] = useState<string[]>([]);

  const detailDialog = useEntityDialogState<Service>();

  const {
    services,
    filteredServices,
    serviceEmployeeCountMap,
    loading,
    error,
    setError,
    reloadServices,
    handleToggleActive,
    handleDelete,
    handleReorder,
    bulkUpdatePrices,
    stats,
    categoryCounts,
    searchQuery,
    setSearchQuery,
    activeFilters,
    setActiveFilters,
  } = useServices({ translations: { noSalon: t.noSalon } });

  // Build category filter chips
  const categoryChips = Object.entries(categoryCounts).map(([cat, count]) => ({
    id: cat,
    label: cat.charAt(0).toUpperCase() + cat.slice(1),
    count,
  }));

  const filterChips = [
    { id: "active", label: t.filterActive ?? "Active", count: stats.active },
    {
      id: "inactive",
      label: t.filterInactive ?? "Inactive",
      count: stats.total - stats.active,
    },
    ...categoryChips,
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
              onClick={() => setIsTemplateOpen(true)}
            >
              {t.addFromTemplate ?? "From template"}
            </Button>
            {services.length > 0 && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  setBulkSelectedIds([]);
                  setIsBulkPriceOpen(true);
                }}
              >
                {t.bulkAdjustPrice ?? "Adjust prices"}
              </Button>
            )}
            <Button
              type="button"
              size="sm"
              onClick={() => setIsDialogOpen(true)}
            >
              {t.newService}
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
        {!loading && services.length > 0 && (
          <StatsBar
            className="mb-4"
            items={[
              {
                label: t.statsTotal ?? "Total",
                value: stats.total,
                icon: <Package className="h-4 w-4" />,
              },
              {
                label: t.statsActive ?? "Active",
                value: stats.active,
                variant: "success",
                icon: <PackageCheck className="h-4 w-4" />,
              },
              {
                label: t.statsCategories ?? "Categories",
                value: stats.categories,
                icon: <Layers className="h-4 w-4" />,
              },
              {
                label: t.statsWithoutEmployees ?? "Without staff",
                value: stats.withoutEmployees,
                variant: stats.withoutEmployees > 0 ? "warning" : "default",
                icon: <UserX className="h-4 w-4" />,
              },
            ]}
          />
        )}

        {/* Table Card */}
        <div className="rounded-xl border bg-card p-4 shadow-sm">
          {/* Mobile toolbar */}
          <div className="md:hidden">
            <TableToolbar
              searchValue={searchQuery}
              onSearchChange={setSearchQuery}
              searchPlaceholder={t.searchPlaceholder ?? "Search services..."}
              filters={
                <FilterChips
                  chips={filterChips}
                  value={activeFilters}
                  onChange={setActiveFilters}
                />
              }
            />
          </div>
          {loading ? (
            <p className="mt-4 text-sm text-muted-foreground">{t.loading}</p>
          ) : services.length === 0 ? (
            <div className="mt-4">
              <EmptyState
                title={t.emptyTitle}
                description={t.emptyDescription}
                primaryAction={
                  <Button size="sm" onClick={() => setIsDialogOpen(true)}>
                    {t.newService}
                  </Button>
                }
                secondaryAction={
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setIsTemplateOpen(true)}
                  >
                    {t.addFromTemplate ?? "From template"}
                  </Button>
                }
              />
            </div>
          ) : (
            <>
              <ServicesCardView
                services={filteredServices}
                serviceEmployeeCountMap={serviceEmployeeCountMap}
                onToggleActive={handleToggleActive}
                onDelete={handleDelete}
                onRowClick={detailDialog.onRowClick}
                currency={salonCurrency}
                translations={buildCardViewTranslations(t, appLocale)}
              />
              <ServicesTable
                services={filteredServices}
                serviceEmployeeCountMap={serviceEmployeeCountMap}
                onToggleActive={handleToggleActive}
                onDelete={handleDelete}
                onRowClick={detailDialog.onRowClick}
                onEditClick={(svc) => detailDialog.openEdit(svc.id)}
                onReorder={handleReorder}
                currency={salonCurrency}
                translations={buildTableTranslations(t, appLocale)}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                searchPlaceholder={t.searchPlaceholder ?? "Search services..."}
                headerContent={
                  <FilterChips
                    chips={filterChips}
                    value={activeFilters}
                    onChange={setActiveFilters}
                  />
                }
              />
            </>
          )}
        </div>

        {/* Create Service Dialog */}
        <CreateServiceDialog
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          onServiceCreated={reloadServices}
          translations={buildCreateDialogTranslations(t)}
        />

        {/* Service Detail Dialog */}
        <ServiceDetailDialog
          serviceId={detailDialog.selectedId}
          open={detailDialog.open}
          onOpenChange={(open) => {
            if (!open) detailDialog.close();
          }}
          mode={detailDialog.mode}
          onSwitchToEdit={detailDialog.switchToEdit}
          onSwitchToView={detailDialog.switchToView}
          services={services}
          serviceEmployeeCountMap={serviceEmployeeCountMap}
          onServiceUpdated={reloadServices}
          translations={buildDetailDialogTranslations(t, appLocale)}
          currency={salonCurrency}
        />

        {/* Templates Dialog */}
        <ServiceTemplatesDialog
          open={isTemplateOpen}
          onOpenChange={setIsTemplateOpen}
          onCreated={reloadServices}
        />

        {/* Bulk Price Dialog */}
        <BulkPriceDialog
          open={isBulkPriceOpen}
          onOpenChange={setIsBulkPriceOpen}
          services={services}
          selectedIds={bulkSelectedIds}
          onApply={bulkUpdatePrices}
          currency={salonCurrency}
        />
      </PageLayout>
    </ErrorBoundary>
  );
}
