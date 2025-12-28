"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { useLocale } from "@/components/locale-provider";
import { translations } from "@/i18n/translations";
import { normalizeLocale } from "@/i18n/normalizeLocale";
import { useBilling } from "@/lib/hooks/billing/useBilling";
import { useBillingActions } from "@/lib/hooks/billing/useBillingActions";
import { getPlans, getAddonDisplay } from "@/lib/utils/billing/billing-utils";
import { CurrentPlanCard } from "@/components/billing/CurrentPlanCard";
import { AddonsCard } from "@/components/billing/AddonsCard";
import { PlanSelectionDialog } from "@/components/billing/PlanSelectionDialog";
import { PaymentFormDialog } from "@/components/billing/PaymentFormDialog";
import { CancelSubscriptionDialog } from "@/components/billing/CancelSubscriptionDialog";
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

  const plans = getPlans({
    planStarter: t.planStarter,
    planPro: t.planPro,
    planBusiness: t.planBusiness,
  });

  const addonDisplay = getAddonDisplay(addons);
  const activePlan = plans.find((p) => p.id === currentPlan) || plans[0];

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
    // Refresh will be handled by the hook
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

  if (loading) {
    return (
      <Card className="p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-muted rounded w-1/4 mb-4"></div>
          <div className="h-4 bg-muted rounded w-1/2"></div>
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
        <h3 className="text-lg font-semibold mb-2">Billing History</h3>
        <p className="text-sm text-muted-foreground">
          Invoice history will appear here when billing is fully implemented
        </p>
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
