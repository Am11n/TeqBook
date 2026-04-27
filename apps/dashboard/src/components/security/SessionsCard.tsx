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
  copy: {
    title: string;
    description: string;
    statusLabel: string;
    statusValueCurrentOnly: string;
    currentDevicePrefix: string;
    signOutOthersButton: string;
    signingOut: string;
    signOutOthersConfirm: string;
    signOutOthersSuccess: string;
    noOtherSessionsHint: string;
    countDisclaimer: string;
  };
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

export function SessionsCard({ sessionsCount, onReload, copy }: SessionsCardProps) {
  const [signingOut, setSigningOut] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const deviceInfo = useMemo(() => getBasicDeviceInfo(), []);

  async function handleSignOutOtherSessions() {
    if (
      !confirm(
        copy.signOutOthersConfirm
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
    setSuccess(copy.signOutOthersSuccess);
    setTimeout(() => setSuccess(null), 5000);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Monitor className="h-5 w-5" />
          {copy.title}
        </CardTitle>
        <CardDescription>{copy.description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {success && (
          <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-800">
            {success}
          </div>
        )}

        <InfoRow
          label={copy.statusLabel}
          value={copy.statusValueCurrentOnly}
        />

        <p className="text-xs text-muted-foreground">
          {copy.currentDevicePrefix}: {deviceInfo}
        </p>
        <p className="text-xs text-muted-foreground">
          {copy.countDisclaimer}
        </p>

        <Button
          variant="outline"
          size="sm"
          onClick={handleSignOutOtherSessions}
          disabled={signingOut || sessionsCount <= 0}
        >
          {signingOut ? copy.signingOut : copy.signOutOthersButton}
        </Button>

        {sessionsCount <= 0 && (
          <p className="text-xs text-muted-foreground">{copy.noOtherSessionsHint}</p>
        )}
      </CardContent>
    </Card>
  );
}

