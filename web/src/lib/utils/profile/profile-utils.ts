/**
 * Get initials from name or email
 */
export function getInitials(
  firstName: string | null | undefined,
  lastName: string | null | undefined,
  userEmail: string | null | undefined
): string {
  if (firstName && lastName) {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  }
  if (userEmail) {
    const name = userEmail.split("@")[0];
    return name.charAt(0).toUpperCase() + (name.length > 1 ? name.charAt(1).toUpperCase() : "");
  }
  return "U";
}

