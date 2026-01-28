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
}

export function EmailVerificationCard({ emailVerified }: EmailVerificationCardProps) {
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

    setSuccess("Verification email sent. Please check your inbox.");
    setResendingEmail(false);
    setTimeout(() => setSuccess(null), 5000);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="h-5 w-5" />
          Email Verification
        </CardTitle>
        <CardDescription>Verify your email address</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {success && (
          <Alert className="border-green-200 bg-green-50 dark:bg-green-900/20">
            <AlertDescription className="text-green-800 dark:text-green-400">{success}</AlertDescription>
          </Alert>
        )}

        <InfoRow
          label="Status"
          value={
            emailVerified ? (
              <StatusPill status="verified" label="Verified" />
            ) : (
              <StatusPill status="unverified" label="Not verified" />
            )
          }
          action={
            !emailVerified ? (
              <Button variant="outline" size="sm" onClick={handleResendVerification} disabled={resendingEmail}>
                {resendingEmail ? "Sending..." : "Resend Verification"}
              </Button>
            ) : null
          }
        />
        {!emailVerified && (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Your email address is not verified. Please check your inbox for a verification email.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}

