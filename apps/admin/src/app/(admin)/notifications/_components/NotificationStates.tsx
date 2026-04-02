"use client";

import { Bell, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { InAppNotificationCategory } from "@/lib/types/notifications";
import { useAdminConsoleMessages } from "@/i18n/use-admin-console-messages";

export function LoadingSkeleton() {
  return (
    <div className="space-y-2">
      {Array.from({ length: 5 }).map((_, i) => (
        <Card key={i}>
          <CardContent className="p-4">
            <div className="flex items-start gap-4 animate-pulse">
              <div className="h-10 w-10 rounded-lg bg-slate-200" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-2/3 rounded bg-slate-200" />
                <div className="h-3 w-full rounded bg-slate-100" />
                <div className="h-3 w-1/4 rounded bg-slate-100" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export function ErrorState({ onRetry }: { onRetry: () => void }) {
  const n = useAdminConsoleMessages().pages.notifications;
  return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center py-12">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
          <Bell className="h-6 w-6 text-red-500" />
        </div>
        <p className="mt-4 text-sm font-medium text-slate-900">{n.errorLoadTitle}</p>
        <p className="mt-1 text-xs text-slate-500">{n.errorLoadDescription}</p>
        <Button variant="outline" size="sm" onClick={onRetry} className="mt-4 gap-1.5">
          <RefreshCw className="h-3.5 w-3.5" />{n.retry}
        </Button>
      </CardContent>
    </Card>
  );
}

export function PageEmptyState({
  category,
  unreadOnly,
  categoryLabel,
}: {
  category: InAppNotificationCategory | "all";
  unreadOnly: boolean;
  /** Localized tab label for the active category (for unread filter messaging). */
  categoryLabel: string;
}) {
  const n = useAdminConsoleMessages().pages.notifications;

  const base = (() => {
    switch (category) {
      case "security":
        return { title: n.emptySecurityTitle, desc: n.emptySecurityDesc };
      case "support":
        return { title: n.emptySupportTitle, desc: n.emptySupportDesc };
      case "system":
        return { title: n.emptySystemTitle, desc: n.emptySystemDesc };
      case "billing":
        return { title: n.emptyBillingTitle, desc: n.emptyBillingDesc };
      case "onboarding":
        return { title: n.emptyOnboardingTitle, desc: n.emptyOnboardingDesc };
      default:
        return { title: n.emptyAllTitle, desc: n.emptyAllDesc };
    }
  })();

  const title = unreadOnly
    ? (category === "all"
      ? n.emptyUnreadAllTitle
      : n.emptyUnreadCategoryTitle.replace("{category}", categoryLabel))
    : base.title;
  const desc = unreadOnly && category === "all" ? n.emptyCaughtUpDesc : base.desc;

  return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center py-16">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-100">
          <Bell className="h-7 w-7 text-slate-400" />
        </div>
        <p className="mt-4 text-sm font-medium text-slate-900">{title}</p>
        <p className="mt-1 max-w-sm text-center text-xs text-slate-500">{desc}</p>
      </CardContent>
    </Card>
  );
}
