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
import { Users, UserCheck, UserX, AlertTriangle } from "lucide-react";
import type { Employee } from "@/lib/types";

export default function EmployeesPage() {
  const { locale } = useLocale();
  const appLocale = normalizeLocale(locale);
  const t = translations[appLocale].employees;
  const router = useRouter();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);

  const detailDialog = useEntityDialogState<Employee>();

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
    translations: { noSalon: t.noSalon },
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
  });

  const filterChips = [
    { id: "active", label: t.filterActive ?? "Active", count: stats.active },
    {
      id: "inactive",
      label: t.filterInactive ?? "Inactive",
      count: stats.inactive,
    },
    {
      id: "missing_services",
      label: t.filterMissingServices ?? "Missing services",
    },
    {
      id: "missing_shifts",
      label: t.filterMissingShifts ?? "Missing shifts",
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
          <StatsBar
            className="mb-4"
            items={[
              {
                label: t.statsTotal ?? "Total",
                value: stats.total,
                icon: <Users className="h-4 w-4" />,
              },
              {
                label: t.statsActive ?? "Active",
                value: stats.active,
                variant: "success",
                icon: <UserCheck className="h-4 w-4" />,
              },
              {
                label: t.statsInactive ?? "Inactive",
                value: stats.inactive,
                variant: stats.inactive > 0 ? "warning" : "default",
                icon: <UserX className="h-4 w-4" />,
              },
              {
                label: t.statsMissingSetup ?? "Missing setup",
                value: stats.missingSetup,
                variant: stats.missingSetup > 0 ? "danger" : "default",
                icon: <AlertTriangle className="h-4 w-4" />,
              },
            ]}
          />
        )}

        {/* Capacity Banner */}
        <CapacityBanner
          limitInfo={planLimits.employees}
          entityLabel={t.staffCount ?? "staff"}
          onUpgrade={handleUpgrade}
          onDeactivate={() => {
            // Open detail dialog for first active employee to deactivate
            const activeEmp = employees.find((e) => e.is_active);
            if (activeEmp) detailDialog.openEdit(activeEmp.id);
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
                onToggleActive={handleToggleActive}
                onDelete={handleDelete}
                onRowClick={detailDialog.onRowClick}
                translations={{
                  active: t.active,
                  inactive: t.inactive,
                  delete: t.delete,
                  edit: t.edit,
                }}
              />
              <EmployeesTable
                employees={filteredEmployees}
                employeeServicesMap={employeeServicesMap}
                employeeShiftsMap={employeeShiftsMap}
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

        {/* Employee Detail Dialog (view/edit mode) */}
        <EmployeeDetailDialog
          employeeId={detailDialog.selectedId}
          open={detailDialog.open}
          onOpenChange={(open) => {
            if (!open) detailDialog.close();
          }}
          mode={detailDialog.mode}
          onSwitchToEdit={detailDialog.switchToEdit}
          onSwitchToView={detailDialog.switchToView}
          employees={employees}
          services={services}
          employeeServicesMap={employeeServicesMap}
          employeeShiftsMap={employeeShiftsMap}
          onToggleActive={handleToggleActive}
          onEmployeeUpdated={loadEmployees}
          translations={{
            editTitle: t.editTitle,
            detailDescription: t.detailDescription ?? "Overview of staff member, services and setup status.",
            editDescription: t.editDescription2 ?? "Update staff information and services.",
            active: t.active,
            inactive: t.inactive,
            canBeBooked: t.canBeBooked ?? "Can be booked",
            notBookable: t.notBookable ?? "Not bookable",
            detailRole: t.detailRole ?? "Role",
            detailContact: t.detailContact ?? "Contact",
            noContact: t.addContact ?? "No contact info",
            detailServices: t.detailServices ?? "Services",
            noServices: t.noServices ?? "No services assigned",
            shiftsLabel: t.missingShifts ? t.colSetup ?? "Shifts" : "Shifts",
            shiftsRegistered: t.shiftsRegistered ?? "shifts registered",
            noShifts: t.noShifts ?? "No shifts",
            close: t.close ?? "Close",
            edit: t.edit,
            cancel: t.cancel,
            save: t.save,
            saving: t.saving,
            nameLabel: t.nameLabel,
            emailLabel: t.emailLabel,
            phoneLabel: t.phoneLabel,
            roleLabel: t.roleLabel,
            selectRole: t.selectRole ?? "Select role...",
            roleOwner: t.roleOwner ?? "Owner",
            roleManager: t.roleManager ?? "Manager",
            roleStaff: t.roleStaff ?? "Staff",
            preferredLang: t.preferredLanguageLabel,
            servicesLabel: t.servicesLabel,
          }}
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
