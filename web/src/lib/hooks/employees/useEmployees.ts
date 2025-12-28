import { useState, useEffect, useCallback } from "react";
import { useCurrentSalon } from "@/components/salon-provider";
import {
  getEmployeesWithServicesMap,
  toggleEmployeeActive,
  deleteEmployee,
} from "@/lib/repositories/employees";
import { getActiveServicesForCurrentSalon } from "@/lib/repositories/services";
import type { Employee, Service } from "@/lib/types";

interface UseEmployeesOptions {
  translations: {
    noSalon: string;
  };
}

export function useEmployees({ translations }: UseEmployeesOptions) {
  const { salon, loading: salonLoading, error: salonError, isReady } = useCurrentSalon();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [employeeServicesMap, setEmployeeServicesMap] = useState<Record<string, Service[]>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
    ] = await Promise.all([
      getEmployeesWithServicesMap(salon.id),
      getActiveServicesForCurrentSalon(salon.id),
    ]);

    if (employeesError || servicesError) {
      setError(employeesError ?? servicesError ?? "Kunne ikke laste data");
      setLoading(false);
      return;
    }

    if (!employeesData || !servicesData) {
      setError("Kunne ikke laste data");
      setLoading(false);
      return;
    }

    setEmployees(employeesData.employees);
    setServices(servicesData);
    setEmployeeServicesMap(employeesData.servicesMap);
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

  const handleToggleActive = async (employeeId: string, currentStatus: boolean) => {
    if (!salon?.id) return;

    const { error: toggleError } = await toggleEmployeeActive(salon.id, employeeId, !currentStatus);

    if (toggleError) {
      setError(toggleError);
      return;
    }

    await loadEmployees();
  };

  const handleDelete = async (employeeId: string) => {
    if (!confirm("Are you sure you want to delete this employee?")) return;
    if (!salon?.id) return;

    const { error: deleteError } = await deleteEmployee(salon.id, employeeId);

    if (deleteError) {
      setError(deleteError);
      return;
    }

    await loadEmployees();
  };

  return {
    employees,
    services,
    employeeServicesMap,
    loading,
    error,
    setError,
    loadEmployees,
    handleToggleActive,
    handleDelete,
  };
}

