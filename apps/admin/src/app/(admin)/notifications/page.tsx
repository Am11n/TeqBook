"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Bell,
  ShieldAlert,
  Inbox,
  CreditCard,
  GitBranch,
  HeartPulse,
  Info,
  Loader2,
  Calendar,
  Users,
  CheckCheck,
  RefreshCw,
} from "lucide-react";
import { AdminShell } from "@/components/layout/admin-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useNotifications } from "@/lib/hooks/notifications/useNotifications";
import { isActionUrlSafe } from "@/lib/services/in-app-notification-service";
import { logAdminEvent } from "@/lib/services/audit-log-service";
import type {
  InAppNotification,
  InAppNotificationCategory,
  NotificationSeverity,
  NotificationEntityType,
} from "@/lib/types/notifications";

// =====================================================
// Constants (shared with notification-center)
// =====================================================

const CATEGORY_TABS: { key: InAppNotificationCategory | "all"; label: string; icon: typeof Bell }[] = [
  { key: "all", label: "All", icon: Bell },
  { key: "security", label: "Security", icon: ShieldAlert },
  { key: "support", label: "Support", icon: Inbox },
  { key: "system", label: "System", icon: HeartPulse },
  { key: "billing", label: "Billing", icon: CreditCard },
  { key: "onboarding", label: "Onboarding", icon: GitBranch },
];

const ENTITY_ROUTE_MAP: Record<NotificationEntityType, string> = {
  ticket: "/support",
  salon: "/salons",
  user: "/users",
  subscription: "/plans",
  incident: "/incidents",
  booking: "/salons",
};

const SEVERITY_STYLES: Record<NotificationSeverity, string> = {
  critical: "bg-red-100 text-red-700",
  warning: "bg-amber-100 text-amber-700",
  info: "bg-slate-100 text-slate-600",
};

// =====================================================
// Helpers
// =====================================================

