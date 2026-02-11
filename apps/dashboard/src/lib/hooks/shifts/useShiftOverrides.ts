import { useState, useEffect, useCallback, useMemo } from "react";
import { useCurrentSalon } from "@/components/salon-provider";
import {
  getOverridesForWeek,
  createOverride,
  updateOverride,
  deleteOverride,
  copyWeekOverrides,
} from "@/lib/repositories/shift-overrides";
import type { ShiftOverride } from "@/lib/types";

/**
 * Hook that manages shift overrides for a specific week.
 */
export function useShiftOverrides(weekStart: string) {
  const { salon, isReady } = useCurrentSalon();
  const [overrides, setOverrides] = useState<ShiftOverride[]>([]);
  const [loading, setLoading] = useState(true);

  const loadOverrides = useCallback(async () => {
    if (!salon?.id || !weekStart) return;
    setLoading(true);
    const { data } = await getOverridesForWeek(salon.id, weekStart);
    setOverrides(data ?? []);
    setLoading(false);
  }, [salon?.id, weekStart]);

  useEffect(() => {
    if (!isReady || !salon?.id) {
      setLoading(false);
      return;
    }
    loadOverrides();
  }, [isReady, salon?.id, loadOverrides]);

  /** Map: "employeeId:date" -> ShiftOverride[] */
  const overrideMap = useMemo(() => {
    const map = new Map<string, ShiftOverride[]>();
    for (const o of overrides) {
      const key = `${o.employee_id}:${o.override_date}`;
      const list = map.get(key) ?? [];
      list.push(o);
      map.set(key, list);
    }
    return map;
  }, [overrides]);

  /** Get overrides for a specific employee + date */
  const getOverridesFor = useCallback(
    (employeeId: string, date: string): ShiftOverride[] => {
      return overrideMap.get(`${employeeId}:${date}`) ?? [];
    },
    [overrideMap]
  );

  /** Has any override for this employee + date? */
  const hasOverride = useCallback(
    (employeeId: string, date: string): boolean => {
      return (overrideMap.get(`${employeeId}:${date}`) ?? []).length > 0;
    },
    [overrideMap]
  );

  /** Add a new override (optimistic) */
  const addOverride = useCallback(
    async (input: Omit<ShiftOverride, "id" | "created_at">) => {
      const { data, error } = await createOverride(input);
      if (data && !error) {
        setOverrides((prev) => [...prev, data]);
      }
      return { data, error };
    },
    []
  );

  /** Edit an existing override (optimistic) */
  const editOverride = useCallback(
    async (
      overrideId: string,
      updates: { start_time?: string | null; end_time?: string | null }
    ) => {
      if (!salon?.id) return { data: null, error: "No salon" };
      const { data, error } = await updateOverride(
        salon.id,
        overrideId,
        updates
      );
      if (data && !error) {
        setOverrides((prev) =>
          prev.map((o) => (o.id === overrideId ? data : o))
        );
      }
      return { data, error };
    },
    [salon?.id]
  );

  /** Remove an override (optimistic) */
  const removeOverride = useCallback(
    async (overrideId: string) => {
      if (!salon?.id) return { error: "No salon" };
      const { error } = await deleteOverride(salon.id, overrideId);
      if (!error) {
        setOverrides((prev) => prev.filter((o) => o.id !== overrideId));
      }
      return { error };
    },
    [salon?.id]
  );

  /** Copy overrides from one week to another */
  const copyWeek = useCallback(
    async (fromWeekStart: string, toWeekStart: string) => {
      if (!salon?.id) return { count: 0, error: "No salon" };
      const result = await copyWeekOverrides(
        salon.id,
        fromWeekStart,
        toWeekStart
      );
      if (!result.error) {
        // Reload to get the new data
        await loadOverrides();
      }
      return result;
    },
    [salon?.id, loadOverrides]
  );

  return {
    overrides,
    loading,
    getOverridesFor,
    hasOverride,
    addOverride,
    editOverride,
    removeOverride,
    copyWeek,
    reload: loadOverrides,
  };
}
