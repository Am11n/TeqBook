"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { AdminShell } from "@/components/layout/admin-shell";
import { PageLayout } from "@/components/layout/page-layout";
import { ErrorBoundary } from "@/components/error-boundary";
import { ErrorMessage } from "@/components/feedback/error-message";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCurrentSalon } from "@/components/salon-provider";
import { KpiCard } from "@/components/shared/kpi-card";
import { QuickActions, type QuickAction } from "@/components/shared/quick-actions";
import { NeedsAttentionFeed, type AttentionItem } from "@/components/shared/needs-attention-feed";
import { RecentActivity, type ActivityEvent } from "@/components/shared/recent-activity";
import { DetailDrawer } from "@/components/shared/detail-drawer";
import { supabase } from "@/lib/supabase-client";
import { logError } from "@/lib/services/logger";
import {
  Building2,
  UserPlus,
  CreditCard,
  Pause,
  Download,
  Search,
  TrendingUp,
  Users,
  Calendar,
  AlertTriangle,
  Inbox,
  Activity,
} from "lucide-react";

type DashboardKpis = {
  active_salons: number;
  active_salons_prev: number;
  new_salons: number;
  new_salons_prev: number;
  activated_salons: number;
  total_bookings: number;
  total_bookings_prev: number;
  open_support_cases: number;
  total_users: number;
};

type TrendPoint = { day: string; value: number };

