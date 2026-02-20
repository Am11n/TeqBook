export const STATUS_BADGE_CLASSES: Record<string, string> = {
  confirmed: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
  pending: "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300",
  completed: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
  cancelled: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300",
  "no-show": "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300",
};

export function getStatusBadgeClass(status: string): string {
  return STATUS_BADGE_CLASSES[status] ?? "bg-gray-100 text-gray-700";
}

export function formatDuration(service: {
  duration_minutes?: number | null;
  prep_minutes?: number | null;
  cleanup_minutes?: number | null;
}): string | null {
  if (!service.duration_minutes) return null;
  const parts: string[] = [];
  if (service.prep_minutes) parts.push(`${service.prep_minutes}+`);
  parts.push(String(service.duration_minutes));
  if (service.cleanup_minutes) parts.push(`+${service.cleanup_minutes}`);
  return `${parts.join("")}min`;
}

export const PROBLEM_BADGES: Record<string, { label: string; className: string }> = {
  conflict: { label: "Conflict detected", className: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300" },
  unpaid: { label: "Unpaid", className: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300" },
  unconfirmed: { label: "Not confirmed", className: "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300" },
  missing_contact: { label: "Missing phone", className: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300" },
};
