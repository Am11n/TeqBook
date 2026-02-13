"use client";

import { useState, useEffect } from "react";
import { PageLayout } from "@/components/layout/page-layout";
import { EmptyState } from "@/components/empty-state";
import { TableToolbar } from "@/components/table-toolbar";
import { Button } from "@/components/ui/button";
import { ErrorBoundary } from "@/components/error-boundary";
import { ErrorMessage } from "@/components/feedback/error-message";
import { LimitWarning, LimitIndicator } from "@/components/limit-warning";
import { useLocale } from "@/components/locale-provider";
import { useCurrentSalon } from "@/components/salon-provider";
import { translations } from "@/i18n/translations";
import { normalizeLocale } from "@/i18n/normalizeLocale";
import { useEmployees } from "@/lib/hooks/employees/useEmployees";
import { getEffectiveLimit } from "@/lib/services/plan-limits-service";
import { CreateEmployeeDialog } from "@/components/employees/CreateEmployeeDialog";
import { EmployeesTable } from "@/components/employees/EmployeesTable";
import { EmployeesCardView } from "@/components/employees/EmployeesCardView";
import { EditEmployeeDialog } from "@/components/employees/EditEmployeeDialog";
import { useRouter } from "next/navigation";
import type { Employee } from "@/lib/types";

export default function EmployeesPage() {
  const { locale } = useLocale();
  const appLocale = normalizeLocale(locale);
  const t = translations[appLocale].employees;
  const { salon } = useCurrentSalon();
  const router = useRouter();
  const [employeeLimit, setEmployeeLimit] = useState<number | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleUpgrade = () => {
    router.push("/settings/billing");
  };

  // Edit employee state
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);

  const handleEdit = (employee: Employee) => {
    setEditingEmployee(employee);
    setEditDialogOpen(true);
  };

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

  // Load employee limit
  useEffect(() => {
    async function loadLimit() {
      if (!salon?.id || !salon?.plan) return;
      
      const { limit } = await getEffectiveLimit(salon.id, salon.plan, "employees");
      setEmployeeLimit(limit);
    }
    
    loadLimit();
  }, [salon?.id, salon?.plan]);

  const isAtLimit = employeeLimit !== null && employees.length >= employeeLimit;

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
            disabled={isAtLimit}
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

        {/* Employee Limit Warning */}
        {employeeLimit !== null && (
          <LimitWarning
            currentCount={employees.length}
            limit={employeeLimit}
            limitType="employees"
            onUpgrade={handleUpgrade}
          />
        )}

        {/* Employee Limit Indicator */}
        {employeeLimit !== null && (
          <div className="mb-4 rounded-xl border bg-card p-4 shadow-sm">
            <LimitIndicator
              currentCount={employees.length}
              limit={employeeLimit}
              limitType="employees"
            />
          </div>
        )}

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
                onEdit={handleEdit}
                translations={{
                  active: t.active,
                  inactive: t.inactive,
                  delete: t.delete,
                  edit: t.edit,
                }}
              />
              <EmployeesTable
                employees={employees}
                employeeServicesMap={employeeServicesMap}
                onToggleActive={handleToggleActive}
                onDelete={handleDelete}
                onEdit={handleEdit}
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
                  edit: t.edit,
                }}
              />
            </>
          )}
        </div>

        {/* Create Employee Dialog */}
        <CreateEmployeeDialog
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          services={services}
          onEmployeeCreated={loadEmployees}
          translations={{
            dialogTitle: t.dialogTitle,
            dialogDescription: t.dialogDescription,
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
            cancel: t.cancel,
            addButton: t.addButton,
          }}
        />

        {/* Edit Employee Dialog */}
        <EditEmployeeDialog
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
          employee={editingEmployee}
          employeeServices={editingEmployee ? (employeeServicesMap[editingEmployee.id] || []) : []}
          allServices={services}
          onEmployeeUpdated={loadEmployees}
          translations={{
            editTitle: t.editTitle,
            editDescription: t.editDescription,
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
            cancel: t.cancel,
            save: t.save,
            saving: t.saving,
          }}
        />
      </PageLayout>
    </ErrorBoundary>
  );
}
