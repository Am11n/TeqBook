"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { updatePassword } from "@/lib/services/auth-service";
import { Lock, Eye, EyeOff } from "lucide-react";
import { CardError } from "./shared";

export function ChangePasswordSection({ onSuccess }: { onSuccess: (msg: string) => void }) {
  const [open, setOpen] = useState(false);
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [loading, setLoading] = useState(false);
  const [inlineError, setInlineError] = useState<string | null>(null);

  function reset() {
    setCurrentPw("");
    setNewPw("");
    setConfirmPw("");
    setShowCurrent(false);
    setShowNew(false);
    setInlineError(null);
    setOpen(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setInlineError(null);

    if (newPw !== confirmPw) {
      setInlineError("Passwords do not match");
      return;
    }

    setLoading(true);
    const { error } = await updatePassword(currentPw, newPw);
    setLoading(false);

    if (error) {
      setInlineError(error);
      return;
    }

    onSuccess("Password changed successfully");
    reset();
  }

  if (!open) {
    return (
      <Button variant="outline" size="sm" className="w-full justify-start" onClick={() => setOpen(true)}>
        <Lock className="mr-2 h-4 w-4" />
        Change password
      </Button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3 rounded-lg border bg-muted/30 p-3">
      <div className="relative">
        <Input
          type={showCurrent ? "text" : "password"}
          placeholder="Current password"
          value={currentPw}
          onChange={(e) => setCurrentPw(e.target.value)}
          required
          autoComplete="current-password"
        />
        <button
          type="button"
          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          onClick={() => setShowCurrent(!showCurrent)}
          tabIndex={-1}
        >
          {showCurrent ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
      <div className="relative">
        <Input
          type={showNew ? "text" : "password"}
          placeholder="New password"
          value={newPw}
          onChange={(e) => setNewPw(e.target.value)}
          required
          minLength={8}
          autoComplete="new-password"
        />
        <button
          type="button"
          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          onClick={() => setShowNew(!showNew)}
          tabIndex={-1}
        >
          {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
      <Input
        type={showNew ? "text" : "password"}
        placeholder="Confirm new password"
        value={confirmPw}
        onChange={(e) => setConfirmPw(e.target.value)}
        required
        minLength={8}
        autoComplete="new-password"
      />
      {inlineError && <CardError message={inlineError} />}
      <div className="flex gap-2">
        <Button type="submit" size="sm" disabled={loading || !currentPw || !newPw || !confirmPw}>
          {loading ? "Updating..." : "Update password"}
        </Button>
        <Button type="button" variant="outline" size="sm" onClick={reset} disabled={loading}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
