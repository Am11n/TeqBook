"use client";

import { useMemo } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAdminConsoleMessages } from "@/i18n/use-admin-console-messages";
import {
  AlertTriangle,
  UserX,
  Clock,
  XCircle,
  Eye,
  Flag,
  CheckCircle,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type AttentionItemType =
  | "onboarding_stuck"
  | "high_cancellation"
  | "login_failures"
  | "audit_spike"
  | "payment_issue"
  | "manual";

export type AttentionItem = {
  id: string;
  type: AttentionItemType;
  title: string;
  description: string;
  entityType: "salon" | "user";
  entityId: string;
  entityName: string;
  severity: "low" | "medium" | "high" | "critical";
  createdAt: string;
};

type NeedsAttentionFeedProps = {
  /** Items needing attention */
  items: AttentionItem[];
  /** Whether items are loading */
  loading?: boolean;
  /** Callback when "View" is clicked */
  onView: (item: AttentionItem) => void;
  /** Callback when "Flag/Resolve" is clicked */
  onResolve?: (item: AttentionItem) => void;
  /** Max items to show (default: 5) */
  maxItems?: number;
  /** Additional CSS classes */
  className?: string;
};

const SEVERITY_COLORS: Record<string, string> = {
  low: "bg-muted text-muted-foreground",
  medium: "bg-amber-50 text-amber-700",
  high: "bg-orange-50 text-orange-700",
  critical: "bg-red-50 text-red-700",
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function NeedsAttentionFeed({
  items,
  loading = false,
  onView,
  onResolve,
  maxItems = 5,
  className,
}: NeedsAttentionFeedProps) {
  const t = useAdminConsoleMessages();
  const w = t.widgets.needsAttention;

  const typeConfig = useMemo(
    (): Record<
      AttentionItemType,
      { icon: React.ComponentType<{ className?: string }>; label: string }
    > => ({
      onboarding_stuck: { icon: Clock, label: w.typeOnboardingStuck },
      high_cancellation: { icon: XCircle, label: w.typeHighCancellation },
      login_failures: { icon: UserX, label: w.typeLoginFailures },
      audit_spike: { icon: AlertTriangle, label: w.typeAuditSpike },
      payment_issue: { icon: AlertTriangle, label: w.typePaymentIssue },
      manual: { icon: Flag, label: w.typeManual },
    }),
    [w]
  );

  const visibleItems = items.slice(0, maxItems);

  if (loading) {
    return (
      <div className={cn("space-y-2", className)}>
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-3 rounded-lg border p-3 animate-pulse"
          >
            <div className="h-8 w-8 rounded-full bg-muted" />
            <div className="flex-1 space-y-1.5">
              <div className="h-3 w-40 rounded bg-muted" />
              <div className="h-3 w-64 rounded bg-muted" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div
        className={cn(
          "flex flex-col items-center justify-center py-8 text-muted-foreground",
          className
        )}
      >
        <CheckCircle className="h-8 w-8 mb-2 opacity-40" />
        <p className="text-sm">{w.emptyTitle}</p>
      </div>
    );
  }

  return (
    <div className={cn("space-y-2", className)}>
      {visibleItems.map((item) => {
        const config = typeConfig[item.type] ?? typeConfig.manual;
        const Icon = config.icon;
        const severityClass = SEVERITY_COLORS[item.severity] ?? SEVERITY_COLORS.medium;

        return (
          <div
            key={item.id}
            className="flex items-start gap-3 rounded-lg border p-3 hover:bg-muted/30 transition-colors"
          >
            {/* Icon */}
            <div
              className={cn(
                "flex h-8 w-8 items-center justify-center rounded-full shrink-0",
                severityClass
              )}
            >
              <Icon className="h-4 w-4" />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium truncate">
                  {item.entityName}
                </span>
                <Badge variant="outline" className="text-[10px] px-1.5 py-0 shrink-0">
                  {config.label}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                {item.description}
              </p>
              <span className="text-[10px] text-muted-foreground mt-0.5 block">
                {formatDistanceToNow(new Date(item.createdAt), {
                  addSuffix: true,
                })}
              </span>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1 shrink-0">
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs gap-1"
                onClick={() => onView(item)}
              >
                <Eye className="h-3 w-3" />
                {w.view}
              </Button>
              {onResolve && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 text-xs gap-1"
                  onClick={() => onResolve(item)}
                >
                  <CheckCircle className="h-3 w-3" />
                  {w.resolve}
                </Button>
              )}
            </div>
          </div>
        );
      })}

      {items.length > maxItems && (
        <p className="text-xs text-muted-foreground text-center pt-1">
          {w.moreItemsTemplate.replace(
            "{count}",
            String(items.length - maxItems)
          )}
        </p>
      )}
    </div>
  );
}
