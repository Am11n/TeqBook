// =====================================================
// useNotifications Hook
// =====================================================
// Cursor-paginated, realtime-aware notification hook
// with optimistic mark-read and per-category unread counts.

"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/lib/supabase-client";
import type {
  InAppNotification,
  InAppNotificationCategory,
  NotificationSeverity,
  NotificationSource,
  NotificationEntity,
  GetNotificationsOptions,
} from "@/lib/types/notifications";

// =====================================================
// Types
// =====================================================

interface UseNotificationsOptions {
  enablePolling?: boolean;
  pollingInterval?: number;
  pageSize?: number;
  category?: InAppNotificationCategory;
  unreadOnly?: boolean;
}

interface UseNotificationsReturn {
  notifications: InAppNotification[];
  totalUnreadCount: number;
  unreadByCategory: Record<string, number>;
  isLoading: boolean;
  error: string | null;
  hasMore: boolean;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: (category?: InAppNotificationCategory) => Promise<void>;
  refresh: () => Promise<void>;
  loadMore: () => Promise<void>;
}

// =====================================================
// Row -> InAppNotification mapper
// =====================================================

function mapRow(row: Record<string, unknown>): InAppNotification {
  const meta = (row.metadata as Record<string, unknown>) || {};
  return {
    id: row.id as string,
    user_id: row.user_id as string,
    salon_id: (row.salon_id as string) ?? null,
    type: (row.type as InAppNotificationCategory) || "info",
    severity: (meta._severity as NotificationSeverity) || "info",
    source: (meta._source as NotificationSource) ?? null,
    entity: (meta._entity as NotificationEntity) ?? null,
    title: row.title as string,
    body: row.body as string,
    read: row.read as boolean,
    metadata: meta,
    action_url: (row.action_url as string) ?? null,
    created_at: row.created_at as string,
  };
}

// =====================================================
// Cursor helpers
// =====================================================

function encodeCursor(createdAt: string, id: string): string {
  return btoa(JSON.stringify({ c: createdAt, i: id }));
}

function decodeCursor(cursor: string): { createdAt: string; id: string } | null {
  try {
    const p = JSON.parse(atob(cursor));
    return p && typeof p.c === "string" && typeof p.i === "string"
      ? { createdAt: p.c, id: p.i }
      : null;
  } catch {
    return null;
  }
}

// =====================================================
// Hook
// =====================================================

