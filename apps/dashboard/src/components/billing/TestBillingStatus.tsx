"use client";

import { Card } from "@/components/ui/card";
import type { Salon } from "@/lib/types";

interface TestBillingStatusProps {
  salon: Salon | null;
}

export function TestBillingStatus({ salon }: TestBillingStatusProps) {
  return (
    <div className="space-y-4 mb-6 p-4 bg-muted rounded-lg">
      <div>
        <p className="text-sm font-medium">Salon ID:</p>
        <p className="text-xs text-muted-foreground font-mono">{salon?.id || "N/A"}</p>
      </div>
      <div>
        <p className="text-sm font-medium">Customer ID:</p>
        <p className="text-xs text-muted-foreground font-mono">
          {salon?.billing_customer_id || "Ikke opprettet"}
        </p>
      </div>
      <div>
        <p className="text-sm font-medium">Subscription ID:</p>
        <p className="text-xs text-muted-foreground font-mono">
          {salon?.billing_subscription_id || "Ikke opprettet"}
        </p>
      </div>
      <div>
        <p className="text-sm font-medium">Current Plan:</p>
        <p className="text-xs text-muted-foreground">{salon?.plan || "Ingen plan"}</p>
      </div>
      <div>
        <p className="text-sm font-medium">Current Period End:</p>
        <p className="text-xs text-muted-foreground">
          {salon?.current_period_end
            ? new Date(salon.current_period_end).toLocaleString()
            : "N/A"}
        </p>
      </div>
    </div>
  );
}

