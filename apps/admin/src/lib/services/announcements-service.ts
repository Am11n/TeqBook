import type {
  Announcement,
  AnnouncementInput,
  AnnouncementListFilters,
} from "@/lib/types/announcements";

async function unwrap<T>(res: Response): Promise<{ data: T | null; error: string | null }> {
  const json = (await res.json()) as { data?: T; error?: string };
  if (!res.ok) return { data: null, error: json.error ?? `Request failed (${res.status})` };
  return { data: json.data ?? null, error: null };
}

export async function listAnnouncements(
  filters: AnnouncementListFilters = {}
): Promise<{ data: Announcement[]; error: string | null }> {
  const params = new URLSearchParams();
  if (filters.status && filters.status !== "all") params.set("status", filters.status);
  const query = params.toString();
  const res = await fetch(`/api/announcements/${query ? `?${query}` : ""}`);
  const { data, error } = await unwrap<Announcement[]>(res);
  return { data: data ?? [], error };
}

export async function getAnnouncementById(id: string) {
  const res = await fetch(`/api/announcements/${id}/`);
  return unwrap<Announcement>(res);
}

export async function createAnnouncement(input: AnnouncementInput) {
  const res = await fetch("/api/announcements/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  return unwrap<Announcement>(res);
}

export async function updateAnnouncement(id: string, input: AnnouncementInput) {
  const res = await fetch(`/api/announcements/${id}/`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  return unwrap<Announcement>(res);
}

export async function publishAnnouncement(id: string) {
  const res = await fetch(`/api/announcements/${id}/publish/`, { method: "POST" });
  return unwrap<Announcement>(res);
}

export async function unpublishAnnouncement(id: string) {
  const res = await fetch(`/api/announcements/${id}/unpublish/`, { method: "POST" });
  return unwrap<Announcement>(res);
}
