"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { getSalonBySlugForPublic } from "@/lib/services/salons-service";
import { cancelBooking } from "@/lib/services/bookings-service";
import { useLocale } from "@/components/locale-provider";
import { CheckCircle, XCircle, Calendar, Clock, User, Scissors, X } from "lucide-react";
import type { Booking } from "@/lib/types";
import { type Salon, createDateFormatter, createTimeFormatter } from "./confirmation-types";
import { buildPublicBookingTokens, computeEffectiveBranding } from "@/components/public-booking/publicBookingUtils";
import { trackPublicEvent } from "@/components/public-booking/publicBookingTelemetry";
import { normalizeLocale } from "@/i18n/normalizeLocale";
import { getPublicPageTranslations } from "@/i18n/public-pages/translations";
import type { BookingConfirmationMessages } from "@/i18n/translation-types";
import { resolvePublicBookingUiLocale } from "@/components/public-booking/resolvePublicBookingUiLocale";

function formatTemplate(template: string, replacements: Record<string, string | number>): string {
  return Object.entries(replacements).reduce(
    (out, [key, value]) => out.replaceAll(`{{${key}}}`, String(value)),
    template,
  );
}

function pendingBookingEmailKey(bookingId: string) {
  return `teqbook-pending-booking-email-${bookingId}`;
}

function readCustomerEmail(booking: Booking | null): string | null {
  const bookingCustomers = booking?.customers as { email?: string | null } | null | undefined;
  const raw = bookingCustomers?.email?.trim().toLowerCase();
  return raw || null;
}

function labelBookingStatus(status: string | undefined, t: BookingConfirmationMessages): string {
  const raw = (status ?? "confirmed").toLowerCase().replace(/\s+/g, "-");
  switch (raw) {
    case "confirmed":
      return t.statusConfirmed;
    case "cancelled":
      return t.statusCancelled;
    case "pending":
      return t.statusPending;
    case "completed":
      return t.statusCompleted;
    case "scheduled":
      return t.statusScheduled;
    case "no-show":
      return t.statusNoShow;
    default:
      return status ?? t.statusConfirmed;
  }
}

