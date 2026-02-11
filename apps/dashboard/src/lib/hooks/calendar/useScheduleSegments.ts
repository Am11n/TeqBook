import { useState, useEffect, useCallback, useRef } from "react";
import { useCurrentSalon } from "@/components/salon-provider";
import { getScheduleSegments } from "@/lib/repositories/schedule-segments";
import type { ScheduleSegment } from "@/lib/types";

interface UseScheduleSegmentsOptions {
  date: string;
  employeeIds?: string[] | null;
  enabled?: boolean;
}

export function useScheduleSegments({ date, employeeIds, enabled = true }: UseScheduleSegmentsOptions) {
  const { salon, isReady } = useCurrentSalon();
  const [segments, setSegments] = useState<ScheduleSegment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Simple cache: Map<"salonId_date", segments>
  const cacheRef = useRef<Map<string, ScheduleSegment[]>>(new Map());

  const fetchSegments = useCallback(async () => {
    if (!isReady || !salon?.id || !enabled) return;

    const cacheKey = `${salon.id}_${date}`;
    const cached = cacheRef.current.get(cacheKey);
    if (cached) {
      setSegments(cached);
      return;
    }

    setLoading(true);
    setError(null);

    const { data, error: fetchError } = await getScheduleSegments(
      salon.id,
      date,
      employeeIds
    );

    if (fetchError) {
      setError(fetchError);
      setLoading(false);
      return;
    }

    const result = data ?? [];
    cacheRef.current.set(cacheKey, result);
    setSegments(result);
    setLoading(false);
  }, [salon?.id, date, employeeIds, isReady, enabled]);

  useEffect(() => {
    fetchSegments();
  }, [fetchSegments]);

  /** Invalidate cache for a specific date (or all dates) and refetch */
  const invalidate = useCallback(
    (targetDate?: string) => {
      if (targetDate && salon?.id) {
        cacheRef.current.delete(`${salon.id}_${targetDate}`);
      } else {
        cacheRef.current.clear();
      }
      fetchSegments();
    },
    [salon?.id, fetchSegments]
  );

  /** Get segments for a specific employee */
  const segmentsForEmployee = useCallback(
    (employeeId: string) => segments.filter((s) => s.employee_id === employeeId),
    [segments]
  );

  /** Get working hours from segments for a specific employee */
  const workingHoursForEmployee = useCallback(
    (employeeId: string) => {
      const working = segments.filter(
        (s) => s.employee_id === employeeId && s.segment_type === "working"
      );
      if (working.length === 0) return null;
      return {
        start: working[0].start_time,
        end: working[working.length - 1].end_time,
      };
    },
    [segments]
  );

  /** Get earliest open and latest close across all employees (for grid range) */
  const gridRange = useCallback(() => {
    const workingSegments = segments.filter((s) => s.segment_type === "working");
    if (workingSegments.length === 0) return { startHour: 8, endHour: 20 };

    let earliest = 23;
    let latest = 0;

    for (const s of workingSegments) {
      const startHour = new Date(s.start_time).getHours();
      const endHour = new Date(s.end_time).getHours();
      const endMin = new Date(s.end_time).getMinutes();
      if (startHour < earliest) earliest = startHour;
      if (endHour > latest || (endHour === latest && endMin > 0)) latest = endMin > 0 ? endHour + 1 : endHour;
    }

    return {
      startHour: Math.max(0, earliest - 1),
      endHour: Math.min(24, latest + 1),
    };
  }, [segments]);

  return {
    segments,
    loading,
    error,
    invalidate,
    segmentsForEmployee,
    workingHoursForEmployee,
    gridRange,
  };
}
