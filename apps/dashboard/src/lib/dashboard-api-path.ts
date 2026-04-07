/**
 * Prefix same-origin `fetch()` paths so they hit this app when it uses a Next.js `basePath`
 * (e.g. `/dashboard` on Vercel, or behind teqbook.com/dashboard rewrites).
 * A bare `/api/...` resolves against the site origin root and will call the **public** app, not dashboard.
 */
export function dashboardApiPath(path: string): string {
  const base = (process.env.NEXT_PUBLIC_DASHBOARD_BASE_PATH || "").replace(/\/$/, "");
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return base ? `${base}${normalized}` : normalized;
}
