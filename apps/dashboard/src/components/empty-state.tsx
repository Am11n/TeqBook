import { ReactNode } from "react";

type EmptyStateProps = {
  title: string;
  description?: string;
  action?: ReactNode;
};

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-start gap-2 rounded-lg border border-dashed bg-muted/20 px-4 py-6 text-sm text-muted-foreground">
      <div>
        <p className="font-medium text-foreground">{title}</p>
        {description && <p className="mt-1 text-xs md:text-sm">{description}</p>}
      </div>
      {action ? <div className="mt-2">{action}</div> : null}
    </div>
  );
}


