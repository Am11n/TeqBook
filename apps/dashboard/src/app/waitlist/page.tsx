"use client";

import { useState, useEffect } from "react";
import { Clock, Trash2, Bell, CheckCircle } from "lucide-react";
import { PageLayout } from "@/components/layout/page-layout";
import { ErrorBoundary } from "@/components/error-boundary";
import { ErrorMessage } from "@/components/feedback/error-message";
import { EmptyState } from "@/components/empty-state";
import { Button } from "@/components/ui/button";
import { useCurrentSalon } from "@/components/salon-provider";
import {
  listWaitlist,
  removeFromWaitlist,
  markAsNotified,
  markAsBooked,
  cancelEntry,
  type WaitlistEntry,
} from "@/lib/services/waitlist-service";

export default function WaitlistPage() {
  const { salon } = useCurrentSalon();
  const [entries, setEntries] = useState<WaitlistEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>("waiting");

  const loadEntries = async () => {
    if (!salon?.id) return;
    setLoading(true);
    const { data, error } = await listWaitlist(salon.id, filter === "all" ? undefined : filter);
    setEntries(data ?? []);
    if (error) setError(error);
    setLoading(false);
  };

  useEffect(() => {
    loadEntries();
  }, [salon?.id, filter]);

  const handleNotify = async (entry: WaitlistEntry) => {
    if (!salon?.id) return;
    await markAsNotified(salon.id, entry.id);
    await loadEntries();
  };

  const handleMarkBooked = async (entry: WaitlistEntry) => {
    if (!salon?.id) return;
    await markAsBooked(salon.id, entry.id);
    await loadEntries();
  };

  const handleCancel = async (entry: WaitlistEntry) => {
    if (!salon?.id) return;
    await cancelEntry(salon.id, entry.id);
    await loadEntries();
  };

  const handleRemove = async (entry: WaitlistEntry) => {
    if (!salon?.id) return;
    await removeFromWaitlist(salon.id, entry.id);
    setEntries((prev) => prev.filter((e) => e.id !== entry.id));
  };

  const statusColors: Record<string, string> = {
    waiting: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
    notified: "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300",
    booked: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
    expired: "bg-gray-100 text-gray-500",
    cancelled: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300",
  };

  return (
    <ErrorBoundary>
      <PageLayout title="Waitlist" description="Customers waiting for available slots.">
        {error && <ErrorMessage message={error} onDismiss={() => setError(null)} variant="destructive" className="mb-4" />}

        <div className="rounded-xl border bg-card p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            {["waiting", "notified", "booked", "all"].map((f) => (
              <Button
                key={f}
                size="sm"
                variant={filter === f ? "default" : "outline"}
                className="h-7 text-xs capitalize"
                onClick={() => setFilter(f)}
              >
                {f}
              </Button>
            ))}
          </div>

          {loading ? (
            <p className="text-sm text-muted-foreground py-4">Loading waitlist...</p>
          ) : entries.length === 0 ? (
            <EmptyState title="No waitlist entries" description="When customers join the waitlist, they'll appear here." />
          ) : (
            <div className="divide-y">
              {entries.map((entry) => (
                <div key={entry.id} className="flex items-center justify-between py-3 gap-4">
                  <div className="min-w-0">
                    <p className="text-sm font-medium">{entry.customer_name}</p>
                    <div className="flex items-center gap-2 mt-0.5 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      <span>{entry.preferred_date}</span>
                      {entry.preferred_time_start && (
                        <span>{entry.preferred_time_start}{entry.preferred_time_end ? `–${entry.preferred_time_end}` : ""}</span>
                      )}
                      {entry.service && <span>&middot; {entry.service.name}</span>}
                      {entry.employee && <span>&middot; {entry.employee.full_name}</span>}
                    </div>
                    {entry.customer_email && (
                      <p className="text-[10px] text-muted-foreground mt-0.5">{entry.customer_email}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full capitalize ${statusColors[entry.status] ?? "bg-gray-100 text-gray-500"}`}>
                      {entry.status}
                    </span>
                    {entry.status === "waiting" && (
                      <Button size="sm" variant="outline" className="h-7 text-xs gap-1" onClick={() => handleNotify(entry)}>
                        <Bell className="h-3 w-3" /> Notify
                      </Button>
                    )}
                    {entry.status === "notified" && (
                      <Button size="sm" variant="outline" className="h-7 text-xs gap-1" onClick={() => handleMarkBooked(entry)}>
                        <CheckCircle className="h-3 w-3" /> Booked
                      </Button>
                    )}
                    {(entry.status === "waiting" || entry.status === "notified") && (
                      <Button size="sm" variant="ghost" className="h-7 text-xs text-red-600" onClick={() => handleCancel(entry)}>
                        Cancel
                      </Button>
                    )}
                    {(entry.status === "cancelled" || entry.status === "expired" || entry.status === "booked") && (
                      <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => handleRemove(entry)}>
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </PageLayout>
    </ErrorBoundary>
  );
}
