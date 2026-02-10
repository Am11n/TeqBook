"use client";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import {
  LogIn,
  LogOut,
  UserPlus,
  Trash2,
  Settings,
  CreditCard,
  Shield,
  Calendar,
  Activity,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type ActivityEvent = {
  id: string;
  action: string;
  resource_type: string;
  user_id?: string | null;
  user_email?: string | null;
  salon_id?: string | null;
  salon_name?: string | null;
  created_at: string;
  metadata?: Record<string, unknown> | null;
};

type RecentActivityProps = {
  /** Events to display */
  events: ActivityEvent[];
  /** Whether events are loading */
  loading?: boolean;
  /** Callback when an event is clicked (opens detail drawer) */
  onEventClick?: (event: ActivityEvent) => void;
  /** Max events to display (default: 20) */
  maxEvents?: number;
  /** Additional CSS classes */
  className?: string;
};

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const ACTION_ICONS: Record<
  string,
  React.ComponentType<{ className?: string }>
> = {
  login: LogIn,
  login_success: LogIn,
  login_failed: LogIn,
  logout: LogOut,
  signup: UserPlus,
  user_created: UserPlus,
  user_deleted: Trash2,
  salon_created: Activity,
  salon_plan_updated: CreditCard,
  salon_activated: Activity,
  salon_deactivated: Activity,
  plan_changed: CreditCard,
  booking_created: Calendar,
  booking_cancelled: Calendar,
  settings_updated: Settings,
  impersonation_start: Shield,
  impersonation_end: Shield,
};

const RESOURCE_TYPE_COLORS: Record<string, string> = {
  auth: "bg-blue-50 text-blue-700",
  security: "bg-red-50 text-red-700",
  admin: "bg-purple-50 text-purple-700",
  billing: "bg-emerald-50 text-emerald-700",
  booking: "bg-amber-50 text-amber-700",
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function RecentActivity({
  events,
  loading = false,
  onEventClick,
  maxEvents = 20,
  className,
}: RecentActivityProps) {
  const visibleEvents = events.slice(0, maxEvents);

  if (loading) {
    return (
      <div className={cn("space-y-1", className)}>
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 py-2 animate-pulse">
            <div className="h-6 w-6 rounded-full bg-muted" />
            <div className="flex-1 space-y-1">
              <div className="h-3 w-48 rounded bg-muted" />
              <div className="h-2.5 w-24 rounded bg-muted" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div
        className={cn(
          "flex items-center justify-center py-8 text-sm text-muted-foreground",
          className
        )}
      >
        No recent activity
      </div>
    );
  }

  return (
    <div className={cn("space-y-0.5", className)}>
      {visibleEvents.map((event) => {
        const Icon =
          ACTION_ICONS[event.action] ?? Activity;
        const typeColor =
          RESOURCE_TYPE_COLORS[event.resource_type] ?? "bg-muted text-muted-foreground";

        return (
          <button
            key={event.id}
            onClick={() => onEventClick?.(event)}
            className={cn(
              "flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left transition-colors",
              onEventClick
                ? "hover:bg-muted/50 cursor-pointer"
                : "cursor-default"
            )}
          >
            {/* Icon */}
            <div
              className={cn(
                "flex h-6 w-6 items-center justify-center rounded-full shrink-0",
                typeColor
              )}
            >
              <Icon className="h-3 w-3" />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-sm truncate">
                  {formatActionLabel(event.action)}
                </span>
                {event.salon_name && (
                  <span className="text-xs text-muted-foreground truncate">
                    &middot; {event.salon_name}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-[10px] text-muted-foreground">
                  {event.user_email ?? event.user_id?.substring(0, 8) ?? "System"}
                </span>
                <span className="text-[10px] text-muted-foreground">
                  &middot;{" "}
                  {formatDistanceToNow(new Date(event.created_at), {
                    addSuffix: true,
                  })}
                </span>
              </div>
            </div>

            {/* Resource type badge */}
            <Badge
              variant="outline"
              className="text-[10px] px-1.5 py-0 shrink-0"
            >
              {event.resource_type}
            </Badge>
          </button>
        );
      })}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatActionLabel(action: string): string {
  return action
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}
