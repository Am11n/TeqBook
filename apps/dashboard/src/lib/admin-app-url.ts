/**
 * Base URL of the Admin Next.js app (no trailing slash).
 * Superadmin users are redirected away from the dashboard to this app.
 */
export function getAdminAppBaseUrl(): string | null {
  const raw = process.env.NEXT_PUBLIC_ADMIN_APP_URL?.trim();
  if (!raw) return null;
  try {
    const withProtocol = /^[a-z][a-z0-9+.-]*:\/\//i.test(raw) ? raw : `http://${raw}`;
    const u = new URL(withProtocol);
    const path = u.pathname.replace(/\/$/, "") || "";
    const base = path ? `${u.origin}${path}` : u.origin;
    return base.replace(/\/$/, "");
  } catch {
    return null;
  }
}

/** Admin app sign-in path (separate cookie from dashboard). */
export function getAdminAppSignInUrl(): string | null {
  const base = getAdminAppBaseUrl();
  if (!base) return null;
  return `${base}/login`;
}
