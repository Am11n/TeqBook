"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useLocale } from "@/components/locale-provider";
import { translations } from "@/i18n/translations";
import { normalizeLocale } from "@/i18n/normalizeLocale";
import { useCurrentSalon } from "@/components/salon-provider";
import { useBilling } from "@/lib/hooks/billing/useBilling";
import { useBillingActions } from "@/lib/hooks/billing/useBillingActions";
import { finalizeSetupIntentDefaultPaymentMethod } from "@/lib/services/billing-service";
import { getPlans, getAddonDisplay } from "@/lib/utils/billing/billing-utils";
import { supabase } from "@/lib/supabase-client";
import { CurrentPlanCard } from "@/components/billing/CurrentPlanCard";
import { AddonsCard } from "@/components/billing/AddonsCard";
import { PlanSelectionDialog } from "@/components/billing/PlanSelectionDialog";
import { PaymentFormDialog } from "@/components/billing/PaymentFormDialog";
import { CancelSubscriptionDialog } from "@/components/billing/CancelSubscriptionDialog";
import { ChevronDown, FileText } from "lucide-react";
import type { PlanType } from "@/lib/types";
import {
  loadSmsUsageSummaryForBilling,
  smsBillingWindowKey,
  type SmsUsageSummaryMetrics,
} from "@/lib/services/sms/load-sms-usage-summary";

