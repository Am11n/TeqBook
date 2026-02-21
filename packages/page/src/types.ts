import type { ReactNode } from "react";

export type ActionVariant = "default" | "outline" | "destructive" | "ghost";

export type PageAction = {
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  onClick?: () => void;
  href?: string;
  variant?: ActionVariant;
  disabled?: boolean;
  priority?: "primary" | "secondary";
  visible?: boolean | (() => boolean);
  analyticsId?: string;
  confirm?: { title: string; description: string };
};

export type PageState =
  | { status: "loading" }
  | { status: "error"; message: string; retry?: () => void }
  | { status: "empty"; title: string; description?: string; action?: ReactNode; quickStart?: { label: string; onClick: () => void }[] }
  | { status: "ready" };

export type StatItem = {
  label: string;
  value: string | number;
  variant?: "default" | "success" | "warning" | "danger" | "info";
  icon?: ReactNode;
};

export type ChipDef = {
  id: string;
  label: string;
  count?: number;
};

export type TabDef = {
  id: string;
  label: string;
  href: string;
  visible?: boolean;
};
