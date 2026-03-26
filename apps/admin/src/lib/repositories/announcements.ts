import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  Announcement,
  AnnouncementInput,
  AnnouncementListFilters,
} from "@/lib/types/announcements";

function normalizeInput(input: AnnouncementInput) {
  return {
    title: input.title.trim(),
    body: input.body.trim(),
    is_pinned: Boolean(input.is_pinned),
  };
}

export async function listAnnouncements(
  client: SupabaseClient,
  filters: AnnouncementListFilters = {}
): Promise<{ data: Announcement[]; error: string | null }> {
  let query = client
    .from("announcements")
    .select("*")
    .order("is_pinned", { ascending: false })
    .order("updated_at", { ascending: false });

  if (filters.status && filters.status !== "all") {
    query = query.eq("status", filters.status);
  }

  const { data, error } = await query;
  return {
    data: (data as Announcement[] | null) ?? [],
    error: error?.message ?? null,
  };
}

export async function getAnnouncementById(
  client: SupabaseClient,
  id: string
): Promise<{ data: Announcement | null; error: string | null }> {
  const { data, error } = await client.from("announcements").select("*").eq("id", id).single();
  return {
    data: (data as Announcement | null) ?? null,
    error: error?.message ?? null,
  };
}

export async function createAnnouncement(
  client: SupabaseClient,
  userId: string,
  input: AnnouncementInput
): Promise<{ data: Announcement | null; error: string | null }> {
  const normalized = normalizeInput(input);
  const { data, error } = await client
    .from("announcements")
    .insert({
      scope_type: "global",
      status: "draft",
      created_by: userId,
      updated_by: userId,
      ...normalized,
    })
    .select("*")
    .single();

  return {
    data: (data as Announcement | null) ?? null,
    error: error?.message ?? null,
  };
}

export async function updateAnnouncement(
  client: SupabaseClient,
  id: string,
  userId: string,
  input: AnnouncementInput
): Promise<{ data: Announcement | null; error: string | null }> {
  const normalized = normalizeInput(input);
  const { data, error } = await client
    .from("announcements")
    .update({
      ...normalized,
      updated_by: userId,
    })
    .eq("id", id)
    .select("*")
    .single();

  return {
    data: (data as Announcement | null) ?? null,
    error: error?.message ?? null,
  };
}

export async function publishAnnouncement(
  client: SupabaseClient,
  id: string,
  userId: string
): Promise<{ data: Announcement | null; error: string | null }> {
  const { data, error } = await client
    .from("announcements")
    .update({
      status: "published",
      published_at: new Date().toISOString(),
      updated_by: userId,
    })
    .eq("id", id)
    .select("*")
    .single();

  return {
    data: (data as Announcement | null) ?? null,
    error: error?.message ?? null,
  };
}

export async function unpublishAnnouncement(
  client: SupabaseClient,
  id: string,
  userId: string
): Promise<{ data: Announcement | null; error: string | null }> {
  const { data, error } = await client
    .from("announcements")
    .update({
      status: "draft",
      updated_by: userId,
    })
    .eq("id", id)
    .select("*")
    .single();

  return {
    data: (data as Announcement | null) ?? null,
    error: error?.message ?? null,
  };
}
