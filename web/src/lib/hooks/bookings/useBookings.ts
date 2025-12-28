import { useState, useEffect, useCallback } from "react";
import { useCurrentSalon } from "@/components/salon-provider";
import { useFeatures } from "@/lib/hooks/use-features";
import {
  getBookingsForCurrentSalon,
  getAvailableSlots,
  createBooking,
} from "@/lib/repositories/bookings";
import { cancelBooking } from "@/lib/services/bookings-service";
import { getEmployeesForCurrentSalon } from "@/lib/repositories/employees";
import { getActiveServicesForCurrentSalon } from "@/lib/repositories/services";
import { getProductsForSalon } from "@/lib/services/products-service";
import { addProductToBooking, getProductsForBooking } from "@/lib/repositories/products";
import { getShiftsForCurrentSalon } from "@/lib/repositories/shifts";
import type { Booking, Shift } from "@/lib/types";
import type { Product } from "@/lib/repositories/products";

interface UseBookingsOptions {
  translations: {
    noSalon: string;
    loadError: string;
    invalidSlot: string;
    createError: string;
  };
}

export function useBookings({ translations }: UseBookingsOptions) {
  const { salon, loading: salonLoading, error: salonError, isReady } = useCurrentSalon();
  const { hasFeature, loading: featuresLoading } = useFeatures();
  const [mounted, setMounted] = useState(false);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [employees, setEmployees] = useState<{ id: string; full_name: string }[]>([]);
  const [services, setServices] = useState<{ id: string; name: string }[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const loadBookings = useCallback(async () => {
    setLoading(true);
    setError(null);

    if (!salon?.id) {
      setError(translations.noSalon);
      setLoading(false);
      return;
    }

    const [
      { data: bookingsData, error: bookingsError },
      { data: employeesData, error: employeesError },
      { data: servicesData, error: servicesError },
      { data: productsData, error: productsError },
      { data: shiftsData, error: shiftsError },
    ] = await Promise.all([
      getBookingsForCurrentSalon(salon.id),
      getEmployeesForCurrentSalon(salon.id),
      getActiveServicesForCurrentSalon(salon.id),
      // Only load products if INVENTORY feature is available
      mounted && hasFeature("INVENTORY")
        ? getProductsForSalon(salon.id, { activeOnly: true })
        : Promise.resolve({ data: [], error: null }),
      getShiftsForCurrentSalon(salon.id),
    ]);

    const hasInventoryFeature = mounted && hasFeature("INVENTORY");
    if (
      bookingsError ||
      employeesError ||
      servicesError ||
      (hasInventoryFeature && productsError) ||
      shiftsError
    ) {
      setError(
        bookingsError ??
          employeesError ??
          servicesError ??
          (hasInventoryFeature ? productsError : null) ??
          shiftsError ??
          translations.loadError
      );
      setLoading(false);
      return;
    }

    // Load products for each booking only if INVENTORY feature is available
    const bookingsWithProducts = await Promise.all(
      (bookingsData ?? []).map(async (booking) => {
        if (hasInventoryFeature) {
          const { data: bookingProducts } = await getProductsForBooking(booking.id);
          return {
            ...booking,
            products: bookingProducts?.map((bp) => ({
              id: bp.id,
              product_id: bp.product_id,
              quantity: bp.quantity,
              price_cents: bp.price_cents,
              product: {
                id: bp.product.id,
                name: bp.product.name,
                price_cents: bp.product.price_cents,
              },
            })) || null,
          };
        }
        return { ...booking, products: null };
      })
    );
    setBookings(bookingsWithProducts);
    setEmployees((employeesData ?? []).map((e) => ({ id: e.id, full_name: e.full_name })));
    setServices((servicesData ?? []).map((s) => ({ id: s.id, name: s.name })));
    // Only set products if INVENTORY feature is available
    if (mounted && hasFeature("INVENTORY")) {
      setProducts(productsData ?? []);
    } else {
      setProducts([]);
    }
    setShifts(shiftsData ?? []);
    setLoading(false);
  }, [salon?.id, mounted, hasFeature, translations.noSalon, translations.loadError]);

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

    loadBookings();
  }, [isReady, salon?.id, salonLoading, salonError, translations.noSalon, loadBookings]);

  const hasInventory = mounted && hasFeature("INVENTORY");

  const addBooking = useCallback((booking: Booking) => {
    setBookings((prev) => [...prev, booking]);
  }, []);

  return {
    bookings,
    employees,
    services,
    products,
    shifts,
    loading: loading || featuresLoading,
    error,
    hasInventory,
    loadBookings,
    addBooking,
    setError,
  };
}

