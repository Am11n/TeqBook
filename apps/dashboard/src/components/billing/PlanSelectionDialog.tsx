"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { applyTemplate } from "@/i18n/apply-template";
import { previewPlanChange } from "@/lib/services/billing-service";
import type { PreviewPlanChangeResponse } from "@/lib/services/billing/shared";
import { CheckCircle2, Loader2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import type { Plan } from "@/lib/utils/billing/billing-utils";
import type { PlanType } from "@/lib/types";

export type PlanChangeTiming = "immediate" | "next_period";

interface PlanSelectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  plans: Plan[];
  selectedPlan: PlanType | null;
  onSelectPlan: (plan: PlanType) => void;
  /** Receives chosen timing for existing subscriptions; new subscriptions use create flow (immediate). */
  onConfirm: (opts: { timing: PlanChangeTiming }) => void;
  actionLoading: boolean;
  hasSubscription: boolean;
  /** For preview + next-period copy */
  salonId: string | null;
  currentPlan: PlanType | null;
  /** ISO date from salon (Stripe-projected) */
  currentPeriodEndIso: string | null;
  title: string;
  description: string;
  /** Must include `{price}` */
  priceMonthTemplate: string;
  cancelLabel: string;
  subscribeLabel: string;
  changePlanLabel: string;
  processingLabel: string;
  confirmDisabled?: boolean;
  /** Plan timing + preview copy */
  translations: {
    billingPlanTimingTitle: string;
    billingPlanChangeImmediateLabel: string;
    billingPlanChangeNextPeriodLabel: string;
    billingPlanChangeImmediateDescription: string;
    billingPlanChangeNextPeriodDescription: string;
    billingPlanPreviewTitle: string;
    billingPlanPreviewLoadError: string;
    billingPlanPreviewTotal: string;
    billingPlanPreviewTimingLine: string;
    billingPlanPreviewDisclaimer: string;
    billingPlanNextPeriodSummary: string;
    /** {date} */
    billingPlanNextPeriodDateLabel: string;
  };
}

function formatMinor(amountMinor: number | null | undefined, currency: string): string {
  if (amountMinor == null) return "—";
  const code = currency.length === 3 ? currency : "USD";
  try {
    return new Intl.NumberFormat(undefined, { style: "currency", currency: code }).format(amountMinor / 100);
  } catch {
    return `${(amountMinor / 100).toFixed(2)} ${code}`;
  }
}

