import { useState, useEffect, useCallback, useMemo } from "react";
import { useCurrentSalon } from "@/components/salon-provider";
import {
  getServicesForCurrentSalon,
  toggleServiceActive,
  deleteService,
  updateService,
} from "@/lib/repositories/services";
import { supabase } from "@/lib/supabase-client";
import type { Service } from "@/lib/types";

interface UseServicesOptions {
  translations: {
    noSalon: string;
  };
}

export function useServices({ translations }: UseServicesOptions) {
  const { salon, loading: salonLoading, error: salonError, isReady } =
    useCurrentSalon();
  const [services, setServices] = useState<Service[]>([]);
  const [serviceEmployeeCountMap, setServiceEmployeeCountMap] = useState<
    Record<string, number>
  >({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Search & filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilters, setActiveFilters] = useState<string[]>([]);

  const loadServices = useCallback(async () => {
    if (!salon?.id) return;
    setLoading(true);
    setError(null);

    const [
      { data: servicesData, error: servicesError },
      { data: empSvcData, error: empSvcError },
    ] = await Promise.all([
      getServicesForCurrentSalon(salon.id),
      supabase
        .from("employee_services")
        .select("service_id")
        .eq("salon_id", salon.id),
    ]);

    if (servicesError) {
      setError(servicesError);
      setLoading(false);
      return;
    }

    // Build per-service employee count
    const countMap: Record<string, number> = {};
    if (empSvcData) {
      for (const row of empSvcData) {
        countMap[row.service_id] = (countMap[row.service_id] ?? 0) + 1;
      }
    }

    setServices(servicesData || []);
    setServiceEmployeeCountMap(countMap);
    setLoading(false);
  }, [salon?.id]);

  useEffect(() => {
    if (!isReady) {
      if (salonError) setError(salonError);
      else if (salonLoading) setLoading(true);
      else {
        setError(translations.noSalon);
        setLoading(false);
      }
      return;
    }
    loadServices();
  }, [isReady, salon?.id, salonLoading, salonError, translations.noSalon, loadServices]);

  // Filtered services
  const filteredServices = useMemo(() => {
    let result = services;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          (s.category ?? "").toLowerCase().includes(q),
      );
    }

    if (activeFilters.length > 0) {
      result = result.filter((s) => {
        for (const filter of activeFilters) {
          if (filter === "active" && !s.is_active) return false;
          if (filter === "inactive" && s.is_active) return false;
          // Category filters
          if (
            ["cut", "beard", "color", "nails", "massage", "other"].includes(
              filter,
            )
          ) {
            if ((s.category ?? "other") !== filter) return false;
          }
        }
        return true;
      });
    }

    return result;
  }, [services, searchQuery, activeFilters]);

  // Stats
  const stats = useMemo(() => {
    const total = services.length;
    const active = services.filter((s) => s.is_active).length;
    const categories = new Set(services.map((s) => s.category ?? "other")).size;
    const withoutEmployees = services.filter(
      (s) => (serviceEmployeeCountMap[s.id] ?? 0) === 0,
    ).length;
    return { total, active, categories, withoutEmployees };
  }, [services, serviceEmployeeCountMap]);

  // Category counts
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const s of services) {
      const cat = s.category ?? "other";
      counts[cat] = (counts[cat] ?? 0) + 1;
    }
    return counts;
  }, [services]);

  const handleToggleActive = async (
    serviceId: string,
    currentStatus: boolean,
  ) => {
    if (!salon?.id) return;

    // Optimistic
    setServices((prev) =>
      prev.map((s) =>
        s.id === serviceId ? { ...s, is_active: !currentStatus } : s,
      ),
    );

    const { error: toggleError } = await toggleServiceActive(
      salon.id,
      serviceId,
      currentStatus,
    );

    if (toggleError) {
      setServices((prev) =>
        prev.map((s) =>
          s.id === serviceId ? { ...s, is_active: currentStatus } : s,
        ),
      );
      setError(toggleError);
    }
  };

  const handleDelete = async (serviceId: string) => {
    if (!confirm("Er du sikker pa at du vil slette denne tjenesten?")) return;
    if (!salon?.id) return;

    const { error: deleteError } = await deleteService(salon.id, serviceId);
    if (deleteError) {
      setError(deleteError);
      return;
    }
    setServices((prev) => prev.filter((s) => s.id !== serviceId));
  };

  const handleReorder = async (serviceId: string, direction: "up" | "down") => {
    if (!salon?.id) return;
    const idx = services.findIndex((s) => s.id === serviceId);
    if (idx === -1) return;
    const swapIdx = direction === "up" ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= services.length) return;

    const currentOrder = services[idx].sort_order ?? idx;
    const swapOrder = services[swapIdx].sort_order ?? swapIdx;

    // Optimistic swap
    setServices((prev) => {
      const next = [...prev];
      next[idx] = { ...next[idx], sort_order: swapOrder };
      next[swapIdx] = { ...next[swapIdx], sort_order: currentOrder };
      return next.sort(
        (a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0),
      );
    });

    await Promise.all([
      updateService(salon.id, services[idx].id, { sort_order: swapOrder }),
      updateService(salon.id, services[swapIdx].id, {
        sort_order: currentOrder,
      }),
    ]);
  };

  const bulkUpdatePrices = async (
    serviceIds: string[],
    transform: (priceCents: number) => number,
  ) => {
    if (!salon?.id) return;

    const updates = serviceIds.map((id) => {
      const svc = services.find((s) => s.id === id);
      if (!svc) return null;
      const newPrice = transform(svc.price_cents);
      return { id, price_cents: newPrice };
    }).filter(Boolean) as { id: string; price_cents: number }[];

    // Optimistic
    setServices((prev) =>
      prev.map((s) => {
        const u = updates.find((up) => up.id === s.id);
        return u ? { ...s, price_cents: u.price_cents } : s;
      }),
    );

    for (const u of updates) {
      await updateService(salon.id, u.id, { price_cents: u.price_cents });
    }
  };

  return {
    services,
    filteredServices,
    serviceEmployeeCountMap,
    loading,
    error,
    setError,
    reloadServices: loadServices,
    handleToggleActive,
    handleDelete,
    handleReorder,
    bulkUpdatePrices,
    stats,
    categoryCounts,
    searchQuery,
    setSearchQuery,
    activeFilters,
    setActiveFilters,
  };
}
