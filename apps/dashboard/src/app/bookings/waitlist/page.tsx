"use client";

import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { Clock, Trash2, Bell, CheckCircle } from "lucide-react";
import { ErrorBoundary } from "@/components/error-boundary";
import { ErrorMessage } from "@/components/feedback/error-message";
import { EmptyState } from "@/components/empty-state";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useCurrentSalon } from "@/components/salon-provider";
import { supabase } from "@/lib/supabase-client";
import {
  listWaitlist,
  removeFromWaitlist,
  markAsNotified,
  markAsBooked,
  cancelEntry,
  addToWaitlist,
  type WaitlistEntry,
} from "@/lib/services/waitlist-service";

export default function WaitlistPage() {
  const { salon } = useCurrentSalon();
  const [entries, setEntries] = useState<WaitlistEntry[]>([]);
  const [services, setServices] = useState<Array<{ id: string; name: string }>>([]);
  const [employees, setEmployees] = useState<Array<{ id: string; full_name: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>("waiting");
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const [createOpen, setCreateOpen] = useState(false);
  const [savingCreate, setSavingCreate] = useState(false);
  const realtimeRetryRef = useRef(0);
  const realtimeRetryTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pollingTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const eventDedupRef = useRef<Map<string, string>>(new Map());
  const [createForm, setCreateForm] = useState({
    customerName: "",
    customerEmail: "",
    customerPhone: "",
    serviceId: "",
    employeeId: "",
    preferredDate: new Date().toISOString().slice(0, 10),
    preferredTimeStart: "",
    preferredTimeEnd: "",
    preferenceMode: "specific_time" as "specific_time" | "day_flexible",
    flexWindowMinutes: "0",
  });

  const loadEntries = useCallback(async () => {
    if (!salon?.id) return;
    setLoading(true);
    const { data, error } = await listWaitlist(salon.id, filter === "all" ? undefined : filter);
    setEntries(data ?? []);
    if (error) setError(error);
    setLoading(false);
  }, [salon?.id, filter]);

  const loadFormData = useCallback(async () => {
    if (!salon?.id) return;
    const [servicesRes, employeesRes] = await Promise.all([
      supabase
        .from("services")
        .select("id, name")
        .eq("salon_id", salon.id)
        .eq("is_active", true)
        .order("name", { ascending: true }),
      supabase
        .from("employees")
        .select("id, full_name")
        .eq("salon_id", salon.id)
        .eq("is_active", true)
        .order("full_name", { ascending: true }),
    ]);

    if (!servicesRes.error) setServices((servicesRes.data ?? []) as Array<{ id: string; name: string }>);
    if (!employeesRes.error) {
      setEmployees((employeesRes.data ?? []) as Array<{ id: string; full_name: string }>);
    }
  }, [salon?.id]);

  useEffect(() => {
    loadEntries();
    loadFormData();
  }, [loadEntries, loadFormData]);

  useEffect(() => {
    if (!salon?.id) return;

    const channelName = `waitlist:salon:${salon.id}`;
    const maxRetries = 4;
    const baseRetryMs = 1000;

    const subscribe = () => {
      const channel = supabase
        .channel(channelName)
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "waitlist_entries",
            filter: `salon_id=eq.${salon.id}`,
          },
          (payload) => {
            const rowId = String((payload.new as { id?: string } | null)?.id || (payload.old as { id?: string } | null)?.id || "");
            const stamp = payload.commit_timestamp || "";
            const dedupKey = `${payload.eventType}:${rowId}`;
            if (eventDedupRef.current.get(dedupKey) === stamp) {
              return;
            }
            eventDedupRef.current.set(dedupKey, stamp);
            loadEntries();
          }
        )
        .subscribe((status) => {
          if (status === "SUBSCRIBED") {
            realtimeRetryRef.current = 0;
          } else if (status === "CHANNEL_ERROR") {
            realtimeRetryRef.current += 1;
            if (realtimeRetryRef.current <= maxRetries) {
              const delay = Math.min(16000, baseRetryMs * 2 ** (realtimeRetryRef.current - 1));
              if (realtimeRetryTimerRef.current) clearTimeout(realtimeRetryTimerRef.current);
              realtimeRetryTimerRef.current = setTimeout(() => {
                supabase.removeChannel(channel);
                subscribe();
              }, delay);
            } else {
              console.warn("Waitlist realtime degraded; relying on polling fallback.");
            }
          }
        });

      return channel;
    };

    const channel = subscribe();
    pollingTimerRef.current = setInterval(() => {
      loadEntries();
    }, 60000);

    return () => {
      if (realtimeRetryTimerRef.current) {
        clearTimeout(realtimeRetryTimerRef.current);
        realtimeRetryTimerRef.current = null;
      }
      if (pollingTimerRef.current) {
        clearInterval(pollingTimerRef.current);
        pollingTimerRef.current = null;
      }
      supabase.removeChannel(channel);
    };
  }, [salon?.id, loadEntries]);

  useEffect(() => {
    setPage(1);
  }, [searchQuery, filter]);

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
    cooldown: "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300",
  };

  const filteredEntries = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return entries;
    return entries.filter((entry) => {
      return (
        entry.customer_name.toLowerCase().includes(query) ||
        entry.customer_email?.toLowerCase().includes(query) ||
        entry.customer_phone?.toLowerCase().includes(query) ||
        entry.status.toLowerCase().includes(query) ||
        entry.preferred_date.includes(query) ||
        entry.service?.name?.toLowerCase().includes(query) ||
        entry.employee?.full_name?.toLowerCase().includes(query)
      );
    });
  }, [entries, searchQuery]);

  const totalPages = Math.max(1, Math.ceil(filteredEntries.length / pageSize));
  const pagedEntries = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredEntries.slice(start, start + pageSize);
  }, [filteredEntries, page]);

  const handleCreateEntry = async () => {
    if (!salon?.id) return;
    if (!createForm.customerName.trim() || !createForm.serviceId || !createForm.preferredDate) {
      setError("Customer name, service and date are required.");
      return;
    }

    setSavingCreate(true);
    const { error: createError } = await addToWaitlist({
      salonId: salon.id,
      customerName: createForm.customerName,
      customerEmail: createForm.customerEmail || undefined,
      customerPhone: createForm.customerPhone || undefined,
      serviceId: createForm.serviceId,
      employeeId: createForm.employeeId || undefined,
      preferredDate: createForm.preferredDate,
      preferredTimeStart: createForm.preferredTimeStart || undefined,
      preferredTimeEnd: createForm.preferredTimeEnd || undefined,
      preferenceMode: createForm.preferenceMode,
      flexWindowMinutes: Number.parseInt(createForm.flexWindowMinutes || "0", 10) || 0,
    });

    setSavingCreate(false);
    if (createError) {
      setError(createError);
      return;
    }

    setCreateOpen(false);
    setCreateForm({
      customerName: "",
      customerEmail: "",
      customerPhone: "",
      serviceId: "",
      employeeId: "",
      preferredDate: new Date().toISOString().slice(0, 10),
      preferredTimeStart: "",
      preferredTimeEnd: "",
      preferenceMode: "specific_time",
      flexWindowMinutes: "0",
    });
    await loadEntries();
  };

  return (
    <ErrorBoundary>
      {error && <ErrorMessage message={error} onDismiss={() => setError(null)} variant="destructive" className="mb-4" />}

      <div className="rounded-xl border bg-card p-4 shadow-sm">
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <Button size="sm" onClick={() => setCreateOpen(true)}>
            Create waitlist entry
          </Button>
          {["waiting", "notified", "booked", "cooldown", "all"].map((f) => (
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
          <Input
            className="ml-auto h-8 w-full max-w-xs text-xs"
            placeholder="Search customer, service, date, status..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {loading ? (
          <p className="text-sm text-muted-foreground py-4">Loading waitlist...</p>
        ) : entries.length === 0 ? (
          <EmptyState title="No waitlist entries" description="When customers join the waitlist, they'll appear here." />
        ) : (
          <div className="divide-y">
            {pagedEntries.map((entry) => (
              <div key={entry.id} className="flex items-center justify-between py-3 gap-4">
                <div className="min-w-0">
                  <p className="text-sm font-medium">{entry.customer_name}</p>
                  <div className="flex items-center gap-2 mt-0.5 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    <span>{entry.preferred_date}</span>
                    {entry.preferred_time_start && (
                      <span>{entry.preferred_time_start}{entry.preferred_time_end ? `–${entry.preferred_time_end}` : ""}</span>
                    )}
                    <span>&middot; {entry.preference_mode === "specific_time" ? "Specific time" : "Flexible day"}</span>
                    {entry.flex_window_minutes > 0 && <span>&middot; ±{entry.flex_window_minutes} min</span>}
                    {entry.service && <span>&middot; {entry.service.name}</span>}
                    {entry.employee && <span>&middot; {entry.employee.full_name}</span>}
                  </div>
                  {entry.status === "cooldown" && entry.cooldown_until && (
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      Cooldown until {new Date(entry.cooldown_until).toLocaleString()}
                    </p>
                  )}
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
            <div className="flex items-center justify-between pt-4 text-xs text-muted-foreground">
              <span>
                Showing {(page - 1) * pageSize + 1}-{Math.min(page * pageSize, filteredEntries.length)} of {filteredEntries.length}
              </span>
              <div className="flex items-center gap-2">
                <Button size="sm" variant="outline" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>
                  Previous
                </Button>
                <span>{page} / {totalPages}</span>
                <Button size="sm" variant="outline" disabled={page >= totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))}>
                  Next
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Create waitlist entry</DialogTitle>
            <DialogDescription>Add a customer manually when no slot is available.</DialogDescription>
          </DialogHeader>
          <div className="max-h-[60vh] space-y-3 overflow-y-auto pr-1">
            <div className="space-y-1">
              <Label htmlFor="waitlist-name">Customer name</Label>
              <Input
                id="waitlist-name"
                value={createForm.customerName}
                onChange={(e) => setCreateForm((prev) => ({ ...prev, customerName: e.target.value }))}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="waitlist-email">Customer email</Label>
              <Input
                id="waitlist-email"
                type="email"
                value={createForm.customerEmail}
                onChange={(e) => setCreateForm((prev) => ({ ...prev, customerEmail: e.target.value }))}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="waitlist-phone">Customer phone</Label>
              <Input
                id="waitlist-phone"
                value={createForm.customerPhone}
                onChange={(e) => setCreateForm((prev) => ({ ...prev, customerPhone: e.target.value }))}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="waitlist-service">Service</Label>
              <select
                id="waitlist-service"
                className="h-9 w-full rounded-md border bg-background px-3 text-sm"
                value={createForm.serviceId}
                onChange={(e) => setCreateForm((prev) => ({ ...prev, serviceId: e.target.value }))}
              >
                <option value="">Select service</option>
                {services.map((service) => (
                  <option key={service.id} value={service.id}>
                    {service.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <Label htmlFor="waitlist-employee">Preferred employee (optional)</Label>
              <select
                id="waitlist-employee"
                className="h-9 w-full rounded-md border bg-background px-3 text-sm"
                value={createForm.employeeId}
                onChange={(e) => setCreateForm((prev) => ({ ...prev, employeeId: e.target.value }))}
              >
                <option value="">Any employee</option>
                {employees.map((employee) => (
                  <option key={employee.id} value={employee.id}>
                    {employee.full_name}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <Label htmlFor="waitlist-date">Preferred date</Label>
              <Input
                id="waitlist-date"
                type="date"
                value={createForm.preferredDate}
                onChange={(e) => setCreateForm((prev) => ({ ...prev, preferredDate: e.target.value }))}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="waitlist-mode">Preference mode</Label>
                <select
                  id="waitlist-mode"
                  className="h-9 w-full rounded-md border bg-background px-3 text-sm"
                  value={createForm.preferenceMode}
                  onChange={(e) =>
                    setCreateForm((prev) => ({
                      ...prev,
                      preferenceMode: e.target.value as "specific_time" | "day_flexible",
                    }))
                  }
                >
                  <option value="specific_time">Specific time</option>
                  <option value="day_flexible">Flexible day</option>
                </select>
              </div>
              <div className="space-y-1">
                <Label htmlFor="waitlist-flex-window">Flex window (minutes)</Label>
                <Input
                  id="waitlist-flex-window"
                  type="number"
                  min={0}
                  max={2880}
                  value={createForm.flexWindowMinutes}
                  onChange={(e) => setCreateForm((prev) => ({ ...prev, flexWindowMinutes: e.target.value }))}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="waitlist-start">Preferred start</Label>
                <Input
                  id="waitlist-start"
                  type="time"
                  value={createForm.preferredTimeStart}
                  disabled={createForm.preferenceMode === "day_flexible"}
                  onChange={(e) => setCreateForm((prev) => ({ ...prev, preferredTimeStart: e.target.value }))}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="waitlist-end">Preferred end</Label>
                <Input
                  id="waitlist-end"
                  type="time"
                  value={createForm.preferredTimeEnd}
                  disabled={createForm.preferenceMode === "day_flexible"}
                  onChange={(e) => setCreateForm((prev) => ({ ...prev, preferredTimeEnd: e.target.value }))}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateEntry} disabled={savingCreate}>
              {savingCreate ? "Saving..." : "Create entry"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </ErrorBoundary>
  );
}
