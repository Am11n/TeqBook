import { useState, useEffect, useCallback, useMemo } from "react";
import { useCurrentSalon } from "@/components/salon-provider";
import {
  getEmployeesWithServicesMap,
  deleteEmployee,
} from "@/lib/repositories/employees";
import { toggleEmployeeActive } from "@/lib/services/employees-service";
import { getActiveServicesForCurrentSalon } from "@/lib/repositories/services";
import { getShiftsForCurrentSalon } from "@/lib/repositories/shifts";
import { getEmployeeSetupIssues } from "@/lib/setup/health";
import type { Employee, Service, Shift } from "@/lib/types";

interface UseEmployeesOptions {
  translations: {
    noSalon: string;
    confirmDelete?: string;
  };
  hasShiftsFeature?: boolean;
}

export function useEmployees({ translations, hasShiftsFeature }: UseEmployeesOptions) {
  const { salon, loading: salonLoading, error: salonError, isReady } =
    useCurrentSalon();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [employeeServicesMap, setEmployeeServicesMap] = useState<
    Record<string, Service[]>
  >({});
  const [employeeShiftsMap, setEmployeeShiftsMap] = useState<
    Record<string, Shift[]>
  >({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Search & filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilters, setActiveFilters] = useState<string[]>([]);

  const loadEmployees = useCallback(async () => {
    setLoading(true);
    setError(null);

    if (!salon?.id) {
      setError(translations.noSalon);
      setLoading(false);
      return;
    }

    const [
      { data: employeesData, error: employeesError },
      { data: servicesData, error: servicesError },
      { data: shiftsData, error: shiftsError },
    ] = await Promise.all([
      getEmployeesWithServicesMap(salon.id),
      getActiveServicesForCurrentSalon(salon.id),
      getShiftsForCurrentSalon(salon.id, { pageSize: 500 }),
    ]);

    if (employeesError || servicesError) {
      setError(
        employeesError ?? servicesError ?? "Kunne ikke laste data",
      );
      setLoading(false);
      return;
    }

    if (!employeesData || !servicesData) {
      setError("Kunne ikke laste data");
      setLoading(false);
      return;
    }

    // Build shifts map per employee
    const shiftsMap: Record<string, Shift[]> = {};
    if (shiftsData) {
      for (const shift of shiftsData) {
        if (!shiftsMap[shift.employee_id]) {
          shiftsMap[shift.employee_id] = [];
        }
        shiftsMap[shift.employee_id].push(shift);
      }
    }

    setEmployees(employeesData.employees);
    setServices(servicesData);
    setEmployeeServicesMap(employeesData.servicesMap);
    setEmployeeShiftsMap(shiftsMap);
    setLoading(false);
  }, [salon?.id, translations.noSalon]);

  useEffect(() => {
    if (!isReady) {
      if (salonError) {
        setError(salonError);
      } else if (salonLoading) {
        setLoading(true);
      } else {
        setError(translations.noSalon);
        setLoading(false);
      }
      return;
    }

    loadEmployees();
  }, [isReady, salonLoading, salonError, translations.noSalon, loadEmployees]);

  // Filtered employees
  const filteredEmployees = useMemo(() => {
    let result = employees;

    // Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (e) =>
          e.full_name.toLowerCase().includes(q) ||
          e.email?.toLowerCase().includes(q) ||
          e.phone?.toLowerCase().includes(q),
      );
    }

    // Filters
    if (activeFilters.length > 0) {
      result = result.filter((e) => {
        for (const filter of activeFilters) {
          if (filter === "active" && !e.is_active) return false;
          if (filter === "inactive" && e.is_active) return false;
          if (
            filter === "missing_services" &&
            (employeeServicesMap[e.id]?.length ?? 0) > 0
          )
            return false;
          if (
            filter === "missing_shifts" &&
            (employeeShiftsMap[e.id]?.length ?? 0) > 0
          )
            return false;
        }
        return true;
      });
    }

    return result;
  }, [
    employees,
    searchQuery,
    activeFilters,
    employeeServicesMap,
    employeeShiftsMap,
  ]);

  // Computed stats
  const stats = useMemo(() => {
    const total = employees.length;
    const active = employees.filter((e) => e.is_active).length;
    const inactive = total - active;
    const missingSetup = employees.filter((e) => {
      const issues = getEmployeeSetupIssues(e, {
        services: employeeServicesMap[e.id] ?? [],
        shifts: employeeShiftsMap[e.id] ?? [],
        hasShiftsFeature,
      });
      return issues.some(
        (i) => i.key === "no_services" || i.key === "no_shifts",
      );
    }).length;
    return { total, active, inactive, missingSetup };
  }, [employees, employeeServicesMap, employeeShiftsMap, hasShiftsFeature]);

  const handleToggleActive = async (
    employeeId: string,
    currentStatus: boolean,
  ) => {
    if (!salon?.id) return;

    // Optimistic update
    setEmployees((prev) =>
      prev.map((e) =>
        e.id === employeeId ? { ...e, is_active: !currentStatus } : e,
      ),
    );

    const { error: toggleError, limitReached } = await toggleEmployeeActive(
      salon.id,
      employeeId,
      currentStatus,
      salon.plan,
    );

    if (toggleError) {
      // Revert optimistic update
      setEmployees((prev) =>
        prev.map((e) =>
          e.id === employeeId ? { ...e, is_active: currentStatus } : e,
        ),
      );
      setError(toggleError);
      return;
    }
  };

  const handleDelete = async (employeeId: string) => {
    const msg = translations.confirmDelete || "Are you sure you want to remove this employee?";
    if (!confirm(msg)) return;
    if (!salon?.id) return;

    const { error: deleteError } = await deleteEmployee(salon.id, employeeId);

    if (deleteError) {
      setError(deleteError);
      return;
    }

    // Optimistic remove
    setEmployees((prev) => prev.filter((e) => e.id !== employeeId));
  };

  return {
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
    // Search & filter
    searchQuery,
    setSearchQuery,
    activeFilters,
    setActiveFilters,
  };
}