function formatDateIso(iso: string | null, locale: string): string {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleDateString(locale, {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return iso;
  }
}

export function PlanSelectionDialog({
  open,
  onOpenChange,
  plans,
  selectedPlan,
  onSelectPlan,
  onConfirm,
  actionLoading,
  hasSubscription,
  salonId,
  currentPlan,
  currentPeriodEndIso,
  title,
  description,
  priceMonthTemplate,
  cancelLabel,
  subscribeLabel,
  changePlanLabel,
  processingLabel,
  confirmDisabled = false,
  translations: tx,
}: PlanSelectionDialogProps) {
  const [timing, setTiming] = useState<PlanChangeTiming>("immediate");
  const [preview, setPreview] = useState<PreviewPlanChangeResponse | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState<string | null>(null);

  const selected = plans.find((p) => p.id === selectedPlan);
  const dateLocale = typeof navigator !== "undefined" ? navigator.language : "en-US";

  const loadPreview = useCallback(async () => {
    if (!salonId || !selectedPlan || !hasSubscription) {
      setPreview(null);
      return;
    }
    setPreviewLoading(true);
    setPreviewError(null);
    const { data, error } = await previewPlanChange(salonId, selectedPlan);
    setPreviewLoading(false);
    if (error) {
      setPreview(null);
      setPreviewError(error);
      return;
    }
    setPreview(data ?? null);
  }, [salonId, selectedPlan, hasSubscription]);

  useEffect(() => {
    if (!open) {
      setTiming("immediate");
      setPreview(null);
      setPreviewError(null);
      return;
    }
    if (hasSubscription && selectedPlan && timing === "immediate") {
      void loadPreview();
    } else {
      setPreview(null);
      setPreviewError(null);
    }
  }, [open, hasSubscription, selectedPlan, timing, loadPreview]);

  const previewStripe =
    preview && preview.mode === "preview"
      ? preview
      : null;

  const confirmDisabledComputed =
    confirmDisabled ||
    !selectedPlan ||
    actionLoading ||
    (hasSubscription && timing === "immediate" && Boolean(selectedPlan) && Boolean(salonId) && previewLoading);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {plans.map((plan) => {
            const PlanIcon = plan.icon;
            return (
              <div
                key={plan.id}
                className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                  selectedPlan === plan.id ? "border-primary bg-primary/5" : "hover:border-primary/50"
                }`}
                onClick={() => onSelectPlan(plan.id)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <PlanIcon className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-semibold">{plan.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {applyTemplate(priceMonthTemplate, { price: plan.price })}
                      </p>
                    </div>
                  </div>
                  {selectedPlan === plan.id && <CheckCircle2 className="h-5 w-5 text-primary" />}
                </div>
                <ul className="mt-3 space-y-1 text-sm text-muted-foreground">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start">
                      <span className="mr-2">•</span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>

        {hasSubscription && selectedPlan && selected && (
          <div className="space-y-3 border rounded-lg p-4 bg-muted/30">
            <p className="text-sm font-medium">{tx.billingPlanTimingTitle}</p>
            <div className="grid gap-2">
              <button
                type="button"
                onClick={() => setTiming("immediate")}
                className={`text-left rounded-md border p-3 transition-colors ${
                  timing === "immediate" ? "border-primary bg-primary/5" : "border-border hover:border-primary/40"
                }`}
              >
                <div className="font-medium text-sm">{tx.billingPlanChangeImmediateLabel}</div>
                <div className="text-xs text-muted-foreground mt-1">{tx.billingPlanChangeImmediateDescription}</div>
              </button>
              <button
                type="button"
                onClick={() => setTiming("next_period")}
                className={`text-left rounded-md border p-3 transition-colors ${
                  timing === "next_period" ? "border-primary bg-primary/5" : "border-border hover:border-primary/40"
                }`}
              >
                <div className="font-medium text-sm">{tx.billingPlanChangeNextPeriodLabel}</div>
                <div className="text-xs text-muted-foreground mt-1">{tx.billingPlanChangeNextPeriodDescription}</div>
              </button>
            </div>

            {timing === "next_period" && (
              <p className="text-sm text-muted-foreground">
                {applyTemplate(tx.billingPlanNextPeriodSummary, {
                  date: formatDateIso(currentPeriodEndIso, dateLocale),
                  plan: selected.name,
                  current:
                    plans.find((p) => p.id === currentPlan)?.name ??
                    String(currentPlan ?? ""),
                })}
              </p>
            )}

            {timing === "immediate" && salonId && (
              <div className="space-y-2 pt-2 border-t">
                <p className="text-sm font-medium">{tx.billingPlanPreviewTitle}</p>
                {previewLoading ? (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    …
                  </div>
                ) : previewError ? (
                  <p className="text-sm text-destructive">{tx.billingPlanPreviewLoadError}</p>
                ) : previewStripe ? (
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between font-medium">
                      <span>{tx.billingPlanPreviewTotal}</span>
                      <span>{formatMinor(previewStripe.total_minor, previewStripe.currency)}</span>
                    </div>
                    {previewStripe.summary.timing_adjustments_minor !== 0 ? (
                      <div className="flex justify-between text-muted-foreground">
                        <span>{tx.billingPlanPreviewTimingLine}</span>
                        <span>
                          {formatMinor(previewStripe.summary.timing_adjustments_minor, previewStripe.currency)}
                        </span>
                      </div>
                    ) : null}
                    <ul className="max-h-36 overflow-y-auto border rounded-md divide-y text-xs">
                      {previewStripe.lines.map((line, i) => (
                        <li key={i} className="flex justify-between gap-2 px-2 py-1">
                          <span className="truncate">{line.description}</span>
                          <span>{formatMinor(line.amount_minor, previewStripe.currency)}</span>
                        </li>
                      ))}
                    </ul>
                    <p className="text-xs text-muted-foreground">{tx.billingPlanPreviewDisclaimer}</p>
                  </div>
                ) : preview?.mode === "no_change" ? (
                  <p className="text-sm text-muted-foreground">{preview.message ?? ""}</p>
                ) : null}
              </div>
            )}
          </div>
        )}

        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {cancelLabel}
          </Button>
          <Button
            onClick={() => {
              const t: PlanChangeTiming = hasSubscription ? timing : "immediate";
              onConfirm({ timing: t });
            }}
            disabled={!selectedPlan || actionLoading || confirmDisabledComputed}
          >
            {actionLoading ? processingLabel : hasSubscription ? changePlanLabel : subscribeLabel}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
