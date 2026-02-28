import { NextRequest, NextResponse } from "next/server";
import { authenticateAndVerifySalon } from "@/lib/api-auth";
import { handleWaitlistCancellation } from "@/lib/services/waitlist-cancellation";

type Body = {
  salonId?: string;
  serviceId?: string;
  date?: string;
  employeeId?: string | null;
};

export async function POST(request: NextRequest) {
  const response = NextResponse.next();

  try {
    const body = (await request.json()) as Body;
    const salonId = body.salonId?.trim();
    const serviceId = body.serviceId?.trim();
    const date = body.date?.trim();
    const employeeId = body.employeeId?.trim() || null;

    if (!salonId || !serviceId || !date) {
      return NextResponse.json({ error: "salonId, serviceId and date are required" }, { status: 400 });
    }

    const auth = await authenticateAndVerifySalon(request, salonId, response);
    if (auth.error || !auth.user || !auth.hasAccess) {
      return NextResponse.json({ error: auth.error || "Unauthorized" }, { status: !auth.user ? 401 : 403 });
    }

    const result = await handleWaitlistCancellation(salonId, serviceId, date, employeeId);
    return NextResponse.json(result, { status: 200 });
  } catch {
    return NextResponse.json({ error: "Invalid request payload" }, { status: 400 });
  }
}
