"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AlertTriangle, TrendingUp, Info } from "lucide-react";
import type { LimitInfo } from "@/lib/hooks/usePlanLimits";

// ---------------------------------------------------------------------------
// CapacityBanner -- replaces aggressive red LimitWarning
// ---------------------------------------------------------------------------

interface CapacityBannerProps {
  limitInfo: LimitInfo | null;
  entityLabel: string; // e.g. "ansatte"
  onUpgrade?: () => void;
  onDeactivate?: () => void;
  translations?: {
    capacityTitle?: string;
    capacityMessage?: string;
    upgradeButton?: string;
    deactivateButton?: string;
    blockedTitle?: string;
    blockedMessage?: string;
  };
}

export function CapacityBanner({
  limitInfo,
  entityLabel,
  onUpgrade,
  onDeactivate,
  translations,
}: CapacityBannerProps) {
  if (!limitInfo || limitInfo.limit === null) return null;

  const { current, limit, atLimit, percentage } = limitInfo;
  const isNearLimit = percentage >= 80 && !atLimit;

  if (!isNearLimit && !atLimit) return null;

  const t = {
    capacityTitle:
      translations?.capacityTitle ?? `Capacity for ${entityLabel}`,
    capacityMessage:
      translations?.capacityMessage ??
      `You are using ${current} of ${limit} ${entityLabel}.`,
    upgradeButton: translations?.upgradeButton ?? "Upgrade plan",
    deactivateButton:
      translations?.deactivateButton ??
      `Deactivate one to free up space`,
    blockedTitle:
      translations?.blockedTitle ?? `Limit reached for ${entityLabel}`,
    blockedMessage:
      translations?.blockedMessage ??
      `You are using ${current} of ${limit} ${entityLabel}. You cannot add more, but you can deactivate one to free up space.`,
  };

  // At limit: neutral blue/gray banner -- NOT red
  if (atLimit) {
    return (
      <Alert
        variant="default"
        className="mb-4 border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950/20"
      >
        <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
        <AlertTitle className="text-sm font-semibold text-blue-900 dark:text-blue-100">
          {t.blockedTitle}
        </AlertTitle>
        <AlertDescription className="mt-2">
          <p className="text-sm text-blue-800 dark:text-blue-200">
            {t.blockedMessage}
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {onDeactivate && (
              <Button
                variant="outline"
                size="sm"
                onClick={onDeactivate}
                className="border-blue-300 text-blue-900 hover:bg-blue-100 dark:text-blue-100 dark:hover:bg-blue-900/30"
              >
                {t.deactivateButton}
              </Button>
            )}
            {onUpgrade && (
              <Button variant="default" size="sm" onClick={onUpgrade}>
                <TrendingUp className="h-4 w-4 mr-2" />
                {t.upgradeButton}
              </Button>
            )}
          </div>
        </AlertDescription>
      </Alert>
    );
  }

  // Near limit: yellow warning
  return (
    <Alert
      variant="default"
      className="mb-4 border-yellow-500/50 bg-yellow-50 dark:bg-yellow-950/20"
    >
      <AlertTriangle className="h-4 w-4 text-yellow-600 dark:text-yellow-500" />
      <AlertTitle className="text-sm font-semibold text-yellow-900 dark:text-yellow-100">
        {t.capacityTitle}
      </AlertTitle>
      <AlertDescription className="mt-2">
        <p className="text-sm text-yellow-800 dark:text-yellow-200">
          {t.capacityMessage}
        </p>
        {onUpgrade && (
          <Button
            variant="outline"
            size="sm"
            onClick={onUpgrade}
            className="mt-3 border-yellow-500 text-yellow-900 hover:bg-yellow-100 dark:text-yellow-100 dark:hover:bg-yellow-900/30"
          >
            <TrendingUp className="h-4 w-4 mr-2" />
            {t.upgradeButton}
          </Button>
        )}
      </AlertDescription>
    </Alert>
  );
}

// ---------------------------------------------------------------------------
// LimitIndicator -- progress bar (kept for backward compat)
// ---------------------------------------------------------------------------

interface LimitIndicatorProps {
  currentCount: number;
  limit: number | null;
  limitType: "employees" | "languages";
  className?: string;
}

export function LimitIndicator({
  currentCount,
  limit,
  limitType,
  className = "",
}: LimitIndicatorProps) {
  if (limit === null) {
    return (
      <div className={`text-sm text-muted-foreground ${className}`}>
        {limitType === "employees"
          ? "Unlimited staff"
          : "Unlimited languages"}
      </div>
    );
  }

  const percentage = (currentCount / limit) * 100;
  const isNearLimit = percentage >= 80;
  const isAtLimit = percentage >= 100;

  return (
    <div className={`text-sm ${className}`}>
      <div className="flex items-center justify-between mb-1">
        <span className="text-muted-foreground">
          {limitType === "employees" ? "Staff" : "Languages"}
        </span>
        <span
          className={
            isAtLimit
              ? "font-semibold text-blue-600"
              : isNearLimit
                ? "font-semibold text-yellow-600"
                : "font-medium"
          }
        >
          {currentCount}/{limit}
        </span>
      </div>
      <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
        <div
          className={`h-full transition-all ${
            isAtLimit
              ? "bg-blue-500"
              : isNearLimit
                ? "bg-yellow-500"
                : "bg-primary"
          }`}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Legacy LimitWarning -- kept for backward compat, wraps CapacityBanner
// ---------------------------------------------------------------------------

interface LimitWarningProps {
  currentCount: number;
  limit: number;
  limitType: "employees" | "languages";
  onUpgrade?: () => void;
  translations?: {
    warningTitle?: string;
    warningMessage?: string;
    upgradeButton?: string;
    limitReachedTitle?: string;
    limitReachedMessage?: string;
  };
}

export function LimitWarning({
  currentCount,
  limit,
  limitType,
  onUpgrade,
}: LimitWarningProps) {
  const limitInfo: LimitInfo = {
    current: currentCount,
    limit,
    atLimit: currentCount >= limit,
    blocked: currentCount >= limit,
    percentage: (currentCount / limit) * 100,
  };

  return (
    <CapacityBanner
      limitInfo={limitInfo}
      entityLabel={limitType === "employees" ? "staff" : "languages"}
      onUpgrade={onUpgrade}
    />
  );
}
