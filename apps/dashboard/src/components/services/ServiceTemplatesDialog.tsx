"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCurrentSalon } from "@/components/salon-provider";
import { createService } from "@/lib/repositories/services";

// Templates use English names -- the salon owner will rename to their language
const TEMPLATES = [
  // Cut
  { name: "Men's haircut", category: "cut", duration_minutes: 30, suggestedPrice: 39000 },
  { name: "Men's haircut long", category: "cut", duration_minutes: 45, suggestedPrice: 49000 },
  { name: "Women's haircut", category: "cut", duration_minutes: 60, suggestedPrice: 59000 },
  { name: "Children's haircut", category: "cut", duration_minutes: 30, suggestedPrice: 29000 },
  // Beard
  { name: "Beard trim", category: "beard", duration_minutes: 15, suggestedPrice: 19000 },
  { name: "Beard with wash", category: "beard", duration_minutes: 30, suggestedPrice: 29000 },
  // Packages
  { name: "Wash + cut", category: "cut", duration_minutes: 45, suggestedPrice: 49000 },
  { name: "Cut + beard", category: "cut", duration_minutes: 45, suggestedPrice: 59000 },
  // Color
  { name: "Full color", category: "color", duration_minutes: 90, suggestedPrice: 99000 },
  { name: "Highlights", category: "color", duration_minutes: 120, suggestedPrice: 129000 },
  { name: "Balayage", category: "color", duration_minutes: 150, suggestedPrice: 159000 },
];

export interface ServiceTemplatesDialogTranslations {
  title: string;
  description: string;
  useSuggestedPrices: string;
  pricePlaceholder: string;
  cancel: string;
  create: string;
  creating: string;
  services: string;
  createError: string;
}

interface ServiceTemplatesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: () => Promise<void>;
  translations?: ServiceTemplatesDialogTranslations;
}

const defaultTranslations: ServiceTemplatesDialogTranslations = {
  title: "Add from template",
  description: "Select templates and customize prices. You can leave prices empty and set them later.",
  useSuggestedPrices: "Use suggested prices",
  pricePlaceholder: "Price",
  cancel: "Cancel",
  create: "Create",
  creating: "Creating...",
  services: "services",
  createError: "Could not create services",
};

export function ServiceTemplatesDialog({
  open,
  onOpenChange,
  onCreated,
  translations,
}: ServiceTemplatesDialogProps) {
  const t = { ...defaultTranslations, ...translations };
  const { salon } = useCurrentSalon();
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [useSuggested, setUseSuggested] = useState(true);
  const [priceOverrides, setPriceOverrides] = useState<Record<number, string>>(
    {},
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggle = (idx: number) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) {
        next.delete(idx);
      } else {
        next.add(idx);
      }
      return next;
    });
  };

  const handleCreate = async () => {
    if (!salon?.id) return;
    setSaving(true);
    setError(null);

    try {
      for (const idx of selected) {
        const tpl = TEMPLATES[idx];
        const overridePrice = priceOverrides[idx];
        const price = overridePrice
          ? Math.round(parseFloat(overridePrice) * 100)
          : useSuggested
            ? tpl.suggestedPrice
            : 0;

        await createService({
          salon_id: salon.id,
          name: tpl.name,
          category: tpl.category,
          duration_minutes: tpl.duration_minutes,
          price_cents: price,
          is_active: true,
          sort_order: 0,
        });
      }

      await onCreated();
      onOpenChange(false);
      setSelected(new Set());
      setPriceOverrides({});
    } catch (err) {
      setError(
        err instanceof Error ? err.message : t.createError,
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{t.title}</DialogTitle>
          <DialogDescription>{t.description}</DialogDescription>
        </DialogHeader>

        <div className="flex items-center gap-2 mb-3">
          <input
            id="use-suggested"
            type="checkbox"
            checked={useSuggested}
            onChange={(e) => setUseSuggested(e.target.checked)}
            className="rounded border-input"
          />
          <Label htmlFor="use-suggested" className="text-sm">
            {t.useSuggestedPrices}
          </Label>
        </div>

        <div className="max-h-[50vh] overflow-y-auto space-y-1">
          {TEMPLATES.map((tpl, idx) => {
            const isSelected = selected.has(idx);
            return (
              <div
                key={idx}
                className="flex items-center gap-3 rounded-lg border px-3 py-2 hover:bg-accent/30"
              >
                <Checkbox
                  checked={isSelected}
                  onCheckedChange={() => toggle(idx)}
                />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium">{tpl.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {tpl.category} · {tpl.duration_minutes} min
                  </div>
                </div>
                {isSelected && (
                  <Input
                    type="number"
                    className="h-8 w-24 text-right text-sm"
                    placeholder={
                      useSuggested
                        ? `${(tpl.suggestedPrice / 100).toFixed(0)}`
                        : t.pricePlaceholder
                    }
                    value={priceOverrides[idx] ?? ""}
                    onChange={(e) =>
                      setPriceOverrides((prev) => ({
                        ...prev,
                        [idx]: e.target.value,
                      }))
                    }
                  />
                )}
              </div>
            );
          })}
        </div>

        {error && (
          <p className="text-sm text-destructive" aria-live="polite">
            {error}
          </p>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t.cancel}
          </Button>
          <Button
            onClick={handleCreate}
            disabled={saving || selected.size === 0}
          >
            {saving ? t.creating : `${t.create} ${selected.size} ${t.services}`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
