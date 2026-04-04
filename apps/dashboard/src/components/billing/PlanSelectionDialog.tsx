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
import { CheckCircle2 } from "lucide-react";
import type { Plan } from "@/lib/utils/billing/billing-utils";
import type { PlanType } from "@/lib/types";

interface PlanSelectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  plans: Plan[];
  selectedPlan: PlanType | null;
  onSelectPlan: (plan: PlanType) => void;
  onConfirm: () => void;
  actionLoading: boolean;
  hasSubscription: boolean;
  title: string;
  description: string;
  /** Must include `{price}` */
  priceMonthTemplate: string;
  cancelLabel: string;
  subscribeLabel: string;
  changePlanLabel: string;
  processingLabel: string;
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
  title,
  description,
  priceMonthTemplate,
  cancelLabel,
  subscribeLabel,
  changePlanLabel,
  processingLabel,
}: PlanSelectionDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
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
                  selectedPlan === plan.id
                    ? "border-primary bg-primary/5"
                    : "hover:border-primary/50"
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
                  {selectedPlan === plan.id && (
                    <CheckCircle2 className="h-5 w-5 text-primary" />
                  )}
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
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {cancelLabel}
          </Button>
          <Button onClick={onConfirm} disabled={!selectedPlan || actionLoading}>
            {actionLoading
              ? processingLabel
              : hasSubscription
                ? changePlanLabel
                : subscribeLabel}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

