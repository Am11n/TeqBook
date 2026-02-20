import {
  Tooltip, TooltipContent, TooltipProvider, TooltipTrigger,
} from "@/components/ui/tooltip";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { NavSection } from "./nav-config";
import { NavLink } from "./NavLink";

interface SidebarNavProps {
  sections: NavSection[];
  activeHref: string | null;
  collapsed: boolean;
  onToggle: () => void;
}

export function SidebarNav({ sections, activeHref, collapsed, onToggle }: SidebarNavProps) {
  return (
    <nav className="flex flex-1 flex-col gap-3 overflow-y-auto min-h-0">
      {sections.map((section, idx) => (
        <div key={section.label}>
          {idx === 0 && !collapsed && (
            <div className="mb-2 flex items-center justify-between px-3">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {section.label}
              </p>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={onToggle}
                      className="flex h-6 w-6 items-center justify-center rounded border border-primary/20 bg-primary/10 transition-colors hover:bg-primary/20 hover:border-primary/30"
                      aria-label="Collapse sidebar"
                    >
                      <ChevronLeft className="h-3 w-3 text-primary" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="right">Collapse sidebar</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          )}
          {idx === 0 && collapsed && (
            <div className="mb-2 flex items-center justify-center">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={onToggle}
                      className="flex h-6 w-6 items-center justify-center rounded border border-blue-200/60 bg-blue-50/80 transition-colors hover:bg-blue-100/60 hover:border-blue-300/60"
                      aria-label="Expand sidebar"
                    >
                      <ChevronRight className="h-3 w-3 text-primary" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="right">Expand sidebar</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          )}
          {idx > 0 && !collapsed && (
            <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
              {section.label}
            </p>
          )}
          <div className="flex flex-col gap-1.5">
            {section.items.map((item) => (
              <NavLink
                key={item.href}
                href={item.href}
                label={item.label}
                icon={item.icon}
                isActive={activeHref === item.href}
                collapsed={collapsed}
              />
            ))}
          </div>
        </div>
      ))}
    </nav>
  );
}
