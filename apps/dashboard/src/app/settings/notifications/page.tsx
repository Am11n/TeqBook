"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
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
import { Bell, Mail, CalendarCheck, CalendarX, UserPlus, Check, AlertCircle } from "lucide-react";
import { NotificationItem } from "./_components/NotificationItem";
import { TestEmailInput } from "./_components/TestEmailInput";
import { DEFAULT_VALUES, PREVIEW_TEMPLATES, type NotificationForm } from "./_components/constants";

export default function NotificationsPage() {
  const { locale } = useLocale();
  const { salon, profile, user } = useCurrentSalon();
  const appLocale = normalizeLocale(locale);
  const t = translations[appLocale].settings;
  const { registerDirtyState } = useTabGuard();

  const [previewKey, setPreviewKey] = useState<string | null>(null);
  const [sendingTest, setSendingTest] = useState(false);
  const [testSentMessage, setTestSentMessage] = useState<string | null>(null);
  const [testErrorMessage, setTestErrorMessage] = useState<string | null>(null);
  const [showTestInput, setShowTestInput] = useState<"customer" | "internal" | null>(null);
  const [testEmailTarget, setTestEmailTarget] = useState(user?.email ?? "");

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

  const handleSave = useCallback(async (values: NotificationForm) => {
    if (!user?.id) throw new Error("Not logged in");
    const { error } = await supabase.from("profiles").update({ notification_preferences: values }).eq("id", user.id);
    if (error) throw new Error(error.message);
  }, [user?.id]);

  const form = useSettingsForm<NotificationForm>({ initialValues, onSave: handleSave });

  useEffect(() => {
    registerDirtyState("notifications", form.isDirty);
  }, [form.isDirty, registerDirtyState]);

  const handleSendTest = async (group: "customer" | "internal", recipientEmail: string) => {
    if (!recipientEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(recipientEmail)) return;
    if (!salon?.id) return;
    setSendingTest(true);
    setTestErrorMessage(null);
    try {
      const res = await fetch("/api/settings/send-test-notification", {
        method: "POST", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recipientEmail, group, salonId: salon.id }),
      });
      const data = await res.json();
      if (!res.ok || data.error) throw new Error(data.error || `Failed (${res.status})`);
      setTestSentMessage(`Test sent to ${recipientEmail}`);
      setShowTestInput(null);
      setTimeout(() => setTestSentMessage(null), 4000);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to send test email";
      logError(msg);
      setTestErrorMessage(msg);
      setTimeout(() => setTestErrorMessage(null), 5000);
    } finally {
      setSendingTest(false);
    }
  };

  const activeLabel = t.activeStatus ?? "Active";
  const disabledLabel = t.disabledStatus ?? "Disabled";
  const previewTemplate = previewKey ? PREVIEW_TEMPLATES[previewKey] : null;

  return (
    <div className="space-y-6">
      {testSentMessage && (
        <div className="fixed top-4 right-4 z-50 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-lg px-4 py-2.5 flex items-center gap-2 shadow-lg animate-in fade-in slide-in-from-top-2">
          <Check className="h-4 w-4 text-green-600" />
          <span className="text-sm text-green-700 dark:text-green-300">{testSentMessage}</span>
        </div>
      )}
      {testErrorMessage && (
        <div className="fixed top-4 right-4 z-50 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg px-4 py-2.5 flex items-center gap-2 shadow-lg animate-in fade-in slide-in-from-top-2">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <span className="text-sm text-red-700 dark:text-red-300">{testErrorMessage}</span>
        </div>
      )}

      <SettingsSection
        title={t.customerNotificationsTitle ?? "Customer Notifications"}
        description={t.customerNotificationsDescription ?? "Emails sent to your customers when bookings are created, changed, or cancelled."}
        titleRight={
          <TestEmailInput
            show={showTestInput === "customer"}
            testEmailTarget={testEmailTarget}
            onEmailChange={setTestEmailTarget}
            onSend={() => handleSendTest("customer", testEmailTarget)}
            onCancel={() => setShowTestInput(null)}
            onOpen={() => { setTestEmailTarget(user?.email ?? ""); setShowTestInput("customer"); }}
            sending={sendingTest}
            placeholder={t.testEmailPlaceholder ?? "Enter email address"}
            buttonLabel={t.sendTestTo ?? "Send test"}
          />
        }
      >
        <NotificationItem icon={CalendarCheck} label={t.bookingConfirmationLabel ?? "Booking confirmation"} description={t.bookingConfirmationDescription ?? "Sent immediately when a booking is created."} fieldKey="bookingConfirmation" isChecked={form.values.bookingConfirmation as boolean} reminderTiming={form.values.reminderTiming} onToggle={(k, v) => form.setValue(k, v as never)} onTimingChange={(v) => form.setValue("reminderTiming", v)} onPreview={setPreviewKey} activeLabel={activeLabel} disabledLabel={disabledLabel} />
        <NotificationItem icon={Bell} label={t.bookingReminderLabel ?? "Booking reminder"} description={t.bookingReminderDescription ?? "Sent before the appointment to reduce no-shows."} fieldKey="bookingReminder" showTiming isChecked={form.values.bookingReminder as boolean} reminderTiming={form.values.reminderTiming} onToggle={(k, v) => form.setValue(k, v as never)} onTimingChange={(v) => form.setValue("reminderTiming", v)} onPreview={setPreviewKey} activeLabel={activeLabel} disabledLabel={disabledLabel} />
        <NotificationItem icon={CalendarX} label={t.cancellationNoticeLabel ?? "Cancellation notice"} description={t.cancellationNoticeDescription ?? "Sent when a booking is cancelled."} fieldKey="cancellationNotice" isChecked={form.values.cancellationNotice as boolean} reminderTiming={form.values.reminderTiming} onToggle={(k, v) => form.setValue(k, v as never)} onTimingChange={(v) => form.setValue("reminderTiming", v)} onPreview={setPreviewKey} activeLabel={activeLabel} disabledLabel={disabledLabel} />
      </SettingsSection>

      <SettingsSection
        title={t.internalNotificationsTitle ?? "Your Notifications"}
        description={t.internalNotificationsDescription ?? "Emails sent to you when bookings are created, changed, or cancelled."}
        titleRight={
          <TestEmailInput
            show={showTestInput === "internal"}
            testEmailTarget={testEmailTarget}
            onEmailChange={setTestEmailTarget}
            onSend={() => handleSendTest("internal", testEmailTarget)}
            onCancel={() => setShowTestInput(null)}
            onOpen={() => { setTestEmailTarget(user?.email ?? ""); setShowTestInput("internal"); }}
            sending={sendingTest}
            placeholder={t.testEmailPlaceholder ?? "Enter email address"}
            buttonLabel={t.sendTestTo ?? "Send test"}
          />
        }
      >
        <NotificationItem icon={UserPlus} label={t.newBookingLabel ?? "New booking"} description={t.newBookingDescription ?? "Receive an email when a customer books an appointment."} fieldKey="newBooking" isChecked={form.values.newBooking as boolean} reminderTiming={form.values.reminderTiming} onToggle={(k, v) => form.setValue(k, v as never)} onTimingChange={(v) => form.setValue("reminderTiming", v)} onPreview={setPreviewKey} activeLabel={activeLabel} disabledLabel={disabledLabel} />
        <NotificationItem icon={CalendarCheck} label={t.bookingChangesLabel ?? "Booking changes"} description={t.bookingChangesDescription ?? "Receive an email when a booking is modified."} fieldKey="bookingChanges" isChecked={form.values.bookingChanges as boolean} reminderTiming={form.values.reminderTiming} onToggle={(k, v) => form.setValue(k, v as never)} onTimingChange={(v) => form.setValue("reminderTiming", v)} onPreview={setPreviewKey} activeLabel={activeLabel} disabledLabel={disabledLabel} />
        <NotificationItem icon={CalendarX} label={t.bookingCancellationsLabel ?? "Booking cancellations"} description={t.bookingCancellationsDescription ?? "Receive an email when a customer cancels."} fieldKey="bookingCancellations" isChecked={form.values.bookingCancellations as boolean} reminderTiming={form.values.reminderTiming} onToggle={(k, v) => form.setValue(k, v as never)} onTimingChange={(v) => form.setValue("reminderTiming", v)} onPreview={setPreviewKey} activeLabel={activeLabel} disabledLabel={disabledLabel} />
      </SettingsSection>

      <Dialog open={!!previewKey} onOpenChange={(open) => !open && setPreviewKey(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><Mail className="h-4 w-4" />Email Preview</DialogTitle>
            <DialogDescription>This is a sample email. Variables like {"{customer_name}"} will be replaced with real data.</DialogDescription>
          </DialogHeader>
          {previewTemplate && (
            <div className="mt-2 space-y-3">
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1">Subject</p>
                <p className="text-sm font-medium border rounded-md px-3 py-2 bg-muted/30">{previewTemplate.subject}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1">Body</p>
                <div className="text-sm border rounded-md px-3 py-2 bg-muted/30 whitespace-pre-wrap font-mono text-xs">
                  {previewTemplate.body.replace("{customer_name}", "Jane Doe").replace("{salon_name}", salon?.name || "Your Salon").replace("{date}", "March 15, 2026").replace("{time}", "10:30").replace("{service_name}", "Haircut")}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <StickySaveBar isDirty={form.isDirty} isValid={form.isValid} saving={form.saving} saveError={form.saveError} lastSavedAt={form.lastSavedAt} onSave={form.save} onDiscard={form.discard} onRetry={form.retrySave} />
    </div>
  );
}
