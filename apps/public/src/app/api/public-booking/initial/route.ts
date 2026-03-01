import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function getAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

export async function GET(request: NextRequest) {
  const slug = request.nextUrl.searchParams.get("slug")?.trim();
  if (!slug) {
    return NextResponse.json({ error: "slug is required" }, { status: 400 });
  }

  try {
    const supabase = getAdminClient();

    const { data: salon, error: salonError } = await supabase
      .from("salons")
      .select("id, name, plan, whatsapp_number, supported_languages, default_language, preferred_language, timezone, theme")
      .eq("slug", slug)
      .eq("is_public", true)
      .maybeSingle();

    if (salonError || !salon) {
      return NextResponse.json({ error: "Salon not found" }, { status: 404 });
    }

    const [{ data: services, error: servicesError }, { data: employees, error: employeesError }] = await Promise.all([
      supabase
        .from("services")
        .select("id, name")
        .eq("salon_id", salon.id)
        .eq("is_active", true)
        .order("sort_order", { ascending: true, nullsFirst: false })
        .order("name", { ascending: true })
        .limit(1000),
      supabase
        .from("employees")
        .select("id, full_name")
        .eq("salon_id", salon.id)
        .eq("is_active", true)
        .order("full_name", { ascending: true })
        .limit(1000),
    ]);

    if (servicesError || employeesError) {
      return NextResponse.json(
        {
          error: "Failed to load public booking setup",
          details: {
            services: servicesError?.message ?? null,
            employees: employeesError?.message ?? null,
          },
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        salon,
        services: services ?? [],
        employees: employees ?? [],
      },
      { status: 200 }
    );
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
