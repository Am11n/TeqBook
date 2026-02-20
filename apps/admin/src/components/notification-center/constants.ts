import {
  ShieldAlert, Inbox, CreditCard, GitBranch, HeartPulse, Info, Calendar, Users,
} from "lucide-react";
import { isActionUrlSafe } from "@/lib/services/in-app-notification-service";
import type {
  InAppNotification, InAppNotificationCategory,
  NotificationSeverity, NotificationEntityType,
} from "@/lib/types/notifications";

export const CATEGORY_TABS: { key: InAppNotificationCategory | "all"; label: string }[] = [
  { key: "all", label: "All" },
  { key: "security", label: "Security" },
  { key: "support", label: "Support" },
  { key: "system", label: "System" },
  { key: "billing", label: "Billing" },
  { key: "onboarding", label: "Onboarding" },
];

const ENTITY_ROUTE_MAP: Record<NotificationEntityType, string> = {
  ticket: "/support",
  salon: "/salons",
  user: "/users",
  subscription: "/plans",
  incident: "/incidents",
  booking: "/salons",
};

export const SEVERITY_STYLES: Record<NotificationSeverity, string> = {
  critical: "bg-red-100 text-red-700",
  warning: "bg-amber-100 text-amber-700",
  info: "bg-slate-100 text-slate-600",
};

export function getCategoryIcon(type: InAppNotificationCategory) {
  switch (type) {
    case "security": return ShieldAlert;
    case "support": return Inbox;
    case "billing": return CreditCard;
    case "onboarding": return GitBranch;
    case "system": return HeartPulse;
    case "booking": return Calendar;
    case "staff": return Users;
    default: return Info;
  }
}

export function resolveNavigationUrl(notification: InAppNotification): string | null {
  if (notification.action_url && isActionUrlSafe(notification.action_url)) {
    return notification.action_url;
  }
  if (notification.entity) {
    const base = ENTITY_ROUTE_MAP[notification.entity.type];
    if (base) return `${base}/${notification.entity.id}`;
  }
  return null;
}

export function formatTimestamp(timestamp: string): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60_000);
  const diffHours = Math.floor(diffMs / 3_600_000);
  const diffDays = Math.floor(diffMs / 86_400_000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;

  return date.toLocaleDateString("en-US", {
    month: "short", day: "numeric", hour: "numeric", minute: "2-digit",
  });
}
