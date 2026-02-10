"use client";

import { useState, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DetailDrawer } from "./detail-drawer";
import { Eye, EyeOff, Users, Calendar, Scissors, UserCircle } from "lucide-react";
import { supabase } from "@/lib/supabase-client";
import { logError } from "@/lib/services/logger";

type ImpersonationDrawerProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  salonId: string | null;
  salonName: string | null;
};

type SalonData = {
  employee_count: number;
  booking_count: number;
  service_count: number;
  customer_count: number;
  plan: string;
  is_public: boolean;
};

export function ImpersonationDrawer({ open, onOpenChange, salonId, salonName }: ImpersonationDrawerProps) {
  const [salonData, setSalonData] = useState<SalonData | null>(null);
  const [loading, setLoading] = useState(false);

  const logImpersonation = useCallback(async (action: "impersonation_start" | "impersonation_end") => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || !salonId) return;
      await supabase.from("security_audit_log").insert({
        user_id: user.id,
        salon_id: salonId,
        action,
        resource_type: "admin",
        metadata: { target_salon: salonName, admin_email: user.email },
      });
    } catch (err) {
      logError("Impersonation log error", err);
    }
  }, [salonId, salonName]);

  useEffect(() => {
    if (open && salonId) {
      loadSalonData();
      logImpersonation("impersonation_start");
    }
    if (!open && salonId) {
      logImpersonation("impersonation_end");
    }
  }, [open, salonId]);

  async function loadSalonData() {
    if (!salonId) return;
    setLoading(true);
    try {
      const [empResult, bookResult, svcResult, custResult, salonResult] = await Promise.all([
        supabase.from("employees").select("*", { count: "exact", head: true }).eq("salon_id", salonId),
        supabase.from("bookings").select("*", { count: "exact", head: true }).eq("salon_id", salonId),
        supabase.from("services").select("*", { count: "exact", head: true }).eq("salon_id", salonId),
        supabase.from("customers").select("*", { count: "exact", head: true }).eq("salon_id", salonId),
        supabase.from("salons").select("plan, is_public").eq("id", salonId).single(),
      ]);
      setSalonData({
        employee_count: empResult.count ?? 0,
        booking_count: bookResult.count ?? 0,
        service_count: svcResult.count ?? 0,
        customer_count: custResult.count ?? 0,
        plan: salonResult.data?.plan ?? "starter",
        is_public: salonResult.data?.is_public ?? false,
      });
    } catch (err) {
      logError("Impersonation data load error", err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <DetailDrawer
      open={open}
      onOpenChange={onOpenChange}
      title={salonName ?? "Salon View"}
      description="Read-only impersonation view"
      widthClass="w-[560px]"
    >
      {/* Warning banner */}
      <div className="rounded-lg bg-amber-50 border border-amber-200 px-4 py-3 mb-4">
        <div className="flex items-center gap-2">
          <Eye className="h-4 w-4 text-amber-600" />
          <span className="text-sm font-semibold text-amber-800">IMPERSONATION MODE</span>
        </div>
        <p className="text-xs text-amber-700 mt-1">You are viewing this salon&apos;s data in read-only mode. All actions are logged.</p>
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-16 rounded-lg bg-muted animate-pulse" />)}
        </div>
      ) : salonData ? (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Badge variant="outline">{salonData.plan}</Badge>
            <Badge variant="outline" className={salonData.is_public ? "border-emerald-200 bg-emerald-50 text-emerald-700" : ""}>{salonData.is_public ? "Active" : "Inactive"}</Badge>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Card><CardContent className="p-4 flex items-center gap-3"><Users className="h-5 w-5 text-muted-foreground" /><div><p className="text-2xl font-bold">{salonData.employee_count}</p><p className="text-xs text-muted-foreground">Employees</p></div></CardContent></Card>
            <Card><CardContent className="p-4 flex items-center gap-3"><Calendar className="h-5 w-5 text-muted-foreground" /><div><p className="text-2xl font-bold">{salonData.booking_count}</p><p className="text-xs text-muted-foreground">Bookings</p></div></CardContent></Card>
            <Card><CardContent className="p-4 flex items-center gap-3"><Scissors className="h-5 w-5 text-muted-foreground" /><div><p className="text-2xl font-bold">{salonData.service_count}</p><p className="text-xs text-muted-foreground">Services</p></div></CardContent></Card>
            <Card><CardContent className="p-4 flex items-center gap-3"><UserCircle className="h-5 w-5 text-muted-foreground" /><div><p className="text-2xl font-bold">{salonData.customer_count}</p><p className="text-xs text-muted-foreground">Customers</p></div></CardContent></Card>
          </div>
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">No data available</p>
      )}
    </DetailDrawer>
  );
}
