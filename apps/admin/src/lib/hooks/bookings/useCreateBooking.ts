import { useState, useMemo, FormEvent, useEffect } from "react";
import { useCurrentSalon } from "@/components/salon-provider";
import { getAvailableSlots } from "@/lib/repositories/bookings";
import { createBooking } from "@/lib/services/bookings-service";
import { addProductToBooking, getProductsForBooking } from "@/lib/repositories/products";
import { localISOStringToUTC } from "@/lib/utils/timezone";
import type { Booking } from "@/lib/types";
import type { Product } from "@/lib/repositories/products";
import { useBookingValidation } from "./useBookingValidation";
import { useCustomerPrefill } from "./useCustomerPrefill";

interface UseCreateBookingOptions {
  employees: Array<{ id: string; full_name: string }>;
  services: Array<{ id: string; name: string }>;
  products: Product[];
  hasInventory: boolean;
  onBookingCreated: (booking: Booking) => void;
  translations: { invalidSlot: string; createError: string };
}

export function useCreateBooking({
  products, hasInventory, onBookingCreated, translations,
}: UseCreateBookingOptions) {
  const { salon } = useCurrentSalon();
  const [employeeId, setEmployeeId] = useState("");
  const [serviceId, setServiceId] = useState("");
  const [date, setDate] = useState<string>(() => new Date().toISOString().slice(0, 10));
  const [slots, setSlots] = useState<{ start: string; end: string; label: string }[]>([]);
  const [selectedSlot, setSelectedSlot] = useState("");
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [savingBooking, setSavingBooking] = useState(false);
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [isWalkIn, setIsWalkIn] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState<{ productId: string; quantity: number }[]>([]);
  const [error, setError] = useState<string | null>(null);

  const { fieldErrors, fieldValid, validateField, isFormValid, resetValidation } = useBookingValidation({
    employeeId, serviceId, selectedSlot, customerName, customerEmail, customerPhone,
  });

  const { existingCustomer, checkingCustomer, showQuickCreate, creatingCustomer, handleQuickCreateCustomer, resetCustomerState } = useCustomerPrefill(
    salon?.id, customerEmail, customerPhone, customerName,
    setCustomerName, setCustomerEmail, setCustomerPhone, setError,
  );

  const canLoadSlots = useMemo(
    () => !!(salon?.id && employeeId && serviceId && date),
    [salon?.id, employeeId, serviceId, date],
  );

  async function handleLoadSlots() {
    if (!canLoadSlots || !salon?.id) return;
    setLoadingSlots(true);
    setError(null);
    setSlots([]);
    setSelectedSlot("");

    const { data, error: rpcError } = await getAvailableSlots(salon.id, employeeId, serviceId, date);
    if (rpcError) { setError(rpcError); setLoadingSlots(false); return; }

    const mapped = (data ?? []).map((slot) => {
      const startMatch = slot.slot_start.match(/T(\d{2}):(\d{2})/);
      const endMatch = slot.slot_end.match(/T(\d{2}):(\d{2})/);
      if (startMatch && endMatch) {
        return { start: slot.slot_start, end: slot.slot_end, label: `${startMatch[1]}:${startMatch[2]} – ${endMatch[1]}:${endMatch[2]}` };
      }
      const start = new Date(slot.slot_start);
      const end = new Date(slot.slot_end);
      const label = `${start.getHours().toString().padStart(2, "0")}:${start.getMinutes().toString().padStart(2, "0")} – ${end.getHours().toString().padStart(2, "0")}:${end.getMinutes().toString().padStart(2, "0")}`;
      return { start: slot.slot_start, end: slot.slot_end, label };
    });

    setSlots(mapped);
    setLoadingSlots(false);
  }

  useEffect(() => {
    if (canLoadSlots && !loadingSlots && employeeId && serviceId && date) {
      setSlots([]);
      setSelectedSlot("");
      handleLoadSlots();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [employeeId, serviceId, date]);

  async function handleCreateBooking(e: FormEvent) {
    e.preventDefault();
    if (!salon?.id || !employeeId || !serviceId || !selectedSlot) return;
    setSavingBooking(true);
    setError(null);

    const slot = slots.find((s) => s.start === selectedSlot);
    if (!slot) { setError(translations.invalidSlot); setSavingBooking(false); return; }

    const salonTimezone = salon?.timezone || "UTC";
    let startTimeUTC = slot.start;
    if (salonTimezone !== "UTC") {
      try {
        const timeMatch = slot.start.match(/^(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2})/);
        if (timeMatch) startTimeUTC = localISOStringToUTC(timeMatch[1], salonTimezone);
      } catch { startTimeUTC = slot.start; }
    }

    const { data: bookingData, error: rpcError } = await createBooking({
      salon_id: salon.id, employee_id: employeeId, service_id: serviceId,
      start_time: startTimeUTC, customer_full_name: customerName,
      customer_email: customerEmail || null, customer_phone: customerPhone || null,
      customer_notes: null, is_walk_in: isWalkIn,
    });

    if (rpcError || !bookingData) {
      const isConflict = rpcError?.toLowerCase().includes("no longer available") || rpcError?.toLowerCase().includes("already booked") || rpcError?.toLowerCase().includes("time slot");
      setError(isConflict ? rpcError + " Please refresh available slots and try again." : rpcError ?? translations.createError);
      setSavingBooking(false);
      return;
    }

    let bookingWithProducts: Booking = { ...bookingData };
    if (selectedProducts.length > 0) {
      const { data: bookingProducts } = await getProductsForBooking(bookingData.id);
      bookingWithProducts = {
        ...bookingData,
        products: bookingProducts?.map((bp) => ({
          id: bp.id, product_id: bp.product_id, quantity: bp.quantity, price_cents: bp.price_cents,
          product: { id: bp.product.id, name: bp.product.name, price_cents: bp.product.price_cents },
        })) || null,
      } as Booking;
    }

    if (hasInventory && selectedProducts.length > 0 && bookingData.id) {
      for (const sp of selectedProducts) {
        const product = products.find((p) => p.id === sp.productId);
        if (product && sp.quantity > 0) await addProductToBooking(bookingData.id, sp.productId, sp.quantity, product.price_cents);
      }
    }

    onBookingCreated(bookingWithProducts);
    resetForm();
  }

  function resetForm() {
    setEmployeeId(""); setServiceId("");
    setDate(new Date().toISOString().slice(0, 10));
    setSlots([]); setSelectedSlot("");
    setCustomerName(""); setCustomerEmail(""); setCustomerPhone("");
    setIsWalkIn(false); setSelectedProducts([]);
    setError(null); resetValidation(); resetCustomerState();
  }

  return {
    employeeId, setEmployeeId, serviceId, setServiceId,
    date, setDate, slots, selectedSlot, setSelectedSlot,
    loadingSlots, savingBooking,
    customerName, setCustomerName, customerEmail, setCustomerEmail,
    customerPhone, setCustomerPhone, isWalkIn, setIsWalkIn,
    selectedProducts, setSelectedProducts, error, setError,
    fieldErrors, fieldValid, validateField, isFormValid,
    existingCustomer, checkingCustomer, showQuickCreate, creatingCustomer,
    handleQuickCreateCustomer, canLoadSlots,
    handleLoadSlots, handleCreateBooking, resetForm,
  };
}
