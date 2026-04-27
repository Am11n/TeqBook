"use client";

import { useState } from "react";
import { Mail, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { StatusPill } from "@/components/profile/status-pill";
import { InfoRow } from "@/components/profile/info-row";
import { resendEmailVerification } from "@/lib/services/auth-service";

interface EmailVerificationCardProps {
  emailVerified: boolean;
  copy: {
    title: string;
    description: string;
    statusLabel: string;
    statusVerified: string;
    statusNotVerified: string;
    resendButton: string;
    resendingButton: string;
    resendSuccess: string;
    warning: string;
  };
}

export function EmailVerificationCard({ emailVerified, copy }: EmailVerificationCardProps) {
  const [resendingEmail, setResendingEmail] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);

  async function handleResendVerification() {
    setResendingEmail(true);

    const { error: resendError } = await resendEmailVerification();

    if (resendError) {
      alert(resendError);
      setResendingEmail(false);
      return;
    }

    setSuccess(copy.resendSuccess);
    setResendingEmail(false);
    setTimeout(() => setSuccess(null), 5000);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="h-5 w-5" />
          {copy.title}
        </CardTitle>
        <CardDescription>{copy.description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {success && (
          <Alert className="border-green-200 bg-green-50 dark:bg-green-900/20">
            <AlertDescription className="text-green-800 dark:text-green-400">{success}</AlertDescription>
          </Alert>
        )}

        <InfoRow
          label={copy.statusLabel}
          value={
            emailVerified ? (
              <StatusPill status="verified" label={copy.statusVerified} />
            ) : (
              <StatusPill status="unverified" label={copy.statusNotVerified} />
            )
          }
          action={
            !emailVerified ? (
              <Button variant="outline" size="sm" onClick={handleResendVerification} disabled={resendingEmail}>
                {resendingEmail ? copy.resendingButton : copy.resendButton}
              </Button>
            ) : null
          }
        />
        {!emailVerified && (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              {copy.warning}
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}

