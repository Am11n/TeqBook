"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { AddonDisplay } from "@/lib/utils/billing/billing-utils";
import type { ResolvedSettingsMessages } from "@/app/settings/_helpers/resolve-settings";
import { applyTemplate } from "@/i18n/apply-template";

interface AddonsCardProps {
  /** When false, usage-based euro amounts are not presented as billing truth (Stripe sync pending). */
  stripeAddonUsageTrusted?: boolean;
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
  addons,
  usage,
  actionLoading = false,
  onManagePlan,
  t,
}: AddonsCardProps) {
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
