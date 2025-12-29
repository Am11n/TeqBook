"use client";

import { useState, useEffect, FormEvent } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useLocale } from "@/components/locale-provider";
import { useCurrentSalon } from "@/components/salon-provider";
import { translations } from "@/i18n/translations";
import { getCurrentUser } from "@/lib/services/auth-service";
import { getProfileForUser, updatePreferencesForUser } from "@/lib/services/profiles-service";
import { logError } from "@/lib/services/logger";

export default function NotificationsSettingsPage() {
  const { locale } = useLocale();
  const { user } = useCurrentSalon();
  
  const appLocale =
    locale === "nb"
      ? "nb"
      : locale === "ar"
        ? "ar"
        : locale === "so"
          ? "so"
          : locale === "ti"
            ? "ti"
            : locale === "am"
              ? "am"
              : locale === "tr"
                ? "tr"
                : locale === "pl"
                  ? "pl"
                  : locale === "vi"
                    ? "vi"
                    : locale === "zh"
                      ? "zh"
                      : locale === "tl"
                        ? "tl"
                        : locale === "fa"
                          ? "fa"
                          : locale === "dar"
                            ? "dar"
                            : locale === "ur"
                              ? "ur"
                              : locale === "hi"
                                ? "hi"
                                : "en";
  const t = translations[appLocale].settings;

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const [emailBookingConfirmation, setEmailBookingConfirmation] = useState(false);
  const [emailBookingReminder, setEmailBookingReminder] = useState(false);
  const [emailBookingCancellation, setEmailBookingCancellation] = useState(false);
  const [emailNewBooking, setEmailNewBooking] = useState(false);

  // Load current preferences
  useEffect(() => {
    async function loadPreferences() {
      if (!user?.id) {
        const { data: currentUser } = await getCurrentUser();
        if (!currentUser) {
          setLoading(false);
          return;
        }
        const { data: profile } = await getProfileForUser(currentUser.id);
        if (profile?.user_preferences?.notifications?.email) {
          setEmailBookingConfirmation(profile.user_preferences.notifications.email.bookingConfirmation ?? false);
          setEmailBookingReminder(profile.user_preferences.notifications.email.bookingReminder ?? false);
          setEmailBookingCancellation(profile.user_preferences.notifications.email.bookingCancellation ?? false);
          setEmailNewBooking(profile.user_preferences.notifications.email.newBooking ?? false);
        }
        setLoading(false);
        return;
      }

      const { data: profile } = await getProfileForUser(user.id);
      if (profile?.user_preferences?.notifications?.email) {
        setEmailBookingConfirmation(profile.user_preferences.notifications.email.bookingConfirmation ?? false);
        setEmailBookingReminder(profile.user_preferences.notifications.email.bookingReminder ?? false);
        setEmailBookingCancellation(profile.user_preferences.notifications.email.bookingCancellation ?? false);
        setEmailNewBooking(profile.user_preferences.notifications.email.newBooking ?? false);
      }
      setLoading(false);
    }

    loadPreferences();
  }, [user?.id]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    
    const currentUser = user || (await getCurrentUser()).data;
    if (!currentUser?.id) {
      setError("User not found");
      return;
    }

    setSaving(true);
    setError(null);
    setSaved(false);

    try {
      const { error: updateError } = await updatePreferencesForUser(currentUser.id, {
        notifications: {
          email: {
            bookingConfirmation: emailBookingConfirmation,
            bookingReminder: emailBookingReminder,
            bookingCancellation: emailBookingCancellation,
            newBooking: emailNewBooking,
          },
        },
      });

      if (updateError) {
        setError(updateError);
        setSaving(false);
        return;
      }

      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      logError("Error saving notification preferences", err);
      setError(t.error || "Failed to save preferences");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <Card className="p-6">
        <p className="text-sm text-muted-foreground">Loading...</p>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold mb-2">{t.notificationsTitle}</h3>
          <p className="text-sm text-muted-foreground mb-6">
            {t.notificationsDescription}
          </p>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="text-base font-medium">Email Notifications</Label>
            <p className="text-sm text-muted-foreground mb-4">
              Choose which email notifications you want to receive.
            </p>
          </div>

          <div className="space-y-4 pl-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="bookingConfirmation"
                checked={emailBookingConfirmation}
                onCheckedChange={(checked) => setEmailBookingConfirmation(checked === true)}
              />
              <Label htmlFor="bookingConfirmation" className="font-normal cursor-pointer">
                Booking confirmations
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="bookingReminder"
                checked={emailBookingReminder}
                onCheckedChange={(checked) => setEmailBookingReminder(checked === true)}
              />
              <Label htmlFor="bookingReminder" className="font-normal cursor-pointer">
                Booking reminders
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="bookingCancellation"
                checked={emailBookingCancellation}
                onCheckedChange={(checked) => setEmailBookingCancellation(checked === true)}
              />
              <Label htmlFor="bookingCancellation" className="font-normal cursor-pointer">
                Booking cancellations
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="newBooking"
                checked={emailNewBooking}
                onCheckedChange={(checked) => setEmailNewBooking(checked === true)}
              />
              <Label htmlFor="newBooking" className="font-normal cursor-pointer">
                New booking notifications
              </Label>
            </div>
          </div>
        </div>

        {error && (
          <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
            {error}
          </div>
        )}

        {saved && (
          <div className="rounded-md bg-green-50 p-3 text-sm text-green-700 dark:bg-green-900/20 dark:text-green-400">
            {t.saved}
          </div>
        )}

        <Button type="submit" disabled={saving} className="w-full max-w-md">
          {saving ? t.saving : t.saveButton}
        </Button>
      </form>
    </Card>
  );
}

