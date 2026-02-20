import { memo } from "react";
import Link from "next/link";
import {
  Tooltip, TooltipContent, TooltipProvider, TooltipTrigger,
} from "@/components/ui/tooltip";

type NavLinkProps = {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  isActive?: boolean;
  collapsed?: boolean;
  className?: string;
};

export const NavLink = memo(function NavLink({
  href, label, icon: Icon, isActive = false, collapsed = false, className,
}: NavLinkProps) {
  const content = (
    <Link
      href={href}
      prefetch={true}
      className={`group relative flex items-center rounded-xl text-[15px] font-medium transition-all duration-150 ease-out ${
        isActive
          ? "bg-primary/10 text-primary"
          : "bg-transparent text-foreground/70 hover:bg-primary/5 hover:text-primary"
      } ${collapsed ? "justify-center px-3 py-3" : "gap-2 px-4 py-3"} ${className ?? ""} ${
        !isActive ? "hover:-translate-y-[1px]" : ""
      }`}
      onClick={(e) => e.stopPropagation()}
    >
      {isActive && !collapsed && (
        <div className="absolute left-0 top-1/2 h-8 w-1 -translate-y-1/2 rounded-r-full bg-blue-700" />
      )}
      {isActive && collapsed && (
        <div className="absolute inset-0 rounded-xl bg-blue-700/10" />
      )}
      <Icon
        className={`h-5 w-5 flex-shrink-0 transition-all duration-150 ${
          isActive
            ? "text-blue-700"
            : "text-muted-foreground group-hover:text-primary group-hover:opacity-100"
        } ${!isActive ? "opacity-70 group-hover:opacity-100" : ""}`}
      />
      {!collapsed && (
        <span className={`truncate transition-opacity duration-200 ${collapsed ? "opacity-0" : "opacity-100"}`}>
          {label}
        </span>
      )}
    </Link>
  );

  if (collapsed) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>{content}</TooltipTrigger>
          <TooltipContent side="right">{label}</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return content;
});
