"use client";

import { PageLayout } from "@/components/layout/page-layout";
import { EmptyState } from "@/components/empty-state";
import { TableToolbar } from "@/components/table-toolbar";
import { ErrorBoundary } from "@/components/error-boundary";
import { ErrorMessage } from "@/components/feedback/error-message";
import { useLocale } from "@/components/locale-provider";
import { translations } from "@/i18n/translations";
import { normalizeLocale } from "@/i18n/normalizeLocale";
import { useEmployees } from "@/lib/hooks/employees/useEmployees";
import { CreateEmployeeForm } from "@/components/employees/CreateEmployeeForm";
import { EmployeesTable } from "@/components/employees/EmployeesTable";
import { EmployeesCardView } from "@/components/employees/EmployeesCardView";

export default function EmployeesPage() {
  const { locale } = useLocale();
  const appLocale = normalizeLocale(locale);
  const t = translations[appLocale].employees;

  const {
    employees,
    services,
    employeeServicesMap,
    loading,
    error,
    setError,
    loadEmployees,
    handleToggleActive,
    handleDelete,
  } = useEmployees({
    translations: {
      noSalon: t.noSalon,
    },
  });

  return (
    <ErrorBoundary>
      <PageLayout title={t.title} description={t.description}>
        <div className="space-y-6">
          {error && (
            <ErrorMessage
              message={error}
              onDismiss={() => setError(null)}
              variant="destructive"
            />
          )}

          <CreateEmployeeForm
            services={services}
            onEmployeeCreated={loadEmployees}
            translations={{
              nameLabel: t.nameLabel,
              namePlaceholder: t.namePlaceholder,
              emailLabel: t.emailLabel,
              emailPlaceholder: t.emailPlaceholder,
              phoneLabel: t.phoneLabel,
              phonePlaceholder: t.phonePlaceholder,
              roleLabel: t.roleLabel,
              rolePlaceholder: t.rolePlaceholder,
              preferredLanguageLabel: t.preferredLanguageLabel,
              servicesLabel: t.servicesLabel,
              servicesPlaceholder: t.servicesPlaceholder,
              addButton: t.addButton,
            }}
          />

          <div className="rounded-xl border bg-card p-4 shadow-sm">
            <TableToolbar title={t.tableTitle} />
            {loading ? (
              <p className="mt-4 text-sm text-muted-foreground">{t.loading}</p>
            ) : employees.length === 0 ? (
              <div className="mt-4">
                <EmptyState title={t.emptyTitle} description={t.emptyDescription} />
              </div>
            ) : (
              <>
                <EmployeesCardView
                  employees={employees}
                  employeeServicesMap={employeeServicesMap}
                  onToggleActive={handleToggleActive}
                  onDelete={handleDelete}
                  translations={{
                    active: t.active,
                    inactive: t.inactive,
                    delete: t.delete,
                  }}
                />
                <EmployeesTable
                  employees={employees}
                  employeeServicesMap={employeeServicesMap}
                  onToggleActive={handleToggleActive}
                  onDelete={handleDelete}
                  translations={{
                    colName: t.colName,
                    colRole: t.colRole,
                    colContact: t.colContact,
                    colServices: t.colServices,
                    colStatus: t.colStatus,
                    colActions: t.colActions,
                    active: t.active,
                    inactive: t.inactive,
                    delete: t.delete,
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
