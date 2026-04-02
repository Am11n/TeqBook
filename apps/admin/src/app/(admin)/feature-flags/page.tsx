"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { AdminShell } from "@/components/layout/admin-shell";
import { PageLayout } from "@/components/layout/page-layout";
import { ErrorBoundary } from "@/components/error-boundary";
import { ErrorMessage } from "@/components/feedback/error-message";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useCurrentSalon } from "@/components/salon-provider";
import { useAdminConsoleMessages } from "@/i18n/use-admin-console-messages";
import { supabase } from "@/lib/supabase-client";
import { ToggleRight, Globe } from "lucide-react";

type FeatureFlag = {
  id: string;
  salon_id: string | null;
  flag_key: string;
  enabled: boolean;
  description: string | null;
  created_at: string;
};

export default function FeatureFlagsPage() {
  const t = useAdminConsoleMessages();
  const ff = t.pages.featureFlags;
  const c = t.common;
  const { isSuperAdmin, loading: contextLoading } = useCurrentSalon();
  const router = useRouter();
  const [flags, setFlags] = useState<FeatureFlag[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadFlags = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error: e } = await supabase
        .from("feature_flags")
        .select("*")
        .order("flag_key", { ascending: true });
      if (e) { setError(e.message); return; }
      setFlags((data as FeatureFlag[]) ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : c.unknownError);
    } finally {
      setLoading(false);
    }
  }, [c.unknownError]);

  useEffect(() => {
    if (!contextLoading && !isSuperAdmin) { router.push("/login"); return; }
    if (isSuperAdmin) loadFlags();
  }, [isSuperAdmin, contextLoading, router, loadFlags]);

  async function toggleFlag(flagId: string, enabled: boolean) {
    const { error: e } = await supabase.from("feature_flags").update({ enabled, updated_at: new Date().toISOString() }).eq("id", flagId);
    if (e) setError(e.message);
    else loadFlags();
  }

  if (contextLoading || !isSuperAdmin) return null;

  const globalFlags = flags.filter((f) => f.salon_id === null);
  const salonFlags = flags.filter((f) => f.salon_id !== null);
  const enabledCount = flags.filter((f) => f.enabled).length;

  return (
    <ErrorBoundary>
      <AdminShell>
        <PageLayout
          title={ff.title}
          description={ff.descriptionTemplate.replace("{enabled}", String(enabledCount)).replace("{total}", String(flags.length))}
          breadcrumbs={<span>{ff.breadcrumbs}</span>}
          actions={<Button size="sm">{ff.addFlag}</Button>}
        >
          {error && <ErrorMessage message={error} onDismiss={() => setError(null)} variant="destructive" className="mb-4" />}

          {/* Global flags */}
          <Card className="mb-6">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2"><Globe className="h-4 w-4" /> {ff.globalFlags}</CardTitle>
            </CardHeader>
            <CardContent>
              {globalFlags.length === 0 ? (
                <p className="text-sm text-muted-foreground">{ff.noGlobalFlags}</p>
              ) : (
                <div className="space-y-3">
                  {globalFlags.map((flag) => (
                    <div key={flag.id} className="flex items-center justify-between p-3 rounded-lg border">
                      <div className="flex items-center gap-3">
                        <Switch checked={flag.enabled} onCheckedChange={(v) => toggleFlag(flag.id, v)} />
                        <div>
                          <p className="text-sm font-medium font-mono">{flag.flag_key}</p>
                          {flag.description && <p className="text-xs text-muted-foreground">{flag.description}</p>}
                        </div>
                      </div>
                      <Badge variant="outline" className={flag.enabled ? "border-emerald-200 bg-emerald-50 text-emerald-700" : ""}>{flag.enabled ? ff.badgeOn : ff.badgeOff}</Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Per-salon flags */}
          {salonFlags.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2"><ToggleRight className="h-4 w-4" /> {ff.salonOverridesTitle}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {salonFlags.map((flag) => (
                    <div key={flag.id} className="flex items-center justify-between p-3 rounded-lg border">
                      <div className="flex items-center gap-3">
                        <Switch checked={flag.enabled} onCheckedChange={(v) => toggleFlag(flag.id, v)} />
                        <div>
                          <p className="text-sm font-medium font-mono">{flag.flag_key}</p>
                          <p className="text-xs text-muted-foreground">{ff.salonIdLabel} {flag.salon_id?.slice(0, 8)}...</p>
                        </div>
                      </div>
                      <Badge variant="outline" className={flag.enabled ? "border-emerald-200 bg-emerald-50 text-emerald-700" : ""}>{flag.enabled ? ff.badgeOn : ff.badgeOff}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </PageLayout>
      </AdminShell>
    </ErrorBoundary>
  );
}
