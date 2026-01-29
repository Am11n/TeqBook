"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { AddonDisplay } from "@/lib/utils/billing/billing-utils";

interface AddonsCardProps {
  addons: AddonDisplay[];
}

export function AddonsCard({ addons }: AddonsCardProps) {
  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-2">Add-ons</h3>
      <p className="text-sm text-muted-foreground mb-4">
        Enhance your plan with additional features
      </p>

      <div className="space-y-4">
        {addons.map((addon) => (
          <div
            key={addon.id}
            className="border rounded-lg p-4 flex items-start justify-between"
          >
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="font-medium">{addon.name}</h4>
                {addon.active && (
                  <Badge variant="default" className="text-xs">
                    Active
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground mb-2">{addon.description}</p>
              <p className="text-sm font-medium">{addon.price}</p>
              {addon.quantity > 0 && (
                <p className="text-xs text-muted-foreground mt-1">
                  Current quantity: {addon.quantity}
                </p>
              )}
            </div>
            <Button variant={addon.active ? "outline" : "default"} size="sm" disabled>
              {addon.active ? "Manage" : "Add"}
            </Button>
          </div>
        ))}
      </div>
    </Card>
  );
}

