/**
 * use-table-views Hook
 * Task Group 49: Table System Improvements
 * 
 * Manages saved table views (filters, sort, column visibility) per user per table
 */

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase-client";
import { updateUserPreferences, getUserPreferences } from "@/lib/repositories/profiles";

export type TableView = {
  id: string;
  name: string;
  filters?: Record<string, any>;
  sort?: { column: string; direction: "asc" | "desc" };
  columnVisibility?: Record<string, boolean>;
};

export type UseTableViewsOptions = {
  tableId: string; // Unique identifier for the table (e.g., "bookings", "customers")
  defaultColumnVisibility?: Record<string, boolean>;
};

export function useTableViews({ tableId, defaultColumnVisibility = {} }: UseTableViewsOptions) {
  const [userId, setUserId] = useState<string | null>(null);
  const [views, setViews] = useState<TableView[]>([]);
  const [currentView, setCurrentView] = useState<TableView | null>(null);
  const [columnVisibility, setColumnVisibility] = useState<Record<string, boolean>>(
    defaultColumnVisibility
  );
  const [loading, setLoading] = useState(true);

  // Get current user
  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUserId(user?.id || null);
    };
    getUser();
  }, []);

  // Load views from user preferences
  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    const loadViews = async () => {
      try {
        const { data: profile } = await getUserPreferences(userId);
        const preferences = (profile?.user_preferences as any) || {};
        const tableViews = preferences.tableViews?.[tableId] || [];
        
        setViews(tableViews);
        
        // Load default column visibility if available
        if (preferences.tableViews?.[tableId]?.[0]?.columnVisibility) {
          setColumnVisibility(preferences.tableViews[tableId][0].columnVisibility);
        } else {
          setColumnVisibility(defaultColumnVisibility);
        }
      } catch (error) {
        console.error("Error loading table views:", error);
      } finally {
        setLoading(false);
      }
    };

    loadViews();
  }, [userId, tableId, defaultColumnVisibility]);

  // Save views to user preferences
  const saveViews = useCallback(
    async (newViews: TableView[]) => {
      if (!userId) return;

      try {
        const { data: profile } = await getUserPreferences(userId);
        const preferences = (profile?.user_preferences as any) || {};
        
        const updatedPreferences = {
          ...preferences,
          tableViews: {
            ...preferences.tableViews,
            [tableId]: newViews,
          },
        };

        await updateUserPreferences(userId, updatedPreferences as any);
        setViews(newViews);
      } catch (error) {
        console.error("Error saving table views:", error);
        throw error;
      }
    },
    [userId, tableId]
  );

  // Save current view
  const saveCurrentView = useCallback(
    async (name: string) => {
      const newView: TableView = {
        id: currentView?.id || `view-${Date.now()}`,
        name,
        columnVisibility,
        filters: currentView?.filters,
        sort: currentView?.sort,
      };

      const existingIndex = views.findIndex((v) => v.id === newView.id);
      let newViews: TableView[];

      if (existingIndex >= 0) {
        // Update existing view
        newViews = [...views];
        newViews[existingIndex] = newView;
      } else {
        // Add new view
        newViews = [...views, newView];
      }

      await saveViews(newViews);
      setCurrentView(newView);
    },
    [currentView, columnVisibility, views, saveViews]
  );

  // Load a view
  const loadView = useCallback(
    (viewId: string) => {
      const view = views.find((v) => v.id === viewId);
      if (view) {
        setCurrentView(view);
        if (view.columnVisibility) {
          setColumnVisibility(view.columnVisibility);
        }
      }
    },
    [views]
  );

  // Delete a view
  const deleteView = useCallback(
    async (viewId: string) => {
      const newViews = views.filter((v) => v.id !== viewId);
      await saveViews(newViews);
      
      if (currentView?.id === viewId) {
        setCurrentView(null);
        setColumnVisibility(defaultColumnVisibility);
      }
    },
    [views, currentView, saveViews, defaultColumnVisibility]
  );

  // Update column visibility
  const updateColumnVisibility = useCallback((columnId: string, visible: boolean) => {
    setColumnVisibility((prev) => ({
      ...prev,
      [columnId]: visible,
    }));
  }, []);

  // Toggle column visibility
  const toggleColumnVisibility = useCallback((columnId: string) => {
    setColumnVisibility((prev) => ({
      ...prev,
      [columnId]: !prev[columnId],
    }));
  }, []);

  return {
    views,
    currentView,
    columnVisibility,
    loading,
    saveCurrentView,
    loadView,
    deleteView,
    updateColumnVisibility,
    toggleColumnVisibility,
    setCurrentView,
  };
}
