"use client";

import { FormEvent } from "react";
import { Field } from "@/components/form/Field";
import { ErrorMessage } from "@/components/feedback/error-message";
import { useCreateService } from "@/lib/hooks/services/useCreateService";

interface CreateServiceFormProps {
  onServiceCreated: () => Promise<void>;
  translations: {
    nameLabel: string;
    namePlaceholder: string;
    categoryLabel: string;
    categoryOther: string;
    categoryCut: string;
    categoryBeard: string;
    categoryColor: string;
    categoryNails: string;
    categoryMassage: string;
    durationLabel: string;
    priceLabel: string;
    sortOrderLabel: string;
    newService: string;
  };
}

export function CreateServiceForm({
  onServiceCreated,
  translations,
}: CreateServiceFormProps) {
  const {
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
  } = useCreateService({ onServiceCreated });

  return (
    <form onSubmit={handleSubmit} className="space-y-6 rounded-xl border bg-card p-4 shadow-sm">
      <h2 className="text-sm font-medium">{translations.newService}</h2>

      <Field label={translations.nameLabel} htmlFor="name" required>
        <input
          id="name"
          type="text"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="h-9 w-full rounded-md border bg-background px-3 text-sm outline-none ring-ring/0 transition focus-visible:ring-2"
          placeholder={translations.namePlaceholder}
        />
      </Field>

      <Field label={translations.categoryLabel} htmlFor="category">
        <select
          id="category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="h-9 w-full rounded-md border bg-background px-3 text-sm outline-none ring-ring/0 transition focus-visible:ring-2"
        >
          <option value="">{translations.categoryOther}</option>
          <option value="cut">{translations.categoryCut}</option>
          <option value="beard">{translations.categoryBeard}</option>
          <option value="color">{translations.categoryColor}</option>
          <option value="nails">{translations.categoryNails}</option>
          <option value="massage">{translations.categoryMassage}</option>
        </select>
      </Field>

      <div className="grid gap-6 md:grid-cols-2">
        <Field label={translations.durationLabel} htmlFor="duration">
          <input
            id="duration"
            type="number"
            min={10}
            max={300}
            step={5}
            value={duration}
            onChange={(e) => setDuration(Number(e.target.value) || 0)}
            className="h-9 w-full rounded-md border bg-background px-3 text-sm outline-none ring-ring/0 transition focus-visible:ring-2"
          />
        </Field>

        <Field label={translations.priceLabel} htmlFor="price">
          <input
            id="price"
            type="number"
            min={0}
            step={50}
            value={price}
            onChange={(e) => setPrice(Number(e.target.value) || 0)}
            className="h-9 w-full rounded-md border bg-background px-3 text-sm outline-none ring-ring/0 transition focus-visible:ring-2"
          />
        </Field>
      </div>

      <Field label={translations.sortOrderLabel} htmlFor="sort_order">
        <input
          id="sort_order"
          type="number"
          min={0}
          value={sortOrder}
          onChange={(e) => setSortOrder(Number(e.target.value) || 0)}
          className="h-9 w-full rounded-md border bg-background px-3 text-sm outline-none ring-ring/0 transition focus-visible:ring-2"
          placeholder="0"
        />
      </Field>

      {error && <ErrorMessage message={error} onDismiss={() => {}} />}

      <button
        type="submit"
        disabled={saving}
        className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {saving ? "…" : translations.newService}
      </button>
    </form>
  );
}

