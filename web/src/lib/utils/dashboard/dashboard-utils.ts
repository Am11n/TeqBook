/**
 * Format time string to readable format
 */
export function formatTime(timeString: string): string {
  const date = new Date(timeString);
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

/**
 * Get initials from name
 */
export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

/**
 * Get owner name from email
 */
export function getOwnerNameFromEmail(email: string | null | undefined): string {
  if (!email) return "";
  const name = email.split("@")[0];
  return name.charAt(0).toUpperCase() + name.slice(1);
}
