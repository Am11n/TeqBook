"use client";

import { useState } from "react";
import { Monitor } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { InfoRow } from "@/components/profile/info-row";
import { signOutOtherSessions } from "@/lib/services/auth-service";

interface SessionsCardProps {
  sessionsCount: number;
  onReload: () => Promise<void>;
}

export function SessionsCard({ sessionsCount, onReload }: SessionsCardProps) {
  const [signingOut, setSigningOut] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);

  async function handleSignOutOtherSessions() {
    if (
      !confirm(
        "Are you sure you want to sign out of all other sessions? You will remain signed in on this device."
      )
    ) {
      return;
    }

    setSigningOut(true);

    const { error: signOutError } = await signOutOtherSessions();

    if (signOutError) {
      alert(signOutError);
      setSigningOut(false);
      return;
    }

    // Reload sessions count
    await onReload();
    setSigningOut(false);
    setSuccess("All other sessions have been signed out");
    setTimeout(() => setSuccess(null), 5000);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Monitor className="h-5 w-5" />
          Active Sessions
        </CardTitle>
        <CardDescription>Manage your active sessions across devices</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {success && (
          <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-800">
            {success}
          </div>
        )}

        <InfoRow
          label="Active Sessions"
          value={`${sessionsCount} active session${sessionsCount !== 1 ? "s" : ""}`}
          action={
            sessionsCount > 1 ? (
              <Button variant="outline" size="sm" onClick={handleSignOutOtherSessions} disabled={signingOut}>
                {signingOut ? "Signing out..." : "Sign Out Other Sessions"}
              </Button>
            ) : null
          }
        />
        {sessionsCount <= 1 && (
          <p className="text-sm text-muted-foreground">You are only signed in on this device.</p>
        )}
      </CardContent>
    </Card>
  );
}

