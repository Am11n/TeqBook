import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { SidebarNav } from "./SidebarNav";
import type { NavSection } from "./nav-config";
import type { AdminConsoleMessages } from "@/i18n/admin-console";

interface MobileNavProps {
  open: boolean;
  activeHref: string | null;
  onClose: () => void;
  sections: NavSection[];
  shell: AdminConsoleMessages["shell"];
}

export function MobileNav({ open, activeHref, onClose, sections, shell }: MobileNavProps) {
  if (!open) return null;

  const shellPick = {
    collapseSidebarAria: shell.collapseSidebarAria,
    expandSidebarAria: shell.expandSidebarAria,
    collapseSidebarTooltip: shell.collapseSidebarTooltip,
    expandSidebarTooltip: shell.expandSidebarTooltip,
  };

  return (
    <div className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm md:hidden">
      <button
        type="button"
        aria-label={shell.closeNavigationAria}
        className="absolute inset-0 h-full w-full cursor-default"
        onClick={onClose}
      />
      <div className="absolute inset-y-0 left-0 flex w-80 max-w-[85%] flex-col border-r border-border/5 bg-sidebar backdrop-blur-md shadow-[0_20px_60px_rgba(15,23,42,0.08)] pt-[72px]">
        <Button
          type="button" variant="ghost" size="icon"
          className="absolute top-4 right-4 h-9 w-9 rounded-lg z-10"
          onClick={onClose} aria-label={shell.closeNavigationAria}
        >
          <X className="h-5 w-5" />
        </Button>
        <div className="flex h-full flex-col p-5 overflow-y-auto">
          <SidebarNav
            sections={sections}
            activeHref={activeHref}
            collapsed={false}
            shell={shellPick}
          />
          <div className="mt-auto pt-4 border-t border-border/60">
            <p className="text-xs text-muted-foreground">{shell.navFooterHint}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
