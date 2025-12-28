import { useState, useEffect, useCallback } from "react";
import { useCurrentSalon } from "@/components/salon-provider";
import { getEmployeesForCurrentSalon } from "@/lib/repositories/employees";
import { getShiftsForCurrentSalon } from "@/lib/repositories/shifts";
import type { Shift } from "@/lib/types";

interface UseShiftsOptions {
  translations: {
    noSalon: string;
    loadError: string;
  };
}

export function useShifts({ translations }: UseShiftsOptions) {
  const { salon, loading: salonLoading, error: salonError, isReady } = useCurrentSalon();
  const [employees, setEmployees] = useState<{ id: string; full_name: string }[]>([]);
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadShifts = useCallback(async () => {
    setLoading(true);
    setError(null);

    if (!salon?.id) {
      setError(translations.noSalon);
      setLoading(false);
      return;
    }

    const [
      { data: employeesData, error: employeesError },
      { data: shiftsData, error: shiftsError },
    ] = await Promise.all([
      getEmployeesForCurrentSalon(salon.id),
      getShiftsForCurrentSalon(salon.id),
    ]);

    if (employeesError || shiftsError) {
      setError(employeesError ?? shiftsError ?? translations.loadError);
      setLoading(false);
      return;
    }

    setEmployees(
      (employeesData ?? []).map((e) => ({ id: e.id, full_name: e.full_name }))
    );
    setShifts(shiftsData ?? []);
    setLoading(false);
  }, [salon?.id, translations.noSalon, translations.loadError]);

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

    loadShifts();
  }, [isReady, salon?.id, salonLoading, salonError, translations.noSalon, loadShifts]);

  const addShift = useCallback((shift: Shift) => {
    setShifts((prev) => [...prev, shift]);
  }, []);

  const updateShift = useCallback((shift: Shift) => {
    setShifts((prev) => prev.map((s) => (s.id === shift.id ? shift : s)));
  }, []);

  const removeShift = useCallback((shiftId: string) => {
    setShifts((prev) => prev.filter((s) => s.id !== shiftId));
  }, []);

  return {
    employees,
    shifts,
    loading,
    error,
    loadShifts,
    addShift,
    updateShift,
    removeShift,
    setError,
  };
}

