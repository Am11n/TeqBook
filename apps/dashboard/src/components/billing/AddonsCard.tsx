"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { AddonDisplay } from "@/lib/utils/billing/billing-utils";
import type { ResolvedSettingsMessages } from "@/app/settings/_helpers/resolve-settings";
import { applyTemplate } from "@/i18n/apply-template";

interface AddonsCardProps {
  addons: AddonDisplay[];
  usage: {
    employeesIncluded: number | null;
    employeesActive: number;
    employeesExtraBilled: number;
    languagesIncluded: number | null;
    languagesActive: number;
    languagesExtraBilled: number;
  } | null;
  actionLoading?: boolean;
  onManagePlan?: () => void;
  t: ResolvedSettingsMessages;
}

export function AddonsCard({
  addons,
  usage,
  actionLoading = false,
  onManagePlan,
  t,
}: AddonsCardProps) {
  const addonByType = new Map(addons.map((addon) => [addon.type, addon] as const));
  const extraStaffAddon = addonByType.get("extra_staff");
  const extraLanguagesAddon = addonByType.get("extra_languages");

  const estimatedStaffImpact = (extraStaffAddon?.quantity ?? usage?.employeesExtraBilled ?? 0) * 5;
  const estimatedLanguageImpact =
    (extraLanguagesAddon?.quantity ?? usage?.languagesExtraBilled ?? 0) * 10;

  const staffIncluded =
    usage?.employeesIncluded === null
      ? t.billingUnlimited
      : String(usage?.employeesIncluded ?? 0);
  const langIncluded =
    usage?.languagesIncluded === null
      ? t.billingUnlimited
      : String(usage?.languagesIncluded ?? 0);

  const staffUsageLine = applyTemplate(t.billingAddonUsageLine, {
    included: staffIncluded,
    active: String(usage?.employeesActive ?? 0),
    extra: String(usage?.employeesExtraBilled ?? 0),
  });
  const langUsageLine = applyTemplate(t.billingAddonUsageLine, {
    included: langIncluded,
    active: String(usage?.languagesActive ?? 0),
    extra: String(usage?.languagesExtraBilled ?? 0),
  });

  const staffPrice = extraStaffAddon?.price ?? t.billingAddonStaffPriceFallback;
  const langPrice = extraLanguagesAddon?.price ?? t.billingAddonLanguagePriceFallback;

  const staffImpactLine = applyTemplate(t.billingAddonStaffImpactLine, {
    price: staffPrice,
    impact: String(estimatedStaffImpact),
  });
  const langImpactLine = applyTemplate(t.billingAddonLanguageImpactLine, {
    price: langPrice,
    impact: String(estimatedLanguageImpact),
  });

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-2">{t.billingAddonsTitle}</h3>
      <p className="text-sm text-muted-foreground mb-4">{t.billingAddonsDescription}</p>

      <div className="space-y-3">
        <div className={cn("border rounded-lg p-4", extraStaffAddon?.active && "border-l-4 border-l-green-500")}>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
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
              <p className="text-sm text-muted-foreground mb-1">{staffUsageLine}</p>
              <p className="text-sm font-medium">{staffImpactLine}</p>
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
            <div className="flex-1">
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
              <p className="text-sm text-muted-foreground mb-1">{langUsageLine}</p>
              <p className="text-sm font-medium">{langImpactLine}</p>
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
