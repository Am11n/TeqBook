import type { ReactNode } from "react";
import { cn } from "@teqbook/ui";
import { PageHeader } from "@teqbook/layout";
import type { PageAction } from "../types";
import { renderActions } from "./action-renderer";

type PageLayoutProps = {
  title: string;
  description?: string;
  actions?: PageAction[];
  actionsSlot?: ReactNode;
  breadcrumbs?: ReactNode;
  children: ReactNode;
  className?: string;
  showCard?: boolean;
  showHeader?: boolean;
};

export function PageLayout({
  title,
  description,
  actions,
  actionsSlot,
  breadcrumbs,
  children,
  className,
  showCard = true,
  showHeader = true,
}: PageLayoutProps) {
  const renderedActions = actionsSlot ?? renderActions(actions);

  return (
    <>
      {showHeader && (
        <PageHeader
          title={title}
          description={description}
          actions={renderedActions}
        />
      )}

      {breadcrumbs && (
        <div className="mt-4">
          {breadcrumbs}
        </div>
      )}

      <div
        className={cn(
          "mt-6",
          showCard && "rounded-xl border bg-card p-4 shadow-sm",
          className
        )}
      >
        {children}
      </div>
    </>
  );
}

export function PageLayoutSimple({
  title,
  description,
  actions,
  actionsSlot,
  breadcrumbs,
  children,
  className,
  showHeader = true,
}: Omit<PageLayoutProps, "showCard">) {
  return (
    <PageLayout
      title={title}
      description={description}
      actions={actions}
      actionsSlot={actionsSlot}
      breadcrumbs={breadcrumbs}
      showCard={false}
      showHeader={showHeader}
      className={className}
    >
      {children}
    </PageLayout>
  );
}
