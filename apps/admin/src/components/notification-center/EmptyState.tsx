import { Bell } from "lucide-react";
import type { InAppNotificationCategory } from "@/lib/types/notifications";

export function EmptyState({
  category, unreadOnly,
}: {
  category: InAppNotificationCategory | "all";
  unreadOnly: boolean;
}) {
  const messages: Record<string, string> = {
    all: unreadOnly ? "No unread notifications" : "No notifications yet",
    security: unreadOnly ? "No unread security alerts" : "No security alerts",
    support: unreadOnly ? "No unread support tickets" : "No support notifications",
    system: unreadOnly ? "No unread system alerts" : "No system notifications",
    billing: unreadOnly ? "No unread billing updates" : "No billing notifications",
    onboarding: unreadOnly ? "No unread onboarding events" : "No onboarding notifications",
  };

  return (
    <div className="px-4 py-8 text-center">
      <Bell className="h-8 w-8 mx-auto text-slate-300" />
      <p className="mt-2 text-sm text-slate-500">{messages[category] || messages.all}</p>
    </div>
  );
}
