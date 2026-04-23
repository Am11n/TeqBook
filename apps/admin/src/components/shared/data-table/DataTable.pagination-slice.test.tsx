import { describe, it, expect, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { DataTable } from "./DataTable";
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

const data: Row[] = [
  { id: "1", name: "Row One" },
  { id: "2", name: "Row Two" },
  { id: "3", name: "Row Three" },
  { id: "4", name: "Row Four" },
];

describe("DataTable page slicing", () => {
  it("renders only pageSize rows for the current page", () => {
    const onPageChange = vi.fn();

    render(
      <DataTable
        columns={columns}
        data={data}
        totalCount={data.length}
        rowKey={(r) => r.id}
        page={1}
        pageSize={2}
        onPageChange={onPageChange}
        searchQuery=""
      />,
    );

    const bodyRows = screen.getAllByRole("row").filter((r) => r.querySelector("td"));
    expect(bodyRows).toHaveLength(2);
    expect(within(bodyRows[0]!).getByText("Row Three")).toBeInTheDocument();
    expect(within(bodyRows[1]!).getByText("Row Four")).toBeInTheDocument();
  });
});
