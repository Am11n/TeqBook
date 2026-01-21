// =====================================================
// useNotifications Hook
// =====================================================
// React hook for managing in-app notifications
// Fetches directly from Supabase on client-side

"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/lib/supabase-client";
import type { InAppNotification, InAppNotificationType } from "@/lib/types/notifications";

// =====================================================
// Types
// =====================================================

interface UseNotificationsOptions {
  /** Enable polling for new notifications */
  enablePolling?: boolean;
  /** Polling interval in milliseconds (default: 60000 = 1 minute) */
  pollingInterval?: number;
  /** Number of notifications to fetch per page */
  pageSize?: number;
}

interface UseNotificationsReturn {
  /** List of notifications */
  notifications: InAppNotification[];
  /** Unread notification count */
  unreadCount: number;
  /** Whether notifications are loading */
  isLoading: boolean;
  /** Error message if any */
  error: string | null;
  /** Mark a single notification as read */
  markAsRead: (notificationId: string) => Promise<void>;
  /** Mark all notifications as read */
  markAllAsRead: () => Promise<void>;
  /** Refresh notifications */
  refresh: () => Promise<void>;
  /** Load more notifications (pagination) */
  loadMore: () => Promise<void>;
  /** Whether there are more notifications to load */
  hasMore: boolean;
}

// =====================================================
// Hook Implementation
// =====================================================

export function useNotifications(
  options: UseNotificationsOptions = {}
): UseNotificationsReturn {
  const {
    enablePolling = true,
    pollingInterval = 60000, // 1 minute
    pageSize = 20,
  } = options;

  const [notifications, setNotifications] = useState<InAppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [offset, setOffset] = useState(0);
  const [userId, setUserId] = useState<string | null>(null);
  const pollingRef = useRef<NodeJS.Timeout | null>(null);

  // Get current user on mount
  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUserId(user?.id || null);
    };
    getUser();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserId(session?.user?.id || null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Fetch notifications from Supabase
  const fetchNotifications = useCallback(
    async (reset: boolean = false) => {
      if (!userId) {
        setIsLoading(false);
        return;
      }

      try {
        const currentOffset = reset ? 0 : offset;
        
        const { data, error: fetchError } = await supabase
          .from("notifications")
          .select("*")
          .eq("user_id", userId)
          .order("created_at", { ascending: false })
          .range(currentOffset, currentOffset + pageSize - 1);

        if (fetchError) {
          throw new Error(fetchError.message);
        }

        const mappedNotifications: InAppNotification[] = (data || []).map((row) => ({
          id: row.id,
          user_id: row.user_id,
          salon_id: row.salon_id,
          type: row.type as InAppNotificationType,
          title: row.title,
          body: row.body,
          read: row.read,
          metadata: row.metadata,
          action_url: row.action_url,
          created_at: row.created_at,
        }));

        if (reset) {
          setNotifications(mappedNotifications);
          setOffset(pageSize);
        } else {
          setNotifications((prev) => [...prev, ...mappedNotifications]);
          setOffset((prev) => prev + pageSize);
        }

        setHasMore(mappedNotifications.length === pageSize);
        setError(null);
      } catch (err) {
        console.error("Error fetching notifications:", err);
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setIsLoading(false);
      }
    },
    [userId, offset, pageSize]
  );

  // Fetch unread count
  const fetchUnreadCount = useCallback(async () => {
    if (!userId) return;

    try {
      const { count, error: countError } = await supabase
        .from("notifications")
        .select("*", { count: "exact", head: true })
        .eq("user_id", userId)
        .eq("read", false);

      if (!countError) {
        setUnreadCount(count || 0);
      }
    } catch {
      // Silently fail for polling
    }
  }, [userId]);

  // Initial fetch when userId is available
  useEffect(() => {
    if (userId) {
      fetchNotifications(true);
      fetchUnreadCount();
    }
  }, [userId]);

  // Polling for unread count
  useEffect(() => {
    if (!enablePolling || !userId) return;

    pollingRef.current = setInterval(() => {
      fetchUnreadCount();
    }, pollingInterval);

    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
      }
    };
  }, [enablePolling, pollingInterval, userId, fetchUnreadCount]);

  // Mark single notification as read
  const markAsRead = useCallback(async (notificationId: string) => {
    if (!userId) return;

    try {
      const { error: updateError } = await supabase
        .from("notifications")
        .update({ read: true })
        .eq("id", notificationId)
        .eq("user_id", userId);

      if (updateError) {
        throw new Error(updateError.message);
      }

      // Update local state
      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    }
  }, [userId]);

  // Mark all notifications as read
  const markAllAsRead = useCallback(async () => {
    if (!userId) return;

    try {
      const { error: updateError } = await supabase
        .from("notifications")
        .update({ read: true })
        .eq("user_id", userId)
        .eq("read", false);

      if (updateError) {
        throw new Error(updateError.message);
      }

      // Update local state
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    }
  }, [userId]);

  // Refresh notifications
  const refresh = useCallback(async () => {
    setIsLoading(true);
    await fetchNotifications(true);
    await fetchUnreadCount();
  }, [fetchNotifications, fetchUnreadCount]);

  // Load more notifications
  const loadMore = useCallback(async () => {
    if (!hasMore || isLoading) return;
    await fetchNotifications(false);
  }, [hasMore, isLoading, fetchNotifications]);

  return {
    notifications,
    unreadCount,
    isLoading,
    error,
    markAsRead,
    markAllAsRead,
    refresh,
    loadMore,
    hasMore,
  };
}
