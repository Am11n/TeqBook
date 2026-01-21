"use client";

import { useState, useEffect } from "react";
import { Bell, Calendar, Users, Settings, Info, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { useNotifications } from "@/lib/hooks/notifications/useNotifications";
import type { InAppNotification } from "@/lib/types/notifications";

export function NotificationCenter() {
  const {
    notifications,
    unreadCount,
    isLoading,
    markAsRead,
    markAllAsRead,
  } = useNotifications({
    enablePolling: true,
    pollingInterval: 60000, // Poll every minute
  });

  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Only render on client to avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  const getIcon = (type: InAppNotification["type"]) => {
    switch (type) {
      case "booking":
        return Calendar;
      case "staff":
        return Users;
      case "system":
        return Settings;
      default:
        return Info;
    }
  };

  const handleNotificationClick = async (notification: InAppNotification) => {
    if (!notification.read) {
      await markAsRead(notification.id);
    }
    if (notification.action_url) {
      window.location.href = notification.action_url;
    }
  };

  const handleMarkAllAsRead = async () => {
    await markAllAsRead();
  };

  // Format timestamp relative to now
  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

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
  };

  // Don't render until mounted to avoid hydration mismatch
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
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="relative h-9 w-9 rounded-lg transition-all hover:scale-105 hover:bg-slate-100/60 flex items-center justify-center"
          aria-label="Notifications"
        >
          <Bell className="h-5 w-5 text-blue-700" />
          {unreadCount > 0 && (
            <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 p-0 text-[10px] font-bold text-white">
              {unreadCount > 9 ? "9+" : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-80 rounded-2xl bg-white/80 backdrop-blur-2xl border border-slate-100/60 p-0 shadow-2xl"
        align="end"
      >
        <div className="flex items-center justify-between border-b border-slate-100/60 px-4 py-3">
          <h3 className="text-sm font-semibold text-slate-900">Notifications</h3>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleMarkAllAsRead}
              className="h-7 text-xs text-slate-600 hover:text-slate-900"
            >
              Mark all read
            </Button>
          )}
        </div>

        <div className="max-h-[400px] overflow-y-auto">
          {isLoading ? (
            <div className="px-4 py-8 text-center">
              <Loader2 className="h-5 w-5 animate-spin mx-auto text-slate-400" />
              <p className="mt-2 text-sm text-slate-500">Loading...</p>
            </div>
          ) : notifications.length === 0 ? (
            <div className="px-4 py-8 text-center text-sm text-slate-500">
              No notifications
            </div>
          ) : (
            <div className="divide-y divide-slate-100/60">
              {notifications.map((notification) => {
                const Icon = getIcon(notification.type);
                return (
                  <button
                    key={notification.id}
                    type="button"
                    className={`w-full px-4 py-3 transition-colors hover:bg-slate-50/60 text-left ${
                      !notification.read ? "bg-blue-50/30" : ""
                    }`}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-slate-100/60">
                        <Icon className="h-4 w-4 text-slate-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-sm font-medium text-slate-900">
                            {notification.title}
                          </p>
                          {!notification.read && (
                            <div className="h-2 w-2 flex-shrink-0 rounded-full bg-blue-600" />
                          )}
                        </div>
                        <p className="mt-1 text-xs text-slate-600 line-clamp-2">
                          {notification.body}
                        </p>
                        <p className="mt-1 text-[10px] text-slate-400">
                          {formatTimestamp(notification.created_at)}
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {notifications.length > 0 && (
          <div className="border-t border-slate-100/60 px-4 py-2">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-full text-xs text-slate-600 hover:text-slate-900"
              onClick={() => {
                setOpen(false);
                window.location.href = "/notifications";
              }}
            >
              View all notifications
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
