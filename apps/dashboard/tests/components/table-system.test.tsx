/**
 * Table System Tests
 * Task Group 49: Table System Improvements
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { TableWithViews, type ColumnDefinition } from "@/components/tables/TableWithViews";
import { useTableViews } from "@/lib/hooks/use-table-views";

// Mock dependencies
vi.mock("@/lib/hooks/use-table-views", () => ({
  useTableViews: vi.fn(),
}));

vi.mock("@/lib/supabase-client", () => ({
  supabase: {
    auth: {
      getUser: vi.fn(() => Promise.resolve({ data: { user: { id: "user-123" } }, error: null })),
    },
  },
}));

vi.mock("@/lib/repositories/profiles", () => ({
  getUserPreferences: vi.fn(() =>
    Promise.resolve({
      data: {
        user_preferences: {
          tableViews: {
            test: [],
          },
        },
      },
      error: null,
    })
  ),
  updateUserPreferences: vi.fn(() => Promise.resolve({ error: null })),
}));

describe("TableWithViews", () => {
  const mockColumns: ColumnDefinition[] = [
    {
      id: "name",
      label: "Name",
      render: (row: any) => <div>{row.name}</div>,
    },
    {
      id: "email",
      label: "Email",
      render: (row: any) => <div>{row.email}</div>,
    },
  ];

  const mockData = [
    { id: "1", name: "John Doe", email: "john@example.com" },
    { id: "2", name: "Jane Smith", email: "jane@example.com" },
  ];

  const defaultMockReturn = {
    views: [],
    currentView: null,
    columnVisibility: { name: true, email: true },
    loading: false,
    saveCurrentView: vi.fn(),
    loadView: vi.fn(),
    deleteView: vi.fn(),
    updateColumnVisibility: vi.fn(),
    toggleColumnVisibility: vi.fn(),
    setCurrentView: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (useTableViews as any).mockReturnValue(defaultMockReturn);
  });

  describe("Rendering", () => {
    it("should render table with data", () => {
      render(
        <TableWithViews
          tableId="test"
          columns={mockColumns}
          data={mockData}
          emptyMessage="No data"
        />
      );

      expect(screen.getByText("John Doe")).toBeInTheDocument();
      expect(screen.getByText("Jane Smith")).toBeInTheDocument();
    });

    it("should render empty message when no data", () => {
      render(
        <TableWithViews
          tableId="test"
          columns={mockColumns}
          data={[]}
          emptyMessage="No data available"
        />
      );

      expect(screen.getByText("No data available")).toBeInTheDocument();
    });

    it("should render column headers", () => {
      render(
        <TableWithViews
          tableId="test"
          columns={mockColumns}
          data={mockData}
          emptyMessage="No data"
        />
      );

      expect(screen.getByText("Name")).toBeInTheDocument();
      expect(screen.getByText("Email")).toBeInTheDocument();
    });
  });

  describe("Column Visibility", () => {
    it("should show column visibility toggle button", () => {
      render(
        <TableWithViews
          tableId="test"
          columns={mockColumns}
          data={mockData}
          emptyMessage="No data"
        />
      );

      expect(screen.getByText("Columns")).toBeInTheDocument();
    });

    it("should toggle column visibility", async () => {
      const toggleColumnVisibility = vi.fn();
      (useTableViews as any).mockReturnValue({
        ...defaultMockReturn,
        toggleColumnVisibility,
      });

      render(
        <TableWithViews
          tableId="test"
          columns={mockColumns}
          data={mockData}
          emptyMessage="No data"
        />
      );

      const columnsButton = screen.getByText("Columns");
      fireEvent.click(columnsButton);

      await waitFor(() => {
        expect(screen.getByText((_, el) => el?.textContent?.includes("Toggle Columns") ?? false)).toBeInTheDocument();
      });

      const nameCheckbox = screen.getByText("Name");
      fireEvent.click(nameCheckbox);

      await waitFor(() => {
        expect(toggleColumnVisibility).toHaveBeenCalledWith("name");
      });
    });
  });

  describe("Saved Views", () => {
    it("should show saved views button", () => {
      render(
        <TableWithViews
          tableId="test"
          columns={mockColumns}
          data={mockData}
          emptyMessage="No data"
        />
      );

      expect(screen.getByText(/Views/)).toBeInTheDocument();
    });

    it("should show current view name when active", () => {
      (useTableViews as any).mockReturnValue({
        ...defaultMockReturn,
        currentView: { id: "view-1", name: "My View", columnVisibility: {} },
      });

      render(
        <TableWithViews
          tableId="test"
          columns={mockColumns}
          data={mockData}
          emptyMessage="No data"
        />
      );

      expect(screen.getByText(/My View/)).toBeInTheDocument();
    });

    it("should open save view dialog", async () => {
      render(
        <TableWithViews
          tableId="test"
          columns={mockColumns}
          data={mockData}
          emptyMessage="No data"
        />
      );

      const viewsButton = screen.getByText(/Views/);
      fireEvent.click(viewsButton);

      await waitFor(() => {
        expect(screen.getByText((_, el) => el?.textContent?.includes("Save Current View") ?? false)).toBeInTheDocument();
      });

      const saveButton = screen.getByText((_, el) => el?.textContent?.includes("Save Current View") ?? false);
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(screen.getByText("Save View")).toBeInTheDocument();
      });
    });
  });

  describe("Row Actions", () => {
    it("should show actions menu when actions are provided", async () => {
      const onDelete = vi.fn();
      render(
        <TableWithViews
          tableId="test"
          columns={mockColumns}
          data={mockData}
          onDelete={onDelete}
          emptyMessage="No data"
        />
      );

      const actionButtons = screen.getAllByRole("button");
      const moreButton = actionButtons.find((btn) => btn.querySelector("svg"));
      expect(moreButton).toBeDefined();
      fireEvent.click(moreButton!);

      await waitFor(() => {
        expect(screen.getByText((_, el) => el?.textContent?.includes("Delete") ?? false)).toBeInTheDocument();
      });
    });

    it("should call onDelete when delete action is clicked", async () => {
      const onDelete = vi.fn();
      render(
        <TableWithViews
          tableId="test"
          columns={mockColumns}
          data={mockData}
          onDelete={onDelete}
          emptyMessage="No data"
        />
      );

      const actionButtons = screen.getAllByRole("button");
      const moreButton = actionButtons.find((btn) => btn.querySelector("svg"));
      expect(moreButton).toBeDefined();
      fireEvent.click(moreButton!);

      const deleteButton = await screen.findByText((_, el) => el?.textContent?.includes("Delete") ?? false);
      fireEvent.click(deleteButton);

      expect(onDelete).toHaveBeenCalledWith(mockData[0]);
    });
  });

  describe("Row Click", () => {
    it("should open details drawer when row is clicked and renderDetails is provided", async () => {
      const renderDetails = vi.fn((row) => <div>Details for {row.name}</div>);
      render(
        <TableWithViews
          tableId="test"
          columns={mockColumns}
          data={mockData}
          renderDetails={renderDetails}
          emptyMessage="No data"
        />
      );

      const firstRow = screen.getByText("John Doe").closest("tr");
      if (firstRow) {
        fireEvent.click(firstRow);

        await waitFor(() => {
          expect(screen.getByText("Details")).toBeInTheDocument();
          expect(screen.getByText("Details for John Doe")).toBeInTheDocument();
        });
      }
    });

    it("should call onRowClick when provided", () => {
      const onRowClick = vi.fn();
      render(
        <TableWithViews
          tableId="test"
          columns={mockColumns}
          data={mockData}
          onRowClick={onRowClick}
          emptyMessage="No data"
        />
      );

      const firstRow = screen.getByText("John Doe").closest("tr");
      if (firstRow) {
        fireEvent.click(firstRow);
        expect(onRowClick).toHaveBeenCalledWith(mockData[0]);
      }
    });
  });

  describe("Loading State", () => {
    it("should show loading message when views are loading", () => {
      (useTableViews as any).mockReturnValue({
        ...defaultMockReturn,
        loading: true,
      });

      render(
        <TableWithViews
          tableId="test"
          columns={mockColumns}
          data={mockData}
          emptyMessage="No data"
        />
      );

      expect(screen.getByText("Loading...")).toBeInTheDocument();
    });
  });
});
