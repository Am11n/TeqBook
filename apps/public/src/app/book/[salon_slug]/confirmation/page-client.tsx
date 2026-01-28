"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getSalonBySlugForPublic } from "@/lib/services/salons-service";
import { getBookingById } from "@/lib/repositories/bookings";
import { cancelBooking } from "@/lib/services/bookings-service";
import { useLocale } from "@/components/locale-provider";
// Translation available if needed: import { translations } from "@/i18n/translations";
import { formatDateInTimezone, formatTimeInTimezone } from "@/lib/utils/timezone";
import { CheckCircle, XCircle, Calendar, Clock, User, Scissors, X } from "lucide-react";
import type { Booking } from "@/lib/types";

type Salon = {
  id: string;
  name: string;
  whatsapp_number?: string | null;
  timezone?: string | null;
  theme?: {
    primary?: string;
    font?: string;
    logo_url?: string;
  } | null;
};

type BookingConfirmationPageClientProps = {
  salonSlug: string;
};

export default function BookingConfirmationPageClient({ salonSlug }: BookingConfirmationPageClientProps) {
  const { locale } = useLocale();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [slug] = useState<string>(salonSlug);
  const bookingId = searchParams.get("bookingId") || searchParams.get("id");

  // Translation available if needed: const t = translations[locale].publicBooking;
  const [salon, setSalon] = useState<Salon | null>(null);
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
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
          whatsapp_number: salonData.whatsapp_number || null,
          timezone: salonData.timezone || null,
          theme: salonData.theme || null,
        });

        // Load booking - we need to create a function to get booking by ID publicly
        // For now, we'll need to add this to the repository
        const { data: bookingData, error: bookingError } = await getBookingById(bookingId);
        if (bookingError || !bookingData) {
          setError(bookingError || "Booking not found");
          setLoading(false);
          return;
        }

        // Verify booking belongs to salon
        if (bookingData.salon_id !== salonData.id) {
          setError("Booking does not belong to this salon");
          setLoading(false);
          return;
        }

        setBooking(bookingData as Booking);
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

      // Reload booking to get updated status
      const { data: updatedBooking } = await getBookingById(booking.id);
      if (updatedBooking) {
        setBooking(updatedBooking as Booking);
      }
      setShowCancelForm(false);
      setCancellationReason("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to cancel booking");
    } finally {
      setCancelling(false);
    }
  };

  const formatDate = (dateString: string) => {
    const tz = salon?.timezone || "UTC";
    return formatDateInTimezone(dateString, tz, locale, {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (dateString: string) => {
    const tz = salon?.timezone || "UTC";
    return formatTimeInTimezone(dateString, tz, locale, {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <p className="text-sm text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (error || !salon || !booking) {
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

  const primaryColor = salon.theme?.primary || "#3b82f6";
  const isCancelled = booking.status === "cancelled";

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12 bg-background">
      <Card className="p-6 max-w-2xl w-full">
        <div className="text-center mb-6">
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
              <p className="text-sm font-medium">{formatDate(booking.start_time)}</p>
              <p className="text-xs text-muted-foreground">
                {formatTime(booking.start_time)} - {formatTime(booking.end_time)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
            <Scissors className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">Service</p>
              <p className="text-xs text-muted-foreground">
                {booking.services?.name || "Unknown service"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
            <User className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">Employee</p>
              <p className="text-xs text-muted-foreground">
                {booking.employees?.full_name || "Unknown employee"}
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
                    : booking.status === "confirmed"
                      ? "border-green-600 text-green-600"
                      : ""
                }`}
              >
                {booking.status}
              </Badge>
            </div>
          </div>
        </div>

        {!isCancelled && (
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
                  style={{ backgroundColor: primaryColor }}
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

        {error && (
          <div className="mt-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
            <p className="text-sm text-destructive">{error}</p>
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

