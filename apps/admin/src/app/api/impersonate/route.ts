import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { checkRateLimit, incrementRateLimit } from "@/lib/services/rate-limit-service";
import { getRateLimitPolicy } from "@teqbook/shared/services/rate-limit";

export async function GET(request: NextRequest) {
  const rateLimitPolicy = getRateLimitPolicy("admin-impersonate");
  const salonId = request.nextUrl.searchParams.get("salon_id");
  if (!salonId) {
    return NextResponse.json({ error: "salon_id required" }, { status: 400 });
  }

  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify superadmin
    const { data: profile } = await supabase
      .from("profiles")
      .select("is_superadmin")
      .eq("user_id", user.id)
      .single();

    if (!profile?.is_superadmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const rateLimitResult = await checkRateLimit(user.id, "admin-impersonate", {
      identifierType: "user_id",
      failurePolicy: rateLimitPolicy.failurePolicy,
    });

    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        {
          error: "Rate limit exceeded",
          message: "Too many requests. Please try again later.",
        },
        {
          status: 429,
          headers: {
            "X-RateLimit-Limit": rateLimitPolicy.maxAttempts.toString(),
            "X-RateLimit-Remaining": rateLimitResult.remainingAttempts.toString(),
            "X-RateLimit-Reset": rateLimitResult.resetTime
              ? Math.ceil(rateLimitResult.resetTime / 1000).toString()
              : Math.ceil((Date.now() + rateLimitPolicy.windowMs) / 1000).toString(),
            "Retry-After": rateLimitResult.resetTime
              ? Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000).toString()
              : Math.ceil(rateLimitPolicy.windowMs / 1000).toString(),
          },
        }
      );
    }

    await incrementRateLimit(user.id, "admin-impersonate", {
      identifierType: "user_id",
      failurePolicy: rateLimitPolicy.failurePolicy,
    });

    // Fetch salon data (read-only)
    const [salon, employees, bookings, services] = await Promise.all([
      supabase.from("salons").select("*").eq("id", salonId).single(),
      supabase.from("employees").select("id, name, role").eq("salon_id", salonId),
      supabase.from("bookings").select("id, status, created_at").eq("salon_id", salonId).order("created_at", { ascending: false }).limit(20),
      supabase.from("services").select("id, name, price, duration").eq("salon_id", salonId),
    ]);

    // Log impersonation
    await supabase.from("security_audit_log").insert({
      user_id: user.id,
      salon_id: salonId,
      action: "impersonation_api_access",
      resource_type: "admin",
      metadata: { admin_email: user.email },
    });

    return NextResponse.json({
      salon: salon.data,
      employees: employees.data ?? [],
      bookings: bookings.data ?? [],
      services: services.data ?? [],
    });
  } catch {
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
