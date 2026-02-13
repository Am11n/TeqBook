"use client";

import { useState, useMemo } from "react";
import { Monitor } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { InfoRow } from "@/components/profile/info-row";
import { signOutOtherSessions } from "@/lib/services/auth-service";

interface SessionsCardProps {
  sessionsCount: number;
  onReload: () => Promise<void>;
}

function getBasicDeviceInfo(): string {
  if (typeof navigator === "undefined") return "Unknown";
  const ua = navigator.userAgent;
  let browser = "Browser";
  let os = "Unknown OS";

  if (ua.includes("Firefox")) browser = "Firefox";
  else if (ua.includes("Edg")) browser = "Edge";
  else if (ua.includes("Chrome")) browser = "Chrome";
  else if (ua.includes("Safari")) browser = "Safari";

  if (ua.includes("Mac")) os = "macOS";
  else if (ua.includes("Win")) os = "Windows";
  else if (ua.includes("Linux")) os = "Linux";
  else if (ua.includes("iPhone") || ua.includes("iPad")) os = "iOS";
  else if (ua.includes("Android")) os = "Android";

  return `${browser} on ${os}`;
}

export function SessionsCard({ sessionsCount, onReload }: SessionsCardProps) {
  const [signingOut, setSigningOut] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const deviceInfo = useMemo(() => getBasicDeviceInfo(), []);

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
        />

        <p className="text-xs text-muted-foreground">
          Current: {deviceInfo}
        </p>

        <Button
          variant="outline"
          size="sm"
          onClick={handleSignOutOtherSessions}
          disabled={signingOut || sessionsCount <= 1}
        >
          {signingOut ? "Signing out..." : "Log out all other sessions"}
        </Button>

        {sessionsCount <= 1 && (
          <p className="text-xs text-muted-foreground">You are only signed in on this device.</p>
        )}
      </CardContent>
    </Card>
  );
}

