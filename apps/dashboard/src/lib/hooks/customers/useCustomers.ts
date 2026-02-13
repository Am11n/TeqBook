import { useState, useEffect, useCallback, useMemo } from "react";
import { useCurrentSalon } from "@/components/salon-provider";
import {
  getCustomersForCurrentSalon,
  deleteCustomer,
  createCustomer,
  findCustomerByEmailOrPhone,
} from "@/lib/repositories/customers";
import { getCustomerIssues } from "@/lib/setup/health";
import type { Customer, CreateCustomerInput } from "@/lib/types";

interface UseCustomersOptions {
  translations: {
    noSalon: string;
    loadError: string;
  };
}

export function useCustomers({ translations }: UseCustomersOptions) {
  const { salon, loading: salonLoading, error: salonError, isReady } =
    useCurrentSalon();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Search & filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilters, setActiveFilters] = useState<string[]>([]);

  const loadCustomers = useCallback(async () => {
    if (!salon?.id) return;
    setLoading(true);
    setError(null);

    const { data, error: loadError } = await getCustomersForCurrentSalon(
      salon.id,
      { pageSize: 500 },
    );

    if (loadError) {
      setError(loadError);
      setLoading(false);
      return;
    }

    setCustomers(data ?? []);
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
    loadCustomers();
  }, [isReady, salon?.id, salonLoading, salonError, translations.noSalon, loadCustomers]);

  // Filtered customers
  const filteredCustomers = useMemo(() => {
    let result = customers;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (c) =>
          c.full_name.toLowerCase().includes(q) ||
          c.email?.toLowerCase().includes(q) ||
          c.phone?.toLowerCase().includes(q),
      );
    }

    if (activeFilters.length > 0) {
      result = result.filter((c) => {
        for (const filter of activeFilters) {
          if (filter === "with_consent" && !c.gdpr_consent) return false;
          if (filter === "without_consent" && c.gdpr_consent) return false;
          if (filter === "with_contact" && !c.email && !c.phone) return false;
          if (
            filter === "without_contact" &&
            (c.email || c.phone)
          )
            return false;
        }
        return true;
      });
    }

    return result;
  }, [customers, searchQuery, activeFilters]);

  // Stats
  const stats = useMemo(() => {
    const total = customers.length;
    const withConsent = customers.filter((c) => c.gdpr_consent).length;
    const withoutConsent = total - withConsent;
    const withoutContact = customers.filter(
      (c) => !c.email && !c.phone,
    ).length;
    return { total, withConsent, withoutConsent, withoutContact };
  }, [customers]);

  const handleDelete = async (customerId: string) => {
    if (!confirm("Er du sikker pa at du vil slette denne kunden?")) return;
    if (!salon?.id) return;

    const { error: deleteError } = await deleteCustomer(salon.id, customerId);
    if (deleteError) {
      setError(deleteError);
      return;
    }
    setCustomers((prev) => prev.filter((c) => c.id !== customerId));
  };

  // Import batch
  const importCustomers = async (
    rows: Omit<CreateCustomerInput, "salon_id">[],
    updateExisting: boolean,
  ): Promise<{
    created: number;
    skipped: number;
    updated: number;
    errors: number;
  }> => {
    if (!salon?.id)
      return { created: 0, skipped: 0, updated: 0, errors: 0 };

    let created = 0;
    let skipped = 0;
    let updated = 0;
    let errors = 0;

    for (const row of rows) {
      // Normalize
      const email = row.email?.toLowerCase().trim() || null;
      const phone = row.phone
        ?.replace(/[\s\-()]/g, "")
        .replace(/^(\d{8})$/, "+47$1") || null;

      // Duplicate check
      const { data: existing } = await findCustomerByEmailOrPhone(
        salon.id,
        email,
        phone,
      );

      if (existing) {
        if (updateExisting) {
          // TODO: update existing customer with new data
          updated++;
        } else {
          skipped++;
        }
        continue;
      }

      const { error: createError } = await createCustomer({
        salon_id: salon.id,
        full_name: row.full_name,
        email,
        phone,
        notes: row.notes,
        gdpr_consent: row.gdpr_consent,
      });

      if (createError) {
        errors++;
      } else {
        created++;
      }
    }

    await loadCustomers();
    return { created, skipped, updated, errors };
  };

  return {
    customers,
    filteredCustomers,
    loading,
    error,
    setError,
    loadCustomers,
    handleDelete,
    importCustomers,
    stats,
    searchQuery,
    setSearchQuery,
    activeFilters,
    setActiveFilters,
  };
}
