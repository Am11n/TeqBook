import { useState, useMemo, FormEvent } from "react";
import { useCurrentSalon } from "@/components/salon-provider";
import { getAvailableSlots } from "@/lib/repositories/bookings";
import { createBooking } from "@/lib/services/bookings-service";
import { addProductToBooking, getProductsForBooking } from "@/lib/repositories/products";
import type { Booking } from "@/lib/types";
import type { Product } from "@/lib/repositories/products";

interface UseCreateBookingOptions {
  employees: Array<{ id: string; full_name: string }>;
  services: Array<{ id: string; name: string }>;
  products: Product[];
  hasInventory: boolean;
  onBookingCreated: (booking: Booking) => void;
  translations: {
    invalidSlot: string;
    createError: string;
  };
}

export function useCreateBooking({
  employees,
  services,
  products,
  hasInventory,
  onBookingCreated,
  translations,
}: UseCreateBookingOptions) {
  const { salon } = useCurrentSalon();
  const [employeeId, setEmployeeId] = useState("");
  const [serviceId, setServiceId] = useState("");
  const [date, setDate] = useState<string>(() =>
    new Date().toISOString().slice(0, 10)
  );
  const [slots, setSlots] = useState<
    { start: string; end: string; label: string }[]
  >([]);
  const [selectedSlot, setSelectedSlot] = useState("");
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [savingBooking, setSavingBooking] = useState(false);
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [isWalkIn, setIsWalkIn] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState<
    { productId: string; quantity: number }[]
  >([]);
  const [error, setError] = useState<string | null>(null);

  const canLoadSlots = useMemo(
    () => !!(salon?.id && employeeId && serviceId && date),
    [salon?.id, employeeId, serviceId, date]
  );

  async function handleLoadSlots() {
    if (!canLoadSlots || !salon?.id) return;
    setLoadingSlots(true);
    setError(null);
    setSlots([]);
    setSelectedSlot("");

    const { data, error: rpcError } = await getAvailableSlots(
      salon.id,
      employeeId,
      serviceId,
      date
    );

    if (rpcError) {
      setError(rpcError);
      setLoadingSlots(false);
      return;
    }

    const mapped = (data ?? []).map((slot) => {
      // Extract time components directly from the ISO string to avoid timezone conversion
      const startMatch = slot.slot_start.match(/T(\d{2}):(\d{2})/);
      const endMatch = slot.slot_end.match(/T(\d{2}):(\d{2})/);

      if (startMatch && endMatch) {
        // Use the time directly from the string to avoid timezone conversion
        const label = `${startMatch[1]}:${startMatch[2]} – ${endMatch[1]}:${endMatch[2]}`;
        return { start: slot.slot_start, end: slot.slot_end, label };
      }

      // Fallback to local time formatting if regex doesn't match
      const start = new Date(slot.slot_start);
      const end = new Date(slot.slot_end);
      const startHours = start.getHours().toString().padStart(2, "0");
      const startMinutes = start.getMinutes().toString().padStart(2, "0");
      const endHours = end.getHours().toString().padStart(2, "0");
      const endMinutes = end.getMinutes().toString().padStart(2, "0");

      const label = `${startHours}:${startMinutes} – ${endHours}:${endMinutes}`;
      return { start: slot.slot_start, end: slot.slot_end, label };
    });

    setSlots(mapped);
    setLoadingSlots(false);
  }

  async function handleCreateBooking(e: FormEvent) {
    e.preventDefault();
    if (!salon?.id || !employeeId || !serviceId || !selectedSlot) return;

    setSavingBooking(true);
    setError(null);

    const slot = slots.find((s) => s.start === selectedSlot);
    if (!slot) {
      setError(translations.invalidSlot);
      setSavingBooking(false);
      return;
    }

    const { data: bookingData, error: rpcError } = await createBooking({
      salon_id: salon.id,
      employee_id: employeeId,
      service_id: serviceId,
      start_time: slot.start,
      customer_full_name: customerName,
      customer_email: customerEmail || null,
      customer_phone: customerPhone || null,
      customer_notes: null,
      is_walk_in: isWalkIn,
    });

    if (rpcError || !bookingData) {
      setError(rpcError ?? translations.createError);
      setSavingBooking(false);
      return;
    }

    // Hent produkter for den nye bookingen
    let bookingWithProducts: Booking = { ...bookingData };
    if (selectedProducts.length > 0) {
      const { data: bookingProducts } = await getProductsForBooking(bookingData.id);
      bookingWithProducts = {
        ...bookingData,
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
      } as Booking;
    }

    // Legg til produkter hvis noen er valgt og INVENTORY feature er tilgjengelig
    if (hasInventory && selectedProducts.length > 0 && bookingData.id) {
      for (const selectedProduct of selectedProducts) {
        const product = products.find((p) => p.id === selectedProduct.productId);
        if (product && selectedProduct.quantity > 0) {
          await addProductToBooking(
            bookingData.id,
            selectedProduct.productId,
            selectedProduct.quantity,
            product.price_cents
          );
        }
      }
    }

    // Callback to notify parent
    onBookingCreated(bookingWithProducts);

    // Reset form
    setEmployeeId("");
    setServiceId("");
    setDate(new Date().toISOString().slice(0, 10));
    setSlots([]);
    setSelectedSlot("");
    setCustomerName("");
    setCustomerEmail("");
    setCustomerPhone("");
    setIsWalkIn(false);
    setSelectedProducts([]);
    setSavingBooking(false);
  }

  function resetForm() {
    setEmployeeId("");
    setServiceId("");
    setDate(new Date().toISOString().slice(0, 10));
    setSlots([]);
    setSelectedSlot("");
    setCustomerName("");
    setCustomerEmail("");
    setCustomerPhone("");
    setIsWalkIn(false);
    setSelectedProducts([]);
    setError(null);
  }

  return {
    // State
    employeeId,
    setEmployeeId,
    serviceId,
    setServiceId,
    date,
    setDate,
    slots,
    selectedSlot,
    setSelectedSlot,
    loadingSlots,
    savingBooking,
    customerName,
    setCustomerName,
    customerEmail,
    setCustomerEmail,
    customerPhone,
    setCustomerPhone,
    isWalkIn,
    setIsWalkIn,
    selectedProducts,
    setSelectedProducts,
    error,
    setError,
    // Computed
    canLoadSlots,
    // Actions
    handleLoadSlots,
    handleCreateBooking,
    resetForm,
  };
}

