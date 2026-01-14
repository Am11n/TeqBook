"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CreditCard, X, CheckCircle2, AlertTriangle, Clock, Ban } from "lucide-react";
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
          {(() => {
            // Check if subscription is scheduled for cancellation
            // If hasSubscription is true but current_period_end is in the future and close (within 30 days),
            // it might be scheduled for cancellation
            // For now, we'll show "Active" if hasSubscription is true
            // The alert below will handle showing cancellation info
            if (hasSubscription) {
              return (
                <Badge variant="default" className="text-xs">
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  Active
                </Badge>
              );
            } else if (salon?.current_period_end) {
              const periodEndStr = salon.current_period_end;
              if (!periodEndStr) return null;
              
              const periodEnd = new Date(periodEndStr);
              if (periodEnd > new Date()) {
                return (
                  <Badge variant="secondary" className="text-xs">
                    <Clock className="h-3 w-3 mr-1" />
                    Cancelling
                  </Badge>
                );
              } else if (periodEnd <= new Date()) {
                return (
                  <Badge variant="destructive" className="text-xs">
                    <Ban className="h-3 w-3 mr-1" />
                    Cancelled
                  </Badge>
                );
              }
            }
            return null;
          })()}
        </div>

        {/* Subscription Cancelled Alert - Show if subscription is cancelled or scheduled for cancellation */}
        {/* Show alert when current_period_end exists and subscription is cancelled (no subscription ID) */}
        {/* This will show after cancellation when billing_subscription_id is set to null */}
        {salon?.current_period_end && !hasSubscription && (() => {
          const periodEnd = salon.current_period_end;
          if (!periodEnd) return null;
          
          const endDate = new Date(periodEnd);
          const isExpired = endDate <= new Date();
          
          return (
            <div className="mt-4 pt-4 border-t">
              <Alert variant={isExpired ? "destructive" : "default"}>
                {isExpired ? (
                  <Ban className="h-4 w-4" />
                ) : (
                  <Clock className="h-4 w-4" />
                )}
                <AlertTitle className="text-base font-semibold">
                  {isExpired ? "Subscription Cancelled" : "Subscription Cancelling"}
                </AlertTitle>
                <AlertDescription className="mt-2">
                  {isExpired ? (
                    <div className="space-y-3">
                      <div className="text-sm">
                        Din subscription har blitt kansellert og tilgangen sluttet{" "}
                        <span className="font-semibold text-base">
                          {endDate.toLocaleDateString("nb-NO", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </span>
                        .
                      </div>
                      <div className="flex items-center gap-2 mt-3">
                        <Button
                          variant="default"
                          size="sm"
                          onClick={onShowPlanDialog}
                          disabled={actionLoading}
                        >
                          Opprett ny subscription
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="text-sm">
                        Din subscription vil bli kansellert og tilgangen slutter{" "}
                        <span className="font-semibold text-base">
                          {endDate.toLocaleDateString("nb-NO", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </span>
                        .
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Du vil fortsatt ha tilgang til da. Hvis du vil fornye din subscription, trykk på knappen under.
                      </div>
                      <div className="flex items-center gap-2 mt-3">
                        <Button
                          variant="default"
                          size="sm"
                          onClick={onShowPlanDialog}
                          disabled={actionLoading}
                        >
                          Forny subscription
                        </Button>
                      </div>
                    </div>
                  )}
                </AlertDescription>
              </Alert>
            </div>
          );
        })()}
        
        {/* Fallback: Show alert if subscription was cancelled but current_period_end is not set */}
        {!hasSubscription && !salon?.current_period_end && salon?.plan && (
          <div className="mt-4 pt-4 border-t">
            <Alert variant="default">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle className="text-base font-semibold">
                Subscription Cancelled
              </AlertTitle>
              <AlertDescription className="mt-2">
                <div className="space-y-3">
                  <div className="text-sm">
                    Your subscription has been cancelled.
                  </div>
                  <div className="text-sm font-medium">
                    Please create a new subscription to continue using the service.
                  </div>
                </div>
              </AlertDescription>
            </Alert>
          </div>
        )}

        {/* Show alert even if current_period_end is not set but subscription is cancelled */}
        {!hasSubscription && !salon?.current_period_end && salon?.plan && (
          <div className="mt-4 pt-4 border-t">
            <Alert variant="destructive">
              <Ban className="h-4 w-4" />
              <AlertTitle className="text-base font-semibold">Subscription Cancelled</AlertTitle>
              <AlertDescription className="mt-2">
                <div className="space-y-3">
                  <div className="text-sm">
                    Your subscription has been cancelled and access has ended.
                  </div>
                  <div className="text-sm font-medium">
                    Please create a new subscription to continue using the service.
                  </div>
                </div>
              </AlertDescription>
            </Alert>
          </div>
        )}

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
        {(hasSubscription || salon?.current_period_end) && (
          <div className="mt-4 pt-4 border-t space-y-2">
            {salon?.current_period_end && (() => {
              const periodEnd = salon.current_period_end;
              if (!periodEnd) return null;
              
              const endDate = new Date(periodEnd);
              const isExpired = endDate <= new Date();
              
              return (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    {hasSubscription 
                      ? "Next billing date:" 
                      : isExpired
                      ? "Access ended:"
                      : "Access ends:"}
                  </span>
                  <span className="font-semibold text-base">
                    {endDate.toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </span>
                </div>
              );
            })()}
            {hasSubscription && salon?.billing_subscription_id && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Subscription ID:</span>
                <span className="font-mono text-xs text-muted-foreground">
                  {salon.billing_subscription_id.substring(0, 20)}...
                </span>
              </div>
            )}
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
      <div className="mt-4 flex gap-3 flex-wrap">
        {!hasSubscription && salon?.current_period_end && (() => {
          const periodEnd = salon.current_period_end;
          if (!periodEnd) return false;
          return new Date(periodEnd) > new Date();
        })() ? (
          // Subscription is cancelling - show renew button prominently
          <Button 
            variant="default" 
            onClick={onShowPlanDialog} 
            disabled={actionLoading}
            className="flex-1 min-w-[200px]"
          >
            Renew Subscription
          </Button>
        ) : !hasSubscription ? (
          // Subscription is cancelled - show subscribe button prominently
          <Button 
            variant="default" 
            onClick={onShowPlanDialog} 
            disabled={actionLoading}
            className="flex-1 min-w-[200px]"
          >
            Subscribe Now
          </Button>
        ) : (
          // Active subscription - show normal buttons
          <>
            <Button variant="outline" onClick={onShowPlanDialog} disabled={actionLoading}>
              Change Plan
            </Button>
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

