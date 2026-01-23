/**
 * TableWithViews Component
 * Task Group 49: Table System Improvements
 * 
 * Wrapper component that adds:
 * - Column visibility toggle
 * - Saved views functionality
 * - Inline actions menu
 * - Row click to open details drawer
 */

"use client";

import { useState, ReactNode } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { useTableViews, type TableView } from "@/lib/hooks/use-table-views";
import {
  Settings,
  Eye,
  EyeOff,
  MoreVertical,
  Edit,
  Trash2,
  Save,
  X,
} from "lucide-react";

export type ColumnDefinition<T = any> = {
  id: string;
  label: string;
  render: (row: T) => ReactNode;
  defaultVisible?: boolean;
};

export type TableWithViewsProps<T = any> = {
  tableId: string;
  columns: ColumnDefinition<T>[];
  data: T[];
  onRowClick?: (row: T) => void;
  onEdit?: (row: T) => void;
  onDelete?: (row: T) => void;
  onViewDetails?: (row: T) => void;
  onDuplicate?: (row: T) => void;
  renderDetails?: (row: T) => ReactNode;
  actionsLabel?: string;
  emptyMessage?: string;
  // Optional functions to conditionally show actions
  canEdit?: (row: T) => boolean;
  canDelete?: (row: T) => boolean;
  canDuplicate?: (row: T) => boolean;
  // Optional custom labels for actions
  deleteLabel?: string;
  editLabel?: string;
  duplicateLabel?: string;
  viewDetailsLabel?: string;
};

