"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CreditCard, X, CheckCircle2, AlertTriangle, Clock } from "lucide-react";
import type { Plan } from "@/lib/utils/billing/billing-utils";
import type { Salon } from "@/lib/types";

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

export function CurrentPlanCard({
  activePlan,
  salon,
  hasSubscription,
  actionLoading,
  error,
  onShowPlanDialog,
  onUpdatePaymentMethod,
  onShowCancelDialog,
  translations,
}: CurrentPlanCardProps) {
  const PlanIcon = activePlan.icon;

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold mb-1">
            {translations.billingTitle || "Billing & Subscription"}
          </h3>
          <p className="text-sm text-muted-foreground">
            {translations.billingDescription || "Manage your subscription plan and add-ons"}
          </p>
        </div>
        <Badge variant="outline" className="text-sm">
          {activePlan.name}
        </Badge>
      </div>

      <div className="border rounded-lg p-4 bg-muted/20">
        <div className="flex items-center gap-3 mb-2">
          <PlanIcon className="h-5 w-5 text-primary" />
          <div className="flex-1">
            <p className="font-semibold">{activePlan.name}</p>
            <p className="text-sm text-muted-foreground">{activePlan.price} / month</p>
          </div>
          {hasSubscription && (
            <Badge variant="default" className="text-xs">
              <CheckCircle2 className="h-3 w-3 mr-1" />
              Active
            </Badge>
          )}
        </div>

        {/* Payment Status */}
        {hasSubscription && (salon as any)?.payment_status && (salon as any).payment_status !== "active" && (
          <div className="mt-4 pt-4 border-t">
            <Alert variant={(salon as any).payment_status === "restricted" ? "destructive" : "default"}>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-2">
                  <div className="font-semibold">
                    {(salon as any).payment_status === "failed" && "Payment Failed"}
                    {(salon as any).payment_status === "grace_period" && "Payment Failed - Grace Period"}
                    {(salon as any).payment_status === "restricted" && "Access Restricted"}
                  </div>
                  {(salon as any).payment_failure_count > 0 && (
                    <div className="text-sm">
                      Retry attempts: {(salon as any).payment_failure_count} / 3
                    </div>
                  )}
                  {(salon as any).payment_failed_at && (salon as any).payment_status === "grace_period" && (
                    <div className="text-sm flex items-center gap-2">
                      <Clock className="h-3 w-3" />
                      Grace period ends:{" "}
                      {new Date(
                        new Date((salon as any).payment_failed_at).getTime() + 7 * 24 * 60 * 60 * 1000
                      ).toLocaleDateString()}
                    </div>
                  )}
                </div>
              </AlertDescription>
            </Alert>
          </div>
        )}

        {/* Subscription Status */}
        {hasSubscription && salon?.current_period_end && (
          <div className="mt-4 pt-4 border-t space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Next billing date:</span>
              <span className="font-medium">
                {new Date(salon.current_period_end).toLocaleDateString()}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Subscription ID:</span>
              <span className="font-mono text-xs text-muted-foreground">
                {salon.billing_subscription_id?.substring(0, 20)}...
              </span>
            </div>
          </div>
        )}

        <div className="mt-4 space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Plan limits:</span>
            <span className="font-medium">
              {activePlan.limits.employees === null
                ? "Unlimited employees"
                : `${activePlan.limits.employees} employees`}
              {", "}
              {activePlan.limits.languages === null
                ? "unlimited languages"
                : `${activePlan.limits.languages} languages`}
            </span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-4 flex gap-3">
        <Button variant="outline" onClick={onShowPlanDialog} disabled={actionLoading}>
          {hasSubscription ? "Change Plan" : "Subscribe"}
        </Button>

        {hasSubscription && (
          <>
            <Button variant="outline" onClick={onUpdatePaymentMethod} disabled={actionLoading}>
              <CreditCard className="h-4 w-4 mr-2" />
              Update Payment Method
            </Button>
            <Button variant="outline" onClick={onShowCancelDialog} disabled={actionLoading}>
              <X className="h-4 w-4 mr-2" />
              Cancel Subscription
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

