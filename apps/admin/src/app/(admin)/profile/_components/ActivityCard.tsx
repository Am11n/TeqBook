import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, ChevronRight } from "lucide-react";
import { CardError, relativeTime, auditActionLabel } from "./shared";

interface ActivityCardProps {
  error: string | null;
  recentActivity: Array<{ id: string; action: string | null; created_at: string | null }> | null;
}

export function ActivityCard({ error, recentActivity }: ActivityCardProps) {
  return (
    <Card className="rounded-2xl shadow-sm">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-base">
          <Activity className="h-5 w-5" />
          Recent Activity
        </CardTitle>
        <CardDescription>Your latest actions</CardDescription>
      </CardHeader>
      <CardContent>
        {error && <CardError message={error} />}

        {!error && recentActivity && recentActivity.length === 0 && (
          <div className="flex flex-col items-center py-6 text-center text-sm text-muted-foreground">
            <Activity className="mb-2 h-8 w-8 opacity-30" />
            No recent activity
          </div>
        )}

        {recentActivity && recentActivity.length > 0 && (
          <div className="space-y-1">
            {recentActivity.map((log) => (
              <div
                key={log.id}
                className="flex items-center justify-between rounded-md px-2 py-2 text-sm transition-colors hover:bg-muted/50"
              >
                <span className="truncate">{auditActionLabel(log.action)}</span>
                <span className="shrink-0 text-xs text-muted-foreground">
                  {relativeTime(log.created_at)}
                </span>
              </div>
            ))}
          </div>
        )}

        <div className="mt-4 border-t pt-3">
          <Link
            href="/audit-logs"
            className="flex items-center gap-1 text-xs font-medium text-primary hover:underline"
          >
            View all activity
            <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
