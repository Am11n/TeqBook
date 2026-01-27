"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AlertTriangle, TrendingUp } from "lucide-react";

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
  translations,
}: LimitWarningProps) {
  const isAtLimit = currentCount >= limit;
  const isNearLimit = currentCount >= limit * 0.8; // 80% of limit

  // Don't show warning if not near limit
  if (!isNearLimit && !isAtLimit) {
    return null;
  }

  const defaultTranslations = {
    warningTitle: limitType === "employees" 
      ? "Approaching Employee Limit" 
      : "Approaching Language Limit",
    warningMessage: limitType === "employees"
      ? `You have ${currentCount} of ${limit} employees. Consider upgrading your plan to add more staff.`
      : `You have ${currentCount} of ${limit} languages. Consider upgrading your plan to add more languages.`,
    upgradeButton: "Upgrade Plan",
    limitReachedTitle: limitType === "employees"
      ? "Employee Limit Reached"
      : "Language Limit Reached",
    limitReachedMessage: limitType === "employees"
      ? `You have reached the limit of ${limit} employees. Please upgrade your plan or add more staff seats to continue.`
      : `You have reached the limit of ${limit} languages. Please upgrade your plan or add more language seats to continue.`,
  };

  const t = { ...defaultTranslations, ...translations };

  if (isAtLimit) {
    return (
      <Alert variant="destructive" className="mb-4">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle className="text-base font-semibold">{t.limitReachedTitle}</AlertTitle>
        <AlertDescription className="mt-2">
          <div className="space-y-3">
            <p className="text-sm">{t.limitReachedMessage}</p>
            {onUpgrade && (
              <Button
                variant="default"
                size="sm"
                onClick={onUpgrade}
                className="mt-2"
              >
                <TrendingUp className="h-4 w-4 mr-2" />
                {t.upgradeButton}
              </Button>
            )}
          </div>
        </AlertDescription>
      </Alert>
    );
  }

  // Near limit warning
  return (
    <Alert variant="default" className="mb-4 border-yellow-500/50 bg-yellow-50 dark:bg-yellow-950/20">
      <AlertTriangle className="h-4 w-4 text-yellow-600 dark:text-yellow-500" />
      <AlertTitle className="text-base font-semibold text-yellow-900 dark:text-yellow-100">
        {t.warningTitle}
      </AlertTitle>
      <AlertDescription className="mt-2">
        <div className="space-y-3">
          <p className="text-sm text-yellow-800 dark:text-yellow-200">{t.warningMessage}</p>
          {onUpgrade && (
            <Button
              variant="outline"
              size="sm"
              onClick={onUpgrade}
              className="mt-2 border-yellow-500 text-yellow-900 hover:bg-yellow-100 dark:text-yellow-100 dark:hover:bg-yellow-900/30"
            >
              <TrendingUp className="h-4 w-4 mr-2" />
              {t.upgradeButton}
            </Button>
          )}
        </div>
      </AlertDescription>
    </Alert>
  );
}

/**
 * Limit indicator component - shows current usage vs limit
 */
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
    // Unlimited
    return (
      <div className={`text-sm text-muted-foreground ${className}`}>
        {limitType === "employees" ? "Unlimited employees" : "Unlimited languages"}
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
          {limitType === "employees" ? "Employees" : "Languages"}
        </span>
        <span className={isAtLimit ? "font-semibold text-destructive" : isNearLimit ? "font-semibold text-yellow-600" : "font-medium"}>
          {currentCount}/{limit}
        </span>
      </div>
      <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
        <div
          className={`h-full transition-all ${
            isAtLimit
              ? "bg-destructive"
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
