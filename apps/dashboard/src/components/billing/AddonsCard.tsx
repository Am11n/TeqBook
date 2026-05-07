"use client";

import { useEffect, useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import type { AddonDisplay, UpgradeRecommendationModel } from "@/lib/utils/billing/billing-utils";
import type { ResolvedSettingsMessages } from "@/app/settings/_helpers/resolve-settings";
import { applyTemplate } from "@/i18n/apply-template";
import type { AddonType, PreviewImmediateAddonChangeResponse } from "@/lib/services/billing/shared";
import { AlertTriangle } from "lucide-react";

interface AddonsCardProps {
  /** When false, usage-based euro amounts are not presented as billing truth (Stripe sync pending). */
  stripeAddonUsageTrusted?: boolean;
  /** BCP 47 tag for next-period date label (match dashboard locale). */
  dateLocale?: string;
  /** Model A: units scheduled for next Stripe billing boundary */
  pendingExtraStaff?: number;
  pendingExtraLanguages?: number;
  /** Salon `current_period_end` ISO — label for next period */
  nextPeriodEndIso?: string | null;
  onSavePending?: (pendingStaff: number, pendingLanguages: number) => Promise<void>;
  onPreviewImmediate?: (
    addonType: AddonType,
    quantity: number,
  ) => Promise<{ data: PreviewImmediateAddonChangeResponse | null; error: string | null }>;
  onApplyImmediate?: (addonType: AddonType, quantity: number) => Promise<{ success: boolean; error?: string }>;
  pendingSaving?: boolean;
  pendingCapped?: boolean;
  immediateMutationLoading?: boolean;
  immediateReconcilePending?: boolean;
  canImmediateActivate?: boolean;
  upgradeRecommendation?: (UpgradeRecommendationModel & { mode: "near" | "above" }) | null;
  addons: AddonDisplay[];
  usage: {
    planIncludesEmployees: number | null;
    planIncludesLanguages: number | null;
    employeesAllowed: number | null;
    languagesAllowed: number | null;
    employeesActive: number;
    languagesActive: number;
    employeesExtraBilled: number;
    languagesExtraBilled: number;
  } | null;
  actionLoading?: boolean;
  onManagePlan?: () => void;
  t: ResolvedSettingsMessages;
}

function formatIncluded(n: number | null, unlimited: string): string {
  return n === null ? unlimited : String(n);
}

function limitPressureNote(
  current: number,
  allowed: number | null,
  atCap: string,
  high: string,
  medium: string,
): string | null {
  if (allowed === null || allowed <= 0) return null;
  const pct = (current / allowed) * 100;
  if (current >= allowed) return applyTemplate(atCap, { percent: String(Math.round(pct)) });
  if (pct >= 90) return applyTemplate(high, { percent: String(Math.round(pct)) });
  if (pct >= 70) return applyTemplate(medium, { percent: String(Math.round(pct)) });
  return null;
}

export function AddonsCard({
  stripeAddonUsageTrusted = true,
  dateLocale = "en-US",
  pendingExtraStaff = 0,
  pendingExtraLanguages = 0,
  nextPeriodEndIso,
  onSavePending,
  onPreviewImmediate,
  onApplyImmediate,
  pendingSaving = false,
  pendingCapped = false,
  immediateMutationLoading = false,
  immediateReconcilePending = false,
  canImmediateActivate = false,
  upgradeRecommendation = null,
  addons,
  usage,
  actionLoading = false,
  onManagePlan,
  t,
}: AddonsCardProps) {
  const [openDialog, setOpenDialog] = useState<AddonType | null>(null);
  const [dialogQuantity, setDialogQuantity] = useState("0");
  const [dialogTiming, setDialogTiming] = useState<"next_period" | "immediate">("next_period");
  const [immediatePreviewLoading, setImmediatePreviewLoading] = useState(false);
  const [immediatePreviewError, setImmediatePreviewError] = useState<string | null>(null);
  const [immediatePreview, setImmediatePreview] = useState<PreviewImmediateAddonChangeResponse | null>(null);
  const [pendingConflictAck, setPendingConflictAck] = useState(false);

  const nextPeriodLabel = nextPeriodEndIso
    ? new Date(nextPeriodEndIso).toLocaleDateString(dateLocale, {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : "—";

  const addonByType = new Map(addons.map((addon) => [addon.type, addon] as const));
  const extraStaffAddon = addonByType.get("extra_staff");
  const extraLanguagesAddon = addonByType.get("extra_languages");
  const immediateDisabledByRole = !canImmediateActivate;

  /** When Stripe sync is trusted, show subscription add-on quantities; otherwise usage-based extras only. */
  const billableStaffUnits = stripeAddonUsageTrusted
    ? (extraStaffAddon?.quantity ?? 0)
    : (usage?.employeesExtraBilled ?? 0);
  const billableLanguageUnits = stripeAddonUsageTrusted
    ? (extraLanguagesAddon?.quantity ?? 0)
    : (usage?.languagesExtraBilled ?? 0);
  const estimatedStaffImpact = billableStaffUnits * 5;
  const estimatedLanguageImpact = billableLanguageUnits * 10;

  const staffPlanInc = formatIncluded(usage?.planIncludesEmployees ?? null, t.billingUnlimited);
  const langPlanInc = formatIncluded(usage?.planIncludesLanguages ?? null, t.billingUnlimited);

  const staffExtraLine =
    billableStaffUnits > 0
      ? applyTemplate(t.billingAddonExtraPaidLineStaff, {
          count: String(billableStaffUnits),
          price: extraStaffAddon?.price ?? t.billingAddonStaffPriceFallback,
        })
      : t.billingAddonExtraPaidNone;

  const langExtraLine =
    billableLanguageUnits > 0
      ? applyTemplate(t.billingAddonExtraPaidLineLang, {
          count: String(billableLanguageUnits),
          price: extraLanguagesAddon?.price ?? t.billingAddonLanguagePriceFallback,
        })
      : t.billingAddonExtraPaidNone;

  const staffPressure = usage
    ? limitPressureNote(
        usage.employeesActive,
        usage.employeesAllowed,
        t.billingAddonLimitAtCapacity,
        t.billingAddonLimitPressureHigh,
        t.billingAddonLimitPressureMedium,
      )
    : null;
  const langPressure = usage
    ? limitPressureNote(
        usage.languagesActive,
        usage.languagesAllowed,
        t.billingAddonLimitAtCapacity,
        t.billingAddonLimitPressureHigh,
        t.billingAddonLimitPressureMedium,
      )
    : null;

  const staffImpactLine = applyTemplate(t.billingAddonStaffImpactLine, {
    price: extraStaffAddon?.price ?? t.billingAddonStaffPriceFallback,
    impact: String(estimatedStaffImpact),
  });
  const langImpactLine = applyTemplate(t.billingAddonLanguageImpactLine, {
    price: extraLanguagesAddon?.price ?? t.billingAddonLanguagePriceFallback,
    impact: String(estimatedLanguageImpact),
  });

  const addonUi = useMemo(
    () => ({
      activateNow: t.billingAddonActivateNow ?? "Activate now (advanced)",
      activateNextPeriod: t.billingAddonActivateNextPeriod ?? "From next period",
      recommended: t.billingAddonRecommended ?? "Recommended",
      costNow: t.billingAddonCostNow ?? "Cost this period",
      costMonthly: t.billingAddonCostMonthly ?? "Monthly recurring cost",
      startsAt: t.billingAddonStartsAt ?? "Starts on {date}",
      noCostNow: t.billingAddonNoCostNow ?? "No extra charge now",
      advancedOption: t.billingAddonAdvancedOption ?? "This may add a mid-cycle charge.",
      chooseTiming: t.billingAddonChooseTiming ?? "Choose when this add-on should take effect.",
      quantityLabel: t.billingAddonQuantityLabel ?? "Quantity",
      confirmSchedule: t.billingAddonConfirmSchedule ?? "Schedule add-on",
      confirmActivateNow: t.billingAddonConfirmActivateNow ?? "Activate now",
      previewLoading: t.billingAddonPreviewLoading ?? "Loading pricing preview…",
      previewFailed: t.billingAddonPreviewFailed ?? "Could not load immediate pricing preview.",
      pendingConflict: t.billingAddonPendingConflict ?? "You already have a scheduled add-on of this type. Confirming immediate activation will replace that scheduled value for this add-on type.",
      pendingConflictAck: t.billingAddonPendingConflictAcknowledge ?? "I understand and want to replace scheduled quantity for this add-on type.",
      immediateBlockedByRole: t.billingAddonImmediateBlockedByRole ?? "Only owner/admin can activate immediately.",
      updatingBilling: t.billingAddonUpdatingBilling ?? "Updating billing…",
      previewRequired: t.billingAddonPreviewRequired ?? "Immediate activation requires a successful preview before confirmation.",
      dialogTitleStaff: t.billingAddonDialogTitleStaff ?? "Extra staff",
      dialogTitleLanguages: t.billingAddonDialogTitleLanguages ?? "Extra language",
      ctaStaff: t.billingAddonCtaStaff ?? "Add extra staff",
      ctaLanguages: t.billingAddonCtaLanguages ?? "Add extra language",
      noAccessHint: t.billingAddonNoAccessHint ?? "You can schedule add-ons for next period. Immediate activation is restricted.",
      upgradeNearTitle: t.billingAddonUpgradeNearTitle ?? "You are close to the next plan price.",
      upgradeAboveTitle: t.billingAddonUpgradeAboveTitle ?? "Your recurring add-ons now cost as much as the next plan.",
      upgradeBody:
        t.billingAddonUpgradeBody ??
        "Switching to {plan} can give more included capacity at a better monthly value.",
      upgradeSavings:
        t.billingAddonUpgradeSavings ??
        "Current recurring: {current}. Next plan ({plan}): {next}. Difference: {delta}.",
      upgradeIncludes:
        t.billingAddonUpgradeIncludes ??
        "{plan} includes up to {employees} staff and {languages} languages before extra add-ons.",
      upgradeCta: t.billingAddonUpgradeCta ?? "Compare plans",
    }),
    [t],
  );

  const formatMoneyMinor = (minor: number) => `$${(minor / 100).toFixed(2)}`;
  const recommendationTitle =
    upgradeRecommendation?.mode === "above" ? addonUi.upgradeAboveTitle : addonUi.upgradeNearTitle;
  const recommendationBody = upgradeRecommendation
    ? applyTemplate(addonUi.upgradeBody, { plan: upgradeRecommendation.nextPlanName })
    : null;
  const recommendationSavings = upgradeRecommendation
    ? applyTemplate(addonUi.upgradeSavings, {
        current: formatMoneyMinor(upgradeRecommendation.currentRecurringMinor),
        next: formatMoneyMinor(upgradeRecommendation.nextPlanMinor),
        plan: upgradeRecommendation.nextPlanName,
        delta: formatMoneyMinor(Math.abs(upgradeRecommendation.deltaMinor)),
      })
    : null;
  const recommendationIncludes = upgradeRecommendation
    ? applyTemplate(addonUi.upgradeIncludes, {
        plan: upgradeRecommendation.nextPlanName,
        employees:
          upgradeRecommendation.nextPlanEmployees === null
            ? t.billingUnlimited
            : String(upgradeRecommendation.nextPlanEmployees),
        languages:
          upgradeRecommendation.nextPlanLanguages === null
            ? t.billingUnlimited
            : String(upgradeRecommendation.nextPlanLanguages),
      })
    : null;

  const currentDialogAddon = openDialog === "extra_staff" ? extraStaffAddon : extraLanguagesAddon;
  const currentDialogPending = openDialog === "extra_staff" ? pendingExtraStaff : pendingExtraLanguages;
  const parsedDialogQuantity = Math.max(0, Math.floor(Number(dialogQuantity) || 0));
  const hasPendingConflict = dialogTiming === "immediate" && (currentDialogPending ?? 0) > 0;
  const canConfirmImmediate =
    dialogTiming === "immediate" &&
    canImmediateActivate &&
    immediatePreview?.mode === "preview" &&
    !immediatePreviewLoading &&
    !immediateMutationLoading &&
    (!hasPendingConflict || pendingConflictAck);

  const resetDialogState = () => {
    setDialogTiming("next_period");
    setImmediatePreview(null);
    setImmediatePreviewError(null);
    setImmediatePreviewLoading(false);
    setPendingConflictAck(false);
  };

  const openAddonDialog = (addonType: AddonType) => {
    setOpenDialog(addonType);
    setDialogQuantity(String(addonType === "extra_staff" ? pendingExtraStaff : pendingExtraLanguages));
    resetDialogState();
  };

  useEffect(() => {
    if (dialogTiming !== "immediate" || !openDialog || !onPreviewImmediate) return;
    if (!canImmediateActivate) return;
    let cancelled = false;
    setImmediatePreviewLoading(true);
    setImmediatePreviewError(null);
    setImmediatePreview(null);
    void onPreviewImmediate(openDialog, parsedDialogQuantity).then((res: {
      data: PreviewImmediateAddonChangeResponse | null;
      error: string | null;
    }) => {
      if (cancelled) return;
      setImmediatePreviewLoading(false);
      if (res.error) {
        setImmediatePreviewError(res.error);
        return;
      }
      if (!res.data || res.data.mode !== "preview") {
        const reason = res.data && "reason" in res.data ? res.data.reason : addonUi.previewFailed;
        setImmediatePreviewError(reason ?? addonUi.previewFailed);
        return;
      }
      setImmediatePreview(res.data);
    });
    return () => {
      cancelled = true;
    };
  }, [dialogTiming, openDialog, onPreviewImmediate, parsedDialogQuantity, canImmediateActivate, addonUi.previewFailed]);

  const handleDialogConfirm = async () => {
    if (!openDialog) return;
    if (dialogTiming === "next_period") {
      if (!onSavePending) return;
      const s = openDialog === "extra_staff" ? parsedDialogQuantity : Math.max(0, pendingExtraStaff);
      const l = openDialog === "extra_languages" ? parsedDialogQuantity : Math.max(0, pendingExtraLanguages);
      await onSavePending(s, l);
      setOpenDialog(null);
      return;
    }
    if (!onApplyImmediate) return;
    if (!canConfirmImmediate) {
      setImmediatePreviewError(addonUi.previewRequired);
      return;
    }
    const result = await onApplyImmediate(openDialog, parsedDialogQuantity);
    if (!result.success) {
      setImmediatePreviewError(result.error ?? addonUi.previewFailed);
      return;
    }
    setOpenDialog(null);
  };

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-2">{t.billingAddonsTitle}</h3>
      <p className="text-sm text-muted-foreground mb-4">{t.billingAddonsDescription}</p>

      {upgradeRecommendation ? (
        <div className="rounded-lg border border-sky-200 bg-sky-50 dark:bg-sky-950/20 dark:border-sky-900 p-4 mb-6 space-y-2">
          <h4 className="text-sm font-semibold">{recommendationTitle}</h4>
          {recommendationBody ? <p className="text-sm text-muted-foreground">{recommendationBody}</p> : null}
          {recommendationSavings ? <p className="text-xs text-muted-foreground">{recommendationSavings}</p> : null}
          {recommendationIncludes ? <p className="text-xs text-muted-foreground">{recommendationIncludes}</p> : null}
          <Button type="button" size="sm" onClick={onManagePlan} disabled={actionLoading}>
            {addonUi.upgradeCta}
          </Button>
        </div>
      ) : null}

      <div className="rounded-lg border bg-muted/20 p-4 mb-6 space-y-2">
        <h4 className="text-sm font-semibold">{t.billingActiveCapacityTitle}</h4>
        <p className="text-xs text-muted-foreground">{t.billingActiveCapacityIntro}</p>
      </div>

      <div className="rounded-lg border p-4 mb-6 space-y-3">
        <div>
          <h4 className="text-sm font-semibold">{t.billingPlannedFromNextPeriodTitle}</h4>
          <p className="text-xs text-muted-foreground mt-1">
            {applyTemplate(t.billingPlannedFromNextPeriodIntro, { date: nextPeriodLabel })}
          </p>
        </div>
        {pendingExtraStaff === 0 && pendingExtraLanguages === 0 ? (
          <p className="text-sm text-muted-foreground">{t.billingPlannedNone}</p>
        ) : (
          <ul className="text-sm list-disc pl-5 space-y-1">
            {pendingExtraStaff > 0 ? (
              <li>
                {applyTemplate(t.billingAddonExtraPaidLineStaff, {
                  count: String(pendingExtraStaff),
                  price: extraStaffAddon?.price ?? t.billingAddonStaffPriceFallback,
                })}
              </li>
            ) : null}
            {pendingExtraLanguages > 0 ? (
              <li>
                {applyTemplate(t.billingAddonExtraPaidLineLang, {
                  count: String(pendingExtraLanguages),
                  price: extraLanguagesAddon?.price ?? t.billingAddonLanguagePriceFallback,
                })}
              </li>
            ) : null}
          </ul>
        )}
        {onSavePending ? (
          <div className="space-y-3 pt-2 border-t">
            <p className="text-xs text-muted-foreground">{t.billingPendingSectionHint}</p>
            <div className="flex flex-wrap gap-2">
              <Button type="button" size="sm" onClick={() => openAddonDialog("extra_staff")} disabled={actionLoading}>
                {addonUi.ctaStaff}
              </Button>
              <Button type="button" size="sm" onClick={() => openAddonDialog("extra_languages")} disabled={actionLoading}>
                {addonUi.ctaLanguages}
              </Button>
            </div>
            {!canImmediateActivate ? <p className="text-xs text-muted-foreground">{addonUi.noAccessHint}</p> : null}
            {pendingCapped ? (
              <p className="text-xs text-amber-800 dark:text-amber-200">{t.billingPendingCappedHint}</p>
            ) : null}
            {immediateReconcilePending ? (
              <p className="text-xs text-amber-800 dark:text-amber-200">{addonUi.updatingBilling}</p>
            ) : null}
          </div>
        ) : null}
      </div>

      {!stripeAddonUsageTrusted && t.billingAddonUsagePendingStripe ? (
        <div className="rounded-md border border-amber-300 bg-amber-50 p-3 text-sm text-amber-950 mb-4">
          {t.billingAddonUsagePendingStripe}
        </div>
      ) : null}

      <div className="space-y-3">
        <div className={cn("border rounded-lg p-4", extraStaffAddon?.active && "border-l-4 border-l-green-500")}>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="font-medium">
                  {extraStaffAddon?.name ?? t.billingAddonExtraStaffFallbackName}
                </h4>
                {(extraStaffAddon?.quantity ?? 0) > 0 && (
                  <Badge className="text-xs bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400">
                    {t.billingStateActive}
                  </Badge>
                )}
              </div>
              <div className="grid gap-2 sm:grid-cols-3 text-sm">
                <div>
                  <div className="text-xs text-muted-foreground">{t.billingAddonBlockPlanIncludes}</div>
                  <div className="font-medium tabular-nums">{staffPlanInc}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">{t.billingAddonBlockYouUse}</div>
                  <div className="font-medium tabular-nums">{usage?.employeesActive ?? 0}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">{t.billingAddonBlockExtraPaid}</div>
                  <div className="font-medium tabular-nums">{staffExtraLine}</div>
                </div>
              </div>
              {staffPressure ? (
                <p className="text-xs text-amber-800 dark:text-amber-200">{staffPressure}</p>
              ) : null}
              {stripeAddonUsageTrusted ? (
                <p className="text-sm font-medium">{staffImpactLine}</p>
              ) : (
                <p className="text-sm text-muted-foreground">{t.billingAddonImpactHiddenUntilSync}</p>
              )}
            </div>
            <Button variant="outline" size="sm" onClick={onManagePlan} disabled={actionLoading}>
              {t.billingAddonManagePlan}
            </Button>
          </div>
        </div>

        <div
          className={cn("border rounded-lg p-4", extraLanguagesAddon?.active && "border-l-4 border-l-green-500")}
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="font-medium">
                  {extraLanguagesAddon?.name ?? t.billingAddonExtraLanguagesFallbackName}
                </h4>
                {(extraLanguagesAddon?.quantity ?? 0) > 0 && (
                  <Badge className="text-xs bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400">
                    {t.billingStateActive}
                  </Badge>
                )}
              </div>
              <div className="grid gap-2 sm:grid-cols-3 text-sm">
                <div>
                  <div className="text-xs text-muted-foreground">{t.billingAddonBlockPlanIncludes}</div>
                  <div className="font-medium tabular-nums">{langPlanInc}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">{t.billingAddonBlockYouUse}</div>
                  <div className="font-medium tabular-nums">{usage?.languagesActive ?? 0}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">{t.billingAddonBlockExtraPaid}</div>
                  <div className="font-medium tabular-nums">{langExtraLine}</div>
                </div>
              </div>
              {langPressure ? (
                <p className="text-xs text-amber-800 dark:text-amber-200">{langPressure}</p>
              ) : null}
              {stripeAddonUsageTrusted ? (
                <p className="text-sm font-medium">{langImpactLine}</p>
              ) : (
                <p className="text-sm text-muted-foreground">{t.billingAddonImpactHiddenUntilSync}</p>
              )}
            </div>
            <Button variant="outline" size="sm" onClick={onManagePlan} disabled={actionLoading}>
              {t.billingAddonReviewLanguages}
            </Button>
          </div>
        </div>
        {stripeAddonUsageTrusted && t.billingAddonPaidThisCycleHint ? (
          <p className="text-xs text-muted-foreground rounded-md border border-dashed bg-muted/10 p-3">
            {t.billingAddonPaidThisCycleHint}
          </p>
        ) : null}
      </div>

      <Dialog open={Boolean(openDialog)} onOpenChange={(next) => (!next ? setOpenDialog(null) : undefined)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {openDialog === "extra_staff" ? addonUi.dialogTitleStaff : addonUi.dialogTitleLanguages}
            </DialogTitle>
            <DialogDescription>{addonUi.chooseTiming}</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground" htmlFor="addon-dialog-quantity">
                {addonUi.quantityLabel}
              </label>
              <Input
                id="addon-dialog-quantity"
                type="number"
                min={0}
                inputMode="numeric"
                value={dialogQuantity}
                onChange={(e) => setDialogQuantity(e.target.value)}
              />
            </div>
            <button
              type="button"
              onClick={() => setDialogTiming("next_period")}
              className={cn(
                "w-full rounded-md border p-3 text-left",
                dialogTiming === "next_period" ? "border-green-500 bg-green-50 dark:bg-green-950/20" : "",
              )}
            >
              <div className="flex items-center gap-2">
                <span className="font-medium">{addonUi.activateNextPeriod}</span>
                <Badge variant="secondary" className="text-green-700">{addonUi.recommended}</Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {applyTemplate(addonUi.startsAt, { date: nextPeriodLabel })}
              </p>
              <p className="text-xs text-green-700 dark:text-green-300">{addonUi.noCostNow}</p>
            </button>

            <button
              type="button"
              disabled={immediateDisabledByRole}
              onClick={() => setDialogTiming("immediate")}
              className={cn(
                "w-full rounded-md border p-3 text-left",
                dialogTiming === "immediate" ? "border-amber-500 bg-amber-50 dark:bg-amber-950/20" : "",
                immediateDisabledByRole && "opacity-60 cursor-not-allowed",
              )}
            >
              <div className="flex items-center gap-2">
                <span className="font-medium">{addonUi.activateNow}</span>
                <TooltipProvider delayDuration={100}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <AlertTriangle className="h-4 w-4 text-amber-600" />
                    </TooltipTrigger>
                    <TooltipContent>{addonUi.advancedOption}</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <p className="text-xs text-amber-800 dark:text-amber-200 mt-1">{addonUi.advancedOption}</p>
              {dialogTiming === "immediate" ? (
                <div className="text-xs mt-2 space-y-1">
                  {immediatePreviewLoading ? <p>{addonUi.previewLoading}</p> : null}
                  {immediatePreview?.mode === "preview" ? (
                    <>
                      <p>{addonUi.costNow}: {immediatePreview.cost_now_minor / 100} {immediatePreview.currency}</p>
                      <p>{addonUi.costMonthly}: {immediatePreview.cost_monthly_minor / 100} {immediatePreview.currency}</p>
                    </>
                  ) : null}
                </div>
              ) : null}
            </button>
            {immediateDisabledByRole ? (
              <p className="text-xs text-muted-foreground">{addonUi.immediateBlockedByRole}</p>
            ) : null}
            {hasPendingConflict ? (
              <div className="rounded-md border border-amber-300 bg-amber-50 p-2 space-y-2">
                <p className="text-xs text-amber-900">{addonUi.pendingConflict}</p>
                <label className="flex items-center gap-2 text-xs">
                  <input
                    type="checkbox"
                    checked={pendingConflictAck}
                    onChange={(e) => setPendingConflictAck(e.target.checked)}
                  />
                  {addonUi.pendingConflictAck}
                </label>
              </div>
            ) : null}
            {immediatePreviewError ? (
              <p className="text-xs text-red-700">{immediatePreviewError}</p>
            ) : null}
            {currentDialogAddon?.price ? (
              <p className="text-xs text-muted-foreground">
                {openDialog === "extra_staff"
                  ? applyTemplate(t.billingAddonStaffImpactLine, { price: currentDialogAddon.price, impact: String(parsedDialogQuantity * 5) })
                  : applyTemplate(t.billingAddonLanguageImpactLine, { price: currentDialogAddon.price, impact: String(parsedDialogQuantity * 10) })}
              </p>
            ) : null}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenDialog(null)}>
              {t.billingPlanDialogCancel ?? "Cancel"}
            </Button>
            <Button
              onClick={handleDialogConfirm}
              disabled={
                pendingSaving ||
                actionLoading ||
                immediateMutationLoading ||
                (dialogTiming === "immediate" && !canConfirmImmediate)
              }
            >
              {dialogTiming === "next_period"
                ? (pendingSaving ? t.billingPendingSaving : addonUi.confirmSchedule)
                : (immediateMutationLoading ? addonUi.updatingBilling : addonUi.confirmActivateNow)}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
