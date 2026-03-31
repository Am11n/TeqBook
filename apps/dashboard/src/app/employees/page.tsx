"use client";

import { useState } from "react";
import { ListPage, type PageState } from "@teqbook/page";
import { ErrorBoundary } from "@teqbook/feedback";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Button } from "@/components/ui/button";
import { CapacityBanner, LimitIndicator } from "@/components/limit-warning";
import { QuickFixBanner } from "@/components/quick-fix-banner";
import { FilterChips } from "@/components/filter-chips";
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
import type { Employee } from "@/lib/types";
import {
  buildStatsItems,
  buildFilterChips,
  buildCardViewTranslations,
  buildCreateDialogTranslations,
  buildDetailDialogTranslations,
  resolveEmployees,
} from "./_helpers/translations";

export default function EmployeesPage() {
  const { locale } = useLocale();
  const appLocale = normalizeLocale(locale);
  const t = resolveEmployees(translations[appLocale].employees);
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
    translations: {
      noSalon: t.noSalon,
      listLoadError: t.listLoadError,
      confirmDelete: t.confirmDelete,
    },
    hasShiftsFeature,
  });

  const planLimits = usePlanLimits({ employees: employees.length });

  const handleUpgrade = () => router.push("/settings/billing");

  const bookingBlockers = getBookingBlockers({
    employees,
    services,
    employeeServicesMap,
    employeeShiftsMap,
    hasShiftsFeature,
  });

  const filterChips = buildFilterChips(t, stats, hasShiftsFeature);

  const pageState: PageState = loading
    ? { status: "loading" }
    : error
      ? { status: "error", message: error, retry: () => setError(null) }
      : employees.length === 0
        ? {
            status: "empty",
            title: t.emptyTitle,
            description: t.emptyActionDescription,
            action: (
              <Button size="sm" onClick={() => setIsDialogOpen(true)}>
                {t.addButton}
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
            label: t.assignServices,
            onClick: () => setIsAssignDialogOpen(true),
            variant: "outline",
            priority: "secondary",
            disabled: employees.length === 0,
          },
          {
            label: t.addButton,
            onClick: () => setIsDialogOpen(true),
            priority: "primary",
          },
        ]}
        stats={buildStatsItems(t, stats)}
        filterChips={filterChips}
        activeFilters={activeFilters}
        onFiltersChange={setActiveFilters}
        banner={
          <>
            <CapacityBanner
              limitInfo={planLimits.employees}
              entityLabel={t.staffCount}
              onUpgrade={handleUpgrade}
              onDeactivate={() => {
                const emp = employees[0];
                if (emp) detailDialog.onRowClick(emp);
              }}
              copy={{
                capacityNearTitle: t.capacityNearTitle,
                capacityNearMessage: t.capacityNearMessage,
                upgradeButton: t.upgradePlan,
                deactivateButton: t.deactivateToFree,
                blockedTitle: t.capacityBlockedTitle,
                blockedMessage: t.capacityBlockedMessage,
              }}
            />
            {planLimits.employees && planLimits.employees.limit !== null && (
              <div className="rounded-xl border bg-card p-4 shadow-sm">
                <LimitIndicator
                  currentCount={planLimits.employees.current}
                  limit={planLimits.employees.limit}
                  rowLabel={t.limitGaugeStaffLabel}
                  unlimitedText={t.limitGaugeUnlimitedStaff}
                />
              </div>
            )}
            {!loading && employees.length > 0 && (
              <QuickFixBanner
                issues={bookingBlockers}
                title={t.bookingBlocked}
                actions={[
                  {
                    issueKey: "no_employees_with_services",
                    label: t.assignServices,
                    onClick: () => setIsAssignDialogOpen(true),
                  },
                  {
                    issueKey: "no_employees_with_shifts",
                    label: t.setupShifts,
                    onClick: () => router.push("/shifts"),
                  },
                ]}
              />
            )}
          </>
        }
        state={pageState}
      >
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
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          searchPlaceholder={t.searchPlaceholder}
          translations={{
            colName: t.colName,
            colRole: t.colRole,
            colContact: t.colContact,
            colServices: t.colServices,
            colStatus: t.colStatus,
            colActions: t.colActions,
            colSetup: t.colSetup,
            active: t.active,
            inactive: t.inactive,
            delete: t.delete,
            edit: t.edit,
            addContact: t.addContact,
            canBeBooked: t.canBeBooked,
            notBookable: t.notBookable,
          }}
        />
      </ListPage>

      <CreateEmployeeDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        services={services}
        onEmployeeCreated={loadEmployees}
        translations={buildCreateDialogTranslations(t)}
      />

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

      <AssignServicesDialog
        open={isAssignDialogOpen}
        onOpenChange={setIsAssignDialogOpen}
        employees={employees}
        services={services}
        employeeServicesMap={employeeServicesMap}
        onSaved={loadEmployees}
      />
      </DashboardShell>
    </ErrorBoundary>
  );
}