export function useNotifications(
  options: UseNotificationsOptions = {}
): UseNotificationsReturn {
  const {
    enablePolling = true,
    pollingInterval = 60_000,
    pageSize = 20,
    category,
    unreadOnly = false,
  } = options;

  const [notifications, setNotifications] = useState<InAppNotification[]>([]);
  const [totalUnreadCount, setTotalUnreadCount] = useState(0);
  const [unreadByCategory, setUnreadByCategory] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const realtimeRetryRef = useRef(0);
  const realtimeRetryTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [realtimeRetryKey, setRealtimeRetryKey] = useState(0);

  // Track locally-read ids so realtime/polling never reverts them
  const localReadIds = useRef(new Set<string>());

  // ---------------------------------------------------
  // Auth: get userId
  // ---------------------------------------------------
  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUserId(user?.id ?? null);
    };
    getUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setUserId(session?.user?.id ?? null);
    });

    return () => { subscription.unsubscribe(); };
  }, []);

  // ---------------------------------------------------
  // Fetch page (cursor-based)
  // ---------------------------------------------------
  const fetchPage = useCallback(
    async (reset: boolean) => {
      if (!userId) { setIsLoading(false); return; }

      try {
        const cursor = reset ? null : nextCursor;
        const limit = pageSize;

        let query = supabase
          .from("notifications")
          .select("id, user_id, salon_id, type, title, body, read, metadata, action_url, created_at")
          .eq("user_id", userId)
          .order("created_at", { ascending: false })
          .order("id", { ascending: false })
          .limit(limit + 1);

        if (category) query = query.eq("type", category);
        if (unreadOnly) query = query.eq("read", false);

        if (cursor) {
          const decoded = decodeCursor(cursor);
          if (decoded) {
            query = query.or(
              `created_at.lt.${decoded.createdAt},and(created_at.eq.${decoded.createdAt},id.lt.${decoded.id})`
            );
          }
        }

        const { data, error: fetchError } = await query;
        if (fetchError) throw new Error(fetchError.message);

        const rows = (data || []).map(mapRow);
        const more = rows.length > limit;
        const page = rows.slice(0, limit);

        // Apply local-read overrides
        const merged = page.map((n) =>
          localReadIds.current.has(n.id) ? { ...n, read: true } : n
        );

        if (reset) {
          setNotifications(merged);
        } else {
          setNotifications((prev) => {
            const existingIds = new Set(prev.map((n) => n.id));
            const fresh = merged.filter((n) => !existingIds.has(n.id));
            return [...prev, ...fresh];
          });
        }

        if (more && page.length > 0) {
          const last = page[page.length - 1];
          setNextCursor(encodeCursor(last.created_at, last.id));
        } else {
          setNextCursor(null);
        }
        setHasMore(more);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setIsLoading(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [userId, nextCursor, pageSize, category, unreadOnly]
  );

  // ---------------------------------------------------
  // Fetch unread counts (total + per category)
  // ---------------------------------------------------
  const fetchUnreadCounts = useCallback(async () => {
    if (!userId) return;
    try {
      const { data, error: e } = await supabase
        .from("notifications")
        .select("type")
        .eq("user_id", userId)
        .eq("read", false);

      if (e) return;

      const byCategory: Record<string, number> = {};
      let total = 0;
      for (const row of data || []) {
        // Skip items we've already locally marked read
        // (we don't have id here, so this is a best-effort count)
        const cat = row.type as string;
        byCategory[cat] = (byCategory[cat] || 0) + 1;
        total++;
      }
      setTotalUnreadCount(total);
      setUnreadByCategory(byCategory);
    } catch {
      // Silently fail – polling will retry
    }
  }, [userId]);

  // ---------------------------------------------------
  // Initial load
  // ---------------------------------------------------
  useEffect(() => {
    if (userId) {
      setIsLoading(true);
      fetchPage(true);
      fetchUnreadCounts();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, category, unreadOnly]);

  // ---------------------------------------------------
  // Polling (unread counts only – lightweight)
  // ---------------------------------------------------
  useEffect(() => {
    if (!enablePolling || !userId) return;

    pollingRef.current = setInterval(() => {
      fetchUnreadCounts();
    }, pollingInterval);

    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [enablePolling, pollingInterval, userId, fetchUnreadCounts]);

  // ---------------------------------------------------
  // Realtime subscription (with retry)
  // ---------------------------------------------------
  useEffect(() => {
    if (!userId) return;

    const channel = supabase
      .channel(`admin-notifications:${userId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          const incoming = mapRow(payload.new as Record<string, unknown>);

          // If we're filtering by category, only add matching items
          if (category && incoming.type !== category) {
            // Still update counts
            fetchUnreadCounts();
            return;
          }
          if (unreadOnly && incoming.read) return;

          // Dedupe: don't add if already in list
          setNotifications((prev) => {
            if (prev.some((n) => n.id === incoming.id)) return prev;
            return [incoming, ...prev];
          });
          setTotalUnreadCount((prev) => prev + 1);
          setUnreadByCategory((prev) => ({
            ...prev,
            [incoming.type]: (prev[incoming.type] || 0) + 1,
          }));
        }
      )
      .subscribe((status) => {
        if (status === "SUBSCRIBED") {
          realtimeRetryRef.current = 0;
        } else if (status === "CHANNEL_ERROR") {
          const attempt = realtimeRetryRef.current + 1;
          realtimeRetryRef.current = attempt;
          if (attempt <= 3) {
            realtimeRetryTimeoutRef.current = setTimeout(
              () => setRealtimeRetryKey((k) => k + 1),
              4000
            );
          }
        }
      });

    return () => {
      if (realtimeRetryTimeoutRef.current) {
        clearTimeout(realtimeRetryTimeoutRef.current);
        realtimeRetryTimeoutRef.current = null;
      }
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, category, unreadOnly, realtimeRetryKey]);

  // ---------------------------------------------------
  // Actions
  // ---------------------------------------------------

  const markAsRead = useCallback(async (notificationId: string) => {
    if (!userId) return;

    // Optimistic: mark locally immediately
    localReadIds.current.add(notificationId);
    setNotifications((prev) =>
      prev.map((n) => (n.id === notificationId && !n.read ? { ...n, read: true } : n))
    );
    setTotalUnreadCount((prev) => Math.max(0, prev - 1));
    setUnreadByCategory((prev) => {
      const n = notifications.find((x) => x.id === notificationId);
      if (!n || n.read) return prev;
      const cat = n.type;
      return { ...prev, [cat]: Math.max(0, (prev[cat] || 0) - 1) };
    });

    // Persist to server
    try {
      const { error: updateError } = await supabase
        .from("notifications")
        .update({ read: true })
        .eq("id", notificationId)
        .eq("user_id", userId);

      if (updateError) {
        // Revert optimistic update
        localReadIds.current.delete(notificationId);
        setNotifications((prev) =>
          prev.map((n) => (n.id === notificationId ? { ...n, read: false } : n))
        );
        await fetchUnreadCounts();
      }
    } catch {
      localReadIds.current.delete(notificationId);
      await fetchUnreadCounts();
    }
  }, [userId, notifications, fetchUnreadCounts]);

  const markAllAsRead = useCallback(async (cat?: InAppNotificationCategory) => {
    if (!userId) return;

    // Optimistic: mark all matching as read locally
    setNotifications((prev) =>
      prev.map((n) => {
        if (!n.read && (!cat || n.type === cat)) {
          localReadIds.current.add(n.id);
          return { ...n, read: true };
        }
        return n;
      })
    );
    if (cat) {
      setUnreadByCategory((prev) => ({ ...prev, [cat]: 0 }));
      setTotalUnreadCount((prev) => Math.max(0, prev - (unreadByCategory[cat] || 0)));
    } else {
      setUnreadByCategory({});
      setTotalUnreadCount(0);
    }

    try {
      let query = supabase
        .from("notifications")
        .update({ read: true })
        .eq("user_id", userId)
        .eq("read", false);

      if (cat) query = query.eq("type", cat);

      const { error: updateError } = await query;

      if (updateError) {
        await fetchUnreadCounts();
        await fetchPage(true);
      }
    } catch {
      await fetchUnreadCounts();
    }
  }, [userId, unreadByCategory, fetchUnreadCounts, fetchPage]);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    setNextCursor(null);
    await fetchPage(true);
    await fetchUnreadCounts();
  }, [fetchPage, fetchUnreadCounts]);

  const loadMore = useCallback(async () => {
    if (!hasMore || isLoading) return;
    await fetchPage(false);
  }, [hasMore, isLoading, fetchPage]);

  return {
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
  };
}
