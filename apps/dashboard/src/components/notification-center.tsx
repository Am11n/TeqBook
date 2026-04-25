"use client";

import { useState, useEffect, useCallback } from "react";
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
import { useLocale } from "@/components/locale-provider";
import { intlLocaleTag } from "@/i18n/intlLocaleTag";
import { translations, type AppLocale } from "@/i18n/translations";
import { getLocalizedInAppNotificationCopy } from "@/lib/notifications/getLocalizedInAppNotificationCopy";

export function NotificationCenter() {
  const { locale } = useLocale();
  const t = translations[locale].notifications;

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

  const formatTimestamp = useCallback(
    (timestamp: string) => {
      const date = new Date(timestamp);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMs / 3600000);
      const diffDays = Math.floor(diffMs / 86400000);

      if (diffMins < 1) return t.justNow;
      if (diffMins < 60) return t.minutesAgo.replace("{count}", String(diffMins));
      if (diffHours < 24) return t.hoursAgo.replace("{count}", String(diffHours));
      if (diffDays < 7) return t.daysAgo.replace("{count}", String(diffDays));

      return date.toLocaleDateString(intlLocaleTag(locale), {
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
      });
    },
    [locale, t],
  );

  // Don't render until mounted to avoid hydration mismatch
  if (!mounted) {
    return (
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="relative h-9 w-9 rounded-lg transition-all hover:scale-105 hover:bg-slate-100/60 flex items-center justify-center"
        aria-label={t.ariaLabel}
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
          aria-label={t.ariaLabel}
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
        align="end"
        className="flex w-[min(22rem,calc(100vw-1.5rem))] max-w-[calc(100vw-1.5rem)] max-h-[min(70vh,32rem)] flex-col overflow-hidden rounded-2xl border border-slate-100/60 bg-white/80 p-0 shadow-2xl backdrop-blur-2xl sm:w-[min(24rem,calc(100vw-2rem))]"
      >
        <div className="flex shrink-0 items-start justify-between gap-2 border-b border-slate-100/60 px-4 py-3">
          <h3 className="min-w-0 flex-1 break-words text-sm font-semibold leading-snug text-slate-900">
            {t.title}
          </h3>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleMarkAllAsRead}
              className="h-auto min-h-7 shrink-0 max-w-[48%] whitespace-normal px-2 text-right text-xs leading-snug text-slate-600 hover:text-slate-900"
            >
              {t.markAllRead}
            </Button>
          )}
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden overscroll-contain">
          {isLoading ? (
            <div className="px-4 py-8 text-center">
              <Loader2 className="h-5 w-5 animate-spin mx-auto text-slate-400" />
              <p className="mt-2 text-sm text-slate-500">{t.loading}</p>
            </div>
          ) : notifications.length === 0 ? (
            <div className="px-4 py-8 text-center text-sm text-slate-500">
              {t.noNotifications}
            </div>
          ) : (
            <div className="divide-y divide-slate-100/60">
              {notifications.map((notification) => {
                const Icon = getIcon(notification.type);
                const { title: displayTitle, body: displayBody } =
                  getLocalizedInAppNotificationCopy(notification, locale);
                return (
                  <button
                    key={notification.id}
                    type="button"
                    className={`w-full max-w-full px-4 py-3 text-left transition-colors hover:bg-slate-50/60 ${
                      !notification.read ? "bg-blue-50/30" : ""
                    }`}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <div className="flex max-w-full items-start gap-3">
                      <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100/60">
                        <Icon className="h-4 w-4 text-slate-600" />
                      </div>
                      <div className="min-w-0 max-w-full flex-1 overflow-hidden">
                        <div className="flex items-start justify-between gap-2">
                          <p className="min-w-0 flex-1 break-words text-pretty text-sm font-medium leading-snug text-slate-900">
                            {displayTitle}
                          </p>
                          {!notification.read && (
                            <div className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-blue-600" />
                          )}
                        </div>
                        <p className="mt-1 break-words text-pretty text-xs leading-relaxed text-slate-600 [overflow-wrap:anywhere]">
                          {displayBody}
                        </p>
                        <p className="mt-1.5 break-words text-[10px] leading-snug text-slate-400 [overflow-wrap:anywhere]">
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
          <div className="shrink-0 border-t border-slate-100/60 px-4 py-2">
            <Button
              variant="ghost"
              size="sm"
              className="h-auto min-h-8 w-full whitespace-normal break-words px-2 py-2 text-center text-xs leading-snug text-slate-600 hover:text-slate-900"
              onClick={() => {
                setOpen(false);
                window.location.href = "/notifications";
              }}
            >
              {t.viewAll}
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
