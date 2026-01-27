import { ReactNode } from "react";
import { DashboardShell } from "./dashboard-shell";
import { PageHeader } from "./page-header";
import { cn } from "@/lib/utils";

type PageLayoutProps = {
  /**
   * Page title (displayed as h1)
   */
  title: string;

  /**
   * Optional page description
   */
  description?: string;

  /**
   * Actions to display in the header (e.g., buttons)
   */
  actions?: ReactNode;

  /**
   * Breadcrumbs (optional, for navigation context)
   */
  breadcrumbs?: ReactNode;

  /**
   * Main page content
   */
  children: ReactNode;

  /**
   * Additional CSS classes for the content container
   */
  className?: string;

  /**
   * Whether to show the default card container around content
   * @default true
   */
  showCard?: boolean;

  /**
   * Whether to show the page header
   * @default true
   */
  showHeader?: boolean;
};

/**
 * Standard page layout component
 * 
 * Provides consistent structure for all pages:
 * - Header with title, description, and actions
 * - Optional breadcrumbs
 * - Content area with consistent spacing
 * 
 * @example
 * ```tsx
 * <PageLayout
 *   title="Bookings"
 *   description="Manage your appointments"
 *   actions={<Button>New Booking</Button>}
 * >
 *   <BookingsTable />
 * </PageLayout>
 * ```
 */
export function PageLayout({
  title,
  description,
  actions,
  breadcrumbs,
  children,
  className,
  showCard = true,
  showHeader = true,
}: PageLayoutProps) {
  return (
    <DashboardShell>
      {showHeader && (
        <PageHeader
          title={title}
          description={description}
          actions={actions}
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
    </DashboardShell>
  );
}

/**
 * Simplified page layout without card container
 * Useful for pages that need custom layouts
 */
export function PageLayoutSimple({
  title,
  description,
  actions,
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
      breadcrumbs={breadcrumbs}
      showCard={false}
      showHeader={showHeader}
      className={className}
    >
      {children}
    </PageLayout>
  );
}

