"use client";

import {
  createContext,
  useContext,
  useRef,
  useCallback,
  type ReactNode,
} from "react";

type DirtyStateMap = Record<string, boolean>;

interface DirtyGuardContextValue {
  registerDirtyState: (tabId: string, isDirty: boolean) => void;
  isAnyDirty: () => boolean;
}

const DirtyGuardContext = createContext<DirtyGuardContextValue>({
  registerDirtyState: () => {},
  isAnyDirty: () => false,
});

export function DirtyGuardProvider({ children }: { children: ReactNode }) {
  const dirtyMapRef = useRef<DirtyStateMap>({});

  const registerDirtyState = useCallback((tabId: string, isDirty: boolean) => {
    dirtyMapRef.current[tabId] = isDirty;
  }, []);

  const isAnyDirty = useCallback(() => {
    return Object.values(dirtyMapRef.current).some(Boolean);
  }, []);

  return (
    <DirtyGuardContext.Provider value={{ registerDirtyState, isAnyDirty }}>
      {children}
    </DirtyGuardContext.Provider>
  );
}

export function useDirtyState(tabId: string, isDirty: boolean) {
  const { registerDirtyState } = useContext(DirtyGuardContext);
  registerDirtyState(tabId, isDirty);
}

export function useDirtyGuard() {
  return useContext(DirtyGuardContext);
}
