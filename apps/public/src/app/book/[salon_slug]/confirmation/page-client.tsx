"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useSearchParams, useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getSalonBySlugForPublic } from "@/lib/services/salons-service";
import { cancelBooking } from "@/lib/services/bookings-service";
import { useLocale } from "@/components/locale-provider";
import { CheckCircle, XCircle, Calendar, Clock, User, Scissors, X } from "lucide-react";
import type { Booking } from "@/lib/types";
import { type Salon, createDateFormatter, createTimeFormatter } from "./confirmation-types";
import { buildPublicBookingTokens, computeEffectiveBranding } from "@/components/public-booking/publicBookingUtils";

export default function BookingConfirmationPageClient({ salonSlug }: { salonSlug: string }) {
  const { locale } = useLocale();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [slug] = useState<string>(salonSlug);
  const bookingId = searchParams.get("bookingId") || searchParams.get("id");
  const [salon, setSalon] = useState<Salon | null>(null);
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [bookingDetailsError, setBookingDetailsError] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState(false);
  const [showCancelForm, setShowCancelForm] = useState(false);
  const [cancellationReason, setCancellationReason] = useState("");

  useEffect(() => {
    async function loadData() {
      if (!bookingId || !slug) {
        setError("Missing booking ID or salon slug");
        setLoading(false);
        return;
      }

      try {
        // Load salon
        const { data: salonData, error: salonError } = await getSalonBySlugForPublic(slug);
        if (salonError || !salonData) {
          setError(salonError || "Salon not found");
          setLoading(false);
          return;
        }
        setSalon({
          id: salonData.id,
          name: salonData.name,
          plan: salonData.plan || "starter",
          whatsapp_number: salonData.whatsapp_number || null,
          timezone: salonData.timezone || null,
          theme: salonData.theme || null,
          theme_pack_id: salonData.theme_pack_id || null,
          theme_pack_version: salonData.theme_pack_version || null,
          theme_pack_hash: salonData.theme_pack_hash || null,
          theme_pack_snapshot: salonData.theme_pack_snapshot || null,
          theme_overrides: salonData.theme_overrides || null,
        });

        const confirmationResponse = await fetch(
          `/api/public-booking/confirmation?slug=${encodeURIComponent(slug)}&bookingId=${encodeURIComponent(bookingId)}`,
          { method: "GET", headers: { Accept: "application/json" } }
        );
        const confirmationPayload = await confirmationResponse.json().catch(() => null) as
          | { booking?: (Booking & { salon_id: string }) | null; error?: string }
          | null;

        if (!confirmationResponse.ok || !confirmationPayload?.booking) {
          // Reservation-first UX: booking is already created before redirect.
          // If details lookup fails, keep confirmation screen and show reference id.
          setBookingDetailsError(confirmationPayload?.error || "Could not load booking details.");
        } else if (confirmationPayload.booking.salon_id !== salonData.id) {
          setBookingDetailsError("Booking belongs to another salon.");
        } else {
          setBooking(confirmationPayload.booking as Booking);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load booking");
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [bookingId, slug]);

  const handleCancel = async () => {
    if (!salon?.id || !booking?.id) return;

    setCancelling(true);
    setError(null);

    try {
      const { error: cancelError } = await cancelBooking(salon.id, booking.id, cancellationReason || null);
      
      if (cancelError) {
        setError(cancelError);
        setCancelling(false);
        return;
      }

      setBooking((prev) => (prev ? { ...prev, status: "cancelled" } as Booking : prev));
      setShowCancelForm(false);
      setCancellationReason("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to cancel booking");
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
        <p className="text-sm text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (error || !salon) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <Card className="p-6 max-w-md w-full">
          <div className="text-center">
            <XCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <h2 className="text-lg font-semibold mb-2">Error</h2>
            <p className="text-sm text-muted-foreground">{error || "Booking not found"}</p>
            <Button onClick={() => router.push(`/book/${slug}`)} className="mt-4">
              Back to Booking
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  if (!tokens || !effectiveBranding) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <p className="text-sm text-muted-foreground">Loading...</p>
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
            <Image src={effectiveBranding.logoUrl} alt={salon.name} width={36} height={36} className="h-9 w-auto object-contain" />
          </div>
          {isCancelled ? (
            <XCircle className="h-16 w-16 text-destructive mx-auto mb-4" />
          ) : (
            <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
          )}
          <h1 className="text-2xl font-bold mb-2">
            {isCancelled ? "Booking Cancelled" : "Booking Confirmed"}
          </h1>
          <p className="text-sm text-muted-foreground">
            {isCancelled
              ? "Your booking has been cancelled"
              : "Your booking has been confirmed successfully"}
          </p>
        </div>

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
                  <p className="text-sm font-medium">Reservation received</p>
                  <p className="text-xs text-muted-foreground">Reference: {bookingId}</p>
                </>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
            <Scissors className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">Service</p>
              <p className="text-xs text-muted-foreground">
                {booking?.services?.name || "Will be confirmed shortly"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
            <User className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">Employee</p>
              <p className="text-xs text-muted-foreground">
                {booking?.employees?.full_name || "Best available"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
            <Clock className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">Status</p>
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
                {booking?.status || "confirmed"}
              </Badge>
            </div>
          </div>
        </div>

        {!isCancelled && booking && (
          <div className="space-y-4">
            {!showCancelForm ? (
              <div className="flex gap-3">
                <Button
                  onClick={() => setShowCancelForm(true)}
                  variant="outline"
                  className="flex-1"
                >
                  <X className="mr-2 h-4 w-4" />
                  Cancel Booking
                </Button>
                <Button
                  onClick={() => router.push(`/book/${slug}`)}
                  className="flex-1"
                  style={{ backgroundColor: tokens.colors.primary, color: tokens.colors.primaryText }}
                >
                  Book Another
                </Button>
              </div>
            ) : (
              <div className="space-y-3 p-4 border rounded-lg">
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Cancellation Reason (Optional)
                  </label>
                  <textarea
                    value={cancellationReason}
                    onChange={(e) => setCancellationReason(e.target.value)}
                    className="w-full p-2 border rounded-md text-sm"
                    rows={3}
                    placeholder="Please let us know why you're cancelling..."
                  />
                </div>
                <div className="flex gap-3">
                  <Button
                    onClick={() => {
                      setShowCancelForm(false);
                      setCancellationReason("");
                    }}
                    variant="outline"
                    className="flex-1"
                    disabled={cancelling}
                  >
                    Keep Booking
                  </Button>
                  <Button
                    onClick={handleCancel}
                    variant="destructive"
                    className="flex-1"
                    disabled={cancelling}
                  >
                    {cancelling ? "Cancelling..." : "Confirm Cancellation"}
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
              Need to make changes? Contact us on WhatsApp
            </p>
            <a
              href={`https://wa.me/${salon.whatsapp_number.replace(/[^0-9]/g, "")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="block"
            >
              <Button className="w-full" variant="outline">
                Chat on WhatsApp
              </Button>
            </a>
          </div>
        )}
      </Card>
    </div>
  );
}

