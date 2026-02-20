"use client";

import { useState } from "react";
import { PageLayout } from "@/components/layout/page-layout";
import { EmptyState } from "@/components/empty-state";
import { TableToolbar } from "@/components/table-toolbar";
import { StatsBar } from "@/components/stats-bar";
import { FilterChips } from "@/components/filter-chips";
import { QuickFixBanner } from "@/components/quick-fix-banner";
import { Button } from "@/components/ui/button";
import { ErrorBoundary } from "@/components/error-boundary";
import { ErrorMessage } from "@/components/feedback/error-message";
import { CapacityBanner, LimitIndicator } from "@/components/limit-warning";
import { useLocale } from "@/components/locale-provider";
import { translations } from "@/i18n/translations";
import { normalizeLocale } from "@/i18n/normalizeLocale";
import { useEmployees } from "@/lib/hooks/employees/useEmployees";
import { usePlanLimits } from "@/lib/hooks/usePlanLimits";
import { useEntityDialogState } from "@/lib/hooks/useEntityDialogState";
import { getBookingBlockers } from "@/lib/setup/health";
import { CreateEmployeeDialog } from "@/components/employees/CreateEmployeeDialog";
import { EmployeesTable } from "@/components/employees/EmployeesTable";
import { EmployeesCardView } from "@/components/employees/EmployeesCardView";
import { EmployeeDetailDialog } from "@/components/employees/EmployeeDetailDialog";
import { AssignServicesDialog } from "@/components/employees/AssignServicesDialog";
import { useRouter } from "next/navigation";
import { useFeatures } from "@/lib/hooks/use-features";
import { AlertTriangle } from "lucide-react";
import type { Employee } from "@/lib/types";
import {
  buildStatsItems,
  buildFilterChips,
  buildCardViewTranslations,
  buildEmployeesTableTranslations,
  buildCreateDialogTranslations,
  buildDetailDialogTranslations,
} from "./_helpers/translations";

