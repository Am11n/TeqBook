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
import { ServiceEditForm } from "./ServiceEditForm";
import { SetupBadge } from "@/components/setup-badge";
import { getServiceSetupIssues } from "@/lib/setup/health";
import { useCurrentSalon } from "@/components/salon-provider";
import { updateService } from "@/lib/repositories/services";
import { formatPrice as _formatPrice, getCategoryLabel as _getCategoryLabel } from "@/lib/utils/services/services-utils";
import { Edit } from "lucide-react";
import type { DialogMode } from "@/lib/hooks/useEntityDialogState";
import type { Service } from "@/lib/types";

export interface ServiceDetailDialogTranslations {
  editTitle: string; detailDescription: string; editDescription: string;
  active: string; inactive: string; categoryLabel: string;
  categoryCut: string; categoryBeard: string; categoryColor: string;
  categoryNails: string; categoryMassage: string; categoryOther: string;
  durationLabel: string; priceLabel: string; staffUnit: string;
  colEmployees: string; prepMinutesLabel: string; cleanupMinutesLabel: string;
  nameLabel: string; sortOrderLabel: string; close: string; edit: string;
  cancel: string; save: string; saving: string; locale: string;
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
          <ServiceEditForm
            name={name} setName={setName}
            category={category} setCategory={setCategory}
            durationMinutes={durationMinutes} setDurationMinutes={setDurationMinutes}
            priceNok={priceNok} setPriceNok={setPriceNok}
            sortOrder={sortOrder} setSortOrder={setSortOrder}
            prepMinutes={prepMinutes} setPrepMinutes={setPrepMinutes}
            cleanupMinutes={cleanupMinutes} setCleanupMinutes={setCleanupMinutes}
            saving={saving} error={error}
            onSubmit={handleSubmit} onCancel={onSwitchToView}
            translations={t}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
