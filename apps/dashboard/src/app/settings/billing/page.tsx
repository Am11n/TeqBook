"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useLocale } from "@/components/locale-provider";
import { translations } from "@/i18n/translations";
import { normalizeLocale } from "@/i18n/normalizeLocale";
import { resolveSettings } from "../_helpers/resolve-settings";
import { applyTemplate } from "@/i18n/apply-template";
import { intlLocaleTag } from "@/i18n/intlLocaleTag";
import type { AppLocale } from "@/i18n/translations";
import { useCurrentSalon } from "@/components/salon-provider";
import { useBilling } from "@/lib/hooks/billing/useBilling";
import { useBillingActions } from "@/lib/hooks/billing/useBillingActions";
import {
  applyImmediateAddonChange,
  clearPendingPlan,
  finalizeSetupIntentDefaultPaymentMethod,
  previewImmediateAddonChange,
  setSalonPendingAddons,
} from "@/lib/services/billing-service";
import {
  buildUpgradeRecommendationModel,
  getAddonDisplay,
  getPlans,
  UPGRADE_HIDE_THRESHOLD,
  UPGRADE_SHOW_THRESHOLD,
} from "@/lib/utils/billing/billing-utils";
import { supabase } from "@/lib/supabase-client";
import { CurrentPlanCard } from "@/components/billing/CurrentPlanCard";
import { AddonsCard } from "@/components/billing/AddonsCard";
import { PlanSelectionDialog } from "@/components/billing/PlanSelectionDialog";
import type { PlanChangeTiming } from "@/components/billing/PlanSelectionDialog";
import { PaymentFormDialog } from "@/components/billing/PaymentFormDialog";
import { CancelSubscriptionDialog } from "@/components/billing/CancelSubscriptionDialog";
import { ChevronDown, FileText } from "lucide-react";
import type { PlanType } from "@/lib/types";
import {
  loadSmsUsageSummaryForBilling,
  smsBillingWindowKey,
  type SmsUsageSummaryMetrics,
} from "@/lib/services/sms/load-sms-usage-summary";
import { isSubscriptionBillingPeriodEndStale } from "@/lib/utils/billing/subscription-period-stale";
import {
  partitionUpcomingInvoiceLines,
  summarizeUpcomingLinesClient,
} from "@/lib/utils/billing/upcoming-invoice-display";
import type { AddonType, PreviewImmediateAddonChangeResponse } from "@/lib/services/billing/shared";

