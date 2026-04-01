"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Field } from "@/components/form/Field";
import { useRepoError } from "@/lib/hooks/useRepoError";
import { updatePassword } from "@/lib/services/auth-service";

export type ChangePasswordCopy = {
  dialogTitle: string;
  dialogDescription: string;
  mismatchError: string;
  tooShortError: string;
  success: string;
  currentLabel: string;
  currentPlaceholder: string;
  newLabel: string;
  newDescription: string;
  newPlaceholder: string;
  confirmLabel: string;
  confirmPlaceholder: string;
  cancel: string;
  submitting: string;
  submit: string;
};

interface ChangePasswordDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  copy: ChangePasswordCopy;
}

export function ChangePasswordDialog({ open, onOpenChange, copy }: ChangePasswordDialogProps) {
  const m = useRepoError();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function handleChangePassword() {
    if (newPassword !== confirmPassword) {
      setError(copy.mismatchError);
      return;
    }

    if (newPassword.length < 8) {
      setError(copy.tooShortError);
      return;
    }

    setChangingPassword(true);
    setError(null);

    const { error: updateError } = await updatePassword(currentPassword, newPassword);

    if (updateError) {
      setError(m(updateError));
      setChangingPassword(false);
      return;
    }

    setSuccess(copy.success);
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setChangingPassword(false);
    setTimeout(() => {
      setSuccess(null);
      onOpenChange(false);
    }, 2000);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{copy.dialogTitle}</DialogTitle>
          <DialogDescription>{copy.dialogDescription}</DialogDescription>
        </DialogHeader>
        <div className="space-y-6 py-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-800">
              {error}
            </div>
          )}
          {success && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-800">
              {success}
            </div>
          )}

          <Field label={copy.currentLabel} htmlFor="current_password" required>
            <Input
              id="current_password"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder={copy.currentPlaceholder}
            />
          </Field>

          <Field
            label={copy.newLabel}
            htmlFor="new_password"
            required
            description={copy.newDescription}
          >
            <Input
              id="new_password"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder={copy.newPlaceholder}
            />
          </Field>

          <Field label={copy.confirmLabel} htmlFor="confirm_password" required>
            <Input
              id="confirm_password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder={copy.confirmPlaceholder}
            />
          </Field>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => {
              onOpenChange(false);
              setCurrentPassword("");
              setNewPassword("");
              setConfirmPassword("");
              setError(null);
              setSuccess(null);
            }}
            disabled={changingPassword}
          >
            {copy.cancel}
          </Button>
          <Button onClick={handleChangePassword} disabled={changingPassword}>
            {changingPassword ? copy.submitting : copy.submit}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

