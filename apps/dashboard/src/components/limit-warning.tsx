"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AlertTriangle, TrendingUp, Info } from "lucide-react";
import type { LimitInfo } from "@/lib/hooks/usePlanLimits";
import { translations } from "@/i18n/translations";
import { applyTemplate as applyMessageTemplate } from "@/i18n/apply-template";

// ---------------------------------------------------------------------------
// CapacityBanner -- replaces aggressive red LimitWarning
// ---------------------------------------------------------------------------

export type CapacityBannerCopy = {
  capacityNearTitle: string;
  capacityNearMessage: string;
  upgradeButton: string;
  deactivateButton: string;
  blockedTitle: string;
  blockedMessage: string;
};

interface CapacityBannerProps {
  limitInfo: LimitInfo | null;
  entityLabel: string;
  onUpgrade?: () => void;
  onDeactivate?: () => void;
  copy: CapacityBannerCopy;
}

export function CapacityBanner({
  limitInfo,
  entityLabel,
  onUpgrade,
  onDeactivate,
  copy,
}: CapacityBannerProps) {
  if (!limitInfo || limitInfo.limit === null) return null;

  const { current, limit, atLimit, percentage } = limitInfo;
  const isNearLimit = percentage >= 80 && !atLimit;

  if (!isNearLimit && !atLimit) return null;

  const vars = { entity: entityLabel, current, limit };
  const nearTitle = applyMessageTemplate(copy.capacityNearTitle, vars);
  const nearMessage = applyMessageTemplate(copy.capacityNearMessage, vars);
  const blockTitle = applyMessageTemplate(copy.blockedTitle, vars);
  const blockMessage = applyMessageTemplate(copy.blockedMessage, vars);

  if (atLimit) {
    return (
      <Alert
        variant="default"
        className="mb-4 border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950/20"
      >
        <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
        <AlertTitle className="text-sm font-semibold text-blue-900 dark:text-blue-100">
          {blockTitle}
        </AlertTitle>
        <AlertDescription className="mt-2">
          <p className="text-sm text-blue-800 dark:text-blue-200">
            {blockMessage}
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {onDeactivate && (
              <Button
                variant="outline"
                size="sm"
                onClick={onDeactivate}
                className="border-blue-300 text-blue-900 hover:bg-blue-100 dark:text-blue-100 dark:hover:bg-blue-900/30"
              >
                {copy.deactivateButton}
              </Button>
            )}
            {onUpgrade && (
              <Button variant="default" size="sm" onClick={onUpgrade}>
                <TrendingUp className="h-4 w-4 mr-2" />
                {copy.upgradeButton}
              </Button>
            )}
          </div>
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Alert
      variant="default"
      className="mb-4 border-yellow-500/50 bg-yellow-50 dark:bg-yellow-950/20"
    >
      <AlertTriangle className="h-4 w-4 text-yellow-600 dark:text-yellow-500" />
      <AlertTitle className="text-sm font-semibold text-yellow-900 dark:text-yellow-100">
        {nearTitle}
      </AlertTitle>
      <AlertDescription className="mt-2">
        <p className="text-sm text-yellow-800 dark:text-yellow-200">
          {nearMessage}
        </p>
        {onUpgrade && (
          <Button
            variant="outline"
            size="sm"
            onClick={onUpgrade}
            className="mt-3 border-yellow-500 text-yellow-900 hover:bg-yellow-100 dark:text-yellow-100 dark:hover:bg-yellow-900/30"
          >
            <TrendingUp className="h-4 w-4 mr-2" />
            {copy.upgradeButton}
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
  rowLabel: string;
  unlimitedText: string;
  className?: string;
}

export function LimitIndicator({
  currentCount,
  limit,
  rowLabel,
  unlimitedText,
  className = "",
}: LimitIndicatorProps) {
  if (limit === null) {
    return (
      <div className={`text-sm text-muted-foreground ${className}`}>
        {unlimitedText}
      </div>
    );
  }

  const percentage = (currentCount / limit) * 100;
  const isNearLimit = percentage >= 80;
  const isAtLimit = percentage >= 100;

  return (
    <div className={`text-sm ${className}`}>
      <div className="flex items-center justify-between mb-1">
        <span className="text-muted-foreground">{rowLabel}</span>
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
    blocked: false,
    percentage: (currentCount / limit) * 100,
  };

  const en = translations.en.employees;
  const entity = limitType === "employees" ? "staff" : "languages";
  const copy: CapacityBannerCopy = {
    capacityNearTitle: en.capacityNearTitle!,
    capacityNearMessage: en.capacityNearMessage!,
    upgradeButton: en.upgradePlan!,
    deactivateButton: en.deactivateToFree!,
    blockedTitle: en.capacityBlockedTitle!,
    blockedMessage: en.capacityBlockedMessage!,
  };

  return (
    <CapacityBanner
      limitInfo={limitInfo}
      entityLabel={entity}
      onUpgrade={onUpgrade}
      copy={copy}
    />
  );
}
