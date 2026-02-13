"use client";

import { useState, useEffect, type FormEvent } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Field } from "@/components/form/Field";
import { SetupBadge } from "@/components/setup-badge";
import { getServiceSetupIssues } from "@/lib/setup/health";
import { useCurrentSalon } from "@/components/salon-provider";
import { updateService } from "@/lib/repositories/services";
import { formatPrice as _formatPrice, getCategoryLabel as _getCategoryLabel } from "@/lib/utils/services/services-utils";
import { Edit } from "lucide-react";
import type { DialogMode } from "@/lib/hooks/useEntityDialogState";
import type { Service } from "@/lib/types";

export interface ServiceDetailDialogTranslations {
  editTitle: string;
  detailDescription: string;
  editDescription: string;
  active: string;
  inactive: string;
  categoryLabel: string;
  categoryCut: string;
  categoryBeard: string;
  categoryColor: string;
  categoryNails: string;
  categoryMassage: string;
  categoryOther: string;
  durationLabel: string;
  priceLabel: string;
  staffUnit: string;
  colEmployees: string;
  prepMinutesLabel: string;
  cleanupMinutesLabel: string;
  nameLabel: string;
  sortOrderLabel: string;
  close: string;
  edit: string;
  cancel: string;
  save: string;
  saving: string;
  locale: string;
}

interface ServiceDetailDialogProps {
  serviceId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: DialogMode;
  onSwitchToEdit: () => void;
  onSwitchToView: () => void;
  services: Service[];
  serviceEmployeeCountMap: Record<string, number>;
  onServiceUpdated: () => Promise<void>;
  translations: ServiceDetailDialogTranslations;
  currency: string;
}

