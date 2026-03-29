"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CreditCard, X, CheckCircle2, AlertTriangle, Clock, Ban, Sparkles } from "lucide-react";
import { SettingsLimitBar } from "@/components/settings/SettingsLimitBar";
import type { Plan } from "@/lib/utils/billing/billing-utils";
import type { Salon } from "@/lib/types";

// ─── Billing state matrix ────────────────────────────

type BillingState =
  | "active"
  | "cancelling"
  | "needs_subscription"
  | "subscription_ended"
  | "trial"
  | "trial_ended"
  | "past_due";

function ceilWholeDaysUntil(end: Date, now: Date): number {
  const ms = end.getTime() - now.getTime();
  return Math.max(0, Math.ceil(ms / (24 * 60 * 60 * 1000)));
}

function getBillingState(hasSubscription: boolean, salon: Salon | null): BillingState {
  const now = new Date();

  if (
    hasSubscription &&
    salon?.payment_status &&
    ["failed", "grace_period", "restricted"].includes(salon.payment_status)
  ) {
    return "past_due";
  }

  if (
    hasSubscription &&
    typeof salon?.billing_subscription_id === "string" &&
    Boolean((salon as Salon & { cancel_at_period_end?: boolean }).cancel_at_period_end)
  ) {
    return "cancelling";
  }

  if (hasSubscription) return "active";

  if (salon?.trial_end) {
    const trialEnd = new Date(salon.trial_end);
    if (trialEnd > now) return "trial";
    return "trial_ended";
  }

  if (salon?.current_period_end) {
    const periodEnd = new Date(salon.current_period_end);
    if (periodEnd > now) return "cancelling";
    return "subscription_ended";
  }

  return "needs_subscription";
}

export type CurrentPlanCardCopy = {
  billingTitle?: string;
  billingDescription?: string;
  billingTrialBadge?: string;
  billingTrialTitle?: string;
  billingTrialDaysLeft?: string;
  billingTrialDaysLeftOne?: string;
  billingTrialEndsOn?: string;
  billingTrialBody?: string;
  billingNoSubscriptionTitle?: string;
  billingNoSubscriptionBody?: string;
  billingTrialEndedTitle?: string;
  billingTrialEndedBody?: string;
  billingSubscriptionEndedTitle?: string;
  billingSubscriptionEndedBody?: string;
  billingSubscriptionEndedHint?: string;
  billingStateActive?: string;
  billingStateInactive?: string;
  billingStateCancelling?: string;
  billingStatePastDue?: string;
  billingSubscribeNow?: string;
  billingRenewSubscription?: string;
};

const FALLBACK: Required<
  Pick<
    CurrentPlanCardCopy,
    | "billingTrialBadge"
    | "billingTrialTitle"
    | "billingTrialDaysLeft"
    | "billingTrialDaysLeftOne"
    | "billingTrialEndsOn"
    | "billingTrialBody"
    | "billingNoSubscriptionTitle"
    | "billingNoSubscriptionBody"
    | "billingTrialEndedTitle"
    | "billingTrialEndedBody"
    | "billingSubscriptionEndedTitle"
    | "billingSubscriptionEndedBody"
    | "billingSubscriptionEndedHint"
    | "billingStateActive"
    | "billingStateInactive"
    | "billingStateCancelling"
    | "billingStatePastDue"
    | "billingSubscribeNow"
    | "billingRenewSubscription"
  >
