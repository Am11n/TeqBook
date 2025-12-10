"use client";

import { useState, useEffect } from "react";
import { Bell, Calendar, Users, Settings, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
// Using native Date formatting instead of date-fns

type Notification = {
  id: string;
  type: "system" | "booking" | "staff" | "info";
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  actionUrl?: string;
};

// Mock notifications - replace with real data from Supabase
const mockNotifications: Notification[] = [
  {
    id: "1",
    type: "system",
    title: "New dashboard update",
    message: "We've released new features for better booking management.",
    timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
    read: false,
    actionUrl: "/updates",
  },
  {
    id: "2",
    type: "booking",
    title: "New booking created",
    message: "Alex Johnson booked a haircut for tomorrow at 2:00 PM",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
    read: false,
    actionUrl: "/bookings",
  },
  {
    id: "3",
    type: "staff",
    title: "Staff update",
    message: "Sarah updated her availability for next week",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5), // 5 hours ago
    read: true,
    actionUrl: "/employees",
  },
];

export function NotificationCenter() {
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Only render on client to avoid hydration mismatch
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const getIcon = (type: Notification["type"]) => {
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

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
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
              onClick={markAllAsRead}
              className="h-7 text-xs text-slate-600 hover:text-slate-900"
            >
              Mark all read
            </Button>
          )}
        </div>

        <div className="max-h-[400px] overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="px-4 py-8 text-center text-sm text-slate-500">
              No notifications
            </div>
          ) : (
            <div className="divide-y divide-slate-100/60">
              {notifications.map((notification) => {
                const Icon = getIcon(notification.type);
                return (
                  <div
                    key={notification.id}
                    className={`px-4 py-3 transition-colors hover:bg-slate-50/60 ${
                      !notification.read ? "bg-blue-50/30" : ""
                    }`}
                    onClick={() => {
                      markAsRead(notification.id);
                      if (notification.actionUrl) {
                        window.location.href = notification.actionUrl;
                      }
                    }}
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
                          {notification.message}
                        </p>
                        <p className="mt-1 text-[10px] text-slate-400">
                          {notification.timestamp.toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            hour: "numeric",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                    </div>
                  </div>
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

