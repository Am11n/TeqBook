import type { InAppNotification } from "@/lib/types/notifications";
import { getCategoryIcon, SEVERITY_STYLES, resolveNavigationUrl, formatTimestamp } from "./constants";

export function NotificationItem({
  notification, onClick,
}: {
  notification: InAppNotification;
  onClick: (n: InAppNotification) => void;
}) {
  const Icon = getCategoryIcon(notification.type);
  const severityStyle = SEVERITY_STYLES[notification.severity] || SEVERITY_STYLES.info;
  const hasAction = !!resolveNavigationUrl(notification);

  return (
    <button
      type="button"
      role="menuitem"
      tabIndex={0}
      className={`w-full px-4 py-3 text-left transition-colors hover:bg-slate-50/60 focus:bg-slate-50/60 focus:outline-none ${
        !notification.read ? "bg-blue-50/30" : ""
      } ${hasAction ? "cursor-pointer" : "cursor-default"}`}
      onClick={() => onClick(notification)}
    >
      <div className="flex items-start gap-3">
        <div className={`mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg ${severityStyle}`}>
          <Icon className="h-4 w-4" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <p className={`text-sm leading-tight ${notification.read ? "text-slate-700" : "font-medium text-slate-900"}`}>
              {notification.title}
            </p>
            {!notification.read && (
              <div className="mt-1 h-2 w-2 flex-shrink-0 rounded-full bg-blue-600" />
            )}
          </div>
          <p className="mt-0.5 text-xs text-slate-500 line-clamp-2">{notification.body}</p>
          <div className="mt-1 flex items-center gap-2">
            <span className="text-[10px] text-slate-400">{formatTimestamp(notification.created_at)}</span>
            {notification.source && <span className="text-[10px] text-slate-400">via {notification.source}</span>}
          </div>
        </div>
      </div>
    </button>
  );
}