> = {
  billingTrialBadge: "Free trial",
  billingTrialTitle: "Your free trial is active",
  billingTrialDaysLeft: "{days} days left in your free trial",
  billingTrialDaysLeftOne: "1 day left in your free trial",
  billingTrialEndsOn: "Trial ends on {date}",
  billingTrialBody:
    "You have full access during your trial. Subscribe before it ends to keep using TeqBook without interruption.",
  billingNoSubscriptionTitle: "No active subscription yet",
  billingNoSubscriptionBody:
    "You are not paying for a plan yet. Subscribe when you are ready — your salon keeps working according to your current access.",
  billingTrialEndedTitle: "Your free trial has ended",
  billingTrialEndedBody: "Subscribe to a plan to continue using your salon dashboard and booking tools.",
  billingSubscriptionEndedTitle: "Subscription ended",
  billingSubscriptionEndedBody: "Your paid period is over and there is no active subscription.",
  billingSubscriptionEndedHint: "Start a new subscription to continue using the service.",
  billingStateActive: "Active",
  billingStateInactive: "Inactive",
  billingStateCancelling: "Cancelling",
  billingStatePastDue: "Past due",
  billingSubscribeNow: "Subscribe now",
  billingRenewSubscription: "Renew subscription",
};

function mergeCopy(t: CurrentPlanCardCopy): typeof FALLBACK {
  const out = { ...FALLBACK };
  for (const key of Object.keys(FALLBACK) as (keyof typeof FALLBACK)[]) {
    const v = t[key];
    if (typeof v === "string" && v.length > 0) {
      out[key] = v;
    }
  }
  return out;
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
  translations: CurrentPlanCardCopy;
  /** BCP 47 tag for formatting trial end date */
  dateLocale?: string;
  usage?: {
    employeesActive: number;
    employeesIncluded: number | null;
    languagesActive: number;
    languagesIncluded: number | null;
  } | null;
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
  translations: tIn,
  dateLocale = "en-US",
  usage,
}: CurrentPlanCardProps) {
  const PlanIcon = activePlan.icon;
  const state = getBillingState(hasSubscription, salon);
  const tc = mergeCopy(tIn);

  const periodEnd = salon?.current_period_end ? new Date(salon.current_period_end) : null;
  const trialEnd = salon?.trial_end ? new Date(salon.trial_end) : null;

  const formatDate = (date: Date) =>
    date.toLocaleDateString(dateLocale, {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

  const trialDaysRemaining = trialEnd && state === "trial" ? ceilWholeDaysUntil(trialEnd, new Date()) : null;

  const trialDaysLine =
    trialDaysRemaining === null
      ? null
      : trialDaysRemaining === 1
        ? tc.billingTrialDaysLeftOne
        : tc.billingTrialDaysLeft.replace("{days}", String(trialDaysRemaining));

  // ─── State badge ──────────────────────────────────

  const stateBadge = {
    active: (
      <Badge variant="default" className="text-xs">
        <CheckCircle2 className="h-3 w-3 mr-1" />
        {tc.billingStateActive}
      </Badge>
    ),
    cancelling: (
      <Badge variant="secondary" className="text-xs">
        <Clock className="h-3 w-3 mr-1" />
        {tc.billingStateCancelling}
      </Badge>
    ),
    needs_subscription: (
      <Badge variant="secondary" className="text-xs">
        <Ban className="h-3 w-3 mr-1" />
        {tc.billingStateInactive}
      </Badge>
    ),
    subscription_ended: (
      <Badge variant="secondary" className="text-xs">
        <Ban className="h-3 w-3 mr-1" />
        {tc.billingStateInactive}
      </Badge>
    ),
    trial: (
      <Badge variant="secondary" className="text-xs">
        <Sparkles className="h-3 w-3 mr-1" />
        {tc.billingTrialBadge}
      </Badge>
    ),
    trial_ended: (
      <Badge variant="secondary" className="text-xs">
        <Ban className="h-3 w-3 mr-1" />
        {tc.billingStateInactive}
      </Badge>
    ),
    past_due: (
      <Badge variant="destructive" className="text-xs">
        <AlertTriangle className="h-3 w-3 mr-1" />
        {tc.billingStatePastDue}
      </Badge>
    ),
  }[state];

  const showFullSubscriptionActions = state === "active" || state === "past_due";

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold mb-1">
            {tIn.billingTitle || "Billing & Subscription"}
          </h3>
          <p className="text-sm text-muted-foreground">
            {tIn.billingDescription || "Manage your subscription plan and add-ons."}
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

        {state === "trial" && trialEnd && (
          <Alert variant="default" className="mt-3 border-primary/20 bg-primary/5">
            <Sparkles className="h-4 w-4 text-primary" />
            <AlertTitle>{tc.billingTrialTitle}</AlertTitle>
            <AlertDescription>
              <p className="text-sm mt-1 font-medium">{trialDaysLine}</p>
              <p className="text-sm mt-1 text-muted-foreground">
                {tc.billingTrialEndsOn.replace("{date}", formatDate(trialEnd))}
              </p>
              <p className="text-sm mt-2">{tc.billingTrialBody}</p>
              <Button variant="default" size="sm" className="mt-2" onClick={onShowPlanDialog} disabled={actionLoading}>
                {tc.billingSubscribeNow}
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {state === "cancelling" && periodEnd && (
          <Alert variant="default" className="mt-3">
            <Clock className="h-4 w-4" />
            <AlertTitle>Subscription ending</AlertTitle>
            <AlertDescription>
              <p className="text-sm mt-1">
                Your access continues until <span className="font-semibold">{formatDate(periodEnd)}</span>.
              </p>
              <Button variant="default" size="sm" className="mt-2" onClick={onShowPlanDialog} disabled={actionLoading}>
                {tc.billingRenewSubscription}
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {state === "needs_subscription" && (
          <Alert variant="default" className="mt-3">
            <CheckCircle2 className="h-4 w-4" />
            <AlertTitle>{tc.billingNoSubscriptionTitle}</AlertTitle>
            <AlertDescription>
              <p className="text-sm mt-1">{tc.billingNoSubscriptionBody}</p>
              <Button variant="default" size="sm" className="mt-2" onClick={onShowPlanDialog} disabled={actionLoading}>
                {tc.billingSubscribeNow}
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {state === "trial_ended" && (
          <Alert variant="destructive" className="mt-3">
            <Ban className="h-4 w-4" />
            <AlertTitle>{tc.billingTrialEndedTitle}</AlertTitle>
            <AlertDescription>
              <p className="text-sm mt-1">{tc.billingTrialEndedBody}</p>
              <Button variant="default" size="sm" className="mt-2" onClick={onShowPlanDialog} disabled={actionLoading}>
                {tc.billingSubscribeNow}
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {state === "subscription_ended" && (
          <Alert variant="destructive" className="mt-3">
            <Ban className="h-4 w-4" />
            <AlertTitle>{tc.billingSubscriptionEndedTitle}</AlertTitle>
            <AlertDescription>
              <p className="text-sm mt-1">{tc.billingSubscriptionEndedBody}</p>
              <p className="text-sm font-medium mt-1">{tc.billingSubscriptionEndedHint}</p>
              <Button variant="default" size="sm" className="mt-2" onClick={onShowPlanDialog} disabled={actionLoading}>
                {tc.billingSubscribeNow}
              </Button>
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
                  ).toLocaleDateString(dateLocale)}
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
            current={usage?.employeesActive ?? 0}
            limit={usage?.employeesIncluded ?? activePlan.limits.employees}
          />
          <SettingsLimitBar
            label="Languages"
            current={usage?.languagesActive ?? 0}
            limit={usage?.languagesIncluded ?? activePlan.limits.languages}
          />
        </div>
      </div>

      {/* Action buttons: full controls only when subscription is active or past_due; other states use CTA inside alerts */}
      {showFullSubscriptionActions ? (
        <div className="mt-4 flex gap-3 flex-wrap">
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
        </div>
      ) : null}

      {error && (
        <div className="mt-4 p-3 bg-destructive/10 border border-destructive/20 rounded">
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}
    </Card>
  );
}
