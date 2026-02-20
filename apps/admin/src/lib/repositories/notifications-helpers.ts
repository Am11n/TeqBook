import type {
  InAppNotification,
  InAppNotificationCategory,
  NotificationSeverity,
  NotificationSource,
  NotificationEntity,
} from "@/lib/types/notifications";

export interface NotificationRow {
  id: string; user_id: string; salon_id: string | null; type: string;
  title: string; body: string; read: boolean;
  metadata: Record<string, unknown> | null; action_url: string | null;
  created_at: string;
}

export function encodeCursor(createdAt: string, id: string): string {
  return btoa(JSON.stringify({ c: createdAt, i: id }));
}

export function decodeCursor(cursor: string): { createdAt: string; id: string } | null {
  try {
    const parsed = JSON.parse(atob(cursor));
    if (parsed && typeof parsed.c === "string" && typeof parsed.i === "string") {
      return { createdAt: parsed.c, id: parsed.i };
    }
    return null;
  } catch {
    return null;
  }
}

export function mapRow(row: NotificationRow): InAppNotification {
  const meta = row.metadata || {};
  return {
    id: row.id,
    user_id: row.user_id,
    salon_id: row.salon_id,
    type: row.type as InAppNotificationCategory,
    severity: (meta._severity as NotificationSeverity) || "info",
    source: (meta._source as NotificationSource) ?? null,
    entity: (meta._entity as NotificationEntity) ?? null,
    title: row.title,
    body: row.body,
    read: row.read,
    metadata: row.metadata,
    action_url: row.action_url,
    created_at: row.created_at,
  };
}
