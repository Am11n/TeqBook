"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { User, Shield, Globe, Calendar, Mail, Copy, Check } from "lucide-react";
import { formatDate } from "./shared";

interface AccessInfoCardProps {
  isSuperadmin: boolean;
  accountCreatedAt: string | null | undefined;
  userId: string | null;
  onCopySuccess: () => void;
  onCopyError: () => void;
}

export function AccessInfoCard({
  isSuperadmin,
  accountCreatedAt,
  userId,
  onCopySuccess,
  onCopyError,
}: AccessInfoCardProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    if (!userId) return;
    try {
      await navigator.clipboard.writeText(userId);
      setCopied(true);
      onCopySuccess();
      setTimeout(() => setCopied(false), 2000);
    } catch {
      onCopyError();
    }
  }

  return (
    <Card className="rounded-2xl shadow-sm">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-base">
          <User className="h-5 w-5" />
          Access & Info
        </CardTitle>
        <CardDescription>Your admin account details</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-2 text-sm text-muted-foreground">
            <Shield className="h-4 w-4" />
            Access Level
          </span>
          <Badge variant="outline" className="border-purple-200 bg-purple-50 text-purple-700">
            {isSuperadmin ? "Super Admin" : "Admin"}
          </Badge>
        </div>

        <div className="flex items-center justify-between">
          <span className="flex items-center gap-2 text-sm text-muted-foreground">
            <Globe className="h-4 w-4" />
            Scope
          </span>
          <span className="text-sm font-medium">
            {isSuperadmin ? "Global access" : "Salon-level"}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            Account created
          </span>
          <span className="text-sm">{formatDate(accountCreatedAt)}</span>
        </div>

        <div className="flex items-center justify-between">
          <span className="flex items-center gap-2 text-sm text-muted-foreground">
            <Mail className="h-4 w-4" />
            User ID
          </span>
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 rounded px-1.5 py-0.5 font-mono text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            title="Copy full User ID"
          >
            {userId ? `${userId.slice(0, 8)}...` : "-"}
            {copied ? (
              <Check className="h-3.5 w-3.5 text-emerald-600" />
            ) : (
              <Copy className="h-3.5 w-3.5" />
            )}
          </button>
        </div>
      </CardContent>
    </Card>
  );
}
