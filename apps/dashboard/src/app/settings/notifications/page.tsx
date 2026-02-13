"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useLocale } from "@/components/locale-provider";
import { useCurrentSalon } from "@/components/salon-provider";
import { translations } from "@/i18n/translations";
import { normalizeLocale } from "@/i18n/normalizeLocale";
import { logError } from "@/lib/services/logger";
import { supabase } from "@/lib/supabase-client";
import { SettingsSection } from "@/components/settings/SettingsSection";
import { StickySaveBar } from "@/components/settings/StickySaveBar";
import { useSettingsForm } from "@/lib/hooks/useSettingsForm";
import { useTabGuard } from "../layout";
import {
  Bell,
  Mail,
  Eye,
  Send,
  Check,
  Clock,
  CalendarCheck,
  CalendarX,
  UserPlus,
  Loader2,
} from "lucide-react";

// ─── Types ──────────────────────────────────────────

type NotificationForm = {
  // Customer notifications
  bookingConfirmation: boolean;
  bookingReminder: boolean;
  reminderTiming: string; // "24h" | "2h" | "both"
  cancellationNotice: boolean;
  // Internal notifications
  newBooking: boolean;
  bookingChanges: boolean;
  bookingCancellations: boolean;
};

const DEFAULT_VALUES: NotificationForm = {
  bookingConfirmation: true,
  bookingReminder: true,
  reminderTiming: "24h",
  cancellationNotice: true,
  newBooking: true,
  bookingChanges: true,
  bookingCancellations: true,
};

// ─── Preview templates ──────────────────────────────

const PREVIEW_TEMPLATES: Record<string, { subject: string; body: string }> = {
  bookingConfirmation: {
    subject: "Booking Confirmed",
    body: `Hi {customer_name},\n\nYour booking at {salon_name} has been confirmed!\n\nDate: {date}\nTime: {time}\nService: {service_name}\n\nWe look forward to seeing you.\n\n— {salon_name}`,
  },
  bookingReminder: {
    subject: "Booking Reminder",
    body: `Hi {customer_name},\n\nJust a friendly reminder about your upcoming appointment at {salon_name}.\n\nDate: {date}\nTime: {time}\nService: {service_name}\n\nSee you soon!\n\n— {salon_name}`,
  },
  cancellationNotice: {
    subject: "Booking Cancelled",
    body: `Hi {customer_name},\n\nYour booking at {salon_name} has been cancelled.\n\nDate: {date}\nTime: {time}\n\nIf this was a mistake, feel free to book again.\n\n— {salon_name}`,
  },
  newBooking: {
    subject: "New Booking Received",
    body: `A new booking has been made:\n\nCustomer: {customer_name}\nDate: {date}\nTime: {time}\nService: {service_name}\n\nView it in your dashboard.`,
  },
  bookingChanges: {
    subject: "Booking Modified",
    body: `A booking has been modified:\n\nCustomer: {customer_name}\nNew date: {date}\nNew time: {time}\nService: {service_name}`,
  },
  bookingCancellations: {
    subject: "Booking Cancelled",
    body: `A booking has been cancelled:\n\nCustomer: {customer_name}\nDate: {date}\nTime: {time}\nService: {service_name}`,
  },
};

// ─── Component ──────────────────────────────────────

