"use client";

import { useState } from "react";
import { PageLayout } from "@/components/layout/page-layout";
import { EmptyState } from "@/components/empty-state";
import { TableToolbar } from "@/components/table-toolbar";
import { Button } from "@/components/ui/button";
import { ErrorBoundary } from "@/components/error-boundary";
import { ErrorMessage } from "@/components/feedback/error-message";
import { useLocale } from "@/components/locale-provider";
import { translations } from "@/i18n/translations";
import { normalizeLocale } from "@/i18n/normalizeLocale";
import { useServices } from "@/lib/hooks/services/useServices";
import { CreateServiceDialog } from "@/components/services/CreateServiceDialog";
import { ServicesTable } from "@/components/services/ServicesTable";
import { ServicesCardView } from "@/components/services/ServicesCardView";

export default function ServicesPage() {
  const { locale } = useLocale();
  const appLocale = normalizeLocale(locale);
  const t = translations[appLocale].services;
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const {
    services,
    loading,
    error,
    setError,
    handleToggleActive,
    handleDelete,
    reloadServices,
  } = useServices({
    translations: {
      noSalon: t.noSalon,
    },
  });

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
            {t.newService}
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
            <p className="mt-4 text-sm text-muted-foreground">{t.loading}</p>
          ) : services.length === 0 ? (
            <div className="mt-4">
              <EmptyState title={t.emptyTitle} description={t.emptyDescription} />
            </div>
          ) : (
            <>
              <ServicesCardView
                services={services}
                locale={appLocale}
                onToggleActive={handleToggleActive}
                onDelete={handleDelete}
                translations={{
                  active: t.active,
                  inactive: t.inactive,
                  delete: t.delete,
                  categoryCut: t.categoryCut,
                  categoryBeard: t.categoryBeard,
                  categoryColor: t.categoryColor,
                  categoryNails: t.categoryNails,
                  categoryMassage: t.categoryMassage,
                  categoryOther: t.categoryOther,
                }}
              />
              <ServicesTable
                services={services}
                locale={appLocale}
                onToggleActive={handleToggleActive}
                onDelete={handleDelete}
                translations={{
                  colName: t.colName,
                  colCategory: t.colCategory,
                  colDuration: t.colDuration,
                  colPrice: t.colPrice,
                  colStatus: t.colStatus,
                  colActions: t.colActions,
                  active: t.active,
                  inactive: t.inactive,
                  delete: t.delete,
                  categoryCut: t.categoryCut,
                  categoryBeard: t.categoryBeard,
                  categoryColor: t.categoryColor,
                  categoryNails: t.categoryNails,
                  categoryMassage: t.categoryMassage,
                  categoryOther: t.categoryOther,
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
            categoryOther: t.categoryOther,
            categoryCut: t.categoryCut,
            categoryBeard: t.categoryBeard,
            categoryColor: t.categoryColor,
            categoryNails: t.categoryNails,
            categoryMassage: t.categoryMassage,
            durationLabel: t.durationLabel,
            priceLabel: t.priceLabel,
            sortOrderLabel: t.sortOrderLabel,
            cancel: t.cancel,
            newService: t.newService,
          }}
        />
      </PageLayout>
    </ErrorBoundary>
  );
}