export default function BillingSettingsPage() {
  const { locale } = useLocale();
  const appLocale = normalizeLocale(locale);
  const t = translations[appLocale].settings;

  const { currentPlan, addons, summary, loading, refetch } = useBilling();
  const {
    salon,
    actionLoading,
    error,
    setError,
    hasSubscription,
    handleChangePlan,
    handleCancelSubscription,
    handleUpdatePaymentMethod,
  } = useBillingActions();
  const { refreshSalon } = useCurrentSalon();

  const [showPlanDialog, setShowPlanDialog] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<PlanType | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [paymentFormType, setPaymentFormType] = useState<"subscription" | "payment_method">(
    "subscription"
  );
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [smsDisabled, setSmsDisabled] = useState(false);
  const [emailOnly, setEmailOnly] = useState(false);
  const [smsUsage, setSmsUsage] = useState<SmsUsageSummaryMetrics | null>(null);
  const [smsUsageLoading, setSmsUsageLoading] = useState(false);
  /** Plan has SMS_NOTIFICATIONS in admin plan features — otherwise the whole SMS block is hidden. */
  const [smsBillingPackActive, setSmsBillingPackActive] = useState(false);
  const [smsUsageUiMode, setSmsUsageUiMode] = useState<"loading" | "ready" | "unavailable">(
    "loading",
  );
  const [smsUsageIsStale, setSmsUsageIsStale] = useState(false);
  const [smsUsageMessage, setSmsUsageMessage] = useState<string | null>(null);
  const smsLastGoodRef = useRef<{ windowKey: string; metrics: SmsUsageSummaryMetrics } | null>(null);
  const pendingSetupIntentIdRef = useRef<string | null>(null);

  const plans = getPlans({
    planStarter: t.planStarter,
    planPro: t.planPro,
    planBusiness: t.planBusiness,
  });

  const addonDisplay = getAddonDisplay(addons);
  const activePlan = plans.find((p) => p.id === currentPlan) || plans[0];
  const smsMetricsTrustedForEstimate = smsUsageUiMode === "ready" && smsUsage !== null;

  const usagePercent = useMemo(() => {
    if (!smsUsage || smsUsage.included === null || smsUsage.included <= 0) return 0;
    return Math.round((smsUsage.used / smsUsage.included) * 100);
  }, [smsUsage]);

  const handlePlanChange = async () => {
    if (!selectedPlan) return;
    const result = await handleChangePlan(selectedPlan);
    if (result?.success) {
      if (result.clientSecret) {
        setClientSecret(result.clientSecret);
        setPaymentFormType("subscription");
        setShowPaymentForm(true);
        setShowPlanDialog(false);
      } else {
        setShowPlanDialog(false);
      }
    }
  };

  const handlePaymentSuccess = async (details?: { setupIntentId?: string }) => {
    const setupIntentId =
      details?.setupIntentId ?? pendingSetupIntentIdRef.current ?? undefined;

    if (
      paymentFormType === "payment_method" &&
      salon?.id &&
      salon.billing_customer_id &&
      setupIntentId
    ) {
      const { error: finalizeError } = await finalizeSetupIntentDefaultPaymentMethod(
        salon.id,
        salon.billing_customer_id,
        setupIntentId
      );
      if (finalizeError) {
        setError(finalizeError);
        return;
      }
    }

    pendingSetupIntentIdRef.current = null;
    setShowPaymentForm(false);
    setClientSecret(null);
    await refetch();
    await refreshSalon();
    await new Promise((resolve) => setTimeout(resolve, 1500));
    await refetch();
    await refreshSalon();
  };

  const handleCancelConfirm = async () => {
    const success = await handleCancelSubscription();
    if (success) {
      setShowCancelDialog(false);
    }
  };

  const handleUpdatePayment = async () => {
    const setup = await handleUpdatePaymentMethod();
    if (setup) {
      pendingSetupIntentIdRef.current = setup.setupIntentId;
      setClientSecret(setup.clientSecret);
      setPaymentFormType("payment_method");
      setShowPaymentForm(true);
    }
  };

  const estimate = useMemo(() => {
    const basePlan = activePlan.price.replace("$", "");
    const basePlanMinor = Number.isNaN(Number(basePlan)) ? 0 : Number(basePlan);
    const extraStaffMinor = (summary?.usage.employeesExtraBilled ?? 0) * 5;
    const extraLanguagesMinor = (summary?.usage.languagesExtraBilled ?? 0) * 10;
    const smsOverageMinor = smsMetricsTrustedForEstimate ? (smsUsage?.overageCostEstimate ?? 0) : 0;
    const total = basePlanMinor + extraStaffMinor + extraLanguagesMinor + smsOverageMinor;
    return { basePlanMinor, extraStaffMinor, extraLanguagesMinor, smsOverageMinor, total };
  }, [
    activePlan.price,
    summary?.usage.employeesExtraBilled,
    summary?.usage.languagesExtraBilled,
    smsUsage?.overageCostEstimate,
    smsMetricsTrustedForEstimate,
  ]);

  useEffect(() => {
    const loadSmsUsage = async () => {
      if (!salon?.id) {
        setSmsBillingPackActive(false);
        setSmsUsageLoading(false);
        setSmsUsageUiMode("unavailable");
        setSmsUsage(null);
        setSmsUsageMessage(null);
        return;
      }
      setSmsUsageLoading(true);
      setSmsUsageUiMode("loading");

      const result = await loadSmsUsageSummaryForBilling(supabase, {
        salonId: salon.id,
        plan: (salon.plan || "starter") as PlanType,
        currentPeriodEnd: salon.current_period_end ?? null,
      });

      if (result.status === "no_sms_feature") {
        setSmsBillingPackActive(false);
        smsLastGoodRef.current = null;
        setSmsUsage(null);
        setSmsUsageLoading(false);
        setSmsUsageMessage(null);
        return;
      }

      setSmsBillingPackActive(true);

      const windowKey = smsBillingWindowKey(result.window);

      if (result.status === "ok" && result.metrics) {
        smsLastGoodRef.current = { windowKey, metrics: result.metrics };
        setSmsUsage(result.metrics);
        setSmsUsageUiMode("ready");
        setSmsUsageIsStale(false);
        setSmsUsageMessage(null);
        setSmsUsageLoading(false);
        return;
      }

      const detail =
        result.status === "duplicate_row"
          ? "Multiple SMS usage records exist for this billing window. Please contact support."
          : result.usageError
            ? `Could not load SMS usage: ${result.usageError}`
            : result.featureError
              ? `Could not load plan data for SMS quota: ${result.featureError}`
              : "SMS usage is temporarily unavailable. Please try again.";

      if (smsLastGoodRef.current?.windowKey === windowKey) {
        setSmsUsage(smsLastGoodRef.current.metrics);
        setSmsUsageUiMode("ready");
        setSmsUsageIsStale(true);
        setSmsUsageMessage(`${detail} Showing last loaded values for this billing period.`);
      } else {
        setSmsUsage(null);
        setSmsUsageUiMode("unavailable");
        setSmsUsageIsStale(false);
        setSmsUsageMessage(detail);
      }
      setSmsUsageLoading(false);
    };

    void loadSmsUsage();
  }, [salon?.id, salon?.plan, salon?.current_period_end]);

  if (loading) {
    return (
      <Card className="p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-muted rounded w-1/4 mb-4" />
          <div className="h-4 bg-muted rounded w-1/2" />
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <CurrentPlanCard
        activePlan={activePlan}
        salon={salon}
        hasSubscription={hasSubscription}
        actionLoading={actionLoading}
        error={error}
        usage={
          summary
            ? {
                employeesActive: summary.usage.employeesActive,
                employeesIncluded: summary.usage.employeesIncluded,
                languagesActive: summary.usage.languagesActive,
                languagesIncluded: summary.usage.languagesIncluded,
              }
            : null
        }
        onShowPlanDialog={() => setShowPlanDialog(true)}
        onUpdatePaymentMethod={handleUpdatePayment}
        onShowCancelDialog={() => setShowCancelDialog(true)}
        dateLocale={appLocale === "nb" ? "nb-NO" : "en-US"}
        translations={{
          billingTitle: t.billingTitle,
          billingDescription: t.billingDescription,
          billingTrialBadge: t.billingTrialBadge,
          billingTrialTitle: t.billingTrialTitle,
          billingTrialDaysLeft: t.billingTrialDaysLeft,
          billingTrialDaysLeftOne: t.billingTrialDaysLeftOne,
          billingTrialEndsOn: t.billingTrialEndsOn,
          billingTrialBody: t.billingTrialBody,
          billingNoSubscriptionTitle: t.billingNoSubscriptionTitle,
          billingNoSubscriptionBody: t.billingNoSubscriptionBody,
          billingTrialEndedTitle: t.billingTrialEndedTitle,
          billingTrialEndedBody: t.billingTrialEndedBody,
          billingSubscriptionEndedTitle: t.billingSubscriptionEndedTitle,
          billingSubscriptionEndedBody: t.billingSubscriptionEndedBody,
          billingSubscriptionEndedHint: t.billingSubscriptionEndedHint,
          billingStateActive: t.billingStateActive,
          billingStateInactive: t.billingStateInactive,
          billingStateCancelling: t.billingStateCancelling,
          billingStatePastDue: t.billingStatePastDue,
          billingSubscribeNow: t.billingSubscribeNow,
          billingRenewSubscription: t.billingRenewSubscription,
        }}
      />

      <AddonsCard
        addons={addonDisplay}
        usage={summary?.usage ?? null}
        actionLoading={actionLoading}
        onManagePlan={() => setShowPlanDialog(true)}
      />

      {smsBillingPackActive ? (
      <Card className="p-6">
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold">SMS Usage</h3>
            <p className="text-sm text-muted-foreground">
              Included quota comes from admin plan features. Unlimited means no included cap for this period.
            </p>
          </div>

          {smsUsageLoading ? (
            <div className="text-sm text-muted-foreground">Loading SMS usage...</div>
          ) : smsUsageUiMode === "unavailable" ? (
            <div className="rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-950 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-100">
              {smsUsageMessage ?? "SMS usage is temporarily unavailable. Please try again."}
            </div>
          ) : (
            <>
              {smsUsageIsStale && smsUsageMessage ? (
                <div className="rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-950 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-100">
                  {smsUsageMessage}
                </div>
              ) : null}
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-md border p-3">
                  <div className="text-xs text-muted-foreground">Included SMS</div>
                  <div className="text-xl font-semibold">
                    {smsUsage == null ? "—" : smsUsage.included === null ? "Unlimited" : smsUsage.included}
                  </div>
                </div>
                <div className="rounded-md border p-3">
                  <div className="text-xs text-muted-foreground">Used</div>
                  <div className="text-xl font-semibold">{smsUsage?.used ?? "—"}</div>
                </div>
                <div className="rounded-md border p-3">
                  <div className="text-xs text-muted-foreground">Estimated overage</div>
                  <div className="text-xl font-semibold">{smsUsage?.overage ?? "—"}</div>
                </div>
                <div className="rounded-md border p-3">
                  <div className="text-xs text-muted-foreground">Expected extra cost</div>
                  <div className="text-xl font-semibold">
                    {smsUsage != null ? `${smsUsage.overageCostEstimate.toFixed(2)} NOK` : "—"}
                  </div>
                </div>
              </div>
            </>
          )}

          {smsUsageUiMode === "ready" && !smsUsageIsStale && usagePercent >= 95 ? (
            <div className="rounded-md border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900">
              You have used {usagePercent}% of your included SMS quota. Consider upgrading to avoid overage costs.
            </div>
          ) : null}

          {smsUsageUiMode === "ready" && smsUsage?.hardCapReached ? (
            <div className="rounded-md border border-red-300 bg-red-50 p-3 text-sm text-red-900">
              Hard cap reached for current period. New transactional SMS may be blocked.
            </div>
          ) : null}

          <div className="space-y-2 pt-2">
            <div className="flex items-center gap-2">
              <Checkbox
                id="sms-disabled"
                checked={smsDisabled}
                onCheckedChange={(checked) => setSmsDisabled(Boolean(checked))}
              />
              <Label htmlFor="sms-disabled">Disable SMS sending</Label>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                id="email-only"
                checked={emailOnly}
                onCheckedChange={(checked) => setEmailOnly(Boolean(checked))}
              />
              <Label htmlFor="email-only">Email-only fallback (no SMS)</Label>
            </div>
            <p className="text-xs text-muted-foreground">
              Toggles are local preview controls in this phase and will be persisted in a dedicated SMS settings step.
            </p>
          </div>
        </div>
      </Card>
      ) : null}

      <Card className="p-6">
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold">Estimated next invoice</h3>
            <p className="text-sm text-muted-foreground">
              This is an estimate and may change until the invoice is finalized.
            </p>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Base plan</span>
              <span>${estimate.basePlanMinor.toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Extra staff</span>
              <span>${estimate.extraStaffMinor.toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Extra languages</span>
              <span>${estimate.extraLanguagesMinor.toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">SMS overage</span>
              <span>{estimate.smsOverageMinor.toFixed(2)} NOK</span>
            </div>
            <div className="border-t pt-2 mt-2 flex items-center justify-between font-semibold">
              <span>Estimated total</span>
              <span>${estimate.total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </Card>

      {/* Billing History -- collapsed by default */}
      <Card className="p-0 overflow-hidden">
        <details className="group">
          <summary className="flex items-center justify-between cursor-pointer px-6 py-4 hover:bg-muted/30 transition-colors">
            <div>
              <h3 className="text-lg font-semibold">Billing History</h3>
              <p className="text-sm text-muted-foreground">
                Invoice history and receipts
              </p>
            </div>
            <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform group-open:rotate-180" />
          </summary>
          <div className="px-6 pb-4 border-t">
            {summary?.history.length ? (
              <div className="divide-y">
                {summary.history.map((invoice) => (
                  <div key={invoice.id} className="flex items-center justify-between gap-3 py-3">
                    <div>
                      <p className="text-sm font-medium">{invoice.id}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(invoice.date).toLocaleDateString()} • {invoice.status}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">
                        {(invoice.amount_minor / 100).toFixed(2)} {invoice.currency}
                      </p>
                      <div className="flex gap-2 justify-end">
                        {invoice.hosted_invoice_url && (
                          <a
                            href={invoice.hosted_invoice_url}
                            target="_blank"
                            rel="noreferrer"
                            className="text-xs text-primary hover:underline"
                          >
                            Open
                          </a>
                        )}
                        {invoice.invoice_pdf && (
                          <a
                            href={invoice.invoice_pdf}
                            target="_blank"
                            rel="noreferrer"
                            className="text-xs text-primary hover:underline"
                          >
                            PDF
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center py-6 text-center">
                <FileText className="h-8 w-8 text-muted-foreground/40 mb-2" />
                <p className="text-sm text-muted-foreground">
                  No invoices yet. They will appear here after your first successful billing cycle.
                </p>
              </div>
            )}
          </div>
        </details>
      </Card>

      <PlanSelectionDialog
        open={showPlanDialog}
        onOpenChange={setShowPlanDialog}
        plans={plans}
        selectedPlan={selectedPlan}
        onSelectPlan={(plan) => setSelectedPlan(plan)}
        onConfirm={handlePlanChange}
        actionLoading={actionLoading}
        hasSubscription={hasSubscription}
      />

      <PaymentFormDialog
        open={showPaymentForm}
        onOpenChange={(open) => {
          setShowPaymentForm(open);
          if (!open) {
            setClientSecret(null);
            pendingSetupIntentIdRef.current = null;
          }
        }}
        clientSecret={clientSecret}
        paymentFormType={paymentFormType}
        onSuccess={handlePaymentSuccess}
        onCancel={() => {
          setShowPaymentForm(false);
          setClientSecret(null);
          pendingSetupIntentIdRef.current = null;
        }}
      />

      <CancelSubscriptionDialog
        open={showCancelDialog}
        onOpenChange={setShowCancelDialog}
        salon={salon}
        actionLoading={actionLoading}
        onConfirm={handleCancelConfirm}
      />
    </div>
  );
}
