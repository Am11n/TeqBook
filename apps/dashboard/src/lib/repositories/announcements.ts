import { supabase } from "@/lib/supabase-client";
import type { DashboardAnnouncement } from "@/lib/types/announcements";

export async function listPublishedAnnouncements(): Promise<{
  data: DashboardAnnouncement[];
  error: string | null;
}> {
  const { data, error } = await supabase
    .from("announcements")
    .select("id, title, body, is_pinned, published_at, updated_at")
    .eq("status", "published")
    .order("is_pinned", { ascending: false })
    .order("updated_at", { ascending: false })
    .limit(10);

  return {
    data: (data as DashboardAnnouncement[] | null) ?? [],
    error: error?.message ?? null,
  };
}
