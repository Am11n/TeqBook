"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/form/Field";
import { useCreateService } from "@/lib/hooks/services/useCreateService";

interface CreateServiceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onServiceCreated: () => Promise<void>;
  translations: {
    dialogTitle: string;
    dialogDescription: string;
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
    cancel: string;
    newService: string;
  };
}

export function CreateServiceDialog({
  open,
  onOpenChange,
  onServiceCreated,
  translations,
}: CreateServiceDialogProps) {
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
  } = useCreateService({
    onServiceCreated: async () => {
      await onServiceCreated();
      onOpenChange(false);
    },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{translations.dialogTitle}</DialogTitle>
          <DialogDescription>{translations.dialogDescription}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Field label={translations.nameLabel} htmlFor="create_service_name" required>
            <input
              id="create_service_name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="h-9 w-full rounded-md border bg-background px-3 text-sm outline-none ring-ring/0 transition focus-visible:ring-2"
              placeholder={translations.namePlaceholder}
            />
          </Field>

          <Field label={translations.categoryLabel} htmlFor="create_service_category">
            <select
              id="create_service_category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="h-9 w-full rounded-md border border-input bg-background px-2 text-sm outline-none ring-ring/0 transition focus-visible:ring-2"
            >
              <option value="">{translations.categoryOther}</option>
              <option value="cut">{translations.categoryCut}</option>
              <option value="beard">{translations.categoryBeard}</option>
              <option value="color">{translations.categoryColor}</option>
              <option value="nails">{translations.categoryNails}</option>
              <option value="massage">{translations.categoryMassage}</option>
            </select>
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label={translations.durationLabel} htmlFor="create_service_duration">
              <input
                id="create_service_duration"
                type="number"
                min={10}
                max={300}
                step={5}
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value) || 0)}
                className="h-9 w-full rounded-md border bg-background px-3 text-sm outline-none ring-ring/0 transition focus-visible:ring-2"
              />
            </Field>

            <Field label={translations.priceLabel} htmlFor="create_service_price">
              <input
                id="create_service_price"
                type="number"
                min={0}
                step={50}
                value={price}
                onChange={(e) => setPrice(Number(e.target.value) || 0)}
                className="h-9 w-full rounded-md border bg-background px-3 text-sm outline-none ring-ring/0 transition focus-visible:ring-2"
              />
            </Field>
          </div>

          <Field label={translations.sortOrderLabel} htmlFor="create_service_sort_order">
            <input
              id="create_service_sort_order"
              type="number"
              min={0}
              value={sortOrder}
              onChange={(e) => setSortOrder(Number(e.target.value) || 0)}
              className="h-9 w-full rounded-md border bg-background px-3 text-sm outline-none ring-ring/0 transition focus-visible:ring-2"
              placeholder="0"
            />
          </Field>

          {error && (
            <p className="text-sm text-destructive" aria-live="polite">
              {error}
            </p>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              {translations.cancel}
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? "…" : translations.newService}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
