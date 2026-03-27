import type {
  Announcement,
  AnnouncementInput,
  AnnouncementListFilters,
} from "@/lib/types/announcements";

function getApiPrefix(): string {
  if (typeof window === "undefined") return "/api";

  const path = window.location.pathname;
  if (path === "/admin" || path.startsWith("/admin/")) {
    return "/admin/api";
  }
  return "/api";
}

async function unwrap<T>(res: Response): Promise<{ data: T | null; error: string | null }> {
  const json = (await res.json()) as { data?: T; error?: string };
  if (!res.ok) return { data: null, error: json.error ?? `Request failed (${res.status})` };
  return { data: json.data ?? null, error: null };
}

export async function listAnnouncements(
  filters: AnnouncementListFilters = {}
): Promise<{ data: Announcement[]; error: string | null }> {
  const apiPrefix = getApiPrefix();
  const params = new URLSearchParams();
  if (filters.status && filters.status !== "all") params.set("status", filters.status);
  const query = params.toString();
  const res = await fetch(`${apiPrefix}/announcements/${query ? `?${query}` : ""}`);
  const { data, error } = await unwrap<Announcement[]>(res);
  return { data: data ?? [], error };
}

export async function getAnnouncementById(id: string) {
  const apiPrefix = getApiPrefix();
  const res = await fetch(`${apiPrefix}/announcements/${id}/`);
  return unwrap<Announcement>(res);
}

export async function createAnnouncement(input: AnnouncementInput) {
  const apiPrefix = getApiPrefix();
  const res = await fetch(`${apiPrefix}/announcements/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  return unwrap<Announcement>(res);
}

export async function updateAnnouncement(id: string, input: AnnouncementInput) {
  const apiPrefix = getApiPrefix();
  const res = await fetch(`${apiPrefix}/announcements/${id}/`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  return unwrap<Announcement>(res);
}

export async function publishAnnouncement(id: string) {
  const apiPrefix = getApiPrefix();
  const res = await fetch(`${apiPrefix}/announcements/${id}/publish/`, { method: "POST" });
  return unwrap<Announcement>(res);
}

export async function unpublishAnnouncement(id: string) {
  const apiPrefix = getApiPrefix();
  const res = await fetch(`${apiPrefix}/announcements/${id}/unpublish/`, { method: "POST" });
  return unwrap<Announcement>(res);
}
