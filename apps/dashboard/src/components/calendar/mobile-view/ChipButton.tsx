import { forwardRef, type ReactNode } from "react";

interface ChipButtonProps {
  active: boolean;
  accentDot?: string;
  onClick: () => void;
  children: ReactNode;
}

export const ChipButton = forwardRef<HTMLButtonElement, ChipButtonProps>(
  ({ active, accentDot, onClick, children }, ref) => {
    return (
      <button
        ref={ref}
        type="button"
        onClick={onClick}
        className={`flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
          active
            ? "border-foreground/30 bg-foreground/10 text-foreground"
            : "border-border bg-background text-muted-foreground active:bg-muted"
        }`}
      >
        {accentDot && <span className={`h-2 w-2 rounded-full ${accentDot}`} />}
        {children}
      </button>
    );
  }
);
ChipButton.displayName = "ChipButton";
