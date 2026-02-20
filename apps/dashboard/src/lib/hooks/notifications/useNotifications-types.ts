import type { InAppNotification } from "@/lib/types/notifications";

export interface UseNotificationsOptions {
  enablePolling?: boolean;
  pollingInterval?: number;
  pageSize?: number;
}

export interface UseNotificationsReturn {
  notifications: InAppNotification[];
  unreadCount: number;
  isLoading: boolean;
  error: string | null;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  refresh: () => Promise<void>;
  loadMore: () => Promise<void>;
  hasMore: boolean;
}