export function TableWithViews<T = any>({
  tableId,
  columns,
  data,
  onRowClick,
  onEdit,
  onDelete,
  onViewDetails,
  onDuplicate,
  renderDetails,
  actionsLabel = "Actions",
  emptyMessage = "No data available",
  canEdit,
  canDelete,
  canDuplicate,
  deleteLabel = "Delete",
  editLabel = "Edit",
  duplicateLabel = "Duplicate",
  viewDetailsLabel = "View Details",
}: TableWithViewsProps<T>) {
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState<T | null>(null);
  const [saveViewDialogOpen, setSaveViewDialogOpen] = useState(false);
  const [viewName, setViewName] = useState("");

  // Default column visibility - all visible by default
  const defaultColumnVisibility = columns.reduce(
    (acc, col) => ({
      ...acc,
      [col.id]: col.defaultVisible !== false,
    }),
    {} as Record<string, boolean>
  );

  const {
    views,
    currentView,
    columnVisibility,
    loading: viewsLoading,
    saveCurrentView,
    loadView,
    deleteView,
    toggleColumnVisibility,
    setCurrentView,
  } = useTableViews({
    tableId,
    defaultColumnVisibility,
  });

  // Filter visible columns
  const visibleColumns = columns.filter(
    (col) => columnVisibility[col.id] !== false
  );

  // Handle row click
  const handleRowClick = (row: T) => {
    if (onRowClick) {
      onRowClick(row);
    } else if (renderDetails) {
      setSelectedRow(row);
      setDetailsOpen(true);
    }
  };

  // Handle save view
  const handleSaveView = async () => {
    if (!viewName.trim()) return;

    const newView: TableView = {
      id: currentView?.id || `view-${Date.now()}`,
      name: viewName.trim(),
      columnVisibility,
    };

    await saveCurrentView(viewName.trim());
    setSaveViewDialogOpen(false);
    setViewName("");
  };

  // Handle load view
  const handleLoadView = (viewId: string) => {
    loadView(viewId);
  };

  // Handle delete view
  const handleDeleteView = async (viewId: string) => {
    if (confirm("Are you sure you want to delete this view?")) {
      await deleteView(viewId);
    }
  };

  // Get actions available for a row
  const getRowActions = (row: T) => {
    const actions = [];
    if (onViewDetails || renderDetails) {
      actions.push({
        label: viewDetailsLabel,
        icon: Eye,
        onClick: () => {
          if (onViewDetails) {
            onViewDetails(row);
          } else if (renderDetails) {
            setSelectedRow(row);
            setDetailsOpen(true);
          }
        },
      });
    }
    if (onEdit && (canEdit === undefined || canEdit(row))) {
      actions.push({
        label: editLabel,
        icon: Edit,
        onClick: () => onEdit(row),
      });
    }
    if (onDuplicate && (canDuplicate === undefined || canDuplicate(row))) {
      actions.push({
        label: duplicateLabel,
        icon: Save,
        onClick: () => onDuplicate(row),
      });
    }
    if (onDelete && (canDelete === undefined || canDelete(row))) {
      actions.push({
        label: deleteLabel,
        icon: Trash2,
        onClick: () => onDelete(row),
        variant: "destructive" as const,
      });
    }
    return actions;
  };

  if (viewsLoading) {
    return <div className="p-4 text-sm text-muted-foreground">Loading...</div>;
  }

  return (
    <div className="space-y-4">
      {/* Toolbar with view controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {/* Column visibility toggle */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Eye className="h-4 w-4 mr-2" />
                Columns
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-48">
              <DropdownMenuLabel>Toggle Columns</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {columns.map((col) => (
                <DropdownMenuCheckboxItem
                  key={col.id}
                  checked={columnVisibility[col.id] !== false}
                  onCheckedChange={() => toggleColumnVisibility(col.id)}
                >
                  {col.label}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Saved views */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                Views {currentView && `(${currentView.name})`}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56">
              <DropdownMenuLabel>Saved Views</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {views.length === 0 ? (
                <DropdownMenuItem disabled>No saved views</DropdownMenuItem>
              ) : (
                views.map((view) => (
                  <DropdownMenuItem
                    key={view.id}
                    onClick={() => handleLoadView(view.id)}
                    className="flex items-center justify-between"
                  >
                    <span>{view.name}</span>
                    {currentView?.id === view.id && (
                      <span className="text-xs text-muted-foreground">Active</span>
                    )}
                  </DropdownMenuItem>
                ))
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setSaveViewDialogOpen(true)}>
                <Save className="h-4 w-4 mr-2" />
                Save Current View
              </DropdownMenuItem>
              {currentView && (
                <DropdownMenuItem
                  onClick={() => handleDeleteView(currentView.id)}
                  variant="destructive"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Current View
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {visibleColumns.map((col) => (
                <TableHead key={col.id}>{col.label}</TableHead>
              ))}
              {(onEdit || onDelete || onViewDetails || renderDetails) && (
                <TableHead className="w-[100px] text-right">{actionsLabel}</TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={visibleColumns.length + (onEdit || onDelete || onViewDetails || renderDetails ? 1 : 0)}
                  className="text-center text-muted-foreground py-8"
                >
                  {emptyMessage}
                </TableCell>
              </TableRow>
            ) : (
              data.map((row, index) => {
                const actions = getRowActions(row);
                return (
                  <TableRow
                    key={index}
                    className={onRowClick || renderDetails ? "cursor-pointer" : ""}
                    onClick={() => handleRowClick(row)}
                  >
                    {visibleColumns.map((col) => (
                      <TableCell key={col.id}>{col.render(row)}</TableCell>
                    ))}
                    {actions.length > 0 && (
                      <TableCell
                        className="text-right"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {actions.map((action, actionIndex) => (
                              <DropdownMenuItem
                                key={actionIndex}
                                onClick={action.onClick}
                                variant={action.variant}
                              >
                                <action.icon className="h-4 w-4 mr-2" />
                                {action.label}
                              </DropdownMenuItem>
                            ))}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    )}
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Save View Dialog */}
      <Dialog open={saveViewDialogOpen} onOpenChange={setSaveViewDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save View</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Input
              placeholder="View name"
              value={viewName}
              onChange={(e) => setViewName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleSaveView();
                }
              }}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSaveViewDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveView} disabled={!viewName.trim()}>
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Details Drawer/Dialog */}
      {renderDetails && selectedRow && (
        <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Details</DialogTitle>
            </DialogHeader>
            <div className="py-4">{renderDetails(selectedRow)}</div>
            <DialogFooter>
              {onEdit && (canEdit === undefined || (selectedRow && canEdit(selectedRow))) && (
                <Button
                  variant="outline"
                  onClick={() => {
                    setDetailsOpen(false);
                    if (selectedRow) onEdit(selectedRow);
                  }}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              )}
              {onDelete && (canDelete === undefined || (selectedRow && canDelete(selectedRow))) && (
                <Button
                  variant="destructive"
                  onClick={() => {
                    setDetailsOpen(false);
                    if (selectedRow) onDelete(selectedRow);
                  }}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  {deleteLabel}
                </Button>
              )}
              <Button variant="outline" onClick={() => setDetailsOpen(false)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
