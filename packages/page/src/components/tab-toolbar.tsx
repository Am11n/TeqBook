"use client";

import {
  type ReactNode,
  createContext,
  useContext,
  useRef,
  useState,
  useEffect,
  useCallback,
} from "react";

type TabActionsStore = {
  actionsRef: React.MutableRefObject<ReactNode>;
  subscribe: (cb: () => void) => () => void;
  emit: () => void;
};

const TabActionsContext = createContext<TabActionsStore | null>(null);

export function TabActionsProvider({ children }: { children: ReactNode }) {
  const actionsRef = useRef<ReactNode>(null);
  const listenersRef = useRef(new Set<() => void>());

  const subscribe = useCallback((cb: () => void) => {
    listenersRef.current.add(cb);
    return () => {
      listenersRef.current.delete(cb);
    };
  }, []);

  const emit = useCallback(() => {
    listenersRef.current.forEach((cb) => cb());
  }, []);

  const store = useRef<TabActionsStore>({ actionsRef, subscribe, emit }).current;

  return (
    <TabActionsContext.Provider value={store}>
      {children}
    </TabActionsContext.Provider>
  );
}

export function useTabActions(node: ReactNode) {
  const store = useContext(TabActionsContext);

  if (store) {
    store.actionsRef.current = node;
  }

  useEffect(() => {
    if (!store) return;
    store.actionsRef.current = node;
    store.emit();
    return () => {
      store.actionsRef.current = null;
      store.emit();
    };
  });
}

export function TabToolbar({
  children,
  extras,
}: {
  children: ReactNode;
  extras?: ReactNode;
}) {
  const store = useContext(TabActionsContext);
  const [, rerender] = useState(0);

  useEffect(() => {
    if (!store) return;
    return store.subscribe(() => rerender((n) => n + 1));
  }, [store]);

  const actions = store?.actionsRef.current ?? null;

  return (
    <div className="flex items-center justify-between gap-4">
      <div className="flex items-center">{children}</div>
      {extras && (
        <div className="flex flex-1 items-center justify-center">{extras}</div>
      )}
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}
