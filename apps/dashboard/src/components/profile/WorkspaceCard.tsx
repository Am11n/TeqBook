"use client";

import Link from "next/link";
import { Settings } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { InfoRow } from "./info-row";
import type { Salon } from "@/lib/types";

interface WorkspaceCardProps {
  salon: Salon | null;
}

export function WorkspaceCard({ salon }: WorkspaceCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Workspace</CardTitle>
        <CardDescription>Your salon and workspace information</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {salon ? (
          <>
            <InfoRow label="Salon Name" value={salon.name || "Not set"} />
            <InfoRow label="Salon Type" value={salon.salon_type || "Not set"} />
            <div className="pt-4 border-t">
              <Button asChild variant="ghost" size="sm" className="w-full">
                <Link href="/settings/general">
                  <Settings className="h-4 w-4 mr-2" />
                  Go to Salon Settings
                </Link>
              </Button>
            </div>
          </>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <p className="text-sm">No salon assigned</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

