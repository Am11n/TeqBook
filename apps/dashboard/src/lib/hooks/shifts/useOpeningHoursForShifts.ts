import { useState, useEffect, useCallback, useMemo } from "react";
import { useCurrentSalon } from "@/components/salon-provider";
import {
  getOpeningHoursForSalon,
  getBreaksForSalon,
  type OpeningHour,
  type BreakRow,
} from "@/lib/repositories/opening-hours";

/**
 * Hook that fetches opening hours + breaks for the salon
 * and exposes conflict-detection helpers for the shifts page.
 */
export function useOpeningHoursForShifts() {
  const { salon, isReady } = useCurrentSalon();
  const [openingHours, setOpeningHours] = useState<OpeningHour[]>([]);
  const [breaks, setBreaks] = useState<BreakRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isReady || !salon?.id) {
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);

    Promise.all([
      getOpeningHoursForSalon(salon.id),
      getBreaksForSalon(salon.id),
    ]).then(([hoursRes, breaksRes]) => {
      if (cancelled) return;
      setOpeningHours(hoursRes.data ?? []);
      setBreaks(breaksRes.data ?? []);
      setLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, [isReady, salon?.id]);

  /** Map from day_of_week (0-6) -> OpeningHour */
  const hoursByDay = useMemo(() => {
    const map = new Map<number, OpeningHour>();
    for (const oh of openingHours) {
      map.set(oh.day_of_week, oh);
    }
    return map;
  }, [openingHours]);

  /** Map from day_of_week (0-6) -> BreakRow[] */
  const breaksByDay = useMemo(() => {
    const map = new Map<number, BreakRow[]>();
    for (const b of breaks) {
      const list = map.get(b.day_of_week) ?? [];
      list.push(b);
      map.set(b.day_of_week, list);
    }
    return map;
  }, [breaks]);

  /**
   * Returns true if a shift's time range is outside the salon's opening hours
   * for the given weekday.
   */
  const isOutsideOpeningHours = useCallback(
    (weekday: number, startTime: string, endTime: string): boolean => {
      const oh = hoursByDay.get(weekday);
      if (!oh) return true; // No opening hours defined -> outside
      if (oh.is_closed) return true; // Salon is closed that day
      return startTime < oh.open_time || endTime > oh.close_time;
    },
    [hoursByDay]
  );

  /**
   * Returns the breaks for a specific weekday.
   */
  const getBreaksForDay = useCallback(
    (weekday: number): BreakRow[] => {
      return breaksByDay.get(weekday) ?? [];
    },
    [breaksByDay]
  );

  /**
   * Returns opening hours for a specific weekday (or null if closed/undefined).
   */
  const getOpeningHoursForDay = useCallback(
    (weekday: number): OpeningHour | null => {
      const oh = hoursByDay.get(weekday);
      if (!oh || oh.is_closed) return null;
      return oh;
    },
    [hoursByDay]
  );

  return {
    openingHours,
    breaks,
    loading,
    isOutsideOpeningHours,
    getBreaksForDay,
    getOpeningHoursForDay,
  };
}
