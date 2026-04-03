"use client";

import { useState } from "react";
import { Shield, CheckCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { StatusPill } from "@/components/profile/status-pill";
import { InfoRow } from "@/components/profile/info-row";
import { TwoFactorEnrollment } from "./TwoFactorEnrollment";
import { unenrollTOTP } from "@/lib/services/two-factor-service";

export type TwoFactorCardCopy = {
  title: string;
  description: string;
  statusLabel: string;
  statusEnabled: string;
  statusDisabled: string;
  enabledAlert: string;
  disabledAlert: string;
  recommendShort: string;
  disableButton: string;
  confirmDisable: string;
};

interface TwoFactorCardProps {
  factors: Array<{ id: string; type: string; friendlyName: string }>;
  loading: boolean;
  onReload: () => Promise<void>;
  copy: TwoFactorCardCopy;
}

export function TwoFactorCard({ factors, loading, onReload, copy }: TwoFactorCardProps) {
  const [enrolling, setEnrolling] = useState(false);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [secret, setSecret] = useState<string | null>(null);
  const [factorId, setFactorId] = useState<string | null>(null);

  const has2FA = factors.length > 0;

  async function handleDisable2FA(factorIdToDisable: string) {
    if (!confirm(copy.confirmDisable)) {
      return;
    }

    const { error } = await unenrollTOTP(factorIdToDisable);
    if (error) {
      alert(error);
      return;
    }

    await onReload();
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          {copy.title}
        </CardTitle>
        <CardDescription>{copy.description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <InfoRow
          label={copy.statusLabel}
          value={
            has2FA ? (
              <StatusPill status="enabled" label={copy.statusEnabled} />
            ) : (
              <StatusPill status="disabled" label={copy.statusDisabled} />
            )
          }
        />

        {has2FA ? (
          <div className="space-y-4">
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>{copy.enabledAlert}</AlertDescription>
            </Alert>

            {factors.map((factor) => (
              <div key={factor.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <p className="font-medium">{factor.friendlyName}</p>
                  <p className="text-sm text-muted-foreground">{factor.type.toUpperCase()}</p>
                </div>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDisable2FA(factor.id)}
                  disabled={loading}
                >
                  {copy.disableButton}
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            <Alert>
              <XCircle className="h-4 w-4" />
              <AlertDescription>{copy.disabledAlert}</AlertDescription>
            </Alert>
            <p className="text-xs text-muted-foreground">{copy.recommendShort}</p>

            {!qrCode ? (
              <TwoFactorEnrollment
                onEnrollmentStart={(qr, sec, fid) => {
                  setQrCode(qr);
                  setSecret(sec);
                  setFactorId(fid);
                }}
                enrolling={enrolling}
                setEnrolling={setEnrolling}
              />
            ) : (
              <TwoFactorEnrollment
                qrCode={qrCode}
                secret={secret}
                factorId={factorId}
                onEnrollmentComplete={async () => {
                  await onReload();
                  setQrCode(null);
                  setSecret(null);
                  setFactorId(null);
                }}
                onCancel={() => {
                  setQrCode(null);
                  setSecret(null);
                  setFactorId(null);
                }}
              />
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
