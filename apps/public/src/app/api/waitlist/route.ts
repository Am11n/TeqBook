import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { checkRateLimit, incrementRateLimit } from "@/lib/services/rate-limit-service";
import { getRateLimitPolicy } from "@teqbook/shared/services/rate-limit";

type WaitlistPayload = {
  salonId: string;
  serviceId: string;
  employeeId?: string | null;
  preferredDate: string;
  preferredTimeStart?: string | null;
  preferredTimeEnd?: string | null;
  preferenceMode?: "specific_time" | "day_flexible";
  flexWindowMinutes?: number | null;
  customerName: string;
  customerEmail?: string | null;
  customerPhone?: string | null;
};

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;
const TIME_REGEX = /^\d{2}:\d{2}(:\d{2})?$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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

export async function POST(request: NextRequest) {
  const rateLimitPolicy = getRateLimitPolicy("public-waitlist-intake");

  try {
    const body = (await request.json()) as Partial<WaitlistPayload>;
    const payload: WaitlistPayload = {
      salonId: (body.salonId ?? "").trim(),
      serviceId: (body.serviceId ?? "").trim(),
      employeeId: body.employeeId?.trim() || null,
      preferredDate: (body.preferredDate ?? "").trim(),
      preferredTimeStart: body.preferredTimeStart?.trim() || null,
      preferredTimeEnd: body.preferredTimeEnd?.trim() || null,
      preferenceMode:
        body.preferenceMode === "day_flexible" || body.preferenceMode === "specific_time"
          ? body.preferenceMode
          : body.preferredTimeStart
            ? "specific_time"
            : "day_flexible",
      flexWindowMinutes:
        typeof body.flexWindowMinutes === "number" && Number.isFinite(body.flexWindowMinutes)
          ? Math.max(0, Math.min(2880, Math.round(body.flexWindowMinutes)))
          : null,
      customerName: (body.customerName ?? "").trim(),
      customerEmail: body.customerEmail?.trim().toLowerCase() || null,
      customerPhone: body.customerPhone?.trim() || null,
    };

    if (
      !payload.salonId ||
      !payload.serviceId ||
      !payload.preferredDate ||
      !payload.customerName
    ) {
      return NextResponse.json(
        { error: "salonId, serviceId, preferredDate and customerName are required." },
        { status: 400 }
      );
    }

    if (!UUID_REGEX.test(payload.salonId) || !UUID_REGEX.test(payload.serviceId)) {
      return NextResponse.json({ error: "Invalid salonId or serviceId." }, { status: 400 });
    }
    if (payload.employeeId && !UUID_REGEX.test(payload.employeeId)) {
      return NextResponse.json({ error: "Invalid employeeId." }, { status: 400 });
    }
    if (!DATE_REGEX.test(payload.preferredDate)) {
      return NextResponse.json({ error: "preferredDate must be formatted as YYYY-MM-DD." }, { status: 400 });
    }
    if (payload.preferredTimeStart && !TIME_REGEX.test(payload.preferredTimeStart)) {
      return NextResponse.json({ error: "preferredTimeStart must be HH:MM or HH:MM:SS." }, { status: 400 });
    }
    if (payload.preferredTimeEnd && !TIME_REGEX.test(payload.preferredTimeEnd)) {
      return NextResponse.json({ error: "preferredTimeEnd must be HH:MM or HH:MM:SS." }, { status: 400 });
    }
    if (!payload.customerEmail && !payload.customerPhone) {
      return NextResponse.json(
        { error: "Provide at least one contact method: customerEmail or customerPhone." },
        { status: 400 }
      );
    }
    if (payload.customerEmail && !EMAIL_REGEX.test(payload.customerEmail)) {
      return NextResponse.json({ error: "Invalid customerEmail." }, { status: 400 });
    }

    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    const rateLimitIdentifier = payload.customerEmail || ip;
    const rateLimitResult = await checkRateLimit(rateLimitIdentifier, "public-waitlist-intake", {
      identifierType: payload.customerEmail ? "email" : "ip",
      failurePolicy: rateLimitPolicy.failurePolicy,
    });

    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        {
          error: "Rate limit exceeded",
          message: "Too many waitlist requests. Please try again later.",
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

    await incrementRateLimit(rateLimitIdentifier, "public-waitlist-intake", {
      identifierType: payload.customerEmail ? "email" : "ip",
      failurePolicy: rateLimitPolicy.failurePolicy,
    });

    const supabase = getAdminClient();

    const { data: salon, error: salonError } = await supabase
      .from("salons")
      .select("id, is_public")
      .eq("id", payload.salonId)
      .eq("is_public", true)
      .maybeSingle();
    if (salonError || !salon) {
      return NextResponse.json({ error: "Salon is not available for public waitlist." }, { status: 404 });
    }

    const { data: service, error: serviceError } = await supabase
      .from("services")
      .select("id")
      .eq("id", payload.serviceId)
      .eq("salon_id", payload.salonId)
      .eq("is_active", true)
      .maybeSingle();
    if (serviceError || !service) {
      return NextResponse.json({ error: "Service not found for this salon." }, { status: 404 });
    }

    if (payload.employeeId) {
      const { data: employee, error: employeeError } = await supabase
        .from("employees")
        .select("id")
        .eq("id", payload.employeeId)
        .eq("salon_id", payload.salonId)
        .eq("is_active", true)
        .maybeSingle();
      if (employeeError || !employee) {
        return NextResponse.json({ error: "Employee not found for this salon." }, { status: 404 });
      }
    }

    const { data: existing, error: existingError } = await supabase
      .from("waitlist_entries")
      .select("id, status")
      .eq("salon_id", payload.salonId)
      .eq("service_id", payload.serviceId)
      .eq("preferred_date", payload.preferredDate)
      .eq("customer_name", payload.customerName)
      .or(
        payload.customerEmail
          ? `customer_email.eq.${payload.customerEmail},customer_phone.eq.${payload.customerPhone ?? ""}`
          : `customer_phone.eq.${payload.customerPhone ?? ""}`
      )
      .in("status", ["waiting", "notified"])
      .limit(1)
      .maybeSingle();

    if (existingError) {
      return NextResponse.json({ error: "Failed to check existing waitlist entries." }, { status: 500 });
    }
    if (existing) {
      return NextResponse.json({ ok: true, alreadyJoined: true, entryId: existing.id }, { status: 200 });
    }

    const { data: inserted, error: insertError } = await supabase
      .from("waitlist_entries")
      .insert({
        salon_id: payload.salonId,
        service_id: payload.serviceId,
        employee_id: payload.employeeId,
        preferred_date: payload.preferredDate,
        preferred_time_start: payload.preferredTimeStart,
        preferred_time_end: payload.preferredTimeEnd,
        preference_mode: payload.preferenceMode,
        flex_window_minutes:
          payload.flexWindowMinutes ??
          (payload.preferenceMode === "day_flexible" ? 1440 : 0),
        priority_score_snapshot:
          (payload.preferenceMode === "specific_time" ? 10 : 0) -
          (payload.preferenceMode === "specific_time"
            ? 0
            : payload.flexWindowMinutes && payload.flexWindowMinutes <= 120
              ? 5
              : payload.flexWindowMinutes && payload.flexWindowMinutes <= 720
                ? 7
                : 10),
        customer_name: payload.customerName,
        customer_email: payload.customerEmail,
        customer_phone: payload.customerPhone,
        status: "waiting",
      })
      .select("id, status")
      .single();

    if (insertError || !inserted) {
      return NextResponse.json({ error: "Could not create waitlist entry right now." }, { status: 500 });
    }

    return NextResponse.json(
      { ok: true, alreadyJoined: false, entryId: inserted.id, status: inserted.status },
      { status: 201 }
    );
  } catch {
    return NextResponse.json({ error: "Invalid request payload." }, { status: 400 });
  }
}
