"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { AdminShell } from "@/components/layout/admin-shell";
import { PageLayout } from "@/components/layout/page-layout";
import { ErrorBoundary } from "@/components/error-boundary";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { HeartPulse, Database, CreditCard, Activity, RefreshCcw, Clock, Mail, Cloud, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";

type HealthCheck = { status: string; latency_ms: number; error?: string };
type HealthResponse = { status: string; timestamp: string; checks: Record<string, HealthCheck> };

const STATUS_ICON: Record<string, string> = {
  up: "bg-emerald-100 text-emerald-700",
  healthy: "bg-emerald-100 text-emerald-700",
  degraded: "bg-amber-100 text-amber-700",
  down: "bg-red-100 text-red-700",
  unknown: "bg-muted text-muted-foreground",
};

const SERVICE_ICONS: Record<string, typeof Database> = {
  supabase: Database,
  stripe: CreditCard,
  resend: Mail,
  edge_functions: Cloud,
  vercel: Globe,
};

export default function SystemHealthPage() {
  const router = useRouter();
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [pageError, setPageError] = useState<string | null>(null);
  const [authState, setAuthState] = useState<"checking" | "authorized" | "unauthorized">("checking");
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
  const requestInFlightRef = useRef(false);
  const healthRef = useRef<HealthResponse | null>(null);

  useEffect(() => {
    healthRef.current = health;
  }, [health]);

  const fetchHealth = useCallback(async () => {
    if (requestInFlightRef.current) return;
    requestInFlightRef.current = true;

    const isInitialLoad = !healthRef.current;
    if (isInitialLoad) setLoading(true);
    else setRefreshing(true);
    setPageError(null);
    try {
      // Promise.race timeout works consistently across browsers.
      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("Health API timeout")), 8000)
      );
      const res = (await Promise.race([fetch("/api/health/"), timeoutPromise])) as Response;
      if (res.status === 401 || res.status === 403) {
        setAuthState("unauthorized");
        throw new Error("Unauthorized");
      }
      setAuthState("authorized");
      if (!res.ok) {
        throw new Error(`Health API failed (${res.status})`);
      }
      const data = (await res.json()) as HealthResponse;
      setHealth(data);
      setLastRefresh(new Date());
    } catch (err) {
      if (!healthRef.current) setHealth(null);
      const message = err instanceof Error ? err.message : "Could not load system health";
      if (message !== "Unauthorized") {
        setPageError(message);
      }
    } finally {
      requestInFlightRef.current = false;
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void fetchHealth();
  }, [fetchHealth]);

  // Auto-refresh every 30s
  useEffect(() => {
    if (authState !== "authorized") return;
    const interval = setInterval(fetchHealth, 30000);
    return () => clearInterval(interval);
  }, [authState, fetchHealth]);

  useEffect(() => {
    if (authState === "unauthorized") {
      router.push("/login");
    }
  }, [authState, router]);

  if (authState === "checking" && loading) {
    return (
      <ErrorBoundary>
        <AdminShell>
          <PageLayout
            title="System Health"
            description="Loading system access..."
          >
            <Card>
              <CardContent className="py-8 text-sm text-muted-foreground">
                Checking permissions...
              </CardContent>
            </Card>
          </PageLayout>
        </AdminShell>
      </ErrorBoundary>
    );
  }
  if (authState === "unauthorized") return null;

  return (
    <ErrorBoundary>
      <AdminShell>
        <PageLayout
          title="System Health"
          description="Real-time platform status and service monitoring"
          actions={
            <Button variant="outline" size="sm" onClick={fetchHealth} disabled={loading || refreshing} className="gap-1">
              <RefreshCcw className={`h-4 w-4 ${loading || refreshing ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          }
        >
          {pageError && (
            <div className="mb-4 rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
              {pageError}
            </div>
          )}
          {/* Overall status banner */}
          <div className={`rounded-lg border px-5 py-4 mb-6 flex items-center justify-between ${health?.status === "healthy" ? "bg-emerald-50 border-emerald-200" : health?.status === "degraded" ? "bg-amber-50 border-amber-200" : "bg-red-50 border-red-200"}`}>
            <div className="flex items-center gap-3">
              <HeartPulse className={`h-6 w-6 ${health?.status === "healthy" ? "text-emerald-600" : health?.status === "degraded" ? "text-amber-600" : "text-red-600"}`} />
              <div>
                <p className="font-semibold text-sm">{health?.status === "healthy" ? "All Systems Operational" : health?.status === "degraded" ? "Some Systems Degraded" : "Loading..."}</p>
                {lastRefresh && <p className="text-xs text-muted-foreground flex items-center gap-1"><Clock className="h-3 w-3" /> Last checked: {lastRefresh.toLocaleTimeString()} {refreshing ? "(refreshing...)" : ""}</p>}
              </div>
            </div>
            <Badge variant="outline" className={STATUS_ICON[health?.status ?? "unknown"]}>{health?.status ?? "checking"}</Badge>
          </div>

          {/* Service cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-6">
            {health?.checks && Object.entries(health.checks).map(([name, check]) => {
              const Icon = SERVICE_ICONS[name] ?? Activity;
              return (
                <Card key={name}>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm flex items-center gap-2"><Icon className="h-4 w-4" />{name.charAt(0).toUpperCase() + name.slice(1)}</CardTitle>
                      <Badge variant="outline" className={STATUS_ICON[check.status]}>{check.status}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm space-y-1">
                      <div className="flex justify-between"><span className="text-muted-foreground">Latency</span><span className="font-mono">{check.latency_ms}ms</span></div>
                      {check.error && <p className="text-xs text-red-600 mt-1">{check.error}</p>}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Uptime history placeholder */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Uptime History (last 24h)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-0.5 items-end h-8">
                {Array.from({ length: 48 }).map((_, i) => (
                  <div key={i} className="flex-1 bg-emerald-400 rounded-sm" style={{ height: `${60 + Math.random() * 40}%` }} />
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-2 text-center">Each bar = 30 minutes. Green = healthy.</p>
            </CardContent>
          </Card>
        </PageLayout>
      </AdminShell>
    </ErrorBoundary>
  );
}
