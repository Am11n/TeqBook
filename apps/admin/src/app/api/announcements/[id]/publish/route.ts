import { NextResponse } from "next/server";
import { createClient as createAdminAppClient } from "@/lib/supabase/server";
import {
  getAnnouncementById,
  publishAnnouncement,
} from "@/lib/repositories/announcements";

async function requireSuperAdmin() {
  const client = await createAdminAppClient();
  const {
    data: { user },
  } = await client.auth.getUser();
  if (!user) {
    return { client, user: null, error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }
  const { data: profile, error: profileError } = await client
    .from("profiles")
    .select("is_superadmin")
    .eq("user_id", user.id)
    .maybeSingle();
  if (profileError || !profile?.is_superadmin) {
    return { client, user: null, error: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
  }
  return { client, user, error: null as NextResponse<unknown> | null };
}

export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireSuperAdmin();
  if (auth.error || !auth.user) return auth.error!;

  const { id } = await params;
  const current = await getAnnouncementById(auth.client, id);
  if (current.error) return NextResponse.json({ error: current.error }, { status: 500 });
  if (!current.data) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (!current.data.title.trim() || !current.data.body.trim()) {
    return NextResponse.json(
      { error: "Publish requires non-empty title and body." },
      { status: 400 }
    );
  }

  const { data, error } = await publishAnnouncement(auth.client, id, auth.user.id);
  if (error) return NextResponse.json({ error }, { status: 500 });
  return NextResponse.json({ data });
}
