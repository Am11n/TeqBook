"use client";

import { useCallback, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  bookingRescheduleMessages,
  resolveBookingRescheduleLocale,
  type BookingRescheduleCopy,
} from "@/i18n/booking-reschedule-messages";
import type { AppLocale } from "@/i18n/translation-types";

function messageForStatus(status: string | undefined, m: BookingRescheduleCopy, ok: boolean): string {
  if (ok && status === "accepted") return m.successAccepted;
  if (ok && status === "declined") return m.successDeclined;
  switch (status) {
    case "proposal_expired":
      return m.errorExpired;
    case "proposal_superseded":
      return m.errorSuperseded;
    case "failed_slot_taken":
      return m.errorSlotTaken;
    case "proposal_already_accepted":
      return m.errorAlreadyAccepted;
    case "proposal_already_declined":
      return m.errorAlreadyDeclined;
    case "invalid_token":
      return m.errorInvalid;
    default:
      return m.errorGeneric;
  }
}

export default function BookingReschedulePageClient() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token")?.trim() ?? "";

  const locale: AppLocale = useMemo(() => {
    if (typeof navigator !== "undefined" && navigator.language) {
      return resolveBookingRescheduleLocale(navigator.language);
    }
    return "en";
  }, []);

  const m = bookingRescheduleMessages[locale] ?? bookingRescheduleMessages.en;

  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState<{ ok: boolean; resultStatus?: string } | null>(null);

  const submit = useCallback(
    async (action: "accept" | "decline") => {
      if (!token) return;
      setLoading(true);
      try {
        const res = await fetch("/api/booking/reschedule", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token, action, channel: "email_link" }),
        });
        const json = (await res.json()) as {
          ok?: boolean;
          resultStatus?: string;
          error?: string;
          message?: string;
        };
        setDone({
          ok: Boolean(json.ok),
          resultStatus: json.resultStatus ?? (res.ok ? undefined : "error"),
        });
      } catch {
        setDone({ ok: false, resultStatus: undefined });
      } finally {
        setLoading(false);
      }
    },
    [token],
  );

  if (!token) {
    return (
      <div className="min-h-screen bg-background">
        <div className="mx-auto max-w-md space-y-3 px-4 py-16 text-center">
          <h1 className="text-xl font-semibold text-foreground">{m.title}</h1>
          <p className="text-sm text-muted-foreground">{m.missingToken}</p>
        </div>
      </div>
    );
  }

  if (done) {
    const text = messageForStatus(done.resultStatus, m, done.ok);
    return (
      <div className="min-h-screen bg-background">
        <div className="mx-auto max-w-md space-y-3 px-4 py-16 text-center">
          <h1 className="text-xl font-semibold text-foreground">{m.title}</h1>
          <p className="text-sm text-foreground">{text}</p>
          <p className="text-xs text-muted-foreground">{m.contactSalon}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-md space-y-6 px-4 py-16 text-center">
        <h1 className="text-xl font-semibold text-foreground">{m.title}</h1>
        <p className="text-sm text-muted-foreground">{m.description}</p>
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button type="button" disabled={loading} onClick={() => submit("accept")}>
            {loading ? m.working : m.accept}
          </Button>
          <Button type="button" variant="outline" disabled={loading} onClick={() => submit("decline")}>
            {loading ? m.working : m.decline}
          </Button>
        </div>
      </div>
    </div>
  );
}
