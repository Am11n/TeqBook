"use client";

import { AdminShell } from "@/components/layout/admin-shell";
import { PageLayout } from "@/components/layout/page-layout";
import { useAdminConsoleMessages } from "@/i18n/use-admin-console-messages";
import { DesignSystemDemoContent } from "./_components/DesignSystemDemoContent";

export default function DesignSystemPage() {
  const ds = useAdminConsoleMessages().pages.designSystem;

  return (
    <AdminShell>
      <PageLayout title={ds.title} description={ds.description} showCard={false}>
        <DesignSystemDemoContent />
      </PageLayout>
    </AdminShell>
  );
}
