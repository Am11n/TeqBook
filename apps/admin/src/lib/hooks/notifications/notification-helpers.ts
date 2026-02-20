import type {
  InAppNotification,
  InAppNotificationCategory,
  NotificationSeverity,
  NotificationSource,
  NotificationEntity,
} from "@/lib/types/notifications";

export interface UseNotificationsOptions {
  enablePolling?: boolean;
  pollingInterval?: number;
  pageSize?: number;
  category?: InAppNotificationCategory;
  unreadOnly?: boolean;
}

export interface UseNotificationsReturn {
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

export function mapRow(row: Record<string, unknown>): InAppNotification {
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

export function encodeCursor(createdAt: string, id: string): string {
  return btoa(JSON.stringify({ c: createdAt, i: id }));
}

export function decodeCursor(cursor: string): { createdAt: string; id: string } | null {
  try {
    const p = JSON.parse(atob(cursor));
    return p && typeof p.c === "string" && typeof p.i === "string"
      ? { createdAt: p.c, id: p.i }
      : null;
  } catch {
    return null;
  }
}
