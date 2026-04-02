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
import { useAdminConsoleMessages } from "@/i18n/use-admin-console-messages";

type HealthCheck = { status: string; latency_ms: number; error?: string };
type HealthResponse = { status: string; timestamp: string; checks: Record<string, HealthCheck> };

function resolveHealthApiUrl(): string {
  if (typeof window === "undefined") return "/api/health/";
  const path = window.location.pathname;
  const hasAdminBasePath = path === "/admin" || path.startsWith("/admin/");
  return hasAdminBasePath ? "/admin/api/health/" : "/api/health/";
}

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
  const t = useAdminConsoleMessages();
  const sh = t.pages.systemHealth;
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
    if (!healthRef.current) setPageError(null);
    try {
      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error(sh.errorTimeout)), 8000)
      );
      const healthApiUrl = resolveHealthApiUrl();
      const res = (await Promise.race([fetch(healthApiUrl), timeoutPromise])) as Response;
      if (res.status === 401 || res.status === 403) {
        setAuthState("unauthorized");
        throw new Error("Unauthorized");
      }
      setAuthState("authorized");
      if (!res.ok) {
        throw new Error(`${sh.errorApiFailedPrefix} (${res.status})`);
      }
      const data = (await res.json()) as HealthResponse;
      setHealth(data);
      setLastRefresh(new Date());
    } catch (err) {
      if (!healthRef.current) setHealth(null);
      const message = err instanceof Error ? err.message : sh.errorLoadFailed;
      if (message !== "Unauthorized") {
        setPageError(message);
      }
    } finally {
      requestInFlightRef.current = false;
      setLoading(false);
      setRefreshing(false);
    }
  }, [sh.errorTimeout, sh.errorLoadFailed, sh.errorApiFailedPrefix]);

  useEffect(() => {
    void fetchHealth();
  }, [fetchHealth]);

  useEffect(() => {
    if (authState !== "authorized") return;
    const interval = setInterval(fetchHealth, 60000);
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
          <PageLayout title={sh.titleLoading} description={sh.descLoading}>
            <Card>
              <CardContent className="py-8 text-sm text-muted-foreground">
                {sh.checkingPermissions}
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
          title={sh.title}
          description={sh.description}
          actions={
            <Button variant="outline" size="sm" onClick={fetchHealth} disabled={loading || refreshing} className="gap-1">
              <RefreshCcw className={`h-4 w-4 ${loading || refreshing ? "animate-spin" : ""}`} />
              {sh.refresh}
            </Button>
          }
        >
          {pageError && (
            <div className="mb-4 rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
              {pageError}
            </div>
          )}
          <div className={`rounded-lg border px-5 py-4 mb-6 flex items-center justify-between ${health?.status === "healthy" ? "bg-emerald-50 border-emerald-200" : health?.status === "degraded" ? "bg-amber-50 border-amber-200" : "bg-red-50 border-red-200"}`}>
            <div className="flex items-center gap-3">
              <HeartPulse className={`h-6 w-6 ${health?.status === "healthy" ? "text-emerald-600" : health?.status === "degraded" ? "text-amber-600" : "text-red-600"}`} />
              <div>
                <p className="font-semibold text-sm">{health?.status === "healthy" ? sh.allSystemsOperational : health?.status === "degraded" ? sh.someSystemsDegraded : sh.loadingBanner}</p>
                {lastRefresh && <p className="text-xs text-muted-foreground flex items-center gap-1"><Clock className="h-3 w-3" /> {sh.lastChecked} {lastRefresh.toLocaleTimeString()} {refreshing ? sh.refreshingSuffix : ""}</p>}
              </div>
            </div>
            <Badge variant="outline" className={STATUS_ICON[health?.status ?? "unknown"]}>{health?.status ?? sh.statusChecking}</Badge>
          </div>

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
                      <div className="flex justify-between"><span className="text-muted-foreground">{sh.latency}</span><span className="font-mono">{check.latency_ms}ms</span></div>
                      {check.error && <p className="text-xs text-red-600 mt-1">{check.error}</p>}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">{sh.uptimeHistoryTitle}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-0.5 items-end h-8">
                {Array.from({ length: 48 }).map((_, i) => (
                  <div key={i} className="flex-1 bg-emerald-400 rounded-sm" style={{ height: `${60 + Math.random() * 40}%` }} />
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-2 text-center">{sh.uptimeHistoryHint}</p>
            </CardContent>
          </Card>
        </PageLayout>
      </AdminShell>
    </ErrorBoundary>
  );
}