export default function AdminDashboardPage() {
  const { isSuperAdmin, loading: contextLoading } = useCurrentSalon();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [period, setPeriod] = useState<"7d" | "30d" | "90d">("7d");
  const [kpis, setKpis] = useState<DashboardKpis | null>(null);
  const [trends, setTrends] = useState<Record<string, number[]>>({});
  const [attentionItems, setAttentionItems] = useState<AttentionItem[]>([]);
  const [recentEvents, setRecentEvents] = useState<ActivityEvent[]>([]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerEvent, setDrawerEvent] = useState<ActivityEvent | null>(null);

  const periodDays = period === "7d" ? 7 : period === "30d" ? 30 : 90;

  useEffect(() => {
    if (!contextLoading && !isSuperAdmin) {
      router.push("/login");
      return;
    }
    if (isSuperAdmin) loadDashboard();
  }, [isSuperAdmin, contextLoading, router, periodDays]);

  async function loadDashboard() {
    setLoading(true);
    setError(null);
    try {
      const [kpiResult, bookingsTrend, salonsTrend, attentionResult, eventsResult] =
        await Promise.all([
          supabase.rpc("get_admin_dashboard_kpis", { period_days: periodDays }),
          supabase.rpc("get_admin_kpi_trend", { metric: "bookings", period_days: periodDays }),
          supabase.rpc("get_admin_kpi_trend", { metric: "new_salons", period_days: periodDays }),
          supabase.rpc("get_needs_attention_items", { lim: 10 }),
          supabase
            .from("security_audit_log")
            .select("id, action, resource_type, user_id, salon_id, created_at, metadata")
            .order("created_at", { ascending: false })
            .limit(20),
        ]);

      if (kpiResult.data?.[0]) setKpis(kpiResult.data[0]);
      if (kpiResult.error) logError("KPI load error", kpiResult.error);

      const bt = (bookingsTrend.data as TrendPoint[] | null)?.map((d) => d.value) ?? [];
      const st = (salonsTrend.data as TrendPoint[] | null)?.map((d) => d.value) ?? [];
      setTrends({ bookings: bt, new_salons: st });

      if (attentionResult.data) {
        setAttentionItems(
          (attentionResult.data as Array<Record<string, unknown>>).map((item) => ({
            id: item.item_id as string,
            type: (item.item_type as AttentionItem["type"]) || "manual",
            title: item.title as string,
            description: item.description as string,
            entityType: item.entity_type as "salon" | "user",
            entityId: item.entity_id as string,
            entityName: item.entity_name as string,
            severity: (item.severity as AttentionItem["severity"]) || "medium",
            createdAt: item.created_at as string,
          }))
        );
      }

      if (eventsResult.data) {
        setRecentEvents(
          eventsResult.data.map((e) => ({
            id: e.id,
            action: e.action,
            resource_type: e.resource_type,
            user_id: e.user_id,
            salon_id: e.salon_id,
            created_at: e.created_at,
            metadata: e.metadata as Record<string, unknown> | null,
          }))
        );
      }
    } catch (err) {
      logError("Dashboard load error", err);
      setError("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  }

  function calcChange(current: number, prev: number): number | null {
    if (prev === 0) return current > 0 ? 100 : null;
    return ((current - prev) / prev) * 100;
  }

  const quickActions: QuickAction[] = [
    { id: "create-salon", label: "Create Salon", icon: Building2, onClick: () => router.push("/salons") },
    { id: "invite-user", label: "Invite User", icon: UserPlus, onClick: () => router.push("/users") },
    { id: "change-plan", label: "Change Plan", icon: CreditCard, onClick: () => router.push("/plans") },
    { id: "suspend", label: "Suspend", icon: Pause, onClick: () => router.push("/salons") },
    { id: "export", label: "Export Report", icon: Download, onClick: () => router.push("/analytics") },
    { id: "audit-search", label: "Audit Search", icon: Search, onClick: () => router.push("/audit-logs") },
  ];

  if (contextLoading || loading) {
    return (
      <AdminShell>
        <PageLayout title="Admin Dashboard" description="Loading...">
          <p className="text-sm text-muted-foreground">Loading dashboard...</p>
        </PageLayout>
      </AdminShell>
    );
  }

  if (!isSuperAdmin) return null;

  return (
    <ErrorBoundary>
      <AdminShell>
        <PageLayout
          title="Dashboard"
          description="Platform overview and operations"
          showCard={false}
          showPeriodSelector
          period={period}
          onPeriodChange={setPeriod}
        >
          {error && (
            <ErrorMessage message={error} onDismiss={() => setError(null)} variant="destructive" className="mb-4" />
          )}

          {/* Section 1: KPI Row */}
          <div className="grid gap-4 grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 mb-6">
            <KpiCard
              title="Active Salons"
              value={kpis?.active_salons ?? 0}
              change={kpis ? calcChange(kpis.active_salons, kpis.active_salons_prev) : null}
              period={period === "90d" ? "90d" : period}
              icon={Building2}
              onClick={() => router.push("/salons")}
            />
            <KpiCard
              title="New Salons"
              value={kpis?.new_salons ?? 0}
              change={kpis ? calcChange(kpis.new_salons, kpis.new_salons_prev) : null}
              period={period === "90d" ? "90d" : period}
              trendData={trends.new_salons}
              icon={TrendingUp}
              onClick={() => router.push("/salons")}
            />
            <KpiCard
              title="Activated Salons"
              value={kpis?.activated_salons ?? 0}
              icon={Activity}
              onClick={() => router.push("/onboarding")}
            />
            <KpiCard
              title="Bookings"
              value={kpis?.total_bookings ?? 0}
              change={kpis ? calcChange(kpis.total_bookings, kpis.total_bookings_prev) : null}
              period={period === "90d" ? "90d" : period}
              trendData={trends.bookings}
              icon={Calendar}
            />
            <KpiCard
              title="Total Users"
              value={kpis?.total_users ?? 0}
              icon={Users}
              onClick={() => router.push("/users")}
            />
            <KpiCard
              title="Open Cases"
              value={kpis?.open_support_cases ?? 0}
              icon={Inbox}
              positiveIsGood={false}
              onClick={() => router.push("/support")}
            />
          </div>

          {/* Section 2 + 3: Needs Attention + Quick Actions side by side */}
          <div className="grid gap-6 lg:grid-cols-3 mb-6">
            <Card className="lg:col-span-2">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-amber-500" />
                  Needs Attention
                </CardTitle>
              </CardHeader>
              <CardContent>
                <NeedsAttentionFeed
                  items={attentionItems}
                  onView={(item) => {
                    if (item.entityType === "salon") router.push("/salons");
                    else router.push("/users");
                  }}
                  onResolve={() => loadDashboard()}
                  maxItems={5}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <QuickActions actions={quickActions} className="grid-cols-2 lg:grid-cols-2" />
              </CardContent>
            </Card>
          </div>

          {/* Section 4: Recent Activity */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <RecentActivity
                events={recentEvents}
                onEventClick={(event) => {
                  setDrawerEvent(event);
                  setDrawerOpen(true);
                }}
                maxEvents={15}
              />
            </CardContent>
          </Card>

          {/* Event Detail Drawer */}
          <DetailDrawer
            open={drawerOpen}
            onOpenChange={setDrawerOpen}
            title="Event Detail"
            description={drawerEvent?.action ?? ""}
          >
            {drawerEvent && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div><span className="text-muted-foreground">Action:</span> <span className="font-medium">{drawerEvent.action}</span></div>
                  <div><span className="text-muted-foreground">Type:</span> <span className="font-medium">{drawerEvent.resource_type}</span></div>
                  <div><span className="text-muted-foreground">User:</span> <span className="font-mono text-xs">{drawerEvent.user_id ?? "System"}</span></div>
                  <div><span className="text-muted-foreground">Time:</span> <span>{new Date(drawerEvent.created_at).toLocaleString()}</span></div>
                </div>
                {drawerEvent.metadata && (
                  <div>
                    <p className="text-sm font-medium mb-1">Metadata</p>
                    <pre className="text-xs bg-muted p-3 rounded-lg overflow-auto max-h-64">
                      {JSON.stringify(drawerEvent.metadata, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            )}
          </DetailDrawer>
        </PageLayout>
      </AdminShell>
    </ErrorBoundary>
  );
}
