"use client";

import { useState } from "react";
import { ListPage, type PageState } from "@teqbook/page";
import { ErrorBoundary } from "@teqbook/feedback";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Button } from "@/components/ui/button";
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

  const categoryChips = Object.entries(categoryCounts).map(([cat, count]) => ({
    id: cat,
    label: cat.charAt(0).toUpperCase() + cat.slice(1),
    count,
  }));

  const filterChips = [
    { id: "active", label: t.filterActive ?? "Active", count: stats.active },
    { id: "inactive", label: t.filterInactive ?? "Inactive", count: stats.total - stats.active },
    ...categoryChips,
  ];

  const pageState: PageState = loading
    ? { status: "loading" }
    : error
      ? { status: "error", message: error, retry: () => setError(null) }
      : services.length === 0
        ? {
            status: "empty",
            title: t.emptyTitle,
            description: t.emptyDescription,
            action: (
              <Button size="sm" onClick={() => setIsDialogOpen(true)}>
                {t.newService}
              </Button>
            ),
          }
        : { status: "ready" };

  return (
    <ErrorBoundary>
      <DashboardShell>
      <ListPage
        title={t.title}
        description={t.description}
        actions={[
          {
            label: t.addFromTemplate ?? "From template",
            onClick: () => setIsTemplateOpen(true),
            variant: "outline",
            priority: "secondary",
          },
          ...(services.length > 0
            ? [{
                label: t.bulkAdjustPrice ?? "Adjust prices",
                onClick: () => { setBulkSelectedIds([]); setIsBulkPriceOpen(true); },
                variant: "outline" as const,
                priority: "secondary" as const,
              }]
            : []),
          {
            label: t.newService,
            onClick: () => setIsDialogOpen(true),
            priority: "primary",
          },
        ]}
        stats={[
          { label: t.statsTotal ?? "Total", value: stats.total, icon: <Package className="h-4 w-4" /> },
          { label: t.statsActive ?? "Active", value: stats.active, variant: "success", icon: <PackageCheck className="h-4 w-4" /> },
          { label: t.statsCategories ?? "Categories", value: stats.categories, icon: <Layers className="h-4 w-4" /> },
          { label: t.statsWithoutEmployees ?? "Without staff", value: stats.withoutEmployees, variant: stats.withoutEmployees > 0 ? "warning" : "default", icon: <UserX className="h-4 w-4" /> },
        ]}
        filterChips={filterChips}
        activeFilters={activeFilters}
        onFiltersChange={setActiveFilters}
        state={pageState}
      >
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
        />
      </ListPage>

      <CreateServiceDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onServiceCreated={reloadServices}
        translations={buildCreateDialogTranslations(t)}
      />

      <ServiceDetailDialog
        serviceId={detailDialog.selectedId}
        open={detailDialog.open}
        onOpenChange={(open) => { if (!open) detailDialog.close(); }}
        mode={detailDialog.mode}
        onSwitchToEdit={detailDialog.switchToEdit}
        onSwitchToView={detailDialog.switchToView}
        services={services}
        serviceEmployeeCountMap={serviceEmployeeCountMap}
        onServiceUpdated={reloadServices}
        translations={buildDetailDialogTranslations(t, appLocale)}
        currency={salonCurrency}
      />

      <ServiceTemplatesDialog
        open={isTemplateOpen}
        onOpenChange={setIsTemplateOpen}
        onCreated={reloadServices}
      />

      <BulkPriceDialog
        open={isBulkPriceOpen}
        onOpenChange={setIsBulkPriceOpen}
        services={services}
        selectedIds={bulkSelectedIds}
        onApply={bulkUpdatePrices}
        currency={salonCurrency}
      />
      </DashboardShell>
    </ErrorBoundary>
  );
}
