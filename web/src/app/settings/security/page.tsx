"use client";

import { ErrorBoundary } from "@/components/error-boundary";
import { ErrorMessage } from "@/components/feedback/error-message";
import { Card } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle } from "lucide-react";
import { useSecurityData } from "@/lib/hooks/security/useSecurityData";
import { PasswordCard } from "@/components/security/PasswordCard";
import { TwoFactorCard } from "@/components/security/TwoFactorCard";
import { EmailVerificationCard } from "@/components/security/EmailVerificationCard";
import { SessionsCard } from "@/components/security/SessionsCard";

export default function SecuritySettingsPage() {
  const { loading, error, factors, emailVerified, sessionsCount, loadSecurityData } = useSecurityData();

  return (
    <ErrorBoundary>
      <Card className="p-6">
        {error && (
          <ErrorMessage
            message={error}
            onDismiss={() => {}}
            variant="destructive"
            className="mb-6"
          />
        )}

        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-2">Security Settings</h3>
            <p className="text-sm text-muted-foreground mb-6">
              Manage your account security settings including password, two-factor authentication, and sessions
            </p>
          </div>

          <PasswordCard />

          <TwoFactorCard factors={factors} loading={loading} onReload={loadSecurityData} />

          <EmailVerificationCard emailVerified={emailVerified} />

          <SessionsCard sessionsCount={sessionsCount} onReload={loadSecurityData} />
        </div>
      </Card>
    </ErrorBoundary>
  );
}
