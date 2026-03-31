import { useState, FormEvent } from "react";
import { useCurrentSalon } from "@/components/salon-provider";
import { useRepoError, useRepoErrors } from "@/lib/hooks/useRepoError";
import { createService } from "@/lib/repositories/services";

interface UseCreateServiceOptions {
  onServiceCreated: () => Promise<void>;
}

export function useCreateService({ onServiceCreated }: UseCreateServiceOptions) {
  const m = useRepoError();
  const trRepo = useRepoErrors();
  const { salon } = useCurrentSalon();
  const [name, setName] = useState("");
  const [category, setCategory] = useState<string>("");
  const [duration, setDuration] = useState(45);
  const [price, setPrice] = useState(800); // NOK, shown as currency
  const [sortOrder, setSortOrder] = useState(0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!salon?.id || !name.trim()) {
      setError(trRepo.serviceNameRequired);
      return;
    }

    setSaving(true);
    setError(null);

    const { error: createError } = await createService({
      salon_id: salon.id,
      name: name.trim(),
      category: category || null,
      duration_minutes: duration,
      price_cents: price * 100,
      sort_order: sortOrder,
    });

    if (createError) {
      setError(m(createError));
      setSaving(false);
      return;
    }

    // Reset form
    setName("");
    setCategory("");
    setDuration(45);
    setPrice(800);
    setSortOrder(0);
    setSaving(false);

    // Reload services
    await onServiceCreated();
  };

  return {
    name,
    setName,
    category,
    setCategory,
    duration,
    setDuration,
    price,
    setPrice,
    sortOrder,
    setSortOrder,
    saving,
    error,
    handleSubmit,
  };
}

