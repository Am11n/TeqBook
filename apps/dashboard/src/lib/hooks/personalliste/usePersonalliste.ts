"use client";

import { useState, useEffect, useCallback } from "react";
import { getPersonallisteEntriesForSalon } from "@/lib/services/personalliste-service";
import type { PersonallisteEntry } from "@/lib/types/domain";

export function usePersonalliste(
  salonId: string | null,
  dateFrom: string,
  dateTo: string
) {
  const [entries, setEntries] = useState<PersonallisteEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadEntries = useCallback(async () => {
    if (!salonId || !dateFrom || !dateTo) {
      setEntries([]);
      return;
    }
    setLoading(true);
    setError(null);
    const { data, error: err } = await getPersonallisteEntriesForSalon(salonId, {
      dateFrom,
      dateTo,
    });
    setLoading(false);
    if (err) {
      setError(err);
      setEntries([]);
      return;
    }
    setEntries(data ?? []);
  }, [salonId, dateFrom, dateTo]);

  useEffect(() => {
    loadEntries();
  }, [loadEntries]);

  return { entries, loading, error, loadEntries, setError };
}
