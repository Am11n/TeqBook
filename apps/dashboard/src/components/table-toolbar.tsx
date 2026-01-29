import { ReactNode } from "react";

type TableToolbarProps = {
  title?: string;
  children?: ReactNode;
  actions?: ReactNode;
};

export function TableToolbar({ title, children, actions }: TableToolbarProps) {
  return (
    <div className="flex flex-col gap-3 border-b pb-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-1 items-center gap-3">
        {title ? (
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {title}
          </p>
        ) : null}
        {children}
      </div>
      {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
    </div>
  );
}


