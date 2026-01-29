"use client";

import Link from "next/link";
import { Zap, Plus, User, Users, ArrowRight } from "lucide-react";

interface QuickActionsCardProps {
  translations: {
    quickActions: string;
    addNewBooking: string;
    addNewCustomer: string;
    addNewService: string;
    inviteNewStaff: string;
  };
}

export function QuickActionsCard({ translations }: QuickActionsCardProps) {
  return (
    <div className="group rounded-2xl bg-card/90 backdrop-blur-xl px-8 py-8 shadow-[0_8px_30px_rgba(0,0,0,0.06)] border border-border transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_12px_40px_rgba(0,0,0,0.1)] animate-fade-in-up" style={{ animationDelay: '100ms' }}>
      <div className="mb-8 flex items-center gap-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 transition-transform group-hover:scale-110">
          <Zap className="h-5 w-5 text-primary transition-transform group-hover:translate-x-0.5" />
        </div>
        <h2 className="text-lg font-semibold text-foreground">{translations.quickActions}</h2>
      </div>

      <div className="space-y-1.5">
        <Link
          href="/bookings"
          className="group/item flex items-center justify-between gap-3 rounded-lg border border-border bg-muted/50 px-3 py-2 transition-all hover:bg-muted hover:shadow-[0_2px_8px_rgba(29,78,216,0.08)]"
        >
          <div className="flex items-center gap-3">
            <Plus className="h-4 w-4 text-primary transition-transform group-hover/item:translate-x-0.5" />
            <span className="text-sm font-medium text-foreground">{translations.addNewBooking}</span>
          </div>
          <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover/item:translate-x-1" />
        </Link>

        <Link
          href="/customers"
          className="group/item flex items-center justify-between gap-3 rounded-lg border border-border bg-muted/50 px-3 py-2 transition-all hover:bg-muted hover:shadow-[0_2px_8px_rgba(29,78,216,0.08)]"
        >
          <div className="flex items-center gap-3">
            <User className="h-4 w-4 text-primary transition-transform group-hover/item:translate-x-0.5" />
            <span className="text-sm font-medium text-foreground">{translations.addNewCustomer}</span>
          </div>
          <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover/item:translate-x-1" />
        </Link>

        <Link
          href="/services"
          className="group/item flex items-center justify-between gap-3 rounded-lg border border-border bg-muted/50 px-3 py-2 transition-all hover:bg-muted hover:shadow-[0_2px_8px_rgba(29,78,216,0.08)]"
        >
          <div className="flex items-center gap-3">
            <Plus className="h-4 w-4 text-primary transition-transform group-hover/item:translate-x-0.5" />
            <span className="text-sm font-medium text-foreground">{translations.addNewService}</span>
          </div>
          <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover/item:translate-x-1" />
        </Link>

        <Link
          href="/employees"
          className="group/item flex items-center justify-between gap-3 rounded-lg border border-border bg-muted/50 px-3 py-2 transition-all hover:bg-muted hover:shadow-[0_2px_8px_rgba(29,78,216,0.08)]"
        >
          <div className="flex items-center gap-3">
            <Users className="h-4 w-4 text-primary transition-transform group-hover/item:translate-x-0.5" />
            <span className="text-sm font-medium text-foreground">{translations.inviteNewStaff}</span>
          </div>
          <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover/item:translate-x-1" />
        </Link>
      </div>
    </div>
  );
}

