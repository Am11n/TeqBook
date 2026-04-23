import { describe, it, expect } from "vitest";
import { renderHook } from "@testing-library/react";
import { useDataTable } from "./use-data-table";
import type { ColumnDef } from "./types";

type Row = { id: string; name: string };

const columns: ColumnDef<Row>[] = [
  {
    id: "name",
    header: "Name",
    getValue: (r) => r.name,
    cell: (r) => r.name,
  },
];

const rows: Row[] = [
  { id: "1", name: "Alpha" },
  { id: "2", name: "Beta" },
  { id: "3", name: "Gamma" },
  { id: "4", name: "Beta duplicate" },
];

describe("useDataTable search + pagination totals", () => {
  it("filters rows client-side and updates total pages when totalCount matches data length", () => {
    const { result, rerender } = renderHook(
      ({ search }: { search: string }) =>
        useDataTable({
          columns,
          data: rows,
          totalCount: rows.length,
          rowKey: (r) => r.id,
          pageSize: 2,
          searchQuery: search,
        }),
      { initialProps: { search: "" } },
    );

    expect(result.current.totalPages).toBe(2);
    expect(result.current.sortedData).toHaveLength(4);

    rerender({ search: "Beta" });
    expect(result.current.sortedData).toHaveLength(2);
    expect(result.current.total).toBe(2);
    expect(result.current.totalPages).toBe(1);
  });

  it("does not apply client text filter when totalCount disagrees with data (server-driven page)", () => {
    const { result } = renderHook(() =>
      useDataTable({
        columns,
        data: rows.slice(0, 2),
        totalCount: 99,
        rowKey: (r) => r.id,
        pageSize: 2,
        searchQuery: "missing",
      }),
    );

    expect(result.current.sortedData).toHaveLength(2);
    expect(result.current.total).toBe(99);
  });
});
