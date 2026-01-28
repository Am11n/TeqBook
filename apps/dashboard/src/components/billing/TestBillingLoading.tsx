"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface TestBillingLoadingProps {
  message: string;
  subMessage?: string;
  onRetry?: () => void;
  retryLabel?: string;
}

export function TestBillingLoading({
  message,
  subMessage,
  onRetry,
  retryLabel = "Refresh",
}: TestBillingLoadingProps) {
  return (
    <div className="container mx-auto p-8">
      <Card className="p-6">
        <p>{message}</p>
        {subMessage && <p className="text-sm text-muted-foreground mt-2">{subMessage}</p>}
        {onRetry && (
          <Button onClick={onRetry} className="mt-4">
            {retryLabel}
          </Button>
        )}
      </Card>
    </div>
  );
}

