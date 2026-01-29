"use client";

import { useState } from "react";
import { Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { InfoRow } from "@/components/profile/info-row";
import { ChangePasswordDialog } from "./ChangePasswordDialog";

export function PasswordCard() {
  const [showChangePassword, setShowChangePassword] = useState(false);

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            Password
          </CardTitle>
          <CardDescription>Change your account password</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <InfoRow
            label="Password"
            value="••••••••"
            action={
              <Button variant="outline" size="sm" onClick={() => setShowChangePassword(true)}>
                Change Password
              </Button>
            }
          />
        </CardContent>
      </Card>

      <ChangePasswordDialog open={showChangePassword} onOpenChange={setShowChangePassword} />
    </>
  );
}

