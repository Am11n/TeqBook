"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { AddonDisplay } from "@/lib/utils/billing/billing-utils";
import { CircleAlert } from "lucide-react";

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
  onSyncUsage?: () => void;
  onManagePlan?: () => void;
}

export function AddonsCard({
  addons,
  usage,
  actionLoading = false,
  onSyncUsage,
  onManagePlan,
}: AddonsCardProps) {
  const addonByType = new Map(addons.map((addon) => [addon.type, addon] as const));
  const extraStaffAddon = addonByType.get("extra_staff");
  const extraLanguagesAddon = addonByType.get("extra_languages");

  const estimatedStaffImpact = (extraStaffAddon?.quantity ?? usage?.employeesExtraBilled ?? 0) * 5;
  const estimatedLanguageImpact =
    (extraLanguagesAddon?.quantity ?? usage?.languagesExtraBilled ?? 0) * 10;

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-2">Add-on impact</h3>
      <p className="text-sm text-muted-foreground mb-4">
        Extra staff and language charges are derived from active usage and synced to billing automatically.
      </p>

      <div className="space-y-3">
        <div className={cn("border rounded-lg p-4", extraStaffAddon?.active && "border-l-4 border-l-green-500")}>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="font-medium">{extraStaffAddon?.name ?? "Extra Staff Members"}</h4>
                {(extraStaffAddon?.quantity ?? 0) > 0 && (
                  <Badge className="text-xs bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400">
                    Active
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground mb-1">
                Included: {usage?.employeesIncluded ?? "Unlimited"} • Active: {usage?.employeesActive ?? 0} • Extra billed:{" "}
                {usage?.employeesExtraBilled ?? 0}
              </p>
              <p className="text-sm font-medium">
                {extraStaffAddon?.price ?? "$5/month per staff"} • Estimated monthly impact: ${estimatedStaffImpact}
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={onManagePlan} disabled={actionLoading}>
              Manage plan
            </Button>
          </div>
        </div>

        <div
          className={cn("border rounded-lg p-4", extraLanguagesAddon?.active && "border-l-4 border-l-green-500")}
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="font-medium">{extraLanguagesAddon?.name ?? "Extra Languages"}</h4>
                {(extraLanguagesAddon?.quantity ?? 0) > 0 && (
                  <Badge className="text-xs bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400">
                    Active
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground mb-1">
                Included: {usage?.languagesIncluded ?? "Unlimited"} • Active: {usage?.languagesActive ?? 0} • Extra billed:{" "}
                {usage?.languagesExtraBilled ?? 0}
              </p>
              <p className="text-sm font-medium">
                {extraLanguagesAddon?.price ?? "$10/month per language"} • Estimated monthly impact: ${estimatedLanguageImpact}
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={onManagePlan} disabled={actionLoading}>
              Review languages
            </Button>
          </div>
        </div>
      </div>

      <div className="mt-4 rounded-md border bg-muted/30 p-3 text-sm">
        <div className="flex items-start gap-2">
          <CircleAlert className="mt-0.5 h-4 w-4 text-muted-foreground" />
          <p className="text-muted-foreground">
            Add-on quantities are usage-derived and synced to Stripe subscription items. If values look stale, run a sync.
          </p>
        </div>
        <div className="mt-3 flex gap-2">
          <Button variant="outline" size="sm" onClick={onSyncUsage} disabled={actionLoading}>
            Sync usage now
          </Button>
          <Button size="sm" onClick={onManagePlan} disabled={actionLoading}>
            Upgrade plan
          </Button>
        </div>
      </div>
    </Card>
  );
}
