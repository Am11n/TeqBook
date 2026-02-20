"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/lib/supabase-client";
import type { InAppNotification, InAppNotificationCategory } from "@/lib/types/notifications";
import {
  type UseNotificationsOptions,
  type UseNotificationsReturn,
  mapRow,
  encodeCursor,
  decodeCursor,
} from "./notification-helpers";

export type { UseNotificationsOptions, UseNotificationsReturn };

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
  const localReadIds = useRef(new Set<string>());

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

  useEffect(() => {
    if (userId) {
      setIsLoading(true);
      fetchPage(true);
      fetchUnreadCounts();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, category, unreadOnly]);

  useEffect(() => {
    if (!enablePolling || !userId) return;
    pollingRef.current = setInterval(() => { fetchUnreadCounts(); }, pollingInterval);
    return () => { if (pollingRef.current) clearInterval(pollingRef.current); };
  }, [enablePolling, pollingInterval, userId, fetchUnreadCounts]);

  useEffect(() => {
    if (!userId) return;
    const channel = supabase
      .channel(`admin-notifications:${userId}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "notifications", filter: `user_id=eq.${userId}` }, (payload) => {
        const incoming = mapRow(payload.new as Record<string, unknown>);
        if (category && incoming.type !== category) { fetchUnreadCounts(); return; }
        if (unreadOnly && incoming.read) return;
        setNotifications((prev) => {
          if (prev.some((n) => n.id === incoming.id)) return prev;
          return [incoming, ...prev];
        });
        setTotalUnreadCount((prev) => prev + 1);
        setUnreadByCategory((prev) => ({ ...prev, [incoming.type]: (prev[incoming.type] || 0) + 1 }));
      })
      .subscribe((status) => {
        if (status === "SUBSCRIBED") { realtimeRetryRef.current = 0; }
        else if (status === "CHANNEL_ERROR") {
          const attempt = realtimeRetryRef.current + 1;
          realtimeRetryRef.current = attempt;
          if (attempt <= 3) {
            realtimeRetryTimeoutRef.current = setTimeout(() => setRealtimeRetryKey((k) => k + 1), 4000);
          }
        }
      });
    return () => {
      if (realtimeRetryTimeoutRef.current) { clearTimeout(realtimeRetryTimeoutRef.current); realtimeRetryTimeoutRef.current = null; }
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, category, unreadOnly, realtimeRetryKey]);

  const markAsRead = useCallback(async (notificationId: string) => {
    if (!userId) return;
    localReadIds.current.add(notificationId);
    setNotifications((prev) => prev.map((n) => (n.id === notificationId && !n.read ? { ...n, read: true } : n)));
    setTotalUnreadCount((prev) => Math.max(0, prev - 1));
    setUnreadByCategory((prev) => {
      const n = notifications.find((x) => x.id === notificationId);
      if (!n || n.read) return prev;
      return { ...prev, [n.type]: Math.max(0, (prev[n.type] || 0) - 1) };
    });
    try {
      const { error: updateError } = await supabase.from("notifications").update({ read: true }).eq("id", notificationId).eq("user_id", userId);
      if (updateError) {
        localReadIds.current.delete(notificationId);
        setNotifications((prev) => prev.map((n) => (n.id === notificationId ? { ...n, read: false } : n)));
        await fetchUnreadCounts();
      }
    } catch {
      localReadIds.current.delete(notificationId);
      await fetchUnreadCounts();
    }
  }, [userId, notifications, fetchUnreadCounts]);

  const markAllAsRead = useCallback(async (cat?: InAppNotificationCategory) => {
    if (!userId) return;
    setNotifications((prev) => prev.map((n) => {
      if (!n.read && (!cat || n.type === cat)) { localReadIds.current.add(n.id); return { ...n, read: true }; }
      return n;
    }));
    if (cat) {
      setUnreadByCategory((prev) => ({ ...prev, [cat]: 0 }));
      setTotalUnreadCount((prev) => Math.max(0, prev - (unreadByCategory[cat] || 0)));
    } else {
      setUnreadByCategory({});
      setTotalUnreadCount(0);
    }
    try {
      let query = supabase.from("notifications").update({ read: true }).eq("user_id", userId).eq("read", false);
      if (cat) query = query.eq("type", cat);
      const { error: updateError } = await query;
      if (updateError) { await fetchUnreadCounts(); await fetchPage(true); }
    } catch { await fetchUnreadCounts(); }
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

  return { notifications, totalUnreadCount, unreadByCategory, isLoading, error, hasMore, markAsRead, markAllAsRead, refresh, loadMore };
}
