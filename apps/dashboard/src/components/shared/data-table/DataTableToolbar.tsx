import type { ReactNode, Dispatch, SetStateAction } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Search, Columns3, Bookmark, X } from "lucide-react";
import type { SavedView, BulkAction } from "./types";

type ToolbarColumn = { id: string; header: string; hideable?: boolean };

interface DataTableToolbarProps {
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  searchPlaceholder?: string;
  headerContent?: ReactNode;
  toolbarEndContent?: ReactNode;
  columns: ToolbarColumn[];
  columnVisibility: Record<string, boolean>;
  setColumnVisibility: Dispatch<SetStateAction<Record<string, boolean>>>;
  storageKey?: string;
  savedViews: SavedView[];
  newViewName: string;
  setNewViewName: Dispatch<SetStateAction<string>>;
  onSaveView: () => void;
  onApplyView: (view: SavedView) => void;
  onDeleteView: (viewId: string) => void;
  bulkSelectable?: boolean;
  selectedKeys: Set<string>;
  setSelectedKeys: Dispatch<SetStateAction<Set<string>>>;
  bulkActions?: BulkAction[];
  onBulkSelectionChange?: (keys: string[]) => void;
}

export function DataTableToolbar({
  searchQuery,
  onSearchChange,
  searchPlaceholder = "Search...",
  headerContent,
  toolbarEndContent,
  columns,
  columnVisibility,
  setColumnVisibility,
  storageKey,
  savedViews,
  newViewName,
  setNewViewName,
  onSaveView,
  onApplyView,
  onDeleteView,
  bulkSelectable,
  selectedKeys,
  setSelectedKeys,
  bulkActions,
  onBulkSelectionChange,
}: DataTableToolbarProps) {
  return (
    <>
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          {onSearchChange ? (
            <div className="relative w-full max-w-xs">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder={searchPlaceholder}
                className="pl-8 h-9"
              />
            </div>
          ) : (
            headerContent
          )}

          <div className="flex items-center gap-1.5 ml-auto shrink-0">
            {toolbarEndContent}

            {storageKey && (
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="icon" className="h-9 w-9">
                  <Bookmark className="h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent align="end" className="w-64 p-3">
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Saved Views
                  </p>
                  {savedViews.length === 0 && (
                    <p className="text-xs text-muted-foreground">No saved views yet</p>
                  )}
                  {savedViews.map((view) => (
                    <div
                      key={view.id}
                      className="flex items-center justify-between gap-2 -mx-2 px-2 py-1.5 rounded-md hover:bg-accent transition-colors cursor-pointer"
                      onClick={() => onApplyView(view)}
                    >
                      <span className="text-sm truncate text-left">{view.name}</span>
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); onDeleteView(view.id); }}
                        className="text-muted-foreground hover:text-destructive shrink-0"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                  <div className="border-t pt-2 mt-2">
                    <div className="flex gap-1.5">
                      <Input
                        value={newViewName}
                        onChange={(e) => setNewViewName(e.target.value)}
                        placeholder="View name..."
                        className="h-7 text-xs"
                        onKeyDown={(e) => { if (e.key === "Enter") onSaveView(); }}
                      />
                      <Button
                        type="button" size="sm" variant="outline"
                        className="h-7 text-xs px-2"
                        onClick={onSaveView}
                        disabled={!newViewName.trim()}
                      >
                        Save
                      </Button>
                    </div>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          )}

          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="icon" className="h-9 w-9">
                <Columns3 className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-48 p-3">
              <div className="space-y-2">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Toggle Columns
                </p>
                {columns
                  .filter((col) => col.hideable !== false)
                  .map((col) => (
                    <label key={col.id} className="flex items-center gap-2 text-sm cursor-pointer">
                      <Checkbox
                        checked={columnVisibility[col.id] !== false}
                        onCheckedChange={(checked) => {
                          setColumnVisibility((prev) => ({ ...prev, [col.id]: !!checked }));
                        }}
                      />
                      {col.header}
                    </label>
                  ))}
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>

        {onSearchChange && headerContent && (
          <div className="flex flex-wrap items-center gap-2">
            {headerContent}
          </div>
        )}
      </div>

      {bulkSelectable && selectedKeys.size > 0 && bulkActions && (
        <div className="flex items-center gap-2 rounded-lg border bg-muted/50 px-3 py-2">
          <span className="text-sm font-medium">{selectedKeys.size} selected</span>
          <div className="flex items-center gap-1.5 ml-2">
            {bulkActions.map((action, i) => {
              const ActionIcon = action.icon;
              return (
                <Button
                  key={i}
                  variant={action.variant ?? "outline"}
                  size="sm"
                  className="h-7 text-xs gap-1"
                  onClick={() => action.onClick([...selectedKeys])}
                >
                  {ActionIcon && <ActionIcon className="h-3 w-3" />}
                  {action.label}
                </Button>
              );
            })}
          </div>
          <Button
            variant="ghost" size="sm" className="h-7 text-xs ml-auto"
            onClick={() => { setSelectedKeys(new Set()); onBulkSelectionChange?.([]); }}
          >
            Clear
          </Button>
        </div>
      )}
    </>
  );
}
