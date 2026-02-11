"use client";

import { Ban, Coffee, Palmtree, GraduationCap, Lock, Calendar } from "lucide-react";

interface TimeBlockEventProps {
  title: string;
  blockType: string;
  style?: React.CSSProperties;
}

const blockIcons: Record<string, React.ElementType> = {
  meeting: Calendar,
  vacation: Palmtree,
  training: GraduationCap,
  private: Lock,
  lunch: Coffee,
  other: Ban,
};

export function TimeBlockEvent({ title, blockType, style }: TimeBlockEventProps) {
  const Icon = blockIcons[blockType] || Ban;
  const height = style?.height ? parseInt(String(style.height)) : 40;

  return (
    <div
      className="flex items-start gap-1 px-1 py-0.5 pointer-events-none select-none"
      style={style}
    >
      <Icon className="h-3 w-3 mt-0.5 shrink-0 text-muted-foreground/60" />
      {height > 16 && (
        <span className="text-[9px] font-medium text-muted-foreground/70 truncate leading-tight">
          {title}
        </span>
      )}
    </div>
  );
}
