import { useState, useEffect } from "react";
import { useCurrentSalon } from "@/components/salon-provider";
import {
  getServicesForCurrentSalon,
  toggleServiceActive,
  deleteService,
} from "@/lib/repositories/services";
import type { Service } from "@/lib/types";

interface UseServicesOptions {
  translations: {
    noSalon: string;
  };
}

export function useServices({ translations }: UseServicesOptions) {
  const { salon, loading: salonLoading, error: salonError, isReady } = useCurrentSalon();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

    async function loadServices() {
      setLoading(true);
      setError(null);

      if (!salon?.id) {
        setError(translations.noSalon);
        setLoading(false);
        return;
      }

      const { data: servicesData, error: servicesError } = await getServicesForCurrentSalon(salon.id);

      if (servicesError) {
        setError(servicesError);
        setLoading(false);
        return;
      }

      setServices(servicesData || []);
      setLoading(false);
    }

    loadServices();
  }, [isReady, salon?.id, salonLoading, salonError, translations.noSalon]);

  const handleToggleActive = async (serviceId: string, currentStatus: boolean) => {
    if (!salon?.id) return;

    const { error: toggleError } = await toggleServiceActive(salon.id, serviceId, !currentStatus);

    if (toggleError) {
      setError(toggleError);
      return;
    }

    // Reload services
    const { data: servicesData } = await getServicesForCurrentSalon(salon.id);
    if (servicesData) {
      setServices(servicesData);
    }
  };

  const handleDelete = async (serviceId: string) => {
    if (!confirm("Are you sure you want to delete this service?")) return;
    if (!salon?.id) return;

    const { error: deleteError } = await deleteService(salon.id, serviceId);

    if (deleteError) {
      setError(deleteError);
      return;
    }

    // Reload services
    const { data: servicesData } = await getServicesForCurrentSalon(salon.id);
    if (servicesData) {
      setServices(servicesData);
    }
  };

  return {
    services,
    loading,
    error,
    setError,
    handleToggleActive,
    handleDelete,
    reloadServices: async () => {
      if (!salon?.id) return;
      const { data: servicesData } = await getServicesForCurrentSalon(salon.id);
      if (servicesData) {
        setServices(servicesData);
      }
    },
  };
}

