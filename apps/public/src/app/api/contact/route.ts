import { NextRequest, NextResponse } from "next/server";
import { createClientForRouteHandler } from "@/lib/supabase/server";

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
