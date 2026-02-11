"use client";

import { useEffect, useRef } from "react";
import { Plus, Ban } from "lucide-react";

interface SlotContextMenuProps {
  x: number;
  y: number;
  employeeName: string;
  time: string;
  onNewBooking: () => void;
  onBlockTime: () => void;
  onClose: () => void;
}

export function SlotContextMenu({
  x,
  y,
  employeeName,
  time,
  onNewBooking,
  onBlockTime,
  onClose,
}: SlotContextMenuProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose();
      }
    }
    function handleEsc(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEsc);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEsc);
    };
  }, [onClose]);

  // Position menu so it doesn't overflow viewport
  const menuStyle: React.CSSProperties = {
    position: "fixed",
    left: `${Math.min(x, window.innerWidth - 220)}px`,
    top: `${Math.min(y, window.innerHeight - 160)}px`,
    zIndex: 50,
  };

  return (
    <div
      ref={ref}
      className="w-52 rounded-lg border bg-popover p-1 shadow-lg animate-in fade-in-0 zoom-in-95"
      style={menuStyle}
    >
      <div className="px-2 py-1.5 text-[10px] font-medium text-muted-foreground">
        {employeeName} &middot; {time}
      </div>
      <button
        onClick={onNewBooking}
        className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-accent transition-colors"
      >
        <Plus className="h-3.5 w-3.5" />
        New booking
      </button>
      <button
        onClick={onBlockTime}
        className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-accent transition-colors"
      >
        <Ban className="h-3.5 w-3.5" />
        Block time
      </button>
    </div>
  );
}
