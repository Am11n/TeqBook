"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { AddonDisplay } from "@/lib/utils/billing/billing-utils";
import type { ResolvedSettingsMessages } from "@/app/settings/_helpers/resolve-settings";
import { applyTemplate } from "@/i18n/apply-template";

interface AddonsCardProps {
  /** When false, usage-based euro amounts are not presented as billing truth (Stripe sync pending). */
  stripeAddonUsageTrusted?: boolean;
  /** Model A: units scheduled for next Stripe billing boundary */
  pendingExtraStaff?: number;
  pendingExtraLanguages?: number;
  /** Salon `current_period_end` ISO — label for next period */
  nextPeriodEndIso?: string | null;
  onSavePending?: (pendingStaff: number, pendingLanguages: number) => Promise<void>;
  pendingSaving?: boolean;
  pendingCapped?: boolean;
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
  pendingExtraStaff = 0,
  pendingExtraLanguages = 0,
  nextPeriodEndIso,
  onSavePending,
  pendingSaving = false,
  pendingCapped = false,
  addons,
  usage,
  actionLoading = false,
  onManagePlan,
  t,
}: AddonsCardProps) {
  const [draftStaff, setDraftStaff] = useState(String(pendingExtraStaff));
  const [draftLang, setDraftLang] = useState(String(pendingExtraLanguages));

  useEffect(() => {
    setDraftStaff(String(pendingExtraStaff));
    setDraftLang(String(pendingExtraLanguages));
  }, [pendingExtraStaff, pendingExtraLanguages]);

  const nextPeriodLabel = nextPeriodEndIso
    ? new Date(nextPeriodEndIso).toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : "—";

  const addonByType = new Map(addons.map((addon) => [addon.type, addon] as const));
  const extraStaffAddon = addonByType.get("extra_staff");
  const extraLanguagesAddon = addonByType.get("extra_languages");

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

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-2">{t.billingAddonsTitle}</h3>
      <p className="text-sm text-muted-foreground mb-4">{t.billingAddonsDescription}</p>

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
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground" htmlFor="pending-staff">
                  {t.billingPendingExtraStaffLabel}
                </label>
                <Input
                  id="pending-staff"
                  type="number"
                  min={0}
                  inputMode="numeric"
                  value={draftStaff}
                  onChange={(e) => setDraftStaff(e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground" htmlFor="pending-lang">
                  {t.billingPendingExtraLanguagesLabel}
                </label>
                <Input
                  id="pending-lang"
                  type="number"
                  min={0}
                  inputMode="numeric"
                  value={draftLang}
                  onChange={(e) => setDraftLang(e.target.value)}
                />
              </div>
            </div>
            {pendingCapped ? (
              <p className="text-xs text-amber-800 dark:text-amber-200">{t.billingPendingCappedHint}</p>
            ) : null}
            <Button
              type="button"
              size="sm"
              disabled={pendingSaving || actionLoading}
              onClick={async () => {
                const s = Math.max(0, Math.floor(Number(draftStaff) || 0));
                const l = Math.max(0, Math.floor(Number(draftLang) || 0));
                await onSavePending(s, l);
              }}
            >
              {pendingSaving ? t.billingPendingSaving : t.billingPendingSaveButton}
            </Button>
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
      </div>
    </Card>
  );
}
