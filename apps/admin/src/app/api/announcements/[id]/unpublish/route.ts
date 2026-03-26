import { NextResponse } from "next/server";
import { createClient as createAdminAppClient } from "@/lib/supabase/server";
import { unpublishAnnouncement } from "@/lib/repositories/announcements";

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
  const { data, error } = await unpublishAnnouncement(auth.client, id, auth.user.id);
  if (error) return NextResponse.json({ error }, { status: 500 });
  return NextResponse.json({ data });
}
