"use client";

import { useState, useEffect, useRef, useContext, type ReactNode } from "react";
import { PageHeader } from "@teqbook/layout";
import {
  Tabs, TabsList, TabsTrigger, TabsContent,
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
  Button,
} from "@teqbook/ui";
import { TabActionsProvider, TabActionsContext, TabToolbar } from "./tab-toolbar";
import { DirtyGuardProvider, useDirtyGuard } from "./use-dirty-state";
import type { TabDef } from "../types";

type TabbedPageProps = {
  title: string;
  description?: string;
  tabs: TabDef[];
  children: ReactNode;
  guardEnabled?: boolean;
  usePathname: () => string;
  useRouter: () => { push: (url: string) => void };
};

function TabbedPageInner({
  title,
  description,
  tabs,
  children,
  guardEnabled = false,
  usePathname: usePathnameFn,
  useRouter: useRouterFn,
}: TabbedPageProps) {
  const normalizePath = (path: string) => {
    if (!path) return "/";
    const normalized = path.replace(/\/+$/, "");
    return normalized === "" ? "/" : normalized;
  };

  const matchesTabPath = (pathname: string, href: string) => {
    const current = normalizePath(pathname);
    const target = normalizePath(href);

    return (
      current === target ||
      current.startsWith(`${target}/`) ||
      current.endsWith(target) ||
      current.includes(`${target}/`)
    );
  };

  const pathname = usePathnameFn();
  const router = useRouterFn();
  const { isAnyDirty } = useDirtyGuard();
  const store = useContext(TabActionsContext);
  const [mounted, setMounted] = useState(false);
  const [showGuardDialog, setShowGuardDialog] = useState(false);
  const pendingTabRef = useRef<string | null>(null);
  const [, rerender] = useState(0);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!store) return;
    return store.subscribe(() => rerender((n) => n + 1));
  }, [store]);

  const headerActions = store?.actionsRef.current ?? null;

  const visibleTabs = tabs.filter((t) => t.visible !== false);

  const activeTab = visibleTabs.reduce<string>(
    (best, tab) =>
      matchesTabPath(pathname, tab.href) &&
      tab.href.length > (visibleTabs.find((t) => t.id === best)?.href.length ?? 0)
        ? tab.id
        : best,
    visibleTabs[0]?.id ?? "",
  );

  const tabRoutes = Object.fromEntries(visibleTabs.map((t) => [t.id, t.href]));

  const handleTabChange = (value: string) => {
    if (guardEnabled && isAnyDirty()) {
      pendingTabRef.current = value;
      setShowGuardDialog(true);
      return;
    }
    const route = tabRoutes[value];
    if (route) router.push(route);
  };

  const handleGuardDiscard = () => {
    setShowGuardDialog(false);
    const tab = pendingTabRef.current;
    pendingTabRef.current = null;
    if (tab) {
      const route = tabRoutes[tab];
      if (route) router.push(route);
    }
  };

  const handleGuardStay = () => {
    pendingTabRef.current = null;
    setShowGuardDialog(false);
  };

  return (
    <>
      <PageHeader title={title} description={description} actions={headerActions} />
      <div className="mt-4">
        {mounted ? (
          <Tabs value={activeTab} className="w-full" onValueChange={handleTabChange}>
            <TabToolbar>
              <TabsList>
                {visibleTabs.map((tab) => (
                  <TabsTrigger key={tab.id} value={tab.id}>
                    {tab.label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </TabToolbar>
            <TabsContent value={activeTab} className="mt-3">
              {children}
            </TabsContent>
          </Tabs>
        ) : (
          <div className="mt-3">{children}</div>
        )}
      </div>

      {guardEnabled && (
        <Dialog open={showGuardDialog} onOpenChange={setShowGuardDialog}>
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <DialogTitle>Unsaved changes</DialogTitle>
              <DialogDescription>
                You have unsaved changes that will be lost if you switch tabs.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="ghost" onClick={handleGuardDiscard}>
                Discard and switch
              </Button>
              <Button onClick={handleGuardStay}>Stay</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}

export function TabbedPage(props: TabbedPageProps) {
  return (
    <DirtyGuardProvider>
      <TabActionsProvider>
        <TabbedPageInner {...props} />
      </TabActionsProvider>
    </DirtyGuardProvider>
  );
}
