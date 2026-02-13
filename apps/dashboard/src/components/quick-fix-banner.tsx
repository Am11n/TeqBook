"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";
import type { Issue } from "@/lib/setup/health";

interface QuickFixAction {
  /** Which issue key this action resolves */
  issueKey: string;
  label: string;
  onClick: () => void;
}

interface QuickFixBannerProps {
  issues: Issue[];
  actions: QuickFixAction[];
  className?: string;
  /** Title for the banner -- passed from page's i18n context */
  title?: string;
}

/**
 * Shows a banner when booking is blocked due to setup issues,
 * with actionable "Fix now" buttons.
 */
export function QuickFixBanner({
  issues,
  actions,
  className,
  title = "Booking is not working",
}: QuickFixBannerProps) {
  // Only show for error-severity issues
  const blockers = issues.filter((i) => i.severity === "error");

  if (blockers.length === 0) return null;

  return (
    <Alert
      variant="destructive"
      className={className}
    >
      <AlertCircle className="h-4 w-4" />
      <AlertTitle className="text-sm font-semibold">
        {title}
      </AlertTitle>
      <AlertDescription className="mt-2">
        <ul className="space-y-2">
          {blockers.map((issue) => {
            const action = actions.find((a) => a.issueKey === issue.key);
            return (
              <li key={issue.key} className="flex items-center gap-2 text-sm">
                <span>{issue.label}</span>
                {action && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-6 px-2 text-xs"
                    onClick={action.onClick}
                  >
                    {action.label}
                  </Button>
                )}
              </li>
            );
          })}
        </ul>
      </AlertDescription>
    </Alert>
  );
}
