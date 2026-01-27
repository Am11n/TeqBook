"use client";

import Link from "next/link";
import { Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { getInitials } from "@/lib/utils/dashboard/dashboard-utils";

type Employee = {
  id: string;
  full_name: string;
  role: string | null;
  is_active: boolean;
};

interface StaffOverviewCardProps {
  loading: boolean;
  employees: Employee[];
  translations: {
    yourStaff: string;
    manageStaffPermissions: string;
    inviteNewStaff: string;
    online: string;
    offline: string;
    manageStaff: string;
  };
}

export function StaffOverviewCard({
  loading,
  employees,
  translations,
}: StaffOverviewCardProps) {
  return (
    <div className="group rounded-2xl bg-card/90 backdrop-blur-xl px-8 py-8 shadow-[0_8px_30px_rgba(0,0,0,0.06)] border border-border transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_12px_40px_rgba(0,0,0,0.1)] animate-fade-in-up" style={{ animationDelay: '50ms' }}>
      <div className="mb-8 flex items-center gap-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 transition-transform group-hover:scale-110">
          <Users className="h-5 w-5 text-primary transition-transform group-hover:translate-x-0.5" />
        </div>
        <h2 className="text-lg font-semibold text-foreground">{translations.yourStaff}</h2>
      </div>

      {loading ? (
        <div className="space-y-4">
          <Skeleton className="h-16 w-full rounded-lg animate-shimmer" />
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-16 w-full rounded-lg animate-shimmer" />
            ))}
          </div>
        </div>
      ) : employees.length === 0 ? (
        <div className="mb-6">
          <div className="mb-4 flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-2xl font-semibold text-primary">
              <Users className="h-8 w-8" />
            </div>
          </div>
          <p className="mb-1 text-sm font-medium text-foreground text-center">
            No staff members yet.
          </p>
          <p className="mb-4 text-xs text-muted-foreground text-center">
            {translations.manageStaffPermissions}
          </p>
          <Button asChild className="h-9 w-full">
            <Link href="/employees">{translations.inviteNewStaff}</Link>
          </Button>
        </div>
      ) : (
        <>
          <div className="mb-6 space-y-3">
            {employees.slice(0, 3).map((employee) => (
              <div
                key={employee.id}
                className="flex items-center gap-3 rounded-lg border border-border bg-muted/50 px-3 py-2.5"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                  {getInitials(employee.full_name)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-foreground truncate">
                    {employee.full_name}
                  </p>
                  <div className="mt-0.5 flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">
                      {employee.role || "Staff"}
                    </span>
                    <span className="text-muted-foreground/50">•</span>
                    <div className="flex items-center gap-1">
                      <div
                        className={`h-1.5 w-1.5 rounded-full ${
                          employee.is_active
                            ? "bg-green-500"
                            : "bg-muted-foreground/40"
                        }`}
                      />
                      <span className="text-xs text-muted-foreground">
                        {employee.is_active ? translations.online : translations.offline}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <Button asChild variant="outline" className="h-9 w-full">
            <Link href="/employees">{translations.manageStaff}</Link>
          </Button>
        </>
      )}
    </div>
  );
}