export function ServiceDetailDialog({
  serviceId,
  open,
  onOpenChange,
  mode,
  onSwitchToEdit,
  onSwitchToView,
  services,
  serviceEmployeeCountMap,
  onServiceUpdated,
  translations: t,
  currency,
}: ServiceDetailDialogProps) {
  const { salon } = useCurrentSalon();
  const service = services.find((s) => s.id === serviceId) ?? null;

  const categoryLabels = {
    categoryCut: t.categoryCut,
    categoryBeard: t.categoryBeard,
    categoryColor: t.categoryColor,
    categoryNails: t.categoryNails,
    categoryMassage: t.categoryMassage,
    categoryOther: t.categoryOther,
  };
  const formatPrice = (cents: number) => _formatPrice(cents, t.locale, currency);
  const getCategoryLabel = (cat: string | null | undefined) =>
    _getCategoryLabel(cat, categoryLabels);

  // Edit form state
  const [name, setName] = useState("");
  const [category, setCategory] = useState("other");
  const [durationMinutes, setDurationMinutes] = useState(30);
  const [priceNok, setPriceNok] = useState(0);
  const [sortOrder, setSortOrder] = useState(0);
  const [prepMinutes, setPrepMinutes] = useState(0);
  const [cleanupMinutes, setCleanupMinutes] = useState(0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (service && mode === "edit") {
      setName(service.name);
      setCategory(service.category ?? "other");
      setDurationMinutes(service.duration_minutes);
      setPriceNok(service.price_cents / 100);
      setSortOrder(service.sort_order ?? 0);
      setPrepMinutes(service.prep_minutes ?? 0);
      setCleanupMinutes(service.cleanup_minutes ?? 0);
      setError(null);
    }
  }, [service, mode]);

  if (!service) return null;

  const empCount = serviceEmployeeCountMap[service.id] ?? 0;
  const issues = getServiceSetupIssues(service, { employeeCount: empCount });

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!salon?.id || !service) return;

    setSaving(true);
    setError(null);

    const { error: updateError } = await updateService(salon.id, service.id, {
      name: name.trim(),
      category,
      duration_minutes: durationMinutes,
      price_cents: Math.round(priceNok * 100),
      sort_order: sortOrder,
      prep_minutes: prepMinutes,
      cleanup_minutes: cleanupMinutes,
    });

    if (updateError) {
      setError(updateError);
      setSaving(false);
      return;
    }

    await onServiceUpdated();
    setSaving(false);
    onSwitchToView();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {mode === "edit" ? t.editTitle : service.name}
          </DialogTitle>
          <DialogDescription>
            {mode === "edit" ? t.editDescription : t.detailDescription}
          </DialogDescription>
        </DialogHeader>

        {mode === "view" ? (
          <div className="space-y-4">
            {/* Status */}
            <div className="flex items-center gap-2">
              <Badge
                variant="outline"
                className={
                  service.is_active
                    ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                    : "border-zinc-200 bg-zinc-100 text-zinc-600"
                }
              >
                {service.is_active ? t.active : t.inactive}
              </Badge>
              <SetupBadge issues={issues} />
            </div>

            {/* Info grid */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-xs text-muted-foreground">{t.categoryLabel}</p>
                <p className="text-sm font-medium">
                  {getCategoryLabel(service.category)}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{t.durationLabel}</p>
                <p className="text-sm font-medium">
                  {service.duration_minutes} min
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{t.priceLabel}</p>
                <p className="text-sm font-medium">
                  {formatPrice(service.price_cents)}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{t.colEmployees}</p>
                <p className="text-sm font-medium">{empCount} {t.staffUnit}</p>
              </div>
            </div>

            {/* Buffer */}
            {((service.prep_minutes ?? 0) > 0 ||
              (service.cleanup_minutes ?? 0) > 0) && (
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-xs text-muted-foreground">{t.prepMinutesLabel}</p>
                  <p className="text-sm">
                    {service.prep_minutes ?? 0} min
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{t.cleanupMinutesLabel}</p>
                  <p className="text-sm">
                    {service.cleanup_minutes ?? 0} min
                  </p>
                </div>
              </div>
            )}

            <DialogFooter>
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                {t.close}
              </Button>
              <Button onClick={onSwitchToEdit}>
                <Edit className="h-4 w-4 mr-2" />
                {t.edit}
              </Button>
            </DialogFooter>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <Field label={t.nameLabel} htmlFor="svc_name" required>
              <input
                id="svc_name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="h-9 w-full rounded-md border bg-background px-3 text-sm outline-none ring-ring/0 transition focus-visible:ring-2"
              />
            </Field>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label={t.categoryLabel} htmlFor="svc_category">
                <select
                  id="svc_category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="h-9 w-full rounded-md border border-input bg-background px-2 text-sm outline-none ring-ring/0 transition focus-visible:ring-2"
                >
                  <option value="cut">{t.categoryCut}</option>
                  <option value="beard">{t.categoryBeard}</option>
                  <option value="color">{t.categoryColor}</option>
                  <option value="nails">{t.categoryNails}</option>
                  <option value="massage">{t.categoryMassage}</option>
                  <option value="other">{t.categoryOther}</option>
                </select>
              </Field>
              <Field label={t.durationLabel} htmlFor="svc_duration">
                <input
                  id="svc_duration"
                  type="number"
                  min={5}
                  value={durationMinutes}
                  onChange={(e) => setDurationMinutes(Number(e.target.value))}
                  className="h-9 w-full rounded-md border bg-background px-3 text-sm outline-none ring-ring/0 transition focus-visible:ring-2"
                />
              </Field>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label={t.priceLabel} htmlFor="svc_price">
                <input
                  id="svc_price"
                  type="number"
                  min={0}
                  step={1}
                  value={priceNok}
                  onChange={(e) => setPriceNok(Number(e.target.value))}
                  className="h-9 w-full rounded-md border bg-background px-3 text-sm outline-none ring-ring/0 transition focus-visible:ring-2"
                />
              </Field>
              <Field label={t.sortOrderLabel} htmlFor="svc_sort">
                <input
                  id="svc_sort"
                  type="number"
                  value={sortOrder}
                  onChange={(e) => setSortOrder(Number(e.target.value))}
                  className="h-9 w-full rounded-md border bg-background px-3 text-sm outline-none ring-ring/0 transition focus-visible:ring-2"
                />
              </Field>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label={t.prepMinutesLabel} htmlFor="svc_prep">
                <input
                  id="svc_prep"
                  type="number"
                  min={0}
                  value={prepMinutes}
                  onChange={(e) => setPrepMinutes(Number(e.target.value))}
                  className="h-9 w-full rounded-md border bg-background px-3 text-sm outline-none ring-ring/0 transition focus-visible:ring-2"
                />
              </Field>
              <Field label={t.cleanupMinutesLabel} htmlFor="svc_cleanup">
                <input
                  id="svc_cleanup"
                  type="number"
                  min={0}
                  value={cleanupMinutes}
                  onChange={(e) => setCleanupMinutes(Number(e.target.value))}
                  className="h-9 w-full rounded-md border bg-background px-3 text-sm outline-none ring-ring/0 transition focus-visible:ring-2"
                />
              </Field>
            </div>

            {error && (
              <p className="text-sm text-destructive" aria-live="polite">
                {error}
              </p>
            )}

            <DialogFooter>
              <Button type="button" variant="outline" onClick={onSwitchToView}>
                {t.cancel}
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? t.saving : t.save}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
