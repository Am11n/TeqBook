"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { signOutOtherSessions } from "@/lib/services/auth-service";
import { Monitor, LogOut } from "lucide-react";

interface SignOutAllSectionProps {
  sessionsCount: number | null;
  onSuccess: (msg: string) => void;
  onError: (msg: string) => void;
  onRefresh: () => Promise<void>;
}

export function SignOutAllSection({
  sessionsCount,
  onSuccess,
  onError,
  onRefresh,
}: SignOutAllSectionProps) {
  const [confirming, setConfirming] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSignOut() {
    setLoading(true);
    const { error } = await signOutOtherSessions();
    setLoading(false);
    setConfirming(false);

    if (error) {
      onError(error);
      return;
    }

    onSuccess("All other sessions signed out");
    await onRefresh();
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Monitor className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm">Active sessions</span>
        </div>
        <span className="text-sm font-medium">{sessionsCount ?? "-"}</span>
      </div>

      {!confirming && (
        <Button
          variant="outline"
          size="sm"
          className="w-full justify-start text-destructive hover:text-destructive"
          onClick={() => setConfirming(true)}
          disabled={sessionsCount !== null && sessionsCount <= 1}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Sign out all other devices
        </Button>
      )}

      {confirming && (
        <div className="space-y-2 rounded-lg border border-destructive/30 bg-destructive/5 p-3">
          <p className="text-xs text-destructive">
            This will sign out all other sessions. Your current session stays active.
          </p>
          <div className="flex gap-2">
            <Button size="sm" variant="destructive" onClick={handleSignOut} disabled={loading}>
              {loading ? "Signing out..." : "Yes, sign out all"}
            </Button>
            <Button size="sm" variant="outline" onClick={() => setConfirming(false)} disabled={loading}>
              Cancel
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
