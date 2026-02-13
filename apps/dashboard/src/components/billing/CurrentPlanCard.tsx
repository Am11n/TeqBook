"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CreditCard, X, CheckCircle2, AlertTriangle, Clock, Ban } from "lucide-react";
import { SettingsLimitBar } from "@/components/settings/SettingsLimitBar";
import type { Plan } from "@/lib/utils/billing/billing-utils";
import type { Salon } from "@/lib/types";

// ─── Billing state matrix ────────────────────────────

type BillingState = "active" | "cancelling" | "cancelled" | "trial" | "past_due";

function getBillingState(
  hasSubscription: boolean,
  salon: Salon | null,
): BillingState {
  // Past due takes priority if subscription exists but payment failed
  if (
    hasSubscription &&
    salon?.payment_status &&
    ["failed", "grace_period", "restricted"].includes(salon.payment_status)
  ) {
    return "past_due";
  }

  // Active subscription
  if (hasSubscription) return "active";

  // Trial
  if (salon?.trial_end) {
    const trialEnd = new Date(salon.trial_end);
    if (trialEnd > new Date()) return "trial";
  }

  // Cancelling (still has access)
  if (salon?.current_period_end) {
    const periodEnd = new Date(salon.current_period_end);
    if (periodEnd > new Date()) return "cancelling";
  }

  return "cancelled";
}

// ─── Props ──────────────────────────────────────────

interface CurrentPlanCardProps {
  activePlan: Plan;
  salon: Salon | null;
  hasSubscription: boolean;
  actionLoading: boolean;
  error: string | null;
  onShowPlanDialog: () => void;
  onUpdatePaymentMethod: () => void;
  onShowCancelDialog: () => void;
  translations: {
    billingTitle?: string;
    billingDescription?: string;
  };
}

// ─── Component ──────────────────────────────────────