export default function NotificationsPage() {
  const { locale } = useLocale();
  const { salon, profile, user } = useCurrentSalon();
  const appLocale = normalizeLocale(locale);
  const t = translations[appLocale].settings;
  const { registerDirtyState } = useTabGuard();

  // Preview dialog state
  const [previewKey, setPreviewKey] = useState<string | null>(null);
  const [sendingTest, setSendingTest] = useState(false);
  const [testSentMessage, setTestSentMessage] = useState<string | null>(null);

  // Build initial values from profile preferences
  const initialValues = useMemo<NotificationForm>(() => {
    const prefs = (profile as Record<string, unknown>)?.notification_preferences as Record<string, unknown> | null;
    if (!prefs) return DEFAULT_VALUES;
    return {
      bookingConfirmation: (prefs.bookingConfirmation as boolean) ?? true,
      bookingReminder: (prefs.bookingReminder as boolean) ?? true,
      reminderTiming: (prefs.reminderTiming as string) ?? "24h",
      cancellationNotice: (prefs.cancellationNotice as boolean) ?? true,
      newBooking: (prefs.newBooking as boolean) ?? true,
      bookingChanges: (prefs.bookingChanges as boolean) ?? true,
      bookingCancellations: (prefs.bookingCancellations as boolean) ?? true,
    };
  }, [profile]);

  // Save handler
  const handleSave = useCallback(async (values: NotificationForm) => {
    if (!user?.id) throw new Error("Not logged in");
    const { error } = await supabase
      .from("profiles")
      .update({ notification_preferences: values })
      .eq("id", user.id);
    if (error) throw new Error(error.message);
  }, [user?.id]);

  const form = useSettingsForm<NotificationForm>({
    initialValues,
    onSave: handleSave,
  });

  // Register dirty state with tab guard
  useEffect(() => {
    registerDirtyState("notifications", form.isDirty);
  }, [form.isDirty, registerDirtyState]);

  // Send test email (placeholder)
  const handleSendTest = async (group: "customer" | "internal") => {
    setSendingTest(true);
    try {
      // Placeholder: In production, call an API endpoint
      await new Promise((resolve) => setTimeout(resolve, 1000));
      const email = user?.email || "your email";
      setTestSentMessage(`Test sent to ${email}`);
      setTimeout(() => setTestSentMessage(null), 3000);
    } catch (err) {
      logError(err instanceof Error ? err.message : "Failed to send test");
    } finally {
      setSendingTest(false);
    }
  };

  // ─── Notification item renderer ───────────────────

  const NotificationItem = ({
    icon: Icon,
    label,
    description,
    fieldKey,
    showTiming,
  }: {
    icon: React.ElementType;
    label: string;
    description: string;
    fieldKey: keyof NotificationForm;
    showTiming?: boolean;
  }) => {
    const isChecked = form.values[fieldKey] as boolean;
    return (
      <div className="flex items-start gap-3 py-3 border-b last:border-b-0">
        <label className="flex items-center pt-0.5 cursor-pointer">
          <input
            type="checkbox"
            checked={isChecked}
            onChange={(e) => form.setValue(fieldKey, e.target.checked as never)}
            className="h-4 w-4 rounded border-input"
          />
        </label>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <Icon className="h-4 w-4 text-muted-foreground shrink-0" />
            <span className="text-sm font-medium">{label}</span>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">{description}</p>

          {/* Reminder timing dropdown */}
          {showTiming && isChecked && (
            <div className="mt-2 flex items-center gap-2">
              <Clock className="h-3.5 w-3.5 text-muted-foreground" />
              <select
                value={form.values.reminderTiming}
                onChange={(e) => form.setValue("reminderTiming", e.target.value)}
                className="h-8 rounded-md border border-input bg-background px-2 text-xs outline-none focus:ring-1 focus:ring-ring"
              >
                <option value="24h">24 hours before</option>
                <option value="2h">2 hours before</option>
                <option value="both">Both (24h + 2h)</option>
              </select>
            </div>
          )}
        </div>
        {/* Preview link */}
        <button
          type="button"
          onClick={() => setPreviewKey(fieldKey)}
          className="text-xs text-primary hover:underline whitespace-nowrap flex items-center gap-1"
        >
          <Eye className="h-3 w-3" />
          Preview
        </button>
      </div>
    );
  };

  // ─── Render ─────────────────────────────────────────

  const previewTemplate = previewKey ? PREVIEW_TEMPLATES[previewKey] : null;

  return (
    <div className="space-y-6">
      {/* Test sent toast */}
      {testSentMessage && (
        <div className="fixed top-4 right-4 z-50 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-lg px-4 py-2.5 flex items-center gap-2 shadow-lg animate-in fade-in slide-in-from-top-2">
          <Check className="h-4 w-4 text-green-600" />
          <span className="text-sm text-green-700 dark:text-green-300">{testSentMessage}</span>
        </div>
      )}

      {/* Customer Notifications */}
      <SettingsSection
        title={t.customerNotificationsTitle ?? "Customer Notifications"}
        description={t.customerNotificationsDescription ?? "Emails sent to your customers when bookings are created, changed, or cancelled."}
        titleRight={
          <Button
            variant="ghost"
            size="sm"
            className="text-xs"
            onClick={() => handleSendTest("customer")}
            disabled={sendingTest}
          >
            {sendingTest ? (
              <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" />
            ) : (
              <Send className="h-3.5 w-3.5 mr-1" />
            )}
            Send test
          </Button>
        }
      >
        <NotificationItem
          icon={CalendarCheck}
          label={t.bookingConfirmationLabel ?? "Booking confirmation"}
          description={t.bookingConfirmationDescription ?? "Sent immediately when a booking is created."}
          fieldKey="bookingConfirmation"
        />
        <NotificationItem
          icon={Bell}
          label={t.bookingReminderLabel ?? "Booking reminder"}
          description={t.bookingReminderDescription ?? "Sent before the appointment to reduce no-shows."}
          fieldKey="bookingReminder"
          showTiming
        />
        <NotificationItem
          icon={CalendarX}
          label={t.cancellationNoticeLabel ?? "Cancellation notice"}
          description={t.cancellationNoticeDescription ?? "Sent when a booking is cancelled."}
          fieldKey="cancellationNotice"
        />
      </SettingsSection>

      {/* Internal Notifications */}
      <SettingsSection
        title={t.internalNotificationsTitle ?? "Your Notifications"}
        description={t.internalNotificationsDescription ?? "Emails sent to you when bookings are created, changed, or cancelled."}
        titleRight={
          <Button
            variant="ghost"
            size="sm"
            className="text-xs"
            onClick={() => handleSendTest("internal")}
            disabled={sendingTest}
          >
            {sendingTest ? (
              <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" />
            ) : (
              <Send className="h-3.5 w-3.5 mr-1" />
            )}
            Send test
          </Button>
        }
      >
        <NotificationItem
          icon={UserPlus}
          label={t.newBookingLabel ?? "New booking"}
          description={t.newBookingDescription ?? "Receive an email when a customer books an appointment."}
          fieldKey="newBooking"
        />
        <NotificationItem
          icon={CalendarCheck}
          label={t.bookingChangesLabel ?? "Booking changes"}
          description={t.bookingChangesDescription ?? "Receive an email when a booking is modified."}
          fieldKey="bookingChanges"
        />
        <NotificationItem
          icon={CalendarX}
          label={t.bookingCancellationsLabel ?? "Booking cancellations"}
          description={t.bookingCancellationsDescription ?? "Receive an email when a customer cancels."}
          fieldKey="bookingCancellations"
        />
      </SettingsSection>

      {/* Preview Dialog */}
      <Dialog open={!!previewKey} onOpenChange={(open) => !open && setPreviewKey(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Email Preview
            </DialogTitle>
            <DialogDescription>
              This is a sample email. Variables like {"{customer_name}"} will be replaced with real data.
            </DialogDescription>
          </DialogHeader>
          {previewTemplate && (
            <div className="mt-2 space-y-3">
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1">Subject</p>
                <p className="text-sm font-medium border rounded-md px-3 py-2 bg-muted/30">
                  {previewTemplate.subject}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1">Body</p>
                <div className="text-sm border rounded-md px-3 py-2 bg-muted/30 whitespace-pre-wrap font-mono text-xs">
                  {previewTemplate.body
                    .replace("{customer_name}", "Jane Doe")
                    .replace("{salon_name}", salon?.name || "Your Salon")
                    .replace("{date}", "March 15, 2026")
                    .replace("{time}", "10:30")
                    .replace("{service_name}", "Haircut")}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Sticky save bar */}
      <StickySaveBar
        isDirty={form.isDirty}
        isValid={form.isValid}
        saving={form.saving}
        saveError={form.saveError}
        lastSavedAt={form.lastSavedAt}
        onSave={form.save}
        onDiscard={form.discard}
        onRetry={form.retrySave}
      />
    </div>
  );
}