export default function BookingConfirmationPageClient({ salonSlug }: { salonSlug: string }) {
  const { locale, setLocale } = useLocale();
  const appLocale = normalizeLocale(locale);
  const t = getPublicPageTranslations(appLocale).bookingConfirmation;
  const router = useRouter();
  const searchParams = useSearchParams();
  const [slug] = useState<string>(salonSlug);
  const bookingId = searchParams.get("bookingId") || searchParams.get("id");
  const urlActionToken = searchParams.get("actionToken");

  const [salon, setSalon] = useState<Salon | null>(null);
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [bookingDetailsError, setBookingDetailsError] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState(false);
  const [showCancelForm, setShowCancelForm] = useState(false);
  const [cancellationReason, setCancellationReason] = useState("");

  const [confirmationToken, setConfirmationToken] = useState<string | null>(null);
  const [sessionTokens, setSessionTokens] = useState<{ notify: string; cancel: string } | null>(null);
  const [pendingCustomerEmail, setPendingCustomerEmail] = useState<string | null>(null);

  const [proofCode, setProofCode] = useState("");
  const [proofSubmitting, setProofSubmitting] = useState(false);
  const [proofError, setProofError] = useState<string | null>(null);
  const [resendBusy, setResendBusy] = useState(false);
  const [resendCooldownSeconds, setResendCooldownSeconds] = useState(0);
  const [remainingAttempts, setRemainingAttempts] = useState<number | null>(null);

  const [cancelProofCode, setCancelProofCode] = useState("");
  const notificationsSentRef = useRef(false);

  useEffect(() => {
    if (resendCooldownSeconds <= 0) return;
    const id = window.setInterval(() => {
      setResendCooldownSeconds((prev) => (prev <= 1 ? 0 : prev - 1));
    }, 1000);
    return () => window.clearInterval(id);
  }, [resendCooldownSeconds]);

  useEffect(() => {
    if (urlActionToken) {
      setConfirmationToken(urlActionToken);
    }
  }, [urlActionToken]);

  useEffect(() => {
    notificationsSentRef.current = false;
  }, [bookingId]);

  useEffect(() => {
    async function loadSalonAndGate() {
      if (!bookingId || !slug) {
        setError(t.bookingNotFound);
        setLoading(false);
        return;
      }

      try {
        const { data: salonData, error: salonError } = await getSalonBySlugForPublic(slug);
        if (salonError || !salonData) {
          setError(salonError || t.bookingNotFound);
          setLoading(false);
          return;
        }
        const uiLocale = resolvePublicBookingUiLocale(salonData);
        if (uiLocale) setLocale(uiLocale);

        setSalon({
          id: salonData.id,
          name: salonData.name,
          plan: salonData.plan || "starter",
          whatsapp_number: salonData.whatsapp_number || null,
          supported_languages: salonData.supported_languages ?? null,
          default_language: salonData.default_language ?? null,
          preferred_language: salonData.preferred_language ?? null,
          timezone: salonData.timezone || null,
          theme: salonData.theme ?? null,
          theme_pack_id: salonData.theme_pack_id ?? null,
          theme_pack_version: salonData.theme_pack_version ?? null,
          theme_pack_hash: salonData.theme_pack_hash ?? null,
          theme_pack_snapshot: salonData.theme_pack_snapshot ?? null,
          theme_overrides: salonData.theme_overrides ?? null,
        });

        if (!urlActionToken) {
          const stored =
            typeof window !== "undefined" ? sessionStorage.getItem(pendingBookingEmailKey(bookingId)) : null;
          if (!stored) {
            setError(t.verifyMissingEmailSession);
          } else {
            setPendingCustomerEmail(stored);
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : t.bookingNotFound);
      } finally {
        setLoading(false);
      }
    }

    loadSalonAndGate();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- omit `t` to avoid refetch when locale updates after salon load
  }, [bookingId, setLocale, slug, urlActionToken]);

  useEffect(() => {
    if (!salon || !bookingId || !confirmationToken) {
      return;
    }

    const salonRow = salon;
    let cancelled = false;
    async function loadBookingDetails() {
      setDetailsLoading(true);
      setBookingDetailsError(null);
      try {
        const confirmationResponse = await fetch("/api/public-booking/confirmation", {
          method: "POST",
          headers: { Accept: "application/json", "Content-Type": "application/json" },
          body: JSON.stringify({ slug, bookingId, actionToken: confirmationToken }),
        });
        const confirmationPayload = await confirmationResponse.json().catch(() => null) as
          | { booking?: (Booking & { salon_id: string }) | null; error?: string }
          | null;

        if (cancelled) return;

        if (!confirmationResponse.ok || !confirmationPayload?.booking) {
          setBookingDetailsError(confirmationPayload?.error || t.loadBookingDetailsError);
        } else if (confirmationPayload.booking.salon_id !== salonRow.id) {
          setBookingDetailsError(t.bookingFromAnotherSalonError);
        } else {
          setBooking(confirmationPayload.booking as Booking);
        }
      } catch {
        if (!cancelled) {
          setBookingDetailsError(t.loadBookingDetailsError);
        }
      } finally {
        if (!cancelled) {
          setDetailsLoading(false);
        }
      }
    }

    void loadBookingDetails();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- omit `t`
  }, [bookingId, confirmationToken, salon, slug]);

  useEffect(() => {
    if (!booking || !salon || !confirmationToken || notificationsSentRef.current) {
      return;
    }
    const email = readCustomerEmail(booking);
    if (!email) {
      return;
    }

    notificationsSentRef.current = true;
    const language = salon.preferred_language || "en";
    const payload =
      sessionTokens?.notify != null
        ? {
            bookingId: booking.id,
            salonId: salon.id,
            customerEmail: email,
            language,
            actionToken: sessionTokens.notify,
          }
        : {
            bookingId: booking.id,
            salonId: salon.id,
            customerEmail: email,
            language,
            confirmationActionToken: confirmationToken,
          };

    void fetch("/api/bookings/send-notifications/", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  }, [booking, confirmationToken, salon, sessionTokens]);

  useEffect(() => {
    if (!salon?.id || !bookingId) return;
    if (booking?.status === "cancelled") return;

    trackPublicEvent("booking_completed", {
      salon_slug: slug,
      salon_id: salon.id,
      booking_id: bookingId,
      step: "confirmation",
    });
  }, [booking?.status, bookingId, salon?.id, slug]);

  async function handleResendProof(email: string) {
    if (!salon || !bookingId) return;
    setResendBusy(true);
    setProofError(null);
    setRemainingAttempts(null);
    try {
      const res = await fetch("/api/public-booking/request-proof", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId, salonId: salon.id, customerEmail: email }),
      });
      const body = (await res.json().catch(() => null)) as
        | { error?: string; retryAfterSec?: number; resendAvailableInSec?: number }
        | null;
      if (!res.ok) {
        const retryAfterHeader = Number.parseInt(res.headers.get("Retry-After") ?? "", 10);
        const retryAfterSec = body?.retryAfterSec ?? (Number.isFinite(retryAfterHeader) ? retryAfterHeader : 0);
        if (retryAfterSec > 0) {
          setResendCooldownSeconds(retryAfterSec);
          setProofError(formatTemplate(t.verifyRetryInSeconds, { seconds: retryAfterSec }));
        } else {
          setProofError(body?.error || t.verifyInvalidOrExpired);
        }
        return;
      }
      if (body?.resendAvailableInSec && body.resendAvailableInSec > 0) {
        setResendCooldownSeconds(body.resendAvailableInSec);
      }
    } catch {
      setProofError(t.verifyInvalidOrExpired);
    } finally {
      setResendBusy(false);
    }
  }

  async function handleVerifyEmailOtp(e: FormEvent) {
    e.preventDefault();
    if (!salon || !bookingId || !pendingCustomerEmail) return;
    const trimmed = proofCode.trim();
    if (!/^\d{6}$/.test(trimmed)) {
      setProofError(t.verifyInvalidOrExpired);
      return;
    }
    setProofSubmitting(true);
    setProofError(null);
    setRemainingAttempts(null);
    try {
      const mintResponse = await fetch("/api/public-booking/action-token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookingId,
          salonId: salon.id,
          customerEmail: pendingCustomerEmail,
          purposes: ["confirmation", "notify", "cancel"],
          proofCode: trimmed,
        }),
      });
      const mintPayload = (await mintResponse.json().catch(() => null)) as
        | {
            tokens?: { confirmation?: string; notify?: string; cancel?: string };
            error?: string;
            remainingAttempts?: number;
            lockedUntil?: string;
            retryAfterSec?: number;
          }
        | null;
      const conf = mintPayload?.tokens?.confirmation;
      const notify = mintPayload?.tokens?.notify;
      const cancel = mintPayload?.tokens?.cancel;
      if (!mintResponse.ok || !conf || !notify || !cancel) {
        if (typeof mintPayload?.remainingAttempts === "number") {
          setRemainingAttempts(mintPayload.remainingAttempts);
        }
        if (mintPayload?.lockedUntil) {
          setProofError(t.verifyLockedRequestNewCode);
        } else if (mintPayload?.retryAfterSec && mintPayload.retryAfterSec > 0) {
          setResendCooldownSeconds(mintPayload.retryAfterSec);
          setProofError(formatTemplate(t.verifyRetryInSeconds, { seconds: mintPayload.retryAfterSec }));
        } else {
          setProofError(mintPayload?.error || t.verifyInvalidOrExpired);
        }
        return;
      }
      setSessionTokens({ notify, cancel });
      setConfirmationToken(conf);
      try {
        sessionStorage.removeItem(pendingBookingEmailKey(bookingId));
      } catch {
        /* ignore */
      }
      setProofCode("");
    } catch {
      setProofError(t.verifyInvalidOrExpired);
    } finally {
      setProofSubmitting(false);
    }
  }

  const handleCancel = async () => {
    if (!salon?.id || !booking?.id) return;

    setCancelling(true);
    setError(null);

    try {
      trackPublicEvent("booking_cancel_requested", {
        salon_slug: slug,
        salon_id: salon.id,
        booking_id: booking.id,
        step: "confirmation",
      });

      const customerEmail = readCustomerEmail(booking);
      if (!customerEmail) {
        setError(t.loadBookingDetailsError);
        setCancelling(false);
        return;
      }

      let cancelToken = sessionTokens?.cancel ?? null;
      if (!cancelToken) {
        const code = cancelProofCode.trim();
        if (!/^\d{6}$/.test(code)) {
          setError(t.verifyInvalidOrExpired);
          setCancelling(false);
          return;
        }
        const mintResponse = await fetch("/api/public-booking/action-token", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            bookingId: booking.id,
            salonId: salon.id,
            customerEmail,
            purposes: ["cancel"],
            proofCode: code,
          }),
        });
        const mintPayload = (await mintResponse.json().catch(() => null)) as
          | { tokens?: { cancel?: string }; error?: string }
          | null;
        cancelToken = mintPayload?.tokens?.cancel ?? null;
        if (!mintResponse.ok || !cancelToken) {
          setError(mintPayload?.error || t.cancelFailed);
          setCancelling(false);
          return;
        }
      }

      const { error: cancelError } = await cancelBooking(
        salon.id,
        booking.id,
        cancellationReason || null,
        {
          actionToken: cancelToken,
          customerEmail,
          booking,
        },
      );

      if (cancelError) {
        setError(cancelError);
        setCancelling(false);
        return;
      }

      setBooking((prev) => (prev ? ({ ...prev, status: "cancelled" } as Booking) : prev));
      trackPublicEvent("booking_cancel_completed", {
        salon_slug: slug,
        salon_id: salon.id,
        booking_id: booking.id,
        step: "confirmation",
      });
      setShowCancelForm(false);
      setCancellationReason("");
      setCancelProofCode("");
    } catch (err) {
      setError(err instanceof Error ? err.message : t.cancelFailed);
    } finally {
      setCancelling(false);
    }
  };

  const tz = salon?.timezone || "UTC";
  const formatDate = createDateFormatter(tz, locale);
  const formatTime = createTimeFormatter(tz, locale);
  const effectiveBranding = salon ? computeEffectiveBranding(salon) : null;
  const tokens = effectiveBranding ? buildPublicBookingTokens(effectiveBranding) : null;

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <p className="text-sm text-muted-foreground">{t.loading}</p>
      </div>
    );
  }

  if (error || !salon) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <Card className="p-6 max-w-md w-full">
          <div className="text-center">
            <XCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <h2 className="mb-2 text-lg font-semibold">{t.errorTitle}</h2>
            <p className="text-sm text-muted-foreground">{error || t.bookingNotFound}</p>
            <Button onClick={() => router.push(`/book/${slug}`)} className="mt-4">
              {t.backToBooking}
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  if (!tokens || !effectiveBranding) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <p className="text-sm text-muted-foreground">{t.loading}</p>
      </div>
    );
  }

  const showEmailVerifyGate = !urlActionToken && pendingCustomerEmail && !confirmationToken;

  if (showEmailVerifyGate) {
    return (
      <div
        className="flex min-h-screen items-center justify-center px-4 py-12"
        style={{ backgroundColor: tokens.colors.surface2, fontFamily: tokens.typography.fontFamily }}
      >
        <Card className="w-full max-w-md p-6" style={{ borderColor: tokens.colors.border, boxShadow: tokens.shadow.card }}>
          <div className="text-center mb-4">
            <div className="mb-3 flex justify-center">
              <img
                src={effectiveBranding.logoUrl}
                alt={salon.name}
                width={36}
                height={36}
                loading="lazy"
                decoding="async"
                className="h-9 w-auto object-contain"
              />
            </div>
            <h1 className="text-xl font-bold mb-2">{t.verifyTitle}</h1>
            <p className="text-sm text-muted-foreground">{t.verifyDescription}</p>
          </div>
          <form onSubmit={handleVerifyEmailOtp} className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block" htmlFor="booking-proof-code">
                {t.verifyCodeLabel}
              </label>
              <Input
                id="booking-proof-code"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={6}
                placeholder={t.verifyCodePlaceholder}
                value={proofCode}
                onChange={(ev) => setProofCode(ev.target.value.replace(/\D/g, "").slice(0, 6))}
              />
            </div>
            {proofError && <p className="text-sm text-destructive">{proofError}</p>}
            {remainingAttempts !== null && (
              <p className="text-xs text-muted-foreground">
                {formatTemplate(t.verifyAttemptsRemaining, { count: remainingAttempts })}
              </p>
            )}
            <Button
              type="submit"
              className="w-full"
              disabled={proofSubmitting}
              style={{ backgroundColor: tokens.colors.primary, color: tokens.colors.primaryText }}
            >
              {proofSubmitting ? t.verifySubmitting : t.verifySubmit}
            </Button>
            <Button
              type="button"
              variant="outline"
              className="w-full"
              disabled={resendBusy || resendCooldownSeconds > 0}
              onClick={() => void handleResendProof(pendingCustomerEmail)}
            >
              {resendBusy
                ? t.verifyResendSending
                : resendCooldownSeconds > 0
                  ? formatTemplate(t.verifyRetryInSeconds, { seconds: resendCooldownSeconds })
                  : t.verifyResend}
            </Button>
          </form>
        </Card>
      </div>
    );
  }

  const isCancelled = booking?.status === "cancelled";

  return (
    <div
      className="flex min-h-screen items-center justify-center px-4 py-12"
      style={{ backgroundColor: tokens.colors.surface2, fontFamily: tokens.typography.fontFamily }}
    >
      <Card className="w-full max-w-2xl p-6" style={{ borderColor: tokens.colors.border, boxShadow: tokens.shadow.card }}>
        <div className="text-center mb-6">
          <div className="mb-3 flex justify-center">
            <img
              src={effectiveBranding.logoUrl}
              alt={salon.name}
              width={36}
              height={36}
              loading="lazy"
              decoding="async"
              className="h-9 w-auto object-contain"
            />
          </div>
          {isCancelled ? (
            <XCircle className="h-16 w-16 text-destructive mx-auto mb-4" />
          ) : (
            <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
          )}
          <h1 className="text-2xl font-bold mb-2">
            {isCancelled ? t.cancelledTitle : t.confirmedTitle}
          </h1>
          <p className="text-sm text-muted-foreground">
            {isCancelled ? t.cancelledDescription : t.confirmedDescription}
          </p>
        </div>

        {detailsLoading && (
          <p className="text-sm text-muted-foreground text-center mb-4">{t.loading}</p>
        )}

        <div className="space-y-4 mb-6">
          <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
            <Calendar className="h-5 w-5 text-muted-foreground" />
            <div>
              {booking ? (
                <>
                  <p className="text-sm font-medium">{formatDate(booking.start_time)}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatTime(booking.start_time)} - {formatTime(booking.end_time)}
                  </p>
                </>
              ) : (
                <>
                  <p className="text-sm font-medium">{t.reservationReceived}</p>
                  <p className="text-xs text-muted-foreground">
                    {t.reference}: {bookingId}
                  </p>
                </>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
            <Scissors className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">{t.service}</p>
              <p className="text-xs text-muted-foreground">
                {booking?.services?.name || t.servicePending}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
            <User className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">{t.employee}</p>
              <p className="text-xs text-muted-foreground">
                {booking?.employees?.full_name || t.bestAvailable}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
            <Clock className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">{t.status}</p>
              <Badge
                variant="outline"
                className={`mt-1 ${
                  isCancelled
                    ? "border-destructive text-destructive"
                    : booking?.status === "confirmed"
                      ? "border-green-600 text-green-600"
                      : ""
                }`}
              >
                {labelBookingStatus(booking?.status, t)}
              </Badge>
            </div>
          </div>
        </div>

        {!isCancelled && booking && (
          <div className="space-y-4">
            {!showCancelForm ? (
              <div className="flex gap-3">
                <Button
                  onClick={() => {
                    setShowCancelForm(true);
                    setCancelProofCode("");
                    if (!sessionTokens?.cancel && salon && booking) {
                      const em = readCustomerEmail(booking);
                      if (em) {
                        void fetch("/api/public-booking/request-proof", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({
                            bookingId: booking.id,
                            salonId: salon.id,
                            customerEmail: em,
                          }),
                        });
                      }
                    }
                  }}
                  variant="outline"
                  className="flex-1"
                >
                  <X className="mr-2 h-4 w-4" />
                  {t.cancelBooking}
                </Button>
                <Button
                  onClick={() => router.push(`/book/${slug}`)}
                  className="flex-1"
                  style={{ backgroundColor: tokens.colors.primary, color: tokens.colors.primaryText }}
                >
                  {t.bookAnother}
                </Button>
              </div>
            ) : (
              <div className="space-y-3 p-4 border rounded-lg">
                {!sessionTokens?.cancel && (
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">{t.verifyCancelCodeHint}</p>
                    <label className="text-sm font-medium block" htmlFor="cancel-proof-code">
                      {t.verifyCancelCodeLabel}
                    </label>
                    <Input
                      id="cancel-proof-code"
                      inputMode="numeric"
                      autoComplete="one-time-code"
                      maxLength={6}
                      placeholder={t.verifyCodePlaceholder}
                      value={cancelProofCode}
                      onChange={(ev) => setCancelProofCode(ev.target.value.replace(/\D/g, "").slice(0, 6))}
                    />
                  </div>
                )}
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    {t.cancelReasonLabel}
                  </label>
                  <textarea
                    value={cancellationReason}
                    onChange={(e) => setCancellationReason(e.target.value)}
                    className="w-full p-2 border rounded-md text-sm"
                    rows={3}
                    placeholder={t.cancelReasonPlaceholder}
                  />
                </div>
                <div className="flex gap-3">
                  <Button
                    onClick={() => {
                      setShowCancelForm(false);
                      setCancellationReason("");
                      setCancelProofCode("");
                    }}
                    variant="outline"
                    className="flex-1"
                    disabled={cancelling}
                  >
                    {t.keepBooking}
                  </Button>
                  <Button
                    onClick={() => void handleCancel()}
                    variant="destructive"
                    className="flex-1"
                    disabled={cancelling}
                  >
                    {cancelling ? t.cancelling : t.confirmCancellation}
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

        {(error || bookingDetailsError) && (
          <div className="mt-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
            <p className="text-sm text-destructive">{error || bookingDetailsError}</p>
          </div>
        )}

        {salon.whatsapp_number && (
          <div className="mt-6 pt-6 border-t">
            <p className="text-sm text-center text-muted-foreground mb-3">
              {t.changesViaWhatsapp}
            </p>
            <a
              href={`https://wa.me/${salon.whatsapp_number.replace(/[^0-9]/g, "")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="block"
            >
              <Button className="w-full" variant="outline">
                {t.chatOnWhatsapp}
              </Button>
            </a>
          </div>
        )}
      </Card>
    </div>
  );
}