export function CurrentPlanCard({
  activePlan,
  salon,
  hasSubscription,
  actionLoading,
  error,
  onShowPlanDialog,
  onUpdatePaymentMethod,
  onShowCancelDialog,
  translations: t,
}: CurrentPlanCardProps) {
  const PlanIcon = activePlan.icon;
  const state = getBillingState(hasSubscription, salon);

  const periodEnd = salon?.current_period_end
    ? new Date(salon.current_period_end)
    : null;

  const formatDate = (date: Date) =>
    date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

  // ─── State badge ──────────────────────────────────

  const stateBadge = {
    active: (
      <Badge variant="default" className="text-xs">
        <CheckCircle2 className="h-3 w-3 mr-1" />
        Active
      </Badge>
    ),
    cancelling: (
      <Badge variant="secondary" className="text-xs">
        <Clock className="h-3 w-3 mr-1" />
        Cancelling
      </Badge>
    ),
    cancelled: (
      <Badge variant="destructive" className="text-xs">
        <Ban className="h-3 w-3 mr-1" />
        Cancelled
      </Badge>
    ),
    trial: (
      <Badge variant="secondary" className="text-xs">
        <Clock className="h-3 w-3 mr-1" />
        Trial
      </Badge>
    ),
    past_due: (
      <Badge variant="destructive" className="text-xs">
        <AlertTriangle className="h-3 w-3 mr-1" />
        Past Due
      </Badge>
    ),
  }[state];

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold mb-1">
            {t.billingTitle || "Billing & Subscription"}
          </h3>
          <p className="text-sm text-muted-foreground">
            {t.billingDescription || "Manage your subscription plan and add-ons."}
          </p>
        </div>
        <Badge variant="outline" className="text-sm">
          {activePlan.name}
        </Badge>
      </div>

      {/* Plan overview */}
      <div className="border rounded-lg p-4 bg-muted/20">
        <div className="flex items-center gap-3 mb-3">
          <PlanIcon className="h-5 w-5 text-primary" />
          <div className="flex-1">
            <p className="font-semibold">{activePlan.name}</p>
            <p className="text-sm text-muted-foreground">{activePlan.price} / month</p>
          </div>
          {stateBadge}
        </div>

        {/* Single state-driven alert */}
        {state === "cancelling" && periodEnd && (
          <Alert variant="default" className="mt-3">
            <Clock className="h-4 w-4" />
            <AlertTitle>Subscription ending</AlertTitle>
            <AlertDescription>
              <p className="text-sm mt-1">
                Your access continues until <span className="font-semibold">{formatDate(periodEnd)}</span>.
              </p>
              <Button
                variant="default"
                size="sm"
                className="mt-2"
                onClick={onShowPlanDialog}
                disabled={actionLoading}
              >
                Renew subscription
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {state === "cancelled" && (
          <Alert variant="destructive" className="mt-3">
            <Ban className="h-4 w-4" />
            <AlertTitle>Subscription cancelled</AlertTitle>
            <AlertDescription>
              <p className="text-sm mt-1">
                {periodEnd
                  ? `Your access ended on ${formatDate(periodEnd)}.`
                  : "Your subscription has been cancelled."}
              </p>
              <p className="text-sm font-medium mt-1">
                Create a new subscription to continue using the service.
              </p>
            </AlertDescription>
          </Alert>
        )}

        {state === "past_due" && (
          <Alert variant="destructive" className="mt-3">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>
              {salon?.payment_status === "restricted"
                ? "Access Restricted"
                : salon?.payment_status === "grace_period"
                  ? "Payment Failed - Grace Period"
                  : "Payment Failed"}
            </AlertTitle>
            <AlertDescription>
              {salon?.payment_failure_count && salon.payment_failure_count > 0 && (
                <p className="text-sm mt-1">
                  Retry attempts: {salon.payment_failure_count} / 3
                </p>
              )}
              {salon?.payment_failed_at && salon.payment_status === "grace_period" && (
                <p className="text-sm mt-1 flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  Grace period ends:{" "}
                  {new Date(
                    new Date(salon.payment_failed_at).getTime() + 7 * 24 * 60 * 60 * 1000
                  ).toLocaleDateString()}
                </p>
              )}
              <Button
                variant="default"
                size="sm"
                className="mt-2"
                onClick={onUpdatePaymentMethod}
                disabled={actionLoading}
              >
                Update payment method
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* Billing date */}
        {(state === "active" || state === "cancelling") && periodEnd && (
          <div className="mt-3 pt-3 border-t flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              {state === "active" ? "Next billing date:" : "Access ends:"}
            </span>
            <span className="font-medium tabular-nums">{formatDate(periodEnd)}</span>
          </div>
        )}

        {/* Plan limits as visual bars */}
        <div className="mt-3 pt-3 border-t space-y-2">
          <SettingsLimitBar
            label="Employees"
            current={0} // Will be populated by parent
            limit={activePlan.limits.employees}
          />
          <SettingsLimitBar
            label="Languages"
            current={0} // Will be populated by parent
            limit={activePlan.limits.languages}
          />
        </div>
      </div>

      {/* Action buttons -- single primary CTA based on state */}
      <div className="mt-4 flex gap-3 flex-wrap">
        {state === "cancelled" ? (
          <Button
            variant="default"
            onClick={onShowPlanDialog}
            disabled={actionLoading}
            className="flex-1 min-w-[200px]"
          >
            Subscribe Now
          </Button>
        ) : state === "cancelling" ? (
          <Button
            variant="default"
            onClick={onShowPlanDialog}
            disabled={actionLoading}
            className="flex-1 min-w-[200px]"
          >
            Renew Subscription
          </Button>
        ) : (
          <>
            <Button variant="outline" onClick={onShowPlanDialog} disabled={actionLoading}>
              Change Plan
            </Button>
            <Button variant="outline" onClick={onUpdatePaymentMethod} disabled={actionLoading}>
              <CreditCard className="h-4 w-4 mr-2" />
              Update Payment
            </Button>
            <Button variant="outline" onClick={onShowCancelDialog} disabled={actionLoading}>
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
          </>
        )}
      </div>

      {error && (
        <div className="mt-4 p-3 bg-destructive/10 border border-destructive/20 rounded">
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}
    </Card>
  );
}
