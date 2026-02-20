"use client";

import { useState, useEffect, useMemo } from "react";
import { ErrorBoundary } from "@/components/error-boundary";
import { ErrorMessage } from "@/components/feedback/error-message";
import { EmptyState } from "@/components/empty-state";
import { useCurrentSalon } from "@/components/salon-provider";
import {
  getCapacityUtilization,
  getGapAnalysis,
  type EmployeeUtilization,
  type GapSlot,
  type CapacitySummary,
} from "@/lib/services/capacity-service";

function UtilizationBadge({ pct }: { pct: number }) {
  const color =
    pct >= 80 ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
    : pct >= 60 ? "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300"
    : "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300";

  return (
    <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${color}`}>
      {pct}%
    </span>
  );
}

export default function CapacityReportPage() {
  const { salon } = useCurrentSalon();

  const now = new Date();
  const monday = new Date(now);
  monday.setDate(now.getDate() - now.getDay() + 1);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);

  const [startDate, setStartDate] = useState(monday.toISOString().slice(0, 10));
  const [endDate, setEndDate] = useState(sunday.toISOString().slice(0, 10));
  const [utilization, setUtilization] = useState<EmployeeUtilization[]>([]);
  const [summary, setSummary] = useState<CapacitySummary | null>(null);
  const [gapDate, setGapDate] = useState(now.toISOString().slice(0, 10));
  const [gaps, setGaps] = useState<GapSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!salon?.id) return;
    setLoading(true);
    getCapacityUtilization(salon.id, startDate, endDate).then(({ data, error }) => {
      setUtilization(data?.byEmployee ?? []);
      setSummary(data?.summary ?? null);
      if (error) setError(error);
      setLoading(false);
    });
  }, [salon?.id, startDate, endDate]);

  useEffect(() => {
    if (!salon?.id) return;
    getGapAnalysis(salon.id, gapDate).then(({ data, error }) => {
      setGaps(data ?? []);
      if (error) setError(error);
    });
  }, [salon?.id, gapDate]);

  // Build heatmap data: employees x days
  const heatmapData = useMemo(() => {
    const employees = [...new Set(utilization.map((u) => u.employeeId))];
    const dates = [...new Set(utilization.map((u) => u.date))].sort();
    const employeeNames: Record<string, string> = {};
    for (const u of utilization) {
      employeeNames[u.employeeId] = u.employeeName;
    }

    const grid: Record<string, Record<string, number>> = {};
    for (const empId of employees) {
      grid[empId] = {};
      for (const date of dates) {
        const entry = utilization.find((u) => u.employeeId === empId && u.date === date);
        grid[empId][date] = entry?.utilizationPct ?? -1; // -1 = no shift
      }
    }

    return { employees, dates, employeeNames, grid };
  }, [utilization]);

  return (
    <ErrorBoundary>
      {error && <ErrorMessage message={error} onDismiss={() => setError(null)} variant="destructive" className="mb-4" />}

        {/* Date range */}
        <div className="flex items-center gap-3 mb-4">
          <div>
            <label className="text-xs font-medium text-muted-foreground">From</label>
            <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="ml-2 h-8 rounded-md border bg-background px-2 text-xs" />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground">To</label>
            <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="ml-2 h-8 rounded-md border bg-background px-2 text-xs" />
          </div>
        </div>

        {/* Summary cards */}
        {summary && (
          <div className="flex flex-wrap gap-4 mb-4">
            <div className="rounded-lg border bg-card px-4 py-3 shadow-sm">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Avg Utilization</p>
              <p className="text-lg font-semibold">{summary.averageUtilization}%</p>
            </div>
            {summary.busiestDay && (
              <div className="rounded-lg border bg-card px-4 py-3 shadow-sm">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Busiest Day</p>
                <p className="text-lg font-semibold">{summary.busiestDay}</p>
              </div>
            )}
            {summary.leastUtilizedEmployee && (
              <div className="rounded-lg border bg-card px-4 py-3 shadow-sm">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Least Utilized</p>
                <p className="text-lg font-semibold">{summary.leastUtilizedEmployee}</p>
              </div>
            )}
          </div>
        )}

        {/* Heatmap */}
        <div className="rounded-xl border bg-card p-4 shadow-sm mb-4">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Utilization Heatmap</h3>

          {loading ? (
            <p className="text-sm text-muted-foreground py-4">Loading...</p>
          ) : heatmapData.employees.length === 0 ? (
            <EmptyState title="No data" description="No shifts or bookings found for this period." />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b">
                    <th className="py-2 text-left font-medium text-muted-foreground">Employee</th>
                    {heatmapData.dates.map((date) => (
                      <th key={date} className="py-2 text-center font-medium text-muted-foreground min-w-[60px]">
                        {new Date(date + "T12:00:00").toLocaleDateString(undefined, { weekday: "short", day: "numeric" })}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {heatmapData.employees.map((empId) => (
                    <tr key={empId} className="border-b last:border-0">
                      <td className="py-2 font-medium">{heatmapData.employeeNames[empId]}</td>
                      {heatmapData.dates.map((date) => {
                        const pct = heatmapData.grid[empId][date];
                        return (
                          <td key={date} className="py-2 text-center">
                            {pct >= 0 ? <UtilizationBadge pct={pct} /> : <span className="text-[10px] text-muted-foreground">—</span>}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Gap Finder */}
        <div className="rounded-xl border bg-card p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Gap Finder</h3>
            <div>
              <label className="text-xs text-muted-foreground mr-2">Date</label>
              <input type="date" value={gapDate} onChange={(e) => setGapDate(e.target.value)} className="h-8 rounded-md border bg-background px-2 text-xs" />
            </div>
          </div>

          {gaps.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4">No significant gaps found (all gaps &lt; 30 min).</p>
          ) : (
            <div className="divide-y">
              {gaps.map((gap, i) => (
                <div key={i} className="flex items-center justify-between py-2 text-xs">
                  <div>
                    <span className="font-medium">{gap.employeeName}</span>
                    <span className="text-muted-foreground ml-2">{gap.gapStart} – {gap.gapEnd}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">{gap.gapMinutes} min</span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                      gap.gapMinutes >= 120 ? "bg-red-100 text-red-700" :
                      gap.gapMinutes >= 60 ? "bg-amber-100 text-amber-700" :
                      "bg-blue-100 text-blue-700"
                    }`}>
                      {gap.gapMinutes >= 120 ? "Large" : gap.gapMinutes >= 60 ? "Medium" : "Small"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
    </ErrorBoundary>
  );
}
