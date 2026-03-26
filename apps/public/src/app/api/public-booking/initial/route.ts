import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";
export const revalidate = 0;

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
      .select("id, name, plan, whatsapp_number, supported_languages, default_language, preferred_language, timezone, theme, theme_pack_id, theme_pack_version, theme_pack_hash, theme_pack_snapshot, theme_overrides")
      .eq("slug", slug)
      .eq("is_public", true)
      .maybeSingle();

    if (salonError || !salon) {
      return NextResponse.json({ error: "Salon not found" }, { status: 404 });
    }

    const [{ data: services, error: servicesError }, { data: employees, error: employeesError }] = await Promise.all([
      supabase
        .from("services")
        .select("id, name, duration_minutes, price_cents")
        .eq("salon_id", salon.id)
        .eq("is_active", true)
        .order("sort_order", { ascending: true, nullsFirst: false })
        .order("name", { ascending: true })
        .limit(1000),
      supabase
        .from("employees")
        .select("id, full_name, profile_image_url, public_title, role")
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

    const employeeIds = (employees ?? []).map((employee) => employee.id);
    const activeServiceIds = (services ?? []).map((service) => service.id);
    let employeeShiftWeekdays: Record<string, number[]> = {};
    let employeeServiceMap: Record<string, string[]> = {};

    if (employeeIds.length > 0) {
      const { data: shiftRows, error: shiftsError } = await supabase
        .from("shifts")
        .select("employee_id, weekday")
        .eq("salon_id", salon.id)
        .in("employee_id", employeeIds);

      if (shiftsError) {
        return NextResponse.json(
          {
            error: "Failed to load public booking setup",
            details: {
              shifts: shiftsError.message,
            },
          },
          { status: 500 }
        );
      }

      employeeShiftWeekdays = (shiftRows ?? []).reduce<Record<string, number[]>>((acc, row) => {
        const employeeId = row.employee_id as string;
        const weekday = Number(row.weekday);
        if (!Number.isInteger(weekday) || weekday < 0 || weekday > 6) return acc;
        if (!acc[employeeId]) acc[employeeId] = [];
        if (!acc[employeeId].includes(weekday)) acc[employeeId].push(weekday);
        return acc;
      }, {});

      if (activeServiceIds.length > 0) {
        const { data: employeeServiceRows, error: employeeServicesError } = await supabase
          .from("employee_services")
          .select("employee_id, service_id")
          .eq("salon_id", salon.id)
          .in("employee_id", employeeIds)
          .in("service_id", activeServiceIds);

        if (employeeServicesError) {
          return NextResponse.json(
            {
              error: "Failed to load public booking setup",
              details: {
                employee_services: employeeServicesError.message,
              },
            },
            { status: 500 }
          );
        }

        employeeServiceMap = (employeeServiceRows ?? []).reduce<Record<string, string[]>>((acc, row) => {
          const employeeId = String(row.employee_id || "");
          const serviceId = String(row.service_id || "");
          if (!employeeId || !serviceId) return acc;
          if (!acc[employeeId]) acc[employeeId] = [];
          if (!acc[employeeId].includes(serviceId)) acc[employeeId].push(serviceId);
          return acc;
        }, {});
      }
    }

    return NextResponse.json(
      {
        salon,
        services: services ?? [],
        employees: employees ?? [],
        employeeShiftWeekdays,
        employeeServiceMap,
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
          Pragma: "no-cache",
          Expires: "0",
        },
      }
    );
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
