"use client";

import { ReactNode, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { useFeatures } from "@/lib/hooks/use-features";
import { useCurrentSalon } from "@/components/salon-provider";
import { useLocale } from "@/components/locale-provider";
import { translations } from "@/i18n/translations";
import { normalizeLocale } from "@/i18n/normalizeLocale";
import { resolveNamespace, type ResolvedNamespace } from "@/i18n/resolve-namespace";
import type { FeatureKey } from "@/lib/types/domain";
import type { PlanType } from "@/lib/types";

// =====================================================
// FeatureGate — block page access when plan/feature
// requirements are not met (incl. direct URL navigation).
// =====================================================

const PLAN_RANK: Record<PlanType, number> = { starter: 0, pro: 1, business: 2 };

function meetsMinimumPlan(current: PlanType | undefined, min: PlanType): boolean {
  const p = current || "starter";
  return PLAN_RANK[p] >= PLAN_RANK[min];
}

interface FeatureGateProps {
  /** Require this matrix feature (from plan_features). */
  feature?: FeatureKey;
  /** Require at least this plan (Pro includes Business checks as higher tier). */
  minPlan?: PlanType;
  children: ReactNode;
  /**
   * When true (default), the blocking upgrade card is wrapped in
   * DashboardShell so the user has sidebar/header navigation.
   * Set to false when already inside a layout shell (e.g. settings tabs).
   */
  wrapInShell?: boolean;
}

export function FeatureGate({
  feature,
  minPlan,
  children,
  wrapInShell = true,
}: FeatureGateProps) {
  const { hasFeature, loading: featuresLoading } = useFeatures();
  const { salon, isReady } = useCurrentSalon();
  const router = useRouter();
  const { locale } = useLocale();
  const appLocale = normalizeLocale(locale);
  const t = useMemo(
    () => resolveNamespace("featureGate", translations[appLocale].featureGate),
    [appLocale],
  );

  const loading =
    featuresLoading || (minPlan !== undefined && !isReady);

  if (loading) {
    const skeleton = (
      <div className="space-y-4 py-8">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-96" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
          <Skeleton className="h-40" />
          <Skeleton className="h-40" />
        </div>
      </div>
    );
    return wrapInShell ? <DashboardShell>{skeleton}</DashboardShell> : skeleton;
  }

  if (minPlan !== undefined) {
    const currentPlan = (salon?.plan || "starter") as PlanType;
    if (meetsMinimumPlan(currentPlan, minPlan)) {
      return <>{children}</>;
    }
    return renderUpgradeCard(
      t.minimumProDescription?.trim() || t.upgradeDescription,
      wrapInShell,
      router,
      t,
    );
  }

  if (feature !== undefined) {
    if (hasFeature(feature)) {
      return <>{children}</>;
    }
    const description = getFeatureDescription(feature, t);
    return renderUpgradeCard(description, wrapInShell, router, t);
  }

  return <>{children}</>;
}

function renderUpgradeCard(
  description: string,
  wrapInShell: boolean,
  router: ReturnType<typeof useRouter>,
  t: ResolvedNamespace<"featureGate">,
) {
  const upgradeCard = (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Card className="max-w-md w-full text-center">
        <CardContent className="pt-10 pb-8 px-8 space-y-5">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-muted">
            <Lock className="h-7 w-7 text-muted-foreground" />
          </div>

          <div className="space-y-2">
            <h2 className="text-lg font-semibold">{t.upgradeRequired}</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
          </div>

          <div className="flex flex-col gap-2 pt-2">
            <Button
              onClick={() => router.push("/settings/billing")}
              className="w-full bg-primary hover:bg-primary/90 shadow-md hover:shadow-lg transition-shadow"
            >
              {t.viewPlans}
            </Button>
            <Button variant="ghost" onClick={() => router.back()} className="w-full">
              {t.goBack}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return wrapInShell ? <DashboardShell>{upgradeCard}</DashboardShell> : upgradeCard;
}

function getFeatureDescription(
  feature: FeatureKey,
  t: ResolvedNamespace<"featureGate">,
): string {
  const key = `${feature.toLowerCase()}Description` as keyof typeof t;
  const specific = t[key];
  if (typeof specific === "string" && specific.length > 0) {
    return specific;
  }
  return t.upgradeDescription;
}
