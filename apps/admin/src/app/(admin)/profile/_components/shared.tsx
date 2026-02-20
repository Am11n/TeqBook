"use client";

import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { AlertCircle } from "lucide-react";

export function getInitials(firstName: string, lastName: string, email: string | null): string {
  if (firstName && lastName) return `${firstName[0]}${lastName[0]}`.toUpperCase();
  if (firstName) return firstName[0].toUpperCase();
  if (email) {
    const name = email.split("@")[0];
    return name.charAt(0).toUpperCase() + (name.length > 1 ? name.charAt(1).toUpperCase() : "");
  }
  return "A";
}

export function relativeTime(iso: string | null | undefined): string {
  if (!iso) return "Unknown";
  try {
    return formatDistanceToNow(new Date(iso), { addSuffix: true });
  } catch {
    return iso;
  }
}

export function formatDate(iso: string | null | undefined): string {
  if (!iso) return "Unknown";
  try {
    return new Date(iso).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return iso;
  }
}

export function auditActionLabel(action: string | null | undefined): string {
  if (!action) return "Activity event";
  const map: Record<string, string> = {
    login: "Signed in",
    logout: "Signed out",
    password_updated: "Changed password",
    mfa_enrolled: "Enabled 2FA",
    mfa_unenrolled: "Disabled 2FA",
    create: "Created resource",
    update: "Updated resource",
    delete: "Deleted resource",
    status_change: "Changed status",
  };
  return map[action] || action.replace(/_/g, " ");
}

export function CardSkeleton({ className = "" }: { className?: string }) {
  return (
    <div className={`animate-pulse rounded-2xl border bg-card p-6 shadow-sm ${className}`}>
      <div className="mb-4 h-4 w-32 rounded bg-muted" />
      <div className="space-y-3">
        <div className="h-3 w-full rounded bg-muted" />
        <div className="h-3 w-3/4 rounded bg-muted" />
        <div className="h-3 w-1/2 rounded bg-muted" />
      </div>
    </div>
  );
}

export function CardError({ message }: { message: string }) {
  return (
    <div className="flex items-center gap-2 rounded-lg bg-destructive/10 px-3 py-2 text-xs text-destructive">
      <AlertCircle className="h-3.5 w-3.5 shrink-0" />
      {message}
    </div>
  );
}

export function useToast() {
  const [toasts, setToasts] = useState<Array<{ id: number; message: string; variant: "success" | "error" }>>([]);

  function show(message: string, variant: "success" | "error" = "success") {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, variant }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  }

  function ToastContainer() {
    if (toasts.length === 0) return null;
    return (
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`animate-in slide-in-from-bottom-2 fade-in rounded-lg px-4 py-2.5 text-sm font-medium shadow-lg ${
              t.variant === "success"
                ? "bg-emerald-600 text-white"
                : "bg-destructive text-destructive-foreground"
            }`}
          >
            {t.message}
          </div>
        ))}
      </div>
    );
  }

  return { show, ToastContainer };
}
