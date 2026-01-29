import { useState, useEffect } from "react";
import { useCurrentSalon } from "@/components/salon-provider";
import { updateEmployee } from "@/lib/services/employees-service";
import type { Employee, Service, UpdateEmployeeInput } from "@/lib/types";

interface UseEditEmployeeOptions {
  employee: Employee | null;
  employeeServices: Service[];
  onEmployeeUpdated: () => Promise<void>;
  onClose: () => void;
}

export function useEditEmployee({
  employee,
  employeeServices,
  onEmployeeUpdated,
  onClose,
}: UseEditEmployeeOptions) {
  const { salon } = useCurrentSalon();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState("");
  const [preferredLanguage, setPreferredLanguage] = useState("nb");
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reset form when employee changes
  useEffect(() => {
    if (employee) {
      setFullName(employee.full_name || "");
      setEmail(employee.email || "");
      setPhone(employee.phone || "");
      setRole(employee.role || "");
      setPreferredLanguage(employee.preferred_language || "nb");
      setSelectedServices(employeeServices.map((s) => s.id));
      setError(null);
    }
  }, [employee, employeeServices]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!salon?.id || !employee?.id || !fullName.trim()) {
      setError("Navn er påkrevd");
      return;
    }

    setSaving(true);
    setError(null);

    const input: UpdateEmployeeInput = {
      full_name: fullName.trim(),
      email: email.trim() || null,
      phone: phone.trim() || null,
      role: role.trim() || null,
      preferred_language: preferredLanguage,
      service_ids: selectedServices,
    };

    const { error: updateError } = await updateEmployee(
      salon.id,
      employee.id,
      input,
      salon.plan
    );

    if (updateError) {
      setError(updateError);
      setSaving(false);
      return;
    }

    setSaving(false);
    await onEmployeeUpdated();
    onClose();
  };

  return {
    fullName,
    setFullName,
    email,
    setEmail,
    phone,
    setPhone,
    role,
    setRole,
    preferredLanguage,
    setPreferredLanguage,
    selectedServices,
    setSelectedServices,
    saving,
    error,
    handleSubmit,
  };
}
