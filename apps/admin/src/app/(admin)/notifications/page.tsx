"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { Bell, ShieldAlert, Inbox, CreditCard, GitBranch, HeartPulse, Loader2, CheckCheck, RefreshCw } from "lucide-react";
import { AdminShell } from "@/components/layout/admin-shell";
import { Button } from "@/components/ui/button";
import { useNotifications } from "@/lib/hooks/notifications/useNotifications";
import { logAdminEvent } from "@/lib/services/audit-log-service";
import { resolveNavigationUrl } from "@/components/notification-center/constants";
import type { InAppNotification, InAppNotificationCategory } from "@/lib/types/notifications";
import { NotificationCard } from "./_components/NotificationCard";
import { LoadingSkeleton, ErrorState, PageEmptyState } from "./_components/NotificationStates";

const CATEGORY_TABS: { key: InAppNotificationCategory | "all"; label: string; icon: typeof Bell }[] = [
  { key: "all", label: "All", icon: Bell },
  { key: "security", label: "Security", icon: ShieldAlert },
  { key: "support", label: "Support", icon: Inbox },
  { key: "system", label: "System", icon: HeartPulse },
  { key: "billing", label: "Billing", icon: CreditCard },
  { key: "onboarding", label: "Onboarding", icon: GitBranch },
];

export default function NotificationsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<InAppNotificationCategory | "all">("all");
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);
  const filterCategory = activeTab === "all" ? undefined : activeTab;

  const {
    notifications, totalUnreadCount, unreadByCategory,
    isLoading, error, hasMore, markAsRead, markAllAsRead, refresh, loadMore,
  } = useNotifications({
    enablePolling: true, pollingInterval: 60_000, pageSize: 30,
    category: filterCategory, unreadOnly: showUnreadOnly,
  });

  const currentUnreadCount = activeTab === "all" ? totalUnreadCount : (unreadByCategory[activeTab] || 0);

  const handleNotificationClick = useCallback(async (notification: InAppNotification) => {
    if (!notification.read) await markAsRead(notification.id);
    logAdminEvent({ action: "notification_clicked", metadata: { notificationId: notification.id, category: notification.type, severity: notification.severity } }).catch(() => {});
    const url = resolveNavigationUrl(notification);
    if (url) router.push(url);
  }, [markAsRead, router]);

  const handleMarkAllAsRead = useCallback(async () => {
    const scope = activeTab === "all" ? undefined : activeTab;
    await markAllAsRead(scope);
    logAdminEvent({ action: "mark_all_as_read", metadata: { scope: scope || "all" } }).catch(() => {});
  }, [markAllAsRead, activeTab]);

  return (
    <AdminShell>
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Notifications</h1>
          <p className="text-sm text-muted-foreground">Stay on top of security events, support tickets, and system alerts.</p>
        </div>
        <div className="flex items-center gap-2 mt-2 sm:mt-0">
          <Button variant="outline" size="sm" onClick={() => refresh()} className="gap-1.5"><RefreshCw className="h-3.5 w-3.5" />Refresh</Button>
          {currentUnreadCount > 0 && (
            <Button variant="outline" size="sm" onClick={handleMarkAllAsRead} className="gap-1.5">
              <CheckCheck className="h-3.5 w-3.5" />{activeTab === "all" ? "Mark all as read" : `Mark all ${activeTab} as read`}
            </Button>
          )}
        </div>
      </div>

      <div className="mt-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex gap-1 overflow-x-auto pb-1">
            {CATEGORY_TABS.map((tab) => {
              const count = tab.key === "all" ? totalUnreadCount : (unreadByCategory[tab.key] || 0);
              const isActive = activeTab === tab.key;
              const TabIcon = tab.icon;
              return (
                <button key={tab.key} type="button" className={`flex flex-shrink-0 items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${isActive ? "bg-slate-900 text-white shadow-sm" : "text-slate-500 hover:bg-slate-100 hover:text-slate-700"}`} onClick={() => setActiveTab(tab.key)}>
                  <TabIcon className="h-4 w-4" />
                  <span className="hidden sm:inline">{tab.label}</span>
                  {count > 0 && <span className={`inline-flex items-center justify-center rounded-full px-1.5 text-[10px] font-bold leading-none ${isActive ? "bg-white/20 text-white" : "bg-red-100 text-red-600"}`}>{count > 99 ? "99+" : count}</span>}
                </button>
              );
            })}
          </div>
          <button type="button" className={`flex-shrink-0 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${showUnreadOnly ? "bg-blue-100 text-blue-700" : "bg-slate-100 text-slate-500 hover:text-slate-700"}`} onClick={() => setShowUnreadOnly(!showUnreadOnly)}>
            {showUnreadOnly ? "Showing unread only" : "Showing all"}
          </button>
        </div>

        <div className="mt-6">
          {isLoading ? <LoadingSkeleton /> : error ? <ErrorState onRetry={refresh} /> : notifications.length === 0 ? <PageEmptyState category={activeTab} unreadOnly={showUnreadOnly} /> : (
            <div className="space-y-2">
              {notifications.map((n) => <NotificationCard key={n.id} notification={n} onClick={handleNotificationClick} />)}
              {hasMore && <div className="pt-4 text-center"><Button variant="outline" size="sm" onClick={loadMore} className="gap-1.5"><Loader2 className="h-3.5 w-3.5" />Load more</Button></div>}
            </div>
          )}
        </div>
      </div>
    </AdminShell>
  );
}
