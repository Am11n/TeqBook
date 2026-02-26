import { NextRequest, NextResponse } from "next/server";
import { createClientForRouteHandler } from "@/lib/supabase/server";
import { checkRateLimit, incrementRateLimit } from "@/lib/services/rate-limit-service";
import { getRateLimitPolicy } from "@teqbook/shared/services/rate-limit";

type ContactPayload = {
  name: string;
  email: string;
  message: string;
  consent: boolean;
};

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function POST(request: NextRequest) {
  const response = NextResponse.next();
  const rateLimitPolicy = getRateLimitPolicy("public-contact");

  try {
    const body = (await request.json()) as Partial<ContactPayload>;
    const name = (body.name ?? "").trim();
    const email = (body.email ?? "").trim().toLowerCase();
    const message = (body.message ?? "").trim();
    const consent = body.consent === true;

    if (!name || !email || !message) {
      return NextResponse.json(
        { error: "Name, email and message are required." },
        { status: 400 },
      );
    }

    if (!consent) {
      return NextResponse.json(
        { error: "You must consent before sending this form." },
        { status: 400 },
      );
    }

    if (name.length > 100 || email.length > 200 || message.length > 2000) {
      return NextResponse.json(
        { error: "One or more fields exceeded the maximum allowed length." },
        { status: 400 },
      );
    }

    if (!isValidEmail(email)) {
      return NextResponse.json({ error: "Invalid email address." }, { status: 400 });
    }

    const ipIdentifier = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    const rateLimitIdentifier = email || ipIdentifier;
    const rateLimitIdentifierType = email ? "email" : "ip";
    const rateLimitResult = await checkRateLimit(rateLimitIdentifier, "public-contact", {
      identifierType: rateLimitIdentifierType,
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

    await incrementRateLimit(rateLimitIdentifier, "public-contact", {
      identifierType: rateLimitIdentifierType,
      failurePolicy: rateLimitPolicy.failurePolicy,
    });

    const supabase = createClientForRouteHandler(request, response);
    const { error } = await supabase.from("contact_submissions").insert({
      name,
      email,
      message,
      consent,
    });

    if (error) {
      return NextResponse.json(
        { error: "Could not save your message right now. Please try again." },
        { status: 500 },
      );
    }

    const jsonResponse = NextResponse.json(
      { ok: true, message: "Thanks! Your message was sent successfully." },
      { status: 201 },
    );

    response.cookies.getAll().forEach((cookie) => {
      jsonResponse.cookies.set(cookie.name, cookie.value, cookie);
    });

    return jsonResponse;
  } catch {
    return NextResponse.json(
      { error: "Invalid request payload." },
      { status: 400 },
    );
  }
}
