"use client";

import type { FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/form/Field";
import { DialogFooter } from "@/components/ui/dialog";
import { DialogSelect } from "@/components/ui/dialog-select";

interface ServiceEditFormProps {
  name: string; setName: (v: string) => void;
  category: string; setCategory: (v: string) => void;
  durationMinutes: number; setDurationMinutes: (v: number) => void;
  priceNok: number; setPriceNok: (v: number) => void;
  sortOrder: number; setSortOrder: (v: number) => void;
  prepMinutes: number; setPrepMinutes: (v: number) => void;
  cleanupMinutes: number; setCleanupMinutes: (v: number) => void;
  saving: boolean; error: string | null;
  onSubmit: (e: FormEvent) => void;
  onCancel: () => void;
  translations: {
    nameLabel: string; categoryLabel: string; durationLabel: string;
    priceLabel: string; sortOrderLabel: string; prepMinutesLabel: string;
    cleanupMinutesLabel: string; cancel: string; save: string; saving: string;
    categoryCut: string; categoryBeard: string; categoryColor: string;
    categoryNails: string; categoryMassage: string; categoryOther: string;
  };
}

const INPUT_CLASS = "h-9 w-full rounded-md border bg-background px-3 text-sm outline-none ring-ring/0 transition focus-visible:ring-2";

export function ServiceEditForm({
  name, setName, category, setCategory, durationMinutes, setDurationMinutes,
  priceNok, setPriceNok, sortOrder, setSortOrder, prepMinutes, setPrepMinutes,
  cleanupMinutes, setCleanupMinutes, saving, error, onSubmit, onCancel,
  translations: t,
}: ServiceEditFormProps) {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <Field label={t.nameLabel} htmlFor="svc_name" required>
        <input id="svc_name" type="text" required value={name}
          onChange={(e) => setName(e.target.value)} className={INPUT_CLASS} />
      </Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label={t.categoryLabel} htmlFor="svc_category">
          <DialogSelect value={category} onChange={setCategory} options={[
            { value: "cut", label: t.categoryCut }, { value: "beard", label: t.categoryBeard },
            { value: "color", label: t.categoryColor }, { value: "nails", label: t.categoryNails },
            { value: "massage", label: t.categoryMassage }, { value: "other", label: t.categoryOther },
          ]} />
        </Field>
        <Field label={t.durationLabel} htmlFor="svc_duration">
          <input id="svc_duration" type="number" min={5} value={durationMinutes}
            onChange={(e) => setDurationMinutes(Number(e.target.value))} className={INPUT_CLASS} />
        </Field>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label={t.priceLabel} htmlFor="svc_price">
          <input id="svc_price" type="number" min={0} step={1} value={priceNok}
            onChange={(e) => setPriceNok(Number(e.target.value))} className={INPUT_CLASS} />
        </Field>
        <Field label={t.sortOrderLabel} htmlFor="svc_sort">
          <input id="svc_sort" type="number" value={sortOrder}
            onChange={(e) => setSortOrder(Number(e.target.value))} className={INPUT_CLASS} />
        </Field>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label={t.prepMinutesLabel} htmlFor="svc_prep">
          <input id="svc_prep" type="number" min={0} value={prepMinutes}
            onChange={(e) => setPrepMinutes(Number(e.target.value))} className={INPUT_CLASS} />
        </Field>
        <Field label={t.cleanupMinutesLabel} htmlFor="svc_cleanup">
          <input id="svc_cleanup" type="number" min={0} value={cleanupMinutes}
            onChange={(e) => setCleanupMinutes(Number(e.target.value))} className={INPUT_CLASS} />
        </Field>
      </div>
      {error && <p className="text-sm text-destructive" aria-live="polite">{error}</p>}
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>{t.cancel}</Button>
        <Button type="submit" disabled={saving}>{saving ? t.saving : t.save}</Button>
      </DialogFooter>
    </form>
  );
}
