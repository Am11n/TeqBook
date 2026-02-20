import { useState, useCallback, useMemo } from "react";

export function useBookingValidation(deps: {
  employeeId: string;
  serviceId: string;
  selectedSlot: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
}) {
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [fieldValid, setFieldValid] = useState<Record<string, boolean>>({});

  const validateField = useCallback((field: string, value: string) => {
    const errors: Record<string, string> = {};
    const valid: Record<string, boolean> = {};

    switch (field) {
      case "customerName":
        if (!value || value.trim().length === 0) {
          errors.customerName = "Name is required";
          valid.customerName = false;
        } else {
          errors.customerName = "";
          valid.customerName = true;
        }
        break;
      case "customerEmail":
        if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          errors.customerEmail = "Invalid email format";
          valid.customerEmail = false;
        } else if (value) {
          errors.customerEmail = "";
          valid.customerEmail = true;
        }
        break;
      case "customerPhone":
        if (value && value.trim().length < 8) {
          errors.customerPhone = "Phone must be at least 8 characters";
          valid.customerPhone = false;
        } else if (value) {
          errors.customerPhone = "";
          valid.customerPhone = true;
        }
        break;
      case "employeeId":
        if (!value) { errors.employeeId = "Employee is required"; valid.employeeId = false; }
        else { errors.employeeId = ""; valid.employeeId = true; }
        break;
      case "serviceId":
        if (!value) { errors.serviceId = "Service is required"; valid.serviceId = false; }
        else { errors.serviceId = ""; valid.serviceId = true; }
        break;
      case "selectedSlot":
        if (!value) { errors.selectedSlot = "Time slot is required"; valid.selectedSlot = false; }
        else { errors.selectedSlot = ""; valid.selectedSlot = true; }
        break;
    }

    setFieldErrors((prev) => ({ ...prev, ...errors }));
    setFieldValid((prev) => ({ ...prev, ...valid }));
  }, []);

  const isFormValid = useMemo(() => {
    return !!(
      deps.employeeId &&
      deps.serviceId &&
      deps.selectedSlot &&
      deps.customerName.trim() &&
      (!deps.customerEmail || fieldValid.customerEmail !== false) &&
      (!deps.customerPhone || fieldValid.customerPhone !== false)
    );
  }, [deps.employeeId, deps.serviceId, deps.selectedSlot, deps.customerName, deps.customerEmail, deps.customerPhone, fieldValid]);

  const resetValidation = useCallback(() => {
    setFieldErrors({});
    setFieldValid({});
  }, []);

  return { fieldErrors, fieldValid, validateField, isFormValid, resetValidation };
}
