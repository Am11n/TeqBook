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

export default function ServicesPage() {
  const { locale } = useLocale();
  const appLocale = normalizeLocale(locale);
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
          <TableToolbar
            title={t.tableTitle}
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
                translations={{
                  active: t.active,
                  inactive: t.inactive,
                  delete: t.delete,
                  edit: t.edit ?? "Edit",
                  categoryCut: t.categoryCut,
                  categoryBeard: t.categoryBeard,
                  categoryColor: t.categoryColor,
                  categoryNails: t.categoryNails,
                  categoryMassage: t.categoryMassage,
                  categoryOther: t.categoryOther,
                  staffUnit: t.staffUnit ?? "staff",
                  locale: appLocale,
                }}
              />
              <ServicesTable
                services={filteredServices}
                serviceEmployeeCountMap={serviceEmployeeCountMap}
                onToggleActive={handleToggleActive}
                onDelete={handleDelete}
                onRowClick={detailDialog.onRowClick}
                onEditClick={(svc) => detailDialog.openEdit(svc.id)}
                onReorder={handleReorder}
                translations={{
                  colName: t.colName,
                  colCategory: t.colCategory,
                  colDuration: t.colDuration,
                  colPrice: t.colPrice,
                  colStatus: t.colStatus,
                  colEmployees: t.colEmployees ?? "Staff",
                  active: t.active,
                  inactive: t.inactive,
                  delete: t.delete,
                  edit: t.edit ?? "Edit",
                  moveUp: t.moveUp ?? "Move up",
                  moveDown: t.moveDown ?? "Move down",
                  categoryCut: t.categoryCut,
                  categoryBeard: t.categoryBeard,
                  categoryColor: t.categoryColor,
                  categoryNails: t.categoryNails,
                  categoryMassage: t.categoryMassage,
                  categoryOther: t.categoryOther,
                  staffUnit: t.staffUnit ?? "staff",
                  prepBadge: t.prepBadge ?? "prep",
                  afterBadge: t.afterBadge ?? "after",
                  locale: appLocale,
                }}
              />
            </>
          )}
        </div>

        {/* Create Service Dialog */}
        <CreateServiceDialog
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          onServiceCreated={reloadServices}
          translations={{
            dialogTitle: t.dialogTitle,
            dialogDescription: t.dialogDescription,
            nameLabel: t.nameLabel,
            namePlaceholder: t.namePlaceholder,
            categoryLabel: t.categoryLabel,
            categoryCut: t.categoryCut,
            categoryBeard: t.categoryBeard,
            categoryColor: t.categoryColor,
            categoryNails: t.categoryNails,
            categoryMassage: t.categoryMassage,
            categoryOther: t.categoryOther,
            durationLabel: t.durationLabel,
            priceLabel: t.priceLabel,
            sortOrderLabel: t.sortOrderLabel,
            cancel: t.cancel,
            newService: t.newService,
          }}
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
          translations={{
            editTitle: t.detailTitle ?? "Edit service",
            detailDescription: t.detailDescription ?? "Overview of service, staff and status.",
            editDescription: t.editDescription ?? "Update service details.",
            active: t.active,
            inactive: t.inactive,
            categoryLabel: t.categoryLabel,
            categoryCut: t.categoryCut,
            categoryBeard: t.categoryBeard,
            categoryColor: t.categoryColor,
            categoryNails: t.categoryNails,
            categoryMassage: t.categoryMassage,
            categoryOther: t.categoryOther,
            durationLabel: t.durationLabel,
            priceLabel: t.priceLabel,
            staffUnit: t.staffUnit ?? "staff",
            colEmployees: t.colEmployees ?? "Staff",
            prepMinutesLabel: t.prepMinutesLabel ?? "Prep time (min)",
            cleanupMinutesLabel: t.cleanupMinutesLabel ?? "Cleanup time (min)",
            nameLabel: t.nameLabel,
            sortOrderLabel: t.sortOrderLabel,
            close: t.close ?? "Close",
            edit: t.edit ?? "Edit",
            cancel: t.cancel,
            save: t.save ?? "Save",
            saving: t.saving ?? "Saving...",
            locale: appLocale,
          }}
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
        />
      </PageLayout>
    </ErrorBoundary>
  );
}
