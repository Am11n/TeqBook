"use client";

import { useEffect, useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useLocale } from "@/components/locale-provider";
import { translations } from "@/i18n/translations";
import { normalizeLocale } from "@/i18n/normalizeLocale";
import { useBilling } from "@/lib/hooks/billing/useBilling";
import { useBillingActions } from "@/lib/hooks/billing/useBillingActions";
import { getPlans, getAddonDisplay } from "@/lib/utils/billing/billing-utils";
import { supabase } from "@/lib/supabase-client";
import { CurrentPlanCard } from "@/components/billing/CurrentPlanCard";
import { AddonsCard } from "@/components/billing/AddonsCard";
import { PlanSelectionDialog } from "@/components/billing/PlanSelectionDialog";
import { PaymentFormDialog } from "@/components/billing/PaymentFormDialog";
import { CancelSubscriptionDialog } from "@/components/billing/CancelSubscriptionDialog";
import { ChevronDown, FileText } from "lucide-react";
import type { PlanType } from "@/lib/types";

export default function BillingSettingsPage() {
  const { locale } = useLocale();
  const appLocale = normalizeLocale(locale);
  const t = translations[appLocale].settings;

  const { currentPlan, addons, loading } = useBilling();
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
  const [smsUsage, setSmsUsage] = useState<{
    included: number;
    used: number;
    overage: number;
    overageCostEstimate: number;
    hardCapReached: boolean;
  } | null>(null);
  const [smsUsageLoading, setSmsUsageLoading] = useState(false);

  const plans = getPlans({
    planStarter: t.planStarter,
    planPro: t.planPro,
    planBusiness: t.planBusiness,
  });

  const addonDisplay = getAddonDisplay(addons);
  const activePlan = plans.find((p) => p.id === currentPlan) || plans[0];
  const usagePercent = useMemo(() => {
    if (!smsUsage || smsUsage.included <= 0) return 0;
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

  const handlePaymentSuccess = async () => {
    setShowPaymentForm(false);
    setClientSecret(null);
  };

  const handleCancelConfirm = async () => {
    const success = await handleCancelSubscription();
    if (success) {
      setShowCancelDialog(false);
    }
  };

  const handleUpdatePayment = async () => {
    const secret = await handleUpdatePaymentMethod();
    if (secret) {
      setClientSecret(secret);
      setPaymentFormType("payment_method");
      setShowPaymentForm(true);
    }
  };

  useEffect(() => {
    const loadSmsUsage = async () => {
      if (!salon?.id) return;
      setSmsUsageLoading(true);

      const nowIso = new Date().toISOString();
      const [usageRes, featureRes] = await Promise.all([
        supabase
          .from("sms_usage")
          .select("included_quota, used_count, overage_count, overage_cost_estimate, hard_cap_reached")
          .eq("salon_id", salon.id)
          .lte("period_start", nowIso)
          .gt("period_end", nowIso)
          .order("period_start", { ascending: false })
          .limit(1)
          .maybeSingle(),
        supabase
          .from("plan_features")
          .select("limit_value, features:feature_id(key)")
          .eq("plan_type", (salon.plan || "starter") as PlanType),
      ]);

      const featureLimit =
        featureRes.data?.find(
          (row) =>
            (row.features as unknown as { key?: string } | null)?.key === "SMS_NOTIFICATIONS"
        )?.limit_value ?? null;

      setSmsUsage({
        included:
          usageRes.data?.included_quota ??
          (typeof featureLimit === "number" ? Math.floor(featureLimit) : 0),
        used: usageRes.data?.used_count ?? 0,
        overage: usageRes.data?.overage_count ?? 0,
        overageCostEstimate: usageRes.data?.overage_cost_estimate ?? 0,
        hardCapReached: usageRes.data?.hard_cap_reached ?? false,
      });
      setSmsUsageLoading(false);
    };

    void loadSmsUsage();
  }, [salon?.id, salon?.plan]);

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
        onShowPlanDialog={() => setShowPlanDialog(true)}
        onUpdatePaymentMethod={handleUpdatePayment}
        onShowCancelDialog={() => setShowCancelDialog(true)}
        translations={{
          billingTitle: t.billingTitle,
          billingDescription: t.billingDescription,
        }}
      />

      <AddonsCard addons={addonDisplay} />

      <Card className="p-6">
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold">SMS Usage</h3>
            <p className="text-sm text-muted-foreground">
              Track included quota, usage, overage estimate, and hard-cap status for this billing period.
            </p>
          </div>

          {smsUsageLoading ? (
            <div className="text-sm text-muted-foreground">Loading SMS usage...</div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-md border p-3">
                <div className="text-xs text-muted-foreground">Included SMS</div>
                <div className="text-xl font-semibold">{smsUsage?.included ?? 0}</div>
              </div>
              <div className="rounded-md border p-3">
                <div className="text-xs text-muted-foreground">Used</div>
                <div className="text-xl font-semibold">{smsUsage?.used ?? 0}</div>
              </div>
              <div className="rounded-md border p-3">
                <div className="text-xs text-muted-foreground">Estimated overage</div>
                <div className="text-xl font-semibold">{smsUsage?.overage ?? 0}</div>
              </div>
              <div className="rounded-md border p-3">
                <div className="text-xs text-muted-foreground">Expected extra cost</div>
                <div className="text-xl font-semibold">{(smsUsage?.overageCostEstimate ?? 0).toFixed(2)} NOK</div>
              </div>
            </div>
          )}

          {usagePercent >= 95 ? (
            <div className="rounded-md border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900">
              You have used {usagePercent}% of your included SMS quota. Consider upgrading to avoid overage costs.
            </div>
          ) : null}

          {smsUsage?.hardCapReached ? (
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
            <div className="flex flex-col items-center py-6 text-center">
              <FileText className="h-8 w-8 text-muted-foreground/40 mb-2" />
              <p className="text-sm text-muted-foreground">
                Your invoices will appear here once you have an active subscription.
              </p>
              <a href="#" className="text-xs text-primary hover:underline mt-1">
                Learn how billing works
              </a>
            </div>
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
        onOpenChange={setShowPaymentForm}
        clientSecret={clientSecret}
        paymentFormType={paymentFormType}
        onSuccess={handlePaymentSuccess}
        onCancel={() => {
          setShowPaymentForm(false);
          setClientSecret(null);
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
