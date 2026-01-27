"use client";

import { PageLayout } from "@/components/layout/page-layout";
import { EmptyState } from "@/components/empty-state";
import { TableToolbar } from "@/components/table-toolbar";
import { ErrorBoundary } from "@/components/error-boundary";
import { ErrorMessage } from "@/components/feedback/error-message";
import { useLocale } from "@/components/locale-provider";
import { translations } from "@/i18n/translations";
import { normalizeLocale } from "@/i18n/normalizeLocale";
import { useServices } from "@/lib/hooks/services/useServices";
import { CreateServiceForm } from "@/components/services/CreateServiceForm";
import { ServicesTable } from "@/components/services/ServicesTable";
import { ServicesCardView } from "@/components/services/ServicesCardView";

export default function ServicesPage() {
  const { locale } = useLocale();
  const appLocale = normalizeLocale(locale);
  const t = translations[appLocale].services;

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
      <PageLayout title={t.title} description={t.description}>
        <div className="space-y-6">
          {error && (
            <ErrorMessage message={error} onDismiss={() => setError(null)} variant="destructive" />
          )}

          <CreateServiceForm
            onServiceCreated={reloadServices}
            translations={{
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
              newService: t.newService,
            }}
          />

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
        </div>
      </PageLayout>
    </ErrorBoundary>
  );
}
