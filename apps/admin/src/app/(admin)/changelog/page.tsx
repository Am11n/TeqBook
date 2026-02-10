"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { AdminShell } from "@/components/layout/admin-shell";
import { PageLayout } from "@/components/layout/page-layout";
import { ErrorBoundary } from "@/components/error-boundary";
import { ErrorMessage } from "@/components/feedback/error-message";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useCurrentSalon } from "@/components/salon-provider";
import { supabase } from "@/lib/supabase-client";
import { Plus, Rocket, Wrench, Bug, AlertTriangle } from "lucide-react";
import { format } from "date-fns";

type ChangelogEntry = {
  id: string;
  title: string;
  description: string | null;
  version: string | null;
  type: string;
  published: boolean;
  published_at: string | null;
  created_at: string;
};

const TYPE_CONFIG: Record<string, { icon: typeof Rocket; color: string; label: string }> = {
  feature: { icon: Rocket, color: "bg-emerald-50 text-emerald-700", label: "Feature" },
  improvement: { icon: Wrench, color: "bg-blue-50 text-blue-700", label: "Improvement" },
  bugfix: { icon: Bug, color: "bg-amber-50 text-amber-700", label: "Bug Fix" },
  breaking: { icon: AlertTriangle, color: "bg-red-50 text-red-700", label: "Breaking" },
};

export default function ChangelogPage() {
  const { isSuperAdmin, loading: contextLoading } = useCurrentSalon();
  const router = useRouter();
  const [entries, setEntries] = useState<ChangelogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadEntries = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error: e } = await supabase
        .from("changelog_entries")
        .select("*")
        .order("created_at", { ascending: false });
      if (e) { setError(e.message); return; }
      setEntries((data as ChangelogEntry[]) ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!contextLoading && !isSuperAdmin) { router.push("/login"); return; }
    if (isSuperAdmin) loadEntries();
  }, [isSuperAdmin, contextLoading, router, loadEntries]);

  async function togglePublish(id: string, publish: boolean) {
    const update: Record<string, unknown> = { published: publish, updated_at: new Date().toISOString() };
    if (publish) update.published_at = new Date().toISOString();
    await supabase.from("changelog_entries").update(update).eq("id", id);
    loadEntries();
  }

  if (contextLoading || !isSuperAdmin) return null;

  return (
    <ErrorBoundary>
      <AdminShell>
        <PageLayout title="Changelog" description="Track what was launched and when" actions={<Button variant="outline" size="sm" className="gap-1"><Plus className="h-4 w-4" />Add Entry</Button>}>
          {error && <ErrorMessage message={error} onDismiss={() => setError(null)} variant="destructive" className="mb-4" />}

          {entries.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Rocket className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">No changelog entries yet. Click &quot;Add Entry&quot; to document your first release.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {entries.map((entry) => {
                const config = TYPE_CONFIG[entry.type] ?? TYPE_CONFIG.feature;
                const Icon = config.icon;
                return (
                  <Card key={entry.id} className="overflow-hidden">
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3">
                          <div className={`p-2 rounded-lg ${config.color}`}>
                            <Icon className="h-4 w-4" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="text-sm font-semibold">{entry.title}</h3>
                              {entry.version && <Badge variant="outline" className="text-[10px]">v{entry.version}</Badge>}
                              <Badge variant="outline" className={`text-[10px] ${entry.published ? "border-emerald-200 bg-emerald-50 text-emerald-700" : ""}`}>{entry.published ? "Published" : "Draft"}</Badge>
                            </div>
                            {entry.description && <p className="text-sm text-muted-foreground">{entry.description}</p>}
                            <p className="text-xs text-muted-foreground mt-2">
                              {entry.published_at
                                ? `Published ${format(new Date(entry.published_at), "PPP")}`
                                : `Created ${format(new Date(entry.created_at), "PPP")}`}
                            </p>
                          </div>
                        </div>
                        <Button variant="ghost" size="sm" onClick={() => togglePublish(entry.id, !entry.published)}>
                          {entry.published ? "Unpublish" : "Publish"}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </PageLayout>
      </AdminShell>
    </ErrorBoundary>
  );
}
