import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { NAV_SECTIONS } from "./nav-config";
import { NavLink } from "./NavLink";

interface MobileNavProps {
  open: boolean;
  activeHref: string | null;
  onClose: () => void;
}

export function MobileNav({ open, activeHref, onClose }: MobileNavProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm md:hidden">
      <button
        type="button" aria-label="Close navigation"
        className="absolute inset-0 h-full w-full cursor-default"
        onClick={onClose}
      />
      <div className="absolute inset-y-0 left-0 flex w-80 max-w-[85%] flex-col border-r border-border/5 bg-sidebar backdrop-blur-md shadow-[0_20px_60px_rgba(15,23,42,0.08)] pt-[72px]">
        <Button
          type="button" variant="ghost" size="icon"
          className="absolute top-4 right-4 h-9 w-9 rounded-lg z-10"
          onClick={onClose} aria-label="Close navigation"
        >
          <X className="h-5 w-5" />
        </Button>
        <div className="flex h-full flex-col p-5 overflow-y-auto">
          <nav className="flex flex-1 flex-col gap-3 overflow-y-auto min-h-0">
            {NAV_SECTIONS.map((section) => (
              <div key={section.label}>
                <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                  {section.label}
                </p>
                <div className="flex flex-col gap-1.5">
                  {section.items.map((item) => (
                    <NavLink
                      key={item.href}
                      href={item.href}
                      label={item.label}
                      icon={item.icon}
                      isActive={activeHref === item.href}
                      collapsed={false}
                    />
                  ))}
                </div>
              </div>
            ))}
          </nav>
          <div className="mt-auto pt-4 border-t border-border/60">
            <p className="text-xs text-muted-foreground">Built for system administration</p>
          </div>
        </div>
      </div>
    </div>
  );
}
