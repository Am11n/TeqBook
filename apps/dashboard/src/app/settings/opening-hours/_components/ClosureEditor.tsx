"use client";

import { useState, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/lib/supabase-client";
import { Plus, Trash2, Calendar } from "lucide-react";
import { type ClosureRow, getClosureSuggestions } from "./types";

interface ClosureEditorProps {
  salonId: string;
  appLocale: string;
}

export function ClosureEditor({ salonId, appLocale }: ClosureEditorProps) {
  const [closures, setClosures] = useState<ClosureRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [newClosureDate, setNewClosureDate] = useState("");
  const [newClosureReason, setNewClosureReason] = useState("");
  const [adding, setAdding] = useState(false);

  const loadClosures = useCallback(async () => {
    setLoading(true);
    const today = new Date().toISOString().split("T")[0];
    const { data, error } = await supabase
      .from("salon_closures")
      .select("*")
      .eq("salon_id", salonId)
      .gte("closed_date", today)
      .order("closed_date", { ascending: true });
    if (!error && data) setClosures(data as ClosureRow[]);
    setLoading(false);
  }, [salonId]);

  useEffect(() => {
    loadClosures();
  }, [loadClosures]);

  const addClosure = async () => {
    if (!newClosureDate) return;
    setAdding(true);
    const { error } = await supabase.from("salon_closures").insert({
      salon_id: salonId,
      closed_date: newClosureDate,
      reason: newClosureReason || null,
    });
    if (!error) {
      setNewClosureDate("");
      setNewClosureReason("");
      await loadClosures();
    }
    setAdding(false);
  };

  const deleteClosure = async (id: string) => {
    await supabase.from("salon_closures").delete().eq("id", id);
    setClosures((prev) => prev.filter((c) => c.id !== id));
  };

  const closureSuggestions = getClosureSuggestions();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <Calendar className="h-5 w-5 text-muted-foreground" />
          Upcoming closures
        </CardTitle>
        <CardDescription className="text-sm text-muted-foreground">
          Holidays and closed days. Bookings will be blocked on these dates.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-2">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : (
          <>
            {closures.length === 0 && (
              <div className="mb-4">
                <p className="text-sm text-muted-foreground mb-2">
                  No closures planned. Add your first:
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {closureSuggestions.map((s) => (
                    <button
                      key={s.date}
                      type="button"
                      onClick={() => { setNewClosureDate(s.date); setNewClosureReason(s.label); }}
                      className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium text-muted-foreground hover:bg-muted/50 transition-colors"
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {closures.length > 0 && (
              <div className="mb-4 space-y-2">
                {closures.map((c) => (
                  <div
                    key={c.id}
                    className="flex items-center justify-between rounded-lg border px-4 py-2.5"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium tabular-nums">
                        {new Date(c.closed_date + "T00:00:00").toLocaleDateString(
                          appLocale === "nb" ? "nb-NO" : "en-US",
                          { day: "numeric", month: "long", year: "numeric" }
                        )}
                      </span>
                      {c.reason && (
                        <span className="text-sm text-muted-foreground">
                          — &ldquo;{c.reason}&rdquo;
                        </span>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => deleteClosure(c.id)}
                      className="text-muted-foreground hover:text-destructive transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="flex items-end gap-3">
              <div className="flex-1 space-y-1">
                <label className="text-xs font-medium">Date</label>
                <input
                  type="date"
                  value={newClosureDate}
                  min={new Date().toISOString().split("T")[0]}
                  onChange={(e) => setNewClosureDate(e.target.value)}
                  className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm tabular-nums outline-none transition focus:ring-1 focus:ring-ring"
                />
              </div>
              <div className="flex-1 space-y-1">
                <label className="text-xs font-medium">Reason (optional)</label>
                <input
                  type="text"
                  value={newClosureReason}
                  onChange={(e) => setNewClosureReason(e.target.value)}
                  placeholder="e.g. 17. mai, Christmas"
                  className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm outline-none transition focus:ring-1 focus:ring-ring"
                />
              </div>
              <Button variant="outline" size="sm" onClick={addClosure} disabled={!newClosureDate || adding}>
                <Plus className="mr-1.5 h-3.5 w-3.5" />
                {adding ? "Adding..." : "Add closure"}
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
