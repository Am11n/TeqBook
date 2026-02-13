"use client";

import { ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { useFeatures } from "@/lib/hooks/use-features";
import { useLocale } from "@/components/locale-provider";
import { translations } from "@/i18n/translations";
import { normalizeLocale } from "@/i18n/normalizeLocale";
import type { FeatureKey } from "@/lib/types/domain";

// =====================================================
// FeatureGate -- blocks page access when feature is
// not included in the salon's plan
// =====================================================

interface FeatureGateProps {
  /** The feature key required to access this page */
  feature: FeatureKey;
  children: ReactNode;
  /**
   * When true (default), the blocking upgrade card is wrapped in
   * DashboardShell so the user has sidebar/header navigation.
   * Set to false when the component is already rendered inside a shell
   * (e.g. inside settings layout tabs).
   */
  wrapInShell?: boolean;
}

/**
 * Wraps a page that requires a specific plan feature.
 *
 * - While features are loading: shows a skeleton inside DashboardShell.
 * - If the feature IS present: renders children transparently.
 * - If the feature is NOT present: renders a centered upgrade card
 *   inside DashboardShell so the user can still navigate away via
 *   the sidebar/header.
 */
export function FeatureGate({ feature, children, wrapInShell = true }: FeatureGateProps) {
  const { hasFeature, loading } = useFeatures();
  const router = useRouter();
  const { locale } = useLocale();
  const appLocale = normalizeLocale(locale);
  const t = translations[appLocale].featureGate;

  // ─── Loading state ─────────────────────────────────
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

  // ─── Feature present → render page ─────────────────
  if (hasFeature(feature)) {
    return <>{children}</>;
  }

  // ─── Feature missing → upgrade card ────────────────
  const description = getFeatureDescription(feature, appLocale, t);

  const upgradeCard = (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Card className="max-w-md w-full text-center">
        <CardContent className="pt-10 pb-8 px-8 space-y-5">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-muted">
            <Lock className="h-7 w-7 text-muted-foreground" />
          </div>

          <div className="space-y-2">
            <h2 className="text-lg font-semibold">
              {t?.upgradeRequired ?? "This feature requires an upgrade"}
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {description}
            </p>
          </div>

          <div className="flex flex-col gap-2 pt-2">
            <Button
              onClick={() => router.push("/settings/billing")}
              className="w-full bg-primary hover:bg-primary/90 shadow-md hover:shadow-lg transition-shadow"
            >
              {t?.viewPlans ?? "View Plans"}
            </Button>
            <Button
              variant="ghost"
              onClick={() => router.back()}
              className="w-full"
            >
              {t?.goBack ?? "Go back"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return wrapInShell ? <DashboardShell>{upgradeCard}</DashboardShell> : upgradeCard;
}

// ─── Feature-specific descriptions ───────────────────

function getFeatureDescription(
  feature: FeatureKey,
  _locale: string,
  t: Record<string, string | undefined> | undefined,
): string {
  const key = `${feature.toLowerCase()}Description`;
  if (t && key in t && t[key]) {
    return t[key] as string;
  }
  // Fallback
  return t?.upgradeDescription ?? "Your current plan does not include this feature. Upgrade to get access.";
}