export default function BillingSettingsPage() {
  const { locale } = useLocale();
  const appLocale = normalizeLocale(locale);
  const t = useMemo(
    () => resolveSettings(translations[appLocale].settings),
    [appLocale],
  );

  const {
    currentPlan,
    addons,
    summary,
    invoicePreview,
    addonStripeUsageTrusted,
    loading,
    refetch,
    billingPeriodStaleSyncFailed,
  } = useBilling();
  const {
    salon,
    actionLoading,
    error,
    setError,
    hasSubscription,
    billingPlanChangesBlocked,
    billingPaymentMethodBlocked,
    handleChangePlan,
    handleCancelSubscription,
    handleUpdatePaymentMethod,
  } = useBillingActions();
  const { refreshSalon, profile, user } = useCurrentSalon();

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
  const [prefsDirty, setPrefsDirty] = useState(false);
  const [prefsSaving, setPrefsSaving] = useState(false);
  const [prefsSaveError, setPrefsSaveError] = useState<string | null>(null);
  const [prefsSavedAt, setPrefsSavedAt] = useState<number | null>(null);
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
  const [showStripeInvoiceLines, setShowStripeInvoiceLines] = useState(false);
  const [pendingAddonSaving, setPendingAddonSaving] = useState(false);
  const [pendingCapped, setPendingCapped] = useState(false);
  const [immediateAddonSaving, setImmediateAddonSaving] = useState(false);
  const [immediateAddonReconciling, setImmediateAddonReconciling] = useState(false);
  const [showUpgradeRecommendation, setShowUpgradeRecommendation] = useState(false);

  useEffect(() => {
    const billingPrefs = (
      (profile as { user_preferences?: { billingNotifications?: { smsDisabled?: boolean; emailOnly?: boolean } } | null } | null)
        ?.user_preferences?.billingNotifications
    ) ?? null;
    setSmsDisabled(Boolean(billingPrefs?.smsDisabled));
    setEmailOnly(Boolean(billingPrefs?.emailOnly));
    setPrefsDirty(false);
    setPrefsSaveError(null);
  }, [profile]);

  const billingPeriodEndStale = isSubscriptionBillingPeriodEndStale(salon);

  const plans = getPlans({
    planStarter: t.planStarter,
    planPro: t.planPro,
    planBusiness: t.planBusiness,
    billingPlanStarterFeature1: t.billingPlanStarterFeature1,
    billingPlanStarterFeature2: t.billingPlanStarterFeature2,
    billingPlanStarterFeature3: t.billingPlanStarterFeature3,
    billingPlanStarterFeature4: t.billingPlanStarterFeature4,
    billingPlanStarterFeature5: t.billingPlanStarterFeature5,
    billingPlanStarterFeature6: t.billingPlanStarterFeature6,
    billingPlanProFeature1: t.billingPlanProFeature1,
    billingPlanProFeature2: t.billingPlanProFeature2,
    billingPlanProFeature3: t.billingPlanProFeature3,
    billingPlanProFeature4: t.billingPlanProFeature4,
    billingPlanProFeature5: t.billingPlanProFeature5,
    billingPlanProFeature6: t.billingPlanProFeature6,
    billingPlanProFeature7: t.billingPlanProFeature7,
    billingPlanBusinessFeature1: t.billingPlanBusinessFeature1,
    billingPlanBusinessFeature2: t.billingPlanBusinessFeature2,
    billingPlanBusinessFeature3: t.billingPlanBusinessFeature3,
    billingPlanBusinessFeature4: t.billingPlanBusinessFeature4,
  });

  const addonDisplay = getAddonDisplay(addons);
  const activePlan = plans.find((p) => p.id === currentPlan) || plans[0];
  const smsMetricsTrustedForEstimate = smsUsageUiMode === "ready" && smsUsage !== null;
  const upgradeRecommendationModel = useMemo(
    () => buildUpgradeRecommendationModel(activePlan.id, plans, addonDisplay),
    [activePlan.id, plans, addonDisplay],
  );

  const usagePercent = useMemo(() => {
    if (!smsUsage || smsUsage.included === null || smsUsage.included <= 0) return 0;
    return Math.round((smsUsage.used / smsUsage.included) * 100);
  }, [smsUsage]);

  useEffect(() => {
    if (!upgradeRecommendationModel) {
      setShowUpgradeRecommendation(false);
      return;
    }
    setShowUpgradeRecommendation((prev) => {
      if (prev) {
        return upgradeRecommendationModel.ratioToNextPlan >= UPGRADE_HIDE_THRESHOLD;
      }
      return upgradeRecommendationModel.ratioToNextPlan >= UPGRADE_SHOW_THRESHOLD;
    });
  }, [upgradeRecommendationModel]);

  const upgradeRecommendation =
    !loading && !showPlanDialog && showUpgradeRecommendation && upgradeRecommendationModel
      ? {
          ...upgradeRecommendationModel,
          mode:
            upgradeRecommendationModel.currentRecurringMinor >= upgradeRecommendationModel.nextPlanMinor
              ? ("above" as const)
              : ("near" as const),
        }
      : null;

  const handlePlanChangeConfirm = async (opts: { timing: PlanChangeTiming }) => {
    if (!selectedPlan) return;
    const result = await handleChangePlan(selectedPlan, { timing: opts.timing });
    if (result?.success) {
      if (result.clientSecret) {
        setClientSecret(result.clientSecret);
        setPaymentFormType("subscription");
        setShowPaymentForm(true);
        setShowPlanDialog(false);
      } else {
        setShowPlanDialog(false);
        await refetch();
        await refreshSalon();
        if (opts.timing === "immediate") {
          await new Promise((r) => setTimeout(r, 900));
          await refetch();
          await refreshSalon();
        }
      }
    }
  };

  const handleCancelPendingPlan = async () => {
    if (!salon?.id) return;
    setError(null);
    const { error: clrErr } = await clearPendingPlan(salon.id);
    if (clrErr) {
      setError(clrErr);
      return;
    }
    await refreshSalon();
    await refetch();
  };

  const pendingPlanBannerText =
    salon?.pending_plan && ["starter", "pro", "business"].includes(salon.pending_plan)
      ? applyTemplate(t.billingPlanPendingBanner, {
          plan: plans.find((p) => p.id === salon.pending_plan)?.name ?? String(salon.pending_plan),
          current: activePlan.name,
          date: salon.current_period_end
            ? new Date(salon.current_period_end).toLocaleDateString(intlLocaleTag(appLocale as AppLocale), {
                year: "numeric",
                month: "long",
                day: "numeric",
              })
            : "—",
        })
      : null;

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

  const handleSavePendingAddons = async (staff: number, languages: number) => {
    if (!salon?.id) return;
    setPendingAddonSaving(true);
    setPendingCapped(false);
    setError(null);
    const includedStaff = summary?.usage.planIncludesEmployees ?? 0;
    const includedLanguages = summary?.usage.planIncludesLanguages ?? 0;
    const pendingStaffTarget = Math.max(includedStaff + staff, 0);
    const pendingLanguageTarget = Math.max(includedLanguages + languages, 0);
    const { data, error: pendErr } = await setSalonPendingAddons(salon.id, {
      active_target_staff_capacity: Number(salon.active_target_staff_capacity ?? 0),
      active_target_language_capacity: Number(salon.active_target_language_capacity ?? 0),
      pending_target_staff_capacity: pendingStaffTarget,
      pending_target_language_capacity: pendingLanguageTarget,
    });
    setPendingAddonSaving(false);
    if (pendErr) {
      setError(pendErr);
      return;
    }
    setPendingCapped(Boolean(data?.capped));
    await refetch();
    await refreshSalon();
  };

  const canUseImmediateAddon = profile?.role === "owner" || profile?.role === "admin";

  const handlePreviewImmediateAddon = async (
    addonType: AddonType,
    quantity: number,
  ): Promise<{ data: PreviewImmediateAddonChangeResponse | null; error: string | null }> => {
    if (!salon?.id) return { data: null, error: "Missing salon context" };
    return previewImmediateAddonChange(salon.id, addonType, quantity);
  };

  const handleApplyImmediateAddon = async (
    addonType: AddonType,
    quantity: number,
  ): Promise<{ success: boolean; error?: string }> => {
    if (!salon?.id) return { success: false, error: "Missing salon context" };
    setImmediateAddonSaving(true);
    setImmediateAddonReconciling(false);
    setError(null);
    const { data, error: applyErr } = await applyImmediateAddonChange(salon.id, addonType, quantity);
    if (applyErr || !data || ("success" in data && !data.success)) {
      setImmediateAddonSaving(false);
      return { success: false, error: applyErr ?? ("reason" in (data ?? {}) ? (data as { reason?: string }).reason : "Immediate update failed") };
    }

    try {
      await refetch();
      await refreshSalon();
      await new Promise((resolve) => setTimeout(resolve, 800));
      await refetch();
      await refreshSalon();
      setImmediateAddonSaving(false);
      return { success: true };
    } catch {
      setImmediateAddonSaving(false);
      setImmediateAddonReconciling(true);
      setError("Billing is updating. We are re-syncing your add-on state.");
      setTimeout(() => {
        void (async () => {
          try {
            await refetch();
            await refreshSalon();
          } finally {
            setImmediateAddonReconciling(false);
          }
        })();
      }, 1500);
      return { success: true };
    }
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

  const handleSaveBillingNotificationPrefs = async () => {
    if (!user?.id) {
      setPrefsSaveError("Not logged in");
      return;
    }
    setPrefsSaving(true);
    setPrefsSaveError(null);
    const currentPrefs =
      (profile as { user_preferences?: Record<string, unknown> | null } | null)?.user_preferences ?? {};
    const nextPrefs = {
      ...currentPrefs,
      billingNotifications: {
        smsDisabled,
        emailOnly,
      },
    };
    const { error: saveError } = await supabase
      .from("profiles")
      .update({ user_preferences: nextPrefs })
      .eq("id", user.id);
    setPrefsSaving(false);
    if (saveError) {
      setPrefsSaveError(saveError.message);
      return;
    }
    setPrefsDirty(false);
    setPrefsSavedAt(Date.now());
  };

  const formatMoneyMinor = (amountMinor: number, currency: string) => {
    const cur = currency.toUpperCase();
    return `${(amountMinor / 100).toFixed(2)} ${cur}`;
  };

  const stripePreviewDerived = useMemo(() => {
    if (invoicePreview?.mode !== "stripe_preview") return null;
    const lines = invoicePreview.lines;
    const { recurring, proration } = partitionUpcomingInvoiceLines(lines);
    const timingFromApi = invoicePreview.summary?.timing_adjustments_minor;
    const timingAdjustmentsMinor =
      typeof timingFromApi === "number" && !Number.isNaN(timingFromApi)
        ? timingFromApi
        : proration.reduce((s, line) => s + line.amount_minor, 0);
    const effectiveSummary = invoicePreview.summary ?? summarizeUpcomingLinesClient(lines);
    const recurringSubtotalMinor = effectiveSummary.subscription_minor + effectiveSummary.addons_minor;
    return {
      currency: invoicePreview.currency,
      total_minor: invoicePreview.total_minor,
      effectiveSummary,
      recurringSubtotalMinor,
      recurring,
      proration,
      timingAdjustmentsMinor,
    };
  }, [invoicePreview]);

  /** Model A: headline “next invoice” estimate = recurring plan + add-on lines only (no mid-cycle proration). */
  const stripePreviewTotalShownMinor = useMemo(() => {
    if (invoicePreview?.mode !== "stripe_preview" || !stripePreviewDerived) return null;
    return stripePreviewDerived.recurringSubtotalMinor;
  }, [invoicePreview, stripePreviewDerived]);

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
          ? t.billingSmsDuplicateRows
          : result.usageError
            ? applyTemplate(t.billingSmsUsageError, { detail: result.usageError })
            : result.featureError
              ? applyTemplate(t.billingSmsPlanDataError, { detail: result.featureError })
              : t.billingSmsUnavailable;

      if (smsLastGoodRef.current?.windowKey === windowKey) {
        setSmsUsage(smsLastGoodRef.current.metrics);
        setSmsUsageUiMode("ready");
        setSmsUsageIsStale(true);
        setSmsUsageMessage(
          applyTemplate(t.billingSmsStaleLine, { detail }),
        );
      } else {
        setSmsUsage(null);
        setSmsUsageUiMode("unavailable");
        setSmsUsageIsStale(false);
        setSmsUsageMessage(detail);
      }
      setSmsUsageLoading(false);
    };

    void loadSmsUsage();
  }, [
    salon?.id,
    salon?.plan,
    salon?.current_period_end,
    t.billingSmsDuplicateRows,
    t.billingSmsUsageError,
    t.billingSmsPlanDataError,
    t.billingSmsUnavailable,
    t.billingSmsStaleLine,
  ]);

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
        pendingPlanBanner={pendingPlanBannerText}
        onCancelPendingPlan={salon?.pending_plan ? handleCancelPendingPlan : undefined}
        cancelPendingPlanLabel={t.billingPlanPendingCancel}
        billingPeriodStale={{
          syncing: loading && billingPeriodEndStale && !billingPeriodStaleSyncFailed,
          failed: billingPeriodStaleSyncFailed && billingPeriodEndStale,
        }}
        usage={
          summary
            ? {
                employeesActive: summary.usage.employeesActive,
                employeesCapacity: summary.usage.employeesAllowed,
                languagesActive: summary.usage.languagesActive,
                languagesCapacity: summary.usage.languagesAllowed,
                planIncludesEmployees: summary.usage.planIncludesEmployees,
                planIncludesLanguages: summary.usage.planIncludesLanguages,
              }
            : null
        }
        onShowPlanDialog={() => setShowPlanDialog(true)}
        onUpdatePaymentMethod={handleUpdatePayment}
        onShowCancelDialog={() => setShowCancelDialog(true)}
        planChangeDisabled={billingPlanChangesBlocked}
        paymentMethodActionDisabled={billingPaymentMethodBlocked}
        dateLocale={intlLocaleTag(appLocale as AppLocale)}
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
          billingStateGrace: t.billingStateGrace,
          billingStateSuspended: t.billingStateSuspended,
          billingStateInconsistentBilling: t.billingStateInconsistentBilling,
          billingInconsistentBillingTitle: t.billingInconsistentBillingTitle,
          billingInconsistentBillingBody: t.billingInconsistentBillingBody,
          billingSuspendedAccessTitle: t.billingSuspendedAccessTitle,
          billingSuspendedAccessBody: t.billingSuspendedAccessBody,
          billingSubscribeNow: t.billingSubscribeNow,
          billingRenewSubscription: t.billingRenewSubscription,
          billingPeriodStaleSyncTitle: t.billingPeriodStaleSyncTitle,
          billingPeriodStaleSyncBody: t.billingPeriodStaleSyncBody,
          billingPeriodStaleFailedTitle: t.billingPeriodStaleFailedTitle,
          billingPeriodStaleFailedBody: t.billingPeriodStaleFailedBody,
          billingUsageEmployeesBarLabel: t.billingUsageEmployeesBarLabel,
          billingUsageLanguagesBarLabel: t.billingUsageLanguagesBarLabel,
          billingPlanLimitsFootnote: t.billingPlanLimitsFootnote,
        }}
      />

      {t.billingAutoRenewFootnote ? (
        <p className="text-sm text-muted-foreground max-w-2xl">{t.billingAutoRenewFootnote}</p>
      ) : null}

      <AddonsCard
        stripeAddonUsageTrusted={addonStripeUsageTrusted}
        dateLocale={intlLocaleTag(appLocale as AppLocale)}
        pendingExtraStaff={Math.max(
          Number(salon?.pending_target_staff_capacity ?? 0) - Number(summary?.usage.planIncludesEmployees ?? 0),
          0,
        )}
        pendingExtraLanguages={Math.max(
          Number(salon?.pending_target_language_capacity ?? 0) - Number(summary?.usage.planIncludesLanguages ?? 0),
          0,
        )}
        activeTargetStaffCapacity={Number(salon?.active_target_staff_capacity ?? 0)}
        activeTargetLanguageCapacity={Number(salon?.active_target_language_capacity ?? 0)}
        pendingTargetStaffCapacity={Number(salon?.pending_target_staff_capacity ?? 0)}
        pendingTargetLanguageCapacity={Number(salon?.pending_target_language_capacity ?? 0)}
        nextPeriodEndIso={salon?.current_period_end ?? null}
        onSavePending={hasSubscription ? handleSavePendingAddons : undefined}
        onPreviewImmediate={hasSubscription ? handlePreviewImmediateAddon : undefined}
        onApplyImmediate={hasSubscription ? handleApplyImmediateAddon : undefined}
        pendingSaving={pendingAddonSaving}
        pendingCapped={pendingCapped}
        immediateMutationLoading={immediateAddonSaving}
        immediateReconcilePending={immediateAddonReconciling}
        canImmediateActivate={Boolean(canUseImmediateAddon)}
        upgradeRecommendation={upgradeRecommendation}
        addons={addonDisplay}
        usage={summary?.usage ?? null}
        actionLoading={actionLoading}
        onManagePlan={() => setShowPlanDialog(true)}
        t={t}
      />

      {smsBillingPackActive ? (
      <Card className="p-6">
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold">{t.billingSmsUsageTitle}</h3>
            <p className="text-sm text-muted-foreground">
              {t.billingSmsUsageDescription}
            </p>
          </div>

          {smsUsageLoading ? (
            <div className="text-sm text-muted-foreground">{t.billingSmsLoading}</div>
          ) : smsUsageUiMode === "unavailable" ? (
            <div className="rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-950 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-100">
              {smsUsageMessage ?? t.billingSmsUnavailable}
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
                  <div className="text-xs text-muted-foreground">{t.billingSmsIncludedLabel}</div>
                  <div className="text-xl font-semibold">
                    {smsUsage == null
                      ? t.emailNotProvided
                      : smsUsage.included === null
                        ? t.billingUnlimited
                        : smsUsage.included}
                  </div>
                </div>
                <div className="rounded-md border p-3">
                  <div className="text-xs text-muted-foreground">{t.billingSmsUsedLabel}</div>
                  <div className="text-xl font-semibold">
                    {smsUsage?.used ?? t.emailNotProvided}
                  </div>
                </div>
                <div className="rounded-md border p-3">
                  <div className="text-xs text-muted-foreground">{t.billingSmsOverageLabel}</div>
                  <div className="text-xl font-semibold">
                    {smsUsage?.overage ?? t.emailNotProvided}
                  </div>
                </div>
                <div className="rounded-md border p-3">
                  <div className="text-xs text-muted-foreground">{t.billingSmsExpectedCostLabel}</div>
                  <div className="text-xl font-semibold">
                    {smsUsage != null
                      ? `${smsUsage.overageCostEstimate.toFixed(2)} NOK`
                      : t.emailNotProvided}
                  </div>
                </div>
              </div>
            </>
          )}

          {smsUsageUiMode === "ready" && !smsUsageIsStale && usagePercent >= 95 ? (
            <div className="rounded-md border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900">
              {applyTemplate(t.billingSmsQuotaWarning, { percent: String(usagePercent) })}
            </div>
          ) : null}

          {smsUsageUiMode === "ready" && smsUsage?.hardCapReached ? (
            <div className="rounded-md border border-red-300 bg-red-50 p-3 text-sm text-red-900">
              {t.billingSmsHardCapWarning}
            </div>
          ) : null}

          <div className="space-y-2 pt-2">
            <div className="flex items-center gap-2">
              <Checkbox
                id="sms-disabled"
                checked={smsDisabled}
                onCheckedChange={(checked) => {
                  setSmsDisabled(Boolean(checked));
                  setPrefsDirty(true);
                }}
              />
              <Label htmlFor="sms-disabled">{t.billingSmsDisableSending}</Label>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                id="email-only"
                checked={emailOnly}
                onCheckedChange={(checked) => {
                  setEmailOnly(Boolean(checked));
                  setPrefsDirty(true);
                }}
              />
              <Label htmlFor="email-only">{t.billingSmsEmailOnlyFallback}</Label>
            </div>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                size="sm"
                onClick={handleSaveBillingNotificationPrefs}
                disabled={!prefsDirty || prefsSaving}
              >
                {prefsSaving ? "Saving..." : "Save notification policy"}
              </Button>
              {prefsSavedAt ? (
                <span className="text-xs text-muted-foreground">
                  Saved {new Date(prefsSavedAt).toLocaleTimeString()}
                </span>
              ) : null}
            </div>
            {prefsSaveError ? (
              <div className="rounded-md border border-red-300 bg-red-50 p-2 text-xs text-red-900">
                {prefsSaveError}
              </div>
            ) : null}
            <p className="text-xs text-muted-foreground">
              {t.billingSmsTogglesHint}
            </p>
          </div>
        </div>
      </Card>
      ) : null}

      <Card className="p-6">
        <div className="space-y-4">
          {invoicePreview?.mode === "stripe_preview" ? (
            <>
              <div>
                <h3 className="text-lg font-semibold">{t.billingEstimatedInvoiceTitle}</h3>
                <p className="text-sm text-muted-foreground">{t.billingInvoicePreviewStripeHint}</p>
              </div>
              <div className="space-y-2 text-sm">
                {stripePreviewDerived ? (
                  <>
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-muted-foreground">{t.billingEstimatedBasePlan}</span>
                      <span className="tabular-nums shrink-0">
                        {formatMoneyMinor(
                          stripePreviewDerived.effectiveSummary.subscription_minor,
                          stripePreviewDerived.currency,
                        )}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-muted-foreground">
                        {t.billingEstimatedExtraStaff} / {t.billingEstimatedExtraLanguages}
                      </span>
                      <span className="tabular-nums shrink-0">
                        {formatMoneyMinor(
                          stripePreviewDerived.effectiveSummary.addons_minor,
                          stripePreviewDerived.currency,
                        )}
                      </span>
                    </div>
                  </>
                ) : null}
                {smsMetricsTrustedForEstimate &&
                smsUsage &&
                !invoicePreview.lines.some((line) => /sms/i.test(line.description)) ? (
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-muted-foreground line-clamp-2">
                      {t.billingInvoicePreviewSmsSupplement}
                    </span>
                    <span className="tabular-nums shrink-0">
                      {(smsUsage.overageCostEstimate ?? 0).toFixed(2)} NOK
                    </span>
                  </div>
                ) : null}
                <div className="border-t pt-2 mt-2 flex items-center justify-between font-semibold">
                  <span>{t.billingEstimatedTotal}</span>
                  <span className="tabular-nums">
                    {formatMoneyMinor(
                      stripePreviewTotalShownMinor ?? invoicePreview.total_minor,
                      stripePreviewDerived?.currency ?? invoicePreview.currency,
                    )}
                  </span>
                </div>
                {t.billingInvoiceProrationFootnote ? (
                  <p className="text-xs text-muted-foreground pt-1">{t.billingInvoiceProrationFootnote}</p>
                ) : null}
                <button
                  type="button"
                  className="text-xs text-primary hover:underline pt-2"
                  onClick={() => setShowStripeInvoiceLines((v) => !v)}
                >
                  {showStripeInvoiceLines ? t.billingInvoiceHideStripeDetails : t.billingInvoiceShowStripeDetails}
                </button>
                {showStripeInvoiceLines && stripePreviewDerived ? (
                  <div className="space-y-4 border rounded-md p-3 bg-muted/30 mt-2 text-sm">
                    <div className="space-y-2">
                      {t.billingInvoiceDetailRecurringHeading ? (
                        <p className="text-xs font-medium text-foreground">
                          {t.billingInvoiceDetailRecurringHeading}
                        </p>
                      ) : null}
                      {stripePreviewDerived.recurring.map((line, idx) => (
                        <div
                          key={`rec-${line.description}-${idx}`}
                          className="flex items-center justify-between gap-4"
                        >
                          <span className="text-muted-foreground line-clamp-2">{line.description}</span>
                          <span className="tabular-nums shrink-0">
                            {formatMoneyMinor(line.amount_minor, stripePreviewDerived.currency)}
                          </span>
                        </div>
                      ))}
                    </div>
                    {stripePreviewDerived.proration.length > 0 ||
                    Math.abs(stripePreviewDerived.timingAdjustmentsMinor) >= 1 ? (
                      <div className="space-y-2 border-t pt-3">
                        {t.billingInvoiceDetailProrationHeading ? (
                          <p className="text-xs font-medium text-foreground">
                            {t.billingInvoiceDetailProrationHeading}
                          </p>
                        ) : null}
                        {t.billingInvoiceDetailProrationLead ? (
                          <p className="text-xs text-muted-foreground">{t.billingInvoiceDetailProrationLead}</p>
                        ) : null}
                        {stripePreviewDerived.proration.length > 0
                          ? stripePreviewDerived.proration.map((line, idx) => (
                              <div
                                key={`pro-${line.description}-${idx}`}
                                className="flex items-center justify-between gap-4"
                              >
                                <span className="text-muted-foreground line-clamp-2">{line.description}</span>
                                <span className="tabular-nums shrink-0">
                                  {formatMoneyMinor(line.amount_minor, stripePreviewDerived.currency)}
                                </span>
                              </div>
                            ))
                          : Math.abs(stripePreviewDerived.timingAdjustmentsMinor) >= 1 ? (
                              <div className="flex items-center justify-between gap-4">
                                <span className="text-muted-foreground line-clamp-2">
                                  {t.billingInvoiceTimingAdjustmentsLabel}
                                </span>
                                <span className="tabular-nums shrink-0">
                                  {formatMoneyMinor(
                                    stripePreviewDerived.timingAdjustmentsMinor,
                                    stripePreviewDerived.currency,
                                  )}
                                </span>
                              </div>
                            ) : null}
                      </div>
                    ) : null}
                  </div>
                ) : null}
              </div>
            </>
          ) : invoicePreview?.mode === "degraded" && invoicePreview.reason === "addon_syncing" ? (
            <>
              <div>
                <h3 className="text-lg font-semibold">{t.billingEstimatedInvoiceTitle}</h3>
              </div>
              <p className="text-sm text-muted-foreground">{t.billingInvoicePreviewSyncingBody}</p>
            </>
          ) : invoicePreview?.mode === "no_subscription" ? (
            <>
              <div>
                <h3 className="text-lg font-semibold">{t.billingEstimatedInvoiceTitle}</h3>
              </div>
              <p className="text-sm text-muted-foreground">{t.billingInvoicePreviewNoSubscription}</p>
            </>
          ) : (
            <>
              <div>
                <h3 className="text-lg font-semibold">{t.billingInvoicePreviewDegradedTitle}</h3>
                <p className="text-sm text-muted-foreground">{t.billingInvoicePreviewDegradedBody}</p>
              </div>
              {invoicePreview && "details" in invoicePreview && invoicePreview.details ? (
                <p className="text-xs text-muted-foreground font-mono">{invoicePreview.details}</p>
              ) : null}
            </>
          )}
        </div>
      </Card>

      {/* Billing History -- collapsed by default */}
      <Card className="p-0 overflow-hidden">
        <details className="group">
          <summary className="flex items-center justify-between cursor-pointer px-6 py-4 hover:bg-muted/30 transition-colors">
            <div>
              <h3 className="text-lg font-semibold">{t.billingHistoryTitle}</h3>
              <p className="text-sm text-muted-foreground">
                {t.billingHistorySubtitle}
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
                        {new Date(invoice.date).toLocaleDateString(intlLocaleTag(appLocale as AppLocale))} •{" "}
                        {invoice.status}
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
                            {t.billingInvoiceOpen}
                          </a>
                        )}
                        {invoice.invoice_pdf && (
                          <a
                            href={invoice.invoice_pdf}
                            target="_blank"
                            rel="noreferrer"
                            className="text-xs text-primary hover:underline"
                          >
                            {t.billingInvoicePdf}
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
                  {t.billingHistoryEmpty}
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
        onConfirm={(opts) => void handlePlanChangeConfirm(opts)}
        actionLoading={actionLoading}
        confirmDisabled={billingPlanChangesBlocked}
        hasSubscription={hasSubscription}
        salonId={salon?.id ?? null}
        currentPlan={currentPlan}
        currentPeriodEndIso={salon?.current_period_end ?? null}
        title={t.billingPlanSelectionTitle}
        description={t.billingPlanSelectionDescription}
        priceMonthTemplate={t.billingPlanPriceMonth}
        cancelLabel={t.billingPlanDialogCancel}
        subscribeLabel={t.billingPlanDialogSubscribe}
        changePlanLabel={t.billingPlanDialogChangePlan}
        processingLabel={t.billingPlanDialogProcessing}
        translations={{
          billingPlanTimingTitle: t.billingPlanTimingTitle ?? "",
          billingPlanChangeImmediateLabel: t.billingPlanChangeImmediateLabel ?? "",
          billingPlanChangeNextPeriodLabel: t.billingPlanChangeNextPeriodLabel ?? "",
          billingPlanChangeImmediateDescription: t.billingPlanChangeImmediateDescription ?? "",
          billingPlanChangeNextPeriodDescription: t.billingPlanChangeNextPeriodDescription ?? "",
          billingPlanPreviewTitle: t.billingPlanPreviewTitle ?? "",
          billingPlanPreviewLoadError: t.billingPlanPreviewLoadError ?? "",
          billingPlanPreviewTotal: t.billingPlanPreviewTotal ?? "",
          billingPlanPreviewTimingLine: t.billingPlanPreviewTimingLine ?? "",
          billingPlanPreviewDisclaimer: t.billingPlanPreviewDisclaimer ?? "",
          billingPlanNextPeriodSummary: t.billingPlanNextPeriodSummary ?? "",
          billingPlanNextPeriodDateLabel: t.billingPlanNextPeriodDateLabel ?? "",
        }}
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
