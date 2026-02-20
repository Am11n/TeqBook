import type {
  InAppNotificationCategory,
  NotificationSeverity,
  CreateInAppNotificationInput,
} from "@/lib/types/notifications";
import {
  ALL_NOTIFICATION_CATEGORIES,
  NOTIFICATION_ENTITY_TYPES,
} from "@/lib/types/notifications";

export const VALID_SEVERITIES: NotificationSeverity[] = ["info", "warning", "critical"];

export const UNSAFE_URL_PATTERNS = [
  /^https?:/i,
  /^\/\//,
  /^javascript:/i,
  /^data:/i,
  /^vbscript:/i,
];

export function isSafeActionUrl(url: string | null | undefined): boolean {
  if (!url) return true;
  return url.startsWith("/") && !UNSAFE_URL_PATTERNS.some((p) => p.test(url));
}

export function validateNotificationInput(
  input: CreateInAppNotificationInput
): string | null {
  if (!input.user_id) return "user_id is required";
  if (!input.type) return "type is required";
  if (!input.title?.trim()) return "title is required";
  if (!input.body?.trim()) return "body is required";
  if (!ALL_NOTIFICATION_CATEGORIES.includes(input.type as InAppNotificationCategory)) {
    return `Invalid type: ${input.type}. Valid: ${ALL_NOTIFICATION_CATEGORIES.join(", ")}`;
  }
  if (input.metadata?._severity) {
    const sev = input.metadata._severity as string;
    if (!VALID_SEVERITIES.includes(sev as NotificationSeverity)) {
      return `Invalid severity: ${sev}`;
    }
  }
  if (input.metadata?._entity) {
    const ent = input.metadata._entity as string;
    if (!NOTIFICATION_ENTITY_TYPES.includes(ent as import("@/lib/types/notifications").NotificationEntityType)) {
      return `Invalid entity: ${ent}`;
    }
  }
  if (!isSafeActionUrl(input.action_url)) {
    return `Unsafe action_url: ${input.action_url}`;
  }
  return null;
}
