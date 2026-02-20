"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
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
// Constants
// =====================================================

const CATEGORY_TABS: { key: InAppNotificationCategory | "all"; label: string }[] = [
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
    hour: "numeric",
    minute: "2-digit",
  });
}

// =====================================================
// Component
// =====================================================

export function NotificationCenter() {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<InAppNotificationCategory | "all">("all");
  const [showUnreadOnly, setShowUnreadOnly] = useState(true);
  const menuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

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
    pageSize: 15,
    category: filterCategory,
    unreadOnly: showUnreadOnly,
  });

  useEffect(() => { setMounted(true); }, []);

  // Telemetry: log popover open
  const handleOpenChange = useCallback((isOpen: boolean) => {
    setOpen(isOpen);
    if (isOpen) {
      logAdminEvent({ action: "notification_popover_opened" }).catch(() => {});
    }
  }, []);

  // Click notification -> mark read + navigate
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
    if (url) {
      setOpen(false);
      router.push(url);
    }
  }, [markAsRead, router]);

  // Mark all as read (scoped to active tab)
  const handleMarkAllAsRead = useCallback(async () => {
    const scope = activeTab === "all" ? undefined : activeTab;
    await markAllAsRead(scope);

    logAdminEvent({
      action: "mark_all_as_read",
      metadata: { scope: scope || "all" },
    }).catch(() => {});
  }, [markAllAsRead, activeTab]);

  // Keyboard navigation for menu items
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLDivElement>) => {
    const items = menuRef.current?.querySelectorAll<HTMLElement>('[role="menuitem"]');
    if (!items || items.length === 0) return;

    const currentIndex = Array.from(items).findIndex((el) => el === document.activeElement);

    if (e.key === "ArrowDown") {
      e.preventDefault();
      const next = currentIndex < items.length - 1 ? currentIndex + 1 : 0;
      items[next].focus();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      const prev = currentIndex > 0 ? currentIndex - 1 : items.length - 1;
      items[prev].focus();
    }
  }, []);

  const currentUnreadCount = activeTab === "all"
    ? totalUnreadCount
    : (unreadByCategory[activeTab] || 0);

  if (!mounted) {
    return (
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="relative h-9 w-9 rounded-lg transition-all hover:scale-105 hover:bg-slate-100/60 flex items-center justify-center"
        aria-label="Notifications"
        disabled
      >
        <Bell className="h-5 w-5 text-blue-700" />
      </Button>
    );
  }

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="relative h-9 w-9 rounded-lg transition-all hover:scale-105 hover:bg-slate-100/60 flex items-center justify-center"
          aria-label={`Notifications${totalUnreadCount > 0 ? ` (${totalUnreadCount} unread)` : ""}`}
        >
          <Bell className="h-5 w-5 text-blue-700" />
          {totalUnreadCount > 0 && (
            <Badge className="absolute -top-1 -right-1 h-5 min-w-5 rounded-full bg-red-500 px-1 text-[10px] font-bold text-white pointer-events-none">
              {totalUnreadCount > 99 ? "99+" : totalUnreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent
        className="w-96 rounded-2xl bg-white/90 backdrop-blur-2xl border border-slate-200/60 p-0 shadow-2xl"
        align="end"
        sideOffset={8}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100/60 px-4 py-3">
          <h3 className="text-sm font-semibold text-slate-900">Notifications</h3>
          <div className="flex items-center gap-2">
            <button
              type="button"
              className={`rounded-md px-2 py-0.5 text-[10px] font-medium transition-colors ${
                showUnreadOnly
                  ? "bg-blue-100 text-blue-700"
                  : "bg-slate-100 text-slate-500 hover:text-slate-700"
              }`}
              onClick={() => setShowUnreadOnly(!showUnreadOnly)}
            >
              {showUnreadOnly ? "Unread" : "All"}
            </button>
            {currentUnreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleMarkAllAsRead}
                className="h-7 gap-1 text-xs text-slate-600 hover:text-slate-900"
              >
                <CheckCheck className="h-3 w-3" />
                Mark read
              </Button>
            )}
          </div>
        </div>

        {/* Category tabs */}
        <div className="flex gap-1 overflow-x-auto border-b border-slate-100/40 px-3 py-2">
          {CATEGORY_TABS.map((tab) => {
            const count = tab.key === "all"
              ? totalUnreadCount
              : (unreadByCategory[tab.key] || 0);
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                className={`flex-shrink-0 rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                  isActive
                    ? "bg-slate-900 text-white"
                    : "text-slate-500 hover:bg-slate-100 hover:text-slate-700"
                }`}
                onClick={() => setActiveTab(tab.key)}
              >
                {tab.label}
                {count > 0 && (
                  <span className={`ml-1 inline-flex items-center justify-center rounded-full px-1.5 text-[10px] font-bold ${
                    isActive ? "bg-white/20 text-white" : "bg-red-100 text-red-600"
                  }`}>
                    {count > 99 ? "99+" : count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Notification list */}
        <div
          ref={menuRef}
          role="menu"
          className="max-h-[400px] overflow-y-auto"
          onKeyDown={handleKeyDown}
        >
          {isLoading ? (
            <div className="px-4 py-8 text-center">
              <Loader2 className="h-5 w-5 animate-spin mx-auto text-slate-400" />
              <p className="mt-2 text-sm text-slate-500">Loading notifications...</p>
            </div>
          ) : error ? (
            <div className="px-4 py-8 text-center">
              <p className="text-sm text-red-500">Could not load notifications</p>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => refresh()}
                className="mt-2 text-xs"
              >
                Try again
              </Button>
            </div>
          ) : notifications.length === 0 ? (
            <EmptyState category={activeTab} unreadOnly={showUnreadOnly} />
          ) : (
            <div className="divide-y divide-slate-100/60">
              {notifications.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onClick={handleNotificationClick}
                />
              ))}
            </div>
          )}

          {hasMore && !isLoading && notifications.length > 0 && (
            <div className="px-4 py-2 border-t border-slate-100/40">
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-full text-xs text-slate-500"
                onClick={loadMore}
              >
                Load more
              </Button>
            </div>
          )}
        </div>

        {/* Footer: View all */}
        <div className="border-t border-slate-100/60 px-4 py-2">
          <Link
            href="/notifications"
            onClick={() => setOpen(false)}
            className="flex h-8 w-full items-center justify-center rounded-md text-xs font-medium text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900"
          >
            View all notifications
          </Link>
        </div>
      </PopoverContent>
    </Popover>
  );
}

// =====================================================
// Sub-components
// =====================================================

function NotificationItem({
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
    <button
      type="button"
      role="menuitem"
      tabIndex={0}
      className={`w-full px-4 py-3 text-left transition-colors hover:bg-slate-50/60 focus:bg-slate-50/60 focus:outline-none ${
        !notification.read ? "bg-blue-50/30" : ""
      } ${hasAction ? "cursor-pointer" : "cursor-default"}`}
      onClick={() => onClick(notification)}
    >
      <div className="flex items-start gap-3">
        <div className={`mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg ${severityStyle}`}>
          <Icon className="h-4 w-4" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <p className={`text-sm leading-tight ${notification.read ? "text-slate-700" : "font-medium text-slate-900"}`}>
              {notification.title}
            </p>
            {!notification.read && (
              <div className="mt-1 h-2 w-2 flex-shrink-0 rounded-full bg-blue-600" />
            )}
          </div>
          <p className="mt-0.5 text-xs text-slate-500 line-clamp-2">
            {notification.body}
          </p>
          <div className="mt-1 flex items-center gap-2">
            <span className="text-[10px] text-slate-400">
              {formatTimestamp(notification.created_at)}
            </span>
            {notification.source && (
              <span className="text-[10px] text-slate-400">
                via {notification.source}
              </span>
            )}
          </div>
        </div>
      </div>
    </button>
  );
}

function EmptyState({
  category,
  unreadOnly,
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
      <p className="mt-2 text-sm text-slate-500">
        {messages[category] || messages.all}
      </p>
    </div>
  );
}
