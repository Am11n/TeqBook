"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { AdminShell } from "@/components/layout/admin-shell";
import { PageLayout } from "@/components/layout/page-layout";
import { ErrorBoundary } from "@/components/error-boundary";
import { ErrorMessage } from "@/components/feedback/error-message";
import { InsightText } from "@/components/shared/insight-text";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { KpiCard } from "@/components/shared/kpi-card";
import { DataTable, type ColumnDef } from "@/components/shared/data-table";
import { Badge } from "@/components/ui/badge";
import { useCurrentSalon } from "@/components/salon-provider";
import { supabase } from "@/lib/supabase-client";
import { Building2, Calendar, Users, TrendingUp, ArrowUpRight, ArrowDownRight } from "lucide-react";

type TimeSeriesPoint = { day: string; value: number };
type FunnelStep = { step: string; count: number };
type TopSalon = { salon_id: string; salon_name: string; booking_count: number; growth_pct: number };
type PlanDist = { plan: string; count: number };

const PLAN_COLORS: Record<string, string> = { starter: "bg-muted", pro: "bg-blue-500", business: "bg-purple-500" };

const topSalonColumns: ColumnDef<TopSalon>[] = [
  { id: "salon_name", header: "Salon", cell: (r) => <span className="font-medium">{r.salon_name}</span>, hideable: false },
  { id: "booking_count", header: "Bookings", cell: (r) => r.booking_count.toLocaleString(), sortable: true },
  { id: "growth_pct", header: "Growth", cell: (r) => (
    <span className={`inline-flex items-center gap-0.5 text-xs font-medium ${r.growth_pct >= 0 ? "text-emerald-600" : "text-red-600"}`}>
      {r.growth_pct >= 0 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
      {Math.abs(r.growth_pct)}%
    </span>
  ), sortable: true },
];

export default function AdminAnalyticsPage() {
  const { isSuperAdmin, loading: contextLoading } = useCurrentSalon();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [period, setPeriod] = useState<"7d" | "30d" | "90d">("30d");
  const periodDays = period === "7d" ? 7 : period === "30d" ? 30 : 90;

  const [bookingsSeries, setBookingsSeries] = useState<TimeSeriesPoint[]>([]);
  const [salonsSeries, setSalonsSeries] = useState<TimeSeriesPoint[]>([]);
  const [activeSeries, setActiveSeries] = useState<TimeSeriesPoint[]>([]);
  const [funnel, setFunnel] = useState<FunnelStep[]>([]);
  const [topSalons, setTopSalons] = useState<TopSalon[]>([]);
  const [planDist, setPlanDist] = useState<PlanDist[]>([]);

  const loadAnalytics = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [bk, ns, as_, fn, ts, pd] = await Promise.all([
        supabase.rpc("get_admin_activity_timeseries", { metric: "bookings", period_days: periodDays }),
        supabase.rpc("get_admin_activity_timeseries", { metric: "new_salons", period_days: periodDays }),
        supabase.rpc("get_admin_activity_timeseries", { metric: "active_salons", period_days: periodDays }),
        supabase.rpc("get_admin_activation_funnel", { period_days: periodDays }),
        supabase.rpc("get_admin_top_salons", { period_days: periodDays, lim: 10 }),
        supabase.rpc("get_admin_plan_distribution"),
      ]);

      setBookingsSeries((bk.data as TimeSeriesPoint[]) ?? []);
      setSalonsSeries((ns.data as TimeSeriesPoint[]) ?? []);
      setActiveSeries((as_.data as TimeSeriesPoint[]) ?? []);
      setFunnel((fn.data as FunnelStep[]) ?? []);
      setTopSalons((ts.data as TopSalon[]) ?? []);
      setPlanDist((pd.data as PlanDist[]) ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, [periodDays]);

  useEffect(() => {
    if (!contextLoading && !isSuperAdmin) { router.push("/login"); return; }
    if (isSuperAdmin) loadAnalytics();
  }, [isSuperAdmin, contextLoading, router, loadAnalytics]);

  if (contextLoading || !isSuperAdmin) return null;

  const totalBookings = bookingsSeries.reduce((s, p) => s + Number(p.value), 0);
  const totalNewSalons = salonsSeries.reduce((s, p) => s + Number(p.value), 0);
  const avgActive = activeSeries.length > 0 ? Math.round(activeSeries.reduce((s, p) => s + Number(p.value), 0) / activeSeries.length) : 0;
  const totalPlans = planDist.reduce((s, p) => s + Number(p.count), 0);

  // ── Compute insight messages ──────────────────────────
  // Funnel: find biggest drop-off step
  const funnelInsight = (() => {
    if (funnel.length < 2) return null;
    let biggestDrop = 0;
    let dropStep = "";
    for (let i = 1; i < funnel.length; i++) {
      const drop = Number(funnel[i - 1].count) - Number(funnel[i].count);
      if (drop > biggestDrop) {
        biggestDrop = drop;
        dropStep = funnel[i].step;
      }
    }
    if (!dropStep || biggestDrop === 0) return null;
    const activationRate = funnel[0].count > 0
      ? Math.round((Number(funnel[funnel.length - 1].count) / Number(funnel[0].count)) * 100)
      : 0;
    return `Activation rate: ${activationRate}%. Most salons drop at "${dropStep}" (${biggestDrop} salons lost).`;
  })();

  // Bookings trend: compare first vs second half of period
  const bookingsInsight = (() => {
    if (bookingsSeries.length < 4) return null;
    const mid = Math.floor(bookingsSeries.length / 2);
    const firstHalf = bookingsSeries.slice(0, mid).reduce((s, p) => s + Number(p.value), 0);
    const secondHalf = bookingsSeries.slice(mid).reduce((s, p) => s + Number(p.value), 0);
    if (firstHalf === 0) return null;
    const changePct = Math.round(((secondHalf - firstHalf) / firstHalf) * 100);
    if (changePct === 0) return "Booking volume is stable across the period.";
    return `Bookings ${changePct > 0 ? "up" : "down"} ${Math.abs(changePct)}% in the second half of this period vs the first half.`;
  })();

  // Plan distribution insight
  const planInsight = (() => {
    if (planDist.length === 0 || totalPlans === 0) return null;
    const starterCount = planDist.find((p) => p.plan === "starter")?.count ?? 0;
    const starterPct = Math.round((Number(starterCount) / totalPlans) * 100);
    if (starterPct > 50) return `${starterPct}% of salons are on the Starter plan. Upsell opportunity.`;
    const proPct = Math.round((Number(planDist.find((p) => p.plan === "pro")?.count ?? 0) / totalPlans) * 100);
    return `Pro plan adoption: ${proPct}%. Starter: ${starterPct}%.`;
  })();

  // Simple SVG bar chart renderer
  function BarChart({ data, color = "#3b82f6" }: { data: TimeSeriesPoint[]; color?: string }) {
    if (data.length === 0) return <p className="text-sm text-muted-foreground">No data</p>;
    const max = Math.max(...data.map((d) => Number(d.value)), 1);
    const w = 100 / data.length;
    return (
      <svg viewBox="0 0 100 40" className="w-full h-32" preserveAspectRatio="none">
        {data.map((d, i) => (
          <rect key={i} x={i * w + w * 0.1} y={40 - (Number(d.value) / max) * 38} width={w * 0.8} height={(Number(d.value) / max) * 38} fill={color} rx={0.5} opacity={0.85} />
        ))}
      </svg>
    );
  }

  return (
    <ErrorBoundary>
      <AdminShell>
        <PageLayout title="Metrics" description="Platform analytics and growth metrics" showPeriodSelector period={period} onPeriodChange={setPeriod}>
          {error && <ErrorMessage message={error} onDismiss={() => setError(null)} variant="destructive" className="mb-4" />}

          {/* KPI row */}
          <div className="grid gap-4 grid-cols-2 lg:grid-cols-4 mb-6">
            <KpiCard title="Bookings" value={totalBookings} icon={Calendar} trendData={bookingsSeries.map((d) => Number(d.value))} period={period} />
            <KpiCard title="New Salons" value={totalNewSalons} icon={Building2} trendData={salonsSeries.map((d) => Number(d.value))} period={period} />
            <KpiCard title="Avg. Active/day" value={avgActive} icon={TrendingUp} period={period} />
            <KpiCard title="Total Salons" value={totalPlans} icon={Users} />
          </div>

          {/* Charts row */}
          <div className="grid gap-6 lg:grid-cols-2 mb-6">
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm">Bookings / day</CardTitle></CardHeader>
              <CardContent>
                <BarChart data={bookingsSeries} color="#3b82f6" />
                {bookingsInsight && <InsightText message={bookingsInsight} />}
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm">New Salons / day</CardTitle></CardHeader>
              <CardContent><BarChart data={salonsSeries} color="#8b5cf6" /></CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm">Active Salons / day</CardTitle></CardHeader>
              <CardContent><BarChart data={activeSeries} color="#10b981" /></CardContent>
            </Card>

            {/* Activation Funnel */}
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm">Activation Funnel</CardTitle></CardHeader>
              <CardContent>
                {funnel.length === 0 ? <p className="text-sm text-muted-foreground">No data</p> : (
                  <div className="space-y-3">
                    {funnel.map((step, i) => {
                      const pct = funnel[0].count > 0 ? Math.round((Number(step.count) / Number(funnel[0].count)) * 100) : 0;
                      return (
                        <div key={step.step}>
                          <div className="flex justify-between text-xs mb-1">
                            <span>{step.step}</span>
                            <span className="text-muted-foreground">{step.count} ({pct}%)</span>
                          </div>
                          <div className="w-full bg-muted rounded-full h-2">
                            <div className="bg-primary h-2 rounded-full transition-all" style={{ width: `${pct}%` }} />
                          </div>
                        </div>
                      );
                    })}
                    {funnelInsight && <InsightText message={funnelInsight} />}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Bottom row: Top salons + Plan distribution */}
          <div className="grid gap-6 lg:grid-cols-3 mb-6">
            <Card className="lg:col-span-2">
              <CardHeader className="pb-2"><CardTitle className="text-sm">Top Salons (by bookings)</CardTitle></CardHeader>
              <CardContent>
                <DataTable
                  columns={topSalonColumns}
                  data={topSalons}
                  totalCount={topSalons.length}
                  rowKey={(r) => r.salon_id}
                  page={0}
                  pageSize={10}
                  onPageChange={() => {}}
                  loading={loading}
                  emptyMessage="No data"
                  storageKey="top-salons"
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm">Plan Distribution</CardTitle></CardHeader>
              <CardContent>
                {planDist.length === 0 ? <p className="text-sm text-muted-foreground">No data</p> : (
                  <div className="space-y-3">
                    {planDist.map((p) => {
                      const pct = totalPlans > 0 ? Math.round((Number(p.count) / totalPlans) * 100) : 0;
                      return (
                        <div key={p.plan}>
                          <div className="flex justify-between text-xs mb-1">
                            <span className="capitalize">{p.plan}</span>
                            <span className="text-muted-foreground">{p.count} ({pct}%)</span>
                          </div>
                          <div className="w-full bg-muted rounded-full h-2">
                            <div className={`h-2 rounded-full ${PLAN_COLORS[p.plan] ?? "bg-primary"}`} style={{ width: `${pct}%` }} />
                          </div>
                        </div>
                      );
                    })}
                    {planInsight && <InsightText message={planInsight} />}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </PageLayout>
      </AdminShell>
    </ErrorBoundary>
  );
}
