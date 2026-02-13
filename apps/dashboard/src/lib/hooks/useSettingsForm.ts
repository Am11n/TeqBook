"use client";

import { useState, useCallback, useMemo, useRef, useEffect } from "react";

// =====================================================
// useSettingsForm<T> -- standardized form-state for settings tabs
// =====================================================

export interface UseSettingsFormOptions<T extends Record<string, unknown>> {
  /** Initial/server values (snapshot). Updated after successful save. */
  initialValues: T;
  /** Async save callback. Throw or return string to signal error. */
  onSave: (values: T) => Promise<void>;
  /** Optional sync validation. Return map of fieldKey -> error message. */
  validate?: (values: T) => Record<string, string>;
}

export interface UseSettingsFormReturn<T extends Record<string, unknown>> {
  values: T;
  setValue: <K extends keyof T>(key: K, value: T[K]) => void;
  setValues: (partial: Partial<T>) => void;
  isDirty: boolean;
  isValid: boolean;
  errors: Record<string, string>;
  save: () => Promise<void>;
  discard: () => void;
  saving: boolean;
  lastSavedAt: Date | null;
  saveError: string | null;
  retrySave: () => Promise<void>;
}

export function useSettingsForm<T extends Record<string, unknown>>({
  initialValues,
  onSave,
  validate,
}: UseSettingsFormOptions<T>): UseSettingsFormReturn<T> {
  const [values, setValuesState] = useState<T>(initialValues);
  const [serverState, setServerState] = useState<T>(initialValues);
  const [saving, setSaving] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const onSaveRef = useRef(onSave);
  onSaveRef.current = onSave;

  // Sync when initialValues change (e.g. after parent refetch)
  useEffect(() => {
    setValuesState(initialValues);
    setServerState(initialValues);
  }, [initialValues]);

  const setValue = useCallback(<K extends keyof T>(key: K, value: T[K]) => {
    setValuesState((prev) => ({ ...prev, [key]: value }));
  }, []);

  const setValues = useCallback((partial: Partial<T>) => {
    setValuesState((prev) => ({ ...prev, ...partial }));
  }, []);

  const isDirty = useMemo(
    () => JSON.stringify(values) !== JSON.stringify(serverState),
    [values, serverState],
  );

  const errors = useMemo(
    () => (validate ? validate(values) : {}),
    [validate, values],
  );

  const isValid = useMemo(
    () => Object.keys(errors).length === 0,
    [errors],
  );

  const discard = useCallback(() => {
    setValuesState(serverState);
    setSaveError(null);
  }, [serverState]);

  const executeSave = useCallback(async () => {
    if (saving) return;
    setSaving(true);
    setSaveError(null);
    try {
      await onSaveRef.current(values);
      setServerState(values);
      setLastSavedAt(new Date());
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : typeof err === "string" ? err : "Failed to save";
      setSaveError(msg);
    } finally {
      setSaving(false);
    }
  }, [saving, values]);

  return {
    values,
    setValue,
    setValues,
    isDirty,
    isValid,
    errors,
    save: executeSave,
    discard,
    saving,
    lastSavedAt,
    saveError,
    retrySave: executeSave,
  };
}