export default function EmployeesPage() {
  const { locale } = useLocale();
  const appLocale = normalizeLocale(locale);
  const t = translations[appLocale].employees;
  const router = useRouter();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);

  const detailDialog = useEntityDialogState<Employee>();
  const { hasFeature } = useFeatures();
  const hasShiftsFeature = hasFeature("SHIFTS");

  const {
    employees,
    filteredEmployees,
    services,
    employeeServicesMap,
    employeeShiftsMap,
    loading,
    error,
    setError,
    loadEmployees,
    handleToggleActive,
    handleDelete,
    stats,
    searchQuery,
    setSearchQuery,
    activeFilters,
    setActiveFilters,
  } = useEmployees({
    translations: { noSalon: t.noSalon, confirmDelete: t.confirmDelete },
    hasShiftsFeature,
  });

  const planLimits = usePlanLimits({ employees: employees.length });
  const isAtLimit = planLimits.employees?.blocked ?? false;

  const handleUpgrade = () => router.push("/settings/billing");

  // Booking blockers for QuickFixBanner
  const bookingBlockers = getBookingBlockers({
    employees,
    services,
    employeeServicesMap,
    employeeShiftsMap,
    hasShiftsFeature,
  });

  const filterChips = buildFilterChips(t, stats, hasShiftsFeature);

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
              onClick={() => setIsAssignDialogOpen(true)}
              disabled={employees.length === 0}
            >
              {t.assignServices ?? "Assign services"}
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={() => setIsDialogOpen(true)}
              disabled={isAtLimit}
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
        {!loading && employees.length > 0 && (
          <StatsBar className="mb-4" items={buildStatsItems(t, stats)} />
        )}

        {/* Capacity Banner */}
        <CapacityBanner
          limitInfo={planLimits.employees}
          entityLabel={t.staffCount ?? "staff"}
          onUpgrade={handleUpgrade}
          onDeactivate={() => {
            // Open detail dialog to let user pick which employee to remove
            const emp = employees[0];
            if (emp) detailDialog.onRowClick(emp);
          }}
        />

        {/* Limit Indicator */}
        {planLimits.employees && planLimits.employees.limit !== null && (
          <div className="mb-4 rounded-xl border bg-card p-4 shadow-sm">
            <LimitIndicator
              currentCount={planLimits.employees.current}
              limit={planLimits.employees.limit}
              limitType="employees"
            />
          </div>
        )}

        {/* Quick Fix Banner */}
        {!loading && employees.length > 0 && (
          <QuickFixBanner
            issues={bookingBlockers}
            title={t.bookingBlocked ?? "Booking is not working"}
            actions={[
              {
                issueKey: "no_employees_with_services",
                label: t.assignServices ?? "Assign services",
                onClick: () => setIsAssignDialogOpen(true),
              },
              {
                issueKey: "no_employees_with_shifts",
                label: t.setupShifts ?? "Set up shifts",
                onClick: () => router.push("/shifts"),
              },
            ]}
            className="mb-4"
          />
        )}

        {/* Table Card */}
        <div className="rounded-xl border bg-card p-4 shadow-sm">
          <TableToolbar
            title={t.tableTitle}
            searchValue={searchQuery}
            onSearchChange={setSearchQuery}
            searchPlaceholder={t.searchPlaceholder ?? "Search staff..."}
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
          ) : employees.length === 0 ? (
            <div className="mt-4">
              <EmptyState
                title={t.emptyTitle}
                description={t.emptyActionDescription ?? t.emptyDescription}
                primaryAction={
                  <Button
                    size="sm"
                    onClick={() => setIsDialogOpen(true)}
                    disabled={isAtLimit}
                  >
                    {t.addButton}
                  </Button>
                }
              />
            </div>
          ) : (
            <>
              <EmployeesCardView
                employees={filteredEmployees}
                employeeServicesMap={employeeServicesMap}
                employeeShiftsMap={employeeShiftsMap}
                hasShiftsFeature={hasShiftsFeature}
                onToggleActive={handleToggleActive}
                onDelete={handleDelete}
                onRowClick={detailDialog.onRowClick}
                translations={buildCardViewTranslations(t)}
              />
              <EmployeesTable
                employees={filteredEmployees}
                employeeServicesMap={employeeServicesMap}
                employeeShiftsMap={employeeShiftsMap}
                hasShiftsFeature={hasShiftsFeature}
                onToggleActive={handleToggleActive}
                onDelete={handleDelete}
                onRowClick={detailDialog.onRowClick}
                onEditClick={(emp) => detailDialog.openEdit(emp.id)}
                translations={{
                  colName: t.colName,
                  colRole: t.colRole,
                  colContact: t.colContact,
                  colServices: t.colServices,
                  colStatus: t.colStatus,
                  colActions: t.colActions,
                  colSetup: t.colSetup ?? "Setup",
                  active: t.active,
                  inactive: t.inactive,
                  delete: t.delete,
                  edit: t.edit,
                  addContact: t.addContact ?? "Add",
                  canBeBooked: t.canBeBooked ?? "Can be booked",
                  notBookable: t.notBookable ?? "Not bookable",
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
          translations={buildCreateDialogTranslations(t)}
        />

        {/* Employee Detail Dialog (view/edit mode) */}
        <EmployeeDetailDialog
          employeeId={detailDialog.selectedId}
          open={detailDialog.open}
          onOpenChange={(open) => { if (!open) detailDialog.close(); }}
          mode={detailDialog.mode}
          onSwitchToEdit={detailDialog.switchToEdit}
          onSwitchToView={detailDialog.switchToView}
          employees={employees}
          services={services}
          employeeServicesMap={employeeServicesMap}
          employeeShiftsMap={employeeShiftsMap}
          hasShiftsFeature={hasShiftsFeature}
          onToggleActive={handleToggleActive}
          onEmployeeUpdated={loadEmployees}
          translations={buildDetailDialogTranslations(t)}
        />

        {/* Assign Services Dialog */}
        <AssignServicesDialog
          open={isAssignDialogOpen}
          onOpenChange={setIsAssignDialogOpen}
          employees={employees}
          services={services}
          employeeServicesMap={employeeServicesMap}
          onSaved={loadEmployees}
        />
      </PageLayout>
    </ErrorBoundary>
  );
}
