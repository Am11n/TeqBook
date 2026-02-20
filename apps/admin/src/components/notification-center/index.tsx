"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bell, Loader2, CheckCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { useNotifications } from "@/lib/hooks/notifications/useNotifications";
import { logAdminEvent } from "@/lib/services/audit-log-service";
import type { InAppNotification, InAppNotificationCategory } from "@/lib/types/notifications";
import { CATEGORY_TABS, resolveNavigationUrl } from "./constants";
import { NotificationItem } from "./NotificationItem";
import { EmptyState } from "./EmptyState";

export function NotificationCenter() {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<InAppNotificationCategory | "all">("all");
  const [showUnreadOnly, setShowUnreadOnly] = useState(true);
  const menuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const filterCategory = activeTab === "all" ? undefined : activeTab;
  const {
    notifications, totalUnreadCount, unreadByCategory,
    isLoading, error, hasMore, markAsRead, markAllAsRead, refresh, loadMore,
  } = useNotifications({
    enablePolling: true, pollingInterval: 60_000, pageSize: 15,
    category: filterCategory, unreadOnly: showUnreadOnly,
  });

  useEffect(() => { setMounted(true); }, []);

  const handleOpenChange = useCallback((isOpen: boolean) => {
    setOpen(isOpen);
    if (isOpen) logAdminEvent({ action: "notification_popover_opened" }).catch(() => {});
  }, []);

  const handleNotificationClick = useCallback(async (notification: InAppNotification) => {
    if (!notification.read) await markAsRead(notification.id);
    logAdminEvent({ action: "notification_clicked", metadata: { notificationId: notification.id, category: notification.type, severity: notification.severity } }).catch(() => {});
    const url = resolveNavigationUrl(notification);
    if (url) { setOpen(false); router.push(url); }
  }, [markAsRead, router]);

  const handleMarkAllAsRead = useCallback(async () => {
    const scope = activeTab === "all" ? undefined : activeTab;
    await markAllAsRead(scope);
    logAdminEvent({ action: "mark_all_as_read", metadata: { scope: scope || "all" } }).catch(() => {});
  }, [markAllAsRead, activeTab]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLDivElement>) => {
    const items = menuRef.current?.querySelectorAll<HTMLElement>('[role="menuitem"]');
    if (!items || items.length === 0) return;
    const currentIndex = Array.from(items).findIndex((el) => el === document.activeElement);
    if (e.key === "ArrowDown") { e.preventDefault(); items[currentIndex < items.length - 1 ? currentIndex + 1 : 0].focus(); }
    else if (e.key === "ArrowUp") { e.preventDefault(); items[currentIndex > 0 ? currentIndex - 1 : items.length - 1].focus(); }
  }, []);

  const currentUnreadCount = activeTab === "all" ? totalUnreadCount : (unreadByCategory[activeTab] || 0);

  if (!mounted) {
    return (
      <Button type="button" variant="ghost" size="icon" className="relative h-9 w-9 rounded-lg transition-all hover:scale-105 hover:bg-slate-100/60 flex items-center justify-center" aria-label="Notifications" disabled>
        <Bell className="h-5 w-5 text-blue-700" />
      </Button>
    );
  }

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button type="button" variant="ghost" size="icon" className="relative h-9 w-9 rounded-lg transition-all hover:scale-105 hover:bg-slate-100/60 flex items-center justify-center" aria-label={`Notifications${totalUnreadCount > 0 ? ` (${totalUnreadCount} unread)` : ""}`}>
          <Bell className="h-5 w-5 text-blue-700" />
          {totalUnreadCount > 0 && <Badge className="absolute -top-1 -right-1 h-5 min-w-5 rounded-full bg-red-500 px-1 text-[10px] font-bold text-white pointer-events-none">{totalUnreadCount > 99 ? "99+" : totalUnreadCount}</Badge>}
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-96 rounded-2xl bg-white/90 backdrop-blur-2xl border border-slate-200/60 p-0 shadow-2xl" align="end" sideOffset={8}>
        <div className="flex items-center justify-between border-b border-slate-100/60 px-4 py-3">
          <h3 className="text-sm font-semibold text-slate-900">Notifications</h3>
          <div className="flex items-center gap-2">
            <button type="button" className={`rounded-md px-2 py-0.5 text-[10px] font-medium transition-colors ${showUnreadOnly ? "bg-blue-100 text-blue-700" : "bg-slate-100 text-slate-500 hover:text-slate-700"}`} onClick={() => setShowUnreadOnly(!showUnreadOnly)}>
              {showUnreadOnly ? "Unread" : "All"}
            </button>
            {currentUnreadCount > 0 && (
              <Button variant="ghost" size="sm" onClick={handleMarkAllAsRead} className="h-7 gap-1 text-xs text-slate-600 hover:text-slate-900">
                <CheckCheck className="h-3 w-3" />Mark read
              </Button>
            )}
          </div>
        </div>

        <div className="flex gap-1 overflow-x-auto border-b border-slate-100/40 px-3 py-2">
          {CATEGORY_TABS.map((tab) => {
            const count = tab.key === "all" ? totalUnreadCount : (unreadByCategory[tab.key] || 0);
            const isActive = activeTab === tab.key;
            return (
              <button key={tab.key} type="button" className={`flex-shrink-0 rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${isActive ? "bg-slate-900 text-white" : "text-slate-500 hover:bg-slate-100 hover:text-slate-700"}`} onClick={() => setActiveTab(tab.key)}>
                {tab.label}
                {count > 0 && <span className={`ml-1 inline-flex items-center justify-center rounded-full px-1.5 text-[10px] font-bold ${isActive ? "bg-white/20 text-white" : "bg-red-100 text-red-600"}`}>{count > 99 ? "99+" : count}</span>}
              </button>
            );
          })}
        </div>

        <div ref={menuRef} role="menu" className="max-h-[400px] overflow-y-auto" onKeyDown={handleKeyDown}>
          {isLoading ? (
            <div className="px-4 py-8 text-center"><Loader2 className="h-5 w-5 animate-spin mx-auto text-slate-400" /><p className="mt-2 text-sm text-slate-500">Loading notifications...</p></div>
          ) : error ? (
            <div className="px-4 py-8 text-center"><p className="text-sm text-red-500">Could not load notifications</p><Button variant="ghost" size="sm" onClick={() => refresh()} className="mt-2 text-xs">Try again</Button></div>
          ) : notifications.length === 0 ? (
            <EmptyState category={activeTab} unreadOnly={showUnreadOnly} />
          ) : (
            <div className="divide-y divide-slate-100/60">
              {notifications.map((notification) => <NotificationItem key={notification.id} notification={notification} onClick={handleNotificationClick} />)}
            </div>
          )}
          {hasMore && !isLoading && notifications.length > 0 && (
            <div className="px-4 py-2 border-t border-slate-100/40"><Button variant="ghost" size="sm" className="h-7 w-full text-xs text-slate-500" onClick={loadMore}>Load more</Button></div>
          )}
        </div>

        <div className="border-t border-slate-100/60 px-4 py-2">
          <Link href="/notifications" onClick={() => setOpen(false)} className="flex h-8 w-full items-center justify-center rounded-md text-xs font-medium text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900">View all notifications</Link>
        </div>
      </PopoverContent>
    </Popover>
  );
}
