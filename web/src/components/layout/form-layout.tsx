import { ReactNode } from "react";

type FormLayoutProps = {
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
};

export function FormLayout({
  title,
  description,
  children,
  footer,
}: FormLayoutProps) {
  return (
    <div className="space-y-4 rounded-2xl border bg-card p-6 shadow-sm">
      <div>
        <h1 className="text-lg font-semibold tracking-tight">{title}</h1>
        {description && (
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      <div className="pt-2">{children}</div>
      {footer ? <div className="pt-2">{footer}</div> : null}
    </div>
  );
}


