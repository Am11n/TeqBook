import { useState, FormEvent } from "react";
import { useCurrentSalon } from "@/components/salon-provider";
import { createEmployee } from "@/lib/services/employees-service";
import type { Service } from "@/lib/types";

interface UseCreateEmployeeOptions {
  services: Service[];
  onEmployeeCreated: () => Promise<void>;
}

export function useCreateEmployee({ services, onEmployeeCreated }: UseCreateEmployeeOptions) {
  const { salon } = useCurrentSalon();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState("");
  const [preferredLanguage, setPreferredLanguage] = useState("en");
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!salon?.id || !fullName.trim()) {
      setError("Name is required");
      return;
    }

    setSaving(true);
    setError(null);

    const { error: createError } = await createEmployee({
      salon_id: salon.id,
      full_name: fullName.trim(),
      email: email.trim() || null,
      phone: phone.trim() || null,
      role: role || null,
      preferred_language: preferredLanguage,
      service_ids: selectedServices,
    });

    if (createError) {
      setError(createError);
      setSaving(false);
      return;
    }

    // Reset form
    setFullName("");
    setEmail("");
    setPhone("");
    setRole("");
    setPreferredLanguage("en");
    setSelectedServices([]);
    setSaving(false);

    // Reload employees
    await onEmployeeCreated();
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

