import type { InAppNotification } from "@/lib/types/notifications";

export interface NotificationRow {
  id: string;
  user_id: string;
  salon_id: string | null;
  type: string;
  title: string;
  body: string;
  read: boolean;
  metadata: Record<string, unknown> | null;
  action_url: string | null;
  created_at: string;
}

export function mapRowToNotification(row: NotificationRow): InAppNotification {
  return {
    id: row.id,
    user_id: row.user_id,
    salon_id: row.salon_id,
    type: row.type as InAppNotification["type"],
    title: row.title,
    body: row.body,
    read: row.read,
    metadata: row.metadata,
    action_url: row.action_url,
    created_at: row.created_at,
  };
}
