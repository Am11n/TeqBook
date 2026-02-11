"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { NavLink } from "./NavLink";
import type { MenuItem } from "@/lib/hooks/dashboard/useDashboardMenuItems";

interface DashboardSidebarProps {
  sidebarCollapsed: boolean;
  onToggleSidebar: () => void;
  overviewItems: MenuItem[];
  operationsItems: MenuItem[];
  managementItems: MenuItem[];
  complianceItems: MenuItem[];
  systemItems: MenuItem[];
  pathname: string;
  builtForText: string;
  sectionLabels: {
    overview: string;
    operations: string;
    management: string;
    compliance: string;
    system: string;
    collapseSidebar: string;
    expandSidebar: string;
  };
}

export function DashboardSidebar({
  sidebarCollapsed,
  onToggleSidebar,
  overviewItems,
  operationsItems,
  managementItems,
  complianceItems,
  systemItems,
  pathname,
  builtForText,
  sectionLabels,
}: DashboardSidebarProps) {
  return (
    <aside
      className={`hidden border-r border-border/5 bg-sidebar backdrop-blur-md transition-all duration-[250ms] ease-in-out md:flex md:flex-col shadow-[0_20px_60px_rgba(15,23,42,0.08)] ${
        sidebarCollapsed ? "w-20" : "w-72"
      }`}
    >
      <div className="flex h-full flex-col p-5 overflow-y-auto">
        {/* Navigation */}
        <nav className="flex flex-1 flex-col gap-3 overflow-y-auto min-h-0">
          {/* Overview Section */}
          <div>
            {!sidebarCollapsed && (
              <div className="mb-2 flex items-center justify-between px-3">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {sectionLabels.overview}
                </p>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        onClick={onToggleSidebar}
                        className="flex h-6 w-6 items-center justify-center rounded border border-primary/20 bg-primary/10 transition-colors hover:bg-primary/20 hover:border-primary/30"
                        aria-label={sectionLabels.collapseSidebar}
                      >
                        <ChevronLeft className="h-3 w-3 text-primary" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="right">{sectionLabels.collapseSidebar}</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            )}
            {sidebarCollapsed && (
              <div className="mb-2 flex items-center justify-center">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        onClick={onToggleSidebar}
                        className="flex h-6 w-6 items-center justify-center rounded border border-blue-200/60 bg-blue-50/80 transition-colors hover:bg-blue-100/60 hover:border-blue-300/60"
                        aria-label={sectionLabels.expandSidebar}
                      >
                        <ChevronRight className="h-3 w-3 text-primary" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="right">{sectionLabels.expandSidebar}</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            )}
            <div className="flex flex-col gap-1.5">
              {overviewItems.map((item) => (
                <NavLink
                  key={item.href}
                  href={item.href}
                  label={item.label}
                  icon={item.icon}
                  isActive={pathname === item.href || pathname.startsWith(item.href + "/")}
                  collapsed={sidebarCollapsed}
                />
              ))}
            </div>
          </div>

          {/* Operations Section */}
          <div>
            {!sidebarCollapsed && (
              <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                {sectionLabels.operations}
              </p>
            )}
            <div className="flex flex-col gap-1.5">
              {operationsItems.map((item) => (
                <NavLink
                  key={item.href}
                  href={item.href}
                  label={item.label}
                  icon={item.icon}
                  isActive={pathname === item.href || pathname.startsWith(item.href + "/")}
                  collapsed={sidebarCollapsed}
                />
              ))}
            </div>
          </div>

          {/* Management Section */}
          <div>
            {!sidebarCollapsed && (
              <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                {sectionLabels.management}
              </p>
            )}
            <div className="flex flex-col gap-1.5">
              {managementItems.map((item) => (
                <NavLink
                  key={item.href}
                  href={item.href}
                  label={item.label}
                  icon={item.icon}
                  isActive={pathname === item.href || pathname.startsWith(item.href)}
                  collapsed={sidebarCollapsed}
                />
              ))}
            </div>
          </div>

          {/* Compliance Section */}
          <div>
            {!sidebarCollapsed && complianceItems.length > 0 && (
              <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                {sectionLabels.compliance}
              </p>
            )}
            <div className="flex flex-col gap-1.5">
              {complianceItems.map((item) => (
                <NavLink
                  key={item.href}
                  href={item.href}
                  label={item.label}
                  icon={item.icon}
                  isActive={pathname === item.href || pathname.startsWith(item.href + "/")}
                  collapsed={sidebarCollapsed}
                />
              ))}
            </div>
          </div>

          {/* System Section */}
          <div>
            {!sidebarCollapsed && (
              <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                {sectionLabels.system}
              </p>
            )}
            <div className="flex flex-col gap-1.5">
              {systemItems.map((item) => (
                <NavLink
                  key={item.href}
                  href={item.href}
                  label={item.label}
                  icon={item.icon}
                  isActive={pathname.startsWith(item.href)}
                  collapsed={sidebarCollapsed}
                />
              ))}
            </div>
          </div>
        </nav>

        {/* Built for text at bottom */}
        {!sidebarCollapsed && (
          <div className="mt-auto pt-4 border-t border-border/60">
            <p className="text-xs text-muted-foreground">{builtForText}</p>
          </div>
        )}
      </div>
    </aside>
  );
}

