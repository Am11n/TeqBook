"use client";

import { useState } from "react";
import { Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { InfoRow } from "@/components/profile/info-row";
import { ChangePasswordDialog, type ChangePasswordCopy } from "./ChangePasswordDialog";

type PasswordCardCopy = {
  cardTitle: string;
  cardDescription: string;
  rowLabel: string;
  changeAction: string;
  dialog: ChangePasswordCopy;
};

export function PasswordCard({ copy }: { copy: PasswordCardCopy }) {
  const [showChangePassword, setShowChangePassword] = useState(false);

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            {copy.cardTitle}
          </CardTitle>
          <CardDescription>{copy.cardDescription}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <InfoRow
            label={copy.rowLabel}
            value="••••••••"
            action={
              <Button variant="outline" size="sm" onClick={() => setShowChangePassword(true)}>
                {copy.changeAction}
              </Button>
            }
          />
        </CardContent>
      </Card>

      <ChangePasswordDialog
        open={showChangePassword}
        onOpenChange={setShowChangePassword}
        copy={copy.dialog}
      />
    </>
  );
}
