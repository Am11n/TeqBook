import { useState, useMemo, FormEvent, useEffect, useCallback } from "react";
import { useCurrentSalon } from "@/components/salon-provider";
import { getAvailableSlots } from "@/lib/repositories/bookings";
import { createBooking } from "@/lib/services/bookings-service";
import { addProductToBooking, getProductsForBooking } from "@/lib/repositories/products";
import { findCustomerByEmailOrPhone, createCustomer } from "@/lib/services/customers-service";
import { localISOStringToUTC } from "@/lib/utils/timezone";
import type { Booking, Customer } from "@/lib/types";
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
  
  // Validation state
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [fieldValid, setFieldValid] = useState<Record<string, boolean>>({});
  
  // Customer prefill state
  const [existingCustomer, setExistingCustomer] = useState<Customer | null>(null);
  const [checkingCustomer, setCheckingCustomer] = useState(false);
  const [showQuickCreate, setShowQuickCreate] = useState(false);
  const [creatingCustomer, setCreatingCustomer] = useState(false);

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

  // Auto-load slots when employee, service, and date are selected
  // Reset slots when date changes to ensure we load fresh slots for the new date
  useEffect(() => {
    if (canLoadSlots && !loadingSlots && employeeId && serviceId && date) {
      // Clear existing slots and selected slot when date changes
      setSlots([]);
      setSelectedSlot("");
      handleLoadSlots();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [employeeId, serviceId, date]); // Auto-load when these change

  // Validate fields inline
  const validateField = useCallback((field: string, value: string) => {
    const errors: Record<string, string> = {};
    const valid: Record<string, boolean> = {};

    switch (field) {
      case "customerName":
        if (!value || value.trim().length === 0) {
          errors.customerName = "Name is required";
          valid.customerName = false;
        } else {
          errors.customerName = ""; // Clear error when valid
          valid.customerName = true;
        }
        break;
      case "customerEmail":
        if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          errors.customerEmail = "Invalid email format";
          valid.customerEmail = false;
        } else if (value) {
          errors.customerEmail = ""; // Clear error when valid
          valid.customerEmail = true;
        }
        break;
      case "customerPhone":
        if (value && value.trim().length < 8) {
          errors.customerPhone = "Phone must be at least 8 characters";
          valid.customerPhone = false;
        } else if (value) {
          errors.customerPhone = ""; // Clear error when valid
          valid.customerPhone = true;
        }
        break;
      case "employeeId":
        if (!value) {
          errors.employeeId = "Employee is required";
          valid.employeeId = false;
        } else {
          errors.employeeId = ""; // Clear error when valid
          valid.employeeId = true;
        }
        break;
      case "serviceId":
        if (!value) {
          errors.serviceId = "Service is required";
          valid.serviceId = false;
        } else {
          errors.serviceId = ""; // Clear error when valid
          valid.serviceId = true;
        }
        break;
      case "selectedSlot":
        if (!value) {
          errors.selectedSlot = "Time slot is required";
          valid.selectedSlot = false;
        } else {
          errors.selectedSlot = ""; // Clear error when valid
          valid.selectedSlot = true;
        }
        break;
    }

    setFieldErrors((prev) => ({ ...prev, ...errors }));
    setFieldValid((prev) => ({ ...prev, ...valid }));
  }, []);

  // Check for existing customer when email or phone changes
  useEffect(() => {
    if (!salon?.id) return;
    
    const email = customerEmail.trim();
    const phone = customerPhone.trim();
    
    if (!email && !phone) {
      setExistingCustomer(null);
      setShowQuickCreate(false);
      return;
    }

    // Debounce customer lookup
    const timeoutId = setTimeout(async () => {
      setCheckingCustomer(true);
      const { data, error } = await findCustomerByEmailOrPhone(salon.id, email || null, phone || null);
      
      if (error) {
        setCheckingCustomer(false);
        return;
      }

      if (data) {
        setExistingCustomer(data);
        setShowQuickCreate(false);
        // Prefill customer data only if fields are empty
        setCustomerName((prev) => prev || data.full_name);
        setCustomerEmail((prev) => prev || data.email || "");
        setCustomerPhone((prev) => prev || data.phone || "");
      } else {
        setExistingCustomer(null);
        // Show quick create if we have email or phone but no customer found
        if (email || phone) {
          setShowQuickCreate(true);
        } else {
          setShowQuickCreate(false);
        }
      }
      setCheckingCustomer(false);
    }, 500); // 500ms debounce

    return () => clearTimeout(timeoutId);
  }, [customerEmail, customerPhone, salon?.id]);

  // Quick create customer
  const handleQuickCreateCustomer = useCallback(async () => {
    if (!salon?.id || !customerName.trim()) return;

    setCreatingCustomer(true);
    const { data, error } = await createCustomer({
      salon_id: salon.id,
      full_name: customerName.trim(),
      email: customerEmail.trim() || null,
      phone: customerPhone.trim() || null,
      notes: null,
      gdpr_consent: true, // Assume consent for quick create
    });

    if (error || !data) {
      setError(error || "Failed to create customer");
      setCreatingCustomer(false);
      return;
    }

    setExistingCustomer(data);
    setShowQuickCreate(false);
    setCreatingCustomer(false);
  }, [salon?.id, customerName, customerEmail, customerPhone]);

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

    // Convert the slot time from salon timezone to UTC
    // IMPORTANT: slot.start from getAvailableSlots may have a timezone (+00:00 or Z),
    // but we need to interpret the TIME part (e.g., 14:00) as local time in the salon's timezone,
    // not as UTC. So we extract the time components and convert from salon timezone to UTC.
    const salonTimezone = salon?.timezone || "UTC";
    let startTimeUTC = slot.start;
    
    // Always convert if timezone is not UTC
    // We need to extract the time components and interpret them as local time in salon timezone
    if (salonTimezone !== "UTC") {
      try {
        // Extract the date/time part, ignoring any timezone suffix
        const timeMatch = slot.start.match(/^(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2})/);
        if (timeMatch) {
          const timeWithoutTz = timeMatch[1];
          startTimeUTC = localISOStringToUTC(timeWithoutTz, salonTimezone);
        }
      } catch (error) {
        console.warn("Failed to convert slot time to UTC, using as-is:", error);
        // Fallback: use as-is
        startTimeUTC = slot.start;
      }
    }

    const { data: bookingData, error: rpcError } = await createBooking({
      salon_id: salon.id,
      employee_id: employeeId,
      service_id: serviceId,
      start_time: startTimeUTC,
      customer_full_name: customerName,
      customer_email: customerEmail || null,
      customer_phone: customerPhone || null,
      customer_notes: null,
      is_walk_in: isWalkIn,
    });

    if (rpcError || !bookingData) {
      // Check if this is a conflict error (time slot no longer available)
      const isConflictError = rpcError?.toLowerCase().includes("no longer available") ||
                             rpcError?.toLowerCase().includes("already booked") ||
                             rpcError?.toLowerCase().includes("time slot");
      
      if (isConflictError) {
        // For conflict errors, suggest refreshing slots
        setError(
          rpcError + " Please refresh available slots and try again."
        );
        // Optionally auto-refresh slots
        // await handleLoadSlots();
      } else {
        setError(rpcError ?? translations.createError);
      }
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
    setFieldErrors({});
    setFieldValid({});
    setExistingCustomer(null);
    setShowQuickCreate(false);
  }

  // Check if form is valid
  const isFormValid = useMemo(() => {
    return !!(
      employeeId &&
      serviceId &&
      selectedSlot &&
      customerName.trim() &&
      (!customerEmail || fieldValid.customerEmail !== false) &&
      (!customerPhone || fieldValid.customerPhone !== false)
    );
  }, [employeeId, serviceId, selectedSlot, customerName, customerEmail, customerPhone, fieldValid]);

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
    // Validation
    fieldErrors,
    fieldValid,
    validateField,
    isFormValid,
    // Customer prefill
    existingCustomer,
    checkingCustomer,
    showQuickCreate,
    creatingCustomer,
    handleQuickCreateCustomer,
    // Computed
    canLoadSlots,
    // Actions
    handleLoadSlots,
    handleCreateBooking,
    resetForm,
  };
}

