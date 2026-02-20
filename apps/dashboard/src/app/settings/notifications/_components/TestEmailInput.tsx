"use client";

import { Button } from "@/components/ui/button";
import { Loader2, Send } from "lucide-react";

type TestEmailInputProps = {
  show: boolean;
  testEmailTarget: string;
  onEmailChange: (email: string) => void;
  onSend: () => void;
  onCancel: () => void;
  onOpen: () => void;
  sending: boolean;
  placeholder: string;
  buttonLabel: string;
};

export function TestEmailInput({
  show, testEmailTarget, onEmailChange, onSend, onCancel, onOpen,
  sending, placeholder, buttonLabel,
}: TestEmailInputProps) {
  if (show) {
    return (
      <form
        className="flex items-center gap-1.5"
        onSubmit={(e) => { e.preventDefault(); onSend(); }}
      >
        <input
          type="email"
          value={testEmailTarget}
          onChange={(e) => onEmailChange(e.target.value)}
          placeholder={placeholder}
          className="h-8 w-48 rounded-md border border-input bg-background px-2 text-xs outline-none focus:ring-1 focus:ring-ring"
          autoFocus
          required
        />
        <Button type="submit" variant="default" size="sm" className="text-xs h-8" disabled={sending}>
          {sending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
        </Button>
        <Button type="button" variant="ghost" size="sm" className="text-xs h-8" onClick={onCancel}>
          ✕
        </Button>
      </form>
    );
  }

  return (
    <Button variant="ghost" size="sm" className="text-xs" onClick={onOpen} disabled={sending}>
      <Send className="h-3.5 w-3.5 mr-1" />
      {buttonLabel}
    </Button>
  );
}
