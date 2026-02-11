"use client";

import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NavLink } from "./NavLink";
import type { MenuItem } from "@/lib/hooks/dashboard/useDashboardMenuItems";

interface MobileNavigationProps {
  open: boolean;
  onClose: () => void;
  overviewItems: MenuItem[];
  operationsItems: MenuItem[];
  managementItems: MenuItem[];
  complianceItems: MenuItem[];
  systemItems: MenuItem[];
  pathname: string;
  builtForText: string;
  closeNavText: string;
  sectionLabels: {
    overview: string;
    operations: string;
    management: string;
    compliance: string;
    system: string;
  };
}

export function MobileNavigation({
  open,
  onClose,
  overviewItems,
  operationsItems,
  managementItems,
  complianceItems,
  systemItems,
  pathname,
  builtForText,
  closeNavText,
  sectionLabels,
}: MobileNavigationProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm md:hidden">
      {/* Clickable backdrop */}
      <button
        type="button"
        aria-label={closeNavText}
        className="absolute inset-0 h-full w-full cursor-default"
        onClick={onClose}
      />

      {/* Sliding panel - matching desktop sidebar */}
      <div className="absolute inset-y-0 left-0 flex w-80 max-w-[85%] flex-col border-r border-border/5 bg-sidebar backdrop-blur-md shadow-[0_20px_60px_rgba(15,23,42,0.08)] pt-[72px]">
        {/* Close button at top right */}
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="absolute top-4 right-4 h-9 w-9 rounded-lg z-10"
          onClick={onClose}
          aria-label={closeNavText}
        >
          <X className="h-5 w-5" />
        </Button>

        <div className="flex h-full flex-col p-5 overflow-y-auto">
          <nav className="flex flex-1 flex-col gap-3 overflow-y-auto min-h-0">
            {/* Overview Section */}
            <div>
              <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                {sectionLabels.overview}
              </p>
              <div className="flex flex-col gap-1.5">
                {overviewItems.map((item) => (
                  <NavLink
                    key={item.href}
                    href={item.href}
                    label={item.label}
                    icon={item.icon}
                    isActive={pathname === item.href || pathname.startsWith(item.href + "/")}
                    collapsed={false}
                  />
                ))}
              </div>
            </div>

            {/* Operations Section */}
            <div>
              <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                {sectionLabels.operations}
              </p>
              <div className="flex flex-col gap-1.5">
                {operationsItems.map((item) => (
                  <NavLink
                    key={item.href}
                    href={item.href}
                    label={item.label}
                    icon={item.icon}
                    isActive={pathname === item.href || pathname.startsWith(item.href + "/")}
                    collapsed={false}
                  />
                ))}
              </div>
            </div>

            {/* Management Section */}
            <div>
              <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                {sectionLabels.management}
              </p>
              <div className="flex flex-col gap-1.5">
                {managementItems.map((item) => (
                  <NavLink
                    key={item.href}
                    href={item.href}
                    label={item.label}
                    icon={item.icon}
                    isActive={pathname === item.href || pathname.startsWith(item.href)}
                    collapsed={false}
                  />
                ))}
            </div>
          </div>

            {/* Compliance Section */}
            <div>
              {complianceItems.length > 0 && (
                <>
                  <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                    {sectionLabels.compliance}
                  </p>
                  <div className="flex flex-col gap-1.5">
                    {complianceItems.map((item) => (
                      <NavLink
                        key={item.href}
                        href={item.href}
                        label={item.label}
                        icon={item.icon}
                        isActive={pathname === item.href || pathname.startsWith(item.href + "/")}
                        collapsed={false}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* System Section */}
            <div>
              <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                {sectionLabels.system}
              </p>
              <div className="flex flex-col gap-1.5">
                {systemItems.map((item) => (
                  <NavLink
                    key={item.href}
                    href={item.href}
                    label={item.label}
                    icon={item.icon}
                    isActive={pathname.startsWith(item.href)}
                    collapsed={false}
                  />
                ))}
              </div>
            </div>
          </nav>

          {/* Built for text at bottom */}
          <div className="mt-auto pt-4 border-t border-border/60">
            <p className="text-xs text-muted-foreground">{builtForText}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