function getCategoryIcon(type: InAppNotificationCategory) {
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

function resolveNavigationUrl(notification: InAppNotification): string | null {
  if (notification.action_url && isActionUrlSafe(notification.action_url)) {
    return notification.action_url;
  }
  if (notification.entity) {
    const base = ENTITY_ROUTE_MAP[notification.entity.type];
    if (base) return `${base}/${notification.entity.id}`;
  }
  return null;
}

function formatTimestamp(timestamp: string): string {
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
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

// =====================================================
// Page
// =====================================================

export default function NotificationsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<InAppNotificationCategory | "all">("all");
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);

  const filterCategory = activeTab === "all" ? undefined : activeTab;

  const {
    notifications,
    totalUnreadCount,
    unreadByCategory,
    isLoading,
    error,
    hasMore,
    markAsRead,
    markAllAsRead,
    refresh,
    loadMore,
  } = useNotifications({
    enablePolling: true,
    pollingInterval: 60_000,
    pageSize: 30,
    category: filterCategory,
    unreadOnly: showUnreadOnly,
  });

  const currentUnreadCount = activeTab === "all"
    ? totalUnreadCount
    : (unreadByCategory[activeTab] || 0);

  const handleNotificationClick = useCallback(async (notification: InAppNotification) => {
    if (!notification.read) {
      await markAsRead(notification.id);
    }

    logAdminEvent({
      action: "notification_clicked",
      metadata: {
        notificationId: notification.id,
        category: notification.type,
        severity: notification.severity,
      },
    }).catch(() => {});

    const url = resolveNavigationUrl(notification);
    if (url) router.push(url);
  }, [markAsRead, router]);

  const handleMarkAllAsRead = useCallback(async () => {
    const scope = activeTab === "all" ? undefined : activeTab;
    await markAllAsRead(scope);

    logAdminEvent({
      action: "mark_all_as_read",
      metadata: { scope: scope || "all" },
    }).catch(() => {});
  }, [markAllAsRead, activeTab]);

  const markAllLabel = activeTab === "all"
    ? "Mark all as read"
    : `Mark all ${activeTab} as read`;

  return (
    <AdminShell>
      {/* Page header */}
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Notifications</h1>
          <p className="text-sm text-muted-foreground">
            Stay on top of security events, support tickets, and system alerts.
          </p>
        </div>
        <div className="flex items-center gap-2 mt-2 sm:mt-0">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refresh()}
            className="gap-1.5"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Refresh
          </Button>
          {currentUnreadCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleMarkAllAsRead}
              className="gap-1.5"
            >
              <CheckCheck className="h-3.5 w-3.5" />
              {markAllLabel}
            </Button>
          )}
        </div>
      </div>

      <div className="mt-6">
        {/* Filters */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          {/* Category tabs */}
          <div className="flex gap-1 overflow-x-auto pb-1">
            {CATEGORY_TABS.map((tab) => {
              const count = tab.key === "all"
                ? totalUnreadCount
                : (unreadByCategory[tab.key] || 0);
              const isActive = activeTab === tab.key;
              const TabIcon = tab.icon;
              return (
                <button
                  key={tab.key}
                  type="button"
                  className={`flex flex-shrink-0 items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-slate-900 text-white shadow-sm"
                      : "text-slate-500 hover:bg-slate-100 hover:text-slate-700"
                  }`}
                  onClick={() => setActiveTab(tab.key)}
                >
                  <TabIcon className="h-4 w-4" />
                  <span className="hidden sm:inline">{tab.label}</span>
                  {count > 0 && (
                    <span className={`inline-flex items-center justify-center rounded-full px-1.5 text-[10px] font-bold leading-none ${
                      isActive ? "bg-white/20 text-white" : "bg-red-100 text-red-600"
                    }`}>
                      {count > 99 ? "99+" : count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Unread toggle */}
          <button
            type="button"
            className={`flex-shrink-0 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
              showUnreadOnly
                ? "bg-blue-100 text-blue-700"
                : "bg-slate-100 text-slate-500 hover:text-slate-700"
            }`}
            onClick={() => setShowUnreadOnly(!showUnreadOnly)}
          >
            {showUnreadOnly ? "Showing unread only" : "Showing all"}
          </button>
        </div>

        {/* Content */}
        <div className="mt-6">
          {isLoading ? (
            <LoadingSkeleton />
          ) : error ? (
            <ErrorState onRetry={refresh} />
          ) : notifications.length === 0 ? (
            <PageEmptyState category={activeTab} unreadOnly={showUnreadOnly} />
          ) : (
            <div className="space-y-2">
              {notifications.map((notification) => (
                <NotificationCard
                  key={notification.id}
                  notification={notification}
                  onClick={handleNotificationClick}
                />
              ))}

              {hasMore && (
                <div className="pt-4 text-center">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={loadMore}
                    className="gap-1.5"
                  >
                    <Loader2 className="h-3.5 w-3.5" />
                    Load more
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </AdminShell>
  );
}

// =====================================================
// Sub-components
// =====================================================

function NotificationCard({
  notification,
  onClick,
}: {
  notification: InAppNotification;
  onClick: (n: InAppNotification) => void;
}) {
  const Icon = getCategoryIcon(notification.type);
  const severityStyle = SEVERITY_STYLES[notification.severity] || SEVERITY_STYLES.info;
  const hasAction = !!resolveNavigationUrl(notification);

  return (
    <Card
      className={`transition-colors ${!notification.read ? "border-blue-200/60 bg-blue-50/20" : ""} ${
        hasAction ? "cursor-pointer hover:bg-slate-50/60" : ""
      }`}
    >
      <CardContent className="p-4">
        <button
          type="button"
          className="flex w-full items-start gap-4 text-left"
          onClick={() => onClick(notification)}
        >
          <div className={`mt-0.5 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg ${severityStyle}`}>
            <Icon className="h-5 w-5" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className={`text-sm leading-tight ${notification.read ? "text-slate-700" : "font-semibold text-slate-900"}`}>
                  {notification.title}
                </p>
                <p className="mt-1 text-sm text-slate-500 line-clamp-2">
                  {notification.body}
                </p>
              </div>
              <div className="flex flex-shrink-0 items-center gap-2">
                {!notification.read && (
                  <div className="h-2.5 w-2.5 rounded-full bg-blue-600" />
                )}
              </div>
            </div>
            <div className="mt-2 flex items-center gap-3 text-xs text-slate-400">
              <span>{formatTimestamp(notification.created_at)}</span>
              <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-500">
                {notification.type}
              </span>
              {notification.severity !== "info" && (
                <span className={`rounded px-1.5 py-0.5 text-[10px] font-medium ${
                  notification.severity === "critical"
                    ? "bg-red-100 text-red-600"
                    : "bg-amber-100 text-amber-600"
                }`}>
                  {notification.severity}
                </span>
              )}
              {notification.source && (
                <span className="text-slate-400">via {notification.source}</span>
              )}
            </div>
          </div>
        </button>
      </CardContent>
    </Card>
  );
}

function LoadingSkeleton() {
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

function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center py-12">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
          <Bell className="h-6 w-6 text-red-500" />
        </div>
        <p className="mt-4 text-sm font-medium text-slate-900">Could not load notifications</p>
        <p className="mt-1 text-xs text-slate-500">Something went wrong. Please try again.</p>
        <Button variant="outline" size="sm" onClick={onRetry} className="mt-4 gap-1.5">
          <RefreshCw className="h-3.5 w-3.5" />
          Try again
        </Button>
      </CardContent>
    </Card>
  );
}

function PageEmptyState({
  category,
  unreadOnly,
}: {
  category: InAppNotificationCategory | "all";
  unreadOnly: boolean;
}) {
  const messages: Record<string, { title: string; desc: string }> = {
    all: {
      title: unreadOnly ? "No unread notifications" : "No notifications yet",
      desc: unreadOnly
        ? "You're all caught up! Switch to 'Showing all' to see past notifications."
        : "Notifications about security events, support tickets, and system alerts will appear here.",
    },
    security: {
      title: unreadOnly ? "No unread security alerts" : "No security alerts",
      desc: "Login failures, 2FA changes, and suspicious activity will appear here.",
    },
    support: {
      title: unreadOnly ? "No unread support tickets" : "No support notifications",
      desc: "New tickets, escalations, and SLA warnings will appear here.",
    },
    system: {
      title: unreadOnly ? "No unread system alerts" : "No system notifications",
      desc: "Health degradation, error spikes, and downtime alerts will appear here.",
    },
    billing: {
      title: unreadOnly ? "No unread billing updates" : "No billing notifications",
      desc: "Payment failures, plan changes, and subscription expirations will appear here.",
    },
    onboarding: {
      title: unreadOnly ? "No unread onboarding events" : "No onboarding notifications",
      desc: "New salon registrations and activation milestones will appear here.",
    },
  };

  const msg = messages[category] || messages.all;

  return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center py-16">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-100">
          <Bell className="h-7 w-7 text-slate-400" />
        </div>
        <p className="mt-4 text-sm font-medium text-slate-900">{msg.title}</p>
        <p className="mt-1 max-w-sm text-center text-xs text-slate-500">{msg.desc}</p>
      </CardContent>
    </Card>
  );
}
