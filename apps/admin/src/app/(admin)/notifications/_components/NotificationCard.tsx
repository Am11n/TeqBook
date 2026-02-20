import { Card, CardContent } from "@/components/ui/card";
import type { InAppNotification } from "@/lib/types/notifications";
import { getCategoryIcon, SEVERITY_STYLES, resolveNavigationUrl, formatTimestamp } from "@/components/notification-center/constants";

export function NotificationCard({
  notification, onClick,
}: {
  notification: InAppNotification;
  onClick: (n: InAppNotification) => void;
}) {
  const Icon = getCategoryIcon(notification.type);
  const severityStyle = SEVERITY_STYLES[notification.severity] || SEVERITY_STYLES.info;
  const hasAction = !!resolveNavigationUrl(notification);

  return (
    <Card className={`transition-colors ${!notification.read ? "border-blue-200/60 bg-blue-50/20" : ""} ${hasAction ? "cursor-pointer hover:bg-slate-50/60" : ""}`}>
      <CardContent className="p-4">
        <button type="button" className="flex w-full items-start gap-4 text-left" onClick={() => onClick(notification)}>
          <div className={`mt-0.5 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg ${severityStyle}`}>
            <Icon className="h-5 w-5" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className={`text-sm leading-tight ${notification.read ? "text-slate-700" : "font-semibold text-slate-900"}`}>{notification.title}</p>
                <p className="mt-1 text-sm text-slate-500 line-clamp-2">{notification.body}</p>
              </div>
              <div className="flex flex-shrink-0 items-center gap-2">
                {!notification.read && <div className="h-2.5 w-2.5 rounded-full bg-blue-600" />}
              </div>
            </div>
            <div className="mt-2 flex items-center gap-3 text-xs text-slate-400">
              <span>{formatTimestamp(notification.created_at)}</span>
              <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-500">{notification.type}</span>
              {notification.severity !== "info" && (
                <span className={`rounded px-1.5 py-0.5 text-[10px] font-medium ${notification.severity === "critical" ? "bg-red-100 text-red-600" : "bg-amber-100 text-amber-600"}`}>{notification.severity}</span>
              )}
              {notification.source && <span className="text-slate-400">via {notification.source}</span>}
            </div>
          </div>
        </button>
      </CardContent>
    </Card>
  );
}
