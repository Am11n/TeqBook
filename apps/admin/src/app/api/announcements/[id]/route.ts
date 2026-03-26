import { NextResponse } from "next/server";
import { createClient as createAdminAppClient } from "@/lib/supabase/server";
import {
  getAnnouncementById,
  updateAnnouncement,
} from "@/lib/repositories/announcements";
import type { AnnouncementInput } from "@/lib/types/announcements";

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

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireSuperAdmin();
  if (auth.error) return auth.error;

  const { id } = await params;
  const { data, error } = await getAnnouncementById(auth.client, id);
  if (error) return NextResponse.json({ error }, { status: 500 });
  if (!data) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ data });
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireSuperAdmin();
  if (auth.error || !auth.user) return auth.error!;

  const { id } = await params;
  const body = (await request.json()) as Partial<AnnouncementInput>;
  const title = body.title?.trim() ?? "";
  const content = body.body?.trim() ?? "";
  if (!title || !content) {
    return NextResponse.json(
      { error: "Publish requires non-empty title and body." },
      { status: 400 }
    );
  }

  const { data, error } = await updateAnnouncement(auth.client, id, auth.user.id, {
    title,
    body: content,
    is_pinned: Boolean(body.is_pinned),
  });
  if (error) return NextResponse.json({ error }, { status: 500 });
  return NextResponse.json({ data });
}
