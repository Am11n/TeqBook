import { Bell, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { InAppNotificationCategory } from "@/lib/types/notifications";

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
  return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center py-12">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
          <Bell className="h-6 w-6 text-red-500" />
        </div>
        <p className="mt-4 text-sm font-medium text-slate-900">Could not load notifications</p>
        <p className="mt-1 text-xs text-slate-500">Something went wrong. Please try again.</p>
        <Button variant="outline" size="sm" onClick={onRetry} className="mt-4 gap-1.5">
          <RefreshCw className="h-3.5 w-3.5" />Try again
        </Button>
      </CardContent>
    </Card>
  );
}

const EMPTY_MESSAGES: Record<string, { title: string; desc: string }> = {
  all: { title: "No notifications yet", desc: "Notifications about security events, support tickets, and system alerts will appear here." },
  security: { title: "No security alerts", desc: "Login failures, 2FA changes, and suspicious activity will appear here." },
  support: { title: "No support notifications", desc: "New tickets, escalations, and SLA warnings will appear here." },
  system: { title: "No system notifications", desc: "Health degradation, error spikes, and downtime alerts will appear here." },
  billing: { title: "No billing notifications", desc: "Payment failures, plan changes, and subscription expirations will appear here." },
  onboarding: { title: "No onboarding notifications", desc: "New salon registrations and activation milestones will appear here." },
};

export function PageEmptyState({
  category, unreadOnly,
}: {
  category: InAppNotificationCategory | "all";
  unreadOnly: boolean;
}) {
  const base = EMPTY_MESSAGES[category] || EMPTY_MESSAGES.all;
  const title = unreadOnly ? `No unread ${category === "all" ? "notifications" : `${category} alerts`}` : base.title;
  const desc = unreadOnly && category === "all"
    ? "You're all caught up! Switch to 'Showing all' to see past notifications."
    : base.desc;

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
