import { useState, useEffect, useCallback, type Dispatch, type SetStateAction } from "react";
import { findCustomerByEmailOrPhone, createCustomer } from "@/lib/services/customers-service";
import type { Customer } from "@/lib/types";

export function useCustomerPrefill(
  salonId: string | undefined,
  customerEmail: string,
  customerPhone: string,
  customerName: string,
  setCustomerName: Dispatch<SetStateAction<string>>,
  setCustomerEmail: Dispatch<SetStateAction<string>>,
  setCustomerPhone: Dispatch<SetStateAction<string>>,
  setError: (v: string | null) => void,
) {
  const [existingCustomer, setExistingCustomer] = useState<Customer | null>(null);
  const [checkingCustomer, setCheckingCustomer] = useState(false);
  const [showQuickCreate, setShowQuickCreate] = useState(false);
  const [creatingCustomer, setCreatingCustomer] = useState(false);

  useEffect(() => {
    if (!salonId) return;
    
    const email = customerEmail.trim();
    const phone = customerPhone.trim();
    
    if (!email && !phone) {
      setExistingCustomer(null);
      setShowQuickCreate(false);
      return;
    }

    const timeoutId = setTimeout(async () => {
      setCheckingCustomer(true);
      const { data, error } = await findCustomerByEmailOrPhone(salonId, email || null, phone || null);
      
      if (error) { setCheckingCustomer(false); return; }

      if (data) {
        setExistingCustomer(data);
        setShowQuickCreate(false);
        setCustomerName((prev: string) => prev || data.full_name);
        setCustomerEmail((prev: string) => prev || data.email || "");
        setCustomerPhone((prev: string) => prev || data.phone || "");
      } else {
        setExistingCustomer(null);
        setShowQuickCreate(!!(email || phone));
      }
      setCheckingCustomer(false);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [customerEmail, customerPhone, salonId, setCustomerName, setCustomerEmail, setCustomerPhone]);

  const handleQuickCreateCustomer = useCallback(async () => {
    if (!salonId || !customerName.trim()) return;

    setCreatingCustomer(true);
    const { data, error } = await createCustomer({
      salon_id: salonId,
      full_name: customerName.trim(),
      email: customerEmail.trim() || null,
      phone: customerPhone.trim() || null,
      notes: null,
      gdpr_consent: true,
    });

    if (error || !data) {
      setError(error || "Failed to create customer");
      setCreatingCustomer(false);
      return;
    }

    setExistingCustomer(data);
    setShowQuickCreate(false);
    setCreatingCustomer(false);
  }, [salonId, customerName, customerEmail, customerPhone, setError]);

  const resetCustomerState = useCallback(() => {
    setExistingCustomer(null);
    setShowQuickCreate(false);
  }, []);

  return {
    existingCustomer, checkingCustomer,
    showQuickCreate, creatingCustomer,
    handleQuickCreateCustomer, resetCustomerState,
  };
}
