import { useState, useCallback } from "react";

export type DialogMode = "view" | "edit";

export interface EntityDialogState<T extends { id: string }> {
  /** ID of the currently selected entity (null = dialog closed) */
  selectedId: string | null;
  /** Current dialog mode */
  mode: DialogMode;
  /** Whether the dialog is open */
  open: boolean;
  /** Called when a row is clicked in a table */
  onRowClick: (row: T) => void;
  /** Open dialog for a specific entity in view mode */
  openView: (id: string) => void;
  /** Open dialog for a specific entity in edit mode */
  openEdit: (id: string) => void;
  /** Close the dialog and reset state */
  close: () => void;
  /** Switch to edit mode */
  switchToEdit: () => void;
  /** Switch to view mode */
  switchToView: () => void;
}

/**
 * Shared hook for managing entity detail dialog state.
 *
 * Standardizes the Page -> Table -> Dialog wiring:
 * - Table calls `onRowClick(row)` to open detail dialog
 * - Dialog receives `selectedId` and fetches fresh data
 * - Dialog toggles between view/edit mode internally
 */
export function useEntityDialogState<
  T extends { id: string },
>(): EntityDialogState<T> {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [mode, setMode] = useState<DialogMode>("view");

  const open = selectedId !== null;

  const onRowClick = useCallback((row: T) => {
    setSelectedId(row.id);
    setMode("view");
  }, []);

  const openView = useCallback((id: string) => {
    setSelectedId(id);
    setMode("view");
  }, []);

  const openEdit = useCallback((id: string) => {
    setSelectedId(id);
    setMode("edit");
  }, []);

  const close = useCallback(() => {
    setSelectedId(null);
    setMode("view");
  }, []);

  const switchToEdit = useCallback(() => {
    setMode("edit");
  }, []);

  const switchToView = useCallback(() => {
    setMode("view");
  }, []);

  return {
    selectedId,
    mode,
    open,
    onRowClick,
    openView,
    openEdit,
    close,
    switchToEdit,
    switchToView,
  };
}
